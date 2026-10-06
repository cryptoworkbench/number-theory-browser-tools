---
phase: quick-261006-keu
plan: 01
subsystem: ui
tags: [factor-tree, venn-diagram, palette, layout, probe]
requires: []
provides:
  - bin and Delete all in the add row (right end) on Factor Tree and Venn Diagram
affects: [Factor Tree, Venn Diagram, pl0 shared-palette probe]
tech-stack:
  added: []
  patterns: [scoped margin-left:auto to push a flex child to the row end]
key-files:
  created: []
  modified:
    - Venn Diagram/venn-diagram.html
    - Factor Tree/factor-tree.html
    - .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js
decisions:
  - Wrapper moved unchanged (ids, roles, i18n attributes) as the add row's last child, pushed right with a scoped margin-left:auto
  - Palette heading row bottom margin 8px -> 10px (scoped on Factor Tree so the work-area heading row is unchanged)
metrics:
  duration: ~10 min
  completed: 2026-10-06
status: complete
commits: 2
plan_head_before: 510f835
plan_head_after: 9eebaa9
actuals:
  tokens: 3800
  tasks: 2
  commits: 2
---

# Phase quick-261006-keu Plan 01: Palette tools into the add row Summary

The bin and the garbage-truck Delete all icons now sit at the right end of the add row (number input, Add, Randomize) on both Factor Tree and Venn Diagram, vertically centred with the controls, leaving each palette heading row with only its heading.

## Tasks

| Task | Name | Commit |
| ---- | ---- | ------ |
| 1 | Venn Diagram: tools into `.picker-add`, probe U1 rewritten | e26aad0 |
| 2 | Factor Tree: tools into palette `.controls`, probe K1 added, gates | 9eebaa9 |

## Changes

- Venn: `.palette-tools` wrapper moved to be the last child of `.picker-add`; CSS `.picker-add .palette-tools{ margin-left:auto; }`; `.picker-head` margin 8px -> 10px.
- Factor Tree: wrapper moved to be the last child of the palette panel's `.controls` (indentation also fixed); CSS `.palette-panel .controls .palette-tools{ margin-left:auto; }` and `.palette-panel .section-head{ margin-bottom:10px; }` (shared base rule untouched).
- Probe: U1 now "venn-palette-tools-row" (placement in add row, last child after Randomize, heading row has one child, 40x40, vertical centring within 1px, right edge within 1px, left of tools beyond Randomize, translated labels); new sequence K / K1 for Factor Tree; EXPECTED 28 -> 29.
- No JS changes (Venn listeners bind by id; Factor Tree `overBin()` reads the bin's live rect). No new strings, no colour literals.

## Verification

- pl0 probe: `PL0-PROBE PASS (29 scenarios)` (28 after Task 1)
- `i18n-check.js --all` exit 0; `shadow-check.js --all` exit 0
- Stale kaz probe failing set unchanged: D1 D2 P11 P12 P13 P4 P8 P9
- Diff vs 510f835 adds no colour literal

## Deviations from Plan

None - plan executed exactly as written. (Work ran on `main` per the orchestrator's constraint of no worktree isolation.)

## Pending human check (for the user)

Open both pages from file:// in day and night theme:
(a) at desktop width the bin and Delete all sit on the add row's right end, centred with the field and buttons, heading alone above with even spacing;
(b) at about 360px the row wraps, icons stay together at the right end of their line, no overflow;
(c) dragging a Factor Tree circle / Venn chip onto the bin opens the lid and removes it;
(d) Delete all empties the palette and disables itself;
(e) Factor Tree's composition/factorization heading row (heading + Clear) looks unchanged.

## Known Stubs

None.

## Self-Check: PASSED

- FOUND: Venn Diagram/venn-diagram.html, Factor Tree/factor-tree.html, shared-palette-probe.js
- FOUND commits: e26aad0, 9eebaa9
