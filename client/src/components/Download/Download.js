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

const Download = React.createClass({
  propTypes: {
    dispatch: React.PropTypes.func.isRequired,
    params: React.PropTypes.object.isRequired,
    infoHash: React.PropTypes.string.isRequired,
    dateAdded: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    state: React.PropTypes.string.isRequired,
    progress: React.PropTypes.number.isRequired,
    isMultiFile: React.PropTypes.bool.isRequired,
    uploader: React.PropTypes.string.isRequired,
    files: React.PropTypes.shape({
      downloaded: React.PropTypes.arrayOf(React.PropTypes.shape(filesProps)),
      extracted: React.PropTypes.arrayOf(React.PropTypes.shape(filesProps))
    }),
    locks: React.PropTypes.array.isRequired
  },

  getInitialState: function() {
    return {
      filter: '',
      globalCollapse: true
    };
  },

  componentDidMount: function() {
    const { dispatch } = this.props;

    dispatch(getDownload(this.props.params.infoHash));
  },

  onGlobalCollapse: function(_event) {
    this.setState({ globalCollapse: !this.state.globalCollapse });
  },

  onChangeFilter: function(event) {
    this.setState({ filter: event.target.value });
  },

  render: function() {
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
          <FileTree isMultiFile={this.props.isMultiFile}
                    depth={1}
                    isRoot={true}
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
        <FileTree isMultiFile={this.props.isMultiFile}
                  initialCollapse={this.state.globalCollapse}
                  downloadName={this.props.name}
                  isRoot={true}
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
                    onChangeFilter={this.onChangeFilter}
                    onCollapse={this.onGlobalCollapse} />
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
});

export default CSSModules(Download, styles);
