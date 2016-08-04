import { connect } from 'react-redux';

import Download from 'components/Download/Download';

import { makeGetFilteredFiles } from 'selectors';

function makeMapStateToProps() {
  const getFilteredFiles = makeGetFilteredFiles();

  return function mapStateToProps(state, props) {
    const infoHash = props.params.infoHash;
    const download = state.downloads[infoHash] || {};
    const ui = state.ui.downloads[infoHash] || {};

    // TODO
    // there should be a way to initialize the download state here
    let files = {
      downloaded: [],
      extracted: [],
    };

    if ('files' in download) {
      files = getFilteredFiles(state, props);
    }

    return { infoHash, download, ui, files };
  };
}

const DownloadContainer = connect(
  makeMapStateToProps
)(Download);

export default DownloadContainer;
