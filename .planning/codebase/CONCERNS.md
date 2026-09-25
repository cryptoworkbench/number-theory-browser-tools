---
last_mapped_commit: 5bb8919024dcaaee469701a9086df5dc814ba501
last_mapped_at: 2026-09-23
---
# Codebase Concerns

**Analysis Date:** 2026-09-23

## Architectural Deviation

**Breaking the single-file-per-tool pattern:**

- Issue: HTML files now import shared CSS and JS (`../assets/site.css`, `../assets/theme.js`), contradicting the self-contained single-file design stated in CLAUDE.md
- Files: `Factor Tree/factor-tree.html`, `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`, `Pizza Slices/pizza-slices.html`, `RSA Examplifier/rsa-examplifier.html`, `Factorize By Completing The Square/factorize-completing-square.html`
- Impact: Tools no longer work in isolation. Moving or copying a tool outside the repo structure breaks it. Development workflow requires managing three files per tool instead of one.
- Fix approach: Either (a) inline `site.css` and `theme.js` into each HTML file to restore true self-containment, or (b) update CLAUDE.md to document the new shared-assets pattern and commit to maintaining the three-file structure

## Code Duplication & Maintainability

**HTML header/nav boilerplate repeated in every file:**

- Issue: Each of 5 HTML tools contains 8–20 lines of identical site header markup (navigation, theme toggle, branding)
- Files: All tool HTML files (factor-tree.html, sieve-of-eratosthenes.html, pizza-slices.html, rsa-examplifier.html, factorize-completing-square.html)
- Impact: Site-wide navigation changes require editing 5 files. Easy to miss one and create inconsistency. Changes to nav links break silently if done incompletely.
- Fix approach: Use a templating step during development (e.g., a build script that injects header into each file), or accept the duplication and add a checklist documenting all files that need nav updates

## Relative Path Fragility

**Asset and navigation links assume fixed directory structure:**

- Issue: Links use relative paths like `../assets/site.css`, `../index.html`, `../Pizza Slices/pizza-slices.html`
- Files: All HTML files
- Impact: Moving tool directories or renaming them breaks all links. Restructuring the repo (e.g., adding a `tools/` subdirectory) requires mass file updates. Testing locally with `file://` URLs and serving via HTTP may have different path resolution.
- Fix approach: Add `.htaccess` or server config to ensure consistent path handling; or use absolute paths relative to site root (e.g., `/assets/site.css` instead of `../assets/site.css`) if hosting at a known path; or document the exact directory structure as a hard constraint in CLAUDE.md

## File Size & Complexity

**Individual HTML files exceed 800 lines:**

- Issue: `factorize-completing-square.html` (863 lines), `sieve-of-eratosthenes.html` (815 lines) are large monolithic files with inline styles, scripts, and markup all mixed
- Files: `factorize-completing-square.html`, `sieve-of-eratosthenes.html`
- Impact: Harder to locate and fix bugs. Editing one part risks breaking another (no modular isolation). Code review becomes tedious. Browser dev tools can struggle with large inline scripts.
- Fix approach: No immediate fix (tools are self-contained by design), but document line-count expectations and enforce with a linter if files grow further

## Number Precision Limits

**Regular JavaScript Numbers lose precision above 2^53:**

- Issue: Most tools use `Number` for computation (`primeFactors`, `smallestPrimeFactor`, `isPrime` functions), which silently overflow for integers > 2^53 (≈9 quadrillion)
- Files: `Factor Tree/factor-tree.html` (lines 436–462), `Pizza Slices/pizza-slices.html`, `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`, `Factorize By Completing The Square/factorize-completing-square.html`
- Impact: Inputs in the range ~10¹⁵–10¹⁶ will produce incorrect factorizations silently. User will see wrong prime factors or hang loops. Only `RSA Examplifier/rsa-examplifier.html` uses BigInt and is safe.
- Current validation: Factor Tree caps input at 1 trillion (10¹²), Completing-the-Square caps at 10⁹. These limits are ad-hoc and not enforced uniformly.
- Fix approach: Add `Number.isSafeInteger()` checks to all number-theory functions and reject unsafe inputs with a user-facing error message; or migrate all computation functions to BigInt (large change but future-proof)

## localStorage Failures in Private Browsing

**Theme preference storage silently fails:**

- Issue: All files call `localStorage.getItem()` wrapped in try-catch. On privacy mode, this throws; catch block silently defaults to 'night' theme
- Files: All HTML files (inline script in `<head>`, line 5)
- Impact: Users in private/incognito mode always get the night theme, even if they previously set day mode in normal browsing. No feedback that the preference wasn't saved.
- Fix approach: Add a `localStorage.setItem` test on page load; if it fails, display a small banner: "Theme preference will not persist in private mode"

## Input Validation Gaps

**Missing protection against compute-intensive inputs:**

- Issue: While basic range checks exist (e.g., < 1 trillion for Factor Tree), no checks prevent inputs that cause long computation or browser freeze
- Files: Primarily `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` (grid size), `Factorize By Completing The Square/factorize-completing-square.html` (trial count with `MAX_ITER`)
- Impact: User can input 10⁹ for sieve size, freeze browser for minutes
- Current mitigations: Sieve has `MAX_N = 100000`, Completing-the-Square has `MAX_ITER = 50000`. But no UI constraint on inputs (max attribute exists but not enforced by all controls).
- Fix approach: Add HTML5 `max` attributes to all number inputs; add timeout/abort logic to long-running computations (e.g., "abort sieve search after 5 seconds"); display progress and a cancel button during heavy work

## SVG Accessibility

**Diagrams lack semantic labels for screen readers:**

- Issue: SVG elements (circles, lines, text) in rendered diagrams have no `<title>`, `<desc>`, or ARIA labels
- Files: `Factor Tree/factor-tree.html` (SVG render at line 588), `Pizza Slices/pizza-slices.html` (SVG sectors), `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` (grid cells)
- Impact: Visually impaired users cannot understand the visualizations. No text alternative exists.
- Fix approach: Add `<title>` elements inside each SVG or use `aria-label` on SVG root; generate structured text descriptions of the diagram state (e.g., "Prime factor tree for 60: root 60 splits into 2 and 30. 2 is prime, shown in gold.")

## Animation Interruption & Stale Callbacks

**Partial generation tracking can still cause issues:**

- Issue: Tools use a `generation` counter to skip stale animation callbacks when user restarts mid-animation. However, if an animation is interrupted and a new one starts, old callbacks may corrupt state if they run before being invalidated.
- Files: `Factor Tree/factor-tree.html` (line 433, 679-707), `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`
- Impact: Rare race condition where two animations overlap, potentially drawing elements twice or in wrong state
- Current safeguard: Checks `if(localGen !== generation) return` before each async operation
- Workaround is solid, but edge case remains if timing aligns poorly
- Fix approach: No immediate fix needed (safeguards work), but document this pattern when adding new animated tools

## Performance Concerns

**Large SVG rendering with staggered setTimeout:**

- Issue: Depth-by-depth animation reveals use `setTimeout` with per-depth delays (e.g., `depthGroups.forEach((g,d)=>{ setTimeout(..., d*perDelay); })`)
- Files: `Factor Tree/factor-tree.html` (lines 682–707)
- Impact: Deep trees (e.g., 2^20 has 20 levels) create 20 setTimeout calls. Browser event loop can stall. Smooth 60 fps animation may stutter. No user feedback during render.
- Fix approach: Use `requestAnimationFrame` instead of fixed setTimeout; show a progress indicator or skeleton during render; consider limiting tree depth or using a virtual scroll for very deep trees

## Error Handling Gaps

**Silent failures in SVG render:**

- Issue: SVG creation functions (`svgEl`) have no error handling. If `document.createElementNS` fails (e.g., due to browser quirks), the entire render silently fails with no visible error
- Files: `Factor Tree/factor-tree.html` (line 546), `Pizza Slices/pizza-slices.html`, `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`
- Impact: User sees blank stage and no error message. Difficult to debug.
- Fix approach: Wrap SVG operations in try-catch; on error, display a message like "SVG rendering failed. Try refreshing the page." in the stage element

## Security Observations

**innerHTML with computed values (not user-controlled):**

- Issue: Several files use `innerHTML` to inject HTML with template literals: `banner.innerHTML = `Found ${M.toLocaleString()}…``
- Files: `Factorize By Completing The Square/factorize-completing-square.html` (lines 736, 749, 761, 765, 837), `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` (line 662), `Pizza Slices/pizza-slices.html` (line 525), `RSA Examplifier/rsa-examplifier.html` (lines 470, 516, 586, 610, 628, 683)
- Current status: Safe. Values injected are numbers (M, k, a, b) or localized strings (`toLocaleString()`), never raw user input.
- Risk: If code is refactored to include user-supplied strings without sanitization, XSS becomes possible.
- Recommendation: Add a comment near `innerHTML` assignments: `/* Safe: value is numeric, not user input */` to alert future maintainers

## Scaling Limits

**Memory & computation for large inputs:**

- Sieve grid: Storing 100,000 Boolean values for the sieve grid uses ~100KB, acceptable. But `MAX_N = 100000` is arbitrary; no memory budget defined.
- Completing-the-Square: Trial loop runs up to 50,000 iterations; each stores `{ a, b, c }` in `trials[]`. At 50K trials, this is a large array. GC may hiccup.
- Factor Tree: Recursive factorization has no depth limit. Input like 2^30 creates a tree with 30 levels, each with up to 2^(30-depth) nodes. Rendering 2^30 node circles will OOM.
- Fix approach: Add configurable `MAX_DEPTH` limits; bail out early if tree depth exceeds threshold; warn user instead of hanging

## Test Coverage Gaps

**No automated tests:**

- Issue: No `.test.js`, `*.spec.js`, or test framework configured (pytest, Jest, etc.)
- Impact: Changes to math functions (primeFactors, isPrime, etc.) cannot be regression-tested. Bugs in core number-theory logic discovered only by manual testing.
- Fix approach: Consider adding a simple Node.js test harness for extracted math functions (create `lib/number-theory.js` with pure functions, add `test/number-theory.test.js`). Keep the HTML tools' rendering/UI logic untested (hard to automate), but math functions should have coverage.

## Browser Compatibility

**No fallbacks for missing features:**

- localStorage may be disabled
- BigInt is ES2020; no fallback for older browsers
- `color-mix()` CSS function (RSA tool) is new CSS spec, not all browsers support it
- Files: All files
- Impact: Tools may partially or fully break on older browsers without clear error messages
- Fix approach: Add a compatibility check on page load; display a banner if browser is unsupported; test on IE11/Edge Legacy if supporting those is a goal (likely not, given the tech stack)

## Documentation & Maintenance

**No in-code documentation of number-theory algorithms:**

- Issue: Functions like `primeFactors`, `modPowPlain`, `gcd` lack comments explaining the algorithm or complexity
- Files: All tool files
- Impact: Contributors cannot quickly understand the math. Bug fixes risk introducing algorithmic errors.
- Fix approach: Add JSDoc comments to all number-theory functions, including time complexity (e.g., `/* O(sqrt(n)) trial division */`)

---

*Concerns audit: 2026-09-23*
