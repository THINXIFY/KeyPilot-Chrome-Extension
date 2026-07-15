import { analyzePassword } from './passwordChecker.js';

export function comparePasswords(passwordA, passwordB) {
  const a = passwordA ? analyzePassword(passwordA) : null;
  const b = passwordB ? analyzePassword(passwordB) : null;

  let winner = null;
  if (a && b) {
    if (a.score > b.score) winner = 'a';
    else if (b.score > a.score) winner = 'b';
    else winner = 'tie';
  }

  return { a, b, winner };
}
