'use strict';

const rtorrent = require('../rtorrent');

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

function getProgress(torrent) {
  if (torrent.sizeBytes != 0) {
    const fractionComplete = torrent.completedBytes / torrent.sizeBytes;
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

function getAll() {
  return rtorrent.torrents('main', DOWNLOADS_METHODS)
    .then(torrents => {
      return torrents.map(torrent => {
        torrent.state = getState(torrent);
        torrent.progress = getProgress(torrent);
        return torrent;
      });
    });
}

module.exports = {
  getAll,
  decodeRatio
};
