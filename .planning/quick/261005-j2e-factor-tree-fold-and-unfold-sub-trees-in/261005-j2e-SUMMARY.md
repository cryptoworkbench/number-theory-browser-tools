---
phase: quick-261005-j2e
plan: 01
subsystem: factor-tree
tags: [factor-tree, fold, animation, i18n, a11y, svg]
requires: [quick-261005-hz0 mirror lines, quick-261005-ing randomize]
provides: [fold/unfold of any Factor Tree sub-tree into its circle]
affects: ["Factor Tree/factor-tree.html", "assets/i18n/factor-tree.js"]
tech-stack:
  added: []
  patterns: [phased tween engine (animateTree), pruned shadow tree for layout]
key-files:
  created:
    - .planning/quick/261005-j2e-factor-tree-fold-and-unfold-sub-trees-in/fold-probe.js
  modified:
    - "Factor Tree/factor-tree.html"
    - assets/i18n/factor-tree.js
decisions:
  - "FD-4: visible tree re-spreads across the full width when something is folded; vertical size, radius and font sizes stay fixed"
  - "FD-6: mirroring an ancestor reflects a folded sub-tree too, so it unfolds where it would have been"
  - "FD-10: moveTree became the phased animateTree; a per-phase done flag replaced hz0's token bump"
status: complete
commits: 2
plan_head_before: 4a3d7a1923ae7fbd138379f0d3ce0f724495c66d
plan_head_after: be7a5dd6f1d745e4c746f1255f044ce6801b0955
actuals:
  tokens: 14000
  tasks: 2
  commits: 2
metrics:
  completed: 2026-10-05
---

# Phase quick-261005-j2e Plan 01: Factor Tree fold and unfold Summary

Every circle with children in the Factor Tree gets a small round fold button (minus, then plus) once the tree has grown. Folding shrinks and fades the whole sub-tree into the circle, then the remaining tree re-spreads across the full width. Unfolding opens the space first, then grows the sub-tree back out to exactly its old positions.

## What changed

- `assets/i18n/factor-tree.js`: `foldLabel` and `unfoldLabel` (whole-sentence templates with `{n}`) in all sixteen languages; header comment extended.
- `Factor Tree/factor-tree.html`:
  - Fold CSS, using `var()` colours only.
  - Node views now carry a displayed state `{px, py, s, o}` plus `parent`, `folded`, `ring` and badge parts.
  - New helpers: `armFolds`, `anchorOf`, `isHidden`, `layoutTree`, `finalTargets`, `syncControls` and `toggleFold`.
  - `placeTree` now writes every part of the tree from the displayed state.
  - `moveTree` is replaced by the phased `animateTree`, which also drives mirroring.
  - `relabelMirrors` is replaced by `syncControls`.
- `fold-probe.js`: headless-Chrome probe (2 node scenarios plus F1-F11 in a default and a reduced-motion run, 24 in total).
- `assets/nt-*.js`, `assets/i18n/site.js` and `assets/i18n/hub.js` are byte-identical to 4a3d7a1.

## Notes requested by the plan

- **FD-4 (layout):** a pruned shadow tree, with folded nodes as leaves, goes to `NT.layout.assignTreeX`. The visible tree re-spreads across the full width, and vertical size, radius and font sizes stay fixed. With nothing folded the geometry is bit-identical to before.
- **FD-6 (nested state):** inner fold and mirror flags are never reset by an ancestor's action. Mirroring an ancestor also reverses the hidden sub-tree, so after unfolding it sits where it would have been had it never been folded (probe F5 and F7).
- **FD-10 (one engine):** `moveTree` became `animateTree(view, phases)`, used by both `mirrorBranch` and `toggleFold`. The per-phase `done` flag, set by whichever of the last frame or the settle timer finishes first, replaced hz0's bump-the-token-after-snap fix, which would have killed a chain.
- **Human check:** none. Everything was verified headlessly (virtual time, so the settle timers drove the chains). Nobody has looked at it in a visible browser, and the frame-by-frame motion has not been seen.

## Deviations from Plan

- **[Rule 2, minor]** The label opacity for `.one` labels during a fade is `o * 0.75` instead of `o`, so the label does not jump when its CSS opacity of .75 takes over again at o = 1.
- **Protected-branch commit guard:** HEAD is `main`, which the generic guard treats as protected. The orchestrator directed commits in the main tree and all earlier quick tasks were committed on `main`, so I committed there and did not change `.planning/config.json`.
- Task 2 needed no page fixes: the Task 1 implementation already satisfied F5-F11.

## Verification

- fold-probe: J2E-PROBE PASS (24 scenarios).
- mirror-probe: HZ0-PROBE PASS (26).
- randomize-probe: ING-PROBE PASS (11).
- `i18n-check.js --all`, `shadow-check.js --all` and the phase-07 harness all exit 0.
- `git diff --quiet 4a3d7a1` over the shared modules and the `site.js`/`hub.js` data files: unchanged.

## Known Stubs

None.

## Threat Flags

None. No new network, auth or storage surface; labels land via `textContent` and `setAttribute` only.

## Self-Check: PASSED

- FOUND: Factor Tree/factor-tree.html, assets/i18n/factor-tree.js, fold-probe.js
- FOUND commits: af5e734 (feat), be7a5dd (test)
