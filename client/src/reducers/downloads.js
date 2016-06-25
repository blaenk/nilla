/**
 * Downloads reducer.
 * @param {Object} state The current downloads state.
 * @param {Object} action The dispatched action.
 * @returns {Object} The new downloads state.
 */
export default function downloads(state, action) {
  switch (action.type) {
    case 'SET_DOWNLOADS':
      return action.downloads;
    default:
      return [
        {
          infohash: '123456',
          state: 'downloading',
          progress: '75',
          name: 'ubuntu',
          locks: []
        }
      ];
  }
}