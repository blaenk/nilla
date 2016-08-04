import { combineReducers } from 'redux';

import upload from './upload';
import downloads from './downloads';
import users from './users';
import search from './search';

import downloadsUI from './ui/downloads';

export default combineReducers({
  upload,
  downloads,
  search,
  users,
  ui: combineReducers({
    downloads: downloadsUI,
  }),
});
