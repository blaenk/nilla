import { connect } from 'react-redux';

import Download from 'components/Download/Download';

import downloadStub from '../../../../.data/download.json';

// TODO
// fetchIfNecessary, cache in state
const mapStateToProps = (state, _props) => {
  // const infohash = props.params.infohash;
  // const download = state.downloads.find(d => d.infohash == infohash);

  return downloadStub;
};

const DownloadContainer = connect(
  mapStateToProps
)(Download);

export default DownloadContainer;