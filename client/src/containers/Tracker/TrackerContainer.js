import { connect } from 'react-redux';

import Tracker from 'components/Tracker/Tracker';

function mapStateToProps(state, props) {
  const tracker = state.data.trackers[props.params.id];
  const currentUser = state.data.users.current;

  return { tracker, currentUser };
}

const TrackerContainer = connect(
  mapStateToProps
)(Tracker);

export default TrackerContainer;
