import React from 'react';
import ReactDOM from 'react-dom';

import 'font-awesome/css/font-awesome.css';
import styles from './styles/app.module.css';

const App = React.createClass({
  render: function() {
    return (
      <div className={styles['container']}>
        <i className="fa fa-star"></i>
        Environment: {__NODE_ENV__}
      </div>
    );
  }
});

const mountNode = document.querySelector('#root');
ReactDOM.render(<App />, mountNode);
