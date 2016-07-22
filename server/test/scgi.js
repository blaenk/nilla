'use strict';

const xmlrpc = require('xmlrpc');
const scgi = require('../src/scgi.js');

// examples taken from scgi protocol specification
// https://python.ca/scgi/protocol.txt

describe("SCGI", function() {
  context("Protocol", function() {
    it('should build a request', () => {
      const request = scgi.buildRequest({
        REQUEST_METHOD: "POST",
        REQUEST_URI: "/deepthought"
      }, "What is the answer to life, the Universe and everything?");

      const raw =
        "70:" +
        "CONTENT_LENGTH" + '\x00' + "56" + '\x00' +
        "SCGI" + '\x00' +  "1" + '\x00' +
        "REQUEST_METHOD" + '\x00' +  "POST" + '\x00' +
        "REQUEST_URI" + '\x00' +  "/deepthought" + '\x00' +
        "," +
        "What is the answer to life, the Universe and everything?";

      expect(raw).to.equal(request);
    });

    it('should parse a response', () => {
      const response =
        "Status: 200 OK\r\n" +
        "Content-Type: text/plain\r\n" +
        "\r\n" +
        "42";

      const parsed = scgi.parseResponse(response);

      expect(parsed.body).to.equal('42');
      expect(parsed.headers['Status']).to.equal('200 OK');
      expect(parsed.headers['Content-Type']).to.equal('text/plain');
    });
  });

  context("Transport", function() {
    it("should establish a connection", function(done) {
      const client = xmlrpc.createClient({path: process.env.RTORRENT_SOCKET});

      client.methodCallWithTransport(scgi.Transport, 'system.client_version', [], done);
    });
  });
});
