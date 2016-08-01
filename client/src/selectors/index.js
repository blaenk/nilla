import { createSelector } from 'reselect';
import moment from 'moment';
import _ from 'lodash';

import { fuzzyPattern, EXPIRATION_DURATION } from 'common';

const getDownloads = (state) => state.downloads;
const getFilter = (state) => state.search.filter;
const getScope = (state) => state.search.scope;
const getOrder = (state) => state.search.order;

export const getDownloadsValues = createSelector(
  [getDownloads],
  (downloads) => _.values(downloads)
);

export const getScopedDownloads = createSelector(
  [getDownloadsValues, getScope],
  (downloads, scope) => {
    switch (scope) {
      case 'mine':
        return downloads.map(download => {
          // TODO
          // get username from auth
          return Object.assign({}, download, {
            isHidden: download.uploader !== 'blaenk',
          });
        });
      case 'system':
        return downloads.map(download => {
          return Object.assign({}, download, {
            isHidden: download.uploader !== 'system',
          });
        });
      case 'locked':
        return downloads.map(download => {
          return Object.assign({}, download, {
            isHidden: download.locks.length === 0,
          });
        });
      case 'expiring':
        // get downloads expiring within the next 24 hours
        return downloads.map(download => {
          // TODO
          // don't hard-code expiration time
          // perhaps store some TTL in metadata?
          const expiresAt =
                moment(download.dateAdded).add(EXPIRATION_DURATION).subtract(1, 'day');

          return Object.assign({}, download, {
            isHidden: moment().isBefore(expiresAt),
          });
        });
      case 'all':
      default:
        return downloads;
    }
  }
);

export const getOrderedDownloads = createSelector(
  [getScopedDownloads, getOrder],
  (downloads, order) => {
    switch (order) {
      case 'name': {
        const sortedByName = downloads.slice();

        sortedByName.sort((a, b) => {
          return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
        });

        return sortedByName;
      }
      case 'recent':
      default: {
        const sortedByDate = downloads.slice();

        sortedByDate.sort((a, b) => {
          // it's possible to simply string-compare uniform ISO 8601 timestamps
          const left = a.dateAdded;
          const right = b.dateAdded;

          if (left > right) {
            return -1;
          } else if (right > left) {
            return 1;
          }

          return 0;
        });

        return sortedByDate;
      }
    }
  }
);

export const getFilteredDownloads = createSelector(
  [getOrderedDownloads, getFilter],
  (downloads, filter) => {
    const filterRE = fuzzyPattern(filter);

    return downloads.map(download => {
      return Object.assign({}, download, {
        isHidden: download.isHidden || !filterRE.test(download.name),
      });
    });
  }
);
