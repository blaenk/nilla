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

function deleteUserById(db, id, callback) {
  db.run('DELETE users WHERE id = ?', id, callback);
}

function createRefreshToken(callback) {
  const BYTE_COUNT = 64;

  crypto.randomBytes(BYTE_COUNT, (err, buffer) => {
    if (err) {
      callback(err);

      return;
    }

    callback(null, crypto.createHash('sha1').update(buffer).digest('hex'));
  });
}

module.exports = {
  getUserByUsername,
  getUserById,
  deleteUserById,
  getUsers,
  createRefreshToken,
};
