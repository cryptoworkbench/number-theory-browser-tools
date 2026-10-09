# 261009-tgw — shared brief for plans 01-07

Shared input for every plan of quick task 261009-tgw. It is a planning input, not a report.
Each PLAN.md holds only its own language-specific instructions and points here for everything shared.

Quick dir (written `Q` below): `.planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al`
Fragments dir (written `F` below): `$Q/fragments`
All commands assume the checkout root as the working directory.

---

## 0. Requirement IDs (quick task, defined here)

| ID | Requirement | Plans |
|----|-------------|-------|
| QUICK-TGW-01 | The `cyclicGroups` namespace (100 keys, one plural) is translated into all 30 non-English languages | 01-06 (fragments), 07 (merge) |
| QUICK-TGW-02 | `site.nav.cyclicGroups` is translated into all 30 non-English languages | 01-06, 07 |
| QUICK-TGW-03 | `hub.card.cyclicGroups.title` and `.desc` are translated into all 30 non-English languages | 01-06, 07 |
| QUICK-TGW-04 | `i18n-check --coverage --all` reports no cyclicGroups finding (only the 90 lcm lines remain). Every other static mode matches its baseline, lcm is untouched, and the header comments no longer call cyclicGroups English-only | 07 |

---

## 1. Shape of the task

| Plan | Wave | Languages | Writes |
|------|------|-----------|--------|
| 01 | 1 | nl de sv nb la | `F/nl.js F/de.js F/sv.js F/nb.js F/la.js F/allow-01.json` |
| 02 | 1 | fr es it pt-BR pt-PT | `F/fr.js F/es.js F/it.js F/pt-BR.js F/pt-PT.js F/allow-02.json` |
| 03 | 1 | pl ro hu lv ru | `F/pl.js F/ro.js F/hu.js F/lv.js F/ru.js F/allow-03.json` |
| 04 | 1 | el he ar ckb ku | `F/el.js F/he.js F/ar.js F/ckb.js F/ku.js F/allow-04.json` |
| 05 | 1 | hi sa sq sw id | `F/hi.js F/sa.js F/sq.js F/sw.js F/id.js F/allow-05.json` |
| 06 | 1 | zh ja ko zgh-Latn zgh-Tfng | `F/zh.js F/ja.js F/ko.js F/zgh-Latn.js F/zgh-Tfng.js F/allow-06.json` |
| 07 | 2 | all thirty | `$Q/merge-fragments.js`, the three asset files, `i18n-config/cyclic-groups.json` |

Wave-1 rules (plans 01-06):
- Write ONLY your own six files in `F/` and your SUMMARY. Never touch `assets/`, any page, any other plan's
  fragment, or `.planning/phases/`. No git commits at all.
- Validate in a throw-away scratch copy of the repo outside the checkout (section 5). Six executors run at the
  same time in the same checkout. The scratch copy keeps their checks from interfering with each other.
- Per-plan file ownership is disjoint, so the parallel wave has no shared file. No wave-1 plan writes or uses
  a shared merge script. Each plan's checker findings are judged per value. A value produces exactly the same
  findings whether it sits in an overlay file or inside `assets/i18n/cyclic-groups.js`, so overlay validation
  in wave 1 is as strong as merged validation for every finding a translator can act on. Plan 07 then proves
  the real merge byte-for-byte with a round-trip check.

Source of truth (English, never edited by this task):
- `assets/i18n/cyclic-groups.js`, the `en` block of `NT.i18n.register('cyclicGroups', …)`. It has 100 keys, and
  `legendSubgroups` is the only plural key.
- `assets/i18n/site.js` → `en['nav.cyclicGroups']` = `Cyclic Groups`.
- `assets/i18n/hub.js` → `en['card.cyclicGroups.title']` = `Cyclic Group Necklace`, and `en['card.cyclicGroups.desc']`.

OUT OF SCOPE, must stay untouched: everything lcm (`assets/i18n/least-common-multiple.js`, `site.nav.lcm`,
`hub.card.lcm.*`), and the hub lede/footer "fifteen/seventeen tools" wording. The `Cyclic Groups/cyclic-groups.html`
page itself is also out of scope. Its four `--literals-markup` and two `--literals-js` baseline findings stay as they are.

---

## 2. Fragment file format (`F/<code>.js`, exact)

One file per language. The filename is the exact code (`pt-BR.js`, `zgh-Latn.js`). It is a classic script with
exactly three statements, formatted like the real data files so plan 07 can splice the lines verbatim:

```js
/* 261009-tgw fragment: <code> (merged into assets/i18n by plan 07) */
NT.i18n.register('cyclicGroups', {
    <LANGKEY>: {
      title: '…',
      eyebrow: '…',
      …all 100 keys, same order and same key tokens as the en block…
      legendSubgroups: { one: '…', other: '…' },
      …
      exportFailed: '…'
    }
});
NT.i18n.register('site', {
    <LANGKEY>: {
      'nav.cyclicGroups': '…'
    }
});
NT.i18n.register('hub', {
    <LANGKEY>: {
      'card.cyclicGroups.title': '…',
      'card.cyclicGroups.desc': '…'
    }
});
```

Rules:
- `<LANGKEY>` is bare when the code is all lowercase letters (`nl`, `ckb`). Otherwise it is single-quoted (`'pt-BR'`, `'zgh-Latn'`).
- Indentation: the language-key line has 4 spaces, entry lines have 6, and the closing `    }` has 4. No IIFE, no
  `"use strict"`.
- Key tokens and key order come verbatim from the English block. Copy the en block line by line and replace only
  the value. Bare keys stay bare (`title`), quoted keys stay quoted (`'fact.group'`, `'hint.notCyclic'`, `'notice.rule'`).
- Values are single-quoted. When a value contains an ASCII apostrophe `'`, double-quote it instead, as the English
  `combineBackward` does. Use no escape sequence except `\u2066`…`\u2069` (section 6.5), and `\\` if a literal
  backslash were ever needed.
- The plural entry goes on ONE line, like the English one. Categories appear in CLDR order (zero, one, two, few,
  many, other), restricted to the language's own shape (section 6.3).
- No trailing comma after the last entry of a block.
- No raw invisible characters: no U+200B–U+200F, U+202A–U+202E, U+2060, U+2066–U+2069 or U+FEFF typed as raw
  characters. RTL isolates are written as the six-character escapes `\u2066` and `\u2069`.

---

## 3. Allow file (`F/allow-NN.json`)

The scratch validation uses this file as the page config
`.planning/phases/06-multi-language-support/i18n-config/cyclic-groups.json`, and plan 07 unions the six of them.
Every allow file starts from these three BASE entries, copied verbatim:

```json
{
  "allowSame": {
    "cyclicGroups.nLabel": "Dutch, Hungarian, Indonesian and Latin write the modulus with the unchanged Latin term \"modulus\", exactly as their cayley.nLabel already does, so \"n — modulus\" is genuinely identical to English in those languages (quick task 261009-tgw)",
    "cyclicGroups.cosetTitleAdd": "Pure notation with placeholders ({a} + ⟨{h}⟩ = {set}), identical in every left-to-right language by design (he, ar and ckb wrap it in U+2066/U+2069 isolates); the IDENTICAL-TO-EN finding is a false positive from the placeholder name set tokenizing as a prose word (quick task 261009-tgw)",
    "cyclicGroups.cosetTitleMul": "Pure notation with placeholders ({a} · ⟨{h}⟩ = {set}), identical in every left-to-right language by design (he, ar and ckb wrap it in U+2066/U+2069 isolates); the IDENTICAL-TO-EN finding is a false positive from the placeholder name set tokenizing as a prose word (quick task 261009-tgw)"
  }
}
```

The allow file only covers `cyclicGroups.*` keys. `site.nav.cyclicGroups` can never be exempted, because the
`site`/`common` exemptions are hard-coded empty in i18n-check.js. `hub.card.cyclicGroups.*` has no config either. All
three values must therefore differ from English in every language, which a real translation always does.

Add your own entry only when a value is byte-identical to English AND it is the language's natural, established
term (a genuine cognate or notation), never just to silence the checker. Precedents are `cayley.json` and
`equivalence-wheel.json` in the same config directory. The entry is key → one reason sentence that names the
language(s) and ends with `(quick task 261009-tgw)`. Do NOT contort wording to dodge the check, and do NOT add an
entry when a natural non-identical rendering exists. Known traps to check deliberately:
- fr: `fact.structure` ("Structure"), `opAdd` ("addition mod {n}") and `opMul` ("multiplication mod {n}").
  French math prose writes "modulo" (see `crt.coprimeOk.fr`, `wheel.lede.fr`), so `addition modulo {n}` is natural.
  Decide on each one.
- sv: `fact.operation` ("Operation") and `opAdd` ("addition mod {n}"). nl, de, sv and nb: `subLayoutLabel`
  ("Layout"), where a native word such as Weergave, Anordnung or Visning is usually better.
- `rotateReset` ("Reset") reuses `common.reset` of the language, which is never identical to English.

---

## 4. Terminology sources (reuse, do not reinvent)

- `.planning/phases/06-multi-language-support/06-GLOSSARY.md`:
  - (a) tone/register table (lines ~15-49) and punctuation per language (from line 50). It covers quotation marks,
    the French narrow no-break space, Spanish ¿¡ and heading capitalization.
  - (c) core terms table (from line 837). Row 24 is generator (use the first half, before the `/`) and row 25 is
    cyclic group, plus identity, inverse, element, modulus and group rows.
  - Per-language supplementary sections: he 910, hi 961, ar 1087, sq/sw 1185, zh/ja/ko 1239, id 1307,
    zgh 1382, ku/ckb 1515, sa/la 1561. Also (d) proper nouns 1642 and (e) numerals and notation 1683.
    Read only the rows and columns of your languages (grep for the language code or column).
- Existing renderings of the same concepts in sibling namespaces. Print them for your languages with:
  `node -e 'var c=require("./.planning/phases/06-multi-language-support/i18n-check.js");var cat=c.loadCatalog();var L=process.argv.slice(1);["wheel.exportPrintOpening","cayley.title","cayley.eyebrow","cayley.xref","cayley.tablistLabel","cayley.nLabel","cayley.legend.identity","cayley.legend.inverse","cayley.identityNote","cayley.selfInverseNote","common.reset","common.additiveGroups","common.multiplicativeGroups","site.nav.cayley","dh.orderSubgroup","dh.gLabel","shor.pillOrderOfA","iso.tabPowers","iso.rightCaption","wheel.exportPngBtn","wheel.exportSaved","wheel.exportFailedPng","ecdh.explorerChordConstruction","hub.card.cayley.desc"].forEach(function(id){var i=id.indexOf(".");var ns=id.slice(0,i),k=id.slice(i+1);L.forEach(function(l){console.log(id+" ["+l+"] "+JSON.stringify((cat[ns][l]||{})[k]))})})' en <your codes…>`
- New concepts with no sibling rendering: necklace, orbit, chord (except `ecdh.explorerChordConstruction`), coset,
  cardinality, polygon, layer and auto-rotate. Choose the standard mathematical term of the language and list it
  under "Terms coined" in your SUMMARY.

---

## 5. Wave-1 validation command (VALIDATE)

Instantiate `NN` (your plan number), `LANGS` (space-separated codes) and `LANGRE` (the same codes joined with `|`).
Run it from the checkout root. The ONLY passing output is the single line `TGW-VALIDATE 0`. Any listed finding line
before it, a non-zero count, or ` CRASH` (a fragment threw a syntax error, so the checker never finished) is a failure.

```bash
S=$(mktemp -d "${TMPDIR:-/tmp}/tgw-NN.XXXXXX") && rsync -a --exclude=.git --exclude=.planning/quick --exclude=MANUAL_REVIEW_SCREENSHOTS ./ "$S/" && F=.planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments && for l in LANGS; do cp "$F/$l.js" "$S/assets/i18n/zz-tgw-$l.js"; done && cp "$F/allow-NN.json" "$S/.planning/phases/06-multi-language-support/i18n-config/cyclic-groups.json" && { I18N_CHECK_ROOT="$S" node .planning/phases/06-multi-language-support/i18n-check.js --coverage --all > "$S/cov.txt" 2>&1; grep -q '^I18N-CHECK FAIL coverage' "$S/cov.txt" && grep -E '^[A-Z-]+ [^ ]*\.(LANGRE)(:| |$)|zz-tgw-' "$S/cov.txt" | grep -v '^DUP-NS ' | grep -vxE 'LANG-KEYSET (hub\.[^ ]+: missing=\[card\.lcm\.desc,card\.lcm\.title\] extra=\[\]|lcm\.[^ ]+: namespace missing this language entirely|site\.[^ ]+: missing=\[nav\.lcm\] extra=\[\])' > "$S/bad.txt"; cat "$S/bad.txt" 2>/dev/null; echo "TGW-VALIDATE $(cat "$S/bad.txt" 2>/dev/null | wc -l)$( [ -f "$S/bad.txt" ] || echo ' CRASH')"; }; rm -rf "$S"
```

How it works:
- `rsync` copies the repo without `.git`, without the quick dirs and without the screenshots, into a fresh temp dir.
  Each fragment is dropped into the scratch `assets/i18n/` as `zz-tgw-<code>.js`. `loadCatalog()` merges every
  `register()` call key by key, so the overlay behaves exactly like a merged language block.
- The allow file becomes the scratch page config, which `IDENTICAL-TO-EN` reads.
- The command keeps every finding whose id ends in one of your codes, plus anything naming a `zz-tgw-` file
  (for example `BIDI-RAW assets/i18n/zz-tgw-ar.js: U+2066` for a raw isolate). It drops the three `DUP-NS` lines
  that the overlay causes by design. It also drops the three lcm lines that legitimately remain for each language:
  `LANG-KEYSET hub.<code>: missing=[card.lcm.desc,card.lcm.title] extra=[]`,
  `LANG-KEYSET lcm.<code>: namespace missing this language entirely` and
  `LANG-KEYSET site.<code>: missing=[nav.lcm] extra=[]`.
- Executors may substitute their session scratchpad dir for `${TMPDIR:-/tmp}`. The scratch is deleted at the end.

Finding names you may meet are explained in the CLAUDE.md i18n paragraph:
- Shape and content: LANG-KEYSET, PLURAL-SHAPE, PLACEHOLDERS, EMPTY-VALUE, DICT-MARKUP, IDENTICAL-TO-EN.
- Scripts: SCRIPT-LATIN, SCRIPT-MIXED, SCRIPT-FOREIGN, SCRIPT-MISSING.
- Bidi: BIDI-FORMULA, BIDI-CONTROL, BIDI-UNBALANCED, BIDI-RAW.
- Characters and digits: NATIVE-DIGIT, NATIVE-SEPARATOR, DIGIT-PARITY, TASHKEEL, TATWEEL, PRESENTATION-FORM,
  ARABIC-LETTER, FULLWIDTH-FORM, FULLWIDTH-FORMULA, CJK-MYRIAD, HAN-FORM, NOT-NFC, ZERO-WIDTH.
- Per-language letters: KU-LETTER, SA-LETTER, SA-DANDA, LA-LETTER, LA-J, ZGH-LETTER, ZGH-TRANSLIT, ZGH-NOTATION.

Fix the fragment and rerun until the output is exactly `TGW-VALIDATE 0`.

---

## 6. Translation rules (all languages)

### 6.1 Placeholders and notation
- Every `{name}` placeholder of the English value appears in the translation with exactly the same names (the
  checker compares sets). Never translate or rename a placeholder. The placeholders are `{n} {g} {h} {hinv} {i}
  {count} {order} {a} {b} {k} {set} {d} {size} {id} {group} {list} {longest} {factors} {filename}`. Word order
  around them is free.
- Notation is copied unchanged: `Z/n`, `(Z/n)*`, `p^k`, `2p^k`, `gcd(…)`, `|⟨{h}⟩|`, `⟨{h}⟩`, `↔`, `·`, `+`, `=`, `/`,
  `mod`. So are single-letter variables (`n`, `p`, `k`) and the acronym `PNG`. `{group}` renders as `Z/12` or
  `(Z/12)*`, and `{factors}` renders like `Z/2 × Z/4`. In `notice.*` the placeholders are `<code>` nodes supplied by
  the page.
- `cosetTitleAdd` and `cosetTitleMul` are pure notation. Copy them verbatim. In he, ar and ckb, wrap the whole value
  in isolates. `legendPair` (`{a} ↔ {b}`) is the same: verbatim, with isolates in he, ar and ckb.
- `cosetCountAdd`: translate only the clause "so there are … cosets". The formula part stays as is.
- Numerals stay ASCII and identical: 2 and 100 in `nNoteClamped`, 0 in `factGeneratorsNone`, 1 in `hint.notCyclic`
  and `notice.body`, 2 and 4 in `notice.whyPowerOfTwo`, 4 in `notice.whyFourAndOdd`, and 1, 2, 4 and the 2 of
  `2p^k` in `notice.rule`. Never use native digits, Roman numerals, full-width digits, CJK numerals or number words
  in place of these. DIGIT-PARITY enforces this for hi ar sq sw zh ja ko id zgh-Latn zgh-Tfng ku ckb sa la, and the
  rule applies to every language.

### 6.2 Style
- Use the register, imperatives and punctuation of glossary section (a) for the language (for example nl je,
  de du, fr vous, he plural imperatives, ja です・ます).
- Write whole natural sentences. Values are plain text, never markup (`<` followed by a letter is a DICT-MARKUP
  finding). No emoji.
- Capitalization of headings and labels follows the language's own convention. Lowercase starts in English
  (`eyebrow`, `opAdd`, `opMul`, `legendSelfInverse`) stay lowercase where the language allows it.
- Quotation marks inside a value (only `hint.mirrorOff` has them) follow the marks the language already uses for a
  quoted UI label. Print `wheel.exportPrintOpening` for your languages, which quotes "Save as PDF". For example
  fr « … », pl „…”, ja 「…」, zh “…”, ckb «…», he and ar "…". The glossary punctuation section breaks a tie. The
  English uses “…”.
- Apostrophes: follow the convention the language's existing values in `assets/i18n/cayley-table.js` already use.

### 6.3 Plural shape of `legendSubgroups` (`{count} subgroup` / `{count} subgroups`)

| Shape | Languages |
|-------|-----------|
| `{ one, other }` | nl de fr es it pt-BR pt-PT sv nb hu el hi sq sw ku ckb la zgh-Latn zgh-Tfng |
| `{ one, few, many, other }` | pl ru |
| `{ one, few, other }` | ro |
| `{ zero, one, other }` | lv |
| `{ one, two, other }` | he sa |
| `{ zero, one, two, few, many, other }` | ar |
| `{ other }` | zh ja ko id |

Every category keeps `{count}`. Follow the language's existing plural entries, for example
`cayley.summaryAdditive`, which `node -e` can print from `loadCatalog()`.

### 6.4 Scripts and letters
These rules restate CLAUDE.md, which wins on any doubt.
- ru Cyrillic, el Greek (Latin `Cayley` allowed, as in `cayley.title.el`), he Hebrew, hi and sa Devanagari, ar and
  ckb Arabic script, zh Simplified Han, ja kanji (shinjitai) plus kana, ko Hangul without hanja, and zgh-Tfng
  Tifinagh. Latin runs are allowed only for the SCRIPT_LATIN_NOTATION list (`PNG`, `gcd`, `mod`, …) and single
  letters.
- ckb uses only the 33 Sorani letters (ک ی ە ھ, never ك ي ة ه). ar is unvocalized, with no tatweel and no
  Persian/Urdu letters. ku uses Latin Hawar letters (ç ê î ş û, never ı ğ ș). sa uses the Classical repertoire
  (no nukta, candra, candrabindu or ळ), and the danda । ends prose sentences: it never follows a space and never
  sits inside a formula. la uses ASCII letters only (no macrons; v for consonantal u; never j). zgh-Latn uses IRCAM
  Latin letters only. zgh-Tfng is the letter-for-letter transliteration of zgh-Latn (see plan 06).
- CJK: full-width punctuation is allowed only in zh and ja prose (、。：（）「」 and so on). Formulas, tuples and
  notation keep ASCII punctuation. Korean uses Western punctuation only. Avoid Traditional-only Han in zh and
  Simplified-only Han in ja (HAN-FORM). Use no 万/億/만/억.
- Every value is NFC with no zero-width characters.

### 6.5 Right-to-left (he, ar, ckb)
- Wrap every formula or notation run in `\u2066`…`\u2069` (written as escapes, see section 2). That covers anything
  with = + · / ↔ ^ * mod gcd |…| ⟨…⟩, group notation such as Z/n, (Z/n)*, p^k and 2p^k, `n = {n}`, and placeholders
  that render notation or number lists: `{group}`, `{factors}`, `{set}`, `{list}`, `{filename}`, plus the whole of
  `legendPair`, `cosetTitleAdd` and `cosetTitleMul`. BIDI-FORMULA only catches digit-operator-digit after
  placeholders become 0, so apply the convention beyond what the checker sees. Models to copy:
  `cayley.noteCommutative.ar`, `cayley.summaryMultiplicative.he`, `crt.coprimeWarn.ar`, `wheel.exportSaved.ckb`.
- Isolates must balance (BIDI-UNBALANCED). Never use U+202A–U+202E (BIDI-CONTROL).
- A cross-link arrow `→` becomes `←` in RTL, as `cayley.xref.ar` shows.

### 6.6 Cross-key consistency (within one language)
- `heading` equals `hub.card.cyclicGroups.title` (both are "Cyclic Group Necklace" in English).
- The first part of `title` equals `site.nav.cyclicGroups` (`Cyclic Groups — Necklace Visualizer`).
- `xref` names the Cayley Table tool exactly as `site.nav.cayley` or `cayley.title` of the language does.
- `tablistLabel` equals `cayley.tablistLabel` of the language. `nLabel` follows `cayley.nLabel` with a lowercase `n`.
  `rotateReset` equals `common.reset`.
- `exportPng`, `exportSaved` and `exportFailed` follow the phrasing of `wheel.exportPngBtn`, `wheel.exportSaved`
  and `wheel.exportFailedPng`.
- `groupHeading` and `fact.group` use the same word. `subgroupHeading`, `layerPaths`, `subgroupsHeading`,
  `colorByOrder`, `legendOrder` and `legendSubgroups` use one word for subgroup.
- `autoRotateCw`/`autoRotateCcw` use the same words as `dirCw`/`dirCcw` (grammatical form may differ).
- `hint.mirrorOff` quotes the translated `layerBygen` label verbatim, inside the language's quotation marks.
- `legendHeading` ends with the `colorByOrder` wording, and `legendHeadingInverse` ends with the `colorByInverse` wording.
- `cosetHide` is the "stop" form of `cosetButton`. `layerElement` (Forward path) is the same phrase that opens
  `combineForward` and appears in `swapColors`. `combineBackward` and `layerBackward` use one word for backward.
- "order" is the group-theoretic order of an element (`layerOrders`, `ringTitle`, `ringFootnoteOrders`, `hint.*`),
  never sorting order. Use the term from `dh.orderSubgroup` and `shor.pillOrderOfA`. "Cardinality" (`colorByOrder`,
  `legendHeading`, `legendOrder`) is the number of elements of a subgroup. Keep it a distinct word where the
  language has one.
- "generator" uses glossary row 24 (first half). "cyclic" uses row 25. "identity" and "inverse" use the cayley
  namespace terms.

---

## 7. Key context (UI role of each of the 100 cyclicGroups keys, in en order)

| Key | Where it appears / what it means |
|-----|----------------------------------|
| title | Browser-tab `<title>`: tool name, a dash, then the subtitle "Necklace Visualizer" |
| eyebrow | Small kicker above the h1, in the style of `cayley.eyebrow` ("group theory · …"); "orbits" is the group-theory orbit |
| heading | Page h1, "Cyclic Group Necklace" (beads on a ring = necklace) |
| lede | Intro paragraph, four sentences; "chords" are geometric chords of the ring |
| xref | Link to the Cayley Table tool with a trailing arrow |
| tablistLabel | aria-label of the Additive/Multiplicative Groups tab list |
| groupHeading | Panel heading "Group" (the n input lives here) |
| subgroupHeading | Panel heading "Subgroup" (the generator select lives here) |
| identityOnly | Note shown when the chosen element is the identity: it generates only itself |
| nLabel | Label of the modulus input |
| genLabel | Label of the select that picks which element's cyclic subgroup is drawn |
| nNoteClamped | Status under the n input after an out-of-range value was clamped |
| layersHeading | Panel heading for the display toggles |
| extraOptions | `<summary>` text of a collapsible block of more toggles |
| layerCord | Checkbox: draw the polygon through the subgroup's elements |
| layerGuide | Checkbox: draw the circle the beads sit on |
| layerElement | Label before a select (Inside/Outside) choosing on which side of the ring the forward-path arrows run |
| layerElementTitle | Tooltip on that label: one step = combining the current element with {g} |
| layerBackward | Checkbox: hide the backward (inverse) path |
| layerPaths | Checkbox: draw the arrow paths of the subgroup |
| resizeTitle | Tooltip of the diagram's resize handle |
| dirLabel | Label of a select; options dirCw/dirCcw |
| dirCw / dirCcw | Select options "Clockwise" / "Counterclockwise" |
| sideInside / sideOutside | Options of the layerElement select (inside or outside the ring) |
| colorElement | Tooltip of the color picker for the forward (element) arrows |
| colorInverse | Tooltip of the color picker for the backward (inverse) arrows |
| colorReset | Link-style button resetting both arrow colors |
| genTop | Checkbox: turn the ring so the selected generator sits at the top |
| swapColors | Checkbox: swap the two path colors |
| customColors | Checkbox: pick the arrow colors by hand |
| layerColors | Checkbox: color the beads |
| colorByLabel | Label of a select; options colorByOrder/colorByInverse |
| colorByOrder | Option: color each element by the size of the subgroup it generates |
| colorByInverse | Option: color each element together with its inverse |
| layerOrders | Checkbox: small number beside each bead giving the element's order |
| layerBygen | Checkbox: place beads in the order g^0, g^1, g^2, … instead of by value (quoted verbatim in hint.mirrorOff) |
| combineForward | Caption beside the forward-path color swatch |
| combineBackward | Caption beside the backward-path color swatch |
| combineSelfInverse | Caption when {h} is its own inverse (one walk drawn in a mix of both colors) |
| factsHeading | Heading of the facts list ("This group") |
| cosetButton | Toggle button that starts the coset walk-through |
| cosetHide | The same button while active |
| cosetNoneGenerator | The same button, disabled, when {g} generates the whole group |
| cosetProgress | Line inside the ring during coset playback ("coset {i} of {count}") |
| autoRotate | Label of a three-stop switch (Off / counterclockwise / clockwise) |
| autoRotateOff / autoRotateCcw / autoRotateCw | Tooltips and aria-labels of the three stops |
| rotateLabel | Label of the rotation control ("Rotation — drag the ring") |
| rotateBack / rotateForward | Tooltips of the two one-step rotate buttons |
| rotateValue | aria-label of the numeric rotation field |
| rotateReset | Link-style reset button (= common.reset) |
| subgroupsHeading | Heading of a list with one row per element showing the subgroup it generates |
| autoShift | Checkbox label |
| autoShiftTitle | Long tooltip of that checkbox |
| subLayoutLabel | aria-label of a two-button group (grid / list view of that list) |
| subLayoutGrid / subLayoutList | Tooltips of the two buttons |
| fact.group / fact.elements / fact.identity / fact.operation / fact.generators / fact.structure | Labels in the facts list (values: Z/12, 12, 0, opAdd/opMul, factGeneratorsCount/None, Z/2 × Z/4) |
| opAdd / opMul | Value of the Operation fact, lowercase ("addition mod {n}") |
| factGeneratorsCount | Value of the Generators fact, e.g. "4 of 12" |
| factGeneratorsNone | Value of the Generators fact for a non-cyclic group |
| hint.* | One explanatory line under the facts (seven variants) |
| legendHeading / legendHeadingInverse | Heading of the color-key panel for the two color-by modes |
| legendOrder | Legend row label "Subgroup's cardinality: {order}" |
| legendSubgroups | Count beside each legend row (plural) |
| legendSelfInverse | Legend row listing the self-inverse elements, lowercase start |
| legendPair | Legend row for an inverse pair, pure notation |
| ringTitle | SVG text above the ring: "{group} · element {h} of order {k}" |
| cosetTitleAdd / cosetTitleMul | SVG title during coset playback, pure notation |
| cosetCountAdd | SVG subtitle: formula + "so there are … cosets" |
| ringFootnote / ringFootnoteOrders | Footnote under the ring (the identity bead has a ring drawn around it) |
| svgAriaLabel | aria-label of the diagram |
| notice.heading / notice.body / notice.why* / notice.rule | Notice panel explaining why (Z/n)* has no generator |
| exportPng / exportSaved / exportFailed | Export button and its two status messages |

---

## 8. Wave-1 SUMMARY requirements (`$Q/261009-tgw-NN-SUMMARY.md`)

Frontmatter must carry `status: complete`. The body records:
- The five languages and the final VALIDATE output line.
- Every own allowSame entry, with its reason.
- "Terms coined" per language, listing each new concept with the chosen word. Plan 07 copies these into its commit body.
- Any value you are unsure of, marked `[ASSUMED]` like the glossary does.

---

## 9. Plan-07 merge tool spec (`$Q/merge-fragments.js`, written by plan 07 only)

Node built-ins only (`fs`, `path`, `vm`, `child_process`). Run from the checkout root.
Modes: `node $Q/merge-fragments.js` (merge) and `node $Q/merge-fragments.js --check` (verify only).

Canonical language order (the order of every data file): nl, en, de, fr, es, it, pl, pt-BR, pt-PT, sv, nb, ro, hu,
lv, ru, el, he, hi, ar, sq, sw, zh, ja, ko, id, zgh-Latn, zgh-Tfng, ku, ckb, sa, la.

Merge:
1. Load. For each of the 30 non-English codes, read `F/<code>.js` (fail if any file is missing) and run it in a
   `vm` context whose `NT.i18n.register(ns, dict)` captures the calls. Assert the following, and fail naming the file
   on any mismatch: exactly the namespaces cyclicGroups, site and hub, each with exactly one language key equal to
   the filename code; the cyclicGroups key list equals the en key list of `assets/i18n/cyclic-groups.js` IN ORDER;
   site has exactly `['nav.cyclicGroups']`; hub has exactly `['card.cyclicGroups.title', 'card.cyclicGroups.desc']`
   in that order.
2. Extract text. In each fragment's source, for each of the three `register` calls, take the lines from the 4-space
   `<LANGKEY>: {` line through its 4-space closing `}` line. A fragment that deviates from section 2's indentation
   is a hard failure. Plan 07 may fix whitespace and line order only in that fragment, then rerun (step 1's vm
   equality must hold before and after the fix).
3. `assets/i18n/cyclic-groups.js`: refuse (exit 1) if the file already holds any non-en language block, because a
   rerun starts from `git checkout -- assets/i18n/cyclic-groups.js assets/i18n/site.js assets/i18n/hub.js`. Inside
   `  NT.i18n.register('cyclicGroups', {` … `  });` rebuild the body as the 31 blocks in canonical order, joined by
   `,\n`. The en block is the original text verbatim. The others are the fragment block text verbatim. Everything
   outside the register body (header comment, IIFE lines) is unchanged.
4. `assets/i18n/site.js`: inside `NT.i18n.register('site', {` … its matching close, for every non-en language
   block (a 4-space `<LANGKEY>: {` line through its 4-space `}`), find exactly one 6-space line starting with
   `'nav.cayley':`. Insert the fragment's `'nav.cyclicGroups'` line directly after it, ensuring it ends with `,`.
   Refuse if the block already contains `'nav.cyclicGroups'`. The `common` register call and the en block are
   untouched.
5. `assets/i18n/hub.js`: the same with anchor `'card.cayley.desc':` and the two lines title then desc, each ending
   with `,`.
6. Config. Union `F/allow-01.json` … `F/allow-06.json` into
   `.planning/phases/06-multi-language-support/i18n-config/cyclic-groups.json`. The result has `allowSame` (key →
   reason; for a key present in several files, distinct reason strings joined by one space in plan order, with the
   three BASE reasons appearing once) and `allowRenderText` (for every allowSame key whose en value contains no `{`,
   the en value → the same reason, for i18n-browser's langs mode). It is written as JSON with a 2-space indent and
   a trailing newline. No other key.
7. Run `--check` automatically.

Check (`--check`, also the merge's last step). Print `MERGE OK langs=30 keys=100`, or `MERGE FAIL <reason>` and exit 1:
- (a) vm-load the three target files. Every fragment value deep-equals the loaded catalog value.
- (b) Every (ns, lang, key) value of `git show HEAD:<file>` for the three files is unchanged (en, all lcm keys,
  every other key). The only additions are the 30 × 100 cyclicGroups values, the 30 nav.cyclicGroups values and
  the 30 × 2 hub card values.
- (c) In cyclic-groups.js every language's key order equals en's, and the language order is canonical.
- (d) The three files contain no raw U+200E, U+200F, U+202A–U+202E or U+2066–U+2069 (escapes only).
- (e) The diff is confined: `git diff -U0` of site.js adds exactly 30 entry lines starting `      'nav.cyclicGroups':`
  and hub.js exactly 60 starting `      'card.cyclicGroups.`, apart from header-comment lines.
  This check is skipped once HEAD already contains the merge (after plan 07's commit, (a) through (d) still apply).
