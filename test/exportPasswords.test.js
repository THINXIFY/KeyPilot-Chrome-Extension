import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toTxt, toCsv } from '../src/lib/exportPasswords.js';

test('toTxt joins passwords with newlines', () => {
  assert.equal(toTxt(['abc123', 'xyz789']), 'abc123\nxyz789');
});

test('toTxt handles a single password', () => {
  assert.equal(toTxt(['solo']), 'solo');
});

test('toCsv adds a header row and quotes each password', () => {
  assert.equal(toCsv(['abc123', 'xyz789']), 'password\n"abc123"\n"xyz789"');
});

test('toCsv escapes embedded double quotes', () => {
  assert.equal(toCsv(['ab"cd']), 'password\n"ab""cd"');
});

test('toCsv handles an empty list (header only)', () => {
  assert.equal(toCsv([]), 'password');
});
