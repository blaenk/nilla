import { connect } from 'react-redux';

import Download from 'components/Download/Download';

import { makeGetFilteredFiles } from 'selectors';

function makeMapStateToProps() {
  const getFilteredFiles = makeGetFilteredFiles();

  return function mapStateToProps(state, props) {
    const infoHash = props.params.infoHash;

    if (!(infoHash in state.data.downloads) ||
        !(infoHash in state.ui.download) ||
        !('files' in state.data.downloads[infoHash]) ||
        !('users' in state.data) ||
        !('current' in state.data.users)) {
      return { infoHash };
    }

    const download = state.data.downloads[infoHash];
    const users = state.data.users;
    const currentUser = state.data.users.current;
    const ui = state.ui.download[infoHash];
    const files = getFilteredFiles(state, props);

    return { infoHash, download, ui, files, users, currentUser };
  };
}

const DownloadContainer = connect(
  makeMapStateToProps
)(Download);

export default DownloadContainer;
