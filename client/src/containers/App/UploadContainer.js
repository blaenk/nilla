import { connect } from 'react-redux';

import { clearRejectedFiles } from 'actions';

import Upload from 'components/App/Upload';

const mapStateToProps = (state) => {
  return {
    files: state.upload.files,
    rejectedFiles: state.upload.rejectedFiles,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onDismissRejectionAlert: function() {
      dispatch(clearRejectedFiles());
    },
  };
};

const UploadContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Upload);

export default UploadContainer;
