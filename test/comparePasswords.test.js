import { test } from 'node:test';
import assert from 'node:assert/strict';
import { comparePasswords } from '../src/lib/comparePasswords.js';

test('returns null analyses and no winner when both inputs are empty', () => {
  const result = comparePasswords('', '');
  assert.equal(result.a, null);
  assert.equal(result.b, null);
  assert.equal(result.winner, null);
});

test('analyzes only the side that has input', () => {
  const result = comparePasswords('hunter2', '');
  assert.notEqual(result.a, null);
  assert.equal(result.b, null);
  assert.equal(result.winner, null);
});

test('declares A the winner when it scores higher', () => {
  const result = comparePasswords('K9#mZq2$vLp7@wRxT4nB8!eF', 'password123');
  assert.equal(result.winner, 'a');
});

test('declares B the winner when it scores higher', () => {
  const result = comparePasswords('password123', 'K9#mZq2$vLp7@wRxT4nB8!eF');
  assert.equal(result.winner, 'b');
});

test('declares a tie when both score the same', () => {
  const result = comparePasswords('password123', 'password123');
  assert.equal(result.winner, 'tie');
});
