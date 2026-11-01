---
quick_id: 261031-wef
phase: quick-261031-wef
plan: 01
type: execute
wave: 1
depends_on: [261031-m2b, 261031-pm3, 261031-tnu, 261031-uya]
files_modified:
  - Cyclic Groups/cyclic-groups.html
  - assets/i18n/cyclic-groups.js
  - .planning/quick/261031-wef-cyclic-groups-complexity-and-form-prefer/slider-check.mjs
  - .planning/quick/261031-m2b-cyclic-groups-2-d-formula-map-control-fo/formula-map-check.mjs
  - .planning/quick/261031-pm3-cyclic-groups-generator-boxes-replace-th/log-base-boxes-check.mjs
  - .planning/quick/261031-tnu-cyclic-groups-double-click-a-closed-a-or/force-dblclick-check.mjs
  - .planning/quick/261031-uya-cyclic-groups-padlock-freezes-the-main-f/log-base-lock-check.mjs
autonomous: true
requirements: [QUICK-261031-wef]

estimate:
  tokens: 95000
  raw_tokens: 95000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "On a cyclic (ℤ/nℤ)* and on a cyclic curve, each shown main-view formula (size and/or index) has a Complexity slider (JN / compact / complete) and a Form preference slider (LCM / neither / GCD) in the place its formula map had (per D-01, D-02, D-03); ℤ/nℤ keeps its SVG map exactly as before; a group with no generator shows neither control"
    - "Every complexity x form combination writes the map grid's token into state.fmap (per D-01): compact/complete x GCD = gcd-short/gcd-full, x LCM = lcm-short/lcm-full, x neither = pos-<row> at compact and abs-<row> at complete (row = the GCD/LCM the form was on, default gcd), JN = jn whatever the form; the formulas, the fmaporder/fmapindex URL keys, the pane's fmaporderr/fmapindexr and the right-click GCD/LCM switch behave exactly as for the map token (per D-08)"
    - "At JN the form slider stays visible, dimmed and inert, showing the form it will return to; leaving JN restores that form (per D-01, J-02)"
    - "On a slider group the generator boxes + padlock + scroll-wheel row shows only while some shown formula is not on JN; ℤ/nℤ keeps its every-map-on-SLS rule (per D-05)"
    - "A neither chip whose a / a2 is closed under the current base is drawn closed; a click, a drag or the arrow keys never put the knob there (click/drag snaps back with the green/red box hint, padlock nudge when locked); a double-click on it runs forceMapPosition for pos (compact) or abs (complete): the picked box pulses twice, base and knob set, third flash, the chip pulsing in step; with the padlock closed it sounds the alarm and forces nothing (per D-06)"
    - "Both sliders are keyboard operable (role=slider, aria-valuemin/max/now, aria-valuetext, arrows/Home/End), keep the focus across rebuilds, and the window's arrow-key handler leaves them alone (per D-07)"
    - "The four existing 261031-* probes pass with only the expectations updated that change because (ℤ/nℤ)* and curves now show sliders; every additive check is kept; i18n gates stay at 31 / 4 / 109 (per D-09, D-04)"
  artifacts:
    - path: "Cyclic Groups/cyclic-groups.html"
      provides: "hasSliders, FSL_* mapping helpers, formulaSliders builder, setFormulaToken, .fsl-* CSS; syncSubFormula / fitSubFormulaLine / forceMapPosition / stopLogForce / arrow-handler wiring"
      contains: "function formulaSliders"
    - path: "assets/i18n/cyclic-groups.js"
      provides: "English-only fsl* strings in the en block after logBaseLocked, named in the header paragraph"
      contains: "fslComplexity"
    - path: ".planning/quick/261031-wef-cyclic-groups-complexity-and-form-prefer/slider-check.mjs"
      provides: "CDP probe of the sliders (harness and models copied from the tnu probe)"
  key_links:
    - from: "syncSubFormula (~5645)"
      to: "formulaSliders(G, fs[i].map)"
      via: "hasSliders(G) chooses sliders over formulaMap; the box keeps has-fmap"
    - from: "formulaSliders chip click / drag release / key"
      to: "setFormulaToken(f, token)"
      via: "the commit tail setFormulaMap already uses (tellHost isopane fmap in a pane, barFormulasChanged otherwise)"
    - from: "closed neither chip dblclick"
      to: "forceMapPosition(G, f, 'pos' | 'abs')"
      via: "dblclick listener on .fsl; stopLogForce / paintLogForce also cover .fsl-notch"
    - from: "window keydown arrow handler (~14034)"
      to: ".fsl-pair"
      via: "closest() exclusion list next to .fmap, .lb-row"
---

<objective>
Give the main view's formulas on multiplicative and elliptic-curve groups two sliders in place of the 2-D formula map. A Complexity slider (JN, compact, complete) and a Form preference slider (LCM, neither, GCD) together walk the same grid of formula configurations the map draws, over the same stored state. The existing generator control (boxes, padlock, scroll-wheel switch) shows only once some formula leaves JN. ℤ/nℤ keeps its map unchanged; the user will design its sliders later.

Purpose: two familiar one-dimensional controls are easier to read and operate than the 2-D map, and they keep everything the map does: closed a / a2 positions, the hint, the forced double-click, the padlock.
Output: the sliders in `Cyclic Groups/cyclic-groups.html`, English strings in `assets/i18n/cyclic-groups.js`, a new CDP probe `slider-check.mjs`, and the four existing probes adjusted to (ℤ/nℤ)* and curves now showing sliders.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@.planning/quick/261031-m2b-cyclic-groups-2-d-formula-map-control-fo/261031-m2b-SUMMARY.md
@.planning/quick/261031-tnu-cyclic-groups-double-click-a-closed-a-or/261031-tnu-SUMMARY.md
@.planning/quick/261031-uya-cyclic-groups-padlock-freezes-the-main-f/261031-uya-SUMMARY.md

## The user's request (verbatim, abridged to the spec)
Complexity slider: JN (just notation), compact, complete. Form preference slider: LCM, neither, GCD. Generator control: the same one (boxes, padlock, scroll icon), appearing whenever the complexity slider is not on JN. The two sliders work together to navigate the map of formula configurations. Skip additive groups for now: build the sliders only for EC and multiplicative groups.

## Decisions (locked by the orchestrator; cite them in commits and SUMMARY)
- D-01 New UI over the SAME state: `state.fmap[f]` tokens, the same URL keys, the same `mapFormula` rendering, no new formula logic. Complexity x form is exactly the map grid. Complexity is the column: JN (x=12), compact = short (x=62), complete = full (x=152). Form is the row: GCD (top), neither (middle: a2 = `pos-*` in compact, a = `abs-*` in complete), LCM (bottom). JN ignores the form slider, which stays visible but inert and dimmed. Choosing neither writes the `pos-`/`abs-` token whose row suffix is the form's previous GCD/LCM setting (default gcd). A complexity change while on neither keeps neither (`pos-x` ↔ `abs-x`).
- D-02 Only multiplicative and EC groups, i.e. non-additive groups with `hasMap(G)`. Additive groups keep the SVG map unchanged.
- D-03 Each formula that gets a map today gets one slider pair instead, with the same per-formula / per-side structure. Both sliders are discrete 3-notch controls in the page's style. The knob looks like the map knob. Palette tokens only, no literal colours.
- D-04 Labels come from the i18n file, English only (`en` block, the way the fmap strings were added). Notch tooltips reuse the fmap tooltips (`fmapGcdShort` etc.) of the position each combination lands on.
- D-05 On slider groups, the generator row shows only while some shown formula's complexity is not JN; it is hidden while every shown formula is on JN. Additive groups keep the existing all-on-SLS rule.
- D-06 When the a / a2 position is closed under the current base, the neither notch is drawn closed, faded the way `.fmap-edge.is-closed` / `.fmap-node.is-closed` are. A single click or a drag onto it snaps back, as the map does. A double-click runs `forceMapPosition` for the matching node (pos in compact, abs in complete): two pulses, base change, third pulse, and the padlock alarm when locked. The pulses also show on the slider notch. If a later base or h change closes the current neither position, settleMaps' existing snap-back applies and the sliders reflect it.
- D-07 The sliders are focusable, arrow keys step the notches, and they carry `role="slider"` and `aria-valuetext`.
- D-08 URL and persistence unchanged: no new keys, no new defaults.
- D-09 Verification: a new probe `slider-check.mjs` modelled on `force-dblclick-check.mjs`. Re-run the four existing 261031-* probes. Update only the expectations that change because multiplicative and EC groups no longer show a map, and keep the additive coverage. Don't block for long on probe runs: when a full run is slow, run targeted scenarios.
- D-10 Commits use explicit `git add` paths and quiet git (`-q`, no file listings), on the current branch `cyclic-groups-formula-sliders`. Don't create or switch branches, and never push. Each commit ends with the trailers `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and `Claude-Session: https://claude.ai/code/session_019tLocwNS8TQcr98zK7f5RU`. Don't edit the i18n gate config (`.planning/phases/06-multi-language-support/i18n-check.js`). Don't touch or commit STATE.md, this PLAN or the SUMMARY (the orchestrator does). Screenshots stay untracked.

## Planner judgement calls (Claude's discretion; record them in the SUMMARY as J-01..J-06)
- J-01 Only the form slider's neither chip is ever closed. Complexity chips are always open. A complexity change that would land on a closed a / a2 (for example from `abs-lcm` to compact while a2 is closed) falls back to the remembered row's form at the requested complexity (`lcm-short`). The form slider then shows LCM, with its neither chip drawn closed. Leaving JN while the remembered form is neither does the same. Reason: the user asked for the complexity, so the complexity moves, and the closed neither stays visible and forceable on the form slider.
- J-02 Each formula has a form memo `{ form: 'gcd'|'lcm'|'neither', row: 'gcd'|'lcm' }`, kept in module scope in each frame. It is refreshed from the token on every build while the token is not `jn`, so it also follows settleMaps, the right-click switch and pane updates. The form slider shows the memo while the token is `jn`. It is not persisted (D-08), so a reload on JN shows GCD.
- J-03 The arrow keys step over a closed neither chip to the next open notch. Home and End go to the ends. Forcing is by double-click only, as on the map.
- J-04 Look: each slider is a miniature linear map. Three label chips sit on a thin track. The chips are styled like `.fmap-node`: `var(--panel)` fill, a `--text` 34% `color-mix` border, `--text-dim` text, and `--text` text at the active chip. The knob is a rounded rect framing the active chip, styled like `.fmap-knob`: a 1.6px `var(--accent)` border, an accent 22% `color-mix` fill, and a .2s transition on left and width. A closed chip is like `.fmap-node.is-closed`: opacity .4 and a dashed border. The inert slider is dimmed, with a muted knob and a default cursor. A small dim caption names each slider above its track ("Complexity", "Form preference"). The pair takes about the map's footprint (172 x 94; keep it within about 200 x 104 px) in the box's first grid column.
- J-05 Pointer handling: a chip commits on its `click` event, so a synthetic `.click()` works too. A drag starts on pointerdown on the `.fsl` and takes pointer capture only after more than 3 px of movement. The knob follows the pointer without its transition. On release the nearest chip goes through the same commit path, and the click that follows a drag is suppressed. A `dblclick` listener on the `.fsl` finds its notch from `e.target.closest('.fsl-notch')`, else the notch nearest `clientX`. A rebuild in the middle of a drag simply drops the drag.
- J-06 The default stays `gcd-full` (complete + GCD) per D-08, so a fresh multiplicative or EC page opens with the generator row showing. Flag it in the SUMMARY: if the user's "At first there are only the complexity slider and the form preference slider" meant the page should open on JN, that is a separate follow-up, because it changes what an absent `fmaporder` means for those groups.

## Interfaces in `Cyclic Groups/cyclic-groups.html` (line numbers approximate; grep before editing)
- `state.fmap` / `state.fmapR` / `state.chosenBase` / `state.logBaseLock`: the state literal, line 3173.
- ~7067-7127: `FMAP_POS`, `fmapToken`, `fmapPair`, `fmapNode(token)` ('abs'/'pos' for a/a2), `FMAP_AT = { abs: {gcd,lcm}, pos: {gcd,lcm} }`, `fmapRow(token)` (gcd/lcm/null), `fmapShown()`, `hasMap(G)` (additive or cyclic), `mapReach(G, h, base)` → `{q, r, abs, pos, sls}`, `FMAP_FULL`, `mapSettle`, `mapBase(G)`, `settleMaps(G)`.
- ~7219-7342: `FMAP_NODES` (each node's tooltip key in `.key`), `FMAP_ORDER`, `formulaMap(G, info)` (wrapper `.fmap.log-ctl`, `data-f`, `data-at`; a hint radio's change handler calls `flashLogBases(G, id)` plus `alarmLogLock('nudge')` when locked; its label's dblclick calls `forceMapPosition(G, f, id)`), `setFormulaMap(f, id)` (commit tail: in a pane `tellHost({isopane:'fmap', value: fmapPair(state.fmap)})` plus `renderSubgroups`/`mirrorToUrl`; else `barFormulasChanged()`), `ringFormulas(G)` (each entry carries `.map = {f, token, reach}`).
- ~7370-7670: `logBaseFits`, `logBaseRow(G)` (opens with the `logForce`/`logForceLive`/`stopLogForce` check, then `paintLogForce(box)`), `logLockButton`, `alarmLogLock(kind)`, `logWheelButton`, `setChosenBase`, `flashLogBases(G, node)`, `forceBasePick`, `stopLogForce()` (clears `.lb-box.is-force-pulse/.is-force-set` under `ringHeadEl`), `logForceLive()`, `paintLogForce(el)`, `forceMapPosition(G, f, id)`, `applyForcedMap`.
- ~5645-5700 `syncSubFormula(G)`: focus is held by `closest('.fmap')` / `.lb-row` kinds; maps are inserted with `box.insertBefore(formulaMap(...), line)` when `fs.some(x => x.map)` (the box gets `has-fmap`, the lines get `aria-hidden`); the row is appended unless `slsOnly`.
- ~5850-5880: `fitSubFormulaBox` (fits `:scope > :not(.log-ctl)`), `fitSubFormulaLine` (subtracts `:scope > .fmap` width).
- ~7724: the card's contextmenu handler, which finds the line under the pointer by `:scope > :not(.log-ctl)`.
- ~14028-14049: the window's capture-phase arrow handler; the exclusion list `textarea, [contenteditable], [role="menu"], [role="listbox"], .fmap, .lb-row` is at ~14034.
- CSS: ~1224-1286 (`.has-fmap` grid, mobile and `max-width:720px` single column with `> .fmap{justify-self:center}`, `.fmap*`, `.lb-*`, the keyframes `lb-flash-ok`, `lb-force-pulse`); ~2610 the `:root[dir="rtl"] :is(... .fmap, .lb-row ...)` LTR list.
- Groups: additive `G.mode === 'additive'`, units `'multiplicative'`, curves `'elliptic'` (with `G.pts`).
- i18n: the `en` block starts at ~648; the fmap/logBase keys are at ~1074-1098 (`logBaseLocked` last). The header paragraph listing the English-only keys is at ~159-173. Existing English-only keys to reuse: `fmapLabelJn` 'JN', `fmapLabelGcd` 'GCD', `fmapLabelLcm` 'LCM', `fmapOrderLabel`, `fmapIndexLabel`, and the node tooltips `fmapJn`, `fmapGcdShort`, `fmapGcdFull`, `fmapLcmShort`, `fmapLcmFull`, `fmapAbs`, `fmapPos`.
- literals-js gate: an all-lowercase token literal is fine ('jn', 'compact', 'neither', 'form'); never write a capitalised or display string as a JS literal (for example the label JN); go through `translate()`.

## Probe harness to copy (D-09)
`.planning/quick/261031-tnu-cyclic-groups-double-click-a-closed-a-or/force-dblclick-check.mjs`: `connect`, `openPage` (P.load/enter/ev/mouse/key/clickEl/param/formulas/steps/shot/paneCtx/done), the models (`znModel`, `unitsModel`, `curveModel`, `ecAdapter`, `reach`, `settleModel`, `vals`, `TO`, `TI`, `wantPair`, `pickModel`), `dbl`, `click1`, `SAMPLER`, `rowNow`, and the cleanup at the end (wait for Chrome's exit, then retry `rmSync` of its own profile). From the m2b probe: `syntax` and `openPane`. From pm3's `flash`: the green/red hint model (`okOf`/`noOf`). Ports in use: 9333, 9341, 9345, 9346, 9347, 9353. The new probe uses PORT 9362 and the profile prefix `cg-slider-` under `tmpdir()`.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: tracer, a chip click on (ℤ/13ℤ)* walks the map grid end to end</name>
  <files>Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js, .planning/quick/261031-wef-cyclic-groups-complexity-and-form-prefer/slider-check.mjs</files>
  <read_first>Cyclic Groups/cyclic-groups.html lines ~1224-1290, ~5640-5700, ~5850-5880, ~7060-7345, ~7370-7445 and ~14025-14050; assets/i18n/cyclic-groups.js lines ~155-175 and ~1070-1100; .planning/quick/261031-tnu-cyclic-groups-double-click-a-closed-a-or/force-dblclick-check.mjs (whole file, for the harness)</read_first>
  <action>
Page, mapping (per D-01, D-02):
- Next to `hasMap`, add `hasSliders(G)`: `hasMap(G)` and `G.mode` is not 'additive'.
- Add `FSL_COMPLEXITY = ['jn', 'compact', 'complete']` and `FSL_FORM = ['lcm', 'neither', 'gcd']`, indexed 0..2 left to right.
- Add `fslOf(token)` → `{ c, v, row }`:
  - jn: c 0, v null.
  - gcd-short: c 1, v 2. lcm-short: c 1, v 0. pos-*: c 1, v 1.
  - gcd-full: c 2, v 2. lcm-full: c 2, v 0. abs-*: c 2, v 1.
  - row is `fmapRow(token)`.
  - An SLS token, which cannot reach a slider group after settleMaps, reads as JN.
- Add `fslToken(c, v, row)`, the inverse; neither gives `FMAP_AT[c === 1 ? 'pos' : 'abs'][row]`.
- Add `fslNeitherNode(c)`: 'pos' or 'abs'.

Form memo (J-02):
- Module-scoped `fslMemo = { order: {form:'gcd', row:'gcd'}, index: {form:'gcd', row:'gcd'} }`.
- Refreshed from the token at every build while the token is not jn.

Builder `formulaSliders(G, info)`:
- Returns `span.fsl-pair.log-ctl` with `data-f`, `data-at` = `fmapNode(token)` and `data-token`; `role="group"`; `aria-label` from `fmapOrderLabel` / `fmapIndexLabel`.
- It holds two `.fsl-row` blocks, each a `.fsl-name` caption (translate fslComplexity / fslForm) above a `.fsl` element. The `.fsl` has `role="slider"`, `data-kind` 'complexity' or 'form', `tabindex="0"`, `aria-valuemin="0"`, `aria-valuemax="2"`, `aria-valuenow`, `aria-valuetext` (the active chip's translated label), and an `aria-label` from fslComplexityOrder / fslComplexityIndex / fslFormOrder / fslFormIndex.
- Inside each `.fsl`: a `.fsl-track`, three `.fsl-notch[data-v]` chips and a `.fsl-knob` with `aria-hidden`.
  - Complexity chip labels: fmapLabelJn, fslCompact, fslComplete.
  - Form chip labels: fmapLabelLcm, fslNeither, fmapLabelGcd.
  - Each chip's `title` is `translate(FMAP_NODES[fmapNode(target token)].key)`, where the target token is what that chip would write given the other slider (per D-04).
- The form slider at jn takes class `is-inert`, `aria-disabled="true"`, `tabindex="-1"` and `title` fslFormInert. It shows the memo's form and ignores clicks.
- The form slider's neither chip takes `is-closed` when `!info.reach[fslNeitherNode(c)]` (c ≥ 1).
- `.is-at` marks the active chip. The knob is placed over it (left/width from the chip's offset), and it is placed again after insertion, once layout exists.

Commit:
- Add `setFormulaToken(f, token)`: it writes `state.fmap[f] = fmapToken(token)` and runs the same commit tail as `setFormulaMap`. Refactor `setFormulaMap` to compute its token and call it, so the additive behaviour is identical.
- A chip `click` (J-05) runs:
  - Complexity c': if c' is 0, jn. Otherwise `fslToken(c', form, row)`, where form and row come from the token (or the memo at jn), and the J-01 fallback to `fslToken(c', row, row)` applies when that lands on a closed node.
  - Form v' (only when c ≥ 1): GCD/LCM gives `fslToken(c, v', v')`. Neither gives `fslToken(c, 1, fmapRow(token) || memo.row || 'gcd')`. A closed neither chip does not commit (Task 2 adds the hint and the force).
  - A click on the chip that is already active changes nothing.

syncSubFormula (per D-03, D-05):
- When `hasSliders(G)`, insert `formulaSliders(G, fs[i].map)` where `formulaMap` went. Keep `has-fmap` on the box and `aria-hidden` on the lines.
- Row rule: on a slider group, append `logBaseRow(G)` unless every shown `x.map.token === 'jn'`; on an additive group keep `slsOnly` exactly as it is.
- In `fitSubFormulaLine`, extend `:scope > .fmap` to the pair as well.

CSS (palette tokens only, J-04):
- `.fsl-pair`: pointer-events auto, user-select none, direction ltr, justify-self start, flex none.
- `.fsl`: `touch-action:pan-y` and the focus-visible outline in the style of `.fmap:has(input:focus-visible) .fmap-knob`.
- Chips, knob, `.is-at`, `.is-closed` and `.is-inert` as J-04.
- Add `.fsl-pair` to the two single-column `justify-self:center` rules (mobile and max-width 720px) and to the RTL LTR list at ~2610.
- `@media (prefers-reduced-motion: reduce)`: no knob transition.

i18n (per D-04), English-only keys in the en block right after `logBaseLocked`:
- `fslComplexity` 'Complexity'
- `fslForm` 'Form preference'
- `fslCompact` 'compact'
- `fslComplete` 'complete'
- `fslNeither` 'neither'
- `fslComplexityOrder` 'Complexity of the subgroup size formula'
- `fslComplexityIndex` 'Complexity of the index formula'
- `fslFormOrder` 'Form preference of the subgroup size formula'
- `fslFormIndex` 'Form preference of the index formula'
- `fslFormInert` 'At JN the formula takes no form: the form preference applies again once the complexity is compact or complete'

Extend the header paragraph's list of English-only keys with these ten, describing them as the Complexity and Form preference sliders that replace the formula maps on a cyclic (ℤ/nℤ)* and a cyclic curve.

Probe `slider-check.mjs`:
- Copy the harness and models (see context), with PORT 9362 and profile prefix cg-slider-, plus `syntax` from m2b.
- Helpers:
  - `pairs(P, ctx)` returns per `.fsl-pair`: f, at, token, and per kind the aria-valuenow, aria-valuetext, inert, closed chips, active chip.
  - `chip(P, f, kind, v)` returns a chip's centre.
- Scenarios:
  - `render`:
    - (ℤ/13ℤ)* `?mobile=0&mode=multiplicative&n=13&subformularow=both&subformularing=both&gen=3&logbase=2` shows two pairs and no `.fmap`, with the default complete/GCD (valuenow 2 / 2) and the aria texts.
    - The cyclic curve `curve=11,1,3` shows pairs too.
    - ℤ/12ℤ shows two `.fmap` and no pair.
    - (ℤ/8ℤ)* `n=8&gen=3` and curve `7,0,1` show neither.
    - `subformularing=index` gives one pair with `data-f` index.
    - The page does not scroll sideways at 1280.
  - `combos`: on (ℤ/13ℤ)* and on the curve, at an h and base the model finds with both a and a2 open, real mouse clicks on chips reach all nine (c, v) combinations. Each must give the expected token in `data-token` and `fmaporder`, the formulas equal to `wantPair`, and the steps equal to STEPS_ORDER / STEPS_INDEX.
  - `memo`:
    - lcm-full → neither gives abs-lcm.
    - → compact gives pos-lcm.
    - → JN gives jn, with the form slider inert, still showing neither, and a click on its chips changing nothing.
    - → complete gives abs-lcm.
    - gcd-short → neither gives pos-gcd.
    - J-01 on (ℤ/13ℤ)* h=5 base 2 (a open, a2 closed): abs-lcm → compact gives lcm-short with the neither chip closed; abs-gcd → JN → compact gives gcd-short.
  - `jnrow`:
    - (ℤ/13ℤ)* with both formulas on jn: no `.lb-row`, `.lb-lock` or `.lb-scroll`.
    - A click on the order formula's compact chip brings the row back.
    - `subformularing=order&fmaporder=jn`: no row.
    - ℤ/12ℤ with both on jn: the row stays (the additive rule).
    - ℤ/12ℤ with both on SLS: no row.
  - `url`:
    - `fmaporder=pos-lcm&fmapindex=lcm-short` at a base with a2 open shows (1, 1) / (1, 0).
    - A slider change rewrites only fmaporder; reloading that URL restores the same slider state.
    - gcd-full writes no param.
  - Every scenario asserts no page exceptions.
- Run only the scenarios named on the command line (tnu style). End with `SLIDER-CHECK OK` or `SLIDER-CHECK FAIL: n`, then the tnu-style cleanup of its own profile.

Commit with explicit paths (page, i18n file, probe): `feat(cyclic-groups): complexity and form preference sliders replace the formula maps on (ℤ/nℤ)* and curves`, with the D-10 trailers.
  </action>
  <verify>
    <automated>timeout 600 node .planning/quick/261031-wef-cyclic-groups-complexity-and-form-prefer/slider-check.mjs syntax render combos memo jnrow url</automated>
  </verify>
  <done>
- The probe prints `SLIDER-CHECK OK` for syntax, render, combos, memo, jnrow and url.
- (ℤ/13ℤ)* and the cyclic curve show slider pairs and no map; ℤ/12ℤ still shows its maps.
- Every combination writes its token.
- The JN row rule holds; the additive row rules are unchanged.
- `node --check assets/i18n/cyclic-groups.js` passes.
- One commit on cyclic-groups-formula-sliders.
  </done>
</task>

<task type="auto">
  <name>Task 2: drag, keys, focus, and the closed neither (hint, forced double-click, padlock)</name>
  <files>Cyclic Groups/cyclic-groups.html, .planning/quick/261031-wef-cyclic-groups-complexity-and-form-prefer/slider-check.mjs</files>
  <read_first>Cyclic Groups/cyclic-groups.html: the Task 1 builder, plus ~7480-7670 (alarmLogLock, flashLogBases, forceMapPosition, stopLogForce, logForceLive, paintLogForce); .planning/quick/261031-pm3-cyclic-groups-generator-boxes-replace-th/log-base-boxes-check.mjs lines ~553-612 (the flash scenario's hint model)</read_first>
  <action>
Pointer (J-05):
- pointerdown on `.fsl` (not inert) records the start.
- Past 3 px of movement it takes `setPointerCapture`, adds `is-drag` (knob transition off) and moves the knob to the clamped pointer x.
- pointerup or pointercancel releases. The nearest chip goes through the Task 1 commit path, and the next click is swallowed.
- A release on the active chip, or on a closed chip, animates the knob back to the active chip.

Closed neither, single click or drag release (per D-06, the map's hint path verbatim):
- No commit.
- `flashLogBases(G, fslNeitherNode(c))`.
- `alarmLogLock('nudge')` when `state.logBaseLock`.

Double-click (per D-06):
- A `dblclick` listener on the form `.fsl` resolves its notch (J-05). On the closed neither chip it calls `forceMapPosition(G, f, fslNeitherNode(c))`.
- On an open chip it does nothing more, since its clicks already committed. That keeps a double-click on an open position a click, as on the map.

Pulses on the chip:
- In `forceMapPosition`, right after `paintLogForce(box)`, also `paintLogForce` the form slider's neither chip (`.fsl-pair[data-f=f] .fsl[data-kind="form"] .fsl-notch[data-v="1"]`) when present.
- `stopLogForce` clears `.fsl-notch.is-force-pulse` and `.fsl-notch.is-force-set` as well as the boxes.
- `formulaSliders` starts with the same `logForce && !logForceLive()` → `stopLogForce()` check that `logBaseRow` makes, then, while `logForce.f === f`, paints its neither chip. A rebuild then carries the pulse, and after the set, the third flash.
- CSS: `.fsl-notch.is-force-pulse` reuses `lb-force-pulse` (.55s x2) and `.is-force-set` reuses `lb-flash-ok` (1.1s). The chip keeps a border and background, so the keyframes show.
- The padlock-closed alarm path needs no change, since `forceMapPosition` already returns after `alarmLogLock('alarm')`.

Keys (per D-07, J-03):
- keydown on `.fsl` handles ArrowLeft/ArrowDown (-1), ArrowRight/ArrowUp (+1), Home (0) and End (2). It steps over a closed chip and commits through the Task 1 path.
- It calls `preventDefault`. An inert slider ignores keys.
- Add `.fsl-pair` to the window arrow handler's `closest()` exclusion list (~14034) and to the comment above it.

Focus (per D-07):
- `syncSubFormula` also records a focused `.fsl` (its pair's `data-f` and its `data-kind`).
- After the rebuild it focuses the same slider with `preventScroll`, or the pair's complexity slider when the form slider is now inert.

Settle (per D-06):
- Nothing new: `settleMaps` already runs before the build, so the sliders show its result.

Probe, add these scenarios:
- `drag`:
  - A real mouse press on the GCD chip, moves in steps, release over LCM: `lcm-*`.
  - A release between two chips: the nearest.
  - A drag onto a closed neither: the token is unchanged, the knob is back on GCD, and the box hint is the model's ok/no (pm3 `okOf`/`noOf`).
- `keys`:
  - On the focused complexity slider, the arrows, Home and End walk the notches; the URL follows; the focus stays on that slider; `expr` and the expression slider are unchanged.
  - With a closed neither on the form slider, ArrowLeft from GCD lands on LCM.
  - The inert slider has tabindex -1 and aria-disabled.
- `closed`:
  - (ℤ/13ℤ)* h=5 base 2 with `fmaporder=gcd-short`: the neither chip is closed. A single real click gives the hint and no commit.
  - With `logbaselock=1`: `.lb-lock.is-nudge`.
  - At gcd-full the neither chip is open, and a click gives abs-gcd.
- `force`:
  - A SAMPLER extended with the `.fsl-notch` force classes and the pairs' `data-at`. Double-click the closed neither chip at compact on (ℤ/13ℤ)* h=5 base 2, and on a curve case the model finds.
  - The pick (`pickModel`) box goes pulse → set → none. The chip pulses and flashes in step.
  - The base is set at about 1.1 s; the token and base stay put while pulsing.
  - Final URL: logbase=pick, fmaporder=pos-gcd. The formulas equal `wantPair`.
  - A double-click on an open chip is a click.
- `lock`: with `logbaselock=1`, a double-click on the closed neither gives `.lb-lock.is-alarm`, no force class on any box or chip, and the base and token unchanged.
- `settle`: `pos-gcd` open at one h, then the h moved through the UI (the subgroup row or a bead) to one where a2 closes. The sliders show what `settleModel` gives (complete + neither, or complete + GCD).
- `pane`: m2b's `openPane`, waiting for two `.fsl-pair` in the pane on (ℤ/13ℤ)*. A chip click in the pane writes the host's fmaporderr; the host's own `.fmap` positions stay.
- `ringwin`: copy tnu's ringwin iframe set-up with `mode=multiplicative&n=13`. A chip click shows up in the window's `ringwin:'state'` query.
- `mobile`: `?mobile=1` on (ℤ/13ℤ)* at 390x844 with touch. Both pairs are present, a touch tap on a chip changes the token, there is no sideways scroll and no `.lb-scroll`.
- `shot` (only on request): untracked light screenshots `shot-sliders-light.png` (complete GCD with the row) and `shot-sliders-jn-light.png` (both on JN, no row, form inert).

Run the scenarios in groups with `timeout`, and in the background when a run is long. Delete only the cg-slider-* profiles your own runs leave, after their Chrome has exited; never touch another /tmp/cg-* dir.

Commit with explicit paths: `feat(cyclic-groups): the form slider's closed neither hints on a click and forces on a double-click`, with the D-10 trailers.
  </action>
  <verify>
    <automated>timeout 900 node .planning/quick/261031-wef-cyclic-groups-complexity-and-form-prefer/slider-check.mjs</automated>
  </verify>
  <done>
- `SLIDER-CHECK OK` on the full default run (every scenario but shot); shot was run once separately and the two screenshots exist.
- No page exceptions.
- One more commit on cyclic-groups-formula-sliders.
  </done>
</task>

<task type="auto">
  <name>Task 3: the four existing probes on sliders for (ℤ/nℤ)* and curves, full regression and gates</name>
  <files>.planning/quick/261031-m2b-cyclic-groups-2-d-formula-map-control-fo/formula-map-check.mjs, .planning/quick/261031-pm3-cyclic-groups-generator-boxes-replace-th/log-base-boxes-check.mjs, .planning/quick/261031-tnu-cyclic-groups-double-click-a-closed-a-or/force-dblclick-check.mjs, .planning/quick/261031-uya-cyclic-groups-padlock-freezes-the-main-f/log-base-lock-check.mjs</files>
  <read_first>In each of the four probes: `grep -n '\.fmap'`, then the shared helpers (mapsNow, mapsIn, stopCentre, SAMPLER, openPane, checkGroup) and every scenario reached by a `mode=multiplicative`, `n=13`, `curve=` URL or the pane on (ℤ/13ℤ)*</read_first>
  <action>
Per D-09, change only what changes because (ℤ/nℤ)* and curves now show sliders. Every additive (ℤ/nℤ) check stays as it is.

Shared helpers in each probe:
- `openPane` waits for `.fmap, .fsl-pair` count 2.
- `mapsNow` / `mapsIn` / SAMPLER `maps` read `{f, at}` from `.fsl-pair` too (`data-at` is the same node id the map's `data-at` used).

m2b formula-map-check.mjs:
- `checkGroup` for a non-additive model asserts the pair state instead of the radios:
  - `data-at` === node.
  - Complexity and form aria-valuenow per the Task 1 mapping.
  - The neither chip closed === `!reach[pos|abs]` at the token's complexity.
  - The form slider inert at jn.
- `curve`: "the base row stays while every shown formula sits on JN" becomes "no base row, padlock or wheel switch while every shown formula sits on JN".
- `noncyclic`: also asserts no `.fsl-pair`.
- `snap`: after the switch to (ℤ/13ℤ)*, read the pairs.
- `pane`: the pane's clicks on `.fmap-stop` become chip clicks reaching the same tokens:
  - lcm-short → lcm-full: complete chip.
  - → gcd-short: GCD then compact, or as the scenario needs.
- `ctx`, `regress` and `shot`: keep them; they should pass unchanged (the box keeps `has-fmap` and its lines keep `aria-hidden`). If `regress` differs, find out why before touching it.

pm3 log-base-boxes-check.mjs:
- `fits` (U and E loops) keeps its URL tokens (no change expected).
- `flash`: the (ℤ/13ℤ)* part clicks the form slider's closed neither chip at `fmaporder=gcd-short`. The SLS-radio checks stay on ℤ/12ℤ only (move them if they ran on (ℤ/13ℤ)*).
- `pane` and the others: map clicks on a non-additive group become chip clicks.

tnu force-dblclick-check.mjs:
- `forceRun` takes an option for slider groups. It loads with `fmaporder=gcd-short` for node pos (gcd-full for abs) and double-clicks the form neither chip instead of `.fmap-stop`.
- The sampler's `maps.order` for those groups is the pair's `data-at`.
- `units13`, `curve` and `pane` use it (the pane first clicks compact in the frame).

uya log-base-lock-check.mjs: the same treatment for `units13`, `curve`, `pane` and any `ringwin` / `mobile` part on a non-additive group.

In the SUMMARY, record every expectation you changed (probe, scenario, old → new, the reason).

Then run, each with `timeout`, the full runs (or scenario by scenario when slow, in the background, never blocking for long): the four probes and slider-check.mjs. Also run the i18n gates `node .planning/phases/06-multi-language-support/i18n-check.js --coverage`, `--literals-markup` and `--literals-js`; the baseline is 31 / 4 / 109 and none may rise.

Remove only the profiles your own runs left (cg-fmap-*, cg-lbase-*, cg-force-*, cg-lock-*, cg-slider-* that you created, after their Chrome has exited); list them in the SUMMARY.

Commit the four probes with explicit paths: `test(quick-261031-wef): the formula-map probes read the sliders on (ℤ/nℤ)* and curves`, with the D-10 trailers. Never push.
  </action>
  <verify>
    <automated>timeout 1500 node .planning/quick/261031-m2b-cyclic-groups-2-d-formula-map-control-fo/formula-map-check.mjs && timeout 1200 node .planning/quick/261031-pm3-cyclic-groups-generator-boxes-replace-th/log-base-boxes-check.mjs && timeout 1200 node .planning/quick/261031-tnu-cyclic-groups-double-click-a-closed-a-or/force-dblclick-check.mjs && timeout 1200 node .planning/quick/261031-uya-cyclic-groups-padlock-freezes-the-main-f/log-base-lock-check.mjs</automated>
  </verify>
  <done>
- FORMULA-MAP-CHECK OK, LOG-BASE-CHECK OK, FORCE-DBLCLICK-CHECK OK, LOG-BASE-LOCK-CHECK OK and SLIDER-CHECK OK after the final page edit.
- i18n gates ≤ 31 / 4 / 109.
- The SUMMARY lists every changed expectation and J-01..J-06.
- Three commits in total on cyclic-groups-formula-sliders, nothing pushed, STATE.md, PLAN and SUMMARY untouched by git.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL → page state | fmaporder / fmapindex (and the r-side keys) come from the address bar |
| pane / ring window → host | postMessage `isopane: 'fmap'` and `ringwin: 'state'` carry slider-written tokens |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261031wef-01 | Tampering | setFormulaToken / URL tokens | low | mitigate | Every token is written through `fmapToken` (FMAP_POS whitelist) and settled by `mapSettle`; no new URL keys (D-08) |
| T-261031wef-02 | Spoofing | host isopane 'fmap' handler | low | accept | Unchanged path; the host already normalises with `fmapPair`; sliders only produce whitelisted tokens |
| T-261031wef-03 | Tampering | slider labels / tooltips | low | mitigate | All text via `translate()` into `textContent` / `title` / `aria-*`; no `innerHTML` |
| T-261031wef-04 | Denial of service | repeated double-clicks / drags | low | mitigate | Existing `logForceGen` / `logLockGen` generation counters; a rebuild mid-drag drops the drag |
| T-261031wef-SC | Tampering | npm/pip/cargo installs | low | accept | No package installs in this plan (built-in node modules and the system Chrome only) |
</threat_model>

<verification>
- `slider-check.mjs` passes in full (`SLIDER-CHECK OK`), and its `shot` scenario was run once.
- The four 261031-* probes print their OK markers after the final page edit. Only the expectations tied to (ℤ/nℤ)* and curves showing sliders changed, and each is listed in the SUMMARY.
- `node --check assets/i18n/cyclic-groups.js` passes, and the inline scripts parse (the `syntax` scenario).
- i18n gates: `--coverage` ≤ 31, `--literals-markup` ≤ 4, `--literals-js` ≤ 109. The gate config is untouched.
- The new CSS uses only `var()` / `color-mix()` of palette tokens.
</verification>

<success_criteria>
- On (ℤ/13ℤ)* and on a cyclic curve, a learner can step through JN / compact / complete and LCM / neither / GCD on each main formula. They see the derivation change exactly as the map's corresponding node would show it.
- The generator boxes, padlock and wheel switch appear as soon as one formula leaves JN.
- A closed neither behaves as the map's closed a / a2 does: a click gives the hint, a double-click forces it, and the padlock blocks the force.
- ℤ/nℤ is unchanged.
</success_criteria>

<output>
Create `.planning/quick/261031-wef-cyclic-groups-complexity-and-form-prefer/261031-wef-SUMMARY.md` when done (not committed by the executor).
</output>
