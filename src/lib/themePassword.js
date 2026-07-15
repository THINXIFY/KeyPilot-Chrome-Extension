import { randomInt, shuffle, randomChars, pickDistinct } from './randomUtils.js';
import { DIGITS, SYMBOLS } from './charsets.js';
import { THEME_WORDS } from './wordLists.js';

export const THEMES = Object.keys(THEME_WORDS);
const DEFAULT_THEME = 'nature';
const MIN_LENGTH = 10;
const DEFAULT_COUNT = 5;
const MAX_ATTEMPTS_MULTIPLIER = 10;

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function resolveTheme(theme) {
  return THEME_WORDS[theme] ? theme : DEFAULT_THEME;
}

function buildThemed(theme) {
  const words = THEME_WORDS[resolveTheme(theme)];
  const parts = pickDistinct(words, 2).map(capitalize);
  parts.push(randomChars(DIGITS, 2 + randomInt(2)));
  parts.push(randomChars(SYMBOLS, 1));

  shuffle(parts);
  let password = parts.join('');

  while (password.length < MIN_LENGTH) {
    password += DIGITS[randomInt(DIGITS.length)];
  }

  return password;
}

export function generateOneThemed(theme) {
  return buildThemed(theme);
}

export function generateThemed(theme, count = DEFAULT_COUNT) {
  const results = new Set();
  let attempts = 0;
  while (results.size < count && attempts < count * MAX_ATTEMPTS_MULTIPLIER) {
    results.add(buildThemed(theme));
    attempts++;
  }
  return [...results];
}
