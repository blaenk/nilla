import React, { PropTypes } from 'react';
import { Router, Route, Redirect } from 'react-router';
import { Grid } from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import { Provider } from 'react-redux';

import FilteredDownloads from 'containers/Downloads/FilteredDownloads';

import styles from 'styles/app.module.less';

const App = React.createClass({
  propTypes: {
    history: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  },

  render: function() {
    return (
      <Provider store={this.props.store}>
        <Grid>
          <Router history={this.props.history}>
            <Route path="/downloads" component={FilteredDownloads} />
            <Redirect from="*" to="/downloads" />
          </Router>
        </Grid>
      </Provider>
    );
  }
});

module.exports = CSSModules(App, styles);
