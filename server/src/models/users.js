'use strict';

const crypto = require('crypto');

const Bluebird = require('bluebird');

function createRandomSha1(callback) {
  const BYTE_COUNT = 64;

  crypto.randomBytes(BYTE_COUNT, (err, buffer) => {
    if (err) {
      callback(err);

      return;
    }

    callback(null, crypto.createHash('sha1').update(buffer).digest('hex'));
  });
}

function getUserByUsername(db, username) {
  return Bluebird.fromCallback(cb => {
    db.get('SELECT * FROM users WHERE username = ?', username, cb);
  });
}

function getUserById(db, id) {
  return Bluebird.fromCallback(cb => {
    db.get('SELECT * FROM users WHERE id = ?', id, cb);
  });
}

function getUserToken(db, id) {
  return Bluebird.fromCallback(cb => {
    db.get('SELECT refresh_token FROM users WHERE id = ?', id, cb);
  });
}

function getUsers(db) {
  return Bluebird.fromCallback(cb => {
    db.all('SELECT id, username, email, permissions, refresh_token FROM users', cb);
  });
}

function insertUser(db, user) {
  return new Promise((resolve, reject) => {
    db.run(
      'INSERT INTO users (username, email, password, refresh_token, permissions) \
       VALUES ($username, $email, $password, $refresh_token, $permissions)', {
         $username: user.username,
         $password: user.password,
         $email: user.email,
         $refresh_token: user.invitationToken,
         $permissions: user.permissions,
       },
      function(err) {
        if (err) {
          reject(err);
        } else {
          // eslint-disable-next-line no-invalid-this
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      }
    );
  });
}

function putUser(db, id, user) {
  return Bluebird.fromCallback(cb => {
    db.run(
      'UPDATE users \
       SET \
         email = $email, \
         username = $username, \
         password = $password, \
         permissions = $permissions, \
         refresh_token = $refresh_token \
       WHERE id = $id', {
         $id: user.id,
         $email: user.email,
         $username: user.username,
         $password: user.password,
         $permissions: user.permissions,
         $refresh_token: user.refresh_token,
       },
      cb
    );
  });
}

function setUserPassword(db, id, password) {
  return Bluebird.fromCallback(cb => {
    createRandomSha1((error, sha1) => {
      db.run(
        'UPDATE users \
         SET password = $password, refresh_token = $token \
         WHERE id = $id', {
           $id: id,
           $password: password,
           $token: sha1,
         },
        cb
      );
    });
  });
}

function deleteUserById(db, id) {
  return Bluebird.fromCallback(cb => {
    db.run('DELETE FROM users WHERE id = ?', id, cb);
  });
}

function getInvitations(db) {
  return Bluebird.fromCallback(cb => {
    db.all('SELECT id, token, created_at FROM invitations', cb);
  });
}

function getInvitationByToken(db, token) {
  return Bluebird.fromCallback(cb => {
    db.get('SELECT id, token, created_at FROM invitations WHERE token = ?', token, cb);
  });
}

function deleteInvitationByToken(db, token) {
  return Bluebird.fromCallback(cb => {
    db.run('DELETE FROM invitations WHERE token = ?', token, cb);
  });
}

function createInvitation(db) {
  return Bluebird.fromCallback(cb => {
    createRandomSha1((error, sha1) => {
      const now = new Date();

      db.run(
        'INSERT INTO invitations (token, created_at) \
       VALUES ($token, $created_at)',
        {
          $token: sha1,
          $created_at: now.toISOString(),
        },
        cb);
    });
  });
}

module.exports = {
  getUserByUsername,
  getUserById,
  insertUser,
  putUser,
  deleteUserById,
  getUsers,
  createRandomSha1,
  createInvitation,
  getInvitations,
  getInvitationByToken,
  deleteInvitationByToken,
  getUserToken,
  setUserPassword,
};
