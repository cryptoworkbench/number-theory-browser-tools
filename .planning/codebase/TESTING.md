---
last_mapped_commit: 5bb8919024dcaaee469701a9086df5dc814ba501
last_mapped_at: 2026-09-23
---
# Testing Patterns

**Analysis Date:** 2026-09-23

## Test Framework

**Status:** No automated test framework in use

**Reason:** Single-file HTML tools designed for manual browser testing. Each tool is a self-contained visualization with no build system, package manager, or CI/CD pipeline.

**Run Commands:**
There are no npm scripts, test runners, or CLI test commands. Verification is manual:

```bash

# Open any tool directly in a browser

open "Christmas Trees/factor-tree.html"
open "Pizza Slices/pizza-slices.html"
open "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
open "RSA Examplifier/rsa-examplifier.html"
open "Factorize By Completing The Square/factorize-completing-square.html"
```

## Test File Organization

**Location:** Not applicable — no test files exist

**Naming:** Not applicable

**Structure:** Not applicable

## Test Structure

Each tool includes **built-in manual testing controls and example presets** instead of automated tests:

**Factor Tree** (`Christmas Trees/factor-tree.html`):

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

**Pizza Slices / Congruence Wheel** (`Pizza Slices/pizza-slices.html`):

- Modulus N slider (1–60)
- Rings/depth slider (2–10)
- Click/keyboard selection on wedges (modular arithmetic visualization)
- Reference list showing residue class members
- Formula display updating based on selection

**RSA Examplifier** (`RSA Examplifier/rsa-examplifier.html`):

- Step-by-step form inputs for Bob's primes (p=61, q=53) and Alice's primes (p=17, q=23)
- Input validation with error boxes for: non-integer, primes <3, duplicate primes, primes >60 digits
- Primality testing via Miller–Rabin algorithm (builtin check)
- Button to trigger each step: "Generate Bob's Keypair", "Generate Alice's Keypair"
- Locked steps that unlock after dependencies met
- Eve's brute-force factoring button to demonstrate computational hardness

**Factorize by Completing the Square** (`Factorize By Completing The Square/factorize-completing-square.html`):

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

### Pizza Slices / Congruence Wheel

- [ ] Load page; wheel with N=10, depth=6 displays
- [ ] Drag N slider; wheel regenerates with correct number of wedges
- [ ] Drag depth slider; inner rings change
- [ ] Click wedge; highlights and updates caption
- [ ] Caption shows correct residue class: [r] = {r, r+N, r+2N, ...}
- [ ] Reference list updates selection state
- [ ] Day/night theme toggle works

### RSA Examplifier

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
