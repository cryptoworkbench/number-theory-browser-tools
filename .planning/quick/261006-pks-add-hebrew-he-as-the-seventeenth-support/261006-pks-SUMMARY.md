---
phase: quick-261006-pks
plan: 01
subsystem: i18n
tags: [i18n, hebrew, rtl, bidi, nt-i18n, site-css, i18n-check, glossary]
status: complete

requires:
  - phase: 06-multi-language-support
    provides: NT.i18n engine, 16-language dictionaries, i18n-check.js / i18n-browser.js gates, 06-GLOSSARY.md
provides:
  - Hebrew (he) as the seventeenth supported language on all 16 pages, the site's first right-to-left language
  - html dir="rtl" while Hebrew is active (removed for every other language), legacy iw mapped to he in browser-language detection only
  - RTL-safe shared chrome (assets/site.css) and a page-level :root[dir="rtl"] LTR-island rule on 15 pages
  - a he block for every key of all 18 namespaces (943 keys), plurals as {one, two, other}
  - gate tooling extended to Hebrew (plural shape, script rule, bidi rules BIDI-CONTROL/UNBALANCED/FORMULA/RAW, repaired module.exports)
  - docs moved to seventeen languages; glossary holds the Hebrew contract, term table and cross-batch conventions
affects: [i18n, glossary, living docs, i18n-check.js, i18n-browser.js]

actuals:
  tokens: 71424
  tasks: 5
  commits: 6
plan_head_before: 42ae6fa339c90951a5725205b78cf498d903a8d3
plan_head_after: 472a6a263e49f6a0827f0b0aaccd30a517a271f7

tech-stack:
  added: []
  patterns:
    - "dir attribute applied with lang in applyHtmlLang; internal RTL_LANGS list, not exported"
    - "numeric formulas inside Hebrew values wrapped in \\u2066...\\u2069 isolates; Hebrew inside LTR-forced boxes in \\u2067...\\u2069"
    - "per-page :root[dir=\"rtl\"] :is(...) { direction: ltr; unicode-bidi: isolate } for diagram/number/formula elements only"

key-files:
  created: []
  modified:
    - assets/nt-i18n.js
    - assets/site.css
    - assets/i18n/*.js (all 17 data files)
    - .planning/phases/06-multi-language-support/i18n-check.js
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md
    - CLAUDE.md
    - .claude/CLAUDE.md
    - all 16 .html pages
    - .planning/PROJECT.md, REQUIREMENTS.md, codebase/{STACK,CONVENTIONS,ARCHITECTURE,CONCERNS,STRUCTURE,TESTING}.md

key-decisions:
  - "he is appended to SUPPORTED_LANGS; iw is handled only inside detectDefaultLang and is never an allow-list code (setLang('iw'), he-IL, HE all rejected)"
  - "dir is removed (not set to ltr) for non-RTL languages so the English DOM is unchanged"
  - "ממ״מ kept only in space-constrained labels (pills, step labels); prose spells out המחלק המשותף המקסימלי"
  - "unit spellings unified: ביט, אלפיות שנייה; diagram is דיאגרמה (תרשים only in תרשים פיזור)"
  - "Miller-Rabin keeps the dash style of each file's English value (DH ASCII hyphen, RSA en dash); the Hebrew already matched, no change needed"

requirements-completed: [QUICK-261006-pks, I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, I18N-06]
---

# Phase quick-261006-pks Plan 01: Hebrew as the seventeenth language Summary

Hebrew (עברית, `he`) now works on all 16 pages as the site's first right-to-left language: `<html lang="he" dir="rtl">`, a mirrored header, a complete Hebrew value for every key of all 18 namespaces, and diagrams, number grids, numeric inputs and formulas kept left-to-right through CSS islands and U+2066..U+2069 isolates.

## Commits (6, measured from 42ae6fa)

| Task | Commit | What |
|---|---|---|
| 1 (tracer) | 4ad135c | Engine (SUPPORTED_LANGS, RTL_LANGS, `dir`, iw detection), site.css RTL chrome, i18n-check.js Hebrew rules + repaired exports, switcher option on all 16 pages, glossary contract, site/common/sieve dictionaries, Sieve LTR rule |
| 2 | c3c5712 | he for hub, factorTree, venn, euclid, crt, fermat + page LTR rules |
| 3 | c1cb973 | he for wheel, totient, cayley, iso, sqm, dh + page LTR rules |
| 4 | b2aae87 | he for ecdh, rsa, shor + page LTR rules |
| 5a | 0b3f332 | fix: cross-batch term unification in the he blocks only |
| 5b | 472a6a2 | docs: seventeen languages across the living docs + glossary consolidation |

## Page LTR selectors (`:root[dir="rtl"]` rules, direction: ltr; unicode-bidi: isolate)

- Sieve: `.grid-container, .progress-track`
- Factor Tree: `.palette, .tree-card, .tree-pair, .drop-split, .equation`
- Venn: `.prime-picker, .diagram-split, .lcm-equation, .lcm-toggle-formula` (`.region-label` kept RTL)
- Euclid: `.chain, .answer-line, .identity-line, .field-row` (`.chain-note` kept RTL)
- CRT: `.field-row, .strip-scroll, .answer-line, .construct-table, .construct-sum` (`.field label` kept RTL)
- Fermat: `.math, .stats, .two-col, .result` (small/labels/legend/diagram heading kept RTL)
- Wheel: `.diagram-frame, .ref-list, .ref-head .count, .field .val, .caption .mono, .caption .slot-a/-b/-sum`
- Totient: `.chips, .k-grid, .chain, .answer-line`
- Cayley: `.table-scroll` (caption and `.n-note` kept RTL)
- Isomorphism: `.wheel-pair, .ref-list, .ref-head .count, #pair-select, .caption .mono/.slot-*` (`.wheel-pair .caption` kept RTL)
- Square and Multiply: `.binary-strip, .chip` and the numeric `.substep > .formula` rows
- Diffie-Hellman: `.chip, .formula:has(> .lbl), .formula:has(> .val), .scratch-kv`
- ECDH: `#curveSvg, .intro .formula, .ref-list` (`.midline-caption, .inf-label` kept RTL)
- RSA: `.wire-diagram, .tbl-wrap, .keycard .kv, .scratch-kv`; `table.steps th/td` use `unicode-bidi: plaintext`
- Shor: `#cycleRing`
- index.html: no rule (no formula or number content); 15 of 16 pages carry the rule.

## Task 5 additions

**A. Glossary consolidation** (`06-GLOSSARY.md`): the Hebrew entry in (a) gained the Task 3 conventions (RLI..PDI for Hebrew phrases inside LTR-forced boxes, final period inside a formula isolate, `{word}` slots take the indefinite noun), the unit/diagram/Miller-Rabin spellings, the gcd/ממ״מ rule and the Venn infinitive-link convention. A new "Hebrew supplementary terms" table after (c) records every Task 2-4 term the orchestrator listed (verified present in the shipped he values; inflected forms such as plural טבעות קונצנטריות are noted as inflections of the citation form).

**B. Cross-batch consistency fixes** (he blocks only, commit 0b3f332; DICT-UNCHANGED confirms no other language moved):
- bit: ECDH and RSA סיבית/סיביות changed to ביט/ביטים (gender agreement fixed: "שערכם", "הראשונים", "מוצגים").
- milliseconds: ECDH and RSA מילישניות changed to אלפיות שנייה (4 RSA values including all three resGiveupBody plural forms, 1 ECDH).
- Miller-Rabin: no change needed. The Hebrew already follows each file's English dash (DH `מילר-רבין` vs English `Miller-Rabin`; RSA `מילר–רבין` vs English `Miller–Rabin`). Rule recorded in the glossary.
- gcd: ממ״מ kept in the space-constrained labels `pillGcdPostProcessing`, `stepGcdCheckLabel`, `stepFactorViaGcdLabel`. Spelled out as המחלק המשותף המקסימלי in the prose values `strongGcdPostProcessing` (intro sentence), `detailFactorRecoveredGcd`, `detailRootContinue`, `ringNoCycleLuckyGcd`.
- Other divergences found by grepping the he blocks against the glossary and fixed: `תרשים` for "diagram" in `dh.stageAriaLabel` and `shor.cycleRingAriaLabel` became `דיאגרמת` (תרשים kept only in תרשים פיזור for scatter plots); `euclid.extToggleLabel` "מצב אוקלידס מורחב" became "מצב האלגוריתם האוקלידי המורחב" to match CRT and RSA. Audited and found consistent: חבורה/מחלקה/מחלקת שקילות, מודולוס, יוצר, הופכי, ראשוני/ראשוניים, מצותת, מפתח ציבורי/פרטי, כוח גס, העלאה בחזקה מודולרית, מעריך, דיפי-הלמן, אוקלידס, קיילי, ארטוסתנס.

**Docs:** CLAUDE.md, .claude/CLAUDE.md and the .planning/codebase mirrors (STACK, CONVENTIONS, ARCHITECTURE, CONCERNS, STRUCTURE, TESTING), PROJECT.md and REQUIREMENTS.md now state seventeen languages with he, Hebrew's `{one, two, other}`, iw to he detection, the Hebrew-script rule and the RTL/bidi rules (dir="rtl", isolates, BIDI-* findings). Statements about the 16 pages/tools/nav links/header copies stay 16.

## Verification (final sweep, HEAD 472a6a2)

| Gate | Result |
|---|---|
| `i18n-check.js --all` (coverage incl. SCRIPT-* and BIDI-*, header, includes, no-locale-number-format, literals-markup, literals-js) | PASS, 16 pages |
| `--switcher-present --all` | PASS, 16 pages |
| `--api` | PASS, 443 assertions (needed more than 415) |
| `--persistence` | PASS, 268 assertions (needed more than 250) |
| `--smoke` | PASS, 123 assertions, mutant detected, cross-session OK |
| `shadow-check.js --all` | PASS on every page |
| `shadow-check.js --docs` | 8 MIRROR-DRIFT, equal to the pre-existing 8, none added |
| DICT-UNCHANGED + HE | 0 findings: every non-he value of every namespace equals 42ae6fa, every namespace has he |
| No font change | no added `font-family`, `fonts.googleapis`, `@font-face` line vs 42ae6fa |
| Stale counts | no "sixteen languages" left in docs, nt-i18n.js or data files |
| `i18n-browser.js --mode switch,layout`, langs=16 | PASS on 14 of 16 pages: Cayley, CRT, DH, ECDH, Wheel, Euclid, Totient, Fermat, Isomorphism, RSA, Shor, Sieve, Square and Multiply, index. Factor Tree and Venn fail on the pre-existing issues below (their layout gate passes; Venn's layout result was not separately captured) |
| Regression screenshots (1280x1400 hub and Sieve in he; 375x900 and 1280x700 open-menu header in he) | clean: header mirrored, active-link bar on the right edge, theme switch unmirrored, Sieve grid starts at 1 top-left as in English, no overlap or clipping |

## Known pre-existing, non-Hebrew gate failures (not fixed, not caused by this task)

1. **Factor Tree browser-diff scenario `classic-n-abc`** (`.planning/phases/07-shared-js-module-refactor/browser-diff/factor-tree.json`) targets `#numInput`, but the page uses `#addInput`. `i18n-browser.js --mode switch` therefore reports `NEW-ERRORS classic-n-abc ... MISSING-SELECTOR #numInput` for every language (he included, so it is not a Hebrew defect). Confirmed at baseline 42ae6fa: that page has `id="addInput"` and no `id="numInput"`; the scenario file dates from commit ed6aef3 (07-06).
2. **Venn `lcm-step`**: the hidden `#lcm-step` paragraph keeps its pre-switch text after a language switch (a DIRECT load shows e.g. "Stap 1 van 3" while the SWITCHED page does not), flagged at the `clear` point by `--mode switch` for every language. **Confirmed at baseline 42ae6fa**: running the current harness against a `git archive 42ae6fa` copy reproduces the identical DIFF for all 15 baseline languages (the baseline's own i18n-check.js cannot load because of the dangling `checkSiteFooter` export, repaired in Task 1; he is not in the baseline tree). The `renderLcmText` code path is unchanged by this task (the Venn page diff is +17 lines, only the switcher option and the RTL rule).

## Deviations from Plan

- **[Rule 1/consistency, orchestrator-directed] Cross-batch term fixes and glossary consolidation** as described under Task 5 A/B; plan Task 5 step 3 anticipated glossary drift, and the parallel Tasks 2-4 could not edit the glossary.
- **Browser sweep ran per page, not only per task**: Task 5 re-ran switch/layout on all 16 pages (a sweep over the whole site was slow, about 25+ minutes under load, and had to be split in two runs).
- Otherwise: none beyond what the earlier tasks recorded.

## Known RTL gaps

None recorded by Tasks 2-4 beyond the selectors above. No page script was modified.

## Known Stubs

None.

## Threat Flags

None. No new network endpoints, auth paths or storage keys; `iw` is rejected on every channel except browser detection (T-pks-01), `dir` is the constant `rtl` or removed (T-pks-02), bidi controls are limited to balanced isolates (T-pks-03).

## Leftover

- Hebrew values are tagged `[ASSUMED]` in the glossary; the optional spot-check by a Hebrew reader of the Euclid and RSA pages (plan human-check) has not been done.
- `i18n-browser.js` `langs` and `en-parity` modes remain stale (theme-follows-OS since 261003-nkr), as the plan already noted; not used or repaired.
- The two pre-existing failures above remain open.

## Self-Check: PASSED

- Commits 4ad135c, c3c5712, c1cb973, b2aae87, 0b3f332, 472a6a2 all reachable from HEAD; `git rev-list --count 42ae6fa..HEAD` = 6.
- Final sweep above passed apart from the two documented pre-existing items; no unrelated files staged (`.planning/config.json` and the untracked directories untouched).
