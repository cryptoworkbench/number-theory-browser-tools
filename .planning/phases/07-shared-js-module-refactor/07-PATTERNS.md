# Phase 7: Shared JS Module Refactor - Pattern Map

**Mapped:** 2026-09-30
**Files analyzed:** ~23 (3 new asset modules, 2 dev-only harness files, 15 tool HTML files, 4 doc files, 1 in-code comment cleanup in Venn Diagram)
**Analogs found:** 23 / 23 (every file has a usable analog; asset modules use a same-repo precedent for the include mechanism plus this session's own research doc for internal shape)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `assets/math-core.js` (new) | utility/config (shared module) | transform (pure functions) | `assets/theme.js` (IIFE shared-script structure) + `Factor Tree/factor-tree.html` (svgEl/primeFactors bodies) + `Venn Diagram/venn-diagram.html` (canonical `gcd` with abs) | role-match (theme.js is the only prior shared-script precedent; internal shape is new — namespace-attaching, not self-executing) |
| `assets/math-bigint.js` (new) | utility/config (shared module) | transform | `assets/theme.js` (IIFE wrapper) + `RSA/rsa.html` (bigGcd/isPrimeBig/modPowPlain/randomBigInt* bodies, byte-identical to Diffie-Hellman KE) | role-match |
| `assets/svg-helpers.js` (new) | utility/config (shared module) | transform | `assets/theme.js` (IIFE wrapper) + `Factor Tree/factor-tree.html:433,649` (`svgEl`) + `Equivalence Wheel/equivalence-wheel.html` (`polar`/`annularSectorPath`, signature must change to accept cx/cy) | role-match, signature-change flagged |
| `assets/shared-store.js` (new, optional/Tier-4, IN SCOPE per orchestrator) | utility/config (shared module) | CRUD (localStorage+cookie read/write) | `Cayley Table/cayley-table.html:412,431` (`readSharedGroup`/`writeSharedGroup`) + `Venn Diagram/venn-diagram.html:641,667,687` (`readMigrating`/`readSharedAB`/`writeSharedAB`) + `assets/theme.js` (3-channel persistence pattern precedent) | exact (byte-identical pair already exists across 2 files; needs generalization to `key`+validator params) |
| `.planning/phases/07-shared-js-module-refactor/harness.js` (dev-only) | test | batch (diff old-vs-new function outputs) | No repo precedent (project has zero test framework per `.planning/codebase/TESTING.md`) — pattern instead comes from RESEARCH.md's own spec (§Wave 0 Gaps) | no analog (net-new dev tooling) |
| `.planning/phases/07-shared-js-module-refactor/shadow-check.sh` (dev-only) | test | batch (grep-based static check) | No repo precedent; spec comes from RESEARCH.md §Anti-Patterns/§Name-Collision Risk Summary #2 | no analog (net-new dev tooling) |
| 15 tool `*.html` files (modified: add `<script src>` includes, delete local helper fns, repoint calls) | controller/component (self-contained page) | request-response (render-on-interaction) | Each tool is its own analog for the "keep everything else unchanged" part; `Equivalence Wheel/equivalence-wheel.html` and `Group Isomorphism/group-isomorphism.html` are the two highest-risk analogs (Tier-2 signature change + synchronous top-level calls) | exact (modifying the file itself) |
| `CLAUDE.md` (modified, lines ~23, ~40) | config (docs) | transform (rewrite) | Prior doc-mirror-pair edit precedent: commits `d441342`→`15d63d6`→`fc5d1c0` (the rule-retirement edit) | exact (same file, same edit pattern as the precedent commits) |
| `.claude/CLAUDE.md` (modified, generated mirror) | config (docs) | transform (mirror-sync) | Same precedent commits; mirror section markers `<!-- GSD:conventions-start source:CONVENTIONS.md -->` etc. | exact |
| `.planning/codebase/CONVENTIONS.md` (modified, lines 80, 255) | config (docs) | transform | Same precedent | exact |
| `.planning/codebase/ARCHITECTURE.md` (modified, lines 64, 229-231, 237-250) | config (docs) | transform | Same precedent | exact |
| `.planning/codebase/STRUCTURE.md` (modified, lines 194-200) | config (docs) | transform | Same precedent | exact |
| `.planning/codebase/CONCERNS.md` (modified, lines 11-25 only, per orchestrator Q3 scope) | config (docs) | transform | Same precedent (this file itself, read below) | exact |

## Pattern Assignments

### `assets/math-core.js`, `assets/math-bigint.js`, `assets/svg-helpers.js` (shared module, transform)

**Structural analog:** `assets/theme.js` — the only prior shared classic-script in this repo. It is self-executing and exports nothing to `window`; the new modules diverge from it deliberately (must attach to `window.NT.*`), but its **file-level shape** (single top-of-file comment block explaining *why*, then `(function(){ "use strict"; ... })();`) is the convention to imitate.

**Include-mechanism analog:** `Factor Tree/factor-tree.html:9-11`
```html
<link rel="stylesheet" href="../assets/palette.css">
<link rel="stylesheet" href="../assets/site.css">
<script defer src="../assets/theme.js"></script>
```
Note: this is the `<head>` pattern for CSS/theme.js (deferred, unaffected by this phase). The **new** math/svg modules must NOT follow the `defer` part of this pattern — per RESEARCH.md Pitfall 3, they need a plain (non-deferred) `<script src>` placed at the end of `<body>`, immediately before the tool's own inline `<script>` block:
```html
<script src="../assets/math-core.js"></script>
<script src="../assets/svg-helpers.js"></script>
<script>
  (function(){
    "use strict";
    // tool code, now calling window.NT.core.gcd(...) etc.
  })();
</script>
```

**Header-comment style analog:** `assets/theme.js:1-20` — multi-line `/* ... */` block at the top of the file explaining *why* the pattern exists (not just *what* it does) before any code. Each new module should open with a comment of this style explaining what it centralizes and which tools consume it.

**svgEl core pattern to move verbatim** (`Factor Tree/factor-tree.html:433,649-653`):
```javascript
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs){
  const el = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}
```
Becomes, inside `assets/svg-helpers.js`'s IIFE, attached as `window.NT.svg.svgEl`.

**Canonical `gcd` to standardize on** (`Venn Diagram/venn-diagram.html:589` / `Chinese Remainder Theorem/chinese-remainder-theorem.html:406` — identical, abs-including):
```javascript
function gcd(a, b){
  a = Math.abs(a); b = Math.abs(b);
  while (b){ var t = a % b; a = b; b = t; }
  return a;
}
```
The no-abs variant (`Cayley Table/cayley-table.html:342`, `Equivalence Wheel/equivalence-wheel.html:581`, `Group Isomorphism/group-isomorphism.html:407`) is replaced by this one — verified in RESEARCH.md as a behavior no-op for every existing call site.

**BigInt tier to move verbatim** (`RSA/rsa.html:378-384` region, byte-identical in `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html:399-405`):
```javascript
function modPowPlain(base, exp, mod){
  let result = 1n; base %= mod; if(base<0n) base += mod;
  while(exp > 0n){ if(exp & 1n) result = (result*base) % mod; exp >>= 1n; base = (base*base) % mod; }
  return result;
}
```
Plus `bigGcd`, `isPrimeBig(n, rounds)` (`RSA/rsa.html:384`), `randomBigIntBits`, `randomBigIntInRange` — all byte-identical between RSA and Diffie-Hellman KE per RESEARCH.md Tier 1 table; read those two files' bodies directly when implementing (no further Read needed here — RESEARCH.md already captured them verbatim).

**primeFactors/smallestPrimeFactor canonical source:** `Factor Tree/factor-tree.html:470` (`primeFactors`), `:483` (`smallestPrimeFactor`) — these are the canonical (ES6, unrenamed) versions; Venn Diagram's `factorize`/`smallestFactorOf` are near-duplicates to be repointed to call the shared version, not moved themselves.

**isPrime canonical source:** prefer `Venn Diagram/venn-diagram.html:574` (odd-only trial division, faster) over `Factor Tree/factor-tree.html:490` (tests all integers) — per RESEARCH.md Tier 1 recommendation, same results, Venn's loop is the one to keep.

**Tier-2 signature-change pattern (`polar`/`annularSectorPath`):**
Before (closure-coupled, `Equivalence Wheel/equivalence-wheel.html`, module-scoped `CX`/`CY`):
```javascript
function polar(r, angleDeg){
  var a = (angleDeg - 90) * Math.PI / 180;
  return [CX + r*Math.cos(a), CY + r*Math.sin(a)];
}
```
After, inside `assets/svg-helpers.js`:
```javascript
function polar(cx, cy, r, angleDeg){
  var a = (angleDeg - 90) * Math.PI / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
window.NT.svg.polar = polar;
```
Every call site in Equivalence Wheel and Group Isomorphism must change from `polar(r, angleDeg)` to `window.NT.svg.polar(CX, CY, r, angleDeg)` — same treatment for `annularSectorPath`.

---

### `assets/shared-store.js` (new, Tier 4 — in scope per orchestrator)

**Analog:** `Cayley Table/cayley-table.html:412-450` (`readSharedGroup`/`writeSharedGroup`, byte-identical to `Equivalence Wheel/equivalence-wheel.html:499-540`) and `Venn Diagram/venn-diagram.html:641-700` (`readMigrating`/`readSharedAB`/`writeSharedAB`).

**Pattern to generalize:** all three pairs share "cookie-then-localStorage read, localStorage-then-cookie write" — read the full bodies directly from those three line ranges when implementing (each is short, <40 lines). Generalize to something like:
```javascript
window.NT.store = {
  read: function(key, legacyKey, validate){ /* cookie+localStorage read with legacy fallback */ },
  write: function(key, value){ /* localStorage then cookie write */ }
};
```
Each tool's existing `readSharedGroup`/`readSharedAB` becomes a thin wrapper calling `window.NT.store.read('group-params', null, validatorFn)` etc. — key names and payload shapes (`{mode,n}` vs `{a,b}`) stay tool-specific; only the channel-read/write mechanics move.

---

### `.planning/phases/07-shared-js-module-refactor/harness.js` (dev-only, no analog)

No repo precedent exists (zero test framework, confirmed in RESEARCH.md via `.planning/codebase/TESTING.md:13`). Build from RESEARCH.md's own spec (§Wave 0 Gaps, §Validation Architecture): a plain Node script using only `fs`/`vm`, no dependencies, extracting old vs. new function bodies and asserting deep-equality over representative ranges (e.g. `gcd` over `[-50,50]x[-50,50]`, `isPrime` over `0..10000`). Not shipped, not referenced by any `.html` file — lives only under the phase directory.

### `.planning/phases/07-shared-js-module-refactor/shadow-check.sh` (dev-only, no analog)

No repo precedent. Build per RESEARCH.md §Anti-Patterns and §Name-Collision Risk Summary item 2: a grep-based script asserting zero remaining local declarations (`function gcd(`, `function svgEl(`, `function isPrime(`, etc.) in each migrated tool file. Example invocation pattern implied by RESEARCH.md:
```bash
grep -n "^function gcd(\|  function gcd(" */*.html   # must return zero hits post-migration
```

---

### 15 tool `*.html` files (controller/component, request-response)

**Analog for the migration shape:** each file is its own before/after analog. Two files carry the highest-risk pattern and should be used as the reference implementation order:

1. **Tier-1-only tools** (no closure-coupled helpers) — e.g. `Factor Tree/factor-tree.html`, `Fermats Method/fermats-method.html`, `Chinese Remainder Theorem/chinese-remainder-theorem.html`, `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`, `RSA/rsa.html`, `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html`, `Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html`, `Square And Multiply/square-and-multiply.html`, `Shors Algorithm/shors-algorithm.html`, `Eulers Totient/eulers-totient.html`, `Cayley Table/cayley-table.html`: delete the local `function gcd/isPrime/svgEl/...` declarations, add the `<script src="../assets/math-core.js">` (+`math-bigint.js`/`svg-helpers.js` as needed) line immediately before the tool's own `<script>` block, repoint all bare calls to `window.NT.core.*`/`window.NT.big.*`/`window.NT.svg.*`.
2. **Tier-2 tools** (`Equivalence Wheel/equivalence-wheel.html`, `Group Isomorphism/group-isomorphism.html`): same as above, plus the `polar`/`annularSectorPath` call-site signature change described above. Migrate these two only after the Tier-1-only tools are proven, since they carry the load-order risk (RESEARCH.md Pitfall 3 — synchronous top-level calls, verified for both files).
3. **Tier-3 file** (`Venn Diagram/venn-diagram.html`, 2,777 lines): migrate last per RESEARCH.md Pitfall 2. Per orchestrator's Open-Q1 resolution (Venn's ported composite subsystems ARE in scope, unified with Euclidean Algorithm and Factor Tree), this file's `euclidSteps`/`computeNestedLayout` pairs with `Euclidean Algorithm/euclidean-algorithm.html`'s primary renderer, and its `isqrt`/`isPerfectSquare`/`fermatSplit`/`buildBalancedTree`/`assignTreeX`/`flattenTree` pairs with `Factor Tree/factor-tree.html`'s "Balanced mode" builder — both of those tools' own primary (non-miniature) render paths must also be refactored to call the same shared functions, not just Venn's preview panel. Also strip/rewrite the two stale in-code comments in Venn Diagram citing "per CLAUDE.md's no-shared-JS-module rule for number-theory helpers" (RESEARCH.md §Tier 3, §In-code comments).

**Concrete per-file pattern (example, `Equivalence Wheel/equivalence-wheel.html`):**
```javascript
// before: function gcd(a, b){ while (b){ var t = a % b; a = b; b = t; } return a; }
// after: delete the local declaration; every bare gcd(...) call becomes window.NT.core.gcd(...)
```

---

## Shared Patterns

### Shared-module IIFE + namespace attachment
**Source:** New pattern (no direct repo precedent) — synthesized from `assets/theme.js`'s IIFE-wrapper convention + RESEARCH.md's §Architecture Patterns "Pattern: Module Attachment" section.
**Apply to:** `assets/math-core.js`, `assets/math-bigint.js`, `assets/svg-helpers.js`, `assets/shared-store.js`.
```javascript
(function(){
  "use strict";
  function gcd(a, b){ a = Math.abs(a); b = Math.abs(b); while (b){ var t = a % b; a = b; b = t; } return a; }
  // ...other functions...
  window.NT = window.NT || {};
  window.NT.core = { gcd: gcd, /* ... */ };
})();
```

### Script-include ordering (non-deferred, end of body)
**Source:** RESEARCH.md §Architecture Patterns, verified against `Equivalence Wheel/equivalence-wheel.html` and `Group Isomorphism/group-isomorphism.html`'s synchronous top-level calls.
**Apply to:** all 15 tool HTML files.
```html
<script src="../assets/math-core.js"></script>
<script src="../assets/svg-helpers.js"></script>
<!-- tool's own <script> block, unchanged position, follows immediately -->
```
Do NOT add `defer` to these — contrast with `<script defer src="../assets/theme.js"></script>` in `<head>`, which stays deferred and unaffected.

### Post-migration shadow-declaration verification
**Source:** RESEARCH.md §Anti-Patterns, §Name-Collision Risk Summary item 2.
**Apply to:** every migrated tool file, run once per tool after its migration and once more across the whole repo at wave-merge time.
```bash
grep -n "^function gcd(\|  function gcd(\|^function svgEl(\|  function svgEl(\|^function isPrime(\|  function isPrime(" */*.html
```
Expected: zero hits for every helper name now sourced from `window.NT.*`.

### Doc-mirror pairing (docs deliverables)
**Source:** commit precedent `d441342`→`15d63d6`→`fc5d1c0` (prior rule-retirement, same mirror mechanism).
**Apply to:** `CLAUDE.md`, `.claude/CLAUDE.md`, `.planning/codebase/CONVENTIONS.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`, `.planning/codebase/CONCERNS.md`.
Edit the `.planning/codebase/*.md` **source** file and its corresponding `<!-- GSD:*-start source:*.md --> ... <!-- GSD:*-end -->` mirrored section in `.claude/CLAUDE.md` in the **same task/commit** — never edit the mirror alone (that is exactly the mistake commit `fc5d1c0` had to clean up after).

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| `.planning/phases/07-shared-js-module-refactor/harness.js` | test | batch | No test framework or prior Node script exists anywhere in this repo (confirmed via `.planning/codebase/TESTING.md`); build directly from RESEARCH.md's §Wave 0 Gaps spec, not from a codebase analog |
| `.planning/phases/07-shared-js-module-refactor/shadow-check.sh` | test | batch | Same — no prior shell/grep verification script exists in the repo |

## Metadata

**Analog search scope:** repo root (`*/*.html`, `assets/*.js`, `.planning/codebase/*.md`, `CLAUDE.md`, `.claude/CLAUDE.md`) — all analogs are git-tracked source; verified no `.gsd/capabilities/*` mirror paths were considered (this repo has no `.gsd/` capability-sync directory involved in this phase's file set; the only `.gsd/` present per git status is an untracked top-level dir unrelated to these tool files).
**Files scanned:** 15 tool HTML files, `assets/theme.js`, `.planning/codebase/CONCERNS.md`, `.planning/phases/07-shared-js-module-refactor/07-RESEARCH.md` (primary source of verified line numbers/bodies — reused directly rather than re-reading files RESEARCH.md already captured verbatim, to avoid redundant reads).
**Pattern extraction date:** 2026-09-30
