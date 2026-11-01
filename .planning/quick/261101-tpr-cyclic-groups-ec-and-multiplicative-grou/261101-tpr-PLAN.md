---
quick_id: 261101-tpr
phase: quick-261101-tpr
plan: 01
type: execute
wave: 1
depends_on: [261031-wef, 261101-so1]
files_modified:
  - Cyclic Groups/cyclic-groups.html
  - assets/i18n/cyclic-groups.js
  - .planning/quick/261031-wef-cyclic-groups-complexity-and-form-prefer/slider-check.mjs
  - .planning/quick/261101-so1-cyclic-groups-additive-groups-get-formul/additive-slider-check.mjs
autonomous: true
requirements: [QUICK-261101-tpr]
estimate:
  tokens: 25000
  tasks: 3
---

# Quick 261101-tpr: one forked Complexity slider for every group

## Objective

Universalize so1's forked Complexity slider: EC and multiplicative groups draw
the same four-slot track as ℤ/nℤ (JN – compact – complete on top, the branch
JN → compact SLS → complete below), but the SLS part (slot 3, its caption and
the lower branch) is greyed out and out of reach, since only additive groups
have SLS forms.

## Decisions

- D-01 One Complexity slider: `fork` is every Complexity slider; SLS is open
  iff `mapReach(...).sls`. The three-slot straight Complexity track goes (the
  Form slider keeps its straight track).
- D-02 The fork SVG splits into the top line and the branch so the branch can
  dim alone (`.is-off`, palette `color-mix` only). With SLS open the paint
  order (edges, then grooves) is the old single path's, so ℤ/nℤ looks the same.
- D-03 Slot 3 off: `.fsl-notch.is-off` (dimmed, dashed detent, not-allowed
  cursor, no hover lift), `aria-disabled="true"`, tooltip `fslSlsAdditiveOnly`
  (new, English only). Click and double-click on it do nothing; a drag follows
  the top line only and snaps to the nearest top slot; Up/Down do nothing; the
  knob never rests or glides there.
- D-04 Gate config untouched; no other probes or gates run (user's call).

## Tasks

1. (auto) page + string: D-01..D-03. verify: inline script parses.
2. (auto) probes: slider-check.mjs (wef) expects 4 notches on EC/mult, slot 3
   off; additive-slider-check.mjs (so1) gets EC/mult cases (4 notches, slot 3
   aria-disabled, click / Down / dblclick / drag to it leave the token off
   SLS). Run them one at a time.
3. (auto) light + dark screenshot of a multiplicative slider pair; SUMMARY.
