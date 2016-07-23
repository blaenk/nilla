'use strict';

const Bluebird = require('bluebird');
const request = require('supertest');
const cheerio = require('cheerio');
const CookieJar = require('cookiejar');

const server = require('../src/server');

const rtorrent = require('../src/rtorrent');
const torrents = require('./fixtures/torrents.json');

// TODO
//
// - need to be able to DI rtorrent function?
// - need to be able to DI database used to auth, perhaps make auth functions
//   pass results to a callback

function parseLoginForm(html) {
  let $ = cheerio.load(html);
  let csrf = $('input[name=_csrf]').val();
  let redirectTo = $('input[name=_redirectTo]').val();

  return { csrf, redirectTo };
}

const passAuthentication = sinon.stub();
passAuthentication.yields(null, {
  id: 1,
  username: 'test',
  permissions: 'admin'
});

describe('Server', function() {
  it('should remain on /login on login failure', function(done) {
    const failAuthentication = sinon.stub();
    failAuthentication.yields(new Error('failed auth'));

    const fail = request.agent(server.createServer({
      authenticator: failAuthentication
    }));

    fail.get('/login')
      .expect(200)
      .end((err, res) => {
        const { csrf } = parseLoginForm(res.text);

        fail.post('/login')
          .send('username=baduser')
          .send('password=badpass')
          .send(`_csrf=${csrf}`)
          .expect(302)
          .end((err, res) => {
            expect(res.redirect).to.be.true;
            expect(res.headers['location']).to.equal('/login');
            done();
          });
      });
  });

  it('should redirect to the original path after login', function(done) {
    const redirect = request.agent(server.createServer({
      authenticator: passAuthentication
    }));

    const FOLLOW_ONE_REDIRECT = 1;

    redirect.get('/downloads')
      .redirects(FOLLOW_ONE_REDIRECT)
      .expect(200)
      .end((err, res) => {
        const { csrf, redirectTo } = parseLoginForm(res.text);

        redirect.post('/login')
          .send('username=user')
          .send('password=pass')
          .send(`_csrf=${csrf}`)
          .send(`_redirectTo=${redirectTo}`)
          .expect(302)
          .end((err, res) => {
            expect(res.redirect).to.be.true;
            expect(res.headers['location']).to.equal('/downloads');
            done();
          });
      });
  });

  let agent;
  it('should login', function(done) {
    agent = request.agent(server.createServer({
      authenticator: passAuthentication
    }));

    agent.get('/login')
      .expect(200)
      .end((err, res) => {
        const { csrf } = parseLoginForm(res.text);

        agent.post('/login')
          .send('username=user')
          .send('password=pass')
          .send(`_csrf=${csrf}`)
          .expect(302)
          .end((err, res) => {
            expect(res.redirect).to.be.true;
            expect(res.headers['location']).to.equal('/');
            done();
          });
      });
  });

  context('GET /downloads', function() {
    it('empty downloads', function(done) {
      agent
        .get('/api/downloads')
        .accept('json')
        .expect(200)
        .expect('Content-Type', /json/)
        .expect(res => {
          expect(res.body).to.deep.equal([]);
        })
        .end(done);
    });

    // TODO
    // move this to test/models/downloads.js
    // and stub response
    it.skip('non-empty downloads', function() {
      return rtorrent.load(torrents.fedora.path, { raw: true })
        .then(() => {
          return agent
            .get('/api/downloads/' + torrents.fedora.hash)
            .accept('json')
            .expect(200)
            .expect('Content-Type', /json/)
            .expect(res => {
              expect(res.body).to.have.keys(
                'completedBytes',
                'dateAdded',
                'downloadRate',
                'files',
                'infoHash',
                'isActive',
                'isComplete',
                'isHashChecking',
                'isMultiFile',
                'isOpen',
                'leeches',
                'locks',
                'message',
                'name',
                'progress',
                'ratio',
                'seeders',
                'sizeBytes',
                'state',
                'totalUploaded',
                'uploadRate',
                'uploader'
              );
            });
        })
        .finally(() => rtorrent.torrent(torrents.fedora.hash, 'erase'));
    });
  });

  // TODO
  // don't actually submit a torrent
  it.skip('POST /downloads', function() {
    const cookie = agent.jar.getCookie('csrf-token', CookieJar.CookieAccessInfo());
    const csrfToken = cookie.value;

    return Bluebird.resolve(
      agent
        .post('/api/upload')
        .accept('json')
        .set('X-CSRF-TOKEN', csrfToken)
        .attach('torrent', torrents.fedora.path)
        .field('start', 'false')
        .expect(res => {
          expect(res.body).to.have.keys('success', 'infoHash');
          expect(res.body.infoHash).to.equal(torrents.fedora.hash);
        })
    ).finally(() => rtorrent.torrent(torrents.fedora.hash, 'erase'));
  });
});
