import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatePassphrase, generateOnePassphrase, MIN_WORDS, MAX_WORDS } from '../src/lib/passphrase.js';

test('generatePassphrase returns 5 unique suggestions by default', () => {
  const suggestions = generatePassphrase({});
  assert.equal(suggestions.length, 5);
  assert.equal(new Set(suggestions).size, 5);
});

test('default word count is 4, joined by the default dash separator', () => {
  const password = generateOnePassphrase({});
  assert.equal(password.split('-').length, 4);
});

test('respects a custom word count within range', () => {
  const password = generateOnePassphrase({ wordCount: 6 });
  assert.equal(password.split('-').length, 6);
});

test('clamps word count below the minimum', () => {
  const password = generateOnePassphrase({ wordCount: 1 });
  assert.equal(password.split('-').length, MIN_WORDS);
});

test('clamps word count above the maximum', () => {
  const password = generateOnePassphrase({ wordCount: 20 });
  assert.equal(password.split('-').length, MAX_WORDS);
});

test('supports the underscore separator', () => {
  const password = generateOnePassphrase({ wordCount: 3, separator: '_' });
  assert.equal(password.split('_').length, 3);
});

test('supports the dot separator', () => {
  const password = generateOnePassphrase({ wordCount: 3, separator: '.' });
  assert.equal(password.split('.').length, 3);
});

test('supports the space separator', () => {
  const password = generateOnePassphrase({ wordCount: 3, separator: ' ' });
  assert.equal(password.split(' ').length, 3);
});

test('falls back to the dash separator for an invalid value', () => {
  const password = generateOnePassphrase({ wordCount: 3, separator: '*' });
  assert.equal(password.split('-').length, 3);
});

test('adds a digit segment when numbers is enabled', () => {
  const password = generateOnePassphrase({ wordCount: 3, numbers: true });
  assert.ok(/[0-9]/.test(password));
});

test('adds a symbol segment when symbols is enabled', () => {
  const password = generateOnePassphrase({ wordCount: 3, symbols: true });
  assert.ok(/[^A-Za-z0-9-]/.test(password));
});

test('has no digits or extra symbols when both options are off', () => {
  const password = generateOnePassphrase({ wordCount: 3, numbers: false, symbols: false, separator: '-' });
  assert.ok(/^[A-Za-z-]+$/.test(password), `unexpected characters in ${password}`);
});
