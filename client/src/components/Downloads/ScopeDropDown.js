import React from 'react';
import { MenuItem, InputGroup, DropdownButton } from 'react-bootstrap';

import CSSModules from 'react-css-modules';
import styles from './search.module.less';

import MarkedMenuItem from './MarkedMenuItem';

const ScopeDropDown = React.createClass({
  getInitialState: function() {
    return {
      scope: 'all'
    };
  },

  onChangeScope: function(eventKey, event) {
    this.setState({scope: eventKey});

    this.props.onChangeScope(eventKey, event);
  },

  render: function() {
    const item = (name) => {
      return (
        <MarkedMenuItem eventKey={name} selected={this.state.scope}
                        onSelect={this.onChangeScope} key={name}>
          {name}
        </MarkedMenuItem>
      );
    };

    return (
      <InputGroup.Button>
        <DropdownButton id="downloads_scope" title={this.state.scope} styleName='scope'>
          <MenuItem header>Search Scope</MenuItem>
          {['all', 'mine', 'system', 'locked', 'expiring'].map(item)}
        </DropdownButton>
      </InputGroup.Button>
    );
  }
});

ScopeDropDown.propTypes = {
  onChangeScope: React.PropTypes.func.isRequired
};

export default CSSModules(ScopeDropDown, styles);
