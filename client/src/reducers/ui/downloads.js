import {
  RECEIVE_DOWNLOAD,
  REQUEST_DOWNLOAD,
  SET_DOWNLOAD_FILTER,
  SET_DOWNLOAD_GLOBAL_COLLAPSE,
} from 'actions';

export const DEFAULT_STATE = {
  isFetching: false,
  isAugmented: false,
  lastFetch: null,
  filter: '',
  isCollapsed: true,
  collapsed: {
    extracted: [],
    downloaded: [],
  },
};

function downloadUI(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case SET_DOWNLOAD_GLOBAL_COLLAPSE:
      return Object.assign({}, state, {
        isCollapsed: action.isCollapsed,
      });
    case SET_DOWNLOAD_FILTER:
      return Object.assign({}, state, {
        filter: action.filter,
      });
    case REQUEST_DOWNLOAD:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECEIVE_DOWNLOAD:
      return Object.assign({}, state, {
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
    case REQUEST_DOWNLOAD:
    case RECEIVE_DOWNLOAD:
      return Object.assign({}, state, {
        [action.infoHash]: downloadUI(state[action.infoHash], action),
      });
    default:
      return state;
  }
}
