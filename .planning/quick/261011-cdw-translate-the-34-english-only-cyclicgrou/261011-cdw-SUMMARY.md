---
phase: quick-261011-cdw
plan: 01
subsystem: i18n
tags: [i18n, cyclic-groups, translation, rtl, zgh]
requires: [261009-tgw, 261010-i13]
provides:
  - "the 34 formerly English-only cyclicGroups keys in all 30 non-English blocks"
affects: [assets/i18n/cyclic-groups.js, i18n-config/cyclic-groups.json]
key-files:
  created:
    - .planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/insert-keys.js
    - .planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/fragments/ (29 x <code>.json)
  modified:
    - assets/i18n/cyclic-groups.js
    - .planning/phases/06-multi-language-support/i18n-config/cyclic-groups.json
decisions:
  - "Plural-agreeing adjectives for iso.additive/iso.multiplicative where the language inflects (es aditivos, fr additifs, pl addytywne, ...), since the label heads a tile of groups"
  - "he/ar/ckb: isolates only on iso.lead's angle-bracket g and iso.open's group placeholder; formula.* and tabTitle wrapped as the plan specified; MathML placeholders never isolated"
status: complete
commits: 1
plan_head_before: f58b8f78ec622484bb8edc2426a20e7bdd57d704
plan_head_after: d4da3760fc15409cb944c323eb39ad07cc4c3db2
actuals:
  tokens: 95000
  tasks: 3
  commits: 1
metrics:
  duration: 28 minutes
  completed: 2026-10-11
---

# Phase quick-261011-cdw Plan 01: Translate the 34 English-only Cyclic Groups keys Summary

All 34 previously English-only `cyclicGroups` keys are now translated in all 30 non-English languages (1,020 values), inserted at en's key position, with a rewritten header comment and an idempotent merge tool. The work is one commit, `d4da376`.

## What was done

- **Merge tool** `insert-keys.js`. It rebuilds from `git show HEAD:` on every run, so re-runs are idempotent.
  - It fills the 6 notation keys by rule: verbatim in LTR languages, isolate-wrapped in he/ar/ckb, with `tabTitle` isolating only the group placeholder.
  - It reads the 28 prose keys from `fragments/<code>.json` and derives zgh-Tfng from zgh-Latn through `zghTransliterate`.
  - It validates placeholder multisets, NFC, markup, invisible characters and isolate balance.
  - Its `--check` asserts key order, that every HEAD value is unchanged, and that the line diff against HEAD is confined to the inserted lines plus the header.
  - Isolates are serialized only as `⁦`/`⁩` escapes.
- **29 hand-written fragments** (28 prose keys each). zgh-Tfng is derived and has no fragment.
- **Header comment** of `assets/i18n/cyclic-groups.js` rewritten: every key is translated, and `--coverage` reports no cyclicGroups finding.
- **Checker config** gained the allowSame and allowRenderText entries listed below.

## Gate table (baseline vs after)

| Gate | Baseline (HEAD f58b8f7) | After |
|------|-------------------------|-------|
| `--coverage "Cyclic Groups/cyclic-groups.html"` | FAIL 120 (30 cyclicGroups + 90 out-of-scope) | FAIL 90, all out-of-scope (hub/lcm/site lcm lines); `CG 0 SUMMARY 1 OTHER 0` |
| `--header`, `--switcher-present`, `--includes`, `--no-locale-number-format` | PASS 1 page each | PASS 1 page each |
| `--literals-markup` | FAIL 4 | FAIL 4 (unchanged) |
| `--literals-js` | FAIL 8 | FAIL 8 (unchanged) |
| `--smoke` / `--api` / `--persistence` | PASS 135 / 1292 / 561 | PASS 135 / 1292 / 561 |
| i18n-browser `--mode langs` | not measured | LEFT 0 (only the `meta.theme=day expected night` quirk and the "Least Common Multiple" nav lines remain) |
| i18n-browser `--mode layout` (375px) | not measured | PASS |
| i18n-browser `--mode switch` | see Issues | DIFF in 30 languages, pre-existing (see Issues) |
| `insert-keys.js --check` (pre-commit) | n/a | `INSERT OK langs=30 keys=34` |
| English-only left in header | yes | 0 |
| Page / site.js / hub.js / least-common-multiple.js diff | n/a | empty |

## Checker config entries added (`i18n-config/cyclic-groups.json`)

allowSame:
- `cyclicGroups.tabTitle`, `formula.mulGroupOrder`, `formula.mulSubgroupOrder`, `formula.cosetCount`, `formula.mulCosetCount`, `formula.cosetCountIndex`: pure notation with placeholders, identical in every LTR language (he/ar/ckb isolate them). The IDENTICAL-TO-EN finding is a false positive from the placeholder names tokenizing as prose.
- `cyclicGroups.nLabelMath`: nl, hu, id and la keep "modulus", as their `nLabel` already does.
- `cyclicGroups.opAddMath` and `opMulMath`: French (and Swedish `addition {mod}`) cognates of "addition"/"multiplication"; their opAdd/opMul twins already use the same word.
- `cyclicGroups.iso.additive` (nb "additive") and `cyclicGroups.iso.multiplicative` (ro "multiplicative"): same word as their `common.*Groups`.

allowRenderText (found by the headless-Chrome langs run): `"(modulus)"` (nl, hu, id; la is not flagged by the harness), `"additive"` (nb), `"multiplicative"` (ro). Each reuses the matching allowSame reason.

## Terms coined (no sibling rendering)

Cardinality, coset, generator, subgroup and order reuse each language's existing cyclicGroups terms. New wording with no direct sibling:
- **supergroup** (`iso.supergroup`): nl supergroep, de Obergruppe, es supergrupo, it sovragruppo, pl nadgrupa, sv övergrupp, nb overgruppe, ro supragrup, lv virsgrupa, hu szupercsoport, sq mbigrup, ru надгруппа, el υπερομάδα, hi अधिसमूह, sa अधिसमूह, la supergrex, id supergrup, he חבורת-העל. Paraphrased as "the group containing this subgroup" in fr, ar, ckb, ku, zh, ja, ko and sw (kundi kuu).
- **formula**: zgh uses the glossary-attested `tanfalit`; ckb uses the loan فۆرمول; ku uses "Formula".
- **base of a logarithm**: zgh `tasila` (glossary shor term), ckb بنچینە, ku binge, ar أساس.
- **Cancel**: zgh `Ssbdd` (stop) is the closest attested verb. Needs native review.

## Deviations from Plan

None to the plan's rules. Two harness observations are recorded below. The plan's precondition and ordering were followed. A single commit was made at the end of Task 3, as step 5 specifies, so the Task 1 and Task 2 states were never committed separately.

## Issues for follow-up

1. **Switch mode DIFF (pre-existing, not caused by this task).** `i18n-browser.js --mode switch` reports `html differs` at load for every language. I reproduced it identically on a scratch copy at HEAD, with the old English-only data. The first differing position is the isomorphic-group chip link `href`, which holds the absolute scratch path (`.../i18n-bd-direct-XXX/Cyclic%20Groups/...` against `.../i18n-bd-sw-XXX/...`). The harness does not normalize absolute scratch paths. The plan expected `switch PASS`, but that cannot hold for the current page. The page was left untouched by scope. A fix would be to normalize the scratch path in `normalizeForCompare` or to emit relative hrefs in the page.
2. **`meta.theme=day expected night`** per language is the known harness quirk. The "Least Common Multiple" UNTRANSLATED nav lines are out of scope.
3. After the commit, `insert-keys.js --check` is expected to fail its HEAD-based precondition, as the plan states.
4. zgh `Ssbdd` (Cancel), hu `szupercsoport` and sa compounds (गणनाङ्कसूत्रम्, सहसमुच्चयसङ्ख्यासूत्रम्) are best-effort neologisms and would benefit from native review.

## Action for the orchestrator

The user memory entry "Cyclic Groups is English-only (new Cyclic Groups strings get an en entry only)" is superseded for these 34 keys. The user explicitly asked for all languages. It may need updating. The memory file `cyclic-groups-english-only.md` was not edited by this agent.

## Self-Check: PASSED

- `assets/i18n/cyclic-groups.js`, the config JSON, `insert-keys.js` and 29 fragments exist and are in commit `d4da376` (ancestor of HEAD).
- Measured commits: 1 (`f58b8f7..d4da376`).
