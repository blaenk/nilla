'use strict';

require('dotenv').config({
  silent: Boolean(process.env.TRAVIS) || process.env.NODE_ENV === 'production',
});

const path = require('path');
const util = require('util');

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

const {
  JWT_SECRET,
  NODE_ENV,
  RTORRENT_DOWNLOADS_DIRECTORY,
  RTORRENT_SOCKET,
  SERVE_ASSETS,
  SERVE_DOWNLOADS,
  USE_SSL,
  DATABASE = './db/nilla.db',
} = process.env;

const db = new sqlite3.cached.Database(DATABASE);

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

function catchAllErrors(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === 'ECONNREFUSED' && err.address === RTORRENT_SOCKET) {
    console.error('Error: rtorrent is unavailable');
    res.sendStatus(HttpStatus.SERVICE_UNAVAILABLE);

    return;
  }

  console.error(err.stack);
  res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
}

function handleRtorrentError(error, res, next) {
  if (Array.isArray(error) &&
      error.every(e => e.error && e.error.faultCode && e.error.faultString)) {
    for (const e of error) {
      console.error(
        `XML-RPC: ${e.error.faultString}: ${e.methodName} ${util.inspect(e.params)}`
      );
    }

    res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  } else {
    return next(error);
  }
}

function JWTErrorHandler(err, req, res, next) {
  if (err.code === 'permission_denied') {
    res.sendStatus(HttpStatus.UNAUTHORIZED);

    return;
  } else if (err.name === 'UnauthorizedError') {
    res.redirect(refererUrl(req.originalUrl));

    return;
  }

  next(err);
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

function setToken(res, user) {
  const token = createJWT(user);
  const expiration = moment().utc().add(1, 'month').toDate();

  // Save the JWT as a cookie as well. It's only ever used to authenticate file
  // downloads since it's much more convenient that way.
  res.cookie('token', token, {
    httpOnly: true,
    secure: Boolean(USE_SSL),
    expires: expiration,
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
        setToken(res, user);

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

  app.post('/users/:id/reset/:token', CSRF, (req, res, next) => {
    const { id, token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    if (!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword) {
      res.redirect(req.header('referer'));

      return;
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
      .catch(next);
  });

  app.post('/users', CSRF, (req, res, next) => {
    const { _invitationToken, username, password, email } = req.body;

    if (!username || !password || !email) {
      res.redirect(req.header('referer'));

      return;
    }

    const permissions = ['download', 'users:resolve'].join(',');

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
        setToken(res, {
          id: userId,
          username,
          permissions,
        });

        res.redirect('/');
      })
      .catch(next);
  });

  app.get(/^\/file\/(.+)/, JWT, guard.check('download'), (req, res) => {
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

  api.post('/downloads', CSRF, JWT, guard.check('upload'), upload.single('torrent'),
           (req, res, next) => {
    let torrent, start;

    if (req.is('multipart/form-data')) {
      torrent = req.file.buffer;
      start = req.body.start === 'true';
    } else if (req.is('json')) {
      torrent = req.body.uri;
      start = req.body.start;
    } else {
      throw new Error('an unknown error occurred');
    }

    const commands = [downloads.onLoadSetUploader(req.user.id)];

    rtorrent.load(torrent, { start, commands })
      .then(infoHash => res.send({ infoHash }))
      .catch(next);
  });

  api.get('/users/current', JWT, (req, res) => {
    const { id, username, permissions } = req.user;

    res.json({ id, username, permissions });
  });

  const splitPermissions = row => {
    row.permissions = row.permissions.split(',');

    return row;
  };

  api.get('/users', JWT, guard.check('users:read'), (req, res, next) => {
    users.getUsers(db)
      .then(users => {
        const filteredUsers = users.map(splitPermissions);

        res.status(HttpStatus.OK).json(filteredUsers);
      })
      .catch(next);
  });

  api.put('/users/:id', JWT, guard.check('users:write'), (req, res, next) => {
    const user = req.body;

    user.permissions = user.permissions.join(',');

    users.putUser(db, req.params.id, user)
      .then(() => users.getUsers(db))
      .then(users => {
        const filteredUsers = users.map(splitPermissions);

        res.json(filteredUsers);
      })
      .catch(next);
  });

  api.get('/users/:id', JWT, guard.check('users:resolve'), (req, res, next) => {
    users.getUserById(db, req.params.id)
      .then(row => {
        const filteredObject = _(row).pick('id', 'username');

        res.status(HttpStatus.OK).json(filteredObject);
      })
      .catch(next);
  });

  api.delete('/users/:id', JWT, guard.check('users:write'), (req, res, next) => {
    const userId = parseInt(req.params.id);

    downloads.getDownloads()
      .then(downloads => {
        // move any of user's downloads to system
        const relinquishDownloads = downloads
              .filter(d => d.uploader === userId)
              .map(d => {
                return {
                  methodName: 'd.set_custom',
                  params: [d.infoHash, 'nilla-uploader', '-1'],
                };
              });

        // release any locks
        const releaseLocks = downloads
              .filter(d => d.locks.includes(userId))
              .map(d => {
                const index = d.locks.indexOf(userId);

                d.locks.splice(index, 1);

                return {
                  methodName: 'd.set_custom',
                  params: [d.infoHash, 'nilla-locks', JSON.stringify(d.locks)],
                };
              });

        const calls = relinquishDownloads.concat(releaseLocks);

        if (calls.length === 0) {
          return Bluebird.resolve();
        }

        return rtorrent.multicall(calls);
      })
      .then(() => users.deleteUserById(db, userId))
      .then(() => res.sendStatus(HttpStatus.OK))
      .catch(next);
  });

  api.get('/trackers', JWT, guard.check('trackers:read'), (req, res, next) => {
    trackers.getTrackers(db)
      .then(trackers => res.json(trackers))
      .catch(next);
  });

  api.post('/trackers', JWT, guard.check('trackers:write'), (req, res, next) => {
    const tracker = req.body;

    trackers.insertTracker(db, tracker)
      .then(() => trackers.getTrackers(db))
      .then(trackers => res.json(trackers))
      .catch(next);
  });

  api.put('/trackers/:id', JWT, guard.check('trackers:write'), (req, res, next) => {
    const tracker = req.body;

    trackers.putTracker(db, req.params.id, tracker)
      .then(() => trackers.getTrackers(db))
      .then(trackers => res.json(trackers))
      .catch(next);
  });

  api.delete('/trackers/:id', JWT, guard.check('trackers:write'), (req, res, next) => {
    trackers.deleteTrackerById(db, req.params.id)
      .then(() => trackers.getTrackers(db))
      .then(trackers => res.json(trackers))
      .catch(next);
  });

  api.get('/invitations', JWT, guard.check('invitations:read'), (req, res, next) => {
    users.getInvitations(db)
      .then(invitations => res.json(invitations))
      .catch(next);
  });

  api.post('/invitations', JWT, guard.check('invitations:write'), (req, res, next) => {
    users.createInvitation(db)
      .then(() => users.getInvitations(db))
      .then(invitations => res.json(invitations))
      .catch(next);
  });

  api.delete('/invitations/:token', JWT, guard.check('invitations:write'), (req, res, next) => {
    users.deleteInvitationByToken(db, req.params.token)
      .then(() => users.getInvitations(db))
      .then(invitations => res.json(invitations))
      .catch(next);
  });

  api.get('/downloads', JWT, (req, res, next) => {
    downloads.getDownloads()
      .then(downloads => res.json(downloads))
      .catch(next);
  });

  api.get('/downloads/:infoHash', JWT, (req, res, next) => {
    downloads.getCompleteDownload(req.params.infoHash)
      .then(downloads => res.json(downloads))
      .catch(error => handleRtorrentError(error, res, next));
  });

  api.patch('/downloads/:infoHash', JWT, guard.check('download'), (req, res, next) => {
    const { infoHash } = req.params;

    downloads.getDownload(infoHash)
      .then(download => {
        const isUploader = req.user.id === download.uploader;
        const canControl = req.user.permissions.includes('download:control');
        const canDownload = req.user.permissions.includes('download');

        switch (req.body.action) {
          case 'start':
          case 'stop': {
            if (!isUploader && !canControl) {
              res.sendStatus(HttpStatus.UNAUTHORIZED);

              return;
            }

            return rtorrent.torrent(infoHash, req.body.action);
          }
          case 'acquireLock':
          case 'releaseLock': {
            if (!canDownload) {
              res.sendStatus(HttpStatus.UNAUTHORIZED);

              return;
            }

            return downloads[req.body.action](infoHash, req.user.id);
          }
          case 'setFilePriorities': {
            if (!canDownload) {
              res.sendStatus(HttpStatus.UNAUTHORIZED);

              return;
            }

            const priorities = req.body.params;

            return downloads.setFilePriorities(infoHash, priorities);
          }
          default:
            throw new Error('unknown method');
        }
      })
      .then(() => res.sendStatus(HttpStatus.OK))
      .catch(next);
  });

  api.delete('/downloads/:infoHash', JWT, guard.check('download'), (req, res, next) => {
    downloads.getDownload(req.params.infoHash)
      .then(download => {
        // * anyone with download:control can delete any download
        // * the original uploader can delete the download if it has no locks
        if (!req.user.permissions.includes('download:control') &&
            !(req.user.id === download.uploader && download.locks.length === 0)) {
          res.sendStatus(HttpStatus.UNAUTHORIZED);

          return;
        }

        return rtorrent.torrent(req.params.infoHash, 'erase');
      })
      .then(() => res.sendStatus(HttpStatus.OK))
      .catch(error => handleRtorrentError(error, res, next));
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

  if (NODE_ENV === 'development') {
    app.use(morgan('combined'));
  }

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

  app.use(catchAllErrors);

  return app;
}

module.exports = {
  createServer,
  handlebars,
  JWT,
  CSRF,
  upload,
};
