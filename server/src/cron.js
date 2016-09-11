'use strict';

const schedule = require('node-schedule');

const tasks = require('./tasks');

const EVERY_10_MINUTES = '10 * * * *';

// eslint-disable-next-line no-unused-vars
const pruneJob = schedule.scheduleJob(EVERY_10_MINUTES, tasks.prune);

const EVERY_30_MINUTES = '30 * * * *';

// eslint-disable-next-line no-unused-vars
const staleJob = schedule.scheduleJob(EVERY_30_MINUTES, tasks.stale);
