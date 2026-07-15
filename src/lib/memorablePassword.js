import { randomInt, shuffle, randomChars, pickDistinct } from './randomUtils.js';
import { DIGITS, SYMBOLS } from './charsets.js';
import { COMMON_WORDS } from './wordLists.js';

const MIN_LENGTH = 10;
const DEFAULT_COUNT = 5;
const MAX_ATTEMPTS_MULTIPLIER = 10;

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function buildMemorable() {
  const parts = pickDistinct(COMMON_WORDS, 2).map(capitalize);
  parts.push(randomChars(DIGITS, 2 + randomInt(2)));
  parts.push(randomChars(SYMBOLS, 1));

  shuffle(parts);
  let password = parts.join('');

  while (password.length < MIN_LENGTH) {
    password += DIGITS[randomInt(DIGITS.length)];
  }

  return password;
}

export function generateOneMemorable() {
  return buildMemorable();
}

export function generateMemorable(count = DEFAULT_COUNT) {
  const results = new Set();
  let attempts = 0;
  while (results.size < count && attempts < count * MAX_ATTEMPTS_MULTIPLIER) {
    results.add(buildMemorable());
    attempts++;
  }
  return [...results];
}
