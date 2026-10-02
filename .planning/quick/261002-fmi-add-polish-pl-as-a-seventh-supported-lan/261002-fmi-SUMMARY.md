---
phase: quick-261002-fmi
plan: 01
subsystem: i18n
tags: [i18n, translation, nt-i18n, polish, cldr-plural, multi-language]

requires:
  - phase: 06-multi-language-support
    provides: "NT.i18n engine, assets/i18n/ data files, i18n-check.js / i18n-browser.js gate tooling, 06-GLOSSARY.md"
  - phase: quick-261002-c77
    provides: "Italian as sixth supported language, step-for-step template this quick task followed"
provides:
  - "Polish (pl) as the seventh supported language across all 16 pages"
  - "Generalized CLDR plural engine in assets/nt-i18n.js: pluralCategory returns the raw Intl.PluralRules category; resolveTemplate selects entry[cat] with an own-property guard, falling back to entry.other — behavior-identical for nl/en/de/fr/es/it"
  - "Complete Polish dictionary in every assets/i18n/*.js namespace (site, common, hub, and 15 tool namespaces), with 11 plural values carrying the CLDR {one, few, many, other} shape"
  - "Seven-language gate tooling: i18n-check.js LANG_CODES/SWITCHER_OPTIONS/NEUTRAL_TOKENS, plus PLURAL_EXTRA_CATEGORIES/expectedPluralCategories/checkPluralEntry/pluralCategoryFindings generalizing the plural-shape gate per language"
  - "Polish terminology section in 06-GLOSSARY.md (tone/punctuation, 16 tool names, 53 core terms, proper nouns with eponym declension notes, numerals note, common-vocabulary table)"
  - "Living docs (CLAUDE.md, .claude/CLAUDE.md, PROJECT.md, REQUIREMENTS.md, ROADMAP.md Phase 4 note, codebase/*.md) updated to seven languages and the Polish plural shape"
affects: [future-i18n-work, phase-4-continued-fractions]

actuals:
  tokens: 52370
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "CLDR plural engine generalization: the collapse-to-one/other shortcut is replaced by a raw-category lookup with an own-property guard and other fallback, so a language with more than two plural categories (Polish few/many) is supported with zero special-casing in the engine, and languages that only ever populate {one, other} are unaffected because their unlisted categories simply fall through to other — exactly the old behavior."
    - "PLURAL_EXTRA_CATEGORIES explicit per-language map (not derived from Intl.PluralRules for every language) keeps the coverage gate strict without being fooled by fr/es/it's own CLDR 'many' category (1,000,000-multiples), which has no dictionary key and legitimately falls back to other."
    - "Per-key cognate exemptions (allowSame/allowRenderText) extended with a reason string naming every language the cognate applies to, rather than one exemption per language — same pattern Italian established."

key-files:
  created: []
  modified:
    - assets/nt-i18n.js
    - "all 16 .html pages (one new <option value=\"pl\"> line each)"
    - assets/i18n/site.js
    - assets/i18n/hub.js
    - assets/i18n/sieve-of-eratosthenes.js
    - assets/i18n/factor-tree.js
    - assets/i18n/eulers-totient.js
    - assets/i18n/venn-diagram.js
    - assets/i18n/euclidean-algorithm.js
    - assets/i18n/chinese-remainder-theorem.js
    - assets/i18n/equivalence-wheel.js
    - assets/i18n/cayley-table.js
    - assets/i18n/group-isomorphism.js
    - assets/i18n/square-and-multiply.js
    - assets/i18n/diffie-hellman-key-exchange.js
    - assets/i18n/elliptic-curve-diffie-hellman.js
    - assets/i18n/rsa.js
    - assets/i18n/fermats-method.js
    - assets/i18n/shors-algorithm.js
    - .planning/phases/06-multi-language-support/i18n-check.js
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md
    - .planning/phases/06-multi-language-support/i18n-config/cayley-table.json
    - .planning/phases/06-multi-language-support/i18n-config/rsa.json
    - .planning/phases/06-multi-language-support/i18n-config/diffie-hellman-key-exchange.json
    - CLAUDE.md
    - .claude/CLAUDE.md
    - .planning/PROJECT.md
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md
    - .planning/codebase/STACK.md
    - .planning/codebase/CONVENTIONS.md
    - .planning/codebase/ARCHITECTURE.md
    - .planning/codebase/CONCERNS.md
    - .planning/codebase/STRUCTURE.md
    - .planning/codebase/TESTING.md

key-decisions:
  - "Q-01..Q-11 planner-discretion decisions from the plan's objective section were followed as written (switcher position after Italiano, informal ty register, Euklides/Eratostenes conventional forms with regular-case declension for other eponyms, single LANG_CODES/SWITCHER_OPTIONS lists, --smoke left untouched, „…” quotes with double-quoted ASCII-apostrophe exception, NWD( used consistently in rsa.js/shor.js, CLDR four-form plurals one/few/many/other with other reusing many's wording, explicit PLURAL_EXTRA_CATEGORIES map rather than deriving from Intl for every language)."
  - "engine selection line rewritten from the one/other-collapsing ternary to Object.prototype.hasOwnProperty.call(entry, cat) ? entry[cat] : entry.other — the single change that generalizes the whole site to arbitrary CLDR category counts, verified behavior-identical for the six existing languages via PLURAL-PARITY (14418 comparisons against the pre-change engine)."
  - "dh.gLabel ('Generator g') is a genuine Polish cognate ('generator') identical to English; resolved via a new allowSame + allowRenderText exemption pair (same treatment as rsa.thBit's 'bit'), discovered only by the runtime i18n-browser.js langs check (the static --coverage gate does not render templates, so it missed this one) — never by rewording the label."
  - "cayley.identityWordAdditive's existing Italian-cognate 'zero' exemption reason extended to also name Polish, since Polish's word for the additive identity is the same cognate."

patterns-established:
  - "Adding an eighth language in future would require: one entry in SUPPORTED_LANGS, one entry in LANG_CODES/SWITCHER_OPTIONS/NEUTRAL_TOKENS, one <option> line per page, one pl-equivalent block per namespace, a LANG-COUNT-DOCS regex sweep catching stale 'seven languages' prose, and — only if the new language's CLDR plural category set differs from {one, other} — one entry in PLURAL_EXTRA_CATEGORIES plus the matching plural-value shape in every namespace with a plural entry."

requirements-completed: [QUICK-261002-fmi, I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, I18N-06]

duration: single session
completed: 2026-10-02
status: complete
---

# Quick Task 261002-fmi: Add Polish as a seventh supported language

**Polish (`pl`) now ships as the seventh fully-translated language on all 16 pages, with the CLDR plural engine generalized from a one/other collapse to a raw-category lookup (proven behavior-identical for the six existing languages), every gate script and living doc updated to seven languages, and zero regressions.**

## Performance

- **Duration:** single session
- **Tasks:** 3/3 completed
- **Files modified:** 50 (16 HTML pages, 18 i18n data files, 1 gate script, 3 i18n-config files, 1 glossary, 11 living docs/codebase docs — `.planning/config.json` deliberately excluded)
- **Commits:** 3 (measured via `git rev-list --count 365d782..36ae720`)

## Accomplishments

- `NT.i18n.SUPPORTED_LANGS` extended to `nl, en, de, fr, es, it, pl` — exactly five lines changed in `assets/nt-i18n.js` (confirmed by `git diff --numstat` against `365d782`): the allow-list, the registry-shape comment, `pluralCategory`'s Intl branch (now returns the raw category instead of collapsing to one/other), `resolveTemplate`'s comment, and the selection line (now `Object.prototype.hasOwnProperty.call(entry, cat) ? entry[cat] : entry.other`).
- All 16 pages carry an identical new `<option value="pl" lang="pl">Polski</option>` line immediately after the Italiano option, applied via one `sed -i` pass (+1/-0 lines each, confirmed by `git diff --numstat`).
- Complete Polish dictionaries added to all 18 `assets/i18n/*.js` namespaces — every English key, placeholder set preserved exactly; 11 plural values (sieve 1, euclid 5, cayley 2, totient 1, rsa 1, sqm 1) converted to the CLDR `{one, few, many, other}` shape with Polish-correct noun/case selection per category; zero `LANG-KEYSET`/`PLACEHOLDERS`/`PLURAL-SHAPE`/`DICT-MARKUP`/`PLURAL-CATEGORIES` findings on the full 16-page `--coverage` sweep.
- Gate tooling generalized: `i18n-check.js`'s `LANG_CODES`/`SWITCHER_OPTIONS`/`NEUTRAL_TOKENS` extended to seven; a new `PLURAL_EXTRA_CATEGORIES = { pl: ["few", "many"] }` map plus `expectedPluralCategories`/`checkPluralEntry`/`pluralCategoryFindings` functions replace the old hardcoded `{one, other}` plural-shape check, proven strict via a 14-assertion self-test (an Italian value carrying `many` is flagged; a Polish value missing `few` is flagged; the map holds only `pl`). `--api` gained Polish `detectDefaultLang` assertions and a synthetic `tp` namespace proving one/few/many/other selection, the en-fallback for a category Polish's entry lacks, and fr's own CLDR `many` still falling back to `other` unchanged. `--persistence` gained a Polish cookie scenario. `i18n-browser.js` needed no code change (it derives `NON_EN_LANGS` from `LANG_CODES`).
- `06-GLOSSARY.md` gained a full Polish column/section across every part: tone/punctuation including the four plural-form rule and eponym-declension note (a), 16 tool names (b), 53 core terms (c), proper nouns with the Euklides/Eratostenes conventional forms and a declension note for the rest (d), the numerals/notation separator-convention note (e), and the common-vocabulary table (f).
- Every living doc and codebase doc (`CLAUDE.md`, `.claude/CLAUDE.md`, `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`'s Phase 4 note, and all six `.planning/codebase/*.md` files) now states seven languages and the Polish plural shape; the `.claude/CLAUDE.md` GSD-mirror lines are byte-identical to their `.planning/codebase/` sources (`shadow-check.js --docs` PASS).
- English output stays byte-identical on all 16 pages (`en-parity IDENTICAL` on every page), every existing nl/en/de/fr/es/it dictionary value is unchanged from commit `365d782` (`DICT-UNCHANGED PASS`), and the generalized plural engine renders every key of those six languages identically to the pre-change engine across 14,418 comparisons (`PLURAL-PARITY PASS`).

## Task Commits

1. **Task 1: Tracer — Polish end-to-end on the Sieve of Eratosthenes (plural engine generalization, switcher, seven-language gates, glossary, site/common/sieve dictionaries)** - `2cd246c` (feat)
2. **Task 2: Polish for the hub and eight lighter tools, and every living doc to seven languages** - `9aa554c` (feat)
3. **Task 3: Polish for the six heaviest tools and the consolidated seven-language sweep** - `36ae720` (feat)

**Plan head before:** `365d7824b284aa2a6e33dbf91ebe15d07c32c75f`
**Plan head after:** `36ae7200356820b0a057d37e83bed87f5f802aa2`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `dh.gLabel` ("Generator g") surfaced as a runtime UNTRANSLATED finding despite passing the static `--coverage` gate**
- **Found during:** Task 3's consolidated sweep, chunk 3 of `i18n-browser.js` (`Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html`)
- **Issue:** Polish's word for "generator" is the genuine cognate `generator` (identical spelling to English), so the whole rendered label `"Generator g"` is byte-identical to English in Polish. The dictionary-level `allowSame` exemption added during Task 1 covers `i18n-check.js --coverage`'s `IDENTICAL-TO-EN` check, but `i18n-browser.js`'s runtime `langs` mode renders the live page and runs its own prose heuristic against the actual DOM text, which has a separate `allowRenderText` exemption list that had not yet been extended for this key.
- **Fix:** Added an `allowRenderText` entry for the literal rendered string `"Generator g"` in `i18n-config/diffie-hellman-key-exchange.json`, mirroring the dictionary-level `allowSame` reason. Re-ran the page: `langs PASS`, `switch PASS`, `layout PASS`, `ALL PASS`.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/diffie-hellman-key-exchange.json`
- **Commit:** `36ae720`

No other deviations. The plan's explicit engine-change instructions, switcher insertion, and per-namespace translation procedure (P-PL) were followed as written.

### Per-key cognate exemptions touched (not a deviation — explicitly anticipated by Q-07)

| File | Key | Polish cognate | Reason string updated |
|---|---|---|---|
| `i18n-config/cayley-table.json` | `cayley.identityWordAdditive` | "zero" | Extended existing Italian-cognate reason to also name Polish |
| `i18n-config/rsa.json` | `rsa.thBit` / rendered `"bit"` | "bit" | Extended existing nl/fr/es/it reason to also name Polish |
| `i18n-config/diffie-hellman-key-exchange.json` | `dh.gLabel` / rendered `"Generator g"` | "generator" | New `allowSame` + `allowRenderText` entry pair (see deviation above) |

No existing `nl/en/de/fr/es/it` content, key, or key order was touched in any dictionary file. No gate assertion was deleted or loosened — assertion counts only grew (`--api` 149 > 130 required, `--persistence` 89 > 80 required).

## Known Stubs

None — no hardcoded empty values, placeholder text, or unwired data sources were introduced by this plan.

## Pending Human-Check

Per the plan's `<human-check>` in Task 3's verify block, translation quality cannot be judged by a script. **Not yet performed** — a reader of Polish with a mathematics background should, before this is considered fully reviewed:

1. Review the new Polish columns/sections in `06-GLOSSARY.md`.
2. Switch 2-3 sampled pages (e.g. RSA, Euclidean Algorithm, Sieve of Eratosthenes) to Polski via the header and confirm the wording reads naturally, that `ty` is used consistently, that tool names match the glossary, and that plural phrases agree with their numbers (e.g. the Sieve at N=10 → 4 primes [CLDR "few"], N=30 → 10 primes [CLDR "many"], N=100 → 25 primes [CLDR "many"], and a Euclidean run with 2-4 steps → "few").

This is recorded here for end-of-phase/end-of-milestone review, per the plan's own instruction — it does not block this quick task's completion since every automated gate is green. The pending Italian human-check from quick task 261002-c77 is also still outstanding and unrelated to this task.

## Verify Block Results (Task 3's consolidated sweep — single source of completion evidence)

```
I18N-CHECK PASS coverage: 16 page(s)
I18N-CHECK PASS header: 16 page(s)
I18N-CHECK PASS includes: 16 page(s)
I18N-CHECK PASS no-locale-number-format: 16 page(s)
I18N-CHECK PASS literals-markup: 16 page(s)
I18N-CHECK PASS literals-js: 16 page(s)
I18N-CHECK PASS api: 149 assertions          (> 130 required)
I18N-CHECK PASS persistence: 89 assertions   (> 80 required)
I18N-CHECK PASS smoke: 123 assertions (mutant detected); cross-session run OK
DICT-UNCHANGED PASS (pl present in every namespace)
LANG-COUNT-DOCS PASS
PLURAL-PARITY PASS 14418 comparisons (six existing languages identical to the 365d782 engine)
PL-PLURAL-ALL PASS 88 selections (11 plural values x 8 counts)
nt-i18n.js numstat vs 365d782: 5/5 (exactly five lines changed)
16 pages numstat vs 365d782: each exactly +1/-0 (16/16)
```

**i18n-browser.js ALL PASS on all 16 pages** (en-parity IDENTICAL, langs PASS langs=6, switch PASS langs=6, layout PASS):

```
index                               ALL PASS  (en-parity snaps=1,  langs snaps=1  langs=6, switch points=1 langs=6)
sieve-of-eratosthenes               ALL PASS  (en-parity snaps=11, langs snaps=11 langs=6, switch points=2 langs=6)
factor-tree                         ALL PASS  (en-parity snaps=29, langs snaps=25 langs=6, switch points=1 langs=6)
venn-diagram                        ALL PASS  (en-parity snaps=30, langs snaps=14 langs=6, switch points=2 langs=6)
euclidean-algorithm                 ALL PASS  (en-parity snaps=18, langs snaps=18 langs=6, switch points=2 langs=6)
chinese-remainder-theorem           ALL PASS  (en-parity snaps=9,  langs snaps=9  langs=6, switch points=2 langs=6)
equivalence-wheel                   ALL PASS  (en-parity snaps=26, langs snaps=22 langs=6, switch points=2 langs=6)
eulers-totient                      ALL PASS  (en-parity snaps=13, langs snaps=13 langs=6, switch points=2 langs=6)
cayley-table                        ALL PASS  (en-parity snaps=21, langs snaps=17 langs=6, switch points=2 langs=6)
group-isomorphism                   ALL PASS  (en-parity snaps=17, langs snaps=13 langs=6, switch points=1 langs=6)
square-and-multiply                 ALL PASS  (en-parity snaps=16, langs snaps=16 langs=6, switch points=2 langs=6)
diffie-hellman-key-exchange         ALL PASS  (en-parity snaps=24, langs snaps=24 langs=6, switch points=2 langs=6)
elliptic-curve-diffie-hellman       ALL PASS  (en-parity snaps=21, langs snaps=21 langs=6, switch points=2 langs=6)
rsa                                 ALL PASS  (en-parity snaps=14, langs snaps=14 langs=6, switch points=3 langs=6)
fermats-method                      ALL PASS  (en-parity snaps=17, langs snaps=17 langs=6, switch points=2 langs=6)
shors-algorithm                     ALL PASS  (en-parity snaps=15, langs snaps=13 langs=6, switch points=2 langs=6)
```

**Phase 7 tooling (unaffected by this plan, re-run as part of the consolidated sweep):**

```
HARNESS PASS bigint: 75039 assertions
HARNESS PASS core: 2712692 assertions
HARNESS PASS layout: 56749 assertions
HARNESS PASS namespace: 105 assertions
HARNESS PASS store: 310 assertions
HARNESS PASS svg: 11108 assertions
HARNESS PASS total=2856003
SHADOW-CHECK PASS on all 15 tool pages (--all)
SHADOW-CHECK PASS --docs (no MIRROR-DRIFT)
```

**Task 1's tracer mutant self-test** (proves the modified gates are not vacuous):

```
MUTANT-DETECTED untranslated
MUTANT-DETECTED stale-switch
MUTANT-DETECTED en-change
MUTANT-DETECTED overflow
```

**Task 1's PLURAL-GATE self-test** (proves the generalized plural-shape gate is strict per language):

```
PLURAL-GATE PASS 14 checks
```

## Self-Check: PASSED

- Verified files exist on disk: `assets/i18n/site.js`, `assets/i18n/sieve-of-eratosthenes.js`, `assets/i18n/hub.js`, `assets/i18n/rsa.js`, `assets/i18n/shors-algorithm.js`, `.planning/phases/06-multi-language-support/06-GLOSSARY.md`, `.planning/phases/06-multi-language-support/i18n-config/diffie-hellman-key-exchange.json` — all FOUND.
- Verified commits exist in `git log --oneline --all`: `2cd246c`, `9aa554c`, `36ae720` — all FOUND.
- Verified `.planning/config.json` is absent from `git diff --name-only 365d782 HEAD` and still shows as an unstaged modification in `git status --short` — confirmed.
- No missing items.
