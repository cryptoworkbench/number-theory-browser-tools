---
phase: quick-261007-fhx
plan: 01
subsystem: i18n
tags: [i18n, arabic, rtl, ar, translation, gate-tooling, glossary]
requires:
  - phase: quick-261006-vpp
    provides: eighteen-language engine, digit-parity and script rules, Hindi batching pattern
  - phase: quick-261006-pks
    provides: right-to-left engine, dir="rtl" CSS islands, bidi isolates and checker
provides:
  - Arabic (ar, Modern Standard Arabic, right-to-left) as the nineteenth supported language on all 16 pages
  - gate tooling for a second RTL language, a six-category plural language and an Arabic-script language
  - Arabic glossary contract, term columns and supplementary terms table
affects: [i18n, nt-i18n, i18n-check, glossary, living-docs]
tech-stack:
  added: []
  patterns:
    - "ar appended to SUPPORTED_LANGS and RTL_LANGS (two array tokens); detection reuses the existing lowercased two-letter path"
    - "Arabic script rule: Script=Arabic own/foreign patterns, Script_Extensions=Arabic in SCRIPT-MIXED so harakat and tatweel cannot hide a glued Latin letter"
    - "Arabic-only CSS: letter-spacing reset for h1 (site.css) and Fermat's .result, scoped to :root[lang=ar]"
key-files:
  created: []
  modified:
    - assets/nt-i18n.js
    - assets/site.css
    - .planning/phases/06-multi-language-support/i18n-check.js
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md
    - assets/i18n/site.js
    - assets/i18n/hub.js
    - assets/i18n/sieve-of-eratosthenes.js
    - assets/i18n/factor-tree.js
    - assets/i18n/venn-diagram.js
    - assets/i18n/euclidean-algorithm.js
    - assets/i18n/chinese-remainder-theorem.js
    - assets/i18n/fermats-method.js
    - assets/i18n/equivalence-wheel.js
    - assets/i18n/eulers-totient.js
    - assets/i18n/cayley-table.js
    - assets/i18n/group-isomorphism.js
    - assets/i18n/square-and-multiply.js
    - assets/i18n/diffie-hellman-key-exchange.js
    - assets/i18n/elliptic-curve-diffie-hellman.js
    - assets/i18n/rsa.js
    - assets/i18n/shors-algorithm.js
    - index.html (and the 15 tool pages: switcher option, RTL comments; Fermat's Arabic rule)
    - CLAUDE.md
    - .claude/CLAUDE.md
    - .planning/PROJECT.md
    - .planning/REQUIREMENTS.md
    - .planning/codebase/STACK.md
    - .planning/codebase/CONVENTIONS.md
    - .planning/codebase/ARCHITECTURE.md
    - .planning/codebase/CONCERNS.md
    - .planning/codebase/STRUCTURE.md
    - .planning/codebase/TESTING.md
key-decisions:
  - "Engine change is two tokens ('ar' in SUPPORTED_LANGS, RTL_LANGS = ['he','ar']); no :root[dir=rtl] rule changed, so Hebrew is untouched"
  - "Arabic values are unvocalized MSA, ASCII digits with the English numerals, six-category plurals, isolates mirrored from the he values"
  - "Slot frames ({word}, {roles}, {verbing}, {ordWord}, Venn link labels) written with definite nouns / verbal nouns / a free word so no agreement or proclitic-on-placeholder is needed"
  - "Keyboard keys Enter/Space/Delete spelled out in Arabic (a Latin key name would break the script rule)"
status: complete
metrics:
  duration: ~115 minutes
  completed: 2026-10-07
  tasks: 6
  files: 47
actuals:
  tokens: 78000
  tasks: 6
  commits: 6
plan_head_before: 5fa0704f85e73d588cb113a7349b87352e069c14
plan_head_after: e13d3374dda963af3d5106e7b31c567cb33e0c27
commits: 6
---

# Phase quick-261007-fhx Plan 01: Arabic as the nineteenth supported language Summary

Arabic (ar, Modern Standard Arabic, right-to-left) now works on all 16 pages: a complete Arabic value for every key of all 18 namespaces (943 keys, 13 six-category plural keys), the engine and gate tooling extended to a second RTL language and an Arabic-script language, an Arabic glossary contract, and the living docs moved to nineteen languages.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 (tracer) | 0daa3cd | feat: Arabic engine, gate tooling and site/common/sieve dictionaries |
| 2 | 0fd1f7b | feat: Arabic for the hub, Factor Tree, Venn, Euclid, CRT and Fermat |
| 3 | cf26de4 | feat: Arabic for the Wheel, Totient, Cayley, Isomorphism, Square-and-Multiply and Diffie-Hellman |
| 4 | 371f975 | feat: Arabic for ECDH, RSA and Shor's Algorithm |
| 5 | 8e950d9 | fix: unify Arabic terms across batches |
| 6 | e13d337 | docs: nineteen languages with Arabic across the living docs |

## What changed

- **Engine** (`assets/nt-i18n.js`): `'ar'` appended to `SUPPORTED_LANGS`, `RTL_LANGS = ['he', 'ar']`; header and RTL comments say Hebrew and Arabic. ENGINE-CODE gate proves the diff is comments plus those two array lines. Detection (ar, ar-EG, AR_sa, ar-001 -> ar; en-AE stays en; fa-IR/ur-PK not mapped) goes through the existing two-letter path; `setLang`, `?lang=`, cookie and storage reject ar-EG, AR, ara, ar-SA.
- **Checker** (`i18n-check.js`): switcher option, `RTL_LANGS` he+ar, `PLURAL_EXTRA_CATEGORIES.ar`, `SCRIPT_RULES.ar` (and Arabic added to the foreign pattern of ru, el, he, hi), Arabic-aware `SCRIPT-MIXED`, new `NATIVE-SEPARATOR`, `TASHKEEL`, `TATWEEL`, `PRESENTATION-FORM`, `ARABIC-LETTER`, `DIGIT_PARITY_LANGS` hi+ar. Tests were written first and failed against the unchanged engine. `--api` grew to 515 assertions, `--persistence` to 303.
- **Switcher**: `<option value="ar" lang="ar">العربية</option>` after हिन्दी on all 16 pages.
- **CSS** (D-JOIN): `:root[lang="ar"] h1{ letter-spacing: normal; }` at the end of `assets/site.css`'s RTL section and `:root[lang="ar"] .result{ letter-spacing: normal; }` at the end of Fermat's style block. All RTL comments (site.css and 15 page style blocks) generalised to Hebrew and Arabic; no selector or declaration of any `:root[dir="rtl"]` rule changed. No font link, `@font-face` or `font-family` anywhere (L-FONT).
- **Dictionaries**: an `ar` object as the last language of every register call (site, common, hub, sieve, factorTree, venn, euclid, crt, fermat, wheel, totient, cayley, iso, sqm, dh, ecdh, rsa, shor), same key order as en, every placeholder kept, isolates (`⁦`, `⁧`, `⁩`) wherever the he value has them, header comments say nineteen and list Arabic's six plural categories where plural shapes are enumerated.
- **Glossary**: Arabic tone row and entry (all D-* rules), ar columns in (b), (c), (d), (f) (the (b) and (f) columns equal the shipped site/common values exactly), the (e) sentence, and an "Arabic supplementary terms" table (every row verified present by script).
- **Docs**: CLAUDE.md, .claude/CLAUDE.md and its mirrors (STACK, CONVENTIONS, ARCHITECTURE), PROJECT.md, REQUIREMENTS.md (I18N-01/03/04/05/06), CONCERNS.md, STRUCTURE.md, TESTING.md. Every statement about 16 pages/tools/nav links stays 16.

## Gates run (all passing unless noted)

- **Task 1**: ENGINE-AR bad=0, ENGINE-CODE ok, CHECKER-AR bad=0, `--api` (515) / `--persistence` (303) / `--smoke`, `--header --switcher-present --includes --no-locale-number-format --literals --all`, shadow-check `--all`, coverage (only the 15 then-missing namespaces), AR-BATCH bad=0, GLOSSARY-ar bad=0, PAGE-CODE bad=0 (17 files), no font change, Sieve `switch PASS langs=18` + `layout PASS`.
- **Tasks 2-4**: coverage report clean for the batch's namespaces, header/includes/locale/literals, AR-BATCH bad=0 (no non-ar value changed vs 5fa0704, no avoided spelling, no ASCII punctuation glued to Arabic, every he isolate mirrored), PAGE-CODE bad=0, `switch PASS langs=18` + `layout PASS` on every page (Factor Tree and Venn only with their documented pre-existing lines, below).
- **Task 5**: `i18n-check.js --all` pass, AR-BATCH bad=0 over all 17 data files, glossary drift check bad=0, full browser sweep of all 16 pages. One flake: with three sweeps running in parallel the Diffie-Hellman layout run hung in headless Chrome (NO-OUTPUT for hu and hi, after switch PASS); I killed that run and re-ran Diffie-Hellman and ECDH alone, both `switch PASS langs=18` + `layout PASS` (the same page had passed in Task 3).
- **Task 6**: `--all`, `--switcher-present --all`, `--api`, `--persistence`, `--smoke`, shadow-check `--all` pass; `shadow-check.js --docs` reports 8 MIRROR-DRIFT (the 8 pre-existing, none added); no `eighteen` left in living docs or data files; PAGE-CODE bad=0.

## Visual proof

Arabic, Hebrew and English screenshots of all 16 pages (default load, 1280x1400, headless Chrome with the system Arabic fallback font) plus the open Tools menu at 1280x700 and 375x900 were read. Arabic mirrors exactly like Hebrew (brand on the right, Tools/language/theme on the left, theme switch unmirrored, right-aligned prose), letters are joined, nothing clipped, and every SVG diagram, number grid/table, numeric input, slider and formula keeps the English orientation (Sieve grid starts at 2 top-left, Cayley table, wheels, Venn circles, Euclid squares, CRT strips, Fermat geometry, RSA/DH diagrams, ECDH curve, Shor cycle).

## D-CLIP

No D-CLIP fix was needed: nothing clipped or overlapped in Arabic. Arabic pages are a few tens of pixels taller than English because of line height; the layout gate (ar no wider than English + 8px at 375px) passed on all 16 pages.

## Known RTL gaps shared with Hebrew

- On the Diffie-Hellman page the "Eve — tapping the wire" label sits on the dotted tap line in both Hebrew and Arabic (same element, same position as Hebrew); `:root[dir="rtl"]` rules were deliberately not touched.

## Terms coined and how Task 5 unified them

- Task 2: palette اللوحة, bin السلة, composition/factorization area منطقة التركيب/التحليل, region المنطقة, lens عدسة, nested squares مربعات متداخلة, collapsed tile بلاطة, Bézout coefficients معاملات بيزو, pairwise coprime أولية فيما بينها مثنى مثنى, span المدى, search log سجل البحث, trivial pair الزوج البديهي, Randomize توليد عشوائي, Run تنفيذ, slider شريط تمرير, key names مفتاح الإدخال/المسافة/الحذف.
- Task 3: addend المضاف, sum المجموع, product حاصل الضرب, wedge قطاع, own negative/reciprocal معكوس نفسه الجمعي/الضربي, subgroup زمرة جزئية, accumulator المراكم, ladder السلم, scalar عدد قياسي, tap وصلة التنصت, safe prime عدد أولي آمن, primitive root جذر بدائي.
- Task 4: scatter plot مخطط نقطي, singular curve منحنى شاذ, tangent/chord المماس/الوتر, Hasse bound حد هاسه, textbook RSA RSA بصيغتها الدراسية, trial division القسمة التجريبية, Garner's formula صيغة غارنر, continued fraction الكسر المستمر, quantum phase estimation تقدير الطور الكمومي, superposition تراكب, order finding إيجاد الرتبة, classical pre-checks الفحوص الكلاسيكية المسبقة.
- Task 5: a word-frequency pass and an identical-English-string comparison across all 18 namespaces found only two divergences, both fixed: ECDH `logHeading` ("Arithmetic log") and `bannerReady` now equal the DH/Square-and-Multiply renderings. The remaining differences are intentional (isolate placement mirrored from he; the full gcd noun versus the ق.م.أ label per D-GCD). The glossary table lists every coined term with the namespaces where it was verified.

## Pre-existing browser-gate items carried forward (not caused or fixed here)

- Factor Tree: `switch NEW-ERRORS classic-n-abc <lang> [...MISSING-SELECTOR #numInput...]`, now 18 lines (one per non-English language). Layout PASS.
- Venn: `switch DIFF at clear <lang>: html differs ... id="lcm-step"`, now 18 lines. Layout PASS.

## Deviations from Plan

None - plan executed as written. Notes: (1) the headless Chrome hang in the parallel Task 5 sweep is a harness flake handled by the plan's own "rerun a failing page alone" rule (and I had to kill the stale Chrome the hung run left behind); (2) no native Arabic reader reviewed the translations: all Arabic cells are tagged `[ASSUMED]` in the glossary like every other added language, and the plan's optional spot-check by an Arabic reader (Euclidean Algorithm and RSA pages) remains open.

## Known Stubs

None.

## Threat Flags

None - no new network endpoint, auth path or trust boundary; Arabic values are first-party static data rendered through the existing text-node path, and no page script was edited (PAGE-CODE gate).

## Self-Check: PASSED

- `assets/nt-i18n.js` contains `Object.freeze(['he', 'ar'])`: FOUND
- all 16 pages contain `<option value="ar" lang="ar">العربية</option>`: FOUND (16)
- every `assets/i18n/*.js` register call has an `ar` block as its last language: FOUND (AR-BATCH bad=0)
- commits 0daa3cd, 0fd1f7b, cf26de4, 371f975, 8e950d9, e13d337 are ancestors of HEAD: FOUND
