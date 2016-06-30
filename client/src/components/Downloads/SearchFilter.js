import React from 'react';
import CSSModules from 'react-css-modules';
import { FormControl } from 'react-bootstrap';

import styles from './search.module.less';

const SearchFilter = props => {
  return (
    <FormControl type='text'
                 placeholder='Search'
                 autoFocus={true}
                 onChange={props.onChangeFilter}
                 styleName='search-filter' />
  );
};

SearchFilter.propTypes = {
  onChangeFilter: React.PropTypes.func.isRequired
};

export default CSSModules(SearchFilter, styles);