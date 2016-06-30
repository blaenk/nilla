import React from 'react';
import CSSModules from 'react-css-modules';
import { FormControl } from 'react-bootstrap';

import styles from './search.module.less';

const SearchFilter = React.createClass({
  propTypes: {
    onChangeFilter: React.PropTypes.func.isRequired
  },

  onChangeFilter: function(event) {
    this.props.onChangeFilter(event.target.value);
  },

  render: function() {
    return (
      <FormControl type='text'
                   placeholder='Search'
                   autoFocus={true}
                   onChange={this.onChangeFilter}
                   styleName='search-filter' />
    );
  }
});

export default CSSModules(SearchFilter, styles);
