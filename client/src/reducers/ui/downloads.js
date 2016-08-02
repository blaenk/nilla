import {
  RECEIVE_DOWNLOAD,
  REQUEST_DOWNLOAD,
  SET_DOWNLOAD_FILTER,
  SET_DOWNLOAD_GLOBAL_COLLAPSE,
} from 'actions';

function downloadsUIByInfoHash(state, action) {
  const defaultState = {
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

  state = state || defaultState;

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
        [action.infoHash]: downloadsUIByInfoHash(state[action.infoHash], action),
      });
    default:
      return state;
  }
}
