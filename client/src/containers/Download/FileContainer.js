import { connect } from 'react-redux';

import {
  enableDownloadFile,
  disableDownloadFile,
} from 'actions';

import { userCan } from 'common';

import File from 'components/Download/File';

function mapStateToProps(state, props) {
  const { infoHash } = props;

  const ui = state.ui.download[infoHash];

  const currentUser = state.data.users.current;
  const canDownload = currentUser && userCan(currentUser, 'download');

  if (!ui) {
    return {};
  }

  return { ui, canDownload };
}

function mapDispatchToProps(dispatch, ownProps) {
  const { infoHash } = ownProps;

  return {
    enable(fileId) {
      dispatch(enableDownloadFile(infoHash, fileId));
    },

    disable(fileId) {
      dispatch(disableDownloadFile(infoHash, fileId));
    },
  };
}

const FileContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(File);

export default FileContainer;
