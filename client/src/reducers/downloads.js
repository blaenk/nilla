import _ from 'lodash';

import { RECEIVE_DOWNLOADS, RECEIVE_DOWNLOAD } from 'actions';

export default function downloads(state = {}, action) {
  switch (action.type) {
    case RECEIVE_DOWNLOADS:
      return _.merge(_.cloneDeep(state), action.downloads);
    case RECEIVE_DOWNLOAD:
      return Object.assign({}, state, {
        [action.infoHash]: action.download,
      });
    default:
      return state;
  }
}
