const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}<>?',
};

const SIMILAR_CHARACTERS = 'O0Il1';

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
};

function randomInt(max) {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % max;
}

function randomChar(charset) {
  return charset[randomInt(charset.length)];
}

function shuffle(chars) {
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars;
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

export function generatePassword(options = {}) {
  const settings = { ...DEFAULT_SETTINGS, ...options };
  const { length } = settings;

  if (!Number.isInteger(length) || length < MIN_LENGTH || length > MAX_LENGTH) {
    throw new RangeError(`length must be an integer between ${MIN_LENGTH} and ${MAX_LENGTH}`);
  }

  const usableSubsets = buildUsableSubsets(settings);
  const pool = usableSubsets.map((subset) => subset.chars).join('');

  if (pool.length === 0) {
    return null;
  }

  const required = usableSubsets.map((subset) => randomChar(subset.chars));
  const remainingCount = length - required.length;
  const remaining = Array.from({ length: remainingCount }, () => randomChar(pool));

  return shuffle([...required, ...remaining]).join('');
}
