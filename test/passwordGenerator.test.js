import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatePassword } from '../src/lib/passwordGenerator.js';

const SYMBOLS = '!@#$%^&*()-_=+[]{}<>?';

test('generates a password of the default length (16)', () => {
  const password = generatePassword();
  assert.equal(password.length, 16);
});

test('generates a password of a custom length', () => {
  const password = generatePassword(24);
  assert.equal(password.length, 24);
});

test('includes at least one uppercase, lowercase, digit, and symbol', () => {
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

test('throws when requested length is smaller than the number of required character classes', () => {
  assert.throws(() => generatePassword(2), RangeError);
});
