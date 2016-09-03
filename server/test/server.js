'use strict';

const Bluebird = require('bluebird');
const request = require('supertest');
const cheerio = require('cheerio');
const CookieJar = require('cookiejar');
const HttpStatus = require('http-status-codes');

const server = require('../src/server');

const rtorrent = require('../src/rtorrent');
const torrents = require('./fixtures/torrents.json');

function parseLoginForm(html) {
  const $ = cheerio.load(html);
  const csrf = $('input[name=_csrf]').val();
  const ref = $('input[name=_ref]').val();

  return { csrf, ref };
}

const USER = {
  id: 1,
  username: 'test',
  permissions: 'admin',
};

const passAuthentication = sinon.stub().resolves(USER);

describe('Server', function() {
  it('should remain on /login on login failure', function(done) {
    const failAuthentication = sinon.stub().rejects(new Error('failed auth'));

    const fail = request.agent(server.createServer({
      authenticator: failAuthentication,
    }));

    fail.get('/login')
      .expect(HttpStatus.OK)
      .end((err, res) => {
        if (err) {
          throw err;
        }

        const { csrf } = parseLoginForm(res.text);

        fail.post('/session')
          .send('username=baduser')
          .send('password=badpass')
          .send(`_csrf=${csrf}`)
          .expect(HttpStatus.MOVED_TEMPORARILY)
          .end((err, res) => {
            if (err) {
              throw err;
            }

            expect(res.redirect).to.be.true();
            expect(res.headers.location).to.equal('/login');
            done();
          });
      });
  });

  it('should redirect to the original path after login', function(done) {
    const redirect = request.agent(server.createServer({
      authenticator: passAuthentication,
    }));

    const FOLLOW_ONE_REDIRECT = 1;

    redirect.get('/downloads')
      .redirects(FOLLOW_ONE_REDIRECT)
      .expect(HttpStatus.OK)
      .end((err, res) => {
        if (err) {
          throw err;
        }

        const { csrf, ref } = parseLoginForm(res.text);

        redirect.post('/session')
          .send('username=user')
          .send('password=pass')
          .send(`_csrf=${csrf}`)
          .send(`_ref=${ref}`)
          .expect(HttpStatus.MOVED_TEMPORARILY)
          .end((err, res) => {
            if (err) {
              throw err;
            }

            expect(res.redirect).to.be.true();
            expect(res.headers.location).to.equal('/downloads');
            done();
          });
      });
  });

  let agent;

  it('should login', function(done) {
    agent = request.agent(server.createServer({
      authenticator: passAuthentication,
    }));

    agent.get('/login')
      .expect(HttpStatus.OK)
      .end((err, res) => {
        if (err) {
          throw err;
        }

        const { csrf } = parseLoginForm(res.text);

        agent.post('/session')
          .send('username=user')
          .send('password=pass')
          .send(`_csrf=${csrf}`)
          .expect(HttpStatus.MOVED_TEMPORARILY)
          .end((err, res) => {
            if (err) {
              throw err;
            }

            expect(res.redirect).to.be.true();
            expect(res.headers.location).to.equal('/');
            done();
          });
      });
  });

  it('GET /users/current', function(done) {
    agent
      .get('/api/users/current')
      .accept('json')
      .expect(HttpStatus.OK)
      .expect('Content-Type', /json/)
      .expect(({ body: user }) => {
        expect(user).to.contain.keys('id', 'username', 'permissions');

        expect(user.id).to.equal(USER.id);
        expect(user.username).to.equal(USER.username);
        expect(user.permissions).to.deep.equal(USER.permissions.split(','));
      })
      .end(done);
  });

  context('GET /downloads', function() {
    it('empty downloads', function(done) {
      agent
        .get('/api/downloads')
        .accept('json')
        .expect(HttpStatus.OK)
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
            .expect(HttpStatus.OK)
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
        .post('/api/downloads')
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

  context('PATCH /downloads/:infoHash', function() {
    it('should start a download');
    it('should stop a download');
    it('should add a lock');
    it('should remove a lock');
    it('should set file priorities');
  });

  it('DELETE /downloads/:infoHash');
});
