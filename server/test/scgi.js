'use strict';

const xmlrpc = require('xmlrpc');
const scgi = require('../src/scgi.js');

// examples taken from scgi protocol specification
// https://python.ca/scgi/protocol.txt

describe('SCGI', function() {
  context('Protocol', function() {
    it('should build a request', function() {
      const request = scgi.buildRequest({
        REQUEST_METHOD: 'POST',
        REQUEST_URI: '/deepthought',
      }, 'What is the answer to life, the Universe and everything?');

      const NULL = '\x00';

      const raw =
        '70:' +
        'CONTENT_LENGTH' + NULL + '56' + NULL +
        'SCGI' + NULL + '1' + NULL +
        'REQUEST_METHOD' + NULL + 'POST' + NULL +
        'REQUEST_URI' + NULL + '/deepthought' + NULL +
        ',' +
        'What is the answer to life, the Universe and everything?';

      expect(raw).to.equal(request);
    });

    it('should parse a response', function() {
      const response =
        'Status: 200 OK\r\n' +
        'Content-Type: text/plain\r\n' +
        '\r\n' +
        '42';

      const parsed = scgi.parseResponse(response);

      expect(parsed.body).to.equal('42');
      expect(parsed.headers.Status).to.equal('200 OK');
      expect(parsed.headers['Content-Type']).to.equal('text/plain');
    });
  });

  context('Transport', function() {
    it('should establish a connection', function(done) {
      const client = xmlrpc.createClient({ path: process.env.RTORRENT_SOCKET });

      client.methodCallWithTransport(scgi.Transport, 'system.client_version', [], done);
    });
  });
});
