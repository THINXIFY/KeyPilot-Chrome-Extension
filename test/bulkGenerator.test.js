import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateBulk, BULK_QUANTITIES } from '../src/lib/bulkGenerator.js';
import { DEFAULT_SETTINGS } from '../src/lib/passwordGenerator.js';

test('exposes exactly the 4 required quantities', () => {
  assert.deepEqual(BULK_QUANTITIES, [10, 25, 50, 100]);
});

test('generates the requested quantity of unique passwords', () => {
  const passwords = generateBulk(DEFAULT_SETTINGS, 10);
  assert.equal(passwords.length, 10);
  assert.equal(new Set(passwords).size, 10);
});

test('generates 25, 50, and 100 correctly', () => {
  assert.equal(generateBulk(DEFAULT_SETTINGS, 25).length, 25);
  assert.equal(generateBulk(DEFAULT_SETTINGS, 50).length, 50);
  assert.equal(generateBulk(DEFAULT_SETTINGS, 100).length, 100);
});

test('every generated password matches the given settings', () => {
  const settings = { length: 12, uppercase: true, lowercase: false, numbers: true, symbols: false, excludeSimilar: false, excludeChars: '' };
  const passwords = generateBulk(settings, 10);
  for (const password of passwords) {
    assert.equal(password.length, 12);
    assert.ok(/^[A-Z0-9]+$/.test(password), `unexpected characters in ${password}`);
  }
});

test('falls back to the default quantity for an invalid quantity', () => {
  const passwords = generateBulk(DEFAULT_SETTINGS, 17);
  assert.equal(passwords.length, 10);
});

test('returns null when no character types are enabled', () => {
  const settings = { length: 12, uppercase: false, lowercase: false, numbers: false, symbols: false, excludeSimilar: false, excludeChars: '' };
  assert.equal(generateBulk(settings, 10), null);
});
