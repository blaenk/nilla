import { connect } from 'react-redux';
import { getFilteredDownloads } from 'selectors';
import { setScope, setFilter } from 'actions';

import Downloads from 'components/Downloads/Downloads';

const mapStateToProps = (state) => {
  return {
    downloads: getFilteredDownloads(state)
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChangeScope: (scope) => dispatch(setScope(scope)),
    onChangeFilter: (filter) => dispatch(setFilter(filter))
  };
};

const FilteredDownloads = connect(
  mapStateToProps,
  mapDispatchToProps
)(Downloads);

export default FilteredDownloads;
