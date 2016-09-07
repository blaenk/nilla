import React from 'react';
import CSSModules from 'react-css-modules';
import { Row, Col, Glyphicon } from 'react-bootstrap';

import Search from './Search';
import Download from 'components/Downloads/Download';
import DownloadList from 'components/Downloads/DownloadList';

import styles from './styles.module.less';

import { getDownloads, setDownloadsLastSeen } from 'actions';

class Downloads extends React.Component {
  componentWillMount() {
    this.props.dispatch(getDownloads());

    this.updateLastSeen = this.updateLastSeen.bind(this);

    window.addEventListener('beforeunload', this.updateLastSeen);
  }

  updateLastSeen() {
    this.props.dispatch(setDownloadsLastSeen(new Date()));
  }

  componentWillUnmount() {
    clearTimeout(this.pollTimeout);

    this.updateLastSeen();

    window.removeEventListener('beforeunload', this.updateLastSeen);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.downloads !== nextProps.downloads) {
      clearTimeout(this.pollTimeout);

      if (!nextProps.ui.isFetching) {
        this.startPoll();
      }
    }
  }

  startPoll() {
    const { dispatch } = this.props;

    const POLL_RATE = 5000;

    this.pollTimeout = setTimeout(() => {
      dispatch(getDownloads());
    }, POLL_RATE);
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
            <Glyphicon glyph='ban-circle' />
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
  dispatch: React.PropTypes.func.isRequired,
  downloads: React.PropTypes.arrayOf(React.PropTypes.shape(Download.propTypes)),
};

export default CSSModules(Downloads, styles);
