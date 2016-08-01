import { connect } from 'react-redux';

import { removeFile, submitFile } from 'actions';

import FileUpload from 'components/App/FileUpload';

const FileUploadContainer = connect(
  null,
  (dispatch, ownProps) => {
    return {
      onSubmit() {
        dispatch(submitFile(ownProps.file));
      },
      onRemove() {
        dispatch(removeFile(ownProps.file));
      },
    };
  }
)(FileUpload);

export default FileUploadContainer;
