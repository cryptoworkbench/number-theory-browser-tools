---
phase: quick-261006-vpp
plan: 01
subsystem: i18n
tags: [i18n, hindi, devanagari, nt-i18n, i18n-check, glossary]
status: complete

requires:
  - phase: quick-261006-pks
    provides: seventeen-language engine, i18n-check.js / i18n-browser.js gates, glossary conventions (Hebrew baseline 1e911a1)
provides:
  - Hindi (hi) as the eighteenth supported language on all 16 pages, the site's first Devanagari-script language (left to right, system fallback font, no CSS change)
  - a hi block for every key of all 18 namespaces (943 keys), plurals as {one, other}
  - gate tooling extended to Hindi (hi switcher entry, SCRIPT_RULES.hi, Devanagari-aware SCRIPT-MIXED, NATIVE-DIGIT / ZERO-WIDTH / NOT-NFC, DIGIT-PARITY, Hindi api/persistence assertions)
  - one Hindi rendering per concept across all batches, recorded in the glossary
  - living docs moved to eighteen languages
affects: [i18n, glossary, living docs, i18n-check.js]

actuals:
  tokens: 41383
  tasks: 6
  commits: 6
plan_head_before: 1e911a13c3a230550f3ed5cee774fb1e174b06c8
plan_head_after: e3a8519872de455810974a3600298f16a0e1b607

tech-stack:
  added: []
  patterns:
    - "hi appended to SUPPORTED_LANGS only; detection rides the existing lowercased two-letter path, RTL_LANGS stays ['he']"
    - "Hindi numerals are ASCII and copied verbatim from English (DIGIT-PARITY); scale words become मिलियन/बिलियन/ट्रिलियन"
    - "letter-run regex [\\p{L}\\p{M}]+ so a Latin letter glued to a Devanagari vowel sign is SCRIPT-MIXED"

key-files:
  created: []
  modified:
    - assets/nt-i18n.js
    - assets/i18n/*.js (all 17 data files)
    - .planning/phases/06-multi-language-support/i18n-check.js
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md
    - all 16 .html pages (switcher option only)
    - CLAUDE.md, .claude/CLAUDE.md
    - .planning/PROJECT.md, REQUIREMENTS.md, codebase/{STACK,CONVENTIONS,ARCHITECTURE,CONCERNS,STRUCTURE,TESTING}.md

key-decisions:
  - "hi is appended to SUPPORTED_LANGS; setLang/?lang=/cookie/storage accept only the exact code hi (hi-IN, HI, hin rejected), browser detection maps hi, hi-IN, HI_in to hi and keeps en-IN English"
  - "No D-CLIP fix was needed: assets/site.css and every page style block are untouched, no font link, @font-face or font-family anywhere"
  - "Hindi numerals stay ASCII with English grouping; मिलियन/बिलियन/ट्रिलियन instead of लाख/करोड़"
  - "Cross-batch unification (Task 5): see the table below"

requirements-completed: [QUICK-261006-vpp, I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, I18N-06]
---

# Phase quick-261006-vpp Plan 01: Hindi as the eighteenth language Summary

Hindi (हिन्दी, `hi`) now works on all 16 pages: a complete Hindi value for every key of all 18 namespaces in Devanagari, left to right, in the browser's system fallback font, with ASCII numerals identical to English, `{one, other}` plurals (`one` covers 0 and 1), and the gate tooling and living docs moved to eighteen languages.

## Commits (6, measured from 1e911a1)

| Task | Commit | What |
|---|---|---|
| 1 (tracer) | 3b48ca4 | `hi` appended to SUPPORTED_LANGS; i18n-check.js Hindi rules (switcher entry, SCRIPT_RULES.hi, charFindings, digitParityFindings, api/persistence assertions); the हिन्दी option on all 16 pages; glossary contract and hi columns (b)(c)(d)(f); site, common and sieve dictionaries |
| 2 | bebc545 | hi for hub, factorTree, venn, euclid, crt, fermat |
| 3 | af66aa1 | hi for wheel, totient, cayley, iso, sqm, dh |
| 4 | 836dbcd | hi for ecdh, rsa, shor |
| 5 | 7f47c32 | fix: Hindi term unification across the 17 data files plus the glossary supplementary table |
| 6 | e3a8519 | docs: eighteen languages with Hindi across CLAUDE.md, .claude/CLAUDE.md, PROJECT.md, REQUIREMENTS.md and the six codebase docs |

## Task 5: term unification

Dumped every hi value (943 entries), compared them with the "Terms coined" lists of Tasks 1-4, grouped identical English strings that carried different Hindi, and checked orthographic variants (nukta, anusvara, short/long vowel signs: none divergent). Only hi values changed; every other language is byte-identical to 1e911a1 (HI-BATCH gate: DICT-CHANGED 0).

| Concept | Before (batch) | Chosen | Sites changed |
|---|---|---|---|
| Randomize | यादृच्छिक बनाएँ (Factor Tree, Venn) vs यादृच्छिक करें (rest) | यादृच्छिक करें | factorTree, venn x2 |
| teaching demo / demo | शिक्षण प्रदर्शन (ECDH, RSA, Shor) vs शिक्षण डेमो (DH, SqM) | प्रदर्शन | dh x4, sqm x3 |
| key exchange | already one form: कुंजी विनिमय (DH heading, ECDH cross-link, hub, SqM link); site.nav stays डिफ़ी-हेलमैन / दीर्घवृत्तीय वक्र DH per D-TOOLS | kept | none |
| gcd | spelled out everywhere except Shor's pill/step labels (म.स.), exactly the D-GCD space-constrained exception | kept | none |
| use | उपयोग / इस्तेमाल / प्रयोग / प्रयुक्त | उपयोग | dh x3, ecdh, rsa, sqm |
| Run / Compute | Euclid शुरू करें; Totient, SqM गणना करें; none collides with Play (चलाएँ) | kept | none |
| wedge, residue, cell/box | फाँक (hub, wheel, totient, cayley), अवशेष (CRT only; remainder is शेषफल), खाना (sieve, cayley, hub) | kept | none |
| function | फलन vs फ़ंक्शन; कुंजी-व्युत्पन्न vs -व्युत्पत्ति | फलन; कुंजी-व्युत्पत्ति फलन | dh, ecdh |
| whole number / integer | पूर्णांक vs पूर्ण संख्या for "whole number" | पूर्ण संख्या (पूर्णांक only for "integer") | cayley, dh x4, totient, sqm x3 |
| real / actual | वास्तविक vs असली for "real" | असली (वास्तविक for actual/genuine) | dh, sqm |
| cryptography | कूटविज्ञान (hub x2) vs क्रिप्टोग्राफ़ी/क्रिप्टोग्राफ़िक (sqm, dh, ecdh) | क्रिप्टोग्राफ़ी family | hub x2 |
| inverse | व्युत्क्रम (cayley "own reciprocal", Shor inverse QFT) vs प्रतिलोम | प्रतिलोम (अपना ही गुणात्मक प्रतिलोम; प्रतिलोम क्वांटम फ़ूरिये रूपांतरण) | cayley, shor x4 |
| ring | वलय (hub wheel card, Shor) vs छल्ला (wheel) | छल्ला | hub, shor x2 |
| order finding | कोटि-खोज vs कोटि ज्ञात करना | कोटि ज्ञात करना ("order search" stays कोटि की खोज) | shor x4 |
| non-negative / valid / toy-sized | ऋणेतर vs अऋणात्मक; वैध vs मान्य; खिलौना-आकार vs खिलौने के आकार | अऋणात्मक; मान्य; खिलौने के आकार के | rsa, dh x3 |
| remainder / stand-in / iso card | शेष 2, प्रतिस्थापन, तुल्याकारिताएँ | शेषफल 2, विकल्प, तुल्याकारिता (page + nav form) | hub x3 |
| factorize | गुणनखंड करें vs गुणनखंडन करें | गुणनखंडन करें | fermat x2 |
| identical DH/ECDH strings | differing word order/verbs (bannerReady, notebookHeading, log*CrossHeading, logTheyAgreeHeading, eveBruteForceBtn, logHeading) | one text each | dh, ecdh |

Register slips (tu/tum imperatives) and "." sentence endings: none found. Glossary: added the "Hindi supplementary terms" table (88 rows, every term verified to appear in the named namespaces by script), the unification-decision paragraph, and cross-batch conventions in the (a) Hindi entry (how the `{verbing}`/`{ordWord}`/`{word}` frames were resolved); (b) and (f) hi columns confirmed equal to the shipped site/common values; the (c) hi column holds citation forms, five of which (order of an element, cyclic group, binary expansion, square / multiply step, plaintext) appear in the UI only through their parts, recorded in the table note.

## Gates

- `i18n-check.js --all`: coverage, header, includes, no-locale-number-format, literals-markup, literals-js PASS on 16 pages (after Tasks 5 and 6)
- `--switcher-present --all` PASS; `--api` PASS 474 assertions (needed > 465); `--persistence` PASS 284 (needed > 275); `--smoke` PASS 123 assertions, mutant detected; `shadow-check.js --all` PASS on all 15 shadow-checked pages
- HI-BATCH gate: bad=0 (all non-hi values equal to 1e911a1, hi last and in en key order, no bidi marks, no D-AVOID spelling, no stale "seventeen" in data files); GLOSSARY-hi gate bad=0 (b: 16 rows, f: 8 rows)
- `shadow-check.js --docs`: MIRROR-DRIFT 8 = the 8 pre-existing findings; no written-out 17-language count remains in the living docs; `grep` checks for `el, he, hi`, `el/he/hi`, Devanagari, DIGIT-PARITY, हिन्दी, 261006-vpp all pass; 16 pages carry `<option value="hi" lang="hi">हिन्दी</option>`; no `font-family` / `fonts.googleapis` / `@font-face` added; `RTL_LANGS` still `['he']`
- `i18n-browser.js --mode switch,layout`, langs=17 on all 16 pages: PASS everywhere except the two documented pre-existing items below. One run of Venn under six-way parallel Chrome load printed an extra `switch DIFF at place-right-29 nl` (prime-picker html) line; a solo rerun printed only the documented lcm-step lines, so it was load flake, not a Hindi regression
- Regression screenshots (hi, day theme): `index.html` and the Sieve at 1280x1400, the open Tools menu in a scratch copy at 1280x700 and 375x900. Real Devanagari glyphs, nothing clipped or overlapping, the select shows हिन्दी, the Hindi tool names are legible, the Sieve grid and controls are identical to English

## D-CLIP fixes

None. `git diff 1e911a1 HEAD -- assets/site.css` is empty and no page style block changed (the only page edit is the switcher `<option>`).

## Terms coined (by task, final forms after Task 5)

Task 1: residue अवशेष, unit इकाई (प्रतिलोमीय अवयव), palette पैलेट, box (grid cell) खाना, order finding कोटि ज्ञात करना, factorization method गुणनखंडन विधि.

Task 2: cryptography क्रिप्टोग्राफ़ी (was कूटविज्ञान), randomize यादृच्छिक करें (was बनाएँ), composition/factorization area संयोजन/गुणनखंडन क्षेत्र, bin कूड़ेदान, clear/clear all साफ़ करें/सब साफ़ करें, wedge फाँक, overlap अधिव्यापन, overlap region उभयनिष्ठ भाग, intersection प्रतिच्छेदन, union संघ, set difference समुच्चय अंतर, simultaneous युगपत, pairwise coprime युग्मानुसार सह-अभाज्य, system निकाय, construction रचना, span विस्तार, residue class strips अवशेष वर्ग पट्टियाँ, tile टाइल, leftover बचा हुआ भाग, nested squares समाए हुए वर्ग, Bezout coefficients बेज़ू गुणांक, derivation व्युत्पत्ति, diagnostic mismatch जाँच में असंगति, scan स्कैन, Run शुरू करें, trivial pair तुच्छ जोड़ी, trail पथ, search log खोज लॉग, trial परीक्षण, Enter/Space/Delete एंटर/स्पेस/डिलीट.

Task 3: concentric ring संकेंद्री छल्ला, addend योज्य, sum योगफल, product गुणनफल, factor (multiplication) गुणक, its own negative/reciprocal अपना ही योगात्मक/गुणात्मक प्रतिलोम (reciprocal was व्युत्क्रम), image प्रतिबिंब, correspondence अनुरूपता, accumulator संचायक, ladder सीढ़ी, place value स्थानीय मान, non-negative अऋणात्मक, eavesdropper छिपकर सुनने वाला, wire tap टैप/टैपिंग, parameters प्राचल, subgroup उपसमूह, search space खोज-क्षेत्र, Compute गणना करें, Export निर्यात, dialog संवाद, teaching demo शिक्षण प्रदर्शन (was डेमो), key-derivation function कुंजी-व्युत्पत्ति फलन.

Task 4: key exchange कुंजी विनिमय, scatter plot प्रकीर्ण आलेख, singular विलक्षण, tangent/chord स्पर्श रेखा/जीवा, slope/intercept ढलान/अंतःखंड, midline मध्य रेखा, textbook RSA पाठ्यपुस्तकीय RSA, extended Euclidean algorithm विस्तारित यूक्लिडीय एल्गोरिथ्म, trial division परीक्षण-भाग, candidate divisor उम्मीदवार भाजक, index calculus सूचकांक कलन, recombination पुनर्संयोजन, precomputation पूर्व-गणना, Garner's formula गार्नर का सूत्र, operand ऑपरेंड, classical क्लासिकल, quantum क्वांटम, superposition अध्यारोपण, phase estimation कला आकलन, inverse QFT प्रतिलोम क्वांटम फ़ूरिये रूपांतरण (was व्युत्क्रम), perfect power पूर्ण घात, pre-checks पूर्व-जाँच, post-processing पश्च-प्रसंस्करण, parity समता, stand-in विकल्प, cycle walk चक्र-भ्रमण, ring diagram छल्ला आरेख (was वलय), truncation काट-छाँट, amplitude आयाम.

## Deviations from Plan

None - plan executed as written. The Task 5 browser sweep was run as six parallel page groups for speed (each run uses its own Chrome profile), and one Venn run was repeated alone after a load-induced flake (see Gates).

## Carried-forward failures (pre-existing, not caused or fixed here)

- Factor Tree `i18n-browser.js` switch: 17 lines `switch NEW-ERRORS classic-n-abc <lang> [... MISSING-SELECTOR #numInput ...]` (scenario targets `#numInput`, the page uses `#addInput`); layout passes
- Venn `i18n-browser.js` switch: 17 lines `switch DIFF at clear <lang>: html differs ... id="lcm-step"` (the hidden `#lcm-step` paragraph keeps its pre-switch text); layout passes

## Notes for the orchestrator

- The unexecuted Venn quick plan `261006-fd1` (third circle) predates both Hebrew and Hindi: when it runs it must ship its new strings in all eighteen languages, i.e. also he and hi, and its `.lcm-step`/DIFF expectations are unchanged.
- Hindi cells in the glossary are `[ASSUMED]` like every other added language; a Hindi reader's spot-check of Euclid and RSA with `?lang=hi` is the optional human check left open.

## Known Stubs

None.

## Threat Flags

None. No new network endpoint, auth path, file access or trust-boundary schema change; the engine change is the one `'hi'` allow-list token (T-vpp-01 mitigated by the Hindi api/persistence assertions).

## Self-Check: PASSED

- Commits 3b48ca4, bebc545, af66aa1, 836dbcd, 7f47c32, e3a8519 are ancestors of HEAD
- `git rev-list --count 1e911a1..HEAD` = 6 matches `actuals.commits`
