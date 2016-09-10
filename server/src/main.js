'use strict';

const schedule = require('node-schedule');

const server = require('./server');
const tasks = require('./tasks');

const app = server.createServer();

// eslint-disable-next-line no-magic-numbers
const { HOST = '0.0.0.0', PORT = 3000, NODE_APP_INSTANCE = 0 } = process.env;

const port = parseInt(PORT) + parseInt(NODE_APP_INSTANCE);

const instance = app.listen(port, HOST, () => {
  console.log('Express server listening on port ' + instance.address().port);
});

const EVERY_10_MINUTES = '10 * * * *';

// eslint-disable-next-line no-unused-vars
const pruneJob = schedule.scheduleJob(EVERY_10_MINUTES, tasks.prune);

const EVERY_30_MINUTES = '30 * * * *';

// eslint-disable-next-line no-unused-vars
const staleJob = schedule.scheduleJob(EVERY_30_MINUTES, tasks.stale);
