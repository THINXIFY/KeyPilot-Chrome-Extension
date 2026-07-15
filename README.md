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

**Phase 2.1**
- **Smart Password** section with **From Name** and **From Words** tabs
- **From Name**: enter a first name, full name, nickname, or initials to
  get 5 unique, memorable password suggestions that securely blend the
  name with a random word, digits, and symbols — never the raw name or
  a predictable pattern like `Name123`
- **From Words**: enter up to 3 custom words to get 5 unique suggestions
  combining them with digits, symbols, and varied capitalization
- Each suggestion shows its own strength label, a **Copy** button with
  a confirmation state, and a **Regenerate** button to swap just that
  suggestion
- All processing is local — nothing is saved or transmitted, and none
  of the name/word input is written to `chrome.storage.local`

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
7. In the **Smart Password** section, pick **From Name** or **From
   Words**, fill in the field(s), and click **Generate Suggestions** to
   get 5 memorable, secure password suggestions. Use **Copy** on any
   suggestion, or **Regenerate** to get a new one in its place.

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
│   │   ├── smartPassword.js      # pure name/word-based suggestion generation
│   │   └── clipboard.js          # copy-to-clipboard helper
│   └── components/
│       ├── toast.js              # reusable toast notification
│       ├── strengthMeter.js      # strength bar + label + count
│       └── smartResults.js       # suggestion cards (copy + regenerate)
├── test/
│   ├── passwordGenerator.test.js
│   ├── passwordStrength.test.js
│   ├── settingsStorage.test.js
│   └── smartPassword.test.js
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
