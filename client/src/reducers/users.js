import {
  RECEIVE_USER,
  RECEIVE_CURRENT_USER,
} from 'actions';

export const DEFAULT_STATE = {};

export default function users(state = {}, action) {
  switch (action.type) {
    case RECEIVE_USER:
      return Object.assign({}, state, {
        [action.id]: action.user,
      });
    case RECEIVE_CURRENT_USER:
      return Object.assign({}, state, { current: action.user });
    default:
      return state;
  }
}
