---
phase: quick-261011-hz1
plan: 01
subsystem: cyclic-groups
tags: [cyclic-groups, fullscreen, windows, iframe, postMessage, i18n-english-only]
requires: []
provides:
  - "Extra, independent Ring windows on the Cyclic Groups full-screen desktop (ringwin=1 embed mode + frame-backed windows)"
affects:
  - "Cyclic Groups/cyclic-groups.html"
  - "assets/i18n/cyclic-groups.js"
tech-stack:
  added: []
  patterns:
    - "iframe of the page itself in an embed mode (follows the preview=1 precedent)"
    - "postMessage between page and frames, frames identified by e.source === frame.contentWindow"
key-files:
  created:
    - ".planning/quick/261011-hz1-cyclic-groups-fullscreen-multiple-indepe/ringwin-probe.js"
  modified:
    - "Cyclic Groups/cyclic-groups.html"
    - "assets/i18n/cyclic-groups.js"
decisions:
  - "D-01: each extra window is an independent Ring window (own modulus, operation, subgroup, rotation)"
  - "D-02: all other panels keep following the original ring; the frame map (frameKeyOf) and the message handler are the extension point"
  - "D-03: fsNewRing and fsDuplicateRing are English-only"
  - "D-04: three commits on main, nothing pushed"
metrics:
  duration: "one session"
  completed: 2026-10-11
status: complete
commits: 3
plan_head_before: 671f9a08d0a081b8f99fc27be831fcea2bc9956c
plan_head_after: f6f1c13e5f8a4b196a185f676110083f0c501677
actuals:
  tokens: 14000
  tasks: 3
  commits: 3
---

# Phase quick-261011-hz1 Plan 01: Extra Ring windows in the full-screen desktop Summary

Full screen, the launcher's "New ring window" and a + button on every ring window's title bar open as many independent Ring windows as the user likes. Each is an iframe of the same page in a new embed mode (`ringwin=1`) with its own group, operation, subgroup and rotation, and they are first-class desktop windows that survive leaving full screen and later visits.

## Commits

| Task | Commit | Message |
| ---- | ------ | ------- |
| 1 (tracer) | f458992 | feat(cyclic-groups): open another ring window from the full-screen launcher |
| 2 | bbebdaf | feat(cyclic-groups): ring windows open copies, come to the front on a click and follow the theme and language |
| 3 | f6f1c13 | feat(cyclic-groups): extra ring windows are remembered across visits |

## What was built

- **Embed mode** (`IS_RINGWIN`, `:root.is-ringwin`): the page moves the seven Ring-window parts (group-controls, gen-field, ring-head, ring-svg, spin-ruler, combine-key, rotate-ctl) into one `.ringwin-body` that fills the frame, hides all page chrome, and has a transparent background. The full-screen-only Ring-window CSS rules have `:root.is-ringwin` twins; the 640px media rules are neutralized for it.
- **No shared writes**: in a frame, `persistGroup`, the shared-group storage listener, `writeFsState`, the formula-position write and the readFsState extras are all guarded. The frame's `mirrorToUrl` posts its query to the parent instead of calling `history.replaceState`.
- **Desktop**: `fsState.extras` (`{ key, q }`), `allSpecs()` replacing every `FS_PANELS` iteration, `addFsTask` / `removeFsTask`, `mountWindow` / `buildFrame` (frames are never moved in the DOM), `openRingWindow`, `removeRingWindow`, frame geometry defaults, frame titles from `buildGroup`.
- **Remembering**: `readFsState` validates extras (`/^ringwin\d{1,6}$/`, string q of at most 4000 chars, first entry per key, q re-serialized by `cleanRingQuery`); task buttons and menu items for stored extras exist from page load, frames are rebuilt from the stored q on entering full screen.

## Message protocol

Page to frame (parent is the sole accepted sender, checked with `e.source === window.parent`):

- `{ ringhost: 'look', theme: 'day' | 'night', lang: <code> }` - sent from the frame's `load`, the `data-theme` MutationObserver and `onLangChange`. The frame sets `data-theme` directly (no storage write) and calls `setLang` only when the language differs.

Frame to page (the page accepts only messages whose `e.source` is the `contentWindow` of one of its own frames, found by `frameKeyOf`):

- `{ ringwin: 'state', q: <query string, <= 4000 chars> }` - after every `mirrorToUrl` (every render). The page stores `cleanRingQuery(q)` as the entry's q, refreshes the window's group and labels only when the group changed, and writes the desktop state debounced 400 ms after the last message.
- `{ ringwin: 'raise' }` - from the frame's capture-phase `pointerdown` and `focusin`. The page closes the launcher menu and the opacity slider and raises the window if it is not already in front (z-index only, so the iframe keeps running).

Target origin is `'*'` in both directions (accepted threat T-hz1-04: payloads are group parameters, theme and language; on file:// the origin is the opaque `'null'`).

## setLang fallback note

Where the page's own `setLang` write reaches the frame through shared storage (every http run, and Chrome's shared file:// storage), the frame follows on its own. Where it does not (e.g. Firefox's per-file storage on file://), the `look` message carries the language and the frame calls `setLang(lang)`, which validates the code and then writes the value the page itself had already persisted. This is the only storage write a frame can make, and it writes the page's own choice.

## Probe: ringwin-probe.js

Scenarios (run A over file://, run B same profile, runs C/D fresh profiles, run H over http:// with a python3 `http.server` stopped by PID):

- R1 child layout (frame reports on itself)
- R2 open (menu item opens a frame window with task button and menu item, src params, title, in front)
- R3 independent (own group, original ring title and group-params untouched)
- R4 child (no storage or cookie write, no error from the frame)
- R5 remembered (extras entry in storage with the new mode/n)
- R6 close (window, iframe, task button, menu item removed; extras empty; original remains)
- R7 copies (+ on the original and on an extra, 32px right/down, in front)
- R8 raise (press in a back frame raises it and closes the menu)
- R9 inert (frames pass pointers through while a press is down)
- R10 desktop commands (Tile in bounds without overlap, Cascade, Show desktop twice, minimize/restore from task button, maximize, double-click maximize, opacity, snap to the left half, every frame loaded exactly once)
- R11f theme and language over file:// (hand-sent look message sets the frame's theme with no write and is ignored if unneeded; toggle and `setLang` reach the frame)
- R11 theme and language over http://, plus the frame's write log lacks group-params, cyclic-groups-fs-windows and cyclic-groups-fs-formula-pos
- R12 restore (run B: two task buttons before full screen, two frame windows after it with titles from the stored q, geometry, opacity and stacking)
- R13 corrupt (seeded mess yields one window, ringwin2 at n=5)
- R14 unparsable (`{not json`: no frames, Ring window open)
- plus one "errors: none" line per run

Final line: `RINGWIN-PROBE PASS (20 scenarios)`. Mutation checks were run to confirm the probe can fail: disabling the raise handling failed R8, disabling the inert class failed R9, disabling the look handler failed R11f.

## i18n-check results

- `--coverage` ends `I18N-CHECK FAIL coverage: 120 finding(s)`, equal to the baseline. Each of the 30 `LANG-KEYSET cyclicGroups.<lang>` lines now lists both `fsNewRing` and `fsDuplicateRing`. This is expected, not fixed: the two keys are English-only by decision D-03 and every other language shows the English value through NT.i18n's fallback until the catch-up translation pass.
- `--includes --no-locale-number-format --literals`: `PASS includes: 1`, `PASS no-locale-number-format: 1`, `FAIL literals-markup: 4`, `FAIL literals-js: 8` - identical to the baseline.
- `--header --switcher-present` pass; `shadow-check.js` passes; `git diff 671f9a0 -- assets/` shows only `assets/i18n/cyclic-groups.js` changed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] RING_DROP / fsExtraSpecs declared above fsState**
- **Found during:** Task 3
- **Issue:** `readFsState()` runs at `var fsState = readFsState();`, before the "extra Ring windows" section's `var RING_DROP` / `var fsExtraSpecs` statements had executed, so `cleanRingQuery` would have thrown inside readFsState's try and silently dropped every stored extra.
- **Fix:** Moved both declarations directly above `var fsState = readFsState();`.
- **Files modified:** Cyclic Groups/cyclic-groups.html
- **Commit:** f6f1c13

**2. [Probe adjustment, not a page deviation]** R2 waits for the frame to load before returning (otherwise R3's `set` message was posted before the frame had a listener); R11f was added beyond the plan's R11 because over http and Chrome's shared file:// storage the theme and language reach the frame through storage events too, so R11 alone could not show the `look` message works. The probe's expected scenario count is 20 for this reason.

Otherwise the plan was executed as written.

## Verification not run, or limited

- **No real full screen.** Headless Chrome refuses `requestFullscreen` without a gesture, so the probe fakes `document.fullscreenElement`. In the probe the `:fullscreen` CSS does not apply (the taskbar is `display:none`, menu items are clicked programmatically), so the taskbar and the original Ring window's fullscreen styling were not exercised visually. The manual pass in the plan's `<verification>` (real Chrome, real full screen, over http and file://) has not been done by me and is still recommended.
- Screenshots of a standalone frame (900x700 and 520x600) show the Group parameters row with label, modulus and switch, the Subgroup visualized row, the ring filling the middle, and the rotation, ruler and arrow-key row at the bottom, with no page chrome. At 520px wide the ruler is squeezed and the arrow key's text sits next to it; this is the same grid as the full-screen Ring window at that width, so it was left as is.
- Firefox / Safari were not tried (the Firefox per-file storage case is reasoned about, not tested).

## Known Stubs

None.

## Threat Flags

None beyond the plan's threat model (new postMessage surface and iframe src are T-hz1-01, T-hz1-03 and T-hz1-04 there).

## Self-Check: PASSED

- Files: `Cyclic Groups/cyclic-groups.html`, `assets/i18n/cyclic-groups.js` and `ringwin-probe.js` exist.
- Commits f458992, bbebdaf, f6f1c13 are on main and ancestors of HEAD; the measured commit count since `plan_head_before` is 3.
- Each of the three commit messages ends with the `Co-Authored-By: Claude Opus 5.5` line.
