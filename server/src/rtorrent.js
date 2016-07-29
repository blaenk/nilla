'use strict';

const Bluebird = require('bluebird');

const process = require('process');
const path = require('path');
const fs = Bluebird.promisifyAll(require('fs'));

const xmlrpc = require('xmlrpc');
const scgi = require('./scgi.js');

const parseTorrent = require('parse-torrent');

const _ = require('lodash');

const rtorrent = exports = module.exports = {};

/**
 * Perform an XML-RPC request.
 *
 * @param {string} method The XML-RPC method.
 * @param {Array} [args=[]] The invocation's parameters.
 * @param {Object} [options] Optional connection options.
 * @returns {Promise} The response.
 */
rtorrent.call = function call(method, args, options) {
  args = args || [];

  options = Object.assign({
    path: process.env.RTORRENT_SOCKET,
    host: process.env.RTORRENT_HOST,
    port: process.env.RTORRENT_PORT,
  }, options);

  const client = Bluebird.promisifyAll(xmlrpc.createClient(options));

  // If a socket path was specified, infer SCGI transport.
  if (options.path) {
    return client.methodCallWithTransportAsync(scgi.Transport, method, args);
  }

  return client.methodCallAsync(method, args);
};

/**
 * Performs multiple calls in one request.
 *
 * @param {Array} calls The calls to perform.
 * @returns {Promise} The response.
 */
rtorrent.multicall = function multicall(calls) {
  return this.call('system.multicall', [calls]);
};

rtorrent._setParamsIfNotPresent = function _setParamsIfNotPresent(request) {
  if (!request.params) {
    request.params = [];
  }
};

rtorrent._prependPrefixIfNotPresent = function _prependPrefixIfNotPresent(prefix, request) {
  if (!request.methodName.startsWith(prefix)) {
    request.methodName = prefix + request.methodName;
  }
};

rtorrent._createRequestObjectIfString = function _createRequestObjectIfString(request) {
  if (_.isString(request)) {
    return { methodName: request };
  }

  return request;
};

rtorrent._normalizeRequests = function _normalizeRequests(requests, options) {
  options = Object.assign({
    prefix: '',
  }, options);

  if (!_.isArray(requests)) {
    requests = [requests];
  }

  return _.cloneDeep(requests).map(request => {
    request = this._createRequestObjectIfString(request);
    this._setParamsIfNotPresent(request);
    this._prependPrefixIfNotPresent(options.prefix, request);

    return request;
  });
};

rtorrent._transformKey = function _transformKey(request) {
  if (_.isString(request.as)) {
    return request.as;
  }

  const nameBody = /^[dfpt]\.(.+)=?$/;
  let matches = nameBody.exec(request.methodName);

  let key = request.methodName;

  if (matches.length > 1) {
    key = matches[1];
  }

  if (_.isFunction(request.as)) {
    return request.as(key);
  }

  return key;
};

rtorrent._transformValue = function _transformValue(request, result) {
  if (_.isFunction(request.map)) {
    return request.map(result);
  }

  return result;
};

rtorrent._transformMulticallResponse = function _transformMulticallResponse(itemResponse, requests) {
  let transformed = {};

  itemResponse.map((response, index) => {
    const request = requests[index];

    const key = this._transformKey(request);
    const value = this._transformValue(request, response);

    transformed[key] = value;
  });

  return transformed;
};

rtorrent._responseIsError = function _responseIsError(response, index) {
  if (response.faultCode && response.faultString) {
    response.index = index;
    return true;
  }

  return false;
};

rtorrent._rejectOnMulticallErrors = function _rejectOnMulticallErrors(responses, methods) {
  const errors = responses.filter(this._responseIsError);

  if (errors.length === 0) {
    return responses;
  }

  const augmentedErrors = errors.map(error => {
    const { methodName, params } = methods[error.index];

    delete error.index;

    return {
      methodName,
      params,
      error,
    };
  });

  return Bluebird.reject(augmentedErrors);
};

rtorrent._multicallAndTransformResponses = function _multicallAndTransformResponses(methods, requests) {
  return this.multicall(methods)
    .then(responses => this._rejectOnMulticallErrors(responses, methods))
    .then(responses => this._transformMulticallResponse(_.flatten(responses), requests));
};

rtorrent._callAndTransformResponses = function _callAndTransformResponses(multicallMethod, args, methods, requests) {
  return this.call(multicallMethod, [...args, ...methods])
    .then(responses => this._rejectOnMulticallErrors(responses, methods))
    .then(responses => responses.map(itemResponse => this._transformMulticallResponse(itemResponse, requests)));
};

rtorrent._multicallMethodsWithArgs = function _multicallMethodsWithArgs(requests, args) {
  args = args || [];

  return requests.map(request => {
    let pruned = _.pick(request, ['methodName', 'params']);
    pruned.params = [...args].concat(pruned.params);
    return pruned;
  });
};

rtorrent._callMethods = function _callMethods(requests) {
  return requests.map(request => request.methodName + '=' + request.params.join(','));
};

rtorrent._getSingle = function _getSingle(options, args, requests) {
  requests = this._normalizeRequests(requests, options);

  let methods = this._multicallMethodsWithArgs(requests, args);

  return this._multicallAndTransformResponses(methods, requests);
};

rtorrent.system = function system(requests) {
  return this._getSingle({}, [], requests);
};

// TODO
// optimize for methods is not array, in which case make a direct call?
// resource('torrent', [infoHash], 'get_name')
// invokes: call('d.get_name', infoHash)
rtorrent.torrent = function torrent(infoHash, requests) {
  return this._getSingle({ prefix: 'd.' }, [infoHash], requests);
};

rtorrent.file = function file(infoHash, fileID, requests) {
  return this._getSingle({ prefix: 'f.' }, [infoHash, fileID], requests);
};

rtorrent.tracker = function tracker(infoHash, fileID, requests) {
  return this._getSingle({ prefix: 't.' }, [infoHash, fileID], requests);
};

rtorrent.peer = function peer(infoHash, fileID, requests) {
  return this._getSingle({ prefix: 'p.' }, [infoHash, fileID], requests);
};

rtorrent._getAll = function _getAll(call, args, requests) {
  const PREFIX_LENGTH = 2;
  const prefix = call.slice(0, PREFIX_LENGTH);

  requests = this._normalizeRequests(requests, { prefix });

  let methods = this._callMethods(requests);

  return this._callAndTransformResponses(call, args, methods, requests);
};

rtorrent.torrents = function torrents(view, requests) {
  return this._getAll('d.multicall', [view], requests);
};

rtorrent.files = function files(infoHash, requests) {
  return this._getAll('f.multicall', [infoHash, 0], requests);
};

rtorrent.trackers = function trackers(infoHash, requests) {
  return this._getAll('t.multicall', [infoHash, 0], requests);
};

rtorrent.peers = function peers(infoHash, requests) {
  return this._getAll('p.multicall', [infoHash, 0], requests);
};

rtorrent.toBoolean = function toBoolean(string) {
  return string === '1';
};

/**
 * Load a torrent into rtorrent.
 *
 * @param {string} file Buffer of or path to the torrent: file path, magnet URI, HTTP URL.
 * @param {Object} options Whether to start the torrent, load it raw, commands
 * to run on-load, and connection options.
 * @returns {Promise} The response.
 */
rtorrent.load = function(file, options) {
  const isBuffer = Buffer.isBuffer(file);

  options = Object.assign({
    start: false,
    raw: isBuffer,
    commands: [],
    connection: {},
  }, options);

  if (!options.start) {
    options.commands = [
      'f.multicall=,,f.set_priority=0',
      'd.update_priorities=',
    ].concat(options.commands);
  }

  if (!isBuffer && file.startsWith('magnet:')) {
    const { infoHash } = parseTorrent(file);

    let method = 'load';

    const args = [file].concat(options.commands);

    if (options.start) {
      method += '_start';
    }

    return this.call(method, args, options.connection)
      .then(() => Bluebird.resolve(infoHash));
  }
  let method = 'load';

  if (options.raw) {
    method += '_raw';
  }

  if (options.start) {
    method += '_start';
  }

  const buffer = isBuffer ? Bluebird.resolve(file) : fs.readFileAsync(file);

  return buffer
    .then(buffer => {
      const { infoHash } = parseTorrent(buffer);

      const args = [
        options.raw ? buffer : path.resolve(file),
      ].concat(options.commands);

      return this.call(method, args, options.connection)
        .then(() => Bluebird.resolve(infoHash));
    });
};
