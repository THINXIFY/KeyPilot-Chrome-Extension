# Phase 1.2 — Core Password Generator Design

## Goal

Turn the Phase 1.1 basic generator into a complete, configurable password
creation tool: length control, character-type toggles, exclusion options,
a live strength meter, and persisted settings — while keeping the popup
premium, uncluttered, and fully offline.

## Scope boundaries

In scope: everything listed under "Add These Features" in the Phase 1.2
request (length slider + manual input + validation, 4 character-type
toggles, avoid-similar-characters, custom excluded characters, secure
generation, regenerate, live strength meter with Weak/Fair/Strong/Excellent
labels, character count, settings persistence + restore, empty-selection
warning, invalid/empty generation prevention, improved copy feedback).

Out of scope (explicitly deferred): password history, name-based
passwords, passphrases, a password strength *checker* for pasted-in
passwords, username generator, themes, or any other later-phase feature.

## Approach

Continue the Phase 1.1 architecture: plain HTML/CSS/JS, Manifest V3, no
build tooling. Extend the existing pure `passwordGenerator.js` to accept
an options object instead of just a length, and add two new pure modules
(`passwordStrength.js`, `settingsStorage.js`). `chrome.storage.local`
persists settings, requiring a new `"storage"` permission in
`manifest.json` — a low-sensitivity permission that does not trigger a
Chrome Web Store install warning.

## File structure

```
src/
├── lib/
│   ├── passwordGenerator.js   # MODIFIED — options object instead of length
│   ├── passwordStrength.js    # NEW — entropy estimate + label
│   ├── settingsStorage.js     # NEW — chrome.storage.local wrapper w/ defaults
│   └── clipboard.js           # unchanged
├── components/
│   ├── toast.js               # unchanged
│   └── strengthMeter.js       # NEW — updates bar fill/color + label + count
└── popup/
    ├── popup.html             # MODIFIED — new controls
    ├── popup.css               # MODIFIED — new styles (slider, toggles, meter, disclosure)
    └── popup.js                 # MODIFIED — expanded orchestration
manifest.json                   # MODIFIED — add "storage" permission
test/
├── passwordGenerator.test.js   # MODIFIED — option-combination coverage
└── passwordStrength.test.js    # NEW
```

## Settings model

```js
{
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeSimilar: false,
  excludeChars: ''
}
```

These are the defaults used when no saved settings exist, matching Phase
1.1's original behavior (16 chars, all four types on).

## Popup layout (top to bottom)

1. Header (unchanged)
2. Password card (unchanged; stays the visually dominant element)
3. Strength meter: thin colored bar + label ("Strength: Strong") +
   character count
4. Length control: numeric input + slider, two-way synced, clamped to
   8–64 inclusive
5. Character types: compact 2×2 grid of toggle switches (Uppercase,
   Lowercase, Numbers, Symbols)
6. Warning banner (hidden unless the current options produce zero usable
   characters) — disables Generate + Copy while shown
7. Generate + Copy buttons (unchanged position/behavior)
8. Collapsible "Advanced options" disclosure, closed by default:
   "Avoid similar characters (O, 0, I, l, 1)" toggle + custom excluded
   characters text input
9. Toast (unchanged)

## Data flow

- **On popup open**: load settings from `chrome.storage.local` (falling
  back to defaults if none saved or `chrome.storage` is unavailable),
  apply them to every control, generate the first password from those
  settings, and render the strength meter + character count.
- **On any control change** (slider, number input, any toggle, exclude
  field): update in-memory settings, immediately regenerate the password,
  refresh the strength meter, and persist the settings via a debounced
  (~300ms) write to `chrome.storage.local`. The debounce protects storage
  from being hammered during a slider drag; the on-screen password and
  meter still update on every input event, with no debounce.
- **Validation**: before every generation, compute the effective
  character pool = (union of enabled type charsets) minus (similar
  characters, if that toggle is on) minus (custom excluded characters).
  If this pool is empty, no generation is attempted: the warning banner
  is shown, Generate and Copy are disabled, and the password field shows
  a muted placeholder instead of a stale/previous password.
- **Generation** (when the pool is non-empty): guarantee one character
  from each *non-empty* enabled type's post-exclusion subset, fill the
  remainder from the full effective pool, then Fisher-Yates shuffle —
  same technique as Phase 1.1, now parameterized by the effective pool
  instead of fixed constants.
- **Copy**: unchanged from Phase 1.1 (toast + checkmark button
  micro-animation), but now guarded by the same disabled state as
  Generate when the pool is empty.

## Strength meter

Estimate entropy in bits as `length × log2(effective pool size)`, then
bucket into:

| Bits      | Label     |
|-----------|-----------|
| < 40      | Weak      |
| 40 – 59   | Fair      |
| 60 – 79   | Strong    |
| ≥ 80      | Excellent |

This is a UX heuristic to guide the user's choices, not a formal security
claim. Bar color maps to label: Weak → error red, Fair → a new amber
token, Strong → primary blue, Excellent → success green.

## Testing

Same split as Phase 1.1. Pure logic modules
(`passwordGenerator.js`, `passwordStrength.js`) get real `node:test`
coverage: each character-type toggle in isolation, all-types-off
(expect a clear "no characters available" error/signal rather than a
thrown generic error), length boundary values (8, 64) and out-of-range
inputs, avoid-similar removing exactly `O 0 I l 1`, custom-exclude
removing arbitrary characters, and the edge case where exclusions empty
an otherwise-enabled type's subset or the entire pool. `passwordStrength`
tests cover representative inputs landing in each of the four buckets.

DOM- and `chrome.storage`-dependent code (`settingsStorage.js`,
`strengthMeter.js`, the expanded `popup.js`) is manually verified, the
same way Phase 1.1 was: serving the popup over a local HTTP server and
driving real Chrome via Playwright for everything that doesn't require a
true extension context. `settingsStorage.js` feature-detects
`chrome?.storage?.local` and falls back to in-memory-only defaults when
unavailable (e.g. under the local-server test harness), so the rest of
the UI remains testable that way. Actual cross-session persistence
(closing and reopening the real popup) requires a real loaded extension
and will be confirmed by the user manually, the same way Phase 1.1's
final "Load unpacked" check was handled.

## Out of scope reminder

No password history, name-based passwords, passphrases, a checker for
pasted-in passwords, username generator, or themes — these remain
deferred to later phases.
