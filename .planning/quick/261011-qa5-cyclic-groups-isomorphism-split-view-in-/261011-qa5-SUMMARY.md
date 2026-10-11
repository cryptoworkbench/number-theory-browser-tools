---
phase: quick-261011-qa5
plan: 01
subsystem: cyclic-groups
tags: [iframe-pane, postMessage, isomorphism, ring-window, i18n-en-first]
status: complete

requires:
  - phase: quick-261011-hz1
    provides: ringwin=1 frames (an iframe of the page as an extra Ring window)
provides:
  - an isomorphism chip opens its group in a second ring beside the current one, in the same view (normal page, full-screen Ring window, extra Ring window frame)
  - shared settings (colours, path style, layers, Splitview) shown once and driving both rings
  - linked turning and hover highlight through g^k and h^k
affects: [cyclic-groups, i18n catch-up pass]

actuals:
  tokens: 12600
  tasks: 3
  commits: 3
plan_head_before: 774966b915c25a6ff22578a83733b6375faee9af
plan_head_after: 0fcce165a9122de71b4310482e1b573cd71e7189

tech-stack:
  added: []
  patterns:
    - "an iframe of the page itself in ringwin+isopane mode as the right half; the host talks to it by postMessage only"
    - "host leads, receiver records the exponent as sent before turning, so turn messages never echo"

key-files:
  created:
    - .planning/quick/261011-qa5-cyclic-groups-isomorphism-split-view-in-/isopane-probe.js
  modified:
    - Cyclic Groups/cyclic-groups.html
    - assets/i18n/cyclic-groups.js

key-decisions:
  - "The right half is an iframe of the page (pane mode = ringwin mode plus isopane=1&isogen=h); the page's singleton state makes a second ring impossible in-document."
  - "The pane is memory-only: it reloads from its last reported query when moved in the DOM (full-screen enter/exit)."
  - "Linking pauses while the orders differ (every top/hover message carries order)."

requirements-completed: [QA5-01, QA5-02, QA5-03, QA5-04, QA5-05, QA5-06, QA5-07, QA5-08]
---

# Phase quick-261011-qa5 Plan 01: Isomorphism split view Summary

A plain click on an isomorphism chip now opens that group as a second ring in the right half of the same view, in the normal page, the full-screen Ring window and an extra Ring window's frame. It replaces 122f203's new-Ring-window behaviour. The two rings share their colour, path and layer settings, turn together, and light each other's corresponding beads through the isomorphism g^k to h^k.

## Commits

| Task | Commit | What |
|------|--------|------|
| 1 (tracer) | a8d4d88 | Pane mode, open/replace/close, reload on move, 122f203 reverted, `iso.openBeside`, probe P1-P8 |
| 2 | b2d9aa7 | Shared settings host to pane, edit relay pane to host, list under each ring, Fit with `cols`, probe P9-P13 |
| 3 | 0fcce16 | Linked turning and hover, probe P14-P20 |

## Pane architecture

The right half is `#iso-pane`, an iframe of the page itself at `?...&ringwin=1&isopane=1&isogen=h`. Pane mode is ringwin mode plus a flag (`IS_ISOPANE`, class `is-isopane`), so it inherits the Ring-window body layout, the no-persistence and no-shared-group-write rules, and the look/state-report messages. The address is always `location.pathname + '?' + cleaned query`; `RING_DROP` now also strips `isopane` and `isogen`.

The host (top page, full-screen Ring window, or an extra Ring window's own frame, where the pane is a nested iframe) never touches the pane's DOM, only postMessage, because file:// documents are opaque origins. Moving `#iso-pane` in the page (entering or leaving full screen) reloads its iframe, so `syncIsoPane()` (called from `syncWindows`) reloads it from the query the pane last reported. The pane exists in memory only and is gone after a page reload. A chip click always (re)loads its group. The pane query drops `rot`, `top`, `autorotate` and `autospeed`, so it opens still.

Layout: in a Ring window body a fourth grid column (`calc(50% - 7px)`) holds the pane, spanning every row; on the normal page it is absolutely positioned in the diagram's right half, the ring, its head and the arrow key keep to the left half, and the frame gets `min-height: 820px` (not full screen) so the pane's ring is not squeezed to nothing. All new rules are keyed on `.iso-pane:not([hidden])` or `.is-isopane`, so the closed state is unchanged (P4 compares the grid templates).

## Message protocol (every message pins `e.source`)

| Direction | Message | Validation |
|-----------|---------|------------|
| pane to host | `{ringwin:'state', q}` | source is the pane's contentWindow; `q` a string of at most 4000 chars; stored through `cleanRingQuery` |
| pane to host | `{ringwin:'raise'}` | closes the ring menu; relays `raise` to the parent when the host is itself a frame, else raises the Ring window |
| pane to host | `{isopane:'edit', name, on}` | `on` boolean; `name` only `orders`, `cord`, `guide` (through the host's own checkbox + change), `swap` (`swapArrowColors`) or `split` (`toggleSplit`, only while the split button is in a Ring window); anything else ignored |
| host to pane | `{ringhost:'look', ...}` | existing; `postLookAll` now also reaches the pane on the normal page |
| host to pane | `{ringhost:'shared', ...}` | pane `applyIsoShared`: booleans by typeof, `colorBy`/`elSide`/`dir` against `COLOR_BY`/`SIDES`/`DIRS`, colours null or `HEX_COLOR`; an invalid field keeps the pane's value; payload deduped by JSON |
| both ways | `{iso:'top'|'hover', k, order}` | receiver needs `order` equal to its own link order and `k` an integer in [-1, order) |

## Linking rules

- **Host leads.** The host's `render()` re-sends its top bead (deduped by `order:k`), which covers a new subgroup, arrangement or direction flip. The pane sends its top only from turning paths (`turnBy`, `endTurn`, `setRotChanged`). No render-time ping-pong.
- **No echo.** `isoFollowTop` records `order:k` as already sent before turning, so the turn it causes never goes back.
- **Order-match pause.** The link order is the host's |<g>| and the pane's |G| while `isogen` still generates it. When they differ, messages are ignored; the right half stays open but unlinked (probe P19).
- A left top outside <g> sends nothing and the right ring stays (P15).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Ring right-click menu hidden in every ringwin frame (planned fix (a))**
- **Found during:** Task 2
- **Issue:** `:root.is-ringwin .diagram-frame > :not(.ringwin-body)` hid `#ring-ctx` in every frame, so extra Ring windows never had their menu and the pane could not have one.
- **Fix:** a more specific `:root.is-ringwin .diagram-frame > .ring-ctx:not([hidden]){ display:block !important; }`.
- **Files modified:** Cyclic Groups/cyclic-groups.html
- **Commit:** b2d9aa7

**2. [Rule 1 - Bug] isoHref leaked ringwin=1 into chip hrefs (planned fix (b))**
- **Found during:** Task 1
- **Issue:** in a frame, a modified click on a chip opened a stripped page in the new tab.
- **Fix:** `isoHref` also deletes `ringwin`, `isopane` and `isogen`. Probe P6 asserts the href has no `ringwin=`.
- **Commit:** a8d4d88

**3. [Plan assumption wrong] Ring window grid rows are not unchanged while the pane is open**
- **Found during:** Task 1 probe P1
- **Issue:** the plan asserted `gridTemplateRows` is identical before and after opening. With the pane open the left half is half as wide, so its control rows wrap and the auto rows legitimately grow (108/38/132/104 against 66/38/92/79). Only the ring's flexible row shrinks to match.
- **Fix:** P1 now asserts the same number of row tracks. The closed-state requirement still holds and is asserted in P4 (columns, rows and areas identical to before opening). The Fit measurement (`ringNeeds`) is taken with the pane column present, so `chromeH` already includes the wrapped rows.
- **Commit:** a8d4d88

**4. [Rule 2 - Missing critical functionality] Normal-page pane had no room for its ring**
- **Found during:** Task 1 screenshot review
- **Issue:** at 1600x1000 the diagram frame is about 540px tall, and the pane's own controls took all of it, leaving a zero-height ring.
- **Fix:** `.diagram-frame:not(:fullscreen):has(> .iso-pane:not([hidden])){ min-height:820px; }`.
- **Commit:** a8d4d88

**5. [Probe adjustments]** P8 waits 1200ms (not 400ms) after the pane turn before entering full screen, since the pane reports its query only after the turn animation settles (one flaky run seen at 400ms). P13 targets the extra window with `.fs-win:has(.fs-win-body.is-frame)` because `.fs-win:has(iframe)` also matches the original Ring window now that it holds the pane iframe. `applyIsoShared` assigns fields one by one rather than looping over camelCase string names, since `literals-js` would flag those literals.

## Measure message

The frame's `measure` reply and `ringNeeds()` gain `cols` (1, or 2 while the pane is open). The desktop's measure branch validates `d.cols === 1 || d.cols === 2` and passes it to `fitRing`, whose ring side is `min((bodyW - padX) / cols, (H - extraH - chromeH) / flex)`.

## i18n

- One new key, `iso.openBeside` ('Open {group} beside this ring'), in the `en` block only and in the header comment's English-only paragraph. **Needs translating in the next catch-up pass for the other 30 languages.**
- The 122f203 key `iso.openWindow` is removed.
- `iso.open` ('Open {group} in a new tab') is now **unreferenced** by the page but is kept in all 31 blocks (i18n-check has no unused-key check).
- The pane head reuses `fsRingCyclic`/`fsRingNotCyclic`/`fsRing`, and the close button reuses `fsClose`.

## Verification

- `ISOPANE-PROBE PASS (20/20)` with no page or frame errors. The final 20-scenario probe was run three times, all clean. Earlier, one P8 timing flake at 400ms (13-scenario stage) was fixed by lengthening the wait (see deviation 5).
- Inline script syntax ok. `shadow-check` PASS.
- `i18n-check --coverage`: `I18N-CHECK FAIL coverage: 120 finding(s)`, the baseline. All 30 `LANG-KEYSET cyclicGroups.*` lines list `iso.openBeside`.
- `--includes --no-locale-number-format --literals`: includes PASS, no-locale-number-format PASS, literals-markup 4, literals-js 11, all as baseline.
- `--header --switcher-present`: PASS. `openWindow` and `isoInWindow` no longer appear anywhere in the page or dictionary.
- The older `261011-nut` split-probe (5/12 at HEAD) and `261011-hz1` ringwin-probe already failed at HEAD from later layout changes. They were not used as gates.

## Known Stubs

None.

## Threat Flags

None beyond the plan's threat model (all T-qa5-01 to T-qa5-06 mitigations are implemented as described: sources pinned, fields validated, order and `k` range checked, q capped at 4000 chars and cleaned, edit names whitelisted).

## Self-Check: PASSED

- FOUND: Cyclic Groups/cyclic-groups.html
- FOUND: assets/i18n/cyclic-groups.js
- FOUND: .planning/quick/261011-qa5-cyclic-groups-isomorphism-split-view-in-/isopane-probe.js
- FOUND commits: a8d4d88, b2d9aa7, 0fcce16 (all ancestors of HEAD)
