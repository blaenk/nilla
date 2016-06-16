const chai = require('chai');
const chaiEnzyme = require('chai-enzyme');

chai.use(chaiEnzyme());

const {expect, assert} = chai;

var context = require.context('./client/test/', true, /\.spec\.js$/);
context.keys().forEach(context);
