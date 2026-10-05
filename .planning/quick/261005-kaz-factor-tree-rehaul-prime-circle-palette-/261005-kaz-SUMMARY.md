---
phase: quick-261005-kaz
plan: 01
subsystem: factor-tree
tags: [factor-tree, palette, drag-and-drop, pointer-events, i18n, svg]
status: complete
requires:
  - quick-261005-j2e (fold/unfold engine, + badge)
  - quick-261005-hz0 (mirror)
provides:
  - Factor Tree circle palette (30 primes + user-added numbers)
  - Pointer-event drag-and-drop and click/keyboard placement of tree copies
  - Multi-tree working area with per-card sizing, remove and Clear
affects:
  - "Factor Tree/factor-tree.html"
  - assets/i18n/factor-tree.js
key-files:
  created:
    - .planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js
  modified:
    - "Factor Tree/factor-tree.html"
    - assets/i18n/factor-tree.js
    - .planning/quick/261005-hz0-factor-tree-drop-prime-from-header-title/mirror-probe.js
    - .planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js
    - .planning/quick/261005-j2e-factor-tree-fold-and-unfold-sub-trees-in/fold-probe.js
decisions:
  - "PD-3: every node with children starts folded, so each + reveals exactly one split"
  - "PD-7: per-card sizing replaced j2e's full-width spread; the svg size tweens with the nodes (SIZE_KEY entry in the target maps)"
  - "PD-10: Randomize only fills the Add field and never adds to the palette"
  - "The hz0, ing and j2e Factor Tree probes are superseded by palette-probe.js"
requirements: [QUICK-FT-PALETTE-01]
commits: 3
plan_head_before: f4749ed6a5a4739a701b7baa97be7abe0e02fd35
plan_head_after: db6a1fa8cc21c48f35ef792dcce1384581c499ca
actuals:
  tokens: 31000
  tasks: 3
  commits: 3
---

# Phase quick-261005-kaz Plan 01: Factor Tree rehaul around a circle palette Summary

The Factor Tree page now opens with a palette of the first 30 primes as blue circles and an empty working area. Circles (and any number added with the Add field) are copied into the working area by pointer drag or click, land folded, and unfold one split at a time through the + button.

## What was built

- **Palette.** 30 `button.palette-item` circles (2..113), pre-filled synchronously. Each has a translated `aria-label` and `title`. Items stretch into pills for long numbers. The palette is not persisted.
- **Add field.** `#addInput` (numeric, with keydown and `beforeinput` filters) sits left of `#addBtn`, with Randomize after them. Validation runs in order: empty, non-digits, 0, 1 (warning), over the mode's cap, else append. Duplicates are allowed. After an add the field keeps its value, selected.
- **Drag and drop.** Pointer Events with window listeners filtered by pointerId. A 6 px slop activates the drag, a ghost follows the pointer and the working area highlights. A drop over the area calls `dropTree`. Releasing elsewhere, `pointercancel` and Escape place nothing. `dragJustEnded` suppresses the trailing click. Click, tap, Enter and Space also place a copy. A keyboard placement (`detail === 0`) focuses the new tree's + button, and a held key is blocked.
- **Working area.** Each tree is a `.tree-card` with a labelled remove button and its own equation. `#workHint` shows while the area is empty, and `#clearBtn` is disabled then. A removed card hands focus to a neighbour; Clear focuses the first palette item.
- **Engine.** The j2e fold/mirror/animate engine now works per view (`view.live` replaced the single `treeView` global). Each card's svg is sized to its visible tree (`sizeOf`), and the size tweens along with the nodes.
- **Equation and message.** A card shows its equation, and the message line reports the factorization, only once nothing in it is folded. Folding anything clears the equation immediately.
- **Mode, Randomize, deep link, language.** A mode switch rebuilds every tree fresh and folded and drops over-cap ones with a message. Randomize only fills the field. `?n=` selects Balanced, appends n to the palette if missing and places a folded copy. A language switch relabels everything without moving or folding anything.
- **Strings.** Nine new keys plus a rewritten `subtitle`, in all sixteen languages. The `grow` and `chipPrime` keys are deleted. No change to `assets/nt-*.js`, `site.js`, `hub.js` or `index.html`.

## Verification

- `palette-probe.js`: KAZ-PROBE PASS (24 scenarios): N1-N3, P1-P10 in the default run, P1-P10 under `--force-prefers-reduced-motion`, and D1 in the deep-link run. Three consecutive runs gave the same result. I also broke the page on purpose (removed the click-suppression call and the mode rebuild); the probe reported FAIL on P3, P8 and P9, then I restored the page.
- `i18n-check.js --all`: no failures. `shadow-check.js --all`: no failures. `harness.js`: HARNESS PASS (total=2856003).
- `git diff --quiet f4749ed` over the six `nt-*.js` modules, `assets/i18n/site.js`, `assets/i18n/hub.js` and `index.html`: identical.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug, probe] P4's 300 ms mid-tween width sample was timing-fragile**
- **Found during:** Task 3, after a 30 ms settle delay was added between probe steps.
- **Issue:** The sample passed or failed depending on whether rAF frames fired under Chrome's virtual time (the plan itself notes rAF may not fire there). The page was behaving correctly.
- **Fix:** Sample at 620 ms instead, after unfold phase 1 has settled. Phase 1's targets already carry the final size, so this still asserts "the card has grown while sub-tree sprouting is still in its second phase", but no longer depends on rAF.
- **Files modified:** palette-probe.js
- **Commit:** db6a1fa

**2. [Rule 3 - Blocking, probe] Reduced-motion run raced the page's zero-delay `dragJustEnded` reset**
- **Found during:** Task 3, first reduced-motion run (P5-P10 failed).
- **Issue:** In reduced motion no step sleeps, so P3's Escape drag left `dragJustEnded` set when P5's click arrived in the same turn. Real users cannot click that fast.
- **Fix:** The step runner sleeps 30 ms between steps.
- **Files modified:** palette-probe.js
- **Commit:** db6a1fa

Otherwise: the plan was executed as written. Task 2's page changes (remove focus, `clearWork`, `rebuildWork`, held-key guard) were applied after the Task 1 commit as planned. Randomize was wired in Task 1 rather than Task 2, so no intermediate commit has a dead button.

## Known Stubs

None. (`placeholder="e.g. 60"` on the Add field is the translated hint attribute, not a stub.)

## Notes from the plan's output spec

- **PD-3:** every node starts folded, so each + reveals exactly one split.
- **PD-7:** per-card sizing replaced j2e's full-width spread, and the svg size tweens with the nodes.
- **PD-10:** Randomize only fills the field.
- **Superseded probes:** the hz0 (`mirror-probe.js`), ing (`randomize-probe.js`) and j2e (`fold-probe.js`) Factor Tree probes drive controls this rehaul removed. Each now carries a SUPERSEDED comment, and `palette-probe.js` covers their ground.
- **Human check:** nobody has checked mouse or touch dragging in a visible browser. Drag was exercised only with synthetic PointerEvents (mouse and touch pointer types) in headless Chrome. The manual checks in the plan's verification section are still open.

## Threat Flags

None. The new surface is the Add field, which is validated with `/^\d+$/` and capped, the `?n=` link, whose parse is unchanged, and window listeners that are removed on every drag end.

## Self-Check: PASSED

- Files: Factor Tree/factor-tree.html, assets/i18n/factor-tree.js, palette-probe.js all exist.
- Commits: e096f8d, 4dd29a6 and db6a1fa are ancestors of HEAD.
- `commits: 3` is measured from `f4749ed..HEAD`.
