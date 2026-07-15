# Phase 1.1 — Password Generator Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Manifest V3 Chrome extension foundation — a premium, offline-only popup UI ("CipherKey") that generates a secure 16-character password and copies it to the clipboard with a toast confirmation.

**Architecture:** Plain HTML/CSS/JS with no build step. `src/lib/passwordGenerator.js` is a pure, dependency-free module (testable in Node via the built-in test runner); `src/lib/clipboard.js` and `src/components/toast.js` are small browser-only helper modules; `src/popup/popup.js` wires them together against `popup.html`/`popup.css`.

**Tech Stack:** Manifest V3, vanilla JS (ES modules), vanilla CSS, Web Crypto API (`crypto.getRandomValues`), Node's built-in `node:test` runner for unit tests (no npm dependencies).

---

### Task 1: Project scaffolding

**Files:**
- Create: `manifest.json`
- Create: `package.json`
- Create: `.gitignore`
- Create: `icons/` (directory only — no assets yet, see spec's Icons note)

- [ ] **Step 1: Create `manifest.json`**

```json
{
  "manifest_version": 3,
  "name": "CipherKey",
  "short_name": "CipherKey",
  "version": "1.0.0",
  "description": "Generate strong, secure passwords instantly — fully offline.",
  "action": {
    "default_popup": "src/popup/popup.html"
  }
}
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "cipherkey-password-generator",
  "version": "1.0.0",
  "private": true,
  "description": "CipherKey — a premium, offline Chrome extension password generator.",
  "type": "module",
  "scripts": {
    "test": "node --test test/"
  }
}
```

- [ ] **Step 3: Create `.gitignore`**

```
node_modules/
.DS_Store
Thumbs.db
```

- [ ] **Step 4: Validate `manifest.json` is well-formed JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('manifest.json', 'utf8')); console.log('valid')"`
Expected: `valid`

- [ ] **Step 5: Commit**

```bash
git add manifest.json package.json .gitignore
git commit -m "chore: scaffold Chrome extension project (manifest, package.json, gitignore)"
```

---

### Task 2: Secure password generator (TDD)

**Files:**
- Create: `test/passwordGenerator.test.js`
- Create: `src/lib/passwordGenerator.js`

- [ ] **Step 1: Write the failing tests**

Create `test/passwordGenerator.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generatePassword } from '../src/lib/passwordGenerator.js';

const SYMBOLS = '!@#$%^&*()-_=+[]{}<>?';

test('generates a password of the default length (16)', () => {
  const password = generatePassword();
  assert.equal(password.length, 16);
});

test('generates a password of a custom length', () => {
  const password = generatePassword(24);
  assert.equal(password.length, 24);
});

test('includes at least one uppercase, lowercase, digit, and symbol', () => {
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

test('throws when requested length is smaller than the number of required character classes', () => {
  assert.throws(() => generatePassword(2), RangeError);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/lib/passwordGenerator.js'`

- [ ] **Step 3: Implement `src/lib/passwordGenerator.js`**

```js
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}<>?';

const CHARACTER_SETS = [UPPERCASE, LOWERCASE, DIGITS, SYMBOLS];
const ALL_CHARACTERS = CHARACTER_SETS.join('');

const DEFAULT_LENGTH = 16;

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

export function generatePassword(length = DEFAULT_LENGTH) {
  if (length < CHARACTER_SETS.length) {
    throw new RangeError(`length must be at least ${CHARACTER_SETS.length}`);
  }

  const required = CHARACTER_SETS.map((set) => randomChar(set));
  const remainingCount = length - required.length;
  const remaining = Array.from({ length: remainingCount }, () => randomChar(ALL_CHARACTERS));

  return shuffle([...required, ...remaining]).join('');
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS — 5 tests passing, 0 failing

- [ ] **Step 5: Commit**

```bash
git add test/passwordGenerator.test.js src/lib/passwordGenerator.js
git commit -m "feat: add crypto-secure password generator with unit tests"
```

---

### Task 3: Clipboard helper

**Files:**
- Create: `src/lib/clipboard.js`

- [ ] **Step 1: Implement `src/lib/clipboard.js`**

```js
export async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy fallback below.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  let succeeded = false;
  try {
    succeeded = document.execCommand('copy');
  } catch {
    succeeded = false;
  } finally {
    document.body.removeChild(textarea);
  }

  return succeeded;
}
```

- [ ] **Step 2: Check the file for syntax errors**

Run: `node --check src/lib/clipboard.js`
Expected: no output (exit code 0)

- [ ] **Step 3: Commit**

```bash
git add src/lib/clipboard.js
git commit -m "feat: add clipboard helper with legacy execCommand fallback"
```

---

### Task 4: Toast component

**Files:**
- Create: `src/components/toast.js`

- [ ] **Step 1: Implement `src/components/toast.js`**

```js
let hideTimeoutId = null;

export function showToast(container, message, variant = 'success') {
  const toast = container.querySelector('.toast');
  if (!toast) return;

  clearTimeout(hideTimeoutId);

  toast.textContent = message;
  toast.classList.remove('toast--success', 'toast--error');
  toast.classList.add(variant === 'error' ? 'toast--error' : 'toast--success');
  toast.classList.add('toast--visible');

  hideTimeoutId = setTimeout(() => {
    toast.classList.remove('toast--visible');
  }, 2000);
}
```

- [ ] **Step 2: Check the file for syntax errors**

Run: `node --check src/components/toast.js`
Expected: no output (exit code 0)

- [ ] **Step 3: Commit**

```bash
git add src/components/toast.js
git commit -m "feat: add reusable toast component"
```

---

### Task 5: Popup markup

**Files:**
- Create: `src/popup/popup.html`

- [ ] **Step 1: Implement `src/popup/popup.html`**

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
      />
    </section>

    <div class="actions">
      <button id="generate-btn" class="btn btn--primary" type="button">
        Generate Password
      </button>
      <button id="copy-btn" class="btn btn--secondary" type="button">
        Copy
      </button>
    </div>

    <div class="toast" role="status" aria-live="polite"></div>
  </main>

  <script type="module" src="popup.js"></script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/popup/popup.html
git commit -m "feat: add popup markup (header, password card, actions, toast)"
```

---

### Task 6: Popup styling

**Files:**
- Create: `src/popup/popup.css`

- [ ] **Step 1: Implement `src/popup/popup.css`**

```css
:root {
  --color-bg: #010207;
  --color-heading: #FFFFFF;
  --color-text: #E6E8F0;
  --color-text-muted: #9AA0B4;
  --color-card-bg: #0B0D16;
  --color-card-border: #1C2030;
  --gradient-primary: linear-gradient(135deg, #0057FF 0%, #0042C2 100%);
  --color-primary: #0057FF;
  --color-error: #FF4D4F;
  --color-success: #22C55E;
  --radius-lg: 16px;
  --radius-md: 12px;
  --radius-sm: 8px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  --transition-fast: 150ms ease;
  --transition-med: 250ms ease;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  width: 390px;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.app {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  padding: var(--space-6) var(--space-5);
}

.app__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.app__titles {
  display: flex;
  flex-direction: column;
}

.app__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--color-heading);
  letter-spacing: -0.01em;
}

.app__subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

.card {
  background: var(--color-card-bg);
  border: 1px solid var(--color-card-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: border-color var(--transition-med);
}

.card:hover {
  border-color: #2A3049;
}

.password-output {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  color: var(--color-heading);
  font-family: var(--font-mono);
  font-size: 20px;
  letter-spacing: 0.03em;
  text-overflow: ellipsis;
}

.actions {
  display: flex;
  gap: var(--space-3);
}

.btn {
  flex: 1;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform var(--transition-fast), filter var(--transition-fast), box-shadow var(--transition-fast);
}

.btn:active {
  transform: scale(0.97);
}

.btn--primary {
  background: var(--gradient-primary);
  color: var(--color-heading);
  box-shadow: 0 4px 14px rgba(0, 87, 255, 0.35);
}

.btn--primary:hover {
  filter: brightness(1.08);
  box-shadow: 0 6px 18px rgba(0, 87, 255, 0.45);
}

.btn--secondary {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-card-border);
}

.btn--secondary:hover {
  border-color: var(--color-primary);
  color: var(--color-heading);
}

.toast {
  position: absolute;
  left: 50%;
  bottom: var(--space-4);
  transform: translate(-50%, 8px);
  opacity: 0;
  pointer-events: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-heading);
  background: #12151F;
  border: 1px solid var(--color-card-border);
  transition: opacity var(--transition-med), transform var(--transition-med);
}

.toast--visible {
  opacity: 1;
  transform: translate(-50%, 0);
}

.toast--success {
  border-color: var(--color-success);
}

.toast--error {
  border-color: var(--color-error);
}

@keyframes fade-scale-in {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.password-output.is-updating {
  animation: fade-scale-in var(--transition-med);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/popup/popup.css
git commit -m "style: add premium popup styling with gradients and transitions"
```

---

### Task 7: Popup wiring

**Files:**
- Create: `src/popup/popup.js`

- [ ] **Step 1: Implement `src/popup/popup.js`**

```js
import { generatePassword } from '../lib/passwordGenerator.js';
import { copyToClipboard } from '../lib/clipboard.js';
import { showToast } from '../components/toast.js';

const passwordOutput = document.getElementById('password-output');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const app = document.querySelector('.app');

function renderPassword() {
  passwordOutput.value = generatePassword();
  passwordOutput.classList.remove('is-updating');
  // Force reflow so the fade-in animation replays on consecutive clicks.
  void passwordOutput.offsetWidth;
  passwordOutput.classList.add('is-updating');
}

async function handleCopy() {
  if (!passwordOutput.value) return;

  const succeeded = await copyToClipboard(passwordOutput.value);
  showToast(
    app,
    succeeded ? 'Copied to clipboard' : 'Copy failed — please try again',
    succeeded ? 'success' : 'error'
  );
}

generateBtn.addEventListener('click', renderPassword);
copyBtn.addEventListener('click', handleCopy);

renderPassword();
```

- [ ] **Step 2: Check the file for syntax errors**

Run: `node --check src/popup/popup.js`
Expected: no output (exit code 0)

- [ ] **Step 3: Commit**

```bash
git add src/popup/popup.js
git commit -m "feat: wire popup UI to generator, clipboard, and toast modules"
```

---

### Task 8: README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

```markdown
# CipherKey — Password Generator (Chrome Extension)

A premium, fully offline Chrome extension that generates strong, secure passwords
with a single click.

## Features (Phase 1.1)

- Crypto-secure 16-character password generation (`crypto.getRandomValues`)
- One-click copy to clipboard with toast confirmation
- Premium, responsive popup UI — no external services, no network calls

## Installation (load unpacked)

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select this project's root folder.
5. The CipherKey icon appears in your toolbar (click the puzzle-piece icon and pin
   it if it's not visible).

## Usage

1. Click the CipherKey toolbar icon to open the popup.
2. A password is generated automatically when the popup opens.
3. Click **Generate Password** for a new one.
4. Click **Copy** to copy it to your clipboard — a toast confirms success.

## Project structure

```
Password Generator - Chrome Extension/
├── manifest.json               # Manifest V3 config
├── package.json                # test script only, no runtime dependencies
├── src/
│   ├── popup/
│   │   ├── popup.html          # popup markup
│   │   ├── popup.css           # popup styling
│   │   └── popup.js            # wires UI to lib/component modules
│   ├── lib/
│   │   ├── passwordGenerator.js  # pure, crypto-secure password generation
│   │   └── clipboard.js          # copy-to-clipboard helper
│   └── components/
│       └── toast.js              # reusable toast notification
├── test/
│   └── passwordGenerator.test.js # unit tests (node:test)
└── icons/                        # reserved for future icon assets
```

## Running tests

The password generator is covered by unit tests using Node's built-in test runner
(no dependencies to install):

```bash
npm test
```

## Roadmap

Future phases may add password strength indicators, customizable generation
options, history, and other features. Phase 1.1 intentionally ships only the
foundation described above.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with install, usage, and project structure"
```

---

### Task 9: Manual verification in Chrome

**Files:** none (verification only)

- [ ] **Step 1: Run the full unit test suite one more time**

Run: `npm test`
Expected: PASS — all tests green

- [ ] **Step 2: Syntax-check every JS file**

Run: `node --check src/lib/passwordGenerator.js && node --check src/lib/clipboard.js && node --check src/components/toast.js && node --check src/popup/popup.js`
Expected: no output, exit code 0

- [ ] **Step 3: Load the extension unpacked in Chrome**

1. Open `chrome://extensions`.
2. Enable Developer mode.
3. Click **Load unpacked** and select the project root.
4. Confirm the extension loads with no errors shown on the extensions page.

- [ ] **Step 4: Exercise the popup**

1. Click the CipherKey toolbar icon.
2. Confirm the popup is ~390px wide, dark background (`#010207`), header shows the
   logo mark, "CipherKey" heading, and subtitle.
3. Confirm a 16-character password is already populated when the popup opens.
4. Click **Generate Password** several times — confirm the password changes each
   time with a visible fade-in transition.
5. Click **Copy** — confirm the toast appears ("Copied to clipboard") and paste
   somewhere (e.g. the omnibox) to confirm the clipboard contains the password.
6. Open DevTools on the popup (right-click inside popup → Inspect) and confirm the
   Console tab shows zero errors or warnings.

- [ ] **Step 5: Fix any issues found, then commit**

If Step 4 reveals any bug, fix it in the relevant file and commit:

```bash
git add -A
git commit -m "fix: address issue found during manual popup verification"
```

If no issues are found, no commit is needed for this task.
