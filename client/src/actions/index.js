export function setScope(scope){
  return {
    type: 'SET_SCOPE',
    scope
  };
}

export function setOrder(order){
  return {
    type: 'SET_ORDER',
    order
  };
}

export function setFilter(filter){
  return {
    type: 'SET_FILTER',
    filter
  };
}
