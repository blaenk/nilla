import React from 'react';
import { InputGroup, Badge } from 'react-bootstrap';

import CSSModules from 'react-css-modules';
import styles from './search.module.less';

const DownloadCount = (props) => {
  return (
    <InputGroup.Addon>
      <Badge styleName='item-count'>{props.count}</Badge>
    </InputGroup.Addon>
  );
};

export default CSSModules(DownloadCount, styles);
