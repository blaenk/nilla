'use strict';

const path = require('path');
const fs = require('fs');

const Bluebird = require('bluebird');
const recursiveReaddir = require('recursive-readdir');
const _ = require('lodash');

const rtorrent = require('../rtorrent');

Bluebird.promisifyAll(path);
Bluebird.promisifyAll(fs);

const recursiveReaddirAsync = Bluebird.promisify(recursiveReaddir);

/**
 * Decodes an integer-encoded ratio e.g. 750 to a floating-point ratio e.g.
 * 0.75.
 *
 * @param {Number} ratio The integer-encoded ratio.
 * @returns {String} The floating-point ratio.
 */
function decodeRatio(ratio) {
  const FULL_RATIO = 1000;
  const fraction = ratio / FULL_RATIO;

  const TWO_DECIMAL_PLACES = 2;

  return fraction.toFixed(TWO_DECIMAL_PLACES);
}

const PROGRESS_COMPLETE = 100;

function getProgress(completed, totalSize) {
  if (totalSize !== 0) {
    const fractionComplete = completed / totalSize;
    const percentageComplete = fractionComplete * PROGRESS_COMPLETE;

    return Math.trunc(percentageComplete);
  }

  return 0;
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
  }

  return 'seeding';
}

function onLoadSetUploader(uploader) {
  return 'd.custom.set=nilla-uploader,' + uploader;
}

function serializeLocks(locks) {
  return JSON.stringify(locks);
}

function deserializeLocks(locks) {
  if (locks === '') {
    return [];
  }

  return JSON.parse(locks);
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

  {
    methodName: 'get_custom',
    params: ['nilla-uploader'],
    as: 'uploader',
  },
  {
    methodName: 'get_custom',
    params: ['nilla-locks'],
    as: 'locks',
    map: deserializeLocks,
  },
  {
    methodName: 'get_custom',
    params: ['nilla-date-added'],
    as: 'dateAdded',
    map: data => new Date(data),
  },
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

function toHumanPriority(priority) {
  switch (priority) {
    case '0': return 'off';
    case '1': return 'normal';
    case '2': return 'high';
    default: throw new Error('unknown priority');
  }
}

const FILE_METHODS = [
  { methodName: 'get_path_components', as: 'pathComponents' },
  {
    methodName: 'get_priority',
    as: 'priority',
    map: toHumanPriority,
  },
  { methodName: 'get_completed_chunks', as: 'completedChunks', map: parseInt },
  { methodName: 'get_size_chunks', as: 'sizeChunks', map: parseInt },
  { methodName: 'get_size_bytes', as: 'size', map: parseInt },
];

function getFiles(infoHash) {
  return rtorrent.files(infoHash, FILE_METHODS)
    .then(files => {
      return files.map((file, index) => {
        file.id = index;
        file.progress = getProgress(file.completedChunks, file.sizeChunks);
        file.isEnabled = file.priority !== 'off';

        // Some torrents start file paths with a leading slash, /Some/File.txt
        // This seems to cause rtorrent's get_path_components to split it as
        // ["", "Some","File.txt"] which causes issues on the client FileTree
        // Ultimately such a split joins to the same path so it's fine to simply
        // remove the first component in this case.
        if (file.pathComponents[0] === '') {
          file.pathComponents.shift();
        }

        return file;
      });
    });
}

function fileExists(path) {
  return fs.statAsync(path).then(() => true).catch(() => false);
}

function getExtractedFiles(infoHash) {
  return rtorrent.system([
    { methodName: 'get_directory', params: [], as: 'basePath' },
    { methodName: 'd.get_name', params: [infoHash], as: 'name' },
    {
      methodName: 'd.is_multi_file',
      params: [infoHash],
      as: 'isMultiFile',
      map: rtorrent.toBoolean,
    },
  ]).then(result => {
    const { basePath, name, isMultiFile } = result;

    const directory = path.join(basePath, name);
    const extractDirectory = path.join(directory, 'extract');

    return Bluebird.props({
      directory,
      extractDirectory,
      isMultiFile,
      extractDirectoryExists: fileExists(extractDirectory),
      isExtracting: fileExists(path.join(directory, '.extracting')),
    });
  }).then(obj => {
    if (!(obj.extractDirectoryExists && obj.isMultiFile)) {
      return Bluebird.resolve([]);
    }

    return recursiveReaddirAsync(obj.extractDirectory)
      .map((file, index) => {
        return fs.statAsync(file).then(stats => {
          const relativePath = path.relative(obj.directory, file);
          const pathComponents = relativePath.split(path.sep);

          return {
            id: index,
            pathComponents,
            size: stats.size,
            progress: obj.isExtracting ? 0 : PROGRESS_COMPLETE,
            isEnabled: true,
          };
        });
      });
  });
}

function getAllFiles(infoHash) {
  return Bluebird.props({
    downloaded: getFiles(infoHash),
    extracted: getExtractedFiles(infoHash),
  });
}

function getTrackers(infoHash) {
  return rtorrent.trackers(infoHash, { methodName: 'get_url', as: 'url' })
    .map(({ url }) => url);
}

function getCompleteDownload(infoHash) {
  return Bluebird.join(
    getDownload(infoHash),
    getAllFiles(infoHash),
    getTrackers(infoHash),
    (download, files, trackers) => {
      download.files = files;
      download.trackers = trackers;

      return download;
    });
}

function setFilePriorities(infoHash, priorities) {
  const priorityCalls = _.keys(priorities).map(fileId => {
    const target = `${infoHash}:f${fileId}`;
    const priority = priorities[fileId] ? 1 : 0;

    return {
      methodName: 'f.set_priority',
      params: [target, priority],
    };
  });

  const request = priorityCalls.concat([{
    methodName: 'd.update_priorities',
    params: [infoHash],
  }]);

  return rtorrent.multicall(request);
}

function getLocks(infoHash) {
  return rtorrent.torrent(
    infoHash, {
      methodName: 'get_custom',
      params: ['nilla-locks'],
      as: 'locks',
      map: deserializeLocks,
    }).get('locks');
}

function setLocks(infoHash, locks) {
  const serialized = serializeLocks(locks);

  return rtorrent.torrent(infoHash, {
    methodName: 'set_custom',
    params: ['nilla-locks', serialized],
  });
}

function addLock(infoHash, userID) {
  return getLocks(infoHash)
    .then(locks => {
      if (!locks.includes(userID)) {
        locks.push(userID);

        return setLocks(infoHash, locks);
      }

      return Bluebird.resolve();
    });
}

function removeLock(infoHash, userID) {
  return getLocks(infoHash)
    .then(locks => {
      const index = locks.indexOf(userID);

      if (index !== -1) {
        locks.splice(index, 1);

        return setLocks(infoHash, locks);
      }

      return Bluebird.resolve();
    });
}

module.exports = {
  onLoadSetUploader,
  getDownload,
  getCompleteDownload,
  getDownloads,
  getFiles,
  getExtractedFiles,
  getAllFiles,
  decodeRatio,
  setFilePriorities,
  addLock,
  removeLock,
};
