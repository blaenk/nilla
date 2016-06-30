import React from 'react';
import CSSModules from 'react-css-modules';
import {
  Row,
  Col,
  InputGroup
} from 'react-bootstrap';

import styles from './search.module.less';

import ScopeDropDown from 'components/Downloads/ScopeDropDown';
import OrderDropDown from 'components/Downloads/OrderDropDown';
import SearchFilter from 'components/Downloads/SearchFilter';
import DownloadCount from 'components/Downloads/DownloadCount';

const Search = React.createClass({
  propTypes: {
    count: React.PropTypes.number.isRequired,
    onChangeScope: React.PropTypes.func.isRequired,
    onChangeOrder: React.PropTypes.func.isRequired,
    onChangeFilter: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <Row styleName='search'>
        <Col lg={12}>
          <InputGroup>
            <ScopeDropDown onChangeScope={this.props.onChangeScope} />
            <SearchFilter onChangeFilter={this.props.onChangeFilter} />
            <OrderDropDown onChangeOrder={this.props.onChangeOrder} />
            <DownloadCount count={this.props.count} />
          </InputGroup>
        </Col>
      </Row>
    );
  }
});

export default CSSModules(Search, styles);
