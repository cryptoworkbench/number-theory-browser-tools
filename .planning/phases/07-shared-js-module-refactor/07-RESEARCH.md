# Phase 7: Shared JS Module Refactor - Research

**Researched:** 2026-09-30
**Domain:** Vanilla-JS classic-script module extraction across 15 self-contained `file://`-runnable HTML tools
**Confidence:** HIGH (all findings below are `[VERIFIED]` via direct `Read`/`grep`/`awk` of the actual source files this session, except where marked `[ASSUMED]`)

## Summary

Phase 7 extracts the number-theory/SVG helper functions duplicated across the 15 tool pages into classic (non-module) `<script src>` files under `assets/`, attached to one global namespace. This is **not** an extension of an existing pattern: `assets/theme.js` — the only prior shared JS in this repo — is a self-executing IIFE that exposes nothing to `window`; there is no precedent namespace object to attach to. The design in this document is new.

The extraction has three distinct risk tiers, verified this session:

1. **Pure, closure-free helpers** (`svgEl`, `gcd`, `clamp`, `isPrime`, `primeFactors`, `smallestPrimeFactor`, `bigGcd`, `isPrimeBig`, `modPowPlain`, `modPowSmall`, `modInverse`, `euclidSteps`, `unitsMod`, `totient`, `randomBigIntBits`, `randomBigIntInRange`) — safe drop-in moves, signatures unchanged.
2. **Closure-coupled geometry helpers** (`polar`, `annularSectorPath`) — close over module-scoped `CX`/`CY` constants in both files that have them (Equivalence Wheel, Group Isomorphism); extraction **requires a signature change** (`cx`, `cy` become explicit parameters) and both call sites must be updated.
3. **A much larger duplication than the phase goal's helper list names**: `Venn Diagram/venn-diagram.html` (2,777 lines) contains two entire **ported subsystems** — a trimmed `euclidSteps`/`computeNestedLayout` copy of the Euclidean Algorithm tool's rectangle-tiling renderer, and an `isqrt`/`isPerfectSquare`/`fermatSplit`/`buildBalancedTree`/`assignTreeX`/`flattenTree` copy of Factor Tree's "Balanced mode" tree builder — each with its own explicit code comment stating it is "a deliberate per-file duplication... per CLAUDE.md's no-shared-JS-module rule," a rule that no longer exists. Whether Phase 7 unifies these composite render/layout functions (not just the leaf math helpers) is a real scope question the plan must decide explicitly — see Open Questions.

**Primary recommendation:** Build two sibling classic-script modules — `assets/math-core.js` (Number-domain: gcd/clamp/isPrime/primeFactors/euclidSteps/unitsMod/totient/modInverse/modPowSmall) and `assets/math-bigint.js` (BigInt-domain: bigGcd/isPrimeBig/modPowPlain/randomBigIntBits/randomBigIntInRange), plus `assets/svg-helpers.js` (svgEl, and a parameterized polar/annularSectorPath) — all attached to one global namespace object, e.g. `window.NT = { core:{...}, big:{...}, svg:{...} }`. Load them as **plain, non-deferred** `<script src>` tags placed at the end of `<body>`, immediately before each tool's own inline `<script>` block (not in `<head>`, not `defer`) — verified this session that several tools (Equivalence Wheel, Group Isomorphism, RSA, Cayley Table's initial wiring) call these helpers **synchronously at IIFE top level**, not gated behind `window.load`, so the modules must already be executed by the time the tool's own script runs.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Number-theory computation (gcd, primality, modpow, totient) | Browser / Client | — | Zero-backend static site; all computation is client-side JS, currently duplicated per-file |
| SVG diagram construction (`svgEl`, geometry helpers) | Browser / Client | — | Hand-drawn SVG via `document.createElementNS`, no charting library, no SSR |
| Cross-tool state sync (shared modulus/mode, shared a/b pair) | Browser / Client | — | `localStorage` + `document.cookie` dual-channel, same-origin `storage` events; no server round-trip |
| Theming (day/night) | Browser / Client | — | `assets/theme.js`, `localStorage`/cookie/URL-param, unaffected by this phase |
| Documentation of architecture | N/A (docs, not runtime) | — | `CLAUDE.md`, `.claude/CLAUDE.md` (generated mirror), `.planning/PROJECT.md`, `.planning/codebase/*.md` |

There is only one runtime tier in this project (static client-side browser code, no server). Phase 7 is entirely a Browser/Client-tier refactor plus a docs-tier rewrite; there is no tier-misassignment risk to check for.

## User Constraints (locked, from orchestrator-captured conversation — no CONTEXT.md exists for this phase)

### Locked Decisions
- Scope of "as if the rule never existed": rewrite CURRENT docs only (`CLAUDE.md`, `.claude/CLAUDE.md`, `.planning/PROJECT.md`, `.planning/codebase/*`). Do NOT edit archived `.planning/phases/*` or `.planning/quick/*` records, and do NOT rewrite git history. New docs describe shared modules as the normal architecture with no mention of a former "no shared JS modules" rule or of per-file duplication being a deliberate choice.
- Execution order: Phase 7 now, then Phase 4 (Continued Fractions tool), then Phase 6 (i18n) — shared-module layout should make those easy (Phase 6 will likely want a shared translation-dictionary module).
- Pages must keep working when opened directly via `file://` — ES module `import`/`type="module"` is blocked by CORS there, so modules must be classic `<script src>` files attaching to one global namespace (like `assets/theme.js` today, except `theme.js` itself attaches nothing to `window` — see Summary).

### Phase Requirements
No phase requirement IDs are assigned to Phase 7 (`Requirements: TBD` / `none (null)` in ROADMAP.md and orchestrator input). This phase is infrastructure/refactor work, not new user-facing functionality; REQUIREMENTS.md v1/v2 tables have no entries mapped to it. The planner should treat the phase's own **Success criteria** (verbatim below) as the acceptance bar instead of REQ-IDs:

> Every tool loads its shared modules and no longer defines local copies of extracted helpers; zero behavior regressions, verified per tool in a browser; local `/code-review` clean (user then runs `/code-review ultra`).

## Project Constraints (from CLAUDE.md)

- Vanilla HTML/CSS/JS only — no build tooling, no frameworks, no transpilation `[VERIFIED: /home/mainaccount/Claude/number-theory-browser-tools/CLAUDE.md:23]`.
- No ES `import`/`type="module"` — pages must keep running via direct `file://` navigation `[VERIFIED: CLAUDE.md]` (implicit in "runs by opening it directly in a browser," explicit in the locked decision above).
- One top-level directory per tool, one self-contained `.html` file; **shared modules under `assets/` are explicitly now permitted** for logic when "sharing is the better engineering call," not just for site chrome — this is the retired-rule state the phase operates under `[VERIFIED: CLAUDE.md:40]`.
- Only Google Fonts via `<link>` — no other CDN or third-party JS dependency `[VERIFIED: CLAUDE.md:33]`.
- "Duplication stays the default for a tool's own math helpers; reach for a shared module deliberately, and say so in the commit message" `[VERIFIED: CLAUDE.md:40]` — i.e. CLAUDE.md today still frames duplication as the default and shared modules as the deliberate exception; Phase 7 is the phase that flips this framing project-wide, and the doc rewrite (this phase's own deliverable) must update this exact sentence.

## Standard Stack

No new external packages. This phase adds two/three new same-origin, zero-dependency `.js` files under `assets/` (classic scripts, no build step) plus, per the orchestrator's requested verification strategy, a throwaway Node.js script (not shipped, not a project dependency) used only to diff old-vs-new helper outputs during development.

| Tool | Version | Purpose | Why |
|------|---------|---------|-----|
| Node.js | v22.23.1 `[VERIFIED: node --version, run this session]` | Run a comparison harness (extract old/new function bodies, run both over an input range, diff results) | Already installed on the dev machine; the harness is a dev-only script, never shipped or referenced by any `.html` file, so it doesn't violate the "no build tooling" constraint |

### Installation
None — no `npm install`, no `package.json`. The Node harness is a standalone `.js` file run directly with `node harness.js`.

## Package Legitimacy Audit

Not applicable. This phase installs zero external packages (no npm/pip/cargo dependency of any kind — even the verification harness uses only Node's built-in `vm`/`fs` modules). Skip this gate.

## Don't Hand-Roll

Not the traditional "use a library instead" sense — this project's constraint explicitly forbids external libraries. The applicable version of this principle: **don't re-duplicate what Phase 7 is extracting.** Once a helper lives in `assets/`, no tool may keep (or reintroduce) a local copy — that reintroduces the exact problem this phase fixes. The plan-checker / code-review pass for this phase should explicitly grep for reintroduced local `function isPrime(`, `function gcd(`, etc. after migration (see Verification Architecture).

## Full Duplication Inventory (verified this session)

Every entry below was read directly from source (`Read`/`grep -n`/`awk` extraction of the full function body), not inferred. File paths are relative to repo root.

### Tier 1 — Pure helpers, safe drop-in extraction

| Helper | Files (count) | Signature drift? | Semantic drift? |
|--------|---------------|-------------------|------------------|
| `svgEl(tag, attrs)` | Factor Tree, Square And Multiply, Fermats Method, Shors Algorithm, Elliptic Curve DH, Euclidean Algorithm, Diffie-Hellman KE (7, all reference a local `SVG_NS` const/var) + Venn Diagram, Equivalence Wheel, Group Isomorphism (3, hardcode `'http://www.w3.org/2000/svg'` inline) | None — all 10 bodies identical modulo `const`/`var`/`let` style and whether they reference a local `SVG_NS` constant vs. the literal string. `[VERIFIED: grep+awk, all 10 files, this session]` | None. `SVG_NS` literal is byte-identical everywhere it's declared. |
| `gcd(a, b)` | Cayley Table, Equivalence Wheel, Group Isomorphism (3, **no** `Math.abs`) vs. Chinese Remainder Theorem, Venn Diagram (2, **with** `Math.abs` on both args) | None (same 2-arg signature everywhere) | **Yes — this is the "abs/no-abs" drift the phase description calls out.** But verified call-site analysis (below) shows it is currently harmless: every call site in every file only ever passes non-negative integers. Standardizing on the abs()-including version is safe for 100% of current call sites and is strictly more defensive. |
| `clamp(v, lo, hi)` | Equivalence Wheel, Cayley Table, Group Isomorphism (`Math.max(lo, Math.min(hi, v))`) vs. Chinese Remainder Theorem (`Math.min(hi, Math.max(lo, v))`) | None | None — algebraically identical for `lo <= hi` (the only case ever used); pure style difference. |
| `isPrime(n)` | Venn Diagram (skips even divisors: `if (n%2===0) return n===2; for(i=3;...;i+=2)`) vs. Factor Tree (`for(p=2;...;p++)`, tests all integers) | None | None — same results, Venn's is an optimization (odd-only trial division), Factor Tree's is unoptimized but correct. Recommend the shared version use Venn's faster loop. |
| `primeFactors(n)` / `smallestPrimeFactor(v)` | Factor Tree (canonical, ES6 `const`/`let`) | — | Venn Diagram has a **renamed near-duplicate**: `factorize(n)` (same trial-division algorithm as `primeFactors`, ES5 `var` style) and `smallestFactorOf(v)` (same algorithm as `smallestPrimeFactor`, different name) inside its ported Balanced-Factor-Tree subsystem — see Tier 3. |
| `bigGcd(a,b)` | RSA, Diffie-Hellman KE | None | None — byte-identical bodies `[VERIFIED]`. |
| `isPrimeBig(n, rounds)` | RSA, Diffie-Hellman KE | None | None — byte-identical Miller-Rabin bodies `[VERIFIED]`. |
| `modPowPlain(base, exp, mod)` | RSA, Diffie-Hellman KE, Square And Multiply | None | None — byte-identical BigInt square-and-multiply bodies `[VERIFIED]` across all 3 files. |
| `randomBigIntBits(bits)` | RSA, Diffie-Hellman KE | None | None — byte-identical `[VERIFIED]`. |
| `randomBigIntInRange(min, max)` | RSA, Diffie-Hellman KE | None | None — byte-identical `[VERIFIED]`, depends on `randomBigIntBits`. |
| `modPowSmall(a, e, m)` | Shors Algorithm only (not duplicated, but it's the Number-domain twin of `modPowPlain`'s BigInt version — same algorithm, `Number` arithmetic) | — | — |
| `modInverse(M, m)` | Chinese Remainder Theorem only (Number-domain, extended-Euclid based) | — | — |
| `euclidSteps(a, b)` (full, with Bézout `s`/`t`) | Euclidean Algorithm (canonical — returns `{steps, gcd, s, t}`) | **Yes** | Trimmed variants exist in 2 other files, see next row. |
| `euclidSteps`/`euclidStepsFor` (trimmed, no Bézout) | Venn Diagram (`euclidSteps`, explicit comment: "Trimmed from the source's extended-Euclid recurrence") + Eulers Totient (`euclidStepsFor`, explicit comment: "Duplicated from Euclidean Algorithm's euclidSteps, with the Bezout coefficients dropped") | **Different return shape** (`{steps, gcd}` vs. Euclidean Algorithm's `{steps, gcd, s, t}`) | None on the shared portion — the forward-division recurrence (`q = Math.floor(r0/r1)`, etc.) is identical in all 3; the trimmed copies simply don't compute `s`/`t`. Since computing `s`/`t` is cheap (2 extra multiply-subtracts per step) and harmless to ignore, a single canonical `euclidSteps` that always returns `{steps, gcd, s, t}` can replace all 3, with trimmed callers just not reading `s`/`t`. |
| `unitsMod(N)` | Cayley Table, Equivalence Wheel, Group Isomorphism | None | None — byte-identical `[VERIFIED]`, all call the local `gcd`. |
| `totient(m)` | Group Isomorphism only (`return unitsMod(m).length`) | — | — |

### Tier 2 — Closure-coupled geometry helpers (signature change required)

| Helper | Files | Issue |
|--------|-------|-------|
| `polar(r, angleDeg)` | Equivalence Wheel, Group Isomorphism | **Not pure** — closes over module-scoped `CX`, `CY` constants (`return [CX + r*Math.cos(a), CY + r*Math.sin(a)]`). Group Isomorphism's own code comment says "copied from the Equivalence Wheel." `[VERIFIED: both files, this session]` |
| `annularSectorPath(rInner, rOuter, startDeg, endDeg)` | Equivalence Wheel, Group Isomorphism | Same issue — hardcodes `CX`/`CY` in its path-string arithmetic, and internally calls `polar()`. |

**To extract:** both functions must be refactored to accept `cx, cy` as explicit leading parameters (`polar(cx, cy, r, angleDeg)`), and every call site in both files updated to pass the tool's own `CX`/`CY`. This is a real signature-breaking change, not a drop-in move — flag as its own migration task per tool, not bundled with the Tier-1 mechanical moves.

### Tier 3 — Large ported subsystems inside Venn Diagram (scope decision needed)

`Venn Diagram/venn-diagram.html` (2,777 lines, by far the largest tool file) contains two **entire ported subsystems**, each with an explicit in-file comment naming the now-retired rule:

1. **Euclidean nested-squares miniature** (`euclidSteps`, `computeNestedLayout`) — "ported unchanged (apart from the TILE_CAP rename)" from Euclidean Algorithm's rectangle-tiling renderer, used to draw a live preview of `gcd(a,b)` inside Venn's hover panel. `computeNestedLayout` is a ~45-line recursive geometry-layout function, not a leaf math helper.
2. **Balanced Factor Tree miniature** (`isqrt`, `isPerfectSquare`, `fermatSplit`, `smallestFactorOf`, `buildBalancedTree`, `assignTreeX`, `flattenTree`) — ported from Factor Tree's "Balanced mode," ~90 lines, drawing a live preview factor tree inside the same hover panel. Comment: "Names are suffixed (Tree/FT_) only to avoid colliding with this page's own helpers."

Both are explicitly commented as deliberate duplication **"per CLAUDE.md's no-shared-JS-module rule for number-theory helpers"** — a rule that commit `d441342`/`15d63d6` already retired project-wide. These comments are now stale regardless of what Phase 7 decides to extract, and must be rewritten or removed as part of this phase.

**These are composite render/layout functions, not the leaf math primitives the phase goal names** (`svgEl, gcd, clamp, isPrime/isPrimeBig, modPowPlain/modPowSmall, bigGcd, modInverse, totient, primeFactors, etc.`). The "etc." is ambiguous on whether it reaches this far. See Open Questions — the plan must decide explicitly, because the effort and risk profile differ enormously (leaf-helper moves are mechanical; `computeNestedLayout`/`buildBalancedTree` unification means Euclidean Algorithm's and Factor Tree's own renderers must also be refactored to call the shared version, touching their primary (non-miniature) rendering paths, not just Venn's preview).

### Tier 4 — Secondary candidate: cross-tool shared-state persistence helpers (optional, not in the phase's named list)

`readSharedGroup`/`writeSharedGroup` (cookie+localStorage dual-channel read/write of a JSON payload under key `'group-params'`) are **byte-identical** between Cayley Table and Equivalence Wheel `[VERIFIED: both files, this session]`. Venn Diagram has an analogous but differently-keyed/differently-shaped pair, `readSharedAB`/`writeSharedAB` (key `'ab-params'`, payload `{a,b}`) plus a generic `readMigrating(key, legacyKey)` fallback-to-legacy-key reader. These three pairs share the identical cookie-then-localStorage read pattern and localStorage-then-cookie write pattern (mirroring — but not literally reusing — the 2-channel subset of `assets/theme.js`'s 3-channel persistence pattern). A generic `sharedStore.read(key, validator)` / `sharedStore.write(key, value)` pair in the shared module is a reasonable **optional** Phase 7 extension, since the key name and payload validator differ per use; not required to satisfy the phase's stated success criteria, which only names math/SVG helpers. Flag as Claude's-discretion scope, not required scope.

### Explicitly out of scope (verified, with rationale)

- **Per-`<head>` theme-detection inline script** (`(function(){function v(t){...}...})();`) — duplicated verbatim in every tool's `<head>`, confirmed via `grep` in Eulers Totient and Sieve `[VERIFIED]`. This is deliberately **not** a candidate: it must run synchronously before first paint to avoid a flash of the wrong theme, which an external (even non-deferred) `<script src>` cannot guarantee as reliably as an inline script co-located in `<head>` before any CSS `<link>`. Existing CLAUDE.md/codebase docs already describe this as an intentional inline duplication; no doc change needed here.
- **Site-header/nav markup** (~20 lines of HTML repeated per tool) — this is markup, not JS logic; already flagged as a known, unaddressed concern in `.planning/codebase/CONCERNS.md` with no fix path, and out of scope for a "shared **JS** module" phase.

## Architecture Patterns

### System Architecture Diagram

```text
                    ┌─────────────────────────────────────────┐
                    │         assets/ (loaded first,           │
                    │     plain <script src>, NOT deferred)    │
                    │                                            │
                    │  math-core.js    → window.NT.core.*       │
                    │  math-bigint.js  → window.NT.big.*        │
                    │  svg-helpers.js  → window.NT.svg.*         │
                    └───────────────────┬───────────────────────┘
                                        │ executes synchronously,
                                        │ populates window.NT
                                        ▼
        ┌───────────────────────────────────────────────────────┐
        │   Tool's own inline <script> (unchanged position:      │
        │   end of <body>, synchronous, non-deferred)             │
        │                                                          │
        │   IIFE top level:                                       │
        │     - reads localStorage/cookie/URL params               │
        │     - CALLS window.NT.core.gcd(...) etc. SYNCHRONOUSLY   │
        │       (verified: Equivalence Wheel/Group Isomorphism      │
        │        call render() -> gcd/unitsMod at IIFE bottom,      │
        │        not gated behind window.load)                     │
        │     - wires event listeners                              │
        │     - window.addEventListener('load', ...) runs the       │
        │       on-load example (fires AFTER deferred assets/       │
        │       theme.js, but tool's own top-level code already     │
        │       ran before that)                                    │
        └───────────────────────────────────────────────────────┘
                                        │
                                        ▼
                              SVG/DOM render via
                           window.NT.svg.svgEl(...)
```

Order in the document (top to bottom) that this implies for every tool file:
1. `<head>`: inline theme-detection script (unchanged) → `palette.css`, `site.css` → `<script defer src="../assets/theme.js">` (unchanged, still deferred — theme.js has no dependency on the math modules and vice versa, so its defer status is irrelevant to this phase).
2. Body markup (unchanged).
3. End of `<body>`, **before** the tool's own `<script>` block: new plain `<script src="../assets/math-core.js"></script>` (+ `math-bigint.js`/`svg-helpers.js` as needed per tool) — **no `defer`, no `async`**.
4. Tool's own existing inline `<script>` block — unchanged position, now references `window.NT.*` instead of local function declarations.

### Recommended Project Structure
```
assets/
├── palette.css        # existing
├── site.css            # existing
├── theme.js             # existing, unchanged
├── favicon.svg           # existing
├── math-core.js           # NEW — Number-domain: gcd, clamp, isPrime, primeFactors,
│                            smallestPrimeFactor, euclidSteps, unitsMod, totient,
│                            modInverse, modPowSmall
├── math-bigint.js          # NEW — BigInt-domain: bigGcd, isPrimeBig, modPowPlain,
│                            randomBigIntBits, randomBigIntInRange
└── svg-helpers.js            # NEW — svgEl, polar(cx,cy,r,angle), annularSectorPath(cx,cy,...)
```

Single global namespace (per the locked "one global namespace" decision), e.g.:
```js
window.NT = window.NT || {};
window.NT.core = { gcd, clamp, isPrime, primeFactors, smallestPrimeFactor, euclidSteps, unitsMod, totient, modInverse, modPowSmall };
```
Each file is its own IIFE writing into `window.NT.<subnamespace>`, so `math-core.js`/`math-bigint.js`/`svg-helpers.js` can be included independently per tool (a tool with no BigInt needs shouldn't be forced to load `math-bigint.js`).

### Pattern: Module Attachment (new to this repo — no existing precedent)
**What:** Classic IIFE script that attaches its exports to a namespaced global rather than executing standalone (contrast with `theme.js`, which is self-executing and exports nothing).
**When to use:** Every new shared-logic file this phase creates.
**Example (drop-in helper, Tier 1):**
```javascript
// assets/svg-helpers.js
(function(){
  "use strict";
  var SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs){
    var el = document.createElementNS(SVG_NS, tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  // Tier 2: signature now takes cx, cy explicitly — was previously closed over.
  function polar(cx, cy, r, angleDeg){
    var a = (angleDeg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }
  window.NT = window.NT || {};
  window.NT.svg = { svgEl: svgEl, polar: polar /*, annularSectorPath */ };
})();
```
Call-site migration example (Equivalence Wheel, Tier 2):
```javascript
// before: function polar(r, angleDeg){ ...uses module-scoped CX, CY... }
// after, at every call site:
var p1 = window.NT.svg.polar(CX, CY, rInner, startDeg);
```

### Anti-Patterns to Avoid
- **Re-declaring a local shadow of a namespaced helper:** e.g. `function gcd(a,b){...}` still present in a tool after migration silently shadows `window.NT.core.gcd` for any unqualified `gcd(...)` call in that file — the exact bug class Phase 7 exists to remove. Post-migration verification must `grep` each migrated tool for the old bare `function <name>(` declarations and fail the phase if any remain.
- **Loading the shared modules with `defer`:** would execute them *after* a tool's own synchronous top-level code that calls them (see Load Order finding above) — `ReferenceError: window.NT is not defined` at first paint for Equivalence Wheel, Group Isomorphism, and any tool whose IIFE calls a math helper outside a `window.load` listener.

## Common Pitfalls

### Pitfall 1: Name collision between a tool's own local variable and the namespace
**What goes wrong:** If any tool has an unrelated local variable or function literally named `NT` (the proposed namespace), attaching `window.NT` would silently work (globals and closures are distinct scopes) unless the tool also declares `var NT` at module scope, which would shadow `window.NT` inside that IIFE.
**Why it happens:** Classic scripts share the global object; a tool-local `var NT = ...` creates a same-named binding in that script's own scope that wins over the global for all unqualified `NT` references inside it.
**How to avoid:** `grep -rn "\bNT\b" */*.html` across all 15 tools before committing to the `NT` name; verified this session — `[VERIFIED: grep -rn "\bNT\b" */*.html . — zero hits other than the string "NT" not appearing as an identifier anywhere in the 15 tool files as of this research]`. Re-run this grep again immediately before implementation, since Phase 4 (Continued Fractions) may land new tool code between now and execution if run order slips.
**Warning signs:** A tool silently computing wrong results only for one specific tool — check that tool's top-of-file `var`/`const` declarations for a collision first.

### Pitfall 2: Shadowing risk in Venn Diagram's Tier-3 ported code specifically
**What goes wrong:** Venn Diagram's own comment states its ported `buildBalancedTree()` "calls THIS page's own `isPrime()`... rather than porting a second copy" — i.e. the ported subsystem is **already partially wired to Venn's own local helpers**, not fully self-contained. If Phase 7 migrates Venn's own top-level `isPrime`/`gcd` to `window.NT.core.*` but leaves the Tier-3 ported block's internal calls unchanged, those internal calls (`isPrime(v)` inside `buildBalancedTree`) must also be repointed to `window.NT.core.isPrime`, or updated consistently — a partial migration here is the single highest-risk spot in the whole phase given the file's size (2,777 lines) and density of cross-references.
**How to avoid:** Migrate Venn Diagram last (after the harness has validated the shared module against every other tool) and diff its pre/post behavior most thoroughly of all 15 tools.

### Pitfall 3: Load-order regression from defer
**What goes wrong:** Placing the new `<script src="../assets/math-core.js">` in `<head>` with `defer` (mirroring `theme.js`'s existing pattern) breaks any tool whose inline `<script>` at the end of `<body>` calls a shared helper synchronously at IIFE top level — verified this session for Equivalence Wheel (`syncTabs(); render();` at the very bottom of its IIFE, calling `unitsMod`→`gcd`, `svgEl` synchronously) and Group Isomorphism (`var mParam = readMParam();` at top level, calling into validation that touches `pairFor`). `window.NT` would be `undefined` at that point if the module script is deferred, because deferred scripts execute only after the whole document (including the tool's own synchronous inline script) has been parsed.
**How to avoid:** Non-deferred `<script src>`, placed immediately before the tool's own `<script>` tag, as specified above. Confirmed by `[VERIFIED: Equivalence Wheel/equivalence-wheel.html end of file, this session — "syncTabs(); render(); })();" with no window.load gate]`.

### Pitfall 4: `gcd` abs()-drift looks scarier than it is, but must still be standardized
**What goes wrong:** Assuming the abs/no-abs drift is a live bug needing case-by-case per-call-site handling.
**Why it happens:** The phase description explicitly calls out "abs/no-abs" as a drift category to "reconcile... per call site," implying per-site logic might be needed.
**How to avoid:** Verified this session — every call site of `gcd` across all 5 files that define it passes only non-negative values (loop counters `0..N-1` against a positive modulus in Cayley Table/Equivalence Wheel/Group Isomorphism; validated positive moduli in Chinese Remainder Theorem; non-negative counts/products in Venn Diagram). The Euclidean Algorithm tool — which has no standalone `gcd` function at all — explicitly **rejects negative input at the validation layer** ("Both a and b must be zero or positive — negative numbers have no defined GCD here"), so it was never a `gcd()`-abs candidate in the first place. **Recommendation: standardize on the `Math.abs`-including version for all 5 files; this changes behavior for none of them.** No per-call-site logic needed — this was flagged by the orchestrator as a risk to investigate, and investigation resolved it in one direction cleanly.

## Code Examples

### Verified: byte-identical `modPowPlain` across 3 files (safe drop-in target)
```javascript
// Source: RSA/rsa.html:378, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html:399,
// Square And Multiply/square-and-multiply.html:288 — all three bodies are byte-identical.
function modPowPlain(base, exp, mod){
  let result = 1n; base %= mod; if(base<0n) base += mod;
  while(exp > 0n){ if(exp & 1n) result = (result*base) % mod; exp >>= 1n; base = (base*base) % mod; }
  return result;
}
```

### Verified: the 2-variant `gcd` drift, resolved
```javascript
// Chinese Remainder Theorem/chinese-remainder-theorem.html:406 and
// Venn Diagram/venn-diagram.html:589 (canonical — defensive, safe for every call site found this session):
function gcd(a, b){
  a = Math.abs(a); b = Math.abs(b);
  while (b){ var t = a % b; a = b; b = t; }
  return a;
}
// Cayley Table/cayley-table.html:342, Equivalence Wheel/equivalence-wheel.html:581,
// Group Isomorphism/group-isomorphism.html:407 (no abs — verified every call site in these
// 3 files only ever passes non-negative args, so switching them to the abs() version above
// is a no-op for their current behavior):
function gcd(a, b){ while (b){ var t = a % b; a = b; b = t; } return a; }
```

## Runtime State Inventory

This is not a rename/refactor-of-identifiers phase in the Runtime State Inventory sense (no database keys, no OS-registered task names, no secrets are being renamed). It is a code-location refactor. The closest analog — localStorage/cookie key names used by the tools being touched — are **unaffected**: this phase moves function *definitions*, not the `localStorage`/cookie key strings the tools read/write (`'equivalence-wheel'`, `'group-params'`, `'ab-params'`, `'group-isomorphism'`, etc. all stay exactly as they are). Confirmed no key-name string appears inside any of the functions being extracted — the persistence keys live in each tool's own state/persist functions, untouched by this phase.

- **Stored data:** None affected — no localStorage/cookie key changes. `[VERIFIED: grep for the migrated function names shows none of them read/write a persistence key]`
- **Live service config:** N/A — no external services.
- **OS-registered state:** N/A.
- **Secrets/env vars:** N/A — no secrets in this project.
- **Build artifacts:** N/A — no build step exists to go stale.

## Doc Rewrite Locations (verified this session — exact lines, plus the mirror mechanism)

### The `.claude/CLAUDE.md` mirror mechanism (answers the orchestrator's specific question)
`.claude/CLAUDE.md` is a **GSD-generated mirror**, assembled from `.planning/codebase/*.md` sources via HTML-comment section markers:
```
<!-- GSD:project-start source:PROJECT.md -->       ... <!-- GSD:project-end -->
<!-- GSD:stack-start source:codebase/STACK.md -->  ... <!-- GSD:stack-end -->
<!-- GSD:conventions-start source:CONVENTIONS.md --> ... <!-- GSD:conventions-end -->
<!-- GSD:architecture-start source:ARCHITECTURE.md --> ... <!-- GSD:architecture-end -->
<!-- GSD:skills-start source:skills/ -->            ... <!-- GSD:skills-end -->
<!-- GSD:workflow-start source:GSD defaults -->     ... <!-- GSD:workflow-end -->
<!-- GSD:profile-start -->                          ... <!-- GSD:profile-end -->
```
`[VERIFIED: .claude/CLAUDE.md:1-374, section markers read directly this session]`. Commit `fc5d1c0` ("resync .claude/CLAUDE.md generated mirror lines") confirms the correct workflow: **edit the source `.planning/codebase/*.md` file, then hand-sync (or run `/gsd-docs-update` to regenerate) the corresponding mirrored section in `.claude/CLAUDE.md` byte-for-byte** — editing `.claude/CLAUDE.md` directly without also editing its source is what the retired-rule incident (commits `d441342`→`15d63d6`→`fc5d1c0`) had to clean up after. **The plan must edit both halves of every mirrored pair, in the same task**, and should NOT rely solely on running `/gsd-docs-update` unverified — confirm its output matches intent before committing, since `/gsd-docs-update` regeneration is exactly the mechanism that could silently revert a hand-edit if the source doc wasn't also updated (per commit `fc5d1c0`'s own stated purpose).

### Every location mentioning duplication / no-shared-modules / self-contained-single-file rationale
All found via `grep -n "duplicat\|self-contained\|single-file\|no shared\|shared JS\|shared module"` across `CLAUDE.md`, `.claude/CLAUDE.md`, and `.planning/codebase/*.md` this session:

| File | Line(s) | Current text (needs rewrite) |
|------|---------|-------------------------------|
| `CLAUDE.md` | 40 | "Number-theory helper functions... are duplicated per-file today — a deliberate choice... Duplication stays the default for a tool's own math helpers; reach for a shared module deliberately..." — must flip to describe shared modules as the normal architecture for these specific helpers, since after Phase 7 they no longer are duplicated. |
| `CLAUDE.md` | 23 | "Every tool follows the same self-contained single-file structure — no external JS/CSS files..." — factually false even before Phase 7 (palette.css/site.css/theme.js already exist); should be corrected to describe the `assets/` shared-file model generally. `[Note: this line predates Phase 7 and may be considered a pre-existing doc staleness issue, not created by this phase, but Phase 7's explicit "rewrite current docs" mandate is the natural place to fix it since the new math/svg files compound the same inaccuracy.]` |
| `.planning/codebase/CONVENTIONS.md` | 80 | "Math utility functions (primeFactors, isPrime, modPow) are duplicated per-file by default..." — this is the `.claude/CLAUDE.md` mirror's source line 136; rewrite both together. |
| `.planning/codebase/CONVENTIONS.md` | 255 | "**SVG Helper (duplicated per-file):**" heading followed by the `svgEl` code sample — rewrite heading and framing; the code sample itself stays valid (it becomes the shared module's implementation). |
| `.planning/codebase/ARCHITECTURE.md` | 64 | "Self-contained, single-file HTML tools — no build system, no package manager, no external JS dependencies" — same pre-existing staleness as CLAUDE.md:23. |
| `.planning/codebase/ARCHITECTURE.md` | 229-231 | "Dependency isolation" bullet — this is the `.claude/CLAUDE.md` mirror's source line 307; rewrite both together. |
| `.planning/codebase/ARCHITECTURE.md` | 237-250 | **"### Architectural Smell: Copy-Paste Math Functions"** anti-pattern section — describes the now-fixed problem as an ongoing "historical default... not a hard rule" with a 4-step manual-sync workaround ("grep for the same function in other tools... port the fix to all instances"). This entire anti-pattern section should be removed or rewritten to describe the shared-module fix as the actual resolution, not a still-open workaround. |
| `.planning/codebase/STRUCTURE.md` | 194-200 | **Not found by the orchestrator's survey** — a "New Math Function (Shared Across Multiple Tools)" subsection that explicitly instructs future contributors: "Do NOT create a separate JS file (breaks single-file philosophy per CLAUDE.md)... Use identical implementation (copy-paste is intentional)." This directly contradicts Phase 7's outcome and must be rewritten to point at the new `assets/math-core.js`/etc. files. |
| `.planning/codebase/CONCERNS.md` | 11-25 | **Not found by the orchestrator's survey** — "Breaking the single-file-per-tool pattern" and "HTML header/nav boilerplate repeated" sections. This file is dated `last_mapped_at: 2026-09-23`, predates the palette-unification phase, and references a stale 5-tool-only codebase state (mentions "Congruence Wheel," the tool since renamed "Equivalence Wheel"). Recommend flagging this file as needing a fuller re-map (likely via `/gsd-map-codebase`) rather than a line-level patch — it is generally stale, not just on the duplication point. This is a larger finding than Phase 7's stated scope; note it as an Open Question for the planner rather than assuming Phase 7 should absorb a full codebase re-map. |

### In-code comments that reference the retired rule (not "docs" in the strict sense, but will go stale/wrong once Phase 7 lands)
- `Venn Diagram/venn-diagram.html` — two multi-line comments (at the `euclidSteps`/`computeNestedLayout` section and the `isqrt`/`fermatSplit`/`buildBalancedTree` section) explicitly citing "per CLAUDE.md's no-shared-JS-module rule for number-theory helpers." These become either moot (deleted along with the code, if Tier 3 is extracted) or factually wrong (if Tier 3 is left as-is, since the rule they cite no longer exists) — either way, Phase 7's plan must address them, not leave them as dangling references to a rule that no longer exists in CLAUDE.md.

## Name-Collision / Shadowing Risk Summary

1. **`window.NT` as a global:** verified zero pre-existing uses of the bare identifier `NT` in any tool file this session. Low risk, but re-verify immediately before implementation (see Pitfall 1).
2. **Local shadow left behind after migration:** the single highest-probability real bug in this phase — a tool still declaring `function gcd(a,b){...}` locally after also loading `window.NT.core.gcd` doesn't error (both exist, no collision at parse time), it just silently keeps using the **old local copy** for every unqualified call, making the migration a no-op for that file while looking complete. This is **not a load-order crash**, so it will not surface as an obvious browser error — it must be caught by an explicit post-migration grep (`grep -n "^function gcd(\|  function gcd("` should return **zero** hits in every migrated tool file) as a mechanical verification step, not by manual browser spot-checks alone.
3. **Venn Diagram's internal cross-references** (Pitfall 2 above) — the highest-risk single file given its ported subsystems already call Venn's own top-level helpers by bare name.
4. **`polar`/`annularSectorPath` in Equivalence Wheel and Group Isomorphism** — after the Tier-2 signature change, any missed call site (one not updated to pass `CX, CY` explicitly) throws `ReferenceError: polar is not defined` immediately at render time (a loud, easy-to-catch failure, unlike #2 above) if the local `function polar` is fully removed; but if the local `function polar(r, angleDeg)` is accidentally left in place alongside the loading of `window.NT.svg.polar`, bare `polar(...)` calls silently keep using the tool's own working local closure-based version forever — same silent-shadow risk as #2, specific to these two files.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None exists — `.planning/codebase/TESTING.md` confirms "Single-file HTML tools designed for manual browser testing... no build system, package manager, or CI/CD pipeline" `[VERIFIED: .planning/codebase/TESTING.md:13]` |
| Config file | none — Wave 0 |
| Quick run command | `node .planning/phases/07-shared-js-module-refactor/harness.js` (proposed, dev-only, not committed as a project dependency) |
| Full suite command | Same harness (whole-range comparison) + manual per-tool browser pass (below) |

### Phase Requirements → Test Map
No phase REQ-IDs exist (see User Constraints), so this maps against the phase's own **Success criteria** instead:

| Behavior | Test Type | Automated Command | File Exists? |
|----------|-----------|-------------------|--------------|
| Extracted helper produces identical output to the old per-file copy, across a representative input range | unit (Node harness) | `node harness.js` | ❌ Wave 0 — must be written |
| No tool retains a local shadow of a migrated helper | static check | `grep -rn "function gcd(\|function svgEl(\|function isPrime(..." */*.html` (per-helper, per-tool) | ❌ Wave 0 — a small shell/Node script, not a "test file" in the traditional sense |
| Every tool still loads and its primary interaction still works in-browser | manual (no automated DOM test framework exists in this project) | N/A — open `file://.../tool.html`, exercise preset chips + the on-load example | Manual, per tool |

### Sampling Rate
- **Per task (per-tool migration commit):** run the Node harness for the helpers that tool uses, plus the shadow-declaration grep for that file, plus a manual browser open of that one tool (preset chips, on-load example, any playback controls).
- **Per wave merge:** re-run the harness across ALL migrated tools' helper usages combined; re-run the shadow grep across the whole repo.
- **Phase gate:** full manual browser pass of all 15 tools (see per-tool checklist below) before `/gsd-verify-work`; `/code-review` clean; user then runs `/code-review ultra` per the phase's stated success criteria.

### Wave 0 Gaps — build before migrating any tool
- [ ] `harness.js` (or similarly named dev script, e.g. under `.planning/phases/07-shared-js-module-refactor/`) — for each Tier-1 helper: `require`/`eval` the **old** per-file function body (extracted verbatim, e.g. via a small string-extraction step or by literally pasting the verified bodies captured in this research doc) and the **new** shared-module function, run both over a representative input range per helper (e.g. `gcd`: all pairs in `[-50, 50] x [-50, 50]` plus `(0,0)`; `isPrime`: `0..10000`; `modPowPlain`/`bigGcd`/`isPrimeBig`: a handful of known RSA-scale BigInt triples; `euclidSteps`: confirm the trimmed variants' `{steps, gcd}` subset matches the full variant's), and assert deep-equality. Since Node's `BigInt` and `Math`/trial-division are identical to a browser's V8, this harness gives a very high-confidence pre-browser check with no DOM dependency.
- [ ] Per-tool shadow-declaration grep script — one command, run after each tool's migration, asserting zero remaining local declarations of any now-shared helper name in that file.
- [ ] Per-tool browser verification checklist (concrete, not generic — enumerated below).

### Per-tool browser verification checklist (concrete steps, no test framework)
For **every** migrated tool, open the file directly via `file://`, then:
1. Confirm no console error on load (DevTools console, specifically watch for `ReferenceError` naming any migrated helper or `window.NT`).
2. Click every preset/example chip the tool has; confirm output matches what it produced before migration (screenshot-diff or numeric-value spot-check against the pre-migration commit).
3. Reload the page fresh (clears any transient state) and confirm the `window.addEventListener('load', ...)` on-load example still renders correctly.
4. For tools with playback controls (Euclidean Algorithm, Eulers Totient, Sieve, Fermat's Method, Square and Multiply, RSA, DH, ECDH): exercise play/pause/step/instant-finish once.
5. For tools with cross-tool links/shared state (Equivalence Wheel ⇄ Cayley Table, Euclidean Algorithm ⇄ Venn Diagram, Eulers Totient ⇄ Equivalence Wheel): open both linked tools in two tabs, change one, confirm the `storage` event still propagates (only relevant if Tier 4 is in scope; otherwise just confirm the link/query-param handoff still works, since that logic is untouched either way).
6. Venn Diagram specifically (Tier 3, highest risk): hover a region chip to open the preview panel, confirm both the Euclidean-nested-squares section and the Balanced-Factor-Tree section render, scroll between them, and follow both "double-click to open the full view" links through to Euclidean Algorithm and Factor Tree to confirm the linked value round-trips correctly.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Modern browser (Chrome/Firefox/Safari/Edge) | Manual per-tool verification | `[ASSUMED]` present on dev machine (not probed this session — no browser automation tool was available in this research session) | — | None needed — this is the project's only runtime target |
| Node.js | Dev-only comparison harness | ✓ `[VERIFIED: node --version]` | v22.23.1 | If unavailable, fall back to manual side-by-side console evaluation in two browser tabs (old tool vs. a scratch HTML page with the new module) — slower, still viable |

No missing dependencies block this phase.

## Security Domain

`security_enforcement` is enabled in `.planning/config.json` (absent key treated as enabled — here it's explicitly `true`), so this section is required, but scope is minimal: this is a pure client-side, zero-network (beyond Google Fonts), zero-auth, zero-user-data refactor of already-shipped math functions. No new attack surface is introduced by moving function definitions between files.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | No auth in this project |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | No access control boundaries |
| V5 Input Validation | No change from this phase | Existing per-tool `parseInt`/regex/range validation is untouched — Phase 7 moves the *computation* functions, not the *validation* functions, and the two are distinct in every tool examined |
| V6 Cryptography | No change from this phase | RSA/DH/ECDH tools' `isPrimeBig`/`modPowPlain`/`randomBigIntBits` are pedagogical (explicitly not constant-time, use `Math.random()` not a CSPRNG) — this was already true before Phase 7 and is an existing, out-of-scope-for-this-phase characteristic; moving these functions verbatim into a shared file does not change their (non-)cryptographic-safety properties one way or the other |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| None newly introduced | — | This phase's only "surface" change is adding 2-3 same-origin, zero-network `.js` files loaded via relative path (`../assets/*.js`), identical trust model to the existing `theme.js`/`site.css` includes |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|-----------------|
| A1 | A modern browser is present on the dev machine for the manual verification pass | Environment Availability | Low — this is a near-certainty for any active web dev workstation; not independently probed this session since no browser-automation tool was invoked during research |
| A2 | `/gsd-docs-update` (if used to regenerate `.claude/CLAUDE.md`) correctly pulls from the edited `.planning/codebase/*.md` sources without needing manual line-by-line resync, the way commit `fc5d1c0` did by hand | Doc Rewrite Locations | Medium — if the regeneration tool has its own staleness or doesn't cover every one of the 7 marked sections, a hand-verify-and-resync pass (as `fc5d1c0` did) is still required; the plan should verify the regenerated output against the edited source files rather than trust it blindly |
| A3 | `.planning/codebase/CONCERNS.md` is stale enough (predates palette unification, references a renamed tool) that a full re-map is warranted rather than a targeted patch | Doc Rewrite Locations | Low — worst case, the plan patches only the duplication-related lines in CONCERNS.md and leaves the rest of its staleness for a separate future pass; doesn't block Phase 7's own success criteria either way |

## Open Questions

1. **Does Phase 7's scope include Venn Diagram's Tier-3 ported subsystems (`computeNestedLayout`, `buildBalancedTree` and friends), or only the leaf math/SVG helpers the phase goal names explicitly?**
   - What we know: the phase goal text names only leaf helpers (`svgEl, gcd, clamp, isPrime/isPrimeBig, modPowPlain/modPowSmall, bigGcd, modInverse, totient, primeFactors, etc.`). Venn Diagram's two largest duplicated blocks are composite render/layout functions ported from Euclidean Algorithm's and Factor Tree's own primary renderers, not simple leaf math.
   - What's unclear: whether unifying them (which would also require refactoring Euclidean Algorithm's and Factor Tree's own primary render paths to call the shared version, not just Venn's preview) is in scope, or whether Venn's local `euclidSteps`/`computeNestedLayout`/`buildBalancedTree`/etc. should simply have their stale "per CLAUDE.md's no-shared-JS-module rule" comments rewritten/removed while the code itself stays duplicated (a documentation-only fix for this specific spot).
   - Recommendation: given no CONTEXT.md exists to have settled this, the planner should treat this as a scope checkpoint — propose the smaller, safer option (leaf-helper extraction only; fix Venn's stale comments in place without unifying the composite renderers) as the default plan, and surface the larger option as an explicitly optional stretch wave, since it roughly doubles the phase's blast radius (touching Euclidean Algorithm's and Factor Tree's primary render code, not just their leaf helpers) for a benefit (one more instance of the "Euclidean tiling" and "balanced factor tree" renderers becoming shared) that isn't named in the phase's stated success criteria.

2. **Is the Tier-4 cross-tool shared-state persistence duplication (`readSharedGroup`/`writeSharedGroup`, `readSharedAB`/`writeSharedAB`, `readMigrating`) in scope?**
   - What we know: byte-identical between Cayley Table and Equivalence Wheel; a reasonable generalization exists (parameterized key+validator).
   - What's unclear: the phase's named helper list doesn't include persistence helpers at all.
   - Recommendation: treat as Claude's-discretion / optional-if-time-permits, not required for the phase's stated success criteria ("every tool loads its shared modules and no longer defines local copies of extracted helpers" — extracted here refers to the helpers named in the goal).

3. **Should `.planning/codebase/CONCERNS.md` be fully re-mapped (its `last_mapped_at: 2026-09-23` predates 3+ shipped phases) as part of this phase's doc-rewrite pass, or just patched at the duplication-specific lines?**
   - Recommendation: patch only the duplication-related lines (11-25) as part of Phase 7; leave a note for a future `/gsd-map-codebase` full re-map rather than scope-creeping Phase 7 into a general docs refresh.

## Sources

### Primary (HIGH confidence — direct `Read`/`grep`/`awk` of repo source this session)
- `/home/mainaccount/Claude/number-theory-browser-tools/CLAUDE.md` — full read
- `/home/mainaccount/Claude/number-theory-browser-tools/.claude/CLAUDE.md` — full read, section markers identified
- `/home/mainaccount/Claude/number-theory-browser-tools/.planning/PROJECT.md`, `REQUIREMENTS.md`, `STATE.md`, `ROADMAP.md` (Phase 7 section), `config.json` — full/targeted reads
- `/home/mainaccount/Claude/number-theory-browser-tools/.planning/codebase/{CONVENTIONS,ARCHITECTURE,CONCERNS,STRUCTURE,STACK,TESTING,INTEGRATIONS}.md` — grepped and targeted-read
- All 15 tool `.html` files + `index.html` + `assets/theme.js` — targeted `grep -n`/`awk` extraction of every named helper's full body, plus full read of `assets/theme.js` and large excerpts of `Venn Diagram/venn-diagram.html`, `Equivalence Wheel/equivalence-wheel.html`, `Group Isomorphism/group-isomorphism.html`
- `git log`/`git show` on commits `fc5d1c0`, `d441342`, `15d63d6`, `4e8ab54`, `ebc3637` (the prior quick-task that retired the no-shared-JS-modules rule) — confirms the doc-mirror mechanism and prior precedent for how source-vs-mirror edits must be paired
- `node --version` — confirmed Node v22.23.1 available for the proposed harness

### Secondary / Tertiary
None used — no web search or external documentation lookup was needed; this phase's domain is entirely this repo's own existing source code and its own prior git history.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no external packages; Node availability directly verified.
- Duplication inventory (Tiers 1-4): HIGH — every body was read/extracted from source this session, not inferred from the phase description.
- Load-order/defer risk: HIGH — directly verified against actual tool code (Equivalence Wheel's synchronous `render()` call, Group Isomorphism's synchronous `readMParam()` call) rather than assumed from theme.js's pattern.
- Doc rewrite locations: HIGH for the locations explicitly grepped this session; MEDIUM for the completeness of the `.claude/CLAUDE.md` regeneration mechanism's exact trigger conditions (the mirror clearly exists and is source-tagged, but the regeneration tool's own internals were not inspected — only its observed effect via commit history).
- Venn Diagram Tier-3 scope question: this is a genuine open decision, not a confidence gap — flagged as Open Question #1 rather than resolved unilaterally, since no CONTEXT.md exists to have settled it and the phase goal text is genuinely ambiguous on this point.

**Research date:** 2026-09-30
**Valid until:** Effectively indefinite for the duplication inventory itself (it's a snapshot of static files that won't drift unless another phase touches these tools first — the phase description explicitly warns "do not run concurrently with Phase 4/6 tool edits"). Re-verify the inventory if Phase 4 or Phase 6 lands before Phase 7 executes, since new tool code or edited existing tools could change the duplication picture.
