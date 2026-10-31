---
quick_id: 261031-tnu
phase: quick-261031-tnu
plan: 01
type: execute
wave: 1
depends_on: [261031-pm3]
files_modified:
  - Cyclic Groups/cyclic-groups.html
  - .planning/quick/261031-tnu-cyclic-groups-double-click-a-closed-a-or/force-dblclick-check.mjs
autonomous: true
requirements: [QUICK-261031-tnu]

estimate:
  tokens: 60000
  tasks: 2
  confidence: medium

must_haves:
  truths:
    - "A single click on a closed a / a2 keeps pm3's behaviour (green/red flash of every base box, knob and base stay)"
    - "A double-click (dblclick event) on a closed a (abs-*) or a2 (pos-*) of a main-view formula map cancels that flash at once (is-flash-ok / is-flash-no removed, its timer cleared) and forces the position"
    - "Pick: among G.generators whose base opens that position for state.gen (mapReach(G, h, g)[node]), the one nearest the current base by box index; on a tie the higher index"
    - "Sequence on the picked box: two green pulses (is-force-pulse, 2 × 550 ms), then at 1100 ms the base becomes the chosen one and the clicked map's knob moves onto a / a2 of its row (one render, URL logbase + fmaporder/fmapindex like a knob move), then a third green flash (is-force-set, pm3's lb-flash-ok 1.1 s); classes gone at about 2.3 s"
    - "The other map settles by the existing settleMaps / mapSettle; the pick ignores it"
    - "A generation counter cancels the sequence on any new single click on a closed position, any state change (base, h, group, knob, shown formulas) seen at a re-render or at the timer; a re-render with unchanged state re-paints the running class with a negative animation-delay, so no stale class and no stale base"
    - "No base opens the position → nothing beyond the single click; open positions and SLS / JN untouched; keyboard unchanged"
    - "The isomorphism pane (same code, IS_ISOPANE) reports base then knobs to the host (isopane 'logbase', then 'fmap'); Ring windows run the same code"
    - "Only palette tokens (--role-result via the existing keyframes / color-mix); no new strings; i18n gates stay ≤ 31 / 4 / 109"
  artifacts:
    - path: "Cyclic Groups/cyclic-groups.html"
      provides: "forceBasePick, forceMapPosition, stopLogForce, logForceLive, applyForcedMap; .lb-box.is-force-pulse / .is-force-set; dblclick on closed a/a2 radios"
      contains: "function forceMapPosition"
    - path: ".planning/quick/261031-tnu-cyclic-groups-double-click-a-closed-a-or/force-dblclick-check.mjs"
      provides: "CDP probe with independent models (copied from pm3's probe)"
---

<objective>
Double-clicking a closed a or a2 on a main-view formula map forces it open: the nearest suitable log base is flashed twice, chosen together with the knob move, and flashed a third time.
</objective>

<context>
Builds on 261031-pm3 (generator boxes, flashLogBases, aria-disabled closed a/a2) and 261031-m2b (formula maps).
Page code: CSS `.lb-box.is-flash-ok` and `@keyframes lb-flash-ok`; `mapReach`, `mapSettle`, `settleMaps`, `formulaMap` (closed a/a2 `hint` radios), `setFormulaMap`, `logBaseRow`, `setChosenBase`, `flashLogBases`.
Model note: a2 open ⇒ a open (n % q = 0 implies a representative r = q), and both maps share h and base, so a forced base can never close the other map's a / a2; snap-back cannot arise in the main view. In a cyclic group the logs of h over all generators run through every q with gcd(q, n) = gcd(log, n), including that gcd itself, which divides n, so some base always opens a2 (and a): the "no base" guard is defensive only. The probe checks both facts on its models.
</context>

<tasks>

<task type="auto">
  <name>Task 1: forced double-click sequence in the page</name>
  <files>Cyclic Groups/cyclic-groups.html</files>
  <action>
- CSS after `.lb-box.is-flash-no`: `@keyframes lb-force-pulse` (40%–60% the green of lb-flash-ok, 0/100% the box's own look), `.lb-box.is-force-pulse{ animation:lb-force-pulse .55s ease-in-out 2 }`, `.lb-box.is-force-set{ animation:lb-flash-ok 1.1s ease-out }`.
- formulaMap: on a hint radio add a `dblclick` listener → `forceMapPosition(G, f, id)`.
- New: `forceBasePick(G, node)`, `logForce` state + `logForceGen` + timers, `stopLogForce()`, `logForceLive()`, `paintLogForce(box)`, `applyForcedMap(f, token, g)` (sets base and knob, then barFormulasChanged; in a pane tellHost logbase, render, tellHost fmap).
- flashLogBases calls stopLogForce first; logBaseRow re-paints a live sequence's box and stops a dead one.
  </action>
  <verify>
    <automated>node .planning/quick/261031-tnu-cyclic-groups-double-click-a-closed-a-or/force-dblclick-check.mjs</automated>
  </verify>
  <done>Probe scenarios pass; no page exceptions.</done>
</task>

<task type="auto">
  <name>Task 2: probe, regression runs, gates, screenshot</name>
  <files>.planning/quick/261031-tnu-cyclic-groups-double-click-a-closed-a-or/force-dblclick-check.mjs</files>
  <action>
Probe scenarios: z12 (a2 → 7, a → 5, sampled class order, URL), tie (found by model), other (other map on a stays; model invariant), units13, curve, open (dblclick an open position = click), single (single click unchanged), cancel (click mid-sequence, re-render mid-sequence by language switch), pane, ringwin, shot. Then full runs of log-base-boxes-check.mjs and m2b formula-map-check.mjs, i18n gates.
  </action>
  <verify>
    <automated>node .planning/quick/261031-pm3-cyclic-groups-generator-boxes-replace-th/log-base-boxes-check.mjs && node .planning/quick/261031-m2b-cyclic-groups-2-d-formula-map-control-fo/formula-map-check.mjs</automated>
  </verify>
  <done>All three probes print their OK markers; gates ≤ 31 / 4 / 109; screenshot in the task dir.</done>
</task>

</tasks>

<verification>
- force-dblclick-check.mjs, log-base-boxes-check.mjs, formula-map-check.mjs all OK.
- i18n-check --coverage ≤ 31, --literals-markup ≤ 4, --literals-js ≤ 109.
</verification>
