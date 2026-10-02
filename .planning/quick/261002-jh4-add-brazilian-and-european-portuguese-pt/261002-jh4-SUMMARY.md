---
phase: quick-261002-jh4
plan: 01
subsystem: i18n
tags: [i18n, translation, nt-i18n, portuguese, pt-BR, pt-PT, region-tagged-codes, cldr-plural, multi-language]

requires:
  - phase: 06-multi-language-support
    provides: "NT.i18n engine, assets/i18n/ data files, i18n-check.js / i18n-browser.js gate tooling, 06-GLOSSARY.md"
  - phase: quick-261002-fmi
    provides: "Polish as seventh supported language, CLDR plural engine generalization this task builds on; step-for-step template this quick task followed"
provides:
  - "Brazilian Portuguese (pt-BR) and European Portuguese (pt-PT) as the eighth and ninth supported languages across all 16 pages — the project's first region-tagged BCP 47 codes"
  - "Generalized language-code shape in assets/nt-i18n.js: a code is now either a two-letter tag or a region-tagged pt-BR/pt-PT, matched exactly and case-sensitively on every channel (?lang=, cookie, localStorage, storage event, setLang); only detectDefaultLang gained a case-insensitive, region-aware Portuguese branch (bare pt / pt-BR -> pt-BR, any other region -> pt-PT), with valid() and the existing two-letter path left byte-identical"
  - "Complete pt-BR (você register, Brazilian spelling/vocabulary) and pt-PT (tu register, European spelling/vocabulary) dictionaries in every assets/i18n/*.js namespace (site, common, hub, and 15 tool namespaces), with all 11 plural values carrying the CLDR {one, other} shape — pt-BR's one covers counts 0 and 1, pt-PT's covers exactly 1"
  - "Nine-language gate tooling: i18n-check.js LANG_CODES/SWITCHER_OPTIONS/NEUTRAL_TOKENS extended to nine; the switcher option regex now accepts an optional region tag; new --api/--persistence assertions proving the region-tagged codes are exact, case-sensitive, and correctly detected from browser preferences"
  - "Portuguese columns/sections in 06-GLOSSARY.md across all parts (a-f), tagging the pt-BR/pt-PT-specific tone, spelling, vocabulary, clitic-placement and gcd-notation divergences"
  - "Living docs (CLAUDE.md, .claude/CLAUDE.md, PROJECT.md, REQUIREMENTS.md, ROADMAP.md Phase 4 note, codebase/*.md) updated to nine languages and the region-tagged code shape"
affects: [future-i18n-work, phase-4-continued-fractions]

actuals:
  tokens: 76049
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Region-tagged BCP 47 codes generalize NT.i18n's allow-list without touching valid()/fromUrl/fromCookie/fromStorage/persist/decorateLinks/applyHtmlLang/the storage listener/setLang — every one of those stays an exact, case-sensitive string comparison against SUPPORTED_LANGS, so a hyphenated code needs no new escaping or parsing logic anywhere except the one detection branch that must map a raw navigator tag onto it."
    - "detectDefaultLang's new Portuguese branch is intentionally the only case-insensitive, multi-subtag-aware path in the file: it lowercases the tag, splits on - or _, and takes the first later subtag matching 2 letters or 3 digits as the region (skipping script subtags like Latn) — added before the existing two-letter slice/valid() line, which stays byte-identical so every non-Portuguese detection result is provably unchanged (DETECT-PARITY, 6799 navigator lists)."
    - "Per-key cognate exemptions (allowSame/allowRenderText) extended with a reason string naming every language the cognate applies to, rather than one exemption per language — same pattern Italian and Polish established, now covering four keys across three files (sqm.baseLabel, shor.legendBase, fermat.legendFinal, rsa.thBit) plus the cayley.identityWordAdditive 'zero' cognate."
    - "A file that already localizes inline gcd notation per language (rsa.js, shors-algorithm.js) gets mdc( for pt-BR and m.d.c.( for pt-PT, keyed consistently throughout the whole dictionary block — matching the 06-GLOSSARY.md core-term abbreviation table rather than inventing a new convention."

key-files:
  created: []
  modified:
    - assets/nt-i18n.js
    - "all 16 .html pages (two new <option value=\"pt-BR\">/<option value=\"pt-PT\"> lines each, directly after Polski)"
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
    - .planning/phases/06-multi-language-support/i18n-config/square-and-multiply.json
    - .planning/phases/06-multi-language-support/i18n-config/shors-algorithm.json
    - .planning/phases/06-multi-language-support/i18n-config/fermats-method.json
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
  - "Q-01..Q-13 planner-discretion decisions from the plan's objective section were followed as written: switcher position after Polski (pt-BR then pt-PT), você/third-person-imperative register for pt-BR and tu/second-person-singular for pt-PT, Euclides/Eratóstenes conventional forms shared with Spanish, single LANG_CODES/SWITCHER_OPTIONS lists, --smoke left untouched, curly-quote/guillemet convention per variant, mdc(/m.d.c.( notation split, CLDR {one, other} plurals with pt-BR's one covering 0 and 1 and pt-PT's covering exactly 1, authoring flow writing pt-BR first then deriving pt-PT as a real adaptation (never copying an imperative/clitic/progressive verbatim)."
  - "detectDefaultLang's region-aware Portuguese branch is the only case-insensitive, multi-subtag path in the engine, added strictly before the existing byte-identical two-letter slice/valid() line, so DETECT-PARITY could prove every non-Portuguese-first navigator list produces an identical result to the pre-change engine across 6799 synthetic lists (1276 of them Portuguese-first)."
  - "Four existing per-key cognate exemptions (sqm.baseLabel/allowRenderText 'Base b', shor.legendBase/allowRenderText 'base a', fermat.legendFinal/allowRenderText 'final (a+b) x (a-b)', rsa.thBit/allowRenderText 'bit') extended to name Brazilian and European Portuguese alongside Italian and Polish — reason text only, no gate logic changed, matching the precedent from the Italian and Polish quick tasks."
  - "cayley.identityWordAdditive's existing cognate 'zero' exemption reason extended to also name Brazilian and European Portuguese, since both variants' word for the additive identity is the same cognate."
  - "rsa.js and shors-algorithm.js (the two files that already localize inline gcd notation per language) use mdc( consistently for pt-BR and m.d.c.( consistently for pt-PT throughout their whole dictionary block, per 06-GLOSSARY.md's abbreviation table for the greatest-common-divisor core term."

patterns-established:
  - "Adding a tenth language in future would require: one entry in SUPPORTED_LANGS, one entry in LANG_CODES/SWITCHER_OPTIONS/NEUTRAL_TOKENS, one (or two, if region-tagged) <option> line(s) per page, one pt-equivalent block per namespace, a LANG-COUNT-DOCS regex sweep catching stale 'nine languages' prose, and — only if the new language needs region disambiguation like Portuguese — a detectDefaultLang branch following the same lowercase/split/subtag-match pattern added here, proven non-regressive via a DETECT-PARITY-style synthetic navigator-list sweep."

requirements-completed: [QUICK-261002-jh4, I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, I18N-06]

duration: single session
completed: 2026-10-02
status: complete
---

# Quick Task 261002-jh4: Add Brazilian and European Portuguese as eighth and ninth supported languages

**Brazilian Portuguese (`pt-BR`) and European Portuguese (`pt-PT`) now ship as the eighth and ninth fully-translated languages on all 16 pages — the project's first region-tagged BCP 47 codes — with `NT.i18n`'s language-code shape generalized from two-letter-only to region-aware, every gate script and living doc updated to nine languages, and zero regressions.**

## Performance

- **Duration:** single session
- **Tasks:** 3/3 completed
- **Files modified:** 53 (16 HTML pages, 18 i18n data files, 1 gate script, 5 i18n-config files, 1 glossary, 11 living docs/codebase docs, `assets/nt-i18n.js` — `.planning/config.json` deliberately excluded)
- **Commits:** 3 (measured via `git rev-list --count 271a290..HEAD`)

## Accomplishments

- `NT.i18n.SUPPORTED_LANGS` extended to `nl, en, de, fr, es, it, pl, pt-BR, pt-PT` — the engine diff confined to exactly the header comment, the `SUPPORTED_LANGS` line, and `detectDefaultLang` (ENGINE-SCOPE PASS), with `valid()`, `fromUrl`/`fromCookie`/`fromStorage`, `persist`, `decorateLinks`, `applyHtmlLang`, the storage listener, `setLang`, and the plural code all byte-identical to the pre-task engine.
- `detectDefaultLang` gained a region-aware Portuguese branch (lowercase, split on `-`/`_`, first later subtag matching `[a-z]{2}` or `[0-9]{3}` as the region, script subtags like `Latn` skipped) that runs before the existing byte-identical two-letter path: bare `pt` or any `pt-BR`-family tag resolves to `pt-BR`; every other Portuguese region (`pt-PT`, `pt-AO`, `pt-MZ`, …) resolves to `pt-PT`. DETECT-PARITY proved this change leaves every non-Portuguese-first navigator list's result unchanged across 6799 synthetic lists (1276 Portuguese-first).
- All 16 pages carry two identical new `<option value="pt-BR">`/`<option value="pt-PT">` lines immediately after Polski, applied via one `sed -i` pass (+2/-0 lines each, confirmed by `git diff --numstat`).
- Complete pt-BR and pt-PT dictionaries added to all 18 `assets/i18n/*.js` namespaces — every English key and placeholder set preserved exactly; all 11 plural values (sieve 1, euclid 5, cayley 2, totient 1, rsa 1, sqm 1) carry the CLDR `{one, other}` shape, with pt-BR's `one` deliberately selecting at counts 0 and 1 (CLDR `pt` rule, same as French already does) and pt-PT's `one` selecting only at exactly 1; zero coverage findings on the full 16-page `--coverage` sweep.
- Gate tooling generalized: `i18n-check.js`'s `LANG_CODES`/`SWITCHER_OPTIONS`/`NEUTRAL_TOKENS` extended to nine; `checkSwitcherPresent`'s option regex widened to accept an optional `-[A-Z]{2}` region suffix on both `value` and `lang` (SWITCHER-GATE's 11-check self-test proves the old `[a-z]{2}`-only regex would fail, and that the new one still rejects `pt-br`, `pt_BR`, `PT-BR`, a value/lang mismatch, a missing option, and a wrong order). `--api` gained Portuguese `detectDefaultLang` assertions (12 scenarios covering case-insensitivity, underscore separators, script-subtag skipping, bare `pt`, and precedence) and a synthetic `tpt` namespace proving the 0/1-vs-exactly-1 plural split; six new invalid-`setLang` assertions prove `pt`, `PT-BR`, `pt-br`, `pt_BR`, `pt-pt`, and `' pt-BR'` are all rejected case-sensitively with no trimming. `--persistence` gained 8 new precedence/cross-tab/strip-param scenarios proving region-case mismatches fall through every channel exactly like any other invalid code.
- `06-GLOSSARY.md` gained pt-BR/pt-PT columns across every section: tone/register/punctuation/spelling/vocabulary/grammar divergence (a), 16 tool names (b), 53 core terms (c), proper nouns with the shared Euclides/Eratóstenes forms (d), the numerals/notation separator-convention note (e), and the common-vocabulary table (f).
- Every living doc and codebase doc (`CLAUDE.md`, `.claude/CLAUDE.md`, `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`'s Phase 4 note, and all seven `.planning/codebase/*.md` files) now states nine languages and the region-tagged code shape; the `.claude/CLAUDE.md` GSD-mirror lines are byte-identical to their `.planning/codebase/` sources (`shadow-check.js --docs` PASS).
- English output stays byte-identical on all 16 pages (`en-parity IDENTICAL` on every page), every existing nl/en/de/fr/es/it/pl dictionary value is unchanged from commit `271a290` (`DICT-UNCHANGED PASS`), and the unmodified render path produces identical output for those seven languages across 16,744 comparisons (`RENDER-PARITY PASS`).

## Task Commits

1. **Task 1: Tracer — pt-BR and pt-PT end-to-end on the Sieve of Eratosthenes (region-tagged codes in the engine, both switcher options on all 16 pages, nine-language gates, glossary, site/common/sieve dictionaries)** - `9bfb5d4` (feat)
2. **Task 2: pt-BR and pt-PT for the hub and eight lighter tools, and every living doc moved to nine languages** - `56f7892` (feat)
3. **Task 3: pt-BR and pt-PT for the six heaviest tools and the consolidated nine-language sweep** - `b9dd62d` (feat)

**Plan head before:** `271a290c63889fa78a922a4ab873e9f65e2756cb`
**Plan head after:** `b9dd62d`

## Deviations from Plan

None — plan executed exactly as written. No architectural decisions, bugs, or blocking issues were encountered; every per-key cognate exemption touched was explicitly anticipated by the plan's Q-11.

### Per-key cognate exemptions touched (not a deviation — explicitly anticipated by Q-11)

| File | Key | Portuguese cognate | Reason string updated |
|---|---|---|---|
| `i18n-config/cayley-table.json` | `cayley.identityWordAdditive` | "zero" | Extended existing Italian/Polish-cognate reason to also name Brazilian and European Portuguese |
| `i18n-config/rsa.json` | `rsa.thBit` / rendered `"bit"` | "bit" | Extended existing nl/fr/es/it/pl reason to also name Brazilian and European Portuguese |
| `i18n-config/square-and-multiply.json` | `sqm.baseLabel` / rendered `"Base b"` | "base" | Extended existing fr/es/it reason to also name Brazilian and European Portuguese |
| `i18n-config/shors-algorithm.json` | `shor.legendBase` / rendered `"base a"` | "base" | Extended existing fr/es/it reason to also name Brazilian and European Portuguese |
| `i18n-config/fermats-method.json` | `fermat.legendFinal` / rendered `"final (a+b) x (a-b)"` | "final" | Extended existing fr/es reason to also name Brazilian and European Portuguese |

No existing `nl/en/de/fr/es/it/pl` content, key, or key order was touched in any dictionary file. No gate assertion was deleted or loosened — assertion counts only grew (`--api` 213 > 200 required, `--persistence` 129 > 120 required).

## Known Stubs

None — no hardcoded empty values, placeholder text, or unwired data sources were introduced by this plan.

## Pending Human-Check

Per the plan's `<human-check>` in Task 3's verify block, translation quality and the Q-12 header-height consequence cannot be judged by a script. **Not yet performed** — a reader of Brazilian Portuguese and a reader of European Portuguese, ideally with a mathematics background, should, before this is considered fully reviewed:

1. Review the new pt-BR/pt-PT columns in `06-GLOSSARY.md`.
2. Switch 2-3 sampled pages (e.g. RSA, Euclidean Algorithm, Sieve of Eratosthenes) to each variant via the header and confirm the wording reads naturally, that pt-BR uses **você** and pt-PT uses **tu** consistently, that spelling and vocabulary match the variant (fatoração/fatorização, arquivo/ficheiro, registro/registo, compartilhado/partilhado, mdc(/m.d.c.(, bilhão/mil milhões), and that tool names match the glossary.
3. Try the Euclidean `gcd(a, 0)` preset (0 steps): confirm pt-BR shows the singular form by CLDR rule ("1 etapa") while pt-PT shows the plural ("0 etapas"), and run a Sieve search to confirm plural phrases agree with their numbers in both variants.
4. **Decide on the Q-12 header-height consequence**: "Português (Portugal)" is the longest autonym in the switcher, so it widens the native `<select>` even when a different language is active (English included), which in turn makes the tool-page header wrap one extra row at narrow widths. Measured at 375px (see below): `index.html` grows from 270px (en) to 337px (pt-BR/pt-PT); the Sieve grows from 264px (en) to 295px (pt-BR/pt-PT). There is **zero horizontal overflow** in any language at 375px (HEADER-375 confirms this) — the only visible change is header *height*. No page markup, CSS, or label was changed to produce or avoid this; it is a direct, unavoidable consequence of the locked label text. The human reviewer should decide whether this taller header at narrow widths is acceptable as-is or merits a follow-up (e.g. a narrower abbreviated label, an icon-only compact mode, or accepting it).

This is recorded here for end-of-phase/end-of-milestone review, per the plan's own instruction — it does not block this quick task's completion since every automated gate is green. The pending Italian and Polish human-checks from quick tasks 261002-c77 and 261002-fmi are also still outstanding and unrelated to this task.

## Verify Block Results (Task 3's consolidated sweep — single source of completion evidence)

```
I18N-CHECK PASS coverage: 16 page(s)
I18N-CHECK PASS header: 16 page(s)
I18N-CHECK PASS includes: 16 page(s)
I18N-CHECK PASS no-locale-number-format: 16 page(s)
I18N-CHECK PASS literals-markup: 16 page(s)
I18N-CHECK PASS literals-js: 16 page(s)
I18N-CHECK PASS api: 213 assertions          (> 200 required)
I18N-CHECK PASS persistence: 129 assertions  (> 120 required)
I18N-CHECK PASS smoke: 123 assertions (mutant detected); cross-session run OK
SUPPORTED_LANGS nl,en,de,fr,es,it,pl,pt-BR,pt-PT
ENGINE-SCOPE PASS
DETECT-PARITY PASS 6799 navigator lists (1276 Portuguese-first)
html numstat vs 271a290: each of 16 pages exactly +2/-0 (16/16)
RENDER-PARITY PASS 16744 comparisons (existing seven languages identical to the 271a290 engine)
PT-PLURAL PASS 132 selections (11 plural values x 6 counts x 2 variants)
DICT-UNCHANGED PASS (pt-BR and pt-PT present in every namespace)
LANG-COUNT-DOCS PASS
PT-VARIANT PASS differing=416/885 (site-wide, need >= 50; zero forbidden-marker-word violations)
```

**i18n-browser.js ALL PASS on all 16 pages** (en-parity IDENTICAL, langs PASS langs=8, switch PASS langs=8, layout PASS):

```
index                               ALL PASS  (en-parity snaps=1,  langs snaps=1  langs=8, switch points=1 langs=8)
sieve-of-eratosthenes               ALL PASS  (en-parity snaps=11, langs snaps=11 langs=8, switch points=2 langs=8)
factor-tree                         ALL PASS  (en-parity snaps=29, langs snaps=25 langs=8, switch points=1 langs=8)
venn-diagram                        ALL PASS  (en-parity snaps=30, langs snaps=14 langs=8, switch points=2 langs=8)
euclidean-algorithm                 ALL PASS  (en-parity snaps=18, langs snaps=18 langs=8, switch points=2 langs=8)
chinese-remainder-theorem           ALL PASS  (en-parity snaps=9,  langs snaps=9  langs=8, switch points=2 langs=8)
equivalence-wheel                   ALL PASS  (en-parity snaps=26, langs snaps=22 langs=8, switch points=2 langs=8)
eulers-totient                      ALL PASS  (en-parity snaps=13, langs snaps=13 langs=8, switch points=2 langs=8)
cayley-table                        ALL PASS  (en-parity snaps=21, langs snaps=17 langs=8, switch points=2 langs=8)
group-isomorphism                   ALL PASS  (en-parity snaps=17, langs snaps=13 langs=8, switch points=1 langs=8)
square-and-multiply                 ALL PASS  (en-parity snaps=16, langs snaps=16 langs=8, switch points=2 langs=8)
diffie-hellman-key-exchange         ALL PASS  (en-parity snaps=24, langs snaps=24 langs=8, switch points=2 langs=8)
elliptic-curve-diffie-hellman       ALL PASS  (en-parity snaps=21, langs snaps=21 langs=8, switch points=2 langs=8)
rsa                                 ALL PASS  (en-parity snaps=14, langs snaps=14 langs=8, switch points=3 langs=8)
fermats-method                      ALL PASS  (en-parity snaps=17, langs snaps=17 langs=8, switch points=2 langs=8)
shors-algorithm                     ALL PASS  (en-parity snaps=15, langs snaps=13 langs=8, switch points=2 langs=8)
```

**HEADER-375 (zero horizontal overflow in every language; header heights recorded for the Q-12 human decision above):**

```
HEADER-375 index.html                                       en    ovf=0 hdrOvf=0 hdrH=270
HEADER-375 index.html                                       pt-BR ovf=0 hdrOvf=0 hdrH=337
HEADER-375 index.html                                       pt-PT ovf=0 hdrOvf=0 hdrH=337
HEADER-375 Sieve Of Eratosthenes/sieve-of-eratosthenes.html  en    ovf=0 hdrOvf=0 hdrH=264
HEADER-375 Sieve Of Eratosthenes/sieve-of-eratosthenes.html  pt-BR ovf=0 hdrOvf=0 hdrH=295
HEADER-375 Sieve Of Eratosthenes/sieve-of-eratosthenes.html  pt-PT ovf=0 hdrOvf=0 hdrH=295
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

**Task 1's SWITCHER-GATE and PLURAL-GATE self-tests** (prove the modified gates are strict, not loosened):

```
SWITCHER-GATE PASS 11 checks
PLURAL-GATE PASS 8 checks
```

**`.planning/config.json` isolation check:**

```
git diff --name-only 271a290 HEAD -- .planning/config.json   -> (empty)
git status --short .planning/config.json                      -> " M .planning/config.json" (unstaged, as expected)
```

## Self-Check: PASSED

- Verified files exist on disk: `assets/nt-i18n.js`, `assets/i18n/site.js`, `assets/i18n/sieve-of-eratosthenes.js`, `assets/i18n/hub.js`, `assets/i18n/rsa.js`, `assets/i18n/shors-algorithm.js`, `.planning/phases/06-multi-language-support/06-GLOSSARY.md`, `.planning/phases/06-multi-language-support/i18n-config/rsa.json` — all FOUND.
- Verified commits exist in `git log --oneline --all`: `9bfb5d4`, `56f7892`, `b9dd62d` — all FOUND.
- Verified `.planning/config.json` is absent from `git diff --name-only 271a290 HEAD` and still shows as an unstaged modification in `git status --short` — confirmed.
- No missing items.
