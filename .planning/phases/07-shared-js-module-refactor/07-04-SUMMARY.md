---
phase: 07-shared-js-module-refactor
plan: 04
subsystem: infra
tags: [shared-js-module, vanilla-js, classic-script, parity-testing, headless-chrome, bigint]

# Dependency graph
requires:
  - phase: 07-shared-js-module-refactor (plan 01)
    provides: "assets/nt-core.js, the NT namespace/include/import conventions, and the three verification engines (harness.js, shadow-check.js, browser-diff.js)"
  - phase: 07-shared-js-module-refactor (plan 03)
    provides: "assets/nt-bigint.js — NT.bigint (9-export frozen BigInt module), proven on RSA"
  - phase: 07-shared-js-module-refactor (plan 02)
    provides: "assets/nt-svg.js — NT.svg (5-export frozen SVG module), proven on Fermat's Method/Shor's Algorithm/ECDH"
provides:
  - "Diffie-Hellman Key Exchange and Square And Multiply migrated onto NT.bigint + NT.svg with zero browser-observable behavior change"
  - "BigInt family's consumer set complete: no BigInt helper is defined anywhere but assets/nt-bigint.js"
affects: [07-05, 07-06, 07-07, 07-08, 07-09]

actuals:
  tokens: 22000
  tasks: 2
  commits: 2
  plan_head_before: 185579b851cf488b28e02ef5128cce60260d4afb
  plan_head_after: 1cb57f929b5955734dfe663ac023e34fd83c9d47

tech-stack:
  added: []
  patterns:
    - "A tool-local helper that is never referenced outside its own declaration (Diffie-Hellman's bigGcd) is still deleted during migration even though it is not imported from NT.bigint — the shared module is the single source of truth for that name, and a dead local copy would silently reintroduce the duplication the phase exists to remove"

key-files:
  created:
    - .planning/phases/07-shared-js-module-refactor/browser-diff/diffie-hellman-key-exchange.json
    - .planning/phases/07-shared-js-module-refactor/browser-diff/square-and-multiply.json
  modified:
    - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
    - Square And Multiply/square-and-multiply.html

key-decisions:
  - "Diffie-Hellman's browser-diff config forces every play-control snapshot through instantBtn (click #playBtn then immediately click #instantBtn, no wait between) rather than waiting on the natural rAF-driven playback loop, reusing plan 07-02's established anti-flake fix; the packet-animation and Eve's-notebook states are instead reached via the synchronous #stepBtn path with generous (1500ms) waits after the two wire-crossing steps so any in-flight packet has already self-removed before the snapshot"
  - "Diffie-Hellman's config also exercises Eve's discrete-log brute-force attempt (#eveDlogBtn) against a small p=23 build, since the must-have truths name it explicitly; its performance.now()-derived elapsed-time text is masked via the same volatile regex pattern RSA's config established in plan 07-03"

requirements-completed: [SC-1, SC-2, SC-4]

coverage:
  - id: D1
    description: "Diffie-Hellman Key Exchange renders every preset exchange, generated safe prime, randomized secret, packet animation, Eve's notebook, Eve's discrete-log brute-force attempt, and the scratchpad panel identically to BASE, running on NT.bigint + NT.svg with zero local copies"
    requirement: "SC-1, SC-2, SC-4"
    verification:
      - kind: e2e
        ref: "browser-diff.js Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html (authored config, --stability, OLD-vs-NEW; snaps=24, errors=0)"
        status: pass
      - kind: other
        ref: "shadow-check.js Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
        status: pass
    human_judgment: false
  - id: D2
    description: "Square and Multiply renders every preset (including the 4294967296-exponent chip), play/step/instant playback, randomize, and the invalid-input/cost/RSA-scale panels identically to BASE, running on NT.bigint + NT.svg with zero local copies"
    requirement: "SC-1, SC-2, SC-4"
    verification:
      - kind: e2e
        ref: "browser-diff.js Square And Multiply/square-and-multiply.html (authored config, --stability, OLD-vs-NEW; snaps=16, errors=0)"
        status: pass
      - kind: other
        ref: "shadow-check.js Square And Multiply/square-and-multiply.html"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-09-30
status: complete
---

# Phase 7 Plan 4: Shared JS Module Refactor Summary

**Diffie-Hellman Key Exchange and Square And Multiply migrated onto NT.bigint + NT.svg, completing the BigInt family's consumer set — no BigInt helper is defined anywhere in the repo but assets/nt-bigint.js.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-09-30T20:16:42Z (session start, per STATE.md's prior activity marker)
- **Completed:** 2026-09-30T20:28:45Z
- **Tasks:** 2 (Task 1: Diffie-Hellman Key Exchange; Task 2: Square And Multiply)
- **Files modified:** 4 (2 tool pages, 2 new browser-diff configs)

## Accomplishments

- Diffie-Hellman Key Exchange migrated onto `NT.bigint` (`fmt`, `isPrimeBig`, `modPowPlain`, `parseBigIntStrict`, `randomBigIntBits`, `randomBigIntInRange`, `scratchNum`, `shortVal`) and `NT.svg` (`easeInOutCubic`, `svgEl`); its local `factorSmall`/`multiplicativeOrder` (DH-only order-by-factoring-p-1 logic) stay in the page and now call the imported `modPowPlain`
- Square And Multiply migrated onto `NT.bigint` (`fmt`, `modPowPlain`, `parseBigIntStrict`, `shortVal`) and `NT.svg` (`svgEl`); its local `popCountBig`, `squareAndMultiplySteps`, `costSummary`, `rsaScaleNote` and rendering stay in the page
- Both pages proven byte-identical to their pre-phase (BASE) selves in real headless Chrome across every exercised interaction — preset chips, safe-prime generation at two bit sizes, randomize, a full play/step walk including the wire-crossing packet animation and Eve's notebook, Eve's discrete-log brute-force attempt, and multiple invalid-input paths (composite p, exponent 0, modulus 1, non-numeric base) — with zero console errors
- The BigInt family (`assets/nt-bigint.js`) now has its full consumer set: RSA (plan 07-03), Diffie-Hellman Key Exchange and Square And Multiply (this plan) — no tool in the repo defines a local `bigGcd`, `isPrimeBig`, `modPowPlain`, `parseBigIntStrict`, `randomBigIntBits`, `randomBigIntInRange`, `scratchNum` or `shortVal` any more

## Task Commits

Each task was committed atomically:

1. **Task 1: migrate Diffie-Hellman Key Exchange onto NT.bigint + NT.svg** - `407b80a` (feat)
2. **Task 2: migrate Square and Multiply onto NT.bigint + NT.svg** - `1cb57f9` (feat)

## Files Created/Modified

- `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` — nt-bigint.js + nt-svg.js includes; 2-namespace import block; deleted local `parseBigIntStrict`, `fmt`, `bigGcd`, `randomBigIntBits`, `randomBigIntInRange`, `modPowPlain`, `isPrimeBig`, `shortVal`, `SVG_NS`, `svgEl`, `scratchNum`, `easeInOutCubic`
- `.planning/phases/07-shared-js-module-refactor/browser-diff/diffie-hellman-key-exchange.json` — authored interaction config (24 snapshots: 3 chips, reset, play-then-instant, a 10-step full walk through the exchange including the packet animation and Eve's notebook, two safe-prime generations, two randomize draws, a composite-p error, a non-full-order (p,g) pair, and Eve's discrete-log brute-force attempt)
- `Square And Multiply/square-and-multiply.html` — nt-bigint.js + nt-svg.js includes; 2-namespace import block; deleted local `parseBigIntStrict`, `fmt`, `modPowPlain`, `shortVal`, `SVG_NS`, `svgEl`
- `.planning/phases/07-shared-js-module-refactor/browser-diff/square-and-multiply.json` — authored interaction config (16 snapshots: 4 chips including the 4294967296-exponent one, reset, play-then-instant, 3 steps, 2 randomize draws, exponent-0/modulus-1/non-numeric-base validation paths)

## Decisions Made

See `key-decisions` in the frontmatter. In prose:

1. **Dead local helper still deleted.** Diffie-Hellman's `bigGcd` was declared locally but never called anywhere else in the file (confirmed via grep before editing). It is still removed during migration, not left behind as an orphan — `NT.bigint.bigGcd` is the sole definition repo-wide, and leaving a dead unused copy in the tool file would be exactly the kind of stale duplication this phase exists to eliminate, even though nothing calls it.
2. **Anti-flake pattern reused, plus a new stepBtn-with-generous-wait variant.** Following plan 07-02's established fix (force `instantBtn` or an immediate play-then-pause pair before any post-play-control snapshot), Diffie-Hellman's config forces play-control snapshots through `instantBtn`. To also snapshot the mid-sequence packet-animation and Eve's-notebook states the must-have truths require, the config instead drives the synchronous `#stepBtn` path (which advances state deterministically) and waits 1500ms — well past the ~880ms packet lifecycle at default speed — after the two wire-crossing steps, so any in-flight SVG packet element has already self-removed in both OLD and NEW browser processes before the snapshot is taken. This differs from the flaky pattern (snapshotting a play control's own timing-dependent state) that plan 07-02 diagnosed and fixed.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- The BigInt family (`assets/nt-bigint.js`) has no remaining consumers to migrate — RSA, Diffie-Hellman Key Exchange and Square And Multiply are all on it.
- Ready for 07-05 per 07-VALIDATION.md's Per-Task Verification Map (Equivalence Wheel and Group Isomorphism, wave 3), which will bring the two wheel tools onto NT.core + NT.svg's centre-parameterized `polar`/`annularSectorPath` and NT.store's shared group/modulus persistence.

## Self-Check: PASSED

- `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` exists: FOUND
- `Square And Multiply/square-and-multiply.html` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/browser-diff/diffie-hellman-key-exchange.json` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/browser-diff/square-and-multiply.json` exists: FOUND
- Commit `407b80a` in git log: FOUND
- Commit `1cb57f9` in git log: FOUND
- `node harness.js bigint svg`: HARNESS PASS bigint: 75039 assertions, HARNESS PASS svg: 11108 assertions, total=86147, exit 0
- `shadow-check.js` on both migrated pages: SHADOW-CHECK PASS, exit 0
- `browser-diff.js` on both migrated pages (`--stability` then OLD-vs-NEW): both IDENTICAL, errors=0 (DH snaps=24, S&M snaps=16)

---
*Phase: 07-shared-js-module-refactor*
*Completed: 2026-09-30*
