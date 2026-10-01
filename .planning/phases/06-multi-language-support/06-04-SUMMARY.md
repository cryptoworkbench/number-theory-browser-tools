---
phase: 06-multi-language-support
plan: 04
subsystem: i18n
tags: [i18n, nt-i18n, localization, cayley-table, equivalence-wheel, group-theory]

# Dependency graph
requires:
  - phase: 06-multi-language-support
    provides: "06-01's NT.i18n contract and canonical header; 06-02's shared `common` vocabulary (additiveGroups/multiplicativeGroups), 06-GLOSSARY.md terminology/tone contract, the per-page translation procedure (P1-P10), i18n-check.js's static gate suite, i18n-browser.js's runtime gate suite, and shadow-check.js's NT.i18n-aware convention gate"
provides:
  - "Cayley Table and Equivalence Wheel fully translated into all five languages — the two group-theory sibling tools translated together for consistent shared vocabulary"
  - "assets/i18n/cayley-table.js, assets/i18n/equivalence-wheel.js data files"
  - "i18n-check.js looksLikeCode() widened (leading-space class concatenation, function-call-shaped fragments, MIME types, URI schemes, XML prolog) — shared-infra fixes benefiting every later wave-3 plan whose code touches SVG transform/paint strings, Blob/data-URI MIME types, or XML declarations"
affects: ["06-05", "06-06", "06-07", "06-08", "06-09", "06-10", "06-11", "06-12"]

# Actuals (#2632)
actuals:
  tokens: 22621
  tasks: 2
  commits: 2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two sibling tools translated in one plan to keep shared group-theory vocabulary (identity, inverse, commutative, element) consistent between them, even though their Randomize/N-label strings are duplicated (not shared via common.*) since neither plan may edit assets/i18n/site.js"
    - "Equation/caption builders rewritten from innerHTML string concatenation to DOM construction (createElement spans/b/mono) + translateInto, with a fresh span instance per occurrence of a repeated value (a Node cannot be appended twice — appendChild moves, not copies)"
    - "Per-mode wording fields (identityWord, inverseWord, note, heading, refCount, formula, verbing, joiner, role words) converted from plain English strings to translate-key references (identityWordKey, noteKey, ...), resolved via translate() at render time rather than concatenated as JS literals"
    - "A per-mode symmetry note that happened to use a different notation symbol than the mode's own `sign` field (middle-dot '·' in prose vs '×' in the table) is kept as two fully independent literal dictionary keys rather than forced into one {sign}-parameterized template, preserving exact pre-phase English byte-output"

key-files:
  created:
    - assets/i18n/cayley-table.js
    - assets/i18n/equivalence-wheel.js
    - .planning/phases/06-multi-language-support/i18n-config/cayley-table.json
    - .planning/phases/06-multi-language-support/i18n-config/equivalence-wheel.json
  modified:
    - Cayley Table/cayley-table.html
    - Equivalence Wheel/equivalence-wheel.html
    - .planning/phases/06-multi-language-support/i18n-check.js

key-decisions:
  - "Cayley Table's dead/unused MODES.words field (row operand/column operand/sum, column factor/row factor/product) was left unconverted — grep confirmed it is never referenced anywhere in the page's script, so there is no displayed text to translate; it also already passes the all-lowercase-code heuristic so it does not trip the static gate either way"
  - "symmetryNoteAdditive/symmetryNoteMultiplicative kept as two complete, non-parameterized dictionary keys (not a shared {sign}-templated key) because the pre-existing English source used a literal middle dot '·' in the multiplicative prose while mode.sign for multiplicative is '×' (used consistently everywhere else, e.g. the table header and equation caption) — unifying them under {sign} would have silently changed the shipped English text for multiplicative mode's symmetry note from '·' to '×', breaking en-parity"
  - "Both pages' updateWheelXref()/updateCayleyXref() cross-link builders now append '&lang=' + getLang() explicitly, mirroring the fix 06-03 made for Euler's Totient's updateXrefLink() — NT.i18n's decorateLinks() only re-scans links present in the DOM at load/setLang time, never an href a page's own script sets afterward (on every mode/N change), so without this the cross-link between the two sibling tools would silently lose the visitor's chosen language on the first interaction"

requirements-completed: [I18N-01, I18N-02, I18N-03, I18N-05, I18N-06]

coverage:
  - id: D1
    description: "The Cayley Table — mode tabs, modulus field, randomize button, group summary, identity/symmetry notes, equation caption, cell notes, legend, table aria labels and cross-link — reads entirely in the active language; switching keeps N, mode and the selected cell"
    requirement: "I18N-01, I18N-02, I18N-03, I18N-05"
    verification:
      - kind: unit
        ref: "node i18n-check.js \"Cayley Table/cayley-table.html\" (6/6 static modes PASS: coverage, header, includes, no-locale-number-format, literals-markup, literals-js)"
        status: pass
      - kind: unit
        ref: "node shadow-check.js \"Cayley Table/cayley-table.html\" (SHADOW-CHECK PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Cayley Table/cayley-table.html\" (en-parity IDENTICAL snaps=21; langs PASS snaps=17 langs=4; switch PASS points=2 langs=4; layout PASS; ALL PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Cayley Table/cayley-table.html\" --mutant {untranslated,stale-switch,en-change,overflow} (4/4 MUTANT-DETECTED)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The Equivalence Wheel — mode tabs, sliders, randomize/export buttons and status, mode note, wheel aria label and captions, reference list, formula line, cross-link — reads entirely in the active language; switching keeps N, depth, mode and selection; exports (SVG/PNG/print) carry the active language"
    requirement: "I18N-01, I18N-02, I18N-03, I18N-05"
    verification:
      - kind: unit
        ref: "node i18n-check.js \"Equivalence Wheel/equivalence-wheel.html\" (6/6 static modes PASS)"
        status: pass
      - kind: unit
        ref: "node shadow-check.js \"Equivalence Wheel/equivalence-wheel.html\" (SHADOW-CHECK PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Equivalence Wheel/equivalence-wheel.html\" (en-parity IDENTICAL snaps=26; langs PASS snaps=22 langs=4; switch PASS points=2 langs=4; layout PASS; ALL PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Equivalence Wheel/equivalence-wheel.html\" --mutant {untranslated,stale-switch,en-change,overflow} (4/4 MUTANT-DETECTED)"
        status: pass
    human_judgment: true
    rationale: "The task's own <human-check> requires switching to Deutsch/Français and exercising Download SVG, Download PNG and Print / Save as PDF by hand — Phase 7 recorded that the export path hangs headless Chrome's download machinery, so exports are checked by hand per workflow.human_verify_mode=end-of-phase, harvested at end-of-phase UAT rather than by this executor."
  - id: D3
    description: "The two siblings share the mode-tab vocabulary from common.*; their shared group-params storage is untouched"
    requirement: "I18N-01"
    verification:
      - kind: unit
        ref: "grep -c \"common.additiveGroups\\|common.multiplicativeGroups\" on both pages' data-i18n attributes (present on both pages' mode tabs); en-parity's localStorage/cookie comparison (IDENTICAL on both pages) confirms group-params is unchanged by the language listener/re-render"
        status: pass
    human_judgment: false
  - id: D4
    description: "With English active both pages render exactly as before this phase"
    requirement: "I18N-06"
    verification:
      - kind: e2e
        ref: "en-parity IDENTICAL on both pages (Cayley Table snaps=21, Equivalence Wheel snaps=26); node i18n-check.js --no-locale-number-format PASS on both pages"
        status: pass
    human_judgment: false

duration: single session
completed: 2026-10-01
status: complete
plan_head_before: 9cc69a6
plan_head_after: 58b7ec759a880abe86513ab18e811055cd03a764
---

# Phase 06 Plan 04: Cayley Table and Equivalence Wheel Translation Summary

**The Cayley Table and the Equivalence Wheel — the two group-theory sibling tools — read completely in Dutch/English/German/French/Spanish, each proven by the full static + runtime + convention gate suite, preserving table selection/scroll/focus and wheel state across a language switch, with four shared-infra `looksLikeCode()` fixes discovered while running the Phase 06-02 gate suite against SVG-transform and Blob/MIME-type code idioms for the first time.**

## Performance

- **Duration:** single session
- **Tasks:** 2 (all complete)
- **Files modified:** 7 (4 created, 3 modified — excluding this SUMMARY)

## Accomplishments

- **Cayley Table** (`Cayley Table/cayley-table.html`): canonical i18n header with the five-language switcher; new `assets/i18n/cayley-table.js` `cayley` namespace — title/eyebrow/heading/lede/xref, tablist/field labels, the four rich legend items, n-note validation messages, per-mode identity/inverse words, two fully-literal per-mode symmetry notes, a plural group-summary entry, the table caption and the equation caption. The table's own `<caption>` and the equation caption (`updateCaption()`) were rewritten from innerHTML template strings to DOM construction (`createElement('span')` with `slot-a`/`slot-b`/`slot-sum` classes) rendered through `translateInto()`, per threat register row T-06-14. One `onLangChange` callback re-renders the group summary, identity/symmetry notes, table caption, n-note, cell notes and equation caption without rebuilding the 14,400-cell table, so the selected cell, scroll position and keyboard focus all survive a language switch.
- **Equivalence Wheel** (`Equivalence Wheel/equivalence-wheel.html`): canonical i18n header; new `assets/i18n/equivalence-wheel.js` `wheel` namespace — title/eyebrow/rich-lede/xref, tablist/field/export labels, the SVG's own aria-label, per-mode note/heading/ref-count/formula strings, the six role words (first/second addend/factor, sum/product), the wedge aria-label templates, the two equivalence-class caption states and the "sum" caption, and the four export status messages. `updateCaption()` rewritten from innerHTML to DOM construction (colored slot spans, a bold span, a `.mono` span) through `translateInto()`. The wedge aria-labels, mode note, ref heading/count, formula line and export status all now route through `translate()`. One `onLangChange` callback calls the existing `render()` (which already rebuilds the whole SVG from `state` — N/depth/mode/selection untouched by a language switch) plus a separate export-status re-render. Exported SVG/PNG/print output is built from the live, already-translated wheel DOM, so it follows the active language automatically.
- **Cross-link language carry**: both `updateWheelXref()` (Cayley → Wheel) and `updateCayleyXref()` (Wheel → Cayley) now append `&lang=` + `getLang()` explicitly, since `NT.i18n`'s `decorateLinks()` only re-scans links present in the DOM at load/setLang time, not an href a page's own script sets afterward on every mode/N change — the same bug class 06-03 found and fixed for Euler's Totient's cross-link.
- **Four shared-infra fixes in `i18n-check.js`'s `looksLikeCode()`** discovered while running the gate suite against these two pages' SVG-rendering and export code for the first time (see Deviations): a leading-space class-name concatenation (`' is-multi'`), a function-call-shaped fragment ending in an unmatched `(` (`'rotate('`, `'rgb('`), a MIME-type literal (`'image/png'`), a URI-scheme-prefixed literal (`'data:image/svg+xml;...'`), and a literal XML declaration (`'<?xml version="1.0" ...?>'`).

## Task Commits

Each task was committed atomically:

1. **Task 1: The Cayley Table reads entirely in all five languages and keeps N, mode and the selected cell across a switch** — `916ab70` (feat)
2. **Task 2: The Equivalence Wheel reads entirely in all five languages, keeps its state across a switch, and exports in the active language** — `58b7ec7` (feat)

**Plan metadata:** this commit (docs: complete plan)

## Files Created/Modified

- `assets/i18n/cayley-table.js` — `cayley` namespace (title, eyebrow, heading, lede, xref, tablistLabel, nLabel, randomizeLabel, randomize, tableScrollLabel, legend.* × 4, nNoteNotWhole/TooSmall/Capped, identityWordAdditive/Multiplicative, inverseWordAdditive/Multiplicative, identityNote, symmetryNoteAdditive/Multiplicative, summaryAdditive/Multiplicative (plural), tableCaption, noteDiagonal, noteCommutative, selfInverseNote, equationCaption) in all five languages
- `assets/i18n/equivalence-wheel.js` — `wheel` namespace (title, eyebrow, heading, lede, xref, tablistLabel, nLabel, nRangeLabel, ringsLabel, depthRangeLabel, randomizeLabel, randomize, exportLabel, exportPngBtn/SvgBtn/PdfBtn, svgLabel, noteAdditive/Multiplicative, headingAdditive/Multiplicative, refCountAdditive/Multiplicative, formulaAdditive/Multiplicative, roleFirstAddend/SecondAddend/Sum, roleFirstFactor/SecondFactor/Product, and, wedgeAriaLabel(WithRoles), verbingAdditive/Multiplicative, joinerAdditive/Multiplicative, classIntroPromptA/BAdditive/BMultiplicative, sumCaption, exportSaved, exportFailedSvg/Png, exportPrintOpening) in all five languages
- `.planning/phases/06-multi-language-support/i18n-config/cayley-table.json` — `allowSame` (equationCaption's placeholder-as-word false positive, nLabel's genuine nl/en "modulus" cognate), `allowLiteral` (the updateWheelXref href-building code literals), `allowRenderText` (the rendered nl "N — modulus" label), `switchPoints` (cell-2-3, n-120)
- `.planning/phases/06-multi-language-support/i18n-config/equivalence-wheel.json` — `allowSame` (nLabel/nRangeLabel's nl cognates, roleProduct's nl/en cognate), `allowLiteral` (ref-heading's JS-owned static placeholder, the updateCayleyXref href-building code literals), `allowRenderText` (the rendered nl "N — modulus"/"Modulus N" labels), `switchPoints` (wedge-sum, depth-9)
- `Cayley Table/cayley-table.html` — canonical header, data-i18n on static markup, MODES translate-key fields, DOM-construction equation caption, n-note state tracking, onLangChange wiring, updateWheelXref `&lang=` fix
- `Equivalence Wheel/equivalence-wheel.html` — canonical header, data-i18n on static markup (incl. rich-form lede), MODES translate-key fields, DOM-construction caption helpers, wedge aria-label translation, export-status state tracking, onLangChange wiring, updateCayleyXref `&lang=` fix
- `.planning/phases/06-multi-language-support/i18n-check.js` — `looksLikeCode()` widened: leading-whitespace allowance on the class-name heuristic, trailing-unmatched-`(` function-call fragments, MIME-type literals, URI-scheme-prefixed literals, XML-declaration literals

## Decisions Made

- Cayley Table's dead `MODES.words` field left unconverted (never referenced anywhere in the script — confirmed by grep; also already passes the code heuristic, so no gate risk either way).
- `symmetryNoteAdditive`/`symmetryNoteMultiplicative` kept as two independent, fully-literal dictionary keys rather than one `{sign}`-parameterized template, because the pre-existing English source used a literal `·` in the multiplicative prose while `mode.sign` is `×` — unifying them would have changed the shipped English text.
- Both cross-link builders (`updateWheelXref`, `updateCayleyXref`) now append `&lang=` explicitly, mirroring 06-03's Euler's Totient fix for the same `decorateLinks()`-doesn't-re-scan-JS-set-hrefs gap.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `cayley.equationCaption`/Dutch `nLabel` flagged as IDENTICAL-TO-EN by `--coverage`**
- **Found during:** Task 1, first `i18n-check.js` run against the Cayley Table
- **Issue:** (a) `equationCaption`'s template placeholder names (`spanA`, `sign`, `spanSum`, …) tokenize as "words" under `isProse()`'s letter-run regex, so a template that is identical in every language by design (pure notation) was flagged as a translation bug. (b) Dutch genuinely borrows "modulus" unchanged from the same Latin root as English, so `nLabel: "N — modulus"` is a legitimately identical cognate, not an untranslated string.
- **Fix:** Added `allowSame` entries to `i18n-config/cayley-table.json` for both keys, with reasons.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/cayley-table.json`
- **Verification:** `--coverage` passes cleanly on the Cayley Table
- **Committed in:** `916ab70` (Task 1 commit)

**2. [Rule 1 - Bug] `updateWheelXref()`'s href-building string literals flagged as UNTRANSLATED-JS**
- **Found during:** Task 1, first `--literals-js` run
- **Issue:** `'../Equivalence Wheel/equivalence-wheel.html?mode='` and `'&lang='` are URL-building code, not displayed prose, but `--literals-js`'s heuristic has no built-in exemption for href-construction literals.
- **Fix:** Added `allowLiteral` entries with reasons, mirroring 06-03's identical fix for Euler's Totient's `updateXrefLink()`.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/cayley-table.json`
- **Verification:** `--literals-js` passes cleanly
- **Committed in:** `916ab70`

**3. [Rule 1 - Bug] `i18n-check.js`'s all-lowercase-code heuristic didn't allow a LEADING space**
- **Found during:** Task 2, first `--literals-js` run against the Equivalence Wheel
- **Issue:** `wedgeClass += ' is-multi'` and `rowClass += ' is-multi'` concatenate a literal CSS-class token with a LEADING space, but the heuristic (`/^[a-z][a-z]*(?:[\s-][a-z]+)*\s*$/`) only allowed a TRAILING run of whitespace (06-03's own prior fix), not a leading one — so `' is-multi'` was flagged as untranslated prose.
- **Fix:** Widened the regex to `/^\s*[a-z][a-z]*(?:[\s-][a-z]+)*\s*$/` (leading `\s*` added).
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-check.js`
- **Verification:** `--literals-js` passes on the Equivalence Wheel; re-ran on the Cayley Table, index.html, the Sieve, Factor Tree and Euler's Totient with no regressions
- **Committed in:** `916ab70` (bundled with Task 1's commit since both tasks needed this shared-infra fix; Task 1 ran first)

**4. [Rule 1 - Bug] Four more untranslated-code-string false positives in the Equivalence Wheel's SVG-rendering and export code**
- **Found during:** Task 2, same `--literals-js` run
- **Issue:** `'rotate('`/`'rgb('` (SVG transform/paint function-call fragments built via concatenation), `'image/png'`/`'image/svg+xml;charset=utf-8'` (Blob/data-URI MIME-type literals), `'data:image/svg+xml;charset=utf-8,'` (a URI-scheme-prefixed literal), and the literal `'<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n'` XML declaration were all flagged as untranslated prose — none of these code idioms appeared in any page the gate suite had previously been run against (Sieve, index.html, Factor Tree, Euler's Totient, Cayley Table).
- **Fix:** Added four targeted rules to `looksLikeCode()`: a trailing-unmatched-`(` detector, a MIME-type-shape detector, a URI-scheme-prefix detector (requiring no whitespace immediately after the scheme's `:`, so ordinary prose with an early colon is never caught), and an XML-prolog detector.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-check.js`
- **Verification:** `--literals-js` reports zero findings on the Equivalence Wheel; re-ran `--all` across every converted page with no regressions
- **Committed in:** `916ab70` (same shared-infra commit as fix #3)

**5. [Rule 1 - Bug] Dutch "N — modulus"/"Modulus N"/"product" flagged as UNTRANSLATED by `i18n-browser.js`'s `langs` mode**
- **Found during:** Task 1 and Task 2, first `i18n-browser.js` runs
- **Issue:** The runtime `langs` gate has its own separate text-comparison path (distinct from `i18n-check.js`'s dictionary-level `--coverage`/`allowSame`), so the same genuinely-identical Dutch cognates ("modulus", "Modulus N", "product") needed a second, independent exemption via `allowRenderText`.
- **Fix:** Added `allowRenderText` entries to both `i18n-config/cayley-table.json` and `i18n-config/equivalence-wheel.json`.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/cayley-table.json`, `.planning/phases/06-multi-language-support/i18n-config/equivalence-wheel.json`
- **Verification:** `langs PASS` on both pages (Cayley Table snaps=17 langs=4; Equivalence Wheel snaps=22 langs=4)
- **Committed in:** `916ab70` (Cayley), `58b7ec7` (Wheel)

---

**Total deviations:** 5 auto-fixed, all Rule 1 (genuine bugs in the dev-only gate tooling, or legitimate cognate exemptions — no production page behavior changed beyond what the plan specified). Three of the five are shared-infra fixes (`looksLikeCode()` ×4 rules across 2 deviations) now available to every remaining wave-3 plan whose pages build SVG transform/paint strings, Blob/data-URI MIME types, or concatenate CSS classes with a leading space. **Impact on plan:** None on scope or architecture.

## Issues Encountered

None beyond the deviations above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Two more pages (Cayley Table, Equivalence Wheel) are fully proven reference implementations of the P1–P10 procedure, bringing the total converted pages to six (Sieve, index.html, Factor Tree, Euler's Totient, Cayley Table, Equivalence Wheel) of sixteen.
- The `looksLikeCode()` widening (leading-space class concatenation, function-call fragments, MIME types, URI schemes, XML prolog) is now available to every remaining wave-3 plan — several later tools (RSA, Diffie-Hellman, Elliptic Curve DH, Shor's Algorithm) use similar SVG/export code idioms and are likely to hit the same gaps.
- `i18n-config/cayley-table.json` and `i18n-config/equivalence-wheel.json` are two more worked examples of the `allowSame` + `allowRenderText` dual-exemption pattern (dictionary-level vs. runtime-rendered-text level) for genuinely-identical cross-language cognates — a pattern not yet needed by any prior wave-3 plan.
- Outstanding for end-of-phase UAT: Task 2's own `<human-check>` — switching the Equivalence Wheel to Deutsch and Français and exercising Download SVG, Download PNG and Print / Save as PDF by hand (Phase 7 recorded that headless Chrome's download machinery hangs on this export path) — not exercised by this executor per `workflow.human_verify_mode=end-of-phase`, harvested at phase verification. The terminology review (06-GLOSSARY.md) and the switcher/two-tab-sync/Firefox-cookie checks from 06-01/06-02 remain the only other outstanding human checks for this phase.

---
*Phase: 06-multi-language-support*
*Completed: 2026-10-01*

## Self-Check: PASSED

- All 7 claimed files found on disk (4 created, 3 modified — see Files Created/Modified above; this SUMMARY itself is the 8th).
- Both claimed commits found in `git log` (`916ab70`, `58b7ec7`).
- Re-ran all acceptance-criteria/verification commands fresh immediately before writing this SUMMARY:
  - `node i18n-check.js "Cayley Table/cayley-table.html" "Equivalence Wheel/equivalence-wheel.html"` — 6/6 static modes PASS on both pages
  - `node shadow-check.js --all` — SHADOW-CHECK PASS on all 15 tool pages (including both pages this plan touched)
  - `node harness.js` — HARNESS PASS total=2856003, zero FAIL
  - `node i18n-browser.js "Cayley Table/cayley-table.html"` — en-parity IDENTICAL snaps=21, langs PASS snaps=17 langs=4, switch PASS points=2 langs=4, layout PASS, ALL PASS
  - `node i18n-browser.js "Equivalence Wheel/equivalence-wheel.html"` — en-parity IDENTICAL snaps=26, langs PASS snaps=22 langs=4, switch PASS points=2 langs=4, layout PASS, ALL PASS
  - `node i18n-browser.js "Cayley Table/cayley-table.html" --mutant {untranslated,stale-switch,en-change,overflow}` — 4/4 MUTANT-DETECTED
  - `node i18n-browser.js "Equivalence Wheel/equivalence-wheel.html" --mutant {untranslated,stale-switch,en-change,overflow}` — 4/4 MUTANT-DETECTED
  - `node i18n-check.js --api` (122) / `--persistence` (71) — both PASS, no regression
  - `grep -c 'id="lang-switch-select"'` = 1, `grep -c 'data-i18n="site.nav\.'` = 16, `grep -c '= NT.i18n;'` = 1 on both pages
