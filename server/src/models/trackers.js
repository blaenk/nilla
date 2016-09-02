'use strict';

const Bluebird = require('bluebird');

function getTrackers(db) {
  return Bluebird.fromCallback(cb => {
    db.all('SELECT * FROM trackers', cb);
  });
}

function insertTracker(db, tracker) {
  return Bluebird.fromCallback(cb => {
    db.run(
      'INSERT INTO trackers (name, url, username, password, category) \
       VALUES ($name, $url, $username, $password, $category)', {
         $name: tracker.name,
         $url: tracker.url,
         $username: tracker.username,
         $password: tracker.password,
         $category: tracker.category,
       },
      cb
    );
  });
}

function putTracker(db, id, tracker) {
  return Bluebird.fromCallback(cb => {
    db.run(
      'UPDATE trackers \
       SET \
         name = $name, \
         url = $url, \
         username = $username, \
         password = $password, \
         category = $category \
       WHERE id = $id', {
         $id: tracker.id,
         $name: tracker.name,
         $url: tracker.url,
         $username: tracker.username,
         $password: tracker.password,
         $category: tracker.category,
       },
      cb
    );
  });
}

function deleteTrackerById(db, id) {
  return Bluebird.fromCallback(cb => {
    db.run('DELETE FROM trackers WHERE id = ?', id, cb);
  });
}

module.exports = {
  deleteTrackerById,
  getTrackers,
  putTracker,
  insertTracker,
};
