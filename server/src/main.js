'use strict';

const server = require('./server');

const app = server.createServer();

const {
  SERVER_HOST,
  SERVER_PORT
} = process.env;

const instance = app.listen(SERVER_PORT, SERVER_HOST, () => {
  console.log('Express server listening on port ' + instance.address().port);
});
