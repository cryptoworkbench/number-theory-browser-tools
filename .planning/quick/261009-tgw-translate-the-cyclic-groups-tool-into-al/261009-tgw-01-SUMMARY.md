---
phase: quick-261009-tgw
plan: 01
subsystem: i18n
tags: [i18n, cyclic-groups, nl, de, sv, nb, la]
status: complete
requirements: [QUICK-TGW-01, QUICK-TGW-02, QUICK-TGW-03]
key-files:
  created:
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/nl.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/de.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/sv.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/nb.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/la.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/allow-01.json
  modified: []
commits: 0
actuals:
  tokens: 40000
  tasks: 3
  commits: 0
---

# Quick 261009-tgw Plan 01: Dutch, German, Swedish, Norwegian Bokmål, Latin Summary

Five checker-clean fragments (nl, de, sv, nb, la) for the Cyclic Groups tool: all 100 `cyclicGroups` keys, `site.nav.cyclicGroups` and the two `hub.card.cyclicGroups.*` values each, ready for plan 07's merge. No commits were made, per the wave-1 rules.

## Validation

Final VALIDATE run (NN=01, LANGS=`nl de sv nb la`, LANGRE=`nl|de|sv|nb|la`), final output line:

```
TGW-VALIDATE 0
```

Also checked:
- Key tokens and key order match the English block for all five fragments (100 keys each).
- `hint.mirrorOff` contains the translated `layerBygen` text verbatim in all five languages.
- `legendSubgroups` is `{ one, other }` on one line in all five.
- `la.js` contains no `j`.
- `git status --porcelain -- assets 'Cyclic Groups' index.html .planning/phases` is empty (nothing tracked was touched).

## Allow entries

`fragments/allow-01.json` holds only the three BASE entries (`cyclicGroups.nLabel`, `cyclicGroups.cosetTitleAdd`, `cyclicGroups.cosetTitleMul`). No own entries were needed. `nLabel` is identical to English in nl and la (and is exempted by the BASE entry); de, sv and nb write "Modul"/"modul".

Trap decisions (no allow entry required because the chosen term differs from English):
- sv `fact.operation`: "Gruppoperation" (not "Operation", which is identical to English). sv `opAdd`/`opMul`: "addition modulo {n}" / "multiplikation modulo {n}".
- nb `fact.operation`: "Gruppeoperasjon"; `opAdd`/`opMul`: "addisjon mod {n}" / "multiplikasjon mod {n}".
- nl/de/sv/nb `subLayoutLabel`: Weergave / Ansicht / Visning / Visning.
- la `fact.operation`: "Operatio".

## Terms coined

| Concept | nl | de | sv | nb | la |
|---------|----|----|----|----|----|
| necklace | ketting | Kette | halsband | halskjede | monile |
| coset | nevenklasse | Nebenklasse | sidoklass | sideklasse | classis lateralis |
| orbit | baan | Bahn | bana | bane | orbita |
| chord | koorde | Sehne | korda | korde | chorda |
| cardinality | kardinaliteit | Kardinalität | kardinalitet | kardinalitet | cardinalitas |
| polygon | veelhoek | Vieleck | månghörning | mangekant | polygonum |
| layer | laag (Lagen) | Ebene | lager | lag | stratum (Strata) |
| path (forward/backward) | pad | Pfad | väg | sti | via |
| auto-rotate | automatisch draaien | automatisch drehen | rotera automatiskt | roter automatisch | rotatio automatica |
| clockwise / counterclockwise | met de klok mee / tegen de klok in | im / gegen den Uhrzeigersinn | medurs / moturs | med klokken / mot klokken | secundum / contra horologium |

Reused from existing namespaces: generator (nl voortbrenger, de Erzeuger, sv/nb/la generator), cyclic group, subgroup, order, identity, inverse, Cayley table, `tablistLabel` (= `cayley.tablistLabel`) and `rotateReset` (= `common.reset`).

## Deviations from Plan

None - plan executed as written. A scratch validation wrapper script was kept in the session scratchpad (outside the repo), not in the quick dir.

## Assumed values

- [ASSUMED] la "navigatro" (browser) in `exportFailed`, la "Elenchus" (list view) and "Species" (view/layout), la "Exstinctum" (Off).
- [ASSUMED] nb "Sti framover"/"Sti bakover" for forward/backward path; sv "Framåtväg"/"Bakåtväg".
- [ASSUMED] de "Pfad" terms, de "Ebenen" for layers.
- [ASSUMED] nb `cosetProgress` verb "Utheber" (highlights).

## Known Stubs

None.

## Self-Check: PASSED

All six files in `fragments/` for this plan exist and VALIDATE prints `TGW-VALIDATE 0`; no commit was required or made.
