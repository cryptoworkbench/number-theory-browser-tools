---
phase: 06-multi-language-support
plan: 06
subsystem: i18n
tags: [i18n, nt-i18n, nt-bigint, localization, chinese-remainder-theorem, euclidean-algorithm, playback]

# Dependency graph
requires:
  - phase: 06-multi-language-support
    provides: "06-01's NT.i18n contract and canonical header; 06-02's shared `common` vocabulary (play/pause/step/instant/speed.N), 06-GLOSSARY.md terminology/tone contract, the per-page translation procedure (P1-P10), i18n-check.js's static gate suite, i18n-browser.js's runtime gate suite, and shadow-check.js's NT.i18n-aware convention gate; 06-05's deterministic stepBtn-driven switchPoint precedent"
provides:
  - "Chinese Remainder Theorem and Euclidean Algorithm fully translated into all five languages — the two step-trace tools that cross-link into each other's modular-inverse computation"
  - "assets/i18n/chinese-remainder-theorem.js ('crt' namespace), assets/i18n/euclidean-algorithm.js ('euclid' namespace) data files"
  - "Euclidean Algorithm now includes nt-bigint.js and routes every existing toLocaleString call through NT.bigint.fmt"
affects: ["06-07", "06-08", "06-09", "06-10", "06-11", "06-12"]

# Actuals (#2632)
actuals:
  tokens: 29688
  tasks: 2
  commits: 2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Prose-noun usage of 'the GCD' (a standalone noun, not function-call notation) localizes to each language's own abbreviation (ggd/gcd/ggT/PGCD/mcd) per 06-GLOSSARY.md's core-term table, while 'gcd(a, b)' as a literal function-call notation stays unlocalized in every language per the same glossary's notation rule — the two usages of the same three letters are deliberately treated differently"
    - "Per-tool state objects (bannerState, coprimeState/spanState/constructState on CRT; tileCaptionState/tileNoteState/nestedCaptionState/nestedNoteState/errorState/swapState on Euclid) pair a translate() key with its params so one onLangChange callback re-renders exactly what was last shown, without re-running the scan/search or rebuilding the strips/chain"
    - "A dynamic element whose only translated content is a tooltip set once at SVG-build time (the nested view's per-tile <title>) is retranslated by fully rebuilding that SVG from the already-computed run (same geometry, same step numbering) rather than hunting down each tooltip node individually — showStep(currentStepIndex) immediately after the rebuild restores the exact highlight/step a language switch must not disturb"

key-files:
  created:
    - assets/i18n/chinese-remainder-theorem.js
    - assets/i18n/euclidean-algorithm.js
    - .planning/phases/06-multi-language-support/i18n-config/chinese-remainder-theorem.json
    - .planning/phases/06-multi-language-support/i18n-config/euclidean-algorithm.json
  modified:
    - Chinese Remainder Theorem/chinese-remainder-theorem.html
    - Euclidean Algorithm/euclidean-algorithm.html

key-decisions:
  - "'the GCD' as a standalone prose noun (not the 'gcd(a, b)' function-call notation) localizes to each language's own abbreviation (ggd/gcd/ggT/PGCD/mcd) per 06-GLOSSARY.md's core-term table row 6 — distinct from Euler's Totient's prior decision (06-03) that 'gcd' stays literal everywhere, which was scoped to that tool's inline function-call usage ('gcd({n}, {k})'), not to generic prose references to the concept"
  - "Both pages' pure-notation DOM builders (CRT's construction table cells, Euclid's appendStepLine/renderAnswer identity-line) were left as plain string/textContent concatenation when they build ONLY numerals and math operators with no prose, except Euclid's two innerHTML-string builders (appendStepLine, renderAnswer's identityLine), which were converted to DOM construction per the plan's own threat register (T-06-18) even though their content needs no translation — only the markup-building technique changes, mirroring 06-03's Euler's Totient precedent"
  - "Euclid's nested-view per-tile SVG <title> tooltips are retranslated by fully rebuilding the nested SVG from currentRun on every language switch (buildNestedView + showStep(currentStepIndex)), rather than tracking per-tile state — the geometry and step numbering are unchanged by a rebuild, and showStep() immediately restores the exact highlight/current-step a switch must preserve"
  - "Both pages' switchPoints use deterministic stepBtn-driven custom `runs` (not play()/pause() timing), per 06-05's own lesson that a live requestAnimationFrame-driven scan/search loop paused via two separate dispatched clicks is not byte-reproducible across two headless Chrome launches"

requirements-completed: [I18N-01, I18N-02, I18N-03, I18N-05, I18N-06]

coverage:
  - id: D1
    description: "The Chinese Remainder Theorem page — count toggle, congruence field labels, preset chips (incl. the Sun Tzu riddle), playback, extended-method toggle, coprimality and span warnings, banner, strip labels, the 'all agree' row, landed answer and the construction panel — reads entirely in the active language; switching mid-scan keeps the scan cursor and play/pause state"
    requirement: "I18N-01, I18N-02, I18N-03, I18N-05"
    verification:
      - kind: unit
        ref: "node i18n-check.js \"Chinese Remainder Theorem/chinese-remainder-theorem.html\" (6/6 static modes PASS: coverage, header, includes, no-locale-number-format, literals-markup, literals-js)"
        status: pass
      - kind: unit
        ref: "node shadow-check.js \"Chinese Remainder Theorem/chinese-remainder-theorem.html\" (SHADOW-CHECK PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Chinese Remainder Theorem/chinese-remainder-theorem.html\" (en-parity IDENTICAL snaps=9; langs PASS snaps=9 langs=4; switch PASS points=2 langs=4 [mid-scan, constructed]; layout PASS; ALL PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Chinese Remainder Theorem/chinese-remainder-theorem.html\" --mutant {untranslated,stale-switch,en-change,overflow} (4/4 MUTANT-DETECTED)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The Euclidean Algorithm page — inputs, presets, playback, view toggle, extended toggle, step chain, answer and Bézout identity, both geometric views' labels, tile-cap notes and the Venn cross-link — reads entirely in the active language; switching mid-run keeps the current step, view and extended mode"
    requirement: "I18N-01, I18N-02, I18N-03, I18N-05"
    verification:
      - kind: unit
        ref: "node i18n-check.js \"Euclidean Algorithm/euclidean-algorithm.html\" (6/6 static modes PASS, including no-locale-number-format)"
        status: pass
      - kind: unit
        ref: "node shadow-check.js \"Euclidean Algorithm/euclidean-algorithm.html\" (SHADOW-CHECK PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Euclidean Algorithm/euclidean-algorithm.html\" (en-parity IDENTICAL snaps=18; langs PASS snaps=18 langs=4; switch PASS points=2 langs=4 [mid-run-nested, mid-run-step]; layout PASS; ALL PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Euclidean Algorithm/euclidean-algorithm.html\" --mutant {untranslated,stale-switch,en-change,overflow} (4/4 MUTANT-DETECTED)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Numbers on the Euclidean Algorithm page render exactly as before in every language (no browser-locale grouping); the shared ab-params storage and the ?a=&b=&ext= deep links behave exactly as before"
    requirement: "I18N-06"
    verification:
      - kind: unit
        ref: "node i18n-check.js --no-locale-number-format \"Euclidean Algorithm/euclidean-algorithm.html\" PASS; grep -n toLocaleString returns no matches (all replaced by NT.bigint.fmt)"
        status: pass
      - kind: e2e
        ref: "en-parity IDENTICAL snaps=18 incl. a preStorage ab-params run and three ?a=/?b=/?ext= query runs, storage/cookie comparison unchanged by the language listener"
        status: pass
    human_judgment: false
  - id: D4
    description: "With English active both pages render exactly as before this phase"
    requirement: "I18N-06"
    verification:
      - kind: e2e
        ref: "en-parity IDENTICAL on both pages (Chinese Remainder Theorem snaps=9, Euclidean Algorithm snaps=18)"
        status: pass
    human_judgment: false

duration: single session
completed: 2026-10-01
status: complete
plan_head_before: 53a9e054c05e4440d3df77a1984c1f43d92a8eeb
plan_head_after: 75ec3f7e2282ca9538db0d608239bbcea9f86127
---

# Phase 06 Plan 06: Chinese Remainder Theorem and Euclidean Algorithm Translation Summary

**The Chinese Remainder Theorem and the Euclidean Algorithm — the two cross-linked step-trace tools sharing the gcd/modular-inverse vocabulary — read completely in Dutch/English/German/French/Spanish, each proven by the full static + runtime + convention gate suite, preserving the scan cursor, play/pause state, current step, geometric view and extended mode across a language switch, with the Euclidean Algorithm's number formatting now routed entirely through `NT.bigint.fmt`.**

## Performance

- **Duration:** single session
- **Tasks:** 2 (all complete)
- **Files modified:** 6 (4 created, 2 modified — excluding this SUMMARY)

## Accomplishments

- **Chinese Remainder Theorem** (`Chinese Remainder Theorem/chinese-remainder-theorem.html`): canonical i18n header with the five-language switcher; new `assets/i18n/chinese-remainder-theorem.js` `crt` namespace — title/eyebrow/heading/rich lede, the cross-link text, the count-toggle group and its two buttons, the remainder/modulus field labels, the three preset chips (including the Sun Tzu riddle), the extended-method toggle label, the residue-class strip-scroll aria-label, the construction panel's lede and the two translatable table headers ("y (inverse)", "term = a · M · y"), every validation message, both coprimality/span verdict messages, every scan/banner/diagnostic message, the "all agree" strip label, both construction diagnostic messages and the per-row "see the inverse →" link text, and the closing caption. The local `SPEED_LABELS` table was deleted in favor of `translate('common.speed.'+value)`. One `onLangChange` callback (`rerenderOnLangChange`) re-renders the coprime/span notes, the banner, the "all agree" label, the speed word, the play/pause label and — by re-invoking `renderConstruction(state.run)` or `disableConstruction(constructState)` based on tracked state — the construction panel, all without rebuilding the strips, disturbing the scan cursor, or touching play/pause.
- **Euclidean Algorithm** (`Euclidean Algorithm/euclidean-algorithm.html`): canonical i18n header; new `assets/i18n/euclidean-algorithm.js` `euclid` namespace — title/eyebrow/heading/lede, the cross-link text, all seven preset chips, the Run button, the extended-method toggle label, every validation message, the swap note, the ready/done banner (a plural entry), the zero-step chain note, the extended-caption, both geometric-view toggle labels and their group aria-label, both SVGs' default aria-labels, both step-view captions (exact/leftover, each plural on the quotient) and the capped-tile note, the nested view's empty/capped messages and its own capped-note, the nested tile's tooltip title, and the closing caption. `assets/nt-bigint.js` is now included between `nt-core.js` and `nt-svg.js`, and every existing `toLocaleString` call (clamp message, both views' dimension labels, both captions' quotient word, both tile-cap notes, the capped-tile tooltip's "more squares collapsed" count) now routes through `NT.bigint.fmt` — numbers that were never locale-formatted before this phase (the dividend/divisor/remainder inside a caption sentence, the answer/identity lines) stay plain, preserving byte-identical English output. `appendStepLine` and `renderAnswer`'s identity-line builder were converted from innerHTML string concatenation to DOM construction (T-06-18), even though their content is pure notation. One `onLangChange` callback re-renders the speed word, play/pause label, error/swap notes and banner from tracked state, re-syncs the Venn cross-link's `&lang=` parameter, and rebuilds the nested SVG from `currentRun` (restoring the exact current step and highlight via `showStep(currentStepIndex)`) so the per-tile `<title>` tooltips retranslate without disturbing play/pause, the selected geometric view or extended mode.
- **Cross-link language carry**: Euclidean Algorithm's `updateXrefLink()` now appends `&lang=` + `getLang()` explicitly, since `NT.i18n`'s `decorateLinks()` only re-scans links already in the DOM at load/setLang time, not an href the page's own script sets afterward on every input change — the same bug class 06-03 and 06-04 found and fixed for their own cross-links. Chinese Remainder Theorem's cross-link into the Euclidean Algorithm tool is already rebuilt entirely by `renderConstruction`/`updateEuclidXrefLink` on every relevant input change, so it needed no equivalent fix.
- **Deterministic switchPoints on both pages**: following 06-05's lesson that a live playback loop paused via two separate dispatched clicks is not byte-reproducible across two headless Chrome launches, both pages' `i18n-config` files replace the default browser-diff step list with a custom `runs` entry whose switch snapshots are reached via `#stepBtn` clicks (synchronous, no `requestAnimationFrame` involved) rather than `#playBtn`/pause timing.

## Task Commits

Each task was committed atomically:

1. **Task 1: The Chinese Remainder Theorem reads entirely in all five languages and keeps the scan across a switch** — `b6b523b` (feat)
2. **Task 2: The Euclidean Algorithm reads entirely in all five languages and keeps the current step, view and extended mode across a switch** — `75ec3f7` (feat)

**Plan metadata:** this commit (docs: complete plan)

## Files Created/Modified

- `assets/i18n/chinese-remainder-theorem.js` — `crt` namespace (title, eyebrow, heading, rich lede, xref, countGroupLabel/countTwo/countThree, remainderLabel, modulusLabel, chipSunTzu/chipCoprime/chipSharesFactor, extToggleLabel, stripGroupLabel, constructLede, tableHeaderY/tableHeaderTerm, caption, allAgreeLabel, errModulusWhole/errModulusRange/errRemainderWhole/errRemainderRange, coprimeOk/coprimeWarn, spanWarn, testingX, diagnosticMismatchScan, solved, diagnosticScanEnd, readyToScan, constructReasonNotCoprime/constructReasonSpanBlocked, constructSumMismatch, seeInverse) in all five languages
- `assets/i18n/euclidean-algorithm.js` — `euclid` namespace (title, eyebrow, heading, lede, xref, 7 chip keys, run, extToggleLabel, 4 error keys, swapNote, bannerReady, plural bannerDone, chainNoteZero, extCaption, viewNested/viewStep/geomViewGroupLabel, tileAriaDefault/nestedAriaDefault, caption, plural tileCaptionExact/tileCaptionLeftover, tileNoteCapped, nestedEmptyMessage, plural nestedCaption/nestedNoteCapped, nestedTileTitle/nestedTileTitleCapped, tileEmptyMessage) in all five languages
- `.planning/phases/06-multi-language-support/i18n-config/chinese-remainder-theorem.json` — `allowSame`/`allowRenderText` cognate exemptions (modulus, inverse, term), `allowLiteral` for JS-owned static placeholders and href-building code, custom `runs` with `switchPoints` (mid-scan, constructed)
- `.planning/phases/06-multi-language-support/i18n-config/euclidean-algorithm.json` — `allowLiteral` for JS-owned static placeholders, href-building code and a CSS class-prefix concatenation, custom `runs` with `switchPoints` (mid-run-nested, mid-run-step)
- `Chinese Remainder Theorem/chinese-remainder-theorem.html` — canonical header, data-i18n on static markup, SPEED_LABELS removed, tracked-state banner/coprime-note/span-note/construction re-render, onLangChange wiring
- `Euclidean Algorithm/euclidean-algorithm.html` — canonical header, data-i18n on static markup, nt-bigint.js include + `fmt` import, toLocaleString → fmt sweep, DOM-construction `appendStepLine`/identity-line, tracked-state caption/note re-render, nested-SVG rebuild-on-switch, updateXrefLink `&lang=` fix, onLangChange wiring

## Decisions Made

See `key-decisions` in the frontmatter above (GCD prose-noun localization vs. notation, DOM-construction scope for pure-notation builders, nested-SVG rebuild-on-switch approach, deterministic stepBtn-driven switchPoints).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `&equiv;` HTML entity left the literal word "equiv" in CRT's congruence-row prefix, flagged as untranslated prose**
- **Found during:** Task 1, first `--literals-markup` run
- **Issue:** `i18n-check.js`'s tokenizer doesn't decode named entities beyond a small set (06-03 found the same gap for `&sup2;`/`&middot;`); `x &equiv;` left the letter-run "equiv" in the scanned text, which the prose heuristic correctly treats as a word.
- **Fix:** Replaced `&equiv;` with the literal Unicode character `≡` directly in the three congruence-row prefixes — identical rendered output, no scanner change needed.
- **Files modified:** `Chinese Remainder Theorem/chinese-remainder-theorem.html`
- **Verification:** `--literals-markup` passes with zero findings on the three prefixes
- **Committed in:** `b6b523b` (Task 1 commit)

**2. [Rule 1 - Bug] CRT's `tableHeaderY`/`tableHeaderTerm`/`modulusLabel` genuinely identical Dutch/French cognates flagged as IDENTICAL-TO-EN and UNTRANSLATED**
- **Found during:** Task 1, first `--coverage` and `i18n-browser.js` runs
- **Issue:** Dutch and French both borrow "inverse" unchanged from the same Latin root English uses; Dutch also borrows "term" and "modulus" unchanged — three dictionary-level and runtime-level false positives on genuinely correct translations.
- **Fix:** Added matching `allowSame` (dictionary-level) and `allowRenderText` (runtime-level) exemptions to `i18n-config/chinese-remainder-theorem.json`, each with a reason, mirroring the dual-exemption pattern 06-04 established for Cayley Table's `nLabel`.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/chinese-remainder-theorem.json`
- **Verification:** `--coverage` and `langs` both pass cleanly
- **Committed in:** `b6b523b`

**3. [Rule 1 - Bug] The lede's rich-form `<code>lcm(moduli)</code>` child flagged as untranslated markup/render text**
- **Found during:** Task 1, same runs
- **Issue:** `lcm` alone is a neutral token (explicitly listed in `NEUTRAL_TOKENS`), but `lcm(moduli)` also contains the Latin plural "moduli", which the prose heuristic correctly treats as a distinct word not covered by the neutral-token exemption — a false positive on pure math notation, identical in every language per the glossary's notation rule.
- **Fix:** Added `allowLiteral`/`allowRenderText` exemptions for the exact text `lcm(moduli)` with a reason.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/chinese-remainder-theorem.json`
- **Verification:** `--literals-markup` and `langs` pass cleanly
- **Committed in:** `b6b523b`

**4. [Rule 1 - Bug] Euclid's tile/nested captions used `NT.bigint.fmt` for numbers the pre-existing English never locale-formatted, breaking en-parity**
- **Found during:** Task 2, first `i18n-browser.js` en-parity run (`DIFF at chip-6`: "500000 ÷ 2" vs "500,000 ÷ 2")
- **Issue:** The original `captionText`/`nestedCaption` construction only called `.toLocaleString()` on the quotient (`step.q`/the width/height dimension labels), never on the dividend/divisor/remainder embedded inside the sentence itself; the first draft of the P8 sweep applied `fmt()` uniformly to every number in these templates, changing shipped English output for any pair whose `a`/`b`/`A`/`B`/`gcd`/`lastB` exceeded 999.
- **Fix:** Removed `fmt()` from every parameter the original code left unformatted (caption `a`/`b`/`r`, the nested caption's `A`/`B`/`gcd`/`lastB`, the nested tile title's `a`/`q`/`b`/`r`), keeping it only on the parameters that already called `.toLocaleString()` (the quotient in both captions, the tile-cap note's quotient/remaining count, the dimension labels, the capped tile title's `extra` count).
- **Files modified:** `Euclidean Algorithm/euclidean-algorithm.html`
- **Verification:** en-parity `IDENTICAL snaps=18` on re-run, including the huge-quotient chip (500000, 2) that exposed the bug
- **Committed in:** `75ec3f7` (Task 2 commit)

**5. [Rule 1 - Bug] Euclid's nested-view per-tile `<title>` tooltips stayed in the pre-switch language after a language change**
- **Found during:** Task 2, first `switch` mode run
- **Issue:** Each tile's `<title>` tooltip is written once, at SVG-build time, and nothing tracked it for re-render — the first page in this plan (and the first of this shape in the phase) where a dynamic tooltip's only opportunity to retranslate is a full rebuild of its parent SVG, not a tracked `{key, params}` state object.
- **Fix:** The `onLangChange` callback now calls `buildNestedView(currentRun)` (rebuilding the SVG with the new language's tooltips, from the same already-computed run) followed by `showStep(currentStepIndex)` (a new tracked variable recording the last index shown), which restores the exact current-step highlight and tile-view caption a switch must not disturb.
- **Files modified:** `Euclidean Algorithm/euclidean-algorithm.html`
- **Verification:** `switch PASS points=2 langs=4` on re-run
- **Committed in:** `75ec3f7`

**6. [Rule 1 - Bug] Euclid's cross-link to the Venn Diagram tool lost its `lang=` parameter on every input change**
- **Found during:** Task 2, same `switch` mode run
- **Issue:** `updateXrefLink()` set `xrefLink.href` directly from a template string, bypassing `nt-i18n.js`'s `decorateLinks()` — the same gap 06-03 and 06-04 found and fixed for their own tools' cross-links.
- **Fix:** `updateXrefLink()` now appends `'&lang=' + getLang()` itself; also re-invoked from the `onLangChange` callback via `syncXrefLinkFromFields()` so a language switch mid-session updates the link immediately.
- **Files modified:** `Euclidean Algorithm/euclidean-algorithm.html`
- **Verification:** `switch PASS points=2 langs=4`
- **Committed in:** `75ec3f7`

**7. [Rule 1 - Bug] Four JS-owned static placeholders and two href/class-building code literals flagged as untranslated**
- **Found during:** Both tasks, first `--literals-markup`/`--literals-js` runs
- **Issue:** CRT's static `speedLabel` text ("gentle") is JS-owned (overwritten on load, like every other converted tool's speed label); Euclid's static `speedLabel` ("brisk") and `banner` ("Set a and b, then press Run.") are likewise JS-owned; CRT's `updateEuclidXrefLink()` and Euclid's `updateXrefLink()`/`buildNestedView()`'s CSS class-prefix concatenation (`'nstep-'`) are code, not displayed prose.
- **Fix:** Added `allowLiteral` entries with reasons to each page's `i18n-config`, mirroring the established pattern from every prior wave-3 plan.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/chinese-remainder-theorem.json`, `.planning/phases/06-multi-language-support/i18n-config/euclidean-algorithm.json`
- **Verification:** `--literals-markup`/`--literals-js` pass cleanly on both pages
- **Committed in:** `b6b523b` (CRT), `75ec3f7` (Euclid)

---

**Total deviations:** 7 auto-fixed, all Rule 1 (genuine gate-tooling/dictionary-exemption gaps, one page-code en-parity bug, and one legitimate cross-link fix — no production page behavior changed beyond what the plan specified, except the cross-link `lang=` fix, which the plan's own precedent from 06-03/06-04 already called for). **Impact on plan:** None on scope or architecture.

## Issues Encountered

None beyond the deviations above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Two more pages (Chinese Remainder Theorem, Euclidean Algorithm) are fully proven reference implementations of the P1–P10 procedure, bringing the total converted pages to ten (Sieve, index.html, Factor Tree, Euler's Totient, Cayley Table, Equivalence Wheel, Group Isomorphism, Fermat's Method, Chinese Remainder Theorem, Euclidean Algorithm) of sixteen.
- The GCD prose-noun-vs-notation localization distinction (localize "the GCD" as a standalone noun; keep "gcd(a, b)" literal as function-call notation) is a worked precedent for any later wave-3 plan whose tool mixes both usages of the same abbreviation.
- The nested-SVG-rebuild-on-switch pattern (full rebuild from an already-computed run, then restore state via the same code path that built it the first time) is a worked example for any later plan whose dynamic tooltip/label is written once at build time with no natural per-element tracking hook.
- Outstanding for end-of-phase UAT: none newly introduced by this plan — the human-review items already on record from 06-01/06-02/06-04 (switcher legibility/two-tab sync/Firefox cookie persistence, 06-GLOSSARY.md terminology review, the Equivalence Wheel's export human-check) remain the only outstanding human checks for this phase, since neither of this plan's two tasks carries its own `<human-check>`.

---
*Phase: 06-multi-language-support*
*Completed: 2026-10-01*

## Self-Check: PASSED

- All 6 claimed files found on disk (4 created, 2 modified — see Files Created/Modified above; this SUMMARY itself is the 7th).
- Both claimed commits found in `git log` (`b6b523b`, `75ec3f7`).
- Re-ran all acceptance-criteria/verification commands fresh immediately before writing this SUMMARY:
  - `node i18n-check.js "Chinese Remainder Theorem/chinese-remainder-theorem.html"` and `"Euclidean Algorithm/euclidean-algorithm.html"` — 6/6 static modes PASS on both pages
  - `node shadow-check.js --all` — SHADOW-CHECK PASS on all 15 tool pages (including both pages this plan touched)
  - `node harness.js` — HARNESS PASS total=2856003, zero FAIL
  - `node i18n-browser.js "Chinese Remainder Theorem/chinese-remainder-theorem.html"` — en-parity IDENTICAL snaps=9, langs PASS snaps=9 langs=4, switch PASS points=2 langs=4, layout PASS, ALL PASS
  - `node i18n-browser.js "Euclidean Algorithm/euclidean-algorithm.html"` — en-parity IDENTICAL snaps=18, langs PASS snaps=18 langs=4, switch PASS points=2 langs=4, layout PASS, ALL PASS
  - `node i18n-browser.js "Chinese Remainder Theorem/chinese-remainder-theorem.html" --mutant {untranslated,stale-switch,en-change,overflow}` — 4/4 MUTANT-DETECTED
  - `node i18n-browser.js "Euclidean Algorithm/euclidean-algorithm.html" --mutant {untranslated,stale-switch,en-change,overflow}` — 4/4 MUTANT-DETECTED
  - `node i18n-check.js --api` (122) / `--persistence` (71) / `--smoke` (123, mutant detected) — all PASS, no regression
  - `grep -c 'id="lang-switch-select"'` = 1, `grep -c 'data-i18n="site.nav\.'` = 16, `grep -c '= NT.i18n;'` = 1 on both pages; `grep -c '= NT.bigint;'` = 1 on Euclidean Algorithm
