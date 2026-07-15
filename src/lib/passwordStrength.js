import { getEffectivePoolSize } from './passwordGenerator.js';

const THRESHOLDS = [
  { maxBits: 40, label: 'Weak' },
  { maxBits: 60, label: 'Fair' },
  { maxBits: 80, label: 'Strong' },
];

export function calculateStrength(options = {}) {
  const poolSize = getEffectivePoolSize(options);
  const length = options.length || 0;

  if (poolSize === 0 || length === 0) {
    return { bits: 0, label: 'Weak' };
  }

  const bits = length * Math.log2(poolSize);

  for (const { maxBits, label } of THRESHOLDS) {
    if (bits < maxBits) {
      return { bits, label };
    }
  }

  return { bits, label: 'Excellent' };
}
