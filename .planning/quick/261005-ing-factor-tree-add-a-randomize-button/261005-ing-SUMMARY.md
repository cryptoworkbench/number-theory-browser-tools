---
phase: quick-261005-ing
plan: 01
subsystem: ui
tags: [factor-tree, i18n, randomize, headless-probe]
status: complete

requires: []
provides:
  - "Randomize button in the Factor Tree input row, right of Grow the Tree"
  - "factorTree.randomize key in all sixteen languages"
  - "randomize-probe.js, an 11-scenario headless-Chrome regression probe"
affects: []

actuals:
  tokens: 4600
  tasks: 2
  commits: 2
plan_head_before: 238a75479ec44d8a84c83b4829a250db0c0f042f
plan_head_after: 9ac8738ac16f550c1cd2e0b408cbd3d40d2f85e7

tech-stack:
  added: []
  patterns:
    - "Randomize reuses the Go path (numInput.value = n, then factorize) so message, tree, equation and mirror arming are unchanged"

key-files:
  created:
    - .planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js
  modified:
    - "Factor Tree/factor-tree.html"
    - assets/i18n/factor-tree.js

key-decisions:
  - "Label reuses randomizeLabel from the Wheel and Cayley dictionaries (RD-3), not their longer 'New random example' text"
  - "Number range 12..9999, at least three prime factors, never the shown number, 200-draw cap then deterministic upward scan (RD-4)"
  - "No persistence added: the tool has none (RD-5)"

requirements-completed: [QUICK-FT-RANDOM-01]

duration: ~15min
completed: 2026-10-05
---

# Quick 261005-ing: Factor Tree Randomize button Summary

**Randomize button beside Grow the Tree picks a random composite (12..9999, at least three prime factors, never the shown number) and grows it through the unchanged Go path, with a label translated in all sixteen languages.**

## What changed

- `Factor Tree/factor-tree.html`: `#randomBtn` markup directly after `#goBtn`; secondary-button CSS (same 40px height, radius and font as Grow, `var()` colours only); `pickRandomN()` plus the `RANDOM_*` constants; click handler `numInput.value = pickRandomN(); factorize(numInput.value)`. NT.core import is now `{ primeFactors, randomInt }`. `factorize`, `renderTree`, mirror code and `onLangChange` are untouched.
- `assets/i18n/factor-tree.js`: `randomize` after `grow` in every language block; header comment updated.
- `randomize-probe.js`: 4 node-side and 7 in-page scenarios.

## Decisions

- RD-3: the label reuses `randomizeLabel` from the Wheel and Cayley dictionaries (byte-identical in all sixteen languages), not their longer "New random example" text, because the button sits beside a short verb button.
- RD-4: draws uniformly from 12..9999 via `NT.core.randomInt`, accepts the first draw with at least 3 prime factors (with multiplicity) that differs from `treeView.root.value`; after 200 draws it scans upward from 12, so it always terminates (probe R7 pins the cap at 200 and the fallback at 12, then 16).
- RD-5: no persistence was added, because the tool has none.

## Verification

- `randomize-probe.js`: `ING-PROBE PASS (11 scenarios)`.
- 261005-hz0 mirror probe: `HZ0-PROBE PASS (26 scenarios)`.
- `i18n-check.js --all`, `shadow-check.js --all`, phase-07 `harness.js`: all pass (harness `HARNESS PASS total=2856003`).
- `git diff --stat 238a754 HEAD` touches only the three planned files.

## Deviations from Plan

None - plan executed exactly as written.

Notes: commits were made directly on `main`, as the orchestrator instructed (no worktree). The unrelated uncommitted files (`.planning/config.json`, `.planning/state.json`, etc.) were never staged. SUMMARY/STATE docs were not committed and ROADMAP.md was not touched, per the task constraints.

## Known Stubs

None.

## Threat Flags

None.

## Commits

- `6edd5bc` feat(quick-261005-ing): Randomize button, dictionary key, probe (Task 1, tracer)
- `9ac8738` test(quick-261005-ing): probe edge cases (Task 2)

## Self-Check: PASSED
