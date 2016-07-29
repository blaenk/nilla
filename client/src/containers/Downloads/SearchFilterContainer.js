import { connect } from 'react-redux';

import SearchFilter from 'components/Downloads/SearchFilter';
import { setFilter } from 'actions';

const mapStateToProps = (state) => {
  return {
    filter: state.search.filter,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChangeFilter: (filter) => {
      dispatch(setFilter(filter));
    },
  };
};

const SearchFilterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchFilter);

export default SearchFilterContainer;
