import { connect } from 'react-redux';

import Download from 'components/Download/Download';

// TODO
// fetchIfNecessary, cache in state
const mapStateToProps = (state, props) => {
  const infohash = props.params.infohash;
  // const download = state.downloads.find(d => d.infohash == infohash);

  return {
    infohash: infohash,
    name: 'ubuntu',
    dateAdded: '2016-06-25T22:42:55.520Z',
    state: 'downloading',
    progress: '75',
    uploader: 'blaenk',
    locks: []
  };
};

const DownloadContainer = connect(
  mapStateToProps
)(Download);

export default DownloadContainer;
