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
