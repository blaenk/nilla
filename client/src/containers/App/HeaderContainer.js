import { connect } from 'react-redux';

import { setUploading } from 'actions';

import Header from 'components/App/Header';

const mapStateToProps = (state) => {
  return {
    isDragging: state.upload.isDragging,
    isUploading: state.upload.isUploading
  };
};

const mergeProps = (stateProps, dispatchProps, _ownProps) => {
  const { dispatch } = dispatchProps;

  return {
    onUpload: function() {
      dispatch(setUploading(!stateProps.isUploading));
    }
  };
};

const HeaderContainer = connect(
  mapStateToProps,
  null,
  mergeProps
)(Header);

export default HeaderContainer;
