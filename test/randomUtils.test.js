import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomInt, shuffle, randomChars, pick, pickDistinct } from '../src/lib/randomUtils.js';

test('randomInt always returns a value within [0, max)', () => {
  for (let i = 0; i < 500; i++) {
    const value = randomInt(7);
    assert.ok(value >= 0 && value < 7, `out of range: ${value}`);
  }
});

test('randomInt returns 0 for max = 1', () => {
  for (let i = 0; i < 20; i++) {
    assert.equal(randomInt(1), 0);
  }
});

test('randomInt covers the full range across enough samples', () => {
  const seen = new Set();
  for (let i = 0; i < 2000; i++) {
    seen.add(randomInt(10));
  }
  assert.equal(seen.size, 10);
});

test('shuffle returns an array with the same elements', () => {
  const original = [1, 2, 3, 4, 5];
  const shuffled = shuffle([...original]);
  assert.deepEqual([...shuffled].sort(), original);
});

test('randomChars returns a string of the requested length using only the given charset', () => {
  const result = randomChars('ab', 10);
  assert.equal(result.length, 10);
  assert.ok(/^[ab]+$/.test(result));
});

test('pick returns an element from the list', () => {
  const list = ['a', 'b', 'c'];
  assert.ok(list.includes(pick(list)));
});

test('pickDistinct returns the requested count with no duplicates', () => {
  const result = pickDistinct(['a', 'b', 'c', 'd', 'e'], 3);
  assert.equal(result.length, 3);
  assert.equal(new Set(result).size, 3);
});

test('pickDistinct caps at the list length when n exceeds it', () => {
  const result = pickDistinct(['a', 'b'], 5);
  assert.equal(result.length, 2);
});
