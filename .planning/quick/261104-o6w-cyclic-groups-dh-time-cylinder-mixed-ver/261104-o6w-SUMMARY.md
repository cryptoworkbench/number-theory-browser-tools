---
phase: quick-261104-o6w
plan: 01
subsystem: cyclic-groups
tags: [diffie-hellman, time-cylinder, switches, i18n]
status: complete
commits: 1
plan_head_before: 77607b1876fba6c2ff0a6db7a028331b7a1932c1
plan_head_after: 1273571566d53753b783ec442b391a73ebdd83f7
key-files:
  modified:
    - Cyclic Groups/cyclic-groups.html
    - assets/i18n/cyclic-groups.js
  untracked-probe:
    - .planning/quick/261104-o6w-cyclic-groups-dh-time-cylinder-mixed-ver/dhc-mixed-probe.mjs
actuals:
  tokens: 14000
  tasks: 3
  commits: 1
---

# Quick 261104-o6w: Mixed Diffie-Hellman time cylinder

One window, four variants: the time cylinder now switches live between one slice per hop and one per frame, and between one shared cylinder and two separate ones, keeping the exchange's step, its playback, the view and the window's size.

## Commit and branch

- Branch `dh-cylinder-mixed` = `dh-cylinder-base` (77607b1) + 1 commit: **1273571** (touches only `Cyclic Groups/cyclic-groups.html` and `assets/i18n/cyclic-groups.js`), both trailers present.
- Checked out, tracked tree clean. The five other dh-cylinder branches keep their SHAs (base 77607b1, hop-shared 7dd57bf, hop-split 0d5dd61, frame-shared 90afbdc, frame-split 33e7962); main's code still equals 22cd9e4; stash@{0} untouched; untracked files untouched.

## What was built

- Verbatim pieces from the variant commits (hop timeline 25cfa02, frame timeline e4a6b28, shared layout c3fc845, split layout 2da045f), only their opening lines renamed to `dhcTimelineHop`, `dhcTimelineFrame`, `dhcLayoutShared`, `dhcLayoutSplit`; each defined exactly once (gate-checked), with `dhcTimeline(G)` / `dhcLayout(tl)` as one-statement dispatchers over `DHC_TIMELINES[dhc.slices]` / `DHC_LAYOUTS[dhc.cyls]`. drawDhCyl's call site is unchanged.
- State: `dhc.slices` ('hop' default) and `dhc.cyls` ('split' default), read by `readDhcView` (whitelist by `hasOwnProperty`, try/catch). Storage keys: `cyclic-groups-dhc-slices` and `cyclic-groups-dhc-cyls`.
- `syncDhCyl`'s signature gained `dhc.slices, dhc.cyls` after `dhc.panY`; `drawDhCyl`'s fade-in id gained them after `dh.b` (a switch never replays a fade-in, the next step still does).
- `setDhcMode` / `syncDhcMode`: redraw at once, clamp pan, re-place a default-size window; never touches `dh.step`, the play timer, yaw/pitch/zoom/pan (beyond the clamp), the filled flag or the window's inline size.
- Switch placement (as decided): `Shared | Separate` (`#dhc-cyls`) in the picture's top-left corner on the line of the zoom/reset buttons; `Per hop | Per frame` (`#dhc-slices`) in the bottom-left corner. Each is a `plot-view dhc-switch` role=group with aria-pressed buttons (mouse, Enter, Space), as tall as the corner buttons.
- Default-size window: width, left and top are kept; its height follows the drawing (394 px split, 479.8 px shared, at 1440x900 it stays inside the viewport); a grip-sized or filled window keeps its exact size.
- i18n: ten English-only keys (`dhCylCylsLabel`, `dhCylShared`, `dhCylSharedTip`, `dhCylSeparate`, `dhCylSeparateTip`, `dhCylSlicesLabel`, `dhCylPerHop`, `dhCylPerHopTip`, `dhCylPerFrame`, `dhCylPerFrameTip`) named in the header comment's English-first list; other languages fall back to English.

## Verification

`node .planning/quick/261104-o6w-.../dhc-mixed-probe.mjs --slices 32 --cyls 2 [--shots DIR]` run on the committed tip: **RESULT: all PASS (109 checks)**, zero console errors on desktop, after both reloads, and on `?mobile=1` (cylinder window hidden).

- All copied myl checks pass (resize, wheel, buttons, fill, keys, tilt, pan, reset).
- Structure: both groups labelled, two titled buttons each, default Separate + Per hop, Shared | Separate left of the zoom buttons, Per hop | Per frame inside the picture, both as tall as the corner buttons.
- The four combinations at the end of the exchange (g=5, a=6, b=15 in (Z/23Z)*): hop + shared 32 slices / 1 cylinder; frame + shared 7 / 1; frame + split 7 / 2; hop + split 32 / 2. Walls = 2 x cylinders, a key mark on every cylinder, no NaN, pressed state follows the choice.
- View kept: Per frame and back, and Shared and back, are byte-identical to the starting picture; tilt and zoom carry over to Shared (rx ratio 100/78 within 0.5%).
- Size kept: default window keeps width/left/top over Shared and returns within 2 px; the top-left switch does not move; a grip-sized window keeps its exact size across all four combinations; the filled window keeps its exact size for all four and its fill button stays pressed.
- Step kept: at step 3, hop tables give 16 slices x cylinders, frame 4 x cylinders in all four combinations. Mid-playback switching (Per frame, then Shared) keeps the play button pressed and the step; playback continues to the next step with the right slice counts.
- Keyboard: Enter and Space press all four buttons and focus stays on them.
- Storage: both keys hold the choice; after reload frame + shared shows 1 cylinder / 7 slices; `constructor` and `bogus` stored values fall back to hop + split (2 cylinders, 64 front rims).
- Gates: parse of 3 inline scripts, `node --check assets/i18n/cyclic-groups.js`, six function definitions once each, four pieces verbatim, no `innerHTML` or colour literal in added lines. i18n gates: coverage 91, literals-markup 4, literals-js 131 (unchanged).

Screenshots (executor scratchpad, fill-size 1440x900 window):

- /tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools-Cyclic-Groups/7b1aec4c-182d-40fc-bab9-2a4f204cc865/scratchpad/dh-cylinder-mixed/fill-hop-split.png
- /tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools-Cyclic-Groups/7b1aec4c-182d-40fc-bab9-2a4f204cc865/scratchpad/dh-cylinder-mixed/fill-hop-shared.png
- /tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools-Cyclic-Groups/7b1aec4c-182d-40fc-bab9-2a4f204cc865/scratchpad/dh-cylinder-mixed/fill-frame-shared.png
- /tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools-Cyclic-Groups/7b1aec4c-182d-40fc-bab9-2a4f204cc865/scratchpad/dh-cylinder-mixed/fill-frame-split.png

fill-hop-split and fill-frame-shared were viewed: legible cylinder(s) filling the window, switches in the top-left and bottom-left corners, zoom/reset buttons top-right. The other two were produced by the same passing run and not individually viewed.

## How to try it

`git checkout -q dh-cylinder-mixed`, open `Cyclic Groups/cyclic-groups.html?mode=multiplicative&n=23&gen=5&dh=5,6,15`, press Time cylinder, and use the Shared | Separate and Per hop | Per frame switches.

## Deviations from Plan

1. [Rule 1 - probe bug] The plan's `stepOf()` formula (6 - count of `.dh-cell.is-later` / 3) ignores that the key cell below the grid also carries `is-later` until the last step; the probe computes `n ? 6 - (n-1)/3 : 6` instead. No product change.
2. [Probe check] "Switches are 20 px tall" compares against the zoom/reset button height instead (the picture is rendered at a 0.9 scale in the default window, so both are 18 px); the intent (as tall as the corner buttons) is kept.
3. The dispatchers are written over three lines (`function dhcTimeline(G){` / one `return` / `}`) rather than a single physical line, so the plan's own definition-count gate (line equals `function dhcTimeline(G){`) holds.
4. English apostrophes in the markup titles and the i18n values are the literal typographic apostrophe, as elsewhere in the file.

## Self-Check: PASSED

Commit 1273571 is an ancestor of HEAD; files and probe exist; tree clean on dh-cylinder-mixed.
