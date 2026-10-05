---
phase: quick-261005-hz0
plan: 01
subsystem: factor-tree
tags: [factor-tree, i18n, svg, accessibility, mirror]
requires: []
provides:
  - Factor Tree header and tab title read the plain tool name in 16 languages
  - Dashed mirror lines and branch mirroring on two-child circles
affects:
  - "Factor Tree/factor-tree.html"
  - assets/i18n/factor-tree.js
tech-stack:
  added: []
  patterns: [rAF tween with settle-timer fallback guarded by a per-view token, shared assignTreeX re-run after reversing a branch]
key-files:
  created:
    - .planning/phases/06-multi-language-support/i18n-config/factor-tree.json
    - .planning/quick/261005-hz0-factor-tree-drop-prime-from-header-title/mirror-probe.js
  modified:
    - "Factor Tree/factor-tree.html"
    - assets/i18n/factor-tree.js
decisions:
  - "MD-2: mirror lines appear only on two-child circles (root/internal); leaves get none"
  - "MD-3: lines and clickability arm together once the tree has finished growing"
  - "MD-4: mirroring reverses child order through the branch and re-runs assignTreeX, rather than a literal reflection"
  - "MD-8: assets/i18n/hub.js untouched; the hub card still says Prime Factor Tree"
metrics:
  duration: "about 25 minutes"
  completed: 2026-10-05
status: complete
commits: 2
plan_head_before: ec4ddc71d353016436473dd741e84fcbec652356
plan_head_after: edfdfaaa91dfd9bedfade3abf4c3e29deabd063f
actuals:
  tokens: 30000
  tasks: 2
  commits: 2
---

# Phase quick-261005-hz0 Plan 01: Factor Tree header and mirror lines Summary

The Factor Tree page header and tab title now read the tool's plain nav name in all sixteen languages, and every circle with two children gets a dashed vertical mirror line that mirrors its branch when clicked, focused and activated by keyboard, or tapped.

## What changed

- `title` and `heading` in `assets/i18n/factor-tree.js` equal `site.nav.factorTree` in every language; the markup fallbacks read "Factor Tree". New `mirrorLabel` key ("Mirror the branches below {n}") in all sixteen languages, used as the circle's SVG `<title>` (tooltip and accessible name).
- `renderTree` now builds a `treeView`. After growth finishes (`finalDelay + 700 ms`), `armMirrors` clears the edges' dash styles, adds `.mirror-axis` lines, and makes two-child circles `role="button"` / `tabindex="0"` / `aria-pressed`.
- Click, Enter or Space calls `mirrorBranch`: reverse the child order through the branch, re-run the shared `assignTreeX`, then `moveTree` tweens (450 ms, `easeInOutCubic`; instant under reduced motion) circles, labels, axes and edges. A second activation restores. Auto-repeat keydowns are ignored.
- `onLangChange` calls `relabelMirrors()` so mirrored branches survive a language change and the labels re-translate.
- Allow-list `i18n-config/factor-tree.json` for the `(prefers-reduced-motion: reduce)` media-query string.

## Notes for the record

- MD-2: lines appear only on two-child circles (root/internal, including a prime that splits 1 x p). Leaf circles (prime leaves and 1s) have none, because nothing sits beneath them to mirror.
- MD-3: lines fade in and circles become clickable at the same moment, once the tree has finished growing; nothing is clickable while it grows.
- MD-4: mirroring is a reversal of child order plus a shared-layout re-run, not a literal reflection about the circle's x. In a lopsided Classic tree the clicked circle, its line and its mirrored branch may therefore slide sideways so the branch stays in its own leaf-slot lane; ancestors re-centre. Relative to the clicked circle, every descendant lands at exactly the negated offset. A literal reflection would have thrown leaves off the canvas (for 60, leaf 7 would land at slot -2.5).
- MD-8: `assets/i18n/hub.js` was left untouched, so the index card still says "Prime Factor Tree". Candidate follow-up if the user wants the hub card renamed too.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Stale tween frame could overwrite the settle snap**
- **Found during:** Task 2 (probe C8, default run: after Space the tree stayed mirrored)
- **Issue:** The settle timer snapped to the targets but left the token current, so a still-pending rAF frame could write interpolated positions back over the snap. The rAF timestamp was also compared against `performance.now()`, which can disagree under virtual time.
- **Fix:** The settle timer now bumps `tweenToken` after snapping, and the tween start time is taken from the first frame's own timestamp. The frame time is clamped to >= 0.
- **Files modified:** `Factor Tree/factor-tree.html`
- **Commit:** edfdfaa

No other deviations. The plan's `files_modified` list was followed exactly (no change to `assets/nt-layout.js`, `assets/nt-svg.js`, `assets/i18n/hub.js`).

## Verification

- `node .planning/quick/261005-hz0-factor-tree-drop-prime-from-header-title/mirror-probe.js`: 26 PASS (N1-N4, plus C1-C11 in the default run and in the `--force-prefers-reduced-motion` run), run twice for stability.
- `node .planning/phases/06-multi-language-support/i18n-check.js --all`: exit 0, 16 pages.
- `node .planning/phases/07-shared-js-module-refactor/harness.js`: HARNESS PASS.
- Not checked by a human in a visible browser; the probe drives headless Chrome only.

## Known Stubs

None.

## Threat Flags

None. New text lands only through `textContent`; no new inputs, endpoints or storage.

## Commits

- e6ca8f4: feat(quick-261005-hz0): Factor Tree header reads plain name; dashed mirror lines flip branches
- edfdfaa: feat(quick-261005-hz0): keyboard, reduced motion and language-change handling for mirror lines

## Self-Check: PASSED

- FOUND: Factor Tree/factor-tree.html, assets/i18n/factor-tree.js, i18n-config/factor-tree.json, mirror-probe.js
- FOUND commits e6ca8f4 and edfdfaa
