import request from 'superagent';
import Cookies from 'js-cookie';

export const SET_SCOPE = 'SET_SCOPE';

/**
 * Action to set the scope.
 * @param {string} scope The scope to set to. One of 'all', 'mine', 'system',
 * 'locked', or 'expiring.
 * @returns {Object} The action.
 */
export function setScope(scope) {
  return {
    type: SET_SCOPE,
    scope,
  };
}

export const SET_ORDER = 'SET_ORDER';

/**
 * Action to set the sort order.
 * @param {string} order The sort order. One of 'recent' or 'name'.
 * @returns {Object} The action.
 */
export function setOrder(order) {
  return {
    type: SET_ORDER,
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
    receivedAt: Date.now(),
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
    receivedAt: Date.now(),
  };
}

function normalizeDownloads(downloads) {
  const normalized = {};

  for (const download of downloads) {
    normalized[download.infoHash] = download;
  }

  return normalized;
}

export function getDownloads() {
  return dispatch => {
    // dispatch(requestDownloads());

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
  return dispatch => {
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

        dispatch(receiveDownload(infoHash, download));
      });
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

export function getCurrentUser() {
  return dispatch => {
    return request.get('/api/users/current')
      .accept('json')
      .then(res => {
        dispatch(receiveUser(res.body));
        dispatch(receiveCurrentUser(res.body));
      });
  };
}

export function submitFile(file) {
  return (dispatch, getState) => {
    let fileObject = getState().upload.files.find(f => f === file);

    if (!file) {
      return Promise.reject(new Error(`file not found: ${file}`));
    }

    const getFileObject = () => {
      return getState().upload.files.find(f => f.backingFile === fileObject.backingFile);
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
      .then(_response => dispatch(removeFile(fileObject)))
      .catch(_error => dispatch(removeFile(fileObject)));
  };
}

export function submitAllFiles() {
  return (dispatch, getState) => {
    for (const file of getState().upload.files) {
      dispatch(submitFile(file));
    }
  };
}
