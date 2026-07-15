export function randomInt(max) {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % max;
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
