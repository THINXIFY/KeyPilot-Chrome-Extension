import { estimateStrengthFromPassword } from './passwordStrength.js';
import { generatePassword } from './passwordGenerator.js';

const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', '12345678', '12345', '1234567', '1234567890',
  'qwerty', 'qwerty123', 'abc123', 'password1', 'password123', 'passw0rd', 'admin', 'letmein',
  'welcome', 'monkey', 'login', 'princess', 'solo', 'master', 'football',
  'iloveyou', 'starwars', 'dragon', 'sunshine', 'trustno1', '000000', '111111',
  '123123', 'hello', 'freedom', 'whatever', 'shadow', 'baseball',
]);

const ASSUMED_GUESSES_PER_SECOND = 1e10;
const SECONDS_PER_CENTURY = 100 * 365.25 * 24 * 3600;

const STRONGER_PASSWORD_OPTIONS = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeSimilar: false,
  excludeChars: '',
};

function hasRepeatedRun(password) {
  return /(.)\1{2,}/.test(password);
}

function hasSequentialRun(password, runLength = 3) {
  const lower = password.toLowerCase();
  for (let i = 0; i <= lower.length - runLength; i++) {
    let ascending = true;
    let descending = true;
    for (let j = 1; j < runLength; j++) {
      const diff = lower.charCodeAt(i + j) - lower.charCodeAt(i + j - 1);
      if (diff !== 1) ascending = false;
      if (diff !== -1) descending = false;
    }
    if (ascending || descending) return true;
  }
  return false;
}

function isCommonPassword(password) {
  return COMMON_PASSWORDS.has(password.toLowerCase());
}

function formatDuration(seconds) {
  if (seconds < 1) return 'Instantly';

  const centuries = seconds / SECONDS_PER_CENTURY;
  if (centuries >= 1000) return 'Over 1,000 centuries';

  const units = [
    ['century', SECONDS_PER_CENTURY],
    ['year', 365.25 * 24 * 3600],
    ['month', 30 * 24 * 3600],
    ['day', 24 * 3600],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ];

  for (const [name, unitSeconds] of units) {
    if (seconds >= unitSeconds) {
      const value = Math.round(seconds / unitSeconds);
      return `${value.toLocaleString()} ${name}${value === 1 ? '' : 's'}`;
    }
  }

  return 'Instantly';
}

function estimateCrackTime(bits) {
  const seconds = Math.pow(2, bits) / (2 * ASSUMED_GUESSES_PER_SECOND);
  return formatDuration(seconds);
}

export function analyzePassword(password) {
  if (!password) return null;

  const { bits, label } = estimateStrengthFromPassword(password);

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const common = isCommonPassword(password);
  const repeated = hasRepeatedRun(password);
  const sequential = hasSequentialRun(password);

  const weaknesses = [];
  const tips = [];

  if (password.length < 8) {
    weaknesses.push('Too short');
    tips.push('Use at least 12 characters.');
  } else if (password.length < 12) {
    weaknesses.push('Could be longer');
    tips.push('Aim for 12 or more characters for stronger protection.');
  }

  if (common) {
    weaknesses.push('This is a commonly used password');
    tips.push('Avoid common passwords and dictionary words.');
  }

  if (!hasUpper) {
    weaknesses.push('No uppercase letters');
    tips.push('Add at least one uppercase letter.');
  }

  if (!hasLower) {
    weaknesses.push('No lowercase letters');
    tips.push('Add at least one lowercase letter.');
  }

  if (!hasNumber) {
    weaknesses.push('No numbers');
    tips.push('Add at least one number.');
  }

  if (!hasSymbol) {
    weaknesses.push('No symbols');
    tips.push('Add at least one symbol.');
  }

  if (repeated) {
    weaknesses.push('Contains repeated characters');
    tips.push("Avoid repeating the same character, like 'aaa'.");
  }

  if (sequential) {
    weaknesses.push('Contains sequential characters');
    tips.push("Avoid sequences like 'abc' or '123'.");
  }

  let score = Math.min(100, Math.round(bits));
  if (common) score = Math.min(score, 10);
  if (repeated) score -= 10;
  if (sequential) score -= 10;
  score = Math.max(0, Math.min(100, score));

  return {
    length: password.length,
    label,
    bits,
    score,
    crackTime: estimateCrackTime(bits),
    weaknesses,
    tips,
  };
}

export function generateStrongerPassword() {
  return generatePassword(STRONGER_PASSWORD_OPTIONS);
}
