import { connect } from 'react-redux';

import Download from 'components/Downloads/Download';

function mapStateToProps(state) {
  const user = state.data.users.current;
  const { lastSeen } = state.ui.downloads;

  if (!user) {
    return {};
  }

  return { user, lastSeen };
}

const DownloadContainer = connect(
  mapStateToProps
)(Download);

export default DownloadContainer;
