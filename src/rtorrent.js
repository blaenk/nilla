"use strict";

const Bluebird = require('bluebird');

const process = require('process');
const path = require('path');
const fs = Bluebird.promisifyAll(require('fs'));

const xmlrpc = require('xmlrpc');
const scgi = require('./scgi.js');

const bencode = require('bencode');
const magnet = require('magnet-uri');
const crypto = require('crypto');

/**
 * Perform an XML-RPC request.
 *
 * @param {string} method The XML-RPC method.
 * @param {Array} [args=[]] The invocation's parameters.
 * @param {Object} [options] Optional connection options.
 * @returns {Promise} The response.
 */
function call(method, args, options) {
  args = args || [];

  options = Object.assign({
    path: process.env.RTORRENT_SOCKET,
    host: process.env.RTORRENT_HOST,
    port: process.env.RTORRENT_PORT
  }, options);

  const client = Bluebird.promisifyAll(xmlrpc.createClient(options));

  // If a socket path was specified, infer SCGI transport.
  if (options.path) {
    return client.methodCallWithTransportAsync(scgi.Transport, method, args);
  } else {
    return client.methodCallAsync(method, args);
  }
}

/**
 * Converts an array of (method, args) pairs into a proper multicall array.
 *
 * @param {Array} calls The array of calls.
 * @returns {Array} The multicall array.
 */
function createMulticall(calls) {
  return calls.map(([methodName, params]) => {
    return {
      methodName,
      params: params || []
    };
  });
}

/**
 * Performs multiple calls in one request.
 *
 * @param {Array} calls The calls to perform.
 * @returns {Promise} The response.
 */
function multicall(calls) {
  const multicallArray = createMulticall(calls);
  return call('system.multicall', [multicallArray]);
}

/**
 * Wrapper function for invoking a method for a particular torrent.
 *
 * @param {string} method The method to invoke.
 * @param {string} infohash The target torrent's infohash.
 * @param {...parameter} args The parameters.
 * @returns {Promise} The response.
 */
function torrent(method, infohash, ...args) {
  return call('d.' + method, [infohash, ...args]);
}

/**
 * Wrapper function to invoke view-wide methods.
 *
 * @param {string} view The view to target.
 * @param {...methods} args The methods to invoke.
 * @returns {Promise} The response.
 */
function torrents(view, ...args) {
  return call('d.multicall', [view, ...args]);
}

/**
 * Decode the infohash from a .torrent file.
 *
 * @param {Buffer} buffer The .torrent file.
 * @returns {string} The infohash.
 */
function decodeInfoHash(buffer) {
  let decodedBuffer = bencode.decode(buffer);
  let encodedInfo = bencode.encode(decodedBuffer["info"]);

  return crypto.createHash('sha1').update(encodedInfo).digest('hex');
}

/**
 * Decodes an integer-encoded ratio e.g. 750 to a floating-point ratio e.g.
 * 0.75.
 *
 * @param {number} ratio The integer-encoded ratio.
 * @returns {number} The floating-point ratio.
 */
function decodeRatio(ratio) {
  return ratio / 1000;
}

/**
 * Load a torrent into rtorrent.
 *
 * @param {string} filePath Path to the torrent: file path, magnet URI, HTTP URL.
 * @param {Object} options Whether to start the torrent, load it raw, commands
 * to run on-load, and connection options.
 * @returns {Promise} The response.
 */
function load(filePath, options) {
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
    const parsed = magnet.decode(filePath);
    const infohash = parsed.infoHash;

    const args = [filePath].concat(options.commands);

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
        const infohash = decodeInfoHash(buffer);

        const args = [
          options.raw ? buffer : path.resolve(filePath)
        ].concat(options.commands);

        return call(method, args, options.connection)
          .then(() => Bluebird.resolve(infohash));
      });
  }
}

module.exports = {
  call,
  multicall,
  createMulticall,

  torrent,
  torrents,

  load,

  decodeRatio
};
