import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatePronounceable, generateOnePronounceable } from '../src/lib/pronounceablePassword.js';

test('generatePronounceable returns 5 unique suggestions by default', () => {
  const suggestions = generatePronounceable();
  assert.equal(suggestions.length, 5);
  assert.equal(new Set(suggestions).size, 5);
});

test('every suggestion contains at least one digit', () => {
  for (const password of generatePronounceable()) {
    assert.ok(/[0-9]/.test(password), `expected a digit in ${password}`);
  }
});

test('every suggestion contains at least one symbol', () => {
  for (const password of generatePronounceable()) {
    assert.ok(/[^A-Za-z0-9]/.test(password), `expected a symbol in ${password}`);
  }
});

test('every suggestion meets the minimum length', () => {
  for (const password of generatePronounceable()) {
    assert.ok(password.length >= 10, `password too short: ${password}`);
  }
});

test('the alphabetic portion alternates consonant/vowel syllables', () => {
  const password = generateOnePronounceable();
  const letters = password.replace(/[^a-zA-Z]/g, '').toLowerCase();
  assert.ok(/^([bcdfghjklmnpqrstvwxyz][aeiou]){3}$/.test(letters), `unexpected syllable shape: ${letters}`);
});

test('generateOnePronounceable produces different passwords across calls', () => {
  const a = generateOnePronounceable();
  const b = generateOnePronounceable();
  assert.notEqual(a, b);
});
