---
last_mapped_commit: 5bb8919024dcaaee469701a9086df5dc814ba501
last_mapped_at: 2026-09-23
---
# Coding Conventions

**Analysis Date:** 2026-09-23

## Naming Patterns

**Files:**

- HTML tools use kebab-case: `factor-tree.html`, `congruence-wheel.html`, `sieve-of-eratosthenes.html`, `rsa.html`
- Shared assets use kebab-case: `site.css`, `theme.js`, `nt-core.js`, `nt-bigint.js`, `nt-svg.js`, `nt-store.js`, `nt-layout.js`, `nt-i18n.js`, `nt-picker.js`
- Translation-data files use kebab-case under `assets/i18n/`: `site.js` (shared `site`/`common` namespaces), `hub.js` (`index.html`), and `assets/i18n/<page-slug>.js` — one per tool, matching the tool's own HTML filename
- Directory names use Title Case with spaces: `Factor Tree`, `Congruence Wheel`, `RSA`

**Variables:**

- camelCase for all variable declarations: `nRange`, `depthRange`, `dynGroup`, `refList`, `messageEl`
- Computed geometric constants also camelCase: `wedgeAngle`, `ringWidth`, `levelHeight`
- DOM elements: `numInput`, `equationEl`, `treeArea`, `generateBtn`, `playBtn`

**Functions:**

- camelCase for all function names: `primeFactors()`, `smallestPrimeFactor()`, `isPrime()`, `render()`, `select()`, `persist()`
- Descriptive names indicating purpose: `buildFactorTree()`, `assignTreeX()`, `flattenTree()`, `pinePath()`, `svgEl()`, `modPowPlain()`, `extendedGcdSteps()`
- Prefixed with underscore pattern not used; instead, functions are organized by section with comments

**Constants:**

- All caps for module-level constants in some tools: `CX`, `CY`, `HOLE_R`, `OUTER_R`, `LIFT`, `SVG_NS`
- camelCase for named constant objects: `SPEED_LABELS`, `STORAGE_KEY`, `LIGHT_COLORS`
- CSS custom properties use double-dash prefix: `--bg`, `--ink`, `--accent`, `--prime`, `--composite`

## Code Style

**Formatting:**

- No build system or formatter in use
- Indentation: 2 spaces (observed consistently across all files)
- Line length: No strict limit; lines typically 80-100 characters
- Semicolons: Present and used consistently

**Structure:**

- Each tool is one HTML page; shared JS logic lives in `assets/nt-*.js` (site chrome lives in `assets/site.css`/`assets/theme.js`)
- Inline `<style>` block in `<head>` (no external CSS except shared `assets/palette.css`/`assets/site.css`)
- Inline `<script>` block at end of `<body>`, preceded by the `assets/nt-*.js` modules the tool imports
- IIFE-wrapped main logic: `(function(){ ... })();`
- Event listeners wired at bottom of IIFE

**JavaScript flavor:**

- ES6 syntax used in newer tools (const/let, arrow functions, template literals)
- Older ES5 patterns coexist (var, function declarations, for loops)
- No transpilation or build step
- Native DOM APIs only (no jQuery, no frameworks)
- BigInt used for cryptographic operations in RSA tool

**CSS Organization:**

- Day/night theme support via `:root[data-theme="night"]` and `:root[data-theme="day"]`
- CSS custom properties define all colors and sizes for theme switching
- Keyframe animations for decorative effects (snow, twinkling, fairy lights, pulse effects)
- Responsive design via `clamp()` and `@media` queries
- Flexbox and CSS Grid for layouts

## Import Organization

**External Resources:**

- Shared stylesheet: `<link rel="stylesheet" href="../assets/site.css">`
- Shared theme script (deferred): `<script defer src="../assets/theme.js"></script>`
- Google Fonts via link tag: `<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">`
- Theme detection script inline in `<head>` to prevent flash of wrong theme

**Shared module includes:**

- `<script src="../assets/nt-core.js"></script>` — plain, non-deferred, no `type="module"`, so the module runs synchronously before the tool's own script
- Each needed module is included on its own line, immediately before the tool's own inline `<script>` at the end of `<body>`, in the canonical order core, bigint, svg, store, layout, i18n, picker
- `nt-i18n.js` is followed by the data files `assets/i18n/site.js` and the page's own `assets/i18n/<page-slug>.js` (`assets/i18n/hub.js` for `index.html`), each a plain, non-deferred `<script src>` in that order, before the tool's own inline `<script>`
- The tool's inline `<script>` opens with an import block, e.g. `const { clamp, randomInt, unitsMod } = NT.core;`

**NT import pattern:**

- Shared helpers come from `NT` via the import block, one `const { ... } = NT.NAME;` line per namespace used, in the canonical namespace order core, bigint, svg, store, layout, i18n, picker
- Names within an import line are sorted by code point, so uppercase constants come first (e.g. `const { SHARED_GROUP_KEY, readModeNParams } = NT.store;`)
- A tool never redefines or mutates an `NT` member — each namespace object is frozen and its slot on `NT` is read-only

**Translation conventions (`NT.i18n`):**

- Every user-visible string comes from a dictionary entry present in all twenty-four languages (nl, en, de, fr, es, it, pl, pt-BR, pt-PT, sv, nb, ro, hu, lv, ru, el, he, hi, ar, sq, sw, zh, ja, ko), with English as source of truth
- Static markup is translated via `data-i18n`/`data-i18n-attr`/`data-i18n-placeholder`/`data-i18n-params` attributes, applied automatically by `applyStaticDom()`
- Script-rendered text is translated via `translate()`/`translateInto()`/`bindText()`, always as a whole-sentence template (never concatenating two translated fragments) and always landing in the DOM as a text node or via `textContent`/`setAttribute` — never `innerHTML`
- Numerals are never locale-formatted by language (`NT.bigint.fmt` is the one sanctioned plain-number formatter; thousands-grouping stays literal and identical in every language; Hindi, Arabic, Albanian, Swahili, Chinese, Japanese and Korean values carry exactly their English value's numerals — DIGIT-PARITY — never Albanian's space grouping or comma decimal, and never full-width digits, CJK numerals in place of digits or 万/億/만/억 grouping; full-width punctuation appears only in Chinese and Japanese prose and formulas stay ASCII; Chinese values are Simplified Chinese in Han characters, Japanese values kanji (shinjitai) with hiragana and katakana and Korean values Hangul without hanja, all rendered in the browser's system fallback font; while zh, ja or ko is active `<em>` is upright bold instead of a synthesized oblique and Korean wraps between words, never inside them (`assets/site.css`))
- A page's `onLangChange` callback re-renders its own dynamic text when the active language changes, without resetting tool state (grid, scan position, playback, selections)

## Error Handling

**Strategy:**

- Silent failures for localStorage operations wrapped in try/catch
- User-facing validation errors displayed in designated error elements
- Input parsing with explicit error messages

**Patterns:**

```javascript
// localStorage error handling (theme.js pattern)
try{
  localStorage.setItem(STORAGE_KEY, theme);
}catch(e){
  // Silent failure — continue without persistence
}

// BigInt input validation (RSA tool)
function parseBigIntStrict(str, allowZero){
  str = (str||'').trim();
  if(!/^\d+$/.test(str)) throw new Error('not a nonnegative integer');
  const v = BigInt(str);
  if(!allowZero && v <= 0n) throw new Error('must be positive');
  return v;
}

// Error display pattern (Factor Tree)
function factorize(rawValue){
  // ... validation ...
  if(n > 1000000000000){
    clearStage();
    setMessage('That number is too large for this little tree — try something under 1 trillion.');
    return;
  }
}
```

## Logging

**Framework:** None — console logging not used for normal operation

**Patterns:**

- Error and status messages rendered directly to DOM via `textContent` or `innerHTML`
- Message elements (`messageEl`, error boxes, banners) display validation errors and progress
- Performance timing via `performance.now()` (RSA brute-force factoring demo)

Example:

```javascript
const messageEl = document.getElementById('message');
function setMessage(text, isInfo){
  messageEl.textContent = text || '';
  messageEl.classList.toggle('info', !!isInfo);
}
```

## Comments

**Style:**

- Minimal inline comments — code is self-documenting
- Section markers using /* ---------- Text ---------- */ format
- Descriptive comments for complex algorithms

Examples from codebase:

```javascript
// ---------- Decorative background: starfield ----------
// ---------- Elements ----------
// ---------- Number theory ----------
// ---------- Build the real recursive factor tree ----------
// ---------- Staggered reveal, depth by depth ----------
```

## Function Design

**Size:**

- Most functions 10–30 lines
- Pure number-theory functions (primeFactors, isPrime, modPowPlain) are 5–15 lines
- Render functions 30–100+ lines for complex layouts
- No explicit size limit enforced

**Parameters:**

- Typically 1–3 parameters per function
- Callback functions use closure over module state (state object, counters)
- Counter/box objects passed by reference for accumulation (assignX, flatten)

**Return Values:**

- Number-theory functions return primitives (boolean, BigInt, number, array)
- Render functions return void (mutate DOM)
- Builder functions return objects: `{value, kind, children, depth, x, y}`
- Helper functions return computed values for geometry and styling

Example patterns:

```javascript
// Pure function — number theory
function primeFactors(n){
  const factors = [];
  let x = n;
  for(let p=2; p*p<=x; p++){
    while(x % p === 0){
      factors.push(p);
      x = x / p;
    }
  }
  if(x > 1) factors.push(x);
  return factors;
}

// Render function — mutates DOM
function render(){
  var N = state.N, depth = state.depth;
  dynGroup.innerHTML = '';
  // ... build and append SVG/DOM elements ...
}

// Callback pattern — mutation via closure
function select(idx){
  state.selected = idx;
  persist();
  render();
}
```

## Module Design

**Exports:**

- Shared modules export by assigning one frozen object to `window.NT.NAME` (`assets/nt-core.js` → `NT.core`, and so on); tool pages export nothing
- Window-level state sometimes avoided; most tool-specific state is module-scoped
- Event listeners and DOM queries use module-scoped variables

**Barrel Files:**

- Not applicable — each tool is its own page plus the `assets/nt-*.js` modules it includes

**Module Scope Pattern:**

```javascript
(function(){
  "use strict";
  
  // Private module state
  let generation = 0;
  const state = { N: 10, depth: 6, selected: 0 };
  
  // Private helper functions
  function render() { ... }
  function persist() { ... }
  
  // Public interface: event listeners wired at end
  goBtn.addEventListener('click', () => factorize(numInput.value));
  numInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') factorize(numInput.value);
  });
  
  // Initialization on page load
  window.addEventListener('load', () => {
    numInput.value = 60;
    factorize('60');
  });
})();
```

## Shared Patterns

**SVG Helper (`NT.svg.svgEl`, `assets/nt-svg.js`):**

```javascript
function svgEl(tag, attrs){
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}
```

**Shared module skeleton:** Every `assets/nt-*.js` file follows the same shape — a classic `(function(){ "use strict"; ... })();` IIFE, `var NT = window.NT = window.NT || {};` to get or create the root, one or more helper function declarations, then a single `NT.NAME = Object.freeze({ ... });` assignment at the end that exports the module's public functions and constants by name, followed by `Object.defineProperty(NT, 'NAME', { writable: false, configurable: false });` to lock that slot. `NT` itself is never frozen, because later modules still have to attach their own namespace to it.

**Generation Counter (cancellation pattern):**
Tools with long-running animations use a `generation` counter to invalidate stale callbacks:

```javascript
let generation = 0;
function render(n){
  generation++;
  const localGen = generation;
  
  setTimeout(() => {
    if(localGen !== generation) return; // Stale callback, discard
    // Safe to mutate — still current
  }, delay);
}
```

**State Persistence:**

```javascript
function persist(){
  try{
    localStorage.setItem('congruence-wheel', JSON.stringify({N: state.N, depth: state.depth}));
  }catch(e){}
}

// On load
try{
  var saved = JSON.parse(localStorage.getItem('congruence-wheel') || 'null');
  if (saved && saved.N >= 1 && saved.N <= 60) state.N = saved.N;
}catch(e){}
```

---

*Convention analysis: 2026-09-23*
