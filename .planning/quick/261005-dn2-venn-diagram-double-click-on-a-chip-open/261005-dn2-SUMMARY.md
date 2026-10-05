---
phase: quick-261005-dn2
plan: 01
subsystem: venn-diagram
tags: [venn, preview, dblclick, focus, regression-probe]
requires: []
provides:
  - "Venn composite chip show path idempotent per chip (layer._npOwner guard)"
  - "dev-only headless-Chrome probe dblclick-probe.js (7 scenarios)"
affects: ["Venn Diagram/venn-diagram.html"]
tech-stack:
  added: []
  patterns: ["owner-guarded shared show function for mouseenter + focus"]
key-files:
  created:
    - ".planning/quick/261005-dn2-venn-diagram-double-click-on-a-chip-open/dblclick-probe.js"
  modified:
    - "Venn Diagram/venn-diagram.html"
decisions:
  - "Guard lives in appendCompositeBadge (showOwnPreview); showRegionPreview only records the owner"
metrics:
  duration: "about 10 minutes"
  completed: 2026-10-05
status: complete
commits: 2
plan_head_before: d1961aebf4772cf15b18a585ca364efe9c66e583
plan_head_after: 0d7e33f6950abeef3eda7ef0fc4462cbd3f3c92d
actuals:
  tokens: 9000
  tasks: 2
  commits: 2
---

# Phase quick-261005-dn2 Plan 01: Venn double-click on a chip opens the section in view Summary

Venn preview chips no longer rebuild an already-showing preview on focus, so the first double-click on a panel scrolled to the Euclidean section opens the Euclidean Algorithm page instead of Factor Tree.

## What changed

- `hideNestedPreview` clears `layer._npOwner`; `showRegionPreview(layer, opts, owner)` records it next to the `_npOffset = 0` reset.
- `appendCompositeBadge`: `mouseenter` and `focus` now share one `showOwnPreview` function that sets `state.openPreview` and returns early when `layer._npOwner === g && layer.firstChild`. `mouseleave`, `blur`, dblclick, wheel, keydown and `rerenderOnLangChange` are untouched.
- `scrollNestedPreview` header comment notes that re-entry/focus on the owning chip keeps the offset.
- `dblclick-probe.js` (dev-only): scratch site + headless Chrome, synthetic events dispatched on the chips, window.open stubbed.

## RED output (unedited page, S1 only)

```
FAIL S1 two-overlap-scrolled-focus-dblclick: offset after focus is 0, expected 206
DN2-PROBE FAIL (0 pass, 1 fail, expected 1 scenarios)
exit=1
```

## Final probe output (fixed page)

```
PASS S1 two-overlap-scrolled-focus-dblclick: offset 206 survived focus, opened ../Euclidean Algorithm/euclidean-algorithm.html?a=30&b=35&lang=en
PASS S2 two-overlap-top-dblclick: opened ../Factor Tree/factor-tree.html?n=5&lang=en
PASS S3 two-overlap-keyboard-then-mouse: offset 206 survived mouseenter, opened ../Euclidean Algorithm/euclidean-algorithm.html?a=30&b=35&lang=en
PASS S4 two-overlap-hide-semantics: hide resets owner/offset/children; fresh hover starts at 0
PASS S5 three-pairwise-scrolled-focus-dblclick: offset 206 survived focus, opened ../Euclidean Algorithm/euclidean-algorithm.html?a=2618&b=4641&lang=en
PASS S6 three-centre-single-section: opened ../Factor Tree/factor-tree.html?n=17&lang=en
PASS S7 lang-switch-replay: replayed in de, offset 206 survived focus, opened ../Euclidean Algorithm/euclidean-algorithm.html?a=30&b=35&lang=de
DN2-PROBE PASS (7 scenarios)
```

`node .planning/phases/06-multi-language-support/i18n-check.js --all` exits 0.

## Task commits

| Task | Commit | Files |
| ---- | ------ | ----- |
| 1 | edfc483 | Venn Diagram/venn-diagram.html, dblclick-probe.js |
| 2 | 0d7e33f | dblclick-probe.js |

## Deviations from Plan

None - plan executed as written. (One trivial probe typo, a missing `var` under strict mode, was fixed before the Task 2 commit.)

## Notes

- The Task 2 `human-check` (manual file:// browser pass) was not performed; the headless probe covers the same paths with synthetic events.
- No stubs, no new user-visible strings, no new threat surface.

## Self-Check: PASSED

Both commits exist (edfc483, 0d7e33f); probe file and SUMMARY exist.
