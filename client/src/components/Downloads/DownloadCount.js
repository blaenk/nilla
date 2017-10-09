import React from 'react';
import PropTypes from 'prop-types';
import { InputGroup, Badge } from 'react-bootstrap';

import CSSModules from 'react-css-modules';
import styles from './search.module.less';

class DownloadCount extends React.PureComponent {
  render() {
    return (
      <InputGroup.Addon>
        <Badge styleName='item-count'>{this.props.count}</Badge>
      </InputGroup.Addon>
    );
  }
}

DownloadCount.propTypes = {
  count: PropTypes.number.isRequired,
};

export default CSSModules(DownloadCount, styles);
