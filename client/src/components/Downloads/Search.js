import React from 'react';
import CSSModules from 'react-css-modules';
import {
  Row,
  Col,
  Badge,
  InputGroup,
  Button,
  DropdownButton,
  Dropdown,
  Glyphicon,
  MenuItem,
  FormControl
} from 'react-bootstrap';

import styles from './search.module.less';

const MarkedMenuItem = (props) => {
  return (
    <MenuItem eventKey={props.eventKey}
              className={props.eventKey == props.selected ? 'dropdown-menu-selected' : ''}
              onSelect={props.onSelect}>
      {props.children}
    </MenuItem>
  );
};

MarkedMenuItem.propTypes = {
  eventKey: React.PropTypes.string.isRequired,
  children: React.PropTypes.node.isRequired,
  onSelect: React.PropTypes.func.isRequired,
  selected: React.PropTypes.string.isRequired
};

const Search = React.createClass({
  propTypes: {
    count: React.PropTypes.number.isRequired,
    scope: React.PropTypes.string.isRequired,
    order: React.PropTypes.string.isRequired,

    onChangeScope: React.PropTypes.func.isRequired,
    onChangeOrder: React.PropTypes.func.isRequired
  },

  render: function() {
    const item = (what, name) => {
      const capitalName = what.charAt(0).toUpperCase() + what.slice(1);

      return (
        <MarkedMenuItem eventKey={name} selected={this.props[what]}
                        onSelect={this.props[`onChange${capitalName}`]} key={name}>
          {name}
        </MarkedMenuItem>
      );
    };

    return (
      <Row styleName='search'>
        <Col lg={12}>
          <InputGroup>
            {/* Scope Button */}
            <InputGroup.Button>
              <DropdownButton id="downloads_scope" title={this.props.scope} styleName='scope'>
                <MenuItem header>Search Scope</MenuItem>
                {['all', 'mine', 'system', 'locked', 'expiring'].map(n => item('scope', n))}
              </DropdownButton>
            </InputGroup.Button>

            {/* Text */}
            <FormControl type='text' placeholder='Search' />

            {/* Sort */}
            <InputGroup.Button>
              <Dropdown id="sort_order">
                <Dropdown.Toggle noCaret styleName='sort'>
                  <Glyphicon glyph='sort' />
                </Dropdown.Toggle>
                <Dropdown.Menu style={{left: 'auto', right: 0}}>
                  <MenuItem header>Sort By</MenuItem>
                  {['name', 'recent'].map(n => item('order', n))}
                </Dropdown.Menu>
              </Dropdown>
            </InputGroup.Button>

            {/* Sort */}
            <InputGroup.Addon>
              <Badge styleName='item-count'>{this.props.count}</Badge>
            </InputGroup.Addon>
          </InputGroup>
        </Col>
      </Row>
    );
  }
});

export default CSSModules(Search, styles);
