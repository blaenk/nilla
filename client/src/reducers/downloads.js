import _ from 'lodash';

import {
  RECEIVE_DOWNLOADS,
  RECEIVE_DOWNLOAD,
  REQUEST_DOWNLOAD,
} from 'actions';

export const DEFAULT_STATE = {
  files: {
    downloaded: [],
    extracted: [],
  },
};

function download(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case RECEIVE_DOWNLOAD:
      return action.download;
    case REQUEST_DOWNLOAD:
    default:
      return state;
  }
}

export default function downloads(state = {}, action) {
  switch (action.type) {
    case RECEIVE_DOWNLOADS:
      return _.merge(_.cloneDeep(state), action.downloads);
    case RECEIVE_DOWNLOAD:
    case REQUEST_DOWNLOAD:
      return Object.assign({}, state, {
        [action.infoHash]: download(state[action.infoHash], action),
      });
    default:
      return state;
  }
}
