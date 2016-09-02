import { connect } from 'react-redux';

import { putUser } from 'actions';

import User from 'components/User/User';

function mapStateToProps(state, props) {
  const currentUser = state.data.users.current;

  if (!(props.params.id in state.data.users)) {
    return { currentUser };
  }

  const {
    id,
    username,
    email,
    permissions,
    refresh_token,
  } = state.data.users[props.params.id];

  return {
    currentUser,
    id,
    username,
    email,
    roles: permissions.join(','),
    token: refresh_token,
  };
}

function mapDispatchToProps(dispatch, ownProps) {
  return {
    dispatch,
    onSubmit(user, callback) {
      user.id = ownProps.params.id;
      user.permissions = user.permissions.split(',');

      dispatch(putUser(user, callback));
    },
  };
}

const EditUserContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(User);

export default EditUserContainer;
