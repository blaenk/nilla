import { connect } from 'react-redux';

import CommandBar from 'components/Download/CommandBar';

function mapStateToProps(state, props) {
  const { infoHash } = props;

  const download = state.data.downloads[infoHash];
  const ui = state.ui.download[infoHash];

  return { download, ui };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    lock(infoHash, toLock) {
      console.log('lock');
    },

    start(infoHash) {
      console.log('start');
    },

    stop(infoHash) {
      console.log('pause');
    },

    erase(infoHash) {
      console.log('erase');
    },

    stats(infoHash) {
      console.log('stats');
    },
  };
}

const CommandBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommandBar);

export default CommandBarContainer;
