---
last_mapped_commit: 5bb8919024dcaaee469701a9086df5dc814ba501
last_mapped_at: 2026-09-23
---
# Codebase Concerns

**Analysis Date:** 2026-09-23

## Architectural Deviation

**Shared-module coupling across consuming pages:**

- Issue: A tool's page no longer owns every line of its own logic — `assets/nt-core.js`, `assets/nt-bigint.js`, `assets/nt-svg.js`, `assets/nt-store.js` and `assets/nt-layout.js` are shared, so a change to one of these modules changes every page that imports it, all at once
- Files: Every tool `.html` page that includes one or more `assets/nt-*.js` modules
- Impact: A signature or behavior change in a shared helper ripples to every consuming tool simultaneously; a bug introduced there is a multi-tool regression, not confined to one page. The `../assets/nt-*.js` relative path is load-bearing — moving a tool directory without preserving that relative depth breaks its includes.
- Fix approach: Keep shared helpers pure; change a function's signature only together with every calling tool in the same commit; re-run each consuming tool in a browser (or `shadow-check.js --all`) after touching a shared module

## Multi-Language Support (i18n)

**Every new user-visible string needs sixteen translations:**

- Issue: A page ships in nl/en/de/fr/es/it/pl/pt-BR/pt-PT/sv/nb/ro/hu/lv/ru/el; adding a string to a page's `assets/i18n/<page-slug>.js` dictionary (or to the shared `site`/`common` namespaces in `assets/i18n/site.js`) without a value in all sixteen languages leaves a gap
- Files: Every `assets/i18n/*.js` data file
- Impact: A missing-language value either renders blank or falls back to English unexpectedly, and the page silently stops being fully translated
- Current mitigation: `.planning/phases/06-multi-language-support/i18n-check.js --coverage` catches a dictionary key missing from any supported language (`LANG-KEYSET`), a placeholder mismatch (`PLACEHOLDERS`), and a plural-shape mismatch (`PLURAL-SHAPE` — Polish and Russian plural values must carry `{one, few, many, other}`, Romanian `{one, few, other}`, Latvian `{zero, one, other}`, every other language `{one, other}`); for Russian and Greek, `--coverage` also reports a word outside the language's own script that is not on `SCRIPT_RULES`' notation allow-list (`SCRIPT-LATIN`/`SCRIPT-MIXED`/`SCRIPT-FOREIGN`/`SCRIPT-MISSING`) before the gap ships
- Fix approach: Run `i18n-check.js --coverage` (or `--all`) on the touched page after any dictionary edit; dictionary drift is caught by this gate, not by manual review alone

**Header edits must keep all sixteen copies identical:**

- Issue: Each tool page carries its own copy of the canonical i18n header (brand, 16 `site.nav.*` links, the `#lang-switch-select` language switcher), the same duplication pattern the site's nav/theme-toggle header already has
- Files: Every tool `.html` page
- Impact: A header change applied to one page and not copied to the other fifteen produces a `HEADER-DRIFT` finding and an inconsistent navigation experience
- Fix approach: `i18n-check.js --header --all` catches header drift across every page; copy a header change from one page to all fifteen others in the same commit

**A brief English flash before a non-English language applies is accepted:**

- Issue: A page's static markup renders in English first (before `assets/nt-i18n.js`'s `init()` runs and `applyStaticDom()` re-binds every `data-i18n` element to the resolved language), so a visitor with a non-English preference sees a brief flash of English on load
- Files: Every tool `.html` page
- Impact: Cosmetic only — the flash is sub-second and the page settles into the correct language before the visitor can read it; accepted per the phase's own assumption (06-RESEARCH A8)
- Fix approach: No fix planned — logged as an accepted tradeoff rather than a defect; a future phase could move the language-resolution script earlier (matching the theme-flash-prevention pattern already used for `site-theme`) if it becomes a real UX issue

## Code Duplication & Maintainability

**HTML header/nav boilerplate repeated in every file:**

- Issue: Each of 5 HTML tools contains 8–20 lines of identical site header markup (navigation, theme toggle, branding)
- Files: All tool HTML files (factor-tree.html, sieve-of-eratosthenes.html, congruence-wheel.html, rsa.html, fermats-method.html)
- Impact: Site-wide navigation changes require editing 5 files. Easy to miss one and create inconsistency. Changes to nav links break silently if done incompletely.
- Fix approach: Use a templating step during development (e.g., a build script that injects header into each file), or accept the duplication and add a checklist documenting all files that need nav updates

## Relative Path Fragility

**Asset and navigation links assume fixed directory structure:**

- Issue: Links use relative paths like `../assets/site.css`, `../index.html`, `../Congruence Wheel/congruence-wheel.html`
- Files: All HTML files
- Impact: Moving tool directories or renaming them breaks all links. Restructuring the repo (e.g., adding a `tools/` subdirectory) requires mass file updates. Testing locally with `file://` URLs and serving via HTTP may have different path resolution.
- Fix approach: Add `.htaccess` or server config to ensure consistent path handling; or use absolute paths relative to site root (e.g., `/assets/site.css` instead of `../assets/site.css`) if hosting at a known path; or document the exact directory structure as a hard constraint in CLAUDE.md

## File Size & Complexity

**Individual HTML files exceed 800 lines:**

- Issue: `fermats-method.html` (863 lines), `sieve-of-eratosthenes.html` (815 lines) are large monolithic files with inline styles, scripts, and markup all mixed
- Files: `fermats-method.html`, `sieve-of-eratosthenes.html`
- Impact: Harder to locate and fix bugs. Editing one part risks breaking another (no modular isolation). Code review becomes tedious. Browser dev tools can struggle with large inline scripts.
- Fix approach: No immediate fix — tool-specific code stays in the page; shared helpers already live in `assets/`. Document line-count expectations and enforce with a linter if files grow further

## Number Precision Limits

**Regular JavaScript Numbers lose precision above 2^53:**

- Issue: Most tools use `Number` for computation (`primeFactors`, `smallestPrimeFactor`, `isPrime` functions), which silently overflow for integers > 2^53 (≈9 quadrillion)
- Files: `Factor Tree/factor-tree.html` (lines 436–462), `Congruence Wheel/congruence-wheel.html`, `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`, `Fermats Method/fermats-method.html`
- Impact: Inputs in the range ~10¹⁵–10¹⁶ will produce incorrect factorizations silently. User will see wrong prime factors or hang loops. Only `RSA/rsa.html` uses BigInt and is safe.
- Current validation: Factor Tree caps input at 1 trillion (10¹²), Fermat's Method caps at 10⁹. These limits are ad-hoc and not enforced uniformly.
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
- Files: Primarily `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` (grid size), `Fermats Method/fermats-method.html` (trial count with `MAX_ITER`)
- Impact: User can input 10⁹ for sieve size, freeze browser for minutes
- Current mitigations: Sieve has `MAX_N = 100000`, Fermat's Method has `MAX_ITER = 50000`. But no UI constraint on inputs (max attribute exists but not enforced by all controls).
- Fix approach: Add HTML5 `max` attributes to all number inputs; add timeout/abort logic to long-running computations (e.g., "abort sieve search after 5 seconds"); display progress and a cancel button during heavy work

## SVG Accessibility

**Diagrams lack semantic labels for screen readers:**

- Issue: SVG elements (circles, lines, text) in rendered diagrams have no `<title>`, `<desc>`, or ARIA labels
- Files: `Factor Tree/factor-tree.html` (SVG render at line 588), `Congruence Wheel/congruence-wheel.html` (SVG sectors), `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` (grid cells)
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
- Files: `assets/nt-svg.js` (`svgEl`, used by every tool that imports `NT.svg`)
- Impact: User sees blank stage and no error message. Difficult to debug.
- Fix approach: Wrap SVG operations in try-catch; on error, display a message like "SVG rendering failed. Try refreshing the page." in the stage element

## Security Observations

**innerHTML with computed values (not user-controlled):**

- Issue: Several files use `innerHTML` to inject HTML with template literals: `banner.innerHTML = `Found ${M.toLocaleString()}…``
- Files: `Fermats Method/fermats-method.html` (lines 736, 749, 761, 765, 837), `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` (line 662), `Congruence Wheel/congruence-wheel.html` (line 525), `RSA/rsa.html` (lines 470, 516, 586, 610, 628, 683)
- Current status: Safe. Values injected are numbers (M, k, a, b) or localized strings (`toLocaleString()`), never raw user input.
- Risk: If code is refactored to include user-supplied strings without sanitization, XSS becomes possible.
- Recommendation: Add a comment near `innerHTML` assignments: `/* Safe: value is numeric, not user input */` to alert future maintainers

## Scaling Limits

**Memory & computation for large inputs:**

- Sieve grid: Storing 100,000 Boolean values for the sieve grid uses ~100KB, acceptable. But `MAX_N = 100000` is arbitrary; no memory budget defined.
- Fermat's Method: Trial loop runs up to 50,000 iterations; each stores `{ a, b, c }` in `trials[]`. At 50K trials, this is a large array. GC may hiccup.
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
