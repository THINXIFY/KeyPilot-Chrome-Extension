# KeyPilot — Password Security Toolkit (Chrome Extension)

A premium, fully offline Chrome extension for generating strong passwords,
checking and comparing password strength, and handling everyday
password-security tasks — bulk generation, usernames, favorites, and
configurable defaults — without ever sending your data anywhere.

## Features

**Generator**
- Crypto-secure password generation (`crypto.getRandomValues`, never
  `Math.random`)
- Length slider and manual numeric input (8–64 characters)
- Independent toggles for uppercase, lowercase, numbers, and symbols
- Advanced options (filters): avoid similar-looking characters (`O`,
  `0`, `I`, `l`, `1`), avoid repeated characters (`aaa`, `111`), avoid
  sequential runs (`abc`, `123`), and exclude specific characters —
  all enforced at generation time, not just flagged afterward
- Live strength meter (Weak / Fair / Strong / Excellent) with character
  count
- **Security presets** (Password Policy Templates) — Banking, Email,
  Social, Work, Gaming, Developer — apply a recommended length,
  character mix, and filter combination in one click. The stricter
  policies (Banking, Work, Developer) also turn on avoid-repeated and
  avoid-sequential; Email avoids sequences only; Social and Gaming stay
  relaxed
- One-click **Copy** with toast + button confirmation, and a **☆
  Favorite** button to save the current password (see Favorites below)
- Keyboard shortcuts while the Generator screen is focused and you're
  not typing in a field: **G** generate, **C** copy, **F** toggle
  favorite
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
  label, length, **Copy** (with confirmation), **Regenerate**, and a
  **☆ Favorite** button
- **Copy All** / **Refresh All** for the whole suggestion set
- Your last-used mode is remembered — the name/word/theme input itself
  never is

**Tools**
- A pill-style **Mode** chip selector (Bulk Passwords, Username
  Generator, Favorites, Recent Passwords) with hover, press, and
  selection animations
- **Bulk Passwords** — generate 10, 25, 50, or 100 passwords at once
  using your current Generator settings, shown as a compact scrollable
  list with per-password **Copy** plus **Copy All** / **Refresh All**
- **Username Generator** — 5 suggestions per generate in 4 styles
  (Professional, Minimal, Gaming, Developer), each with its own
  **Copy** and **Regenerate**
- **Custom Username mode** — type any name, nickname, or word into the
  optional field and get 6 unique suggestions built from it instead of
  a random word, in the same 4 styles. Professional/Minimal keep your
  word intact with digits (and Gaming/Developer blend it with a
  creative flavor word as a prefix or suffix) — never a raw,
  predictable copy of what you typed. Leave the field blank to fall
  back to fully random suggestions. **Copy**, **Regenerate**, and
  **Copy All** all work the same as the random modes; the word you
  type is never saved
- **Favorites** — every password you've starred, newest first, with a
  **Password Health Score** badge (Weak/Fair/Strong/Excellent), **Copy**,
  **Generate Similar** (a fresh password with the same length and
  character mix, not a predictable tweak of the original), and
  **Remove**
- **Recent Passwords** — your last 20 copied passwords, tracked
  automatically, with the same health badge, **Copy**, **Generate
  Similar**, and a **☆ Save** button to promote one to Favorites
- **Improve** — an extra button that appears only on entries scored
  Weak or Fair, generating a genuinely stronger replacement in place
  (not just a same-profile variation like Similar); Strong/Excellent
  entries stay uncluttered
- Favorites and Recent both offer **Export TXT** / **Export CSV** (one
  password per line/row) and a one-click **Clear**

**Checker**
- **Check Password** mode: type or paste any password to instantly see
  its **Strength**, **character count**, **Security Score** (0–100,
  penalized for common/repeated/sequential patterns — not just raw
  entropy), and **Estimated Crack Time** (assuming a
  10-billion-guess-per-second offline attack)
- **Weaknesses** and matching **Improvement Tips** lists flag short
  length, missing character types, commonly used passwords, repeated
  characters (`aaa`), and sequential runs (`abc`, `123`) — with a
  positive message when none apply
- **Show/Hide** toggle on the password field
- **Generate Stronger Password** — a ready-to-use 20-character
  replacement, with the same Copy/Regenerate card used everywhere else
- **Compare Passwords** mode: two password fields, each analyzed
  independently and live as you type, with a clear "Password A/B is
  stronger" (or tie) callout once both have input

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
  There is no account, no login, and no cloud sync of any kind.
- **Typed input is never saved, tracked, or transmitted**: the
  password you check or compare on the Checker screen, any name/word
  you type into Smart Password, and any custom name/word you type into
  the Tools Username Generator, exist only in memory for as long as
  the popup is open and are gone the moment you close it.
- **Favorites and Recent Passwords are the one deliberate exception**:
  when you tap **☆ Favorite** on a password, or copy any single
  password anywhere in the app, that password's plaintext value *is*
  written to `chrome.storage.local` on your device so it can show up
  in the Favorites/Recent lists on the Tools screen. This is local to
  your machine only — it is never transmitted anywhere — but it is a
  real change from "nothing is ever saved," so it's called out
  explicitly here rather than left implicit:
  - **Recent** tracks up to your last 20 copied passwords automatically.
    Multi-password actions (**Copy All**, bulk exports) do not add to
    Recent — only single-password copies do.
  - **Favorites** are kept until you remove them individually or tap
    **Clear**.
  - Both have a one-click **Clear**, and neither respects the
    **Remember my preferences** toggle below — favoriting or copying a
    password is an explicit action, so it's always honored regardless
    of that preferences setting. If you'd rather nothing be kept at
    all, simply don't use ☆ Favorite, and periodically clear Recent.
- Everything else — your length/character-type settings, your
  last-used Smart mode, and the remember-preferences flag itself — is
  non-sensitive UI preference data, written to `chrome.storage.local`
  only while **Remember my preferences** (Settings) is on. Turn it off
  and even those are cleared; **Reset All Settings** clears them too
  (it does not touch Favorites/Recent, which have their own Clear
  buttons so resetting your preferences can't accidentally delete
  passwords you deliberately saved).
- All randomness comes from the Web Crypto API
  (`crypto.getRandomValues`), never `Math.random`.
- The only permission requested is `storage`, used exclusively for the
  data described above — all of it stays on your device.

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
   options. Open **Advanced options** to avoid similar-looking,
   repeated, or sequential characters, or to exclude specific
   characters. Click **Generate** for a new one, **Copy** to copy it,
   or **☆** to save it to Favorites.
   With the popup focused and no field selected, **G**/**C**/**F** do
   the same three things from the keyboard.
4. On **Smart**: choose a **Mode** (From Name, From Words, Memorable,
   Passphrase, Pronounceable, or Theme-Based), fill in any fields shown
   for that mode, and click **Generate Suggestions** to get 5 secure
   suggestions. Use **Copy**, **Regenerate**, or **☆** on any single
   suggestion, or **Copy All** / **Refresh All** for the whole set.
5. On **Tools**: pick a **Mode** chip — **Bulk Passwords** to generate
   10–100 passwords at once using your current Generator settings,
   **Username Generator** for 5 random suggestions (or type a name,
   nickname, or word into the optional field for 6 personalized ones)
   in a Professional, Minimal, Gaming, or Developer style, **Favorites**
   for everything you've starred, or **Recent Passwords** for your last
   20 copies. Favorites and Recent entries show a health score and an
   **Improve** button appears on anything Weak/Fair; both lists support
   **Export TXT/CSV** and **Clear**.
6. On **Checker**: switch between **Check Password** (strength,
   security score, estimated crack time, weaknesses and tips, plus
   **Generate Stronger Password**) and **Compare Passwords** (two
   inputs, analyzed side by side with a stronger-password callout).
   Use **Show/Hide** to reveal or mask what you typed.
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
│   │   ├── usernameGenerator.js    # Username generation (4 styles, random + custom word)
│   │   ├── passwordLibrary.js      # Favorites/Recent chrome.storage.local wrapper
│   │   ├── similarPassword.js      # Generate Similar (matches length + character profile)
│   │   ├── comparePasswords.js     # Compare Passwords analysis + winner
│   │   ├── exportPasswords.js      # TXT/CSV formatting + file download
│   │   ├── passwordPatterns.js     # shared repeated/sequential-run detection
│   │   ├── randomUtils.js          # shared crypto-random helpers (bias-free randomInt)
│   │   ├── charsets.js             # shared digit/symbol charsets
│   │   ├── wordLists.js            # shared common + per-theme word lists
│   │   └── clipboard.js            # copy-to-clipboard helper
│   └── components/
│       ├── toast.js              # reusable toast notification
│       ├── strengthMeter.js      # strength bar + label + count
│       ├── smartResults.js       # suggestion cards (copy + regenerate + favorite)
│       ├── usernameResults.js    # username cards (copy + regenerate, no strength/length)
│       ├── bulkResults.js        # compact scrollable bulk-password list
│       └── libraryResults.js     # Favorites/Recent list (copy + similar + favorite-or-remove)
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
    ├── usernameGenerator.test.js
    ├── passwordLibrary.test.js
    ├── similarPassword.test.js
    ├── comparePasswords.test.js
    ├── exportPasswords.test.js
    ├── passwordPatterns.test.js
    └── randomUtils.test.js
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
- **Phase 5.1 — Smart Productivity** — Favorites and Recent Passwords
  (Tools screen), Generate Similar (a fresh password matching an
  existing one's length and character mix), Compare Passwords (new
  Checker mode), TXT/CSV export for Favorites/Recent, and in-popup
  keyboard shortcuts (G/C/F on the Generator screen). This is the one
  phase that changes the privacy model described above — see Privacy &
  security for exactly what that means and how to opt out of it.
- **Phase 5.2 — Smart Security & Final Refinements**:
  - **Avoid repeated / avoid sequential** join avoid-similar and custom
    exclusions as generation-time filters (not just after-the-fact
    detection), and the 6 security presets now configure them per
    policy.
  - **Password Health Score** and a conditional **Improve** button on
    Favorites/Recent entries — Weak/Fair passwords get an upgrade path
    right where they're stored; Strong/Excellent ones stay uncluttered.
  - **Generation quality fix**: `randomInt()` used a plain `% max` on a
    crypto-random 32-bit value — textbook modulo bias, where some
    outputs become marginally more likely whenever `max` doesn't evenly
    divide 2³². Fixed with rejection sampling. `passwordGenerator.js`
    also turned out to still have its own pre-refactor duplicate
    `randomInt`/`shuffle` (with the same bias) instead of using the
    shared `randomUtils.js` — now consolidated onto the one fixed
    implementation.
  - **Header redesign**: the full `keypilot-logo.png` lockup (icon +
    wordmark) replaces the small icon crop and the separate "KeyPilot"
    heading/tagline text, with a visually-hidden `<h1>` preserving a
    real document heading for screen readers.
  - **Footer**: "Developed by THINXIFY.COM", linking to thinxify.com in
    a new tab.
  - Found and fixed via the screenshot audit: the Settings screen's
    Privacy and About cards still said passwords are "never saved
    either way" — stale since Phase 5.1 shipped Favorites/Recent;
    corrected to match the README.
- **Phase 5.3 — Tools Polish & Custom Usernames**:
  - The Tools screen's **Mode** selector moved from a native dropdown
    to a pill-style chip group, with hover/press/selection animations
    and a 2-column layout for clearer visual hierarchy.
  - **Custom Username mode**: an optional text field on the Username
    Generator lets you type a name, nickname, or word; suggestions are
    built from that word instead of a random pick, still in the same
    4 styles, still never saved. Leaving it blank keeps the original
    random behavior unchanged.
  - The header logo (`.app__logo`) was reduced from 190px to 130px max
    width for a less dominant, more balanced header.

## Roadmap

Future phases may add cloud sync, autofill, account login, and full
password-manager functionality (linking saved passwords to sites,
encrypted vaults, etc.). These remain intentionally out of scope for
now — Favorites/Recent are a lightweight local convenience, not a
password manager.
