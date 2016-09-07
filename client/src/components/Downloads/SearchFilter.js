import React from 'react';
import CSSModules from 'react-css-modules';
import { FormControl } from 'react-bootstrap';

import styles from './search.module.less';

class SearchFilter extends React.PureComponent {
  render() {
    return (
      <FormControl type='text'
                   placeholder='Search'
                   autoFocus
                   onChange={this.props.onChangeFilter}
                   value={this.props.filter}
                   styleName='search-filter' />
    );
  }
}

SearchFilter.propTypes = {
  filter: React.PropTypes.string.isRequired,
  onChangeFilter: React.PropTypes.func.isRequired,
};

export default CSSModules(SearchFilter, styles);
