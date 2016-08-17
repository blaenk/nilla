import { connect } from 'react-redux';

import { clearRejectedFiles } from 'actions';

import Upload from 'components/Upload/Upload';

function mapStateToProps(state) {
  return {
    files: state.ui.upload.files,
    rejectedFiles: state.ui.upload.rejectedFiles,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onDismissRejectionAlert() {
      dispatch(clearRejectedFiles());
    },
  };
}

const UploadContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Upload);

export default UploadContainer;
