'use strict';

const crypto = require('crypto');

function getUserByUsername(db, username, callback) {
  db.get('SELECT * FROM users WHERE username = ?', username, callback);
}

function getUserById(db, id, callback) {
  db.get('SELECT * FROM users WHERE id = ?', id, callback);
}

function getUsers(db, callback) {
  db.all('SELECT * FROM users', callback);
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
  deleteUserById,
  getUsers,
  createRandomSha1,
  createInvitation,
  getInvitations,
  getInvitationByToken,
  deleteInvitationByToken,
};
