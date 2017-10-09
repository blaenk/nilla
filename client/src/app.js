import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';
import _ from 'lodash';

import AppContainer from 'containers/App/AppContainer';
import Reducer from './reducers';

import { getCurrentUser } from 'actions';

function loadLocalStorage() {
  const localState = window.localStorage.getItem('redux');

  if (localState !== null) {
    try {
      const parsed = JSON.parse(localState);

      if (parsed.data.downloads) {
        parsed.data.download = parsed.data.downloads.map(d => {
          d.dateAdded = new Date(d.dateAdded);

          return d;
        });
      }

      if (parsed.ui && parsed.ui.downloads && parsed.ui.downloads.lastSeen) {
        parsed.ui.downloads.lastSeen = new Date(parsed.ui.downloads.lastSeen);
      }

      return parsed;
    } catch (e) {
      // Leaving defaultState undefined is expected behavior for redux to
      // initialize with each states' default state.
      //
      // The corrupted localStorage state will be overwritten by redux.
    }
  }
}

const defaultState = loadLocalStorage();

function saveLocalStorage() {
  const state = window.store.getState();

  _.unset(state, 'ui.upload');
  _.unset(state, 'data.users');
  _.unset(state, 'data.invitations');
  _.unset(state, 'data.trackers');

  window.localStorage.setItem('redux', JSON.stringify(state));
}

window.addEventListener('beforeunload', saveLocalStorage);

const handleLogout = _store => next => action => {
  if (action.type === 'LOGOUT') {
    window.removeEventListener('beforeunload', saveLocalStorage);
    window.localStorage.clear();
    window.location.href = '/login';

    return;
  }

  return next(action);
};

window.store = createStore(
  Reducer,
  defaultState,
  compose(
    applyMiddleware(handleLogout, thunkMiddleware),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  )
);

window.store.dispatch(getCurrentUser());

document.addEventListener('DOMContentLoaded', () => {
  const mountNode = document.querySelector('#root');

  ReactDOM.render(
    <AppContainer store={window.store} />,
    mountNode);
});
