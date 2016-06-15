"use strict";

var stream = require('stream');
var util = require('util');
var events = require('events');

var scgi = require('./scgi');

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
