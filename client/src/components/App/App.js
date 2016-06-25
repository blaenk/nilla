import React from 'react';
import { Grid } from 'react-bootstrap';
import CSSModules from 'react-css-modules';

import Header from './Header';
import styles from 'styles/app.module.less';

const App = React.createClass({
  propTypes: {
    children: React.PropTypes.node.isRequired
  },

  render: function() {
    return (
      <div>
        <Grid>
          <Header/>
          {this.props.children}
        </Grid>
      </div>
    );
  }
});

module.exports = CSSModules(App, styles);
