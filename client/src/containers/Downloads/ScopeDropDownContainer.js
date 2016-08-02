import { connect } from 'react-redux';
import { setScope } from 'actions';

import ScopeDropDown from 'components/Downloads/ScopeDropDown';

function mapStateToProps(state) {
  return {
    scope: state.search.scope,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onChangeScope: (scope) => {
      dispatch(setScope(scope));
    },
  };
}

const ScopeDropDownContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ScopeDropDown);

export default ScopeDropDownContainer;
