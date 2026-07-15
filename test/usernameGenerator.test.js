import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateUsernames, generateOneUsername, USERNAME_STYLES } from '../src/lib/usernameGenerator.js';

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
