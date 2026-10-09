---
phase: quick-261009-tgw
plan: 02
subsystem: i18n
tags: [i18n, cyclic-groups, fr, es, it, pt-BR, pt-PT]
status: complete
requires: []
provides:
  - fragments/fr.js, es.js, it.js, pt-BR.js, pt-PT.js (100 cyclicGroups keys + site nav + 2 hub card keys each)
  - fragments/allow-02.json
affects: [plan 07 merge]
key-files:
  created:
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/fr.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/es.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/it.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/pt-BR.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/pt-PT.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/allow-02.json
  modified: []
actuals:
  tokens: 45000
  tasks: 3
  commits: 0
completed: 2026-10-09
---

# Phase quick-261009-tgw Plan 02: fr, es, it, pt-BR, pt-PT cyclicGroups translation Summary

Five checker-clean translation fragments of the Cyclic Groups tool (100 keys, one plural, nav and hub card keys) for French, Spanish, Italian, Brazilian and European Portuguese, ready for plan 07's merge. No commits were made, per the wave-1 rules.

## Validation

Brief section-5 VALIDATE for `fr es it pt-BR pt-PT` (NN=02, plus the equivalent run per task): final output line `TGW-VALIDATE 0`. `git status --porcelain -- assets 'Cyclic Groups' index.html .planning/phases` reports 0 changes. A vm check also confirmed that each fragment's cyclicGroups key list equals the English list in order, site has exactly `nav.cyclicGroups`, hub has the two card keys in order, and `heading` equals `card.cyclicGroups.title`.

## Own allowSame entries

- `cyclicGroups.fact.structure`: French "Structure" is the established mathematical term and a genuine cognate of English "Structure". Reason sentence ends with `(quick task 261009-tgw)`. es "Estructura", it "Struttura", pt "Estrutura" differ from English and need no entry.

The three BASE entries are included verbatim.

## French traps

- `fact.structure`: kept "Structure" with the allow entry above (genuine cognate).
- `opAdd` / `opMul`: "addition modulo {n}" / "multiplication modulo {n}", natural French math prose, non-identical, no entry. For consistency, hints and the other languages' ops also write "modulo"/"módulo" in prose (not the abbreviation "mod").
- Other near-traps avoided with native words: `subLayoutLabel` "Affichage"/"Disposición"/"Disposizione"/"Disposição".

## Terms coined

| Concept | fr | es | it | pt-BR | pt-PT |
|---------|----|----|----|-------|-------|
| necklace | collier | collar | collana | colar | colar |
| ring (circle the elements sit on) | cercle (avoids "anneau", the algebraic ring) | círculo | cerchio | círculo | círculo |
| bead | perle | cuenta | perla | conta | conta |
| orbit | orbite | órbita | orbita | órbita | órbita |
| chord | corde | cuerda | corda | corda | corda |
| coset | classe latérale | clase lateral | classe laterale | classe lateral | classe lateral |
| cardinality | cardinal du sous-groupe | cardinalidad | cardinalità | cardinalidade | cardinalidade |
| polygon | polygone | polígono | poligono | polígono | polígono |
| layer | couche | capa | livello | camada | camada |
| forward / backward path | chemin aller / retour | camino de ida / vuelta | percorso di andata / ritorno | caminho de ida / volta | caminho de ida / volta |
| auto-rotate | rotation automatique | giro automático | rotazione automatica | rotação automática | rotação automática |
| ringed (identity) | entouré d'un cercle | rodeada con un círculo | cerchiato | circulado | circundado |

Reset follows `common.reset` per language (Réinitialiser, Reiniciar, Reimposta, Reiniciar, Repor). Registers: fr vous, es tú, it tu, pt-BR você with third-person imperatives, pt-PT tu with second-person imperatives. Download wording follows `wheel.exportPngBtn` (Télécharger, Descargar, Scarica, Baixar, Descarregar); `exportSaved` ends with a period as in English (fr/es/it use the colon pattern of their `wheel.exportSaved`, pt-BR "Salvo", pt-PT "Guardado").

## Deviations from Plan

- French punctuation: the plan and glossary ask for a narrow no-break space (U+202F) before `: ; ? !` and inside « », while the existing fr values use ordinary spaces. I followed the glossary and plan, so fr.js contains 17 raw U+202F characters (not on the forbidden-invisible list; VALIDATE accepts them). Plan 07 should keep them verbatim.
- Apostrophes are typographic (U+2019), matching `cayley-table.js` and the English xref/legendOrder, so no value needed double quotes.
- Shared-scratchpad note: parallel executors share the scratchpad directory, so a generic `val.sh` there was overwritten once by another plan; I switched to a uniquely named script. No effect on output.

## Assumed values

`[ASSUMED]`: "cardinal du sous-groupe" for fr cardinality (the brief suggests "cardinal"), "cercle" instead of "anneau" for the ring, "Disposition/Affichage" for the grid/list layout label, pt-PT "circundado" and "Motivo:" for "Why:" in both Portuguese variants, and the hub description wording in all five languages (styled on `hub.card.cayley.desc`).

## Known Stubs

None.

## Self-Check: PASSED

All six files exist in the fragments directory; the VALIDATE command prints `TGW-VALIDATE 0`; no tracked file changed; no commits (as required, commits: 0).
