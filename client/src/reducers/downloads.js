/**
 * Downloads reducer.
 * @param {Object} state The current downloads state.
 * @param {Object} action The dispatched action.
 * @returns {Object} The new downloads state.
 */
export default function downloads(state, action) {
  switch (action.type) {
    case 'RECEIVE_DOWNLOADS':
      // TODO
      // merge it with existing state/downloads
      return Object.assign({}, action.downloads);
    case 'RECEIVE_DOWNLOAD':
      return Object.assign({}, state, {
        [action.download.infoHash]: action.download
      });
    default:
      return state || {};
  }
}
