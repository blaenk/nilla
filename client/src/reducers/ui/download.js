import {
  RECEIVE_DOWNLOAD,
  REQUEST_DOWNLOAD,
  ENABLE_DOWNLOAD_FILE,
  DISABLE_DOWNLOAD_FILE,
  INVERT_DOWNLOAD_FILE,
  CANCEL_EDIT_FILES,
  EDIT_DOWNLOAD_FILES,
  SHOW_DOWNLOAD_STATS,
  SET_DOWNLOAD_FILTER,
  SET_DOWNLOAD_GLOBAL_COLLAPSE,
} from 'actions';

export const DEFAULT_DOWNLOAD_STATE = {
  isFetching: false,
  isAugmented: false,
  lastFetch: null,
  filter: '',
  isCollapsed: true,
  isEditing: false,
  showStats: false,
  filePriorities: {},
  collapsed: {
    extracted: [],
    downloaded: [],
  },
};

function downloadUI(state = DEFAULT_DOWNLOAD_STATE, action) {
  switch (action.type) {
    case SET_DOWNLOAD_GLOBAL_COLLAPSE:
      return Object.assign({}, state, {
        isCollapsed: action.isCollapsed,
      });
    case SET_DOWNLOAD_FILTER:
      return Object.assign({}, state, {
        filter: action.filter,
      });
    case ENABLE_DOWNLOAD_FILE: {
      const newPriorities = Object.assign({}, state.filePriorities, {
        [action.fileId]: true,
      });

      return Object.assign({}, state, {
        filePriorities: newPriorities,
      });
    }
    case DISABLE_DOWNLOAD_FILE: {
      const newPriorities = Object.assign({}, state.filePriorities, {
        [action.fileId]: false,
      });

      return Object.assign({}, state, {
        filePriorities: newPriorities,
      });
    }
    case INVERT_DOWNLOAD_FILE: {
      const newPriorities = Object.assign({}, state.filePriorities, {
        [action.fileId]: !state.filePriorities[action.fileId],
      });

      return Object.assign({}, state, {
        filePriorities: newPriorities,
      });
    }
    case CANCEL_EDIT_FILES:
      return Object.assign({}, state, {
        isEditing: false,
        filePriorities: {},
      });
    case EDIT_DOWNLOAD_FILES:
      return Object.assign({}, state, {
        isEditing: true,
        isCollapsed: false,
        filePriorities: action.filePriorities,
      });
    case SHOW_DOWNLOAD_STATS:
      return Object.assign({}, state, {
        showStats: action.show,
      });
    case REQUEST_DOWNLOAD:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECEIVE_DOWNLOAD:
      return Object.assign({}, state, {
        isFetching: false,
        lastFetch: Date.now(),
        isAugmented: true,
      });
    default:
      return state;
  }
}

export default function downloadsUI(state = {}, action) {
  switch (action.type) {
    case CANCEL_EDIT_FILES:
    case DISABLE_DOWNLOAD_FILE:
    case EDIT_DOWNLOAD_FILES:
    case ENABLE_DOWNLOAD_FILE:
    case INVERT_DOWNLOAD_FILE:
    case SET_DOWNLOAD_FILTER:
    case SET_DOWNLOAD_GLOBAL_COLLAPSE:
    case SHOW_DOWNLOAD_STATS:
    case REQUEST_DOWNLOAD:
    case RECEIVE_DOWNLOAD:
      return Object.assign({}, state, {
        [action.infoHash]: downloadUI(state[action.infoHash], action),
      });
    default:
      return state;
  }
}
