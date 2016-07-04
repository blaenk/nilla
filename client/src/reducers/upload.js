function removeFile(files, index) {
  return files.slice(0, index).concat(files.slice(index + 1));
}

/**
 * The upload reducer.
 * @param {Object} state The current upload state.
 * @param {Object} action The dispatched action.
 * @returns {Object} The new upload state.
 */
export default function upload(state, action) {
  switch (action.type) {
    case 'ADD_FILE': {
      return Object.assign({}, state, {
        files: state.files.concat([action.file])
      });
    }
    case 'REMOVE_FILE': {
      return Object.assign({}, state, {
        files: removeFile(state.files, action.index)
      });
    }
    case 'UPLOAD_FILE':
    case 'UPLOAD_FILE_SUCCESS':
    case 'UPLOAD_FILE_FAILURE':
    default:
      return {
        files: [],
        isDragging: false,
        isUploading: false,
        showUpload: false
      };
  }
}
