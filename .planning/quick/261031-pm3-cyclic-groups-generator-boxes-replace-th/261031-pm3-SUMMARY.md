---
quick_id: 261031-pm3
phase: quick-261031-pm3
plan: 01
subsystem: cyclic-groups
tags: [cyclic-groups, formula-maps, log-base, url-state, isomorphism-pane]
status: complete
requirements: [QUICK-261031-pm3]
commits: 3
plan_head_before: 9a3dd95045ab74a778ff4357f0eb33ee2de621d1
plan_head_after: d74dd1f0ef9a0bd5ae09a29efe96fdd0557d3084
actuals:
  tokens: 26000
  tasks: 3
  commits: 3
key-files:
  created:
    - .planning/quick/261031-pm3-cyclic-groups-generator-boxes-replace-th/log-base-boxes-check.mjs
  modified:
    - Cyclic Groups/cyclic-groups.html
    - assets/i18n/cyclic-groups.js
    - .planning/quick/261031-m2b-cyclic-groups-2-d-formula-map-control-fo/formula-map-check.mjs
---

# Phase quick-261031-pm3 Plan 01: Generator boxes replace the log-base pyramid Summary

A row of generator boxes under the main view's formulas now chooses the base of both formulas' logarithms (state.chosenBase, URL `logbase`, pane's `logbaser`); the pyramid is gone, a closed a / a2 flashes the bases that would open it, and a wheel switch steps through the boxes that are not greyed out.

## The user's request (verbatim)

"Now remove the control pyramid from the main formula area; There'll be a horizontal list of generators in boxes to choose the 'currently selected logarithm base'. When the toggle is on the inconditional path; a.k.a. the path which can always be used, the user can select from all of the group's generators; there's a box for every generator. When the toggle is on a: the list of boxes gets partially grayyed out; only the suitable logarithm bases remain. When the user clicks a or a2 while these are not reachable because of the currently selected logarithm base not being suitable to use a or a2's strategy for simplifying the formula/calculation; then flash all the logarithm bases (or generators); which ARE suitable for that mode of calculating the index/size; in GREEN, and all the others in RED. This way the user gets a hint what logarithm base to change to in order to be able to enable either a or a2. There'll be a mouse-scroll icon which can be clicked next to the horizontal arrangement (list) of generators/logarithm-bases in boxes. When the button is activated mouse scroll selects between different boxes which are not grayyed out/ARE suitable for the selected mode of viewing the index/size calculation."

## Commits (branch `cyclic-groups-log-base-boxes`, nothing pushed)

| Task | Commit | What |
| ---- | ------ | ---- |
| 1 (tracer) | faa2a57 | state/URL/resolution, the row, pyramid removed, strings, probes (D-01, D-04, D-05) |
| 2 | b2de8bd | clickable closed a/a2 + green/red flash, wheel switch, keyboard, phone (D-02, D-03, D-07) |
| 3 | d74dd1f | pane / swap / chip-link / Ring-window travel of the base; pane, ringwin, chiplinks, shot scenarios |

## Probe results (full runs after the final page edit, d74dd1f)

- `log-base-boxes-check.mjs` (all scenarios but `shot`): **180 PASS, 0 FAIL**, `LOG-BASE-CHECK OK` (boxes 27, fits 34, flash 24, legacy 18, wheel 15, pane 12, click 11, keys 9, wide 8, mobile 7, gone 7, ringwin 3, chiplinks 3, syntax 2). `shot` run separately: OK.
- `formula-map-check.mjs` (m2b, full): **605 PASS, 0 FAIL**, `FORMULA-MAP-CHECK OK`. Baseline before any edit, re-run first: 601 PASS, 2 FAIL, exactly the two stale checks the plan named (`zn every position names itself on the map`, `maps every position has a tooltip equal to its aria-label…`); both fixed here.
- `node --check assets/i18n/cyclic-groups.js` OK; both probes' `syntax` scenario parses every inline script.
- i18n gates (limits 31 / 4 / 110): before 31 / 4 / 110, after **31 / 4 / 109** (`--literals-js` dropped by one). Gate config untouched.

## Judgement calls, as built

- **J-01** `state.chosenBase` (ring) / `state.chosenBaseR` (pane's, held by the ring); URL `logbase` / `logbaser` = generator element, or a curve's point index. Written whenever set; absent/invalid (`abc`, `-3`, `4` in ℤ/12ℤ) resolves in `settleMaps` at the next main-view render and is then written.
- **J-02** Migration: a link without `logbase` resolves to `logBase(G)` (expression slider's generator, a curve's arranging point, else `generators[0]`); m2b `regress` (byte-identical rows and main views) passes. Afterwards the expression slider and Generator dropdown no longer move the base (probe: ArrowRight steps the slider, base and formulas stay). A group change keeps the base while it is a generator, else re-resolves (probe: ℤ/12ℤ base 5 -> n=8 keeps 5, -> n=10 gives 1).
- **J-03** Row = the card's last grid row (`grid-column: 1 / -1`), centred. Desktop: `.lb-list` gets `max-width = subFormulaRoom(box) - switch width - gap` and scrolls horizontally; scroll offset survives re-renders; the chosen box is always brought into view (`logBaseInView`, both axes). Phone: wraps, max-height 84 px, own vertical scroll. ℤ/97ℤ (96 boxes) verified: card inside the ring head, no sideways page scroll, base 89 / 95 / 96 / 1 / 2 in view.
- **J-04** Box text = `mapAt(G, g)` (hoisted from `mapFormula`'s `at`): plain number, or `plainPoint` on a curve.
- **J-05** Row shows whenever a shown map exists (JN and SLS too, single generator too); none for non-cyclic groups or a hidden main formula.
- **J-06** Only shown maps constrain (`logBaseFits`, per-generator booleans aligned with `G.generators`); suitability is computed after the knobs settle, so the chosen box is always enabled; the no-box-fits case enables all.
- **J-07** Closed a/a2 radios: not `disabled`, `aria-disabled="true"`, SVG nodes still `.is-closed`; activation (mouse, arrow key, Space) unchecks it, re-checks the knob's radio and calls `flashLogBases` (green = position open under that box's base, red = not; `--role-result` / `--role-warn` via `color-mix`; 1.1 s keyframes, classes removed after 1.2 s; scrolls to the nearest green box if none visible). SLS radios stay plainly `disabled` and never flash.
- **J-08** Wheel: over the whole formula card, wraps, 50-px notch accumulator, session-only per-frame switch (`aria-pressed`, off by default), not built on the phone; icon and styles copied from `#arrange-gen-scroll` (`.lb-scroll` added to its CSS selectors). The two window wheel handlers yield through `logWheelTakes(e)` (replaces `logScrollTakes`).
- **J-09** `isoHref` deletes `logbase`/`logbaser`; `swapIsoRings` saves `[chosenBase, chosenBaseR]` and restores them swapped after `loadState`.
- **J-10** Window arrow handler ignores `.lb-row`; the row's radios take the arrows natively (skip greyed boxes, wrap); focus is restored to the chosen box or the wheel switch after a rebuild.
- **J-11** Bottom-panel rows, pane's merged rows, header sorder formula and `logBasePrompt` keep `logBase(G)` / `paneLogBase`.
- **J-12** m2b probe adjusted, not rewritten. Old -> new wording: curve `pyramid at a log form` -> `base row at a log form`; `no pyramid while every shown formula sits on JN` -> `the base row stays while every shown formula sits on JN`; noncyclic `no map, no pyramid` -> `no map, no base row, no pyramid`; maps geo `map left of its formula, the pyramid clear of both` -> `map left of its formula, the base row under the last line`; mobile `no pyramid on the phone` -> `the base row on the phone and no pyramid`; second `snap` scenario: the pyramid's wheel replaced by a click on `.lb-box[data-g="7"]`, plus "box 5 is off while the order map is on a2, click changes nothing", then a (abs-gcd) and box 5 -> `logbase=5`, a2 closed, `fmaporder=abs-gcd`; `mapsNow.off` and the `dump` aid count `aria-disabled` too; maps keyboard sequence now ArrowRight -> closed a2 (flashes, knob stays on GCD full), ArrowRight -> a, -> LCM (short), ArrowLeft -> a; stale fixes: labels `… LCM full GCD SLS LCM SLS` (page draws GCD SLS then LCM SLS, ecf252f's order), tooltip check = "nine of them, equal to aria-label, a JN one starting 'JN'" (dropped the "starts with the map name" clauses).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] A base resolved in a pane made the pane report its un-synced maps to the host**
- **Found during:** Task 3 full m2b run (6 `pane` checks failed).
- **Issue:** counting a base resolution as `changed` in `settleMaps` made the pane send `isopane: 'fmap'` with its pre-"shared" map state (the host's own maps from the pane's query), clobbering the host's `fmapR`.
- **Fix:** separate `moved` flag; the `fmap` message is sent only when a knob actually moved.
- **Files:** `Cyclic Groups/cyclic-groups.html` · **Commit:** d74dd1f

**2. [Rule 1 - Bug] A pane's startup resolution overwrote the host's `logbaser`**
- **Found during:** Task 3 `pane` scenario (`logbaser=7` in the host url opened the pane on 2).
- **Issue:** the pane's first render (before the holder's first "shared" message) resolved its own base and told the host, replacing the host's stored value.
- **Fix (beyond the plan's wording):** `paneSharedIn` flag; a resolution is reported only once the holder has sent its state, and `applyIsoShared`, when the holder has no base (null) but the pane holds one, reports the pane's. A host `logbaser` that is no generator of the pane group (4) is replaced by the pane's resolution and the host url rewritten (probe-verified).
- **Files:** `Cyclic Groups/cyclic-groups.html` · **Commit:** d74dd1f

**3. [Rule 3 - Blocking, environment] tmpfs full killed one m2b run**
- Chrome profiles (~140 MB each) of killed probe runs filled `/tmp`; a run crashed with `EDQUOT` on log write. Removed my own leftover `/tmp/cg-lbase-*` and `/tmp/cg-fmap-*` profiles and re-ran. No project files affected.

**Minor / plan-shape notes**
- `logBaseFits(G)` returns a boolean array aligned with `G.generators` (the plan describes it per generator; same semantics).
- New probe has a `dump` debugging aid (not run by default), like m2b's.
- Probe fix: the "ArrowRight steps the expression slider" check needs `document.activeElement.blur()` first (focus sits on an `<input>` after entering, which the page's arrow handler ignores) - a probe precondition, not a page change.

## Known Stubs

None.

## Threat Flags

None beyond the plan's register: `logbase`/`logbaser` parsed with `intOrNull`, kept only when >= 0 and used only when in `G.generators`; pane message `chosenBase` / `isopane: 'logbase'` accepted only as integer >= 0; all new text via `textContent` / `translate()`, no `innerHTML`.

## Limits

- Strings are English-only (D-08): `logBaseLabel`, `logBaseOff`, `logBaseWheel` (and the i18n header paragraph names them); the four pyramid strings are removed; other languages show the English via fallback. Translations are a later catch-up.
- Pane race kept simple: a host "shared" message built before the host receives a pane click carries the old base and would revert it (same exposure the maps already have).
- RTL, Safari/Firefox and a real touchpad were not exercised; the wheel's notch maths is probed with synthetic `mouseWheel` events (100 and 20 px deltas), phone behaviour with Chrome device emulation (390x844, `?mobile=1`).
- Pre-existing untracked `undefined-closed.png` / `undefined-open.png` sit at the repo root (dated 2026-10-13, not from this run); left alone.
- Screenshots (untracked, this directory): `shot-log-base-boxes-light.png` (desktop 1280x900 formula area, ℤ/12ℤ h=9, order map on a, base 7), `shot-log-base-flash-light.png` (right after a click on the closed a2 at base 1, h=7: 7 green, 1/5/11 red), `shot-log-base-mobile-light.png` (phone page).

## Self-Check: PASSED

- Files exist: page, i18n file, both probes, three screenshots.
- Commits on the branch: faa2a57, b2de8bd, d74dd1f (`git rev-list --count 9a3dd95..HEAD` = 3); STATE.md, ROADMAP.md, PLAN.md and this SUMMARY are not committed by the executor.
