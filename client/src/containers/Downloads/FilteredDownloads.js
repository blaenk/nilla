import { connect } from 'react-redux';

import Downloads from 'components/Downloads/Downloads';

const getScopedDownloads = (downloads, scope) => {
  switch (scope) {
    case 'all':
    default:
      return downloads;
  }
};

const filterDownloads = (downloads, filter) => {
  return downloads.filter(d => d.name.includes(filter));
};

const mapStateToProps = (state) => {
  let scoped = getScopedDownloads(state.downloads, state.search.scope);
  let filtered = filterDownloads(scoped, state.search.filter);

  return {
    downloads: filtered
  };
};

const FilteredDownloads = connect(
  mapStateToProps
)(Downloads);

export default FilteredDownloads;
