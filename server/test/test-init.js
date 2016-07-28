'use strict';

global.Bluebird = require('bluebird');

// If this is a Travis build don't attempt to load a .env file. Instead the
// environment variables will be passed via the .travis.yml file.
require('dotenv').config({
  silent: Boolean(process.env.TRAVIS)
});

global.chai = require('chai');
global.sinon = require('sinon');

global.chai.use(require('chai-as-promised'));
global.chai.use(require('sinon-chai'));

global.assert = global.chai.assert;
global.expect = global.chai.expect;

global.AssertionError = global.chai.AssertionError;
global.Assertion = global.chai.Assertion;

require('sinon-as-promised')(global.Bluebird);
