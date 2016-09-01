import { connect } from 'react-redux';

import { putTracker } from 'actions';

import Tracker from 'components/Tracker/Tracker';

function mapStateToProps(state, props) {
  const {
    id,
    name,
    url,
    category,
    username,
    password,
  } = state.data.trackers[props.params.id];
  const currentUser = state.data.users.current;

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
      tracker.id = ownProps.params.id;

      dispatch(putTracker(tracker, callback));
    },
  };
}

const EditTrackerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Tracker);

export default EditTrackerContainer;
