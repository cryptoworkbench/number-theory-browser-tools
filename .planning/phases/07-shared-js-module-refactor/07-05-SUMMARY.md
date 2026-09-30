---
phase: 07-shared-js-module-refactor
plan: 05
subsystem: infra
tags: [shared-js-module, vanilla-js, classic-script, parity-testing, headless-chrome, svg, persistence]

# Dependency graph
requires:
  - phase: 07-shared-js-module-refactor (plan 01)
    provides: "assets/nt-core.js, the NT namespace/include/import conventions, and the three verification engines (harness.js, shadow-check.js, browser-diff.js)"
  - phase: 07-shared-js-module-refactor (plan 02)
    provides: "assets/nt-svg.js — NT.svg (5-export frozen SVG module) with centre-parameterized polar/annularSectorPath, proven on Fermat's Method/Shor's Algorithm/ECDH"
  - phase: 07-shared-js-module-refactor (plan 03)
    provides: "assets/nt-store.js — NT.store (11-export frozen persistence module), proven on Cayley Table"
provides:
  - "Equivalence Wheel and Group Isomorphism migrated onto NT.core + NT.svg (+ NT.store for Equivalence Wheel) with zero browser-observable behavior change"
  - "The two remaining CX/CY-closure-coupled wheel tools now call the centre-explicit polar/annularSectorPath signature every other tool already uses"
  - "The Cayley Table <-> Equivalence Wheel shared group-params setting is implemented by one shared function set on both sides"
affects: [07-06, 07-07, 07-08, 07-09]

actuals:
  tokens: 3943
  tasks: 2
  commits: 2
  plan_head_before: 5df73ec34158136e1f9de1a9c5c849f800bc7816
  plan_head_after: 94435f0ad3742e810ee43dd5547a8b471a04215f

tech-stack:
  added: []
  patterns:
    - "Import-set correction via shadow-check feedback: the plan's literal import list for Group Isomorphism named `gcd` alongside `clamp, randomInt, totient, unitsMod`, but after deleting the local gcd/unitsMod/totient trio, nothing in the page calls gcd directly anymore (unitsMod's shared NT.core body owns its own internal gcd) -- shadow-check's UNUSED-IMPORT gate caught this immediately and the import was trimmed, matching the plan's own instruction that 'exact sets [are] decided by shadow-check'"
    - "browser-diff export-button steps are unsafe in --stability mode: clicking a Blob+URL.createObjectURL()+anchor.click() download button hung headless Chrome indefinitely (a chrome process observed at 280s+ wall time against a 30s --virtual-time-budget), confirming plan 07-01/07-02's anti-flake precedent extends to download machinery, not just play/animate timing -- the step was dropped per the plan's own explicit fallback instruction and the export-path verification deferred to the Claude-in-Chrome pass in plan 07-09"

key-files:
  modified:
    - Equivalence Wheel/equivalence-wheel.html
    - Group Isomorphism/group-isomorphism.html
  created:
    - .planning/phases/07-shared-js-module-refactor/browser-diff/equivalence-wheel.json
    - .planning/phases/07-shared-js-module-refactor/browser-diff/group-isomorphism.json

key-decisions:
  - "Dropped the #export-svg browser-diff step for Equivalence Wheel after it hung headless Chrome's download machinery during the mandatory pre-migration --stability proof on BASE (a chrome process ran 280+ seconds against a 30-second --virtual-time-budget with no exit) -- this is a dev-tooling limitation of headless Chrome's download handling, not a migration risk, and the plan explicitly authorized this fallback with the export path's verification deferred to plan 07-09's Claude-in-Chrome pass"
  - "Removed gcd from Group Isomorphism's NT.core import block (the plan's literal text listed it) after shadow-check's UNUSED-IMPORT gate flagged it as dead: unitsMod is now imported directly from NT.core rather than recomputed locally via a local gcd call, so gcd itself has zero call sites left in the page"

requirements-completed: [SC-1, SC-2, SC-3, SC-4, SC-5]

coverage:
  - id: D1
    description: "The Equivalence Wheel draws every wedge, label, selection and modular-addition highlight at the same coordinates as before in both Additive and Multiplicative modes, now through NT.svg.polar/annularSectorPath called with the page's own CX, CY, and reads/writes the shared 'group-params' setting through NT.store"
    requirement: "SC-1, SC-3, SC-4"
    verification:
      - kind: e2e
        ref: "browser-diff.js Equivalence Wheel/equivalence-wheel.html (authored config, --stability IDENTICAL on BASE, OLD-vs-NEW IDENTICAL; snaps=26, errors=0)"
        status: pass
      - kind: other
        ref: "shadow-check.js Equivalence Wheel/equivalence-wheel.html"
        status: pass
    human_judgment: false
  - id: D2
    description: "Group Isomorphism draws both wheels, every isomorphic pair, and both layouts identically to before at its own centre (260, 260), with its source no longer labeling its geometry helpers as copied from another tool"
    requirement: "SC-1, SC-3, SC-4, SC-5"
    verification:
      - kind: e2e
        ref: "browser-diff.js Group Isomorphism/group-isomorphism.html (authored config, --stability IDENTICAL on BASE, OLD-vs-NEW IDENTICAL; snaps=17, errors=0)"
        status: pass
      - kind: other
        ref: "shadow-check.js Group Isomorphism/group-isomorphism.html (no STALE-COMMENT/RETIRED-NAME finding)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Neither page declares a local copy of a shared helper any more, and the full harness.js regression suite (all four modules) still passes after both migrations"
    requirement: "SC-2"
    verification:
      - kind: other
        ref: "shadow-check.js on both pages (SHADOW/RETIRED-NAME/IMPORT-* gates)"
        status: pass
      - kind: unit
        ref: "harness.js (all checks: bigint, core, store, svg) -- 2,799,141 assertions"
        status: pass
    human_judgment: false

duration: 50min
completed: 2026-09-30
status: complete
---

# Phase 7 Plan 5: Shared JS Module Refactor Summary

**Equivalence Wheel and Group Isomorphism -- the two highest-risk wheel tools for synchronous first-render load order and centre-parameterized geometry -- migrated onto NT.core + NT.svg (+ NT.store for Equivalence Wheel), reconciling the last CX/CY-closure-coupled polar/annularSectorPath call sites in the repo to the shared centre-explicit signature.**

## Performance

- **Duration:** ~50 min
- **Started:** 2026-09-30 (session continuation from plan 07-04)
- **Completed:** 2026-09-30T20:49:18Z
- **Tasks:** 2 (Task 1: Equivalence Wheel; Task 2: Group Isomorphism)
- **Files modified:** 4 (2 tool pages, 2 new browser-diff configs)

## Accomplishments

- Equivalence Wheel migrated onto `NT.core` (`clamp`, `randomInt`, `unitsMod`), `NT.svg` (`annularSectorPath`, `polar`, `svgEl`), and `NT.store` (`SHARED_GROUP_KEY`, `readModeNParams`, `readSharedGroup`, `writeSharedGroup`) -- every `polar`/`annularSectorPath` call site now passes the page's own `CX, CY` explicitly (4 `polar(CX, CY, ...)` call sites, 1 `annularSectorPath(CX, CY, ...)` call site), and the shared group-type/modulus setting it exchanges with Cayley Table now runs through the exact same `NT.store` implementation Cayley Table migrated onto in plan 07-03
- Group Isomorphism migrated onto `NT.core` (`clamp`, `randomInt`, `totient`, `unitsMod`) and `NT.svg` (`annularSectorPath`, `polar`, `svgEl`) -- its local `gcd`/`unitsMod`/`totient` trio, geometry helpers, and `randomInt` all deleted; `multOrder`, `primitiveRoot`, `isoPairs`, `imageOf`, `powerList`, `discreteLog`, `rawPowSafe` (the tool's own group-isomorphism-specific math) stay page-local as the plan specified
- Both pages proven byte-identical to their pre-phase (BASE) selves in real headless Chrome across every exercised interaction: mode/layout tab switches, a modulus sweep (1, 2, 12, 13, 60) in both Equivalence Wheel modes, depth-range changes, wedge clicks on both wheels exercising the modular-sum highlight and `selectK`'s two entry paths, randomize draws, and out-of-range/invalid deep-link query params (`?mode=bad&n=5`, `?m=8` non-cyclic, `?m=abc`) -- zero console errors in either page
- Group Isomorphism's `/* ---------- geometry helpers (copied from the Equivalence Wheel) ---------- */` section-header comment is gone; the source no longer describes its own geometry as a copy of another tool's
- Full `harness.js` regression suite (all four shared modules: bigint, core, store, svg) still passes with 2,799,141 assertions after both migrations, confirming no cross-module regression

## Task Commits

Each task was committed atomically:

1. **Task 1: migrate Equivalence Wheel onto NT.core + NT.svg + NT.store** - `a09e429` (feat)
2. **Task 2: migrate Group Isomorphism onto NT.core + NT.svg** - `94435f0` (feat)

## Files Created/Modified

- `Equivalence Wheel/equivalence-wheel.html` -- nt-core.js + nt-svg.js + nt-store.js includes; 3-namespace import block; deleted local `SHARED_GROUP_KEY`, `readSharedGroup`, `writeSharedGroup`, `polar`, `svgEl`, `annularSectorPath`, `clamp`, `gcd`, `unitsMod`, `readModeNParams`, `randomInt` plus their descriptive comment blocks
- `Group Isomorphism/group-isomorphism.html` -- nt-core.js + nt-svg.js includes; 2-namespace import block; deleted local `gcd`, `unitsMod`, `totient`, `polar`, `svgEl`, `annularSectorPath`, `clamp`, `randomInt` plus the "copied from the Equivalence Wheel" comment header
- `.planning/phases/07-shared-js-module-refactor/browser-diff/equivalence-wheel.json` -- authored interaction config (26 snapshots across 5 runs: mode/N/depth sweep, wedge selection + sum highlight, randomize x2, plus 3 query-param runs and 1 preStorage run)
- `.planning/phases/07-shared-js-module-refactor/browser-diff/group-isomorphism.json` -- authored interaction config (17 snapshots across 5 runs: layout tabs, 6-value pair-select sweep spanning small-to-large m, both-wheel wedge selection, randomize x2, plus 4 query-param runs)

## Decisions Made

See `key-decisions` in the frontmatter. In prose:

1. **Export-button step dropped from browser-diff's --stability proof.** The plan's Task 1 action explicitly named `#export-svg` as a step to include "if headless Chrome download handling makes the run unstable in --stability, drop the export step and record that it moves to the Claude-in-Chrome pass in plan 07-09." That fallback was exercised: the first `--stability` run on BASE hung indefinitely (a `google-chrome` process observed running 280+ seconds against the config's 30-second `--virtual-time-budget`, with no exit). This is Blob+`URL.createObjectURL()`+anchor-click download machinery that headless Chrome does not resolve deterministically without additional CDP download-behavior configuration outside this dev tool's scope -- not a migration regression. The step was removed and the export path's OLD-vs-NEW equivalence is deferred to plan 07-09's real-browser (Claude-in-Chrome) pass, per the plan's own instruction.
2. **`gcd` trimmed from Group Isomorphism's NT.core import.** The plan's literal action text listed `const { clamp, gcd, randomInt, totient, unitsMod } = NT.core;`, but after deleting the local `gcd`/`unitsMod`/`totient` trio (whose only local caller of `gcd` was the now-deleted local `unitsMod`), shadow-check's `UNUSED-IMPORT` gate correctly flagged `gcd` as dead -- nothing in the page calls it directly, since `unitsMod` now comes fully formed from `NT.core` (which owns its own internal `gcd`). Removed per the plan's own parenthetical "(exact sets decided by shadow-check)."

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Trimmed an unused `gcd` import flagged by shadow-check**
- **Found during:** Task 2 (Group Isomorphism migration, first shadow-check run)
- **Issue:** The plan's literal import-block text included `gcd` in the `NT.core` destructure, but after removing the local `gcd`/`unitsMod`/`totient` definitions, `gcd` had zero remaining call sites in the page (its only caller was the now-deleted local `unitsMod`). shadow-check's `UNUSED-IMPORT` gate failed the file for this reason.
- **Fix:** Removed `gcd` from the import block, leaving `const { clamp, randomInt, totient, unitsMod } = NT.core;`.
- **Files modified:** `Group Isomorphism/group-isomorphism.html`
- **Verification:** `shadow-check.js "Group Isomorphism/group-isomorphism.html"` now passes; re-verified `browser-diff.js` OLD-vs-NEW still IDENTICAL (17 snaps, errors=0) and the full `harness.js` suite still passes with no regression.
- **Committed in:** `94435f0` (Task 2's migration commit)

---

**Total deviations:** 1 auto-fixed (1 blocking import-hygiene fix caught by the phase's own verification tooling, no production behavior change)
**Impact on plan:** No scope creep. This is exactly the "exact sets decided by shadow-check" correction the plan anticipated in its own action text.

## Issues Encountered

- The `#export-svg` browser-diff step hung headless Chrome during the mandatory `--stability` proof on BASE. Resolved per the plan's own explicit fallback: dropped the step and recorded the deferral to plan 07-09's Claude-in-Chrome pass (see Decisions Made above). Not a migration regression -- the SVG export code path itself was not touched by either migration.

## User Setup Required

None -- no external service configuration required.

## Next Phase Readiness

- Every `polar`/`annularSectorPath` call site in the repo now passes an explicit centre (`cx, cy`); no tool closes over a module-scoped `CX`/`CY` pair inside a shared-module call any more. `NT.svg`'s Tier-2 signature change (established in plan 07-02, proven end-to-end here on the two hardest consumers) has no remaining holdouts.
- The Cayley Table <-> Equivalence Wheel shared group-params setting is now implemented once, in `NT.store`, consumed identically by both sides.
- The export-button-in-headless-Chrome caveat (Blob + `URL.createObjectURL` + anchor-click downloads hang `--stability`/`--mutant`/OLD-vs-NEW browser-diff runs) is now documented precedent for any later plan whose config would otherwise exercise a download button -- drop it from the automated config and verify it in the Claude-in-Chrome pass instead.
- Ready for 07-06 per 07-VALIDATION.md's Per-Task Verification Map.

## Self-Check: PASSED

- `Equivalence Wheel/equivalence-wheel.html` exists: FOUND
- `Group Isomorphism/group-isomorphism.html` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/browser-diff/equivalence-wheel.json` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/browser-diff/group-isomorphism.json` exists: FOUND
- Commit `a09e429` in git log: FOUND
- Commit `94435f0` in git log: FOUND
- `node harness.js` (all checks): HARNESS PASS bigint: 75039, core: 2712692, store: 302, svg: 11108, total=2799141, exit 0
- `shadow-check.js` on both migrated pages: SHADOW-CHECK PASS, exit 0
- `browser-diff.js` on both migrated pages (`--stability` then OLD-vs-NEW): both IDENTICAL, errors=0 (Equivalence Wheel snaps=26, Group Isomorphism snaps=17)

---
*Phase: 07-shared-js-module-refactor*
*Completed: 2026-09-30*
