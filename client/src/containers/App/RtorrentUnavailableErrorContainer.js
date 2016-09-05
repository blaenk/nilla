import { connect } from 'react-redux';

import RtorrentUnavailableErrorAlert from 'components/App/RtorrentUnavailableErrorAlert';

function mapStateToProps(state) {
  return {
    isRtorrentAvailable: state.ui.global.isRtorrentAvailable,
  };
}

const ErrorContainer = connect(mapStateToProps)(RtorrentUnavailableErrorAlert);

export default ErrorContainer;
