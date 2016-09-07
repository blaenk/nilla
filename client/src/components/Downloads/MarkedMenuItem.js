import React from 'react';
import { MenuItem } from 'react-bootstrap';

import CSSModules from 'react-css-modules';
import styles from './search.module.less';

class MarkedMenuItem extends React.PureComponent {
  render() {
    const className = this.props.eventKey === this.props.selected
          ? 'dropdown-menu-selected' : '';

    return (
      <MenuItem eventKey={this.props.eventKey}
                className={className}
                onSelect={this.props.onSelect}>
        {this.props.children}
      </MenuItem>
    );
  }
}

MarkedMenuItem.propTypes = {
  children: React.PropTypes.node.isRequired,
  eventKey: React.PropTypes.string.isRequired,
  onSelect: React.PropTypes.func.isRequired,
  selected: React.PropTypes.string.isRequired,
};

export default CSSModules(MarkedMenuItem, styles);
