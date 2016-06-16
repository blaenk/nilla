'use strict';

const chai = require('chai');
const chaiEnzyme = require('chai-enzyme');

chai.use(chaiEnzyme());

const {expect, assert} = chai;

var testContext = require.context('./client/test/', true, /\.spec\.js$/);
testContext.keys().forEach(testContext);

var sourceContext = require.context('./client/src/', true, /\.js$/);
sourceContext.keys().forEach((k) => {
  if (k != './app.js') {
    sourceContext(k);
  }
});
