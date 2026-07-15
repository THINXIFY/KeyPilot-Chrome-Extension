// Uniform random integer in [0, max) via rejection sampling, so every
// outcome is equally likely — a plain `% max` skews low values slightly
// more likely whenever max doesn't evenly divide 2^32.
export function randomInt(max) {
  const buffer = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / max) * max;

  let value;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);

  return value % max;
}

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function randomChars(charset, n) {
  return Array.from({ length: n }, () => charset[randomInt(charset.length)]).join('');
}

export function pick(list) {
  return list[randomInt(list.length)];
}

export function pickDistinct(list, n) {
  const pool = [...list];
  const result = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = randomInt(pool.length);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}
