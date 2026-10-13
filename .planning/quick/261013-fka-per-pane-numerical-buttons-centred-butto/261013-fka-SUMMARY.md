---
quick_id: 261013-fka
phase: quick
plan: 261013-fka
subsystem: cyclic-groups
tags: [cyclic-groups, isomorphism-pane, split-view, numerical]
status: complete
completed: 2026-10-13
key-files:
  modified:
    - Cyclic Groups/cyclic-groups.html
    - _Cyclic Groups/_cyclic-groups.html
decisions:
  - The centred button is placed in pure CSS (absolute in the gen row, left calc(100% + column gap), top 50%), keyed on is-iso-unlinked, so no JS measuring and no re-sync calls were needed for placement
  - The padlock (not the button) moves aside when the two would overlap
actuals:
  tokens: 3600
  tasks: 1
  commits: 1
plan_head_before: bf59b14cdde3df9b2c714a03f7c73870442b91fd
plan_head_after: 41e5168c642be6fe957e31f623fcf899cc6d844d
---

# Quick 261013-fka: Per-pane Numerical buttons, one centred while linked

Unlinked rings each have their own Numerical button and list. While linked, the left ring's button sits centred on the divider at the height of its subgroup row and toggles both lists, showing the merged table.

## What changed (identical in both copies)
- **CSS:**
  - While the root has no `is-isopane` or `is-iso-unlinked` class and the pane is open, the host's `#split-btn` is placed absolutely in `.fs-win-row-gen` (left `calc(100% + 14px)`, the column gap, top 50%, translate -50% -50%, z-index 3). That centres it on the pane's left border.
  - The pane's `#split-btn` is hidden only while linked (`:root.is-isopane:not(.is-iso-unlinked)`).
- **`applyIsoShared`:**
  - It adopts the host's `split` only when `d.linked === true`. Relinking (via `answerIsoAsk`'s forced post) brings the pane back in step.
  - On unlinking it clears `isoInterlockOn`.
- **F8 in the pane:** it relays to the host only while linked. Otherwise it toggles the pane's own split.
- **`keepLockClear()`:** the padlock on the divider is moved down (or up) via an inline `margin-top` when it would overlap the centred button. This happens when the split is open and the pane's mid-height reaches the gen row. It is called from `setGroupLock`, `syncOpenLock`, `syncIsoKeys` and the host's split ResizeObserver.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] The pane kept the merged state after unlinking**
- **Found during:** Task 1 verification.
- **Issue:** On unlinking, `isoOrder()` drops to 0 on both sides. `isoReceive` then discards the holder's `{iso:'interlock', on:false}` message, so the pane's `isoInterlockOn` stayed true. As a result `syncSplit` kept the pane's own list hidden even with its own split on.
- **Fix:** `applyIsoShared` sets `isoInterlockOn = false` when `d.linked` is false.
- **Commit:** 41e5168

**2. [Rule 1 - Bug] The centred button overlapped the padlock**
- **Found during:** Task 1 verification (desktop, split open).
- **Fix:** Added `keepLockClear()` (see above).
- **Commit:** 41e5168

### Notes
- In `_cyclic-groups.html` the main page is never a Ring window (no desktop), so it has no Numerical button of its own. Its list is always on the page. There, the change shows up only in the iso pane: its own button now appears while unlinked. The centred button was verified on the `_` page through its Ring-window mode (`?ringwin=1&mode=additive&n=12`).
- No new i18n strings (reuses `cyclicGroups.splitView`). No literal colours.

## Verification
- `fkaver.js` (headless Chrome) was run on the desktop page, the `_` page, the `_` page as a Ring window, and the desktop page with `lang=he` (RTL).
  - **Linked:** one visible button, `dxFromDivider` 0, vertical centre inside the host gen row. Clicking opens the merged table (12 merged rows) and clicking again closes it.
  - **Padlock open:** two visible buttons, each in its own gen row. Each toggles only its own list, and pane F8 toggles locally.
  - **Relocked:** one centred button again, splits in step. Pane F8 relays to the host.
  - **Pane closed:** the host button is back in place (`position: static`).
  - No console errors on any run.
- Regression scripts (isofix, unlink, rotsync, unlockopen, locktip, locksub, both pages) compared against a pre-change baseline: 11/12 identical. The one difference is intended: in `d-isofix` BROKEN, the pane's list panel now shows (`flex`, was `none`), because the unlinked pane's own split (inherited on) is no longer suppressed by the stuck merge.

## Self-Check: PASSED
- FOUND: Cyclic Groups/cyclic-groups.html, _Cyclic Groups/_cyclic-groups.html
- FOUND: 41e5168 in HEAD
