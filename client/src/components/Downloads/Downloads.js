import React from 'react';
import CSSModules from 'react-css-modules';
import { Row, Col, Glyphicon } from 'react-bootstrap';

import Search from './Search';
import Download from 'components/Downloads/Download';
import DownloadList from 'components/Downloads/DownloadList';

import styles from './styles.module.less';

const Downloads = React.createClass({
  propTypes: {
    downloads: React.PropTypes.arrayOf(React.PropTypes.shape(Download.propTypes))
  },

  render: function() {
    let visibleCount = this.props.downloads.reduce((acc, next) => {
      return acc + (next.isHidden ? 0 : 1);
    }, 0);

    let body;

    if (visibleCount > 0) {
      body = (
        <DownloadList downloads={this.props.downloads} />
      );
    } else {
      body = (
        <Row>
          <Col lg={12} styleName='empty-downloads'>
            <Glyphicon glyph="ban-circle" />
          </Col>
        </Row>
      );
    }

    return (
      <div>
        <Search count={visibleCount} />
        {body}
      </div>
    );
  }
});

export default CSSModules(Downloads, styles);
