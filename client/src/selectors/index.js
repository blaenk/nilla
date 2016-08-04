import { createSelector } from 'reselect';
import moment from 'moment';
import _ from 'lodash';

import { fuzzyPattern, expiresAt } from 'common';

const getDownload = (state, props) => state.downloads[props.params.infoHash];
const getDownloadUI = (state, props) => state.ui.downloads[props.params.infoHash];

export function makeGetFiles() {
  return createSelector(
    [getDownload],
    (download) => {
      return download.files;
    }
  );
}

export function makeGetFilesFilter() {
  return createSelector(
    [getDownloadUI],
    (download) => {
      return download.filter;
    }
  );
}

function filterFiles(files, filterRE) {
  return files.filter(file => {
    return file.pathComponents.some(c => filterRE.test(c));
  });
}

export function makeGetFilesPattern() {
  return createSelector(
    [makeGetFilesFilter()],
    (filter) => {
      return fuzzyPattern(filter);
    }
  );
}

export function makeGetFilteredFiles() {
  return createSelector(
    [makeGetFiles(), makeGetFilesPattern()],
    (files, pattern) => {
      return {
        downloaded: filterFiles(files.downloaded, pattern),
        extracted: filterFiles(files.extracted, pattern),
      };
    }
  );
}

const getDownloads = (state) => state.downloads;
const getDownloadsFilter = (state) => state.search.filter;
const getScope = (state) => state.search.scope;
const getOrder = (state) => state.search.order;

export const getDownloadsValues = createSelector(
  [getDownloads],
  (downloads) => _.cloneDeep(_.values(downloads))
);

export const getScopedDownloads = createSelector(
  [getDownloadsValues, getScope],
  (downloads, scope) => {
    switch (scope) {
      case 'mine':
        return downloads.map(download => {
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
          const expirationDate = expiresAt(download.dateAdded).subtract(1, 'day');

          return Object.assign({}, download, {
            isHidden: moment().isBefore(expirationDate),
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
  [getOrderedDownloads, getDownloadsFilter],
  (downloads, filter) => {
    const filterRE = fuzzyPattern(filter);

    return downloads.map(download => {
      return Object.assign({}, download, {
        isHidden: download.isHidden || !filterRE.test(download.name),
      });
    });
  }
);
