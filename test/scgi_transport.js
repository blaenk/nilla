"use strict";

var xmlrpc = require('xmlrpc');
var SCGITransport = require('../src/scgi_transport.js');

describe("SCGI XML-RPC Transport", function() {
  it("should establish a connection", function(done) {
    var client = xmlrpc.createClient({path: process.env.RTORRENT_SOCKET});

    client.methodCallWithTransport(SCGITransport, 'system.client_version', [], done);
  });
});
