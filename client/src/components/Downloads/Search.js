import React from 'react';
import CSSModules from 'react-css-modules';
import {
  Row,
  Col,
  InputGroup
} from 'react-bootstrap';

import styles from './search.module.less';

import SetScope from 'containers/Downloads/SetScope';
import SetOrder from 'containers/Downloads/SetOrder';
import DownloadCount from 'components/Downloads/DownloadCount';
import DownloadFilter from 'containers/Downloads/DownloadFilter';

const Search = React.createClass({
  propTypes: {
    count: React.PropTypes.number.isRequired
  },

  render: function() {
    return (
      <Row styleName='search'>
        <Col lg={12}>
          <InputGroup>
            <SetScope />
            <DownloadFilter />
            <SetOrder />
            <DownloadCount count={this.props.count} />
          </InputGroup>
        </Col>
      </Row>
    );
  }
});

export default CSSModules(Search, styles);
