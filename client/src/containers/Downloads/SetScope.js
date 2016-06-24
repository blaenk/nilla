import { connect } from 'react-redux';
import { setScope } from 'actions';

import ScopeDropDown from 'components/Downloads/ScopeDropDown';

const mapStateToProps = (state) => {
  return {
    scope: state.search.scope
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChangeScope: (eventKey, _event) => {
      dispatch(setScope(eventKey));
    }
  };
};

const SetScope = connect(
  mapStateToProps,
  mapDispatchToProps
)(ScopeDropDown);

export default SetScope;
