import React from 'react';
import CSSModules from 'react-css-modules';
import { Row, Col } from 'react-bootstrap';

import Header from './Header';
import Search from './Search';
import FileTree from './FileTree';
import File from './File';

import styles from './download.module.less';

import { fuzzyPattern } from 'common';

import { getDownload } from 'actions';

const filesProps = File.propTypes;

delete filesProps.isMultiFile;
delete filesProps.downloadName;

class Download extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      filter: '',
      globalCollapse: true,
    };

    this.handleGlobalCollapse = this.handleGlobalCollapse.bind(this);
    this.handleChangeFilter = this.handleChangeFilter.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;

    dispatch(getDownload(this.props.params.infoHash));
  }

  handleGlobalCollapse(_event) {
    this.setState({ globalCollapse: !this.state.globalCollapse });
  }

  handleChangeFilter(event) {
    this.setState({ filter: event.target.value });
  }

  render() {
    if (!('files' in this.props)) {
      return null;
    }

    const filterRE = fuzzyPattern(this.state.filter);

    // TODO
    // DRY this all up.

    let extractedVisibleCount = 0;

    let extractedFilesSection = null;

    if (this.props.files.extracted.length > 0) {
      const extractedFiles = this.props.files.extracted.map(file => {
        file.isHidden = !file.pathComponents.some(c => filterRE.test(c));

        extractedVisibleCount += file.isHidden ? 0 : 1;

        return file;
      });

      let sectionLabel = null;

      if (extractedVisibleCount > 0) {
        sectionLabel = (
          <p styleName='section-label'>EXTRACTED ({extractedVisibleCount})</p>
        );
      }

      extractedFilesSection = (
        <div styleName='files'>
          {sectionLabel}
          <FileTree isRoot
                    isMultiFile={this.props.isMultiFile}
                    depth={1}
                    initialCollapse={this.state.globalCollapse}
                    downloadName={this.props.name}
                    files={extractedFiles} />
        </div>
      );
    }

    let downloadedVisibleCount = 0;

    const downloadedFiles = this.props.files.downloaded.map(file => {
      file.isHidden = !file.pathComponents.some(c => filterRE.test(c));

      downloadedVisibleCount += file.isHidden ? 0 : 1;

      return file;
    });

    let downloadedSectionLabel = null;

    if (extractedFilesSection && downloadedVisibleCount > 0) {
      downloadedSectionLabel = (
        <p styleName='section-label'>DOWNLOADED ({downloadedVisibleCount})</p>
      );
    }

    const downloadedFilesSection = (
      <div styleName='files'>
        {downloadedSectionLabel}
        <FileTree isRoot
                  isMultiFile={this.props.isMultiFile}
                  initialCollapse={this.state.globalCollapse}
                  downloadName={this.props.name}
                  files={downloadedFiles} />
      </div>
    );

    const totalVisibleCount = extractedVisibleCount + downloadedVisibleCount;

    return (
      <div>
        <Row>
          <Col lg={12}>
            <Header infoHash={this.props.infoHash}
                    dateAdded={this.props.dateAdded}
                    name={this.props.name}
                    state={this.props.state}
                    progress={this.props.progress}
                    uploader={this.props.uploader}
                    locks={this.props.locks} />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            <Search count={totalVisibleCount}
                    onChangeFilter={this.handleChangeFilter}
                    onCollapse={this.handleGlobalCollapse} />
          </Col>
        </Row>

        <Row>
          <Col lg={12}>
            {extractedFilesSection}
            {downloadedFilesSection}
          </Col>
        </Row>
      </div>
    );
  }
}

Download.propTypes = {
  dateAdded: React.PropTypes.string.isRequired,
  dispatch: React.PropTypes.func.isRequired,
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
};

export default CSSModules(Download, styles);
