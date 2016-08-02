import { connect } from 'react-redux';

import { clearRejectedFiles } from 'actions';

import Upload from 'components/App/Upload';

function mapStateToProps(state) {
  return {
    files: state.upload.files,
    rejectedFiles: state.upload.rejectedFiles,
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
