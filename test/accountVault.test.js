import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  loadAccounts,
  addAccount,
  updateAccount,
  deleteAccount,
  clearAccounts,
  searchAccounts,
  normalizeVaultUrl,
  loadCategories,
  addCategory,
  DEFAULT_VAULT_CATEGORIES,
} from '../src/lib/accountVault.js';

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

const SAMPLE = {
  label: 'Gmail',
  url: 'gmail.com',
  username: 'sarah@example.com',
  password: 'Aa1!Aa1!Aa1!',
  category: 'Email',
  notes: 'Personal account',
};

test('loadAccounts resolves to an empty array when chrome.storage is unavailable', async () => {
  assert.deepEqual(await loadAccounts(), []);
});

test('addAccount resolves without throwing when chrome.storage is unavailable', async () => {
  await assert.doesNotReject(() => addAccount(SAMPLE));
});

test('addAccount does nothing without a label or password', async () => {
  await withMockChrome(async () => {
    await addAccount({ ...SAMPLE, label: '' });
    await addAccount({ ...SAMPLE, password: '' });
    assert.deepEqual(await loadAccounts(), []);
  });
});

test('addAccount persists a full entry with an id and timestamps', async () => {
  await withMockChrome(async () => {
    await addAccount(SAMPLE);
    const accounts = await loadAccounts();
    assert.equal(accounts.length, 1);
    assert.equal(accounts[0].label, 'Gmail');
    assert.equal(accounts[0].url, 'gmail.com');
    assert.equal(accounts[0].username, 'sarah@example.com');
    assert.equal(accounts[0].password, 'Aa1!Aa1!Aa1!');
    assert.equal(accounts[0].category, 'Email');
    assert.equal(accounts[0].notes, 'Personal account');
    assert.equal(typeof accounts[0].id, 'string');
    assert.ok(accounts[0].id.length > 0);
    assert.equal(typeof accounts[0].createdAt, 'number');
    assert.equal(typeof accounts[0].updatedAt, 'number');
  });
});

test('addAccount trims whitespace from text fields', async () => {
  await withMockChrome(async () => {
    await addAccount({ ...SAMPLE, label: '  Gmail  ', url: '  gmail.com  ', username: '  sarah  ' });
    const [account] = await loadAccounts();
    assert.equal(account.label, 'Gmail');
    assert.equal(account.url, 'gmail.com');
    assert.equal(account.username, 'sarah');
  });
});

test('newest account appears first', async () => {
  await withMockChrome(async () => {
    await addAccount({ ...SAMPLE, label: 'First' });
    await addAccount({ ...SAMPLE, label: 'Second' });
    const accounts = await loadAccounts();
    assert.deepEqual(accounts.map((a) => a.label), ['Second', 'First']);
  });
});

test('two accounts with the same label get distinct ids', async () => {
  await withMockChrome(async () => {
    await addAccount(SAMPLE);
    await addAccount(SAMPLE);
    const accounts = await loadAccounts();
    assert.equal(accounts.length, 2);
    assert.notEqual(accounts[0].id, accounts[1].id);
  });
});

test('updateAccount changes only the matching entry and bumps updatedAt', async () => {
  await withMockChrome(async () => {
    await addAccount({ ...SAMPLE, label: 'Keep' });
    await addAccount({ ...SAMPLE, label: 'Change' });
    const accounts = await loadAccounts();
    const target = accounts.find((a) => a.label === 'Change');

    await updateAccount(target.id, { label: 'Changed', password: 'NewPass1!' });
    const updated = await loadAccounts();
    const changed = updated.find((a) => a.id === target.id);
    const kept = updated.find((a) => a.label === 'Keep');

    assert.equal(changed.label, 'Changed');
    assert.equal(changed.password, 'NewPass1!');
    assert.ok(changed.updatedAt >= changed.createdAt);
    assert.equal(kept.label, 'Keep');
  });
});

test('deleteAccount removes only the matching entry', async () => {
  await withMockChrome(async () => {
    await addAccount({ ...SAMPLE, label: 'Keep' });
    await addAccount({ ...SAMPLE, label: 'Remove' });
    const accounts = await loadAccounts();
    const target = accounts.find((a) => a.label === 'Remove');

    await deleteAccount(target.id);
    const remaining = await loadAccounts();
    assert.equal(remaining.length, 1);
    assert.equal(remaining[0].label, 'Keep');
  });
});

test('clearAccounts empties the list', async () => {
  await withMockChrome(async () => {
    await addAccount(SAMPLE);
    await clearAccounts();
    assert.deepEqual(await loadAccounts(), []);
  });
});

test('searchAccounts returns everything for an empty query', () => {
  const accounts = [{ label: 'Gmail' }, { label: 'Netflix' }];
  assert.deepEqual(searchAccounts(accounts, ''), accounts);
  assert.deepEqual(searchAccounts(accounts, '   '), accounts);
});

test('searchAccounts matches label, url, username, category, and notes case-insensitively', () => {
  const accounts = [
    { label: 'Gmail', url: 'gmail.com', username: 'sarah@example.com', category: 'Email', notes: '' },
    { label: 'Netflix', url: 'netflix.com', username: 'sarah2', category: 'Entertainment', notes: 'shared with family' },
  ];
  assert.deepEqual(searchAccounts(accounts, 'GMAIL').map((a) => a.label), ['Gmail']);
  assert.deepEqual(searchAccounts(accounts, 'netflix.com').map((a) => a.label), ['Netflix']);
  assert.deepEqual(searchAccounts(accounts, 'family').map((a) => a.label), ['Netflix']);
  assert.deepEqual(searchAccounts(accounts, 'entertainment').map((a) => a.label), ['Netflix']);
  assert.deepEqual(searchAccounts(accounts, 'nonexistent'), []);
});

test('loadCategories resolves to the default list when chrome.storage is unavailable', async () => {
  assert.deepEqual(await loadCategories(), DEFAULT_VAULT_CATEGORIES);
});

test('loadCategories includes defaults plus any persisted custom categories', async () => {
  await withMockChrome(async () => {
    await addCategory('Streaming');
    const categories = await loadCategories();
    assert.deepEqual(categories, [...DEFAULT_VAULT_CATEGORIES, 'Streaming']);
  });
});

test('addCategory persists a new category and returns the merged list', async () => {
  await withMockChrome(async () => {
    const result = await addCategory('Streaming');
    assert.deepEqual(result, [...DEFAULT_VAULT_CATEGORIES, 'Streaming']);
  });
});

test('addCategory does not duplicate an existing default category (case-insensitive)', async () => {
  await withMockChrome(async () => {
    const result = await addCategory('work');
    assert.deepEqual(result, DEFAULT_VAULT_CATEGORIES);
  });
});

test('addCategory does not duplicate an existing custom category', async () => {
  await withMockChrome(async () => {
    await addCategory('Streaming');
    const result = await addCategory('streaming');
    assert.deepEqual(result, [...DEFAULT_VAULT_CATEGORIES, 'Streaming']);
  });
});

test('addCategory trims whitespace and ignores empty input', async () => {
  await withMockChrome(async () => {
    await addCategory('  Freelance  ');
    const categories = await loadCategories();
    assert.ok(categories.includes('Freelance'));

    const unchanged = await addCategory('   ');
    assert.deepEqual(unchanged, categories);
  });
});

test('normalizeVaultUrl adds https:// to bare domains but leaves existing schemes alone', () => {
  assert.equal(normalizeVaultUrl('gmail.com'), 'https://gmail.com');
  assert.equal(normalizeVaultUrl('https://gmail.com'), 'https://gmail.com');
  assert.equal(normalizeVaultUrl('http://gmail.com'), 'http://gmail.com');
  assert.equal(normalizeVaultUrl('  gmail.com  '), 'https://gmail.com');
  assert.equal(normalizeVaultUrl(''), '');
  assert.equal(normalizeVaultUrl(undefined), '');
});
