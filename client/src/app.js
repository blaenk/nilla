import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { browserHistory } from 'react-router';

import AppContainer from 'containers/App/AppContainer';
import Reducer from './reducers';

const localState = window.localStorage.getItem('redux');
let defaultState;

if (localState !== null) {
  defaultState = JSON.parse(localState);
}

let store = createStore(
  Reducer,
  defaultState,
  compose(
    applyMiddleware(thunkMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);

let currentState;

store.subscribe(() => {
  const previousState = currentState;

  currentState = store.getState();

  if (previousState !== currentState) {
    window.localStorage.setItem('redux', JSON.stringify(currentState));
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const mountNode = document.querySelector('#root');

  ReactDOM.render(
    <AppContainer history={browserHistory} store={store} />,
    mountNode);
});
