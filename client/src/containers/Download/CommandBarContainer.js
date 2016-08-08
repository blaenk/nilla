import { connect } from 'react-redux';

import {
  acquireLock,
  releaseLock,
  startDownload,
  stopDownload,
  eraseDownload,
  editDownloadFiles,
} from 'actions';

import CommandBar from 'components/Download/CommandBar';

function mapStateToProps(state, props) {
  const { infoHash } = props;

  const download = state.data.downloads[infoHash];
  const ui = state.ui.download[infoHash];
  const user = state.data.users.current;

  if (!download || !ui || !user) {
    return {};
  }

  return { download, ui, user };
}

function mapDispatchToProps(dispatch, ownProps) {
  const { infoHash } = ownProps;

  return {
    lock() {
      dispatch(acquireLock(infoHash));
    },

    unlock() {
      dispatch(releaseLock(infoHash));
    },

    start() {
      dispatch(startDownload(infoHash));
    },

    stop() {
      dispatch(stopDownload(infoHash));
    },

    erase(callback) {
      dispatch(eraseDownload(infoHash, callback));
    },

    edit(infoHash, isEditing) {
      dispatch(editDownloadFiles(infoHash, isEditing));
    },

    stats() {
      console.log('stats');
    },
  };
}

const CommandBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommandBar);

export default CommandBarContainer;
