import React from 'react';
import PropTypes from 'prop-types';
import CSSModules from 'react-css-modules';
import { Row, Col } from 'react-bootstrap';

import { getDownload } from 'actions';
import { userCan } from 'common';

import Header from './Header';
import FilesSection from './FilesSection';
import Statistics from './Statistics';

import EditFilesContainer from 'containers/Download/EditFilesContainer';
import SearchContainer from 'containers/Download/SearchContainer';
import CommandBarContainer from 'containers/Download/CommandBarContainer';

import styles from './download.module.less';

class Download extends React.PureComponent {
  componentWillMount() {
    const { dispatch } = this.props;

    dispatch(getDownload(this.props.infoHash));
  }

  componentWillUnmount() {
    document.title = 'NILLA';

    clearTimeout(this.pollTimeout);
  }

  startPoll() {
    const { dispatch } = this.props;

    const isDownloading = this.props.download && this.props.download.state === 'downloading';

    // eslint-disable-next-line no-magic-numbers
    const POLL_RATE = isDownloading ? 3000 : 10000;

    this.pollTimeout = setTimeout(() => {
      dispatch(getDownload(this.props.infoHash));
    }, POLL_RATE);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.download !== nextProps.download) {
      document.title = nextProps.download.name;

      clearTimeout(this.pollTimeout);

      if (nextProps.ui && !nextProps.ui.isFetching) {
        this.startPoll();
      }
    }
  }

  render() {
    const { download, ui, files, users, currentUser } = this.props;

    if (!download || !ui || !users || !currentUser) {
      return null;
    }

    // TODO
    // use a spinner via ui.isFetching

    const canDownload = currentUser && userCan(currentUser, 'download');

    const commandBar = canDownload ? (
      <CommandBarContainer infoHash={this.props.infoHash} />
    ) : null;

    const fileCount = files.downloaded.length + files.extracted.length;

    let editFiles;

    if (ui.isEditing) {
      editFiles = (
        <EditFilesContainer
          infoHash={this.props.infoHash}
          files={download.files.downloaded}
          filteredFiles={files.downloaded} />
      );
    }

    let stats;

    if (ui.showStats) {
      stats = <Statistics download={download} />;
    }

    let search;

    if ((download.files.downloaded.length + download.files.extracted.length) > 1) {
      search = (
        <Row>
          <Col lg={12}>
            <SearchContainer count={fileCount} infoHash={this.props.infoHash} />
          </Col>
        </Row>
      );
    }

    return (
      <div>
        <Row>
          <Col lg={12}>
            <Header download={download} users={users} />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            {commandBar}
          </Col>
        </Row>

        {stats}

        {search}

        {editFiles}

        <Row>
          <Col lg={12}>
            <FilesSection label='EXTRACTED'
                          depth={1}
                          infoHash={this.props.infoHash}
                          files={files.extracted}
                          isCrossSeeding={download.isCrossSeeding}
                          isMultiFile={download.isMultiFile}
                          initialCollapse={ui.isCollapsed}
                          directory={download.directory} />

            <FilesSection label='DOWNLOADED'
                          showLabelIf={download.files.extracted.length > 0}
                          infoHash={this.props.infoHash}
                          files={files.downloaded}
                          isCrossSeeding={download.isCrossSeeding}
                          isMultiFile={download.isMultiFile}
                          initialCollapse={ui.isCollapsed}
                          isEditing={ui.isEditing}
                          directory={download.directory} />
          </Col>
        </Row>
      </div>
    );
  }
}

Download.propTypes = {
  currentUser: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  download: PropTypes.shape({
    dateAdded: PropTypes.object.isRequired,
    files: PropTypes.shape({
      downloaded: PropTypes.array.isRequired,
      extracted: PropTypes.array.isRequired,
    }),
    infoHash: PropTypes.string.isRequired,
    isMultiFile: PropTypes.bool.isRequired,
    locks: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    progress: PropTypes.number.isRequired,
    state: PropTypes.string.isRequired,
    uploader: PropTypes.string.isRequired,
  }),
  files: PropTypes.shape({
    downloaded: PropTypes.array.isRequired,
    extracted: PropTypes.array.isRequired,
  }),
  infoHash: PropTypes.string.isRequired,
  params: PropTypes.object.isRequired,
  ui: PropTypes.shape({
    isFetching: PropTypes.bool.isRequired,
    isCollapsed: PropTypes.bool.isRequired,
  }),
  users: PropTypes.object.isRequired,
};

export default CSSModules(Download, styles);
