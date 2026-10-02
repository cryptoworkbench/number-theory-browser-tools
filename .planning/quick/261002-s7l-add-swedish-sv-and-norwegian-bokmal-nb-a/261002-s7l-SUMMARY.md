---
phase: quick-261002-s7l
plan: 01
subsystem: i18n
tags: [i18n, nt-i18n, swedish, norwegian-bokmal, cldr-plurals, headless-chrome]

requires:
  - phase: 06-multi-language-support
    provides: NT.i18n engine, i18n-check.js/i18n-browser.js gate tooling, 06-GLOSSARY.md
  - phase: quick-261002-jh4
    provides: nine-language baseline (nl/en/de/fr/es/it/pl/pt-BR/pt-PT), the template this task followed step-for-step
provides:
  - Swedish (sv) and Norwegian Bokmål (nb) as the tenth and eleventh supported languages, site-wide
  - assets/nt-i18n.js SUPPORTED_LANGS + legacy `no` -> `nb` browser-detection branch (ENGINE-SCOPE byte-exact)
  - Two new switcher options on all 16 pages, directly after Português (Portugal)
  - Complete sv/nb dictionaries in all 18 assets/i18n/*.js namespaces
  - Data-driven eleven-language gate tooling in i18n-check.js (SWITCHER_OPTIONS as the one per-language table; LANG_CODES and NEUTRAL_TOKENS autonyms derived from it; pluralSelectionGaps widening the plural guard to every supported language)
  - Swedish/Norwegian columns in 06-GLOSSARY.md
  - Eleven-language counts across every living doc
affects: [Phase 4 Continued Fractions (must author in eleven languages from the start), any future language-addition quick task reusing this gate tooling]

actuals:
  tokens: 77825
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Data-driven i18n gate table (SWITCHER_OPTIONS as single source; LANG_CODES and autonym NEUTRAL_TOKENS derived, not hand-maintained)"
    - "pluralSelectionGaps(lang): brute-force 0..1000 Intl.PluralRules probe that catches a future language's extra CLDR category without a hand-maintained allow-list"

key-files:
  created: []
  modified:
    - assets/nt-i18n.js
    - "index.html + all 15 tool pages (switcher options only, +2/-0 lines each)"
    - assets/i18n/site.js
    - assets/i18n/hub.js
    - "assets/i18n/*.js (all 18 namespaces across 17 data files)"
    - .planning/phases/06-multi-language-support/i18n-check.js
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md
    - ".planning/phases/06-multi-language-support/i18n-config/{chinese-remainder-theorem,equivalence-wheel,square-and-multiply,diffie-hellman-key-exchange,rsa}.json"
    - "CLAUDE.md, .claude/CLAUDE.md, .planning/PROJECT.md, .planning/REQUIREMENTS.md, .planning/ROADMAP.md, .planning/codebase/*.md"

key-decisions:
  - "SWITCHER_OPTIONS is now the single per-language table in i18n-check.js; LANG_CODES and NEUTRAL_TOKENS' autonym tokens derive from it via SWITCHER_OPTIONS.map() and a new autonymTokens() helper, so a future language (ro/hu/lv, then ru/el) needs only its own table entry."
  - "pluralSelectionGaps(lang) brute-forces Intl.PluralRules.select(n) for n=0..1000 against every LANG_CODES language and reports, once per distinct unexpected category, the first count that produced it — this is what will catch a Romanian 'few', Latvian 'zero', or Russian 'few'/'many' without a hand-maintained PLURAL_EXTRA_CATEGORIES entry."
  - "Swedish uses SGD(/MGM( for gcd/lcm notation and the noun 'SGD'; Norwegian Bokmål uses SFD(/MFM( and 'SFD' — applied consistently across euclid, venn, rsa and shor wherever a file already localizes gcd/lcm notation."
  - "Euclid is 'Euklides' in Swedish and 'Euklid' in Norwegian Bokmål; every other eponym (Eratosthenes, Euler, Fermat, Cayley, Venn, Shor, Bézout, Diffie-Hellman, Sun Tzu) stays invariant per 06-GLOSSARY.md section (d)."

patterns-established:
  - "Data-driven switcher/autonym/plural-guard tooling (this task's Q-09): the next language addition edits only SWITCHER_OPTIONS (+ PLURAL_EXTRA_CATEGORIES if its CLDR categories exceed {one, other}) — no other i18n-check.js line needs to change."

requirements-completed: [QUICK-261002-s7l, I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, I18N-06]

coverage: []

duration: single session
completed: 2026-10-03
status: complete
---

# Quick Task 261002-s7l: Add Swedish and Norwegian Bokmål as the tenth and eleventh supported languages Summary

**Swedish (`sv`) and Norwegian Bokmål (`nb`) added site-wide via a data-driven gate table — `SWITCHER_OPTIONS` is now the single source for `LANG_CODES` and the autonym `NEUTRAL_TOKENS`, and a new `pluralSelectionGaps` brute-force probe widens the plural guard to cover every future language automatically.**

## Performance

- **Duration:** single session (3 tasks)
- **Tasks:** 3 of 3 completed
- **Files modified:** 21 (Task 1) + 23 (Task 2) + 9 (Task 3) — see commits below for exact paths

## Accomplishments

- `NT.i18n.SUPPORTED_LANGS` is now `nl, en, de, fr, es, it, pl, pt-BR, pt-PT, sv, nb` (eleven languages); `assets/nt-i18n.js` differs from the `23c0cc1` baseline by exactly the `SUPPORTED_LANGS` line and a two-line Norwegian detection branch (`no` → `nb`; `nn` unmapped) — ENGINE-SCOPE byte-exact.
- All 16 pages carry both new switcher options (`Svenska`, `Norsk (bokmål)`) directly after `Português (Portugal)`, each page +2/-0 lines (html numstat confirmed).
- All 18 `assets/i18n/*.js` namespaces (site, common, hub, and 15 tool namespaces) now carry complete, idiomatic Swedish and Norwegian Bokmål dictionaries with identical key sets, placeholders and plural shapes to English.
- `i18n-check.js`'s gate tooling is now data-driven (Q-09): `SWITCHER_OPTIONS` is the one per-language table; `LANG_CODES` and the switcher autonyms in `NEUTRAL_TOKENS` derive from it; a new `pluralSelectionGaps(lang)` function widens the plural-category guard to cover every `LANG_CODES` language instead of a hand-maintained list, proven to catch a synthetic Romanian/Latvian/Russian mutant.
- `06-GLOSSARY.md` gained Swedish and Norwegian Bokmål columns/rows across sections (a)–(f), and every living doc (`CLAUDE.md`, `.claude/CLAUDE.md`, `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `.planning/codebase/*.md`) now states eleven languages.
- Existing nine languages and English output are byte-identical to the `23c0cc1` baseline (DICT-UNCHANGED, RENDER-PARITY, DETECT-PARITY, ENGINE-SCOPE all PASS).

## Task Commits

1. **Task 1: Tracer — sv and nb end-to-end on the Sieve of Eratosthenes** — `6e315fc` (feat)
2. **Task 2: sv and nb for the hub and eight lighter tools, docs to eleven languages** — `ba85307` (feat)
3. **Task 3: sv and nb for the six heaviest tools and the consolidated eleven-language sweep** — `59d7c8d` (feat)

**Plan metadata:** commit pending from the orchestrator (this agent does not commit PLAN.md/SUMMARY.md/STATE.md per the execution constraints)

## Files Created/Modified

- `assets/nt-i18n.js` — `SUPPORTED_LANGS` + legacy `no` → `nb` detection branch
- `index.html` + all 15 tool pages — two new `<option>` lines in the language switcher
- `assets/i18n/site.js`, `assets/i18n/hub.js`, and the 15 per-tool `assets/i18n/*.js` files — complete `sv`/`nb` blocks in all 18 namespaces
- `.planning/phases/06-multi-language-support/i18n-check.js` — `SWITCHER_OPTIONS` as the one per-language table; derived `LANG_CODES`; new `autonymTokens()`; new `pluralSelectionGaps()`; extended `--api`/`--persistence` with Swedish/Norwegian assertions
- `.planning/phases/06-multi-language-support/06-GLOSSARY.md` — sv/nb columns across sections (a)–(f)
- `.planning/phases/06-multi-language-support/i18n-config/{chinese-remainder-theorem,equivalence-wheel,square-and-multiply,diffie-hellman-key-exchange,rsa}.json` — cognate-exemption reason extensions, one new exemption, and one bug fix (see Deviations)
- `CLAUDE.md`, `.claude/CLAUDE.md`, `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/codebase/{STACK,CONVENTIONS,ARCHITECTURE,CONCERNS,STRUCTURE,TESTING,INTEGRATIONS}.md` — language count bumped to eleven

## Decisions Made

- Register/vocabulary/punctuation followed the plan's locked Q-04 through Q-13 decisions exactly (informal **du** in both languages; "tal"/"tall" for number; SGD(/SFD( for gcd notation; Euklides/Euklid genitive and apostrophe rules; `”…”` quotes in Swedish, `«…»` in Norwegian Bokmål).
- `autonymTokens(options)` (new helper) derives `NEUTRAL_TOKENS`' autonym row from `SWITCHER_OPTIONS` labels via Unicode letter-run extraction plus NFD diacritic folding, rather than hand-listing each language's autonym forms — verified to add exactly `bokmal, bokmål, norsk, svenska` and lose nothing (NEUTRAL-DELTA).
- `pluralSelectionGaps` reports once per distinct unexpected category (not just the first failure overall), confirmed against synthetic Romanian (`few`), Latvian (`zero`) and Russian (`many,few`) fixtures.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 — cognate exemption] `wheel.roleSum` Norwegian Bokmål cognate**
- **Found during:** Task 2 (Equivalence Wheel coverage check)
- **Issue:** Norwegian Bokmål's own word for "sum" is spelled identically to English `sum` — a genuine cognate the coverage gate correctly flagged as `IDENTICAL-TO-EN`.
- **Fix:** Added a new `allowSame`/`allowRenderText` pair for `wheel.roleSum` in `i18n-config/equivalence-wheel.json`, naming the cognate explicitly (Swedish's own `summa` needed no exemption).
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/equivalence-wheel.json`
- **Committed in:** `ba85307` (Task 2 commit)

**2. [Rule 1 — latent bug fix] `rsa.json`'s `"h = qInv"` langs-check exemption never matched its real segment**
- **Found during:** Task 3 consolidated sweep (`i18n-browser.js` on `index.html` + `RSA/rsa.html`)
- **Issue:** `RSA/rsa.html`'s CRT-recombination formula builds a `<span>` (`lblH`) whose `.textContent` is set once to the literal `'h = qInv·(m1 − m2) mod p ='`, with no child nodes — so the whole string is a single, never-translated DOM text segment in every language. The existing `allowRenderText` exemption used the key `"h = qInv"` (a short fragment pattern that only applies to the *sibling* key `rsa.lblQInv`, which does have a `<sup>` child splitting its rendered text that way). Because `"h = qInv"` never equals the real full-string segment, the exemption was silently dead for all nine existing languages too — it just never surfaced, because each of those languages' differing segment count happened to misalign the langs-check's positional index comparison away from this exact spot. Swedish's and Norwegian Bokmål's total segment counts both happen to match English's count exactly at the `crt-alice-on`/`crt-bob-on` switch points, which is what exposed the dormant bug as `UNTRANSLATED`.
- **Fix:** Replaced the dead `"h = qInv"` key with the real, full literal `"h = qInv·(m1 − m2) mod p ="` in `allowRenderText` (and corrected the matching `allowLiteral` comment, which referenced a nonexistent `rsa.lblHFormula` dictionary key).
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/rsa.json`
- **Verification:** Re-ran `i18n-browser.js` on `index.html` + `RSA/rsa.html` standalone — `ALL PASS`, no `UNTRANSLATED` findings.
- **Committed in:** `59d7c8d` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 cognate exemption, 1 latent-bug fix)
**Impact on plan:** Both fixes are gate-tooling corrections, not scope creep — no gate was loosened; the rsa.json fix made a previously-dead exemption actually match its real target, and the wheel.roleSum fix recorded a genuine cognate exactly as Q-11 prescribes for "any other genuine cognate."

## Issues Encountered

None beyond the two auto-fixed deviations above. One operator-side mistake mid-session: a `SubagentHandback` call was made prematurely with a placeholder message while Task 3 was still in progress; the coordinator caught it and this agent resumed and completed Task 3 as described above before producing this real final report.

## Sweep Results (Task 3, final consolidated run)

- `i18n-check.js --all` → PASS coverage/header/includes/no-locale-number-format/literals-markup/literals-js, 16 page(s) each
- `i18n-check.js --api` → **PASS 276 assertions** (prototype estimate: 276)
- `i18n-check.js --persistence` → **PASS 166 assertions** (prototype estimate: 166)
- `i18n-check.js --smoke` → PASS 123 assertions (mutant detected); cross-session run OK
- DICT-UNCHANGED → **PASS** (9 existing languages identical to `23c0cc1`; `sv, nb` present in every namespace)
- ENGINE-SCOPE → **PASS** (byte-exact: `SUPPORTED_LANGS` line + one Norwegian branch)
- DETECT-PARITY → **PASS 11485 navigator lists** (4158 Swedish/Norwegian-first)
- RENDER-PARITY → **PASS 21528 comparisons** (9 existing languages)
- NEW-PLURAL → **PASS 132 selections** (11 plural values × 6 counts × 2 languages; one≠other: sv=5, nb=8)
- SV-NB-DISTINCT → **PASS, differing=798/885** (own-function-word hits: sv=366, nb=326 — both well over the 150 threshold)
- SWITCHER-GATE → PASS 12 checks; PLURAL-GATE → PASS 17 checks; NEUTRAL-DELTA → PASS (`+bokmal,bokmål,norsk,svenska`)
- `html numstat` vs `23c0cc1` → PASS (all 16 pages, exactly +2/-0)
- `i18n-browser.js` on all 16 pages (8 chunks of 2, each run via `run_in_background`): **ALL PASS** — `en-parity IDENTICAL`, `langs PASS … langs=10`, `switch PASS … langs=10`, `layout PASS` on every page. Per-page snapshot counts: index=1, rsa=14, sieve-of-eratosthenes=11, factor-tree=25(29 en-parity), venn-diagram=14(30 en-parity), group-isomorphism=13(17 en-parity), euclidean-algorithm=18, chinese-remainder-theorem=9, equivalence-wheel=22(26 en-parity), eulers-totient=13, cayley-table=17(21 en-parity), square-and-multiply=16, diffie-hellman-key-exchange=24, elliptic-curve-diffie-hellman=21, fermats-method=17, shors-algorithm=13(15 en-parity).
  - Wall-clock timing note: exact per-chunk durations were not instrumented this run (each chunk exceeded the 120s foreground limit and was moved to background automatically; completion was observed via task-completion notifications rather than a stopwatch). Qualitatively, every chunk completed within the plan's own ~6–7 minute per-chunk estimate at ten non-English languages; the `index.html`+`RSA/rsa.html` and `Equivalence Wheel`+`Eulers Totient` chunks were the two that took the longest to return a notification, consistent with the plan's own planning-time measurement that Equivalence Wheel is the heaviest single page (~185s at ten languages).
- HEADER-375 (375px viewport, `en`/`sv`/`nb`) → **PASS, zero overflow** on `index.html` and the Sieve:
  - `index.html`: en `hdrH=270`, sv `hdrH=304`, nb `hdrH=304` (all `ovf=0 hdrOvf=0`)
  - `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`: en `hdrH=264`, sv `hdrH=297`, nb `hdrH=297` (all `ovf=0 hdrOvf=0`)
- Phase 7 `harness.js` → PASS, **2,856,003 total assertions** (bigint 75039, core 2712692, layout 56749, namespace 105, store 310, svg 11108)
- Phase 7 `shadow-check.js --all` → PASS on all 15 tool pages; `shadow-check.js --docs` → PASS (no MIRROR-DRIFT)
- Post-commit check: `git diff --name-only 23c0cc1 HEAD -- .planning/config.json` prints nothing, and `.planning/config.json` remains an unstaged working-tree modification in every commit — confirmed after the final Task 3 commit.

## i18n-config Exemptions Touched

| File | Key | Change | Reason |
|---|---|---|---|
| `chinese-remainder-theorem.json` | `crt.tableHeaderTerm` / `"term = a · M · y"` | Reason extended | Swedish genuinely borrows "term" unchanged (same Latin root as Dutch); Norwegian Bokmål's own value (`ledd = a · M · y`) differs and needs no exemption. |
| `equivalence-wheel.json` | `wheel.roleSum` / `"sum"` | **New exemption** | Norwegian Bokmål's own word for the addition result is spelled identically to English `sum` — genuine cognate (Swedish's `summa` differs, no exemption needed). |
| `square-and-multiply.json` | `sqm.expLabel` / `"Exponent e"` | Reason extended | Swedish's own word for "exponent" is spelled identically to English (joining Dutch/German); Norwegian Bokmål's own value (`Eksponent e`) differs. |
| `diffie-hellman-key-exchange.json` | `dh.gLabel` / `"Generator g"` | Reason extended | Swedish and Norwegian Bokmål both use the same cognate spelling as Polish/English. |
| `rsa.json` | `rsa.thBit` / `"bit"` | Reason extended | Swedish and Norwegian Bokmål both use the identical cognate spelling as the other seven languages. |
| `rsa.json` | `allowRenderText["h = qInv"]` → `allowRenderText["h = qInv·(m1 − m2) mod p ="]` | **Bug fix** (Rule 1) | The old key was a dead fragment that never matched the real single-segment literal; see Deviations above. |

## User Setup Required

None — no external service configuration required.

## Pending Human Review

**Not yet performed** (same status as the pending Italian/Polish/Portuguese reviews): a native Swedish reader and a native Norwegian Bokmål reader, ideally with a mathematics background, should:
- Review the new `sv`/`nb` columns in `06-GLOSSARY.md`, especially the gcd/lcm abbreviations (SGD/MGM, SFD/MFM), the number-theory terms in rows 5, 8, 15 and 32, and the tool names.
- Switch 2–3 sampled pages (e.g. RSA, Euclidean Algorithm, Sieve of Eratosthenes) to each language via the header.
- Confirm the wording reads naturally, both consistently use **du**, Norwegian Bokmål carries no Nynorsk forms, tool names match the glossary, and plural phrases agree with their numbers (try the Euclidean `gcd(a, 0)` preset — 0 steps, both languages use the `other` form — and a Sieve run).
- Glance at a tool page at phone width (375px) in each language.

This does not block the quick task since every automated gate is green, matching the project's established policy for prior language additions.

## Next Phase Readiness

- Eleven languages (`nl, en, de, fr, es, it, pl, pt-BR, pt-PT, sv, nb`) are fully live site-wide, with English and the other nine existing languages byte-identical to baseline.
- The data-driven gate tooling (`SWITCHER_OPTIONS`, derived `LANG_CODES`/autonyms, `pluralSelectionGaps`) is ready for the next languages in the roadmap (Romanian/Hungarian/Latvian, then Russian/Greek) without further gate-script restructuring.
- Phase 4 (Continued Fractions) should be authored in eleven languages from the start per the updated `ROADMAP.md` note.
- No blockers. The pending human-review item above is recorded for end-of-milestone UAT, consistent with the still-pending Italian/Polish/Portuguese reviews.

---
*Phase: quick-261002-s7l*
*Completed: 2026-10-03*
