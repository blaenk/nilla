import { connect } from 'react-redux';

import DownloadCount_ from 'components/Downloads/DownloadCount';

const mapStateToProps = (state) => {
  return {
    count: state.downloads.length
  };
};

const DownloadCount = connect(
  mapStateToProps
)(DownloadCount_);

export default DownloadCount;
