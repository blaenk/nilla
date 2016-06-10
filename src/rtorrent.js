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

const infoHash = (buffer) => {
  let decodedBuffer = bencode.decode(buffer);
  let encodedInfo = bencode.encode(decodedBuffer["info"]);

  return crypto.createHash('sha1').update(encodedInfo).digest('hex');
};

const disableFilesForNonStarted = (startNow, commands) => {
  if (!startNow) {
    return ["f.multicall=,,f.set_priority=0", "d.update_priorities="].concat(commands);
  }

  return commands;
};

// commands:
//
// load.normal
// load.start
// load.raw
// load.raw_start

// Load a .torrent file
const loadFile = (filePath, commands, startNow, loadRaw, opts) => {
  commands = disableFilesForNonStarted(startNow, commands || []);

  return fs.readFileAsync(filePath)
    .then(buffer => {
      let infohash = infoHash(buffer);
      let method = 'load';

      if (loadRaw) {
        method += '_raw';
      }

      if (startNow) {
        method += '_start';
      }

      let args = [loadRaw ? buffer : path.resolve(filePath)].concat(commands);

      return call(method, args, opts).then(() => Bluebird.resolve(infohash));
    });
};

const loadMagnet = (uri, startNow, commands, opts) => {
  commands = disableFilesForNonStarted(startNow, commands || []);
  let method = startNow ? "load_start" : "load";

  var parsed = magnet.decode(uri);
  var infohash = parsed.infoHash;

  return call(method, [uri], commands, opts).then(() => Bluebird.resolve(infohash));
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

  loadFile,
  loadMagnet,

  setTiedFile,
  removeTorrent
};
