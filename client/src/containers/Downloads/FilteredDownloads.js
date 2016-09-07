import { connect } from 'react-redux';
import { getFilteredDownloads } from 'selectors';

import Downloads from 'components/Downloads/Downloads';

function mapStateToProps(state) {
  return {
    downloads: getFilteredDownloads(state),
    ui: state.ui.downloads,
  };
}

const FilteredDownloads = connect(
  mapStateToProps
)(Downloads);

export default FilteredDownloads;
