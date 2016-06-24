import { connect } from 'react-redux';
import { setScope, setOrder } from 'actions';
import Downloads from 'components/Downloads/Downloads';

const getVisibleDownloads = (downloads, scope) => {
  switch (scope) {
    case 'all':
    default:
      return downloads;
  }
};

const mapStateToProps = (state) => {
  let ds = getVisibleDownloads(state.downloads, state.search.scope);
  return {
    downloads: ds,
    scope: state.search.scope,
    order: state.search.order
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChangeScope: (eventKey, _event) => {
      dispatch(setScope(eventKey));
    },

    onChangeOrder: (eventKey, _event) => {
      dispatch(setOrder(eventKey));
    }
  };
};

const FilteredDownloads = connect(
  mapStateToProps,
  mapDispatchToProps
)(Downloads);

export default FilteredDownloads;
