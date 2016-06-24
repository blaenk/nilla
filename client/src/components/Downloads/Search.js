import React from 'react';
import CSSModules from 'react-css-modules';
import {
  Row,
  Col,
  Badge,
  InputGroup,
  FormControl
} from 'react-bootstrap';

import styles from './search.module.less';

import ScopeDropDown from './ScopeDropDown';
import OrderDropDown from './OrderDropDown';

const Search = React.createClass({
  propTypes: {
    count: React.PropTypes.number.isRequired,
    scope: React.PropTypes.string.isRequired,
    order: React.PropTypes.string.isRequired,

    onChangeScope: React.PropTypes.func.isRequired,
    onChangeOrder: React.PropTypes.func.isRequired
  },

  render: function() {
    return (
      <Row styleName='search'>
        <Col lg={12}>
          <InputGroup>
            {/* Scope Button */}
            <ScopeDropDown scope={this.props.scope} onChangeScope={this.props.onChangeScope} />

            {/* Text */}
            <FormControl type='text' placeholder='Search' />

            {/* Sort */}
            <OrderDropDown order={this.props.order} onChangeOrder={this.props.onChangeOrder} />

            {/* Count */}
            <InputGroup.Addon>
              <Badge styleName='item-count'>{this.props.count}</Badge>
            </InputGroup.Addon>
          </InputGroup>
        </Col>
      </Row>
    );
  }
});

export default CSSModules(Search, styles);
