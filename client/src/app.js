import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { browserHistory } from 'react-router';

import AppContainer from 'containers/App/AppContainer';
import Reducer from './reducers';

let defaultState;

let store = createStore(
  Reducer,
  defaultState,
  compose(
    applyMiddleware(thunkMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);

document.addEventListener('DOMContentLoaded', () => {
  const mountNode = document.querySelector('#root');

  ReactDOM.render(
    <AppContainer history={browserHistory} store={store} />,
    mountNode);
});
