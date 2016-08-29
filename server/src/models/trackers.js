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

function deleteTrackerById(db, id, callback) {
  db.run('DELETE FROM trackers WHERE id = ?', id, callback);
}

module.exports = {
  deleteTrackerById,
  getTrackers,
  insertTracker,
};
