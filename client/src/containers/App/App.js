import React from 'react';

import styles from 'styles/app.module.css';

const App = React.createClass({
  render: function() {
    return (
      <div className={styles.wrapper}>
        <h1>
          <i className="fa fa-star"></i>
          Environment: {__NODE_ENV__}
        </h1>
      </div>
    );
  }
});

module.exports = App;
