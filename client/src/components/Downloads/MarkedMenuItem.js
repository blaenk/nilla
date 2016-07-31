import React from 'react';
import { MenuItem } from 'react-bootstrap';

import CSSModules from 'react-css-modules';
import styles from './search.module.less';

function MarkedMenuItem(props) {
  return (
    <MenuItem eventKey={props.eventKey}
              className={props.eventKey === props.selected ? 'dropdown-menu-selected' : ''}
              onSelect={props.onSelect}>
      {props.children}
    </MenuItem>
  );
}

MarkedMenuItem.propTypes = {
  children: React.PropTypes.node.isRequired,
  eventKey: React.PropTypes.string.isRequired,
  onSelect: React.PropTypes.func.isRequired,
  selected: React.PropTypes.string.isRequired,
};

export default CSSModules(MarkedMenuItem, styles);
