import { connect } from 'react-redux';
import { getFilteredDownloads } from 'selectors';
import { setScope, setFilter } from 'actions';

import Downloads from 'components/Downloads/Downloads';

const mapStateToProps = (state) => {
  return {
    downloads: getFilteredDownloads(state)
  };
};

const FilteredDownloads = connect(
  mapStateToProps
)(Downloads);

export default FilteredDownloads;
