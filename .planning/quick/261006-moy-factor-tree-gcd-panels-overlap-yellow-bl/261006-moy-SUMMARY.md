---
phase: quick-261006-moy
plan: 01
subsystem: factor-tree
tags: [factor-tree, gcd, overlap, svg, undo-redo, probe]
requires:
  - quick-261006-l6v (work-area undo/redo)
provides:
  - gcd drop on Factor Tree builds a glued pair of two panels (yellow left, blue right, green overlap) instead of one merged card
affects:
  - Factor Tree/factor-tree.html
  - Venn Diagram ?a=&b= deep link (now lands on the pair)
tech-stack:
  added: []
  patterns:
    - "pair view = one entry of views with halves [left, right]; alignPair() runs from placeTree() so the right panel follows every frame of either tree's tween"
    - "tint aliases built only from color-mix(var(--role-*), var(--surface)); overlap painted as its own opacity-faded layer, never a blend mode"
key-files:
  created:
    - .planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-probe.js
    - .planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-day.png
    - .planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-night.png
  modified:
    - Factor Tree/factor-tree.html
    - .planning/quick/261006-l6v-add-redo-and-undo-buttons-to-the-number-/undo-probe.js
    - .planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js
decisions:
  - "The pair is not draggable; glue = one flex slot plus per-frame realignment (plan discretion)"
  - "One pair-level equation block under the two panels; Separate on the left panel's top-left, x on the right panel's top-right"
  - "Tints are page-local aliases (--pair-a-bg/--pair-b-bg/--pair-ab-bg) at 28% over --surface; palette.css and assets/ untouched"
  - "Twin sync for the g branch is by a single Map holding both directions (P.twin); fold/mirror act on both copies inside one trackWork gesture"
metrics:
  duration: ~1h
  completed: 2026-10-06
status: complete
commits: 3
plan_head_before: 2fd5962ba6db64bd648befe138ad44bf5e4bdef8
plan_head_after: 52ee40cf0673beeb92433aa8eeaed5bfd12f9c79
actuals:
  tokens: 21000
  tasks: 3
  commits: 3
---

# Phase quick-261006-moy Plan 01: Factor Tree gcd panels overlap (yellow / blue / green) Summary

Dropping a Factor Tree panel on another panel's gcd half now builds two separate panels that tint yellow (left) and blue (right), slide until their shared g sub-trees coincide, and show the overlap in green; the pair stays glued through every fold and mirror, and Separate fades the colours first and then slides the panels apart.

## What was built

- `buildGcdPair(a, b, animate, balanced)` replaces the merged-card builder. Each panel holds its own tree in the gcd-facing shape (left `a = (a/g) x g`, right `b = g x (b/g)`), the right one on its own clone of the g sub-tree. `P.twin` maps each g circle to its copy and back.
- Join sequence: trees grow out, `is-tinted` is added after `FOLD_MS`, then after `OVERLAP_HOLD_MS` `tweenJoin` eases `P.join` 0 to 1 while `alignPair` slides the right panel and sizes the green `.pair-lens` to the panels' intersection.
- Glue: `placeTree()` ends with `alignPair(view.gcdPair)`, so every frame of any grow / fold / unfold / mirror re-aligns the right panel. The pair is one `.tree-pair` flex slot of `#workArea`.
- `toggleFold(view, nv, fromTwin)` and `mirrorBranch(view, nv, fromTwin)` repeat the action on the twin circle in the other panel (same gesture, one undo step), guarded by a pre-state equality check so a desync cannot invert the pair.
- `separatePair`: removes `is-tinted`, waits `OVERLAP_HOLD_MS`, eases `P.join` back to 0, then swaps the pair for two standalone panels (open, un-highlighted, coprime rule keeps each side's own rest) and shows `msgSplit`.
- Undo/redo: `encodeView` records `{a, b, bal, folds, presses}` for both panels (mid-separation encodes the two standalone trees); `decodeView` rebuilds a joined, tinted, aligned pair at once. Remove, language relabel (no state reset), Venn `?a=&b=` deep link (not an undo step), Balanced shapes and reduced motion all go through the same paths. No new user-visible strings; `assets/` is byte-identical to 2fd5962.
- Removed the single-card machinery (merge routine, hidden-root shadow layout, merged-state twin redirect, `is-overlap` card class).

## Verification

All gates ran green on the final tree:

- `pair-probe.js all`: MOY-PROBE PASS (17 scenarios: drag 15, link 2). A mutation check (twin sync lines removed) made E2 and E3 fail as expected, then the page was restored.
- l6v `undo-probe.js all`: PASS (31); ft = 18 still passes
- pl0 PASS (29), edj PASS (9)
- kaz failing set exactly `D1 D2 P11 P12 P13 P4 P8 P9` (unchanged baseline)
- i18n-check `--all`, `--switcher-present --all`, `--api`, `--persistence`, `--smoke`; shadow-check `--all`
- `git diff 2fd5962 -- assets/` empty; the added lines of `factor-tree.html` contain no colour literal, no `innerHTML`, no black/white colour keyword

Screenshots for the human check: `pair-day.png`, `pair-night.png` (a=72, b=60). They were captured from a scratch copy of the page with CSS transitions/animations disabled, because headless Chrome under virtual time does not advance transitions. Both themes show yellow left, blue right, green overlap with every circle, line and label readable.

Human check still open (end-of-phase): open the live page, drag 60 onto 72's right half, watch yellow/blue appear before the slide, fold the 6 and see the right panel follow, press Separate and see the colours go before the panels part.

## Deviations from Plan

**1. [Rule 3 - Blocking] kaz palette-probe P14 / D2 retargeted to the pair**
- **Found during:** Task 3 gate run
- **Issue:** `palette-probe.js` P14 asserted the old merged card (`is-overlap`, one card, one `.node-circle.shared` for both roots). That is exactly the behaviour the user asked to remove, so it failed (17 pass / 16 fail instead of the baseline set) and the plan's "kaz known-failure set unchanged" gate could not pass. The plan only listed the l6v probe for retargeting; "fix the page, not the probe" was written for page bugs, not for an assertion that encodes the replaced design.
- **Fix:** P14 now checks each panel of the pair (roots, one shared circle each, parents, children, folds, coherence), the pair-level equation, and indexes flat `cards()` accordingly. D2's body was updated the same way (D2 still fails at baseline on its first assertion, "Balanced is not the active mode", so its updated body is untested).
- **Files modified:** `.planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js`
- **Commit:** 52ee40c

**2. Task 2 produced no page changes**
- The glue (`alignPair` from `placeTree`) and the twin-synced fold/mirror were already implemented as part of the Task 1 page rewrite (they were needed for the drop gesture and undo plumbing to work). Task 2's commit (2716b99) is therefore the probe extension (E1-E9, L1-L2) only; the page commit is 57ee0b9.

**3. Probe-only accommodations (no page impact)**
- `pair-probe.js` injects `transition: none` because virtual-time headless Chrome never advances CSS transitions (computed colours would stay at their start value).
- T4's "lens is the topmost layer" check temporarily sets `pointer-events: auto` on the lens, since `pointer-events: none` hides it from `elementFromPoint`.
- E6 waits 50 ms before returning, because the page ignores palette clicks until the drag's own zero-delay timeout has run.

## Known Stubs

None.

## Threat Flags

None. No new network endpoints, auth paths or storage keys. `readPairParams` is unchanged; all text reaches the DOM via `translate()` + `setAttribute`/`textContent`/`popEquation`.

## Self-Check: PASSED

- FOUND: `Factor Tree/factor-tree.html` (`buildGcdPair`, `alignPair`, `separatePair`, `--pair-ab-bg`)
- FOUND: `pair-probe.js`, `pair-day.png`, `pair-night.png` in the quick directory
- FOUND commits 57ee0b9, 2716b99, 52ee40c (ancestors of HEAD)
