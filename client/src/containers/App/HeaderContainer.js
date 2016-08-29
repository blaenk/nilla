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
  mergeProps,
  // this can be fixed when react-router 3.0 is released
  // by wrapping withRouter(Header) or withRouter(LinkContainer),
  // or maybe react-router-bootstrap is fixed by then
  { pure: false }
)(Header);

export default HeaderContainer;
