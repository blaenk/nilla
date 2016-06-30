import { createSelector } from 'reselect';
import { fuzzyPattern } from 'common';
import moment from 'moment';

const getDownloads = (state) => state.downloads;
const getFilter = (state) => state.search.filter;
const getScope = (state) => state.search.scope;

export const getScopedDownloads = createSelector(
  [getDownloads, getScope],
  (downloads, scope) => {
    switch (scope) {
      case 'mine':
        return downloads.filter(download => {
          // TODO
          // get username from auth
          return download.uploader == 'blaenk';
        });
      case 'system':
        return downloads.filter(download => {
          return download.uploader == 'system';
        });
      case 'locked':
        return downloads.filter(download => {
          return download.locks.length > 0;
        });
      case 'expiring':
        // get downloads expiring within the next 24 hours
        return downloads.filter(download => {
          // TODO
          // don't hard-code expiration time
          // perhaps store some TTL in metadata?
          const expiresAt =
                moment(download['date-added']).add(2, 'weeks').subtract(1, 'day');

          return moment().isSameOrAfter(expiresAt);
        });
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
