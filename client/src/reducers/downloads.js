/**
 * Downloads reducer.
 * @param {Object} state The current downloads state.
 * @param {Object} action The dispatched action.
 * @returns {Object} The new downloads state.
 */
export default function downloads(state, action) {
  switch (action.type) {
    case 'RECEIVE_DOWNLOADS':
      // return Object.assign({}, state, action.downloads);
      return action.downloads.slice();
    default:
      return state || {};
  }
}
