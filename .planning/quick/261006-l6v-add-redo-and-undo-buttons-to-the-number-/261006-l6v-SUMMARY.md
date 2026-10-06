---
phase: quick-261006-l6v
plan: 01
subsystem: factor-tree, venn-diagram, nt-store, i18n
tags: [undo, redo, history, palette, shared-store, i18n, headless-probe]
status: complete
requires:
  - NT.store number-palette (validatePalette, writeShared)
  - common i18n namespace (assets/i18n/site.js)
provides:
  - NT.store.writeSharedPalette(values): validated whole-palette replace
  - common.undoPalette / redoPalette / undoWork / redoWork in sixteen languages
  - Undo/Redo icon buttons for the palette and the working area on Factor Tree and Venn Diagram
  - .planning/quick/261006-l6v-.../undo-probe.js (headless Chrome over 127.0.0.1)
affects:
  - Factor Tree/factor-tree.html
  - Venn Diagram/venn-diagram.html
  - assets/nt-store.js
  - assets/i18n/site.js
key-files:
  created:
    - .planning/quick/261006-l6v-add-redo-and-undo-buttons-to-the-number-/undo-probe.js
  modified:
    - assets/nt-store.js
    - assets/i18n/site.js
    - Factor Tree/factor-tree.html
    - Venn Diagram/venn-diagram.html
    - .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js
key-decisions:
  - "Palette history holds ascending number lists; restores go through NT.store.writeSharedPalette, then the page reconciles to the returned list"
  - "Factor Tree work history holds JSON snapshots of every card (tree shape, folds, mirrors, first-unfold flags; overlaps by numbers + balanced flag + per-node fold/mirror arrays; a mid-split card as its two end trees)"
  - "Venn work history is a per-mode clone of the regions, one stack pair on twoCtx and one on threeCtx"
  - "Recording compares before and after and pushes only when they differ, so refused gestures are never undo steps"
  - "A palette storage event clears the palette history; an ab-params fill on Venn clears the two-circle history"
  - "Keyboard shortcuts drive the working area only and are ignored in INPUT/TEXTAREA/SELECT and contentEditable targets (tagName checks, since i18n-check's literals-js flags a selector string)"
metrics:
  completed: 2026-10-06
  tasks: 3
  commits: 3
actuals:
  tokens: 18400
  tasks: 3
  commits: 3
plan_head_before: dc3f903ab3c39b072318c14dee98e08bc349cdde
plan_head_after: 026090da1382f96e734f9019f7d1dd23221722a7
commits: 3
---

# Phase quick-261006-l6v Plan 01: Undo/Redo for the palette and the working area Summary

Undo and Redo icon buttons for the shared number palette and for the working area on both Factor Tree and Venn Diagram, backed by a new validated `NT.store.writeSharedPalette`, four shared i18n keys in sixteen languages, and a headless-Chrome probe that exercises every gesture over a 127.0.0.1 server.

## What was built

**Task 1 (e85bfc5): palette Undo/Redo on Factor Tree.**
- `NT.store.writeSharedPalette(values)`: runs the list through `validatePalette`, writes nothing and returns `null` when it is malformed, otherwise writes via `writeShared` and returns the sorted copy. Exported in the frozen object. Stored shape unchanged.
- `common.undoPalette`, `redoPalette`, `undoWork`, `redoWork` appended to all sixteen `common` blocks (ru/el in their own script).
- Factor Tree: `#paletteUndoBtn` / `#paletteRedoBtn` after Delete all in `.palette-tools` (40x40, `.history-btn`, accent hover, `.4` disabled opacity, `--ctl-focus` ring). History in memory, capped at 100, recorded in addFromInput, removePaletteItem (covers bin drop and Delete key) and Delete all. A storage event clears the history; so does a `pageshow` restore with a changed list.
- `undo-probe.js` created (scratch site, `python3 -m http.server --bind 127.0.0.1`, throwaway Chrome profile, server killed via its child handle).
- pl0 probe K1 updated to the four-child row.

**Task 2 (a003e69): Factor Tree working-area Undo/Redo.**
- `.work-tools` wrapper holds Clear, `#workUndoBtn`, `#workRedoBtn` (32x32, `aria-keyshortcuts`).
- `snapshotWork` / `decodeView` / `restoreWork`: exact restore of cards, order, numbers, folds, mirrors, first-unfold state and gcd overlaps. `buildOverlapCard` gained a `balanced` parameter (stored on the view) and `splitHalves(o)` was extracted so a mid-split card encodes as its two end trees.
- `trackWork` wraps drag end (compose, overlap, drop, bin), palette click, Clear, both remove buttons, split, fold badges and mirror circles. Load-time placements, restore and the split completion are not recorded.
- Ctrl/Cmd+Z, Ctrl/Cmd+Shift+Z, Ctrl+Y on the document, ignored in inputs and during a drag.

**Task 3 (026090d): Venn Diagram palette and diagram Undo/Redo.**
- Palette pair after Delete all (40x40); diagram pair in `.history-pair` after Clear all (36x36).
- `commitRegions` records the pre-commit clone right after `ctx.setRegions` (after every refusal check); `clearAll` records too. One `history` per ctx (two/three). Undo/Redo write the restored layout through `ctx.persist()` (own record plus the shared a/b pair for two circles).
- Storage handler: palette event clears the palette history, an ab-params fill clears the two-circle history. `setMode` re-syncs the buttons.
- pl0 probe U1 updated to the four-child row.

## Verification

All run at HEAD 026090d:

| Gate | Result |
|------|--------|
| undo-probe.js all | `L6V-PROBE PASS (31 scenarios)` (ft 18, ftpair 3, venn 10) |
| pl0 shared-palette-probe | `PL0-PROBE PASS (29 scenarios)` |
| edj enter-probe | `EDJ-PROBE PASS (9 scenarios)` |
| kaz palette-probe failing set | `D1 D2 P11 P12 P13 P4 P8 P9` (unchanged, pre-existing) |
| i18n-check `--all` | pass (all six static modes) |
| i18n-check `--switcher-present --all` | pass |
| i18n-check `--api` / `--persistence` / `--smoke` | 399 / 248 / 123 assertions pass |
| shadow-check `--all` | pass, no DUP findings |
| diff vs dc3f903 | 0 colour literals, 0 `innerHTML` added in the two pages |

Visual review: headless screenshots (day and night, both pages) in the session scratchpad show the palette row (bin, Delete all, Undo, Redo) and both work headers correctly aligned and dimmed while disabled. No python http.server process left running.

## Deviations from Plan

**1. [Rule 3 - Blocking] Selector string in the keyboard guard flagged by i18n-check.**
- **Found during:** Task 2 gate run
- **Issue:** `t.closest('input, textarea, select')` was reported as `UNTRANSLATED-JS` by `literals-js`.
- **Fix:** replaced with `tagName` comparisons (Factor Tree) and the page's existing `/^(INPUT|TEXTAREA|SELECT)$/` regex idiom (Venn). Behaviour identical, since those elements have no children.
- **Files modified:** Factor Tree/factor-tree.html, Venn Diagram/venn-diagram.html
- **Commit:** a003e69 (Factor Tree), 026090d (Venn)

**2. Probe scenario adjustments (not product changes).** F7/V4 write the incoming list to the store before dispatching the storage event (as another tab would); V5 expects the default layout on Undo because Venn persists nothing until the first change; V7 picks a prime unused by the three-circle layout so no simplification moves it; W5 waits one tick after a synthetic drag because `markDragEnded` swallows palette clicks until the next task.

**3. TDD ordering.** For Tasks 2 and 3 the probe scenarios were written before the implementation, but the first red run was not captured as a separate commit (the plan commits once per task); each task landed as one commit with its green probe run.

No auth gates. No architectural (Rule 4) changes.

## Known Stubs

None.

## Threat Flags

None. `writeSharedPalette` validates through the existing `validatePalette` (T-l6v-01); storage events are still parsed only via `readSharedPalette` / `readSharedAB` and now reset the page's history (T-l6v-02); stacks are capped at 100 (T-l6v-03); no markup-string assignment added (T-l6v-04); the probe server is bound to 127.0.0.1 and killed by its child handle (T-l6v-05).

## Self-Check: PASSED

- Files: assets/nt-store.js, assets/i18n/site.js, Factor Tree/factor-tree.html, Venn Diagram/venn-diagram.html, undo-probe.js, shared-palette-probe.js all exist and are in the three commits.
- Commits e85bfc5, a003e69, 026090d are ancestors of HEAD; `git rev-list --count dc3f903..HEAD` = 3.
- `git status` shows only unrelated pre-existing changes (`.planning/config.json`) and untracked files, none staged.
