"use strict";

var rtorrent = require('../src/rtorrent.js');

describe('RTorrent', function() {
  before("should ensure a connection", function() {
    return rtorrent.call("system.client_version", []);
  });

  context('add and remove torrents', function() {
    it('add a torrent from a file');
    it('remove a torrent');

    it('add a torrent from raw data');
    it('add a torrent from a magnet link');
  });

  context('manage file properties', function() {
    it('set a file priority to 0');
  });

  context('set custom metadata', function() {
    it('should set "name" to "bob"');
    it('should read "name" as "bob"');
  });
});
