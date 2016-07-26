import { connect } from 'react-redux';

import Download from 'components/Download/Download';

// TODO
// fetchIfNecessary, cache in state
const mapStateToProps = (state, props) => {
  const download = state.downloads[props.params.infoHash] || {};

  // TODO
  // need to set .isHidden = false?
  // or use defaultProps?

  return download;
};

const DownloadContainer = connect(
  mapStateToProps
)(Download);

export default DownloadContainer;
