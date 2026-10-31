---
quick_id: 261031-uya
phase: quick-261031-uya
plan: 01
type: execute
wave: 1
depends_on: [261031-pm3, 261031-tnu]
files_modified:
  - Cyclic Groups/cyclic-groups.html
  - assets/i18n/cyclic-groups.js
  - .planning/quick/261031-uya-cyclic-groups-padlock-freezes-the-main-f/log-base-lock-check.mjs
autonomous: true
requirements: [QUICK-261031-uya]

estimate:
  tokens: 45000
  tasks: 2
  confidence: medium

must_haves:
  truths:
    - "A padlock toggle button (.lb-lock, aria-pressed) sits in the base row directly right of the generator boxes, before the wheel switch; its icon is the page's expression-padlock icon (open / closed shackle), its look the wheel switch's; it is shown on the phone page too"
    - "Locked (state.logBaseLock, URL logbaselock=1; the pane's state.logBaseLockR, URL logbaselockr=1): a box click or an arrow key in the row does not change the base (the radio is re-checked on the chosen box) and nudges the padlock; the wheel switch is disabled, and a wheel notch over the formulas while it is pressed changes nothing and nudges the padlock"
    - "Locked: every non-chosen box is aria-disabled, dimmed with a not-allowed cursor, with a 'locked' tooltip; the chosen box stays highlighted"
    - "Locked: a double-click on a closed a / a2 forces nothing (base and knob stay, no is-force-pulse / is-force-set) and runs the padlock alarm (.lb-lock.is-alarm: shake + --role-warn pulse, 3 x 0.45 s), under a generation counter; the two clicks' green/red hint stays; a single click keeps the hint and adds a one-wiggle nudge (.is-nudge)"
    - "Locking while a forced sequence still pulses cancels it (base and knob stay); one already in its last flash finishes"
    - "A group or h change while locked keeps the base when it is still a generator, else settleMaps re-resolves it; the lock stays on; knobs snap back by mapSettle as before"
    - "The lock travels like chosenBase: pane shared message (logBaseLock), pane -> host isopane 'logbaselock', swapIsoRings swaps it, isoHref drops both, Ring windows by their query"
    - "Unlocked behaviour is unchanged (tnu force, pm3 row, m2b maps probes pass)"
    - "New strings English-only in assets/i18n/cyclic-groups.js; i18n gates stay <= 31 / 4 / 109; only palette tokens"
  artifacts:
    - path: "Cyclic Groups/cyclic-groups.html"
      provides: "logLockButton, toggleLogBaseLock, alarmLogLock; .lb-lock CSS and lb-lock-alarm / lb-lock-nudge keyframes; state/URL/pane/swap wiring"
      contains: "function alarmLogLock"
    - path: ".planning/quick/261031-uya-cyclic-groups-padlock-freezes-the-main-f/log-base-lock-check.mjs"
      provides: "CDP probe (infrastructure and models copied from the tnu probe)"
---

<objective>
A padlock right of the main view's generator boxes freezes the base of the logarithm: boxes, keys, the wheel and the forced double-click can no longer change it, and a blocked double-click makes the padlock shake and flash so the user knows to open it.
</objective>

<context>
Builds on 261031-pm3 (row of boxes, logBaseFits, setChosenBase, flashLogBases, wheel switch, pane/swap/URL travel of chosenBase) and 261031-tnu (forceMapPosition, logForce generation counter).
Page code: logBaseRow / logWheelButton / setChosenBase / stepChosenBase / logWheelTakes / flashLogBases / forceMapPosition / logForceLive; syncSubFormula (focus kept on the row: heldLbKind), fitSubFormulaBox (list max-width); mirrorToUrl, loadState, isoHref, swapIsoRings, isoSharedPayload, applyIsoShared, host isopane handler.
Icon: `.expr-lock` drawing through svgIcon (rect 2.5,5.5 7x5 + shackle path, closed 'M4 5.5V4a2 2 0 0 1 4 0v1.5', open 'M4 5.5V3.5a2 2 0 0 1 4 0').
</context>

<tasks>

<task type="auto">
  <name>Task 1: the padlock in the page</name>
  <files>Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js</files>
  <action>
- state.logBaseLock / logBaseLockR; loadState reads logbaselock / logbaselockr ('1'); mirrorToUrl writes them; isoHref deletes; swapIsoRings swaps; shared payload logBaseLock; applyIsoShared takes it (boolean); host isopane 'logbaselock'.
- logBaseRow: locked → non-chosen inputs aria-disabled (never disabled), class is-off for unfit boxes, locked tooltip; change handler on a non-chosen box while locked re-checks the chosen radio, refocuses it, nudges. Padlock button after the list; wheel button disabled while locked.
- toggleLogBaseLock: cancels a pulsing forced sequence, stops an alarm, mirrors URL, rebuilds the row (focus stays on the padlock; heldLbKind 'lock'), pane tells host.
- setChosenBase/stepChosenBase/forceMapPosition honour the lock (forceMapPosition → alarmLogLock('alarm')); hint click → nudge; logForceLive false in pulse phase while locked.
- alarmLogLock(kind): generation counter, timer cleanup, re-paint on rebuild with negative animation-delay, a nudge never cuts an alarm short.
- CSS: .lb-lock with .lb-scroll's look, locked boxes dimmed / not-allowed, keyframes with --role-warn via color-mix; reduced motion: colour only.
- fitSubFormulaBox subtracts every row control's width.
- Strings: logBaseLock, logBaseUnlock, logBaseLocked (en), header paragraph.
  </action>
  <verify>
    <automated>node .planning/quick/261031-uya-cyclic-groups-padlock-freezes-the-main-f/log-base-lock-check.mjs</automated>
  </verify>
  <done>Probe scenarios pass; no page exceptions.</done>
</task>

<task type="auto">
  <name>Task 2: probe, regressions, gates, screenshots</name>
  <files>.planning/quick/261031-uya-cyclic-groups-padlock-freezes-the-main-f/log-base-lock-check.mjs</files>
  <action>
Scenarios: place (padlock right of boxes, before the wheel, icon, aria-pressed, URL), freeze (box click, keys, wheel, nudge), alarm (dblclick closed a2 at Z/12 h=7 base 1: base, knob stay; is-alarm sampled ~0-1.35 s; no force classes; generation restart), unlocked (tnu force still works after unlocking), midlock (lock while pulsing cancels), reload (URL), group (n change keeps / re-resolves, lock stays), pane, ringwin, units13, curve, mobile, shot. Profile removed after Chrome exits.
Then full runs of force-dblclick-check.mjs, log-base-boxes-check.mjs and formula-map-check.mjs; i18n gates.
  </action>
  <verify>
    <automated>node .planning/quick/261031-tnu-cyclic-groups-double-click-a-closed-a-or/force-dblclick-check.mjs && node .planning/quick/261031-pm3-cyclic-groups-generator-boxes-replace-th/log-base-boxes-check.mjs && node .planning/quick/261031-m2b-cyclic-groups-2-d-formula-map-control-fo/formula-map-check.mjs</automated>
  </verify>
  <done>All four probes print their OK markers; gates <= 31 / 4 / 109; two light screenshots in the task dir.</done>
</task>

</tasks>

<verification>
- log-base-lock-check.mjs, force-dblclick-check.mjs, log-base-boxes-check.mjs, formula-map-check.mjs all OK after the final edit.
- i18n-check --coverage <= 31, --literals-markup <= 4, --literals-js <= 109.
</verification>
