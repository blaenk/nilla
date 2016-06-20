import React, { PropTypes } from 'react';
import { Router, Route, Redirect } from 'react-router';
import { Grid } from 'react-bootstrap';

import CSSModules from 'react-css-modules';

import Downloads from 'components/Downloads/Downloads';

import styles from 'styles/app.module.less';

const App = React.createClass({
  propTypes: {
    history: PropTypes.object.isRequired
  },

  render: function() {
    // TODO
    // lazy load this?
    // instead of using container, use <Grid>?
    return (
      <Grid>
        <Router history={this.props.history}>
          <Route path="/downloads" component={Downloads} />
          <Redirect from="*" to="/downloads" />
        </Router>
      </Grid>
    );
  }
});

module.exports = CSSModules(App, styles);
