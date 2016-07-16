'use strict';

require('dotenv').config();

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
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const db = new sqlite3.cached.Database('./db/nilla.db');

const jwt = require('jsonwebtoken');
const expressJWT = require('express-jwt');

const app = express();

const VIEWS_PATH = path.join(__dirname, 'views');

console.log(VIEWS_PATH);

app.set('views', VIEWS_PATH);

const handlebars = expressHandlebars.create({
  defaultLayout: 'main',
  layoutsDir: path.join(VIEWS_PATH, 'layouts')
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

const PUBLIC_PATH = path.join(__dirname, '../../public');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(PUBLIC_PATH));

const csrfProtection = csurf({cookie: true});

const { JWT_SECRET } = process.env;

const authenticateJWT = expressJWT({
  secret: JWT_SECRET,
  getToken: getJWTFromHeaderOrCookie
});

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

app.get(/^\/file\/(.+)/, authenticateJWT, (req, res) => {
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

function getUserFromUsername(username, callback) {
  db.get('SELECT * FROM users WHERE username = ?', username,
         (error, row) => callback(error, row));
}

function createRefreshToken(callback) {
  crypto.randomBytes(64, (err, buffer) => {
    if (err) {
      callback(err);
    } else {
      callback(null, crypto.createHash('sha1').update(buffer).digest('hex'));
    }
  });
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

app.get('/login', csrfProtection, (req, res) => {
  res.render('login', {
    csrfToken: req.csrfToken(),
    redirectTo: getRedirectPath(req)
  });
});

app.post('/login', csrfProtection, (req, res) => {
  const { username, password, _redirectTo } = req.body;
  const failureRedirect = `/login?redirect=${_redirectTo}`;

  if (!username || !password) {
    res.redirect(failureRedirect);
    return;
  }

  getUserFromUsername(username, (error, user) => {
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

        console.log('expiration', expiration);

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

app.post('/api/upload', authenticateJWT, upload.single('torrent'), (req, res) => {
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

app.post('/api/magnet', authenticateJWT, (req, res) => {
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

app.get('/api/user', authenticateJWT, (req, res) => {
  res.status(200).json(req.user);
});

app.get('*', authenticateJWT, (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

function JWTErrorHandler(err, req, res, _next) {
  if (err.name == 'UnauthorizedError') {
    const redirectPath = req.path;
    console.log('redirect', redirectPath);
    res.redirect(`/login?redirect=${redirectPath}`);
  }
}

app.use(JWTErrorHandler);

const { SERVER_HOST, SERVER_PORT } = process.env;

const server = app.listen(SERVER_PORT, SERVER_HOST, () => {
  console.log('Express server listening on port ' + server.address().port);
});
