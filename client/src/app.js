import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { browserHistory } from 'react-router';
import _ from 'lodash';

import AppContainer from 'containers/App/AppContainer';
import Reducer from './reducers';

import { getCurrentUser } from 'actions';

let defaultState;

function loadLocalStorage() {
  const localState = window.localStorage.getItem('redux');

  if (localState !== null) {
    try {
      return JSON.parse(localState);
    } catch (e) {
      // Leaving defaultState undefined is expected behavior for redux to
      // initialize with each states' default state.
      //
      // The corrupted localStorage state will be overwritten by redux.
    }
  }
}

if (__NODE_ENV__ === 'production') {
  defaultState = loadLocalStorage();
}

let store = createStore(
  Reducer,
  defaultState,
  compose(
    applyMiddleware(thunkMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);

function saveLocalStorage() {
  let previousState;

  return () => {
    const currentState = store.getState();

    if (previousState !== currentState) {
      const state = _.cloneDeep(currentState);

      _.unset(state, 'ui.upload');
      _.unset(state, 'data.users');

      window.localStorage.setItem('redux', JSON.stringify(state));
    }

    previousState = currentState;
  };
}

if (__NODE_ENV__ === 'production') {
  store.subscribe(saveLocalStorage());
}

store.dispatch(getCurrentUser());

document.addEventListener('DOMContentLoaded', () => {
  const mountNode = document.querySelector('#root');

  ReactDOM.render(
    <AppContainer history={browserHistory} store={store} />,
    mountNode);
});
