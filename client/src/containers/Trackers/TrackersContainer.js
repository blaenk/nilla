import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { getTrackersSortedByName } from 'selectors';

import Trackers from 'components/Trackers/Trackers';

function mapStateToProps(state) {
  const trackers = getTrackersSortedByName(state);
  const currentUser = state.data.users.current;

  return { trackers, currentUser };
}

const TrackersContainer = withRouter(connect(mapStateToProps)(Trackers));

export default TrackersContainer;
