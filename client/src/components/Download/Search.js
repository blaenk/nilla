import React from 'react';
import CSSModules from 'react-css-modules';
import {
  Badge,
  Button,
  FormControl,
  Glyphicon,
  InputGroup,
} from 'react-bootstrap';

import styles from './search.module.less';

const Search = React.createClass({
  propTypes: {
    count: React.PropTypes.number.isRequired,
    initialCollapse: React.PropTypes.bool,

    onCollapse: React.PropTypes.func.isRequired,
    onChangeFilter: React.PropTypes.func.isRequired,
  },

  getInitialState: function() {
    return {
      isCollapsed: true,
    };
  },

  onCollapse: function(event) {
    this.setState({ isCollapsed: !this.state.isCollapsed });

    this.props.onCollapse(event);
  },

  render: function() {
    return (
      <InputGroup styleName='search'>
        <InputGroup.Button>
          <Button styleName='global-collapse' onClick={this.onCollapse}>
            <Glyphicon glyph={this.state.isCollapsed ? 'chevron-down' : 'chevron-up'} />
          </Button>
        </InputGroup.Button>

        <FormControl type='text'
                     placeholder='Search'
                     autoFocus={true}
                     styleName='search-filter'
                     onChange={this.props.onChangeFilter}/>

        <InputGroup.Addon>
          <Badge styleName='item-count'>{this.props.count}</Badge>
        </InputGroup.Addon>
      </InputGroup>
    );
  },
});

export default CSSModules(Search, styles);
