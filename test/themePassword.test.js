import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateThemed, generateOneThemed, THEMES } from '../src/lib/themePassword.js';

test('exposes exactly the 5 required themes', () => {
  assert.deepEqual([...THEMES].sort(), ['cyber', 'fantasy', 'nature', 'ocean', 'space']);
});

test('generateThemed returns 5 unique suggestions by default', () => {
  const suggestions = generateThemed('nature');
  assert.equal(suggestions.length, 5);
  assert.equal(new Set(suggestions).size, 5);
});

test('every suggestion contains at least one digit and one symbol', () => {
  for (const password of generateThemed('space')) {
    assert.ok(/[0-9]/.test(password), `expected a digit in ${password}`);
    assert.ok(/[^A-Za-z0-9]/.test(password), `expected a symbol in ${password}`);
  }
});

test('every suggestion meets the minimum length', () => {
  for (const password of generateThemed('ocean')) {
    assert.ok(password.length >= 10, `password too short: ${password}`);
  }
});

test('works for every declared theme', () => {
  for (const theme of THEMES) {
    const password = generateOneThemed(theme);
    assert.equal(typeof password, 'string');
    assert.ok(password.length >= 10);
  }
});

test('falls back to the nature theme for an unknown theme name', () => {
  const password = generateOneThemed('not-a-real-theme');
  assert.equal(typeof password, 'string');
  assert.ok(password.length >= 10);
});

test('generateOneThemed produces different passwords across calls', () => {
  const a = generateOneThemed('cyber');
  const b = generateOneThemed('cyber');
  assert.notEqual(a, b);
});
