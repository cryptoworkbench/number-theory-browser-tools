---
last_mapped_commit: 5bb8919024dcaaee469701a9086df5dc814ba501
last_mapped_at: 2026-09-23
---
# Testing Patterns

**Analysis Date:** 2026-09-23

## Test Framework

**Status:** No automated test framework in use

**Reason:** HTML tool pages designed for manual browser testing. Each tool is an interactive visualization with no build system, package manager, or CI/CD pipeline; its shared helpers in `assets/nt-*.js` are exercised indirectly through every page that includes them.

**Run Commands:**
There are no npm scripts, test runners, or CLI test commands. Verification is manual:

```bash

# Open any tool directly in a browser

open "Factor Tree/factor-tree.html"
open "Congruence Wheel/congruence-wheel.html"
open "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
open "RSA/rsa.html"
open "Fermats Method/fermats-method.html"
```

## Test File Organization

**Location:** Not applicable — no test files exist

**Naming:** Not applicable

**Structure:** Not applicable

## Test Structure

Each tool includes **built-in manual testing controls and example presets** instead of automated tests:

**Factor Tree** (`Factor Tree/factor-tree.html`):

- Preset "chip" buttons with example numbers: 2, 97 (prime), 60, 1024, 9973 (prime), 2310
- Input validation with user-facing error messages
- Play/render on page load with example (60)
- Error messages for: empty input, non-integer, out-of-range (>1 trillion), special case (1)

**Sieve of Eratosthenes** (`Sieve Of Eratosthenes/sieve-of-eratosthenes.html`):

- Size input (min: 2, max: 20000) with validation
- Playback controls: Play, Step, Instant, Reset
- Speed slider (1–10) with speed labels (glacial → instant-ish)
- Live stats: Current pointer, Primes found, √N boundary, Elapsed time
- Visual state indicators: unvisited, current, prime, composite, one (1)
- Sound toggle button

**Congruence Wheel** (`Congruence Wheel/congruence-wheel.html`):

- Modulus N slider (1–60)
- Rings/depth slider (2–10)
- Click/keyboard selection on wedges (modular arithmetic visualization)
- Reference list showing residue class members
- Formula display updating based on selection

**RSA** (`RSA/rsa.html`):

- Step-by-step form inputs for Bob's primes (p=61, q=53) and Alice's primes (p=17, q=23)
- Input validation with error boxes for: non-integer, primes <3, duplicate primes, primes >60 digits
- Primality testing via Miller–Rabin algorithm (builtin check)
- Button to trigger each step: "Generate Bob's Keypair", "Generate Alice's Keypair"
- Locked steps that unlock after dependencies met
- Eve's brute-force factoring button to demonstrate computational hardness

**Fermat's Method** (`Fermats Method/fermats-method.html`):

- Coefficient inputs for quadratic (a·x² + b·x + c)
- Playback controls and step-through visualization
- Input constraints enforced by number inputs

## Validation Approach

Each tool validates user input at the boundary:

```javascript
// Factor Tree input validation
if(trimmed === ''){
  clearStage();
  setMessage('Please enter a number first.');
  return;
}

const n = Number(trimmed);

if(!Number.isFinite(n) || !Number.isInteger(n) || n < 1){
  clearStage();
  setMessage('Please enter a whole number, 1 or greater.');
  return;
}

if(n > 1000000000000){
  clearStage();
  setMessage('That number is too large for this little tree — try something under 1 trillion.');
  return;
}
```

## Math Function Testing

**Pure number-theory functions** (tested indirectly through tool output):

- `primeFactors(n)` — returns array of prime factors; tested via Factor Tree visualization and RSA key generation
- `isPrime(v)` — boolean primality test; tested via prime labeling and RSA prime validation
- `smallestPrimeFactor(v)` — single factor; tested via Factor Tree construction
- `bigGcd(a, b)` — GCD computation; tested via RSA extended Euclidean algorithm display
- `modPowPlain(base, exp, mod)` — modular exponentiation; tested via RSA encryption/decryption display
- `isPrimeBig(n, rounds)` — Miller–Rabin primality for BigInt; tested via RSA prime input validation

These functions are considered **correct if the visual output matches expected mathematical behavior**, rather than via unit tests.

## Manual Testing Checklist

### Factor Tree

- [ ] Load page; example tree (60) renders on load
- [ ] Enter 2 (prime); shows 2 = 2 × 1
- [ ] Enter 60; shows recursive binary tree down to primes
- [ ] Enter 1; shows special message "1 is neither prime nor composite"
- [ ] Enter 0 or negative; shows error "whole number, 1 or greater"
- [ ] Enter 1.5 or "abc"; shows validation error
- [ ] Enter 1000000000001 (>1 trillion); shows range error
- [ ] Click preset chips (97, 1024, 2310); each renders correct tree

### Sieve of Eratosthenes

- [ ] Load page; generates sieve of size 120 on load
- [ ] Change size input, press Generate; grid updates
- [ ] Press Play; pointer animates left-to-right, marks composites
- [ ] Press Pause mid-animation; resumes correctly
- [ ] Press Step; advances one pointer step at a time
- [ ] Press Instant; completes immediately
- [ ] Press Reset; clears and regenerates
- [ ] Speed slider changes animation speed (1=glacial, 10=instant-ish)
- [ ] Primes found count updates correctly
- [ ] √N boundary displayed correctly
- [ ] Sound toggle works (audio chime on each prime found)

### Congruence Wheel

- [ ] Load page; wheel with N=10, depth=6 displays
- [ ] Drag N slider; wheel regenerates with correct number of wedges
- [ ] Drag depth slider; inner rings change
- [ ] Click wedge; highlights and updates caption
- [ ] Caption shows correct residue class: [r] = {r, r+N, r+2N, ...}
- [ ] Reference list updates selection state
- [ ] Day/night theme toggle works

### RSA

- [ ] Bob step: enter primes p=61, q=53; button generates keypair
- [ ] Shows n, φ(n), e candidates, extended GCD table, d computation
- [ ] Shows Bob's public key (e, n) and private key (d, n)
- [ ] Alice step: enter primes p=17, q=23; generates keypair independently
- [ ] Wire step unlocks; shows public keys crossing wire with Eve eavesdropping
- [ ] Eve step unlocks; shows factoring problem and Eve's attempt buttons
- [ ] Eve factoring button: tries to factor n, succeeds or gives up
- [ ] Messages step unlocks; shows encryption/decryption flow
- [ ] Input validation: reject non-integers, non-primes, duplicate primes, too-large primes
- [ ] Day/night theme toggle works

## Error Testing

Errors are tested via **user-input boundary cases** exercised manually:

**Out of range:**

- Factor Tree: n > 1 trillion
- Sieve: size > 20000
- Congruence Wheel: N > 60, depth > 10
- RSA: primes > 60 digits

**Invalid type:**

- Non-integer input (decimal, negative, empty string)
- Non-prime input in RSA tool (rejected with validation error)
- Duplicate primes in RSA (rejected: "p and q must be different")

**Special cases:**

- Factor Tree: n = 1 (shows message "neither prime nor composite")
- Factor Tree: n is already prime (shows "only splits once")
- Sieve: N = 2 (smallest valid sieve)
- Congruence Wheel: N = 1 (single residue class)

## Coverage

**Requirements:** No formal coverage target

**Visible test surfaces:**

- User input validation (form boundaries)
- Mathematical output correctness (visual verification)
- Animation/playback state transitions
- Theme persistence (localStorage)
- Responsive layout (manual browser resize test)

## Test Types

**Manual Acceptance Tests:**
Each tool is tested by:

1. Opening in a modern browser (Chrome, Firefox, Safari)
2. Exercising all controls (sliders, buttons, text inputs)
3. Verifying visual output matches mathematical expectation
4. Checking error messages for invalid inputs
5. Toggling day/night theme
6. Resizing browser window to test responsive layout

**Indirect Correctness Tests (via tool output):**

- Factor Tree validates primality algorithm (all leaves are prime) and tree structure
- Sieve validates sieve algorithm (all marked composites are composite, all primes are prime)
- Congruence Wheel validates modular arithmetic (each class contains correct residues)
- RSA validates: key generation (φ(n) correct), extended GCD (d is true inverse), encryption (message recovers)

**Performance Tests (manual observation):**

- Factor Tree: responsive up to 1 trillion (practical limit for visual display)
- Sieve: smooth animation up to size 20000
- Congruence Wheel: smooth interaction with N=60
- RSA: key generation instant, brute-force factoring is deliberately slow to show computational hardness

## Multi-Language (i18n) Testing

**Dev-only gate scripts** (Node.js, same spirit as Phase 7's `harness.js`/`shadow-check.js`; not part of the shipped site):

- `.planning/phases/06-multi-language-support/i18n-check.js` — static gates over a page's markup and dictionary data, run per page or across all sixteen with `--all`:
  - `node i18n-check.js --coverage "<page>"` — dictionary key sets, placeholders, plural shapes, no identical-to-English values, the Cyrillic/Greek/Hebrew/Devanagari/Arabic script rules (`SCRIPT-*`, including the Hindi Devanagari rule and the Arabic script rule), Hebrew and Arabic bidi isolation (`BIDI-FORMULA`/`BIDI-CONTROL`/`BIDI-UNBALANCED`/`BIDI-RAW`) and character hygiene (`NATIVE-DIGIT`, `NATIVE-SEPARATOR`, `DIGIT-PARITY` for Hindi, Arabic, Albanian and Swahili, `TASHKEEL`, `TATWEEL`, `PRESENTATION-FORM`, `ARABIC-LETTER`, `NOT-NFC`, `ZERO-WIDTH`)
  - `node i18n-check.js --literals-markup "<page>"` / `--literals-js "<page>"` — untranslated static markup/JS-rendered text
  - `node i18n-check.js --header "<page>"` / `--switcher-present "<page>"` — canonical header and site-footer drift (`HEADER-DRIFT`, `FOOTER-DRIFT`, `FOOTER-COUNT`, `FOOTER-POSITION`), and that `#lang-switch-select` sits in the site footer and not in the header (`SWITCHER-IN-HEADER`, `SWITCHER-NOT-IN-FOOTER`)
  - `node i18n-check.js --includes "<page>"` — include order/missing/deferred-script checks for the six `nt-*.js` modules plus the `assets/i18n/*.js` data files
  - `node i18n-check.js --no-locale-number-format "<page>"` — no `toLocaleString`/`Intl.NumberFormat` anywhere numerals render
  - `node i18n-check.js --api` / `--persistence` / `--smoke` — unit (Node `vm`) and headless-Chrome checks of `NT.i18n`'s own API, persistence and end-to-end behavior
  - `node i18n-check.js --all` — every static mode over all sixteen pages; `--report` for a summary count
- `.planning/phases/06-multi-language-support/i18n-browser.js` — headless-Chrome runtime gates, one page at a time: `--mode en-parity` (English byte-identical to the pre-i18n baseline — the canonical site footer is stripped only when it holds nothing but the language switcher), `--mode langs` (no untranslated English text survives in nl/de/fr/es/it/pl/pt-BR/pt-PT/sv/nb/ro/hu/lv/ru/el/he/hi/ar/sq/sw), `--mode switch` (a mid-session language switch matches a direct load in that language at the same point), `--mode layout` (no overflow at 375px); run with no `--mode` flag for all four. `--mutant {untranslated,stale-switch,en-change,overflow,footer-extra}` injects a known defect and asserts the gate catches it (self-test of the gate itself).
- Every headless-Chrome checker run (both scripts) keeps its scratch under a self-cleaning `/tmp/nt-scratch-<pid>-*` root with Chrome's own `TMPDIR` inside it, removed on exit/`SIGINT`/`SIGTERM`/`SIGHUP` and swept by the next run after a `SIGKILL` — no manual cleanup needed between runs.

**Manual language checks** (no automated gate — requires human judgment):

- Switch every language (nl/de/fr/es/it/pl/pt-BR/pt-PT/sv/nb/ro/hu/lv/ru/el/he/hi/ar/sq/sw, plus en) on a sampled page via the footer switcher; confirm wording reads naturally and tool names match `06-GLOSSARY.md`
- Open two tabs on the same page, switch language in one, confirm the other tab follows via the `site-lang` `storage` event
- Open a page from disk in Firefox (`file://`), choose a non-English language, navigate away and reopen it — confirm the choice persists via the cookie channel (Firefox gives every `file://` document its own origin, so the headless-Chrome gates above can't exercise this)
- View the site footer and the header at about 375px width in both day and night themes with German active (the longest language) — confirm the footer's centered switcher and the header's nav and theme toggle neither overlap nor overflow

## Theme Testing

Day/night theme is tested via:

1. Click theme toggle icon (sun/moon)
2. Verify all CSS variables update (background, text color, accent colors)
3. Verify persistence: reload page, theme persists from localStorage
4. Verify site-wide consistency: shared `assets/site.css` applies same theme to header across all tools

## Browser Compatibility

Manual testing targets:

- Chrome/Edge (modern, latest)
- Firefox (modern, latest)
- Safari (modern, latest)

Baseline requirements:

- ES6 support (const, let, arrow functions)
- CSS Grid and Flexbox
- localStorage API
- SVG support
- BigInt support (RSA tool only)
- Native Number.isInteger, Number.isFinite

## Known Limitations

**Not tested:**

- Unit tests for individual math functions (rely on visual/output correctness)
- Integration tests across multiple tools
- Accessibility (ARIA attributes present but not formally tested)
- Performance profiling (informal observation only)
- Concurrent user interactions (single-user HTML, no multiplayer)
- Very large prime inputs in RSA (>60 digits rejected to keep page responsive)

---

*Testing analysis: 2026-09-23*
