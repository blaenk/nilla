'use strict';

const crypto = require('crypto');

function getUserFromUsername(db, username, callback) {
  db.get('SELECT * FROM users WHERE username = ?', username,
         (error, row) => callback(error, row));
}

function createRefreshToken(callback) {
  crypto.randomBytes(64, (err, buffer) => {
    if (err) {
      callback(err);
    } else {
      callback(null, crypto.createHash('sha1').update(buffer).digest('hex'));
    }
  });
}

module.exports = {
  getUserFromUsername,
  createRefreshToken
};
