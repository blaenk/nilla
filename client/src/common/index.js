import _ from 'lodash';

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
