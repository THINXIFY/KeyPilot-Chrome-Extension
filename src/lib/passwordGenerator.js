import { randomInt, shuffle } from './randomUtils.js';
import { hasRepeatedRun, hasSequentialRun } from './passwordPatterns.js';

const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}<>?',
};

const SIMILAR_CHARACTERS = 'O0Il1';
const MAX_GENERATION_ATTEMPTS = 30;

export const MIN_LENGTH = 8;
export const MAX_LENGTH = 64;
const DEFAULT_LENGTH = 16;

export const DEFAULT_SETTINGS = {
  length: DEFAULT_LENGTH,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeSimilar: false,
  excludeChars: '',
  avoidRepeated: false,
  avoidSequential: false,
};

function randomChar(charset) {
  return charset[randomInt(charset.length)];
}

function buildUsableSubsets(settings) {
  const excludeSet = new Set(
    (settings.excludeSimilar ? SIMILAR_CHARACTERS : '') + (settings.excludeChars || '')
  );

  return Object.keys(CHAR_SETS)
    .filter((type) => settings[type])
    .map((type) => ({
      type,
      chars: [...CHAR_SETS[type]].filter((ch) => !excludeSet.has(ch)).join(''),
    }))
    .filter((subset) => subset.chars.length > 0);
}

export function getEffectivePoolSize(options = {}) {
  const settings = { ...DEFAULT_SETTINGS, ...options };
  const usableSubsets = buildUsableSubsets(settings);
  return usableSubsets.reduce((total, subset) => total + subset.chars.length, 0);
}

function buildCandidate(usableSubsets, pool, length) {
  const required = usableSubsets.map((subset) => randomChar(subset.chars));
  const remainingCount = length - required.length;
  const remaining = Array.from({ length: remainingCount }, () => randomChar(pool));
  return shuffle([...required, ...remaining]).join('');
}

export function generatePassword(options = {}) {
  const settings = { ...DEFAULT_SETTINGS, ...options };
  const { length, avoidRepeated, avoidSequential } = settings;

  if (!Number.isInteger(length) || length < MIN_LENGTH || length > MAX_LENGTH) {
    throw new RangeError(`length must be an integer between ${MIN_LENGTH} and ${MAX_LENGTH}`);
  }

  const usableSubsets = buildUsableSubsets(settings);
  const pool = usableSubsets.map((subset) => subset.chars).join('');

  if (pool.length === 0) {
    return null;
  }

  // Filters are enforced by regenerating candidates rather than editing a
  // rejected one in place, so every accepted password is still uniformly
  // drawn from the full policy-compliant space. If a compliant candidate
  // isn't found within the attempt budget (possible with a tiny pool and
  // both filters on), the last candidate is returned rather than hanging.
  let candidate = buildCandidate(usableSubsets, pool, length);
  for (let attempt = 1; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const violatesRepeated = avoidRepeated && hasRepeatedRun(candidate);
    const violatesSequential = avoidSequential && hasSequentialRun(candidate);
    if (!violatesRepeated && !violatesSequential) break;
    candidate = buildCandidate(usableSubsets, pool, length);
  }

  return candidate;
}
