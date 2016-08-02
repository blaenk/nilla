import { connect } from 'react-redux';

import { setUploading } from 'actions';

import Header from 'components/App/Header';

function mapStateToProps(state) {
  return {
    isDragging: state.upload.isDragging,
    isUploading: state.upload.isUploading,
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
  null,
  mergeProps
)(Header);

export default HeaderContainer;
