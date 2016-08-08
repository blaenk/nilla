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

const db = new sqlite3.cached.Database('./db/nilla.db');

const {
  JWT_SECRET,
  RTORRENT_DOWNLOADS_DIRECTORY,
  SERVE_ASSETS,
  SERVE_DOWNLOADS,
  USE_SSL,
} = process.env;

function JWTErrorHandler(err, req, res, _next) {
  if (err.name === 'UnauthorizedError') {
    const redirectPath = req.originalUrl;

    res.redirect(`/login?redirect=${redirectPath}`);
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
      const { _redirectTo } = req.body;
      const failureRedirect = `/login?redirect=${_redirectTo}`;

      res.redirect(failureRedirect);
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
      redirectTo: req.query.redirect || '',
    });
  });

  app.post('/login', CSRF, (req, res) => {
    const { username, password, _redirectTo = '' } = req.body;

    let failureRedirect = '/login';

    if (_redirectTo !== '') {
      failureRedirect += `?redirect=${_redirectTo}`;
    }

    if (!username || !password) {
      res.redirect(failureRedirect);

      return;
    }

    options.authenticator(username, password, (error, user) => {
      if (error) {
        res.redirect(failureRedirect);

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

      res.redirect(_redirectTo || '/');
    });
  });

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

    const commands = [downloads.onLoadSetUploader(req.user.username)];

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

  api.get('/users/:id', JWT, (req, res) => {
    users.getUserById(db, req.params.id, (error, row) => {
      const filteredObject = _(row).pick('id', 'username');

      res.status(HttpStatus.OK).json(filteredObject);
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
