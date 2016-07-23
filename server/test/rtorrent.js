'use strict';

const Bluebird = require('bluebird');
const semver = require('semver');

const rtorrent = require('../src/rtorrent.js');

const torrents = require('./fixtures/torrents.json');

describe('RTorrent', function() {
  before('should ensure a connection', function() {
    // TODO
    // should perform some isolation?
    //
    // * session.path.set to set the session directory?
    // * directory.default.set to set download dir?

    return rtorrent.call('system.client_version')
      .then(function(version) {
        expect(version).to.satisfy(version => semver.gt(version, '0.9.0'));
      })
      .then(() => Bluebird.all([
        expect(rtorrent.load(torrents.ubuntu.path, { raw: true }))
          .to.eventually.equal(torrents.ubuntu.hash),

        expect(rtorrent.load(torrents.arch.path))
          .to.eventually.equal(torrents.arch.hash)
      ]));
  });

  context('manipulate torrents', function() {
    it('read the name', function() {
      return expect(rtorrent.torrent(torrents.ubuntu.hash, 'get_name'))
        .to.eventually.become({ get_name: torrents.ubuntu.name });
    });

    it('read the file size', function() {
      return expect(rtorrent.torrent(torrents.ubuntu.hash, 'get_size_bytes'))
        .to.eventually.become({ get_size_bytes: torrents.ubuntu.size });
    });

    context('manage file properties', function() {
      it('set a file priority to 0');
    });

    context('set custom metadata', function() {
      it('should set "name" to "bob"');
      it('should read "name" as "bob"');
    });
  });

  context('multicalls', function() {
    it('should get the name and size simultaneously', function() {
      return expect(rtorrent.multicall([
        {methodName: 'd.get_name', params: [torrents.ubuntu.hash]},
        {methodName: 'd.get_size_bytes', params: [torrents.ubuntu.hash]}
      ])).to.become([
        [torrents.ubuntu.name],
        [torrents.ubuntu.size]
      ]);
    });

    it('should use a helper to get the name and size simultaneously', function() {
      return expect(rtorrent.torrent(torrents.ubuntu.hash, [
        { methodName: 'get_name', as: 'name' },
        { methodName: 'get_size_bytes', as: 'sizeBytes' }
      ])).to.become({
        name: torrents.ubuntu.name,
        sizeBytes: torrents.ubuntu.size
      });
    });

    it('should support system multicalls', function() {
      return expect(rtorrent.system([
        {methodName: 'get_directory', as: 'baseDirectory'},
        {methodName: 'd.get_name', params: [torrents.ubuntu.hash], as: 'name'},
        {
          methodName: 'd.get_complete',
          params: [torrents.ubuntu.hash],
          as: 'isComplete', map: rtorrent.toBoolean
        }
      ])).to.become({
        baseDirectory: process.env.RTORRENT_DOWNLOADS_DIRECTORY,
        name: torrents.ubuntu.name,
        isComplete: false
      });
    });
  });

  context('helpers', function() {
    it('should make a torrent multicall', function() {
      return expect(rtorrent.torrents(
        'main', [
          { methodName: 'get_name', as: 'name' },
          {
            methodName: 'get_completed_bytes',
            map: parseInt,
            as: 'completedBytes'
          }
        ]
      )).to.become([
        {
          name: '01000E92D5C8CF2473E5978B445DE9624C04D11A.meta',
          completedBytes: 0
        },
        {
          name: 'ubuntu-16.04-desktop-amd64.iso',
          completedBytes: 0
        }
      ]);
    });
  });

  after('remove torrents', function() {
    return Bluebird.map([
      torrents.ubuntu.hash,
      torrents.arch.hash
    ], hash => rtorrent.torrent(hash, 'erase'));
  });
});

// NOTE
//
// * Inserting metadata on download insertion creates the potential for rtorrent
//   crashing. It seems like if a torrent is added and removed and the same is
//   repeated in quick succession, a race condition (?) can occur which crashes
//   rtorrent.
//
// * Adding a torrent by file to rtorrent saves information about it in a cache,
//   in particular the file's path and mtime.
//
//   see src/core/manager.cc Manager::try_create_download()
//
//   The implication of this is that an added file can't be re-added unless
//   rtorrent is restarted. There's a command for pruning this "cache" but an
//   entry is only pruned if the .torrent file no longer exists or the file's
//   mtime is newer than that recorded in the cache.
//
//   see src/utils/file_status_cache.cc FileStatusCache::prune()
//
//   The command is: system.file_status_cache.prune
//   There's also: system.file_status_cache.size
//
//   Finally there's also a built-in scheduled job which runs the prune command
//   daily beginning an hour after rtorrent is launched.
