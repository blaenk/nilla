import _ from 'lodash';

export function fuzzyPattern(literalPattern) {
  try {
    return new RegExp(literalPattern.replace(/ /g, '.*'), 'i');
  } catch (e) {
    const escaped = _.escapeRegExp(literalPattern);
    return new RegExp(escaped);
  }
}
