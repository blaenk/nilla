import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';

import { addFiles, rejectFiles, setDragging, setUploading } from 'actions';

function mapDispatchToProps(dispatch) {
  return {
    onDropAccepted(files) {
      dispatch(setDragging(false));

      if (files.length === 0) {
        return;
      }

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
}

const DropzoneContainer = connect(
  null,
  mapDispatchToProps,
  null,
  { withRef: true }
)(Dropzone);

export default DropzoneContainer;
