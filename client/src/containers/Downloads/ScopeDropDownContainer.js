import { connect } from 'react-redux';
import { setScope } from 'actions';

import ScopeDropDown from 'components/Downloads/ScopeDropDown';

const mapStateToProps = (state) => {
  return {
    scope: state.search.scope,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChangeScope: (scope) => {
      dispatch(setScope(scope));
    },
  };
};

const ScopeDropDownContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ScopeDropDown);

export default ScopeDropDownContainer;
