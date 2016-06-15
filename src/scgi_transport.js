"use strict";

var stream = require('stream');
var util = require('util');
var events = require('events');

var Client = require('xmlrpc/lib/client');
var Serializer = require('xmlrpc/lib/serializer');
var Deserializer = require('xmlrpc/lib/deserializer');

var scgi = require('./scgi');

var Bluebird = require('bluebird');

Bluebird.promisifyAll(Deserializer.prototype);

Client.prototype.scgiMethodCall = function scgiMethodCall(method, params) {
  var options = this.options;
  var xml     = Serializer.serializeMethodCall(method, params, options.encoding);

  return scgi.request(options, xml)
    .then((response) => {
      var deserializer = new Deserializer(options.responseEncoding);

      var s = new stream.Readable();
      s._read = () => {};
      s.push(response.body);
      s.push(null);

      return deserializer.deserializeMethodResponseAsync(s);
    });
};

class SCGITransport {
  static request(options, callback) {
    return new SCGITransport(options, callback);
  }

  constructor(options, callback) {
    this.options = options;
    this.callback = callback;
    this.body = '';
  }

  write(body) {
    this.body = body;
  }

  end() {
    scgi.request(this.options, this.body)
      .then(response => {
        var s = new stream.Readable();
        s._read = () => {};
        s.push(response.body);
        s.push(null);

        this.callback(s);
      })
      .catch(err => this.emit('error', err));
  }
}

util.inherits(SCGITransport, events.EventEmitter);

module.exports = SCGITransport;
