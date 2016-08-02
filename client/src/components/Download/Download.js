import React from 'react';
import CSSModules from 'react-css-modules';
import { Row, Col } from 'react-bootstrap';

import { fuzzyPattern } from 'common';
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
    const { download, ui } = this.props;

    if (!ui.isAugmented) {
      return null;
    }

    // TODO
    // use a spinner
    // if (isFetching) {
    //   console.log('fetching ...');

    //   return (
    //     <p>Fetching ...</p>
    //   );
    // }

    const filterRE = fuzzyPattern(ui.filter);

    // FIXME
    // DRY this all up.

    function hideFiltered(files, filterRE) {
      let visibleCount = 0;

      // TODO
      // this seems to be mutating the state given by the reducer, which AFAIK
      // is a bad idea. perhaps it should be the case that on filter change,
      // this stuff should be computed in the reducer?
      // then visibleCount could be set somewhere
      const filteredFiles = files.map(file => {
        let isHidden = false;

        if (file.pathComponents.some(c => filterRE.test(c))) {
          visibleCount += 1;
        } else {
          isHidden = true;
        }

        return Object.assign({}, file, { isHidden });
      });

      return {
        files: filteredFiles,
        visibleCount,
      };
    }

    const { files: extractedFiles, visibleCount: extractedVisibleCount }
          = hideFiltered(download.files.extracted, filterRE);

    const extractedFilesSection = (
      <FilesSection label='EXTRACTED'
                    files={extractedFiles}
                    visibleCount={extractedVisibleCount}
                    depth={1}
                    isMultiFile={download.isMultiFile}
                    initialCollapse={ui.isCollapsed}
                    downloadName={download.name} />
    );

    const { files: downloadedFiles, visibleCount: downloadedVisibleCount }
          = hideFiltered(download.files.downloaded, filterRE);

    const downloadedFilesSection = (
      <FilesSection label='DOWNLOADED'
                    showLabelIf={extractedFilesSection !== null}
                    files={downloadedFiles}
                    visibleCount={downloadedVisibleCount}
                    isMultiFile={download.isMultiFile}
                    initialCollapse={ui.isCollapsed}
                    downloadName={download.name} />
    );

    const totalVisibleCount = extractedVisibleCount + downloadedVisibleCount;

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
            <SearchContainer count={totalVisibleCount} infoHash={this.props.infoHash} />
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
  infoHash: React.PropTypes.string.isRequired,
  params: React.PropTypes.object.isRequired,
  ui: React.PropTypes.shape({
    isFetching: React.PropTypes.bool.isRequired,
  }),
};

export default CSSModules(Download, styles);
