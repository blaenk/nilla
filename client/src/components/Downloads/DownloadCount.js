import React from 'react';
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
  count: React.PropTypes.number.isRequired,
};

export default CSSModules(DownloadCount, styles);
