import React from 'react';
import PropTypes from 'prop-types';
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
  children: PropTypes.node.isRequired,
  eventKey: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  selected: PropTypes.string.isRequired,
};

export default CSSModules(MarkedMenuItem, styles);
