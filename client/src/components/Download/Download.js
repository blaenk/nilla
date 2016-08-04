import React from 'react';
import CSSModules from 'react-css-modules';
import { Row, Col } from 'react-bootstrap';

import { getDownload } from 'actions';

import Header from './Header';
import File from './File';
import FilesSection from './FilesSection';

import SearchContainer from 'containers/Download/SearchContainer';

import styles from './download.module.less';

class Download extends React.Component {
  componentDidMount() {
    const { dispatch } = this.props;

    dispatch(getDownload(this.props.infoHash));
  }

  render() {
    const { download, ui, files } = this.props;

    if (!ui.isAugmented) {
      return null;
    }

    // TODO
    // use a spinner via ui.isFetching

    const fileCount = files.downloaded.length + files.extracted.length;

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
                    locks={download.locks} />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <SearchContainer count={fileCount} infoHash={this.props.infoHash} />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <FilesSection label='EXTRACTED'
                          depth={1}
                          files={files.extracted}
                          isMultiFile={download.isMultiFile}
                          initialCollapse={ui.isCollapsed}
                          downloadName={download.name} />

            <FilesSection label='DOWNLOADED'
                          showLabelIf={download.files.extracted.length > 0}
                          files={files.downloaded}
                          isMultiFile={download.isMultiFile}
                          initialCollapse={ui.isCollapsed}
                          downloadName={download.name} />
          </Col>
        </Row>
      </div>
    );
  }
}

const filesProps = File.propTypes;

Download.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  download: React.PropTypes.shape({
    dateAdded: React.PropTypes.string.isRequired,
    files: React.PropTypes.shape({
      downloaded: React.PropTypes.arrayOf(React.PropTypes.shape(filesProps)),
      extracted: React.PropTypes.arrayOf(React.PropTypes.shape(filesProps)),
    }),
    infoHash: React.PropTypes.string.isRequired,
    isMultiFile: React.PropTypes.bool.isRequired,
    locks: React.PropTypes.array.isRequired,
    name: React.PropTypes.string.isRequired,
    params: React.PropTypes.object.isRequired,
    progress: React.PropTypes.number.isRequired,
    state: React.PropTypes.string.isRequired,
    uploader: React.PropTypes.string.isRequired,
  }),
  files: React.PropTypes.shape({
    downloaded: React.PropTypes.arrayOf(React.PropTypes.shape(filesProps)),
    extracted: React.PropTypes.arrayOf(React.PropTypes.shape(filesProps)),
  }),
  infoHash: React.PropTypes.string.isRequired,
  params: React.PropTypes.object.isRequired,
  ui: React.PropTypes.shape({
    isFetching: React.PropTypes.bool.isRequired,
  }),
};

export default CSSModules(Download, styles);
