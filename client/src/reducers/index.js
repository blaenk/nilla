import { combineReducers } from 'redux';

import downloads from './downloads';
import users from './users';
import invitations from './invitations';
import trackers from './trackers';

import global from './ui/global';
import upload from './ui/upload';
import downloadsUI from './ui/downloads';
import downloadUI from './ui/download';

export default combineReducers({
  data: combineReducers({
    downloads,
    users,
    invitations,
    trackers,
  }),
  ui: combineReducers({
    upload,
    downloads: downloadsUI,
    download: downloadUI,
    global,
  }),
});
