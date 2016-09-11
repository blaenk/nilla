'use strict';

const server = require('./server');

const app = server.createServer();

// eslint-disable-next-line no-magic-numbers
const { HOST = '0.0.0.0', PORT = 3000, NODE_APP_INSTANCE = 0 } = process.env;

const port = parseInt(PORT) + parseInt(NODE_APP_INSTANCE);

const instance = app.listen(port, HOST, () => {
  console.log('Express server listening on port ' + instance.address().port);
});
