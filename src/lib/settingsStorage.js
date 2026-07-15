import { DEFAULT_SETTINGS } from './passwordGenerator.js';

const STORAGE_KEY = 'cipherkeySettings';
const SMART_MODE_KEY = 'cipherkeySmartMode';
const REMEMBER_KEY = 'cipherkeyRememberPreferences';
const DEFAULT_SMART_MODE = 'name';
const VALID_SMART_MODES = ['name', 'words', 'memorable', 'passphrase', 'pronounceable', 'theme'];

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;
}

export async function loadRememberPreferences() {
  if (!hasChromeStorage()) {
    return true;
  }

  const result = await chrome.storage.local.get(REMEMBER_KEY);
  return result[REMEMBER_KEY] !== false;
}

export async function setRememberPreferences(remember) {
  if (!hasChromeStorage()) {
    return;
  }

  await chrome.storage.local.set({ [REMEMBER_KEY]: remember });

  if (!remember) {
    await chrome.storage.local.remove([STORAGE_KEY, SMART_MODE_KEY]);
  }
}

export async function resetAllSettings() {
  if (!hasChromeStorage()) {
    return;
  }

  await chrome.storage.local.remove([STORAGE_KEY, SMART_MODE_KEY, REMEMBER_KEY]);
}

export async function loadSettings() {
  if (!hasChromeStorage()) {
    return { ...DEFAULT_SETTINGS };
  }

  const result = await chrome.storage.local.get(STORAGE_KEY);
  const saved = result[STORAGE_KEY];
  return saved ? { ...DEFAULT_SETTINGS, ...saved } : { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings) {
  if (!hasChromeStorage() || !(await loadRememberPreferences())) {
    return;
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: settings });
}

export async function loadSmartMode() {
  if (!hasChromeStorage()) {
    return DEFAULT_SMART_MODE;
  }

  const result = await chrome.storage.local.get(SMART_MODE_KEY);
  const saved = result[SMART_MODE_KEY];
  return VALID_SMART_MODES.includes(saved) ? saved : DEFAULT_SMART_MODE;
}

export async function saveSmartMode(mode) {
  if (!hasChromeStorage() || !VALID_SMART_MODES.includes(mode) || !(await loadRememberPreferences())) {
    return;
  }

  await chrome.storage.local.set({ [SMART_MODE_KEY]: mode });
}
