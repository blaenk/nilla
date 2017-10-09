import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { putTracker } from 'actions';

import Tracker from 'components/Tracker/Tracker';

function mapStateToProps(state, props) {
  const currentUser = state.data.users.current;

  if (!(props.match.params.id in state.data.trackers)) {
    return { currentUser };
  }

  const {
    id,
    name,
    url,
    category,
    username,
    password,
  } = state.data.trackers[props.match.params.id];

  return {
    currentUser,
    id,
    name,
    url,
    category,
    username,
    password,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    dispatch,
    onSubmit(tracker, callback) {
      tracker.id = ownprops.match.params.id;

      dispatch(putTracker(tracker, callback));
    },
  };
}

const EditTrackerContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(Tracker));

export default EditTrackerContainer;
