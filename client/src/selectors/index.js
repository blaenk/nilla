import { createSelector } from 'reselect';
import { fuzzyPattern } from 'common/util';

const getDownloads = (state) => state.downloads;
const getFilter = (state) => state.search.filter;
const getScope = (state) => state.search.scope;

export const getScopedDownloads = createSelector(
  [getDownloads, getScope],
  (downloads, scope) => {
    switch (scope) {
      case 'all':
      default:
        return downloads;
    }
  }
);

export const getFilteredDownloads = createSelector(
  [getScopedDownloads, getFilter],
  (scopedDownloads, filter) => {
    const filterRE = fuzzyPattern(filter);

    return scopedDownloads.map(download => {
      download.isHidden = !filterRE.test(download.name);

      return download;
    });
  }
);
