"use strict";

var Bluebird = require('bluebird');

var process = require('process');
var path = require('path');
var fs = Bluebird.promisifyAll(require('fs'));

var xmlrpc = require('xmlrpc');
var SCGITransport = require('./xmlrpc_scgi.js');

var bencode = require('bencode');
var magnet = require('magnet-uri');
var crypto = require('crypto');

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

const decodeInfoHash = (buffer) => {
  let decodedBuffer = bencode.decode(buffer);
  let encodedInfo = bencode.encode(decodedBuffer["info"]);

  return crypto.createHash('sha1').update(encodedInfo).digest('hex');
};

const load = (filePath, options) => {
  options = Object.assign({
    start: false,
    raw: false,
    commands: [],
    connection: {}
  }, options);

  if (!options.start) {
    options.commands = [
      "f.multicall=,,f.set_priority=0",
      "d.update_priorities="
    ].concat(options.commands || []);
  }

  if (filePath.startsWith("magnet:")) {
    var parsed = magnet.decode(filePath);
    var infohash = parsed.infoHash;

    var args = [filePath].concat(options.commands);

    return call("load", args, options.connection)
      .then(() => Bluebird.resolve(infohash));
  } else {
    let method = 'load';

    if (!options.raw && !options.start) {
      method += '.normal';
    }

    if (options.raw) {
      method += '_raw';
    }

    if (options.start) {
      method += options.raw ? '_' : '.' + 'start';
    }

    return fs.readFileAsync(filePath)
      .then(buffer => {
        let infohash = decodeInfoHash(buffer);

        let args = [
          options.raw ? buffer : path.resolve(filePath)
        ].concat(options.commands);

        return call(method, args, options.connection)
          .then(() => Bluebird.resolve(infohash));
      });
  }
};

const setTiedFile = (filepath) => call('d.tied_to_file.set', [filepath]);

const removeTorrent = (infohash) => {
  return call('d.erase', [infohash]);
};

module.exports = {
  call,
  multicall,
  torrent,
  torrents,

  load,

  setTiedFile,
  removeTorrent
};
