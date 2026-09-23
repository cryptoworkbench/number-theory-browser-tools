---
last_mapped_commit: 5bb8919024dcaaee469701a9086df5dc814ba501
last_mapped_at: 2026-09-23
---
# Coding Conventions

**Analysis Date:** 2026-09-23

## Naming Patterns

**Files:**

- HTML tools use kebab-case: `factor-tree.html`, `pizza-slices.html`, `sieve-of-eratosthenes.html`, `rsa-examplifier.html`
- Shared assets use kebab-case: `site.css`, `theme.js`
- Directory names use Title Case with spaces: `Christmas Trees`, `Pizza Slices`, `RSA Examplifier`

**Variables:**

- camelCase for all variable declarations: `nRange`, `depthRange`, `dynGroup`, `refList`, `messageEl`
- Computed geometric constants also camelCase: `wedgeAngle`, `ringWidth`, `levelHeight`
- DOM elements: `numInput`, `equationEl`, `treeArea`, `generateBtn`, `playBtn`

**Functions:**

- camelCase for all function names: `primeFactors()`, `smallestPrimeFactor()`, `isPrime()`, `render()`, `select()`, `persist()`
- Descriptive names indicating purpose: `buildTree()`, `assignX()`, `flatten()`, `pinePath()`, `svgEl()`, `modPowPlain()`, `extendedGcdSteps()`
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

- All tools are single-file HTML documents
- Inline `<style>` block in `<head>` (no external CSS except shared `assets/site.css`)
- Inline `<script>` block at end of `<body>`
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

**No JavaScript imports:**

- Single-file design precludes import/require statements
- Math utility functions (primeFactors, isPrime, modPow) are duplicated per-file
- SVG helper function `svgEl()` is repeated verbatim across tools

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

- No explicit exports (single-file design)
- Window-level state sometimes avoided; most state is module-scoped
- Event listeners and DOM queries use module-scoped variables

**Barrel Files:**

- Not applicable — each tool is a complete, standalone HTML file

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

**SVG Helper (duplicated per-file):**

```javascript
function svgEl(tag, attrs){
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}
```

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
