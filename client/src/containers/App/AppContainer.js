import React, { PropTypes } from 'react';
import { Router, Route, Redirect} from 'react-router';
import CSSModules from 'react-css-modules';

import { Provider } from 'react-redux';

import FilteredDownloads from 'containers/Downloads/FilteredDownloads';
import DownloadContainer from 'containers/Download/DownloadContainer';
import InternalPage from 'components/App/InternalPage';

import styles from 'styles/app.module.less';

// TODO
// make this Routes.js?

const AppContainer = React.createClass({
  propTypes: {
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  },

  render: function() {
    return (
      <Provider store={this.props.store}>
        <Router history={this.props.history}>
          <Redirect from="/" to="/downloads" />

          <Route path="/" component={InternalPage}>
            <Route path="downloads" component={FilteredDownloads} />
            <Route path="downloads/:infoHash(/:name)" component={DownloadContainer} />
          </Route>
        </Router>
      </Provider>
    );
  }
});

export default CSSModules(AppContainer, styles);
