/**
 * Action to set the scope.
 * @param {string} scope The scope to set to. One of 'all', 'mine', 'system',
 * 'locked', or 'expiring.
 * @returns {Object} The action.
 */
export function setScope(scope){
  return {
    type: 'SET_SCOPE',
    scope
  };
}

/**
 * Action to set the sort order.
 * @param {string} order The sort order. One of 'recent' or 'name'.
 * @returns {Object} The action.
 */
export function setOrder(order){
  return {
    type: 'SET_ORDER',
    order
  };
}

/**
 * Action to set the filter.
 * @param {string} filter The pattern used to filter the downloads by name.
 * @returns {Object} The action.
 */
export function setFilter(filter){
  return {
    type: 'SET_FILTER',
    filter
  };
}
