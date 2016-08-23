import {
  REQUEST_USERS,
  RECEIVE_USERS,
  REQUEST_USER,
  RECEIVE_USER,
  RECEIVE_CURRENT_USER,
} from 'actions';

export const DEFAULT_STATE = {};

export default function users(state = {}, action) {
  switch (action.type) {
    case RECEIVE_USERS: {
      action.users.current = state.current;

      return action.users;
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
