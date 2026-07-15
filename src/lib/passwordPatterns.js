export function hasRepeatedRun(password) {
  return /(.)\1{2,}/.test(password);
}

export function hasSequentialRun(password, runLength = 3) {
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
