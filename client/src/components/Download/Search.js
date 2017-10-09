import React from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import {
  Badge,
  Button,
  FormControl,
  Glyphicon,
  InputGroup,
} from 'react-bootstrap';

import styles from './search.module.less';

class Search extends React.PureComponent {
  constructor(props) {
    super(props);

    this.handleCollapse = this.handleCollapse.bind(this);
  }

  handleCollapse(_event) {
    this.props.collapse(this.props.infoHash, !this.props.isCollapsed);
  }

  render() {
    let collapseButton;

    if (this.props.containsFolders) {
      collapseButton = (
        <InputGroup.Button>
          <Button styleName='global-collapse' onClick={this.handleCollapse}>
            <Glyphicon glyph={this.props.isCollapsed ? 'chevron-down' : 'chevron-up'} />
          </Button>
        </InputGroup.Button>
      );
    }

    return (
      <InputGroup styleName='search'>
        {collapseButton}

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
  collapse: PropTypes.func.isRequired,
  containsFolders: PropTypes.bool,
  count: PropTypes.number.isRequired,
  filter: PropTypes.string.isRequired,
  infoHash: PropTypes.string.isRequired,
  isCollapsed: PropTypes.bool,
  onChangeFilter: PropTypes.func.isRequired,
  onCollapse: PropTypes.func.isRequired,
};

export default CSSModules(Search, styles);
