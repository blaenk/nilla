import React from 'react';
import CSSModules from 'react-css-modules';
import { FormControl } from 'react-bootstrap';

import styles from './search.module.less';

const SearchFilter = React.createClass({
  propTypes: {
    filter: React.PropTypes.string.isRequired,
    onChangeFilter: React.PropTypes.func.isRequired,
  },

  onChangeFilter(event) {
    this.props.onChangeFilter(event.target.value);
  },

  render() {
    return (
      <FormControl type='text'
                   placeholder='Search'
                   autoFocus
                   onChange={this.onChangeFilter}
                   value={this.props.filter}
                   styleName='search-filter' />
    );
  },
});

export default CSSModules(SearchFilter, styles);
