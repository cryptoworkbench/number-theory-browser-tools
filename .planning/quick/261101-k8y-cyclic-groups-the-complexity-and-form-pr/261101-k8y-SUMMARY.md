---
quick_id: 261101-k8y
phase: quick-261101-k8y
plan: 01
status: complete
subsystem: cyclic-groups
tags: [cyclic-groups, sliders, ui, cdp-probe]
requires: [261031-wef, 261101-hl9, 261101-ix2]
provides:
  - Complexity and Form preference drawn as real sliders (track, three slots, round knob centred in one)
  - a refusal nudge (the knob tries toward a refused slot and springs back)
  - slider-check `knob` scenario and k8y light/dark screenshots
affects:
  - Cyclic Groups/cyclic-groups.html
  - .planning/quick/261031-wef-cyclic-groups-complexity-and-form-prefer/slider-check.mjs
tech-stack:
  added: []
  patterns: [knob placed by CSS at the slot centre 100%/6*(2v+1), flash classes on the slot with children inheriting its animation-delay]
key-files:
  created: []
  modified:
    - Cyclic Groups/cyclic-groups.html
    - .planning/quick/261031-wef-cyclic-groups-complexity-and-form-prefer/slider-check.mjs
decisions:
  - "D-01 Markup keeps .fsl (role=slider) and three .fsl-notch[data-v]; a notch is now a slot column holding .fsl-detent and .fsl-label, so every probe selector and the carry stay valid"
  - "D-02 The knob is a disc placed from --v at the slot centre; the drag clamps it between the outer slot centres"
  - "D-04 A refused move nudges the knob (Web Animations transform, skipped under reduced motion), leaving style.left and --v untouched"
  - "D-05 Flash and force classes stay on .fsl-notch; their animations run on the slot ring and caption with animation-delay: inherit"
metrics:
  duration: "about 1 h (with a rate-limit pause)"
  completed: 2026-11-01
estimate:
  tokens: 45000
  tasks: 2
actuals:
  tokens: 9000
  tasks: 2
  commits: 2
plan_head_before: ce8fc824f17362782c8ce9b0d421e4f678f2bd25
plan_head_after: 4a11305
---

# Phase quick-261101-k8y Plan 01: Complexity and Form preference as real sliders Summary

On a cyclic (ℤ/nℤ)* and on a cyclic curve, each formula's Complexity and Form preference controls are now real sliders. Each has a horizontal grooved track with three round slots cut into it, a small caption under each slot (JN / compact / complete; LCM / neither / GCD), and a round accent knob that always comes to rest centred in exactly one slot. The "Complexity" / "Form preference" captions and the map toggle are where they were. State, tokens, URL keys and the additive map are unchanged.

## What was built

- **Markup** (in `formulaSliders`): each `.fsl-notch[data-v]` is now a slot column with two children:
  - `.fsl-detent`, the hollow on the track;
  - `.fsl-label`, its caption.

  The notch's text content is still the label. `.fsl-track` and `.fsl-knob` are unchanged as elements.
- **CSS** (palette tokens only, `color-mix` of `--text`, `--surface`, `--accent`, `--role-result`, `--role-warn`):
  - The track is 5 px tall and inset. It reaches 7 px past the outer slots.
  - Slots are 10 px rings with an inset shadow.
  - The knob is a 15 px accent disc with a `--surface` rim and a soft shadow. Its `left` is `calc(100% / 6 * (2 * var(--v) + 1) - var(--fsl-k) / 2)`, and the `left` transition is .22 s ease-out. While dragging, the knob gets a halo.
  - The phone (`:root.is-mobile`) uses a 19 px knob and 12 px slots. The sizes are the non-colour custom properties `--fsl-y`, `--fsl-k` and `--fsl-d`.
- **Closed neither:** the slot fades to opacity .4, and its ring is dashed and hollow, with `not-allowed`.
- **JN:** the form slider is dimmed with a grey knob, as before.
- **Drag:** the knob follows the pointer, clamped between the outer slot centres. On release, the unchanged `go(nearest)` commits. The existing hl9 carry animates the knob from the release point into the slot.
- **Click:** a click on a slot or on its caption commits through `go(v)`, and the carry slides the knob over.
- **Keys:** the arrows and Home/End are unchanged. `role="slider"`, `aria-valuetext` and focus restore are unchanged. The focus ring is now a round outline on the knob.
- **Refusal** (a closed neither, or a blocked complexity from ix2):
  - From rest, the knob "tries": it moves up to 9 px toward the refused slot and springs back over 320 ms. This is a Web Animations `transform`, and it is skipped under reduced motion.
  - From a drag, the knob slides back.
  - The flash on the refused slot and on the neither slot, the box hint, the padlock nudge and the alarm all run as before.
- **Flash and force pulses:** the classes stay on `.fsl-notch` (`is-flash-no`, `is-force-pulse`, `is-force-set`).
  - Their animations now make the slot ring glow (a 4 px `--role-warn` / `--role-result` halo, visible around the knob) and colour the caption.
  - The notch also gets a brief `opacity:1` so a faded closed slot shows them.
  - The children use `animation-delay: inherit`, so the negative-delay carry across rebuilds still works.

## Judgement calls

- **Class names kept.** `.fsl-notch` now names a slot rather than a chip. Keeping it meant no existing probe needed a selector change. All six regression probes passed unchanged, so the only probe edits are additions.
- **No fill on the track.** The track has no "filled up to the knob" part, because these are three discrete choices, not an amount.
- **The refusal nudge** applies to both kinds of refusal: a closed neither and a blocked complexity. On a keyboard refusal the knob also tries, which reads as "it tried and can't go there".
- **Pair size** is 186 px wide, as before. The rows gained 2 px of gap so the "Form preference" caption does not crowd the slot labels above it. The render probe's 200 x 104 budget still passes.
- **New `@keyframes`** `fsl-slot-ok/no/pulse`, `fsl-label-ok/no/pulse` and `fsl-unfade` replace the chip's use of `lb-flash-*` / `lb-force-pulse` on the notch. The boxes still use those. Timings are identical: 1.1 s, and .55 s x 2.

## Probe results

All runs came after the page commit (aca5c98), one at a time, with logs in this directory (untracked).

| Probe | Result |
|---|---|
| slider-check.mjs (wef, full default run incl. new `knob`) | SLIDER-CHECK OK, 152 PASS / 0 FAIL (132 old + 20 new) |
| slider-check.mjs shot | OK, 12 k8y PNGs written (below) |
| map-toggle-check.mjs (hl9, full) | MAP-TOGGLE-CHECK OK, 128 PASS / 0 FAIL |
| blocked-check.mjs (ix2, full) | BLOCKED-CHECK OK, 77 PASS / 0 FAIL |
| force-dblclick-check.mjs (tnu, full) | FORCE-DBLCLICK-CHECK OK, 95 PASS / 0 FAIL |
| log-base-lock-check.mjs (uya, full) | LOG-BASE-LOCK-CHECK OK, 86 PASS / 0 FAIL |
| formula-map-check.mjs (m2b, targeted: syntax units curve ecmult composite noncyclic mobile pane) | FORMULA-MAP-CHECK OK, 341 PASS / 0 FAIL |
| log-base-boxes-check.mjs (pm3, targeted: syntax flash keys mobile pane) | LOG-BASE-CHECK OK, 53 PASS / 0 FAIL |
| i18n `--coverage` / `--literals-markup` / `--literals-js` | 31 / 4 / 109 (baseline) |

The new `knob` scenario checks:
- On load, every knob is round and centred on its slot's detent (within 0.6 px), for both formulas and both sliders.
- There are three slots on one track, each caption sits under its slot, and the knob is on the track line and bigger than a slot.
- A click on the LCM slot gives a running `left` transition midway, then the knob rests centred.
- A click on compact's caption commits.
- ArrowRight and End leave the knob centred.
- Drags released between two slots:
  - 42 % from neither toward LCM gives abs-gcd. The snap is animated from the release point, and the knob ends centred.
  - At 58 % the result is lcm-full, centred.
  - Released nearer its own slot, nothing commits and the knob slides back.
  - At 70 % toward JN the result is jn.
- A drag past the end stops on the end slot.
- A refused complexity click: the knob tries toward compact (an animation runs, the knob off-centre toward the slot) and springs back centred.
- A refused drag and a refused ArrowLeft both leave the knob centred.
- A click on the closed neither does not commit. The slot is faded and dashed.
- Phone: knobs of at least 17 px, centred, and a tap slides the knob over.

No behavioural expectation changed in any probe.

## Screenshots (untracked, in this directory)

- `shot-k8y-pair-closed-{light,dark}.png`: order pair at compact / GCD, neither closed.
- `shot-k8y-box-{light,dark}.png`: the whole formula box at 1280.
- `shot-k8y-pair-jn-{light,dark}.png`: JN, form slider dimmed.
- `shot-k8y-mobile-{light,dark}.png`: phone, 390 px.
- `shot-k8y-narrow-760-light.png` (stacked ring head) and `shot-k8y-narrow-700-light.png` (single column), maps open.

I looked at all of them. Each reads unambiguously as a slider, with a grooved track, three ring slots, captions under them and a round knob in one slot, in both themes. The narrow and phone layouts centre the pair with nothing clipped.

## Deviations from Plan

None in substance. The probe additions sit in slider-check (the plan's Task 2). map-toggle-check and blocked-check needed no edits because the markup kept their selectors valid.

## Profile dirs removed (this run's only)

- `/tmp/cg-fmap-K28Dwe` (formula-map-check) and `/tmp/cg-lbase-pLMyYZ` (log-base-boxes-check). Both were left behind after their probe exited, and each was removed after checking that no Chrome process was using it.
- `/tmp/cg-*` was empty before and after.

## Known limits

- The page renders at a CSS zoom of 0.9 at 1280, so at 1x device scale the knob is about 13.5 px on screen and the captions are small. This is fine on HiDPI and similar in size to the old chips' text.
- A knob caught mid-nudge by a rebuild loses the nudge. The new knob starts at rest, with no visible jump because the nudge is at most 9 px.
- formula-map-check and log-base-boxes-check were run on their slider-related scenarios only. Their additive ℤ/nℤ scenarios do not render sliders, and full runs take about 7 min.
- A double tap on a phone is still not a force gesture (same as wef).

## Commits

- aca5c98 feat(cyclic-groups): the complexity and form preference controls are real sliders, a round knob resting in one of three slots on a track
- 4a11305 test(quick-261101-k8y): slider-check probes the knob centred in its slot and the snap of a drag let go between slots, with light and dark shots

## Self-Check: PASSED

- FOUND: `Cyclic Groups/cyclic-groups.html` (contains `fsl-detent` and `balk`)
- FOUND: slider-check.mjs (contains `SCENARIOS.push(['knob'`)
- FOUND: commits aca5c98 and 4a11305 on cyclic-groups-real-sliders. Nothing was pushed, and STATE.md was not touched.
