import { combineReducers } from 'redux';

import downloads from './downloads';
import users from './users';

import upload from './ui/upload';
import downloadsUI from './ui/downloads';
import downloadUI from './ui/download';

export default combineReducers({
  data: combineReducers({
    downloads,
    users,
  }),
  ui: combineReducers({
    upload,
    downloads: downloadsUI,
    download: downloadUI,
  }),
});
