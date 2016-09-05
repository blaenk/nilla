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

// eslint-disable-next-line no-unused-vars
const pruneJob = schedule.scheduleJob('10 * * * *', tasks.prune);

// eslint-disable-next-line no-unused-vars
const staleJob = schedule.scheduleJob('30 * * * *', tasks.stale);
