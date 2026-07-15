import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyzePassword, generateStrongerPassword } from '../src/lib/passwordChecker.js';

test('returns null for an empty password', () => {
  assert.equal(analyzePassword(''), null);
});

test('reports the correct length', () => {
  const result = analyzePassword('Tr0ub4dor&3');
  assert.equal(result.length, 11);
});

test('score is bounded between 0 and 100', () => {
  const weak = analyzePassword('a');
  const strong = analyzePassword('K9#mZq2$vLp7@wRxT4nB8!eF');
  assert.ok(weak.score >= 0 && weak.score <= 100);
  assert.ok(strong.score >= 0 && strong.score <= 100);
  assert.ok(strong.score > weak.score);
});

test('crackTime is a non-empty human-readable string', () => {
  const result = analyzePassword('hunter2');
  assert.equal(typeof result.crackTime, 'string');
  assert.ok(result.crackTime.length > 0);
});

test('crackTime pluralizes "centuries" correctly, not "centurys"', () => {
  const result = analyzePassword('K9#mZq2$vLp7@wRxT4nB8!eF');
  assert.ok(!result.crackTime.includes('centurys'), `bad pluralization: ${result.crackTime}`);
  if (result.crackTime.includes('century') || result.crackTime.includes('centuries')) {
    assert.ok(/centuries$/.test(result.crackTime) || result.crackTime === '1 century', result.crackTime);
  }
});

test('flags a common password with a low score', () => {
  const result = analyzePassword('password123');
  assert.ok(result.weaknesses.includes('This is a commonly used password'));
  assert.ok(result.score <= 10);
});

test('flags a short password', () => {
  const result = analyzePassword('Ab1!');
  assert.ok(result.weaknesses.includes('Too short'));
});

test('flags missing character classes', () => {
  const result = analyzePassword('lowercaseonly');
  assert.ok(result.weaknesses.includes('No uppercase letters'));
  assert.ok(result.weaknesses.includes('No numbers'));
  assert.ok(result.weaknesses.includes('No symbols'));
});

test('flags repeated characters', () => {
  const result = analyzePassword('Paaaassword1!');
  assert.ok(result.weaknesses.includes('Contains repeated characters'));
});

test('flags sequential characters', () => {
  const result = analyzePassword('myAbcdPass1!');
  assert.ok(result.weaknesses.includes('Contains sequential characters'));
});

test('flags sequential digits', () => {
  const result = analyzePassword('my12345Pass!');
  assert.ok(result.weaknesses.includes('Contains sequential characters'));
});

test('a long random password has no weaknesses and a high score', () => {
  const result = analyzePassword('K9#mZq2$vLp7@wRxT4nB8!eF');
  assert.deepEqual(result.weaknesses, []);
  assert.deepEqual(result.tips, []);
  assert.ok(result.score >= 90);
});

test('weaknesses and tips arrays stay in sync', () => {
  const result = analyzePassword('abc');
  assert.equal(result.weaknesses.length, result.tips.length);
});

test('generateStrongerPassword returns a 20-character password with all character types', () => {
  const password = generateStrongerPassword();
  assert.equal(password.length, 20);
  assert.ok(/[A-Z]/.test(password));
  assert.ok(/[a-z]/.test(password));
  assert.ok(/[0-9]/.test(password));
  assert.ok(/[^A-Za-z0-9]/.test(password));
});

test('generateStrongerPassword produces different passwords across calls', () => {
  const a = generateStrongerPassword();
  const b = generateStrongerPassword();
  assert.notEqual(a, b);
});
