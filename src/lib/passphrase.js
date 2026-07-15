import { randomInt, shuffle, randomChars, pickDistinct } from './randomUtils.js';
import { DIGITS, SYMBOLS } from './charsets.js';
import { COMMON_WORDS } from './wordLists.js';

export const MIN_WORDS = 3;
export const MAX_WORDS = 8;
const DEFAULT_WORD_COUNT = 4;
const DEFAULT_SEPARATOR = '-';
const VALID_SEPARATORS = ['-', '_', '.', ' '];
const DEFAULT_COUNT = 5;
const MAX_ATTEMPTS_MULTIPLIER = 10;

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function normalizeOptions(options = {}) {
  const wordCount = Number.isInteger(options.wordCount)
    ? Math.min(MAX_WORDS, Math.max(MIN_WORDS, options.wordCount))
    : DEFAULT_WORD_COUNT;
  const separator = VALID_SEPARATORS.includes(options.separator) ? options.separator : DEFAULT_SEPARATOR;

  return {
    wordCount,
    separator,
    numbers: Boolean(options.numbers),
    symbols: Boolean(options.symbols),
  };
}

function buildPassphrase(options) {
  const { wordCount, separator, numbers, symbols } = normalizeOptions(options);
  const parts = pickDistinct(COMMON_WORDS, wordCount).map(capitalize);

  if (numbers) parts.push(randomChars(DIGITS, 2 + randomInt(2)));
  if (symbols) parts.push(randomChars(SYMBOLS, 1 + randomInt(2)));

  shuffle(parts);
  return parts.join(separator);
}

export function generateOnePassphrase(options) {
  return buildPassphrase(options);
}

export function generatePassphrase(options, count = DEFAULT_COUNT) {
  const results = new Set();
  let attempts = 0;
  while (results.size < count && attempts < count * MAX_ATTEMPTS_MULTIPLIER) {
    results.add(buildPassphrase(options));
    attempts++;
  }
  return [...results];
}
