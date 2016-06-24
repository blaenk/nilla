import { combineReducers } from 'redux';

import downloads from './downloads';
import search from './search';

export default combineReducers({
  downloads,
  search
});
