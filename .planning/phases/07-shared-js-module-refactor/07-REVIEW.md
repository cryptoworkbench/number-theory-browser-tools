---
phase: 07-shared-js-module-refactor
reviewed: 2026-10-01T00:00:00Z
depth: standard
files_reviewed: 21
files_reviewed_list:
  - .claude/CLAUDE.md
  - CLAUDE.md
  - Cayley Table/cayley-table.html
  - Chinese Remainder Theorem/chinese-remainder-theorem.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html
  - Equivalence Wheel/equivalence-wheel.html
  - Euclidean Algorithm/euclidean-algorithm.html
  - Eulers Totient/eulers-totient.html
  - Factor Tree/factor-tree.html
  - Fermats Method/fermats-method.html
  - Group Isomorphism/group-isomorphism.html
  - RSA/rsa.html
  - Shors Algorithm/shors-algorithm.html
  - Square And Multiply/square-and-multiply.html
  - Venn Diagram/venn-diagram.html
  - assets/nt-bigint.js
  - assets/nt-core.js
  - assets/nt-layout.js
  - assets/nt-store.js
  - assets/nt-svg.js
findings:
  critical: 0
  warning: 1
  info: 2
  total: 3
status: issues_found
---

# Phase 07: Code Review Report

**Reviewed:** 2026-10-01T00:00:00Z
**Depth:** standard
**Files Reviewed:** 21
**Status:** issues_found

## Summary

This phase replaces per-tool duplicated number-theory/SVG/storage/layout helpers with five shared `window.NT` modules (`assets/nt-core.js`, `nt-bigint.js`, `nt-svg.js`, `nt-store.js`, `nt-layout.js`), consumed via `<script src>` (non-deferred) + a `const { ... } = NT.NAME;` import block in each of 14 tool pages.

I read every shared module in full, diffed every tool HTML file against `15d63d6` (pre-refactor), and specifically hunted for the regression classes the migration invites: changed helper semantics vs. the deleted local copies, the `polar`/`annularSectorPath` signature change (module-scoped `CX`/`CY` → explicit leading `cx, cy` parameters), script include order/load-time availability (`nt-layout.js` requires `nt-core.js` first and throws otherwise), missing/unused imports, and shared-storage key/payload compatibility (`group-params`, `ab-params`).

To go beyond manual reading I also: ran `node --check` on every tool's extracted inline script (catches duplicate top-level `const`/syntax errors — all 14 clean); cross-referenced every `const { ... } = NT.NAME` import against the actual frozen export lists in the five modules (no typo'd/missing export names); and swept every tool file for any bare call to a name that used to be a locally-defined helper (`isPrimeSmall`, `gcdSmall`, `modInv`, `factorize`, `buildTree`/`assignX`/`flatten`, the old `readABParams`/`readSharedGroup`/etc.) to confirm nothing was left calling a function that no longer exists locally and isn't imported. Every hit resolved to either a still-locally-defined helper or a comment/string, not a live reference.

Semantic equivalence checks performed by hand (not just trusting the module's own header comments): `NT.core.gcd`/`bigGcd` step order vs. the swapped-destructuring variants some tools used (equivalent); `NT.core.isPrime`'s added `Number.isInteger` guard vs. every caller's inputs (always already integers, so a no-op tightening); `NT.core.modInverse`'s early-loop behavior vs. `ECDH`'s `modInv` early `x===0` short-circuit and CRT's forward-recurrence `modInverse` (both equivalent for every reachable input, including the `m=1` edge case CRT's `MIN_MODULUS=1` permits); `NT.store.readABParams(rejectZeroPair)` call sites — Euclidean Algorithm passes `true` (matches its own pre-migration unconditional `(0,0)` rejection), Venn Diagram passes no argument (matches its own pre-migration acceptance of `(0,0)`) — this is the one place the two predecessors' behavior genuinely differed and it was preserved correctly per call site. `polar`/`annularSectorPath` call sites in both wheel tools (Equivalence Wheel, Group Isomorphism) and Shor's Algorithm all pass `cx, cy` first, correctly.

I found no correctness regressions. The phase's own dev-only verification harness (`harness.js` parity checks, `shadow-check.js` static gates, `browser-diff.js` headless-Chrome differentials — all reported green in `07-VALIDATION.md`) lines up with what I independently found by reading the source. The three findings below are minor: one runtime robustness gap in the shared-module freeze contract, and two documentation-accuracy nits in `.claude/CLAUDE.md` introduced by this phase's doc-sync plan (07-08).

## Warnings

### WR-01: `window.NT` itself is never frozen — only its sub-namespaces are

**File:** `assets/nt-core.js:219`, `assets/nt-bigint.js:148`, `assets/nt-svg.js:98`, `assets/nt-store.js:198`, `assets/nt-layout.js:44`

**Issue:** Every module's header comment states the invariant as: *"NT.core is frozen after construction — a tool must never assign to NT or to any of its members"* (verbatim or near-verbatim in all five files), and `.claude/CLAUDE.md`'s Global State constraint repeats it: *"`window.NT` is the one shared global, and each of its sub-namespaces ... is frozen after construction; no page may assign to `NT` or to any of its members."*

What's actually enforced at runtime is `Object.freeze()` on each *sub-object* (`NT.core`, `NT.bigint`, etc.) — never on `NT` itself. `NT` is constructed as a plain, non-frozen object (`var NT = window.NT = window.NT || {};`), so nothing at runtime stops a later script from doing `window.NT.core = { gcd: function(){ return 0; } };` — that's a plain property assignment on an unfrozen `NT`, not a mutation of the frozen `NT.core` object, so `Object.freeze(NT.core)` does not intercept it (silently no-ops in sloppy mode, since none of the 14 tool `<script>` blocks declare `"use strict"` uniformly — several do, several don't — so the failure mode is inconsistent: a `"use strict"` tool would throw, a non-strict one would silently succeed).

The only thing actually guarding against this today is `shadow-check.js`'s `NS-MUTATION` static regex gate, which is a *dev-only lint over the checked-in tool files*, not a runtime guarantee — it can't catch a mutation introduced by, e.g., a future inline `<script>` block, a browser extension, or any code path the lint doesn't scan. The claimed invariant is therefore weaker than documented: replacing an entire namespace (as opposed to mutating one of its members) is unprotected at runtime.

**Fix:** Freeze the container too, once, in whichever module runs first (or independently in each, since `window.NT = window.NT || {}` already makes re-running idempotent):
```js
var NT = window.NT = window.NT || {};
// ... after all five modules have each set their own namespace, or defensively
// in every module before setting its own key:
if (!Object.isFrozen(NT)) {
  // still allow first-time namespace assignment before freezing; simplest
  // fix is to freeze NT itself only after this module's own assignment:
}
NT.core = Object.freeze({ ... });
Object.freeze(NT);
```
Note the ordering constraint: `NT.core = ...` must happen *before* `Object.freeze(NT)` in the same module, and each of the five modules would need to do this defensively (since load order across modules varies per tool) — e.g. via `Object.freeze(NT)` at the end of *every* module, which is safe to call repeatedly on an already-frozen object.

## Info

### IN-01: ".claude/CLAUDE.md" documents an import-sort convention the files don't follow

**File:** `.claude/CLAUDE.md:139`
**Issue:** Line 139 states "Names within an import line are sorted alphabetically" as a Conventions/Import Organization rule. In practice the destructuring lines use plain ASCII sort (uppercase constants before lowercase functions), not case-insensitive alphabetical order. For example `Cayley Table/cayley-table.html:343` and `Equivalence Wheel/equivalence-wheel.html`'s identical line:
```js
const { SHARED_GROUP_KEY, readModeNParams, readSharedGroup, writeSharedGroup } = NT.store;
```
Case-insensitive alphabetical order would put `readModeNParams` before `SHARED_GROUP_KEY` (r < s). This is purely a doc-accuracy nit (no functional impact — this is a shared-lint style rule, not behavior), but as written the stated rule is falsifiable by the codebase's own current lines, which undermines its usefulness as a convention to enforce in review.
**Fix:** Either reword the rule to "ASCII-sorted" (matching current practice) or actually re-sort the import lines to case-insensitive alphabetical order and keep the doc as-is.

### IN-02: Two new Anti-Pattern headers in `.claude/CLAUDE.md` have no content

**File:** `.claude/CLAUDE.md:324-326`
**Issue:** This phase's doc-sync plan (07-08) replaced the old "Copy-Paste Math Functions" anti-pattern header with two new ones — "Shadowing a Shared Helper" and "Deferred or Modular Shared-Module Includes" — but neither has any bullet content describing what the anti-pattern looks like or how to avoid it (unlike the adjacent "Monolithic Tool File" and "Tight Coupling to localStorage Key Name" headers, which retain their bullets). A maintainer scanning this doc for "what NOT to do" gets a bare heading with no guidance for exactly the two anti-patterns this phase's own architecture makes newly possible (shadowing an `NT.*` import with a same-named local function; including `nt-*.js` with `defer`/`async`/`type="module"`, breaking the synchronous-availability contract the tool scripts depend on).
**Fix:** Add a short bullet list under each new heading, e.g. under "Shadowing a Shared Helper": "- Declaring `function isPrime(n){...}` locally after `const { isPrime } = NT.core;` silently shadows the import for the rest of the file", and under "Deferred or Modular Shared-Module Includes": "- `<script defer src=\"../assets/nt-core.js\">` or `type=\"module\"` — breaks the synchronous-before-inline-script contract every tool's inline `<script>` block relies on at IIFE top level."

---

_Reviewed: 2026-10-01T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
