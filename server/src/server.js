'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const multer = require('multer');
const rtorrent = require('./rtorrent');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // 10 megabytes in bytes
    fileSize: 10000000
  }
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));

app.set('port', process.env.PORT || 3000);

app.post('/api/upload', upload.single('torrent'), (req, res) => {
  rtorrent.load(req.file.buffer, {start: req.body.start == 'true'})
    .then(infohash => {
      res.send({
        success: true,
        infohash
      });
    })
    .catch(error => {
      console.log(error);

      res.status(500).send({
        error: 'An unknown error occurred'
      });
    });
});

app.get('*', function(req, res) {
  res.sendFile(path.resolve('public/index.html'));
});

const server = app.listen(app.get('port'), '0.0.0.0', function() {
  console.log('Express server listening on port ' + server.address().port);
});
