---
phase: quick-261011-cdw
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - assets/i18n/cyclic-groups.js
  - .planning/phases/06-multi-language-support/i18n-config/cyclic-groups.json
  - .planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/insert-keys.js
  - .planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/fragments/
autonomous: true
requirements: [CDW-01, CDW-02, CDW-03]

estimate:
  tokens: 125000
  raw_tokens: 125000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "A visitor in any of the 30 non-English languages sees the Cyclic Groups formula toggles, the Cardinality fact, the generator prompt (with its Choose a generator / Cancel controls), the isomorphic-group panel, the MathML hints, notices, modulus and operation labels and the browser-tab title in their own language. None of them falls back to English."
    - "Every non-English cyclicGroups block holds exactly en's 139 keys in en's order. Every value that existed at HEAD is byte-for-byte unchanged."
    - "`i18n-check.js --coverage \"Cyclic Groups/cyclic-groups.html\"` reports zero cyclicGroups findings. The 90 out-of-scope lcm/hub/site findings remain and nothing else is reported."
    - "In each *Math value, every placeholder (a MathML node passed to translateInto) appears exactly once, so no node is moved out of its slot."
    - "In he, ar and ckb, the five formula.* values are wrapped whole in \\u2066…\\u2069. tabTitle isolates {group}, iso.lead isolates ⟨{g}⟩ and iso.open isolates {group}. The isolates are written as escapes, never as raw characters."
    - "Each new zgh-Tfng value is the mechanical letter-for-letter transliteration of its zgh-Latn value."
    - "The header comment of assets/i18n/cyclic-groups.js states that every key is translated and that --coverage reports no cyclicGroups finding."
    - "In headless Chrome, the page in all 30 languages leaves no untranslated cyclicGroups segment. The i18n-browser switch and layout modes pass."
  artifacts:
    - path: "assets/i18n/cyclic-groups.js"
      provides: "the 34 new keys in all 30 non-English blocks, plus the rewritten header paragraph"
      contains: "formulaToggleCosets"
    - path: ".planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/insert-keys.js"
      provides: "an idempotent merge from HEAD plus the --check verifier"
    - path: ".planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/fragments/"
      provides: "29 hand-written <code>.json fragments, each with the 28 prose keys (zgh-Tfng is derived and has no fragment)"
    - path: ".planning/phases/06-multi-language-support/i18n-config/cyclic-groups.json"
      provides: "allowSame entries for the 6 notation keys and any genuine cognate identity, plus allowRenderText for rendered identical segments"
  key_links:
    - from: "fragments/<code>.json"
      to: "assets/i18n/cyclic-groups.js"
      via: "insert-keys.js splices one line per new key at en's key position"
      pattern: "INSERT OK langs=30 keys=34"
    - from: "fragments/zgh-Latn.json"
      to: "zgh-Tfng block"
      via: "zghTransliterate exported by i18n-check.js"
      pattern: "zghTransliterate"
    - from: "assets/i18n/cyclic-groups.js *Math values"
      to: "Cyclic Groups/cyclic-groups.html translateInto call sites (lines ~1599, 1791, 2508-2528, 2597-2601, 2902)"
      via: "each placeholder occurs once, so renderTemplate appends each MathML node once"
      pattern: "translateInto"
---

<objective>
Translate the 34 cyclicGroups keys that exist only in the en block of `assets/i18n/cyclic-groups.js` into all
thirty non-English languages. Insert each key into every non-English block at en's key position, then rewrite the
header paragraph that still calls those keys untranslated.

Purpose: the user asked to "update all the languages files for the tool 'Cyclic Groups'". This request supersedes
the earlier user decision (recorded in the file header and in a user memory) that kept these keys in English only.
Today every non-English visitor sees English for the formula toggles, the Cardinality fact, the generator prompt,
the isomorphic-group panel, the MathML hints and notices, and the tab title.

Requirement IDs (defined here; this is a quick task):
- CDW-01: all 34 keys are present and translated in all 30 non-English blocks, in en key order, with every
  pre-existing value unchanged.
- CDW-02: the header comment (lines 9-25) is rewritten to state that every key is translated.
- CDW-03: `--coverage` reports no cyclicGroups finding. The headless-Chrome langs, switch and layout modes are clean
  for the page. Every other check stays at its baseline.

Output: the updated `assets/i18n/cyclic-groups.js`, the updated page checker config, and the merge tool plus
fragments under the quick-task directory, all in one atomic `feat(i18n)` commit.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@assets/i18n/cyclic-groups.js (header lines 1-43, nl block 46-152 and en block 153-293 only. Never read the whole 3398-line file: grep a language block by its `^    <code>: {` line.)
@.planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/261009-tgw-BRIEF.md (sections 4 and 6.1-6.6 only, lines 139-289. These are the binding translation rules: register, punctuation, script and letter rules, RTL isolates and cross-key consistency. They still apply verbatim, except that this task's fragments are JSON, not the .js format of section 2.)

Scope fence. `Cyclic Groups/cyclic-groups.html` and every other file under `assets/` stay untouched, including
`assets/i18n/site.js`, `assets/i18n/hub.js` and `assets/i18n/least-common-multiple.js`. The checker config
`.planning/phases/06-multi-language-support/i18n-config/cyclic-groups.json` is the per-page checker allowlist, not an
i18n data file. It must change: tabTitle and the five formula.* values are pure notation, identical to en in every
LTR language, and isProse() tokenizes their placeholder names ("group", "title") as prose. So without allowSame
entries they would be IDENTICAL-TO-EN findings, as the existing formula.subgroupOrder and cosetTitleAdd entries
already show. This was verified at planning time: `isProse('{title} · {group}') === true`.

Baseline at planning time (HEAD f58b8f7; re-measure in Task 1 step 1):
- `--coverage "Cyclic Groups/cyclic-groups.html"`: FAIL 120 findings. These are 30 `LANG-KEYSET cyclicGroups.<lang>`
  lines (each missing exactly the 34 keys) plus 90 out-of-scope lines: `hub.<lang>` card.lcm.*, `lcm.<lang>`
  namespace missing, and `site.<lang>` nav.lcm.
- Page-scoped `--header`, `--switcher-present`, `--includes` and `--no-locale-number-format` each PASS 1 page.
  `--literals-markup` FAIL 4 and `--literals-js` FAIL 8, both pre-existing and out of scope.
- `--smoke` PASS 135 assertions. `--api` PASS 1292. `--persistence` PASS 561.
- At HEAD, all 30 non-English blocks hold 105 keys, each in en's relative order, one entry per line with 6-space
  indent. The last key of every block is `exportFailed` (no trailing comma). en holds 139 keys.
- Chrome is installed at /usr/bin/google-chrome, and the Playwright chromium cache exists. The previous Cyclic
  Groups translation (261009-tgw plan 07) ran `i18n-browser.js` here. Its expected noise: one
  `meta.theme=day expected night` line per language (a harness quirk) and UNTRANSLATED "Least Common Multiple"
  nav-link lines (out of scope).

<interfaces>
The 34 keys split into two groups.

A. Six NOTATION keys. insert-keys.js fills these automatically, and no fragment contains them:
- `tabTitle` `'{title} · {group}'`. LTR: copied from en. he/ar/ckb: `'{title} · ⁦{group}⁩'`. A bare
  `{group}` would trip BIDI-FORMULA, because U+00B7 is in its operator class: "0 · 0".
- `formula.mulGroupOrder`, `formula.mulSubgroupOrder`, `formula.cosetCount`, `formula.mulCosetCount` and
  `formula.cosetCountIndex`. LTR: the en value verbatim. he/ar/ckb: the en value wrapped whole in
  `⁦…⁩`, exactly like the existing `formula.subgroupOrder` there. At planning time, scriptFindings,
  cjkFindings, bidiFindings (wrapped), zghTransliterationFindings and digitParityFindings all returned [] for these
  values in every script language.

B. Twenty-eight PROSE keys, hand-translated into one fragment per language. Each placeholder is listed with what
the page passes for it. A "MathML" placeholder is a `<math dir="ltr">` DOM node inserted by translateInto, which
appends a node param, so a second occurrence would MOVE the node. Every placeholder must therefore appear EXACTLY
ONCE. *Math values contain no digits (DIGIT-PARITY: the en values have none), and every number arrives as a
placeholder.

| Key | en value | UI role | Twin to adapt (same language) |
|-----|----------|---------|-------------------------------|
| cosetCountMath | `{order}, so there are {count} cosets` | Ring subtitle in additive coset mode. {order} is the MathML formula \|⟨h⟩\| = n/gcd(n,h) = n/d = size, and {count} is MathML n/size = c | the clause after the formula in cosetCountAdd, with `{n} / {size} = {count}` collapsed to `{count}` |
| nLabelMath | `{n} (modulus)` | Label of the modulus input. {n} is MathML `%`, the page's modulus symbol | the term after "n — " in nLabel |
| opLabelMath | `{op} (group operation)` | Label of the operation row. {op} is MathML `∗` | opSelectLabel, with mid-phrase capitalization per the language (German nouns stay capitalized) |
| nNoteMath | `{n} runs from {lo} to {hi}, so the diagram shows {eq}.` | Clamp note under the input. {n}=%, {lo}=2, {hi}=100, {eq}= "% = 37", all MathML | nNoteClamped: n→{n}, 2→{lo}, 100→{hi}, and the whole `n = {n}` (incl. any isolates) →{eq} |
| opAddMath | `addition {mod}` | Operation name. {mod} is MathML "mod n" | opAdd, with the language's own "mod {n}" / "modulo {n}" / zgh "s umuḍul {n}" wording replaced by {mod} (the node prints "mod") |
| opMulMath | `multiplication {mod}` | as above | opMul, same rule |
| factGeneratorsNoneMath | `{zero} (not cyclic)` | Generators fact for a non-cyclic unit group. {zero} is MathML 0 | factGeneratorsNone, with 0→{zero}, keeping that value's parenthesis style |
| hintAdditiveMath | `Stepping means adding {g} {mod}.` | Hint line. {g} is MathML, {mod} is MathML "mod n" | hint.additive, with "mod {n}"→{mod} |
| hintMultiplicativeMath | `The elements are the numbers below {n} that share no factor with it. Stepping means multiplying by {g} {mod}.` | Hint line | hint.multiplicative, with "mod {n}"→{mod}. Every later mention of {n} becomes a pronoun ("with it"), so {n} occurs once |
| iso.lead | `⟨{g}⟩ is cyclic of order {k}, so it is isomorphic to:` | Plain-text lead of the isomorphic-group panel, ending in a colon that introduces two tiles | "order" is the element/group order term of dh.orderSubgroup. "isomorphic" is the iso.pairLabel term. RTL: isolate ⟨{g}⟩ |
| iso.additive | `additive` | Lowercase heading of the tile listing additive groups ℤ/kℤ | the adjective of common.additiveGroups, lowercase where the language allows |
| iso.multiplicative | `multiplicative` | Lowercase heading of the tile listing multiplicative groups (ℤ/nℤ)* | the adjective of common.multiplicativeGroups |
| iso.open | `Open {group} in a new tab` | title and aria-label of each group chip link. {group} is plain text such as ℤ/6ℤ | "new tab" wording of venn.msg.openedTab. RTL: isolate {group} |
| iso.supergroup | `This subgroup’s supergroup.` | Tooltip on the chip that is the current group itself | the subgroup term of subgroupHeading |
| iso.leadMath | `{sub} is cyclic of order {k}, so it is isomorphic to:` | Rendered lead. {sub} is MathML ⟨g⟩ and {k} is a MathML number | this language's own iso.lead, with `⟨{g}⟩` (and its isolates) →{sub} |
| notice.whyPowerOfTwoMath | `Why: {eq} is a power of {two} above {four}.` | Notice line. {eq} is MathML "n = 16", {two} and {four} are MathML numbers | notice.whyPowerOfTwo: `n = {n}`→{eq}, 2→{two}, 4→{four} |
| notice.whyFourAndOddMath | `Why: {eq} is divisible by {four} and by an odd prime.` | Notice line | notice.whyFourAndOdd |
| notice.whyTwoOddPrimesMath | `Why: {eq} has two different odd prime factors.` | Notice line ("two" stays a word here) | notice.whyTwoOddPrimes |
| notice.ruleMath | `{mul} is cyclic exactly when {n} is {one}, {two} or {four}, an odd prime power {pk}, or twice one, {twopk}. Additive {add} is always cyclic.` | Notice rule. {mul}=⟨ℤ/nℤ, ×⟩, {add}=⟨ℤ/nℤ, +⟩, {n}=n, {one}/{two}/{four} numbers, {pk}=p^k, {twopk}=2p^k, all MathML | notice.rule, each notation run → its placeholder, isolates dropped |
| fact.cardinality | `Cardinality` | Facts-list row label. Its value is \|⟨ℤ/%ℤ, +⟩\| = % = 12 | the cardinality word of colorByOrder / legendOrder, capitalized as a label |
| formulaToggleName | `Group name` | Checkbox: show the group's name above the ring | the group word of groupHeading |
| formulaToggleSubName | `Subgroup name` | Checkbox: show the subgroup's name ⟨h⟩ | the subgroup word of subgroupHeading |
| formulaToggleGroup | `Group cardinality formula` | Checkbox: show the \|G\| = … formula | the group and cardinality words above |
| formulaToggleSubgroup | `Subgroup cardinality formula` | Checkbox: show the \|⟨h⟩\| = … formula | colorByOrder wording plus "formula" |
| formulaToggleCosets | `Subgroup-coset amount formula` | Checkbox: show the formula for the NUMBER of cosets of the subgroup, \|G\| / \|⟨h⟩\| | the coset term of cosetButton / cosetCountAdd |
| subOrderNeedsGen | `The subgroup’s cardinality takes a logarithm to the base of a generator.` | Prompt paragraph in multiplicative mode: \|⟨h⟩\| needs log_g h | "logarithm" as in dh.dlpHeading, "generator" from glossary row 24 / genLabel |
| subOrderPickGen | `Choose a generator` | The select's placeholder option and its aria-label | the language's imperative register (glossary section a) |
| subOrderCancel | `Cancel` | Button that closes the prompt | the language's standard UI "Cancel" (not "Reset") |

RTL (he, ar, ckb) for prose keys: isolate only ⟨{g}⟩ in iso.lead and {group} in iso.open. Never wrap a MathML
placeholder in isolates. `<math dir="ltr">` is an atomic inline that keeps itself left to right, and *Math values
have no digits, so BIDI-FORMULA cannot fire on them. Follow the twin's own punctuation (Arabic comma ، in ar and
ckb, the maqaf-style prefix as in `מ-{n}` in he). Sanskrit: a value whose en ends in "." ends in "।", with no space
before it. Labels (no final period in en) take no danda.

Twin and sibling printer, for any set of languages (run from the repo root and add codes after `en`):

```bash
node -e 'var c=require("./.planning/phases/06-multi-language-support/i18n-check.js");var cat=c.loadCatalog();var L=process.argv.slice(1);["cyclicGroups.cosetCountAdd","cyclicGroups.nLabel","cyclicGroups.opSelectLabel","cyclicGroups.nNoteClamped","cyclicGroups.opAdd","cyclicGroups.opMul","cyclicGroups.factGeneratorsNone","cyclicGroups.hint.additive","cyclicGroups.hint.multiplicative","cyclicGroups.notice.whyPowerOfTwo","cyclicGroups.notice.whyFourAndOdd","cyclicGroups.notice.whyTwoOddPrimes","cyclicGroups.notice.rule","cyclicGroups.colorByOrder","cyclicGroups.legendOrder","cyclicGroups.genLabel","cyclicGroups.arrangeGenLabel","cyclicGroups.groupHeading","cyclicGroups.subgroupHeading","cyclicGroups.cosetButton","common.additiveGroups","common.multiplicativeGroups","common.reset","iso.pairLabel","dh.dlpHeading","dh.orderSubgroup","venn.msg.openedTab"].forEach(function(id){var i=id.indexOf(".");var ns=id.slice(0,i),k=id.slice(i+1);L.forEach(function(l){console.log(id+" ["+l+"] "+JSON.stringify(((cat[ns]||{})[l]||{})[k]))})})' en nl he
```

Exports of `.planning/phases/06-multi-language-support/i18n-check.js` usable via require():
`loadCatalog()`, `zghTransliterate(run)`, `zghTransliterationFindings(id, lang, value, latnValue, enValue)`,
`scriptFindings`, `bidiFindings`, `charFindings`, `digitParityFindings`, `cjkFindings`, `kuLetterFindings`,
`saLetterFindings`, `laLetterFindings`, `isProse`. The zgh derivation was validated at planning time on all 1037
existing zgh-Latn/zgh-Tfng string pairs: placeholders are kept, and every `[\p{L}\p{M}]+` run is mapped through
`zghTransliterate`. That reproduced 772 pairs exactly. Every one of the 265 misses differs only in a standalone Latin
notation run of one or two letters (n, a, b, m, N, ...). None of the 28 prose keys contains such a run.
</interfaces>
</context>

<tasks>

<task type="tracer">
  <name>Task 1: insert-keys.js plus the nl and he fragments, merged end-to-end and coverage-gated</name>
  <files>.planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/insert-keys.js, .planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/fragments/nl.json, .planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/fragments/he.json, assets/i18n/cyclic-groups.js, .planning/phases/06-multi-language-support/i18n-config/cyclic-groups.json</files>
  <precondition>`git status --porcelain -- assets/i18n/cyclic-groups.js .planning/phases/06-multi-language-support/i18n-config/cyclic-groups.json` prints nothing. At HEAD, the en block of assets/i18n/cyclic-groups.js holds all 34 new keys and no non-English block holds any of them.</precondition>
  <action>
1. Assert the precondition, and halt with a clear message if it is unmet. Re-measure the baseline lines listed in
   the context: page-scoped coverage plus the four PASS modes and the two literals modes, `--smoke`, `--api` and
   `--persistence`. Save their last lines to a scratch file outside the repo for the Task 3 comparison.

2. Write `.planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/insert-keys.js` (CDW-01, CDW-02). Use
   Node built-ins only (fs, path, vm, child_process). It runs from the checkout root and has two modes: merge
   (default, which writes and then runs the check) and `--check` (verify only). It prints
   `INSERT OK langs=<n> keys=34` or `INSERT FAIL <reason>`, exiting 1 on failure. Behavior:
   - BASE is always `git show HEAD:assets/i18n/cyclic-groups.js` via execFileSync. Every run rebuilds from HEAD, so
     re-running after a fragment fix is safe and idempotent. Load BASE through vm with a stub
     `NT.i18n.register(ns, dict)`. Fail if en lacks any of the 34 keys, if a non-English block already has one, or
     if en's last key is one of the 34.
   - Constants: LANGS in file order (nl, en, de, fr, es, it, pl, pt-BR, pt-PT, sv, nb, ro, hu, lv, ru, el, he, hi, ar,
     sq, sw, zh, ja, ko, id, zgh-Latn, zgh-Tfng, ku, ckb, sa, la); RTL = he, ar, ckb; NOTATION_KEYS = the 6 keys of
     interface group A; PROSE_KEYS = the 28 keys of group B.
   - Values per language: fill the notation keys exactly as interface group A specifies. Take the prose keys from
     `fragments/<code>.json`, except for zgh-Tfng: derive each zgh-Tfng prose value from fragments/zgh-Latn.json by
     keeping every `{name}` placeholder and mapping every `[\p{L}\p{M}]+` run through the required
     `zghTransliterate`. Then assert `zghTransliterationFindings(...)` returns [] for each value. A language whose
     fragment is absent is skipped and keeps its HEAD block. zgh-Tfng is skipped when zgh-Latn is absent. This lets
     the tracer merge only nl and he.
   - Fragment validation (fail naming the code and key):
     - It is valid JSON, and its key set equals PROSE_KEYS exactly.
     - Every value is a non-empty NFC string.
     - Each placeholder name occurs exactly as many times as in en (once each).
     - No `<` is followed by a letter.
     - No U+200B–U+200F, U+202A–U+202E, U+2060 or U+FEFF appears.
     - U+2066–U+2069 appears only in he/ar/ckb and is balanced. Accept these isolates whether the fragment holds
       them as JSON escapes or as raw characters. The 261009-tgw executor found that the Write tool may turn typed
       escapes into raw characters, and JSON decodes both forms to the same value.
     - Identity with en is NOT checked here. The checker's IDENTICAL-TO-EN finding (with its isProse filter and the
       config's allowSame) is the single authority for that.
   - Serialization, matching the file's own style: 6-space indent, then the key token copied verbatim from the en
     block's line (bare `cosetCountMath`, quoted `'fact.cardinality'`), then `: `, then the value, then `,`. Values
     are single-quoted. A value containing an ASCII apostrophe is double-quoted, and one containing both quote
     kinds is a fail. A backslash is written `\\`. U+2066/U+2067/U+2068/U+2069 are written as the six-character
     escapes, and nothing else is escaped. Inside the script, build every invisible-character regex from
     double-escaped strings via new RegExp (or from String.fromCharCode), so insert-keys.js itself holds no raw
     invisible character.
   - Splice: locate each non-English block by its `    <langKey>: {` line (bare when the code is all lowercase
     letters, otherwise single-quoted). Rebuild its entry lines in en key order. Keep each existing line verbatim
     and insert the serialized new line where en has the key. Never touch en, nl's untouched keys or any line
     outside the blocks.
   - Header (CDW-02): replace the paragraph on HEAD lines 9-25, which begins `   Translated into all thirty-one
     supported languages (quick task 261009-tgw),` and ends with the sentence postponing their translation. It
     must match exactly once, or the script fails. Replace it with a paragraph, indented 3 spaces and wrapped like
     its neighbors, stating the following:
     - The namespace is translated into all thirty-one supported languages (quick task 261009-tgw). The 34 keys
       added since then are named by group, as the old paragraph did: the five iso.* keys, the *Math templates,
       the multiplicative and coset formula.* keys, fact.cardinality, the five formulaToggle* labels, the three
       subOrder* strings and tabTitle. They were translated by quick task 261011-cdw.
     - English is the source of truth. Every non-English block holds the same keys in the same order as en.
     - i18n-check --coverage reports no cyclicGroups finding.
     - The formula.* values and tabTitle are pure notation, identical in every left-to-right language (he, ar and
       ckb isolate them).
     - Each *Math placeholder is a MathML node that appears exactly once and is never wrapped in isolates.
   - `--check` asserts:
     - (a) the written file loads through the vm stub;
     - (b) for every language whose fragment exists (plus derived zgh-Tfng), Object.keys equals en's 139 keys in
       order;
     - (c) every value present at HEAD is deep-equal in the new file, for every language, plural objects included;
     - (d) every new value equals the expected fragment, derived or notation value;
     - (e) the file contains no raw U+200B–U+200F, U+202A–U+202E, U+2060, U+2066–U+2069 or U+FEFF;
     - (f) removing the inserted lines from the new file and the header paragraph from both versions leaves the new
       file line-identical to HEAD;
     - (g) the header no longer contains the old paragraph's first line.

3. Add six allowSame entries to `.planning/phases/06-multi-language-support/i18n-config/cyclic-groups.json`, one
   each for `cyclicGroups.tabTitle`, `cyclicGroups.formula.mulGroupOrder`, `cyclicGroups.formula.mulSubgroupOrder`,
   `cyclicGroups.formula.cosetCount`, `cyclicGroups.formula.mulCosetCount` and `cyclicGroups.formula.cosetCountIndex`.
   Each reason follows the existing formula.subgroupOrder wording ("Pure notation with placeholders (…), identical
   in every left-to-right language by design (he, ar and ckb wrap it in U+2066/U+2069 isolates); the IDENTICAL-TO-EN
   finding is a false positive from the placeholder name … tokenizing as a prose word (quick task 261011-cdw)").
   Keep the file's existing entries and 2-space JSON formatting. Use Edit, not Write.

4. Write `fragments/nl.json` and `fragments/he.json` with the 28 prose keys. First print the twins with the
   interface printer for `en nl he`, then follow the twin table and the 261009-tgw brief section 6 rules: nl uses
   the je register, and he uses plural imperatives and isolates only where the interface's RTL rule says. Every
   term matches the language's existing cyclicGroups values (cardinality, coset, generator, subgroup, order).

5. Run the merge, then the verify gate. A finding on a new nl or he value means the fragment is wrong: fix the
   fragment and re-run the merge. Never hand-edit a merged line in assets/. Do not commit yet.
  </action>
  <verify>
    <automated>node .planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/insert-keys.js && node .planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/insert-keys.js --check && C=$(node .planning/phases/06-multi-language-support/i18n-check.js --coverage "Cyclic Groups/cyclic-groups.html" 2>&1); CG=$(printf '%s\n' "$C" | grep cyclicGroups); echo "CG-TOTAL $(printf '%s\n' "$CG" | grep -c .) CG-KEYSET $(printf '%s\n' "$CG" | grep -c '^LANG-KEYSET cyclicGroups\.') CG-NLHE $(printf '%s\n' "$CG" | grep -cE '\.(nl|he)(:|$| )') SUMMARY $(printf '%s\n' "$C" | tail -1)"</automated>
  </verify>
  <done>Both merge and `--check` print `INSERT OK langs=2 keys=34`. The gate then prints
  `CG-TOTAL 28 CG-KEYSET 28 CG-NLHE 0 SUMMARY I18N-CHECK FAIL coverage: 118 finding(s)`: 90 out-of-scope lines plus 28
  LANG-KEYSET lines for the languages not yet merged. assets/i18n/cyclic-groups.js differs from HEAD only by the 34
  inserted lines in nl and he and by the rewritten header paragraph.</done>
</task>

<task type="auto">
  <name>Task 2: The remaining 27 hand-written fragments (zgh-Tfng derived), merged until coverage shows zero cyclicGroups findings</name>
  <files>.planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/fragments/ (de, fr, es, it, pl, pt-BR, pt-PT, sv, nb, ro, hu, lv, ru, el, hi, ar, sq, sw, zh, ja, ko, id, zgh-Latn, ku, ckb, sa, la .json), assets/i18n/cyclic-groups.js, .planning/phases/06-multi-language-support/i18n-config/cyclic-groups.json</files>
  <action>
1. Work in batches of about five languages, grouped by script family:
   - de fr es it pl
   - pt-BR pt-PT sv nb ro
   - hu lv sq sw id la
   - ru el hi sa
   - ar ckb ku zgh-Latn
   - zh ja ko

   For each batch, print the twins with the interface printer (`en` plus the batch codes) and consult the
   glossary rows of the batch's languages. The rows are listed in the 261009-tgw brief section 4: grep
   .planning/phases/06-multi-language-support/06-GLOSSARY.md for the code. Then Write one
   `fragments/<code>.json` per language (filename = exact code, e.g. `pt-BR.json`, `zgh-Latn.json`) holding exactly
   the 28 prose keys (CDW-01). Never write a zgh-Tfng fragment. insert-keys.js derives it from zgh-Latn.

2. Translation rules. The interface table and the 261009-tgw brief section 6 are binding. The points most likely to
   go wrong:
   - Each placeholder appears exactly once, as the twin table explains.
   - *Math values contain no digit.
   - Terms reuse the language's existing cyclicGroups terms for cardinality, coset, generator, subgroup, order,
     cyclic and odd prime, so the new keys read as one voice with their twins.
   - Script and letter rules:
     - ru, el, he, hi, sa, ar, ckb, zh, ja and ko are in their own script, apart from the notation allow-list.
     - ckb uses only the 33 Sorani letters (ک ی ە ھ).
     - ar is unvocalized.
     - ku uses Hawar letters.
     - sa uses the Classical repertoire, with a danda after prose sentences.
     - la uses ASCII letters only, with no j.
     - zgh-Latn uses IRCAM letters only.
     - zh is Simplified, ja is shinjitai with kana, and ko is Hangul without hanja.
     - Full-width punctuation appears only in zh/ja prose. Parentheses follow each language's factGeneratorsNone
       style.
   - Lowercase starts (`iso.additive`, `iso.multiplicative`, `opAddMath`, `opMulMath`) stay lowercase where the
     language allows. German nouns stay capitalized.

3. After each batch, run the merge with
   `node .planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/insert-keys.js` and the page-scoped
   coverage check. Fix every cyclicGroups finding at its source fragment and re-merge. Never edit a merged line in
   assets/.
   - An IDENTICAL-TO-EN finding is either an untranslated leftover (translate it) or a genuine cognate. Expected
     cognates: nLabelMath `{n} (modulus)` in nl/hu/id/la, whose nLabel already reads "n — modulus"; opAddMath
     `addition {mod}` in fr/sv; opMulMath `multiplication {mod}` in fr.
   - Add an allowSame entry for a cognate only when the language's twin key already uses the very same word. Give a
     reason naming the languages and that twin, in the style of the existing cyclicGroups.nLabel entry and ending
     "(quick task 261011-cdw)". Make the allowSame config edit with Edit.

4. Finish with the verify gate.
  </action>
  <verify>
    <automated>node .planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/insert-keys.js && node .planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/insert-keys.js --check && ls .planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/fragments/*.json | wc -l && C=$(node .planning/phases/06-multi-language-support/i18n-check.js --coverage "Cyclic Groups/cyclic-groups.html" 2>&1); echo "CG $(printf '%s\n' "$C" | grep -c cyclicGroups) SUMMARY $(printf '%s\n' "$C" | grep -cx 'I18N-CHECK FAIL coverage: 90 finding(s)') OTHER $(printf '%s\n' "$C" | grep -vxE 'LANG-KEYSET (hub\.[^ ]+: missing=\[card\.lcm\.desc,card\.lcm\.title\] extra=\[\]|lcm\.[^ ]+: namespace missing this language entirely|site\.[^ ]+: missing=\[nav\.lcm\] extra=\[\])|I18N-CHECK FAIL coverage: 90 finding\(s\)' | grep -c .)"</automated>
  </verify>
  <done>Both runs print `INSERT OK langs=30 keys=34`. The fragment count is 29. The gate prints `CG 0 SUMMARY 1 OTHER 0`:
  zero cyclicGroups findings of any kind (LANG-KEYSET, IDENTICAL-TO-EN, PLACEHOLDERS, BIDI-*, SCRIPT-*, DIGIT-PARITY,
  ZGH-*, KU-LETTER, SA-*, LA-*, ARABIC-LETTER, CJK/HAN-FORM, NOT-NFC, ZERO-WIDTH), with only the 90 out-of-scope lines
  left. Every non-English block has 139 keys in en order.</done>
</task>

<task type="auto">
  <name>Task 3: Headless-Chrome langs/switch/layout gate, full regression against baseline, atomic commit</name>
  <files>.planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/fragments/ (fix loop only), assets/i18n/cyclic-groups.js, .planning/phases/06-multi-language-support/i18n-config/cyclic-groups.json</files>
  <action>
1. Run `node .planning/phases/06-multi-language-support/i18n-browser.js "Cyclic Groups/cyclic-groups.html" --mode langs`
   with the gate in the verify command (CDW-03). It takes several minutes, so use a 10-minute timeout or run it in
   the background. Expected remaining lines: only the per-language `meta.theme=day expected night` quirk and the
   UNTRANSLATED "Least Common Multiple" nav lines. Classify any other line:
   - An UNTRANSLATED segment equal to an English cyclicGroups value means a fragment kept English: fix the fragment
     and re-merge.
   - A segment that is identical by design and already backed by an allowSame entry gets an allowRenderText entry
     for the exact rendered text, reusing the allowSame reason. Examples: the nl/hu/id/la `(modulus)` beside the
     `%` MathML label, or a rendered formula toggle with no translatable word.
   - A NEW-ERRORS, meta.lang or snapshot-count line is a real defect. If its cause is page code, do NOT edit the
     page. Record it under "Issues for follow-up" in the SUMMARY.
2. Run `--mode switch,layout` on the same page. Expected: `switch PASS points=1 langs=30` and `layout PASS`. A
   LAYOUT-OVERFLOW for a language means one of its new values is too long at 375px; the formula-toggle labels sit
   in an absolutely positioned box. Shorten that value in its fragment while keeping the meaning, re-merge and
   re-run both modes. A switch DIFF caused by page code is recorded as a follow-up, never fixed in the page.
3. Re-run Task 2's verify gate after any re-merge. Then run the regression against the Task 1 baseline file:
   - page-scoped `--header`, `--switcher-present`, `--includes` and `--no-locale-number-format` each still PASS 1 page;
   - `--literals-markup` still FAIL 4 and `--literals-js` still FAIL 8, the same findings;
   - `--smoke` PASS 135, `--api` PASS 1292 and `--persistence` PASS 561.
   Any drift is a defect: fix it at the fragment or config level.
4. Confirm that `git status --porcelain` lists only assets/i18n/cyclic-groups.js, the config JSON and the quick-task
   directory, and that `git diff --stat -- "Cyclic Groups" assets/i18n/site.js assets/i18n/hub.js
   assets/i18n/least-common-multiple.js` is empty.
5. Make one atomic commit containing assets/i18n/cyclic-groups.js, the config JSON, insert-keys.js and the
   fragments/ directory. Leave the PLAN/SUMMARY docs to the orchestrator. Use the message
   `feat(i18n): translate the 34 remaining Cyclic Groups keys into all thirty languages` with a short body naming
   the key groups and the RTL/zgh handling, ending with the session's attribution trailer lines. After the commit,
   `insert-keys.js --check` is expected to fail its HEAD-based precondition, because HEAD now holds the merge. That
   is by design. Run --check before the commit, not after.
6. In the SUMMARY's "Action for the orchestrator", note two things: the user memory recording that new Cyclic
   Groups strings get an en entry only is superseded for these 34 keys and may need updating, and the gate table
   (baseline vs after) is recorded there.
  </action>
  <verify>
    <automated>O="${TMPDIR:-/tmp}/cdw-langs.txt"; node .planning/phases/06-multi-language-support/i18n-browser.js "Cyclic Groups/cyclic-groups.html" --mode langs > "$O" 2>&1; echo "LANGS-RAN $(grep -cE ': meta\.theme=day expected night$|langs PASS' "$O")"; grep -vE ': meta\.theme=day expected night$|^UNTRANSLATED cyclic-groups [^ ]+ [^ ]+ "Least Common Multiple"$' "$O" | head -40; echo "LANGS-LEFT $(grep -vcE ': meta\.theme=day expected night$|^UNTRANSLATED cyclic-groups [^ ]+ [^ ]+ "Least Common Multiple"$' "$O")"; node .planning/phases/06-multi-language-support/i18n-browser.js "Cyclic Groups/cyclic-groups.html" --mode switch,layout 2>&1 | grep -E 'switch PASS|layout PASS|DIFF|OVERFLOW|ERRORS|MISSING'; node .planning/phases/06-multi-language-support/i18n-check.js --smoke | tail -1; node .planning/phases/06-multi-language-support/i18n-check.js --api | tail -1; node .planning/phases/06-multi-language-support/i18n-check.js --persistence | tail -1; PD=$(git diff --name-only f58b8f7 -- 'Cyclic Groups' assets/i18n/site.js assets/i18n/hub.js assets/i18n/least-common-multiple.js) || PD=GIT-FAILED; echo "ENGLISH-ONLY-LEFT $(grep -c 'English-only' assets/i18n/cyclic-groups.js) PAGE-DIFF $(printf '%s' "$PD" | grep -c .)"</automated>
  </verify>
  <done>`LANGS-RAN 30` (or 1 with a `langs PASS` line if the theme quirk has been fixed since), `LANGS-LEFT 0`,
  `I18N-BROWSER cyclic-groups switch PASS points=1 langs=30` and `I18N-BROWSER cyclic-groups layout PASS`, with no
  DIFF/OVERFLOW/ERRORS/MISSING line. The regression lines are `PASS smoke: 135`, `PASS api: 1292 assertions` and
  `PASS persistence: 561 assertions`, followed by `ENGLISH-ONLY-LEFT 0 PAGE-DIFF 0`. One feat(i18n) commit is on the
  branch.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| translation data → DOM | Dictionary values (written by the executor) are rendered by the unchanged page via translate/translateInto as text nodes and attributes |
| merge tool → shipped data file | insert-keys.js rewrites a shipped asset from HEAD plus scratch fragments |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-261011-01 | Tampering | new dictionary values in assets/i18n/cyclic-groups.js | medium | mitigate | Fragment validation rejects any `<` followed by a letter. The checker's DICT-MARKUP finding is part of the coverage gate. The page only renders values through translateInto/textContent/setAttribute (it stays untouched), so no value reaches innerHTML. |
| T-261011-02 | Spoofing | invisible bidi characters (Trojan-source style reordering) | medium | mitigate | Isolates are serialized only as ⁦/⁩ escapes. insert-keys.js --check (e) and the checker's BIDI-RAW, BIDI-CONTROL and BIDI-UNBALANCED findings reject raw or unbalanced controls. ZERO-WIDTH and NOT-NFC cover the remaining invisible-character cases. |
| T-261011-03 | Tampering | insert-keys.js corrupting the 3,150 existing translations | medium | mitigate | --check (c) asserts every HEAD value is deep-equal, and (f) asserts the line diff is confined to inserted lines plus the header paragraph. The precondition refuses to run over uncommitted edits. |
| T-261011-04 | Denial of service | over-long translations breaking the 375px layout | low | mitigate | The i18n-browser layout mode gates each language against English + 8px. Overflowing values are shortened at the fragment. |
| T-261011-SC | Tampering | npm/pip/cargo installs | low | accept | No package is installed. The merge tool uses Node built-ins and the repo's own i18n-check.js only. |
</threat_model>

<verification>
- `insert-keys.js --check` prints `INSERT OK langs=30 keys=34` before the commit.
- Page-scoped `--coverage`: `CG 0 SUMMARY 1 OTHER 0` (90 out-of-scope findings only).
- Headless Chrome: langs leaves only the theme-quirk and "Least Common Multiple" lines, and switch and layout PASS.
- Regression: header, switcher-present, includes and no-locale-number-format PASS. literals-markup 4 and
  literals-js 8 are unchanged. smoke 135, api 1292 and persistence 561 PASS.
- `git show --stat <feat-commit-sha>` (the sha the executor records in the SUMMARY) touches only assets/i18n/cyclic-groups.js, the cyclic-groups checker config and the
  quick-task directory.
</verification>

<success_criteria>
- All 34 keys are translated in all 30 non-English languages (1,020 values: 870 from fragments, 6×29 notation values
  filled by rule, and zgh-Tfng derived), in en key order. Every pre-existing value is unchanged.
- The header comment states that every key is translated, and the old untranslated-keys paragraph is gone.
- Zero cyclicGroups findings in every static check. No regression in any other gate. No untranslated cyclicGroups
  segment in any language in headless Chrome.
- One atomic feat(i18n) commit, with no change to the page or to any other assets/ file.
</success_criteria>

<output>
Create `.planning/quick/261011-cdw-translate-the-34-english-only-cyclicgrou/261011-cdw-SUMMARY.md` when done,
with a gate table (baseline vs after), the list of allowSame/allowRenderText entries added with their reasons,
any "Terms coined" per language (cardinality and coset wording that had no sibling rendering), Issues for
follow-up, and the Action for the orchestrator note from Task 3 step 6.
</output>
