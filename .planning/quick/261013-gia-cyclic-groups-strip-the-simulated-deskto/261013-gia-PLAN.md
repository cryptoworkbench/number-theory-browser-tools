---
quick_id: 261013-gia
mode: quick
date: 2026-10-13
---

# Cyclic Groups: strip the simulated desktop; the Ring fills the screen

## Context
After the intro screen, `Cyclic Groups/cyclic-groups.html` shows a simulated OS desktop: windows with title bars (drag handle, title, + / transparency / fit / maximize / close buttons), resize grips, snapping, a hidden taskbar and launcher, a Notice window, and extra Ring windows. The user asked to "remove all of the simulated appearance of an OS".

Decided with the user:
- The Ring's content fills the whole screen with no window chrome. It can't be dragged or resized, and has no border or title bar.
- Extra Ring windows go away.
- The Notice, which explains why a non-cyclic group isn't cyclic, is dropped from this page. `_Cyclic Groups` keeps it.

`_Cyclic Groups/_cyclic-groups.html` is NOT changed.

## Task 1: strip the window manager (`Cyclic Groups/cyclic-groups.html`)
- **Remove the desktop window manager.** That covers:
  - window building and mounting (`mountWindow`), title bars and their buttons (dup/alpha/fit/max/close), the move/resize drag code, snapping and the snap preview, the transparency slider;
  - the taskbar, launcher, menu and `#fs-exit`;
  - the Notice window (and `#notice` rendering on this page);
  - extra Ring windows (`ringwinN` specs, `removeRingWindow`, their frame messages and saved `extras`);
  - the `cyclic-groups-fs-windows` state (`readFsState`/`writeFsState`).

  Delete it the way `_Cyclic Groups/_cyclic-groups.html` already did (compare the two files: `syncWindows` became `syncPanes()`, and the panel ids stay in place). The ring body (`.fs-win-body.is-ring`, which the CSS grid areas key on) should fill the whole `.diagram-frame` (inset 0 after entering), with sensible padding.
- **Keep:**
  - the intro screen and `#cg-enter`;
  - the corner full-screen button (`#fullscreen-btn`);
  - the isomorphism pane and its `ringwin=1&isopane=1` iframe mode (the pane needs it), with `preview=1`;
  - the padlock and shared Numerical button behaviour;
  - split view, the right-click ring menu, colours, rotation and the auto-rotate ruler.
- **Tab title:** after entering it shows the Ring's title (`ringTitle()`); before entering, "Cyclic Groups".
- **Strings:** delete no dictionary keys (`_Cyclic Groups` and the iso iframe still use some). Update the English `introAbout` value in `assets/i18n/cyclic-groups.js`, since it no longer describes a desktop:
  > "Cyclic Groups turns a group into a ring of beads, one bead for each element. Choose a modulus and an operation — addition modulo n, or multiplication of the units modulo n — then pick an element: its chords walk around the ring, and when they reach every bead that element generates the whole group, which makes the group cyclic. The ring fills the screen with the group's controls above it. The Numerical list shows the subgroup each element generates, and an isomorphic group can be opened beside the ring and locked to it with the padlock, so the two turn, colour and highlight as one."
- **Commit:** `refactor(cyclic-groups): strip the simulated desktop; the ring fills the screen`.

## Verification
Headless Chrome (scratchpad `cdp.js`):
- After clicking `#cg-enter`:
  - there is no `.fs-win`, no title bar, no taskbar and no resize grip;
  - the ring body covers the viewport (0,0 to full size);
  - the controls, ring, rotation and Numerical split work;
  - a non-cyclic group shows no notice.
- Regression scripts `isofix`, `unlink`, `rotsync`, `unlockopen`, `midbtn` (after entering) give unchanged results. Selectors that targeted window chrome must be adapted; describe any adaptation.
- `node .planning/phases/06-multi-language-support/i18n-check.js --header`, `--switcher-present` and `--coverage --all` show no new findings.
- Zero console errors in the page and the pane iframe.
- Take screenshots, day and night, of an additive group with the iso pane and the Numerical list open.
