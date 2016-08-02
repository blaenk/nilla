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

class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = { isCollapsed: true };

    this.handleCollapse = this.handleCollapse.bind(this);
  }

  handleCollapse(event) {
    this.setState({ isCollapsed: !this.state.isCollapsed });

    this.props.onCollapse(event);
  }

  render() {
    return (
      <InputGroup styleName='search'>
        <InputGroup.Button>
          <Button styleName='global-collapse' onClick={this.handleCollapse}>
            <Glyphicon glyph={this.state.isCollapsed ? 'chevron-down' : 'chevron-up'} />
          </Button>
        </InputGroup.Button>

        <FormControl type='text'
                     placeholder='Search'
                     autoFocus
                     styleName='search-filter'
                     value={this.props.filter}
                     onChange={this.props.onChangeFilter} />

        <InputGroup.Addon>
          <Badge styleName='item-count'>{this.props.count}</Badge>
        </InputGroup.Addon>
      </InputGroup>
    );
  }
}

Search.propTypes = {
  count: React.PropTypes.number.isRequired,
  filter: React.PropTypes.string.isRequired,
  initialCollapse: React.PropTypes.bool,
  onChangeFilter: React.PropTypes.func.isRequired,
  onCollapse: React.PropTypes.func.isRequired,
};

export default CSSModules(Search, styles);
