'use strict';

require('dotenv').config({
  silent: Boolean(process.env.TRAVIS),
});

const path = require('path');

const Bluebird = require('bluebird');
const csurf = require('csurf');
const express = require('express');
const expressHandlebars = require('express-handlebars');
const HttpStatus = require('http-status-codes');
const bcrypt = Bluebird.promisifyAll(require('bcrypt'));
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressJWT = require('express-jwt');
const guard = require('express-jwt-permissions')();
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const multer = require('multer');
const sqlite3 = require('sqlite3');
const _ = require('lodash');

const rtorrent = require('./rtorrent');
const downloads = require('./models/downloads');
const users = require('./models/users');
const trackers = require('./models/trackers');

const db = new sqlite3.cached.Database('./db/nilla.db');

const {
  JWT_SECRET,
  RTORRENT_DOWNLOADS_DIRECTORY,
  SERVE_ASSETS,
  SERVE_DOWNLOADS,
  USE_SSL,
} = process.env;

const PASSWORD_SALT_ROUNDS = 10;

Bluebird.config({
  cancellation: true,
});

function refererUrl(referer) {
  if (referer === '/' || referer === '') {
    return '/login';
  }

  return `/login?ref=${referer}`;
}

function JWTErrorHandler(err, req, res, _next) {
  if (err.name === 'UnauthorizedError') {
    res.redirect(refererUrl(req.originalUrl));
  }
}

function CSRFValidationError(err, req, res, next) {
  console.log('csrfvalidationError');

  if (err.code !== 'EBADCSRFTOKEN') {
    next(err);

    return;
  }

  console.log('CSRF token tampered');

  res.format({
    html: () => {
      const { _ref } = req.body;

      res.redirect(refererUrl(_ref));
    },
    json: () => {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'invalid CSRF token',
      });
    },
  });
}

function setCSRFTokenCookie(req, res, next) {
  res.cookie('csrf-token', req.csrfToken(), {
    httpOnly: false,
    secure: Boolean(USE_SSL),
    expires: 0,
  });

  next();
}

function getJWTFromHeaderOrCookie(req) {
  if (req.headers.authorization) {
    const [scheme, token] = req.headers.authorization.split(' ');

    if (scheme === 'Bearer') {
      return token;
    }
  } else if (req.cookies.token) {
    return req.cookies.token;
  }

  return null;
}

function createJWT(user) {
  return jwt.sign({
    id: user.id,
    username: user.username,
    permissions: user.permissions.split(','),
  }, JWT_SECRET, {
    expiresIn: '14 days',
  });
}

function rejectPlainTextRequest(req, res, next) {
  const contentType = req.headers['Content-Type'];

  if (contentType === 'text/plain') {
    res.sendStatus(HttpStatus.BAD_REQUEST);

    return;
  }

  next();
}

const csrfProtection = csurf({ cookie: true });

const CSRF = [csrfProtection, CSRFValidationError];

const authenticateJWT = expressJWT({
  secret: JWT_SECRET,
  getToken: getJWTFromHeaderOrCookie,
});

const JWT = [authenticateJWT, JWTErrorHandler];

const TEN_MEGABYTES = 10000000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: TEN_MEGABYTES,
  },
});

function authenticate(username, password) {
  return users.getUserByUsername(db, username)
    .then(user => {
      if (!user) {
        throw new Error('User not found.');
      }

      return bcrypt.compareAsync(password, user.password)
        .then(authenticated => {
          if (!authenticated) {
            throw new Error('Incorrect credentials.');
          }

          return user;
        });
    });
}

function attachAuthentication(app, options) {
  app.get('/login', CSRF, setCSRFTokenCookie, (req, res) => {
    res.render('login', {
      csrfToken: req.csrfToken(),
      ref: req.query.ref || '',
    });
  });

  app.delete('/session', JWT, (req, res) => {
    res.clearCookie('_csrf');
    res.clearCookie('csrf-token');
    res.clearCookie('token');
    res.sendStatus(HttpStatus.OK);
  });

  app.post('/session', CSRF, (req, res) => {
    const { username, password, _ref = '' } = req.body;

    if (!username || !password) {
      res.redirect(refererUrl(_ref));

      return;
    }

    options.authenticator(username, password)
      .then(user => {
        const token = createJWT(user);
        const expiration = moment().utc().add(1, 'month').toDate();

        // Save the JWT as a cookie as well. It's only ever used to authenticate file
        // downloads since it's much more convenient that way.
        res.cookie('token', token, {
          httpOnly: true,
          secure: Boolean(USE_SSL),
          expires: expiration,
        });

        res.redirect(_ref || '/');
      })
      .catch(() => res.redirect(refererUrl(_ref)));
  });

  app.get('/invitations/:token', CSRF, (req, res) => {
    res.render('register', {
      csrfToken: req.csrfToken(),
      invitationToken: req.params.token,
    });
  });

  app.get('/users/:id/reset/:token', CSRF, (req, res) => {
    const { id, token } = req.params;

    users.getUserById(db, req.params.id)
      .then(row => {
        if (token !== row.refresh_token) {
          res.sendStatus(HttpStatus.NOT_FOUND);

          return;
        }

        const { username } = row;

        res.render('reset', {
          csrfToken: req.csrfToken(),
          username,
          id,
          token,
        });
      })
      .catch(() => res.sendStatus(HttpStatus.NOT_FOUND));
  });

  app.post('/users/:id/reset/:token', CSRF, (req, res) => {
    const { id, token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      res.redirect(req.originalUrl);
    }

    const p = users.getUserToken(db, id)
      .then(row => {
        if (token !== row.refresh_token) {
          res.sendStatus(HttpStatus.NOT_FOUND);
          p.cancel();

          return;
        }

        return bcrypt.hashAsync(newPassword, PASSWORD_SALT_ROUNDS);
      })
      .then(passwordHash => users.setUserPassword(db, id, passwordHash))
      .then(() => res.redirect('/login'))
      .catch(() => res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR));
  });

  app.post('/users', CSRF, (req, res) => {
    const { _invitationToken, username, password, email } = req.body;

    const permissions = ['member'].join(',');

    const p = users.getInvitationByToken(db, _invitationToken)
      .catch(() => {
        res.sendStatus(HttpStatus.UNAUTHORIZED);
        p.cancel();
      })
      .then(() => bcrypt.hashAsync(password, PASSWORD_SALT_ROUNDS))
      .then(passwordHash => {
        return users.insertUser(db, {
          username,
          password: passwordHash,
          email,
          invitationToken: _invitationToken,
          permissions,
        });
      })
      .then(({ lastID }) => {
        return users.deleteInvitationByToken(db, _invitationToken).then(() => lastID);
      })
      .then(userId => {
        // TODO
        // DRY things up. this is repeated in POST /session
        const token = createJWT({
          id: userId,
          username,
          permissions,
        });

        const expiration = moment().utc().add(1, 'month').toDate();

        res.cookie('token', token, {
          httpOnly: true,
          secure: Boolean(USE_SSL),
          expires: expiration,
        });

        res.redirect('/');
      })
      .catch(() => res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR));
  });

  // TODO
  // move out of here?
  app.get(/^\/file\/(.+)/, JWT, (req, res) => {
    const filePath = req.params[0];
    const name = path.basename(filePath);

    if (SERVE_DOWNLOADS) {
      const downloadPath = path.join(RTORRENT_DOWNLOADS_DIRECTORY, filePath);

      res.download(downloadPath, name);

      return;
    }

    const sendFilePath = path.join('sendfile', filePath);

    res.attachment(name);
    res.header('X-Accel-Redirect', sendFilePath);
    res.end();
  });
}

function attachAPI(app) {
  const api = express.Router();

  api.use(rejectPlainTextRequest);

  api.post('/downloads', JWT, guard.check('member'), upload.single('torrent'), CSRF, (req, res) => {
    let torrent, start;

    if (req.is('multipart/form-data')) {
      torrent = req.file.buffer;
      start = req.body.start === 'true';
    } else if (req.is('json')) {
      torrent = req.body.uri;
      start = req.body.start;
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        error: 'An unknown error occurred',
      });

      return;
    }

    const commands = [downloads.onLoadSetUploader(req.user.id)];

    rtorrent.load(torrent, {
      start,
      commands,
    }).then(infoHash => {
      res.send({ success: true, infoHash });
    }).catch(error => {
      console.log(error);

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
        error: 'An unknown error occurred',
      });
    });
  });

  api.get('/users/current', JWT, (req, res) => {
    const { id, username, permissions } = req.user;

    res.json({ id, username, permissions });
  });

  const splitPermissions = row => {
    row.permissions = row.permissions.split(',');

    return row;
  };

  // TODO
  // authorization: only allow for admins
  api.get('/users', JWT, (req, res) => {
    users.getUsers(db)
      .then(users => {
        const filteredUsers = users.map(splitPermissions);

        res.status(HttpStatus.OK).json(filteredUsers);
      })
      .catch(() => res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR));
  });

  api.put('/users/:id', JWT, guard.check('admin'), (req, res) => {
    const user = req.body;

    user.permissions = user.permissions.join(',');

    users.putUser(db, req.params.id, user)
      .then(() => users.getUsers(db))
      .then(users => {
        const filteredUsers = users.map(splitPermissions);

        res.json(filteredUsers);
      })
      .catch(() => res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR));
  });

  api.get('/users/:id', JWT, (req, res) => {
    users.getUserById(db, req.params.id)
      .then(row => {
        const filteredObject = _(row).pick('id', 'username');

        res.status(HttpStatus.OK).json(filteredObject);
      });
  });

  api.delete('/users/:id', JWT, (req, res) => {
    users.deleteUserById(db, req.params.id)
      .then(() => res.sendStatus(HttpStatus.OK))
      .catch(() => res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR));
  });

  api.get('/trackers', JWT, (req, res) => {
    trackers.getTrackers(db)
      .then(trackers => res.json(trackers))
      .catch(() => res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR));
  });

  api.post('/trackers', JWT, (req, res) => {
    const tracker = req.body;

    trackers.insertTracker(db, tracker)
      .then(() => trackers.getTrackers(db))
      .then(trackers => res.json(trackers))
      .catch(() => res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR));
  });

  api.put('/trackers/:id', JWT, (req, res) => {
    const tracker = req.body;

    trackers.putTracker(db, req.params.id, tracker)
      .then(() => trackers.getTrackers(db))
      .then(trackers => res.json(trackers))
      .catch(() => res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR));
  });

  api.delete('/trackers/:id', JWT, (req, res) => {
    trackers.deleteTrackerById(db, req.params.id)
      .then(() => trackers.getTrackers(db))
      .then(trackers => res.json(trackers))
      .catch(() => res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR));
  });

  api.get('/invitations', JWT, (req, res) => {
    users.getInvitations(db)
      .then(invitations => res.json(invitations));
  });

  api.post('/invitations', JWT, (req, res) => {
    users.createInvitation(db)
      .then(() => users.getInvitations(db))
      .then(invitations => res.json(invitations))
      .catch(() => res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR));
  });

  api.delete('/invitations/:token', JWT, (req, res) => {
    users.deleteInvitationByToken(db, req.params.token)
      .then(() => users.getInvitations(db))
      .then(invitations => res.json(invitations))
      .catch(() => res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR));
  });

  api.get('/downloads', JWT, (req, res) => {
    downloads.getDownloads()
      .then(downloads => res.json(downloads));
  });

  api.get('/downloads/:infoHash', JWT, (req, res) => {
    downloads.getCompleteDownload(req.params.infoHash)
      .then(downloads => res.json(downloads))
      .catch(_error => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'no such torrent',
      }));
  });

  api.patch('/downloads/:infoHash', JWT, (req, res) => {
    const { infoHash } = req.params;

    switch (req.body.action) {
      case 'start': {
        rtorrent.torrent(infoHash, 'start')
          .then(() => res.json({ success: true }));
        break;
      }
      case 'stop': {
        rtorrent.torrent(infoHash, 'stop')
          .then(() => res.json({ success: true }));
        break;
      }
      case 'acquireLock': {
        downloads.addLock(infoHash, req.user.id)
          .then(() => res.json({ success: true }))
          .catch(error => console.log(error));

        break;
      }
      case 'releaseLock': {
        downloads.removeLock(infoHash, req.user.id)
          .then(() => res.json({ success: true }))
          .catch(error => console.log(error));

        break;
      }
      case 'setFilePriorities': {
        const priorities = req.body.params;

        downloads.setFilePriorities(infoHash, priorities)
          .then(() => res.json({ success: true }));

        break;
      }
    }
  });

  // TODO
  // validation
  api.delete('/downloads/:infoHash', JWT, (req, res) => {
    rtorrent.torrent(req.params.infoHash, 'erase')
      .then(() => res.json({ success: true }))
      .catch(_error => res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'no such torrent',
      }));
  });

  app.use('/api', api);
}

const VIEWS_PATH = path.join(__dirname, 'views');

const handlebars = expressHandlebars.create({
  defaultLayout: 'main',
  layoutsDir: path.join(VIEWS_PATH, 'layouts'),
});

function configureHandlebars(app) {
  app.set('views', VIEWS_PATH);

  app.engine('handlebars', handlebars.engine);
  app.set('view engine', 'handlebars');
}

function serveApp(req, res) {
  res.render('internal', { layout: false });
}

function reactRoutes(app) {
  app.use(['/', '/downloads', '/trackers', '/users'], JWT, CSRF, serveApp);
}

function createServer(options) {
  options = Object.assign({
    authenticator: authenticate,
  }, options);

  const app = express();

  app.use(morgan('combined'));
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (SERVE_ASSETS) {
    app.use(express.static(path.join(__dirname, '../../client/build')));
  }

  configureHandlebars(app);

  attachAuthentication(app, options);
  attachAPI(app);

  reactRoutes(app);

  return app;
}

module.exports = {
  createServer,
  handlebars,
  JWT,
  CSRF,
  upload,
};
