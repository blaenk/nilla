import { RECEIVE_DOWNLOADS, RECEIVE_DOWNLOAD } from 'actions';

export default function downloads(state = {}, action) {
  switch (action.type) {
    case RECEIVE_DOWNLOADS:
      // TODO
      // merge it with existing state/downloads
      return Object.assign({}, action.downloads);
    case RECEIVE_DOWNLOAD:
      return Object.assign({}, state, {
        [action.infoHash]: action.download,
      });
    default:
      return state;
  }
}
