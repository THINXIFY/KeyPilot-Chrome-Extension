# Phase 1.1 — Password Generator Extension Foundation

## Goal

Establish the Chrome Extension (Manifest V3) project foundation and a premium, modern
popup UI for a password generator. Scope is strictly limited to: project scaffolding,
popup UI, secure password generation with fixed defaults, and one-click copy. No
settings, history, strength meter, passphrases, or other future-phase features.

## Branding

- Name: **CipherKey**
- Subtitle: "Secure passwords, instantly."

## Color scheme

- Background: `#010207`
- Headings: `#FFFFFF`
- Body text: `#E6E8F0`
- Primary button gradient: `#0057FF → #0042C2`

## Approach

Plain HTML/CSS/JS, Manifest V3, no build tooling or framework. A single popup UI does
not need a bundler; avoiding one keeps the build-error surface at zero and keeps the
project trivially loadable as an unpacked extension. Future phases can introduce
tooling if the project's scope grows enough to justify it.

## Project structure

```
Password Generator - Chrome Extension/
├── manifest.json
├── src/
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js               # wires UI events, orchestrates modules
│   ├── lib/
│   │   ├── passwordGenerator.js   # pure fn: crypto-secure password generation
│   │   └── clipboard.js           # copy-to-clipboard helper
│   └── components/
│       └── toast.js               # reusable success/error toast component
├── icons/                         # reserved for future real icon assets
├── README.md
└── .gitignore
```

## UI / components

- **Header**: inline SVG monogram logo mark (no binary asset required) + "CipherKey"
  heading (`#FFFFFF`) + "Secure passwords, instantly." subtitle (`#E6E8F0`, muted).
- **Password card**: premium bordered/rounded card containing a large, read-only,
  monospace password output field. Card uses subtle border + shadow for depth against
  the `#010207` background.
- **Actions row**:
  - **Generate** — primary button, gradient `#0057FF → #0042C2`, hover/active states,
    subtle press animation.
  - **Copy** — secondary/outline button, hover state, brief checkmark micro-animation
    on success.
- **Toast**: small pill, fades/slides in on copy success (or error), auto-dismisses
  after ~2s.
- Styling driven by CSS custom properties (`--color-bg`, `--color-heading`,
  `--color-text`, `--gradient-primary`, spacing/radius tokens) so future phases can
  reuse/extend the design system without rewriting styles.
- Popup width: ~390px, responsive within Chrome's popup constraints.

## Data flow

1. Popup opens → `popup.js` calls the generator once on load so the field is never
   empty.
2. **Generate** click → `passwordGenerator.js` produces a 16-character password using
   `crypto.getRandomValues` (never `Math.random`), guaranteeing at least one
   uppercase letter, one lowercase letter, one digit, and one symbol. Output field
   updates with a subtle fade/scale transition.
3. **Copy** click → `clipboard.js` calls `navigator.clipboard.writeText()`. On
   success: checkmark micro-animation on the button + success toast. On failure:
   error-styled toast.

## Password generation defaults (fixed, no settings UI)

- Length: 16 characters
- Character classes: uppercase, lowercase, digits, symbols — all included, at least
  one of each guaranteed
- Source of randomness: `crypto.getRandomValues` (Web Crypto API), fully offline

## Error handling

- Clipboard write failure is caught and surfaces an error toast instead of failing
  silently.
- No network calls exist in this phase, so no network error handling is needed.

## Icons

Manifest V3 `icons` / `action.default_icon` fields are omitted for this phase. Chrome
will show its default placeholder in the toolbar, which is an accurate reflection of
"temporary logo placeholder" status. The header logo is inline SVG. Real icon assets
are deferred to a later phase.

## Testing / verification

No automated test framework is introduced for a static popup UI in this phase.
Verification is manual: load unpacked in `chrome://extensions`, confirm the popup
renders correctly at ~390px, confirm Generate and Copy both work, and confirm
DevTools console shows zero errors/warnings.

## Out of scope (explicitly deferred)

Password strength indicator, settings/customization UI, generation history, smart
generators, passphrase mode, password checker/breach lookup, real icon assets,
build tooling.
