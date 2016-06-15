"use strict";

const React = require('react');
const ReactDOM = require('react-dom');

const App = React.createClass({
  render: function() {
    return (<div>Text text text</div>);
  }
});

const mountNode = document.querySelector('#root');
ReactDOM.render(<App />, mountNode);
