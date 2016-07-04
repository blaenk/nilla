import { connect } from 'react-redux';

import Upload from 'components/App/Upload';
import { setFilter } from 'actions';

const mapStateToProps = (state) => {
  return {
    files: state.upload.files
  };
};

const mapDispatchToProps = (_dispatch) => {
  return {};
};

const UploadContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Upload);

export default UploadContainer;
