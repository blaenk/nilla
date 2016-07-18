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
  return call('system.multicall', [calls]);
}

function createMethodObject(methods, index) {
  if (_.isString(methods[index])) {
    methods[index] = { method: methods[index] };
  }
}

function prependPrefixIfNotPresent(prefix, methods, index) {
  const namespace = prefix + '.';

  if (!methods[index].method.startsWith(namespace)) {
    methods[index].method = namespace + methods[index].method;
  }
}

function appendEqualsIfNotPresent(methods, index) {
  if (!methods[index].method.includes('=')) {
    methods[index].method += '=';
  }
}

function normalizeMethods(prefix, isMulticall, methods) {
  for (let i = 0; i < methods.length; i++) {
    createMethodObject(methods, i);
    prependPrefixIfNotPresent(prefix, methods, i);

    if (isMulticall) {
      appendEqualsIfNotPresent(methods, i);
    }
  }
}

function torrentCall(infoHash, methods) {
  return multicall(methods.map(method => {
    return {
      methodName: method,
      params: [infoHash]
    };
  }));
}

// in:  d.multicall ['main', 'd.get_name=', 'd.get_ratio=']
// out: [[hash1, ratio1], [hash2, ratio2]]
function torrentMulticall(view, methods) {
  return call('d.multicall', [view, ...methods]);
}

function fileMulticall(infoHash, methods) {
  return call('f.multicall', [infoHash, 0, ...methods]);
}

function transformKey(options) {
  if (_.isString(options.as)) {
    return options.as;
  }  else {
    const nameBody = /^[dfpt]\.(.+)=?$/;
    let key = nameBody.exec(options.method)[1];

    if (_.isFunction(options.as)) {
      return options.as(key);
    } else {
      return key;
    }
  }
}

function transformValue(options, result) {
  if (_.isFunction(options.map)) {
    return options.map(result);
  } else {
    return result;
  }
}

const resources = {
  torrent: {
    prefix: 'd',
    method: torrentCall
  },
  torrents: {
    prefix: 'd',
    method: torrentMulticall
  },
  files: {
    prefix: 'f',
    method: fileMulticall
  }
};

function transformMulticallResult(itemResult, methods) {
  let transformed = {};

  itemResult.map((methodResult, index) => {
    const options = methods[index];

    const key = transformKey(options);

    let mapped = transformValue(options, methodResult);

    transformed[key] = mapped;
  });

  return transformed;
}

// TODO
// optimize for methods is not array, in which case make a direct call?
// resource('torrent', [infoHash], 'get_name')
// invokes: call('d.get_name', infoHash)
function resource(target, args, methods) {
  const resource = resources[target];
  const isMulticall = target.endsWith('s');

  normalizeMethods(resource.prefix, isMulticall, methods);

  return resource.method(...args, methods.map(method => method.method))
    .then(results => {
      // If we're performing a system multicall, fake this response as if it
      // were a regular multicall with a single result, i.e. go from:
      //
      // system multicall result: [[name], [size]]
      // regular multicall result: [[name, size]]
      if (!isMulticall) {
        results = [results.reduce((acc, cur) => acc.concat(cur))];
      }

      const ret = results.map(itemResult => {
        return transformMulticallResult(itemResult, methods);
      });

      // If we're performing a system multicall, the result should be a single
      // object not an array of a single object.
      return isMulticall ? ret : ret[0];
    });
}

function torrent(infoHash, methods) {
  return resource('torrent', [infoHash], methods);
}

function torrents(view, methods) {
  return resource('torrents', [view], methods);
}

// Same signatures for trackers and peers.
function file(infoHash, fileID, methods) {
  return resource('file', [infoHash, fileID], methods);
}

function files(infoHash, methods) {
  return resource('files', [infoHash, 0], methods);
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
