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

function setParamsIfNotPresent(request) {
  if (!request.params) {
    request.params = [];
  }
}

function prependPrefixIfNotPresent(prefix, request) {
  if (!request.methodName.startsWith(prefix)) {
    request.methodName = prefix + request.methodName;
  }
}

function createRequestObjectIfString(request) {
  if (_.isString(request)) {
    return {methodName: request};
  } else {
    return request;
  }
}

function normalizeRequests(requests, options) {
  options = Object.assign({
    prefix: ''
  }, options);

  if (!_.isArray(requests)) {
    requests = [requests];
  }

  return _.cloneDeep(requests).map(request => {
    request = createRequestObjectIfString(request);
    setParamsIfNotPresent(request);
    prependPrefixIfNotPresent(options.prefix, request);

    return request;
  });
}

function transformKey(request) {
  if (_.isString(request.as)) {
    return request.as;
  }  else {
    const nameBody = /^[dfpt]\.(.+)=?$/;
    let key = nameBody.exec(request.methodName)[1];

    if (_.isFunction(request.as)) {
      return request.as(key);
    } else {
      return key;
    }
  }
}

function transformValue(request, result) {
  if (_.isFunction(request.map)) {
    return request.map(result);
  } else {
    return result;
  }
}

function transformMulticallResponse(itemResponse, requests) {
  let transformed = {};

  itemResponse.map((response, index) => {
    const request = requests[index];

    const key = transformKey(request);
    const value = transformValue(request, response);

    transformed[key] = value;
  });

  return transformed;
}

function responseIsError(response, index) {
  if (response.faultCode && response.faultString) {
    response.index = index;
    return true;
  } else {
    return false;
  }
}

function rejectOnMulticallErrors(responses, methods) {
  const errors = responses.filter(responseIsError);

  if (errors.length == 0) {
    return responses;
  }

  const augmentedErrors = errors.map(error => {
    const { methodName, params } = methods[error.index];

    delete error.index;

    return {
      methodName,
      params,
      error
    };
  });

  return Bluebird.reject(augmentedErrors);
}

function multicallAndTransformResponses(methods, requests) {
  return multicall(methods)
    .then(responses => rejectOnMulticallErrors(responses, methods))
    .then(responses => transformMulticallResponse(_.flatten(responses), requests));
}

function callAndTransformResponses(multicallMethod, args, methods, requests) {
  return call(multicallMethod, [...args, ...methods])
    .then(responses => rejectOnMulticallErrors(responses, methods))
    .then(responses => responses.map(itemResponse => transformMulticallResponse(itemResponse, requests)));
}

function multicallMethodsWithArgs(requests, args) {
  args = args || [];

  return requests.map(request => {
    let pruned = _.pick(request, ['methodName', 'params']);
    pruned.params = [...args].concat(pruned.params);
    return pruned;
  });
}

function callMethods(requests) {
  return requests.map(request => request.methodName + '=' + request.params.join(','));
}

function system(requests) {
  requests = normalizeRequests(requests);

  let methods = multicallMethodsWithArgs(requests);

  return multicallAndTransformResponses(methods, requests);
}

// TODO
// optimize for methods is not array, in which case make a direct call?
// resource('torrent', [infoHash], 'get_name')
// invokes: call('d.get_name', infoHash)
function torrent(infoHash, requests) {
  requests = normalizeRequests(requests, { prefix: 'd.' });

  let methods = multicallMethodsWithArgs(requests, [infoHash]);

  return multicallAndTransformResponses(methods, requests);
}

function file(infoHash, fileID, requests) {
  requests = normalizeRequests(requests, { prefix: 'f.' });

  let methods = multicallMethodsWithArgs(requests, [infoHash, fileID]);

  return multicallAndTransformResponses(methods, requests);
}

function torrents(view, requests) {
  requests = normalizeRequests(requests, { prefix: 'd.' });

  let methods = callMethods(requests);

  return callAndTransformResponses('d.multicall', [view], methods, requests);
}

function files(infoHash, requests) {
  requests = normalizeRequests(requests, { prefix: 'f.' });

  let methods = callMethods(requests);

  return callAndTransformResponses('f.multicall', [infoHash, 0], methods, requests);
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
