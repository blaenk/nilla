'use strict';

require('dotenv').config({
  silent: Boolean(process.env.TRAVIS),
});

const path = require('path');

const csurf = require('csurf');
const express = require('express');
const expressHandlebars = require('express-handlebars');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressJWT = require('express-jwt');
const helmet = require('helmet');
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

function authenticate(username, password, callback) {
  users.getUserByUsername(db, username, (error, user) => {
    if (error) {
      callback(error);

      return;
    }

    if (!user) {
      callback(new Error('User not found.'));

      return;
    }

    bcrypt.compare(password, user.password, (error, authenticated) => {
      if (error) {
        callback(error);

        return;
      } else if (!authenticated) {
        callback(new Error('Incorrect credentials.'));

        return;
      }

      callback(null, user);
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

    options.authenticator(username, password, (error, user) => {
      if (error) {
        res.redirect(refererUrl(_ref));

        return;
      }

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
    });
  });

  app.get('/invitations/:token', CSRF, (req, res) => {
    res.render('register', {
      csrfToken: req.csrfToken(),
      invitationToken: req.params.token,
    });
  });

  app.post('/users', CSRF, (req, res) => {
    const { _invitationToken, username, password, email } = req.body;

    const SALT_ROUNDS = 10;

    // TODO
    // promisify

    const authenticateAndRedirect = (error, userId, permissions) => {
      if (error) {
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);

        return;
      }

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
    };

    const deleteInvitationAndAuthenticate = (error, userId, permissions) => {
      if (error) {
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);

        return;
      }

      users.deleteInvitationByToken(
        db,
        _invitationToken,
        (error) => {
          authenticateAndRedirect(error, userId, permissions);
        }
      );
    };

    bcrypt.hash(password, SALT_ROUNDS, (error, passwordHash) => {
      if (error) {
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);

        return;
      }

      users.getInvitationByToken(db, _invitationToken, (error, _invitation) => {
        if (error) {
          res.sendStatus(HttpStatus.UNAUTHORIZED);

          return;
        }

        const permissions = ['member'].join(',');

        // TODO
        // should use a transaction but it seems weird with node-sqlite3?
        users.insertUser(db,
          {
            username,
            password: passwordHash,
            email,
            invitationToken: _invitationToken,
            permissions,
          },
          // eslint-disable-next-line prefer-arrow-callback
          function(error) {
            // eslint-disable-next-line no-invalid-this
            const userId = this.lastID;

            deleteInvitationAndAuthenticate(error, userId, permissions);
          });
      });
    });
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

  api.post('/downloads', JWT, upload.single('torrent'), CSRF, (req, res) => {
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

    res.status(HttpStatus.OK).json({ id, username, permissions });
  });

  api.get('/users', JWT, (req, res) => {
    users.getUsers(db, (error, users) => {
      const filteredUsers = users.map(row => {
        const user = _.omit(row, ['password', 'refresh_token']);

        user.permissions = user.permissions.split(',');

        return user;
      });

      res.status(HttpStatus.OK).json(filteredUsers);
    });
  });

  api.get('/users/:id', JWT, (req, res) => {
    users.getUserById(db, req.params.id, (error, row) => {
      const filteredObject = _(row).pick('id', 'username');

      res.status(HttpStatus.OK).json(filteredObject);
    });
  });

  api.patch('/users/:id', JWT, (req, res) => {
    res.send('modify user');
  });

  api.delete('/users/:id', JWT, (req, res) => {
    console.log('deleting user', req.params.id);

    users.deleteUserById(db, req.params.id, (error) => {
      if (error) {
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);

        return;
      }

      res.sendStatus(HttpStatus.OK);
    });
  });

  api.get('/users/:id/reset', JWT, (req, res) => {
    res.send('user pw reset');
  });

  // TODO
  // or PATCH /users/:id setPassword?
  api.post('/users/:id/reset', JWT, (req, res) => {
    res.send('user pw reset');
  });

  api.get('/trackers', JWT, (req, res) => {
    trackers.getTrackers(db, (error, trackers) => {
      res.json(trackers);
    });
  });

  api.post('/trackers', JWT, (req, res) => {
    const tracker = req.body;

    trackers.insertTracker(db, tracker, (error) => {
      if (error) {
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);

        return;
      }

      trackers.getTrackers(db, (error, trackers) => {
        if (error) {
          res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);

          return;
        }

        res.json(trackers);
      });
    });
  });

  api.put('/trackers/:id', JWT, (req, res) => {
    const tracker = req.body;

    trackers.putTracker(db, req.params.id, tracker, (error) => {
      if (error) {
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);

        return;
      }

      trackers.getTrackers(db, (error, trackers) => {
        res.json(trackers);
      });
    });
  });

  api.delete('/trackers/:id', JWT, (req, res) => {
    trackers.deleteTrackerById(db, req.params.id, (error) => {
      if (error) {
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);

        return;
      }

      trackers.getTrackers(db, (error, trackers) => {
        res.json(trackers);
      });
    });
  });

  api.get('/invitations', JWT, (req, res) => {
    users.getInvitations(db, (error, invitations) => {
      res.json(invitations);
    });
  });

  api.post('/invitations', JWT, (req, res) => {
    users.createInvitation(db, (error) => {
      if (error) {
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);

        return;
      }

      users.getInvitations(db, (error, invitations) => {
        if (error) {
          res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);

          return;
        }

        res.json(invitations);
      });
    });
  });

  api.delete('/invitations/:token', JWT, (req, res) => {
    users.deleteInvitationByToken(db, req.params.token, (error) => {
      if (error) {
        res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);

        return;
      }

      users.getInvitations(db, (error, invitations) => {
        res.json(invitations);
      });
    });
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
      // TODO
      // rename acquireLock and releaseLock
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
