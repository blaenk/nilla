'use strict';

const rtorrent = require('../rtorrent');
const Bluebird = require('bluebird');

const recursiveReaddirAsync = Bluebird.promisify(require('recursive-readdir'));
const path = Bluebird.promisifyAll(require('path'));
const fs = Bluebird.promisifyAll(require('fs'));

/**
 * Decodes an integer-encoded ratio e.g. 750 to a floating-point ratio e.g.
 * 0.75.
 *
 * @param {number} ratio The integer-encoded ratio.
 * @returns {number} The floating-point ratio.
 */
function decodeRatio(ratio) {
  return (ratio / 1000).toFixed(2);
}

function decodeBase64(string) {
  return new Buffer(string, 'base64').toString('ascii');
}

function getProgress(completed, totalSize) {
  if (totalSize != 0) {
    const fractionComplete = completed / totalSize;
    const percentageComplete = fractionComplete * 100;

    return percentageComplete.toFixed(2);
  } else {
    return '0.00';
  }
}

function getState(torrent) {
  if (torrent.isHashChecking) {
    return 'hashing';
  } else if (!torrent.isOpen) {
    return 'closed';
  } else if (!torrent.isActive) {
    return 'stopped';
  } else if (!torrent.isComplete) {
    return 'downloading';
  } else {
    return 'seeding';
  }
}

const DOWNLOADS_METHODS = [
  { method: 'get_hash', as: 'infoHash', map: hash => hash.toLowerCase() },
  { method: 'get_name', as: 'name' },
  { method: 'get_complete', as: 'isComplete', map: rtorrent.toBoolean },
  { method: 'get_ratio', as: 'ratio', map: decodeRatio },
  { method: 'get_message', as: 'message' },

  { method: 'is_multi_file', as: 'isMultiFile', map: rtorrent.toBoolean },
  { method: 'is_hash_checking', as: 'isHashChecking', map: rtorrent.toBoolean },
  { method: 'is_active', as: 'isActive', map: rtorrent.toBoolean },
  { method: 'is_open', as: 'isOpen', map: rtorrent.toBoolean },

  { method: 'get_size_bytes', as: 'sizeBytes', map: parseInt },
  { method: 'get_completed_bytes', as: 'completedBytes', map: parseInt },

  { method: 'get_peers_accounted', as: 'leeches', map: parseInt },
  { method: 'get_peers_complete', as: 'seeders', map: parseInt },

  { method: 'get_up_rate', as: 'uploadRate', map: parseInt },
  { method: 'get_down_rate', as: 'downloadRate', map: parseInt },

  { method: 'get_up_total', as: 'totalUploaded', map: parseInt },

  { method: 'get_custom=levee-uploader', as: 'uploader', map: decodeBase64 },
  {
    method: 'get_custom=levee-locks',
    as: 'locks',
    map: data => JSON.parse(decodeBase64(data))
  },
  {
    method: 'get_custom=levee-date-added',
    as: 'dateAdded',
    map: data => new Date(decodeBase64(data))
  }
];

function getDownloads() {
  return rtorrent.torrents('main', DOWNLOADS_METHODS)
    .then(torrents => {
      return torrents.map(torrent => {
        torrent.state = getState(torrent);
        torrent.progress = getProgress(torrent.completedBytes, torrent.sizeBytes);
        return torrent;
      });
    });
}

const FILE_METHODS = [
  { method: 'get_path', as: 'path' },
  { method: 'get_path_components', as: 'pathComponents' },
  {
    method: 'get_priority',
    as: 'priority',
    map: priority => {
      switch (priority) {
        case '0': return 'off';
        case '1': return 'normal';
        case '2': return 'high';
        default: throw new Error('unknown priority');
      }
    }
  },
  { method: 'get_completed_chunks', as: 'completedChunks' },
  { method: 'get_size_chunks', as: 'sizeChunks' },
  { method: 'get_size_bytes', as: 'size' }
];

function getFiles(infoHash) {
  return rtorrent.files(infoHash, FILE_METHODS)
    .then(files => {
      return files.map(file => {
        file.progress = getProgress(file.completedChunks, file.sizeChunks);
        file.name = file.pathComponents[file.pathComponents.length - 1];
        return file;
      });
    });
}

function getExtractedFiles(infoHash) {
  return rtorrent.multicall([
    {methodName: 'get_directory', params: []},
    {methodName: 'd.get_name', params: [infoHash]},
    {methodName: 'd.is_multi_file', params: [infoHash]}
  ]).then(results => {
    const [[basePath], [name], [isMultiFile]] = results;

    const directory = path.join(basePath, name);
    const extractDirectory = path.join(directory, 'extract');

    return {
      directory,
      extractDirectory,
      isMultiFile: isMultiFile == '1'
    };
  }).then(obj => {
    return fs.statAsync(path.join(obj.directory, '.extracting'))
      .then(_stats => {
        obj.isExtracting = true;
        return obj;
      })
      .catch(_error => {
        obj.isExtracting = false;
        return obj;
      });
  }).then(obj => {
    return fs.statAsync(obj.extractDirectory)
      .then(_stats => {
        obj.extractDirectoryExists = true;
        return obj;
      })
      .catch(_error => {
        obj.extractDirectoryExists = false;
        return obj;
      });
  }).then(obj => {
    if (obj.extractDirectoryExists && obj.isMultiFile) {
      return recursiveReaddirAsync(obj.extractDirectory)
        .map(file => {
          return fs.statAsync(file).then(stats => {
            const relativePath = path.relative(obj.extractDirectory, file);
            const pathComponents = relativePath.split(path.sep);

            return {
              path: relativePath,
              pathComponents: pathComponents,
              name: pathComponents[pathComponents.length - 1],
              size: stats.size,
              progress: obj.isExtracting ? 0 : 100,
              enabled: true
            };
          });
        });
    } else {
      return Bluebird.resolve([]);
    }
  });
}

module.exports = {
  getDownloads,
  getFiles,
  getExtractedFiles,
  decodeRatio
};
