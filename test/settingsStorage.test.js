import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSettings, saveSettings, loadSmartMode, saveSmartMode } from '../src/lib/settingsStorage.js';
import { DEFAULT_SETTINGS } from '../src/lib/passwordGenerator.js';

test('loadSettings resolves to defaults when chrome.storage is unavailable', async () => {
  const settings = await loadSettings();
  assert.deepEqual(settings, DEFAULT_SETTINGS);
});

test('saveSettings resolves without throwing when chrome.storage is unavailable', async () => {
  await assert.doesNotReject(() => saveSettings({ length: 20 }));
});

test('loadSmartMode resolves to "name" when chrome.storage is unavailable', async () => {
  const mode = await loadSmartMode();
  assert.equal(mode, 'name');
});

test('saveSmartMode resolves without throwing when chrome.storage is unavailable', async () => {
  await assert.doesNotReject(() => saveSmartMode('theme'));
});
