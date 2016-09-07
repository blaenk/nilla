import React from 'react';
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
      clearTimeout(this.pollTimeout);

      if (!nextProps.ui.isFetching) {
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
        <EditFilesContainer infoHash={this.props.infoHash} files={files.downloaded} />
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
            <Header infoHash={download.infoHash}
                    dateAdded={download.dateAdded}
                    name={download.name}
                    state={download.state}
                    progress={download.progress}
                    uploader={download.uploader}
                    locks={download.locks}
                    users={users} />
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
                          isMultiFile={download.isMultiFile}
                          initialCollapse={ui.isCollapsed}
                          downloadName={download.name} />

            <FilesSection label='DOWNLOADED'
                          showLabelIf={download.files.extracted.length > 0}
                          infoHash={this.props.infoHash}
                          files={files.downloaded}
                          isMultiFile={download.isMultiFile}
                          initialCollapse={ui.isCollapsed}
                          isEditing={ui.isEditing}
                          downloadName={download.name} />
          </Col>
        </Row>
      </div>
    );
  }
}

Download.propTypes = {
  currentUser: React.PropTypes.object.isRequired,
  dispatch: React.PropTypes.func.isRequired,
  download: React.PropTypes.shape({
    dateAdded: React.PropTypes.object.isRequired,
    files: React.PropTypes.shape({
      downloaded: React.PropTypes.array.isRequired,
      extracted: React.PropTypes.array.isRequired,
    }),
    infoHash: React.PropTypes.string.isRequired,
    isMultiFile: React.PropTypes.bool.isRequired,
    locks: React.PropTypes.array.isRequired,
    name: React.PropTypes.string.isRequired,
    progress: React.PropTypes.number.isRequired,
    state: React.PropTypes.string.isRequired,
    uploader: React.PropTypes.string.isRequired,
  }),
  files: React.PropTypes.shape({
    downloaded: React.PropTypes.array.isRequired,
    extracted: React.PropTypes.array.isRequired,
  }),
  infoHash: React.PropTypes.string.isRequired,
  params: React.PropTypes.object.isRequired,
  ui: React.PropTypes.shape({
    isFetching: React.PropTypes.bool.isRequired,
    isCollapsed: React.PropTypes.bool.isRequired,
  }),
  users: React.PropTypes.object.isRequired,
};

export default CSSModules(Download, styles);
