import { generatePassword, MIN_LENGTH, MAX_LENGTH } from './passwordGenerator.js';

export function generateSimilarPassword(password) {
  if (!password) return null;

  const length = Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, password.length));
  const settings = {
    length,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password),
    excludeSimilar: false,
    excludeChars: '',
  };

  if (!settings.uppercase && !settings.lowercase && !settings.numbers && !settings.symbols) {
    return null;
  }

  return generatePassword(settings);
}
