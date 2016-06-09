"use strict";

var process = require('process');

var Bluebird = require('bluebird');
var xmlrpc = require('xmlrpc');

var SCGITransport = require('./xmlrpc_scgi.js');

const call = (method, args, opts) => {
  opts = Object.assign({
    path: process.env.RTORRENT_SOCKET,
    host: process.env.RTORRENT_HOST,
    port: process.env.RTORRENT_PORT
  }, opts);

  const client = Bluebird.promisifyAll(xmlrpc.createClient(opts));

  // If a socket path was specified, infer SCGI transport.
  if (opts.path) {
    return client.methodCallWithTransportAsync(SCGITransport, method, args);
  } else {
    return client.methodCallAsync(method, args);
  }
};

// convert an array of name, params pairs into
// a proper multicall list
//
// before:
// [
//   ['d.get_name', ['hash']],
//   ['d.get_hash', ['hash']]
// ];
//
// after:
// [
//   {methodName: "d.get_name", params: ['hash']},
//   {methodName: "d.get_hash", params: ['hash']},
// ]
const multicalls = (...calls) => {
  return calls.map(([methodName, params]) => {
    return {
      methodName,
      params: params || []
    };
  });
};

// multicall(
//   ["d.get_name", ["hash", "thing"]],
//   ["d.get_down_rate", ["hash", "thing"]]
// );

const multicall = (...calls) => {
  return call('system.multicall', multicalls(...calls));
};

const torrent = (hash, ...args) => {
  return call('d.', [hash, ...args]);
};

const torrents = (view, ...args) => {
  return call('d.multicall', [view, ...args]);
};

module.exports = {
  call,
  multicall,
  torrent,
  torrents
};
