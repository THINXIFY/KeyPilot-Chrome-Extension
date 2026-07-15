# KeyPilot — Password Security Toolkit (Chrome Extension)

A premium, fully offline Chrome extension for generating strong passwords,
checking password strength, and handling everyday password-security tasks
— bulk generation, usernames, and configurable defaults — without ever
sending your data anywhere.

## Features

**Generator**
- Crypto-secure password generation (`crypto.getRandomValues`, never
  `Math.random`)
- Length slider and manual numeric input (8–64 characters)
- Independent toggles for uppercase, lowercase, numbers, and symbols
- Advanced options: avoid similar-looking characters (`O`, `0`, `I`,
  `l`, `1`) and exclude specific characters
- Live strength meter (Weak / Fair / Strong / Excellent) with character
  count
- **Security presets** — Banking, Email, Social, Work, Gaming,
  Developer — apply a recommended configuration in one click
- One-click **Copy** with toast + button confirmation
- A clear warning (announced to screen readers) when the current
  options leave no usable characters, with Generate/Copy disabled
  until you fix it

**Smart Password**
- One **Mode** selector covering 6 generation styles:
  - **From Name** — first name, full name, nickname, or initials,
    securely blended with a random word, digits, and symbols; never
    returns the raw name or a predictable pattern like `Name123`
  - **From Words** — up to 3 custom words combined with digits,
    symbols, and varied capitalization
  - **Memorable** — 2 readable dictionary words + digits + a symbol
  - **Passphrase** — 3–8 words with a chosen separator (`-`, `_`, `.`,
    or space) and optional numbers/symbols
  - **Pronounceable** — consonant-vowel syllables mixed with digits
    and a symbol for something easy to read but still secure
  - **Theme-Based** — Nature, Space, Ocean, Cyber, or Fantasy word
    lists
- Every mode produces 5 unique suggestions, each with its own strength
  label, length, **Copy** (with confirmation), and **Regenerate**
- **Copy All** / **Refresh All** for the whole suggestion set
- Your last-used mode is remembered — the name/word/theme input itself
  never is

**Tools**
- **Bulk Passwords** — generate 10, 25, 50, or 100 passwords at once
  using your current Generator settings, shown as a compact scrollable
  list with per-password **Copy** plus **Copy All** / **Refresh All**
- **Username Generator** — 5 suggestions per generate in 4 styles
  (Professional, Minimal, Gaming, Developer), each with its own
  **Copy** and **Regenerate**

**Checker**
- Type or paste any password to instantly see its **Strength**,
  **character count**, **Security Score** (0–100, penalized for
  common/repeated/sequential patterns — not just raw entropy), and
  **Estimated Crack Time** (assuming a 10-billion-guess-per-second
  offline attack)
- **Weaknesses** and matching **Improvement Tips** lists flag short
  length, missing character types, commonly used passwords, repeated
  characters (`aaa`), and sequential runs (`abc`, `123`) — with a
  positive message when none apply
- **Show/Hide** toggle on the password field
- **Generate Stronger Password** — a ready-to-use 20-character
  replacement, with the same Copy/Regenerate card used everywhere else

**Settings**
- **Default length** and **default Smart mode**, directly bound to the
  same settings used on the Generator and Smart screens — change it
  from either place and both stay in sync
- **Remember my preferences** toggle — off both stops future saving
  and clears anything already saved
- **Reset All Settings** — restores every default in one click
- **About** card with the installed version (read live from the
  extension manifest) and a plain-language privacy statement

## Privacy & security

- Everything runs **entirely locally** — there are no network calls,
  no analytics, and no external services anywhere in the extension.
- **Passwords and personal input are never saved, tracked, or
  transmitted** — not the password you're checking, not a name or
  word you type into Smart Password, regardless of the preferences
  setting below. They exist only in memory for as long as the popup
  is open.
- The only things ever written to `chrome.storage.local` are
  non-sensitive UI preferences: your length/character-type settings,
  your last-used Smart mode, and the remember-preferences flag itself
  — and only while **Remember my preferences** (Settings) is on. Turn
  it off and even those are cleared.
- All randomness comes from the Web Crypto API
  (`crypto.getRandomValues`), never `Math.random`.
- The only permission requested is `storage`, used exclusively for the
  preferences above.

## Installation (load unpacked)

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked**.
4. Select this project's root folder.
5. The KeyPilot icon appears in your toolbar (click the puzzle-piece
   icon and pin it if it's not visible).

## Usage

1. Click the KeyPilot toolbar icon to open the popup.
2. Use the top navigation to switch between **Generator**, **Smart**,
   **Tools**, **Checker**, and **Settings**.
3. On **Generator**: a password is generated automatically using your
   last-used settings. Pick a **preset** (Banking, Email, Social, Work,
   Gaming, Developer) to instantly apply a recommended configuration,
   or adjust the length (slider or number field) and character types
   yourself — the password regenerates automatically as you change
   options. Open **Advanced options** to avoid similar-looking
   characters or exclude specific characters. Click **Generate
   Password** for a new one, or **Copy** to copy it to your clipboard.
4. On **Smart**: choose a **Mode** (From Name, From Words, Memorable,
   Passphrase, Pronounceable, or Theme-Based), fill in any fields shown
   for that mode, and click **Generate Suggestions** to get 5 secure
   suggestions. Use **Copy** or **Regenerate** on any single suggestion,
   or **Copy All** / **Refresh All** for the whole set.
5. On **Tools**: choose **Bulk Passwords** to generate 10–100 passwords
   at once using your current Generator settings, or **Username
   Generator** to get 5 suggestions in a Professional, Minimal, Gaming,
   or Developer style.
6. On **Checker**: type or paste a password to see its strength,
   security score, estimated crack time, and a list of weaknesses with
   tips to fix them. Use **Show/Hide** to reveal or mask what you
   typed, and click **Generate Stronger Password** for a ready-to-use
   alternative.
7. On **Settings**: set your default length and default Smart mode,
   toggle whether KeyPilot remembers your preferences on this device,
   reset everything to defaults, or check the About card for the
   installed version and privacy statement.

## Project structure

```
Password Generator - Chrome Extension/
├── manifest.json               # Manifest V3 config (icons, storage permission)
├── package.json                # test script only, no runtime dependencies
├── keypilot-logo.png            # source logo (icon mark + wordmark)
├── icon16.png, icon48.png, icon128.png   # toolbar/store icons, generated from the logo
├── src/
│   ├── popup/
│   │   ├── popup.html          # popup markup
│   │   ├── popup.css           # popup styling
│   │   └── popup.js            # wires UI to lib/component modules
│   ├── lib/
│   │   ├── passwordGenerator.js    # pure, crypto-secure, configurable generation
│   │   ├── passwordStrength.js     # pure strength estimation
│   │   ├── passwordChecker.js      # password analysis + stronger-password generation
│   │   ├── presets.js              # 6 security presets (Banking, Email, Social, ...)
│   │   ├── settingsStorage.js      # chrome.storage.local wrapper (settings, smart mode, remember flag)
│   │   ├── smartPassword.js        # From Name / From Words suggestion generation
│   │   ├── memorablePassword.js    # Memorable mode
│   │   ├── passphrase.js           # Passphrase mode
│   │   ├── pronounceablePassword.js # Pronounceable mode
│   │   ├── themePassword.js        # Theme-Based mode
│   │   ├── bulkGenerator.js        # Bulk password generation (10/25/50/100)
│   │   ├── usernameGenerator.js    # Username generation (4 styles)
│   │   ├── randomUtils.js          # shared crypto-random helpers
│   │   ├── charsets.js             # shared digit/symbol charsets
│   │   ├── wordLists.js            # shared common + per-theme word lists
│   │   └── clipboard.js            # copy-to-clipboard helper
│   └── components/
│       ├── toast.js              # reusable toast notification
│       ├── strengthMeter.js      # strength bar + label + count
│       ├── smartResults.js       # suggestion cards (copy + regenerate)
│       ├── usernameResults.js    # username cards (copy + regenerate, no strength/length)
│       └── bulkResults.js        # compact scrollable bulk-password list
└── test/
    ├── passwordGenerator.test.js
    ├── passwordStrength.test.js
    ├── passwordChecker.test.js
    ├── presets.test.js
    ├── settingsStorage.test.js
    ├── smartPassword.test.js
    ├── memorablePassword.test.js
    ├── passphrase.test.js
    ├── pronounceablePassword.test.js
    ├── themePassword.test.js
    ├── bulkGenerator.test.js
    └── usernameGenerator.test.js
```

## Running tests

Pure logic (generation, strength estimation, the storage fallback path)
is covered by unit tests using Node's built-in test runner (no
dependencies to install):

```bash
npm test
```

## Development history

KeyPilot was built in phases; each added a self-contained slice of
functionality without breaking what came before.

- **Phase 1.1/1.2** — core generator: crypto-secure generation, length,
  character types, strength meter, settings persistence.
- **Phase 2.1/2.2** — Smart Password: From Name, From Words, then
  Memorable, Passphrase, Pronounceable, and Theme-Based modes, plus the
  top-level Generator/Smart/Checker/Settings navigation.
- **Phase 3** — Checker (strength, score, crack time, weaknesses/tips,
  Generate Stronger Password), security presets, and a full visual
  redesign of the Generator screen and preset dropdown.
- **Phase 4.1** — Tools (bulk passwords, username generator) and a
  fully built-out Settings screen (defaults, remember-preferences,
  reset, about).
- **Phase 4.2** — final polish pass: real KeyPilot branding and
  correctly-sized toolbar icons (the previous icon16/48/128.png were
  all actually 357×304px placeholders), an accessibility audit (missing
  keyboard focus outlines on every button and the length slider,
  missing `role="alert"` on warning banners), removal of leftover dead
  CSS, and a full regression pass across every feature from every
  phase.

## Roadmap

Future phases may add password history, cloud sync, autofill, account
login, and full password-manager functionality. These remain
intentionally out of scope for now.
