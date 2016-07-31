import { connect } from 'react-redux';

import { addFiles, rejectFiles, setDragging, setUploading } from 'actions';

import Dropzone from 'react-dropzone';

const mapDispatchToProps = (dispatch) => {
  return {
    onDropAccepted(files) {
      dispatch(setDragging(false));
      dispatch(setUploading(true));
      dispatch(addFiles(files));
    },
    onDropRejected(files) {
      dispatch(setDragging(false));
      dispatch(setUploading(true));
      dispatch(rejectFiles(files));
    },
    onDragEnter(_event) {
      dispatch(setDragging(true));
    },
    onDragLeave(_event) {
      dispatch(setDragging(false));
    },
  };
};

const DropzoneContainer = connect(
  null,
  mapDispatchToProps,
  null,
  { withRef: true }
)(Dropzone);

export default DropzoneContainer;
