---
phase: quick-261002-fmi
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "assets/nt-i18n.js"
  - "index.html"
  - "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
  - "Factor Tree/factor-tree.html"
  - "Venn Diagram/venn-diagram.html"
  - "Euclidean Algorithm/euclidean-algorithm.html"
  - "Chinese Remainder Theorem/chinese-remainder-theorem.html"
  - "Equivalence Wheel/equivalence-wheel.html"
  - "Eulers Totient/eulers-totient.html"
  - "Cayley Table/cayley-table.html"
  - "Group Isomorphism/group-isomorphism.html"
  - "Square And Multiply/square-and-multiply.html"
  - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
  - "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html"
  - "RSA/rsa.html"
  - "Fermats Method/fermats-method.html"
  - "Shors Algorithm/shors-algorithm.html"
  - "assets/i18n/site.js"
  - "assets/i18n/hub.js"
  - "assets/i18n/sieve-of-eratosthenes.js"
  - "assets/i18n/factor-tree.js"
  - "assets/i18n/eulers-totient.js"
  - "assets/i18n/venn-diagram.js"
  - "assets/i18n/euclidean-algorithm.js"
  - "assets/i18n/chinese-remainder-theorem.js"
  - "assets/i18n/equivalence-wheel.js"
  - "assets/i18n/cayley-table.js"
  - "assets/i18n/group-isomorphism.js"
  - "assets/i18n/square-and-multiply.js"
  - "assets/i18n/diffie-hellman-key-exchange.js"
  - "assets/i18n/elliptic-curve-diffie-hellman.js"
  - "assets/i18n/rsa.js"
  - "assets/i18n/fermats-method.js"
  - "assets/i18n/shors-algorithm.js"
  - ".planning/phases/06-multi-language-support/i18n-check.js"
  - ".planning/phases/06-multi-language-support/06-GLOSSARY.md"
  - ".planning/phases/06-multi-language-support/i18n-config/cayley-table.json"
  - ".planning/phases/06-multi-language-support/i18n-config/rsa.json"
  - "CLAUDE.md"
  - ".claude/CLAUDE.md"
  - ".planning/PROJECT.md"
  - ".planning/REQUIREMENTS.md"
  - ".planning/ROADMAP.md"
  - ".planning/codebase/STACK.md"
  - ".planning/codebase/CONVENTIONS.md"
  - ".planning/codebase/ARCHITECTURE.md"
  - ".planning/codebase/CONCERNS.md"
  - ".planning/codebase/STRUCTURE.md"
  - ".planning/codebase/TESTING.md"
autonomous: true
requirements: [QUICK-261002-fmi, I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, I18N-06]

estimate:
  tokens: 140000
  raw_tokens: 140000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "On every one of the 16 pages the header language select offers a seventh option, Polski (value pl), directly after Italiano; choosing it renders that page's whole UI in Polish with <html lang=\"pl\">, and i18n-browser.js langs mode reports no UNTRANSLATED segment on any page (langs=6)."
    - "?lang=pl, a stored site-lang=pl cookie or localStorage value, and a browser preference of pl-* all resolve to Polish; an explicit Polish choice is persisted storage-first then cookie, and same-site links carry lang=pl (i18n-check.js --api above 130 and --persistence above 80 assertions)."
    - "A Polish plural value selects its form by the CLDR rule: count 1 renders the one form, 2/4/22 the few form, 0/5/12/25 the many form, a fractional count the other form. This holds for the synthetic --api namespace and for every real plural entry in every namespace (PL-PLURAL-ALL)."
    - "Existing languages are unchanged: English is byte-identical on all 16 pages (en-parity IDENTICAL), every nl/en/de/fr/es/it dictionary value equals commit 365d782 (DICT-UNCHANGED), and the generalized plural selection renders every key of those six languages exactly as the 365d782 engine does, including fr/es/it counts that CLDR classes as many (PLURAL-PARITY)."
    - "--coverage requires Polish plural entries to carry exactly {one, few, many, other} and every other language's plural entries to stay exactly {one, other}; the PLURAL-GATE self-test proves an Italian entry carrying many and a Polish entry missing few are both flagged, and the gates still catch all four Sieve mutants."
    - "Switching to Polish mid-session produces the same DOM as a direct Polish load at that point without resetting tool state, and no page overflows a 375px viewport in Polish by more than English + 8px (i18n-browser.js switch and layout PASS on all 16 pages)."
    - "Every gate enumerates seven languages from one list per gate file, and every living doc states seven languages and the Polish plural shape (LANG-COUNT-DOCS PASS, shadow-check.js --docs PASS)."
  artifacts:
    - path: "assets/nt-i18n.js"
      provides: "SUPPORTED_LANGS with pl as the seventh code; CLDR-category plural selection that falls back to other"
      contains: "'it', 'pl'"
    - path: "assets/i18n/site.js"
      provides: "Polish site and common namespaces"
      contains: "pl: {"
    - path: ".planning/phases/06-multi-language-support/i18n-check.js"
      provides: "seven-code LANG_CODES/SWITCHER_OPTIONS, PLURAL_EXTRA_CATEGORIES-driven plural-shape check, Polish api/persistence assertions"
      contains: "PLURAL_EXTRA_CATEGORIES"
    - path: ".planning/phases/06-multi-language-support/06-GLOSSARY.md"
      provides: "Polish tone, punctuation, plural/numeral-agreement rules, tool names, core terms, proper nouns, common vocabulary"
      contains: "Sito Eratostenesa"
  key_links:
    - from: "header <option value=\"pl\"> on all 16 pages"
      to: "NT.i18n.setLang('pl') via the select change handler in assets/nt-i18n.js"
      via: "valid() exact-match against SUPPORTED_LANGS"
      pattern: "<option value=\"pl\" lang=\"pl\">Polski</option>"
    - from: "resolveTemplate in assets/nt-i18n.js"
      to: "the one/few/many/other members of every plural value in assets/i18n/*.js"
      via: "uncollapsed Intl.PluralRules(currentLang).select(count), own-property lookup, fallback to other"
      pattern: "hasOwnProperty\\.call\\(entry, cat\\)"
    - from: "i18n-check.js checkDictionaries"
      to: "expectedPluralCategories / checkPluralEntry / pluralCategoryFindings"
      via: "PLURAL_EXTRA_CATEGORIES = { pl: [few, many] }"
      pattern: "PLURAL_EXTRA_CATEGORIES"
    - from: "i18n-browser.js langs/switch/layout"
      to: "i18n-check.js LANG_CODES export (code unchanged, now seven codes)"
      via: "NON_EN_LANGS = LANG_CODES minus en"
      pattern: "i18nCheck\\.LANG_CODES"
    - from: ".claude/CLAUDE.md GSD-marked stack/conventions/architecture lines"
      to: ".planning/codebase/STACK.md, CONVENTIONS.md, ARCHITECTURE.md"
      via: "verbatim mirror (shadow-check.js --docs MIRROR-DRIFT)"
      pattern: "nl, en, de, fr, es, it, pl"
---

<objective>
Add Polish (`pl`) as a seventh supported language site-wide, following quick task 261002-c77 (Italian) step for step. That means the engine allow-list, a seventh switcher option on all 16 pages, a complete Polish dictionary in all 18 namespaces (site + common, hub, 15 tools), a Polish column in 06-GLOSSARY.md, seven-language gate tooling and seven-language docs. On top of the Italian template, generalize plural selection so Polish can use its four CLDR categories (one/few/many/other), with no change for the six existing languages. English output stays byte-identical.

Purpose: a visitor whose browser prefers Polish, or who picks Polski in the header, gets every page fully in Polish. Polish has grammatically correct plurals ("1 liczbę pierwszą / 2 liczby pierwsze / 5 liczb pierwszych"). The language has the same persistence, cross-tab sync, link carry and no-reset re-render as the other six.

Output: a `pl: {...}` block after `it` in each of the 17 data files; one new switcher line per page; exactly five changed lines in `assets/nt-i18n.js`; an `i18n-check.js` that covers seven languages and knows Polish's plural shape; an updated glossary and living docs.

Baseline: HEAD `365d782` at planning time is the fixed baseline for every "unchanged" check (DICT-UNCHANGED, PLURAL-PARITY, numstat).

Execution environment: run everything in the main checkout (no worktree). Stage files by explicit path only, never with `git add -A`, `git add .` or `git commit -a`. The unrelated modified `.planning/config.json` and the untracked scratch files (`scratchpad`, `_scratchpad`, `.gsd/`, `.planning/state.json`, `.planning/ui-reviews/`, etc.) must never be staged.

**Planner-discretion decisions.** This quick task has no CONTEXT.md. The decisions are recorded here and referenced as Q-NN in task actions.
- Q-01 Switcher position: Polski goes directly after Italiano. The existing order is untouched, and the new line is byte-identical on all 16 pages, so `--header`'s canonical-header identity gate holds.
- Q-02 Register: informal **ty**, with 2nd-person-singular imperatives (`naciśnij`, `wybierz`, `zobacz`, `wpisz`, `kliknij`). This matches nl je / de du / es tú / it tu.
- Q-03 Eponyms:
  - Euclid → **Euklides** and Eratosthenes → **Eratostenes**, the conventional Polish forms.
  - Euler, Fermat, Cayley, Venn, Shor, Bézout, Diffie and Hellman keep their spelling but take regular Polish case endings in prose (Eulera, Fermata, Cayleya, Venna, Shora, Bézouta, Diffiego-Hellmana). This is standard Polish morphology, not a respelling.
  - Alice and Eve stay indeclinable (feminine foreign names ending in a consonant sound).
  - Bob may decline (Boba, Bobowi) only where the name is literal text inside a value. A name that arrives through a placeholder must sit in a nominative slot.
  - RSA, DH, ECDH and Sun Tzu are invariant.
- Q-04 Gate language lists: i18n-check.js keeps ONE `LANG_CODES` and ONE `SWITCHER_OPTIONS` list, each gaining `pl`. i18n-browser.js derives from the exported `LANG_CODES` and needs no edit. The `--api` SUPPORTED_LANGS pin stays an independent hand-written sorted literal, so an engine/gate mismatch is still caught.
- Q-05 `--smoke` keeps its existing fr/es/de probe and `buildExpected` unchanged. Polish runtime coverage comes from i18n-browser.js on all 16 pages.
- Q-06 Punctuation:
  - Polish quotes, if ever needed, are „…” (U+201E/U+201D).
  - No space before `:` `;` `?` `!`.
  - Headings and tool names use sentence case (first word and proper nouns only), like fr/es/it.
  - A value that contains a straight ASCII apostrophe must be double-quoted, like the French nav values in site.js.
- Q-07 Fixes for overflow or untranslated text go into Polish wording. For a genuine Polish cognate, the fix is a per-key reasoned i18n-config exemption: Polish `bit` and `zero` extend the existing rsa.json / cayley-table.json reasons. Never fix these by editing page CSS, markup or script (that breaks en-parity), and never by loosening a gate.
- Q-08 Polish plural forms:
  - Every English `{one, other}` value becomes a Polish `{one, few, many, other}` value, in that key order.
  - `one` = exactly 1. `few` = 2–4, 22–24, 32–34 … but NOT 12–14. `many` = 0, 5–21, 25–31 …
  - `other` is CLDR's non-integer category. It is reached only by fractional counts or the engine's no-Intl fallback, so it reuses the `many` wording. This follows gettext's three-form Polish practice, and the many wording is right for most non-1 counts if Intl is missing.
  - Every placeholder of English `other` appears in `few`, `many` and `other`.
- Q-09 Numeral agreement: in Polish the noun after a numeral changes with the numeral's value, and only an entry's `count` param can select a form. So any number that is not the entry's count, and any number inside a plain-string value, must be phrased so that no surrounding word depends on its value. Use a label form (`X: {n}`, `liczba X: {n}`) or a symbol/abbreviation (`{ms} ms`, `{a} × {b}`). Never inflect a Polish noun for one fixed number. Examples: totient.bannerDone's `{phi}`, euclid.nestedNoteCapped's `{cap}`.
- Q-10 Plural engine generalization:
  - `pluralCategory` returns the raw `Intl.PluralRules` category, and `resolveTemplate` selects the entry's own property for that category, falling back to `other`.
  - For nl/en/de/fr/es/it this is behavior-identical. Their entries carry only one/other, and the extra category they can produce (fr/es/it `many` for exact multiples of 1,000,000 in CLDR 48) has no entry key, so it falls back to `other` exactly as the old collapse did. PLURAL-PARITY proves this against 365d782.
- Q-11 Coverage plural shape: use an explicit per-language map, `PLURAL_EXTRA_CATEGORIES = { pl: ["few", "many"] }`. Do NOT derive the expected shape from `Intl.PluralRules` for every language: CLDR gives fr/es/it a `many` category, so deriving would change or loosen their check. A separate guard requires each mapped language's expected set to equal its full Intl category set.

**Assumption-delta decision.** The scan returned skipped/phase_unresolved; this is recorded per the orchestrator note. Primary noun: plural dictionary value. Decision: **promote**. The `{one, other}` value is generalized into a CLDR-category map selected by `entry[cat]` with an `other` fallback, and existing `{one, other}` values remain valid unchanged. This is not add-alongside: there is no second plural code path and no Polish special case in the engine.

**Explicit non-targets:**
- Any page's inline `<style>`/`<script>`, `assets/site.css`, `assets/theme.js`.
- `.planning/phases/06-multi-language-support/i18n-browser.js`: it needs no edit, because it derives from `LANG_CODES`. A required edit is a deviation.
- Every nl/en/de/fr/es/it dictionary value, key and key order.
- Historical artifacts other than 06-GLOSSARY.md, i18n-check.js and the two listed i18n-config files. This includes the Phase 6 06-0x PLAN/SUMMARY/VALIDATION/VERIFICATION/UAT files and the 261002-c77 PLAN/SUMMARY.
- ROADMAP.md's Phase 6 section. Only the forward-looking Phase 4 note changes.
- `.planning/config.json` and every untracked scratch file.

**Source coverage audit** (no CONTEXT.md and no RESEARCH.md for this quick task, so there are no D-NN or research rows):

| Source | ID | Item | Task | Status |
|---|---|---|---|---|
| GOAL | — | Polish as seventh language site-wide; English byte-identical | 1, 2, 3 | COVERED |
| REQ | QUICK-261002-fmi | Full quick-task description | 1, 2, 3 | COVERED |
| REQ | I18N-01 | Switcher lists Polski on every page | 1 | COVERED |
| REQ | I18N-02 | Re-render without state reset (switch mode, langs=6) | 1, 3 | COVERED |
| REQ | I18N-03 | Full translation, same key sets / placeholders / plural forms (Polish CLDR forms) | 1, 2, 3 | COVERED |
| REQ | I18N-04 | Persistence, detection, link carry, invalid-code rejection for pl | 1 | COVERED |
| REQ | I18N-05 | No regression (en-parity, DICT-UNCHANGED, PLURAL-PARITY) | 1, 2, 3 | COVERED |
| REQ | I18N-06 | Numerals never locale-formatted (glossary (e), --no-locale-number-format) | 1, 3 | COVERED |
| TASK-DESC | — | 'pl' in NT.i18n SUPPORTED_LANGS | 1 | COVERED |
| TASK-DESC | — | Polski option after Italiano on all 16 pages | 1 | COVERED |
| TASK-DESC | — | Complete Polish dictionaries in all 18 namespaces | 1 (site, common, sieve), 2 (hub + 8), 3 (6) | COVERED |
| TASK-DESC | — | Polish column in 06-GLOSSARY.md | 1 | COVERED |
| TASK-DESC | — | LANG_CODES / SWITCHER_OPTIONS in i18n-check.js | 1 | COVERED |
| TASK-DESC | — | Docs move to seven languages | 1 (glossary, gate, 2 data headers), 2 (living docs, 9 data headers), 3 (6 data headers) | COVERED |
| TASK-DESC | — | Plural engine: entry[cat] when present, else other; existing languages byte-identical | 1 | COVERED |
| TASK-DESC | — | --coverage plural-shape accepts pl few/many only for pl | 1 | COVERED |
| TASK-DESC | — | --api assertions for 1/2/5/22/25 in pl | 1 | COVERED |
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.planning/quick/261002-c77-add-italian-it-as-a-sixth-supported-lang/261002-c77-PLAN.md
@.planning/quick/261002-c77-add-italian-it-as-a-sixth-supported-lang/261002-c77-SUMMARY.md
@.planning/phases/06-multi-language-support/06-GLOSSARY.md
@assets/nt-i18n.js
@assets/i18n/site.js
@assets/i18n/sieve-of-eratosthenes.js

Gate scripts. Both are large, so read only the ranges named here:
- `.planning/phases/06-multi-language-support/i18n-check.js` (2018 lines):
  - pluralCategoryNode ~89-97, translateNode ~106-119
  - doApi: SUPPORTED_LANGS pin ~716, plural checks ~772-780, SUPPORTED_LANGS.forEach setLang loop ~871, detectDefaultLang block ~883-897
  - doPersistence: round-trip loop ~969, explicit-load scenario list ~1015-1020
  - LANG_CODES / SWITCHER_OPTIONS ~1111-1127, NEUTRAL_TOKENS autonym row ~1166-1175
  - checkSwitcherPresent ~1353-1370
  - checkDictionaries ~1566-1645 (inline plural branch ~1617-1631)
  - module.exports ~2009-2018
- `.planning/phases/06-multi-language-support/i18n-browser.js` (566 lines), read-only:
  - NON_EN_LANGS ~48-52 (derived from i18nCheck.LANG_CODES)
  - stripI18nArtifacts ~254, which strips the whole lang-switch label, so the new option never reaches en-parity.

Observed at planning time (HEAD 365d782):
- Engine lines in `assets/nt-i18n.js`:
  - :59 is the single SUPPORTED_LANGS line.
  - :184 collapses the Intl category to one/other; :187 is the no-Intl fallback.
  - :205 selects `entry.one` only for category one, else `entry.other`.
  - :65 and :191 are the only comment lines that describe the plural shape.
- All 16 tracked pages carry the identical line `        <option value="it" lang="it">Italiano</option>` (8-space indent, LF endings). Page paths contain spaces.
- Data files: 17 files / 18 namespaces register `{ nl, en, de, fr, es, it }`, with 874 English keys. There are 11 English plural entries: sieve 1 (banner.done), euclid 5, cayley 2, totient 1, rsa 1, sqm 1. All are `{one, other}` with identical one/other placeholders, and each call site passes `count`.
- Runtime: node v22.23.1 (ICU 78.2, CLDR 48), Chrome 153. Plural categories:
  - nl/en/de: one, other.
  - fr/es/it: many, one, other (1000000 → many).
  - pl: few, many, one, other (0 many, 1 one, 2–4 few, 5–21 many, 22 few, 25 many, 1.5 other).
- Gate baselines: `--api` = 130 assertions, `--persistence` = 80, `--all` PASS on 16 pages, `--coverage --report` = 0 findings.
- Planner prototypes:
  - The PLURAL-PARITY command below passes (14418 comparisons) for the five-line engine change and fails (96 diffs) for a mutant that mishandles `many`.
  - The LANG-COUNT-DOCS regex set below flags every current 6-language statement. It passes on seven-language forms and on module counts such as "the six `nt-*.js` modules".
- i18n-config exemptions:
  - `cayley-table.json` has allowSame `cayley.identityWordAdditive` (Italian `zero`).
  - `rsa.json` has allowSame `rsa.thBit` plus allowRenderText `bit` (nl/fr/es/it).
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Tracer — Polish end-to-end on the Sieve of Eratosthenes (plural engine, switcher on all 16 pages, seven-language gates with Polish plural shape, glossary, site/common/sieve dictionaries)</name>
  <files>assets/nt-i18n.js, index.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factor Tree/factor-tree.html, Venn Diagram/venn-diagram.html, Euclidean Algorithm/euclidean-algorithm.html, Chinese Remainder Theorem/chinese-remainder-theorem.html, Equivalence Wheel/equivalence-wheel.html, Eulers Totient/eulers-totient.html, Cayley Table/cayley-table.html, Group Isomorphism/group-isomorphism.html, Square And Multiply/square-and-multiply.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html, RSA/rsa.html, Fermats Method/fermats-method.html, Shors Algorithm/shors-algorithm.html, .planning/phases/06-multi-language-support/i18n-check.js, .planning/phases/06-multi-language-support/06-GLOSSARY.md, assets/i18n/site.js, assets/i18n/sieve-of-eratosthenes.js</files>
  <precondition>`command -v google-chrome` succeeds (headless gates), and `git merge-base --is-ancestor 365d782 HEAD` succeeds (365d782 is the DICT-UNCHANGED / PLURAL-PARITY / numstat baseline).</precondition>
  <action>
Wire one Polish path through every layer, proven on the Sieve page. The Sieve's `banner.done` is a plural entry, so the tracer also exercises Polish few/many end-to-end.

1. Engine (per Q-10). In `assets/nt-i18n.js` change exactly these five lines and nothing else (numstat vs 365d782 must be 5/5):
   a. The SUPPORTED_LANGS line: append `'pl'` as the seventh code (order nl, en, de, fr, es, it, pl).
   b. The registry comment line (~65): describe the value as a string or a CLDR plural-category object, `{ one, other }`, plus few/many for pl. Keep it on its one line.
   c. pluralCategory's Intl branch (~184): return the category from `new Intl.PluralRules(lang).select(count)` as-is, instead of collapsing it to one/other. The no-Intl fallback line (~187) stays byte-identical.
   d. resolveTemplate's comment line (~191): say the template is already plural-selected by CLDR category when the entry is a plural object. Keep it on one line.
   e. The selection line (~205):
      - Pick `entry[cat]` when `Object.prototype.hasOwnProperty.call(entry, cat)` holds, else `entry.other`.
      - Use the own-property guard, never the `in` operator or an unguarded index, for prototype-chain safety (lookupEntry uses the same guard).
      - The following `typeof tpl === 'string'` guard stays.
   valid(), detectDefaultLang(), persistence and the select handler are already generic over the list.

2. Switcher (per Q-01). On all 16 tracked `.html` pages, insert one new line immediately after the Italiano option line:
   - Same 8-space indentation, no `selected` attribute: an option with value `pl`, lang `pl`, label `Polski`.
   - Use one `sed -i` append driven by `git ls-files -z '*.html' | xargs -0 sed -i ...` (paths contain spaces), so the line is byte-identical everywhere.
   - No other markup, CSS or inline-script edit on any page.

3. i18n-check.js (per Q-04, Q-11). No assertion is deleted or loosened; assertion counts only grow.
   a. Lists:
      - `LANG_CODES` gains `"pl"` (seven codes in switcher order).
      - Its comment names the seven codes as one unbroken clause on a single line. Italian deviation 1: a code list wrapped across comment lines evaded LANG-COUNT-DOCS.
      - `SWITCHER_OPTIONS` gains `{ value: "pl", lang: "pl", label: "Polski" }` as its last entry.
      - Both comments' count words become seven.
   b. The NEUTRAL_TOKENS autonym row adds `"polski"`, and its comment names the seven autonyms.
   c. pluralCategoryNode mirrors engine change 1c: it returns the raw category and the fallback stays unchanged. translateNode already selects by own property with an `other` fallback, so leave it.
   d. Plural shape. Next to `LANG_CODES`, add a module-level `PLURAL_EXTRA_CATEGORIES = { pl: ["few", "many"] }`. Its comment says:
      - These are the CLDR categories, beyond English's {one, other}, that a language's plural values must carry.
      - The map is deliberately explicit rather than derived from Intl for every language, because CLDR gives fr/es/it a many category (exact multiples of 1,000,000). Their values stay {one, other}, and the engine falls back to other.

      Add three functions and export them, together with `PLURAL_EXTRA_CATEGORIES`, from `module.exports`:
      - `expectedPluralCategories(lang)` returns the sorted array of `one`, `other` plus that language's extras: few,many,one,other for pl, one,other for every other language.
      - `checkPluralEntry(ns, key, lang, entry, enEntry)` returns a findings array and absorbs the existing inline plural branch of checkDictionaries:
        - (i) If `entry` is not an object whose sorted keys equal `expectedPluralCategories(lang)`, return exactly one finding, `PLURAL-SHAPE ns.key.lang: expected {` + the categories joined with `, ` + `}`. Every existing language's message therefore stays byte-identical (`expected {one, other}`).
        - (ii) Otherwise, for each expected category in sorted order, emit `EMPTY-VALUE ns.key.cat.lang` and `DICT-MARKUP ns.key.cat.lang` exactly as today.
        - (iii) Placeholders: compare `other` with English other's placeholders, keeping today's message format (`PLACEHOLDERS ns.key.lang: expected [...] got [...]`). Compare each extra category (few, many) with English other's placeholders too, with message `PLACEHOLDERS ns.key.cat.lang: expected [...] got [...]`. `one` stays unchecked, as today.
      - `pluralCategoryFindings()`, for each language in `PLURAL_EXTRA_CATEGORIES`:
        - Push `PLURAL-CATEGORIES lang: not in LANG_CODES` when the language is absent from `LANG_CODES`.
        - Push `PLURAL-CATEGORIES lang: expected [...] but Intl.PluralRules reports [...]` when `expectedPluralCategories(lang)` differs from the sorted `resolvedOptions().pluralCategories` of `new Intl.PluralRules(lang)`. A Polish category can then never be silently omitted or invented.

      checkDictionaries calls checkPluralEntry in place of its inline plural branch and appends `pluralCategoryFindings()` once. For nl/en/de/fr/es/it the finding set and wording must be byte-identical to today.
   e. `--api`:
      - The `SUPPORTED_LANGS value` pin becomes the hand-written sorted literal `["de", "en", "es", "fr", "it", "nl", "pl"]`, NOT derived from LANG_CODES or the engine.
      - Beside the it checks, add `detectDefaultLang(['pl-PL','en']) -> pl` and `detectDefaultLang(['PL']) -> pl (case-insensitive)`. Keep `pt-BR -> en`.
      - Right after the existing plural checks (before the translateInto block), register a separate synthetic namespace `tp`:
        - en: `count` = { one `{count} file`, other `{count} files` } and `enOnly` = { one `{count} thing`, other `{count} things` }.
        - pl: only `count` = { one `{count} plik`, few `{count} pliki`, many `{count} plików`, other `{count} pliku` }. pl deliberately lacks enOnly.
      - Assert, with self-describing labels:
        - setLang('pl') returns true.
        - tp.count renders `1 plik` at 1, `2 pliki` at 2, `5 plików` at 5, `22 pliki` at 22, `25 plików` at 25, `12 plików` at 12 (teens are many, not few), `0 plików` at 0, and `1.5 pliku` at 1.5 (fraction → other).
        - tp.enOnly at count 5 renders `5 things`: pl falls back to the en value, and the missing many category falls back to other.
        - Then setLang('fr'), and t.count at 1000000 renders `1000000 trucs` (fr's CLDR many falls back to other, behavior unchanged).
      - End the block with setLang('en'), exactly as the existing fr block does. The existing SUPPORTED_LANGS.forEach setLang loop then covers pl automatically.
   f. `--persistence`: the LANG_CODES round-trip loop covers pl automatically. Add the explicit-load scenario `{ opts: { cookie: { initial: "pl" } }, lang: "pl", via: "cookie" }` to the storage-before-cookie scenario list. Its labels stay distinct because they embed the language.
   g. Per Q-05, leave `--smoke` and `buildExpected` untouched.

4. i18n-browser.js needs no edit: NON_EN_LANGS derives from LANG_CODES, so langs/switch/layout cover pl and print `langs=6`.

5. 06-GLOSSARY.md: add Polish wherever the languages are enumerated.
   - Tag new term cells `[ASSUMED]`.
   - Change every 6-language count word in this file's prose to seven, including the section (d) Euler note, section (e) and its autonym sentence.
   - Add a note that the `pl` column was added 2026-10-02 by quick task 261002-fmi beside each existing `it` note.
   - Never write a language list that ends with the Italian autonym followed directly by a closing parenthesis.

   Content per section:
   - (a) Tone row: `Polish (pl) [ASSUMED] | Informal — ty/twój | 2nd-person-singular imperatives (naciśnij, wybierz, zobacz, wpisz, kliknij)`, per Q-02. Add a Polish bullet under punctuation covering Q-06, the four plural forms of Q-08, the numeral-agreement rule of Q-09, and the declension rule of Q-03.
   - (b) Polish tool-name column, in table order: Strona główna; Sito Eratostenesa; Drzewo czynników; Diagram Venna; Algorytm Euklidesa; Chińskie twierdzenie o resztach; Koło równoważności; Funkcja φ Eulera; Tabela Cayleya; Izomorfizm grup; Szybkie potęgowanie; Diffie-Hellman; DH na krzywych eliptycznych; RSA; Metoda Fermata; Algorytm Shora.
   - (c) Polish core-term column, rows 1–53 in order: liczba pierwsza; liczba złożona; czynnik; rozkład na czynniki pierwsze; dzielnik; największy wspólny dzielnik (NWD); najmniejsza wspólna wielokrotność (NWW); iloraz; reszta; moduł; reszta / klasa reszt; kongruencja / przystający; klasa równoważności (klasa abstrakcji); odwrotność modulo n (element odwrotny); względnie pierwsze; funkcja φ Eulera; grupa; grupa addytywna; grupa multiplikatywna; element odwracalny; element neutralny; element odwrotny; rząd elementu; generator / pierwiastek pierwotny; grupa cykliczna; izomorfizm; tabela działania; przemienny; kwadrat liczby całkowitej (liczba kwadratowa); metoda faktoryzacji; wykładnik; podstawa; potęgowanie modularne; rozwinięcie dwójkowe; krok podnoszenia do kwadratu / mnożenia; klucz publiczny; klucz prywatny; para kluczy; wspólny sekret; szyfrować; odszyfrować; tekst jawny; szyfrogram; logarytm dyskretny; metoda siłowa (atak siłowy); krzywa eliptyczna; punkt w nieskończoności; mnożenie przez skalar; wyznaczanie rzędu; okres; przykład; krok; odtwarzanie.
   - (d) Polish proper-noun column per Q-03: Alice; Bob; Eve; RSA; Diffie-Hellman; Euler; Fermat; Cayley; Venn; Shor; Euklides; Eratostenes; Bézout; Sun Tzu. Extend the Note cells to say that pl declines eponyms with regular case endings in prose, and that Alice/Eve are indeclinable in pl.
   - (e) Add Polish to the list of national separator conventions that do not apply.
   - (f) Polish common-vocabulary column: ▶ Odtwórz; ⏸ Pauza; ⏭ Krok; ⏩ Natychmiast; ↺ Resetuj; Prędkość; speed.1–10 = lodowata, wolna, łagodna, żwawa, równa, sprawna, szybka, bardzo szybka, błyskawiczna, niemal natychmiastowa (feminine, agreeing with prędkość); Grupy addytywne; Grupy multiplikatywne.

6. Dictionaries. Append a `pl: { ... }` block after `it` (the it block's closing brace gains a comma) in BOTH namespaces of `assets/i18n/site.js` and in `assets/i18n/sieve-of-eratosthenes.js`.

   Call this procedure P-PL; Tasks 2 and 3 reuse it. Its rules:
   - Exactly the English keys, in English order, with identical placeholders.
   - English `{one, other}` values become `{one, few, many, other}` per Q-08.
   - Emoji/glyph prefixes are kept as in English; numerals and math notation are untouched (glossary (e)); no markup.
   - Tone Q-02, punctuation Q-06, eponyms Q-03, numeral agreement Q-09.

   Values for these files:
   - `site.nav.*` = glossary (b) verbatim; `common.*` = glossary (f) verbatim.
   - brand `Narzędzia teorii liczb`, nav.label `Narzędzia`, lang.label `Język`, theme.toggle `Przełącz tryb dzienny i nocny`.
   - Sieve heading `Sito Eratostenesa`. A banner that tells the user to press a button names it by its Polish label (Odtwórz).
   - sieve `banner.done` follows the pattern `Znaleziono {count} liczbę pierwszą do {n} w {time}.` / `Znaleziono {count} liczby pierwsze …` / `Znaleziono {count} liczb pierwszych …`. Its one/few/many wordings must be pairwise distinct, and other equals many.

   Update each touched file's header comment from the 6-language count to seven supported languages. Where a header describes a plural value's shape as `{ one, other }`, add that pl values carry `{ one, few, many, other }`. Never modify an existing nl/en/de/fr/es/it value, key or key order.

7. Run the verify block. Fix root causes per Q-07: UNTRANSLATED → translate; LAYOUT-OVERFLOW → shorter Polish wording; a PLURAL-PARITY failure → re-check engine edits 1c/1e. Commit the task by explicit paths only.
  </action>
  <verify>
    <automated>node -e 'const fs=require("fs"),vm=require("vm");const c={};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync("assets/nt-i18n.js","utf8"),c);const s=c.NT.i18n.SUPPORTED_LANGS.join(",");console.log("SUPPORTED_LANGS "+s);process.exit(s==="nl,en,de,fr,es,it,pl"?0:1)' && ni=$(git diff --numstat 365d782 -- assets/nt-i18n.js) && test "$(printf '%s' "$ni" | cut -f1,2)" = "$(printf '5\t5')" && node -e 'const fs=require("fs"),cp=require("child_process");const fl=cp.execFileSync("git",["ls-files","-z","*.html"],{encoding:"utf8"}).split("\0").filter(Boolean);const IT="        <option value=\"it\" lang=\"it\">Italiano</option>",PL="        <option value=\"pl\" lang=\"pl\">Polski</option>";const bad=fl.filter(f=>{const L=fs.readFileSync(f,"utf8").split("\n");const i=L.indexOf(IT);return i===-1||L[i+1]!==PL||L.filter(l=>l.includes("value=\"pl\"")).length!==1});console.log("SWITCHER "+fl.length+" pages, bad=["+bad.join(", ")+"]");process.exit(bad.length||fl.length!==16?1:0)' && hd=$(git diff --numstat 365d782 -- '*.html') && printf '%s\n' "$hd" | awk '$1!=1||$2!=0{bad=1} END{exit (bad||NR!=16)}'</automated>
    <automated>node -e 'const fs=require("fs"),vm=require("vm"),cp=require("child_process");const D=fs.readdirSync("assets/i18n").filter(f=>f.endsWith(".js"));const mk=s=>{const c={};c.window=c;vm.createContext(c);vm.runInContext(s,c);for(const f of D)vm.runInContext(fs.readFileSync("assets/i18n/"+f,"utf8"),c);return c.NT.i18n};const O=mk(cp.execFileSync("git",["show","365d782:assets/nt-i18n.js"],{encoding:"utf8"})),N=mk(fs.readFileSync("assets/nt-i18n.js","utf8"));const cat={};const NT={i18n:{register:(n,d)=>{cat[n]=d}}};for(const f of D)vm.runInNewContext(fs.readFileSync("assets/i18n/"+f,"utf8"),{NT,window:{NT}});const C=[];for(let i=0;130>=i;i++)C.push(i);C.push(1000,1000000,2000000,3000000,1.5,0.5,-1,NaN,"7");let n=0;const bad=[];for(const l of ["nl","en","de","fr","es","it"]){O.setLang(l);N.setLang(l);if(O.getLang()!==l||N.getLang()!==l){bad.push("setLang "+l);continue}for(const ns in cat)for(const k in cat[ns].en){const pl=typeof cat[ns].en[k]==="object";for(const c of (pl?C:[undefined])){n++;const p=c===undefined?undefined:{count:c};const a=O.translate(ns+"."+k,p),b=N.translate(ns+"."+k,p);if(a!==b)bad.push(l+" "+ns+"."+k+" count="+c)}}}console.log(bad.length?"PLURAL-PARITY FAIL "+bad.slice(0,5).join(" | "):"PLURAL-PARITY PASS "+n+" comparisons");process.exit(bad.length?1:0)' && node -e 'const fs=require("fs"),vm=require("vm");const c={};c.window=c;vm.createContext(c);for(const f of ["assets/nt-i18n.js","assets/i18n/site.js","assets/i18n/sieve-of-eratosthenes.js"])vm.runInContext(fs.readFileSync(f,"utf8"),c);const I=c.NT.i18n;const cat={};const NT={i18n:{register:(n,d)=>{cat[n]=d}}};vm.runInNewContext(fs.readFileSync("assets/i18n/sieve-of-eratosthenes.js","utf8"),{NT,window:{NT}});const e=(cat.sieve.pl||{})["banner.done"]||{};const W={0:"many",1:"one",2:"few",4:"few",5:"many",12:"many",22:"few",25:"many"};const fill=(t,p)=>String(t).replace(/\{([A-Za-z0-9_]+)\}/g,(w,k)=>k in p?String(p[k]):w);const bad=[];if(!I.setLang("pl"))bad.push("setLang");if(Object.keys(e).join(",")!=="one,few,many,other")bad.push("shape");if(new Set([e.one,e.few,e.many]).size!==3)bad.push("forms-not-distinct");for(const x in W){const p={count:Number(x),n:100,time:"1 ms"};if(I.translate("sieve.banner.done",p)!==fill(e[W[x]],p))bad.push("count "+x)}console.log(bad.length?"PL-PLURAL-E2E FAIL "+bad.join(" | "):"PL-PLURAL-E2E PASS");process.exit(bad.length?1:0)'</automated>
    <automated>node .planning/phases/06-multi-language-support/i18n-check.js --api | awk '{print} /PASS api:/{f=1;ok=($4>130)} END{exit !(f&&ok)}' && node .planning/phases/06-multi-language-support/i18n-check.js --persistence | awk '{print} /PASS persistence:/{f=1;ok=($4>80)} END{exit !(f&&ok)}' && node .planning/phases/06-multi-language-support/i18n-check.js --header --includes --no-locale-number-format --literals --all && node .planning/phases/06-multi-language-support/i18n-check.js --smoke && node -e 'const c=require("./.planning/phases/06-multi-language-support/i18n-check.js");const E=c.expectedPluralCategories,K=c.checkPluralEntry;const en={one:"{count} x",other:"{count} xs"};const p4={one:"{count} a",few:"{count} b",many:"{count} c",other:"{count} d"};const w=o=>Object.assign({},p4,o);const has=(a,re)=>a.some(f=>re.test(f));const t=[["E pl",E("pl").join(","),"few,many,one,other"],["E it",E("it").join(","),"one,other"],["E fr",E("fr").join(","),"one,other"],["E es",E("es").join(","),"one,other"],["E nl",E("nl").join(","),"one,other"],["pl four forms clean",K("t","k","pl",p4,en).length,0],["fr two forms clean",K("t","k","fr",{one:"{count} u",other:"{count} v"},en).length,0],["pl two forms flagged",K("t","k","pl",{one:"{count} a",other:"{count} d"},en).join("|"),"PLURAL-SHAPE t.k.pl: expected {few, many, one, other}"],["it with many flagged",K("t","k","it",{one:"{count} a",many:"{count} m",other:"{count} d"},en).join("|"),"PLURAL-SHAPE t.k.it: expected {one, other}"],["pl few placeholder",has(K("t","k","pl",w({few:"b"}),en),/^PLACEHOLDERS t\.k\.few\.pl: /),true],["pl many markup",has(K("t","k","pl",w({many:"<b>{count}"}),en),/^DICT-MARKUP t\.k\.many\.pl$/),true],["pl few empty",has(K("t","k","pl",w({few:""}),en),/^EMPTY-VALUE t\.k\.few\.pl$/),true],["category guard clean",c.pluralCategoryFindings().length,0],["map is pl only",Object.keys(c.PLURAL_EXTRA_CATEGORIES).join(","),"pl"]];const bad=t.filter(x=>JSON.stringify(x[1])!==JSON.stringify(x[2]));console.log(bad.length?"PLURAL-GATE FAIL "+bad.map(x=>x[0]+"="+JSON.stringify(x[1])).join(" | "):"PLURAL-GATE PASS "+t.length+" checks");process.exit(bad.length?1:0)'</automated>
    <automated>cov=$(node .planning/phases/06-multi-language-support/i18n-check.js --coverage --report "Sieve Of Eratosthenes/sieve-of-eratosthenes.html") && printf '%s\n' "$cov" | grep -q "^I18N-CHECK REPORT" && ! (printf '%s\n' "$cov" | grep -E '^([A-Z-]+ (site|common|sieve)\.|PLURAL-CATEGORIES )') && node -e 'const fs=require("fs"),vm=require("vm"),cp=require("child_process");const ld=s=>{const c={};const NT={i18n:{register:(n,d)=>{c[n]=d}}};vm.runInNewContext(s,{NT,window:{NT}});return c};const bad=[];for(const f of fs.readdirSync("assets/i18n").filter(f=>f.endsWith(".js"))){const o=ld(cp.execFileSync("git",["show","365d782:assets/i18n/"+f],{encoding:"utf8"})),n=ld(fs.readFileSync("assets/i18n/"+f,"utf8"));for(const ns in o)for(const l of ["nl","en","de","fr","es","it"])if(JSON.stringify(o[ns][l])!==JSON.stringify((n[ns]||{})[l]))bad.push(ns+"."+l)}console.log(bad.length?"DICT-CHANGED "+bad.join(" "):"DICT-UNCHANGED PASS");process.exit(bad.length?1:0)'</automated>
    <automated>out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "Sieve Of Eratosthenes/sieve-of-eratosthenes.html") ; rc=$? ; echo "$out" ; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=6" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=6" && for m in untranslated stale-switch en-change overflow; do node .planning/phases/06-multi-language-support/i18n-browser.js "Sieve Of Eratosthenes/sieve-of-eratosthenes.html" --mutant $m | grep -q "MUTANT-DETECTED $m" || exit 1; done</automated>
  </verify>
  <done>
- The allow-list is nl,en,de,fr,es,it,pl, and nt-i18n.js differs from 365d782 by exactly five lines (5/5).
- All 16 pages carry the identical Polski option directly after Italiano, each page +1/-0 lines.
- PLURAL-PARITY PASS: the six existing languages render identically to the 365d782 engine.
- PL-PLURAL-E2E PASS on the real Sieve value.
- --api passes with more than 130 assertions and --persistence with more than 80.
- header/includes/no-locale-number-format/literals PASS on 16 pages, and --smoke PASS.
- PLURAL-GATE PASS: pl requires four forms, every other language stays at two, and an it value carrying many is flagged.
- Zero coverage findings for site/common/sieve and no PLURAL-CATEGORIES finding; DICT-UNCHANGED PASS.
- The Sieve passes en-parity IDENTICAL and langs/switch with langs=6, and all four mutants are still MUTANT-DETECTED.
- 06-GLOSSARY.md has the Polish (a)–(f) entries.
  </done>
</task>

<task type="auto">
  <name>Task 2: Polish for the hub and eight lighter tools, and every living doc moved to seven languages</name>
  <files>assets/i18n/hub.js, assets/i18n/factor-tree.js, assets/i18n/eulers-totient.js, assets/i18n/venn-diagram.js, assets/i18n/euclidean-algorithm.js, assets/i18n/chinese-remainder-theorem.js, assets/i18n/equivalence-wheel.js, assets/i18n/cayley-table.js, assets/i18n/group-isomorphism.js, .planning/phases/06-multi-language-support/i18n-config/cayley-table.json, CLAUDE.md, .claude/CLAUDE.md, .planning/PROJECT.md, .planning/REQUIREMENTS.md, .planning/ROADMAP.md, .planning/codebase/STACK.md, .planning/codebase/CONVENTIONS.md, .planning/codebase/ARCHITECTURE.md, .planning/codebase/CONCERNS.md, .planning/codebase/STRUCTURE.md, .planning/codebase/TESTING.md</files>
  <action>
A. Dictionaries. Apply procedure P-PL (Task 1 step 6) to the nine namespaces `hub` (hub.js), `factorTree`, `totient`, `venn`, `euclid`, `crt`, `wheel`, `cayley`, `iso`.

   For each file:
   - Read its header comment first; it records per-file conventions. For example, the CRT file keeps gcd/lcm notation literal in every language, while the Euclidean file localizes "the GCD" as a standalone prose noun, which in Polish is NWD.
   - Then read only the `en: {` block, plus the `it: {` block when a convention is unclear.
   - Then append the Polish block after `it`.

   Cross-references must stay consistent. Wherever the it block repeats an it `site.nav.*` value or another string byte-for-byte (a hub card title equal to the nav label, a cross-link naming another tool), the Polish value repeats the Polish counterpart byte-for-byte (glossary (b)). Where the hub's English card title deliberately differs from the nav label (Prime Factor Tree, The Equivalence Wheel, Group Isomorphisms), mirror what it/es do.

   File-specific points:
   - `euclid` has five plural values (bannerDone, tileCaptionExact, tileCaptionLeftover, nestedCaption, nestedNoteCapped). Each gets four forms keyed on the value's own count. Every other number in them ({cap}, {index}, {total}, {stepNums}) follows Q-09.
   - `totient.bannerDone` gets four forms; its `{phi}` and `{n}` follow Q-09 (for example a `względnie pierwszych z {n}: {phi}` label shape).
   - `cayley.summaryAdditive` / `summaryMultiplicative` get four forms (element / elementy / elementów). For `cayley.identityWordAdditive`, the Polish word is the genuine cognate `zero`. Per Q-07, extend the existing allowSame reason string for that key in `i18n-config/cayley-table.json` so it names Polish as well as Italian. Change the reason text only, never the gate logic.

   Update each file's header comment from the 6-language count to seven supported languages, plus the plural-shape note where the header describes `{ one, other }`. Never touch existing nl/en/de/fr/es/it content.

B. Docs. The count goes from 6 to 7, and language lists gain `pl` / Polish / Polski; English is still the source of truth. These exact targets were observed at planning time:
   - `CLAUDE.md`:
     - ~38: every new tool ships translated in all seven languages.
     - ~41: every page supports seven languages — nl, en, de, fr, es, it, pl —; a dictionary entry in all seven languages; a new `site.nav.<id>` key in all seven languages. Add one clause to that paragraph's rules: a plural value is a `{one, other}` object in every language except Polish, whose plural values carry `{one, few, many, other}` (the CLDR categories `Intl.PluralRules` returns for pl).
   - `.planning/codebase/STACK.md`:
     - ~62: language list `(nl/en/de/fr/es/it/pl)`.
     - ~63: the Intl.PluralRules sentence states the plural shape as `{one, other}`, or `{one, few, many, other}` for Polish.
   - `.planning/codebase/CONVENTIONS.md` ~93: `all seven languages (nl, en, de, fr, es, it, pl)`.
   - `.planning/codebase/ARCHITECTURE.md` ~115: `seven supported languages (nl, en, de, fr, es, it, pl)`.
   - `.planning/codebase/CONCERNS.md`:
     - ~20: heading says seven translations.
     - ~22: `nl/en/de/fr/es/it/pl` and all seven languages.
     - ~25: the PLURAL-SHAPE mention notes that Polish values must carry `{one, few, many, other}`.
   - `.planning/codebase/STRUCTURE.md` ~200-202: all seven languages (three places). Line ~65's and ~247's module counts stay as they are.
   - `.planning/codebase/TESTING.md`: ~244 `nl/de/fr/es/it/pl`, and ~249 `(nl/de/fr/es/it/pl, plus en)`.
   - `.claude/CLAUDE.md` ~55, ~56, ~145, ~251 sit inside GSD-marked mirror sections whose source is the matching `.planning/codebase/` file. Make each one byte-identical to the edited source line, or shadow-check.js --docs reports MIRROR-DRIFT. Line ~14's module count stays.
   - `.planning/PROJECT.md`:
     - ~19: Dutch, English, German, French, Spanish, Italian or Polish; Italian added by quick task 261002-c77, Polish by quick task 261002-fmi.
     - ~60: the key-decision row says seven languages `(nl/en/de/fr/es/it/pl)`. Its "sixth shared module" wording counts modules and stays.
     - Bump the last-updated footer to 2026-10-02 after quick task 261002-fmi (Polish added as seventh supported language).
   - `.planning/REQUIREMENTS.md`:
     - ~66: the languages sentence gains Polish (`pl`, added 2026-10-02 by quick task 261002-fmi).
     - I18N-01 lists seven languages by their own names, ending `Español, Italiano, Polski`.
     - I18N-03 says all seven and notes that Polish carries the CLDR one/few/many/other forms where English carries one/other.
     - I18N-04 says one of the seven / outside the seven codes.
     - I18N-05 says all seven.
     - Bump the last-updated footer.
   - `.planning/ROADMAP.md` ~166 only: Phase 4's Continued Fractions tool is authored in seven languages from the start. Do not edit the Phase 6 section.

   Do not edit any other phase, quick or research artifact.

C. Run the verify block. Run the browser chunks one Bash call each (or with run_in_background), so no call exceeds the 10-minute tool limit. Resolve findings per Q-07.
   - If an IDENTICAL-TO-EN/UNTRANSLATED finding is a genuine Polish cognate already covered by a per-key allowSame/allowRenderText entry, update that entry's reason prose to name Polish too.
   - Add a new per-key entry only for a genuine Polish cognate with a concrete reason.
   - List every i18n-config file touched in the SUMMARY.

   Commit by explicit paths only.
  </action>
  <verify>
    <automated>cov=$(node .planning/phases/06-multi-language-support/i18n-check.js --coverage --report index.html) && printf '%s\n' "$cov" | grep -q "^I18N-CHECK REPORT" && ! (printf '%s\n' "$cov" | grep -E '^([A-Z-]+ (site|common|sieve|hub|factorTree|totient|venn|euclid|crt|wheel|cayley|iso)\.|PLURAL-CATEGORIES )') && node .planning/phases/06-multi-language-support/i18n-check.js --header --includes --no-locale-number-format --literals --all && node -e 'const fs=require("fs"),vm=require("vm"),cp=require("child_process");const ld=s=>{const c={};const NT={i18n:{register:(n,d)=>{c[n]=d}}};vm.runInNewContext(s,{NT,window:{NT}});return c};const bad=[];for(const f of fs.readdirSync("assets/i18n").filter(f=>f.endsWith(".js"))){const o=ld(cp.execFileSync("git",["show","365d782:assets/i18n/"+f],{encoding:"utf8"})),n=ld(fs.readFileSync("assets/i18n/"+f,"utf8"));for(const ns in o)for(const l of ["nl","en","de","fr","es","it"])if(JSON.stringify(o[ns][l])!==JSON.stringify((n[ns]||{})[l]))bad.push(ns+"."+l)}console.log(bad.length?"DICT-CHANGED "+bad.join(" "):"DICT-UNCHANGED PASS");process.exit(bad.length?1:0)'</automated>
    <automated>node -e 'const fs=require("fs");const res=[/\b(?:five|six)\s+(?:supported\s+)?(?:languages|translations|autonyms)\b/i,/\bnl\/(?:en\/)?de\/fr\/es(?:\/it)?\b(?!\/(?:it|pl))/,/\bnl, en, de, fr, es(?:, it)?\b(?!, (?:it|pl))/,/\b(?:one of|outside) the (?:five|six)\b/i,/(?:Español|Italiano)\)/];const hits=[];for(const f of process.argv.slice(1)){const t=fs.readFileSync(f,"utf8").replace(/\s+/g," ");for(const r of res){const m=t.match(new RegExp(r.source,r.flags+"g"));if(m)hits.push(f+": "+m.length+"x "+r.source)}}console.log(hits.length?hits.join("\n"):"LANG-COUNT-DOCS PASS");process.exit(hits.length?1:0)' CLAUDE.md .claude/CLAUDE.md .planning/PROJECT.md .planning/REQUIREMENTS.md .planning/codebase/*.md .planning/phases/06-multi-language-support/06-GLOSSARY.md .planning/phases/06-multi-language-support/i18n-check.js .planning/phases/06-multi-language-support/i18n-browser.js assets/i18n/site.js assets/i18n/sieve-of-eratosthenes.js assets/i18n/hub.js assets/i18n/factor-tree.js assets/i18n/eulers-totient.js assets/i18n/venn-diagram.js assets/i18n/euclidean-algorithm.js assets/i18n/chinese-remainder-theorem.js assets/i18n/equivalence-wheel.js assets/i18n/cayley-table.js assets/i18n/group-isomorphism.js && grep -q "authored in seven languages" .planning/ROADMAP.md && grep -q "Español, Italiano, Polski" .planning/REQUIREMENTS.md && grep -q "few, many, other" .planning/codebase/STACK.md && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs</automated>
    <automated>for p in index.html "Factor Tree/factor-tree.html" "Eulers Totient/eulers-totient.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p" --mode langs,layout); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=6" || exit 1; done</automated>
    <automated>for p in "Venn Diagram/venn-diagram.html" "Euclidean Algorithm/euclidean-algorithm.html" "Chinese Remainder Theorem/chinese-remainder-theorem.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p" --mode langs,layout); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=6" || exit 1; done</automated>
    <automated>for p in "Equivalence Wheel/equivalence-wheel.html" "Cayley Table/cayley-table.html" "Group Isomorphism/group-isomorphism.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p" --mode langs,layout); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=6" || exit 1; done</automated>
  </verify>
  <done>
- hub, factorTree, totient, venn, euclid, crt, wheel, cayley and iso each have a complete Polish dictionary (four-form plurals where English has plurals) with zero coverage findings and no PLURAL-CATEGORIES finding.
- DICT-UNCHANGED PASS, and the static gates PASS on 16 pages.
- LANG-COUNT-DOCS PASS over the living docs, gate scripts, glossary and the eleven data files done so far.
- ROADMAP's Phase 4 note, REQUIREMENTS I18N-01/03/04/05, CLAUDE.md and STACK.md state seven languages and the Polish plural shape.
- shadow-check.js --docs PASS (no MIRROR-DRIFT).
- i18n-browser.js langs (langs=6) and layout PASS on the nine pages.
  </done>
</task>

<task type="auto">
  <name>Task 3: Polish for the six heaviest tools and the consolidated seven-language sweep</name>
  <files>assets/i18n/square-and-multiply.js, assets/i18n/diffie-hellman-key-exchange.js, assets/i18n/elliptic-curve-diffie-hellman.js, assets/i18n/rsa.js, assets/i18n/fermats-method.js, assets/i18n/shors-algorithm.js, .planning/phases/06-multi-language-support/i18n-config/rsa.json</files>
  <action>
A. Dictionaries. Apply procedure P-PL, with Task 2 step A's per-file reading discipline, to `sqm`, `dh`, `ecdh`, `rsa`, `fermat`, `shor`: header comment first, then only the `en` block, consulting `it` when a convention is unclear. Translate one file at a time and run the scoped `--coverage --report` check on it before moving on.

   File-specific points:
   - `ecdh.dhLinkText` equals the Polish `dh.heading` byte-for-byte.
   - `ecdh.ordWord` and `dh.orderLabel` must differ from English. Use Polish `rząd`, e.g. `rząd(g) = `, because a word shared with English makes the whole rendered segment identical to English.
   - Alice/Bob/Eve follow Q-03 (glossary (d)). RSA's qInv/dP/dQ names, k_A/k_B, p/q/g/a/b/G and every formula stay literal.
   - `rsa`:
     - `rsa.resGiveupBody` gets four forms keyed on `count` (candidate divisors). `{ms} ms` and `√n ≈ {sqrtN}` stay symbolic per Q-09.
     - Where this file localizes the inline gcd function notation (it uses `mcd(`, es `mcd(`, de `ggT(`), Polish uses the standard Polish `NWD(` consistently across the whole Polish block. Italian deviation 2: keep the casing uniform within the block.
     - `rsa.thBit` is the genuine Polish cognate `bit`. Per Q-07, extend the existing allowSame reason for `rsa.thBit` and the mirrored allowRenderText reason for `bit` in `i18n-config/rsa.json` so both name Polish.
   - `sqm.bannerComputed` gets four forms (bit / bity / bitów). `sqm.baseLabel` and `shor.legendBase` use Polish `podstawa`, which is not a cognate, so no exemption is needed.

   Update each header comment from the 6-language count to seven supported languages, plus the plural-shape note where the header describes `{ one, other }`. Never touch existing nl/en/de/fr/es/it content.

B. i18n-config. Any exemption beyond the rsa.json reason extension follows Q-07 and Task 2 step C: a concrete per-key reason, recorded as a deviation.

C. Consolidated sweep. Run the full verify block. Run each of the four 16-page browser chunks as its own Bash call (or with run_in_background), so no single call exceeds the 10-minute tool limit, and record every result line in the SUMMARY. If any gate fails, fix the root cause in the owning data file (Q-07) and rerun the whole sweep.

   Commit by explicit paths only. After the final commit, confirm that `git diff --name-only 365d782 HEAD -- .planning/config.json` prints nothing and that `.planning/config.json` is still an unstaged modification.
  </action>
  <verify>
    <automated>node .planning/phases/06-multi-language-support/i18n-check.js --all && node .planning/phases/06-multi-language-support/i18n-check.js --api | awk '{print} /PASS api:/{f=1;ok=($4>130)} END{exit !(f&&ok)}' && node .planning/phases/06-multi-language-support/i18n-check.js --persistence | awk '{print} /PASS persistence:/{f=1;ok=($4>80)} END{exit !(f&&ok)}' && node .planning/phases/06-multi-language-support/i18n-check.js --smoke</automated>
    <automated>node -e 'const fs=require("fs"),vm=require("vm"),cp=require("child_process");const ld=s=>{const c={};const NT={i18n:{register:(n,d)=>{c[n]=d}}};vm.runInNewContext(s,{NT,window:{NT}});return c};const bad=[];for(const f of fs.readdirSync("assets/i18n").filter(f=>f.endsWith(".js"))){const o=ld(cp.execFileSync("git",["show","365d782:assets/i18n/"+f],{encoding:"utf8"})),n=ld(fs.readFileSync("assets/i18n/"+f,"utf8"));for(const ns in o){for(const l of ["nl","en","de","fr","es","it"])if(JSON.stringify(o[ns][l])!==JSON.stringify((n[ns]||{})[l]))bad.push(ns+"."+l);if(!(n[ns]||{}).pl)bad.push(ns+".pl-missing")}}console.log(bad.length?"DICT-CHANGED "+bad.join(" "):"DICT-UNCHANGED PASS (pl present in every namespace)");process.exit(bad.length?1:0)' && node -e 'const fs=require("fs");const res=[/\b(?:five|six)\s+(?:supported\s+)?(?:languages|translations|autonyms)\b/i,/\bnl\/(?:en\/)?de\/fr\/es(?:\/it)?\b(?!\/(?:it|pl))/,/\bnl, en, de, fr, es(?:, it)?\b(?!, (?:it|pl))/,/\b(?:one of|outside) the (?:five|six)\b/i,/(?:Español|Italiano)\)/];const hits=[];for(const f of process.argv.slice(1)){const t=fs.readFileSync(f,"utf8").replace(/\s+/g," ");for(const r of res){const m=t.match(new RegExp(r.source,r.flags+"g"));if(m)hits.push(f+": "+m.length+"x "+r.source)}}console.log(hits.length?hits.join("\n"):"LANG-COUNT-DOCS PASS");process.exit(hits.length?1:0)' CLAUDE.md .claude/CLAUDE.md .planning/PROJECT.md .planning/REQUIREMENTS.md .planning/codebase/*.md .planning/phases/06-multi-language-support/06-GLOSSARY.md .planning/phases/06-multi-language-support/i18n-check.js .planning/phases/06-multi-language-support/i18n-browser.js assets/i18n/*.js && ni=$(git diff --numstat 365d782 -- assets/nt-i18n.js) && test "$(printf '%s' "$ni" | cut -f1,2)" = "$(printf '5\t5')" && hd=$(git diff --numstat 365d782 -- '*.html') && printf '%s\n' "$hd" | awk '$1!=1||$2!=0{bad=1} END{exit (bad||NR!=16)}'</automated>
    <automated>node -e 'const fs=require("fs"),vm=require("vm"),cp=require("child_process");const D=fs.readdirSync("assets/i18n").filter(f=>f.endsWith(".js"));const mk=s=>{const c={};c.window=c;vm.createContext(c);vm.runInContext(s,c);for(const f of D)vm.runInContext(fs.readFileSync("assets/i18n/"+f,"utf8"),c);return c.NT.i18n};const O=mk(cp.execFileSync("git",["show","365d782:assets/nt-i18n.js"],{encoding:"utf8"})),N=mk(fs.readFileSync("assets/nt-i18n.js","utf8"));const cat={};const NT={i18n:{register:(n,d)=>{cat[n]=d}}};for(const f of D)vm.runInNewContext(fs.readFileSync("assets/i18n/"+f,"utf8"),{NT,window:{NT}});const C=[];for(let i=0;130>=i;i++)C.push(i);C.push(1000,1000000,2000000,3000000,1.5,0.5,-1,NaN,"7");let n=0;const bad=[];for(const l of ["nl","en","de","fr","es","it"]){O.setLang(l);N.setLang(l);if(O.getLang()!==l||N.getLang()!==l){bad.push("setLang "+l);continue}for(const ns in cat)for(const k in cat[ns].en){const pl=typeof cat[ns].en[k]==="object";for(const c of (pl?C:[undefined])){n++;const p=c===undefined?undefined:{count:c};const a=O.translate(ns+"."+k,p),b=N.translate(ns+"."+k,p);if(a!==b)bad.push(l+" "+ns+"."+k+" count="+c)}}}console.log(bad.length?"PLURAL-PARITY FAIL "+bad.slice(0,5).join(" | "):"PLURAL-PARITY PASS "+n+" comparisons");process.exit(bad.length?1:0)' && node -e 'const fs=require("fs"),vm=require("vm");const D=fs.readdirSync("assets/i18n").filter(f=>f.endsWith(".js"));const c={};c.window=c;vm.createContext(c);vm.runInContext(fs.readFileSync("assets/nt-i18n.js","utf8"),c);for(const f of D)vm.runInContext(fs.readFileSync("assets/i18n/"+f,"utf8"),c);const I=c.NT.i18n;const cat={};const NT={i18n:{register:(n,d)=>{cat[n]=d}}};for(const f of D)vm.runInNewContext(fs.readFileSync("assets/i18n/"+f,"utf8"),{NT,window:{NT}});const W={0:"many",1:"one",2:"few",4:"few",5:"many",12:"many",22:"few",25:"many"};const fill=(t,p)=>String(t).replace(/\{([A-Za-z0-9_]+)\}/g,(w,k)=>k in p?String(p[k]):w);const bad=[];let n=0;if(!I.setLang("pl"))bad.push("setLang");for(const ns in cat)for(const k in cat[ns].en){if(typeof cat[ns].en[k]!=="object")continue;const e=(cat[ns].pl||{})[k];if(!e||typeof e!=="object"||Object.keys(e).join(",")!=="one,few,many,other"){bad.push(ns+"."+k+" shape");continue}for(const x in W){n++;const p={count:Number(x)};if(I.translate(ns+"."+k,p)!==fill(e[W[x]],p))bad.push(ns+"."+k+" count "+x)}}const fail=bad.length||n!==88;console.log(fail?"PL-PLURAL-ALL FAIL n="+n+" "+bad.join(" | "):"PL-PLURAL-ALL PASS "+n+" selections");process.exit(fail?1:0)'</automated>
    <automated>for p in index.html "Sieve Of Eratosthenes/sieve-of-eratosthenes.html" "Factor Tree/factor-tree.html" "Venn Diagram/venn-diagram.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=6" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=6" || exit 1; done</automated>
    <automated>for p in "Euclidean Algorithm/euclidean-algorithm.html" "Chinese Remainder Theorem/chinese-remainder-theorem.html" "Equivalence Wheel/equivalence-wheel.html" "Eulers Totient/eulers-totient.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=6" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=6" || exit 1; done</automated>
    <automated>for p in "Cayley Table/cayley-table.html" "Group Isomorphism/group-isomorphism.html" "Square And Multiply/square-and-multiply.html" "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=6" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=6" || exit 1; done</automated>
    <automated>for p in "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" "RSA/rsa.html" "Fermats Method/fermats-method.html" "Shors Algorithm/shors-algorithm.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=6" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=6" || exit 1; done</automated>
    <automated>node .planning/phases/07-shared-js-module-refactor/harness.js && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs</automated>
    <human-check>A script cannot judge Polish translation quality (same as Phase 6 UAT test 4 and the pending Italian check). A reader of Polish with a maths background should:
- Review the new Polish columns in 06-GLOSSARY.md.
- Switch 2-3 sampled pages (e.g. RSA, Euclidean Algorithm, Sieve) to Polski via the header.
- Confirm that the wording reads naturally, that ty is used consistently, that tool names match the glossary, and that plural phrases agree with their numbers. Try the Sieve at N=10 (4 primes), N=30 (10 primes) and N=100 (25 primes), and a Euclidean run with 2-4 steps.</human-check>
  </verify>
  <done>
- All 18 namespaces carry a complete Polish dictionary.
- i18n-check.js --all PASS on 16 pages (coverage, header, includes, no-locale-number-format, literals-markup, literals-js).
- --api above 130 and --persistence above 80 assertions; --smoke PASS.
- DICT-UNCHANGED PASS with pl present everywhere.
- LANG-COUNT-DOCS PASS across every living doc, the gate scripts, the glossary and all data files.
- nt-i18n.js still differs by exactly five lines, and each page by exactly one added line.
- PLURAL-PARITY PASS (six existing languages identical to the 365d782 engine).
- PL-PLURAL-ALL PASS with 88 selections (11 plural values × 8 counts).
- i18n-browser.js ALL PASS (en-parity IDENTICAL, langs=6, switch langs=6, layout) on all 16 pages.
- harness.js, shadow-check.js --all and --docs PASS.
- `.planning/config.json` appears in no commit since 365d782.
- The Polish-reader human-check is recorded for end-of-phase review.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL `?lang=` / `site-lang` cookie / localStorage → NT.i18n | Untrusted, user- or third-party-controllable strings choose the active language. The allow-list grows from 6 to 7 codes here. |
| Intl.PluralRules category → dictionary property lookup | A category string now indexes a plural value object directly, instead of being collapsed to one/other first. |
| dictionary data → DOM | About 874 new Polish values flow into the page through applyStaticDom/translate/translateInto/bindText. |
| gate scripts → future agents | i18n-check.js and i18n-browser.js are the evidence later verifiers trust. Relaxing the plural-shape check for Polish must not silently lower the bar for the other six languages. |
| working tree → git history | The checkout holds an unrelated modified `.planning/config.json` and untracked scratch files. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-fmi-01 | Tampering | `assets/nt-i18n.js` valid() allow-list | medium | mitigate | Only the literal `'pl'` is appended, and valid() stays an exact indexOf match on a frozen array. `--api` keeps every invalid-code assertion ('xx', 'DE', '', null, '__proto__') and pins the sorted seven-code literal independently of the gate lists. `--persistence` keeps the invalid/unparseable url-cookie-storage fall-through scenarios. nt-i18n.js numstat must be exactly 5/5 vs 365d782. |
| T-fmi-02 | Tampering / Elevation | resolveTemplate plural lookup | low | mitigate | Selection uses `Object.prototype.hasOwnProperty.call(entry, cat)` (never `in` or an unguarded index), so 'constructor'/'__proto__'-style names can never resolve through the prototype chain. `cat` comes only from Intl's fixed CLDR set or the unchanged one/other fallback. The `typeof tpl === 'string'` guard stays. `--api` asserts the fallback-to-other path. |
| T-fmi-03 | Tampering (XSS) | Polish values in `assets/i18n/*.js` | medium | mitigate | P-PL forbids markup. `--coverage` DICT-MARKUP now checks every plural category (few/many included; the PLURAL-GATE self-test proves it). The engine's text-node/textContent insertion path is untouched (html numstat +1/-0 per page, no page script edited). `--literals` INNERHTML-PROSE still runs on all 16 pages. |
| T-fmi-04 | Repudiation | gate scripts and i18n-config exemptions | high | mitigate | The extra plural categories come from an explicit `PLURAL_EXTRA_CATEGORIES = { pl: [...] }`, not from Intl for every language. The PLURAL-GATE self-test proves an it value carrying many is flagged and that the map holds only pl. pluralCategoryFindings pins pl's set to Intl's. No assertion is deleted: api/persistence counts must strictly exceed 130/80, and all four Sieve mutants must still be MUTANT-DETECTED. Exemptions are per-key with a concrete Polish-cognate reason and are listed in the SUMMARY. |
| T-fmi-05 | Tampering | English and existing-language output | high | mitigate | en-parity IDENTICAL on all 16 pages. DICT-UNCHANGED proves every nl/en/de/fr/es/it value equals 365d782. PLURAL-PARITY renders every key of the six existing languages at 140+ counts (including 1,000,000-multiples that CLDR classes as many) through both the 365d782 engine and the new one and requires identical output. |
| T-fmi-06 | Denial of Service | 375px layout in Polish | low | mitigate | i18n-browser.js layout mode on all 16 pages (Polish ≤ English + 8px). Fixes go into wording only (Q-07). |
| T-fmi-07 | Information Disclosure | unrelated working-tree changes | low | mitigate | Commits stage explicit paths only. A post-commit check confirms `.planning/config.json` is absent from `git diff --name-only 365d782 HEAD` and is still an unstaged modification. |
| T-fmi-SC | Tampering | npm/pip/cargo installs | high | accept | No package manager exists in this repo and no install is planned. The dev gates use Node built-ins and the system Chrome only. |
</threat_model>

<verification>
- Task 1's tracer gates prove the Polish path end-to-end on the Sieve: allow-list → switcher → CLDR plural engine → real dictionary (PL-PLURAL-E2E) → en-parity/langs/switch/layout. They also prove the generalized engine is behavior-identical for the six existing languages (PLURAL-PARITY), that the new plural-shape gate is strict for pl and unchanged for the rest (PLURAL-GATE), and that the modified gates are not vacuous (four mutants detected).
- Tasks 2 and 3 each gate their own namespaces (scoped coverage, langs/layout) before the consolidated sweep.
- Task 3's sweep is the single source of completion evidence:
  - i18n-check.js --all/--api/--persistence/--smoke
  - DICT-UNCHANGED (with pl everywhere), LANG-COUNT-DOCS, numstat checks
  - PLURAL-PARITY, PL-PLURAL-ALL
  - i18n-browser.js on all 16 pages
  - Phase 7 harness.js and shadow-check.js --all/--docs
</verification>

<success_criteria>
- `NT.i18n.SUPPORTED_LANGS` is `nl, en, de, fr, es, it, pl`; every page offers Polski; every namespace has a complete Polish dictionary.
- Polish plural values select one/few/many/other by CLDR rule (1 / 2,4,22 / 0,5,12,25 / fractions).
- English rendering is byte-identical on all 16 pages. No existing-language value changed, and existing-language plural rendering is identical to the 365d782 engine.
- Every gate covers seven languages from one list per gate file. Assertion counts only grow, mutants are still detected, and plural-shape strictness holds per language.
- The glossary, CLAUDE.md, .claude/CLAUDE.md (no mirror drift), PROJECT.md, REQUIREMENTS.md, the ROADMAP Phase 4 note and .planning/codebase/*.md state seven languages and the Polish plural shape.
</success_criteria>

<output>
Create `.planning/quick/261002-fmi-add-polish-pl-as-a-seventh-supported-lan/261002-fmi-SUMMARY.md` when done. Record:
- every sweep result line;
- the final --api/--persistence assertion counts;
- the PLURAL-PARITY comparison count and the PL-PLURAL-ALL selection count;
- each i18n-config exemption touched, with its reason;
- the commit hashes;
- the pending Polish-reader human-check.
</output>
