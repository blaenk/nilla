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

const MarkedMenuItem = React.createClass({
  propTypes: {
    eventKey: React.PropTypes.func.isRequired,
    children: React.PropTypes.node.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    selected: React.PropTypes.string.isRequired
  },

  markSelected: function() {
    if (this.props.eventKey == this.props.selected) {
      return 'dropdown-menu-selected';
    } else {
      return '';
    }
  },

  render: function() {
    return (
      <MenuItem eventKey={this.props.eventKey} className={this.markSelected()} onSelect={this.props.onSelect}>
        {this.props.children}
      </MenuItem>
    );
  }
});

const Search = React.createClass({
  propTypes: {
    initialScope: React.PropTypes.string.isRequired,
    initialSortBy: React.PropTypes.string.isRequired,
    count: React.PropTypes.number.isRequired
  },

  getInitialState: function() {
    return {
      scope: this.props.initialScope || 'all',
      sortBy: this.props.initialSortBy || 'recent'
    };
  },

  selectScope: function(key, _event) {
    this.setState({scope: key});
  },

  render: function() {
    const item = (name, key) => {
      const onSelect = key => {
        let state = {};
        state[name] = key;
        this.setState(state);
      };

      return (
        <MarkedMenuItem eventKey={key} selected={this.state[name]}
                        onSelect={onSelect} key={key}>
          {key}
        </MarkedMenuItem>
      );
    };

    return (
      <Row styleName='search'>
        <Col lg={12}>
          <InputGroup>
            {/* Scope Button */}
            <InputGroup.Button>
              <DropdownButton title={this.state.scope} styleName='scope'>
                <MenuItem header>Search Scope</MenuItem>
                {['all', 'mine', 'system', 'locked', 'expiring'].map(n => item('scope', n))}
              </DropdownButton>
            </InputGroup.Button>

            {/* Text */}
            <FormControl type='text' placeholder='Search' />

            {/* Sort */}
            <InputGroup.Button>
              <Dropdown>
                <Dropdown.Toggle noCaret styleName='sort'>
                  <Glyphicon glyph='sort' />
                </Dropdown.Toggle>
                <Dropdown.Menu style={{left: 'auto', right: 0}}>
                  <MenuItem header>Sort By</MenuItem>
                  {['name', 'recent'].map(n => item('sortBy', n))}
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
