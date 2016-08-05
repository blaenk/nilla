import {
  REQUEST_DOWNLOADS,
  RECEIVE_DOWNLOADS,
  SET_DOWNLOADS_FILTER,
  SET_DOWNLOADS_ORDER,
  SET_DOWNLOADS_SCOPE,
} from 'actions';

const DEFAULT_DOWNLOAD_STATE = {
  isFetching: false,
  scope: 'ALL',
  order: 'RECENT',
  filter: '',
};

export default function downloadsUI(state = DEFAULT_DOWNLOAD_STATE, action) {
  switch (action.type) {
    case REQUEST_DOWNLOADS:
      return Object.assign({}, state, {
        isFetching: true,
      });
    case RECEIVE_DOWNLOADS:
      return Object.assign({}, state, {
        isFetching: false,
      });
    case SET_DOWNLOADS_FILTER:
      return Object.assign({}, state, {
        filter: action.filter,
      });
    case SET_DOWNLOADS_SCOPE:
      return Object.assign({}, state, {
        scope: action.scope,
      });
    case SET_DOWNLOADS_ORDER:
      return Object.assign({}, state, {
        order: action.order,
      });
    default:
      return state;
  }
}
