'use strict';

const Bluebird = require('bluebird');
const semver = require('semver');
const path = require('path');

const rtorrent = require('../src/rtorrent.js');

const torrents = {
  arch: {
    path: 'magnet:?xt=urn:btih:01000e92d5c8cf2473e5978b445de9624c04d11a&dn=archlinux-2016.06.01-dual.iso&tr=udp://tracker.archlinux.org:6969',
    hash: '01000e92d5c8cf2473e5978b445de9624c04d11a'
  },
  ubuntu: {
    name: 'ubuntu-16.04-desktop-amd64.iso',
    size: '1485881344',
    path: './test/fixtures/ubuntu-16.04-desktop-amd64.iso.torrent',
    hash: '4344503b7e797ebf31582327a5baae35b11bda01'
  },
  fedora: {
    path: './test/fixtures/Fedora-Live-Workstation-x86_64-23.torrent',
    hash: '796ab93bb81e2dbe072f3c07857675ee5c47b046'
  }
};

describe('RTorrent', function() {
  before("should ensure a connection", function() {
    // TODO
    // should perform some isolation?
    //
    // * session.path.set to set the session directory?
    // * directory.default.set to set download dir?

    return rtorrent.call("system.client_version")
        .then(function(version) {
          if (semver.gt(version, "0.9.0")) {
            return Bluebird.resolve();
          } else {
            return Bluebird.reject(
              `RTorrent ${version}, but > 0.9.0 required.`
            );
          }
        })
        .then(() => Bluebird.all([
          rtorrent.load(torrents.ubuntu.path, {raw: true})
            .should.eventually.equal(torrents.ubuntu.hash),

          rtorrent.load(torrents.arch.path)
            .should.eventually.equal(torrents.arch.hash)
        ]));
  });

  context('manipulate torrents', function() {
    it('read the name', function() {
      return rtorrent.torrent(torrents.ubuntu.hash, ['get_name']).
        should.eventually.become({ 'get_name': torrents.ubuntu.name });
    });

    it('read the file size', function() {
      return rtorrent.torrent(torrents.ubuntu.hash, ['get_size_bytes']).
        should.eventually.become({ 'get_size_bytes': torrents.ubuntu.size });
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
      return rtorrent.multicall([
        {methodName: "d.get_name", params: [torrents.ubuntu.hash]},
        {methodName: "d.get_size_bytes", params: [torrents.ubuntu.hash]}
      ]).should.become([
        [torrents.ubuntu.name],
        [torrents.ubuntu.size]
      ]);
    });

    it('should use a helper to get the name and size simultaneously', function() {
      return rtorrent.torrent(torrents.ubuntu.hash, [
        { method: 'get_name', as: 'name' },
        { method: 'get_size_bytes', as: 'sizeBytes' }
      ]).should.become({
        'name': torrents.ubuntu.name,
        'sizeBytes': torrents.ubuntu.size
      });
    });

    it('should support system multicalls', function() {
      return rtorrent.system([
        {methodName: 'get_directory', as: 'baseDirectory'},
        {methodName: 'd.get_name', params: [torrents.ubuntu.hash], as: 'name'},
        {methodName: 'd.get_complete', params: [torrents.ubuntu.hash], as: 'isComplete', map: rtorrent.toBoolean }
      ]).should.become({
        baseDirectory: process.env.RTORRENT_DOWNLOADS_DIRECTORY,
        name: torrents.ubuntu.name,
        isComplete: false
      });
    });
  });

  context('helpers', function() {
    it("should make a torrent multicall", function() {
      return rtorrent.torrents(
        'main', [
          { method: 'get_name', as: 'name' },
          {
            method: 'get_completed_bytes',
            map: parseInt,
            as: 'completedBytes'
          }
        ]
      ).should.become([
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
    ], hash => rtorrent.torrent(hash, ["erase"]));
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
