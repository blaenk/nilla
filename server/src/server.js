'use strict';

require('dotenv').config();

const rtorrent = require('./rtorrent');
const downloads = require('./models/downloads');
const users = require('./models/users');

const csurf = require('csurf');
const express = require('express');
const expressHandlebars = require('express-handlebars');

const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressJWT = require('express-jwt');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3');
const url = require('url');

const db = new sqlite3.cached.Database('./db/nilla.db');

const {
  SERVE_STATIC,
  JWT_SECRET,
  USE_SENDFILE,
  RTORRENT_DOWNLOADS_DIRECTORY
} = process.env;

function JWTErrorHandler(err, req, res, _next) {
  if (err.name == 'UnauthorizedError') {
    const redirectPath = req.originalUrl;
    res.redirect(`/login?redirect=${redirectPath}`);
  }
}

function CSRFValidationError(err, req, res, next) {
  console.log('csrfvalidationError');

  if (err.code != 'EBADCSRFTOKEN') {
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
      res.status(400).json({
        success: false,
        message: 'invalid CSRF token'
      });
    }
  });
}

function setCSRFTokenCookie(req, res, next) {
  res.cookie('csrf-token', req.csrfToken(), {
    httpOnly: false,
    // TODO
    // secure: true,
    expires: 0
  });

  next();
}

function getJWTFromHeaderOrCookie(req) {
  if (req.headers.authorization) {
    let [scheme, token] = req.headers.authorization.split(' ');

    if (scheme == 'Bearer') {
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
    permissions: user.permissions.split(',')
  }, JWT_SECRET, {
    expiresIn: '14 days'
  });
}

function rejectPlainTextRequest(req, res, next) {
  const contentType = req.headers['Content-Type'];

  if (contentType == 'text/plain') {
    res.sendStatus(400);
  } else {
    next();
  }
}

const csrfProtection = csurf({ cookie: true });

const CSRF = [csrfProtection, CSRFValidationError];

const authenticateJWT = expressJWT({
  secret: JWT_SECRET,
  getToken: getJWTFromHeaderOrCookie
});

const JWT = [authenticateJWT, JWTErrorHandler];

const TEN_MEGABYTES = 10000000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: TEN_MEGABYTES
  }
});

function authenticate(username, password, callback) {
  users.getUserFromUsername(db, username, (error, user) => {
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
      } else {
        callback(null, user);
        return;
      }
    });
  });
}

function attachAuthentication(app, options) {
  app.get('/login', CSRF, setCSRFTokenCookie, (req, res) => {
    res.render('login', {
      csrfToken: req.csrfToken(),
      redirectTo: req.query.redirect || ''
    });
  });

  app.post('/login', CSRF, (req, res) => {
    const { username, password, _redirectTo = '' } = req.body;

    let failureRedirect = '/login';

    if (_redirectTo != '') {
      failureRedirect += `?redirect=${_redirectTo}`;
    }

    if (!username || !password) {
      res.redirect(failureRedirect);
      return;
    }

    // TODO
    // support DI on `authenticate`
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
        // TODO
        // secure: true,
        expires: expiration
      });

      res.redirect(_redirectTo || '/');
    });
  });

  app.get(/^\/file\/(.+)/, JWT, (req, res) => {
    const filePath = req.params[0];
    const name = path.basename(filePath);

    if (!USE_SENDFILE) {
      const downloadPath = path.join(RTORRENT_DOWNLOADS_DIRECTORY, filePath);
      res.download(downloadPath, name);
      return;
    }

    const sendFilePath = path.join('sendfile', filePath);

    // TODO
    // maybe Content-Type needs to be empty?
    res.attachment(name);
    res.header('X-Accel-Redirect', sendFilePath);
    res.end();
  });
}

function attachAPI(app) {
  const api = express.Router();

  api.use(rejectPlainTextRequest);

  api.post('/upload', JWT, upload.single('torrent'), CSRF, (req, res) => {
    rtorrent.load(req.file.buffer, {
      start: req.body.start == 'true',
      commands: [downloads.onLoadSetUploader(req.user.username)]
    }).then(infoHash => {
      res.send({success: true, infoHash});
    }).catch(error => {
      console.log(error);

      res.status(500).send({
        error: 'An unknown error occurred'
      });
    });
  });

  api.post('/magnet', JWT, (req, res) => {
    rtorrent.load(req.body.uri, {
      start: req.body.start,
      commands: [downloads.onLoadSetUploader(req.user.username)]
    }).then(infohash => {
      res.send({success: true, infohash});
    }).catch(error => {
      console.log(error);

      res.status(500).send({
        error: 'An unknown error occurred'
      });
    });
  });

  api.get('/user', JWT, (req, res) => {
    res.status(200).json(req.user);
  });

  api.get('/downloads', JWT, (req, res) => {
    downloads.getDownloads()
      .then(downloads => res.json(downloads));
  });

  api.get('/downloads/:infoHash', JWT, (req, res) => {
    downloads.getCompleteDownload(req.params.infoHash)
      .then(downloads => res.json(downloads))
      .catch(_error => res.status(500).json({
        error: 'no such torrent'
      }));
  });

  api.patch('/downloads/:infoHash', JWT, (req, res) => {
    const { infoHash } = req.params;

    switch (req.body.action) {
      case 'start': {
        rtorrent.torrent(infoHash, 'start')
          .then(() => res.json({success: true}));
        break;
      }
      case 'stop': {
        rtorrent.torrent(infoHash, 'stop')
          .then(() => res.json({success: true}));
        break;
      }
      case 'addLock': {
        const username = req.body.params;
        downloads.addLock(infoHash, username)
          .then(() => res.json({success: true}))
          .catch(error => console.log(error));
        break;
      }
      case 'removeLock': {
        const username = req.body.params;
        downloads.removeLock(infoHash, username)
          .then(() => res.json({success: true}))
          .catch(error => console.log(error));
        break;
      }
      case 'setFilePriorities': {
        const priorities = req.body.params;
        downloads.setFilePriorities(infoHash, priorities)
          .then(() => res.json({success: true}));
        break;
      }
    }
  });

  api.delete('/downloads/:infoHash', JWT, (req, res) => {
    rtorrent.torrent(req.params.infoHash, 'erase')
      .then(() => res.json({success: true}))
      .catch(_error => res.status(500).json({
        error: 'no such torrent'
      }));
  });

  app.use('/api', api);
}

const VIEWS_PATH = path.join(__dirname, 'views');

const handlebars = expressHandlebars.create({
  defaultLayout: 'main',
  layoutsDir: path.join(VIEWS_PATH, 'layouts')
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
    authenticator: authenticate
  }, options);

  const app = express();

  app.use(helmet());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  if (SERVE_STATIC) {
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
  upload
};
