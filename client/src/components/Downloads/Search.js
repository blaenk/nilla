import React from 'react';
import CSSModules from 'react-css-modules';
import {
  Row,
  Col,
  InputGroup,
} from 'react-bootstrap';

import styles from './search.module.less';

import SearchFilterContainer from 'containers/Downloads/SearchFilterContainer';
import ScopeDropDownContainer from 'containers/Downloads/ScopeDropDownContainer';
import OrderDropDownContainer from 'containers/Downloads/OrderDropDownContainer';

import DownloadCount from 'components/Downloads/DownloadCount';

const Search = React.createClass({
  propTypes: {
    count: React.PropTypes.number.isRequired,
  },

  render: function() {
    return (
      <Row styleName='search'>
        <Col lg={12}>
          <InputGroup>
            <ScopeDropDownContainer />
            <SearchFilterContainer />
            <OrderDropDownContainer />
            <DownloadCount count={this.props.count} />
          </InputGroup>
        </Col>
      </Row>
    );
  },
});

export default CSSModules(Search, styles);
