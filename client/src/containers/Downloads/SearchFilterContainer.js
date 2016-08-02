import { connect } from 'react-redux';

import SearchFilter from 'components/Downloads/SearchFilter';
import { setDownloadsFilter } from 'actions';

const mapStateToProps = (state) => {
  return {
    filter: state.search.filter,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onChangeFilter: (event) => {
      dispatch(setDownloadsFilter(event.target.value));
    },
  };
};

const SearchFilterContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchFilter);

export default SearchFilterContainer;
