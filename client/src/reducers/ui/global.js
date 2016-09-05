import { SET_RTORRENT_AVAILABILITY } from 'actions';

export const DEFAULT_STATE = {
  isRtorrentAvailable: true,
};

export default function upload(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case SET_RTORRENT_AVAILABILITY:
      return Object.assign({}, state, {
        isRtorrentAvailable: action.isAvailable,
      });
    default:
      return state;
  }
}
