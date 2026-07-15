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
