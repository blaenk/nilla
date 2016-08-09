import { connect } from 'react-redux';

import {
  enableDownloadFile,
  disableDownloadFile,
} from 'actions';

import FileTree from 'components/Download/FileTree';

function mapStateToProps(state, props) {
  const { infoHash } = props;

  const ui = state.ui.download[infoHash];

  if (!ui) {
    return {};
  }

  return { ui };
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

const FileTreeContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(FileTree);

export default FileTreeContainer;
