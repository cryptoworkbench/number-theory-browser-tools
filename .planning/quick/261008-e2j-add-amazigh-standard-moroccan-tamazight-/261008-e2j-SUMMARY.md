---
phase: quick-261008-e2j
plan: 01
subsystem: i18n
tags: [i18n, zgh, zgh-Latn, zgh-Tfng, tamazight, ircam, tifinagh, script-tagged-codes, fixed-plural-rule, transliteration-gate]
requires:
  - phase: quick-261008-0h2
    provides: twenty-five languages, plan-local gate pattern, batch/unify/sweep workflow, glossary columns
  - phase: quick-261007-pbf
    provides: non-Latin SCRIPT_RULES entries and cross-script foreign patterns
provides:
  - zgh-Latn (Tamaziɣt, IRCAM Latin transcription) and zgh-Tfng (ⵜⴰⵎⴰⵣⵉⵖⵜ, IRCAM Tifinagh) as the 26th and 27th supported languages, left to right, on all 16 pages
  - a script-tagged language-code shape (three-letter primary subtag plus script subtag), matched exactly and case-sensitively on every channel
  - zgh/tzm/ber browser-detection branch (Latn subtag gives zgh-Latn, otherwise zgh-Tfng; kab, shi and rif unmapped)
  - engine-fixed { one, other } plural rule (one for exactly 1) because Intl.PluralRules has no zgh data
  - zgh values for every key of all 18 namespaces (943 keys, 13 plural keys as { one, other }); zgh-Tfng is the letter-for-letter IRCAM transliteration of zgh-Latn, held equal by permanent ZGH-TRANSLIT and ZGH-NOTATION findings
  - i18n-check.js knows both codes (switcher entries, FIXED_PLURAL_LANGS, digit parity, Tifinagh script rule with cross-script guards, IRCAM Latin letter check, transliteration and notation parity, Tamazight api and persistence assertions)
  - Tamazight contracts, zgh columns in (a)-(f) of 06-GLOSSARY.md and a 125-row supplementary terms table; living docs at twenty-seven languages
affects: [every future new tool and every future new language]
tech-stack:
  added: []
  patterns:
    - "Second script of one language derived mechanically from the first (single source of truth) and guarded by a permanent checker finding"
    - "Engine-internal fixed plural rule for a language Intl has no data for (FIXED_PLURAL_LANGS, mirrored in the checker)"
    - "Script-tagged code shape added to the exact case-sensitive allow-list without touching valid()"
key-files:
  created: []
  modified:
    - assets/nt-i18n.js
    - .planning/phases/06-multi-language-support/i18n-check.js
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md
    - assets/i18n/*.js (all 17 data files, zgh-Latn then zgh-Tfng last in every register call)
    - index.html and the 15 tool pages (two switcher option lines each)
    - CLAUDE.md, .claude/CLAUDE.md, .planning/PROJECT.md, .planning/REQUIREMENTS.md, .planning/codebase/{STACK,CONVENTIONS,ARCHITECTURE,CONCERNS,STRUCTURE,TESTING}.md
decisions:
  - "Engine diff is exactly the five pinned edits in assets/nt-i18n.js (header comment, SUPPORTED_LANGS, FIXED_PLURAL_LANGS plus its comment, the first line of pluralCategory, the zgh/tzm/ber detection branch after the in branch); valid(), RTL_LANGS and resolveTemplate are untouched (zgh-gate.js engine: bad=0)"
  - "zgh-Latn is written from the English value; zgh-Tfng is never typed but derived by zgh-gate.js derive and kept equal by ZGH-TRANSLIT/ZGH-NOTATION; the few single-letter notation choices that the derive heuristic got wrong were corrected by hand (see Deviations)"
  - "Both codes are in DIGIT_PARITY_LANGS; neither is in RTL_LANGS, CJK_LANGS or PLURAL_OTHER_ONLY_LANGS; no i18n-config change (no zgh prose value equals its English value)"
  - "Alice, Bob, Eve, acronyms, code identifiers, gcd/lcm/mod/log, Blowfish, ms and the key-cap names stay Latin in both scripts; eponyms are adapted to IRCAM Latin and transliterated (Uklid, Iratustin, Ulir, Firma, Kayli, Fin, Cur, Difi-Hilman, Bizu)"
  - "No font is shipped: Tifinagh renders in the system fallback font; a visitor without a Tifinagh font sees missing-glyph boxes, which the site deliberately does not work around"
metrics:
  duration: "about 4.5 h wall-clock (most of it headless-Chrome sweeps, 120 s to 2800 s per page)"
  completed: 2026-10-08
status: complete
actuals:
  tokens: 96600
  tasks: 6
  commits: 6
plan_head_before: e069e15586c7fd80c761a2c53f375363bd49a8be
plan_head_after: d0c323f63704192da215d12a28cbbcbcc112f6a6
---

# Phase quick-261008-e2j Plan 01: Add Standard Moroccan Tamazight (zgh-Latn, zgh-Tfng) Summary

Standard Moroccan Tamazight (IRCAM standard, ISO 639-3 zgh) is now the 26th and 27th supported language in two scripts, the same text twice: zgh-Latn (Tamaziɣt, IRCAM Latin transcription) written from English, and zgh-Tfng (ⵜⴰⵎⴰⵣⵉⵖⵜ, IRCAM Tifinagh) derived from it letter by letter and permanently guarded by ZGH-TRANSLIT/ZGH-NOTATION in `i18n-check.js`.

**Quality caveat.** I am not a native Tamazight speaker. Every translated value is `[ASSUMED]` apart from the few terms the plan marked `[CITED]` (zgh.wikipedia.org): many values use neologisms or French/Arabic loans adapted to IRCAM letters (listed in the glossary's 125-row supplementary table), and the grammar was kept deliberately simple. The gates prove letters, transliteration, placeholders, numerals, plural shape and layout, not idiom. A native review of the vocabulary and the sentences is recommended before the language is advertised.

## Commits

| Task | Commit | Message |
|------|--------|---------|
| 1 (tracer) | 1968c3e | feat(quick-261008-e2j): Tamazight engine, gate tooling and site/common/sieve dictionaries in Latin and Tifinagh |
| 2 | 76d57d4 | feat(quick-261008-e2j): Tamazight for the hub, Factor Tree, Venn, Fermat, Euclid and CRT |
| 3 | c2e0dc8 | feat(quick-261008-e2j): Tamazight for the Wheel, Totient, Cayley, Isomorphism, Square-and-Multiply and Diffie-Hellman |
| 4 | e24d7fb | feat(quick-261008-e2j): Tamazight for ECDH, RSA and Shor's Algorithm |
| 5 | bb1542c | fix(quick-261008-e2j): unify Tamazight terms across batches |
| 6 | d0c323f | docs(quick-261008-e2j): twenty-seven languages with Standard Moroccan Tamazight in Latin and Tifinagh across the living docs |

All six are on `main` (config `allow_default_branch_commits: true`), explicit paths only, none pushed. `zgh-gate.js`, `261008-e2j-PLAN.md`, this SUMMARY and STATE.md are not committed (the orchestrator commits them). `git rev-list --count e069e15..HEAD` = 6.

## Gates run (final state, d0c323f)

| Gate | Result |
|------|--------|
| `zgh-gate.js selftest` / `engine` / `checker` | bad=0 / bad=0 / bad=0 |
| `i18n-check.js --api` | PASS, 903 assertions (729 at e069e15) |
| `i18n-check.js --persistence` | PASS, 437 assertions (383 at e069e15) |
| `i18n-check.js --smoke` | PASS, 123 assertions (mutant detected) |
| `i18n-check.js --all`, `--switcher-present --all` | PASS, 16 pages each, 0 coverage findings |
| `shadow-check.js --all` / `--docs` | PASS / 8 MIRROR-DRIFT (the same 8 as at e069e15) |
| `zgh-gate.js batch` (all 17 data files) | bad=0; STATS zgh-Latn own=503/515, prose=927, maxShared=[] |
| `zgh-gate.js translit` | 956 values, bad=0 |
| `zgh-gate.js unify` / `glossary` / `docs` / `pagecode` / `config` | bad=0 each |
| RAW-INVISIBLE grep (i18n-check.js, nt-i18n.js, all assets/i18n/*.js) | clean |
| `zgh-gate.js sweep` (i18n-browser.js switch,layout, langs=26) | all 16 pages OK in the final full sweep (Factor Tree and Venn with exactly their 26 documented lines each; the other 14 print `switch PASS ... langs=26` and `layout PASS`) |

Per-task sweeps: Task 1 Sieve; Task 2 hub, Factor Tree, Venn, Fermat, Euclid, CRT (hub and CRT re-swept after a wording tweak); Task 3 Wheel, Totient, Cayley, Isomorphism, Square-and-Multiply, Diffie-Hellman; Task 4 ECDH, RSA, Shor; Task 5 all 16 again. Venn needed one automatic rerun of a flaky-looking first run in Task 2 (two unexpected lines, then OK with its 26 known lines).

## Visual proof

- Screenshot command of the plan (headless Chrome, scratch directory, read with the Read tool, never in the repo): zgh-Latn and en of every page at 1280x1400; zgh-Latn at 375x900 for Sieve, hub, Venn, CRT, Cayley, Diffie-Hellman, RSA, ECDH; open Tools menu of a scratch copy at 1280x700 and 375x900 (zgh-Latn) and 1280x700 (zgh-Tfng).
- Tifinagh glyph check (L-FONT): `zgh-gate.js font` printed `FONT tifinagh=present /home/mainaccount/.local/share/fonts/NotoSansTifinagh-Regular.ttf: Noto Sans Tifinagh:style=Regular`. zgh-Tfng screenshots read at 1280x1400 for all 16 pages, at 375x900 for Sieve, hub, Venn, Cayley, RSA and ECDH, plus the open Tools menu. Every Tifinagh word renders in real glyphs; no missing-glyph box was found, so no cause had to be investigated. Latin notation letters, Alice/Bob/Eve, RSA, gcd/mod and every digit sit inline as intended.
- Layout findings fixed in the wording only: the RSA locked-step note overlapped the longer Step 3 heading and the dock title clipped at the right edge, so `rsa.step3Heading`, `rsa.lockNoteBoth3` and the two `scratchTitle` values were shortened. The English page has a slight pre-existing overlap of the same kind.
- A headless-Chrome screenshot of the Wheel once hung for 40 minutes (Chrome flake; the same URL rendered in 2.8 s on retry); the stuck process was killed.

## Terms coined and how Task 5 unified them

The commit bodies of Tasks 2-4 carry the "Terms coined" lists; the glossary now holds the consolidated 125-row supplementary table (English, zgh-Latn, zgh-Tfng, namespaces verified automatically, `[CITED]`/`[ASSUMED]`). Main coinages: allal (tool), brawzr (browser), tankult (box), aseklu (tree), tarmmt (branch), tazbalt (bin), timlalt (overlap/intersection), ifrqn (set differences), asnulfu (construction), asaṭr (line), ikufisyan (coefficient), asmgal (mirror), tdyagunalt (diagonal), amsmmunt (accumulator), asllum (ladder), lkulfa (cost), umsmmaɛ (eavesdropper), tmmdlt (tap), tkrrasa (notebook), amsbddl (stand-in), aquntum (quantum), tawrirt (cycle).

Task 5 unification: `zgh-gate.js unify` found one DIVERGENT line (dh.logSecretExpFormula vs ecdh.logScalarFormula, differing only in grammatical gender) and no NOTE lines. Both now read `... ar iqqim d tuffra, ur ittwazn ula tikkelt.` (no `--allow` needed). A count pass over the renderings of the pinned terms found euclid using bare `tayafut` (which also means "result") for the quotient; it is now `tayafut n ubḍu` (D-TERMS row 8) in all four values. Earlier, before Task 2 was committed, the nnes/nes/is possessive was unified to `nnes`, the plurals of taggayt to tiggayin, `tamrbuɛt` to `tamkkuẓt` (square table), `tlɣa` to `talɣa`, and the hub's Shor card was rewritten to match shor.lede.

## AMBIGUOUS variable choices corrected by hand

The derive heuristic keeps a single IRCAM letter Latin only in a math context or at a clause end; a/A in particular stayed Latin only next to math characters. Corrections made with a scratch `fixseg` helper (it rewrites one zgh-Tfng value from explicit segment indices; derive keeps such values because they still align): uppercase A in Venn (lede.two, lede.three, caption.left, caption.aOnly), lowercase a in euclid.chipBDividesA, crt.remainderLabel, ecdh (introP1, aLabel, errANotNumber, step.sendA, logACrossHeading), dh (aLabel, errAInvalid, errARange, step.alicePicks, step.bobComputesSecret, logACrossHeading, dlpFormula), shor.legendBase; the preposition-n versus variable-n collisions in hub.card.totient.desc, totient.xref, rsa.msgHintTotient, msgHintExtendedEuclid, eveNeedsPhi, resWinBody, resGiveupBody.other, errMsgTooBig, exchangeNotebookNever, crtWhyFasterBody (that value was also reworded to `umuḍul tummidt n` so the variable n is distinguishable). ZGH-NOTATION passes on every value.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] checkSwitcherPresent could not read script-tagged option values**
- **Found during:** Task 1 (`--header --switcher-present` reported "expected 27 language options, found 25" on all pages)
- **Issue:** the option regex in `i18n-check.js` only accepted `xx` or `xx-XX` codes
- **Fix:** accept a two- or three-letter code with an optional region or four-letter script subtag
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-check.js`
- **Commit:** 1968c3e

**2. [Rule 1 - Gate defect] ENGLISH-WORD flagged the adapted eponym Has (Hasse)**
- **Found during:** Task 4 (`ecdh.pillHasse` "tilas n Has")
- **Issue:** `has` is in the ENGLISH-WORD list while D-NAMES pins Has as the IRCAM form of Hasse
- **Fix:** `zgh-gate.js batch` now blanks the capitalised standalone `Has` before the English-word scan (one comment line states the reason); the plan-local gate script is not committed
- **Commit:** none (gate script)

**3. Glossary (c) cells use "singular, plural" instead of "(pl. ...)"**
- D-TERMS rows 1, 3, 5, 17, 20, 28, 46 and 51 are written `amḍan amnzu, imḍanen imnza` etc. because `pl` contains the letter p, which GLOSSARY ZGH-LETTER rejects in a zgh-Latn cell.

**4. Re-sweep of hub and CRT after a wording tweak**
- After the Task 2 sweeps I changed a few words in hub.js and chinese-remainder-theorem.js (tigrumin, tamkkuẓt, talɣa, tiggayin, tamsawat, the Shor card) and re-ran those two sweeps before committing.

**5. Unify handled by wording, not `--allow`**
- The plan allowed a recorded `--allow` for a deliberate one-word difference; none was needed.

### Plan items followed exactly
- No D-TERMS substitution, no D-SAME deviation (the only identical values are the four pure formula templates plus non-prose formulas such as `N = {n}`, `φ({n}) = {phi}` and `a^(r/2) = {x} ≡ −1 mod N.`), no i18n-config change, no page-code change beyond the two option lines per page.

## Pre-existing browser-gate items carried forward

- Factor Tree prints one `switch NEW-ERRORS classic-n-abc <lang> [...MISSING-SELECTOR #numInput...]` line per non-English language (26 now) and Venn one `switch DIFF at clear <lang>: html differs ... id="lcm-step"` line per language (26 now); both pages' layout mode passes. Not caused or fixed here.
- shadow-check.js --docs keeps its 8 pre-existing MIRROR-DRIFT findings.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: detection-side-effect (T-e2j-02, accepted) | assets/nt-i18n.js | A browser whose first supported preference has primary subtag `tzm` (Central Atlas Tamazight) or `ber` (collective Berber tag, also sent by some Algerian stacks such as ber-DZ) now defaults to Moroccan Standard Tamazight in Tifinagh (zgh-Tfng, or zgh-Latn when the tag carries Latn). Only a default the visitor can change. zg, zgx, zghx, tz, tzmx, be, bem and berx still fall through to English (asserted); kab, shi and rif stay unmapped (asserted); valid() is unchanged and still exact and case-sensitive |

No other new network, auth, file-access or schema surface.

## Known Stubs

None. No placeholder text, TODO or hard-coded empty value flows to the UI from this plan.

## Self-Check: PASSED

- Files: `assets/nt-i18n.js`, `.planning/phases/06-multi-language-support/i18n-check.js`, `.planning/phases/06-multi-language-support/06-GLOSSARY.md`, all 17 `assets/i18n/*.js`, `index.html`, the 15 tool pages and the ten living docs exist and carry the changes (FOUND).
- Commits 1968c3e, 76d57d4, c2e0dc8, e24d7fb, bb1542c, d0c323f are ancestors of HEAD (FOUND); `git rev-list --count e069e15..HEAD` = 6.
- `git diff --quiet HEAD -- assets '*.html' .planning/phases/06-multi-language-support` is clean; the only tracked file still modified in the working tree is the pre-existing `.planning/config.json`.
