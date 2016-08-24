import { combineReducers } from 'redux';

import downloads from './downloads';
import users from './users';
import invitations from './invitations';

import upload from './ui/upload';
import downloadsUI from './ui/downloads';
import downloadUI from './ui/download';

export default combineReducers({
  data: combineReducers({
    downloads,
    users,
    invitations,
  }),
  ui: combineReducers({
    upload,
    downloads: downloadsUI,
    download: downloadUI,
  }),
});
