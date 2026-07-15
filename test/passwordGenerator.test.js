import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePassword,
  getEffectivePoolSize,
  MIN_LENGTH,
  MAX_LENGTH,
} from '../src/lib/passwordGenerator.js';
import { hasRepeatedRun, hasSequentialRun } from '../src/lib/passwordPatterns.js';

const SYMBOLS = '!@#$%^&*()-_=+[]{}<>?';

test('generates a password of the default length (16) with default options', () => {
  const password = generatePassword();
  assert.equal(password.length, 16);
});

test('generates a password of a custom length via options', () => {
  const password = generatePassword({ length: 24 });
  assert.equal(password.length, 24);
});

test('default options include at least one uppercase, lowercase, digit, and symbol', () => {
  const password = generatePassword();
  assert.ok(/[A-Z]/.test(password), 'expected an uppercase letter');
  assert.ok(/[a-z]/.test(password), 'expected a lowercase letter');
  assert.ok(/[0-9]/.test(password), 'expected a digit');
  assert.ok([...password].some((ch) => SYMBOLS.includes(ch)), 'expected a symbol');
});

test('produces different passwords across calls', () => {
  const a = generatePassword();
  const b = generatePassword();
  assert.notEqual(a, b);
});

test('uppercase-only setting produces only uppercase characters', () => {
  const password = generatePassword({
    length: 16, uppercase: true, lowercase: false, numbers: false, symbols: false,
  });
  assert.ok(/^[A-Z]+$/.test(password));
});

test('lowercase-only setting produces only lowercase characters', () => {
  const password = generatePassword({
    length: 16, uppercase: false, lowercase: true, numbers: false, symbols: false,
  });
  assert.ok(/^[a-z]+$/.test(password));
});

test('numbers-only setting produces only digits', () => {
  const password = generatePassword({
    length: 16, uppercase: false, lowercase: false, numbers: true, symbols: false,
  });
  assert.ok(/^[0-9]+$/.test(password));
});

test('symbols-only setting produces only symbols', () => {
  const password = generatePassword({
    length: 16, uppercase: false, lowercase: false, numbers: false, symbols: true,
  });
  assert.ok([...password].every((ch) => SYMBOLS.includes(ch)));
});

test('returns null when all character types are disabled', () => {
  const password = generatePassword({
    length: 16, uppercase: false, lowercase: false, numbers: false, symbols: false,
  });
  assert.equal(password, null);
});

test('excludeSimilar removes O, 0, I, l, 1 from the output', () => {
  for (let i = 0; i < 20; i++) {
    const password = generatePassword({ length: 64, excludeSimilar: true });
    assert.ok(!/[O0Il1]/.test(password), `unexpected similar character in ${password}`);
  }
});

test('excludeChars removes the specified characters from the output', () => {
  for (let i = 0; i < 20; i++) {
    const password = generatePassword({ length: 64, excludeChars: 'aeiou' });
    assert.ok(![...password].some((ch) => 'aeiou'.includes(ch)), `unexpected excluded character in ${password}`);
  }
});

test('returns null when exclusions empty the entire effective pool', () => {
  const password = generatePassword({
    length: 8,
    uppercase: false,
    lowercase: false,
    numbers: true,
    symbols: false,
    excludeChars: '0123456789',
  });
  assert.equal(password, null);
});

test('throws RangeError for length below the minimum', () => {
  assert.throws(() => generatePassword({ length: MIN_LENGTH - 1 }), RangeError);
});

test('throws RangeError for length above the maximum', () => {
  assert.throws(() => generatePassword({ length: MAX_LENGTH + 1 }), RangeError);
});

test('throws RangeError for a non-integer length', () => {
  assert.throws(() => generatePassword({ length: 12.5 }), RangeError);
});

test('accepts the minimum and maximum boundary lengths', () => {
  assert.equal(generatePassword({ length: MIN_LENGTH }).length, MIN_LENGTH);
  assert.equal(generatePassword({ length: MAX_LENGTH }).length, MAX_LENGTH);
});

test('getEffectivePoolSize reflects enabled types and exclusions', () => {
  assert.equal(
    getEffectivePoolSize({ uppercase: true, lowercase: false, numbers: false, symbols: false }),
    26
  );
  assert.equal(
    getEffectivePoolSize({ uppercase: false, lowercase: false, numbers: false, symbols: false }),
    0
  );
});

test('avoidRepeated is off by default (repeats can occur)', () => {
  // Not a strict assertion (repeats are rare by chance at length 8), just
  // documents that the default behavior is unconstrained.
  assert.equal(generatePassword().length, 16);
});

test('avoidRepeated prevents 3+ repeated characters when enabled', () => {
  for (let i = 0; i < 30; i++) {
    const password = generatePassword({ length: 12, avoidRepeated: true });
    assert.equal(hasRepeatedRun(password), false, `unexpected repeat in ${password}`);
  }
});

test('avoidSequential prevents sequential runs when enabled', () => {
  for (let i = 0; i < 30; i++) {
    const password = generatePassword({ length: 12, avoidSequential: true });
    assert.equal(hasSequentialRun(password), false, `unexpected sequence in ${password}`);
  }
});

test('avoidRepeated and avoidSequential can be enabled together', () => {
  for (let i = 0; i < 30; i++) {
    const password = generatePassword({ length: 16, avoidRepeated: true, avoidSequential: true });
    assert.equal(hasRepeatedRun(password), false, `unexpected repeat in ${password}`);
    assert.equal(hasSequentialRun(password), false, `unexpected sequence in ${password}`);
  }
});

test('filters do not change the resulting length or character-class guarantees', () => {
  const password = generatePassword({
    length: 20, avoidRepeated: true, avoidSequential: true, excludeSimilar: true,
  });
  assert.equal(password.length, 20);
  assert.ok(/[A-Z]/.test(password));
  assert.ok(/[a-z]/.test(password));
  assert.ok(/[0-9]/.test(password));
});

test('does not hang even when filters cannot be perfectly satisfied within the attempt budget', () => {
  // A tiny pool (digits only) at the minimum length makes avoiding both
  // repeats and sequences hard; this must still return promptly rather
  // than looping forever, even if the result isn't fully compliant.
  const password = generatePassword({
    length: MIN_LENGTH,
    uppercase: false,
    lowercase: false,
    numbers: true,
    symbols: false,
    avoidRepeated: true,
    avoidSequential: true,
  });
  assert.equal(typeof password, 'string');
  assert.equal(password.length, MIN_LENGTH);
});
