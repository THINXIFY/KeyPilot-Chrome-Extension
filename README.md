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

**Phase 2.1 UI refinement**
- Top-level segmented navigation with **Generator**, **Smart**,
  **Checker**, and **Settings** tabs — only one screen is shown at a
  time, keeping the Generator screen focused on core generation
- The Smart Password tabs (From Name / From Words) now live entirely
  under their own **Smart** screen
- **Checker** and **Settings** are visible in the navigation as
  "coming soon" placeholders — no functionality is implemented yet;
  they're scaffolding for later phases

**Phase 2.2 — Advanced Password Modes**
- The **Smart** screen now has a single **Mode** selector covering 6
  modes: **From Name**, **From Words**, **Memorable**, **Passphrase**,
  **Pronounceable**, and **Theme-Based** — only the fields relevant to
  the selected mode are shown
- **Memorable**: 2 readable dictionary words + digits + a symbol,
  generated automatically
- **Passphrase**: 3–8 words (adjustable), joined with a chosen
  separator (`-`, `_`, `.`, or space), with optional numbers and
  symbols; each suggestion shows both its strength and its length
- **Pronounceable**: consonant-vowel syllables mixed with digits and a
  symbol for an easy-to-read but secure password
- **Theme-Based**: pick a theme (Nature, Space, Ocean, Cyber, Fantasy)
  to generate suggestions from that theme's word list
- Every mode produces 5 unique suggestions, each with its own strength
  label, length, **Copy** (with confirmation), and **Regenerate**
- **Copy All** copies every currently shown suggestion at once;
  **Refresh All** regenerates the full set
- The selected mode is remembered and restored the next time the
  popup opens — the name/word/theme input itself is never saved

## Installation (load unpacked)

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select this project's root folder.
5. The CipherKey icon appears in your toolbar (click the puzzle-piece icon and pin
   it if it's not visible).

## Usage

1. Click the CipherKey toolbar icon to open the popup.
2. Use the top navigation to switch between **Generator**, **Smart**,
   **Checker**, and **Settings**. Checker and Settings are placeholders
   for future phases.
3. On **Generator**: a password is generated automatically using your
   last-used settings. Adjust the length (slider or number field) or
   toggle character types — the password regenerates automatically as
   you change options. Open **Advanced options** to avoid similar-looking
   characters or exclude specific characters. Click **Generate Password**
   for a new one, or **Copy** to copy it to your clipboard. If every
   character type is turned off (or exclusions remove all available
   characters), a warning appears and Generate/Copy are disabled until
   you re-enable at least one character type.
4. On **Smart**: choose a **Mode** (From Name, From Words, Memorable,
   Passphrase, Pronounceable, or Theme-Based), fill in any fields shown
   for that mode, and click **Generate Suggestions** to get 5 secure
   suggestions. Use **Copy** or **Regenerate** on any single suggestion,
   or **Copy All** / **Refresh All** for the whole set. The mode you
   last used is remembered the next time you open the popup.

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
│   │   ├── passwordGenerator.js    # pure, crypto-secure, configurable generation
│   │   ├── passwordStrength.js     # pure strength estimation
│   │   ├── settingsStorage.js      # chrome.storage.local wrapper (settings + smart mode)
│   │   ├── smartPassword.js        # From Name / From Words suggestion generation
│   │   ├── memorablePassword.js    # Memorable mode
│   │   ├── passphrase.js           # Passphrase mode
│   │   ├── pronounceablePassword.js # Pronounceable mode
│   │   ├── themePassword.js        # Theme-Based mode
│   │   ├── randomUtils.js          # shared crypto-random helpers
│   │   ├── charsets.js             # shared digit/symbol charsets
│   │   ├── wordLists.js            # shared common + per-theme word lists
│   │   └── clipboard.js            # copy-to-clipboard helper
│   └── components/
│       ├── toast.js              # reusable toast notification
│       ├── strengthMeter.js      # strength bar + label + count
│       └── smartResults.js       # suggestion cards (copy + regenerate)
├── test/
│   ├── passwordGenerator.test.js
│   ├── passwordStrength.test.js
│   ├── settingsStorage.test.js
│   ├── smartPassword.test.js
│   ├── memorablePassword.test.js
│   ├── passphrase.test.js
│   ├── pronounceablePassword.test.js
│   └── themePassword.test.js
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

Future phases may add password history, a checker for pasted-in
passwords, a username generator, and cloud sync. These remain
intentionally out of scope for now.
