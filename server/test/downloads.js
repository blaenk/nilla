'use strict';

const Bluebird = require('bluebird');

const torrents = require('./fixtures/torrents.json');

const rtorrent = require('../src/rtorrent');

const downloads = require('../src/models/downloads');

require('sinon-as-promised')(Bluebird);

describe('Downloads Model', function() {
  context('decode ratio', function() {
    it('returns actual ratio from integer value', function() {
      expect(downloads.decodeRatio(1000)).to.equal('1.00');
      expect(downloads.decodeRatio(750)).to.equal('0.75');
      expect(downloads.decodeRatio(100)).to.equal('0.10');
      expect(downloads.decodeRatio(0)).to.equal('0.00');
    });
  });

  // TODO
  // this should probably be a test on rtorrent.torrent instead
  it('getDownload', function() {
    const input = [
      ['796AB93BB81E2DBE072F3C07857675EE5C47B046'],
      ['Fedora-Live-Workstation-x86_64-23'],
      ['0'],
      ['0'],
      [''],
      ['1'],
      ['0'],
      ['0'],
      ['0'],
      ['1469056132'],
      ['0'],
      ['0'],
      ['0'],
      ['0'],
      ['0'],
      ['0'],
      ['c3lzdGVt'],
      ['W10='],
      ['MjAxNi0wNy0yNFQyMzo1NDowN1o=']
    ];

    const output = {
      infoHash: '796ab93bb81e2dbe072f3c07857675ee5c47b046',
      name: 'Fedora-Live-Workstation-x86_64-23',
      isComplete: false,
      ratio: '0.00',
      message: '',
      isMultiFile: true,
      isHashChecking: false,
      isActive: false,
      isOpen: false,
      sizeBytes: 1469056132,
      completedBytes: 0,
      leeches: 0,
      seeders: 0,
      uploadRate: 0,
      downloadRate: 0,
      totalUploaded: 0,
      uploader: 'system',
      locks: [],
      dateAdded: new Date('2016-07-24T23:54:07.000Z'),
      state: 'closed',
      progress: '0.00'
    };

    rtorrent.call = sinon.stub(rtorrent, 'call').resolves(input);

    return downloads.getDownload(torrents.fedora.hash, rtorrent)
      .then(download => {
        expect(rtorrent.call.calledOnce).to.be.true;
        expect(download).to.deep.equal(output);
      })
      .finally(() => rtorrent.call.restore());
  });
});
