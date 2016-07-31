import React, { PropTypes } from 'react';
import { Router, Route, Redirect } from 'react-router';
import CSSModules from 'react-css-modules';

import { Provider } from 'react-redux';

import FilteredDownloads from 'containers/Downloads/FilteredDownloads';
import DownloadContainer from 'containers/Download/DownloadContainer';
import InternalPage from 'components/App/InternalPage';

import styles from 'styles/app.module.less';

// TODO
// make this Routes.js?

function AppContainer(props) {
  return (
    <Provider store={props.store}>
      <Router history={props.history}>
        <Redirect from='/' to='/downloads' />

        <Route path='/' component={InternalPage}>
          <Route path='downloads' component={FilteredDownloads} />
          <Route path='downloads/:infoHash(/:name)' component={DownloadContainer} />
        </Route>
      </Router>
    </Provider>
  );
}

AppContainer.propTypes = {
  history: PropTypes.object.isRequired,
  store: PropTypes.object.isRequired,
};

export default CSSModules(AppContainer, styles);
