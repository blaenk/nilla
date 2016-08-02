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

    this.handleCollapse = this.handleCollapse.bind(this);
  }

  handleCollapse(_event) {
    this.props.collapse(this.props.infoHash, !this.props.isCollapsed);
  }

  render() {
    return (
      <InputGroup styleName='search'>
        <InputGroup.Button>
          <Button styleName='global-collapse' onClick={this.handleCollapse}>
            <Glyphicon glyph={this.props.isCollapsed ? 'chevron-down' : 'chevron-up'} />
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
  collapse: React.PropTypes.func.isRequired,
  count: React.PropTypes.number.isRequired,
  filter: React.PropTypes.string.isRequired,
  infoHash: React.PropTypes.string.isRequired,
  isCollapsed: React.PropTypes.bool,
  onChangeFilter: React.PropTypes.func.isRequired,
  onCollapse: React.PropTypes.func.isRequired,
};

export default CSSModules(Search, styles);
