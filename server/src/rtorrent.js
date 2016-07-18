'use strict';

const Bluebird = require('bluebird');

const process = require('process');
const path = require('path');
const fs = Bluebird.promisifyAll(require('fs'));

const xmlrpc = require('xmlrpc');
const scgi = require('./scgi.js');

const parseTorrent = require('parse-torrent');

const _ = require('lodash');

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

function createMulticallMethodObject(methods, index) {
  if (_.isString(methods[index])) {
    methods[index] = { method: methods[index] };
  }
}

function prependPrefixIfNotPresent(prefix, methods, index) {
  if (!methods[index].method.startsWith(prefix)) {
    methods[index].method = prefix += methods[index].method;
  }
}

function appendEqualsIfNotPresent(methods, index) {
  if (!methods[index].method.includes('=')) {
    methods[index].method += '=';
  }
}

function normalizeMulticallMethods(methods) {
  for (let i = 0; i < methods.length; i++) {
    createMulticallMethodObject(methods, i);
    prependPrefixIfNotPresent('d.', methods, i);
    appendEqualsIfNotPresent(methods, i);
  }
}

// in:  d.multicall ['main', 'd.get_name=', 'd.get_ratio=']
// out: [[hash1, ratio1], [hash2, ratio2]]
function torrentMulticall(view, methods) {
  return call('d.multicall', [view, ...methods]);
}

function transformKey(options) {
  if (_.isString(options.as)) {
    return options.as;
  } else if (_.isFunction(options.as)) {
    return options.as(options.method);
  } else {
    return options.method;
  }
}

function transformValue(options, result) {
  if (_.isFunction(options.map)) {
    return options.map(result);
  } else {
    return result;
  }
}

const rename = {
  toCamelCase(name) {
    return name.replace(/_([a-z])/g, match => match[1].toUpperCase());
  },

  pretty(name) {
    let matches;

    const isPrefix = /^[dfpt]\.is_(.+)=/;
    const getPrefix = /^[dfpt]\.get_(.+)=/;
    const metaPrefix = /[dfpt]\.(.+)=(.+)/;

    matches = getPrefix.exec(name);

    if (matches) {
      return matches[1];
    }

    matches = isPrefix.exec(name);

    if (matches) {
      return matches[1];
    }

    matches = metaPrefix.exec(name);

    if (matches) {
      return matches[2];
    }

    return name;
  }
};

function torrents(view, methods) {
  // normalize strings to objects
  normalizeMulticallMethods(methods);

  const results = torrentMulticall(view, methods.map(method => method.method));

  return results.map(itemResult => {
    let transformed = {};

    itemResult.map((methodResult, index) => {
      const options = methods[index];
      const nameBody = /^[dfpt]\.(.+)=?$/;

      let key = nameBody.exec(options.method)[1];
      key = transformKey(options);

      let mapped = transformValue(options, methodResult);

      transformed[key] = mapped;
    });

    return transformed;
  });
}

function toBoolean(string) {
  return string == '1';
}

/**
 * Load a torrent into rtorrent.
 *
 * @param {string} file Buffer of or path to the torrent: file path, magnet URI, HTTP URL.
 * @param {Object} options Whether to start the torrent, load it raw, commands
 * to run on-load, and connection options.
 * @returns {Promise} The response.
 */
function load(file, options) {
  const isBuffer = Buffer.isBuffer(file);

  options = Object.assign({
    start: false,
    raw: isBuffer,
    commands: [],
    connection: {}
  }, options);

  if (!options.start) {
    options.commands = [
      "f.multicall=,,f.set_priority=0",
      "d.update_priorities="
    ].concat(options.commands);
  }

  if (!isBuffer && file.startsWith("magnet:")) {
    const { infoHash } = parseTorrent(file);

    let method = 'load';

    const args = [file].concat(options.commands);

    if (options.start) {
      method +=  '_start';
    }

    return call(method, args, options.connection)
      .then(() => Bluebird.resolve(infoHash));
  } else {
    let method = 'load';

    if (options.raw) {
      method += '_raw';
    }

    if (options.start) {
      method +=  '_start';
    }

    const buffer = isBuffer ? Bluebird.resolve(file) : fs.readFileAsync(file);

    return buffer
      .then(buffer => {
        const { infoHash } = parseTorrent(buffer);

        const args = [
          options.raw ? buffer : path.resolve(file)
        ].concat(options.commands);

        return call(method, args, options.connection)
          .then(() => Bluebird.resolve(infoHash));
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

  toBoolean
};
