# Phase 3: Chinese Remainder Theorem Tool - Pattern Map

**Mapped:** 2026-09-28
**Files analyzed:** 3 (1 new tool, 2 modified existing files)
**Analogs found:** 3 / 3

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|--------------------|------|-----------|-----------------|----------------|
| `Chinese Remainder Theorem/chinese-remainder-theorem.html` | component (standalone page: controller + view + model in one file) | request-response (input → validate → compute → render) + event-driven (playback animation loop) | `Euclidean Algorithm/euclidean-algorithm.html` (primary skeleton: playback, presets, extended-Euclidean, cross-link) blended with `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` (grid/cell CSS + speed-ramp for the scan) and `Venn Diagram/venn-diagram.html` (2-vs-3 mode toggle) | exact (structural skeleton) / role-match (grid + toggle sub-patterns) |
| `Euclidean Algorithm/euclidean-algorithm.html` (modified — add `?ext=1` load param) | component (existing page, additive edit) | request-response (URL param read at load) | Itself — extend its own `readABParams()` / `window.addEventListener('load', ...)` block | exact (edit-in-place, self-analog) |
| `index.html` (modified — new nav card) + every tool's shared nav header (modified — new `<a>` entry) | component (static markup) | CRUD (adding one list entry) | `index.html` existing card grid; any existing tool's nav header markup | exact |

## Pattern Assignments

### `Chinese Remainder Theorem/chinese-remainder-theorem.html` (new tool)

**Primary analog:** `Euclidean Algorithm/euclidean-algorithm.html` (1111 lines) — copy this file wholesale as the structural skeleton, then swap in the CRT-specific math/diagram.

**Head boilerplate** (`Euclidean Algorithm/euclidean-algorithm.html:1-13`) — copy verbatim, only change `<title>`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<script>(function(){function v(t){return t==='day'||t==='night'?t:null;}var t=null,m;try{m=/[?&]theme=([^&#]*)/.exec(location.search);if(m)t=v(decodeURIComponent(m[1]));}catch(e){}if(!t){try{m=/(?:^|; *)site-theme=([^;]*)/.exec(document.cookie||'');if(m)t=v(decodeURIComponent(m[1]));}catch(e){}}if(!t){try{t=v(localStorage.getItem('site-theme'));}catch(e){}}document.documentElement.setAttribute('data-theme',t||'night');})();</script>
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Chinese Remainder Theorem</title>
<link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
<link rel="stylesheet" href="../assets/palette.css">
<link rel="stylesheet" href="../assets/site.css">
<script defer src="../assets/theme.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Source+Sans+3:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

**Local color-alias pattern** (`Euclidean Algorithm/euclidean-algorithm.html:15-30`) — CRT should declare its own small alias block the same way, mapping tool-specific concepts onto shared roles (never literal colors):
```css
:root{
  /* CRT slot colors, aliased from shared semantic roles — comment explaining
     the mapping the way Euclidean's own header comment does. */
  --slot-a: var(--role-input);      /* residue-class cells (D-02) */
  --slot-b: var(--role-active);     /* scan cursor column (D-02) */
  --slot-r: var(--role-result);     /* solution column once found (D-02) */
  --slot-cap: var(--role-warn);     /* non-coprime warning (D-02, D-05) */
  --slot-ext: var(--role-special);  /* "reveal faster method" toggle (D-02, D-04) */
}
```
Per CLAUDE.md, no literal hex/rgb/hsl anywhere in the new `<style>` block — every color resolves through `var()` against these aliases or directly against `--role-*`/`--text`/`--bg-*` tokens.

**Preset chip markup** (`Euclidean Algorithm/euclidean-algorithm.html:294-301`) — copy the `<div class="chips" id="presetChips">` + `<button class="chip" data-...>` shape, extended with per-congruence `data-` attributes (e.g. `data-a1`, `data-m1`, `data-a2`, `data-m2`, `data-a3`, `data-m3`, `data-mode`):
```html
<div class="chips" id="presetChips">
  <button type="button" class="chip" data-a="240" data-b="46">240, 46 · 5 steps</button>
  <button type="button" class="chip" data-a="35" data-b="18">35, 18 · coprime</button>
  ...
</div>
```
CRT-07's three required presets (Sun Tzu riddle, simple coprime pair, non-coprime pair) map onto three `.chip` buttons wired the same way as `chipButtons.forEach(...)` at `Euclidean Algorithm/euclidean-algorithm.html:1088-1096`.

**Playback state + input reading** (`Euclidean Algorithm/euclidean-algorithm.html:424-481`):
```js
var MAX_INPUT = 1000000; // CRT: replace with its own modulus cap (~12-15 per D-06/Pitfall 5)
var currentRun = null;
var playing = false;
var rafId = null;
var lastAdvance = 0;
var stepIndex = 0;
var generation = 0; // bumped on every reset; stale rAF callbacks check and bail

var SPEED_LABELS = {1:'glacial',2:'slow',...,10:'instant-ish'};
var SPEED_MS = {1:2600,...,10:90}; // NOTE: do NOT reuse directly for the scan — see Sieve's speedToEventsPerFrame below instead (Pitfall 3)

function readInputs(){
  errorBox.textContent = '';
  var rawA = aInput.value.trim();
  if (!/^-?\d+$/.test(rawA)){ errorBox.textContent = '...'; return null; }
  var a = parseInt(rawA, 10);
  // range/clamp checks, mirror this shape per congruence field
  return { ... };
}
```
CRT's `readInputs()` should validate each `(a_i, m_i)` pair this same way (regex → `parseInt` → range-check/clamp), then run the pairwise-coprimality gate (see Shared Patterns below) before proceeding.

**`generation`-guarded rAF playback loop** (`Euclidean Algorithm/euclidean-algorithm.html:895-1013`) — copy this control shape (`advanceOne`, `frameStep`, `play`, `pause`, `stepOnce`, `instantFinish`, `resetPlayback`) for CRT's discrete Play/Pause/Step/Reset button wiring:
```js
function advanceOne(){
  var myGen = generation;
  // ...append/update DOM for this step...
  if (myGen !== generation) return; // abandoned mid-call; bail
  // ...continue...
}
function frameStep(ts){
  if (!playing) return;
  // CRT: replace dwell-time-per-step with Sieve's events-per-frame ramp (see below) —
  // do not reuse SPEED_MS's per-step dwell verbatim; the scan can run far longer
  // than a GCD trace (Pitfall 3).
  rafId = requestAnimationFrame(frameStep);
}
function play(){ /* ...same shape... */ }
function pause(){ /* ...same shape... */ }
function stepOnce(){ /* ...same shape... */ }
function instantFinish(){
  // CRT: compute the solution directly (closed-form via crtConstruct or a direct
  // loop) rather than iterating x one-by-one, so Instant is O(1)/O(m) regardless
  // of lcm size (Pitfall 3).
}
function resetPlayback(){
  pause();
  generation++; // invalidate any in-flight callback from the run being abandoned
  stepIndex = 0;
  // ...clear DOM...
}
```

**Cross-link (outbound `href` builder + inbound param reader)** (`Euclidean Algorithm/euclidean-algorithm.html:483-521`):
```js
function updateXrefLink(a, b){
  if (!xrefLink) return;
  xrefLink.href = '../Venn Diagram/venn-diagram.html?a=' + encodeURIComponent(a) + '&b=' + encodeURIComponent(b);
}
```
CRT's outbound link function is the same shape, targeting the Euclidean Algorithm tool with the new `ext` param per D-08:
```js
function updateEuclidXrefLink(a, b){
  if (!xrefLink) return;
  xrefLink.href = '../Euclidean Algorithm/euclidean-algorithm.html?a=' + encodeURIComponent(a) + '&b=' + encodeURIComponent(b) + '&ext=1';
}
```
CRT does not need an inbound param reader (D-08 is one-directional CRT → GCD only) — do not build a `readXParams()`-equivalent for this tool.

**Event wiring at IIFE bottom** (`Euclidean Algorithm/euclidean-algorithm.html:1040-1106`) — copy this shape for button clicks, preset chips, and the `window.addEventListener('load', ...)` example-on-load run. CRT has no inbound URL param to read at load (unlike Euclidean's own `readABParams()` call at line 1100), so its `load` handler is simpler: just run the default/first preset.

---

### `Chinese Remainder Theorem/chinese-remainder-theorem.html` — residue-strip diagram

**Analog:** `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`

**Grid/cell CSS** (`Sieve Of Eratosthenes/sieve-of-eratosthenes.html:213-272`) — one `.crt-row` grid per congruence, each using the *same* `grid-template-columns` cell count so columns align vertically across rows without manual pixel math (per Research Pattern 1 / Anti-Pattern "one shared grid"):
```css
.grid-container{
  position: relative;
  max-height: 62vh;
  overflow: auto;
  border-radius: 14px;
  padding: 4px;
}
.grid{
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--cell-min), 1fr));
  gap: 5px;
  position: relative;
}
.cell{
  aspect-ratio: 1 / 1;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius: 8px;
  background: color-mix(in srgb, var(--text) 4.5%, transparent);
  border: 1px solid color-mix(in srgb, var(--text) 6%, transparent);
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  transition: background .25s, border-color .25s, color .25s, box-shadow .25s, transform .15s;
}
.cell.current{
  border-color: var(--role-active);
  color: var(--role-active);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--role-active) 25%, transparent), 0 0 14px color-mix(in srgb, var(--role-active) 45%, transparent);
  transform: scale(1.12);
}
```
For CRT, add `.cell.residue{ background: var(--slot-a); ... }` (D-02's `--role-input` for a row's own residue class) and `.cell.solution{ background: var(--slot-r); ... }` (final solution column), reusing this exact declarative shape.

**Shrink-then-scroll sizing ladder** (`Sieve Of Eratosthenes/sieve-of-eratosthenes.html:554-561`) — re-derive (don't copy the exact breakpoints — Sieve's are tuned for up to 20,000 cells; CRT's cap is in the hundreds per Pitfall 5) the same idiom:
```js
function cellMinPx(size){
  if (size <= 100) return 40;
  if (size <= 400) return 30;
  if (size <= 1000) return 24;
  // ...
}
document.documentElement.style.setProperty('--cell-min', cellMinPx(size) + 'px');
```

**Exponential events-per-frame speed ramp** (`Sieve Of Eratosthenes/sieve-of-eratosthenes.html:658-680`) — use this for the brute-force scan's Play speed instead of Euclidean's per-step dwell (Research Pitfall 3: the scan can run into the hundreds/thousands of `x` values, unlike a <20-step GCD trace):
```js
function speedToEventsPerFrame(v){
  const table = {1:1,2:2,3:4,4:8,5:16,6:35,7:75,8:160,9:400,10:100000};
  return table[v] || 1;
}
function frameStep(){
  if (!playing) return;
  const perFrame = speedToEventsPerFrame(parseInt(speedInput.value, 10));
  let processed = 0;
  while (processed < perFrame && stepIndex < events.length){
    applyEvent(events[stepIndex], true); // CRT: test row agreement at x = stepIndex
    stepIndex++;
    processed++;
    if (events[stepIndex - 1].type === 'done') break;
  }
  if (stepIndex >= events.length){ pause(); return; }
  rafId = requestAnimationFrame(frameStep);
}
```
Wrap this inside the `generation`-guarded shell copied from Euclidean Algorithm (both patterns compose: generation guard for correctness on reset, events-per-frame for throughput).

---

### `Chinese Remainder Theorem/chinese-remainder-theorem.html` — 2-vs-3 congruence toggle

**Analog:** `Venn Diagram/venn-diagram.html`

**Mode toggle** (`Venn Diagram/venn-diagram.html` — `setMode()`, near line 1578):
```js
function setMode(mode){
  state.mode = mode;
  var isThree = mode === 'three';
  if (frameTwo) frameTwo.hidden = isThree;
  if (frameThree) frameThree.hidden = !isThree;
  if (modeTwoBtn) modeTwoBtn.setAttribute('aria-pressed', isThree ? 'false' : 'true');
  if (modeThreeBtn) modeThreeBtn.setAttribute('aria-pressed', isThree ? 'true' : 'false');
  render();
}
modeTwoBtn.addEventListener('click', function(){ setMode('two'); });
modeThreeBtn.addEventListener('click', function(){ setMode('three'); });
```
Per Research Pattern 4, CRT's per-row markup is much smaller than Venn's per-region SVG, so a simpler variant is equally valid: one `congruenceRowTemplate()` function called 2 or 3 times, with only the 3rd row's container `.hidden`/`hidden`-toggled — either shape satisfies CRT-06. Do not persist the mode in `localStorage` unless CONTEXT.md's discretion notes call for it (not required here, unlike Venn's own persisted `MODE_STORAGE_KEY`).

---

## Shared Patterns

### Pairwise coprimality gate + `gcd()`
**Source:** `Equivalence Wheel/equivalence-wheel.html:570` (the `gcd()` one-liner), composed with a new `firstNonCoprimePair()` per Research's Code Examples section.
**Apply to:** CRT's `readInputs()`/validation path (CRT-02), gating every downstream compute (scan, construction, strip render).
```js
function gcd(a, b){ while (b){ var t = a % b; a = b; b = t; } return a; }
function firstNonCoprimePair(moduli){
  for (var i = 0; i < moduli.length; i++){
    for (var j = i + 1; j < moduli.length; j++){
      if (gcd(moduli[i], moduli[j]) !== 1) return [i, j];
    }
  }
  return null;
}
```
On a non-coprime pair, render a `--role-warn` banner (mirror `errorBox.textContent = '...'` from Euclidean Algorithm) and stop — do not attempt to solve.

### Extended-Euclidean-derived modular inverse + CRT construction (CRT-05)
**Source:** `Euclidean Algorithm/euclidean-algorithm.html:373-389` (`euclidSteps` forward recurrence, adapted to return just the Bézout coefficient `s`).
**Apply to:** The "Reveal faster method" toggle.
```js
function modInverse(M, m){
  var r0 = M, r1 = m, s0 = 1, s1 = 0;
  while (r1 !== 0){
    var q = Math.floor(r0 / r1);
    var r2 = r0 - q * r1, s2 = s0 - q * s1;
    r0 = r1; r1 = r2; s0 = s1; s1 = s2;
  }
  return ((s0 % m) + m) % m;
}
function crtConstruct(congruences){ // [{a, m}, ...], pairwise coprime m's
  var lcm = congruences.reduce(function(acc, c){ return acc * c.m; }, 1);
  var x = 0;
  congruences.forEach(function(c){
    var Mi = lcm / c.m;
    var yi = modInverse(Mi, c.m);
    x += c.a * Mi * yi;
  });
  return ((x % lcm) + lcm) % lcm;
}
```
Do NOT import/reuse Euclidean's own `euclidSteps()` function by reference — per CLAUDE.md's per-file duplication convention, write CRT's own `modInverse`/`gcd`/`crtConstruct` even though nearly-identical code exists elsewhere.

### `--role-*` color tokens (no literal colors)
**Source:** `assets/palette.css:20-61`.
**Apply to:** Every rule in CRT's `<style>` block.
| Token | CRT usage (per D-02) |
|-------|------------------------|
| `--role-input` | Row's plain highlighted residue-class cells |
| `--role-active` | Current brute-force scan cursor column |
| `--role-result` | Final solution column once found |
| `--role-warn` | Non-coprime validation banner |
| `--role-special` | "Reveal faster method" (Extended-Euclidean) toggle/reveal |

### Extend `Euclidean Algorithm/euclidean-algorithm.html` with `?ext=1` (CRT-08, Pitfall 1)
**This is new code in the existing file, not a pre-existing hook.** Verified: `readABParams()` (lines 502-521) only reads `a`/`b`; the `load` handler (lines 1098-1106) never checks any `ext` param; only the checkbox's own `change` listener toggles `show-ext` (lines 1047-1049).
**Task:** Add a `readExtParam()` reader mirroring `readABParams()`'s defensive regex shape, and call it from the existing `load` handler:
```js
function readExtParam(){
  try{
    var m = /[?&]ext=([^&#]*)/.exec(location.search);
    return !!(m && decodeURIComponent(m[1]) === '1');
  }catch(e){ return false; }
}
// inside window.addEventListener('load', function(){ ... }):
if (readExtParam()){
  extToggle.checked = true;
  appEl.classList.add('show-ext');
}
```
Place this alongside the existing `var abParams = readABParams(); if (abParams){...}` block (lines 1100-1104), before `buildRun()`.

### Nav/hub registration
**Source:** `index.html` card grid; every existing tool's shared nav header (`assets/site.css` chrome, per-file `<nav>` markup).
**Apply to:** Add one new `<a>` entry to `index.html`'s card grid and to every existing tool's nav header (12 tools total after this phase). Per Research's Open Question #3, insert immediately after "Euclidean Algorithm" and before "Equivalence Wheel" in nav order.

## No Analog Found

None — every sub-pattern this phase needs (playback, grid/cell diagram, mode toggle, cross-link, coprimality/modular-inverse math, color tokens) has a verified, line-cited precedent in the existing codebase.

## Metadata

**Analog search scope:** `Euclidean Algorithm/`, `Sieve Of Eratosthenes/`, `Venn Diagram/`, `Cayley Table/`, `Equivalence Wheel/`, `assets/palette.css`, `index.html` — all confirmed git-tracked via `git ls-files`.
**Files scanned:** 7
**Pattern extraction date:** 2026-09-28
