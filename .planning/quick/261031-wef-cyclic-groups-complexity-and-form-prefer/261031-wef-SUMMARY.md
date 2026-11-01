---
quick_id: 261031-wef
phase: quick-261031-wef
plan: 01
status: complete
subsystem: cyclic-groups
tags: [cyclic-groups, formula-map, sliders, a11y, cdp-probe]
requires: [261031-m2b, 261031-pm3, 261031-tnu, 261031-uya]
provides:
  - Complexity and Form preference sliders replacing the formula maps on a cyclic (ℤ/nℤ)* and a cyclic curve
  - slider-check.mjs CDP probe
affects:
  - Cyclic Groups/cyclic-groups.html
  - assets/i18n/cyclic-groups.js
  - the four 261031-* probes
tech-stack:
  added: []
  patterns: [discrete 3-notch slider over the existing state.fmap tokens, CSS --v knob placement, per-frame form memo]
key-files:
  created:
    - .planning/quick/261031-wef-cyclic-groups-complexity-and-form-prefer/slider-check.mjs
  modified:
    - Cyclic Groups/cyclic-groups.html
    - assets/i18n/cyclic-groups.js
    - .planning/quick/261031-m2b-cyclic-groups-2-d-formula-map-control-fo/formula-map-check.mjs
    - .planning/quick/261031-pm3-cyclic-groups-generator-boxes-replace-th/log-base-boxes-check.mjs
    - .planning/quick/261031-tnu-cyclic-groups-double-click-a-closed-a-or/force-dblclick-check.mjs
    - .planning/quick/261031-uya-cyclic-groups-padlock-freezes-the-main-f/log-base-lock-check.mjs
decisions:
  - "J-01: only the form slider's neither notch is ever closed; a complexity move onto a closed a/a2 falls back to the remembered row's GCD/LCM form"
  - "J-02: a per-formula form memo {form, row} in module scope per frame, refreshed from every non-JN token, not persisted"
  - "J-03: arrows step over a closed neither, Home/End go to the ends, forcing only by double-click"
  - "J-04: each slider a miniature linear map (chips like .fmap-node, knob like .fmap-knob), pair 186 px wide"
  - "J-05: click commits; drag after 3 px with pointer capture, nearest notch on release, following click swallowed"
  - "J-06: default stays gcd-full (complete + GCD), so a fresh (ℤ/nℤ)* / curve page opens with the generator row"
metrics:
  duration: "about 3 h (with a rate-limit pause)"
  completed: 2026-11-01
estimate:
  tokens: 95000
  tasks: 3
actuals:
  tokens: 25142
  tasks: 3
  commits: 4
plan_head_before: d83c82742a9b81a0b2154208e1074889deca960c
plan_head_after: 648b233fceb54daf1992a68cee7a42fd7dbb58ab
---

# Phase quick-261031-wef Plan 01: Complexity and form preference sliders Summary

On a cyclic (ℤ/nℤ)* and a cyclic curve, each main-view formula now has two
3-notch sliders in its formula map's place: Complexity (JN / compact / complete)
and Form preference (LCM / neither / GCD). Together they walk the same
`state.fmap` grid and use the same URL keys. ℤ/nℤ keeps its map unchanged.

## What was built

- `hasSliders(G)` (non-additive and `hasMap`). The mapping helpers are
  `FSL_COMPLEXITY`, `FSL_FORM`, `fslOf`, `fslToken`, `fslNeitherNode` and
  `fslTarget`, plus the form memo `fslMemo`.
- `formulaSliders(G, info)`: a `span.fsl-pair.log-ctl` with `data-f`,
  `data-at` (the map's node id) and `data-token`. It holds two `.fsl`
  elements with `role="slider"`, aria-valuenow/valuetext and aria-labels.
  - Each notch's tooltip is the map's tooltip for the position that notch
    leads to.
  - At JN the form slider is inert (`is-inert`, `aria-disabled`,
    `tabindex=-1`, tooltip `fslFormInert`) and shows the remembered form.
  - The neither notch is drawn closed while a2 (compact) or a (complete) is
    shut.
- `setFormulaToken(f, token)` is the shared commit tail. `setFormulaMap` now
  calls it, and the additive behaviour is identical.
- Input:
  - A click commits.
  - A drag snaps to the nearest notch on release.
  - On a closed neither, a click or drag release gives the green/red box
    hint, plus a padlock nudge when locked.
  - A double-click on a closed neither runs `forceMapPosition` for pos or
    abs. The notch pulses and flashes in step with the box; `stopLogForce`
    and the builder carry or clear this.
  - Keyboard: the arrows, Home and End. The window's arrow handler excludes
    `.fsl-pair`.
  - The focus is restored across rebuilds. If the form slider is now inert,
    the focus goes to the pair's complexity slider instead.
- Generator row: on slider groups it shows unless every shown formula is at
  JN (D-05). The additive all-SLS rule is unchanged.
- CSS uses palette tokens only. The pair is in the single-column centring
  rules and in the RTL LTR list, and the knob transition is off under
  reduced motion.
- Ten English-only `fsl*` strings were added after `logBaseLocked`, and the
  header paragraph names them.

## Judgment calls (J-01 .. J-06)

- **J-01** Only the form slider's neither notch can be closed.
  - A complexity change that would land on a closed a / a2 takes the
    remembered row's form at the new complexity. Example: abs-lcm to compact
    with a2 closed gives lcm-short, with the neither notch shown closed.
  - Leaving JN while the remembered form is neither does the same.
- **J-02** Each formula has a memo `{form, row}`, kept per frame in module
  scope.
  - It is refreshed from the token on every build while the token is not
    `jn`, so it also follows settleMaps, the right-click switch and the pane.
  - It is not persisted: a reload at JN shows GCD.
- **J-03** The arrows step over a closed neither, and Home/End go to the
  ends. Forcing is by double-click only.
- **J-04** Look:
  - Chips are styled like `.fmap-node` (panel fill, `--text` 34% border,
    dim text, full text when active).
  - The knob is styled like `.fmap-knob` (1.6px accent border, accent 22%
    fill, .2s transition).
  - A closed notch is at opacity .4 with a dashed border. The inert slider
    is dimmed, with a muted knob.
  - Each slider has a caption above it.
  - The pair measures 186 x about 70 CSS px (167 x 65 measured at the
    desktop page zoom), inside the 200 x 104 budget.
- **J-05** Pointer handling:
  - A notch commits on `click`.
  - A drag starts after more than 3 px of movement, with pointer capture;
    the knob follows the pointer without its transition.
  - On release the nearest notch commits, and the click that follows the
    drag is swallowed.
  - The `dblclick` listener finds its notch by `closest`, else the notch
    nearest the pointer.
- **J-06** The default stays `gcd-full` (complete + GCD), so a fresh
  multiplicative or curve page opens with the generator row showing.
  - **Flag:** if "at first there are only the complexity slider and the form
    preference slider" means the page should open on JN, that is a separate
    follow-up. It would change what an absent `fmaporder` means for these
    groups.

## Probe results (all after the final page edit, c984911)

| Probe | Result |
|---|---|
| slider-check.mjs (full default run) | SLIDER-CHECK OK, 132 PASS / 0 FAIL (159 s) |
| slider-check.mjs shot | OK; `shot-sliders-light.png` and `shot-sliders-jn-light.png` written (untracked) |
| formula-map-check.mjs (m2b, full) | FORMULA-MAP-CHECK OK, 605 PASS / 0 FAIL (434 s) |
| log-base-boxes-check.mjs (pm3, full) | LOG-BASE-CHECK OK, 179 PASS / 0 FAIL |
| force-dblclick-check.mjs (tnu, full) | FORCE-DBLCLICK-CHECK OK, 95 PASS / 0 FAIL (99 s) |
| log-base-lock-check.mjs (uya, full) | LOG-BASE-LOCK-CHECK OK, 86 PASS / 0 FAIL |
| i18n `--coverage` / `--literals-markup` / `--literals-js` | 31 / 4 / 109 (baseline, none rose) |

Flakes seen, both in additive ℤ/12ℤ scenarios that this plan does not touch:
- An m2b `snap` page load timed out once and passed on rerun.
- One tnu full run hung in `z12` until its 600 s timeout and passed in full
  (95/95) on rerun.

## Changed probe expectations (D-09)

Every additive (ℤ/nℤ) check is unchanged.

**Shared helpers in all four probes**
- `mapsNow`, `mapsIn`, the samplers and `openPane`/`paneReady` read
  `.fsl-pair` as well as `.fmap`. A pair's `data-at` is the same node id.
- Reason: (ℤ/nℤ)* and curves have no `.fmap` any more.

**m2b formula-map-check.mjs**
- `checkGroup` (units, curve, ecmult, composite): radios, `checked`, `off`
  and `n === 9` → for non-additive groups, the pair's `data-at`, complexity
  and form valuenow, the neither notch closed exactly when its a/a2 is shut,
  and the form slider inert exactly at JN.
- `curve`: "the base row stays while every shown formula sits on JN" → "no
  base row, padlock or wheel switch" (D-05).
- `noncyclic`: also asserts no `.fsl-pair`.
- `pane`, on the pane's (ℤ/13ℤ)*:
  - `.fmap-stop[lcm-full]` click → the complete notch.
  - `.fmap-stop[gcd-short]` click → the compact notch.
  - Same tokens reached.
- `snap`, `ctx`, `regress` and `shot`: unchanged and passing (`snap` reads
  the pairs through `mapsNow`).

**pm3 log-base-boxes-check.mjs**
- `flash`, (ℤ/13ℤ)* part: a click on the map's closed a2 at gcd-full → a
  click on the form slider's closed neither at `fmaporder=gcd-short`. Same
  green/red sets; the token stays gcd-short.
- The (ℤ/13ℤ)* "SLS radios plainly disabled" and "click on a disabled SLS
  radio does nothing" checks → "(ℤ/13ℤ)* offers no SLS position (no map, no
  SLS notch)".
  - Reason: the SLS radios no longer exist there.
  - They cannot move to ℤ/12ℤ, where SLS is open rather than disabled.
- `pane`: `paneReady` counts `.fmap, .fsl-pair`.

**tnu force-dblclick-check.mjs**
- `forceRun` has an `opts.slider` option, used by `units13` and `curve`:
  - It loads with `fmaporder=gcd-short` for a2 (gcd-full for a).
  - It double-clicks the form neither notch.
  - The "while it pulses" expectation is now the start token (gcd-short)
    instead of gcd-full.
- `pane`: the pane first clicks compact, then double-clicks the neither
  notch by synthetic events (was the `.fmap-stop[pos]` input).

**uya log-base-lock-check.mjs**
- `alarmRun` has the same `opts.slider` option, used by `units13` and
  `curve`. The expected token is gcd-short, and the sampler also requires no
  notch force class.
- `pane`: the pane clicks compact before the locked double-click.
  - The host's `fmaporderr` is now expected to be `gcd-short`; it was `null`.
  - Reason: the compact click moves it. Nothing is forced.
- `ringwin` and `mobile` are additive and unchanged.

## Deviations from Plan

1. **[Task split] Task 2's page features went into the Task 1 commit (010fa52).**
   - Drag, keys, double-click forcing, notch pulses, focus restore and the
     arrow-handler exclusion all live inside `formulaSliders` and its
     neighbours, so they were written and committed together with the
     builder.
   - The Task 2 commit (4dc2525) is therefore test-only, with the message
     `test(quick-261031-wef): ...` instead of the planned `feat(...)`.
2. **[Rule 1 - Bug] The literals-js gate rose to 110.**
   - Cause: the focus restore built its selector from the literal
     `'"] .fsl'`.
   - Fix: it now finds the pair first, then the slider in it. The gate is
     back to 109.
   - This is a separate commit, c984911, so there are 4 commits instead of 3.
3. **Knob placement.** The knob is placed by CSS (`--v` set on the slider,
   with `calc` over three equal-width grid columns) instead of from chip
   offsets after insertion.
   - Same look and transition.
   - It needs no layout pass, and a slider built while hidden still shows
     its knob in the right place.
4. **/tmp quota.** Running the slider and m2b probes in parallel filled the
   user's /tmp quota.
   - I killed both runs and removed their two profiles (`cg-slider-ORbHIk`,
     `cg-fmap-AVta8h`).
   - After that, probes ran one at a time through a small runner. The runner
     removes only the `cg-*` profile dirs that appeared during its own run
     and that no Chrome process still uses.

## Profiles removed (my own runs only)

- `cg-slider-ORbHIk`, `cg-fmap-AVta8h`: the two killed parallel runs.
- `cg-fmap-S7snSy`, `cg-fmap-FNGFWB`, `cg-fmap-XLT5Oq`, `cg-fmap-ZVTZen`,
  `cg-fmap-B9jGeF`: m2b runs.
- `cg-lbase-gKMiSI`, `cg-lbase-lTwMqJ`, `cg-lbase-oomC2J`: pm3 runs.
- `cg-force-3E69LC`: the hung tnu run.
- The slider, tnu and uya probes removed their other profiles themselves.
- The 51 pre-existing `/tmp/cg-*` dirs were left untouched; the count is
  back to 51.

## Known limits

- The form memo is per frame and not persisted (J-02): a reload at JN
  forgets a remembered LCM or neither.
- A double tap on a phone is not covered as a force gesture. It is the same
  as tnu's INFO-only tap case.
- ℤ/nℤ keeps its map; its sliders are left for the user to design later.

## Commits

- 010fa52 feat(cyclic-groups): complexity and form preference sliders replace the formula maps on (ℤ/nℤ)* and curves
- 4dc2525 test(quick-261031-wef): probe the sliders' drag, keys, closed neither, forced double-click and padlock
- c984911 fix(cyclic-groups): the sliders' focus restore finds its pair first, with no worded selector literal
- 648b233 test(quick-261031-wef): the formula-map probes read the sliders on (ℤ/nℤ)* and curves

## Self-Check: PASSED

- The created and modified files exist.
- All four commits are ancestors of HEAD on cyclic-groups-formula-sliders.
- Nothing was pushed.
- STATE.md and the PLAN were not touched.
