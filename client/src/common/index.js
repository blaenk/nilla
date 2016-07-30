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

// TODO
// this should probably be retrieved from /api/
// and perhaps it should instead be within used within a function like
// expiresAt(moment)

// eslint-disable-next-line no-magic-numbers
export const EXPIRATION_DURATION = moment.duration(2, 'weeks');
