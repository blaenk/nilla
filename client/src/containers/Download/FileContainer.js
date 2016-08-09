import { connect } from 'react-redux';

import {
  enableDownloadFile,
  disableDownloadFile,
} from 'actions';

import File from 'components/Download/File';

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

const FileContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(File);

export default FileContainer;
