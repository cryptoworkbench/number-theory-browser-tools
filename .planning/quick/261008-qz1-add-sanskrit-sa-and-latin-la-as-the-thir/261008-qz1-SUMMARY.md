---
phase: quick-261008-qz1
plan: 01
subsystem: i18n
tags: [i18n, sanskrit, latin, devanagari, plural-dual, checker, glossary]
status: complete
requires:
  - phase: quick-261008-k7u
    provides: twenty-nine languages, the Kurdish pattern (plan-local gate, emit/extract write path, two languages per batch)
  - phase: quick-261008-e2j
    provides: FIXED_PLURAL_LANGS for languages without CLDR plural data
  - phase: quick-261006-vpp
    provides: the Devanagari script rule, NATIVE-DIGIT, DIGIT-PARITY
provides:
  - Sanskrit (sa, Devanagari, left to right, plurals one/two/other) and Latin (la, ASCII Latin without macrons, left to right, plurals one/other) as the thirtieth and thirty-first supported languages on all 16 pages
  - engine plural rules for both (FIXED_PLURAL_LANGS plus the new FIXED_DUAL_LANGS)
  - checker rules SA-LETTER, SA-DANDA, LA-LETTER, LA-J and the Sanskrit script rule
  - glossary tone rows, entries, columns and a 72-row supplementary terms table
  - living docs at thirty-one languages
affects: [i18n, glossary, living-docs]
actuals:
  tokens: 80473
  tasks: 6
  commits: 6
plan_head_before: fde43bd6ff8fb996d1571c5ef121dd606f8c2ed1
plan_head_after: f72713741e0f8636329622297d68298f5792068b
tech-stack:
  added: []
  patterns: [engine-fixed dual (FIXED_DUAL_LANGS) beside FIXED_PLURAL_LANGS, per-language letter-repertoire finding ported from the plan-local gate]
key-files:
  created: []
  modified:
    - assets/nt-i18n.js
    - .planning/phases/06-multi-language-support/i18n-check.js
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md
    - assets/i18n/site.js
    - assets/i18n/hub.js
    - "assets/i18n/<the 15 tool dictionaries>.js"
    - "the 16 pages (two switcher option lines each)"
    - "CLAUDE.md, .claude/CLAUDE.md, .planning/PROJECT.md, .planning/REQUIREMENTS.md, .planning/codebase/{STACK,CONVENTIONS,ARCHITECTURE,CONCERNS,STRUCTURE,TESTING}.md"
key-decisions:
  - "Sanskrit and Latin both go through the engine's fixed plural rule (Intl has no sa or la data and would fall back to the runtime default locale); only Sanskrit also selects two for exactly 2"
  - "Detection needs no new branch: sa, sa-IN, san and la, la-VA, lat reach their codes through the existing two-letter fallback; the collisions are recorded and asserted"
  - "A word-final m before a placeholder, numeral or Latin token stays म् (D-ORTHO-SA); the glossary and docs write modulo n as मापाङ्कम् n अनुसृत्य"
metrics:
  duration: one long session
  completed: 2026-10-08
---

# Phase quick-261008-qz1 Plan 01: Sanskrit and Latin as the thirtieth and thirty-first languages Summary

Sanskrit (`sa`, labelled संस्कृतम्) and Latin (`la`, labelled Latina) now work on all 16 pages: the switcher lists them directly after کوردی, every key of all 18 namespaces has an independent Sanskrit and Latin value, the engine selects Sanskrit's dual correctly with or without `Intl`, the checker permanently enforces both alphabets and both plural shapes, and the living docs say thirty-one languages.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 (tracer) | 34e54a2 | feat(quick-261008-qz1): Sanskrit and Latin engine, checker, switcher and site/common/sieve dictionaries |
| 2 | 7cbad22 | feat(quick-261008-qz1): Sanskrit and Latin for the hub, Factor Tree, Venn, Fermat, Euclid and CRT |
| 3 | d499b6e | feat(quick-261008-qz1): Sanskrit and Latin for the Wheel, Totient, Cayley, Isomorphism, Square-and-Multiply and Diffie-Hellman |
| 4 | 191dc4f | feat(quick-261008-qz1): Sanskrit and Latin for ECDH, RSA and Shor's Algorithm |
| 5 | 9f3c4c1 | fix(quick-261008-qz1): unify Sanskrit and Latin terms across batches |
| 6 | f727137 | docs(quick-261008-qz1): thirty-one languages with Sanskrit and Latin across the living docs |

`commits: 6` is measured (`git rev-list --count fde43bd..HEAD`). The gate script, PLAN.md and this SUMMARY are left for the orchestrator to commit.

## What was built

- **Engine** (`assets/nt-i18n.js`): exactly the five pinned edits: `sa`, `la` appended to `SUPPORTED_LANGS`, both added to `FIXED_PLURAL_LANGS` (comment updated), the new `FIXED_DUAL_LANGS = ['sa']`, and `pluralCategory`'s `two`-for-exactly-2 branch. `valid()`, detection, `RTL_LANGS` and every other line are untouched (ENGINE-CODE accepts only these lines).
- **Pages**: two option lines (`sa`, `la`) after the `ckb` option on all 16 pages; no CSS, font or script change (PAGE-CODE).
- **Checker** (`i18n-check.js`): switcher entries, `DIGIT_PARITY_LANGS`, `FIXED_PLURAL_LANGS`, `FIXED_DUAL_LANGS` (with `two` added in `expectedPluralCategories` and a `PLURAL-CATEGORIES` guard), `SCRIPT_RULES.sa` (mirroring Hindi), `saLetterFindings` (SA-LETTER, SA-DANDA), `laLetterFindings` (LA-LETTER, LA-J), all wired into `checkDictionaries` and exported, plus detection, rejection, transition, persistence, link-decoration and plural assertions (real, Russian-like and absent `Intl`).
- **Dictionaries**: sa then la as the last two blocks of all 18 namespaces (17 data files), written only through the gate's emit path (key set, plural shape, placeholders and NFC validated; no isolate or invisible character possible), header comments say thirty-one.
- **Glossary**: Sanskrit and Latin tone rows and entries, sa/la columns in (b), (c), (d), (f), the (e) sentence and a "Sanskrit and Latin supplementary terms" table (70 rows, each stem verified against the named namespaces).
- **Docs**: ten living docs at thirty-one languages (counts of 16 pages/tools/nav links unchanged).

## Gates run (final state, after Task 6)

| Gate | Result |
|------|--------|
| `sala-gate.js selftest` / `engine` / `checker` | bad=0 / bad=0 / bad=0 |
| `i18n-check.js --api` | PASS, 1292 assertions (1071 at fde43bd; threshold 1200) |
| `i18n-check.js --persistence` | PASS, 561 assertions (501 at fde43bd; threshold 530) |
| `i18n-check.js --smoke` | PASS, 123 assertions, mutant detected, cross-session run OK |
| `i18n-check.js --all`, `--switcher-present --all` | all PASS (coverage, header, includes, no-locale-number-format, literals-markup, literals-js, switcher-present: 16 pages) |
| `shadow-check.js --all` | PASS; `--docs` MIRROR-DRIFT 8 (the same 8 pre-existing findings) |
| `sala-gate.js batch` over all 17 data files | bad=0; STATS `sa own=506/528 prose=684 sameHi=1 hiOverlap=0/428 | la own=421/515 prose=920 maxShared=[it 9, pt-BR 3]` |
| `pinned`, `unify`, `glossary`, `docs`, `pagecode`, `config` | bad=0 each (unify: divergent=0, notes=0) |
| RAW-INVISIBLE grep over `assets/i18n/*.js` | none |
| `git diff --quiet HEAD -- assets '*.html' .planning/phases/06-multi-language-support` | clean |
| `sala-gate.js sweep` (`i18n-browser.js --mode switch,layout`, langs=30) | all 16 pages: switch PASS points=1 or 2 langs=30 and layout PASS; Factor Tree and Venn only with their 30 documented pre-existing lines each |

Sweep timings per page ranged from about 150 s (Factor Tree) to about 920 s (Cayley Table, under load).

## Visual proof

- `sala-gate.js font`: `FONT sanskrit=present Droid Sans Devanagari; FreeSans; Noto Sans Devanagari; Noto Serif Devanagari`.
- Sanskrit screenshots at 1280x1400 for all 16 pages (hub, Sieve, Factor Tree, Venn, Euclid, CRT, Fermat, Wheel, Totient, Cayley, Isomorphism, Square and Multiply, Diffie-Hellman, ECDH, RSA, Shor) plus 375x900 for the Sieve, Venn, Cayley, RSA and the open Tools menu at 1280x700 and 375x900: every conjunct, visarga, virama, avagraha and vocalic vowel drew in real glyphs; no missing-glyph box was found; every page headline is unbroken. Latin screenshots read correctly at 1280x1400 for the Sieve, Factor Tree, Square and Multiply, ECDH and Shor, the open Tools menu at 1280x700, and at 375x900 for the Sieve, hub, RSA and Venn. In both languages every SVG diagram, number grid, input, slider and formula is unchanged from English; nothing clipped or overflowed.
- No headline gap shared with Hindi was observed, so none is recorded.

## Terms coined and unification

Each batch commit body lists the terms it coined (English to sa | la). Task 5 ran the gate's `unify` (divergent=0, notes=0: every repeated English value has exactly one Sanskrit and one Latin rendering) and the corpus counts. Per-language changes made in the unification pass and during the batches:

- sa: the Hindi-flavoured postposition द्वारा in `iso.formula` became उपायेन (Task 5).
- sa and la: prose uses of the literal `gcd` in `shor` (check, via-gcd, recovered-factor, lucky-gcd, post-processing labels) were replaced by महत्तमसमापवर्तक(ः) / divisor communis maximus in Task 4 (D-GCD) before that commit; only formula uses of `gcd(` remain.
- Shared palette vocabulary (11 values) is identical in `factorTree` and `venn` in both languages; the names Alice, Bob, Eve stay Latin and the eponyms follow D-NAMES.
- The supplementary table in the glossary lists the coined terms and the "also" terms with verified namespaces.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Chrome could not start from the plan's CACHE path**
- **Found during:** Task 1 sweep (every page printed NO-OUTPUT)
- **Issue:** the Chromium singleton socket path `<TMPDIR>/nt-scratch-<pid>-xxxxxx/com.google.Chrome.xxxxxx/SingletonSocket` exceeded the 107-character Unix socket limit under `~/.cache/sala-gate-qz1` (`Socket path too long`).
- **Fix:** sweeps ran with `SALA_TMP` pointing at short symlinks (`/home/mainaccount/sg`, later `/home/mainaccount/s`, both to `~/.cache/sala-gate-qz1`), so all files still physically lived in the cache; both symlinks and the cache were removed at the end. The gate script was not edited.
- **Files modified:** none (environment only)

**2. [Rule 1 - Bug] `cayley.equationCaption` in Sanskrit ends with the danda**
- **Found during:** Task 3 batch gate (SA-FULLSTOP)
- **Issue:** the plan allows the four pure formula templates to stay identical to English, but the identical value ends with a full stop after a closing bracket, which the Sanskrit punctuation rule rejects.
- **Fix:** the Sanskrit value is the same formula ending in the danda (it is therefore not identical to English, which D-SAME permits); `rsa.lblQInv`, `sqm.stepSquareFormula` and `sqm.stepMultiplyFormula` stay identical.
- **Commit:** d499b6e

**3. [Rule 3 - Blocking] Venn flaked once in the full sweep**
- **Found during:** Task 5 sweep chain (`switch DIFF at place-right-29 es`, `--palette-cell` 46px against 48px, a layout-timing difference unrelated to the language data)
- **Fix:** per the plan, rerun alone; Venn passed (switch known=30, layout PASS). A third attempt that hit the socket-path limit again (seven-digit process ids) was rerun through a shorter symlink and passed.
- **Files modified:** none

### Plan wording versus shipped form (no gate impact)

- D-MOD pins "मापाङ्कं n अनुसृत्य" while D-ORTHO-SA says a word-final m before a Latin token or placeholder stays म्; the data and the glossary use मापाङ्कम् n अनुसृत्य, consistently.
- Where a slot carries an Alice or Bob placeholder whose gender cannot be known, the translations use an apposed head noun or a name-first label (D-GRAMMAR), e.g. "{0} — सार्वजनिककुञ्जिका" and "Clavis publica ({0})".

No D-TERMS term was substituted and no change was made to the gate script.

## Pre-existing browser-gate items carried forward

- Factor Tree prints one `switch NEW-ERRORS classic-n-abc <lang> [...MISSING-SELECTOR #numInput...]` line per non-English language (now 30).
- Venn prints one `switch DIFF at clear <lang>: html differs ... id="lcm-step"` line per language (now 30).
Both pages' layout mode passes, and the gate accepts exactly these 30 lines each.

## Detection collisions (threat T-qz1-02, accepted)

`sat`, `sah`, `sad`, `sag`, `sas`, `saq` now default to Sanskrit; `lad`, `lag`, `lah`, `lam`, `lav` (the ISO 639-2 Latvian; browsers send `lv`, which stays `lv`) and a bare `Latn` script subtag now default to Latin. The one existing assertion whose expectation changed is the bare-`Latn` case (en to la), and a new `Cyrl,en` to `en` case keeps its original intent. Every other previous detection result is asserted unchanged. All of this only sets a default UI language the visitor can change.

## Threat Flags

None beyond the recorded collisions above: no new endpoint, auth path, file access or schema change; values reach the DOM only as text nodes (PAGE-CODE confirms no page script changed).

## Known Stubs

None. The only two identical-to-English Sanskrit values are formula templates; for Latin the six keys whose English term is already the Latin word (`cayley.nLabel`, `wheel.nLabel`, `wheel.nRangeLabel`, `crt.modulusLabel`, `sqm.modLabel`, `dh.gLabel`) and the formula templates.

## Quality caveat

No native or scholarly Sanskrit or Latin reader reviewed any translation. Every Sanskrit and Latin cell is `[ASSUMED]`, except the Latin terms checked against la.wikipedia.org during planning (grex, numerus primus, numerus compositus, zerum, Euclides, Eulerus). The checker and the gate enforce alphabet, orthography, punctuation, placeholders, plural shape and vocabulary consistency, not correctness of the Sanskrit sandhi, case usage or Latin idiom; a human review of the two columns is advisable before treating them as final.

## Self-Check: PASSED

- Files: `assets/nt-i18n.js`, `i18n-check.js`, `06-GLOSSARY.md`, `assets/i18n/site.js`, `assets/i18n/hub.js`, `assets/i18n/shors-algorithm.js`, `index.html` and the Sieve page exist and carry the changes (`<option value="sa" lang="sa">` present on every page).
- Commits: 34e54a2, 7cbad22, d499b6e, 191dc4f, 9f3c4c1 and f727137 are all ancestors of HEAD.
- Final gates re-run after the last commit and listed above; the working tree has no uncommitted code, data, glossary or doc change (only the files the orchestrator commits and the unrelated pre-existing untracked items remain).
