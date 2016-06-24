import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { browserHistory } from 'react-router';

import App from 'containers/App/App';
import Reducer from './reducers';

// TODO
// second param is optional bootstrap data
let store = createStore(Reducer);

document.addEventListener("DOMContentLoaded", function() {
  const mountNode = document.querySelector('#root');
  ReactDOM.render(
    <App history={browserHistory} store={store} />,
    mountNode);
});
