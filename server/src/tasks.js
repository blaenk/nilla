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

function getExpiredTorrents() {
  return downloads.getDownloads()
    .filter(download => {
      const expirationDate = moment(download.dateAdded).add(download.ttl);

      return moment().isAfter(expirationDate) && download.locks.length === 0;
    });
}

function prune() {
  console.log('Pruning …');

  getExpiredTorrents()
    .then(torrents => {
      if (torrents.length === 0) {
        return Bluebird.resolve();
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
    .then(() => console.log('Done pruning.'))
    .catch(console.error);
}

function stale() {
  console.log('Removing stale…');

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
    .then(() => console.log('Done removing stale'))
    .catch(console.error);
}

module.exports = {
  prune,
  stale,
};
