"use strict";

// If this is a Travis build don't attempt to load a .env file. Instead the
// environment variables will be passed via the .travis.yml file.
require('dotenv').config({
  silent: !!process.env.TRAVIS
});

global.chai = require('chai');

global.chaiAsPromised = require('chai-as-promised');
global.chai.use(global.chaiAsPromised);

global.sinon = require('sinon');
global.sinonChai = require('sinon-chai');
global.chai.use(global.sinonChai);

global.chai.should();
global.chaiAsPromised = global.chaiAsPromised;
global.expect = global.chai.expect;
global.AssertionError = global.chai.AssertionError;
global.Assertion = global.chai.Assertion;
global.assert = global.chai.assert;
