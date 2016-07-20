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
 * @param {Number} ratio The integer-encoded ratio.
 * @returns {String} The floating-point ratio.
 */
function decodeRatio(ratio) {
  return (ratio / 1000).toFixed(2);
}

function encodeBase64(string) {
  return new Buffer(string).toString('base64');
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

function onLoadSetUploader(uploader) {
  return "d.custom.set=levee-uploader," + encodeBase64(uploader);
}

const DOWNLOADS_METHODS = [
  { methodName: 'get_hash', as: 'infoHash', map: hash => hash.toLowerCase() },
  { methodName: 'get_name', as: 'name' },
  { methodName: 'get_complete', as: 'isComplete', map: rtorrent.toBoolean },
  { methodName: 'get_ratio', as: 'ratio', map: decodeRatio },
  { methodName: 'get_message', as: 'message' },

  { methodName: 'is_multi_file', as: 'isMultiFile', map: rtorrent.toBoolean },
  { methodName: 'is_hash_checking', as: 'isHashChecking', map: rtorrent.toBoolean },
  { methodName: 'is_active', as: 'isActive', map: rtorrent.toBoolean },
  { methodName: 'is_open', as: 'isOpen', map: rtorrent.toBoolean },

  { methodName: 'get_size_bytes', as: 'sizeBytes', map: parseInt },
  { methodName: 'get_completed_bytes', as: 'completedBytes', map: parseInt },

  { methodName: 'get_peers_accounted', as: 'leeches', map: parseInt },
  { methodName: 'get_peers_complete', as: 'seeders', map: parseInt },

  { methodName: 'get_up_rate', as: 'uploadRate', map: parseInt },
  { methodName: 'get_down_rate', as: 'downloadRate', map: parseInt },

  { methodName: 'get_up_total', as: 'totalUploaded', map: parseInt },

  { methodName: 'get_custom', params: ['levee-uploader'], as: 'uploader', map: decodeBase64 },
  {
    methodName: 'get_custom',
    params: ['levee-locks'],
    as: 'locks',
    map: data => JSON.parse(decodeBase64(data))
  },
  {
    methodName: 'get_custom',
    params: ['levee-date-added'],
    as: 'dateAdded',
    map: data => new Date(decodeBase64(data))
  }
];

function getDownload(infoHash) {
  return rtorrent.torrent(infoHash, DOWNLOADS_METHODS)
    .then(torrent => {
      torrent.state = getState(torrent);
      torrent.progress = getProgress(torrent.completedBytes, torrent.sizeBytes);
      return torrent;
    });
}

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
  { methodName: 'get_path', as: 'path' },
  { methodName: 'get_path_components', as: 'pathComponents' },
  {
    methodName: 'get_priority',
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
  { methodName: 'get_completed_chunks', as: 'completedChunks' },
  { methodName: 'get_size_chunks', as: 'sizeChunks' },
  { methodName: 'get_size_bytes', as: 'size' }
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

function fileExists(path) {
  return fs.statAsync(path).then(() => true).catch(() => false);
}

function getExtractedFiles(infoHash) {
  return rtorrent.system([
    {methodName: 'get_directory', params: [], as: 'basePath'},
    {methodName: 'd.get_name', params: [infoHash], as: 'name'},
    {
      methodName: 'd.is_multi_file',
      params: [infoHash],
      as: 'isMultiFile',
      map: rtorrent.toBoolean
    }
  ]).then(result => {
    const { basePath, name, isMultiFile } = result;

    const directory = path.join(basePath, name);
    const extractDirectory = path.join(directory, 'extract');

    return Bluebird.props({
      directory,
      extractDirectory,
      isMultiFile,
      extractDirectoryExists: fileExists(extractDirectory),
      isExtracting: fileExists(path.join(directory, '.extracting'))
    });
  }).then(obj => {
    if (!(obj.extractDirectoryExists && obj.isMultiFile)) {
      return Bluebird.resolve([]);
    }

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
  });
}

module.exports = {
  onLoadSetUploader,
  getDownload,
  getDownloads,
  getFiles,
  getExtractedFiles,
  decodeRatio
};
