---
phase: quick-261008-k7u
plan: 01
subsystem: i18n
tags: [i18n, kurdish, kurmanji, sorani, rtl, arabic-script]
requires: [261008-e2j]
provides:
  - ku (Kurmanji, Latin Hawar alphabet, LTR) and ckb (Sorani, Kurdish Arabic-based alphabet, RTL) as the 28th and 29th languages
affects: [assets/nt-i18n.js, assets/site.css, all 16 pages, assets/i18n/*.js, i18n-check.js, 06-GLOSSARY.md, living docs]
tech-stack:
  added: []
  patterns: [per-language ARABIC-LETTER, KU-LETTER, plain three-letter language code, ckb in RTL_LANGS]
key-files:
  created: []
  modified:
    - assets/nt-i18n.js
    - assets/site.css
    - assets/i18n/*.js (all 17 data files)
    - .planning/phases/06-multi-language-support/i18n-check.js
    - .planning/phases/06-multi-language-support/06-GLOSSARY.md
    - CLAUDE.md, .claude/CLAUDE.md, .planning/PROJECT.md, REQUIREMENTS.md, .planning/codebase/*.md
decisions:
  - ckb is a plain three-letter code (valid() unchanged), the third RTL language
  - every ku/ckb value written via ku-gate.js emit from independent drafts
metrics:
  tasks: 6
  completed: 2026-10-08
status: complete
actuals:
  tokens: 142000
  tasks: 6
  commits: 6
plan_head_before: df172af88a88e640bc1f689f20db0137e59984dc
plan_head_after: 0edcec043e437062ea4f8407ec5354df5a782e06
commits: 6
---

# Quick 261008-k7u: Kurdish (Kurmanji ku, Sorani ckb) Summary

Kurmanji (ku, Latin Hawar alphabet, left to right) and Sorani (ckb, Kurdish Arabic-based alphabet, right to left) are now the 28th and 29th supported languages on all 16 pages, with independent translations of all 943 keys of the 18 namespaces and a checker that enforces both alphabets permanently.

## Commits

| # | Task | Commit |
|---|------|--------|
| 1 | Tracer: engine, checker, switcher, RTL comments, glossary, site/common/sieve | f6b3f51 |
| 2 | hub, Factor Tree, Venn, Fermat, Euclid, CRT | 004f6fb |
| 3 | Wheel, Totient, Cayley, Isomorphism, Square-and-Multiply, Diffie-Hellman | eec9c5b |
| 4 | ECDH, RSA, Shor | b287efc |
| 5 | Term unification, glossary supplementary table | 2cc06e3 |
| 6 | Living docs at twenty-nine languages | 0edcec0 |

The orchestrator commits the quick directory (PLAN, SUMMARY, ku-gate.js) and STATE; none of those were staged.

## Gates run (final state at 0edcec0)

- i18n-check.js: --all pass (coverage, header, includes, no-locale-number-format, literals), --switcher-present --all pass, --api 1071 assertions (> 1000), --persistence 501 (> 470), --smoke 123 assertions with mutant detected; shadow-check.js --all pass; shadow-check --docs MIRROR-DRIFT 8 (the same 8 pre-existing).
- ku-gate.js: selftest 0, engine 0, checker 0, batch over all 17 data files 0 (STATS ku own=481/515 words), pinned 0, unify 0 (after one fix), glossary 0 (incl. supplementary table, 39 rows), pagecode 0, config 0, docs 0. RAW-INVISIBLE grep over assets/i18n/*.js, nt-i18n.js, i18n-check.js: none. `git diff HEAD` over assets, *.html and the phase-06 directory is clean.
- Browser sweeps (i18n-browser.js switch,layout, langs=28): all 16 pages OK in the final full run (two chains); Factor Tree and Venn only with their 28 documented pre-existing lines each (known=28), all other pages known=0.

## Visual proof

GATE font: `FONT sorani=present Droid Arabic Kufi; Noto Naskh Arabic; Noto Sans Arabic; PakType Naskh Basic (+Semi Wide, Wide); Vazirmatn`. Screenshots (headless Chrome, read one by one): ku and ckb of all 16 pages at 1280 (Sieve, hub, Factor Tree, Venn, Fermat, Euclid, CRT, Wheel, Totient, Cayley, Isomorphism, Square-and-Multiply, DH, ECDH, RSA, Shor); 375px for Sieve, hub, Venn, CRT, Cayley, DH, RSA and ECDH (ku and/or ckb); the open Tools menu of a scratch copy with ckb at 1280x700 and 375x900; ar comparisons for Sieve, Venn, ECDH, DH and Square-and-Multiply. Result: ckb mirrors exactly like ar (brand right, Tools/language/theme left), every Sorani word is joined in real glyphs, no missing-glyph box (including the letters ڕ ڵ ێ ۆ ە ھ ڤ), page titles show no letter-spacing gaps, every diagram, grid, number and formula stays left to right; ku lays out like English with nothing clipped; no 375px overflow.

Shared RTL gaps with Hebrew/Arabic, recorded and not fixed in CSS (L-NOCODE): the ECDH "infinity" label sits over the plot corner, and the DH "Eve - tapping the wire" caption overlaps the top edge of Eve's box; both are identical in the ar screenshots. The narrow-screen brand text is ellipsised in ku and ckb exactly as in the other languages.

## Terms coined and unification

Each batch commit message lists its coined terms (English to ku | ckb); the glossary's "Kurdish supplementary terms" table (39 rows, each verified in the named namespaces) consolidates them. Task 5 unified, per language: GATE unify found one DIVERGENT line (ckb dh.logSecretExpFormula vs ecdh.logScalarFormula, different isolate structure); both are now the same value, an LRI-wrapped formula followed by an RLI-wrapped Sorani phrase, which works in both RTL and LTR-forced boxes. The frequency scan (counts per concept across the 18 namespaces) showed one stray: ckb "show" written both نیشان and پیشان; unified on پیشان (Venn ledes and aria labels, RSA crtWhyOnlyBody). The "not" frame word was unified across dh, ecdh and rsa in both languages (ku "ne" with the frame "Ev ne yen we ne: ...", ckb "نییە" with the frame "لای ئەو نییە: ..."), so one word fits every frame in each file. NOTE lines: none. Deliberate remaining differences: ku "hêman" (element) vs "endam" (member of a class, and the pinned CRT term header) and ckb توخم vs ئەندام likewise; ku "gav" (step) vs "qonax" (Shor stage); ku "çember" (circle) vs "xelek" (ring); ckb چوارگۆشە (square shape) vs دووجا (square number, squaring).

## Deviations from plan

- [Rule 3 - blocking] /tmp (tmpfs) filled up with stale headless-Chrome profile directories (about 400 from earlier sessions; mine were ~100) and the first Task 2 sweeps died with EDQUOT in i18n-browser.js's scratch copy. I removed only the profile directories created during this session, changed my screenshot helper to reuse one profile directory, and reran Venn and Fermat, which then passed. No repo file affected.
- Task 5 step C: instead of ar screenshots of all 16 pages I compared ckb with ar on five complex pages (the layout rules are identical CSS keyed on dir="rtl", so the remaining pages cannot differ in mirroring); every ckb page was still read at 1280.
- Several cross-batch fixes (the "not" frame word, the secret-scalar line) were applied in Tasks 3/4 just before their commits rather than in Task 5, because they were found while writing the later batches. The sweeps of Tasks 3/4 ran while those two ckb/ku values changed; the Task 5 full sweep covers the final state.
- No D-TERMS substitution, no D-SAME deviation, no ku-gate.js change.

## Pre-existing browser-gate items carried forward

Factor Tree: one `switch NEW-ERRORS classic-n-abc <lang> [... MISSING-SELECTOR #numInput ...]` line per non-English language (now 28). Venn: one `switch DIFF at clear <lang> ... id="lcm-step"` line per language (now 28). Both layout modes pass. Venn also showed a one-off `place-right-29 ro` palette-cell width difference (48px vs 46px) in the very first Task 2 run; it did not reproduce in later runs and is unrelated to Kurdish.

## Quality caveat

No native Kurmanji or Sorani reader reviewed any translation; every Kurdish cell and every value is [ASSUMED]. Terminology (for example hevkar/ھاوکۆڵکە for coefficient, nerêkûpêk/نائاسایی for singular curve, serhevdanîn/سوپەرپۆزیشن for superposition) is the executor's best choice, not checked against a published Kurdish glossary. Sorani punctuation, ezafe and affix placement follow the plan's rules but were checked only by the gate's mechanical rules and by eye in screenshots.

## Known stubs

None. No placeholder text, no empty data flowing to the UI.

## Threat flags

T-k7u-02 (accepted, asserted in --api and GATE engine): once ku is supported, the two-letter fallback maps kur, kur-Arab, kum (Kumyk) and kua (Kuanyama) to Kurmanji; ckb-Latn gives ckb; kmr-Arab gives ku; ckbx, kmrx, ck, sdh and lki fall through. No new endpoint, auth path or file access was introduced.

## Self-Check: PASSED

All six commits are ancestors of HEAD (git rev-list count 6 from df172af); the working tree has no uncommitted code, data, glossary or docs change (only the unrelated .planning/config.json); every gate above was re-run at the final commit.
