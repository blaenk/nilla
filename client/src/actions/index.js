import request from 'superagent';

/**
 * Action to set the scope.
 * @param {string} scope The scope to set to. One of 'all', 'mine', 'system',
 * 'locked', or 'expiring.
 * @returns {Object} The action.
 */
export function setScope(scope) {
  return {
    type: 'SET_SCOPE',
    scope
  };
}

/**
 * Action to set the sort order.
 * @param {string} order The sort order. One of 'recent' or 'name'.
 * @returns {Object} The action.
 */
export function setOrder(order) {
  return {
    type: 'SET_ORDER',
    order
  };
}

/**
 * Action to set the filter.
 * @param {string} filter The pattern used to filter the downloads by name.
 * @returns {Object} The action.
 */
export function setFilter(filter) {
  return {
    type: 'SET_FILTER',
    filter
  };
}

export function addFiles(files) {
  return {
    type: 'ADD_FILES',
    files: files.map(f => {
      return {
        start: true,
        backingFile: f,
        progress: 0
      };
    })
  };
}

export function removeFile(backingFile) {
  return {
    type: 'REMOVE_FILE',
    backingFile
  };
}

export function rejectFiles(files) {
  return {
    type: 'REJECT_FILE',
    files
  };
}

export function clearRejectedFiles(files) {
  return {
    type: 'CLEAR_REJECTED_FILES'
  };
}

export function setDragging(isDragging) {
  return {
    type: 'SET_DRAGGING',
    isDragging
  };
}

export function setUploading(isUploading) {
  return {
    type: 'SET_UPLOADING',
    isUploading
  };
}

export function uploadFile(file) {
  return {
    type: 'UPLOAD_FILE',
    file
  };
}

export function setFileStart(file, start) {
  return {
    type: 'SET_FILE_START',
    file,
    start
  };
}

export function setFileProgress(backingFile, progress) {
  return {
    type: 'SET_FILE_PROGRESS',
    backingFile,
    progress
  };
}

export function submitAllFiles() {
  return (dispatch, getState) => {
    for (const file of getState().upload.files) {
      dispatch(submitFile(file));
    }
  };
}

export function submitFile(file) {
  return (dispatch, getState) => {
    const fileObject = getState().upload.files.find(f => f == file);

    if (!file) {
      return Promise.reject(new Error(`file not found: ${file}`));
    }

    let formData = new window.FormData();
    formData.append('torrent', fileObject.backingFile);
    formData.append('start', fileObject.start);

    return request.post('/api/upload')
      .send(formData)
      .on('progress', event => {
        dispatch(setFileProgress(fileObject.backingFile, event.percent));
      })
      .then(json => {
        console.log(json);
        dispatch(removeFile(fileObject.backingFile));
      })
      .catch(e => {
        console.error(e);
        dispatch(removeFile(fileObject.backingFile));
      });
  };
}
