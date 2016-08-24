import { connect } from 'react-redux';

import { getUsersSortedByName } from 'selectors';

import Users from 'components/Users/Users';

function mapStateToProps(state) {
  const users = getUsersSortedByName(state);
  const invitations = state.data.invitations;

  return { users, invitations };
}

const UsersContainer = connect(
  mapStateToProps
)(Users);

export default UsersContainer;
