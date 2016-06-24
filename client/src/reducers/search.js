export default function search(state, action) {
  switch (action.type) {
    case 'SET_SCOPE':
      return Object.assign({}, state, {
        scope: action.scope
      });
    case 'SET_ORDER':
      return Object.assign({}, state, {
        order: action.order
      });
    case 'SET_FILTER':
      return Object.assign({}, state, {
        filter: action.filter
      });
    default:
      return {
        scope: 'all',
        order: 'recent',
        filter: ''
      };
  }
}
