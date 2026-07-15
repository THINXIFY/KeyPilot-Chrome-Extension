import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadSettings,
  saveSettings,
  loadSmartMode,
  saveSmartMode,
  loadRememberPreferences,
  setRememberPreferences,
  resetAllSettings,
} from '../src/lib/settingsStorage.js';
import { DEFAULT_SETTINGS } from '../src/lib/passwordGenerator.js';

function createMockChromeStorage() {
  let store = {};
  return {
    storage: {
      local: {
        get: async (key) => ({ [key]: store[key] }),
        set: async (obj) => { store = { ...store, ...obj }; },
        remove: async (keys) => {
          (Array.isArray(keys) ? keys : [keys]).forEach((k) => delete store[k]);
        },
      },
    },
  };
}

async function withMockChrome(fn) {
  globalThis.chrome = createMockChromeStorage();
  try {
    await fn();
  } finally {
    delete globalThis.chrome;
  }
}

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

test('loadRememberPreferences defaults to true when chrome.storage is unavailable', async () => {
  assert.equal(await loadRememberPreferences(), true);
});

test('setRememberPreferences and resetAllSettings resolve without throwing when chrome.storage is unavailable', async () => {
  await assert.doesNotReject(() => setRememberPreferences(false));
  await assert.doesNotReject(() => resetAllSettings());
});

test('saveSettings persists when remember preferences is on (default)', async () => {
  await withMockChrome(async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, length: 40 });
    const loaded = await loadSettings();
    assert.equal(loaded.length, 40);
  });
});

test('saveSettings does not persist when remember preferences is off', async () => {
  await withMockChrome(async () => {
    await setRememberPreferences(false);
    await saveSettings({ ...DEFAULT_SETTINGS, length: 30 });
    const loaded = await loadSettings();
    assert.equal(loaded.length, DEFAULT_SETTINGS.length);
  });
});

test('setRememberPreferences(false) clears previously saved settings and smart mode', async () => {
  await withMockChrome(async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, length: 50 });
    await saveSmartMode('theme');
    await setRememberPreferences(false);
    assert.equal((await loadSettings()).length, DEFAULT_SETTINGS.length);
    assert.equal(await loadSmartMode(), 'name');
  });
});

test('turning remember preferences back on allows saving again', async () => {
  await withMockChrome(async () => {
    await setRememberPreferences(false);
    await saveSettings({ ...DEFAULT_SETTINGS, length: 33 });
    assert.equal((await loadSettings()).length, DEFAULT_SETTINGS.length);

    await setRememberPreferences(true);
    await saveSettings({ ...DEFAULT_SETTINGS, length: 33 });
    assert.equal((await loadSettings()).length, 33);
  });
});

test('resetAllSettings clears settings, smart mode, and the remember flag', async () => {
  await withMockChrome(async () => {
    await saveSettings({ ...DEFAULT_SETTINGS, length: 22 });
    await saveSmartMode('memorable');
    await resetAllSettings();

    assert.equal(await loadRememberPreferences(), true);
    assert.equal((await loadSettings()).length, DEFAULT_SETTINGS.length);
    assert.equal(await loadSmartMode(), 'name');
  });
});
