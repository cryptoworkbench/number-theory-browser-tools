---
phase: quick-261009-tgw
plan: 04
subsystem: i18n
tags: [i18n, cyclic-groups, he, ar, ckb, ku, el, rtl, bidi]
requires: []
provides:
  - "fragments/he.js, ar.js, ckb.js, ku.js, el.js: cyclicGroups (100 keys), site nav.cyclicGroups, hub card.cyclicGroups.title/.desc"
  - "fragments/allow-04.json: the three BASE allowSame entries (no own entries)"
affects: [261009-tgw-07 (merge)]
key-files:
  created:
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/he.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/ar.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/ckb.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/ku.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/el.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/allow-04.json
  modified: []
decisions:
  - "Isolates are typed as the six-character escapes u2066/u2069 in he, ar and ckb; no raw bidi characters in any fragment"
  - "Brief wave-1 rule: no git commits, STATE.md and ROADMAP.md untouched"
status: complete
commits: 0
plan_head_before: 8668ed72cf70d47a81ecf54783bdfc4ad5c95856
plan_head_after: 8668ed72cf70d47a81ecf54783bdfc4ad5c95856
actuals:
  tokens: 40000
  tasks: 3
  commits: 0
---

# Phase quick-261009-tgw Plan 04: Cyclic Groups translations for el, he, ar, ckb, ku Summary

Five checker-clean fragments (Greek, Hebrew, Arabic, Sorani Kurdish, Kurmanji Kurdish) covering the 100 cyclicGroups keys,
`site.nav.cyclicGroups` and the two `hub.card.cyclicGroups.*` keys, with every formula in the three right-to-left
languages wrapped in escaped, balanced U+2066/U+2069 isolates.

## Validation

Languages: el, he, ar, ckb, ku. Final VALIDATE output (NN=04, LANGS `el he ar ckb ku`):

```
TGW-VALIDATE 0
```

Task 3's tracked-file check printed `TRACKED-CHANGES 0`. Each fragment has 100 cyclicGroups keys in English key order,
exactly one language key per register call, and the right plural shape (he `one/two/other`, ar
`zero/one/two/few/many/other`, ckb, ku, el `one/other`). `grep -cP '[\x{2066}-\x{2069}]'` is 0 for all five files, and
`u2066` escapes occur 15 times each in he.js, ar.js and ckb.js.

## Own allowSame entries

None. `allow-04.json` holds only the three BASE entries (copied verbatim). No value in these five languages is
byte-identical to English except the pure-notation `cosetTitleAdd`/`cosetTitleMul`, which the BASE entries cover (he,
ar, ckb additionally wrap them in isolates). `nLabel` differs from English in all five (`n — מודולוס`, `n — المقياس`,
`n — مۆدیول`, `n — modul`, `n — μέτρο`).

## Terms coined

| Concept | he | ar | ckb | ku | el |
|---------|----|----|-----|----|----|
| necklace | שרשרת | عقد | ملوانکە | gerdan | περιδέραιο |
| coset | קוסט | مجموعة مشاركة | ھاوکۆمەڵە | hevkom | σύμπλοκο |
| orbit | מסלול | مدار | خولگە | dewrgeh | τροχιά |
| chord | מיתר | وتر | ھێڵی بڕ | watar | χορδή |
| cardinality | עוצמה | عدد العناصر | ژمارەی توخمەکان | hejmara hêmanan | πληθάριθμος |
| polygon | מצולע | مضلع | فرەگۆشە | pirgoşe | πολύγωνο |
| ring (of beads) | טבעת | حلقة | ئەڵقە | xelek | δακτύλιος |
| bead | חרוז | خرزة | مرواری | mircan | χάντρα |
| walk | הליכה | مشي | ڕۆیشتن | gerîn | διαδρομή |
| clockwise / counterclockwise | עם / נגד כיוון השעון | مع / عكس عقارب الساعة | بە ئاراستەی / پێچەوانەی ئاراستەی کاتژمێر | bi aliyê saetê / berevajî aliyê saetê | δεξιόστροφα / αριστερόστροφα |
| forward / backward path | מסלול קדימה / אחורה | المسار الأمامي / الخلفي | ڕێچکەی پێشەوە / دواوە | rêya pêş / paş | διαδρομή προς τα εμπρός / πίσω |
| combine (the group operation) | שילוב | دمج | تێکەڵکردن | tevlihevkirin | συνδυασμός |

Existing terms from sibling namespaces were reused unchanged: subgroup, order, identity element, group operation,
Cayley Table, reset, generator, cyclic group, inverse, modulus, and the ku `xelek`/`gerîn`/`perçe` and el
`δακτύλιος`/`διαδρομή` renderings of ring and walk. The ku and ckb coinages are parallel where the varieties share a
root (`kom`/`کۆمەڵە`, `dewr`/`خول`, hejmar/ژمارە). The ku word for chord (`watar`) and ckb word (`ھێڵی بڕ`) differ
because each follows its own existing `ecdh.explorerChordConstruction` value.

Other choices worth knowing: he, ar and ckb translate `opAdd`/`opMul` as prose (`חיבור מודולו {n}`, `الجمع بمقياس {n}`,
`کۆکردنەوە بە مۆدیولی {n}`), while ku and el keep the literal `mod` as their existing `shor`/`iso` values do. ar avoids
shadda entirely (`شغل` instead of `فعّل`), as the checker forbids all harakat.

## Deviations from Plan

None - plan executed as written. One tooling note: the Write tool converts typed `⁦`/`⁩` escapes into raw
characters, so after writing each RTL fragment I converted them back to six-character escapes with a perl one-liner
(BIDI-RAW would otherwise fail). This is why the committed form is escape-only.

## Known Stubs

None.

## [ASSUMED] values

No native reader has reviewed these. The glossary marks every Kurdish, Arabic and Hebrew term `[ASSUMED]`, and the new
concept words above inherit that status. Least certain: ku `dewrgeh` (orbit), ku `hevkom` and ckb `ھاوکۆمەڵە` (coset), ku
`Dîmenkera gerdanê` and ckb `بینینی ملوانکە` (title subtitle), ar `التصور المرئي للعقد` (title subtitle), he `קוסט`
(coset) and ar `مجموعة مشاركة` (coset). The ckb xref reads "to see the full operation table of this group, go to the
Cayley Table ←" so that the tool is named exactly as `site.nav.cayley` does.

## Self-Check: PASSED

- FOUND: fragments/he.js, ar.js, ckb.js, ku.js, el.js, allow-04.json
- No git commit made, as required for wave 1; STATE.md and ROADMAP.md untouched; nothing under assets/ or
  .planning/phases/ modified (`TRACKED-CHANGES 0`)
