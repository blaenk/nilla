import { connect } from 'react-redux';

import {
  applyEditFiles,
  cancelEditFiles,
  enableDownloadFile,
  disableDownloadFile,
  invertDownloadFile,
} from 'actions';

import EditFiles from 'components/Download/EditFiles';

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
    apply(filePriorities) {
      dispatch(applyEditFiles(infoHash, filePriorities));
    },

    handleCancel() {
      dispatch(cancelEditFiles(infoHash));
    },

    enable(fileId) {
      dispatch(enableDownloadFile(infoHash, fileId));
    },

    disable(fileId) {
      dispatch(disableDownloadFile(infoHash, fileId));
    },

    invert(fileId) {
      dispatch(invertDownloadFile(infoHash, fileId));
    },
  };
}

const EditFilesContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditFiles);

export default EditFilesContainer;
