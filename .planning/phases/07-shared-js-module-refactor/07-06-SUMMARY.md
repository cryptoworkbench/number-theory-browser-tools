---
phase: 07-shared-js-module-refactor
plan: 06
subsystem: infra
tags: [shared-js-module, vanilla-js, classic-script, parity-testing, headless-chrome, tdd, layout-algorithm, factor-tree, euclidean-algorithm]

# Dependency graph
requires:
  - phase: 07-shared-js-module-refactor (plan 01)
    provides: "assets/nt-core.js, the NT namespace/include/import conventions, and the three verification engines (harness.js, shadow-check.js, browser-diff.js)"
  - phase: 07-shared-js-module-refactor (plan 02)
    provides: "assets/nt-svg.js (SVG_NS, svgEl, polar, annularSectorPath, easeInOutCubic)"
  - phase: 07-shared-js-module-refactor (plan 03)
    provides: "assets/nt-store.js (SHARED_AB_KEY, readABParams(rejectZeroPair), readSharedAB, writeSharedAB)"
provides:
  - "assets/nt-layout.js — NT.layout, a frozen 6-member shared module (TILE_CAP, computeNestedLayout, BALANCED_MAX_N, buildFactorTree, assignTreeX, flattenTree) with a load-time NT.core dependency guard"
  - "Euclidean Algorithm migrated onto NT.core + NT.svg + NT.store + NT.layout with zero browser-observable behavior change"
  - "Factor Tree migrated onto NT.core + NT.svg + NT.layout, unifying its Classic and Balanced tree builders into one shared implementation"
  - "NT.layout parity-proven against Venn Diagram's still-unmigrated copies (Venn migrates in the next plan, 07-07), so that migration can point at already-proven code"
affects: [07-07, 07-08, 07-09]

actuals:
  tokens: 10341
  tasks: 3
  commits: 4
  plan_head_before: 2cbddf67a65f0dcc722ffd76b262a3217fab8769
  plan_head_after: ed6aef339a488fada00e135bf0587292d3086122

tech-stack:
  added: []
  patterns:
    - "NT.layout is the one shared module with a load-time dependency on another shared module (NT.core) -- it throws a descriptive Error at load if included before nt-core.js, enforced by a direct-vm RED-phase-style test in checks/layout.check.js that loads nt-layout.js's source alone in a fresh vm context with no NT.core global and asserts the throw"
    - "computeNestedLayout(steps, tileCap) and buildFactorTree(v, { balanced, maxIter }) both take their per-tool-varying knob (tile cap, balance mode, iteration cap) as an explicit parameter instead of closing over a module-scoped constant the way every predecessor did -- this is what let one shared implementation replace three independently-tuned copies without losing any of their behavior"
    - "The Balanced tree's fermatSplit-null fallback (smallest-prime-factor split) was Venn Diagram's own defensive guard, unreachable by Factor Tree's own callers at the default 2,000,000 iteration cap -- proven reachable and correct only against Venn's copy at maxIter=3, per the plan's own scoping (Factor Tree's un-migrated buildTree has no such guard and would throw if tested the same way)"

key-files:
  created:
    - assets/nt-layout.js
    - .planning/phases/07-shared-js-module-refactor/checks/layout.check.js
    - .planning/phases/07-shared-js-module-refactor/browser-diff/euclidean-algorithm.json
    - .planning/phases/07-shared-js-module-refactor/browser-diff/factor-tree.json
  modified:
    - Euclidean Algorithm/euclidean-algorithm.html
    - Factor Tree/factor-tree.html

key-decisions:
  - "TDD RED phase used a real RED-phase stub file (assets/nt-layout.js with the NT.core guard intact but NT.layout frozen empty) rather than an absent file, matching the precedent set by plan 07-02's NT.svg RED phase -- this makes the key-set assertion the clean, isolated first failure (exit 1, 'expected [...6 names...] got []') instead of an uncaught TypeError from accessing Object.keys(undefined)"
  - "checks/layout.check.js's balanced-mode maxIter=3 fallback-path test compares only against Venn Diagram's builder, never Factor Tree's -- Factor Tree's own buildTree has no defensive branch when fermatSplit returns null and would throw, exactly as the plan specified"
  - "Euclidean Algorithm's browser-diff config forces the 500,000-chip (which exercises TILE_CAP) through both geometric views (Step and Nested) before toggling Extended Euclidean mode, so the tile-cap collapse renders identically to BASE in both views, not just the default one"
  - "Factor Tree's browser-diff config uses generous fixed waits (2-9 seconds per interaction, scaled to each tested value's expected tree depth) rather than a shorter uniform wait -- the staggered depth-by-depth reveal runs on setTimeout under Chrome's --virtual-time-budget, which advances deterministically regardless of wait length, so being generous costs only budget headroom (raised to 180000ms) and never introduces flakiness"

requirements-completed: [SC-1, SC-2, SC-3, SC-4]

coverage:
  - id: D1
    description: "assets/nt-layout.js ships a frozen NT.layout with all 6 planned exports, parity-proven against the Euclidean Algorithm's, Factor Tree's and Venn Diagram's pre-phase implementations, including the explicit tile-cap and maxIter parameters and the fermatSplit-null fallback path (RED-GREEN TDD cycle)"
    requirement: "SC-3"
    verification:
      - kind: unit
        ref: "harness.js layout (checks/layout.check.js, 56749 assertions)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Euclidean Algorithm runs on NT.core + NT.svg + NT.store + NT.layout, byte-identical to BASE in headless Chrome across every exercised interaction (all seven chips, both geometric views around the tile-cap chip, Extended Euclidean toggle, four custom a/b pairs including the clamp case, a play/step/instant sequence, five deep-link query shapes, and a preStorage shared-a/b seed)"
    requirement: "SC-1, SC-2, SC-4"
    verification:
      - kind: e2e
        ref: "browser-diff.js Euclidean Algorithm/euclidean-algorithm.html (authored config, --stability, OLD-vs-NEW; snaps=24, errors=0)"
        status: pass
      - kind: other
        ref: "shadow-check.js Euclidean Algorithm/euclidean-algorithm.html"
        status: pass
    human_judgment: false
  - id: D3
    description: "Factor Tree's Classic and Balanced trees both come from the shared NT.layout.buildFactorTree builder, byte-identical to BASE in headless Chrome across every Classic and Balanced chip, both ceiling edge cases (Balanced 1,000,000/1,000,001; Classic 1,000,000,000,000/1,000,000,000,001), invalid inputs, and four deep-link query shapes"
    requirement: "SC-1, SC-2, SC-4"
    verification:
      - kind: e2e
        ref: "browser-diff.js Factor Tree/factor-tree.html (authored config, --stability, OLD-vs-NEW; snaps=29, errors=0)"
        status: pass
      - kind: other
        ref: "shadow-check.js Factor Tree/factor-tree.html and Euclidean Algorithm/euclidean-algorithm.html"
        status: pass
    human_judgment: false

duration: ~50min
completed: 2026-09-30
status: complete
---

# Phase 7 Plan 6: Shared JS Module Refactor Summary

**NT.layout (6-export frozen shared module for the Euclidean nested-squares layout and the Classic/Balanced recursive factor tree, 56,749 assertions) shipped and proven end-to-end on the Euclidean Algorithm and Factor Tree tools, with parity also proven against Venn Diagram's still-unmigrated copies so plan 07-07 can point Venn at already-proven code.**

## Performance

- **Duration:** ~50 min
- **Completed:** 2026-09-30
- **Tasks:** 3 (Task 1 TDD: NT.layout; Task 2: Euclidean Algorithm migration; Task 3: Factor Tree migration)
- **Files modified:** 6 (2 tool pages, 1 new shared module, 1 new check file, 2 new browser-diff configs)

## Accomplishments

- `assets/nt-layout.js` ships as the repo's fifth shared JS logic module: a frozen `window.NT.layout` with `TILE_CAP`, `computeNestedLayout(steps, tileCap)`, `BALANCED_MAX_N`, `buildFactorTree(v, { balanced, maxIter })`, `assignTreeX`, `flattenTree` — the one module with a load-time dependency (throws a descriptive `Error` when `assets/nt-core.js` was not loaded first), proven against every pre-phase predecessor including Venn Diagram's not-yet-migrated copies (`checks/layout.check.js`, 56,749 assertions)
- Euclidean Algorithm migrated onto `NT.core` + `NT.svg` + `NT.store` + `NT.layout`: local `euclidSteps`, `SHARED_AB_KEY`, `readSharedAB`, `writeSharedAB`, `readABParams`, `SVG_NS`, `svgEl`, `TILE_CAP` and `computeNestedLayout` all deleted; `readABParams(true)` now rejects the (0, 0) pair as before
- Factor Tree migrated onto `NT.core` + `NT.svg` + `NT.layout`: local `primeFactors`, `smallestPrimeFactor`, `isPrime`, `isqrt`, `isPerfectSquare`, `fermatSplit`, `buildTree`, `assignX`, `flatten`, `SVG_NS`, `MAX_BALANCED_N` and `FERMAT_MAX_ITER` all deleted — the Classic and Balanced tree builders, which used to be one local recursive function gated on a module-scoped `mode` variable, are now both `NT.layout.buildFactorTree(n, { balanced: mode === 'balanced' })`
- Both migrated pages proven byte-identical to their pre-phase (BASE) selves in real headless Chrome across every exercised interaction, with zero console errors
- The balanced-tree size ceiling (1,000,000) and the nested-squares tile cap (40) now each exist in exactly one place, `assets/nt-layout.js`

## Task Commits

Each task was committed atomically (Task 1 carries TDD's test → feat commits):

1. **Task 1 (RED): failing parity checks for NT.layout** - `8eaadaa` (test)
2. **Task 1 (GREEN): complete NT.layout, parity proven** - `2b459ee` (feat)
3. **Task 2: migrate Euclidean Algorithm onto NT.core + NT.svg + NT.store + NT.layout** - `80fe69a` (feat)
4. **Task 3: migrate Factor Tree onto NT.core + NT.svg + NT.layout** - `ed6aef3` (feat)

_TDD gate compliance (Task 1, tdd="true"):_ RED commit `8eaadaa` intentionally failed on the first assertion (`layout key-set: expected [...6 names...] got []`, exit 1) against a stub `NT.layout = Object.freeze({})` (with the real NT.core load guard already in place) before any implementation existed. GREEN commit `2b459ee` made it pass (56,749 assertions, exit 0). No REFACTOR commit was needed — the GREEN implementation required no cleanup pass. This project's custom dev-only `harness.js` (introduced in plan 07-01) prints its own `HARNESS FAIL`/`HARNESS PASS` format rather than TAP/Surefire output, so `gsd_run check tdd-red-evidence` (which parses those specific formats) was not run against it — consistent with plans 07-01 through 07-03's precedent in this same phase. Both RED and GREEN results are recorded verbatim above as the evidence.

## Files Created/Modified

- `assets/nt-layout.js` — NT.layout: TILE_CAP, computeNestedLayout, BALANCED_MAX_N, buildFactorTree, assignTreeX, flattenTree
- `.planning/phases/07-shared-js-module-refactor/checks/layout.check.js` — parity checks for all 6 NT.layout exports against Euclidean Algorithm, Factor Tree and Venn Diagram (56,749 assertions), including the load-time guard, literal-constant parity, the tile-cap parameter, and the fermatSplit-null fallback at maxIter=3
- `Euclidean Algorithm/euclidean-algorithm.html` — nt-core.js + nt-svg.js + nt-store.js + nt-layout.js includes; import block; local euclidSteps/SHARED_AB_KEY/readSharedAB/writeSharedAB/readABParams/SVG_NS/svgEl/TILE_CAP/computeNestedLayout removed
- `Factor Tree/factor-tree.html` — nt-core.js + nt-svg.js + nt-layout.js includes; import block; local primeFactors/smallestPrimeFactor/isPrime/isqrt/isPerfectSquare/fermatSplit/buildTree/assignX/flatten/SVG_NS/MAX_BALANCED_N/FERMAT_MAX_ITER removed
- `.planning/phases/07-shared-js-module-refactor/browser-diff/euclidean-algorithm.json` — authored interaction config (24 snapshots across 7 runs)
- `.planning/phases/07-shared-js-module-refactor/browser-diff/factor-tree.json` — authored interaction config (29 snapshots across 5 runs)

## Decisions Made

See `key-decisions` in the frontmatter. The two worth calling out in prose:

1. **RED-phase stub matches plan 07-02's precedent, not an absent file.** For the TDD gate, `assets/nt-layout.js` was authored as a real (if minimal) file during RED — the NT.core load guard present, `NT.layout` frozen to `{}` — rather than simply not existing yet. This makes `checks/layout.check.js`'s key-set assertion the clean, isolated first failure, since `harness.js`'s `loadNew()` silently skips a module file that doesn't exist at all (which would have left `NT.layout` `undefined` and crashed the check with an uncaught `TypeError` on `Object.keys(undefined)` rather than a clean assertion failure).
2. **Factor Tree's browser-diff config uses per-value wait tuning, not a uniform short wait.** The staggered depth-by-depth reveal (`setTimeout`-driven, `perDelay` scaled inversely to tree depth) needs different settle times for a shallow tree (e.g. `n=2`, ~1.2s) versus the deepest cases exercised (`n=1000000` Balanced, `n=1000000000000` Classic, both ~24 levels deep, ~7-9s to fully settle). Since Chrome's `--virtual-time-budget` advances `setTimeout` timers deterministically rather than racing real wall-clock time, generous per-step waits (2-9s, `budgetMs` raised to 180000) cost only virtual-time headroom and introduce no flakiness — confirmed by a clean `--stability` pass before any migration edit.

## Deviations from Plan

None — plan executed exactly as written. Every acceptance criterion passed on the first implementation attempt (harness assertion counts, grep literal counts, shadow-check, and browser-diff all green without requiring a fix-and-retry cycle).

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `assets/nt-layout.js` is proven and ready for plan 07-07's Venn Diagram migration — the plan's own parity checks already prove NT.layout's `computeNestedLayout` and `buildFactorTree` (including the balanced fallback path) match Venn's still-local copies exactly, so that migration is a drop-in replacement rather than new risk.
- The pattern of taking a per-tool-varying knob (tile cap, balance mode, max iterations) as an explicit function parameter instead of a closed-over module constant is now established and ready to extend to any future consumer (Phase 4's continued-fraction tiling was named in the plan as a future beneficiary).
- Ready for 07-07 per 07-VALIDATION.md's Per-Task Verification Map.

## Self-Check: PASSED

- `assets/nt-layout.js` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/checks/layout.check.js` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/browser-diff/euclidean-algorithm.json` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/browser-diff/factor-tree.json` exists: FOUND
- Commit `8eaadaa` in git log: FOUND
- Commit `2b459ee` in git log: FOUND
- Commit `80fe69a` in git log: FOUND
- Commit `ed6aef3` in git log: FOUND
- `node harness.js` (all checks): HARNESS PASS bigint: 75039, core: 2712692, layout: 56749, store: 302, svg: 11108, total=2855890, exit 0
- `shadow-check.js` on Euclidean Algorithm and Factor Tree: both SHADOW-CHECK PASS, exit 0
- `browser-diff.js` on Euclidean Algorithm and Factor Tree (`--stability` then OLD-vs-NEW): both IDENTICAL, errors=0 (EA snaps=24, Factor Tree snaps=29)
- No orphaned headless Chrome processes after any run (`pgrep -af "headless=new"` returned empty each check)

---
*Phase: 07-shared-js-module-refactor*
*Completed: 2026-09-30*
