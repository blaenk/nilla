import React from 'react';
import ReactDOM from 'react-dom';

import { browserHistory } from 'react-router';

import 'font-awesome/css/font-awesome.css';
import 'bootstrap/dist/css/bootstrap.css';

import App from 'containers/App/App';

document.addEventListener("DOMContentLoaded", function() {
  const mountNode = document.querySelector('#root');
  ReactDOM.render(
    <App history={browserHistory} />,
    mountNode);
});
