import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { requestCreateTracker } from 'actions';

import Tracker from 'components/Tracker/Tracker';

function mapStateToProps(state) {
  const currentUser = state.data.users.current;

  return { currentUser };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    onSubmit(tracker, callback) {
      dispatch(requestCreateTracker(tracker, callback));
    },
  };
}

const NewTrackerContainer = withRouter(connect(mapStateToProps, mapDispatchToProps)(Tracker));

export default NewTrackerContainer;
