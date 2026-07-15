import { randomInt, shuffle, randomChars } from './randomUtils.js';
import { DIGITS, SYMBOLS } from './charsets.js';

const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';
const VOWELS = 'aeiou';
const SYLLABLE_COUNT = 3;
const MIN_LENGTH = 10;
const DEFAULT_COUNT = 5;
const MAX_ATTEMPTS_MULTIPLIER = 10;

function buildSyllable() {
  const consonant = CONSONANTS[randomInt(CONSONANTS.length)];
  const vowel = VOWELS[randomInt(VOWELS.length)];
  return consonant + vowel;
}

function buildPronounceableWord() {
  let word = '';
  for (let i = 0; i < SYLLABLE_COUNT; i++) {
    word += buildSyllable();
  }
  return word;
}

function randomizeCase(word) {
  return word
    .split('')
    .map((ch) => (randomInt(3) === 0 ? ch.toUpperCase() : ch))
    .join('');
}

function buildPronounceable() {
  const word = randomizeCase(buildPronounceableWord());
  const parts = [word, randomChars(DIGITS, 2 + randomInt(2)), randomChars(SYMBOLS, 1)];

  shuffle(parts);
  let password = parts.join('');

  while (password.length < MIN_LENGTH) {
    password += DIGITS[randomInt(DIGITS.length)];
  }

  return password;
}

export function generateOnePronounceable() {
  return buildPronounceable();
}

export function generatePronounceable(count = DEFAULT_COUNT) {
  const results = new Set();
  let attempts = 0;
  while (results.size < count && attempts < count * MAX_ATTEMPTS_MULTIPLIER) {
    results.add(buildPronounceable());
    attempts++;
  }
  return [...results];
}
