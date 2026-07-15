import { randomInt, randomChars, pick, pickDistinct } from './randomUtils.js';
import { DIGITS } from './charsets.js';
import { COMMON_WORDS, THEME_WORDS } from './wordLists.js';

const LEET_MAP = { a: '4', e: '3', i: '1', o: '0', s: '5' };

export const USERNAME_STYLES = ['professional', 'minimal', 'gaming', 'developer'];
const DEFAULT_STYLE = 'professional';
const DEFAULT_COUNT = 5;
const MAX_ATTEMPTS_MULTIPLIER = 10;

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function styledCase(word) {
  return word
    .split('')
    .map((ch) => {
      const lower = ch.toLowerCase();
      if (LEET_MAP[lower] && randomInt(10) < 4) return LEET_MAP[lower];
      return randomInt(2) === 0 ? lower.toUpperCase() : lower;
    })
    .join('');
}

function buildProfessional() {
  const word = capitalize(pick(COMMON_WORDS));
  const digits = randomChars(DIGITS, 2 + randomInt(2));
  return randomInt(2) === 0 ? `${word}.${digits}` : `${word}${digits}`;
}

function buildMinimal() {
  const word = pick(COMMON_WORDS).toLowerCase();
  const digits = randomChars(DIGITS, 2);
  return `${word}${digits}`;
}

function buildGaming() {
  const word = styledCase(pick(THEME_WORDS.fantasy));
  const digits = randomChars(DIGITS, 2 + randomInt(2));
  return randomInt(2) === 0 ? `${word}_${digits}` : `${word}${digits}`;
}

function buildDeveloper() {
  const [first, second] = pickDistinct(THEME_WORDS.cyber, 2);
  const digits = randomChars(DIGITS, 1 + randomInt(2));
  return `${first}_${second}${digits}`;
}

function resolveStyle(style) {
  return USERNAME_STYLES.includes(style) ? style : DEFAULT_STYLE;
}

function buildUsername(style) {
  switch (resolveStyle(style)) {
    case 'minimal': return buildMinimal();
    case 'gaming': return buildGaming();
    case 'developer': return buildDeveloper();
    case 'professional':
    default:
      return buildProfessional();
  }
}

export function generateOneUsername(style) {
  return buildUsername(style);
}

export function generateUsernames(style, count = DEFAULT_COUNT) {
  const results = new Set();
  let attempts = 0;
  while (results.size < count && attempts < count * MAX_ATTEMPTS_MULTIPLIER) {
    results.add(buildUsername(style));
    attempts++;
  }
  return [...results];
}
