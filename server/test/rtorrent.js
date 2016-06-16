'use strict';

const Bluebird = require('bluebird');
const semver   = require('semver');

const rtorrent = require('../src/rtorrent.js');

const torrents = {
  arch: {
    path: 'magnet:?xt=urn:btih:01000e92d5c8cf2473e5978b445de9624c04d11a&dn=archlinux-2016.06.01-dual.iso&tr=udp://tracker.archlinux.org:6969',
    hash: '01000e92d5c8cf2473e5978b445de9624c04d11a'
  },
  ubuntu: {
    name: 'ubuntu-16.04-desktop-amd64.iso',
    size: '1485881344',
    path: './server/test/fixtures/ubuntu-16.04-desktop-amd64.iso.torrent',
    hash: '4344503b7e797ebf31582327a5baae35b11bda01'
  },
  fedora: {
    path: './server/test/fixtures/Fedora-Live-Workstation-x86_64-23.torrent',
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

  context.skip('add and remove torrents', function() {
    it('add a torrent from a file', function() {
      return rtorrent.loadFile(torrents.fedora.path)
        .should.eventually.equal(torrents.fedora.hash);
    });

    it('add a torrent from a magnet link', function() {
      return rtorrent.loadMagnet(torrents.arch.path)
        .should.eventually.equal(torrents.arch.hash);
    });
  });

  context('manipulate torrents', function() {
    it('read the name', function() {
      return rtorrent.torrent('get_name', torrents.ubuntu.hash).
        should.eventually.equal(torrents.ubuntu.name);
    });

    it('read the file size', function() {
      return rtorrent.torrent('get_size_bytes', torrents.ubuntu.hash).
        should.eventually.equal(torrents.ubuntu.size);
    });

    context('manage file properties', function() {
      it('set a file priority to 0');
    });

    context('set custom metadata', function() {
      it('should set "name" to "bob"');
      it('should read "name" as "bob"');
    });
  });

  context('decode ratio', function() {
    it('returns actual ratio from integer value', function() {
      rtorrent.decodeRatio(1000).should.equal(1.0);
      rtorrent.decodeRatio(750).should.equal(.750);
      rtorrent.decodeRatio(100).should.equal(.100);
      rtorrent.decodeRatio(0).should.equal(0);
    });
  });

  context('multicalls', function() {
    it('should produce a multicall array', function() {
      const multicall = rtorrent.createMulticall([
        ['d.get_name', ['hash']],
        ['d.get_hash', ['hash']]
      ]);

      multicall.should.deep.equal([
        {methodName: "d.get_name", params: ['hash']},
        {methodName: "d.get_hash", params: ['hash']}
      ]);
    });

    it('should get the name and size simultaneously', function() {
      return rtorrent.multicall([
        ["d.get_name", [torrents.ubuntu.hash]],
        ["d.get_size_bytes", [torrents.ubuntu.hash]]
      ]).should.become([
        [torrents.ubuntu.name],
        [torrents.ubuntu.size]
      ]);
    });
  });

  after('remove torrents', function() {
    return Bluebird.map([
      torrents.ubuntu.hash,
      torrents.arch.hash
    ], hash => rtorrent.torrent("erase", hash));
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
