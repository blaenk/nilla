import { connect } from 'react-redux';

import Download from 'components/Download/Download';

import { makeGetFilteredFiles } from 'selectors';

function makeMapStateToProps() {
  const getFilteredFiles = makeGetFilteredFiles();

  return function mapStateToProps(state, props) {
    const infoHash = props.params.infoHash;

    if (!(infoHash in state.data.downloads) ||
        !(infoHash in state.ui.download) ||
        !('files' in state.data.downloads[infoHash])) {
      return { infoHash };
    }

    const download = state.data.downloads[infoHash];
    const ui = state.ui.download[infoHash];
    const files = getFilteredFiles(state, props);

    return { infoHash, download, ui, files };
  };
}

const DownloadContainer = connect(
  makeMapStateToProps
)(Download);

export default DownloadContainer;
