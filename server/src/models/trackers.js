'use strict';

function getTrackers(db, callback) {
  db.all('SELECT * FROM trackers', callback);
}

function insertTracker(db, tracker, callback) {
  db.run(
    'INSERT INTO trackers (name, url, username, password, category) \
     VALUES ($name, $url, $username, $password, $category)', {
       $name: tracker.name,
       $url: tracker.url,
       $username: tracker.username,
       $password: tracker.password,
       $category: tracker.category,
     },
    callback
  );
}

function putTracker(db, id, tracker, callback) {
  // TODO
  // rename category column to description
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
       $category: tracker.description,
     },
    callback
  );
}

function deleteTrackerById(db, id, callback) {
  db.run('DELETE FROM trackers WHERE id = ?', id, callback);
}

module.exports = {
  deleteTrackerById,
  getTrackers,
  putTracker,
  insertTracker,
};
