import _ from 'lodash';

import {
  REQUEST_USERS,
  RECEIVE_USERS,
  REQUEST_USER,
  RECEIVE_USER,
  DELETE_USER,
  RECEIVE_CURRENT_USER,
} from 'actions';

export const DEFAULT_STATE = {};

export default function users(state = {}, action) {
  switch (action.type) {
    case DELETE_USER:
      return _.omit(state, action.userId);
    case RECEIVE_USERS: {
      const users = {};

      users.current = state.current;

      for (const user of action.users) {
        users[user.id] = user;
      }

      return users;
    }
    case REQUEST_USER:
      return Object.assign({}, state, {
        [action.id]: {},
      });
    case RECEIVE_USER:
      return Object.assign({}, state, {
        [action.id]: action.user,
      });
    case RECEIVE_CURRENT_USER:
      return Object.assign({}, state, { current: action.user });
    case REQUEST_USERS:
    default:
      return state;
  }
}
