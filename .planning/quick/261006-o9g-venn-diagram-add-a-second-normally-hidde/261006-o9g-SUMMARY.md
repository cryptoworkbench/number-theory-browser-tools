---
phase: quick-261006-o9g
plan: 01
subsystem: venn-diagram
tags: [venn, lcm, gcd, i18n, svg, bigint]
status: complete
requirements: [QUICK-O9G-01, QUICK-O9G-02, QUICK-O9G-03]
key-files:
  modified:
    - Venn Diagram/venn-diagram.html
    - assets/i18n/venn-diagram.js
  created:
    - .planning/quick/261006-o9g-venn-diagram-add-a-second-normally-hidde/lcm-probe.js
    - .planning/quick/261006-o9g-venn-diagram-add-a-second-normally-hidde/lcm-day.png
    - .planning/quick/261006-o9g-venn-diagram-add-a-second-normally-hidde/lcm-night.png
decisions:
  - "Lowercase lcm(A, B) / gcd(A, B) notation, literal in every language"
  - "Native BigInt for the equation; nt-bigint.js not included, no fmt grouping"
  - "Fold is not persisted; collapsed on every load"
  - "Fold sits after #message, outside #frame-two; setMode hides it in three-circle mode"
commits: 3
plan_head_before: 7dbb9dd27155f50b56353edce9a2a2ce5f4d4efa
plan_head_after: c2cc98313fbed42e41b937a9effca0663c750e1a
actuals:
  tokens: 60000
  tasks: 3
  commits: 3
completed: 2026-10-06
---

# Phase quick-261006-o9g Plan 01: LCM/GCD fold for the Venn Diagram Summary

A collapsed-by-default fold under the two-circle Venn Diagram that animates lcm(A, B) = (A × B) ÷ gcd(A, B) in three captioned stages, with an exact BigInt equation line, translated into all sixteen languages.

## What was built

- **Fold** (`#lcm-fold`, after `#message`): full-width toggle (aria-expanded/aria-controls), collapsed on every load, hidden in three-circle mode with its open state kept. Empty diagram shows a one-line hint instead of the content.
- **Stages** (autoplay on open, 1.8 s holds, then Previous/Next/Replay): 1 circles apart with shared primes in both; 2 B's copy lifted into a dashed gcd box and struck through; 3 circles slide together, shared primes once in the lens, union outlined. Step label and whole-sentence caption per stage (separate coprime variants).
- **Equation line** computed in BigInt: `lcm(12, 18) = (12 × 18) ÷ 6 = 216 ÷ 6 = 36`; the 30-digit case is exact (lcm 9984108835867799588150201).
- **Live behaviour**: follows place/remove/clear/undo/randomize via `render()`; SVG rebuilt only when the prime lists change, so unrelated renders and language switches never snap an animation or reset the stage.
- **i18n**: 12 `lcm.*` keys in 16 languages; ru/el in their own script apart from literal notation.
- **Probe** `lcm-probe.js`: syntax pre-flight, error collector, 18 scenarios (share 11, coprime 4, big 3), `--shots` mode.

## Verification (all run at the end)

- `O9G-PROBE PASS (18 scenarios)`
- EDJ 9, PL0 29, L6V venn 10 pass. i18n-check `--all`, `--switcher-present --all`, `--api` (399), `--persistence` (248), `--smoke` pass; shadow-check `--all` passes.
- Pre-existing baselines unchanged: DN2 is still exactly 7 pass / 1 fail (S8, the shared-5 branch drawn more than once); width-probe venn still fails exactly B2 and S2.
- Shared assets (nt-*.js, palette.css, site.css, theme.js, i18n/site.js) unchanged versus 7dbb9dd. Page diff adds no colour literal, no innerHTML, no black/white colour-mix.
- Both screenshots inspected: stage-3 joined circles, green union outline, struck gcd copies in the dashed box, caption and equation all legible in day and night. The human check on the live page (animation feel, Nederlands switch) is still outstanding.

## Deviations from Plan

Plan-stated deviations from the objective (as planned):
1. Lowercase `lcm`/`gcd` notation instead of LCM/GCD.
2. No `nt-bigint.js`, no `fmt`; native BigInt, ungrouped numerals.
3. Fold not persisted.
4. Fold placed after `#message`, outside `#frame-two`.

Execution deviations: none. Task 2 followed red-then-green (S9/S10/C3 failed with 0 chips before the SVG existed, then passed). No auto-fixes were needed.

## Known Stubs

None.

## Threat Flags

None. All text lands via textContent/translateInto/svgEl attributes; BigInt is applied only to region prime values.

## Commits

- a990db5 feat: collapsed fold, 12 keys x 16 languages, BigInt equation, stage machine, probe (15 scenarios)
- 8fe665a feat: animated three-stage SVG, probe to 18 scenarios
- c2cc983 test: `--shots` mode and day/night screenshots

## Self-Check: PASSED

Files exist (venn-diagram.html, venn-diagram.js, lcm-probe.js, lcm-day.png, lcm-night.png); commits a990db5, 8fe665a, c2cc983 are ancestors of HEAD.
