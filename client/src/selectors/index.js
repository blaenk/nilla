import { createSelector } from 'reselect';
import moment from 'moment';
import _ from 'lodash';

import { fuzzyPattern, expiresAt } from 'common';

function getDownload(state, props) {
  return state.data.downloads[props.params.infoHash];
}

function getDownloadUI(state, props) {
  return state.ui.download[props.params.infoHash];
}

export function makeGetFiles() {
  return createSelector(
    [getDownload],
    (download) => download.files
  );
}

export function makeGetFilesFilter() {
  return createSelector(
    [getDownloadUI],
    (download) => download.filter
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
    (filter) => fuzzyPattern(filter)
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

const getDownloads = (state) => state.data.downloads;
const getDownloadsFilter = (state) => state.ui.downloads.filter;
const getDownloadsScope = (state) => state.ui.downloads.scope;
const getDownloadsOrder = (state) => state.ui.downloads.order;
const getCurrentUser = (state) => state.data.users.current;

export const getDownloadsValues = createSelector(
  [getDownloads],
  (downloads) => _.cloneDeep(_.values(downloads))
);

export const getScopedDownloads = createSelector(
  [getDownloadsValues, getDownloadsScope, getCurrentUser],
  (downloads, scope, user) => {
    switch (scope) {
      case 'MINE':
        return downloads.map(download => {
          return Object.assign({}, download, {
            isHidden: download.uploader !== user.id,
          });
        });
      case 'SYSTEM':
        return downloads.map(download => {
          return Object.assign({}, download, {
            isHidden: download.uploader !== -1,
          });
        });
      case 'LOCKED':
        return downloads.map(download => {
          return Object.assign({}, download, {
            isHidden: !download.locks.includes(user.id),
          });
        });
      case 'EXPIRING':
        // get downloads expiring within the next 24 hours
        return downloads.map(download => {
          const expirationDate = expiresAt(download.dateAdded).subtract(1, 'day');

          return Object.assign({}, download, {
            isHidden: moment().isBefore(expirationDate),
          });
        });
      case 'ALL':
      default:
        return downloads;
    }
  }
);

export const getOrderedDownloads = createSelector(
  [getScopedDownloads, getDownloadsOrder],
  (downloads, order) => {
    switch (order) {
      case 'NAME': {
        const sortedByName = downloads.slice();

        sortedByName.sort((a, b) => {
          return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
        });

        return sortedByName;
      }
      case 'RECENT':
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
