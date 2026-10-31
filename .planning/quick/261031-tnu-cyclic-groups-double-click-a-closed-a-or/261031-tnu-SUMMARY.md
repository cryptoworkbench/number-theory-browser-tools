---
quick_id: 261031-tnu
phase: quick-261031-tnu
plan: 01
subsystem: cyclic-groups
tags: [cyclic-groups, formula-maps, log-base, double-click]
status: complete
requirements: [QUICK-261031-tnu]
commits: 2
plan_head_before: ad35a22eeafd0cfa7f5651506e692d73be2478a0
plan_head_after: 7b26924bad91b0b538e50e4a8a80b984d3c92e6d
actuals:
  tokens: 13900
  tasks: 2
  commits: 2
key-files:
  created:
    - .planning/quick/261031-tnu-cyclic-groups-double-click-a-closed-a-or/force-dblclick-check.mjs
  modified:
    - Cyclic Groups/cyclic-groups.html
---

# Quick 261031-tnu: Double-click forces a closed a / a2 Summary

When you double-click a closed a or a2 on a main-view formula map, the page picks the nearest generator box whose base opens that position. That box pulses green twice. The base and the knob then change together, and the box flashes green a third time. A single click still only shows pm3's green/red hint.

## Commits (branch `cyclic-groups-map-force-dblclick`, nothing pushed)

| Task | Commit | What |
| ---- | ------ | ---- |
| 1 | 31ccff6 | page: dblclick on closed a/a2, pick, three-flash sequence, generation counter, pane reporting |
| 2 | 7b26924 | probe `force-dblclick-check.mjs` |

## Probe results (after the final page edit, 31ccff6)

- `force-dblclick-check.mjs` (all but `tap`/`shot`): **89 PASS, 0 FAIL**, `FORCE-DBLCLICK-CHECK OK`. `shot` run separately: OK. `tap` prints INFO only: a double tap in Chrome touch emulation on the phone page ends on `logbase=7, fmaporder=pos-gcd`.
- `log-base-boxes-check.mjs` (pm3, full): **180 PASS, 0 FAIL**, `LOG-BASE-CHECK OK`. No check changed.
- `formula-map-check.mjs` (m2b, full): **605 PASS, 0 FAIL**, `FORMULA-MAP-CHECK OK`. No check changed.
- i18n gates: 31 / 4 / 109 before and after. No new strings, gate config untouched.

## As built

- **Event:** the `dblclick` listener sits on the closed position's `<label class="fmap-stop">`. The pointer is over the label, so Chrome fires dblclick there and not on the radio (found with a probe trace). The two clicks still reach the radio, so each runs pm3's hint handler (`aria-disabled`: uncheck, re-check the knob's radio, `flashLogBases`) and the knob never moves on the first click.
- **Pick** (`forceBasePick`): from `G.generators`, the ones with `mapReach(G, h, g)[node]`. The nearest to `mapBase(G)` by box index wins, and on a tie the higher index. Nothing happens if there is no candidate or the candidate is the current base.
- **Sequence** (`forceMapPosition`):
  - The double-click clears the hint flash at once (`is-flash-ok`/`is-flash-no` removed, `logFlashTimer` cleared).
  - The picked box gets `.is-force-pulse`: new keyframes `lb-force-pulse`, green at 40–60%, 0.55 s × 2.
  - At 1100 ms, `applyForcedMap` sets `state.chosenBase` and moves the clicked map onto `FMAP_AT[node][row]`, using the row its knob was on, as `setFormulaMap` does. Both happen in one render through `barFormulasChanged`, so the URL updates like any knob move.
  - The new box then gets `.is-force-set`, pm3's `lb-flash-ok` at 1.1 s. Classes are removed at 2300 ms.
  - Only `--role-result`, `--text` and `--panel` via `color-mix` are used.
- **Staleness:** `logForceGen` plus `logForceLive()`. The live check compares group key, h, `noSub`, shown formulas, and either the base and token at the start (pulse phase) or the set ones (set phase).
  - It runs at the timer and on every `logBaseRow` build. A dead sequence is stopped there.
  - A live one is painted onto the rebuilt box with a negative `animation-delay`, so a language switch mid-pulse carries on.
  - `flashLogBases` (a new hint click) stops any sequence first.
- **Other map:** it is settled by the existing `settleMaps`/`mapSettle` and is not considered in the pick.
- **Pane:** it runs the same code (`IS_ISOPANE`). `applyForcedMap` sends `isopane: 'logbase'` first (the host only mirrors it to its URL), then renders, then sends `isopane: 'fmap'` with the settled pair. The probe checks that the host URL gets `logbaser` and `fmaporderr=pos-gcd`, and that the host's own `logbase`/`fmaporder` are unchanged.
- **Ring windows:** same code. The probe hosts a `?ringwin=1` iframe in a page and reads its `{ ringwin: 'state' }` messages: `logbase=7`, `fmaporder=pos-gcd`.
- **Keyboard:** unchanged. **Touch:** no special handling. Chrome's touch emulation turns a double tap into dblclick (INFO above).

## Findings the task's checklist runs into

- **The other map can never snap back from a forced base.** a2 open implies a open (n mod q = 0 gives r = q), and both maps share h and the base. If the other map sits on an open a or a2, the clicked map's a/a2 is open too, unless the other is on a and the click is a2, in which case the forced base opens a2 and therefore a. The probe proves this on its models: 0 snaps over 57 cyclic groups. In place of a snap-back case, it runs "other map on a stays on a" (ℤ/12ℤ h=7 base 5, index on abs-lcm, a2 forced by 7). The `settleMaps` path is still the one that would act.
- **Every closed a / a2 has a base that opens it** in a cyclic group: over all generators, log h takes every q with gcd(q, n) = d, including d itself. The model check covers 23218 closed cases over 57 groups with 0 exceptions. So the "no base" branch is defensive and cannot be reached in the page. SLS in a multiplicative group and JN have no dblclick handler (SLS radios are plainly disabled, JN is always open). The probe checks that a double-click on an open position (lcm-short, jn, gcd-sls in ℤ/12ℤ) acts like a click.
- The tie case was found by the probe's search: ℤ/8ℤ h=2 base 3, a2. Bases 1 and 5 are equally near, and 5 wins.

## Deviations from Plan

**1. [Rule 1 - Bug] dblclick listener moved from the radio to its label**
- **Found during:** Task 1 first probe run (nothing forced). A trace showed `dblclick:LABEL`.
- **Fix:** listener on `stop`. The probe's synthetic pane/ringwin double-clicks dispatch on `input.parentNode`.
- **Commit:** 31ccff6

**2. [Rule 3 - Blocking, environment] tmpfs quota (EDQUOT) killed the first m2b run**
- Probe Chrome profiles leak, because `rmSync` straight after SIGKILL races Chrome's helper processes. I removed only my own leftovers (`cg-force-*`, `cg-lbase-CfGssM`, `cg-fmap-jUy66I`, `cg-fmap-Zwtv57`) and re-ran.
- The new probe now waits for Chrome to exit and retries the removal (verified: 0 left). The pm3 and m2b probes still leak one profile per run. They were not edited.
- About 40 older `cg-*` profiles from earlier sessions (19:xx–20:xx; cg-ecf, cg-dir, cg-direct, cg-fmap, cg-lbase), about 2.8 GB, still fill most of the 3.2 GB /tmp quota. They were left alone.

**3. Plan-shape:** the plan's "other map on a2 snapping back" case was replaced by the model invariant plus "other on a stays", for the reason above.

## Known Stubs

None.

## Limits

- The timings are fixed: pulses 2 × 550 ms, set at 1100 ms, last flash 1.1 s, cleanup at 2300 ms. There is no `prefers-reduced-motion` variant, same as pm3's flash.
- Pane race: a host "shared" message built before the host gets the pane's `fmap` message could briefly show the old knob. This is the same exposure pm3 recorded.
- RTL, Safari/Firefox, a real touchscreen and the stacked phone page beyond one emulated double tap were not exercised.
- Screenshots (untracked, this directory): `shot-force-pulse-light.png` (180 ms after the double-click on ℤ/12ℤ h=7 base 1, box 7 green) and `shot-force-set-light.png` (about 1.3 s: base 7 chosen and flashing, knob on a2, boxes 1, 5 and 11 greyed while the map is on a2; a native tooltip of the hovered a2 shows).

## Self-Check: PASSED

- Files exist: the page, `force-dblclick-check.mjs`, both screenshots.
- Commits 31ccff6 and 7b26924 are on the branch (`git rev-list --count ad35a22..HEAD` = 2). The PLAN, SUMMARY and STATE.md are not committed.
