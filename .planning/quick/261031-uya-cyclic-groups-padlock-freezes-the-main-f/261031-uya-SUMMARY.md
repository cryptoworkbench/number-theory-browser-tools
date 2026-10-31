---
quick_id: 261031-uya
phase: quick-261031-uya
plan: 01
subsystem: cyclic-groups
tags: [cyclic-groups, formula-maps, log-base, padlock]
status: complete
requirements: [QUICK-261031-uya]
commits: 2
plan_head_before: 3d827c5f9a7e568b882286a47abdc283304c1220
plan_head_after: 82b23d73ec16adf5eea1918a58da7d0fdc8d64f6
actuals:
  tokens: 23400
  tasks: 2
  commits: 2
key-files:
  created:
    - .planning/quick/261031-uya-cyclic-groups-padlock-freezes-the-main-f/log-base-lock-check.mjs
  modified:
    - Cyclic Groups/cyclic-groups.html
    - assets/i18n/cyclic-groups.js
metrics:
  duration: 22min
  completed: 2026-10-31
---

# Quick 261031-uya: The log-base padlock Summary

A padlock now sits to the right of the main view's generator boxes. While it is closed, the chosen base of the logarithm cannot change:

- A click on another box, an arrow key in the row, or a wheel notch leaves the base where it is and makes the padlock nudge.
- A double-click on a closed a or a2 forces nothing. Instead the padlock shakes and pulses in the warning colour three times over 1.35 s.

## Commits (branch `cyclic-groups-log-base-lock`, nothing pushed)

| Task | Commit | What |
| ---- | ------ | ---- |
| 1 | 9de5a59 | page: padlock, freeze, nudge/alarm, state/URL/pane/swap; three English strings |
| 2 | 82b23d7 | probe `log-base-lock-check.mjs` |

## Probe results (full runs after the final page edit, 9de5a59)

- **`log-base-lock-check.mjs`** (every scenario except `shot`): **86 PASS, 0 FAIL**, `LOG-BASE-LOCK-CHECK OK`.
  - Per scenario: place 16, freeze 13, alarm 14, unlocked 4, midlock 3, reload 3, group 4, units13 4, curve 5, pane 9, ringwin 7, mobile 4.
  - `shot` was run separately: OK.
- **`force-dblclick-check.mjs`** (tnu, full): **89 PASS, 0 FAIL**, `FORCE-DBLCLICK-CHECK OK`.
- **`log-base-boxes-check.mjs`** (pm3, full): **180 PASS, 0 FAIL**, `LOG-BASE-CHECK OK`.
- **`formula-map-check.mjs`** (m2b, full): **605 PASS, 0 FAIL**, `FORMULA-MAP-CHECK OK`.
- No check in any existing probe needed changing.
- **i18n gates:** 31 / 4 / 109 before and after. The gate config was not touched. `node --check assets/i18n/cyclic-groups.js` passes.

## Judgement calls, as built

- **J-01 Placement.** The padlock sits directly right of the boxes and before the scroll-wheel switch. The row now reads list, padlock, wheel switch. The phone page has no wheel switch, so there it is list then padlock. `fitSubFormulaBox` now subtracts the width of every row control, not just the wheel's. The probe checked this on ℤ/97ℤ: no sideways scroll, and both controls stay inside the ring head.
- **J-02 Look.** It is a `<button class="lb-lock" aria-pressed>`.
  - It shares every `.lb-scroll` rule: the 24 px box, hover, the accent look when pressed, focus-visible and disabled.
  - The icon is the expression padlock's `svgIcon`. The closed shackle is `M4 5.5V4a2 2 0 0 1 4 0v1.5` and the open one `M4 5.5V3.5a2 2 0 0 1 4 0`, drawn at 14 px with stroke 1.3.
  - The tooltip and aria-label are "Lock the base of the logarithm: …" when open and "Unlock the base of the logarithm" when closed.
- **J-03 Locked boxes.** Every box other than the chosen one gets `aria-disabled="true"` and is never `disabled`, so a click or arrow key still reaches it and can nudge the padlock.
  - These boxes are dimmed (opacity .5), show a not-allowed cursor and carry the tooltip "The base of the logarithm is locked: open the padlock to change it".
  - The chosen box stays lit.
  - A box that does not fit (pm3's grey-out) also gets class `is-off`, so it keeps its dashed look at opacity .4. That is the `.lb-box:has(input:disabled), .lb-box.is-off` rule.
  - When one of these boxes is clicked or reached by an arrow key, the radio is checked back onto the chosen box and the focus returns to it.
- **J-04 Wheel.** While the lock is closed, the wheel switch is disabled: it cannot be turned on or off, and it keeps its pressed state. If it was on, a wheel notch over the formulas is still taken by the row, so the ring does not zoom. That notch changes nothing and nudges the padlock. `stepChosenBase` and `setChosenBase` both check the lock.
- **J-05 Double-click while locked.** `forceMapPosition` returns before picking a base and calls `alarmLogLock('alarm')`.
  - The alarm adds `.lb-lock.is-alarm`, which runs keyframes `lb-lock-alarm` 3 × 0.45 s. Each cycle is a rotate/scale shake, the `--role-warn` colour on the icon, border and background (via `color-mix`), and a ring-shaped box-shadow halo.
  - No `is-force-pulse` or `is-force-set` class is added.
  - The green/red hint from the two clicks **stays**, because it shows which base the user would need once the padlock is open.
  - Under `prefers-reduced-motion` the alarm and nudge pulse the colour only (`lb-lock-alarm-still`).
- **J-06 Single click on a closed a/a2 while locked.** pm3's hint is kept, plus one subtle nudge (`.is-nudge`, `lb-lock-nudge` 0.45 s). The arrow-key path onto a closed position does the same.
- **J-07 Generation counter.** `logLockGen`, `logLockTimer` and `logLockAlarm {kind, t0}` work together:
  - A new alarm or nudge restarts the animation (class removed, reflow, added again).
  - A nudge never cuts a running alarm short. This is why the two clicks before a double-click do not weaken it.
  - When the row is rebuilt, for example by a language switch, the padlock is painted again with a negative `animation-delay`.
  - The timer clears the classes only while its own generation is still current.
  - The probe confirmed that a second double-click 0.6 s into an alarm restarts the full 1.35 s.
- **J-08 Locking during a forced sequence.** While the picked box is still pulsing, closing the padlock cancels the sequence (`stopLogForce`), and the base and knob stay. Once the sequence has already set its base, it finishes its last flash and the lock then holds the new base. As a backstop, `logForceLive` treats a pulse-phase sequence as dead while the lock is closed.
- **J-09 State and travel.**
  - The state lives in `state.logBaseLock`, and the ring keeps the pane's own value in `state.logBaseLockR`.
  - In the URL it is `logbaselock=1` / `logbaselockr=1`. Only `'1'` counts; `logbaselock=yes` opens unlocked and the value is dropped.
  - The pane receives it through `logBaseLock` in the shared payload. The pane sends `isopane: 'logbaselock'` (boolean) to the host, which mirrors `logbaselockr`.
  - `swapIsoRings` swaps it. `isoHref` drops both keys, the same as `logbase`.
  - Ring windows carry it through their query and their `ringwin: 'state'` messages.
- **J-10 Group or h changes.** These are left to `settleMaps`, unchanged. A base that is still a generator stays (ℤ/12ℤ base 5 → n=8 keeps 5). Otherwise it is re-resolved (→ n=10 gives 1), and the lock stays closed. A knob on an a2 that closes snaps back as usual (ℤ/12ℤ h 7 → 5 at locked base 7: `pos-gcd` → `abs-gcd`).
- **J-11 Keyboard.** The window arrow handler already ignores `.lb-row`, so the padlock is left alone: the probe confirmed ArrowRight on the focused padlock moves neither the expression slider nor the base. Enter and Space toggle it. `syncSubFormula` gets a new focus kind, `'lock'`, so the padlock keeps the focus when the row is rebuilt.
- **J-12 Strings.** `logBaseLock`, `logBaseUnlock` and `logBaseLocked` exist in English only, and the i18n file's header paragraph names them. Other languages show the English text through the fallback.

## Deviations from Plan

None in the page. One probe-only fix: CDP's Enter key activates a button only when its `keyDown` carries `text: '\r'`. The first run's "Enter opens it" check failed for that reason alone, not because of the page. Space worked as written.

**Environment:** the pm3 and m2b probes each leaked one Chrome profile from my runs (`/tmp/cg-lbase-FzASRc`, `/tmp/cg-fmap-z79SfT`). Both were removed after their Chrome had exited. The new probe and the tnu probe left nothing behind. No other profiles were touched. /tmp stood at about 2.9 G of 3.9 G at the end.

## Known Stubs

None.

## Threat Flags

None. The new URL keys are compared against the literal `'1'`. The pane message is accepted only when its value is a boolean. All text goes through `translate()` into `title`/`aria-label`, with no `innerHTML`.

## Limits

- The global Space handler at line ~12853 still swallows Space on any focused button while auto-rotate is running. That handler predates this task and affects all buttons, not just the padlock, so it was left alone. Enter still works there.
- Pane race: a host "shared" message built before the host has seen the pane's `logbaselock` message would briefly revert it. This is the same exposure `chosenBase` already has.
- RTL, Safari/Firefox and a real touchscreen were not exercised. The phone check used Chrome touch emulation at 390×844.
- Screenshots in this directory, untracked:
  - `shot-log-base-locked-light.png`: ℤ/12ℤ h=7, locked on base 1, other boxes dimmed, wheel switch disabled.
  - `shot-log-base-lock-alarm-light.png`: 150 ms after a double-click on the closed a2. The padlock is red and tilted, and the hint shows 7 green and 1, 5, 11 red.

## Self-Check: PASSED

- Files exist: the page, the i18n file, `log-base-lock-check.mjs`, and both screenshots.
- Commits 9de5a59 and 82b23d7 are on `cyclic-groups-log-base-lock` (`git rev-list --count 3d827c5..HEAD` = 2).
- PLAN, SUMMARY and STATE.md are not committed.
