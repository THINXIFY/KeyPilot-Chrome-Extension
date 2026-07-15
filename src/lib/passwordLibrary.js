const FAVORITES_KEY = 'cipherkeyFavorites';
const RECENT_KEY = 'cipherkeyRecent';
const RECENT_LIMIT = 20;

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;
}

export async function loadFavorites() {
  if (!hasChromeStorage()) return [];
  const result = await chrome.storage.local.get(FAVORITES_KEY);
  return Array.isArray(result[FAVORITES_KEY]) ? result[FAVORITES_KEY] : [];
}

export async function isFavorite(password) {
  const favorites = await loadFavorites();
  return favorites.some((entry) => entry.password === password);
}

export async function addFavorite(password) {
  if (!hasChromeStorage() || !password) return [];
  const favorites = await loadFavorites();
  if (favorites.some((entry) => entry.password === password)) return favorites;
  const updated = [{ password, savedAt: Date.now() }, ...favorites];
  await chrome.storage.local.set({ [FAVORITES_KEY]: updated });
  return updated;
}

export async function removeFavorite(password) {
  if (!hasChromeStorage()) return [];
  const favorites = await loadFavorites();
  const updated = favorites.filter((entry) => entry.password !== password);
  await chrome.storage.local.set({ [FAVORITES_KEY]: updated });
  return updated;
}

export async function clearFavorites() {
  if (!hasChromeStorage()) return;
  await chrome.storage.local.remove(FAVORITES_KEY);
}

export async function loadRecent() {
  if (!hasChromeStorage()) return [];
  const result = await chrome.storage.local.get(RECENT_KEY);
  return Array.isArray(result[RECENT_KEY]) ? result[RECENT_KEY] : [];
}

export async function addRecent(password) {
  if (!hasChromeStorage() || !password) return [];
  const recent = await loadRecent();
  const deduped = recent.filter((entry) => entry.password !== password);
  const updated = [{ password, copiedAt: Date.now() }, ...deduped].slice(0, RECENT_LIMIT);
  await chrome.storage.local.set({ [RECENT_KEY]: updated });
  return updated;
}

export async function clearRecent() {
  if (!hasChromeStorage()) return;
  await chrome.storage.local.remove(RECENT_KEY);
}
