import request from 'superagent';
import parseTorrent from 'parse-torrent';
import Cookies from 'js-cookie';

export const LOGOUT = 'LOGOUT';

export function logout() {
  return {
    type: LOGOUT,
  };
}

export function requestLogout() {
  return dispatch => {
    return request.delete('/session')
      .accept('json')
      .then(() => {
        dispatch(logout());
      });
  };
}

export const REQUEST_INVITATIONS = 'REQUEST_INVITATIONS';

export function requestInvitations() {
  return {
    type: REQUEST_INVITATIONS,
  };
}

export const RECEIVE_INVITATIONS = 'RECEIVE_INVITATIONS';

export function receiveInvitations(invitations) {
  return {
    type: RECEIVE_INVITATIONS,
    invitations,
  };
}

export function requestCreateInvitation() {
  return dispatch => {
    return request.post('/api/invitations')
      .accept('json')
      .then(res => {
        dispatch(receiveInvitations(res.body));
      });
  };
}

export function requestDeleteInvitation(token) {
  return dispatch => {
    return request.delete(`/api/invitations/${token}`)
      .accept('json')
      .then(res => {
        dispatch(receiveInvitations(res.body));
      });
  };
}

export function getInvitations() {
  return dispatch => {
    dispatch(requestInvitations());

    return request.get('/api/invitations')
      .accept('json')
      .then(res => {
        if (res.body.error) {
          return;
        }

        dispatch(receiveInvitations(res.body));
      });
  };
}

export const REQUEST_TRACKERS = 'REQUEST_TRACKERS';

export function requestTrackers() {
  return {
    type: REQUEST_TRACKERS,
  };
}

export const RECEIVE_TRACKERS = 'RECEIVE_TRACKERS';

export function receiveTrackers(trackers) {
  return {
    type: RECEIVE_TRACKERS,
    trackers,
  };
}

export function requestDeleteTracker(id) {
  return dispatch => {
    return request.delete(`/api/trackers/${id}`)
      .accept('json')
      .then(res => {
        dispatch(receiveTrackers(res.body));
      });
  };
}

export function getTrackers() {
  return dispatch => {
    dispatch(requestTrackers());

    return request.get('/api/trackers')
      .accept('json')
      .then(res => {
        if (res.body.error) {
          return;
        }

        dispatch(receiveTrackers(res.body));
      });
  };
}

// TODO
// * on error, revert/keep the old tracker?
// * on success don't receive all new trackers, just modified
export function putTracker(tracker, callback) {
  return dispatch => {
    return request.put(`/api/trackers/${tracker.id}`)
      .send(tracker)
      .accept('json')
      .then(res => {
        if (res.body.error) {
          return;
        }

        dispatch(receiveTrackers(res.body));
        callback();
      });
  };
}

export function requestCreateTracker(tracker, callback) {
  return dispatch => {
    return request.post('/api/trackers')
      .send(tracker)
      .accept('json')
      .then(res => {
        if (res.body.error) {
          return;
        }

        dispatch(receiveTrackers(res.body));
        callback();
      });
  };
}

export const REQUEST_USER = 'REQUEST_USER';

export function requestUser(id) {
  return {
    type: REQUEST_USER,
    id,
  };
}

export const RECEIVE_CURRENT_USER = 'RECEIVE_CURRENT_USER';

export function receiveCurrentUser(user) {
  return {
    type: RECEIVE_CURRENT_USER,
    user,
  };
}

export const RECEIVE_USER = 'RECEIVE_USER';

export function receiveUser(id, user) {
  return {
    type: RECEIVE_USER,
    id,
    user,
  };
}

export function getUser(userID) {
  return dispatch => {
    dispatch(requestUser(userID));

    return request.get(`/api/users/${userID}`)
      .accept('json')
      .then(res => {
        dispatch(receiveUser(res.body.id, res.body));
      });
  };
}

export function getCurrentUser() {
  return dispatch => {
    return request.get('/api/users/current')
      .accept('json')
      .then(res => {
        dispatch(receiveUser(res.body.id, res.body));
        dispatch(receiveCurrentUser(res.body));
      });
  };
}

export const SET_DOWNLOADS_LAST_SEEN = 'SET_DOWNLOADS_LAST_SEEN';

export function setDownloadsLastSeen(date) {
  return {
    type: SET_DOWNLOADS_LAST_SEEN,
    date,
  };
}

export const SET_DOWNLOADS_SCOPE = 'SET_DOWNLOADS_SCOPE';

/**
 * Action to set the scope.
 * @param {string} scope The scope to set to. One of 'ALL', 'MINE', 'SYSTEM',
 * 'LOCKED', or 'EXPIRING'.
 * @returns {Object} The action.
 */
export function setDownloadsScope(scope) {
  return {
    type: SET_DOWNLOADS_SCOPE,
    scope,
  };
}

export const SET_DOWNLOADS_ORDER = 'SET_DOWNLOADS_ORDER';

/**
 * Action to set the sort order.
 * @param {string} order The sort order. One of 'RECENT' or 'NAME'.
 * @returns {Object} The action.
 */
export function setDownloadsOrder(order) {
  return {
    type: SET_DOWNLOADS_ORDER,
    order,
  };
}

export const SET_DOWNLOADS_FILTER = 'SET_DOWNLOADS_FILTER';

/**
 * Action to set the filter.
 * @param {string} filter The pattern used to filter the downloads by name.
 * @returns {Object} The action.
 */
export function setDownloadsFilter(filter) {
  return {
    type: SET_DOWNLOADS_FILTER,
    filter,
  };
}

export const SET_DOWNLOAD_FILTER = 'SET_DOWNLOAD_FILTER';

export function setDownloadFilter(infoHash, filter) {
  return {
    type: SET_DOWNLOAD_FILTER,
    infoHash,
    filter,
  };
}

export const SET_DOWNLOAD_GLOBAL_COLLAPSE = 'SET_DOWNLOAD_GLOBAL_COLLAPSE';

export function setDownloadGlobalCollapse(infoHash, isCollapsed) {
  return {
    type: SET_DOWNLOAD_GLOBAL_COLLAPSE,
    infoHash,
    isCollapsed,
  };
}

export const ADD_FILES = 'ADD_FILES';

export function addFiles(files) {
  return {
    type: ADD_FILES,
    files: files.map(f => {
      return {
        start: true,
        backingFile: f,
        progress: 0,
      };
    }),
  };
}

export const REMOVE_FILE = 'REMOVE_FILE';

export function removeFile(file) {
  return {
    type: REMOVE_FILE,
    file,
  };
}

export const REJECT_FILE = 'REJECT_FILE';

export function rejectFiles(files) {
  return {
    type: REJECT_FILE,
    files,
  };
}

export const CLEAR_REJECTED_FILES = 'CLEAR_REJECTED_FILES';

export function clearRejectedFiles() {
  return {
    type: CLEAR_REJECTED_FILES,
  };
}

export const SET_DRAGGING = 'SET_DRAGGING';

export function setDragging(isDragging) {
  return {
    type: SET_DRAGGING,
    isDragging,
  };
}

export const SET_UPLOADING = 'SET_UPLOADING';

export function setUploading(isUploading) {
  return {
    type: SET_UPLOADING,
    isUploading,
  };
}

export const UPLOAD_FILE = 'UPLOAD_FILE';
export const UPLOAD_FILE_SUCCESS = 'UPLOAD_FILE_SUCCESS';
export const UPLOAD_FILE_FAILURE = 'UPLOAD_FILE_FAILURE';

export function uploadFile(file) {
  return {
    type: UPLOAD_FILE,
    file,
  };
}

export const SET_FILE_START = 'SET_FILE_START';

export function setFileStart(file, start) {
  return {
    type: SET_FILE_START,
    file,
    start,
  };
}

export const SET_FILE_PROGRESS = 'SET_FILE_PROGRESS';

export function setFileProgress(file, progress) {
  return {
    type: SET_FILE_PROGRESS,
    file,
    progress,
  };
}

export const REQUEST_DOWNLOADS = 'REQUEST_DOWNLOADS';

export function requestDownloads() {
  return {
    type: REQUEST_DOWNLOADS,
  };
}

export const RECEIVE_DOWNLOADS = 'RECEIVE_DOWNLOADS';

export function receiveDownloads(downloads) {
  return {
    type: RECEIVE_DOWNLOADS,
    downloads,
    receivedAt: new Date(),
  };
}

export const REQUEST_USERS = 'REQUEST_USERS';

export function requestUsers() {
  return {
    type: REQUEST_USERS,
  };
}

export const RECEIVE_USERS = 'RECEIVE_USERS';

export function receiveUsers(users) {
  return {
    type: RECEIVE_USERS,
    users,
    receivedAt: new Date(),
  };
}

export const REQUEST_DOWNLOAD = 'REQUEST_DOWNLOAD';

export function requestDownload(infoHash) {
  return {
    type: REQUEST_DOWNLOAD,
    infoHash,
  };
}

export const RECEIVE_DOWNLOAD = 'RECEIVE_DOWNLOAD';

export function receiveDownload(infoHash, download) {
  return {
    type: RECEIVE_DOWNLOAD,
    infoHash,
    download,
    receivedAt: new Date(),
  };
}

function normalizeDownloads(downloads) {
  const normalized = {};

  for (const download of downloads) {
    download.dateAdded = new Date(download.dateAdded);

    normalized[download.infoHash] = download;
  }

  return normalized;
}

export const DELETE_USER = 'DELETE_USER';

export function deleteUser(userId) {
  return {
    type: DELETE_USER,
    userId,
  };
}

export function requestDeleteUser(userId) {
  return dispatch => {
    return request.delete(`/api/users/${userId}`)
      .accept('json')
      .then(res => {
        if (res.body.error) {
          return;
        }

        dispatch(deleteUser(userId));
      });
  };
}

export function getUsers() {
  return dispatch => {
    dispatch(requestUsers());

    return request.get('/api/users')
      .accept('json')
      .then(res => {
        if (res.body.error) {
          return;
        }

        dispatch(receiveUsers(res.body));
      });
  };
}

export function getDownloads() {
  return dispatch => {
    dispatch(requestDownloads());

    return request.get('/api/downloads')
      .accept('json')
      .then(res => {
        if (res.body.error) {
          return;
        }

        const normalized = normalizeDownloads(res.body);

        dispatch(receiveDownloads(normalized));
      });
  };
}

export function getDownload(infoHash) {
  return (dispatch, getState) => {
    dispatch(requestDownload(infoHash));

    return request.get(`/api/downloads/${infoHash}`)
      .accept('json')
      .then(res => {
        const download = res.body;

        // TODO
        // If we're navigating to a specific download, perhaps set a flag that
        // we should navigate back to /downloads
        if (download.error) {
          return;
        }

        download.dateAdded = new Date(download.dateAdded);

        dispatch(receiveDownload(infoHash, download));

        if (download.uploader !== -1 && !(download.uploader in getState().data.users)) {
          dispatch(getUser(download.uploader));
        }

        for (const userId of download.locks) {
          if (userId !== -1 && !(userId in getState().data.users)) {
            dispatch(getUser(userId));
          }
        }
      });
  };
}

export const SET_DOWNLOAD_LOCK = 'SET_DOWNLOAD_LOCK';

export function setDownloadLock(infoHash, toLock) {
  return {
    type: SET_DOWNLOAD_LOCK,
    infoHash,
    toLock,
  };
}

function patchDownload(infoHash, action) {
  return (dispatch) => {
    return request.patch(`/api/downloads/${infoHash}`)
      .accept('json')
      .send({ action })
      .then(res => {
        if (res.body.error) {
          return Promise.resolve();
        }

        // TODO
        // save the round-trip
        // dispatch(setDownloadLock(infoHash, true));

        return dispatch(getDownload(infoHash));
      });
  };
}

export function acquireLock(infoHash) {
  return patchDownload(infoHash, 'acquireLock');
}

export function releaseLock(infoHash) {
  return patchDownload(infoHash, 'releaseLock');
}

export function startDownload(infoHash) {
  return patchDownload(infoHash, 'start');
}

export function stopDownload(infoHash) {
  return patchDownload(infoHash, 'stop');
}

export function eraseDownload(infoHash, callback) {
  return (_dispatch) => {
    return request.delete(`/api/downloads/${infoHash}`)
      .accept('json')
      .then(res => {
        if (res.body.error) {
          return Promise.resolve();
        }

        callback();

        return Promise.resolve();
      });
  };
}

export const SHOW_DOWNLOAD_STATS = 'SHOW_DOWNLOAD_STATS';

export function showDownloadStats(infoHash, show) {
  return {
    type: SHOW_DOWNLOAD_STATS,
    infoHash,
    show,
  };
}

export const EDIT_DOWNLOAD_FILES = 'EDIT_DOWNLOAD_FILES';

export function editDownloadFiles(infoHash, filePriorities) {
  return {
    type: EDIT_DOWNLOAD_FILES,
    infoHash,
    filePriorities,
  };
}

export const SET_PARSED_FILE = 'SET_PARSED_FILE';

export function setParsedFile(file, parsed) {
  return {
    type: SET_PARSED_FILE,
    file,
    parsed,
  };
}

export function parseFile(file) {
  return (dispatch) => {
    parseTorrent.remote(file.backingFile, (err, parsed) => {
      if (err) {
        dispatch(rejectFiles([file]));

        return;
      }

      dispatch(setParsedFile(file, parsed));
    });
  };
}

function downloadFromFileObjectForUser(fileObject, user) {
  const { infoHash, name, length, announce } = fileObject.parsed;

  const state = fileObject.start ? 'downloading' : 'closed';

  return {
    infoHash,
    name,
    isComplete: false,
    ratio: '0.00',
    message: '',
    isMultifile: fileObject.parsed.files.length > 1,
    isHashChecking: false,
    isActive: true,
    isOpen: fileObject.start,
    sizeBytes: length,
    completedBytes: 0,
    leeches: 0,
    seeders: 0,
    uploadRate: 0,
    downloadRate: 0,
    totalUploaded: 0,
    uploader: user.id,
    locks: [],
    dateAdded: new Date(),
    state,
    progress: 0,
    trackers: announce,
  };
}

export function submitFile(file) {
  return (dispatch, getState) => {
    let fileObject = getState().ui.upload.files.find(f => f === file);

    if (!file) {
      return Promise.reject(new Error(`file not found: ${file}`));
    }

    const getFileObject = () => {
      return getState().ui.upload.files.find(f => f.backingFile === fileObject.backingFile);
    };

    return request.post('/api/downloads')
      .accept('json')
      .set('X-CSRF-TOKEN', Cookies.get('csrf-token'))
      .attach('torrent', fileObject.backingFile)
      .field('start', fileObject.start)
      .on('progress', event => {
        dispatch(setFileProgress(fileObject, event.percent));
        fileObject = getFileObject();
      })
      .then(_response => {
        const currentUser = getState().data.users.current;
        const download = downloadFromFileObjectForUser(fileObject, currentUser);

        dispatch(receiveDownload(download.infoHash, download));

        dispatch(removeFile(fileObject));

        if (getState().ui.upload.files.length === 0) {
          dispatch(setUploading(false));
        }

        dispatch(getDownloads());
      })
      .catch(_error => dispatch(removeFile(fileObject)));
  };
}

export function submitAllFiles() {
  return (dispatch, getState) => {
    for (const file of getState().ui.upload.files) {
      dispatch(submitFile(file));
    }
  };
}

export const ENABLE_DOWNLOAD_FILE = 'ENABLE_DOWNLOAD_FILE';

export function enableDownloadFile(infoHash, fileId) {
  return {
    type: ENABLE_DOWNLOAD_FILE,
    infoHash,
    fileId,
  };
}

export const CANCEL_EDIT_FILES = 'CANCEL_EDIT_FILES';

export function cancelEditFiles(infoHash) {
  return {
    type: CANCEL_EDIT_FILES,
    infoHash,
  };
}

export const INVERT_DOWNLOAD_FILE = 'INVERT_DOWNLOAD_FILE';

export function invertDownloadFile(infoHash, fileId) {
  return {
    type: INVERT_DOWNLOAD_FILE,
    infoHash,
    fileId,
  };
}

export const APPLY_EDIT_FILES = 'APPLY_EDIT_FILES';

export function applyEditFiles(infoHash, filePriorities) {
  return (dispatch) => {
    dispatch(cancelEditFiles(infoHash));

    return request.patch(`/api/downloads/${infoHash}`)
      .accept('json')
      .send({
        action: 'setFilePriorities',
        params: filePriorities,
      })
      .then(res => {
        if (res.body.error) {
          return;
        }

        dispatch(getDownload(infoHash));
      });
  };
}

export const DISABLE_DOWNLOAD_FILE = 'DISABLE_DOWNLOAD_FILE';

export function disableDownloadFile(infoHash, fileId) {
  return {
    type: DISABLE_DOWNLOAD_FILE,
    infoHash,
    fileId,
  };
}
