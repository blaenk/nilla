import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { browserHistory } from 'react-router';
import _ from 'lodash';

import AppContainer from 'containers/App/AppContainer';
import Reducer from './reducers';

import { getCurrentUser } from 'actions';

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
    const filteredState = _.omit(currentState, ['upload', 'users']);

    window.localStorage.setItem('redux', JSON.stringify(filteredState));
  }
});

store.dispatch(getCurrentUser());

document.addEventListener('DOMContentLoaded', () => {
  const mountNode = document.querySelector('#root');

  ReactDOM.render(
    <AppContainer history={browserHistory} store={store} />,
    mountNode);
});
