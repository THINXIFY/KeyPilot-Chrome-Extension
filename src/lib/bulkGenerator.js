import { generatePassword } from './passwordGenerator.js';

export const BULK_QUANTITIES = [10, 25, 50, 100];
const DEFAULT_QUANTITY = 10;
const MAX_ATTEMPTS_MULTIPLIER = 3;

function resolveQuantity(quantity) {
  return BULK_QUANTITIES.includes(quantity) ? quantity : DEFAULT_QUANTITY;
}

export function generateBulk(settings, quantity) {
  const count = resolveQuantity(quantity);
  const results = new Set();
  let attempts = 0;

  while (results.size < count && attempts < count * MAX_ATTEMPTS_MULTIPLIER) {
    const password = generatePassword(settings);
    if (password === null) return null;
    results.add(password);
    attempts++;
  }

  return [...results];
}
