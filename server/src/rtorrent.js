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
 * Performs multiple calls in one request.
 *
 * @param {Array} calls The calls to perform.
 * @returns {Promise} The response.
 */
function multicall(calls) {
  return call('system.multicall', [calls]);
}

function setParamsIfNotPresent(method) {
  if (!method.params) {
    method.params = [];
  }
}

function prependPrefixIfNotPresent(prefix, method) {
  if (!method.methodName.startsWith(prefix)) {
    method.methodName = prefix + method.methodName;
  }
}

function appendEqualsIfNotPresent(method) {
  if (!method.methodName.includes('=')) {
    method.methodName += '=';
  }
}

function formatParamsForMulticall(method) {
  if (method.params.length > 0) {
    method.methodName += method.params.join(',');
  }
}

function normalizeMethods(methods, options) {
  options = Object.assign({
    isMulticall: false,
    prefix: ''
  }, options);

  return _.cloneDeep(methods).map(method => {
    setParamsIfNotPresent(method);
    prependPrefixIfNotPresent(options.prefix, method);

    if (options.isMulticall) {
      appendEqualsIfNotPresent(method);
      formatParamsForMulticall(method);
    }

    return method;
  });
}

function transformKey(options) {
  if (_.isString(options.as)) {
    return options.as;
  }  else {
    const nameBody = /^[dfpt]\.(.+)=?$/;
    let key = nameBody.exec(options.methodName)[1];

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

function transformMulticallResult(itemResult, methods) {
  let transformed = {};

  itemResult.map((methodResult, index) => {
    const options = methods[index];

    const key = transformKey(options);
    const value = transformValue(options, methodResult);

    transformed[key] = value;
  });

  return transformed;
}

function system(methods) {
  methods = normalizeMethods(methods);

  let callMethods = methods.map(method => {
    let pruned = _.pick(method, ['methodName', 'params']);
    return pruned;
  });

  return multicall(callMethods)
    .then(results => {
      let flattened = results.reduce((acc, cur) => acc.concat(cur));
      return transformMulticallResult(flattened, methods);
    });
}

// TODO
// optimize for methods is not array, in which case make a direct call?
// resource('torrent', [infoHash], 'get_name')
// invokes: call('d.get_name', infoHash)
function torrent(infoHash, methods) {
  methods = normalizeMethods(methods, { prefix: 'd.' });

  let callMethods = methods.map(method => {
    let pruned = _.pick(method, ['methodName', 'params']);
    pruned.params = [infoHash].concat(pruned.params);
    return pruned;
  });

  return multicall(callMethods)
    .then(results => {
      let flattened = results.reduce((acc, cur) => acc.concat(cur));
      return transformMulticallResult(flattened, methods);
    });
}

function file(infoHash, fileID, methods) {
  methods = normalizeMethods(methods, { prefix: 'f.' });

  let callMethods = methods.map(method => {
    let pruned = _.pick(method, ['methodName', 'params']);
    pruned.params = [infoHash, fileID].concat(pruned.params);
    return pruned;
  });

  return multicall(callMethods)
    .then(results => {
      let flattened = results.reduce((acc, cur) => acc.concat(cur));
      return transformMulticallResult(flattened, methods);
    });
}

function torrents(view, methods) {
  methods = normalizeMethods(methods, { prefix: 'd.', isMulticall: true });

  let callMethods = methods.map(method => method.methodName);

  // in:  d.multicall ['main', 'd.get_name=', 'd.get_ratio=']
  // out: [[hash1, ratio1], [hash2, ratio2]]
  return call('d.multicall', [view, ...callMethods])
    .then(results => results.map(itemResult => transformMulticallResult(itemResult, methods)));
}

function files(infoHash, methods) {
  methods = normalizeMethods(methods, { prefix: 'f.', isMulticall: true });

  let callMethods = methods.map(method => method.methodName);

  return call('f.multicall', [infoHash, 0, ...callMethods])
    .then(results => results.map(itemResult => transformMulticallResult(itemResult, methods)));
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

  system,

  torrent,
  torrents,

  file,
  files,

  load,

  toBoolean
};
