import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateStrength } from '../src/lib/passwordStrength.js';

test('short digits-only password is Weak', () => {
  const { label } = calculateStrength({
    length: 8, uppercase: false, lowercase: false, numbers: true, symbols: false,
  });
  assert.equal(label, 'Weak');
});

test('8-character full-pool password is Fair', () => {
  const { label } = calculateStrength({
    length: 8, uppercase: true, lowercase: true, numbers: true, symbols: true,
  });
  assert.equal(label, 'Fair');
});

test('12-character full-pool password is Strong', () => {
  const { label } = calculateStrength({
    length: 12, uppercase: true, lowercase: true, numbers: true, symbols: true,
  });
  assert.equal(label, 'Strong');
});

test('16-character full-pool password is Excellent', () => {
  const { label } = calculateStrength({
    length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true,
  });
  assert.equal(label, 'Excellent');
});

test('returns Weak when no character types are enabled', () => {
  const { label } = calculateStrength({
    length: 16, uppercase: false, lowercase: false, numbers: false, symbols: false,
  });
  assert.equal(label, 'Weak');
});
