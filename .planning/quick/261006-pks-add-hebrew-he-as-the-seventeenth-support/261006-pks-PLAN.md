---
phase: quick-261006-pks
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "assets/nt-i18n.js"
  - "assets/site.css"
  - ".planning/phases/06-multi-language-support/i18n-check.js"
  - ".planning/phases/06-multi-language-support/06-GLOSSARY.md"
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
  - "assets/i18n/sieve-of-eratosthenes.js"
  - "assets/i18n/hub.js"
  - "assets/i18n/factor-tree.js"
  - "assets/i18n/venn-diagram.js"
  - "assets/i18n/euclidean-algorithm.js"
  - "assets/i18n/chinese-remainder-theorem.js"
  - "assets/i18n/fermats-method.js"
  - "assets/i18n/equivalence-wheel.js"
  - "assets/i18n/eulers-totient.js"
  - "assets/i18n/cayley-table.js"
  - "assets/i18n/group-isomorphism.js"
  - "assets/i18n/square-and-multiply.js"
  - "assets/i18n/diffie-hellman-key-exchange.js"
  - "assets/i18n/elliptic-curve-diffie-hellman.js"
  - "assets/i18n/rsa.js"
  - "assets/i18n/shors-algorithm.js"
  - "CLAUDE.md"
  - ".claude/CLAUDE.md"
  - ".planning/PROJECT.md"
  - ".planning/REQUIREMENTS.md"
  - ".planning/codebase/STACK.md"
  - ".planning/codebase/CONVENTIONS.md"
  - ".planning/codebase/ARCHITECTURE.md"
  - ".planning/codebase/CONCERNS.md"
  - ".planning/codebase/STRUCTURE.md"
  - ".planning/codebase/TESTING.md"
autonomous: true
requirements: [QUICK-261006-pks, I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, I18N-06]

estimate:
  tokens: 320000
  raw_tokens: 320000
  tasks: 5
  confidence: low

must_haves:
  truths:
    - "On all 16 pages the header language select lists עברית (value he) as the 17th option, directly after Ελληνικά; choosing it renders that page's whole UI in Hebrew with <html lang=\"he\" dir=\"rtl\">, and choosing any other language sets that language's lang and removes the dir attribute, so the English DOM is unchanged."
    - "?lang=he, a site-lang cookie or a localStorage value of he all resolve to Hebrew and an explicit choice persists storage-first then cookie; a browser whose first supported preference is he or the legacy tag iw (any region, any case, - or _) gets Hebrew; setLang, ?lang= and storage reject iw, he-IL and HE (exact, case-sensitive allow-list)."
    - "Every key of all 18 namespaces has a Hebrew value; every Hebrew plural value carries exactly {one, two, other} (Intl.PluralRules('he')'s own category set) with every placeholder in every category; the engine renders one at 1, two at 2 and other at 0, 3, 10, 20 and 1000000."
    - "Hebrew values are written in Hebrew script: every word outside SCRIPT_RULES' notation allow-list (mod, gcd/lcm where a key keeps them literal, single-letter variables, acronyms, code identifiers, Alice/Bob/Eve) is Hebrew, no word mixes scripts, and no Cyrillic word or multi-letter Greek word appears (i18n-check.js --all PASS)."
    - "With Hebrew active the header, prose, panels and control rows mirror right-to-left, while every SVG diagram, number grid/table, numeric input, range slider and formula stays left-to-right and reads exactly as in English; every numeric formula inside a Hebrew value sits inside a U+2066…U+2069 isolate (no BIDI-FORMULA, BIDI-CONTROL, BIDI-UNBALANCED or BIDI-RAW finding)."
    - "Hebrew uses the browser's system fallback font: no font link, @font-face or font-family line is added anywhere."
    - "Every existing language's dictionary values are unchanged from 42ae6fa; switching to Hebrew mid-session matches a direct Hebrew load without resetting tool state, and no page overflows a 375px viewport in Hebrew by more than English + 8px (i18n-browser.js switch,layout PASS with langs=16 on all 16 pages)."
    - "The living docs state seventeen languages including he, Hebrew's {one, two, other} plural shape, iw to he detection, the Hebrew-script rule and the RTL rules, while every statement about the 16 pages/tools/nav links stays 16; shadow-check.js --docs adds no MIRROR-DRIFT finding."
  artifacts:
    - path: "assets/nt-i18n.js"
      provides: "he in SUPPORTED_LANGS, html dir=rtl while Hebrew is active, legacy iw detection"
      contains: "'el', 'he'"
    - path: "assets/site.css"
      provides: "RTL-safe header (logical properties, mirrored active-link marker, physical theme switch) and the site-wide LTR islands (svg, numeric inputs, range sliders, code, prime-picker grid)"
      contains: ":root[dir=\"rtl\"]"
    - path: ".planning/phases/06-multi-language-support/i18n-check.js"
      provides: "he switcher entry, he plural categories, Hebrew SCRIPT_RULES, RTL_LANGS, bidiFindings (BIDI-CONTROL/UNBALANCED/FORMULA) and BIDI-RAW, Hebrew api/persistence assertions, repaired module.exports"
      contains: "he: [\"two\"]"
    - path: ".planning/phases/06-multi-language-support/06-GLOSSARY.md"
      provides: "Hebrew tone, orthography, bidi, plural and script contract plus he columns for tool names, core terms, proper nouns and common vocabulary"
      contains: "Hebrew (he)"
    - path: "assets/i18n/site.js"
      provides: "he blocks for the site and common namespaces"
      contains: "he: {"
  key_links:
    - from: "header <option value=\"he\"> on all 16 pages"
      to: "NT.i18n.setLang via the select change handler in assets/nt-i18n.js"
      via: "valid() exact, case-sensitive match against SUPPORTED_LANGS"
      pattern: "<option value=\"he\" lang=\"he\">עברית</option>"
    - from: "navigator.languages"
      to: "detectDefaultLang in assets/nt-i18n.js"
      via: "legacy-tag branch mapping iw to he, beside the existing no to nb branch"
      pattern: "parts\\[0\\] === 'iw'"
    - from: "applyHtmlLang in assets/nt-i18n.js"
      to: "<html dir> and every :root[dir=\"rtl\"] rule in assets/site.css and the page <style> blocks"
      via: "setAttribute('dir', 'rtl') for an RTL language, removeAttribute('dir') otherwise"
      pattern: "setAttribute\\('dir', 'rtl'\\)"
    - from: "i18n-check.js PLURAL_EXTRA_CATEGORIES"
      to: "checkPluralEntry and pluralCategoryFindings"
      via: "expectedPluralCategories('he') = one, other, two"
      pattern: "he: \\[\"two\"\\]"
    - from: "i18n-check.js SCRIPT_RULES.he and bidiFindings"
      to: "checkDictionaries (every plain value and every plural form), reached via --coverage and --all"
      via: "SCRIPT-* and BIDI-* findings"
      pattern: "bidiFindings\\("
    - from: "i18n-check.js LANG_CODES (derived from SWITCHER_OPTIONS)"
      to: "i18n-browser.js NON_EN_LANGS (switch/layout gates)"
      via: "require('./i18n-check.js'), which only loads once the dangling checkSiteFooter export is repaired"
      pattern: "i18nCheck\\.LANG_CODES"
---

<objective>
Add Hebrew (he) as the seventeenth supported language site-wide, as the site's first right-to-left language: engine allow-list plus legacy iw detection, html dir="rtl" while Hebrew is active, the עברית switcher option on every page, RTL-safe shared chrome with diagrams/formulas/numerals kept left-to-right, a complete Hebrew value for every key of all 18 namespaces, the gate tooling extended to Hebrew (plural shape, script rule, bidi rules) and the docs moved to seventeen languages.

Purpose: the user asked for Hebrew in the list of supported languages ("also add Hebrew to the list of supported languages"); every page must work in Hebrew exactly as it does in the other sixteen languages, with no mirrored diagram or reversed formula.

Output: assets/nt-i18n.js, assets/site.css, i18n-check.js and 06-GLOSSARY.md extended; 16 pages with the new option and a page-level LTR rule; a he block in every assets/i18n/*.js dictionary; docs updated. Five commits, one per task.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md
@./.claude/CLAUDE.md
@assets/nt-i18n.js

## Locked decisions for this task (orchestrator + user + project memory)

- L-FONT: Hebrew text renders in the browser's system fallback font. Add no Google Font, no @font-face and no font-family change (project memory: the user closed this question for non-Latin scripts; never raise it).
- L-SOURCE: English is the source of truth. Every key of every namespace gets a Hebrew value; no key is skipped, shortened or left English.
- L-PLURAL: Hebrew plural values use exactly the categories `new Intl.PluralRules('he').resolvedOptions().pluralCategories` returns: verified in this repo's Node 22 (ICU 78 / CLDR 48) as one, two, other. 1 selects one, 2 selects two, 0/3/10/20/1000000 select other (CLDR also selects one for 0.5; the site's counts are integers, but every category still keeps every placeholder).
- L-RTL: while he is active, `<html>` carries dir="rtl" alongside lang="he"; math notation, formulas, SVG diagrams, number grids/tables, numerals and numeric inputs stay left-to-right so diagrams are never mirrored.
- L-IW: browser-language detection maps the legacy ISO tag iw to he. iw is never an allow-list code (setLang('iw'), ?lang=iw, a stored iw all stay rejected).
- L-SPLIT: the translation volume (943 English keys, about 52,000 English characters) is split into one batch of data files per task, each task ending with i18n-check.js on what it touched and its own commit; the last task runs the full check suite.

## Discretion choices made here (recorded so every batch stays consistent)

- D-SWITCHER: the option is appended after Ελληνικά, matching SUPPORTED_LANGS order, written exactly as `<option value="he" lang="he">עברית</option>` with no dir attribute, because i18n-check.js's checkSwitcherPresent regex only accepts value, lang and an optional selected attribute.
- D-DIR-ATTR: for every language other than he the engine REMOVES the dir attribute rather than writing dir="ltr", so the English DOM stays exactly as it was (I18N-05).
- D-NO-HEAD-SCRIPT: dir is applied at the same moment as lang and the translated text (when nt-i18n.js runs at the end of body); no inline head script is added. The English-to-translated text swap already happens at that same moment on every page, so this adds no new kind of flash.
- D-ISOLATES: a formula embedded in a Hebrew sentence is wrapped in U+2066 LEFT-TO-RIGHT ISOLATE … U+2069 POP DIRECTIONAL ISOLATE, written in source as the escapes \u2066 and \u2069 (never as raw invisible characters). Embedding/override controls (U+202A–U+202E) are never used.
- D-MEDIA-GLYPHS: playback glyphs ▶ ⏸ ⏭ ⏩ ↺ are not mirrored (RTL convention for media controls). A prose arrow that means "go/open/next" (→ in "Open tool →") becomes ← in Hebrew; an arrow inside a formula stays and sits inside the isolate.
- D-NAMES: Alice/Bob/Eve and acronyms (RSA, AES, DH, CRT, QFT, ECDH) stay Latin, exactly like ru and el. Eponyms are transliterated into Hebrew script (the same policy Russian follows; SCRIPT_RULES.he reuses the base notation list, not el's eponym extension).
- D-REGISTER: gender-neutral second-person plural (the convention of Israeli web UIs): plural imperatives for instructions (לחצו, בחרו, הזינו, צפו, נסו, גררו, הקישו); action nouns for buttons (יצירה, הפעלה, השהיה, איפוס); modern full spelling without niqqud.
- D-TEST-HARNESS: i18n-check.js's module.exports references checkSiteFooter, which quick task 261003-nkr removed (it became checkNoSiteFooter). That makes require('./i18n-check.js') throw, so i18n-browser.js cannot start at all. Task 1 repairs that export entry because the switch/layout runtime gates in this plan need it. i18n-browser.js's langs and en-parity modes are stale for unrelated reasons (theme-follows-OS since 261003-nkr) and are not used or repaired here; switch and layout work and are used.

## Facts the executor must not get wrong

- The literal 16 in i18n-check.js (buildExpected's nav-href count near line 363, checkSwitcherPresent's site.nav count near line 1910) counts the 16 tool pages/nav links, NOT languages. Leave both unchanged. Every language count in the checker is derived from SWITCHER_OPTIONS (LANG_CODES, autonym neutral tokens, i18n-browser.js NON_EN_LANGS), so adding one SWITCHER_OPTIONS entry is the whole count update.
- The switcher is static markup, identical in the header of all 16 pages (`git ls-files '*.html'` lists exactly these 16); i18n-check.js --header compares every header against the Sieve's.
- Docs and data-file comments mention both "sixteen pages" and "sixteen languages"; only language counts become seventeen.
- Baseline commit for "existing languages unchanged" checks: 42ae6fa.
- The working tree has unrelated changes (.planning/config.json modified, several untracked directories). Stage explicit paths only; never `git add -A` or `git add .`.

## Coverage audit (every source item mapped to a task)

| Source item (task description) | Task |
|---|---|
| SUPPORTED_LANGS in assets/nt-i18n.js gains he | 1 |
| Browser-language detection, legacy iw mapped to he | 1 |
| #lang-switch-select option on every page, endonym עברית (static markup, checked) | 1 |
| Hebrew values for every key in all 17 data files (18 namespaces) | 1 (site, common, sieve), 2 (hub, factorTree, venn, euclid, crt, fermat), 3 (wheel, totient, cayley, iso, sqm, dh), 4 (ecdh, rsa, shor) |
| Plural values use Intl.PluralRules('he') categories; plural rules in i18n-check.js updated (engine already selects by CLDR category, no engine change needed) | 1 (rules), 1-4 (values) |
| RTL: dir="rtl" on html with lang; formulas, SVG, numerals, numeric inputs LTR; header/site.css checked in RTL | 1 (engine, site.css, header screenshots), 1-4 (each page's LTR rule + screenshots), 5 (regression screenshots) |
| i18n-check.js: SUPPORTED list, SCRIPT_RULES for Hebrew, plural shape, count assertions | 1 |
| Docs: ./CLAUDE.md and ./.claude/CLAUDE.md seventeen, he in lists, plural/script notes (plus the .planning/codebase mirrors shadow-check.js --docs enforces, and the other living docs stating the count) | 5 |
| Each task ends by running i18n-check.js on what it touched; the final task runs the full check; commit per task | 1-5 |
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Tracer — Hebrew end-to-end on the Sieve of Eratosthenes (engine, RTL chrome, gate tooling, switcher on all 16 pages, glossary contract, site/common/sieve dictionaries)</name>
  <files>assets/nt-i18n.js, assets/site.css, .planning/phases/06-multi-language-support/i18n-check.js, .planning/phases/06-multi-language-support/06-GLOSSARY.md, assets/i18n/site.js, assets/i18n/sieve-of-eratosthenes.js, index.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factor Tree/factor-tree.html, Venn Diagram/venn-diagram.html, Euclidean Algorithm/euclidean-algorithm.html, Chinese Remainder Theorem/chinese-remainder-theorem.html, Equivalence Wheel/equivalence-wheel.html, Eulers Totient/eulers-totient.html, Cayley Table/cayley-table.html, Group Isomorphism/group-isomorphism.html, Square And Multiply/square-and-multiply.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html, RSA/rsa.html, Fermats Method/fermats-method.html, Shors Algorithm/shors-algorithm.html</files>
  <read_first>
    - assets/nt-i18n.js (whole file, 490 lines: SUPPORTED_LANGS line 60, detectDefaultLang 104-129, applyHtmlLang 143-150)
    - .planning/phases/06-multi-language-support/i18n-check.js lines 1-30 (modes), 693-720 (doApi start, export/SUPPORTED_LANGS assertions), 884-925 (synthetic plural namespaces trel/trhl), 1015-1045 (setLang rejection and transition loops), 1120-1170 (detectDefaultLang cases), 1340-1460 (persistence url/cookie/storage-event scenarios), 1490-1535 (SWITCHER_OPTIONS, LANG_CODES, PLURAL_EXTRA_CATEGORIES), 1631-1725 (SCRIPT_LATIN_NOTATION, SCRIPT_RULES, scriptFindings), 1857-1920 (extractSiteFooters, checkNoSiteFooter, checkSwitcherPresent), 2100-2290 (checkPluralEntry, pluralCategoryFindings, checkDictionaries), 2640-2659 (module.exports)
    - assets/site.css lines 34-80 (header row, .site-brand), 125-335 (.site-nav, .site-nav-link.is-active, .theme-switch, .lang-switch, 760px media), 340-475 (prime picker)
    - Sieve Of Eratosthenes/sieve-of-eratosthenes.html lines 190-330 (its style rules: .grid-container, .grid, .cell, .legend, .banner) and 330-480 (header markup with the switcher, controls, script includes)
    - assets/i18n/site.js (en blocks of site and common: lines 41-63 and 427-453) and assets/i18n/sieve-of-eratosthenes.js (header comment and en block)
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md sections (a) tone and punctuation, (b) tool names, (c) core terms, (d) proper nouns, (e) numerals and notation, (f) common vocabulary
  </read_first>
  <behavior>
    - detectDefaultLang: ['he-IL'] gives he; ['HE'] gives he; ['iw'] gives he; ['iw-IL'] gives he; ['IW_il','en'] gives he; ['yi','he'] gives he (Yiddish unsupported, falls through); ['ji','en'] gives en (legacy Yiddish tag not mapped); ['he'] round-trips.
    - setLang('he') returns true, html lang becomes he and html dir becomes rtl; setLang('en') (or any non-RTL language) removes the dir attribute; setLang('iw'), setLang('he-IL') and setLang('HE') return false with no change event.
    - Loading with ?lang=he sets lang he and dir rtl at evaluation time; a plain load in a non-RTL language leaves no dir attribute; a storage event carrying he re-applies lang and dir; a storage event carrying iw is a no-op.
    - A synthetic plural namespace with he {one, two, other} renders one at 1, two at 2, other at 0, 3, 10, 20 and 1000000.
    - For every SUPPORTED_LANGS code, after setLang the html dir attribute is rtl exactly when the code is in the checker's RTL_LANGS, else absent.
  </behavior>
  <action>
Work in this order: tests first, then engine, then checker tables, then chrome, then dictionaries, then visual proof, then gates and commit.

(A) Tests first (they must fail against the current engine). In i18n-check.js doApi, add assertions for every bullet in the behavior block: the sorted SUPPORTED_LANGS expectation gains "he"; new detectDefaultLang cases beside the existing ru/el cases; setLang rejection cases for iw, he-IL and HE beside the existing el-GR/el-polyton cases; a dir assertion inside the existing "valid transitions across every supported language" loop (read it with the fake document's documentElement.getAttribute('dir')); and a synthetic namespace "trhe" registered beside "trel" with en {one, other} and he {one, two, other} values, asserting one at 1, two at 2 and other at 0, 3, 10, 20, 1000000. In doPersistence add a ?lang=he load scenario (lang he, dir rtl), a storage-event scenario for he (re-applies lang and dir rtl) followed by one for a non-RTL code (dir removed), and an iw storage event that is a no-op. Do not touch the "export key set" assertion: the engine's export surface does not change. Run --api once and confirm the new Hebrew assertions fail.

(B) Engine, assets/nt-i18n.js. Append 'he' as the last entry of SUPPORTED_LANGS. Add an internal frozen RTL_LANGS list containing only 'he' (NOT exported; the NT.i18n export surface stays exactly as it is). In applyHtmlLang, inside the existing guard and try/catch, after setting lang: when the language is in RTL_LANGS call documentElement.setAttribute('dir', 'rtl'), otherwise documentElement.removeAttribute('dir') (per D-DIR-ATTR); the module must still evaluate without throwing in a bare vm context with only window present. In detectDefaultLang, beside the Norwegian `no` branch, add a branch returning 'he' when parts[0] is 'iw' (per L-IW), with a one-line comment that iw is the withdrawn ISO 639 code for Hebrew still sent by some older stacks. Update the header comment: one short paragraph that Hebrew is the one right-to-left language, that applyHtmlLang sets dir="rtl" while it is active and removes the attribute for every other language, and that site.css plus each page's own :root[dir="rtl"] rule keep diagrams, formulas and numerals left-to-right; and add "two" to the registry comment's list of extra CLDR categories.

(C) Checker tables and rules, i18n-check.js.
  1. Append { value: "he", lang: "he", label: "עברית" } as the last SWITCHER_OPTIONS entry (LANG_CODES and the autonym neutral tokens derive from it; this is the entire language-count update — leave the two literal 16 nav-link counts alone).
  2. PLURAL_EXTRA_CATEGORIES gains he: ["two"], and its comment and expectedPluralCategories' comment mention Hebrew's one, two, other.
  3. Add RTL_LANGS = ["he"] near SWITCHER_OPTIONS with a comment that it mirrors nt-i18n.js's internal RTL set (tied together by the --api dir assertion of step A).
  4. SCRIPT_RULES gains he with own = Hebrew script, foreign = any Cyrillic letter or a run of two or more Greek letters (single Greek letters such as φ stay legal, exactly like ru), latin = SCRIPT_LATIN_NOTATION unchanged (per D-NAMES). ru's foreign pattern additionally matches any Hebrew letter and el's foreign pattern additionally matches any Hebrew letter. scriptFindings' SCRIPT-MIXED count includes Hebrew as a fourth script. Retitle the section comment so it covers Russian, Greek and Hebrew.
  5. Add bidiFindings(id, lang, value), returning an array, called from checkDictionaries for every language's every plain value and every plural form, beside the scriptFindings calls, with the same id shape. It reports: BIDI-CONTROL id.lang when the value contains any character in U+202A–U+202E; BIDI-UNBALANCED id.lang when a U+2069 appears with no open isolate or an isolate initiator (U+2066, U+2067, U+2068) is left unclosed; and, only when lang is in RTL_LANGS, BIDI-FORMULA id.lang: "<matched text>" after (i) removing every complete isolate span innermost-first until stable and (ii) replacing every {placeholder} with 0, when the remainder contains a digit, optional spaces, one operator from the set = ≠ ≡ ≢ < > ≤ ≥ + - − × ÷ · * / ^ or the word mod not followed by a letter, optional spaces, then a digit or an opening parenthesis; or an opening parenthesis followed by digits, a comma and another digit (a coordinate or argument tuple). Comment why: a numeric formula inside a right-to-left paragraph is reordered by the Unicode bidi algorithm (48 = 2 × 18 + 12 would display reversed) unless it is isolated.
  6. In checkDictionaries' DICT-FILE loop, read each assets/i18n/*.js source and report BIDI-RAW assets/i18n/<file>: U+XXXX for the first literal character in U+200E–U+200F, U+202A–U+202E or U+2066–U+2069; such characters must be written as \u escapes so they stay visible in review.
  7. module.exports: replace the dangling checkSiteFooter entry with checkNoSiteFooter (per D-TEST-HARNESS), and add RTL_LANGS and bidiFindings.

(D) Switcher on all 16 pages: in each header, directly after the line carrying the Ελληνικά option, add one line with the same indentation carrying `<option value="he" lang="he">עברית</option>` (per D-SWITCHER). Identical edit on every page (a single sed over `git ls-files '*.html'` is fine); no other markup changes in this step.

(E) Shared chrome, assets/site.css (per L-RTL; no color literal, no font change per L-FONT):
  - .site-brand: margin-right: auto becomes margin-inline-end: auto; .site-nav and its 760px media override: right becomes inset-inline-end (computed-identical in LTR, mirrors in RTL so the Tools menu opens on the side where its button sits).
  - A new section at the end of the header rules titled for right-to-left (Hebrew) with three rules scoped to :root[dir="rtl"]: the active nav link's accent bar moves to the right edge (inset -2px box-shadow and mirrored border-radius); .theme-switch gets direction: ltr so the moon–track–sun switch and its thumb travel stay physical; and an LTR-island rule giving direction: ltr and unicode-bidi: isolate to svg, input[type="number"], input[type="range"], input[inputmode="numeric"], code, kbd, samp, var and .prime-pop-grid (every BigInt input on the site is type="text" inputmode="numeric", so this covers all numeric inputs).

(F) Glossary contract, 06-GLOSSARY.md (the reference Tasks 2-4 follow; mark Hebrew cells [ASSUMED] like the other added languages, dated 2026-10-06, quick task 261006-pks):
  - (a) a Hebrew (he) tone row stating D-REGISTER; a Hebrew punctuation/orthography entry: geresh ׳ (U+05F3) and gershayim ״ (U+05F4) for abbreviations and transliterated sounds instead of ASCII ' and "; a hyphen between a Hebrew prefix letter and a following number, placeholder or Latin token (ב-{n}, ה-RSA); ASCII double quotes around a quoted UI label; D-MEDIA-GLYPHS; D-ISOLATES with the instruction to isolate every numeric formula, comparison, coordinate pair and fraction; plural values {one, two, other} with every placeholder in every category; and the script rule (every word Hebrew apart from the notation allow-list; gcd(/lcm( stay literal inside formulas while the prose noun becomes המחלק המשותף המקסימלי, or ממ״מ after first use; mod stays literal; system fallback font per L-FONT).
  - (b), (c), (d), (f): a he column immediately after el. Suggested tool names (keep site.nav values identical to this column): דף הבית, הנפה של ארטוסתנס, עץ גורמים, דיאגרמת ון, האלגוריתם של אוקלידס, משפט השאריות הסיני, גלגל השקילות, פונקציית φ של אוילר, טבלת קיילי, איזומורפיזם של חבורות, העלאה בריבוע וכפל, דיפי-הלמן, דיפי-הלמן בעקומים אליפטיים, RSA, שיטת פרמה, האלגוריתם של שור. Proper nouns: Alice, Bob, Eve, RSA stay Latin; Euler אוילר, Fermat פרמה, Cayley קיילי, Venn ון, Shor שור, Euclid אוקלידס, Eratosthenes ארטוסתנס, Bézout בזו, Diffie-Hellman דיפי-הלמן, Sun Tzu in its standard Hebrew transliteration. Core-term anchors: prime ראשוני, composite פריק, factor גורם, divisor מחלק, remainder שארית, quotient מנה, modulus מודולוס, group חבורה, identity element איבר היחידה, inverse הופכי, generator יוצר, order סדר, coprime זרים, exponent מעריך, key מפתח, public/private ציבורי/פרטי, encrypt/decrypt הצפנה/פענוח, elliptic curve עקום אליפטי, step צעד, playback הפעלה.
  - (e) one sentence adding Hebrew: Western digits with the same comma grouping and dot decimal as English (Israel's own convention, so nothing changes), first right-to-left language, notation kept LTR by isolates and CSS.

(G) Dictionaries. assets/i18n/site.js: a he object as the last language of the site register call and of the common register call; assets/i18n/sieve-of-eratosthenes.js: a he object as the last language of the sieve register call. Each he object has exactly the en key set in en key order, follows the glossary contract, keeps placeholders and rich-template {0}-style slots, keeps plural keys as {one, two, other}, and matches the file's quoting style (geresh/gershayim avoid escaping). Update both files' header comments: the language count becomes seventeen (the "all sixteen pages" nav phrase stays), and wherever a header lists the plural shapes, add Hebrew ({ one, two, other }).

(H) Sieve page LTR rule: append to the end of the page's own style block a short comment plus one rule, :root[dir="rtl"] :is(<selectors>) with direction: ltr and unicode-bidi: isolate, where the selectors are the narrowest elements holding only diagram/number content — at minimum .grid-container (the number grid and its scroll container; scrollLeft semantics flip in an RTL scroll container). Never include an element whose own text is translated prose (banner, legend, labels): those stay RTL and rely on isolates inside their values. No page-script change.

(I) Visual proof (the executor inspects the PNGs itself with the Read tool). Capture with google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars --user-data-dir="$(mktemp -d)" --virtual-time-budget=4000 --window-size=1280,1400 --screenshot=<scratch>/<name>.png "file://$PWD/Sieve%20Of%20Eratosthenes/sieve-of-eratosthenes.html?lang=<he|en>&theme=day" into a mktemp -d scratch directory (never into the repo). Compare he against en: brand on the right and Tools/language/theme on the left, Hebrew prose right-aligned and legible, the number grid starts at 2 in the top-left exactly as in English, the size input and speed slider unchanged. Then build a scratch copy of the tracked tree (t=$(mktemp -d); git ls-files -z | tar --null -T - -cf - | tar -xf - -C "$t"), change `<header class="site-header">` to `<header class="site-header is-menu-open">` in "$t/index.html", and capture "$t/index.html?lang=he&theme=day" at 1280,700 and 375,900: the open Tools menu sits under its button with the active-link bar on the right edge, the theme switch is unmirrored, nothing overlaps or clips. Fix and re-shoot until all of this holds.

(J) Run every automated gate below, then commit with explicit paths only (all files in this task's files list): feat(quick-261006-pks): Hebrew engine, RTL chrome, gate tooling and site/common/sieve dictionaries.
  </action>
  <verify>
    <automated>node -e 'const fs=require("fs"),vm=require("vm");const src=fs.readFileSync("assets/nt-i18n.js","utf8");const mk=(q,langs)=>{const de={lang:"",attrs:{},setAttribute(k,v){this.attrs[k]=String(v)},removeAttribute(k){delete this.attrs[k]},getAttribute(k){return k in this.attrs?this.attrs[k]:null}};const c={location:{search:q,pathname:"/x.html",hash:""},navigator:{languages:langs},document:{readyState:"complete",cookie:"",documentElement:de,querySelectorAll:()=>[],getElementsByTagName:()=>[],getElementById:()=>null,addEventListener(){}}};c.window=c;vm.createContext(c);vm.runInContext(src,c);return {I:c.NT.i18n,de}};let bad=0;const ex=(l,g,w)=>{if(g!==w){bad++;console.log("FAIL",l,JSON.stringify(g),JSON.stringify(w))}};let r=mk("",["en"]);ex("SUPPORTED_LANGS",r.I.SUPPORTED_LANGS.join(","),"nl,en,de,fr,es,it,pl,pt-BR,pt-PT,sv,nb,ro,hu,lv,ru,el,he");ex("plain load no dir",r.de.getAttribute("dir"),null);for(const [l,w] of [[["he-IL"],"he"],[["HE"],"he"],[["iw"],"he"],[["iw-IL"],"he"],[["IW_il","en"],"he"],[["yi","he"],"he"],[["ji","en"],"en"]]){ex("detect "+l,mk("",l).I.detectDefaultLang(),w)}r=mk("?lang=he",["en"]);ex("load he lang",r.de.lang,"he");ex("load he dir",r.de.getAttribute("dir"),"rtl");r.I.setLang("en");ex("en dir",r.de.getAttribute("dir"),null);r.I.setLang("he");ex("he dir",r.de.getAttribute("dir"),"rtl");r.I.setLang("ru");ex("ru dir",r.de.getAttribute("dir"),null);for(const v of ["iw","he-IL","HE"])ex("setLang "+v,r.I.setLang(v),false);console.log("ENGINE-HE bad="+bad);process.exit(bad?1:0)'</automated>
    <automated>node -e 'const c=require("./.planning/phases/06-multi-language-support/i18n-check.js");let bad=0;const has=(l,arr,code)=>{if(!arr.some(f=>f.indexOf(code+" ")===0)){bad++;console.log("MISSING",l,code,JSON.stringify(arr))}};const none=(l,arr)=>{if(arr.length){bad++;console.log("UNEXPECTED",l,JSON.stringify(arr))}};const S=c.scriptFindings,B=c.bidiFindings;has("latin",S("x","he","Hello \u05e2\u05d5\u05dc\u05dd","Hello world"),"SCRIPT-LATIN");has("mixed",S("x","he","\u05e9\u05dc\u05d5\u05ddabc","Hello"),"SCRIPT-MIXED");has("foreign",S("x","he","\u043f\u0440\u0438\u0432\u0435\u0442 \u05e2\u05d5\u05dc\u05dd","Hello"),"SCRIPT-FOREIGN");has("missing",S("x","he","123","Hello world"),"SCRIPT-MISSING");none("clean",S("x","he","\u05e9\u05dc\u05d5\u05dd RSA mod {n}","Hello RSA mod {n}"));has("ru-he",S("x","ru","\u043f\u0440\u0438\u0432\u0435\u0442 \u05e2\u05d5\u05dc\u05dd","Hello"),"SCRIPT-FOREIGN");has("el-he",S("x","el","\u03b3\u03b5\u03b9\u03b1 \u05e2\u05d5\u05dc\u05dd","Hello"),"SCRIPT-FOREIGN");has("formula",B("x","he","\u05e9\u05dc\u05d1: {a} = {q}\u00d7{b} + {r}"),"BIDI-FORMULA");has("formula-mod",B("x","he","\u05e9\u05dc\u05d1 {a} mod {n}"),"BIDI-FORMULA");has("tuple",B("x","he","\u05e0\u05e7\u05d5\u05d3\u05d4 ({x}, {y})"),"BIDI-FORMULA");none("isolated",B("x","he","\u05e9\u05dc\u05d1: \u2066{a} = {q}\u00d7{b} + {r}\u2069"));none("en-formula",B("x","en","Step: {a} = {q}\u00d7{b} + {r}"));has("override",B("x","en","a\u202eb"),"BIDI-CONTROL");has("unbalanced",B("x","he","\u2066abc"),"BIDI-UNBALANCED");has("stray-pdi",B("x","he","abc\u2069"),"BIDI-UNBALANCED");if(c.expectedPluralCategories("he").join(",")!=="one,other,two"){bad++;console.log("PLURAL he")}const pc=c.pluralCategoryFindings();if(pc.length){bad++;console.log(pc)}if(c.RTL_LANGS.join(",")!=="he"){bad++;console.log("RTL_LANGS")}if(c.LANG_CODES.join(",")!=="nl,en,de,fr,es,it,pl,pt-BR,pt-PT,sv,nb,ro,hu,lv,ru,el,he"){bad++;console.log("LANG_CODES")}console.log("CHECKER-HE bad="+bad);process.exit(bad?1:0)'</automated>
    <automated>node .planning/phases/06-multi-language-support/i18n-check.js --api | awk '{print} /PASS api:/{f=1;ok=($4>415)} END{exit !(f&&ok)}' && node .planning/phases/06-multi-language-support/i18n-check.js --persistence | awk '{print} /PASS persistence:/{f=1;ok=($4>250)} END{exit !(f&&ok)}' && node .planning/phases/06-multi-language-support/i18n-check.js --smoke</automated>
    <automated>node .planning/phases/06-multi-language-support/i18n-check.js --header --switcher-present --includes --no-locale-number-format --literals --all && pages=$(git ls-files '*.html') && [ "$(printf '%s\n' "$pages" | tr '\n' '\0' | xargs -0 grep -l 'value="he" lang="he">עברית</option>' | wc -l)" = 16 ] && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all</automated>
    <automated>cov=$(node .planning/phases/06-multi-language-support/i18n-check.js --coverage --all --report) && printf '%s\n' "$cov" | grep -q '^I18N-CHECK REPORT' && ! (printf '%s\n' "$cov" | grep -v '^I18N-CHECK REPORT' | grep -v -E '^LANG-KEYSET (hub|factorTree|venn|euclid|crt|fermat|wheel|totient|cayley|iso|sqm|dh|ecdh|rsa|shor)\.he: namespace missing this language entirely$' | grep .)</automated>
    <automated>out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "Sieve Of Eratosthenes/sieve-of-eratosthenes.html" --mode switch,layout); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "switch PASS points=[0-9]* langs=16" && echo "$out" | grep -q "layout PASS"</automated>
    <automated>grep -q 'margin-inline-end: auto' assets/site.css && grep -q 'inset-inline-end' assets/site.css && grep -q ':root\[dir="rtl"\]' assets/site.css && grep -q ':root\[dir="rtl"\]' "Sieve Of Eratosthenes/sieve-of-eratosthenes.html" && d=$(git diff 42ae6fa -- assets '*.html') && ! (printf '%s\n' "$d" | grep -E '^\+.*(font-family|fonts\.googleapis|@font-face)') && node -e 'const fs=require("fs");let bad=0;for(const f of ["assets/nt-i18n.js","assets/i18n/site.js","assets/i18n/sieve-of-eratosthenes.js"]){const s=fs.readFileSync(f,"utf8").replace(/\s+/g," ");if(/sixteen (supported )?languages/i.test(s)){bad++;console.log("STALE-COUNT",f)}}process.exit(bad?1:0)'</automated>
    <automated>node -e 'const fs=require("fs"),vm=require("vm"),cp=require("child_process");const B="42ae6fa";const ld=s=>{const c={};const NT={i18n:{register:(n,d)=>{c[n]=d}}};vm.runInNewContext(s,{NT,window:{NT}});return c};let bad=0;for(const f of fs.readdirSync("assets/i18n").filter(f=>f.endsWith(".js"))){const o=ld(cp.execFileSync("git",["show",B+":assets/i18n/"+f],{encoding:"utf8"})),n=ld(fs.readFileSync("assets/i18n/"+f,"utf8"));for(const ns in o)for(const l in o[ns]){if(JSON.stringify(o[ns][l])!==JSON.stringify(n[ns]&&n[ns][l])){bad++;console.log("DICT-CHANGED",f,ns,l)}}for(const ns in n)for(const l in n[ns])if(l!=="he"&&!(o[ns]&&o[ns][l])){bad++;console.log("DICT-EXTRA",f,ns,l)}}console.log("DICT-UNCHANGED bad="+bad);process.exit(bad?1:0)'</automated>
  </verify>
  <done>The Sieve of Eratosthenes runs end-to-end in Hebrew: ?lang=he or the עברית option gives a fully Hebrew page (site chrome, common playback words, every sieve string) with html lang="he" dir="rtl", a mirrored header, an unmirrored number grid and numeric controls; switching back to any other language removes dir. All 16 pages carry the option; the engine, checker (script, plural, bidi rules, repaired exports) and site.css are in place; the glossary holds the Hebrew contract; every gate above passes; the existing languages' values are unchanged; one commit.</done>
</task>

<task type="auto">
  <name>Task 2: Hebrew for the hub, Factor Tree, Venn Diagram, Euclidean Algorithm, Chinese Remainder Theorem and Fermat's Method (dictionaries + page LTR rules)</name>
  <files>assets/i18n/hub.js, assets/i18n/factor-tree.js, assets/i18n/venn-diagram.js, assets/i18n/euclidean-algorithm.js, assets/i18n/chinese-remainder-theorem.js, assets/i18n/fermats-method.js, index.html, Factor Tree/factor-tree.html, Venn Diagram/venn-diagram.html, Euclidean Algorithm/euclidean-algorithm.html, Chinese Remainder Theorem/chinese-remainder-theorem.html, Fermats Method/fermats-method.html</files>
  <read_first>
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md Hebrew entries written in Task 1 (tone, punctuation/orthography/bidi rules, he columns of (b), (c), (d), (f))
    - assets/i18n/site.js he blocks (Task 1) for the terms already chosen
    - the en block of each data file in this task (dump it rather than reading all seventeen languages: node -e 'const fs=require("fs"),vm=require("vm");const c={};const NT={i18n:{register:(n,d)=>{c[n]=d}}};vm.runInNewContext(fs.readFileSync(process.argv[1],"utf8"),{NT,window:{NT}});for(const n in c)console.log(n+" "+JSON.stringify(c[n].en,null,1))' assets/i18n/FILE.js)
    - each page's own style block, found by grepping the page for var(--font-mono), stage/diagram/table/grid class names, and scrollLeft/scrollTo
  </read_first>
  <action>
Namespaces: hub (index.html), factorTree, venn, euclid (5 plural keys), crt, fermat — about 17,000 English characters.

1. For each data file, add a he object as the last language of its NT.i18n.register call (after el), with exactly the en key set in en key order, following the glossary contract written in Task 1 (D-REGISTER, D-NAMES, D-MEDIA-GLYPHS, geresh/gershayim, hyphenated prefixes before numbers/placeholders/Latin tokens). Keep every placeholder and rich-template slot; plural keys become {one, two, other} with every placeholder in every category (per L-PLURAL). Wrap every numeric formula, equation, comparison, fraction and coordinate/argument tuple inside a Hebrew sentence in \u2066 … \u2069 escapes (per D-ISOLATES; euclid's tile and nested captions such as {a} = {q}×{b} + {r} are the typical case). Values that are pure notation are copied as they are. The hub's "Open tool →"-style arrow becomes ← (per D-MEDIA-GLYPHS). No value may stay English (per L-SOURCE).
2. Update each file's header comment: language count seventeen, and wherever it lists plural shapes, add Hebrew ({ one, two, other }).
3. For each of the six pages, append to the end of the page's own style block a short comment plus one rule :root[dir="rtl"] :is(<selectors>) { direction: ltr; unicode-bidi: isolate; } covering the narrowest elements that hold only diagram, number-sequence, table or formula content (its SVG/stage wrappers when they contain only the diagram, equation/value elements styled with var(--font-mono), number tables, and any horizontally scrolling diagram container). Never include an element whose own text is translated prose; those stay RTL and rely on the isolates in step 1. index.html gets a rule only if it shows formula or number content. CSS only: no page-script, color or font change (per L-FONT). If a formula is rendered by a script as a bare text node inside a prose element and no dictionary value or element selector can reach it, do not modify the script; list it in the SUMMARY as a known RTL gap.
4. Visual proof per page (the executor reads the PNGs itself): capture ?lang=en&theme=day and ?lang=he&theme=day at --window-size=1280,1400 with the headless command from Task 1 step I into a mktemp -d scratch directory (URL-encode spaces in the path as %20). In Hebrew: prose right-aligned and legible, every formula reads left-to-right exactly as in English, every diagram (factor tree, Venn circles, Euclid's nested squares, CRT diagram, Fermat's geometry) has the same orientation as in English, nothing overlaps or clips. Fix (dictionary isolates or the page rule) and re-shoot until it holds.
5. Run the gates below, then commit with explicit paths only (this task's files): feat(quick-261006-pks): Hebrew for the hub, Factor Tree, Venn, Euclid, CRT and Fermat.
  </action>
  <verify>
    <automated>cov=$(node .planning/phases/06-multi-language-support/i18n-check.js --coverage --all --report) && printf '%s\n' "$cov" | grep -q '^I18N-CHECK REPORT' && ! (printf '%s\n' "$cov" | grep -v '^I18N-CHECK REPORT' | grep -v -E '^LANG-KEYSET (wheel|totient|cayley|iso|sqm|dh|ecdh|rsa|shor)\.he: namespace missing this language entirely$' | grep .)</automated>
    <automated>node .planning/phases/06-multi-language-support/i18n-check.js --header --includes --no-locale-number-format --literals index.html "Factor Tree/factor-tree.html" "Venn Diagram/venn-diagram.html" "Euclidean Algorithm/euclidean-algorithm.html" "Chinese Remainder Theorem/chinese-remainder-theorem.html" "Fermats Method/fermats-method.html" && node -e 'const fs=require("fs");let bad=0;for(const f of ["hub","factor-tree","venn-diagram","euclidean-algorithm","chinese-remainder-theorem","fermats-method"]){const s=fs.readFileSync("assets/i18n/"+f+".js","utf8").replace(/\s+/g," ");if(/sixteen (supported )?languages/i.test(s)){bad++;console.log("STALE-COUNT",f)}}process.exit(bad?1:0)' && for p in "Factor Tree/factor-tree.html" "Venn Diagram/venn-diagram.html" "Euclidean Algorithm/euclidean-algorithm.html" "Chinese Remainder Theorem/chinese-remainder-theorem.html" "Fermats Method/fermats-method.html"; do grep -q ':root\[dir="rtl"\]' "$p" || { echo "NO-RTL-RULE $p"; exit 1; }; done</automated>
    <automated>for p in "index.html" "Factor Tree/factor-tree.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p" --mode switch,layout); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "switch PASS points=[0-9]* langs=16" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Venn Diagram/venn-diagram.html" "Euclidean Algorithm/euclidean-algorithm.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p" --mode switch,layout); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "switch PASS points=[0-9]* langs=16" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Chinese Remainder Theorem/chinese-remainder-theorem.html" "Fermats Method/fermats-method.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p" --mode switch,layout); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "switch PASS points=[0-9]* langs=16" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
  </verify>
  <done>hub, factorTree, venn, euclid, crt and fermat have a complete, clean Hebrew dictionary (no finding of any kind for these namespaces); each of the five tool pages carries its LTR rule; the six pages pass switch and layout with 16 non-English languages; Hebrew screenshots show RTL prose with unmirrored diagrams and left-to-right formulas; one commit.</done>
</task>

<task type="auto">
  <name>Task 3: Hebrew for Equivalence Wheel, Euler's Totient, Cayley Table, Group Isomorphism, Square and Multiply and Diffie-Hellman (dictionaries + page LTR rules)</name>
  <files>assets/i18n/equivalence-wheel.js, assets/i18n/eulers-totient.js, assets/i18n/cayley-table.js, assets/i18n/group-isomorphism.js, assets/i18n/square-and-multiply.js, assets/i18n/diffie-hellman-key-exchange.js, Equivalence Wheel/equivalence-wheel.html, Eulers Totient/eulers-totient.html, Cayley Table/cayley-table.html, Group Isomorphism/group-isomorphism.html, Square And Multiply/square-and-multiply.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html</files>
  <read_first>
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md Hebrew entries (Task 1) and the he values already written in assets/i18n/site.js and Task 2's files for consistent terms
    - the en block of each data file in this task (same dump command as Task 2)
    - each page's own style block, found by grepping the page for var(--font-mono), stage/diagram/table/grid class names, and scrollLeft/scrollTo
  </read_first>
  <action>
Namespaces: wheel, totient (1 plural key), cayley (2 plural keys), iso, sqm (1 plural key), dh — about 15,000 English characters.

Follow Task 2's steps 1-5 exactly for these six files and pages, with these specifics: the Cayley table and the isomorphism tables/mappings are diagrams and stay LTR (rows and columns ordered exactly as in English); the Equivalence Wheel's SVG sectors keep their orientation (site.css already isolates svg); Square and Multiply's bit strip and step table read left-to-right; the cayley summary values such as (ℤ/{n}ℤ)ˣ · φ({n}) = {count} … get their formula part isolated and become {one, two, other}; dh's Alice/Bob/Eve stay Latin (per D-NAMES); dh's and sqm's numeric inputs are already covered by site.css's input[inputmode="numeric"] rule. Header comments: language count seventeen, Hebrew added wherever plural shapes are listed.

Commit with explicit paths only (this task's files): feat(quick-261006-pks): Hebrew for the Wheel, Totient, Cayley, Isomorphism, Square-and-Multiply and Diffie-Hellman.
  </action>
  <verify>
    <automated>cov=$(node .planning/phases/06-multi-language-support/i18n-check.js --coverage --all --report) && printf '%s\n' "$cov" | grep -q '^I18N-CHECK REPORT' && ! (printf '%s\n' "$cov" | grep -v '^I18N-CHECK REPORT' | grep -v -E '^LANG-KEYSET (ecdh|rsa|shor)\.he: namespace missing this language entirely$' | grep .)</automated>
    <automated>node .planning/phases/06-multi-language-support/i18n-check.js --header --includes --no-locale-number-format --literals "Equivalence Wheel/equivalence-wheel.html" "Eulers Totient/eulers-totient.html" "Cayley Table/cayley-table.html" "Group Isomorphism/group-isomorphism.html" "Square And Multiply/square-and-multiply.html" "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html" && node -e 'const fs=require("fs");let bad=0;for(const f of ["equivalence-wheel","eulers-totient","cayley-table","group-isomorphism","square-and-multiply","diffie-hellman-key-exchange"]){const s=fs.readFileSync("assets/i18n/"+f+".js","utf8").replace(/\s+/g," ");if(/sixteen (supported )?languages/i.test(s)){bad++;console.log("STALE-COUNT",f)}}process.exit(bad?1:0)' && for p in "Equivalence Wheel/equivalence-wheel.html" "Eulers Totient/eulers-totient.html" "Cayley Table/cayley-table.html" "Group Isomorphism/group-isomorphism.html" "Square And Multiply/square-and-multiply.html" "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; do grep -q ':root\[dir="rtl"\]' "$p" || { echo "NO-RTL-RULE $p"; exit 1; }; done</automated>
    <automated>for p in "Equivalence Wheel/equivalence-wheel.html" "Eulers Totient/eulers-totient.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p" --mode switch,layout); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "switch PASS points=[0-9]* langs=16" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Cayley Table/cayley-table.html" "Group Isomorphism/group-isomorphism.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p" --mode switch,layout); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "switch PASS points=[0-9]* langs=16" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Square And Multiply/square-and-multiply.html" "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p" --mode switch,layout); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "switch PASS points=[0-9]* langs=16" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
  </verify>
  <done>wheel, totient, cayley, iso, sqm and dh have a complete, clean Hebrew dictionary (only ecdh, rsa and shor still lack he); each of the six pages carries its LTR rule and passes switch and layout with 16 non-English languages; Hebrew screenshots show RTL prose with unmirrored wheel, tables and bit strips and left-to-right formulas; one commit.</done>
</task>

<task type="auto">
  <name>Task 4: Hebrew for Elliptic Curve Diffie-Hellman, RSA and Shor's Algorithm (dictionaries + page LTR rules) — the full check turns green</name>
  <files>assets/i18n/elliptic-curve-diffie-hellman.js, assets/i18n/rsa.js, assets/i18n/shors-algorithm.js, Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html, RSA/rsa.html, Shors Algorithm/shors-algorithm.html</files>
  <read_first>
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md Hebrew entries and the he values in assets/i18n/diffie-hellman-key-exchange.js and assets/i18n/square-and-multiply.js (Task 3) for shared crypto vocabulary
    - the en block of each data file in this task (same dump command as Task 2)
    - each page's own style block, found by grepping for var(--font-mono), stage/diagram/panel class names, the bottom-pinned public-values dock, and scrollLeft/scrollTo
  </read_first>
  <action>
Namespaces: ecdh, rsa (1 plural key), shor — about 18,000 English characters.

Follow Task 2's steps 1-5 exactly for these three files and pages, with these specifics: ECDH points and coordinate pairs ({x}, {y}), curve equations and scalar multiples are isolated in values and the curve/point-grid SVG stays LTR; RSA's key-generation arithmetic (n = p × q, φ(n), e·d ≡ 1 (mod φ(n)), modular exponentiations), the extended-Euclid table and the public-values dock's numbers read left-to-right, while the dock's labels follow RTL; rsa.resGiveupBody becomes {one, two, other}; Shor's period-finding numbers, the cycle walk and the N^2/log N figures read left-to-right, and prose numbers keep English digits and grouping (16,777,216, 16.8). Alice/Bob/Eve and acronyms stay Latin (per D-NAMES). Header comments: language count seventeen, Hebrew added wherever plural shapes are listed.

After this task every namespace has he, so the unfiltered static suite must pass. Commit with explicit paths only (this task's files): feat(quick-261006-pks): Hebrew for ECDH, RSA and Shor's Algorithm.
  </action>
  <verify>
    <automated>node .planning/phases/06-multi-language-support/i18n-check.js --all && node -e 'const fs=require("fs");let bad=0;for(const f of ["elliptic-curve-diffie-hellman","rsa","shors-algorithm"]){const s=fs.readFileSync("assets/i18n/"+f+".js","utf8").replace(/\s+/g," ");if(/sixteen (supported )?languages/i.test(s)){bad++;console.log("STALE-COUNT",f)}}process.exit(bad?1:0)' && for p in "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" "RSA/rsa.html" "Shors Algorithm/shors-algorithm.html"; do grep -q ':root\[dir="rtl"\]' "$p" || { echo "NO-RTL-RULE $p"; exit 1; }; done</automated>
    <automated>for p in "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" "RSA/rsa.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p" --mode switch,layout); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "switch PASS points=[0-9]* langs=16" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Shors Algorithm/shors-algorithm.html"; do out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p" --mode switch,layout); rc=$?; echo "$out"; [ $rc -eq 0 ] && echo "$out" | grep -q "switch PASS points=[0-9]* langs=16" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
  </verify>
  <done>ecdh, rsa and shor have a complete, clean Hebrew dictionary; i18n-check.js --all passes with zero findings across all 18 namespaces and all 16 pages; the three pages carry their LTR rule and pass switch and layout with 16 non-English languages; Hebrew screenshots show RTL prose with unmirrored curve, key-generation arithmetic and period-finding figures; one commit.</done>
</task>

<task type="auto">
  <name>Task 5: Docs moved to seventeen languages and the consolidated full check sweep</name>
  <files>CLAUDE.md, .claude/CLAUDE.md, .planning/PROJECT.md, .planning/REQUIREMENTS.md, .planning/codebase/STACK.md, .planning/codebase/CONVENTIONS.md, .planning/codebase/ARCHITECTURE.md, .planning/codebase/CONCERNS.md, .planning/codebase/STRUCTURE.md, .planning/codebase/TESTING.md, .planning/phases/06-multi-language-support/06-GLOSSARY.md</files>
  <read_first>
    - CLAUDE.md lines 36-42 (new-tool rule and the Multi-language support paragraph)
    - .claude/CLAUDE.md lines 50-60 (stack: language preference, Intl.PluralRules), 140-150 (conventions), 245-256 (architecture i18n layer), plus its GSD start/end markers naming each mirror source
    - .planning/codebase/STACK.md lines 60-64, CONVENTIONS.md line 93, ARCHITECTURE.md line 115, CONCERNS.md lines 18-30, STRUCTURE.md lines 199-204, TESTING.md lines 234-250
    - .planning/PROJECT.md lines 17-20, 58-62, 80; .planning/REQUIREMENTS.md lines 64-74 and the last-updated line near 162
    - .planning/phases/07-shared-js-module-refactor/shadow-check.js lines 504-555 (--docs mirror rule: every line inside a .claude/CLAUDE.md GSD section must appear verbatim in its source doc)
  </read_first>
  <action>
1. Before editing, record the baseline: node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs --report currently reports 8 pre-existing MIRROR-DRIFT findings (unrelated to languages). Do not try to fix those; the edits below must not add any.
2. Update every statement of the current language count or language list, and leave every statement about the 16 pages/tools/nav links/header copies as it is (for example CONCERNS.md's "all sixteen copies identical" and TESTING.md's "across all sixteen with --all" are about pages and stay):
   - CLAUDE.md: the new-tool rule's language count becomes seventeen; the Multi-language paragraph becomes "seventeen languages — nl, en, de, fr, es, it, pl, pt-BR, pt-PT, sv, nb, ro, hu, lv, ru, el, he"; browser detection also maps the legacy Hebrew tag iw to he; the plural sentence adds Hebrew {one, two, other}; the script sentence covers Russian, Greek and Hebrew (Hebrew script for he) and the fallback-font sentence covers Cyrillic/Greek/Hebrew; add one sentence on RTL: Hebrew is the one right-to-left language, NT.i18n sets dir="rtl" on html while it is active and removes it otherwise, assets/site.css keeps SVG, numeric inputs and range sliders left-to-right, each page's own style block ends with a :root[dir="rtl"] rule keeping its formula/number/diagram elements left-to-right, Hebrew values wrap numeric formulas in \u2066…\u2069 isolates, and i18n-check.js enforces this with BIDI-FORMULA/BIDI-CONTROL/BIDI-UNBALANCED/BIDI-RAW; the adding-a-tool checklist's language count becomes seventeen.
   - .claude/CLAUDE.md and its mirror sources, edited to the identical line text in both places: STACK.md (the language-preference line gets /he; the Intl.PluralRules line adds {one, two, other} for Hebrew), CONVENTIONS.md (the dictionary-entry line: seventeen languages, he added), ARCHITECTURE.md (the i18n layer's Contains line: seventeen supported languages, he added; mention the html dir="rtl" behavior where that section describes html lang, if it does).
   - PROJECT.md: the validated-requirement bullet's language names add Hebrew; the key-decision row becomes sixteen pages in seventeen languages with /he; the last-updated line becomes 2026-10-06 after quick task 261006-pks (Hebrew added as the seventeenth supported language, the first right-to-left script).
   - REQUIREMENTS.md: the Languages paragraph adds "and Hebrew (he, added 2026-10-06 by quick task 261006-pks — the first right-to-left language)"; I18N-01 lists seventeen languages with עברית; I18N-03 says seventeen and adds Hebrew's {one, two, other}; I18N-04 says seventeen and adds the iw to he mapping; I18N-05 says seventeen; I18N-06 adds that html dir is rtl exactly while Hebrew is active; the last-updated line names this quick task.
   - CONCERNS.md (seventeen translations, he in the list), STRUCTURE.md (the three "all sixteen languages" steps become seventeen), TESTING.md (the manual-switch language list adds he; the --coverage line may mention the BIDI findings).
   - Do not edit ROADMAP.md, STATE.md or any phase/quick artifact (historical records).
3. Glossary: confirm (e) and the Hebrew rows/columns from Task 1 still match the values actually shipped (site.nav labels equal column (b); a term changed during Tasks 2-4 is updated in (c)); fix any drift.
4. Regression visuals: re-capture index.html and the Sieve in he at 1280,1400 and the scratch-copy open-menu header at 375,900 (Task 1 step I) and confirm nothing regressed.
5. Run the consolidated gates below; then commit with explicit paths only (this task's files): docs(quick-261006-pks): seventeen languages with Hebrew across the living docs.
  </action>
  <verify>
    <automated>node .planning/phases/06-multi-language-support/i18n-check.js --all && node .planning/phases/06-multi-language-support/i18n-check.js --switcher-present --all && node .planning/phases/06-multi-language-support/i18n-check.js --api | awk '{print} /PASS api:/{f=1;ok=($4>415)} END{exit !(f&&ok)}' && node .planning/phases/06-multi-language-support/i18n-check.js --persistence | awk '{print} /PASS persistence:/{f=1;ok=($4>250)} END{exit !(f&&ok)}' && node .planning/phases/06-multi-language-support/i18n-check.js --smoke && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all</automated>
    <automated>n=$(node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs --report | grep -c '^MIRROR-DRIFT'); echo "MIRROR-DRIFT $n"; [ "$n" -le 8 ] && ! (grep -n -i -E 'sixteen (supported )?languages|all sixteen languages|sixteen translations' CLAUDE.md .claude/CLAUDE.md .planning/PROJECT.md .planning/REQUIREMENTS.md .planning/codebase/*.md) && grep -q 'lv, ru, el, he' CLAUDE.md && grep -q 'lv, ru, el, he' .claude/CLAUDE.md && grep -q 'lv, ru, el, he' .planning/codebase/CONVENTIONS.md && grep -q 'lv, ru, el, he' .planning/codebase/ARCHITECTURE.md && grep -q 'lv/ru/el/he' .claude/CLAUDE.md && grep -q 'lv/ru/el/he' .planning/codebase/STACK.md && grep -q 'seventeen' CLAUDE.md && grep -q 'dir="rtl"' CLAUDE.md && grep -q 'iw' CLAUDE.md && grep -q 'one, two, other' .claude/CLAUDE.md</automated>
    <automated>node -e 'const fs=require("fs");let bad=0;for(const f of ["assets/nt-i18n.js",...fs.readdirSync("assets/i18n").map(f=>"assets/i18n/"+f)]){const s=fs.readFileSync(f,"utf8");const flat=s.replace(/\s+/g," ");if(/sixteen (supported )?languages/i.test(flat)){bad++;console.log("STALE-COUNT",f)}const head=(s.split("*/")[0]||"");if(/Latvian/.test(head)&&!/Hebrew/.test(head)){bad++;console.log("PLURAL-NOTE",f)}}process.exit(bad?1:0)' && node -e 'const fs=require("fs"),vm=require("vm"),cp=require("child_process");const B="42ae6fa";const ld=s=>{const c={};const NT={i18n:{register:(n,d)=>{c[n]=d}}};vm.runInNewContext(s,{NT,window:{NT}});return c};let bad=0;for(const f of fs.readdirSync("assets/i18n").filter(f=>f.endsWith(".js"))){const o=ld(cp.execFileSync("git",["show",B+":assets/i18n/"+f],{encoding:"utf8"})),n=ld(fs.readFileSync("assets/i18n/"+f,"utf8"));for(const ns in o){for(const l in o[ns]){if(JSON.stringify(o[ns][l])!==JSON.stringify(n[ns]&&n[ns][l])){bad++;console.log("DICT-CHANGED",f,ns,l)}}if(!(n[ns]&&n[ns].he)){bad++;console.log("NO-HE",f,ns)}}for(const ns in n)for(const l in n[ns])if(l!=="he"&&!(o[ns]&&o[ns][l])){bad++;console.log("DICT-EXTRA",f,ns,l)}}console.log("DICT-UNCHANGED+HE bad="+bad);process.exit(bad?1:0)' && d=$(git diff 42ae6fa -- assets '*.html') && ! (printf '%s\n' "$d" | grep -E '^\+.*(font-family|fonts\.googleapis|@font-face)') && pages=$(git ls-files '*.html') && [ "$(printf '%s\n' "$pages" | tr '\n' '\0' | xargs -0 grep -l ':root\[dir="rtl"\]' | wc -l)" -ge 15 ]</automated>
    <human-check>Optional end-of-run spot-check by a Hebrew reader: open "Euclidean Algorithm/euclidean-algorithm.html?lang=he" and "RSA/rsa.html?lang=he", confirm the wording reads naturally (gender-neutral plural register), tool names match 06-GLOSSARY.md's he column, and every formula reads left-to-right. Hebrew cells are tagged [ASSUMED] in the glossary like every other added language.</human-check>
  </verify>
  <done>CLAUDE.md, .claude/CLAUDE.md and its codebase mirrors, PROJECT.md, REQUIREMENTS.md, CONCERNS.md, STRUCTURE.md and TESTING.md state seventeen languages with he, Hebrew's plural shape, iw detection and the RTL/bidi rules, while all page counts stay sixteen; shadow-check.js --docs reports no more than its 8 pre-existing findings; the complete static, api, persistence, smoke and shadow suites pass; every namespace has he and every other language is unchanged; no font change anywhere; regression screenshots are clean; one commit.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL / cookie / localStorage → assets/nt-i18n.js | ?lang=, site-lang cookie and site-lang storage values are untrusted input; only an exact SUPPORTED_LANGS match is accepted |
| navigator.languages → detectDefaultLang | browser-supplied tags; mapped to a supported code or ignored |
| assets/i18n/*.js values → DOM | first-party static data rendered as text nodes / textContent only |
| active language → html dir attribute and :root[dir="rtl"] CSS | layout direction switch for the whole page |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-pks-01 | Tampering | assets/nt-i18n.js valid() allow-list | high | mitigate | Only the literal 'he' is appended to SUPPORTED_LANGS. iw is handled solely inside detectDefaultLang and never becomes an allow-list code; the Task 1 engine gate and --api assert setLang('iw'), setLang('he-IL') and setLang('HE') return false. |
| T-pks-02 | Tampering / Injection | html dir attribute | low | mitigate | The dir value is the constant 'rtl' chosen from the engine's internal RTL_LANGS after allow-list validation, never taken from input; for every other language the attribute is removed. Asserted by the Task 1 engine gate and the --api transition loop. |
| T-pks-03 | Spoofing | bidi control characters in dictionary values (Trojan-Source-style visual reordering) | medium | mitigate | Only isolates (U+2066–U+2068 with U+2069) are permitted and must balance (BIDI-UNBALANCED); embeddings/overrides U+202A–U+202E are rejected (BIDI-CONTROL); literal bidi controls in source are rejected (BIDI-RAW) so every control is a visible \u escape. Enforced by --coverage on every language, not only he. |
| T-pks-04 | Tampering (XSS) | he values in assets/i18n/*.js | medium | mitigate | DICT-MARKUP in --coverage rejects markup in every value and plural form; the engine's text-node/textContent-only rendering is unchanged (the fake DOM in --api throws on any innerHTML use). |
| T-pks-05 | Spoofing | mixed-script look-alike text | low | mitigate | SCRIPT-MIXED now counts Hebrew as a fourth script; ru and el foreign patterns now reject Hebrew letters and he's foreign pattern rejects Cyrillic and multi-letter Greek. |
| T-pks-06 | Tampering | English and existing-language output | high | mitigate | dir is removed (not set to ltr) for LTR languages; every new CSS rule is scoped to :root[dir="rtl"], and the two property swaps (margin-inline-end, inset-inline-end) compute identically in LTR; DICT-UNCHANGED proves every non-he value of every namespace equals 42ae6fa; i18n-browser switch mode passes on all 16 pages. |
| T-pks-07 | Spoofing | detectDefaultLang two-letter prefix path | low | accept | A rare three-letter tag beginning with he (e.g. heb) maps to he, exactly as the existing prefix path already does for other codes; accepted in 261003-57k (T-57k-03) and unchanged in kind here. |
| T-pks-08 | Denial of Service | 375px layout in Hebrew | low | mitigate | i18n-browser.js layout mode on all 16 pages (he no wider than English + 8px) plus the 375px open-menu header screenshot. |
| T-pks-09 | Information Disclosure | unrelated working-tree changes | low | mitigate | Every commit stages explicit paths only; .planning/config.json and the untracked directories are never staged. |
| T-pks-SC | Tampering | npm/pip/cargo installs | high | accept | No package manager exists in this repo and no install is planned; the gates use Node built-ins and the system Chrome only. |
</threat_model>

<verification>
- After Task 4: node .planning/phases/06-multi-language-support/i18n-check.js --all exits 0 with every namespace carrying he.
- After Task 5: --all, --switcher-present --all, --api (more than 415 assertions), --persistence (more than 250), --smoke and shadow-check.js --all pass; shadow-check.js --docs reports at most its 8 pre-existing findings.
- i18n-browser.js --mode switch,layout passed with langs=16 on every one of the 16 pages (Sieve in Task 1, six pages in Task 2, six in Task 3, three in Task 4).
- Hebrew and English screenshots of every page were compared during Tasks 1-4: RTL prose, unmirrored diagrams, left-to-right formulas.
</verification>

<success_criteria>
- Hebrew is selectable on every page and the whole site renders in Hebrew, right-to-left, with diagrams, formulas, numerals and numeric controls left-to-right.
- Every key of all 18 namespaces has a Hebrew value; Hebrew plurals are {one, two, other}; no English, foreign-script or unisolated numeric formula remains in any Hebrew value.
- No regression for the other sixteen languages or for English.
- Docs say seventeen languages and describe the Hebrew/RTL rules.
- Five commits, one per task, each preceded by its i18n-check.js run.
</success_criteria>

<output>
Create `.planning/quick/261006-pks-add-hebrew-he-as-the-seventeenth-support/261006-pks-SUMMARY.md` when done, listing per task the commit, the gates run, the page LTR selectors chosen per page, and any known RTL gap recorded under Task 2 step 3's rule.
</output>
