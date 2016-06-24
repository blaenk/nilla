import React, { PropTypes } from 'react';
import { Router, Route, Redirect } from 'react-router';
import { Grid } from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import { Provider } from 'react-redux';

import Downloads from 'components/Downloads/Downloads';

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
            <Route path="/downloads" component={Downloads} />
            <Redirect from="*" to="/downloads" />
          </Router>
        </Grid>
      </Provider>
    );
  }
});

module.exports = CSSModules(App, styles);
