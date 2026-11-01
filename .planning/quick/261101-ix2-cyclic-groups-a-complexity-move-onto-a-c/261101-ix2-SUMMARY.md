---
quick_id: 261101-ix2
phase: quick-261101-ix2
plan: 01
status: complete
subsystem: cyclic-groups
tags: [cyclic-groups, formula-map, sliders, refusal, flash, cdp-probe]
requires: [261031-wef, 261101-hl9]
provides:
  - fslBlocked, a refused complexity move onto a shut neither, replacing 261031-wef's J-01 fallback
  - the refusal flash (refuseFslComplexity / stopFslRefuse / paintFslRefuse) with a carry across rebuilds
  - forceMapPosition(G, f, id, { cv, row }) for a double-click on a blocked complexity notch
  - blocked-check.mjs CDP probe
affects:
  - Cyclic Groups/cyclic-groups.html
  - assets/i18n/cyclic-groups.js
  - .planning/quick/261031-wef-cyclic-groups-complexity-and-form-prefer/slider-check.mjs
tech-stack:
  added: []
  patterns: [refusal record with t0 repainted by the builders at a negative animation-delay, like fslBand and logForce]
key-files:
  created:
    - .planning/quick/261101-ix2-cyclic-groups-a-complexity-move-onto-a-c/blocked-check.mjs
  modified:
    - Cyclic Groups/cyclic-groups.html
    - assets/i18n/cyclic-groups.js
    - .planning/quick/261031-wef-cyclic-groups-complexity-and-form-prefer/slider-check.mjs
decisions:
  - "J-01 (ix2): a complexity notch is blocked when the form is neither (at JN the remembered one) and the base shuts that complexity's neither; the move is refused, never turned into GCD/LCM"
  - "A blocked notch is not drawn closed: it keeps its look, gains class is-blocked (unstyled, for probes) and a tooltip saying the base must change first"
  - "Arrows and Home/End onto a blocked notch are refused with the flash; nothing steps over it"
  - "The refusal flash reuses lb-flash-no on the notches and flashLogBases on the boxes; an open map's stop gets a new fmap-flash-no, the role-warn twin of fmap-force-set"
  - "A double-click forces through forceMapPosition with { cv, row }: the complexity notch pulses too, the row comes from the memo when starting at JN"
  - "settleMaps is unchanged: a base change that shuts the selected neither still snaps back as before"
metrics:
  duration: "about 27 min of work plus about 17 min of probe runs"
  completed: 2026-11-01
estimate:
  tokens: 40000
  tasks: 2
actuals:
  tokens: 16000
  tasks: 2
  commits: 2
plan_head_before: 5e79a207daa72210d932f8af056cdee4340a70a2
plan_head_after: 47b652d6529eb1721dded86d269069e936f2de75
---

# Phase quick-261101-ix2 Plan 01: a complexity move onto a shut neither is refused Summary

Before this change, with neither selected and the base shutting a2, moving Complexity from complete to compact quietly switched the form to GCD or LCM (J-01). Now the move is refused. Complexity stays put, form stays on neither, and neither the state nor the URL changes. Instead, the compact notch and the neither notch flash red. The generator boxes flash green or red to show which bases would open a2, the padlock nudges if it is locked, and an open formula map flashes its a2 node. A double-click on the refused notch forces the nearest base that opens it, then moves to compact / neither.

## What was built

- `fslBlocked(v, token, reach, memo)` is true when:
  - v is compact or complete and not the current complexity;
  - the form is neither (at JN, the remembered form);
  - the base shuts that complexity's neither node (`pos` at compact, `abs` at complete).

  `fslTarget` returns `null` for a blocked notch. The old fallback to the row's form is gone.
- `formulaSliders`:
  - `blocked(v)` applies to the complexity slider only.
  - `go(v)` refuses a blocked notch: the knob goes back and `refuseFslComplexity` runs. Click, drag release, the arrows and Home/End all go through `go`, so none of them can skip over the notch.
  - The complexity slider now has its own `dblclick` listener. On a blocked notch it calls `forceMapPosition(G, f, fslNeitherNode(v), { cv: v, row })`.
  - A blocked notch gets class `is-blocked` and the tooltip `fslBlockedCompact` / `fslBlockedComplete`.
  - On a rebuild, the notches repaint a running refusal flash and a running force on the `cv` notch.
- `refuseFslComplexity(G, f, v)` runs the existing `flashLogBases(G, node)`, then `alarmLogLock('nudge')` when locked. It then adds `is-flash-no` to:
  - the refused complexity notch;
  - the form slider's neither notch;
  - the open map's `.fmap-stop[data-id=node]` (slider groups only).

  The classes are cleared after 1.2 s. `fslRefuse = { f, v, node, t0 }` lets `formulaSliders` and `formulaMap` repaint the flash on a rebuilt box at a negative `animation-delay`.
- `forceMapPosition(G, f, id, opts)`:
  - It stores `cv` and `row` in `logForce` and pulses the `cv` complexity notch together with the box and the neither notch.
  - The row comes from the current token, else `opts.row` (the memo when starting at JN), else GCD.
  - It clears a running refusal flash when it really forces. With the padlock locked it only sounds the alarm, as before, so the hint left by the two clicks stays.
- CSS:
  - `.fsl-notch.is-flash-no` reuses `lb-flash-no` (1.1 s).
  - A new `fmap-flash-no` keyframe drives `.fmap-stop.is-flash-no`. It is the `--role-warn` twin of `fmap-force-set`.
  - No literal colours.
- i18n: two English-only strings, `fslBlockedCompact` and `fslBlockedComplete`, are added after `fslMapHide`. The header comment names them. The gate config is untouched.

## Judgement calls

- **Which moves are refused.** Every complexity move that would land on a shut neither cell. Because a2 open implies a open (q | N implies r exists), complete can never be shut while compact is open. So in practice:
  - complete / neither → compact is refused while a2 is shut;
  - from JN with neither remembered, compact is refused while a2 is shut, and complete while a is shut.

  The probe covers both JN cases, including a base under which both are shut.
- **No new look for a blocked notch.** It is drawn as before. The tooltip explains it, and the flash happens when the user tries to move there. Drawing it dashed like the closed neither would have been a new visual the user did not ask for.
- **Home/End:** Home always reaches JN, which is never blocked, so it is not treated as skipping. End onto a blocked complete is refused with the flash.
- **Double-click row:** a force that starts from JN uses the remembered row, so it lands on `pos-lcm` rather than defaulting to `pos-gcd`.
- **settleMaps:** unchanged. If a base change shuts the neither cell that is already selected, it still snaps back as before. This does not conflict with the refusal, which only governs complexity moves.
- **The flash** lasts 1.1 s, like the boxes' hint. Under reduced motion it still runs, because the existing box and notch flashes do too.

## Probe results

All runs were after the final page commit (9c8bf62), one at a time, with logs in this directory.

| Probe | Result |
|---|---|
| blocked-check.mjs (new, full default run) | BLOCKED-CHECK OK, 77 PASS / 0 FAIL (70 s) |
| blocked-check.mjs shot | OK, `shot-blocked-flash-light.png` (untracked) |
| slider-check.mjs (wef, full) | SLIDER-CHECK OK, 132 PASS / 0 FAIL (162 s) |
| map-toggle-check.mjs (hl9, full) | MAP-TOGGLE-CHECK OK, 128 PASS / 0 FAIL (106 s) |
| formula-map-check.mjs (m2b, full) | FORMULA-MAP-CHECK OK, 605 PASS / 0 FAIL (444 s) |
| log-base-boxes-check.mjs (pm3, full) | LOG-BASE-CHECK OK, 179 PASS / 0 FAIL (169 s) |
| force-dblclick-check.mjs (tnu, full) | FORCE-DBLCLICK-CHECK OK, 95 PASS / 0 FAIL (102 s) |
| log-base-lock-check.mjs (uya, full) | LOG-BASE-LOCK-CHECK OK, 86 PASS / 0 FAIL (103 s) |
| i18n `--coverage` / `--literals-markup` / `--literals-js` | 31 / 4 / 109 (baseline) |

blocked-check scenarios:

- **syntax**
- **refuse:**
  - from abs-lcm and from abs-gcd: state and URL unchanged; flash on the compact notch, the neither notch and the boxes (green 7,11 / red 2,6 per the model); gone after 1.3 s;
  - a drag release;
  - JN with neither remembered;
  - (ℤ/13ℤ)* h=2 under base 6, which shuts both a and a2, with complete and compact each refused;
  - a curve E(𝔽₁₁).
- **keys:** ArrowLeft / ArrowDown refused at complete; ArrowRight / ArrowUp refused at JN and not skipped to complete; Home and End reach open cells.
- **force:** double-click from complete and from JN. The box, the compact notch and the neither notch pulse, then flash. The base is set at about 1.1 s, giving `logbase=7&fmaporder=pos-lcm`, and the formulas match the model.
- **lock:** the click nudges the padlock and still flashes. The double-click sounds the alarm and forces nothing.
- **map:**
  - only the order map's a2 stop flashes;
  - a double-click pulses that map node;
  - a rebuild mid-flash (the map toggle) carries the flash at a negative delay and it still ends on time.
- **open:** moves onto open cells, including the arrows, GCD/LCM complexity moves under the shutting base, and LCM remembered across JN.

## Changed probe expectations

- **slider-check.mjs `memo`:** the two J-01 checks now expect the refusal.
  - `abs-lcm → compact` stays on abs-lcm (it was lcm-short).
  - `abs-gcd → JN → compact` stays on jn with neither remembered (it was gcd-short).
- No other probe changed.

## Deviations from Plan

None. The plan was executed as written. The probe gained a `shot` scenario, which is not part of the default run.

## Profile dirs removed (this run's only)

- `/tmp/cg-fmap-dzlP6X` (formula-map-check) and `/tmp/cg-lbase-50wUHf` (log-base-boxes-check). Both were left behind after their probe exited, and each was removed only after confirming that no Chrome process was using it.
- The other probes removed their own profiles. `/tmp/cg-*` was empty before and after.

## Known limits

- The isomorphism pane and the `?ringwin=1` window use the same `formulaSliders` code, so the refusal applies there too. The probe does not exercise them.
- A double tap on a phone is not a force gesture, the same limit as 261031-wef.
- The new tooltips are English only, shown through the i18n fallback in every other language, like the other `fsl*` strings.
- Regression logs (`regress-*.log`) and the screenshot are left untracked in this directory.

## Commits

- 9c8bf62 feat(cyclic-groups): a complexity move onto a shut neither is refused with a flash, a double-click forces its base
- 47b652d test(quick-261101-ix2): probe the refused complexity move, and slider-check's J-01 now expects the refusal

## Self-Check: PASSED

- FOUND: `Cyclic Groups/cyclic-groups.html` (contains `function fslBlocked` and `function refuseFslComplexity`)
- FOUND: `assets/i18n/cyclic-groups.js` (contains `fslBlockedCompact`)
- FOUND: `blocked-check.mjs`
- FOUND: commits 9c8bf62 and 47b652d on cyclic-groups-blocked-complexity. Nothing was pushed, and STATE.md was not touched.
