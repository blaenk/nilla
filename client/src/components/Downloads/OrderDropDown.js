import React from 'react';
import {
  Dropdown,
  Glyphicon,
  InputGroup,
  MenuItem,
} from 'react-bootstrap';

import CSSModules from 'react-css-modules';
import styles from './search.module.less';

import MarkedMenuItem from './MarkedMenuItem';

const OrderDropDown = React.createClass({
  propTypes: {
    onChangeOrder: React.PropTypes.func.isRequired,
    order: React.PropTypes.string.isRequired,
  },

  onChangeOrder(eventKey, _event) {
    this.props.onChangeOrder(eventKey);
  },

  render() {
    const item = (name) => {
      return (
        <MarkedMenuItem eventKey={name} selected={this.props.order}
                        onSelect={this.onChangeOrder} key={name}>
          {name}
        </MarkedMenuItem>
      );
    };

    return (
      <InputGroup.Button>
        <Dropdown id='sort_order'>
          <Dropdown.Toggle noCaret styleName='sort'>
            <Glyphicon glyph='sort' />
          </Dropdown.Toggle>

          <Dropdown.Menu style={{ left: 'auto', right: 0 }}>
            <MenuItem header>Sort By</MenuItem>
            {['name', 'recent'].map(item)}
          </Dropdown.Menu>
        </Dropdown>
      </InputGroup.Button>
    );
  },
});

export default CSSModules(OrderDropDown, styles);
