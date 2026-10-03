---
phase: quick-261003-0dr
plan: 01
subsystem: i18n
tags: [i18n, nt-i18n, romanian, hungarian, latvian, cldr-plurals, translation]

requires:
  - phase: quick-261002-s7l
    provides: the eleven-language baseline (nl/en/de/fr/es/it/pl/pt-BR/pt-PT/sv/nb), the data-driven SWITCHER_OPTIONS/PLURAL_EXTRA_CATEGORIES gate tables, and i18n-browser.js's en-parity/langs/switch/layout modes this plan reused unchanged
provides:
  - Romanian (ro), Hungarian (hu) and Latvian (lv) as the twelfth, thirteenth and fourteenth supported languages, with the two-letter detection path already mapping them with no engine branch
  - Complete ro/hu/lv dictionaries in all 18 namespaces (site + common, hub, 15 tools) across all 16 pages
  - CLDR plural shapes implemented and proven: Romanian {one, few, other}, Hungarian {one, other}, Latvian {zero, one, other}
  - i18n-check.js gate tables (SWITCHER_OPTIONS, PLURAL_EXTRA_CATEGORIES, --api/--persistence assertions) extended to fourteen languages with zero assertions loosened
  - 06-GLOSSARY.md ro/hu/lv columns in sections (a)-(f)
  - Every living doc (CLAUDE.md, .claude/CLAUDE.md, PROJECT.md, REQUIREMENTS.md, ROADMAP.md, all seven codebase/*.md files) updated to state fourteen languages
affects: [future Russian/Greek quick task, any future tool addition that must ship translated in all fourteen languages from the start]

actuals:
  tokens: 107967
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Three-task tracer-then-expand sequencing for a same-phase i18n language addition: Task 1 proves the whole pipeline (engine allow-list, switcher, gate tables, one real tool's dictionaries) end-to-end on the lightest page; Tasks 2/3 then apply the same P-RHL procedure namespace-by-namespace with no new mechanism."
    - "ro/hu/lv name-handling conventions for Alice/Bob/Eve (kept invariant per 06-GLOSSARY section (d)): Romanian genitive/dative via 'lui' + the bare name; Hungarian via a possessed-noun construction or postposition, never a suffix on the name; Latvian via an apposition noun ('puse' for Alice/Bob, 'uzbrucēja' for Eve) rather than declining the name."

key-files:
  created: []
  modified:
    - assets/nt-i18n.js
    - index.html through all 16 tool pages (switcher option lines only)
    - assets/i18n/site.js
    - assets/i18n/sieve-of-eratosthenes.js
    - assets/i18n/hub.js
    - assets/i18n/factor-tree.js
    - assets/i18n/eulers-totient.js
    - assets/i18n/venn-diagram.js
    - assets/i18n/euclidean-algorithm.js
    - assets/i18n/chinese-remainder-theorem.js
    - assets/i18n/equivalence-wheel.js
    - assets/i18n/cayley-table.js
    - assets/i18n/group-isomorphism.js
    - assets/i18n/square-and-multiply.js
    - assets/i18n/fermats-method.js
    - assets/i18n/diffie-hellman-key-exchange.js
    - assets/i18n/elliptic-curve-diffie-hellman.js
    - assets/i18n/rsa.js
    - assets/i18n/shors-algorithm.js
    - .planning/phases/06-multi-language-support/i18n-check.js
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md
    - .planning/phases/06-multi-language-support/i18n-config/equivalence-wheel.json
    - .planning/phases/06-multi-language-support/i18n-config/cayley-table.json
    - .planning/phases/06-multi-language-support/i18n-config/chinese-remainder-theorem.json
    - .planning/phases/06-multi-language-support/i18n-config/square-and-multiply.json
    - .planning/phases/06-multi-language-support/i18n-config/diffie-hellman-key-exchange.json
    - .planning/phases/06-multi-language-support/i18n-config/rsa.json
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
    - .planning/codebase/INTEGRATIONS.md

key-decisions:
  - "Followed the plan's Q-01..Q-15 decisions exactly as recorded (switcher order/position, register, orthography, plural shapes, name handling, vocabulary, proper nouns, cognate policy, authoring flow, gate-table edits, browser-chunk sizing)."
  - "Where the Task's own instruction examples needed small post-hoc fixes to satisfy the live IDENTICAL-TO-EN gate (a handful of genuine ro/English cognates the plan's own draft text did not anticipate), rewrote only the colliding Romanian wording — never the gate, never the English, never the other eleven languages. See Deviations below."

requirements-completed: [QUICK-261003-0dr, I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, I18N-06]

duration: single session
completed: 2026-10-03
status: complete
---

# Phase quick-261003-0dr: Add Romanian, Hungarian and Latvian Summary

**Romanian (`ro`), Hungarian (`hu`) and Latvian (`lv`) ship as the twelfth, thirteenth and fourteenth supported languages site-wide — full CLDR plural support (`{one, few, other}` / `{one, other}` / `{zero, one, other}`), all 18 namespaces across all 16 pages, zero regressions to the existing eleven languages or English.**

## Performance

- **Duration:** single session
- **Tasks:** 3
- **Files modified:** 33 non-doc files (engine, 16 pages' switcher lines, 18 data files, gate script, glossary, 6 i18n-config files) + 11 living-doc files
- **Commits:** 3 (one per task)

## Accomplishments

- `NT.i18n.SUPPORTED_LANGS` is `nl, en, de, fr, es, it, pl, pt-BR, pt-PT, sv, nb, ro, hu, lv` — the engine diff is exactly the `SUPPORTED_LANGS` line and the registry comment line (ENGINE-SCOPE byte-exact).
- All 16 pages carry the `ro`/`hu`/`lv` switcher options directly after Norsk (bokmål), each page +3/-0 lines (HTML-NUMSTAT).
- Browser-language detection maps `ro*`/`hu*`/`lv*` through the pre-existing, unchanged two-letter prefix path; the deprecated Moldavian tag `mo`, Lithuanian `lt` and Latgalian `ltg` fall through unmapped (DETECT-PARITY PASS, 22,573 navigator lists, 9,936 Romanian/Hungarian/Latvian-first).
- Complete `ro`/`hu`/`lv` dictionaries in all 18 namespaces (`site`, `common`, `hub`, and all 15 tools), applying Romanian `{one, few, other}`, Hungarian `{one, other}` and Latvian `{zero, one, other}` plural shapes everywhere English carries a plural entry.
- Existing eleven languages and English stay byte-identical: DICT-UNCHANGED PASS (11 languages identical to baseline `1f15a00`; ro/hu/lv appended in that order in every namespace), RENDER-PARITY PASS (26,312 comparisons).
- `i18n-check.js` gate tables extended with zero assertions loosened: `--api` 342 assertions (>330), `--persistence` 212 assertions (>205), `--smoke` 123 assertions with mutant detection still working, SWITCHER-GATE PASS (12 checks), PLURAL-GATE PASS (25 checks), NEUTRAL-DELTA PASS (+latviesu, latviešu, magyar, romana, română).
- NEW-PLURAL PASS 264 selections (11 plural values × 24 counts) with 10 Romanian and 9 Latvian values whose three forms are all distinct (need ≥3 each) and 1 Hungarian value with differing forms (need ≥1).
- RO-HU-LV-DISTINCT PASS site-wide across all 874 English keys: shared values well under the 20% ceiling (ro 43/874, hu 28/874, lv 23/874) and own-function-word counts well over the 150 floor (ro 472, hu 452, lv 318).
- `06-GLOSSARY.md` carries ro/hu/lv columns in every section (a)–(f): tone/register, 16 tool names, 53 core terms, 14 proper-noun rows, numerals/notation, and common vocabulary.
- Every living doc (`CLAUDE.md`, `.claude/CLAUDE.md`, `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`'s Phase 4 note, and all seven `codebase/*.md` files) states fourteen languages; `shadow-check.js --docs` confirms no GSD-mirror drift.
- All 16 pages pass `i18n-browser.js` ALL mode (en-parity IDENTICAL, langs=13, switch, layout) across eight 2-page chunks; HEADER-375 shows zero overflow in en/ro/hu/lv on index.html and the Sieve.
- Phase 7's `harness.js` (2,856,003 assertions) and `shadow-check.js --all`/`--docs` stay green.
- `.planning/config.json` appears in no commit since baseline `1f15a00` (confirmed via `git diff --name-only`).

## Task Commits

1. **Task 1: Tracer — ro, hu and lv end-to-end on the Sieve of Eratosthenes** - `384ec59` (feat)
2. **Task 2: ro, hu and lv for the hub and ten lighter tools, docs to fourteen languages** - `29e4020` (feat)
3. **Task 3: ro, hu and lv for the four heaviest tools, consolidated sweep green** - `184457b` (feat)

_No separate plan-metadata commit — per this run's constraints, the orchestrator commits this SUMMARY.md and STATE.md separately._

## Files Created/Modified

See `key-files.modified` in the frontmatter for the full list. Highlights:
- `assets/nt-i18n.js` — exactly two lines changed (`SUPPORTED_LANGS`, registry comment)
- 16 tool pages — exactly three lines added each (the `ro`/`hu`/`lv` `<option>` elements)
- `assets/i18n/*.js` (17 files, 18 namespaces) — `ro`, `hu`, `lv` blocks appended after `nb` in every namespace
- `.planning/phases/06-multi-language-support/i18n-check.js` — `SUPPORTED_LANGS` pin, `trhl` synthetic plural namespace, invalid-setLang/detectDefaultLang/persistence assertions, `SWITCHER_OPTIONS`/`PLURAL_EXTRA_CATEGORIES` tables, four count-free comments
- `.planning/phases/06-multi-language-support/06-GLOSSARY.md` — ro/hu/lv columns throughout
- 6 `i18n-config/*.json` files — cognate-exemption reason text extended to name Romanian/Hungarian where applicable
- 11 living-doc files — language count bumped from eleven to fourteen

## Decisions Made

All judgment calls were pre-recorded in the plan as Q-01 through Q-15 and applied as written (switcher order/labels, register, orthography, CLDR plural shapes and noun forms, name-handling per language, vocabulary/notation, proper nouns, cognate policy, authoring flow, gate-table edits, browser-chunk sizing). No new judgment calls were required beyond the deviations below.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Five Romanian/Latvian values collided with English by genuine cognate, tripping IDENTICAL-TO-EN**
- **Found during:** Task 1 (`sieve.stat.progress.lv`), Task 2 (`iso.tabNumeric.ro`, `iso.formula.ro`, `dh.rowSharedSecret.ro`), Task 3 (`shor.verdictHeading.ro`, `shor.verdictLabel.ro`)
- **Issue:** My own first-draft Romanian/Latvian wording happened to be spelled identically to the English source for six values (`Progress`→lv, `Numeric`→ro, the `via`/`generator` formula line→ro, `secret={val}`→ro, `Verdict`→ro ×2) — none of these are exemptible genuine-cognate cases listed anywhere in the plan or existing `i18n-config/*.json` files, so the coverage gate correctly flagged them as untranslated.
- **Fix:** Reworded each to a natural, non-identical equivalent: lv `Virzība` (progress), ro `Numerică` (feminine agreement instead of the bare cognate), ro `prin` replacing the cognate connector `via`, ro `secret comun={val}`, ro `Concluzie` (conclusion) replacing `Verdict` ×2. No gate logic, English value, or other language's value touched.
- **Files modified:** `assets/i18n/sieve-of-eratosthenes.js`, `assets/i18n/group-isomorphism.js`, `assets/i18n/diffie-hellman-key-exchange.js`, `assets/i18n/shors-algorithm.js`
- **Verification:** `i18n-check.js --coverage` scoped to each namespace returned zero findings after each fix; re-ran full `--coverage --all` in Task 3's sweep with zero findings across all 16 pages.
- **Committed in:** `384ec59` (Task 1), `29e4020` (Task 2), `184457b` (Task 3) — each fix is part of its own task's single commit, not a separate commit.

---

**Total deviations:** 1 category (Rule 1, cognate-collision rewording), 6 individual values across 4 files.
**Impact on plan:** None of these were architectural or scope changes — purely wording fixes required for the plan's own IDENTICAL-TO-EN gate to pass, exactly as Q-11 anticipates ("Fixes for overflow or untranslated text go into ro/hu/lv wording. Never fix by editing page CSS, markup or script... or by loosening a gate").

## Issues Encountered

None beyond the deviations above. The browser-gate chunks ran noticeably slower than the plan's Q-15 planner-measured estimates in this environment (e.g. Cayley Table's full-mode chunk took 299s against a 168s-for-the-heaviest-page baseline measured at planning time; Fermat's Method 213s). All chunks still completed well within the 10-minute Bash timeout per chunk, and every chunk passed on the first run — no retries, no root-cause fixes needed. Recorded verbatim below for sizing the follow-up Russian/Greek quick task.

## Sweep Results (verbatim)

```
SUPPORTED_LANGS nl,en,de,fr,es,it,pl,pt-BR,pt-PT,sv,nb,ro,hu,lv
ENGINE-SCOPE PASS (byte-exact: SUPPORTED_LANGS line + registry comment line)
DETECT-PARITY PASS 22573 navigator lists (9936 Romanian/Hungarian/Latvian-first)
SWITCHER 16 pages, bad=[]
HTML-NUMSTAT PASS (16 pages, +3/-0 each)
RENDER-PARITY PASS 26312 comparisons (11 existing languages)
NEW-PLURAL PASS 264 selections (all-forms-distinct: ro 10, hu 1, lv 9)
DICT-UNCHANGED PASS (11 existing languages identical to 1f15a00; ro, hu, lv appended in that order in every namespace)
RO-HU-LV-DISTINCT PASS keys=874 shared ro=43 hu=28 lv=23 own-words ro=472 hu=452 lv=318
I18N-CHECK PASS coverage: 16 page(s)
I18N-CHECK PASS header: 16 page(s)
I18N-CHECK PASS includes: 16 page(s)
I18N-CHECK PASS no-locale-number-format: 16 page(s)
I18N-CHECK PASS literals-markup: 16 page(s)
I18N-CHECK PASS literals-js: 16 page(s)
I18N-CHECK PASS api: 342 assertions
I18N-CHECK PASS persistence: 212 assertions
I18N-CHECK PASS smoke: 123 assertions (mutant detected); cross-session run OK
SWITCHER-GATE PASS 12 checks
PLURAL-GATE PASS 25 checks
NEUTRAL-DELTA PASS (+latviesu,latviešu,magyar,romana,română)
LANG-COUNT-DOCS PASS (14 languages, stale lists = 1f15a00 lists not continued by ro/hu/lv)
HARNESS PASS total=2856003 (bigint 75039, core 2712692, layout 56749, namespace 105, store 310, svg 11108)
SHADOW-CHECK PASS --all (15 pages) and --docs
.planning/config.json: absent from `git diff --name-only 1f15a00 HEAD` (confirmed); still an unstaged working-tree modification
```

### i18n-browser.js ALL PASS, by chunk, with CHUNK-TIME (seconds, full mode: en-parity + langs=13 + switch + layout)

| Page | Chunk time |
|---|---|
| index.html | 65s |
| RSA/rsa.html | 127s |
| Sieve Of Eratosthenes/sieve-of-eratosthenes.html | 99s |
| Factor Tree/factor-tree.html | 122s |
| Venn Diagram/venn-diagram.html | 132s |
| Group Isomorphism/group-isomorphism.html | 96s |
| Euclidean Algorithm/euclidean-algorithm.html | 109s |
| Chinese Remainder Theorem/chinese-remainder-theorem.html | 109s |
| Equivalence Wheel/equivalence-wheel.html | 165s |
| Eulers Totient/eulers-totient.html | 125s |
| Cayley Table/cayley-table.html | 299s |
| Square And Multiply/square-and-multiply.html | 134s |
| Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html | 121s |
| Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html | 149s |
| Fermats Method/fermats-method.html | 213s |
| Shors Algorithm/shors-algorithm.html | 121s |

(Task 1's tracer run on the Sieve and Task 2's eleven `langs,layout`-only chunks — `index.html` 33s, `Factor Tree` 54s, `Eulers Totient` 38s, `Venn Diagram` 37s, `Euclidean Algorithm` 52s, `Chinese Remainder Theorem` 40s, `Equivalence Wheel` 49s, `Group Isomorphism` 41s, `Cayley Table` 82s, `Square And Multiply` 43s, `Fermats Method` 134s — ran lighter sub-modes and are not directly comparable to the full-mode times above.)

### HEADER-375 (en/ro/hu/lv, zero overflow, measured header heights)

```
HEADER-375 index.html en data-m="ovf=0 hdrOvf=0 hdrH=270 lang=en"
HEADER-375 index.html ro data-m="ovf=0 hdrOvf=0 hdrH=303 lang=ro"
HEADER-375 index.html hu data-m="ovf=0 hdrOvf=0 hdrH=304 lang=hu"
HEADER-375 index.html lv data-m="ovf=0 hdrOvf=0 hdrH=304 lang=lv"
HEADER-375 Sieve Of Eratosthenes/sieve-of-eratosthenes.html en data-m="ovf=0 hdrOvf=0 hdrH=264 lang=en"
HEADER-375 Sieve Of Eratosthenes/sieve-of-eratosthenes.html ro data-m="ovf=0 hdrOvf=0 hdrH=295 lang=ro"
HEADER-375 Sieve Of Eratosthenes/sieve-of-eratosthenes.html hu data-m="ovf=0 hdrOvf=0 hdrH=264 lang=hu"
HEADER-375 Sieve Of Eratosthenes/sieve-of-eratosthenes.html lv data-m="ovf=0 hdrOvf=0 hdrH=264 lang=lv"
```

(Q-12's planner measurement predicted en 270px / ro 338px / hu 304px / lv 337px on a synthetic-dictionary prototype; the real shipped text measured en 270px / ro 303px / hu 304px / lv 304px on index.html and en 264px / ro 295px / hu 264px / lv 264px on the Sieve — all narrower than Q-12's "Português (Portugal)" ceiling, as predicted.)

## i18n-config Exemptions Touched (reason text extended, no gate logic changed)

| File | Key(s) | Reason extended to name |
|---|---|---|
| `equivalence-wheel.json` | `wheel.nLabel`, `wheel.nRangeLabel` (+ `allowRenderText` mirrors) | Hungarian (`N — modulus` / `Modulus N` cognate) |
| `cayley-table.json` | `cayley.nLabel` (+ mirror); `cayley.identityWordAdditive` (+ mirror) | Hungarian (`N — modulus`); Romanian (`zero` cognate) |
| `chinese-remainder-theorem.json` | `crt.modulusLabel` (+ mirror) | Hungarian (`modulus m` cognate) |
| `square-and-multiply.json` | `sqm.expLabel` (+ mirror); `sqm.modLabel` (+ mirror) | Romanian (`Exponent e`); Hungarian (`Modulus m`) |
| `diffie-hellman-key-exchange.json` | `dh.gLabel` (+ mirror) | Romanian (`Generator g` cognate) |
| `rsa.json` | `rsa.thBit` (+ mirror) | Romanian and Hungarian (`bit` cognate) |

No new per-key exemption was added beyond these existing-key reason extensions — every other ro/hu/lv value that could have collided with English was instead reworded (see Deviations above), per Q-11's "prefer a natural, non-identical rendering" instruction.

## User Setup Required

None - no external service configuration required.

## Human-Check Pending (recorded for end-of-phase/milestone review, per Task 3's own instruction)

A script cannot judge translation quality. The following is **not yet performed** and should be done by a native-or-fluent reader of each language, ideally with a math background, before the next milestone close:

- Review the new ro/hu/lv columns in `06-GLOSSARY.md`, especially the gcd/lcm abbreviations (`cmmdc`/`cmmmc`, `lnko`/`lkkt`, `LKD`/`MKD`), the Latvian eponym transcriptions (Eiklīds, Eilers, Keilijs, Šors, Bezū), the number-theory terms in core-term rows 5, 8, 15, 20 and 32, and the tool names.
- Switch 2-3 sampled pages (e.g. RSA, Euclidean Algorithm, Sieve of Eratosthenes) to each of the three languages via the header and confirm the wording reads naturally, the informal register is consistent, tool names match the glossary, and plural phrases agree with their numbers — try a Sieve run to 100 (25 primes: ro `other` → "25 de numere prime", lv `other`), a Sieve run to 30 (10 primes: ro `few`, lv `zero`), and the Euclidean `gcd(a, 0)` preset (0 steps: ro `few`, lv `zero`, hu `other`).
- Check the Hungarian placeholder rule (no vowel-harmony suffix attached directly to a substituted number or name) and the Latvian `puse`/`uzbrucēja` apposition pattern in RSA and Diffie-Hellman.
- Glance at a tool page at phone width (375px) in each language.

This mirrors the same pending-human-check pattern already recorded (and still pending) for Italian, Polish, Portuguese, Swedish and Norwegian Bokmål from the five prior quick tasks in this series.

## Next Phase Readiness

- Romanian, Hungarian and Latvian are fully shipped and gate-proven; the site now supports fourteen languages end-to-end with zero regressions.
- The data-driven gate-table pattern (`SWITCHER_OPTIONS`, `PLURAL_EXTRA_CATEGORIES`, derived `LANG_CODES`/`NEUTRAL_TOKENS`) continues to need no structural changes for the next language addition — only per-language table rows and dictionary blocks, exactly as this task (following `261002-s7l`'s template) required no new mechanism either.
- Russian and Greek remain the next planned quick task in this series (explicitly out of scope here); the CHUNK-TIME table above gives real-environment sizing data for planning that task's browser-chunk batching.
- No blockers.

## Self-Check: PASSED

- FOUND: assets/nt-i18n.js (contains `'ro'`)
- FOUND: commit 384ec59 (Task 1)
- FOUND: commit 29e4020 (Task 2)
- FOUND: commit 184457b (Task 3)
- FOUND: .planning/quick/261003-0dr-add-romanian-ro-hungarian-hu-and-latvian/261003-0dr-SUMMARY.md

---
*Phase: quick-261003-0dr*
*Completed: 2026-10-03*
