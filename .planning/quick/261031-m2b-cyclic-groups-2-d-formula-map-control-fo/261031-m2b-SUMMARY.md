---
phase: quick-261031-m2b
plan: 01
subsystem: cyclic-groups
tags: [formula-map, main-view, gcd, lcm, logarithm, i18n-english-first, cdp-probe]
status: complete
requires:
  - phase: quick-261031-i0y/ix7 (backup branch, read-only reference only)
provides:
  - "two independent formula maps (Size, Index) beside the main-view formulas of Cyclic Groups"
affects: [Cyclic Groups main view, bottom-bar formula menu, isomorphism pane, Ring windows, shared URL params]
key-files:
  created:
    - .planning/quick/261031-m2b-cyclic-groups-2-d-formula-map-control-fo/formula-map-check.mjs
    - .planning/quick/261031-m2b-cyclic-groups-2-d-formula-map-control-fo/formula-map-baseline.json
  modified:
    - Cyclic Groups/cyclic-groups.html
    - assets/i18n/cyclic-groups.js
decisions:
  - "D-01..D-07 as locked; J-01..J-14 as listed below (J-08 as overridden by the orchestrator)"
commits: 3
plan_head_before: b1074548359966795ce3818a548491fb81d06e86
plan_head_after: 97d0909d1d2b5d633b18eb51009c6f04333d5baa
actuals:
  tokens: 26480    # chars/4 over the changed lines of the page, the i18n file and the probe (the 1248-line fixture json left out)
  tasks: 3
  commits: 3
completed: 2026-10-31
---

# Phase quick-261031-m2b Plan 01: Formula maps beside the main-view formulas Summary

Each main-view formula of Cyclic Groups (Size |⟨h⟩| and Index [G : ⟨h⟩]) now has its own two-dimensional map, drawn after `Cyclic Groups/Formula_Map` with the user's position names as text, that picks both the formula family (GCD, LCM, absolute value, no logarithm) and the derivation detail, for ℤ/nℤ, cyclic (ℤ/nℤ)* and cyclic curves (prime and composite, both notations). Non-cyclic groups keep their notation and get no map.

## Commits (all on main, nothing pushed, no branch switched)

| Task | Commit | What |
|------|--------|------|
| 1 (tracer) | a65b6c3 | fixture captured first; state/URL, mapReach/mapSettle/mapFormula, the control, English-only strings, ℤ/nℤ |
| 2 | 64cebf3 | cyclic (ℤ/nℤ)* and cyclic curves on the maps; non-cyclic groups at the Complete-level notation |
| 3 | 97d0909 | bar Main row Show/Hide, map-aware right-click switch, pane/swap/Ring-window travel, legacy links, phone layout |

`Cyclic Groups/Formula_Map` and `Cyclic Groups/idea_prompt` stay untracked. SUMMARY/STATE/PLAN are not committed; ROADMAP untouched.

## Screenshots (this task directory)

- `shot-main-view-light.png`: the main view, desktop 1280×900, light theme, ℤ/12ℤ, h = 9, both maps at GCD (full) (a2 faded, closed because q = 9 does not divide 12; a open)
- `shot-formula-maps-light-crop.png`: the formula box alone
- `shot-units-light.png`: (ℤ/13ℤ)* g = 2, h = 5, order map on a, index map on JN (SLU nodes faded)
- `shot-mobile-light.png`: the stacked phone page, maps above their formulas

## Judgement calls as built

- **J-01** built as planned: LCM index chains drop today's numeric `{p} / {l}` step (full 4, short 3, SLU 3 "="); rows keep their 5-step lcm index. Probe-proven against an independent model.
- **J-02** built: the bar's Main row is Show / Hide per formula (`barShow` / `formulaHide`); Row keeps GCD / None / LCM (curves Show / Hide as before).
- **J-03** built: the swap trades only Main's and Row's shown/hidden choices; Row's GCD/LCM choice (`sublcm`) and both maps stay (probe: `sublcm=both`, `fmaporder`, `fmapindex` unchanged after a swap).
- **J-04** built: right-click "Switch to LCM/GCD form" moves the knob(s) under the pointer to the other row at the same detail (short↔short, full↔full, SLU↔SLU); not offered at JN, a, a2, nor between two lines on different rows; works on cyclic curves now.
- **J-05** built: non-cyclic (ℤ/nℤ)* and non-cyclic curves have no `.fmap` and no pyramid, show today's Complete-level ord chain / curve notation at every slider level and leave stored positions untouched (no snapping without a map).
- **J-06** built: eleven tokens (jn, gcd-short, gcd-full, lcm-short, lcm-full, abs-gcd, abs-lcm, pos-gcd, pos-lcm, gcd-slu, lcm-slu); default gcd-full; entering a/a2 records the row (JN and GCD (SLU) record gcd, LCM (SLU) records lcm, a↔a2 keeps it).
- **J-07** built: any open position is reachable by one click (probe clicks each kind).
- **J-08 (as overridden)** built: every node is a small rounded pill carrying its own name as text, via `translate()` with English-only keys: `JN`, `GCD`/`LCM` with `short`, `full` or `SLU` as a smaller second line, `a`, `a2`; laid out like the drawing (JN left; GCD row short→full on top; LCM row below; a2 left of a between the rows; the two SLU nodes hanging below JN). Double lines (two parallel strokes with a gap, offset paths, no mask) for the always-open paths, a single stroke for the conditional ones, the X joining a to both rows, closed single edges and nodes faded and dashed. Arrowheads omitted. Paths are rounded orthogonal elbows rather than the drawing's diagonals. Drawn at 172×94 px (1 unit = 1 px) because the text needs the room, so a map is taller than a formula line; the knob is an accent-outlined highlight on the current pill. Each position's tooltip and `aria-label` start with its map name ("GCD (short): …", "a2: …"). The map sits at the left of its formula (a grid column); the pyramid keeps the right edge. Beyond the plan: below 720 px and on the phone page each map sits above its formula instead of beside it.
- **J-09** built: the pyramid shows while any shown main-view position uses the logarithm (not JN, not SLU) and no longer depends on the slider; cyclic curves have it; a curve's log base falls back to its arranging point while the expression slider is on Natural.
- **J-10** built: `state.subLcmRing`/`subLcmRingR` are gone and never written (`sublcmring*` are deleted from the url); legacy links seed lcm-full only for a map whose own param is absent (probe: `sublcmring=both|order|1`, mixed with `fmaporder=jn` and an invalid token). Legacy `subsimplify`/`subbare` do not seed the main view.
- **J-11** built: a/a2 write the representative r exactly (`rowFormulaH`'s function takes a third `raw` argument; `subFormat` gains `raw`), negative with U+2212; `num`/`numMn` carry the sign-room fix ported from 9a9cbf5 (rows unchanged: 86/86 then 82/82 byte-identical).
- **J-12** built: maps show on the stacked phone page (stacked over their formula); the pyramid stays desktop-only.
- **J-13** built: generic English-only templates `cyclicGroups.formula.mapOrder*` / `mapIndex*` for every group kind; where a position's chain equals today's main view MathML and plain text are byte-identical (regress equivalence table, below). On a curve the Index chain's MathML is flat (bracket in the formula's own row, as the notation always wrote it) so JN equals the old curve main view byte for byte.
- **J-14** built: with h = 0 GCD (SLU) writes h (0) in step 1 and n from step 2; LCM (SLU) writes q (= n) from step 1 (zn probe, h = 0, base 1).

## Verification

`node .planning/quick/261031-m2b-cyclic-groups-2-d-formula-map-control-fo/formula-map-check.mjs` (all scenarios, run after the final edit): 603 PASS, 0 FAIL, no page exception, marker `FORMULA-MAP-CHECK OK`. Scenarios: regress, zn, units, curve, ecmult, composite, noncyclic, snap, maps, url, syntax, menu, ctx, pane, legacy, mobile. The independent models (ℤ/nℤ, (ℤ/nℤ)* by brute force, prime and CRT-composite curves by point addition) and the plan's template texts are hardcoded in the probe, never read from the page.

- Fixture: captured on the unmodified page (page blob 0e8184ceb62c0a816c780541c3519a7e51171425 = HEAD b107454's), 54 views (9 urls × sublcm none/both × 3 slider levels), recaptured once to prove stability (identical), then committed with the first task.
- Rows byte-identical to the fixture in every comparison (86/86 views after task 1, 82/82 after the curve changes; MathML included).
- Main views: equal to the old capture where the chain is the same (gcd-full ≙ Complete GCD, gcd-slu ≙ Compact GCD, jn ≙ No-derivation, lcm-full/lcm-slu Size ≙ Complete/Compact LCM Size) at every slider level and sublcm setting, i.e. the slider and `sublcm*` no longer touch the main view; non-cyclic groups equal the Complete capture at all levels. Comparison normalizes only `aria-hidden="true"` on the line (moved from the box so the maps can be read) and an empty `style=""`.
- Step counts per the spec at every position of both maps: Size 1/5/4/5/4/5/4/4/4 and Index 1/4/3/4/3/4/3/3/3 (jn, gcd-full, gcd-short, lcm-full, lcm-short, a, a2, gcd-slu, lcm-slu), ℤ/12ℤ h = 9, 3, 7, 0 at base 1 and h = 9 at base 7, (ℤ/13ℤ)* g = 2 h = 5, 3, 1, curve 11,1,3 (g = (5, 1), P = (0, 5), r = −3, both notations), composite 35,3,3.
- Conditional positions disabled exactly when D-01 says; snapping per D-02 (a2→a→row full, SLU→JN) at load, on selecting another h, on switching group (ℤ/12ℤ → (ℤ/13ℤ)*, SLU→JN) and on a base change through the pyramid wheel (base 7 opens a2, back to 5 closes it and the knob snaps); the url is rewritten each time.
- Keyboard: ArrowRight/ArrowLeft move only to enabled positions and the focus stays on the same map after the re-render; the page's own window-level arrow handler had to be taught to leave `.fmap` alone (see deviations). Mouse click, the closed-position click, tooltips equal to aria-labels, a labelled `radiogroup` per map.
- Pane: pane opens (ℤ/13ℤ)* headless (driven through frame execution contexts, nothing skipped); host fmaporderr/fmapindexr reach the pane; a pane click and a pane right-click switch write the host url; swapIsoRings swaps `fmap`/`fmapR`; a pane snap (SLU→JN) reaches the host; reloading the host restores the pane's knobs; a Ring window loaded with `?ringwin=1` takes the maps from its query (`cleanRingQuery` keeps the params).
- Bar menu: Show/Hide vs GCD/None/LCM, keys across the different widths without error, swap semantics. Mobile: two maps, no pyramid, tap works, no sideways scroll.
- i18n gates (measured on main b107454 before, and after the last commit): `--coverage` 31 → 31, `--literals-markup` 4 → 4, `--literals-js` 112 → 110 (a first draft of the new code read as 119: seven string literals ending in a hyphen were replaced by lookup tables; the gate config was not touched). `node --check assets/i18n/cyclic-groups.js` passes; the probe's syntax scenario parses all three inline scripts.

## Deviations from Plan

**1. [Rule 1 - Bug] The page's global arrow-key handler swallowed a map's keys.** A window-level capture handler (`stepSubRow`/ruler keys) takes ArrowLeft/Right/Up/Down for any focused radio, so a map's native radio navigation never ran. Added `.fmap` to the handler's ignore list (one selector, one comment line). Found by the keyboard probe.

**2. [Rule 1 - Bug] Curve Index MathML nested the bracket.** First build wrapped the bracket in its own mrow, so JN on a curve differed from the old main view (probe caught it). The bracket is now flat on a curve and nested in groups of numbers, as before.

**3. [Rule 2 - Missing] Phone/narrow layout.** The map's 172 px column left ~170 px for the formula on a phone, shrinking it to unreadable. Added a stacked layout (map above its formula) for `.is-mobile` and below 720 px, and `fitSubFormulaLine` subtracts the map column only when the grid has two columns. Not in the plan.

**4. [Rule 3 - Probe infrastructure]** page-load timeout (25 s) and `--disk-cache-size=1` in the probe after two stuck/aborted runs left Chrome profiles that filled /tmp; `dump` and `shot` scenarios run only when named; the Ring window is checked by loading the `?ringwin=1` page directly rather than through the UI.

**5. Tasks 1 and 2 were built together and split afterwards**: the generic builder covers all group kinds, so commit 1 gates `hasMap` to ℤ/nℤ and commit 2 opens it to cyclic units and curves; both commits pass their own scenarios.

Not done / limits, stated plainly: the knob's `.2s` transition is declared but does not animate, because the whole formula box (maps included) is rebuilt on every render; only the day (light) theme was looked at in screenshots (colours come from palette tokens, night and RTL were not inspected); translations for the new strings are English-only by decision D-05; math rendering was only exercised in Chrome.

## Known Stubs

None.

## Threat Flags

None beyond the plan's register: `fmaporder`, `fmapindex`, `fmaporderr`, `fmapindexr` and the legacy params are read strictly against the token list (anything else → gcd-full, then settled); `ringhost: 'shared'` and `isopane: 'fmap'` messages are accepted only with two valid tokens; no `innerHTML` in the new code (SVG/MathML nodes by `svgEl`/`mEl`, text by `textContent`/`translate`).

## Self-Check: PASSED

- Files exist: Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js, formula-map-check.mjs, formula-map-baseline.json, the four screenshots.
- Commits a65b6c3, 64cebf3, 97d0909 are ancestors of HEAD; `git rev-list --count` from plan_head_before is 3.
