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
    files
  };
}

export function removeFile(file) {
  return {
    type: 'REMOVE_FILE',
    file
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

export function submitAllFiles() {
  return (dispatch, getState) => {
    for (const file of getState().upload.files) {
      dispatch(submitFile(file));
    }
  };
}

export function submitFile(file) {
  return (dispatch, getState) => {
    // TODO
    // won't this be susceptible to race conditions?
    console.log('getting file', file);
    console.log('current files', getState().upload.files);

    console.log(file);

    let formData = new window.FormData();
    formData.append('torrent', file);
    formData.append('start', true);

    return request.post('/api/upload')
      .send(formData)
      .then(json => {
        console.log(json);
        console.log(getState());
        dispatch(removeFile(file));
        console.log(getState());
      });
  };
}
