import { connect } from 'react-redux';
import { setDownloadsScope } from 'actions';

import ScopeDropDown from 'components/Downloads/ScopeDropDown';

function mapStateToProps(state) {
  return {
    scope: state.ui.downloads.scope,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onChangeScope: (scope) => {
      dispatch(setDownloadsScope(scope));
    },
  };
}

const ScopeDropDownContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ScopeDropDown);

export default ScopeDropDownContainer;
