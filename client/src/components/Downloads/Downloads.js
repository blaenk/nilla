import React from 'react';
import CSSModules from 'react-css-modules';
import { Row, Col, Glyphicon } from 'react-bootstrap';

import Search from './Search';
import Download from 'components/Downloads/Download';
import DownloadList from 'components/Downloads/DownloadList';

import styles from './styles.module.less';

import { getDownloads } from 'actions';

class Downloads extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    this.props.dispatch(getDownloads());
  }

  render() {
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
}

Downloads.propTypes = {
  downloads: React.PropTypes.arrayOf(React.PropTypes.shape(Download.propTypes))
};

export default CSSModules(Downloads, styles);
