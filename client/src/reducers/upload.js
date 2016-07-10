/**
 * The upload reducer.
 * @param {Object} state The current upload state.
 * @param {Object} action The dispatched action.
 * @returns {Object} The new upload state.
 */
export default function upload(state, action) {
  switch (action.type) {
    case 'ADD_FILES': {
      return Object.assign({}, state, {
        files: state.files.concat(action.files)
      });
    }
    case 'REMOVE_FILE': {
      return Object.assign({}, state, {
        files: state.files.filter(f => f != action.file)
      });
    }
    case 'REJECT_FILE': {
      return Object.assign({}, state, {
        rejectedFiles: state.rejectedFiles.concat(action.files)
      });
    }
    case 'CLEAR_REJECTED_FILES': {
      return Object.assign({}, state, {
        rejectedFiles: []
      });
    }
    case 'SET_DRAGGING': {
      return Object.assign({}, state, {
        isDragging: action.isDragging
      });
    }
    case 'SET_UPLOADING': {
      return Object.assign({}, state, {
        isUploading: action.isUploading
      });
    }
    case 'UPLOAD_FILE':
    case 'UPLOAD_FILE_SUCCESS':
    case 'UPLOAD_FILE_FAILURE':
    default:
      return {
        files: [],
        rejectedFiles: [],
        isDragging: false,
        isUploading: false,
        showUpload: false
      };
  }
}
