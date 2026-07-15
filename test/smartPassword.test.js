import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateFromName,
  generateFromWords,
  generateOneFromName,
  generateOneFromWords,
  getSuggestionStrength,
} from '../src/lib/smartPassword.js';

test('generateFromName returns 5 unique suggestions for a typical name', () => {
  const suggestions = generateFromName('Sarah Johnson');
  assert.equal(suggestions.length, 5);
  assert.equal(new Set(suggestions).size, 5);
});

test('generateFromName suggestions never contain the raw name verbatim', () => {
  const suggestions = generateFromName('Sarah');
  for (const password of suggestions) {
    assert.ok(!password.includes('Sarah'), `unexpected raw name in ${password}`);
  }
});

test('generateFromName suggestions avoid the Name123/Name@123 pattern', () => {
  const suggestions = generateFromName('Sarah');
  for (const password of suggestions) {
    assert.notEqual(password, 'Sarah123');
    assert.notEqual(password, 'Sarah@123');
  }
});

test('generateFromName works with a single first name', () => {
  const suggestions = generateFromName('Jo');
  assert.ok(suggestions.length > 0);
});

test('generateFromName works with initials', () => {
  const suggestions = generateFromName('SJ');
  assert.ok(suggestions.length > 0);
});

test('generateFromName returns null for empty or blank input', () => {
  assert.equal(generateFromName(''), null);
  assert.equal(generateFromName('   '), null);
});

test('generateFromName returns null when input has no letters or digits', () => {
  assert.equal(generateFromName('!!!'), null);
});

test('generateFromName suggestions each meet the minimum length', () => {
  const suggestions = generateFromName('Al');
  for (const password of suggestions) {
    assert.ok(password.length >= 10, `password too short: ${password}`);
  }
});

test('generateFromWords returns unique suggestions for 3 words', () => {
  const suggestions = generateFromWords(['ocean', 'tiger', 'lamp']);
  assert.equal(suggestions.length, 5);
  assert.equal(new Set(suggestions).size, 5);
});

test('generateFromWords works with a single word', () => {
  const suggestions = generateFromWords(['ocean', '', '']);
  assert.ok(suggestions.length > 0);
});

test('generateFromWords ignores more than 3 words', () => {
  const password = generateOneFromWords(['one', 'two', 'three', 'four']);
  assert.notEqual(password, null);
});

test('generateFromWords returns null when all words are empty', () => {
  assert.equal(generateFromWords(['', '', '']), null);
  assert.equal(generateFromWords([]), null);
});

test('generateFromWords suggestions never contain a raw input word verbatim', () => {
  const suggestions = generateFromWords(['ocean', 'tiger', '']);
  for (const password of suggestions) {
    assert.ok(!password.includes('ocean'), `unexpected raw word in ${password}`);
    assert.ok(!password.includes('tiger'), `unexpected raw word in ${password}`);
  }
});

test('generateOneFromName produces a single valid password', () => {
  const password = generateOneFromName('Priya');
  assert.equal(typeof password, 'string');
  assert.ok(password.length >= 10);
});

test('generateOneFromWords produces a single valid password', () => {
  const password = generateOneFromWords(['mango', 'kite', '']);
  assert.equal(typeof password, 'string');
  assert.ok(password.length >= 10);
});

test('getSuggestionStrength returns a recognized label for a generated password', () => {
  const password = generateOneFromName('Taylor');
  const { label } = getSuggestionStrength(password);
  assert.ok(['Weak', 'Fair', 'Strong', 'Excellent'].includes(label));
});
