import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadFavorites,
  isFavorite,
  addFavorite,
  removeFavorite,
  clearFavorites,
  loadRecent,
  addRecent,
  clearRecent,
} from '../src/lib/passwordLibrary.js';

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

test('loadFavorites resolves to an empty array when chrome.storage is unavailable', async () => {
  assert.deepEqual(await loadFavorites(), []);
});

test('addFavorite/removeFavorite/clearFavorites resolve without throwing when chrome.storage is unavailable', async () => {
  await assert.doesNotReject(() => addFavorite('Test1234!'));
  await assert.doesNotReject(() => removeFavorite('Test1234!'));
  await assert.doesNotReject(() => clearFavorites());
});

test('addFavorite persists a new favorite with a timestamp', async () => {
  await withMockChrome(async () => {
    await addFavorite('Aa1!Aa1!Aa1!');
    const favorites = await loadFavorites();
    assert.equal(favorites.length, 1);
    assert.equal(favorites[0].password, 'Aa1!Aa1!Aa1!');
    assert.equal(typeof favorites[0].savedAt, 'number');
  });
});

test('addFavorite does not create duplicates for the same password', async () => {
  await withMockChrome(async () => {
    await addFavorite('Aa1!Aa1!Aa1!');
    await addFavorite('Aa1!Aa1!Aa1!');
    const favorites = await loadFavorites();
    assert.equal(favorites.length, 1);
  });
});

test('newest favorite appears first', async () => {
  await withMockChrome(async () => {
    await addFavorite('first');
    await addFavorite('second');
    const favorites = await loadFavorites();
    assert.deepEqual(favorites.map((f) => f.password), ['second', 'first']);
  });
});

test('isFavorite reflects current favorite state', async () => {
  await withMockChrome(async () => {
    assert.equal(await isFavorite('Aa1!Aa1!Aa1!'), false);
    await addFavorite('Aa1!Aa1!Aa1!');
    assert.equal(await isFavorite('Aa1!Aa1!Aa1!'), true);
  });
});

test('removeFavorite removes only the matching entry', async () => {
  await withMockChrome(async () => {
    await addFavorite('keep-me');
    await addFavorite('remove-me');
    await removeFavorite('remove-me');
    const favorites = await loadFavorites();
    assert.deepEqual(favorites.map((f) => f.password), ['keep-me']);
  });
});

test('clearFavorites empties the list', async () => {
  await withMockChrome(async () => {
    await addFavorite('one');
    await addFavorite('two');
    await clearFavorites();
    assert.deepEqual(await loadFavorites(), []);
  });
});

test('loadRecent resolves to an empty array when chrome.storage is unavailable', async () => {
  assert.deepEqual(await loadRecent(), []);
});

test('addRecent persists a new entry with a timestamp, newest first', async () => {
  await withMockChrome(async () => {
    await addRecent('first');
    await addRecent('second');
    const recent = await loadRecent();
    assert.deepEqual(recent.map((r) => r.password), ['second', 'first']);
    assert.equal(typeof recent[0].copiedAt, 'number');
  });
});

test('addRecent moves an existing password to the front instead of duplicating it', async () => {
  await withMockChrome(async () => {
    await addRecent('a');
    await addRecent('b');
    await addRecent('a');
    const recent = await loadRecent();
    assert.deepEqual(recent.map((r) => r.password), ['a', 'b']);
  });
});

test('addRecent caps the list at 20 entries, dropping the oldest', async () => {
  await withMockChrome(async () => {
    for (let i = 0; i < 25; i++) {
      await addRecent(`password-${i}`);
    }
    const recent = await loadRecent();
    assert.equal(recent.length, 20);
    assert.equal(recent[0].password, 'password-24');
    assert.equal(recent[19].password, 'password-5');
  });
});

test('clearRecent empties the list', async () => {
  await withMockChrome(async () => {
    await addRecent('one');
    await clearRecent();
    assert.deepEqual(await loadRecent(), []);
  });
});
