"use strict";

const events = require('events');
const net = require('net');
const stream = require('stream');
const util = require('util');

const Bluebird = require('bluebird');
const _ = require('lodash');

/**
 * Construct an SCGI request.
 *
 * @param {Object} headers Header map.
 * @param {string} body The request body.
 * @returns {string} SCGI-formatted request.
 */
function buildRequest(headers, body) {
  const scgiHeaders = {
    CONTENT_LENGTH: body.length,
    SCGI: 1
  };

  // NOTE
  // the scgi headers must come first, with CONTENT_LENGTH at the very beginning
  let merged = _.merge(scgiHeaders, headers);

  let header = _.reduce(merged, (acc, value, key) => {
    return acc + `${key}\x00${value}\x00`;
  }, '');

  return `${header.length}:${header},${body}`;
}

/**
 * Parse an SCGI response.
 *
 * @param {string} response The SCGI response.
 * @returns {Object} The parsed response with keys for the headers and body.
 */
function parseResponse(response) {
  let [rawHeaders, body] = response.split("\r\n\r\n", 2);

  // create headers map
  let headers = _.fromPairs(rawHeaders.split("\r\n").map(h => h.split(": ")));

  return {headers, body};
}

/**
 * Perform an SCGI request.
 *
 * @param {Object} options Options passed-through to socket.connect. Use this to
 * pass headers via the headers key.
 * @param {string} body The request body.
 * @returns {Promise} The response.
 */
function request(options, body) {
  return new Bluebird((resolve, reject) => {
    const connection = net.connect(options);
    let response = "";

    connection.on('data', (data) => {
      response += data;
    });

    connection.on('end', () => {
      resolve(parseResponse(response));
    });

    connection.on('error', (err) => {
      reject(err);
    });

    connection.write(buildRequest(options.headers || {}, body));
    connection.end();
  });
}

/**
 * An SCGI transport for use with xmlrpc.clientWithTransport.
 */
class Transport {
  /**
   * Return a new instance of Transport.
   * @param {Object} options Options passed-through to socket.connect.
   * @param {function} callback Function to call-back with the response.
   * @returns {Transport} The instance.
   */
  static request(options, callback) {
    return new Transport(options, callback);
  }

  /**
   * Create the transport.
   * @param {Object} options Options passed-through to socket.connect.
   * @param {function} callback Function to call-back with the response.
   */
  constructor(options, callback) {
    this.options = options;
    this.callback = callback;
    this.body = '';
  }

  /**
   * Return a new instance of Transport.
   * @param {string} body The body to write.
   * @returns {void}
   */
  write(body) {
    this.body = body;
  }

  /**
   * Signal the end of the request writing.
   * @returns {void}
   */
  end() {
    request(this.options, this.body)
      .then(response => {
        const s = new stream.Readable();
        s._read = () => {};
        s.push(response.body);
        s.push(null);

        this.callback(s);
      })
      .catch(err => this.emit('error', err));
  }
}

util.inherits(Transport, events.EventEmitter);

module.exports = {
  buildRequest,
  parseResponse,
  request,
  Transport
};
