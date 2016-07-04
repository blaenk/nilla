import { combineReducers } from 'redux';

import upload from './upload';
import downloads from './downloads';
import search from './search';

export default combineReducers({
  upload,
  downloads,
  search
});
