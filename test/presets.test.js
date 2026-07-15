import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRESETS, getPresetSettings } from '../src/lib/presets.js';
import { MIN_LENGTH, MAX_LENGTH } from '../src/lib/passwordGenerator.js';

const EXPECTED_KEYS = ['banking', 'email', 'social', 'work', 'gaming', 'developer'];

test('exposes exactly the 6 required presets', () => {
  assert.deepEqual(Object.keys(PRESETS).sort(), [...EXPECTED_KEYS].sort());
});

test('every preset has a length within the generator bounds', () => {
  for (const key of EXPECTED_KEYS) {
    const { length } = PRESETS[key].settings;
    assert.ok(length >= MIN_LENGTH && length <= MAX_LENGTH, `${key} length ${length} out of bounds`);
  }
});

test('every preset enables at least one character type', () => {
  for (const key of EXPECTED_KEYS) {
    const { uppercase, lowercase, numbers, symbols } = PRESETS[key].settings;
    assert.ok(uppercase || lowercase || numbers || symbols, `${key} has no character types enabled`);
  }
});

test('getPresetSettings returns a settings object for a known preset', () => {
  const settings = getPresetSettings('banking');
  assert.equal(settings.length, 20);
  assert.equal(settings.excludeSimilar, true);
});

test('getPresetSettings returns a fresh copy each call', () => {
  const a = getPresetSettings('email');
  const b = getPresetSettings('email');
  assert.deepEqual(a, b);
  assert.notEqual(a, b);
});

test('getPresetSettings returns null for an unknown preset', () => {
  assert.equal(getPresetSettings('not-a-real-preset'), null);
});

test('every preset defines avoidRepeated and avoidSequential as booleans', () => {
  for (const key of EXPECTED_KEYS) {
    const { avoidRepeated, avoidSequential } = PRESETS[key].settings;
    assert.equal(typeof avoidRepeated, 'boolean', `${key}.avoidRepeated should be a boolean`);
    assert.equal(typeof avoidSequential, 'boolean', `${key}.avoidSequential should be a boolean`);
  }
});

test('the stricter policies (Banking, Work, Developer) avoid both repeats and sequences', () => {
  for (const key of ['banking', 'work', 'developer']) {
    const { avoidRepeated, avoidSequential } = PRESETS[key].settings;
    assert.equal(avoidRepeated, true, `${key} should avoid repeated characters`);
    assert.equal(avoidSequential, true, `${key} should avoid sequential characters`);
  }
});
