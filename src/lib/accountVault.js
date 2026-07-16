const VAULT_KEY = 'keypilotVault';

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;
}

function generateId() {
  return `acc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function loadAccounts() {
  if (!hasChromeStorage()) return [];
  const result = await chrome.storage.local.get(VAULT_KEY);
  return Array.isArray(result[VAULT_KEY]) ? result[VAULT_KEY] : [];
}

export async function addAccount(account) {
  if (!hasChromeStorage() || !account || !account.label || !account.password) return [];

  const accounts = await loadAccounts();
  const now = Date.now();
  const entry = {
    id: generateId(),
    label: account.label.trim(),
    url: (account.url || '').trim(),
    username: (account.username || '').trim(),
    password: account.password,
    category: (account.category || '').trim(),
    notes: (account.notes || '').trim(),
    createdAt: now,
    updatedAt: now,
  };
  const updated = [entry, ...accounts];
  await chrome.storage.local.set({ [VAULT_KEY]: updated });
  return updated;
}

export async function updateAccount(id, patch) {
  if (!hasChromeStorage() || !id) return [];

  const accounts = await loadAccounts();
  const updated = accounts.map((entry) => {
    if (entry.id !== id) return entry;
    return {
      ...entry,
      ...patch,
      label: (patch.label ?? entry.label).trim(),
      url: (patch.url ?? entry.url).trim(),
      username: (patch.username ?? entry.username).trim(),
      category: (patch.category ?? entry.category).trim(),
      notes: (patch.notes ?? entry.notes).trim(),
      updatedAt: Date.now(),
    };
  });
  await chrome.storage.local.set({ [VAULT_KEY]: updated });
  return updated;
}

export async function deleteAccount(id) {
  if (!hasChromeStorage()) return [];
  const accounts = await loadAccounts();
  const updated = accounts.filter((entry) => entry.id !== id);
  await chrome.storage.local.set({ [VAULT_KEY]: updated });
  return updated;
}

export async function clearAccounts() {
  if (!hasChromeStorage()) return;
  await chrome.storage.local.remove(VAULT_KEY);
}

export function searchAccounts(accounts, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return accounts;
  return accounts.filter((entry) => [entry.label, entry.url, entry.username, entry.category, entry.notes]
    .some((field) => (field || '').toLowerCase().includes(q)));
}

export function normalizeVaultUrl(url) {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
