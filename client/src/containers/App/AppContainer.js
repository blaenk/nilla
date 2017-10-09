import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import CSSModules from 'react-css-modules';

import { Provider } from 'react-redux';

import InternalPage from 'components/App/InternalPage';

import styles from 'styles/app.module.less';

function AppContainer(props) {
  return (
    <Provider store={props.store}>
      <BrowserRouter>
        <Route component={InternalPage} />
      </BrowserRouter>
    </Provider>
  );
}

AppContainer.propTypes = {
  store: PropTypes.object.isRequired,
};

export default CSSModules(AppContainer, styles);
