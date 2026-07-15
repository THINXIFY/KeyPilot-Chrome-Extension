import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSimilarPassword } from '../src/lib/similarPassword.js';
import { MIN_LENGTH, MAX_LENGTH } from '../src/lib/passwordGenerator.js';

test('returns null for an empty password', () => {
  assert.equal(generateSimilarPassword(''), null);
});

test('matches the length of the original password', () => {
  const similar = generateSimilarPassword('Tr0ub4dor&3xy');
  assert.equal(similar.length, 'Tr0ub4dor&3xy'.length);
});

test('matches the character classes present in the original', () => {
  const similar = generateSimilarPassword('abcdefgh'); // lowercase only
  assert.ok(/^[a-z]+$/.test(similar), `expected lowercase-only, got ${similar}`);
});

test('matches uppercase+numbers only when that is all the original has', () => {
  const similar = generateSimilarPassword('ABC12345');
  assert.ok(/^[A-Z0-9]+$/.test(similar), `expected uppercase+digits only, got ${similar}`);
});

test('produces a different password than the original', () => {
  const original = 'K9#mZq2$vLp7@wRxT4nB8!eF';
  const similar = generateSimilarPassword(original);
  assert.notEqual(similar, original);
});

test('clamps an overly long input (e.g. a long passphrase) to the max generator length', () => {
  const longPassphrase = 'Correct-Horse-Battery-Staple-Wagon-River-Delta-Frost-Extra-Words-Here';
  const similar = generateSimilarPassword(longPassphrase);
  assert.equal(similar.length, MAX_LENGTH);
});

test('clamps an overly short input to the min generator length', () => {
  const similar = generateSimilarPassword('ab1!');
  assert.equal(similar.length, MIN_LENGTH);
});

test('produces different passwords across calls', () => {
  const a = generateSimilarPassword('MySecurePass123!');
  const b = generateSimilarPassword('MySecurePass123!');
  assert.notEqual(a, b);
});
