import { randomInt, randomChars, pick, pickDistinct } from './randomUtils.js';
import { DIGITS } from './charsets.js';
import { COMMON_WORDS, THEME_WORDS } from './wordLists.js';

const LEET_MAP = { a: '4', e: '3', i: '1', o: '0', s: '5' };

export const USERNAME_STYLES = ['professional', 'minimal', 'gaming', 'developer'];
const DEFAULT_STYLE = 'professional';
const DEFAULT_COUNT = 5;
const CUSTOM_COUNT = 6;
const MAX_CUSTOM_WORD_LENGTH = 20;
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

export function sanitizeCustomWord(input) {
  return (input || '').trim().replace(/[^a-zA-Z0-9]/g, '').slice(0, MAX_CUSTOM_WORD_LENGTH);
}

function buildCustomProfessional(word) {
  const name = capitalize(word);
  const digits = randomChars(DIGITS, 2 + randomInt(2));
  return randomInt(2) === 0 ? `${name}.${digits}` : `${name}${digits}`;
}

function buildCustomMinimal(word) {
  const digits = randomChars(DIGITS, 2);
  return `${word.toLowerCase()}${digits}`;
}

function buildCustomGaming(word) {
  const styledWord = styledCase(word);
  const flavor = styledCase(pick(THEME_WORDS.fantasy));
  const digits = randomChars(DIGITS, 2 + randomInt(2));
  const parts = randomInt(2) === 0 ? [styledWord, flavor] : [flavor, styledWord];
  return `${parts[0]}_${parts[1]}${digits}`;
}

function buildCustomDeveloper(word) {
  const flavor = pick(THEME_WORDS.cyber);
  const digits = randomChars(DIGITS, 1 + randomInt(2));
  const parts = randomInt(2) === 0 ? [word.toLowerCase(), flavor] : [flavor, word.toLowerCase()];
  return `${parts[0]}_${parts[1]}${digits}`;
}

function buildCustomUsername(word, style) {
  switch (resolveStyle(style)) {
    case 'minimal': return buildCustomMinimal(word);
    case 'gaming': return buildCustomGaming(word);
    case 'developer': return buildCustomDeveloper(word);
    case 'professional':
    default:
      return buildCustomProfessional(word);
  }
}

export function generateOneCustomUsername(input, style) {
  const word = sanitizeCustomWord(input);
  if (!word) return null;
  return buildCustomUsername(word, style);
}

export function generateCustomUsernames(input, style, count = CUSTOM_COUNT) {
  const word = sanitizeCustomWord(input);
  if (!word) return null;

  const results = new Set();
  let attempts = 0;
  while (results.size < count && attempts < count * MAX_ATTEMPTS_MULTIPLIER) {
    results.add(buildCustomUsername(word, style));
    attempts++;
  }
  return [...results];
}
