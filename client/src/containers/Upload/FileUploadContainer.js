import { connect } from 'react-redux';

import {
  removeFile,
  submitFile,
  parseFile,
} from 'actions';

import FileUpload from 'components/Upload/FileUpload';

const FileUploadContainer = connect(
  null,
  (dispatch, ownProps) => {
    return {
      parseFile() {
        dispatch(parseFile(ownProps.file));
      },
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
