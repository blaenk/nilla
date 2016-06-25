import React from 'react';
import { MenuItem, InputGroup, DropdownButton } from 'react-bootstrap';

import CSSModules from 'react-css-modules';
import styles from './search.module.less';

import MarkedMenuItem from './MarkedMenuItem';

const ScopeDropDown = (props) => {
  const item = (name) => {
    return (
      <MarkedMenuItem eventKey={name} selected={props.scope}
                      onSelect={props.onChangeScope} key={name}>
        {name}
      </MarkedMenuItem>
    );
  };

  return (
    <InputGroup.Button>
      <DropdownButton id="downloads_scope" title={props.scope} styleName='scope'>
        <MenuItem header>Search Scope</MenuItem>
        {['all', 'mine', 'system', 'locked', 'expiring'].map(item)}
      </DropdownButton>
    </InputGroup.Button>
  );
};

ScopeDropDown.propTypes = {
  scope: React.PropTypes.string.isRequired,
  onChangeScope: React.PropTypes.func.isRequired
};

export default CSSModules(ScopeDropDown, styles);