'use strict';

const chai = require('chai');
const chaiEnzyme = require('chai-enzyme');

chai.use(chaiEnzyme());

global.expect = chai.expect;
global.assert = chai.assert;

const testContext = require.context('./client/test/', true, /\.spec\.js$/);
testContext.keys().forEach(testContext);

const sourceContext = require.context('./client/src/', true, /\.js$/);
sourceContext.keys().forEach(sourceContext);
