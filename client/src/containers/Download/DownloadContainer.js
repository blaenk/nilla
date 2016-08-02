import { connect } from 'react-redux';

import Download from 'components/Download/Download';

// TODO
// fetchIfNecessary, cache in state
function mapStateToProps(state, props) {
  const infoHash = props.params.infoHash;
  const download = state.downloads[infoHash] || {};
  const ui = state.ui.downloads[infoHash] || {};

  // TODO
  // need to set .isHidden = false?
  // or use defaultProps?

  return { infoHash, download, ui };
}

const DownloadContainer = connect(
  mapStateToProps
)(Download);

export default DownloadContainer;
