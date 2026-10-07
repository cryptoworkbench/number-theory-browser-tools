---
phase: quick-261007-pbf
plan: 01
subsystem: i18n
tags: [i18n, zh, ja, ko, cjk, simplified-chinese, plural-other, han-form, fullwidth, digit-parity]
requires:
  - phase: quick-261007-k4o
    provides: twenty-one languages, per-batch translation and unification workflow, DIGIT_PARITY_LANGS
  - phase: quick-261007-fhx
    provides: non-Latin script rule shape, new plural shape and new character findings in i18n-check.js
provides:
  - zh (Simplified Chinese), ja and ko as the 22nd-24th supported languages, left to right, on all 16 pages
  - single-category {other} plural shape accepted by the engine and by i18n-check.js
  - CJK gate tooling in i18n-check.js (script rules with cross-guards, FULLWIDTH-FORM, FULLWIDTH-FORMULA, CJK-MYRIAD, HAN-FORM, digit parity)
  - zh/ja/ko values for every key of all 18 namespaces (943 keys x 3 languages), 13 plural keys as {other}
  - CJK contracts, term and name columns and a 61-row supplementary terms table in 06-GLOSSARY.md
affects: [every future new tool and every future new language]
tech-stack:
  added: []
  patterns:
    - "Language-count change = SUPPORTED_LANGS line + SWITCHER_OPTIONS entries + three option lines per page + data blocks"
    - "Single-category plural languages listed in PLURAL_OTHER_ONLY_LANGS, expectedPluralCategories returns [other]"
    - "Tokenise by script runs for unspaced languages; CJK scripts deliberately not counted by SCRIPT-MIXED"
key-files:
  created: []
  modified:
    - assets/nt-i18n.js
    - assets/site.css
    - .planning/phases/06-multi-language-support/i18n-check.js
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md
    - assets/i18n/site.js
    - assets/i18n/sieve-of-eratosthenes.js
    - assets/i18n/hub.js
    - assets/i18n/factor-tree.js
    - assets/i18n/venn-diagram.js
    - assets/i18n/fermats-method.js
    - assets/i18n/euclidean-algorithm.js
    - assets/i18n/chinese-remainder-theorem.js
    - assets/i18n/equivalence-wheel.js
    - assets/i18n/eulers-totient.js
    - assets/i18n/cayley-table.js
    - assets/i18n/group-isomorphism.js
    - assets/i18n/square-and-multiply.js
    - assets/i18n/diffie-hellman-key-exchange.js
    - assets/i18n/elliptic-curve-diffie-hellman.js
    - assets/i18n/rsa.js
    - assets/i18n/shors-algorithm.js
    - index.html and the 15 tool pages (three switcher option lines each)
    - CLAUDE.md, .claude/CLAUDE.md, .planning/PROJECT.md, .planning/REQUIREMENTS.md, .planning/codebase/{STACK,CONVENTIONS,ARCHITECTURE,CONCERNS,STRUCTURE,TESTING}.md
decisions:
  - "zh = Simplified Chinese; every Chinese browser tag resolves to zh, code allow-list stays exact"
  - "ja uses shinjitai only, ko uses Hangul only; HAN-FORM guards zh and ja against the wrong standard"
  - "notWord differs per file where the sentence frame needs a different negation (ja dh/ecdh 決して vs rsa ではありません; ko 절대로 vs 아닙니다), recorded as a deliberate UNIFY note"
  - "Tools menu button gets white-space: nowrap for zh/ja/ko (CJK min-content is one character, so Japanese ツール wrapped at 375px)"
metrics:
  duration: "2h02m"
  completed: 2026-10-07
status: complete
actuals:
  tokens: 67463
  tasks: 7
  commits: 7
commits: 7
plan_head_before: 22790dc77cd0048cbf0abe7addd2424f9a83f746
plan_head_after: c463c1f2005748fcff5192f87e68c3a50307c763
---

# Phase quick-261007-pbf Plan 01: Chinese, Japanese and Korean Summary

Simplified Chinese, Japanese and Korean are the twenty-second to twenty-fourth supported languages on all 16 pages: two engine lines, a CJK-aware gate (`i18n-check.js`), three switcher lines per page, three CSS lines, 943 keys x 3 languages of dictionary data, glossary contracts and living docs.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 (tracer) | 76f5d33 | feat: engine, gate tooling and site/common/sieve dictionaries |
| 2 | 5da5cb2 | feat: hub, Factor Tree, Venn, Fermat |
| 3 | 6e239bc | feat: Euclid, CRT, Wheel, Totient, Cayley, Isomorphism |
| 4 | e75e8b5 | feat: Square-and-Multiply, Diffie-Hellman, ECDH |
| 5 | 0f7c543 | feat: RSA, Shor |
| 6 | 9fccfd0 | fix: unify terms across batches (plus glossary (c), (d), supplementary table) |
| 7 | c463c1f | docs: twenty-four languages across the living docs |

`commits: 7` is measured (`git rev-list --count 22790dc..HEAD`). The orchestrator commits this SUMMARY, the PLAN and `cjk-gate.js` separately.

## What was built

- Engine (`assets/nt-i18n.js`): exactly two lines changed, `'zh', 'ja', 'ko'` appended to `SUPPORTED_LANGS` and the registry comment extended with the `{ other }` shape. `detectDefaultLang` and `resolveTemplate` are byte-identical: the existing lowercased two-letter prefix maps zh-Hant-TW, zh_Hant_MO, ZH_tw, ja-JP, KO_kr; the exact case-sensitive allow-list rejects zh-CN, zh-Hans, ZH, zho, ja-JP, KO, kor and the rest on every channel.
- Checker (`i18n-check.js`): SWITCHER_OPTIONS entries, `PLURAL_OTHER_ONLY_LANGS`, `SCRIPT_RULES.zh/ja/ko` with the cross-guards (ru/el/he/hi/ar now also reject Han, kana, Hangul), `FULLWIDTH-FORM` (every language), `cjkFindings` (`FULLWIDTH-FORMULA`, `CJK-MYRIAD`, `HAN-FORM`), `DIGIT_PARITY_LANGS` with zh/ja/ko, 99 new `--api` and 34 new `--persistence` assertions (the five Japanese "unsupported" examples retargeted to Thai).
- Pages: `<option value="zh" lang="zh">中文</option>`, `ja` 日本語, `ko` 한국어 after Kiswahili on all 16 pages; nothing else in page code changed (PAGE-CODE gate).
- CSS (`assets/site.css`, one comment line and three one-line rules): upright-bold `<em>` and Korean `word-break: keep-all` as planned, plus `white-space: nowrap` on `.site-menu-toggle` for zh/ja/ko (see Deviations).
- Data: zh, ja, ko last in every register call of the 17 data files, en key order, `{other}`-only plurals, ASCII digits identical to English, headers say twenty-four languages.
- Glossary: per-language contracts, (b)/(c)/(d)/(f) columns, (e) sentence, and a 61-row supplementary terms table, every row verified to occur in its namespaces.
- Docs: ten living docs at twenty-four languages with the zh/ja/ko detection, plural, script, digit, punctuation and CSS rules; page/tool/nav counts stay 16.

## Gates run (final state)

| Gate | Result |
|------|--------|
| `i18n-check.js --all` | coverage, header, includes, no-locale-number-format, literals-markup, literals-js all PASS on 16 pages, zero findings |
| `--switcher-present --all` | PASS 16 pages |
| `--api` | PASS 676 assertions (577 at baseline, threshold 640) |
| `--persistence` | PASS 363 assertions (329 at baseline, threshold 345) |
| `--smoke` | PASS 123 assertions (mutant detected, cross-session OK) |
| `shadow-check.js --all` | exit 0; `--docs`: 8 MIRROR-DRIFT (the 8 pre-existing, none added) |
| GATE engine / checker | ENGINE-CJK bad=0, CHECKER-CJK bad=0 |
| GATE batch (all 17 data files) | CJK-BATCH bad=0 (every pre-existing language block equals 22790dc; ja prose=845, sharedWithZh=4 of 845) |
| GATE unify | bad=0, divergent=0, 2 notes (see below) |
| GATE glossary / pagecode / config | bad=0 / bad=0 (files=26, cjkRuleLines=4) / bad=0 |
| RAW-INVISIBLE grep | none in any data file, i18n-check.js, nt-i18n.js, site.css |
| GATE sweep (`i18n-browser.js switch,layout`, langs=23) | all 16 pages OK in the Task 6 full run: 14 pages `switch PASS` + `layout PASS`, Factor Tree and Venn the known 23 lines each plus `layout PASS` (each page also swept in its own task) |

Every task's own gates were also run before its commit (coverage with only the not-yet-translated namespaces outstanding, `--header --includes --no-locale-number-format --literals`, batch, pagecode, config, RAW grep, the DH-title-drift script in Task 4, the sweeps).

## Visual proof

Headless-Chrome screenshots (read by the executor) of the Sieve, Venn, Factor Tree, Fermat, Euclid, CRT, Wheel, Totient, Cayley, Isomorphism, Square-and-Multiply, DH, ECDH, RSA, Shor and the hub in zh, ja and ko at 1280 px, plus Sieve/Venn/Cayley/DH/RSA/hub at 375 px and the open Tools menu in all three languages at 1280 and 375: CJK glyphs render (Noto CJK in system fallback), emphasis is upright bold (RSA and DH introduction), Korean wraps between words, diagrams, grids, inputs and formulas are unchanged from English. Defects found and fixed in shots: Japanese `ツール` wrapping inside the 34 px Tools button at 375 px (CSS line below), the Japanese ladder row caption `{rows}ビット中{i}ビット目——2^{place}` overflowing its SVG box (reworded to `ビット{i}/{rows}・2^{place}`).

## Terms coined and how Task 6 unified them

The coined terms are listed in the Task 2-5 commit messages and consolidated in the glossary's "Chinese, Japanese and Korean supplementary terms" table (61 rows). Task 6 changes (zh/ja/ko values only, all gates re-run, then the full sweep):

- Units of a group: ja `単位` and ko `단위` (hub card, wheel heading, iso lede/captions) became 可逆元 / 가역원 per D-TERMS 20; zh `单位等价类` became `可逆元的等价类`.
- Japanese order finding: `位数の探索` became `位数発見` (D-TERMS 49) in six Shor values; `位数の探索` stays only where English says "order search" (exhausted label, budget reasons), matching zh `求阶搜索` and ko `위수 탐색`.
- Korean particles: nine values where the particle followed a parenthesis, digit or Latin token whose reading selects the other form were restructured or corrected (`(QFT)로/를`, `(mod φ(n))이`, `(e, n)을`, `gcd({A}, {B}) 기준으로`, `… 값을`, `필요함)이`, etc.). Every `Latin token + particle` and `) + particle` in the ko block was audited against its Korean reading.
- UNIFY notes kept deliberately (one-word values whose sentence frames differ): `notWord` is ja `決して` in dh/ecdh versus `ではありません` in rsa, ko `절대로` versus `아닙니다` (the rsa frame completes a copula after "the problem behind RSA"; the dh frame is an adverb).

No D-TERMS substitution was made. Sixteen glossary (c) cells (for example cyclic group, plaintext, binary expansion) have no occurrence in any of the 18 namespaces because the English text never uses the term; they stay as pinned.

## Deviations from Plan

**1. [Rule 1 - Gate defect] cjk-gate.js header detection.** `batch` read the data-file header as everything before `NT.i18n.register`, but every header comment mentions `NT.i18n.register(...)` itself, so the "{ other }" plural sentence (and sometimes the count word) lay beyond the cut. Fixed in the gate (one line): the header is everything before `(function`.

**2. [Rule 1 - Gate defect] cjk-gate.js JA-SPACING.** The rule flagged the leading legend slot `{0} 素数`, which D-SPACING itself says keeps its space as in English. Fixed in the gate (one line): a leading `{N} ` slot is removed before the spacing test.

**3. [Rule 2 - Missing functionality, CSS] Tools menu button no-wrap.** At 375 px the Japanese label ツール wrapped to two lines inside the fixed-height menu button (CJK text has a one-character min-content width, English "Tools" has the whole word). Wording cannot fix it (the label is pinned by D-TOOLS), so one rule was added to `assets/site.css`: `:root[lang="zh"] .site-menu-toggle, :root[lang="ja"] .site-menu-toggle, :root[lang="ko"] .site-menu-toggle{ white-space: nowrap; }`. This is one more one-line CJK-scoped rule than L-NOCODE/D-CLIP list (PAGE-CODE reports cjkRuleLines=4, the comment plus three rules, instead of 3); the CLAUDE.md sentence mentions it.

**4. [Rule 1 - Text] SCRIPT-MIXED false positives in unspaced Japanese.** A Latin letter and a Greek letter in one kana-joined run (`Eveはφ(n)`, `eはφ(n)`) are flagged because letter runs span kana. Per the plan SCRIPT-MIXED must keep counting only Latin/Cyrillic/Greek/Hebrew/Devanagari/Arabic, so the five Japanese sentences were reworded with a comma between the Latin and Greek letter (wheel.noteMultiplicative, totient.caption, rsa.eveNeedsPhi, rsa.msgHintChooseE, rsa.resWinBody). No checker change.

**5. [Rule 1 - Text] Other gate-driven rewordings.** DIGIT-PARITY forced words for zero in euclid (ja 零/ゼロ, ko 영) where English writes "zero"; FULLWIDTH-FORM rejected the full-width solidus U+FF0F and full-width parentheses around placeholder-only content in ja (ASCII `/` and `()` used); JA-NO-KANA required a kana in four all-kanji headings (`離散対数の問題`, `RSAの問題 ≠ 離散対数の問題`, `公開値（参考のため）`, `{count}個の要素`); the Latin-only parenthetical rule moved `（N）`, `（1）` and `({ordWord}(G) = {n})` to ASCII parentheses.

**6. [Info] Config.** No `i18n-config/*.json` file changed (CONFIG bad=0); no D-SAME deviation was needed.

No auth gates occurred. No architectural (Rule 4) decision was needed.

## Pre-existing browser-gate items carried forward

Factor Tree prints one `switch NEW-ERRORS classic-n-abc <lang> [...MISSING-SELECTOR #numInput...]` line per non-English language (now 23) and Venn one `switch DIFF at clear <lang>: html differs ... id="lcm-step"` line per language (now 23); both pages' layout mode passes. Neither was caused or fixed here.

## Known Stubs

None. No stub, placeholder text or hard-coded empty value was introduced; every key of every namespace has a real zh, ja and ko value.

## Threat Flags

None. No new network endpoint, auth path, file-access pattern or schema; values reach the DOM only as text nodes through the existing path (PAGE-CODE gate), and the allow-list stays exact and case-sensitive (T-pbf-01..05 mitigations hold: DICT-MARKUP, BIDI-MARK, ZERO-WIDTH, FULLWIDTH-FORM, RAW-INVISIBLE grep, DICT-CHANGED batch gate, at most two concurrent sweeps).

## Self-Check: PASSED

- Files: assets/nt-i18n.js, assets/site.css, i18n-check.js, 06-GLOSSARY.md, assets/i18n/site.js, rsa.js, shors-algorithm.js, Venn Diagram/venn-diagram.html found.
- Commits: 76f5d33, 5da5cb2, 6e239bc, e75e8b5, 0f7c543, 9fccfd0, c463c1f are ancestors of HEAD.
- `git diff --quiet HEAD -- assets '*.html' .planning/phases/06-multi-language-support` is clean; `git status` shows only the pre-existing `.planning/config.json` modification among tracked files.
