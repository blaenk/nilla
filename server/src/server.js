'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));

app.set('port', process.env.PORT || 3000);

app.get('*', function(req, res) {
  res.sendFile(path.resolve('public/index.html'));
});

const server = app.listen(app.get('port'), '0.0.0.0', function() {
  console.log('Express server listening on port ' + server.address().port);
});
