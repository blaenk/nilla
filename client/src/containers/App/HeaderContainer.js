import { connect } from 'react-redux';

import { setUploading, requestLogout } from 'actions';

import Header from 'components/App/Header';

function mapStateToProps(state) {
  return {
    currentUser: state.data.users.current,
    isDragging: state.ui.upload.isDragging,
    isUploading: state.ui.upload.isUploading,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    onLogout() {
      dispatch(requestLogout());
    },
  };
}

function mergeProps(stateProps, dispatchProps, ownProps) {
  const { dispatch } = dispatchProps;

  return Object.assign({}, ownProps, stateProps, dispatchProps, {
    onUpload() {
      dispatch(setUploading(!stateProps.isUploading));
    },
  });
}

const HeaderContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(Header);

export default HeaderContainer;
