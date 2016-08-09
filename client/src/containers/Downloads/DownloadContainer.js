import { connect } from 'react-redux';

import Download from 'components/Downloads/Download';

function mapStateToProps(state) {
  const user = state.data.users.current;

  if (!user) {
    return {};
  }

  return { user };
}

const DownloadContainer = connect(
  mapStateToProps
)(Download);

export default DownloadContainer;
