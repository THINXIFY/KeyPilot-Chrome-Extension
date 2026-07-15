const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}<>?';

const CHARACTER_SETS = [UPPERCASE, LOWERCASE, DIGITS, SYMBOLS];
const ALL_CHARACTERS = CHARACTER_SETS.join('');

const DEFAULT_LENGTH = 16;

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

export function generatePassword(length = DEFAULT_LENGTH) {
  if (length < CHARACTER_SETS.length) {
    throw new RangeError(`length must be at least ${CHARACTER_SETS.length}`);
  }

  const required = CHARACTER_SETS.map((set) => randomChar(set));
  const remainingCount = length - required.length;
  const remaining = Array.from({ length: remainingCount }, () => randomChar(ALL_CHARACTERS));

  return shuffle([...required, ...remaining]).join('');
}
