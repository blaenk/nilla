'use strict';

const schedule = require('node-schedule');

const server = require('./server');
const tasks = require('./tasks');

const app = server.createServer();

const {
  SERVER_HOST,
  SERVER_PORT,
} = process.env;

const instance = app.listen(SERVER_PORT, SERVER_HOST, () => {
  console.log('Express server listening on port ' + instance.address().port);
});

const EVERY_10_MINUTES = '10 * * * *';

// eslint-disable-next-line no-unused-vars
const pruneJob = schedule.scheduleJob(EVERY_10_MINUTES, tasks.prune);

const EVERY_30_MINUTES = '30 * * * *';

// eslint-disable-next-line no-unused-vars
const staleJob = schedule.scheduleJob(EVERY_30_MINUTES, tasks.stale);
