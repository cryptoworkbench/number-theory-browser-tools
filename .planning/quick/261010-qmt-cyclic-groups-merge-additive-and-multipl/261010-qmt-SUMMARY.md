---
phase: quick-261010-qmt
plan: 01
subsystem: cyclic-groups
tags: [cyclic-groups, ui, i18n]
status: complete
requirements: [QUICK-QMT-01]
key-files:
  modified:
    - Cyclic Groups/cyclic-groups.html
    - assets/i18n/cyclic-groups.js
decisions:
  - "Renamed the tab-strip accessible-name key tablistLabel to opSelectLabel in all 31 blocks, translated values kept"
  - "opLabelMath is English-only per the standing Cyclic Groups rule"
commits: 2
plan_head_before: 9f5b3edaf2471536191580daeff8914d1f25554c
plan_head_after: da70c063e6833eee079919caa7e79143ab00eeed
actuals:
  tokens: 12000
  tasks: 2
  commits: 2
completed: 2026-10-10
---

# Phase quick-261010-qmt Plan 01: Cyclic Groups merged additive/multiplicative view Summary

The Additive/Multiplicative tab strip is replaced by a '∗ (group operation)' dropdown ('+' / '×') in the Group panel, and the modulus is set in a '% (modulus)' row above it, both styled as part of the facts table.

## Commits

- `61c74cd` feat(cyclic-groups): pick the group operation in a Group panel row instead of the mode tabs
- `da70c06` feat(cyclic-groups): set the modulus in the Group panel's % (modulus) row

## What changed

- Tab strip, its CSS, `modeTabs`, `syncTabs` and the arrow-key loop removed; `#ring-panel` has no tab roles.
- `ul#group-controls` (modulus row with `#n-input` and `#n-note` on its own line; operation row with `#op-select`) sits above the separate `ul#facts`, so the input keeps focus while `render()` rebuilds the facts.
- `#op-select` change calls `setMode`; `syncControls` and `setMode` keep `opSelectEl.value = state.mode`, so deep links, storage events, init and language switches show the active operation.
- `renderFacts` no longer emits the modulus and Operation rows; `renderNNote` fills both row labels (`nLabelMath`, `opLabelMath`) on every render.
- RTL rule and option-list theming extended to `#op-select`; palette tokens only.

## Key rename decision

The group-operation accessible-name key `tablistLabel` was renamed to `opSelectLabel` in all 31 language blocks, values unchanged (Dutch aria-label is 'Groepsbewerking'). `opLabelMath` ('{op} (group operation)') exists in the `en` block only; header comment updated.

## Keys no longer used but kept in dictionaries

- `fact.operation` (alongside the long-unused opAdd/opMul/opAddMath/opMulMath).
- site.js `common.additiveGroups` / `common.multiplicativeGroups`, still used by other pages.

## i18n gate results (before -> after)

- coverage: FAIL 120 -> FAIL 120 (the 30 `LANG-KEYSET cyclicGroups.<lang>` lines now also list `opLabelMath`, expected English-only key; `opSelectLabel` absent from findings).
- includes PASS, no-locale-number-format PASS (unchanged); literals-markup FAIL 4, literals-js FAIL 8 (unchanged baselines).
- header PASS, switcher-present PASS, shadow-check PASS.

## Deviations from Plan

None - plan executed as written. Both automated verify commands exited 0; a headless screenshot of `?mode=multiplicative&n=15` showed the rows rendering as intended.

## Stale dev artifacts (deliberately not edited)

`.planning/quick/261009-d21-.../cyclic-probe.js` and `.planning/quick/261010-i13-.../iso-probe.js` click `#tab-additive` / `#tab-multiplicative`, which no longer exist. They are point-in-time artifacts (cyclic-probe.js was already stale).

## Known Stubs

None.

## Self-Check: PASSED

Both commits present on `cyclic-groups-merged-view`; both modified files exist.
