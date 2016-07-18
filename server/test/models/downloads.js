'use strict';

const downloads = require('../src/models/downloads.js');

describe('Downloads Model', function() {
  context('decode ratio', function() {
    it('returns actual ratio from integer value', function() {
      downloads.decodeRatio(1000).should.equal('1.00');
      downloads.decodeRatio(750).should.equal('0.75');
      downloads.decodeRatio(100).should.equal('0.10');
      downloads.decodeRatio(0).should.equal('0.00');
    });
  });
});
