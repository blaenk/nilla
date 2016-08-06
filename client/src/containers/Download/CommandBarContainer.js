import { connect } from 'react-redux';

import {
  acquireLock,
  releaseLock,
} from 'actions';

import CommandBar from 'components/Download/CommandBar';

function mapStateToProps(state, props) {
  const { infoHash } = props;

  const download = state.data.downloads[infoHash];
  const ui = state.ui.download[infoHash];
  const user = state.data.users.current;

  if (!download || !ui || !user) {
    return {};
  }

  return { download, ui, user };
}

function mapDispatchToProps(dispatch, ownProps) {
  const { infoHash } = ownProps;

  return {
    lock() {
      console.log('lock');
      dispatch(acquireLock(infoHash));
    },

    unlock() {
      console.log('unlock');
      dispatch(releaseLock(infoHash));
    },

    start() {
      console.log('start');
    },

    stop() {
      console.log('stop');
    },

    edit() {
      console.log('edit');
    },

    erase() {
      console.log('erase');
    },

    stats() {
      console.log('stats');
    },
  };
}

const CommandBarContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CommandBar);

export default CommandBarContainer;
