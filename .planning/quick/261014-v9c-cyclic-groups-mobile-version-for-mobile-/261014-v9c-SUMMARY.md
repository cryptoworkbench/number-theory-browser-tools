---
phase: 261014-v9c-cyclic-groups-mobile-version-for-mobile-
plan: 01
subsystem: cyclic-groups
tags: [mobile, touch, responsive, css, head-script]
requires: []
provides:
  - "head-script mobile detection (is-mobile / is-desktop root class)"
  - ":root.is-mobile stacked layout for Cyclic Groups"
  - "IS_MOBILE-guarded touch, menu, iso-chip and arrow-options behaviour"
affects: ["Cyclic Groups/cyclic-groups.html", "CLAUDE.md"]
tech-stack:
  added: []
  patterns: ["one source of truth for mode: head script sets the class, JS reads it"]
key-files:
  created:
    - .planning/quick/261014-v9c-cyclic-groups-mobile-version-for-mobile-/mode-check.sh
    - .planning/quick/261014-v9c-cyclic-groups-mobile-version-for-mobile-/mobile-check.mjs
  modified:
    - "Cyclic Groups/cyclic-groups.html"
    - CLAUDE.md
decisions:
  - "Ring gesture: touch-action pan-y pinch-zoom on the ring svg (vertical swipes scroll the page, horizontal drags rotate), no JS change"
  - "Arrow options move into the Layers panel's extra options on mobile; right-click menus are off"
  - "No new user-visible strings; i18n files untouched"
metrics:
  tasks: 3
  completed: 2026-10-14
status: complete
commits: 3
plan_head_before: e4a1c13e5aa468c9d915ebc1c44dd39eac78496f
plan_head_after: 7eaeb0c177fa78cb70f23d03ff81f7ef2267f652
actuals:
  tokens: 14000
  tasks: 3
  commits: 3
---

# Phase 261014-v9c Plan 01: Cyclic Groups mobile mode Summary

A browser that reports itself mobile now gets Cyclic Groups' stacked single-column page straight away (no intro, site header kept), phone-fixed for overlap, ring size, tap targets and touch gestures; every other browser gets the unchanged windowed desktop (byte-identical screenshot and identical rendered DOM).

## Commits (main, not pushed)

| Task | Hash | Message |
| ---- | ---- | ------- |
| 1 (tracer) | 65d09b0 | feat(cyclic-groups): a browser that reports itself mobile gets the stacked page, chosen before the first paint |
| 2 | 383b292 | feat(cyclic-groups): the stacked page works on a phone |
| 3 | 7eaeb0c | docs(cyclic-groups): CLAUDE.md notes the mobile mode |

## Detection rule as implemented

Head pre-paint script (one-line IIFE): `?preview=1` / `?ringwin=1` embeds get neither class. Otherwise `?mobile=1` means mobile, `?mobile=0` desktop (regex `[?&]mobile=([01])(?:&|#|$)`, never stored); with no override, mobile is `navigator.userAgentData.mobile === true || /Mobi|iPhone|iPod/.test(navigator.userAgent)`. Class `is-mobile` or `is-desktop`; any exception falls back to `is-desktop`. In JS, `IS_MOBILE` reads the `is-mobile` class (and is false for embeds); `IS_DESKTOP = !IS_PREVIEW && !IS_RINGWIN && !IS_MOBILE`.

## Gesture choice

`svg.ring-svg` gets `touch-action: pan-y pinch-zoom` under `:root.is-mobile`. A gesture starting vertically belongs to the browser (page scroll, pinch zoom), which sends the ring a `pointercancel` that the existing `endTurn` treats as no tap; a horizontal drag still rotates. Confirmed in the harness with a real touch-drag: pointerdown, two pointermoves, touchmove, pointercancel, page scrolled, ring rotation unchanged, no pick. The "gesture-scroll" pair RAN and PASSED (not skipped). Note: CDP's `Input.synthesizeScrollGesture` is NOT a faithful stand-in (it bypasses touch-action and rotated the ring), so the harness uses hand-made `Input.dispatchTouchEvent` drags.

## Layout and behaviour fixes (audit loop)

- Stacked at every width: undid the 901px sticky/flex rules, applied the under-640px rules at every width; `.app` padding 12px 10px, frame padding 8px 6px, so the ring spans ~91% of the viewport width (SVG is width-bound); landscape cap `max-height: 92svh` so the whole ring fits.
- Overlap fixed: auto-rotate triangle (zoom 1.3) and the formula switches became static rows above the ring heading, switches wrapping side by side, each at least 40 px tall (whole label tappable); ring-head top margin reset (this fixed the baseline's "Group name" over the heading overlap).
- Tap targets: rotate buttons 44x44, rotate value 44 px, selects/text/number fields at least 40 px tall at 16 px font (no iOS focus zoom), `.action-btn` 40 px, extra-options summary padded.
- JS (all inside `IS_MOBILE`): `#arrow-options` moved into Layers > extra options (verified visually, chords/arrow options usable by tap); ring and subgroup-list `contextmenu` do nothing; iso chips are plain links opening a new tab (and `openIsoPane` returns early); touch within 22 px of a bead picks the nearest bead.
- Audit only needed the baseline overlap fix and the arrow-options placement; no further visual breakage found in the segment screenshots (iphone-390, android-360, android-414, iphone-414, landscape-932, Arabic, `?mobile=1`, uadata).

## Verification results

- `mode-check.sh`: 9/9 PASS (iPhone, Android phone, Android tablet, Desktop, `?mobile=1`, `?mobile=0`, `?preview=1`, `?ringwin=1`, `?lang=ar` with `dir="rtl"`).
- `mobile-check.mjs`: ALL PASS across 11 scenarios (layout gates, touch interaction gates incl. bead tap/tolerance, rotate button, horizontal drag, vertical swipe scroll, subgroup row tap, modulus 7 -> 7 beads, multiplicative -> 6 beads, contextmenu inert, language de keeps state, theme toggle, no horizontal scroll). `#colorby-select` is not rendered in the default state, so its tap-size check prints SKIP (not a failure).
- Mobile CSS block scope gate: "mobile CSS block scoped OK" (every selector starts with `:root.is-mobile`, no literal colours, block sits right before the RTL rule).
- Desktop unchanged: `desktop-before.png` vs `desktop-after.png` byte-identical (`cmp`); `<html>` start tag and body-region DOM diff empty. The before dumps were identical across two runs, so no normalisation was needed.
- i18n-check: `--all --report` 112 findings (baseline), `--header`/`--includes`/`--smoke` exit 0, `--literals` 18 findings (at the limit).

## Deviations from Plan

- [Rule 3 - Blocking] The scope-gate regex splits selectors on commas, so a `:is(select, input[type=...])` selector was a false positive; rewrote it as three explicit `:root.is-mobile` selectors. No behaviour change.
- Harness: per-scenario isolated browser contexts (Target.createBrowserContext) instead of clearing cookies/localStorage, equivalent isolation; the "tap the ring's empty centre" step taps between two beads instead, because the combine box sits over the ring's centre and swallows the tap (`.ring-note` early return) — desktop behaviour, not a bug.
- `--shots` also writes `shot-<scenario>-layers-open.png` for the Layers panel with extra options and arrow options open.

## Not verified

- Real-device touch (iOS Safari / Android Chrome): only Chrome headless touch emulation was used; iOS-specific behaviour (zoom-on-focus avoided by 16 px fields, 100svh/92svh handling, pinch-zoom with `pan-y pinch-zoom`) is untested on hardware.
- Real `navigator.userAgentData.mobile` on a physical phone (emulated via userAgentMetadata only).
- Desktop mode was compared at 1280x900 (intro) only, not every desktop window state after entering the tool.

## Known Stubs

None.

## Screenshots (in the task directory, uncommitted)

Representative: `shot-iphone-390-1.png`, `shot-android-360-1.png` (ring, controls), `shot-android-360-layers-open.png` (arrow options in Layers), `shot-iphone-landscape-932-1.png`, `shot-iphone-ar-390-1.png` (RTL). Others: `shot-<scenario>-<k>.png` for all 11 scenarios, `t1-iphone-390.png`, `t1-desktop.png`, `desktop-before/after.png`, `desktop-before/after.dom.html`, `baseline-stacked-390.png`.

## Self-Check: PASSED

Commits 65d09b0, 383b292, 7eaeb0c are ancestors of HEAD on main; harness files and screenshots exist in the task directory; nothing pushed; `undefined-*.png` left untracked.
