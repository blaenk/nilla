import _ from 'lodash';
import moment from 'moment';

/**
 * Construct a "fuzzy" regular expression from the input string. If the input
 * string is an invalid regular expression, escape it first.
 * @param {String} literalPattern The input string.
 * @returns {RegExp} The fuzzy regular expression.
 */
export function fuzzyPattern(literalPattern) {
  try {
    return new RegExp(literalPattern.replace(/ /g, '.*'), 'i');
  } catch (e) {
    const escaped = _.escapeRegExp(literalPattern);

    return new RegExp(escaped.replace(/ /g, '.*', 'i'));
  }
}

export function expiresAt(download) {
  return moment(download.dateAdded).add(download.ttl);
}

export function userCan(user, permissions) {
  if (!Array.isArray(permissions)) {
    permissions = [permissions];
  }

  return permissions.every(p => user.permissions.includes(p));
}

export function partitionFiles(entries, depth) {
  const folders = [], files = [], tree = {};

  for (const entry of entries) {
    if (depth + 1 < entry.pathComponents.length) {
      const name = entry.pathComponents[depth];

      tree[name] = tree[name] || [];
      tree[name].push(entry);
    } else {
      files.push(entry);
    }
  }

  _.forOwn(tree, (value, key) => {
    folders.push({
      name: key,
      files: value,
    });
  });

  return {
    folders,
    files,
  };
}
