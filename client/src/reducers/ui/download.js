import {
  RECEIVE_DOWNLOAD,
  REQUEST_DOWNLOAD,
  EDIT_DOWNLOAD_FILES,
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
    case EDIT_DOWNLOAD_FILES:
      return Object.assign({}, state, {
        isEditing: action.isEditing,
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
    case SET_DOWNLOAD_GLOBAL_COLLAPSE:
    case SET_DOWNLOAD_FILTER:
    case EDIT_DOWNLOAD_FILES:
    case REQUEST_DOWNLOAD:
    case RECEIVE_DOWNLOAD:
      return Object.assign({}, state, {
        [action.infoHash]: downloadUI(state[action.infoHash], action),
      });
    default:
      return state;
  }
}
