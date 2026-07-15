import { estimateStrengthFromPassword } from './passwordStrength.js';
import { randomInt, shuffle, randomChars, pick } from './randomUtils.js';
import { DIGITS, SYMBOLS } from './charsets.js';
import { COMMON_WORDS } from './wordLists.js';

const LEET_MAP = { a: '@', e: '3', i: '1', o: '0', s: '$' };

const MIN_SMART_LENGTH = 10;
const DEFAULT_COUNT = 5;
const MAX_ATTEMPTS_MULTIPLIER = 10;

// Randomizes case and occasionally leet-substitutes letters, guaranteeing the
// result differs from the original token so a raw name/word is never returned.
function transformToken(token) {
  const letterIndices = [];
  let changed = false;

  const result = token.split('').map((ch, idx) => {
    if (!/[a-zA-Z]/.test(ch)) return ch;
    letterIndices.push(idx);

    const lower = ch.toLowerCase();
    if (LEET_MAP[lower] && randomInt(10) < 3) {
      changed = true;
      return LEET_MAP[lower];
    }

    const newCh = randomInt(2) === 0 ? lower : lower.toUpperCase();
    if (newCh !== ch) changed = true;
    return newCh;
  });

  if (!changed && letterIndices.length > 0) {
    const idx = letterIndices[randomInt(letterIndices.length)];
    const ch = result[idx];
    result[idx] = ch === ch.toLowerCase() ? ch.toUpperCase() : ch.toLowerCase();
  }

  return result.join('');
}

function buildPassword(tokens, { includeRandomWord }) {
  const parts = tokens.map(transformToken);
  if (includeRandomWord) {
    parts.push(transformToken(pick(COMMON_WORDS)));
  }
  parts.push(randomChars(DIGITS, 2 + randomInt(3)));
  parts.push(randomChars(SYMBOLS, 1 + randomInt(2)));

  shuffle(parts);
  let password = parts.join('');

  while (password.length < MIN_SMART_LENGTH) {
    password += DIGITS[randomInt(DIGITS.length)];
  }

  return password;
}

function generateUnique(factory, count) {
  const results = new Set();
  let attempts = 0;
  while (results.size < count && attempts < count * MAX_ATTEMPTS_MULTIPLIER) {
    results.add(factory());
    attempts++;
  }
  return [...results];
}

function parseNameTokens(name) {
  return (name || '')
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean)
    .slice(0, 2);
}

function parseWordTokens(words) {
  return (words || [])
    .map((word) => (word || '').trim().replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean)
    .slice(0, 3);
}

export function generateOneFromName(name) {
  const tokens = parseNameTokens(name);
  if (tokens.length === 0) return null;
  return buildPassword(tokens, { includeRandomWord: true });
}

export function generateOneFromWords(words) {
  const tokens = parseWordTokens(words);
  if (tokens.length === 0) return null;
  return buildPassword(tokens, { includeRandomWord: false });
}

export function generateFromName(name, count = DEFAULT_COUNT) {
  const tokens = parseNameTokens(name);
  if (tokens.length === 0) return null;
  return generateUnique(() => buildPassword(tokens, { includeRandomWord: true }), count);
}

export function generateFromWords(words, count = DEFAULT_COUNT) {
  const tokens = parseWordTokens(words);
  if (tokens.length === 0) return null;
  return generateUnique(() => buildPassword(tokens, { includeRandomWord: false }), count);
}

export function getSuggestionStrength(password) {
  return estimateStrengthFromPassword(password);
}
