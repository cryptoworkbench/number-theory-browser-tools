---
phase: quick-261010-hp0
plan: 01
subsystem: cyclic-groups
tags: [keyboard, grid-view, rtl, probe]
status: complete
requirements: [QUICK-HP0-01]
key-files:
  modified:
    - Cyclic Groups/cyclic-groups.html
  created:
    - .planning/quick/261010-hp0-cyclic-groups-panel-subgroup-generated-b/keys-probe.js
commits: 2
plan_head_before: 493316f0d6657f6f292c2ac391e68a1b31b7684f
plan_head_after: 8cded0dbbc263d269b8b7351153b699f2dc160f3
actuals:
  tokens: 6000
  tasks: 2
  commits: 2
---

# Phase quick-261010-hp0 Plan 01: Arrow keys in the Grid view of the subgroups panel Summary

Arrow keys now switch between subgroup rows in the Grid view of the Cyclic Groups tool: up/down step by the measured grid column count, left/right step through reading order with wrap, mirrored under right-to-left grids; the List view is unchanged.

## What changed

- `Cyclic Groups/cyclic-groups.html`: new `subgroupColumns()` (counts leading `li` children sharing the first child's `offsetTop`) and an extended single `#subgroups` keydown handler. Vertical step is `subgroupColumns()` in the grid and 1 in the list. ArrowLeft/ArrowRight act only in the grid, forward = ArrowRight unless `getComputedStyle(subgroupsEl).direction === 'rtl'`. Guards, `!drawn` return, edge behaviour, `keyNav`, `selectGen` + `focusCurrentRow` are unchanged. No new text, no `assets/` change.
- `keys-probe.js`: dev-only headless-Chrome probe, scenarios G0-G8.

## Evidence

- Red run before the edit (Task 1): `PASS G0 grid-precondition`, `FAIL G1 grid-arrow-down: ArrowDown not defaultPrevented`, `FAIL G2 grid-arrow-up: ArrowDown did not move`, `HP0-PROBE FAIL (1 pass, 2 fail, expected 3 scenarios)`.
- G0 reported 3 columns, 12 rows at 1600x1000.
- Final probe line: `HP0-PROBE PASS (9 scenarios)`. `SHADOW-CHECK PASS`.
- i18n literal baseline (measured at HEAD with the Task 1 edit, which adds no literals, matching the planning-time baseline): includes PASS, no-locale-number-format PASS, literals-markup FAIL 4 findings, literals-js FAIL 2 findings. Identical after Task 2. `git diff HEAD -- assets/` empty.

## Commits

- 918c84b feat(cyclic-groups): arrow keys move between subgroup rows in the grid view
- 8cded0d feat(cyclic-groups): left and right arrow keys step through subgroup rows in the grid view (also adds keys-probe.js)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Probe geometry measured on a detached row and in viewport coordinates**
- **Found during:** Task 1 (first green attempt)
- **Issue:** `renderSubgroups` rebuilds the rows on each selection, so a pre-keypress row reference reports a zero rect afterwards, and `focusCurrentRow` scrolls the page so viewport tops shift.
- **Fix:** the probe snapshots the start row's `{left, top}` before the key and `box()` returns page coordinates (adds scroll offsets). Probe-only; the page was unaffected.
- **Files modified:** keys-probe.js
- **Commit:** 918c84b is the page edit; probe committed in 8cded0d

**2. Probe packaging:** the in-page probe is a real function serialized with `toString()` rather than a string array, for readability; the harness, Chrome flags, output protocol and PASS/FAIL line are as planned. The probe was committed with Task 2 rather than Task 1 (it was untracked until then).

## Known Stubs

None.

## Self-Check: PASSED

- keys-probe.js and the edited page exist; commits 918c84b and 8cded0d are ancestors of HEAD.
