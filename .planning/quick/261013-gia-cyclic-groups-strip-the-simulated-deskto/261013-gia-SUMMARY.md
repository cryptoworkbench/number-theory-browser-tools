---
quick_id: 261013-gia
phase: quick
plan: 261013-gia
subsystem: cyclic-groups
tags: [cyclic-groups, refactor, layout, window-manager-removal]
status: complete
completed: 2026-10-13
requires: []
provides:
  - "Cyclic Groups page without the simulated desktop: the ring's body fills the diagram frame"
affects:
  - "Cyclic Groups/cyclic-groups.html"
  - "assets/i18n/cyclic-groups.js"
tech-stack:
  added: []
  patterns:
    - "syncPanes() (as in _Cyclic Groups) replaces syncWindows(); one ring body, mounted once, parts moved in with comment placeholders"
key-files:
  created: []
  modified:
    - "Cyclic Groups/cyclic-groups.html"
    - "assets/i18n/cyclic-groups.js"
decisions:
  - "The ring body (.fs-win-body.is-ring.ring-body) is absolutely positioned at inset 0 inside .diagram-frame, padding 12px 20px; the ctl row gets 32px right padding and the iso pane's close button moves 36px left, so both stay clear of the corner full-screen button"
  - "The is-desktop class and IS_DESKTOP flag keep their names (they mark the top-level page); only comments changed"
  - "Notice element, renderNotice and whyNotCyclicKey were removed from this page; no dictionary keys were deleted"
  - "The 'measure' frame message and ringNeeds() went with the Fit button, as _cyclic-groups.html had already done"
metrics:
  duration: "~45 min"
  tasks: 1
  files: 2
actuals:
  tokens: 22800
  tasks: 1
  commits: 1
plan_head_before: b09b5b03158d54094ce8b46099cbd4132fdb2917
plan_head_after: d963fc411542850395b18e9ad7ae49d321dd7d0b
---

# Quick 261013-gia: Cyclic Groups without the simulated desktop Summary

The window manager is gone from `Cyclic Groups/cyclic-groups.html`. After the intro, the ring's body fills the whole screen with no window chrome. `syncPanes()` mounts it once, the same way `_Cyclic Groups` does. The file went from 7980 to 7063 lines.

## What was removed
- Window building and mounting (`buildWindow`, `mountWindow`, `defaultGeom`, `geomPx`, `setWinPx`, `layoutWindows`, `winRect`, `toFractions`), along with title bars and their dup/alpha/fit/max/close buttons and the transparency slider.
- Move, resize and snap code: `alignEdges`, `catchShift`, `snapZone`, the drag listeners, the snap preview and the maximize double-click.
- The taskbar, launcher, menu, `#fs-exit` and `#fs-snap` markup and code, with the window actions (tile, cascade, show desktop, new ring).
- The Notice window, the `#notice` element, `renderNotice` and `whyNotCyclicKey`.
- Extra Ring windows: `extraSpec`, `entryOf`, `ringWinSrc`, `buildFrame`, `openRingWindow`, `removeRingWindow`, and their `state`/`measure`/`raise` frame messages on the host side. `ringNeeds` and `fitRing` went too.
- The `cyclic-groups-fs-windows` state (`readFsState`, `writeFsState`). The page now clears the stale key on load.
- The matching CSS: `.fs-win*` chrome, `.fs-rs`, `.fs-alpha`, `.fs-snap`, `.fs-task*`, `.fs-launcher`, `.fs-tray*`, `.fs-win-body.is-frame`, `.is-win-drag`, `.is-cornered` and `.notice`.

## What was kept
- The intro screen, `#cg-enter`, the hidden header after entering and the corner `#fullscreen-btn`.
- `FS_PANELS` with only the ring's ids and rows. `partHolder`, `RING_DROP`, `cleanRingQuery`, `ringWinGroup` and `svgIcon` stay.
- The `ringwin=1&isopane=1` iframe mode (`enterRingWin`, the pane's `raise`/`look`/`iso`/`shared`/`split` messages) and `preview=1`.
- The padlock, `keepLockClear`, the shared and per-pane Numerical buttons, the split view and F8, the right-click ring menu, colours, rotation and the auto-rotate ruler.
- `.fs-menu*`/`.fs-icon` CSS, because the ring menu uses it, and `.fs-win-btn`, because the scratchpad and iso-pane close buttons use it.
- The tab title: "Cyclic Groups" before entering, then `ringTitle()` (for example `⟨5⟩ ⊆ ⟨ℤ/12ℤ, +⟩` or `⟨ℤ/12ℤ, +⟩ ≅ ⟨ℤ/12ℤ, +⟩`).
- The English `introAbout` was updated in the HTML fallback and in `assets/i18n/cyclic-groups.js`.

## Verification
- After entering there are no `.fs-win`, title bars, resize grips, taskbar or `#notice`. The ring body is at [0,0,1500,1000] in a 1500×1000 viewport, and [0,0,900,700] at 900×700 with no horizontal overflow.
- The spin step rotates the ring and updates `rot`. The Numerical split opens with 12 rows and F8 closes it. The right-click menu opens with 10 items. Multiplicative n=8 (not cyclic) shows no notice.
- Stale `cyclic-groups-fs-windows` (with an extra-window entry) is removed on load, and no extra iframe is created.
- Regression scripts after entering:
  - `isofix`, `unlink`, `unlockopen`: identical output.
  - `rotsync`: identical except START pane −10 → 0. HEAD's −10 was a timing flake: HEAD run serially gives 0 twice.
  - `midbtn`: absolute y positions moved up because the body now starts at y=0. The invariants hold: button centre equals the divider (757), the padlock sits 6px over the button, and the pair is centred on the ring's middle. The unlinked per-pane button x is 670 instead of 632 because the rows are wider.
- i18n-check `--header` and `--switcher-present` PASS, unchanged. `--coverage --all` gives the same 30 English-first LANG-KEYSET findings as before.
- Zero console errors in the page and the pane iframe in every run.

## Deviations from Plan
None. The plan asked for "sensible padding"; the choice is recorded under decisions.

## Known Stubs
None.

## Self-Check: PASSED
- FOUND: Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js
- FOUND: d963fc4 (ancestor of HEAD)
