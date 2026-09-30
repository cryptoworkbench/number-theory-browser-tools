---
phase: 07-shared-js-module-refactor
plan: 07
subsystem: infra
tags: [shared-js-module, vanilla-js, classic-script, parity-testing, headless-chrome, venn-diagram, layout-algorithm]

# Dependency graph
requires:
  - phase: 07-shared-js-module-refactor (plan 01)
    provides: "assets/nt-core.js, the NT namespace/include/import conventions, and the three verification engines (harness.js, shadow-check.js, browser-diff.js)"
  - phase: 07-shared-js-module-refactor (plan 02)
    provides: "assets/nt-svg.js (SVG_NS, svgEl, polar, annularSectorPath, easeInOutCubic)"
  - phase: 07-shared-js-module-refactor (plan 03)
    provides: "assets/nt-store.js (SHARED_AB_KEY, readABParams(rejectZeroPair), readMigrating, readSharedAB, writeSharedAB)"
  - phase: 07-shared-js-module-refactor (plan 06)
    provides: "assets/nt-layout.js (TILE_CAP, computeNestedLayout, BALANCED_MAX_N, buildFactorTree, assignTreeX, flattenTree), parity-proven against Venn's own still-local copies ahead of this plan"
provides:
  - "Venn Diagram migrated onto NT.core + NT.svg + NT.store + NT.layout with zero browser-observable behavior change"
  - "Venn's hover-preview nested-squares and balanced-tree miniatures now drawn by the exact same NT.layout functions the full Euclidean Algorithm and Factor Tree tools draw from -- the Open-Question-1 unification the phase locked"
  - "browser-diff/venn-diagram.json -- differential coverage of both modes, hover previews (scroll between stacked sections), deep links, and legacy-key/shared-pair migration"
affects: [07-08, 07-09]

actuals:
  tokens: 4836
  tasks: 2
  commits: 2
  plan_head_before: 7113339a3c9caaa40a46c287f39cd7af67f15f9c
  plan_head_after: 0c0a7b0919d6536f843cff2d7c56bcef873a4eb7

tech-stack:
  added: []
  patterns:
    - "Venn Diagram was migrated last and in two passes (leaf helpers/persistence, then the Tier-3 ported layout subsystems), per 07-RESEARCH Pitfall 2, so each pass is verified by the full differential before the next touches the same 2,777-line file"
    - "The browser-diff config for Venn authors a --stability proof on BASE before any edit lands, per the plan's own explicit gate -- this is the first plan in the phase where the BASE stability check and the migration edit are separated by an entire config-authoring step rather than immediately preceding the edit"

key-files:
  created:
    - .planning/phases/07-shared-js-module-refactor/browser-diff/venn-diagram.json
  modified:
    - Venn Diagram/venn-diagram.html

key-decisions:
  - "readABParams() is still called with no argument at Venn's load handler -- NT.store.readABParams(rejectZeroPair) defaults rejectZeroPair to falsy, so the (0,0) pair is still accepted exactly as Venn's own pre-migration reader did (the Euclidean Algorithm tool passes true at its own call site to reject it, per plan 07-06)"
  - "Both Tier-3 header comments (citing the retired 'CLAUDE.md no-shared-JS-module rule') were replaced with two short section markers stating what NT.layout draws and why a preview always matches the page its double-click opens, rather than being deleted outright -- the surrounding code still benefits from a one-line orientation comment, per Task 2's action text"
  - "The nested-squares/balanced-tree Tier-3 block was left in place (unmigrated) through Task 1 by design, so shadow-check's SHADOW/RETIRED-NAME/STALE-COMMENT findings after Task 1 are the expected, temporary state the acceptance criteria list by name -- not a partial migration bug"

requirements-completed: [SC-1, SC-2, SC-3, SC-4, SC-5]

coverage:
  - id: D1
    description: "Venn's two/three-circle modes, prime placement (arm+click, drag, token removal), randomize, clear, thumbnail on/off toggle, product lines, and cross-link hrefs render identically to the pre-phase page across every exercised interaction"
    requirement: "SC-4"
    verification:
      - kind: e2e
        ref: "browser-diff.js Venn Diagram/venn-diagram.html (authored config, --stability on BASE then OLD-vs-NEW; snaps=30, errors=0)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Venn's hover preview draws its Euclidean nested-squares miniature from NT.layout.computeNestedLayout and its balanced factor-tree miniature from NT.layout.buildFactorTree({ balanced: true }) -- the same code the full tools draw from -- with both preview sections (including the scroll-between-sections interaction) rendering identically to before"
    requirement: "SC-3, SC-4"
    verification:
      - kind: e2e
        ref: "browser-diff.js Venn Diagram/venn-diagram.html hover/scroll steps (hover-overlap-chip, hover-overlap-chip-scrolled, hover-ab-chip-scrolled, hover-abc-centre-chip)"
        status: pass
      - kind: other
        ref: "grep -c 'buildFactorTree(opts.value, { balanced: true })' = 1; grep -c 'computeNestedLayout(run.steps)' = 1"
        status: pass
    human_judgment: false
  - id: D3
    description: "Venn reads ?a/?b deep links (accepting the 0,0 pair), the shared a/b setting, and its legacy storage keys through NT.store exactly as before, including copy-forward migration from the pre-rename legacy keys"
    requirement: "SC-1, SC-2, SC-4"
    verification:
      - kind: e2e
        ref: "browser-diff.js Venn Diagram/venn-diagram.html query runs (?a=12&b=18, ?a=0&b=0, ?a=89&b=55, ?mode=three) and preStorage runs (shared ab-params, legacy venn-diagrams/venn-diagrams-mode keys, thumbnails-off)"
        status: pass
    human_judgment: false
  - id: D4
    description: "Venn factorizes with NT.core.primeFactors(n, FACTOR_LIMIT) at every former factorize() call site, preserving the trial-division cap on URL-supplied values"
    requirement: "SC-1, SC-3"
    verification:
      - kind: other
        ref: "grep -c 'FACTOR_LIMIT)' = 4 (drawTreeSection caption, intersectionLine, fillFromNumbers x2)"
        status: pass
      - kind: e2e
        ref: "browser-diff.js Venn Diagram/venn-diagram.html query-a10000600009-b6-factorlimit"
        status: pass
    human_judgment: false
  - id: D5
    description: "The Venn source defines no local copy or retired alias of any shared helper and no longer carries comments describing its subsystems as ported copies kept in step under a CLAUDE.md rule"
    requirement: "SC-2, SC-5"
    verification:
      - kind: other
        ref: "shadow-check.js Venn Diagram/venn-diagram.html (SHADOW-CHECK PASS, zero findings) and shadow-check.js --all (all 15 tools PASS, exit 0)"
        status: pass
    human_judgment: false

duration: ~35min
completed: 2026-09-30
status: complete
---

# Phase 7 Plan 7: Shared JS Module Refactor Summary

**Venn Diagram (2,777 lines, the phase's largest and last file) fully migrated onto NT.core + NT.svg + NT.store + NT.layout in two verified passes, with both hover-preview miniatures now drawn by the exact NT.layout code the full Euclidean Algorithm and Factor Tree tools use.**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-09-30
- **Completed:** 2026-09-30
- **Tasks:** 2 (Task 1: leaf helpers/SVG/persistence; Task 2: Tier-3 layout unification)
- **Files modified:** 2 (1 tool page, 1 new browser-diff config)

## Accomplishments

- Venn Diagram now loads `nt-core.js` + `nt-svg.js` + `nt-store.js` + `nt-layout.js` (canonical order, contiguous, immediately before its inline script) and imports `euclidSteps, gcd, isPrime, primeFactors` from `NT.core`, `svgEl` from `NT.svg`, `SHARED_AB_KEY, readABParams, readMigrating, readSharedAB, writeSharedAB` from `NT.store`, and `BALANCED_MAX_N, assignTreeX, buildFactorTree, computeNestedLayout, flattenTree` from `NT.layout`
- Local `isPrime`, `gcd`, `factorize`, `readMigrating`, `SHARED_AB_KEY`, `readSharedAB`, `writeSharedAB`, `readABParams`, `svgEl`, `euclidSteps`, `NEST_TILE_CAP`, `computeNestedLayout`, `FT_MAX_N`, `FT_MAX_ITER`, `isqrt`, `isPerfectSquare`, `fermatSplit`, `smallestFactorOf`, `buildBalancedTree`, `assignTreeX`, `flattenTree` — all 20 symbols — are deleted
- Every former `factorize(x)` call site (tree-preview caption, GCD factor tail, and both `fillFromNumbers` sites) now calls `primeFactors(x, FACTOR_LIMIT)`, preserving the trial-division cap on URL-supplied values
- Venn's hover-preview Euclidean nested-squares miniature now comes from `NT.layout.computeNestedLayout(euclidSteps(a, b).steps)` and its balanced factor-tree miniature from `NT.layout.buildFactorTree(value, { balanced: true })` — the same functions the full Euclidean Algorithm and Factor Tree tools draw from, closing the drift risk the phase's Open Question 1 identified
- Both retired Tier-3 header comments (citing the now-removed "CLAUDE.md no-shared-JS-module rule") replaced with short section markers describing what NT.layout draws and why a preview always matches its target page — no "ported"/"copy"/"duplicate"/CLAUDE.md wording remains
- `browser-diff/venn-diagram.json` authored: two-circle run (placement, token removal, hover + scroll on the stacked preview, thumbnails on/off, randomize x2, clear), three-circle run (mode switch, pairwise + centre-chip hover/scroll, randomize x2, clear, mode switch back), five query-param runs (including a FACTOR_LIMIT-exercising large value and `?mode=three`), and three preStorage runs (shared ab-params, legacy region/mode keys, thumbnails-off) — 30 total snapshots
- Both migrated-page passes proven byte-identical to BASE in real headless Chrome (`--stability` on BASE recorded before any edit, then OLD-vs-NEW after each task), with zero console errors
- `shadow-check.js --all` now exits 0 across all 15 tools — Venn Diagram was the last tool with any remaining shared-helper duplication in the repo

## Task Commits

Each task was committed atomically:

1. **Task 1: leaf helpers, SVG and persistence onto NT.core + NT.svg + NT.store** - `ad2bf0a` (feat)
2. **Task 2: nested-squares and balanced-tree previews onto NT.layout** - `0c0a7b0` (feat)

## Files Created/Modified

- `Venn Diagram/venn-diagram.html` — nt-core.js + nt-svg.js + nt-store.js + nt-layout.js includes; import block; 20 local symbols removed; 4 `factorize` call sites repointed to `primeFactors(x, FACTOR_LIMIT)`; both Tier-3 ported-subsystem blocks now call `NT.layout.computeNestedLayout`/`NT.layout.buildFactorTree`; both retired header comments rewritten
- `.planning/phases/07-shared-js-module-refactor/browser-diff/venn-diagram.json` — authored interaction config (30 snapshots across 9 runs)

## Decisions Made

See `key-decisions` in the frontmatter. Worth calling out in prose:

1. **`readABParams()` keeps its zero-argument call site.** `NT.store.readABParams(rejectZeroPair)` defaults `rejectZeroPair` to falsy when omitted, so Venn's `var abParams = readABParams();` call still accepts the `(0, 0)` pair exactly as its pre-migration local reader did — verified via the `?a=0&b=0` browser-diff query run.
2. **Task 1 deliberately left the Tier-3 block (nested-squares/balanced-tree) untouched.** This is why `shadow-check.js` reported SHADOW findings for `isqrt`/`isPerfectSquare`/`fermatSplit`/`euclidSteps`/`computeNestedLayout`/`assignTreeX`/`flattenTree` and RETIRED-NAME findings for `smallestFactorOf`/`buildBalancedTree`/`FT_MAX_N`/`FT_MAX_ITER`/`NEST_TILE_CAP` after Task 1 — exactly the finding set the plan's own acceptance criteria named in advance, confirming this was the intended intermediate state (07-RESEARCH Pitfall 2), not a partial-migration bug.

## Deviations from Plan

None - plan executed exactly as written. Every acceptance criterion passed on the first implementation attempt (browser-diff snapshot counts, shadow-check finding sets, and grep literal counts all matched without requiring a fix-and-retry cycle).

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All 15 tools in the repo now load shared modules with zero remaining local duplication (`shadow-check.js --all` PASS across every tool) — Venn Diagram was the last holdout.
- The Open-Question-1 decision (unify Venn's preview miniatures with the full tools' own layout code, not just fix stale comments) is fully realized: `NT.layout.computeNestedLayout` and `NT.layout.buildFactorTree` are now each called from exactly three places in the repo (Euclidean Algorithm, Factor Tree, and Venn Diagram's two preview sections), so a future change to either layout algorithm can never drift between a full tool and its Venn preview again.
- Ready for 07-08 (the docs-rewrite plan) and 07-09 (real-browser Claude-in-Chrome pass, including the export-path verification plan 07-05 deferred) per 07-VALIDATION.md's Per-Task Verification Map.

## Self-Check: PASSED

- `Venn Diagram/venn-diagram.html` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/browser-diff/venn-diagram.json` exists: FOUND
- Commit `ad2bf0a` in git log: FOUND
- Commit `0c0a7b0` in git log: FOUND
- `node .planning/phases/07-shared-js-module-refactor/browser-diff.js "Venn Diagram/venn-diagram.html" --stability` (BASE, run before any edit): IDENTICAL snaps=30 errors=0
- `node .planning/phases/07-shared-js-module-refactor/browser-diff.js "Venn Diagram/venn-diagram.html"` (OLD-vs-NEW, after Task 1): IDENTICAL snaps=30 errors=0
- `node .planning/phases/07-shared-js-module-refactor/browser-diff.js "Venn Diagram/venn-diagram.html"` (OLD-vs-NEW, after Task 2): IDENTICAL snaps=30 errors=0
- `node .planning/phases/07-shared-js-module-refactor/shadow-check.js "Venn Diagram/venn-diagram.html"` (after Task 1): SHADOW/RETIRED-NAME/STALE-COMMENT findings exactly matching the Tier-3 identifiers named in the acceptance criteria, exit 1 (expected intermediate state)
- `node .planning/phases/07-shared-js-module-refactor/shadow-check.js "Venn Diagram/venn-diagram.html"` (after Task 2): SHADOW-CHECK PASS, exit 0
- `node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all`: all 15 tools PASS, exit 0
- No orphaned headless Chrome / browser-diff.js processes after any run (`pgrep -af "headless=new"` and `pgrep -af "browser-diff.js"` both returned empty each check)

---
*Phase: 07-shared-js-module-refactor*
*Completed: 2026-09-30*
