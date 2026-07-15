import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateUsernames,
  generateOneUsername,
  generateCustomUsernames,
  generateOneCustomUsername,
  sanitizeCustomWord,
  USERNAME_STYLES,
} from '../src/lib/usernameGenerator.js';

test('exposes exactly the 4 required styles', () => {
  assert.deepEqual([...USERNAME_STYLES].sort(), ['developer', 'gaming', 'minimal', 'professional']);
});

test('generateUsernames returns 5 unique suggestions by default', () => {
  const usernames = generateUsernames('professional');
  assert.equal(usernames.length, 5);
  assert.equal(new Set(usernames).size, 5);
});

test('professional usernames use only letters, digits, and an optional dot', () => {
  for (const username of generateUsernames('professional')) {
    assert.ok(/^[A-Za-z]+\.?[0-9]+$/.test(username), `unexpected format: ${username}`);
  }
});

test('minimal usernames are short, lowercase, and end in exactly 2 digits', () => {
  for (const username of generateUsernames('minimal')) {
    assert.ok(/^[a-z]+[0-9]{2}$/.test(username), `unexpected format: ${username}`);
  }
});

test('gaming usernames use only letters, digits, and an optional underscore', () => {
  for (const username of generateUsernames('gaming')) {
    assert.ok(/^[A-Za-z0-9]+_?[0-9]+$/.test(username), `unexpected format: ${username}`);
  }
});

test('developer usernames combine two distinct words with an underscore and digits', () => {
  for (const username of generateUsernames('developer')) {
    assert.ok(/^[a-z]+_[a-z]+[0-9]+$/.test(username), `unexpected format: ${username}`);
  }
});

test('falls back to the professional style for an unknown style name', () => {
  const username = generateOneUsername('not-a-real-style');
  assert.equal(typeof username, 'string');
  assert.ok(username.length > 0);
});

test('generateOneUsername produces different usernames across calls', () => {
  const a = generateOneUsername('gaming');
  const b = generateOneUsername('gaming');
  assert.notEqual(a, b);
});

test('usernames contain no spaces or symbols outside dot/underscore', () => {
  for (const style of USERNAME_STYLES) {
    for (const username of generateUsernames(style)) {
      assert.ok(/^[A-Za-z0-9._]+$/.test(username), `unexpected characters in ${username}`);
    }
  }
});

test('sanitizeCustomWord strips non-alphanumeric characters and caps length', () => {
  assert.equal(sanitizeCustomWord('  Sarah! '), 'Sarah');
  assert.equal(sanitizeCustomWord('a b-c_d'), 'abcd');
  assert.equal(sanitizeCustomWord('x'.repeat(30)).length, 20);
  assert.equal(sanitizeCustomWord('***'), '');
  assert.equal(sanitizeCustomWord(''), '');
});

test('generateCustomUsernames returns 6 unique suggestions by default', () => {
  const usernames = generateCustomUsernames('Sarah', 'professional');
  assert.equal(usernames.length, 6);
  assert.equal(new Set(usernames).size, 6);
});

test('generateCustomUsernames returns null for input that sanitizes to empty', () => {
  assert.equal(generateCustomUsernames('!!!', 'professional'), null);
  assert.equal(generateCustomUsernames('   ', 'gaming'), null);
});

test('generateOneCustomUsername returns null for input that sanitizes to empty', () => {
  assert.equal(generateOneCustomUsername('###', 'minimal'), null);
});

test('custom professional usernames embed the sanitized word, capitalized', () => {
  for (const username of generateCustomUsernames('sarah', 'professional')) {
    assert.ok(/^Sarah\.?[0-9]+$/.test(username), `unexpected format: ${username}`);
  }
});

test('custom minimal usernames embed the sanitized word, lowercase, plus 2 digits', () => {
  for (const username of generateCustomUsernames('Sarah', 'minimal')) {
    assert.ok(/^sarah[0-9]{2}$/.test(username), `unexpected format: ${username}`);
  }
});

test('custom gaming usernames combine a styled version of the word with a creative flavor word', () => {
  for (const username of generateCustomUsernames('sarah', 'gaming')) {
    assert.ok(/^[A-Za-z0-9]+_[A-Za-z0-9]+[0-9]+$/.test(username), `unexpected format: ${username}`);
  }
});

test('custom developer usernames embed the word alongside a cyber flavor word', () => {
  for (const username of generateCustomUsernames('sarah', 'developer')) {
    assert.ok(/^[a-z]+_[a-z]+[0-9]+$/.test(username), `unexpected format: ${username}`);
    assert.ok(username.toLowerCase().includes('sarah'), `expected input word in ${username}`);
  }
});

test('custom usernames sanitize symbols and spaces out of the input word', () => {
  for (const username of generateCustomUsernames('Sa ra!h', 'minimal')) {
    assert.ok(/^sarah[0-9]{2}$/.test(username), `unexpected format: ${username}`);
  }
});

test('falls back to the professional style for an unknown style name (custom)', () => {
  const username = generateOneCustomUsername('sarah', 'not-a-real-style');
  assert.ok(/^Sarah\.?[0-9]+$/.test(username), `unexpected format: ${username}`);
});
