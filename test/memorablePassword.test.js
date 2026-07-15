import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateMemorable, generateOneMemorable } from '../src/lib/memorablePassword.js';

test('generateMemorable returns 5 unique suggestions by default', () => {
  const suggestions = generateMemorable();
  assert.equal(suggestions.length, 5);
  assert.equal(new Set(suggestions).size, 5);
});

test('generateMemorable respects a custom count', () => {
  const suggestions = generateMemorable(4);
  assert.equal(suggestions.length, 4);
});

test('every suggestion contains at least one digit', () => {
  for (const password of generateMemorable()) {
    assert.ok(/[0-9]/.test(password), `expected a digit in ${password}`);
  }
});

test('every suggestion contains at least one symbol', () => {
  for (const password of generateMemorable()) {
    assert.ok(/[^A-Za-z0-9]/.test(password), `expected a symbol in ${password}`);
  }
});

test('every suggestion meets the minimum length', () => {
  for (const password of generateMemorable()) {
    assert.ok(password.length >= 10, `password too short: ${password}`);
  }
});

test('generateOneMemorable produces a single valid password', () => {
  const password = generateOneMemorable();
  assert.equal(typeof password, 'string');
  assert.ok(password.length >= 10);
});

test('generateOneMemorable produces different passwords across calls', () => {
  const a = generateOneMemorable();
  const b = generateOneMemorable();
  assert.notEqual(a, b);
});
