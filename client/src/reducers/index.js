import { combineReducers } from 'redux';

import downloads from './downloads';
import search from './search';

const shape = {
  downloads: [{
    infohash: '123',
    state: 'downloading',
    progress: '75',
    name: 'ubuntu',
    locks: []
  }],
  search: {
    scope: 'all',
    order: 'recent'
  }
};

export default combineReducers({
  downloads,
  search
});
