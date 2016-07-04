import fetch from 'isomorphic-fetch';

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

export function addFile(file) {
  return {
    type: 'ADD_FILE',
    file
  };
}

export function removeFile(index) {
  return {
    type: 'REMOVE_FILE',
    index
  };
}

export function uploadFile(index) {
  return {
    type: 'UPLOAD_FILE',
    index
  };
}

export function submitFile(index) {
  return (dispatch, getState) => {
    // TODO
    // won't this be susceptible to race conditions?
    console.log('getting index', index);
    console.log('current files', getState().upload.files);

    const file = getState().upload.files[index];

    console.log(file);

    let formData = new window.FormData();
    formData.append('torrent', file);
    formData.append('start', true);

    return fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(json => console.log(json))
    .then(() => {
      dispatch(removeFile(index));
    })
    .then(() => {
      console.log(getState());
    });
  };
}
