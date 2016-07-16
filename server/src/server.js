'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
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

const PUBLIC_DIR = path.join(__dirname, '../../public');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(PUBLIC_DIR));

const { JWT_SECRET } = process.env;

const authenticate = expressJWT({
  secret: JWT_SECRET
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

const authenticateDownload = expressJWT({
  secret: JWT_SECRET,
  getToken: getJWTFromHeaderOrCookie
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // 10 megabytes in bytes
    fileSize: 10000000
  }
});

app.get(/^\/file\/(.+)/, authenticateDownload, (req, res) => {
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

app.get('/login', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'login.html'));
});

app.post('/login', (req, res) => {
  console.log(req.body);
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(403).json({
      success: false
    });

    return;
  }

  getUserFromUsername(username, (error, user) => {
    bcrypt.compare(password, user.password, (err, authenticated) => {
      if (err) {
        throw err;
      } else if (!authenticated) {
        res.status(403).json({
          success: false
        });
      } else {
        const token = createJWT(user);

        // Save the JWT as a cookie as well. It's only ever used to authenticate file
        // downloads since it's much more convenient that way.
        res.cookie('token', token, {
          httpOnly: true
        });

        res.status(200).json({
          user: username,
          token: token
        });
      }
    });
  });
});

app.post('/api/upload', authenticate, upload.single('torrent'), (req, res) => {
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

app.post('/api/magnet', authenticate, (req, res) => {
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

app.get('/api/user', authenticate, (req, res) => {
  res.status(200).json(req.user);
});

app.get('*', authenticate, (req, res) => {
  res.sendFile(path.resolve('public/index.html'));
});

function JWTErrorHandler(err, req, res, _next) {
  if (err.name == 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      message: 'Unable to authorize'
    });
  }
}

app.use(JWTErrorHandler);

const { SERVER_HOST, SERVER_PORT } = process.env;

const server = app.listen(SERVER_PORT, SERVER_HOST, () => {
  console.log('Express server listening on port ' + server.address().port);
});
