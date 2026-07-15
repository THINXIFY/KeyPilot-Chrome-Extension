import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasRepeatedRun, hasSequentialRun } from '../src/lib/passwordPatterns.js';

test('hasRepeatedRun detects 3+ identical characters in a row', () => {
  assert.equal(hasRepeatedRun('Paaaassword1!'), true);
});

test('hasRepeatedRun ignores 2 identical characters in a row', () => {
  assert.equal(hasRepeatedRun('Password11!'), false);
});

test('hasRepeatedRun returns false for a password with no repeats', () => {
  assert.equal(hasRepeatedRun('K9#mZq2$vLp7'), false);
});

test('hasSequentialRun detects ascending letter sequences', () => {
  assert.equal(hasSequentialRun('myAbcdPass1!'), true);
});

test('hasSequentialRun detects descending letter sequences', () => {
  assert.equal(hasSequentialRun('myXyzPass1!'.split('').reverse().join('')), true);
});

test('hasSequentialRun detects ascending digit sequences', () => {
  assert.equal(hasSequentialRun('my12345Pass!'), true);
});

test('hasSequentialRun returns false for a password with no sequences', () => {
  assert.equal(hasSequentialRun('K9#mZq2$vLp7'), false);
});

test('hasSequentialRun respects a custom run length', () => {
  assert.equal(hasSequentialRun('ab', 3), false);
  assert.equal(hasSequentialRun('abc', 3), true);
});
