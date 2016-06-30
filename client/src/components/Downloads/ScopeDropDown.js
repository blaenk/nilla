import React from 'react';
import { MenuItem, InputGroup, DropdownButton } from 'react-bootstrap';

import CSSModules from 'react-css-modules';
import styles from './search.module.less';

import MarkedMenuItem from './MarkedMenuItem';

const ScopeDropDown = React.createClass({
  propTypes: {
    scope: React.PropTypes.string.isRequired,
    onChangeScope: React.PropTypes.func.isRequired
  },

  onChangeScope: function(eventKey, _event) {
    this.props.onChangeScope(eventKey);
  },

  render: function() {
    const item = (name) => {
      return (
        <MarkedMenuItem eventKey={name} selected={this.props.scope}
                        onSelect={this.onChangeScope} key={name}>
          {name}
        </MarkedMenuItem>
      );
    };

    return (
      <InputGroup.Button>
        <DropdownButton id="downloads_scope" title={this.props.scope} styleName='scope'>
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
