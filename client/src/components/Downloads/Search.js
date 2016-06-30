import React from 'react';
import CSSModules from 'react-css-modules';
import {
  Row,
  Col,
  InputGroup
} from 'react-bootstrap';

import styles from './search.module.less';

import SearchFilterContainer from 'containers/Downloads/SearchFilterContainer';
import ScopeDropDownContainer from 'containers/Downloads/ScopeDropDownContainer';

import OrderDropDown from 'components/Downloads/OrderDropDown';
import DownloadCount from 'components/Downloads/DownloadCount';

const Search = React.createClass({
  propTypes: {
    count: React.PropTypes.number.isRequired,
    onChangeOrder: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <Row styleName='search'>
        <Col lg={12}>
          <InputGroup>
            <ScopeDropDownContainer />
            <SearchFilterContainer />
            <OrderDropDown onChangeOrder={this.props.onChangeOrder} />
            <DownloadCount count={this.props.count} />
          </InputGroup>
        </Col>
      </Row>
    );
  }
});

export default CSSModules(Search, styles);
