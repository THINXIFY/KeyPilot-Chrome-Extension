# Phase 1.2 — Core Password Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Phase 1.1 basic generator into a fully configurable, offline password tool: length slider + manual input, character-type toggles, avoid-similar/custom-exclusion options, a live strength meter, and settings persisted across popup sessions — without breaking the premium Phase 1.1 visual style.

**Architecture:** Same no-build-tool, vanilla HTML/CSS/JS, Manifest V3 foundation as Phase 1.1. `src/lib/passwordGenerator.js` moves from a `length` parameter to a full options object (backward compatible: calling it with no arguments still returns a 16-character password using all four character types, matching Phase 1.1 behavior). Two new pure modules (`passwordStrength.js`, `settingsStorage.js`) and one new DOM component (`strengthMeter.js`) are added following the existing `lib/`/`components/` split. `chrome.storage.local` persists settings behind a new `"storage"` permission.

**Tech Stack:** Manifest V3, vanilla JS (ES modules), vanilla CSS, Web Crypto API, `chrome.storage.local`, Node's built-in `node:test` runner for pure-logic unit tests.

---

### Task 1: Extend `passwordGenerator.js` to an options-based API (TDD)

**Files:**
- Modify: `test/passwordGenerator.test.js` (full rewrite)
- Modify: `src/lib/passwordGenerator.js` (full rewrite)

- [ ] **Step 1: Replace the test file with the new option-based test suite**

Replace the entire contents of `test/passwordGenerator.test.js` with:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generatePassword,
  getEffectivePoolSize,
  MIN_LENGTH,
  MAX_LENGTH,
} from '../src/lib/passwordGenerator.js';

const SYMBOLS = '!@#$%^&*()-_=+[]{}<>?';

test('generates a password of the default length (16) with default options', () => {
  const password = generatePassword();
  assert.equal(password.length, 16);
});

test('generates a password of a custom length via options', () => {
  const password = generatePassword({ length: 24 });
  assert.equal(password.length, 24);
});

test('default options include at least one uppercase, lowercase, digit, and symbol', () => {
  const password = generatePassword();
  assert.ok(/[A-Z]/.test(password), 'expected an uppercase letter');
  assert.ok(/[a-z]/.test(password), 'expected a lowercase letter');
  assert.ok(/[0-9]/.test(password), 'expected a digit');
  assert.ok([...password].some((ch) => SYMBOLS.includes(ch)), 'expected a symbol');
});

test('produces different passwords across calls', () => {
  const a = generatePassword();
  const b = generatePassword();
  assert.notEqual(a, b);
});

test('uppercase-only setting produces only uppercase characters', () => {
  const password = generatePassword({
    length: 16, uppercase: true, lowercase: false, numbers: false, symbols: false,
  });
  assert.ok(/^[A-Z]+$/.test(password));
});

test('lowercase-only setting produces only lowercase characters', () => {
  const password = generatePassword({
    length: 16, uppercase: false, lowercase: true, numbers: false, symbols: false,
  });
  assert.ok(/^[a-z]+$/.test(password));
});

test('numbers-only setting produces only digits', () => {
  const password = generatePassword({
    length: 16, uppercase: false, lowercase: false, numbers: true, symbols: false,
  });
  assert.ok(/^[0-9]+$/.test(password));
});

test('symbols-only setting produces only symbols', () => {
  const password = generatePassword({
    length: 16, uppercase: false, lowercase: false, numbers: false, symbols: true,
  });
  assert.ok([...password].every((ch) => SYMBOLS.includes(ch)));
});

test('returns null when all character types are disabled', () => {
  const password = generatePassword({
    length: 16, uppercase: false, lowercase: false, numbers: false, symbols: false,
  });
  assert.equal(password, null);
});

test('excludeSimilar removes O, 0, I, l, 1 from the output', () => {
  for (let i = 0; i < 20; i++) {
    const password = generatePassword({ length: 64, excludeSimilar: true });
    assert.ok(!/[O0Il1]/.test(password), `unexpected similar character in ${password}`);
  }
});

test('excludeChars removes the specified characters from the output', () => {
  for (let i = 0; i < 20; i++) {
    const password = generatePassword({ length: 64, excludeChars: 'aeiou' });
    assert.ok(![...password].some((ch) => 'aeiou'.includes(ch)), `unexpected excluded character in ${password}`);
  }
});

test('returns null when exclusions empty the entire effective pool', () => {
  const password = generatePassword({
    length: 8,
    uppercase: false,
    lowercase: false,
    numbers: true,
    symbols: false,
    excludeChars: '0123456789',
  });
  assert.equal(password, null);
});

test('throws RangeError for length below the minimum', () => {
  assert.throws(() => generatePassword({ length: MIN_LENGTH - 1 }), RangeError);
});

test('throws RangeError for length above the maximum', () => {
  assert.throws(() => generatePassword({ length: MAX_LENGTH + 1 }), RangeError);
});

test('throws RangeError for a non-integer length', () => {
  assert.throws(() => generatePassword({ length: 12.5 }), RangeError);
});

test('accepts the minimum and maximum boundary lengths', () => {
  assert.equal(generatePassword({ length: MIN_LENGTH }).length, MIN_LENGTH);
  assert.equal(generatePassword({ length: MAX_LENGTH }).length, MAX_LENGTH);
});

test('getEffectivePoolSize reflects enabled types and exclusions', () => {
  assert.equal(
    getEffectivePoolSize({ uppercase: true, lowercase: false, numbers: false, symbols: false }),
    26
  );
  assert.equal(
    getEffectivePoolSize({ uppercase: false, lowercase: false, numbers: false, symbols: false }),
    0
  );
});
```

- [ ] **Step 2: Run tests to verify they fail against the old implementation**

Run: `npm test`
Expected: FAIL — most tests fail because the old `generatePassword(length)` numeric API doesn't understand option objects (e.g. `generatePassword({ length: 24 })` silently ignores the object and returns a 16-character password, failing the length-24 assertion; `uppercase-only` etc. fail because the old implementation always includes all four character classes).

- [ ] **Step 3: Replace `src/lib/passwordGenerator.js` with the options-based implementation**

Replace the entire contents of `src/lib/passwordGenerator.js` with:

```js
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{}<>?',
};

const SIMILAR_CHARACTERS = 'O0Il1';

export const MIN_LENGTH = 8;
export const MAX_LENGTH = 64;
const DEFAULT_LENGTH = 16;

export const DEFAULT_SETTINGS = {
  length: DEFAULT_LENGTH,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeSimilar: false,
  excludeChars: '',
};

function randomInt(max) {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % max;
}

function randomChar(charset) {
  return charset[randomInt(charset.length)];
}

function shuffle(chars) {
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars;
}

function buildUsableSubsets(settings) {
  const excludeSet = new Set(
    (settings.excludeSimilar ? SIMILAR_CHARACTERS : '') + (settings.excludeChars || '')
  );

  return Object.keys(CHAR_SETS)
    .filter((type) => settings[type])
    .map((type) => ({
      type,
      chars: [...CHAR_SETS[type]].filter((ch) => !excludeSet.has(ch)).join(''),
    }))
    .filter((subset) => subset.chars.length > 0);
}

export function getEffectivePoolSize(options = {}) {
  const settings = { ...DEFAULT_SETTINGS, ...options };
  const usableSubsets = buildUsableSubsets(settings);
  return usableSubsets.reduce((total, subset) => total + subset.chars.length, 0);
}

export function generatePassword(options = {}) {
  const settings = { ...DEFAULT_SETTINGS, ...options };
  const { length } = settings;

  if (!Number.isInteger(length) || length < MIN_LENGTH || length > MAX_LENGTH) {
    throw new RangeError(`length must be an integer between ${MIN_LENGTH} and ${MAX_LENGTH}`);
  }

  const usableSubsets = buildUsableSubsets(settings);
  const pool = usableSubsets.map((subset) => subset.chars).join('');

  if (pool.length === 0) {
    return null;
  }

  const required = usableSubsets.map((subset) => randomChar(subset.chars));
  const remainingCount = length - required.length;
  const remaining = Array.from({ length: remainingCount }, () => randomChar(pool));

  return shuffle([...required, ...remaining]).join('');
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all 17 tests passing, 0 failing

- [ ] **Step 5: Commit**

```bash
git add test/passwordGenerator.test.js src/lib/passwordGenerator.js
git commit -m "feat: extend password generator to a configurable options API"
```

---

### Task 2: Add `passwordStrength.js` (TDD)

**Files:**
- Create: `test/passwordStrength.test.js`
- Create: `src/lib/passwordStrength.js`

- [ ] **Step 1: Write the failing tests**

Create `test/passwordStrength.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateStrength } from '../src/lib/passwordStrength.js';

test('short digits-only password is Weak', () => {
  const { label } = calculateStrength({
    length: 8, uppercase: false, lowercase: false, numbers: true, symbols: false,
  });
  assert.equal(label, 'Weak');
});

test('8-character full-pool password is Fair', () => {
  const { label } = calculateStrength({
    length: 8, uppercase: true, lowercase: true, numbers: true, symbols: true,
  });
  assert.equal(label, 'Fair');
});

test('12-character full-pool password is Strong', () => {
  const { label } = calculateStrength({
    length: 12, uppercase: true, lowercase: true, numbers: true, symbols: true,
  });
  assert.equal(label, 'Strong');
});

test('16-character full-pool password is Excellent', () => {
  const { label } = calculateStrength({
    length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true,
  });
  assert.equal(label, 'Excellent');
});

test('returns Weak when no character types are enabled', () => {
  const { label } = calculateStrength({
    length: 16, uppercase: false, lowercase: false, numbers: false, symbols: false,
  });
  assert.equal(label, 'Weak');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/lib/passwordStrength.js'`

- [ ] **Step 3: Implement `src/lib/passwordStrength.js`**

```js
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all tests passing (17 from Task 1 + 5 new = 22), 0 failing

- [ ] **Step 5: Commit**

```bash
git add test/passwordStrength.test.js src/lib/passwordStrength.js
git commit -m "feat: add password strength estimation (Weak/Fair/Strong/Excellent)"
```

---

### Task 3: Add `settingsStorage.js` (TDD for the fallback path)

**Files:**
- Create: `test/settingsStorage.test.js`
- Create: `src/lib/settingsStorage.js`

- [ ] **Step 1: Write the failing tests**

Create `test/settingsStorage.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSettings, saveSettings } from '../src/lib/settingsStorage.js';
import { DEFAULT_SETTINGS } from '../src/lib/passwordGenerator.js';

test('loadSettings resolves to defaults when chrome.storage is unavailable', async () => {
  const settings = await loadSettings();
  assert.deepEqual(settings, DEFAULT_SETTINGS);
});

test('saveSettings resolves without throwing when chrome.storage is unavailable', async () => {
  await assert.doesNotReject(() => saveSettings({ length: 20 }));
});
```

Note: these tests run under Node, where no global `chrome` object exists, so they exercise the module's fallback path (no real `chrome.storage.local` involved). Real persistence against `chrome.storage.local` is verified manually in Task 10, inside an actual loaded extension.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/lib/settingsStorage.js'`

- [ ] **Step 3: Implement `src/lib/settingsStorage.js`**

```js
import { DEFAULT_SETTINGS } from './passwordGenerator.js';

const STORAGE_KEY = 'cipherkeySettings';

function hasChromeStorage() {
  return typeof chrome !== 'undefined' && !!chrome.storage && !!chrome.storage.local;
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
  if (!hasChromeStorage()) {
    return;
  }

  await chrome.storage.local.set({ [STORAGE_KEY]: settings });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — all tests passing (22 from Tasks 1-2 + 2 new = 24), 0 failing

- [ ] **Step 5: Commit**

```bash
git add test/settingsStorage.test.js src/lib/settingsStorage.js
git commit -m "feat: add chrome.storage.local settings persistence wrapper"
```

---

### Task 4: Add the `storage` permission to `manifest.json`

**Files:**
- Modify: `manifest.json`

- [ ] **Step 1: Add the `permissions` field and bump the version**

Replace the entire contents of `manifest.json` with:

```json
{
  "manifest_version": 3,
  "name": "CipherKey",
  "short_name": "CipherKey",
  "version": "1.1.0",
  "description": "Generate strong, secure passwords instantly — fully offline.",
  "action": {
    "default_popup": "src/popup/popup.html"
  },
  "permissions": ["storage"]
}
```

- [ ] **Step 2: Validate the JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add manifest.json
git commit -m "chore: add storage permission and bump version for Phase 1.2"
```

---

### Task 5: Add the `strengthMeter.js` component

**Files:**
- Create: `src/components/strengthMeter.js`

- [ ] **Step 1: Implement `src/components/strengthMeter.js`**

```js
const FILL_PERCENT_BY_VARIANT = {
  weak: 25,
  fair: 50,
  strong: 75,
  excellent: 100,
};

const LABEL_TO_VARIANT = {
  Weak: 'weak',
  Fair: 'fair',
  Strong: 'strong',
  Excellent: 'excellent',
};

export function updateStrengthMeter(container, { label, length }) {
  const fill = container.querySelector('.strength-meter__fill');
  const text = container.querySelector('.strength-meter__label');
  const count = container.querySelector('.strength-meter__count');
  if (!fill || !text || !count) return;

  const variant = LABEL_TO_VARIANT[label] || 'weak';

  fill.style.width = `${FILL_PERCENT_BY_VARIANT[variant]}%`;
  fill.className = `strength-meter__fill strength-meter__fill--${variant}`;
  text.textContent = `Strength: ${label}`;
  count.textContent = `${length} characters`;
}
```

## Context for this component

`updateStrengthMeter(container, { label, length })` looks up three child elements inside `container` by class name (`.strength-meter__fill`, `.strength-meter__label`, `.strength-meter__count`) — it does not create them; those elements are added to `popup.html` in Task 6. This mirrors the existing `showToast(container, message, variant)` pattern from Phase 1.1's `toast.js`: the component only manages state on pre-existing markup, styling is entirely CSS (added in Task 7), and `popup.js` (Task 8) will call it as `updateStrengthMeter(strengthSection, { label, length: settings.length })` after every password generation.

- [ ] **Step 2: Check the file for syntax errors**

Run: `node --check src/components/strengthMeter.js`
Expected: no output (exit code 0)

- [ ] **Step 3: Commit**

```bash
git add src/components/strengthMeter.js
git commit -m "feat: add strength meter component"
```

---

### Task 6: Rewrite `popup.html` with the new controls

**Files:**
- Modify: `src/popup/popup.html` (full rewrite)

- [ ] **Step 1: Replace the entire contents of `src/popup/popup.html`**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CipherKey</title>
  <link rel="stylesheet" href="popup.css" />
</head>
<body>
  <main class="app">
    <header class="app__header">
      <div class="logo" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="9" fill="url(#logo-gradient)" />
          <path d="M16 9a4 4 0 0 0-4 4v2h-1a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1h-1v-2a4 4 0 0 0-4-4Zm0 2a2 2 0 0 1 2 2v2h-4v-2a2 2 0 0 1 2-2Z" fill="#FFFFFF" />
          <defs>
            <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop stop-color="#0057FF" />
              <stop offset="1" stop-color="#0042C2" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="app__titles">
        <h1 class="app__title">CipherKey</h1>
        <p class="app__subtitle">Secure passwords, instantly.</p>
      </div>
    </header>

    <section class="card">
      <label class="visually-hidden" for="password-output">Generated password</label>
      <input
        id="password-output"
        class="password-output"
        type="text"
        readonly
        spellcheck="false"
        autocomplete="off"
        placeholder="No characters selected"
      />
    </section>

    <section class="strength" aria-live="polite">
      <div class="strength-meter__track">
        <div class="strength-meter__fill strength-meter__fill--weak"></div>
      </div>
      <div class="strength-meter__meta">
        <span class="strength-meter__label">Strength: Weak</span>
        <span class="strength-meter__count">16 characters</span>
      </div>
    </section>

    <section class="control">
      <div class="control__header">
        <label class="control__label" for="length-input">Length</label>
        <input
          id="length-input"
          class="length-input"
          type="number"
          min="8"
          max="64"
          step="1"
          value="16"
          inputmode="numeric"
        />
      </div>
      <input
        id="length-slider"
        class="length-slider"
        type="range"
        min="8"
        max="64"
        step="1"
        value="16"
      />
    </section>

    <section class="control control--types">
      <div class="toggle-grid">
        <label class="toggle">
          <input id="toggle-uppercase" type="checkbox" checked />
          <span class="toggle__switch" aria-hidden="true"></span>
          <span class="toggle__label">Uppercase (A-Z)</span>
        </label>
        <label class="toggle">
          <input id="toggle-lowercase" type="checkbox" checked />
          <span class="toggle__switch" aria-hidden="true"></span>
          <span class="toggle__label">Lowercase (a-z)</span>
        </label>
        <label class="toggle">
          <input id="toggle-numbers" type="checkbox" checked />
          <span class="toggle__switch" aria-hidden="true"></span>
          <span class="toggle__label">Numbers (0-9)</span>
        </label>
        <label class="toggle">
          <input id="toggle-symbols" type="checkbox" checked />
          <span class="toggle__switch" aria-hidden="true"></span>
          <span class="toggle__label">Symbols (!@#...)</span>
        </label>
      </div>
    </section>

    <div id="warning-banner" class="warning-banner" hidden>
      Select at least one character type to generate a password.
    </div>

    <div class="actions">
      <button id="generate-btn" class="btn btn--primary" type="button">
        Generate Password
      </button>
      <button id="copy-btn" class="btn btn--secondary" type="button">
        Copy
      </button>
    </div>

    <details class="advanced">
      <summary class="advanced__summary">Advanced options</summary>
      <div class="advanced__content">
        <label class="toggle toggle--full">
          <input id="toggle-exclude-similar" type="checkbox" />
          <span class="toggle__switch" aria-hidden="true"></span>
          <span class="toggle__label">Avoid similar characters (O, 0, I, l, 1)</span>
        </label>

        <div class="field">
          <label class="field__label" for="exclude-chars-input">Custom excluded characters</label>
          <input
            id="exclude-chars-input"
            class="field__input"
            type="text"
            placeholder="e.g. {}~^"
            autocomplete="off"
            spellcheck="false"
          />
        </div>
      </div>
    </details>

    <div class="toast" role="status" aria-live="polite"></div>
  </main>

  <script type="module" src="popup.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/popup/popup.html
git commit -m "feat: add length, character-type, and advanced-options markup to popup"
```

---

### Task 7: Extend `popup.css` with styles for the new controls

**Files:**
- Modify: `src/popup/popup.css`

- [ ] **Step 1: Add a new `--color-warning` token to `:root`**

In `src/popup/popup.css`, find this line inside the `:root { ... }` block:

```css
  --color-success: #22C55E;
```

Add a new line immediately after it:

```css
  --color-success: #22C55E;
  --color-warning: #F5A623;
```

- [ ] **Step 2: Add a disabled-button state**

Find this existing block:

```css
.btn:active {
  transform: scale(0.97);
}
```

Add immediately after it:

```css
.btn:active {
  transform: scale(0.97);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: none;
  box-shadow: none;
  transform: none;
}
```

- [ ] **Step 3: Style the password field's placeholder text**

Find this existing block:

```css
.password-output:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}
```

Add immediately after it:

```css
.password-output:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.password-output::placeholder {
  color: var(--color-text-muted);
}
```

- [ ] **Step 4: Add styles for the strength meter, length control, toggles, warning banner, and advanced disclosure**

Find this existing block (the last rule before `.toast`):

```css
.btn--copied {
  background: var(--color-success);
  border-color: var(--color-success);
  color: var(--color-heading);
}
```

Add immediately after it (still before the `.toast { ... }` rule):

```css
.btn--copied {
  background: var(--color-success);
  border-color: var(--color-success);
  color: var(--color-heading);
}

.strength-meter__track {
  height: 6px;
  border-radius: var(--radius-sm);
  background: var(--color-card-border);
  overflow: hidden;
}

.strength-meter__fill {
  height: 100%;
  border-radius: var(--radius-sm);
  transition: width var(--transition-med) ease, background-color var(--transition-med) ease;
}

.strength-meter__fill--weak {
  background: var(--color-error);
}

.strength-meter__fill--fair {
  background: var(--color-warning);
}

.strength-meter__fill--strong {
  background: var(--color-primary);
}

.strength-meter__fill--excellent {
  background: var(--color-success);
}

.strength-meter__meta {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-2);
  font-size: 12px;
  color: var(--color-text-muted);
}

.strength-meter__label {
  color: var(--color-text);
  font-weight: 500;
}

.control__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.control__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.length-input {
  width: 56px;
  padding: var(--space-1) var(--space-2);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-sm);
  background: var(--color-card-bg);
  color: var(--color-heading);
  font-family: var(--font-mono);
  font-size: 14px;
  text-align: center;
}

.length-input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.length-slider {
  width: 100%;
  height: 4px;
  appearance: none;
  -webkit-appearance: none;
  background: var(--color-card-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.length-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid var(--color-heading);
  cursor: pointer;
  transition: transform var(--transition-fast);
}

.length-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.toggle-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.toggle {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
}

.toggle--full {
  margin-bottom: var(--space-3);
}

.toggle input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.toggle__switch {
  position: relative;
  flex-shrink: 0;
  width: 34px;
  height: 20px;
  border-radius: 999px;
  background: var(--color-card-border);
  transition: background-color var(--transition-fast);
}

.toggle__switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-heading);
  transition: transform var(--transition-fast);
}

.toggle input:checked + .toggle__switch {
  background: var(--color-primary);
}

.toggle input:checked + .toggle__switch::after {
  transform: translateX(14px);
}

.toggle input:focus-visible + .toggle__switch {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.toggle__label {
  font-size: 12px;
  color: var(--color-text);
}

.warning-banner {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: rgba(255, 77, 79, 0.12);
  border: 1px solid var(--color-error);
  color: var(--color-heading);
  font-size: 13px;
}

.advanced {
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
}

.advanced__summary {
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  list-style: none;
}

.advanced__summary::-webkit-details-marker {
  display: none;
}

.advanced__summary::before {
  content: '▸';
  display: inline-block;
  margin-right: var(--space-2);
  transition: transform var(--transition-fast);
}

.advanced[open] .advanced__summary::before {
  transform: rotate(90deg);
}

.advanced__content {
  display: flex;
  flex-direction: column;
  margin-top: var(--space-4);
}

.field__label {
  display: block;
  margin-bottom: var(--space-2);
  font-size: 12px;
  color: var(--color-text-muted);
}

.field__input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-sm);
  background: var(--color-card-bg);
  color: var(--color-heading);
  font-family: var(--font-mono);
  font-size: 13px;
}

.field__input:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

.field__input::placeholder {
  color: var(--color-text-muted);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/popup/popup.css
git commit -m "style: add strength meter, length control, toggle, and advanced-options styling"
```

---

### Task 8: Rewrite `popup.js` to wire up all the new controls

**Files:**
- Modify: `src/popup/popup.js` (full rewrite)

- [ ] **Step 1: Replace the entire contents of `src/popup/popup.js`**

```js
import { generatePassword, MIN_LENGTH, MAX_LENGTH } from '../lib/passwordGenerator.js';
import { calculateStrength } from '../lib/passwordStrength.js';
import { loadSettings, saveSettings } from '../lib/settingsStorage.js';
import { copyToClipboard } from '../lib/clipboard.js';
import { showToast } from '../components/toast.js';
import { updateStrengthMeter } from '../components/strengthMeter.js';

const passwordOutput = document.getElementById('password-output');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const app = document.querySelector('.app');
const strengthSection = document.querySelector('.strength');
const lengthInput = document.getElementById('length-input');
const lengthSlider = document.getElementById('length-slider');
const warningBanner = document.getElementById('warning-banner');

const toggleInputs = {
  uppercase: document.getElementById('toggle-uppercase'),
  lowercase: document.getElementById('toggle-lowercase'),
  numbers: document.getElementById('toggle-numbers'),
  symbols: document.getElementById('toggle-symbols'),
};
const excludeSimilarInput = document.getElementById('toggle-exclude-similar');
const excludeCharsInput = document.getElementById('exclude-chars-input');

let settings = null;
let saveTimeoutId = null;

function applySettingsToControls() {
  lengthInput.value = settings.length;
  lengthSlider.value = settings.length;
  toggleInputs.uppercase.checked = settings.uppercase;
  toggleInputs.lowercase.checked = settings.lowercase;
  toggleInputs.numbers.checked = settings.numbers;
  toggleInputs.symbols.checked = settings.symbols;
  excludeSimilarInput.checked = settings.excludeSimilar;
  excludeCharsInput.value = settings.excludeChars;
}

function readTogglesIntoSettings() {
  settings = {
    ...settings,
    uppercase: toggleInputs.uppercase.checked,
    lowercase: toggleInputs.lowercase.checked,
    numbers: toggleInputs.numbers.checked,
    symbols: toggleInputs.symbols.checked,
    excludeSimilar: excludeSimilarInput.checked,
    excludeChars: excludeCharsInput.value,
  };
}

function clampLength(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return settings.length;
  return Math.min(MAX_LENGTH, Math.max(MIN_LENGTH, parsed));
}

function renderPassword() {
  const password = generatePassword(settings);

  if (password === null) {
    passwordOutput.value = '';
    warningBanner.hidden = false;
    generateBtn.disabled = true;
    copyBtn.disabled = true;
    updateStrengthMeter(strengthSection, { label: 'Weak', length: settings.length });
    return;
  }

  warningBanner.hidden = true;
  generateBtn.disabled = false;
  copyBtn.disabled = false;

  passwordOutput.value = password;
  passwordOutput.classList.remove('is-updating');
  // Force reflow so the fade-in animation replays on consecutive changes.
  void passwordOutput.offsetWidth;
  passwordOutput.classList.add('is-updating');

  const { label } = calculateStrength(settings);
  updateStrengthMeter(strengthSection, { label, length: settings.length });
}

function persistSettings() {
  clearTimeout(saveTimeoutId);
  saveTimeoutId = setTimeout(() => {
    saveSettings(settings);
  }, 300);
}

function handleToggleChange() {
  readTogglesIntoSettings();
  renderPassword();
  persistSettings();
}

function handleLengthInputChange() {
  settings.length = clampLength(lengthInput.value);
  lengthInput.value = settings.length;
  lengthSlider.value = settings.length;
  renderPassword();
  persistSettings();
}

function handleLengthSliderInput() {
  settings.length = Number.parseInt(lengthSlider.value, 10);
  lengthInput.value = settings.length;
  renderPassword();
  persistSettings();
}

const COPY_LABEL = 'Copy';
const COPIED_LABEL = 'Copied ✓';
let copiedTimeoutId = null;

async function handleCopy() {
  if (!passwordOutput.value) return;

  try {
    const succeeded = await copyToClipboard(passwordOutput.value);
    showToast(
      app,
      succeeded ? 'Copied to clipboard' : 'Copy failed — please try again',
      succeeded ? 'success' : 'error'
    );

    if (succeeded) {
      clearTimeout(copiedTimeoutId);
      copyBtn.textContent = COPIED_LABEL;
      copyBtn.classList.add('btn--copied');
      copiedTimeoutId = setTimeout(() => {
        copyBtn.textContent = COPY_LABEL;
        copyBtn.classList.remove('btn--copied');
      }, 1500);
    }
  } catch {
    showToast(app, 'Copy failed — please try again', 'error');
  }
}

async function init() {
  settings = await loadSettings();
  applySettingsToControls();
  renderPassword();

  generateBtn.addEventListener('click', renderPassword);
  copyBtn.addEventListener('click', handleCopy);

  lengthInput.addEventListener('change', handleLengthInputChange);
  lengthSlider.addEventListener('input', handleLengthSliderInput);

  toggleInputs.uppercase.addEventListener('change', handleToggleChange);
  toggleInputs.lowercase.addEventListener('change', handleToggleChange);
  toggleInputs.numbers.addEventListener('change', handleToggleChange);
  toggleInputs.symbols.addEventListener('change', handleToggleChange);
  excludeSimilarInput.addEventListener('change', handleToggleChange);
  excludeCharsInput.addEventListener('input', handleToggleChange);
}

init();
```

## Context for this rewrite

- `renderPassword()` now calls `generatePassword(settings)` with the full settings object instead of no arguments. When it returns `null` (no usable characters), the password field is cleared to empty (which reveals the `placeholder="No characters selected"` text added to `popup.html` in Task 6, styled via `.password-output::placeholder` added in Task 7), the warning banner (`#warning-banner`, `hidden` attribute toggled) is shown, and both buttons get `.disabled = true`. This directly implements the design spec's "no characters available" validation path.
- Manual clicks on **Generate Password** call `renderPassword()` directly — this is the "Regenerate" behavior from the spec: same settings, new random password, no settings re-read, no re-persist (nothing changed).
- Every settings-affecting control change calls `renderPassword()` synchronously (auto-regenerate) and separately calls `persistSettings()`, which debounces the actual `chrome.storage.local` write by 300ms via `clearTimeout`/`setTimeout` — so dragging the length slider regenerates and re-renders on every `input` event, but only writes to storage after the drag pauses for 300ms.
- The length number input listens on `change` (fires on blur/Enter, not every keystroke) so clamping doesn't fight the user mid-typing; the range slider listens on `input` (fires continuously during drag) since a native range input's value is always already within `[min, max]`.
- `init()` is `async` and awaits `loadSettings()` before attaching any event listeners, so no handler can ever run against a `null` `settings` object.

- [ ] **Step 2: Check the file for syntax errors**

Run: `node --check src/popup/popup.js`
Expected: no output (exit code 0)

- [ ] **Step 3: Commit**

```bash
git add src/popup/popup.js
git commit -m "feat: wire length, toggle, exclusion, and strength-meter controls into popup"
```

---

### Task 9: Update `README.md` for Phase 1.2

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the entire contents of `README.md`**

```markdown
# CipherKey — Password Generator (Chrome Extension)

A premium, fully offline Chrome extension that generates strong, secure,
fully configurable passwords.

## Features

**Phase 1.1**
- Crypto-secure password generation (`crypto.getRandomValues`)
- One-click copy to clipboard with toast + button confirmation
- Premium, responsive popup UI — no external services, no network calls

**Phase 1.2**
- Password length slider and manual numeric input (8–64 characters)
- Toggle uppercase, lowercase, numbers, and symbols independently
- Avoid similar characters (`O`, `0`, `I`, `l`, `1`)
- Custom excluded characters
- Live strength meter with Weak / Fair / Strong / Excellent labels and
  character count
- Settings are saved locally (`chrome.storage.local`) and restored the
  next time the popup opens
- Clear warning when the selected options leave no usable characters —
  generation and copy are disabled until at least one character is
  available

## Installation (load unpacked)

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select this project's root folder.
5. The CipherKey icon appears in your toolbar (click the puzzle-piece icon and pin
   it if it's not visible).

## Usage

1. Click the CipherKey toolbar icon to open the popup.
2. A password is generated automatically using your last-used settings
   (or sensible defaults the first time).
3. Adjust the length (slider or the number field), or toggle character
   types — the password regenerates automatically as you change options.
4. Open **Advanced options** to avoid similar-looking characters or
   exclude specific characters.
5. Click **Generate Password** to get a new password with the current
   settings, or **Copy** to copy it to your clipboard.
6. If every character type is turned off (or your exclusions remove all
   available characters), a warning appears and Generate/Copy are
   disabled until you re-enable at least one character type.

## Project structure

```
Password Generator - Chrome Extension/
├── manifest.json               # Manifest V3 config (storage permission)
├── package.json                # test script only, no runtime dependencies
├── src/
│   ├── popup/
│   │   ├── popup.html          # popup markup
│   │   ├── popup.css           # popup styling
│   │   └── popup.js            # wires UI to lib/component modules
│   ├── lib/
│   │   ├── passwordGenerator.js  # pure, crypto-secure, configurable generation
│   │   ├── passwordStrength.js   # pure strength estimation
│   │   ├── settingsStorage.js    # chrome.storage.local wrapper
│   │   └── clipboard.js          # copy-to-clipboard helper
│   └── components/
│       ├── toast.js              # reusable toast notification
│       └── strengthMeter.js      # strength bar + label + count
├── test/
│   ├── passwordGenerator.test.js
│   ├── passwordStrength.test.js
│   └── settingsStorage.test.js
└── icons/                        # reserved for future icon assets
```

## Running tests

Pure logic (generation, strength estimation, the storage fallback path)
is covered by unit tests using Node's built-in test runner (no
dependencies to install):

```bash
npm test
```

## Roadmap

Future phases may add password history, passphrase generation, a
checker for pasted-in passwords, a username generator, and visual
themes. These remain intentionally out of scope for now.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README for Phase 1.2 features"
```

---

### Task 10: Manual verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full unit test suite**

Run: `npm test`
Expected: PASS — all tests green (24 tests from Tasks 1-3)

- [ ] **Step 2: Syntax-check every JS file**

Run: `node --check src/lib/passwordGenerator.js && node --check src/lib/passwordStrength.js && node --check src/lib/settingsStorage.js && node --check src/lib/clipboard.js && node --check src/components/toast.js && node --check src/components/strengthMeter.js && node --check src/popup/popup.js`
Expected: no output, exit code 0

- [ ] **Step 3: Validate `manifest.json`**

Run: `node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 4: Functional verification in real Chrome via a local static server**

This environment's Chrome install has `--load-extension` disabled by policy (a Google-branded-build restriction confirmed during Phase 1.1's verification, not something this project can work around). Reuse the same substitute approach as Phase 1.1: serve the project root over a local HTTP server (e.g. Node's built-in `http` module on `127.0.0.1`), then drive real Chrome at `http://127.0.0.1:<port>/src/popup/popup.html` with Playwright (`npx playwright`, using `channel: 'chrome'` to reuse the installed browser rather than downloading Chromium). `chrome.storage` will be `undefined` in this context, so `settingsStorage.js`'s fallback path is exercised (in-memory defaults only) — that's expected and fine for this step; real persistence is checked in Step 6.

Verify, with screenshots and console-error capture at each point:
1. Popup loads with a password already generated, strength meter and character count populated, matching the default settings (16 chars, all four types on).
2. Moving the length slider updates the number input, regenerates the password live, and updates the strength meter/count.
3. Editing the number input and blurring (or pressing Enter) clamps out-of-range values into `[8, 64]` and regenerates.
4. Toggling each of the four character-type switches off/on regenerates the password and visibly changes its character composition.
5. Turning off all four character-type toggles: password field shows the "No characters selected" placeholder, the warning banner appears, and both Generate and Copy become disabled (verify the `disabled` attribute, not just visual styling).
6. Re-enabling one toggle: warning disappears, buttons re-enable, a valid password reappears.
7. Expanding "Advanced options": toggling "Avoid similar characters" regenerates and the result contains none of `O 0 I l 1` (sample several generations). Typing characters into "Custom excluded characters" regenerates and excludes them.
8. Clicking **Generate Password** produces a new password using the same current settings (not a settings reset).
9. Clicking **Copy** still shows the toast, the "Copied ✓" button micro-animation, and the clipboard actually contains the password (as in Phase 1.1).
10. Zero real console errors throughout (a `/favicon.ico` 404 against the throwaway test server, if it appears, is expected and not a real issue — confirmed in Phase 1.1).

- [ ] **Step 5: Fix any issues found in Step 4, then re-verify**

If any check in Step 4 fails, fix the relevant file and re-run the affected checks before proceeding. Commit any fixes:

```bash
git add -A
git commit -m "fix: address issue found during Phase 1.2 manual verification"
```

- [ ] **Step 6: Ask the user to confirm real settings persistence**

The one thing this environment cannot verify end-to-end is `chrome.storage.local` persistence inside a real loaded extension (Step 4 runs without a `chrome` global at all). Ask the user to, in their own already-loaded CipherKey extension:
1. Change a few settings (length, a toggle, avoid-similar).
2. Close the popup, then reopen it.
3. Confirm the settings from step 1 are still applied (not reset to defaults).

If they report a problem, treat it as a bug to fix in `settingsStorage.js` or `popup.js` and re-verify.
