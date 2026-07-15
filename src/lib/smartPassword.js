import { calculateStrength } from './passwordStrength.js';

const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}<>?';
const LEET_MAP = { a: '@', e: '3', i: '1', o: '0', s: '$' };

const WORD_LIST = [
  'river', 'tiger', 'lamp', 'cloud', 'stone', 'forest', 'harbor', 'maple', 'comet', 'falcon',
  'meadow', 'granite', 'willow', 'copper', 'marble', 'thunder', 'breeze', 'canyon', 'lantern', 'orchid',
  'summit', 'coral', 'glacier', 'ripple', 'quartz', 'ivory', 'cedar', 'ridge', 'delta', 'frost',
  'pebble', 'beacon', 'violet', 'amber', 'cinder', 'dune', 'fern', 'grove', 'haven', 'iris',
  'jungle', 'kestrel', 'lagoon', 'moss', 'nectar', 'opal', 'petal', 'quill', 'reef', 'sable',
  'tundra', 'umber', 'vale', 'wren', 'yarrow', 'zephyr', 'ash', 'birch', 'ember', 'spark',
];

const MIN_SMART_LENGTH = 10;
const DEFAULT_COUNT = 5;
const MAX_ATTEMPTS_MULTIPLIER = 10;

function randomInt(max) {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % max;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomDigits(n) {
  return Array.from({ length: n }, () => DIGITS[randomInt(DIGITS.length)]).join('');
}

function randomSymbols(n) {
  return Array.from({ length: n }, () => SYMBOLS[randomInt(SYMBOLS.length)]).join('');
}

function pickRandomWord() {
  return WORD_LIST[randomInt(WORD_LIST.length)];
}

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
    parts.push(transformToken(pickRandomWord()));
  }
  parts.push(randomDigits(2 + randomInt(3)));
  parts.push(randomSymbols(1 + randomInt(2)));

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
  return calculateStrength({
    length: password.length,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password),
  });
}
