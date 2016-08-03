import { connect } from 'react-redux';

import Download from 'components/Download/Download';

function mapStateToProps(state, props) {
  const infoHash = props.params.infoHash;
  const download = state.downloads[infoHash] || {};
  const ui = state.ui.downloads[infoHash] || {};

  return { infoHash, download, ui };
}

const DownloadContainer = connect(
  mapStateToProps
)(Download);

export default DownloadContainer;
