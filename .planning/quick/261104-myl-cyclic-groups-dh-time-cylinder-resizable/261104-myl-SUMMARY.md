---
phase: quick-261104-myl
plan: 01
subsystem: cyclic-groups
tags: [diffie-hellman, time-cylinder, resize, zoom, pan, svg]
status: complete
commits: 1
plan_head_before: 9e5ad75c47932b462de605d231db879712e44083
plan_head_after: 77607b1876fba6c2ff0a6db7a028331b7a1932c1
key-files:
  modified:
    - Cyclic Groups/cyclic-groups.html
    - assets/i18n/cyclic-groups.js
actuals:
  tasks: 3
  commits: 1
---

# Quick 261104-myl: Resizable, zoomable, pannable DH time cylinder

The Diffie–Hellman time cylinder window now resizes freely (width and height apart) up to the Ring window's room, has a head button that fills that room, and its picture zooms about the pointer, tilts from side view to top view, moves under a Shift/middle drag and resets, by mouse, keyboard and corner buttons.

## Commits

One code commit on dh-cylinder-base, cherry-picked (same patch-id) onto the four variants:

| Branch | Commit | Count over base |
|---|---|---|
| dh-cylinder-base | 77607b1 (on top of 9e5ad75) | 22cd9e4 + 2 |
| dh-cylinder-hop-shared | 7dd57bf | base + 3 |
| dh-cylinder-hop-split | 0d5dd61 | base + 3 |
| dh-cylinder-frame-shared | 90afbdc | base + 3 |
| dh-cylinder-frame-split | 33e7962 | base + 3 (checked out) |

Files: `Cyclic Groups/cyclic-groups.html`, `assets/i18n/cyclic-groups.js` only. Cherry-picks applied with no conflicts.

## Verification per branch

Probe `.planning/quick/261104-myl-cyclic-groups-dh-time-cylinder-resizable/dhc-nav-probe.mjs` (untracked; every krz check kept plus ~40 new ones), desktop 1440x900 and `?mobile=1`, zero console errors:

| Branch | Args | Result | Free resize (grip drag -700,+400) | Filled window |
|---|---|---|---|---|
| hop-shared | --slices 32 --cyls 1 | all PASS | 306x480 -> 1006x740 | 1426x733 |
| hop-split | --slices 32 --cyls 2 | all PASS | 306x394 -> 1006x740 | 1426x733 |
| frame-shared | --slices 7 --cyls 1 | all PASS | 306x480 -> 1006x740 | 1426x733 |
| frame-split | --slices 7 --cyls 2 | all PASS | 306x394 -> 1006x740 | 1426x733 |

Gates on every branch: inline scripts parse (3), `node --check assets/i18n/cyclic-groups.js`, i18n-check `--coverage` 91, `--literals-markup` 4, `--literals-js` 131 (unchanged), exactly one `function dhcTimeline` and one `function dhcLayout`, `git diff --stat BRANCH~1 BRANCH` names only the two files, tip patch-id equals the base commit's. Added lines contain no `innerHTML` and no colour literal. `git diff --quiet 22cd9e4 main -- "Cyclic Groups" assets` holds (main's code untouched). dh-cylinder-frame-split is checked out, tracked tree clean, stash@{0} untouched.

Vacuity: with the two `.dhc-svg` wheel-handler exemptions temporarily disabled the probe's wheel check FAILED (wheel stepped the subgroup, gen 5 -> 4); with them restored it passes (subgroup row and address bar unchanged).

Large end-state screenshots (1426x733 filled window at the end of the exchange, DH window on top):
- /tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools-Cyclic-Groups/7b1aec4c-182d-40fc-bab9-2a4f204cc865/scratchpad/dh-cylinder-hop-shared/large-end.png
- /tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools-Cyclic-Groups/7b1aec4c-182d-40fc-bab9-2a4f204cc865/scratchpad/dh-cylinder-hop-split/large-end.png
- /tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools-Cyclic-Groups/7b1aec4c-182d-40fc-bab9-2a4f204cc865/scratchpad/dh-cylinder-frame-shared/large-end.png
- /tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools-Cyclic-Groups/7b1aec4c-182d-40fc-bab9-2a4f204cc865/scratchpad/dh-cylinder-frame-split/large-end.png

(Each folder also has step0.png, end.png and probe.log.) Read for hop-shared and frame-split: the cylinder fills the window, the 32-slice cylinder is legible, the DH window's Back/Step/Play/Instant sit visibly on top.

## Controls the user now has

- Corner grip (bottom left): free resize in width and height; double-click on it puts the window back. The picture scales with the window, the head, legend and hint text keep their size.
- Head fill button (between the title and close): fills the Ring window's room under the rows and above the bottom bar; pressed again it restores the earlier size and place. A grip drag or double-click on the grip drops the filled state; closing unfills.
- Drag: turn sideways and tilt (tilt range now side view to straight down the time axis, pitch 0..pi/2). Shift+drag or middle-button drag: move the cylinder within the picture. The window itself moves only by its head.
- Wheel, touchpad pinch / Ctrl wheel: zoom about the pointer (0.4..8); slices and beads spread apart while dots, lines and numerals keep their size. Subgroup selection, address bar and the ring's zoom are left alone.
- Corner buttons (picture's top right): zoom out, zoom in, reset view. Double-click on the picture resets too.
- Keys with the picture focused: arrows turn/tilt, Shift+arrows move, + / = and - / − zoom, 0 or Home reset.
- Hint under the picture names these controls.

Try it: `git checkout -q BRANCH`, open `Cyclic Groups/cyclic-groups.html?mode=multiplicative&n=23&gen=5&dh=5,6,15`, press Time cylinder in the Diffie–Hellman window.

## Deviations from Plan

- [Probe, not product] After Instant the DH window grows (about 390 px tall) and, now that it deliberately has the higher z-index, lies over the top of the default-size cylinder window (bottom of its head and picture). The probe therefore sets `#dh-plot` to `pointer-events:none` between Instant and the DH-grip regression check so the cylinder's own drag/wheel/head checks reach the cylinder, restoring it before the DH grip check and the fill/z-order check.
- Observation (not changed, per the plan's explicit z-index rule): with the window filled, the DH window covers the cylinder window's top-right head buttons (fill and close). The window can still be unfilled via the DH window's own Time cylinder toggle button, a double-click on the cylinder's grip, or by moving the DH window by its head. A follow-up could keep a clear strip for those two buttons.
- The new English hint is longer, so the default-size window is about 30 px taller than before (e.g. 363 -> 394 px on frame-split).

## Known Stubs

None.

## Threat Flags

None (input only changes clamped view numbers and the window's own size; no new endpoints, no HTML-string assignment, new strings via translate/data-i18n).

## Self-Check: PASSED

- Commits 77607b1, 7dd57bf, 0d5dd61, 90afbdc, 33e7962 exist and are ancestors of their branches; patch-ids match.
- Files exist: Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js, dhc-nav-probe.mjs.
