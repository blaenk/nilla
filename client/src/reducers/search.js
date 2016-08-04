import { SET_SCOPE, SET_ORDER, SET_DOWNLOADS_FILTER } from 'actions';

export const DEFAULT_STATE = {
  scope: 'all',
  order: 'recent',
  filter: '',
};

/**
 * The search reducer.
 * @param {Object} state The current search state.
 * @param {Object} action The dispatched action.
 * @returns {Object} The new search state.
 */
export default function search(state = DEFAULT_STATE, action) {
  switch (action.type) {
    case SET_SCOPE:
      return Object.assign({}, state, {
        scope: action.scope,
      });
    case SET_ORDER:
      return Object.assign({}, state, {
        order: action.order,
      });
    case SET_DOWNLOADS_FILTER:
      return Object.assign({}, state, {
        filter: action.filter,
      });
    default:
      return state;
  }
}
