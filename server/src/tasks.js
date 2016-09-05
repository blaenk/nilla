'use strict';

const fs = require('fs');
const path = require('path');

const Bluebird = require('bluebird');
const moment = require('moment');
const fse = require('fs-extra');

const downloads = require('./models/downloads');
const rtorrent = require('./rtorrent');

Bluebird.promisifyAll(fs);
Bluebird.promisifyAll(fse);

// eslint-disable-next-line no-magic-numbers
const EXPIRATION_DURATION = moment.duration(2, 'weeks');

function getExpiredTorrents() {
  return downloads.getDownloads()
    .filter(download => {
      const expirationDate = moment(download.dateAdded).add(EXPIRATION_DURATION);

      return moment().isAfter(expirationDate) && download.locks.length === 0;
    });
}

function prune() {
  getExpiredTorrents()
    .then(torrents => {
      if (torrents.length === 0) {
        return;
      }

      const calls = torrents.map(torrent => {
        return {
          methodName: 'd.erase',
          params: [torrent.infoHash],
        };
      });

      return rtorrent.multicall(calls)
        .then(() => {
          for (const torrent of torrents) {
            console.log(`pruned torrent: ${torrent.name}`);
          }
        });
    })
    .catch(console.err);
}

function stale() {
  rtorrent.call('get_directory')
    .then(basePath => {
      return fs.readdirAsync(basePath)
        .map(fileName => path.join(basePath, fileName))
        .filter(filePath => {
          return fs.statAsync(filePath)
            .then(stat => stat.isDirectory() || stat.isFile())
            .catch(() => false);
        })
        .then(files => {
          return { basePath, files };
        });
    })
    .then(({ basePath, files: fileSystemDirectories }) => {
      return rtorrent.torrents('main', { methodName: 'get_name', as: 'name' })
        .map(torrent => path.join(basePath, torrent.name))
        .then(rtorrentDirectories => {
          const rtorrentSet = new Set(rtorrentDirectories);
          const staleFiles = fileSystemDirectories.filter(f => !rtorrentSet.has(f));

          return staleFiles;
        });
    })
    .then(staleFiles => staleFiles.map(file => fse.removeAsync(file).then(() => file)))
    .mapSeries((file, index, length) => {
      console.log(`${index + 1}/${length} removed stale entry: ${file}`);
    })
    .catch(console.err);
}

module.exports = {
  prune,
  stale,
};
