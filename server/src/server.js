'use strict';

require('dotenv').config();

const downloads = require('./models/downloads');
const users = require('./models/users');

const express = require('express');
const expressHandlebars = require('express-handlebars');
const csurf = require('csurf');

const moment = require('moment');
const path = require('path');
const url = require('url');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const rtorrent = require('./rtorrent');
const sqlite3 = require('sqlite3');
const bcrypt = require('bcrypt');
const helmet = require('helmet');

const db = new sqlite3.cached.Database('./db/nilla.db');

const jwt = require('jsonwebtoken');
const expressJWT = require('express-jwt');

function JWTErrorHandler(err, req, res, _next) {
  if (err.name == 'UnauthorizedError') {
    const redirectPath = req.path;
    res.redirect(`/login?redirect=${redirectPath}`);
  }
}

const app = express();

app.use(helmet());

const VIEWS_PATH = path.join(__dirname, 'views');

app.set('views', VIEWS_PATH);

const handlebars = expressHandlebars.create({
  defaultLayout: 'main',
  layoutsDir: path.join(VIEWS_PATH, 'layouts')
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

const PUBLIC_PATH = path.join(__dirname, '../../client/build');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(PUBLIC_PATH));

const csrfProtection = csurf({cookie: true});

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

const CSRF = [csrfProtection, CSRFValidationError];

function setCSRFTokenCookie(req, res, next) {
  res.cookie('csrf-token', req.csrfToken(), {
    httpOnly: false,
    // TODO
    // secure: true,
    expires: 0
  });

  next();
}

app.use(CSRF, setCSRFTokenCookie);

const { JWT_SECRET } = process.env;

const authenticateJWT = expressJWT({
  secret: JWT_SECRET,
  getToken: getJWTFromHeaderOrCookie
});

const JWT = [authenticateJWT, JWTErrorHandler];

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

const TEN_MEGABYTES = 10000000;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: TEN_MEGABYTES
  }
});

app.get(/^\/file\/(.+)/, JWT, (req, res) => {
  const filePath = req.params[0];
  const name = path.basename(filePath);

  if (!process.env.USE_SENDFILE) {
    const downloadPath = path.join(process.env.RTORRENT_DOWNLOADS_DIRECTORY, filePath);
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

function createJWT(user) {
  return jwt.sign({
    id: user.id,
    username: user.username,
    permissions: user.permissions.split(',')
  }, JWT_SECRET, {
    expiresIn: '14 days'
  });
}

function getRedirectPath(req) {
  const query = req.query.redirect;
  const header = req.header('Referer');

  if (query) {
    return query;
  } else if (header) {
    return url.parse(header).path;
  } else {
    return '/';
  }
}

app.get('/login', CSRF, (req, res) => {
  res.render('login', {
    csrfToken: req.csrfToken(),
    redirectTo: getRedirectPath(req)
  });
});

app.post('/login', CSRF, (req, res) => {
  const { username, password, _redirectTo } = req.body;
  const failureRedirect = `/login?redirect=${_redirectTo}`;

  if (!username || !password) {
    res.redirect(failureRedirect);
    return;
  }

  users.getUserFromUsername(db, username, (error, user) => {
    if (error) {
      throw error;
    }

    if (!user) {
      res.redirect(failureRedirect);
      return;
    }

    bcrypt.compare(password, user.password, (err, authenticated) => {
      if (err) {
        throw err;
      } else if (!authenticated) {
        res.redirect(failureRedirect);
        return;
      } else {
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

        res.redirect(_redirectTo);
      }
    });
  });
});

function rejectPlainTextRequest(req, res, next) {
  const contentType = req.headers['Content-Type'];

  if (contentType == 'text/plain') {
    res.sendStatus(400);
  } else {
    next();
  }
}

app.use('/api/', rejectPlainTextRequest);

app.post('/api/upload', JWT, upload.single('torrent'), CSRF, (req, res) => {
  rtorrent.load(req.file.buffer, {start: req.body.start == 'true'})
    .then(infohash => {
      res.send({success: true, infohash});
    })
    .catch(error => {
      console.log(error);

      res.status(500).send({
        error: 'An unknown error occurred'
      });
    });
});

app.post('/api/magnet', JWT, (req, res) => {
  rtorrent.load(req.body.uri, {start: req.body.start})
    .then(infohash => {
      res.send({success: true, infohash});
    })
    .catch(error => {
      console.log(error);

      res.status(500).send({
        error: 'An unknown error occurred'
      });
    });
});

app.get('/api/user', JWT, (req, res) => {
  res.status(200).json(req.user);
});

app.get('/api/downloads', JWT, (req, res) => {
  downloads.getDownloads()
    .then(downloads => res.json(downloads));
});

app.get('/api/downloads/:infoHash/files', JWT, (req, res) => {
  downloads.getFiles(req.params.infoHash)
    .then(downloads => res.json(downloads));
});

app.get('*', JWT, CSRF, (req, res) => {
  res.render('internal', {
    layout: false
  });
});

const { SERVER_HOST, SERVER_PORT } = process.env;

const server = app.listen(SERVER_PORT, SERVER_HOST, () => {
  console.log('Express server listening on port ' + server.address().port);
});
