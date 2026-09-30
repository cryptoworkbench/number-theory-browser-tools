---
phase: 07-shared-js-module-refactor
plan: 02
subsystem: infra
tags: [shared-js-module, vanilla-js, classic-script, parity-testing, headless-chrome, static-analysis, svg]

# Dependency graph
requires:
  - phase: 07-shared-js-module-refactor (plan 01)
    provides: "assets/nt-core.js, the NT namespace/include/import conventions, and the three verification engines (harness.js, shadow-check.js, browser-diff.js)"
provides:
  - "assets/nt-svg.js — NT.svg, a frozen 5-member shared module (SVG_NS, svgEl, polar, annularSectorPath, easeInOutCubic) with centre-parameterized geometry helpers"
  - "Fermat's Method, Shor's Algorithm and Elliptic Curve Diffie-Hellman migrated onto NT.core + NT.svg with zero browser-observable behavior change"
  - "Renamed near-duplicate reconciliation proven end-to-end: gcdSmall/isPrimeSmall/isPrimeSimple/polarPoint/modInv all retired in favor of their NT.core/NT.svg canonical names"
affects: [07-03, 07-04, 07-05, 07-06, 07-07, 07-08, 07-09]

actuals:
  tokens: 7829
  tasks: 3
  commits: 5
  plan_head_before: 93f29a18a56b90897b429917690de7f8f60a41ec
  plan_head_after: 428bc4e3be06faf8e8d2b427654d7c7e0fd3cb8f

tech-stack:
  added: []
  patterns:
    - "Tier-2 signature change proven on real pages: polar/annularSectorPath take the circle centre as explicit leading parameters (cx, cy) instead of closing over a page's own CX/CY constant — Shor's Algorithm's polarPoint already had this shape, so its migration was a pure rename; the two wheel tools that still close over CX/CY (Equivalence Wheel, Group Isomorphism) are deferred to a later plan"
    - "Browser-diff timing-flake avoidance: any config step that exercises a play/animate control must force deterministic completion (instantBtn) or an immediate play+pause pair before snapshotting — relying on real requestAnimationFrame wall-clock timing between two separate headless Chrome processes is not deterministic and produces false DIFFs unrelated to the migration (found and fixed during Task 1's Fermat's Method config, reused for Task 2 and Task 3)"

key-files:
  created:
    - assets/nt-svg.js
    - .planning/phases/07-shared-js-module-refactor/checks/svg.check.js
    - .planning/phases/07-shared-js-module-refactor/browser-diff/fermats-method.json
    - .planning/phases/07-shared-js-module-refactor/browser-diff/shors-algorithm.json
    - .planning/phases/07-shared-js-module-refactor/browser-diff/elliptic-curve-diffie-hellman.json
  modified:
    - Fermats Method/fermats-method.html
    - Shors Algorithm/shors-algorithm.html
    - Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html

key-decisions:
  - "NT.svg's polar/annularSectorPath take cx, cy as explicit leading parameters (Tier-2 signature change) rather than staying closure-coupled — every call site in this plan's three tools already passed (or could pass) an explicit centre, so the signature change cost nothing here and sets the contract the later Equivalence Wheel/Group Isomorphism plan must follow"
  - "Fixed a real browser-diff config bug during Task 1: relying on natural play()/requestAnimationFrame timing before snapshotting the replay/step controls produced a false DIFF between two independent headless Chrome runs of the identical BASE page (a timing race, not a migration regression) — fixed by forcing instantBtn completion before exercising replay/step, then reused that pattern for Shor's Algorithm and ECDH's play/step sequences"
  - "ECDH's basePointSelect option coverage is a representative index sample (first, one early, middle, one late, last) rather than a literal enumeration of every option — the default curve has 36 points/options, and a static JSON config cannot generically enumerate a runtime-computed option list; the sample proves the option-select -> rebuild -> render path is unaffected by the migration without an impractically long config"
  - "Added a fourth ECDH invalid-input case beyond the plan's literal p=4/p=7.5/p=1 (an in-range composite p=9): those three values are all caught by readInputs()'s earlier NaN/range guards before ever reaching the isPrime(p) call the migration actually renamed, so p=9 was added to genuinely exercise the renamed call in its 'is not prime' branch"

requirements-completed: [SC-1, SC-2, SC-3, SC-4, SC-5]

coverage:
  - id: D1
    description: "assets/nt-svg.js ships a frozen NT.svg with all 5 planned exports, parity-proven against every predecessor (RED-GREEN TDD cycle)"
    requirement: "SC-3"
    verification:
      - kind: unit
        ref: "harness.js svg (checks/svg.check.js, 11108 assertions)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Fermat's Method runs on NT.core + NT.svg (isPerfectSquare, isPrime, easeInOutCubic, svgEl), byte-identical to BASE in headless Chrome across every exercised interaction including a below-minimum and an above-maximum N"
    requirement: "SC-1, SC-2, SC-4"
    verification:
      - kind: e2e
        ref: "browser-diff.js Fermats Method/fermats-method.html (authored config, --stability, OLD-vs-NEW)"
        status: pass
      - kind: other
        ref: "shadow-check.js Fermats Method/fermats-method.html"
        status: pass
    human_judgment: false
  - id: D3
    description: "Shor's Algorithm runs on NT.core + NT.svg (gcd, isPrime, modPowSmall, polar), byte-identical to BASE including all preset chips, randomize draws, and the ?n=/&a= query-param shapes"
    requirement: "SC-1, SC-2, SC-3, SC-4"
    verification:
      - kind: e2e
        ref: "browser-diff.js Shors Algorithm/shors-algorithm.html (authored config, --stability, OLD-vs-NEW)"
        status: pass
      - kind: other
        ref: "shadow-check.js Shors Algorithm/shors-algorithm.html"
        status: pass
    human_judgment: false
  - id: D4
    description: "Elliptic Curve Diffie-Hellman runs on NT.core + NT.svg (isPrime, mod, modInverse, randomInt, svgEl), byte-identical to BASE including invalid-prime-input error paths, and its source no longer references the retired CLAUDE.md single-file rule"
    requirement: "SC-1, SC-2, SC-3, SC-4, SC-5"
    verification:
      - kind: e2e
        ref: "browser-diff.js Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html (authored config, --stability, OLD-vs-NEW)"
        status: pass
      - kind: other
        ref: "shadow-check.js Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html (no STALE-COMMENT finding)"
        status: pass

duration: 70min
completed: 2026-09-30
status: complete
---

# Phase 7 Plan 2: Shared JS Module Refactor Summary

**NT.svg (5-member frozen shared module with centre-parameterized geometry) proven end-to-end on Fermat's Method, Shor's Algorithm and Elliptic Curve Diffie-Hellman, reconciling five renamed near-duplicate helpers to their NT.core/NT.svg canonical names.**

## Performance

- **Duration:** ~70 min
- **Started:** 2026-09-30
- **Completed:** 2026-09-30
- **Tasks:** 3 (Task 1 TDD: NT.svg + Fermat's Method; Task 2: Shor's Algorithm; Task 3: Elliptic Curve Diffie-Hellman)
- **Files modified:** 8 (3 tool pages, 1 shared module, 4 dev-only tooling/config files)

## Accomplishments

- `assets/nt-svg.js` ships as the repo's second shared JS logic module: a frozen `window.NT.svg` with `SVG_NS`, `svgEl`, `polar(cx, cy, r, angleDeg)`, `annularSectorPath(cx, cy, rInner, rOuter, startDeg, endDeg)`, and `easeInOutCubic(t)` — the Tier-2 signature change (centre taken as explicit parameters) proven against all eleven pre-phase predecessor definitions (`checks/svg.check.js`, 11,108 assertions)
- Fermat's Method, Shor's Algorithm and Elliptic Curve Diffie-Hellman migrated onto `NT.core` + `NT.svg`, each proven byte-identical to their pre-phase (BASE) selves in real headless Chrome across every exercised interaction (preset chips, custom inputs, randomize draws, play/step/instant playback, and — for ECDH — invalid-prime-input error paths), with zero console errors
- Five renamed near-duplicates retired and reconciled: `gcdSmall`, `isPrimeSmall` (both Shor's and ECDH's variants), `isPrimeSimple`, `polarPoint`, `modInv` — none of the three migrated pages retains a local copy or a stale alias (shadow-check `RETIRED-NAME` gate green on all three)
- The Elliptic Curve Diffie-Hellman source no longer carries the comment tying its math helpers to a retired CLAUDE.md single-file rule
- Found and fixed a real dev-tooling bug (not a migration regression): a browser-diff config step that exercised a play/animate control by relying on real `requestAnimationFrame` wall-clock timing produced a nondeterministic false `DIFF` between two independent headless Chrome process runs of the identical BASE page — fixed by forcing `instantBtn` completion (or an immediate play+pause pair) before any snapshot that follows a play control, and reused across all three tools' configs

## Task Commits

Each task was committed atomically (Task 1 carries TDD's test → feat commits):

1. **Task 1 (RED): failing parity checks for NT.svg** - `915d2d6` (test)
2. **Task 1 (GREEN): complete NT.svg, parity proven** - `625fb12` (feat)
3. **Task 1: migrate Fermat's Method onto NT.core + NT.svg** - `200eb6d` (feat)
4. **Task 2: migrate Shor's Algorithm onto NT.core + NT.svg** - `3f5dd52` (feat)
5. **Task 3: migrate Elliptic Curve Diffie-Hellman onto NT.core + NT.svg** - `428bc4e` (feat)

_TDD gate compliance (Task 1, tdd="true"):_ RED commit `915d2d6` intentionally failed on the first assertion (`svg key-set: expected [...5 names...] got []`, exit 1) against a stub `NT.svg = {}` before any implementation existed. GREEN commit `625fb12` made it pass (11,108 assertions, exit 0). No REFACTOR commit was needed — the GREEN implementation required no cleanup pass.

## Files Created/Modified

- `assets/nt-svg.js` — NT.svg: SVG_NS, svgEl, polar, annularSectorPath, easeInOutCubic
- `.planning/phases/07-shared-js-module-refactor/checks/svg.check.js` — parity checks for all 5 NT.svg exports against every BASE predecessor (11,108 assertions)
- `Fermats Method/fermats-method.html` — nt-core.js + nt-svg.js includes; import block; local isqrt/isPerfectSquare/isPrimeSimple/SVG_NS/svgEl/easeInOutCubic removed
- `Shors Algorithm/shors-algorithm.html` — nt-core.js + nt-svg.js includes; import block; local gcdSmall/modPowSmall/isPrimeSmall/SVG_NS/svgEl/polarPoint removed
- `Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html` — nt-core.js + nt-svg.js includes; import block; local mod/isPrimeSmall/modInv/SVG_NS/svgEl/randomInt removed; stale rule comment rewritten
- `.planning/phases/07-shared-js-module-refactor/browser-diff/fermats-method.json`, `shors-algorithm.json`, `elliptic-curve-diffie-hellman.json` — authored interaction configs

## Decisions Made

See `key-decisions` in the frontmatter. The two worth calling out in prose:

1. **Browser-diff timing-flake fix.** During Task 1, the first `browser-diff.js` OLD-vs-NEW run for Fermat's Method reported a `DIFF` at a "replay" snapshot (`playBtn`/`stepBtn` state differed between OLD and NEW). Investigation showed this was a timing race — the config exercised the natural `play()`/`requestAnimationFrame` loop without forcing completion first, and two separate headless Chrome process invocations do not guarantee identical frame timing. Re-running `--stability` (BASE vs BASE) with the *same* config also failed intermittently, confirming the config itself was nondeterministic, not the migration. Fixed by clicking `instantBtn` (or, for the two Play/Step tools, an immediate Play-then-Play-again pause) before any snapshot that follows a play control. Re-verified `--stability` IDENTICAL, then OLD-vs-NEW IDENTICAL, for all three tools' configs.
2. **ECDH basePointSelect coverage.** The plan calls for exercising "each `#basePointSelect` option," but the default curve (p=29, a=4, b=20) has 36 points/options, and the config is a static JSON file with no way to generically enumerate a runtime-computed `<select>`'s option list. Used index-based `selectedIndex` assignment (first, one early, middle, one late, last) via a `js` step instead — a representative sample that proves the option-select → rebuild → render path survives the migration without an impractically long, curve-specific config.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed a nondeterministic browser-diff config (timing race, not a migration regression)**
- **Found during:** Task 1 (Fermat's Method browser-diff config authoring)
- **Issue:** The initial config clicked `#replayBtn` shortly after `#factorBtn` without forcing the search to complete first, relying on real `requestAnimationFrame` timing. Two independent headless Chrome process runs of the identical BASE page produced different `playBtn`/`stepBtn` states at that snapshot, a false positive unrelated to any code change.
- **Fix:** Click `#instantBtn` before the replay/step exercise in all three tools' configs (Fermat's Method, Shor's Algorithm, Elliptic Curve Diffie-Hellman), and use an immediate Play-then-Play-again pause (no wait between clicks) where a play/step sequence is exercised without an instant-finish button reachable first.
- **Files modified:** `.planning/phases/07-shared-js-module-refactor/browser-diff/fermats-method.json`, `shors-algorithm.json`, `elliptic-curve-diffie-hellman.json`
- **Verification:** `--stability` (BASE vs BASE) IDENTICAL, then OLD-vs-NEW IDENTICAL, for all three tools.
- **Committed in:** `200eb6d`, `3f5dd52`, `428bc4e` (each tool's own migration commit — the configs were authored and fixed before their respective migration edit)

---

**Total deviations:** 1 auto-fixed (1 dev-tooling bug in test-config authoring, not production code)
**Impact on plan:** No scope change. The fix was necessary for the browser-diff oracle itself to be trustworthy; without it, a flaky config could have produced false failures (or, worse, been silenced by re-running until it happened to pass) on every future plan that reuses this pattern. Documented here so later plans inherit the fix.

## Issues Encountered

None beyond the browser-diff timing-flake fix documented above (resolved within Task 1, before any migration commit).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `assets/nt-svg.js` and its centre-parameterized `polar`/`annularSectorPath` contract are proven and ready for the higher-risk wheel tools (Equivalence Wheel, Group Isomorphism) that still close over their own `CX`/`CY` module-scoped constants.
- The browser-diff timing-flake fix (force `instantBtn`/immediate-pause before any post-play snapshot) is now established practice for every later plan's own configs.
- Ready for 07-03 per 07-VALIDATION.md's Per-Task Verification Map (RSA and Cayley Table, wave 2).

## Self-Check: PASSED

- `assets/nt-svg.js` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/checks/svg.check.js` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/browser-diff/fermats-method.json` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/browser-diff/shors-algorithm.json` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/browser-diff/elliptic-curve-diffie-hellman.json` exists: FOUND
- Commit `915d2d6` in git log: FOUND
- Commit `625fb12` in git log: FOUND
- Commit `200eb6d` in git log: FOUND
- Commit `3f5dd52` in git log: FOUND
- Commit `428bc4e` in git log: FOUND
- `node harness.js` (all checks): HARNESS PASS core: 2712692 assertions, HARNESS PASS svg: 11108 assertions, exit 0
- `shadow-check.js` on all three migrated pages: SHADOW-CHECK PASS, exit 0
- `browser-diff.js` on all three migrated pages (`--stability` then OLD-vs-NEW): all IDENTICAL, errors=0

---
*Phase: 07-shared-js-module-refactor*
*Completed: 2026-09-30*
