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

function getUserByUsername(db, username, callback) {
  db.get('SELECT * FROM users WHERE username = ?', username, callback);
}

function getUserById(db, id, callback) {
  db.get('SELECT * FROM users WHERE id = ?', id, callback);
}

function getUserToken(db, id, callback) {
  db.get('SELECT refresh_token FROM users WHERE id = ?', id, callback);
}

function getUsers(db) {
  return Bluebird.fromCallback(cb => {
    db.all('SELECT id, username, email, permissions, refresh_token FROM users', cb);
  });
}

function insertUser(db, user, callback) {
  db.run(
    'INSERT INTO users (username, email, password, refresh_token, permissions) \
     VALUES ($username, $email, $password, $refresh_token, $permissions)', {
       $username: user.username,
       $password: user.password,
       $email: user.email,
       $refresh_token: user.invitationToken,
       $permissions: user.permissions,
     },
    callback
  );
}

function putUser(db, id, user, callback) {
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
    callback
  );
}

function setUserPassword(db, id, password, callback) {
  createRandomSha1((error, sha1) => {
    db.run(
      'UPDATE users \
       SET password = $password, refresh_token = $token \
       WHERE id = $id', {
         $id: id,
         $password: password,
         $token: sha1,
       },
      callback
    );
  });
}

function deleteUserById(db, id, callback) {
  db.run('DELETE FROM users WHERE id = ?', id, callback);
}

function getInvitations(db, callback) {
  db.all('SELECT id, token, created_at FROM invitations', callback);
}

function getInvitationByToken(db, token, callback) {
  db.get('SELECT id, token, created_at FROM invitations WHERE token = ?', token, callback);
}

function deleteInvitationByToken(db, token, callback) {
  db.run('DELETE FROM invitations WHERE token = ?', token, callback);
}

function createInvitation(db, callback) {
  createRandomSha1((error, sha1) => {
    const now = new Date();

    db.run(
      'INSERT INTO invitations (token, created_at) \
       VALUES ($token, $created_at)',
      {
        $token: sha1,
        $created_at: now.toISOString(),
      },
      callback);
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
