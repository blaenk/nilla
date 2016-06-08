"use strict";

var net = require('net');

var Bluebird = require('bluebird');
var _ = require('lodash');

const parseResponse = (response) => {
  let [rawHeaders, body] = response.split("\r\n\r\n", 2);

  // create headers map
  let headers = _.fromPairs(rawHeaders.split("\r\n").map(h => h.split(": ")));

  return {headers, body};
};

const buildRequest = (headers, body) => {
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
};

// options can be anything that that socket.connect can take
// port, host, path, etc.
// as well as an optional 'headers' key specifying an object
// of header-value pairs
// https://nodejs.org/api/net.html#net_socket_connect_options_connectlistener
const request = (options, body) => {
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
};

module.exports = {
  parseResponse,
  buildRequest,
  request
};
