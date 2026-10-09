---
phase: quick-261009-tgw
plan: 05
subsystem: i18n
tags: [i18n, cyclic-groups, hi, sa, sq, sw, id]
status: complete
requires: []
provides:
  - fragments/hi.js
  - fragments/sa.js
  - fragments/sq.js
  - fragments/sw.js
  - fragments/id.js
  - fragments/allow-05.json
affects: [plan 07 merge]
key-files:
  created:
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/hi.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/sa.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/sq.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/sw.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/id.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/allow-05.json
  modified: []
decisions:
  - "Own allowSame entries: none beyond the three BASE entries"
metrics:
  tasks: 3
  commits: 0
actuals:
  tasks: 3
  commits: 0
---

# Quick 261009-tgw Plan 05: hi, sa, sq, sw, id fragments Summary

Five checker-clean fragments (Hindi, Sanskrit, Albanian, Swahili, Indonesian) for the Cyclic Groups tool: 100 `cyclicGroups` keys each in English key order, plus `site.nav.cyclicGroups` and `hub.card.cyclicGroups.title`/`.desc`. No commit was made, and nothing under `assets/`, any page or `.planning/phases/` was touched.

## Validation

Final VALIDATE output (brief section 5, NN=05, LANGS `hi sa sq sw id`):

```
TGW-VALIDATE 0
```

`git status --porcelain -- assets 'Cyclic Groups' index.html .planning/phases` reports 0 changed paths (TRACKED-CHANGES 0).
A negative test (a danda after a space and a stray digit in a temporary sa edit) was flagged as SA-DANDA and DIGIT-PARITY, so the checker does exercise these values. The edit was reverted.

## Plural shapes

- hi `{ one, other }` (same noun in both, as cayley hi does)
- sa `{ one, two, other }` (उपसमूहः / उपसमूहौ / उपसमूहाः)
- sq `{ one, other }` (nëngrup / nëngrupe)
- sw `{ one, other }` (`kundi dogo {count}` / `makundi madogo {count}`)
- id `{ other }` only (`{count} subgrup`, no reduplication)

## Own allowSame entries

None. `allow-05.json` holds exactly the three BASE entries. In id, `nLabel` is "n — modulus" and is covered by the BASE `cyclicGroups.nLabel` entry. No other value is byte-identical to English.

## Terms coined

Each is a new concept with no sibling rendering. Existing sibling terms were reused for the rest.

| Concept | hi | sa | sq | sw | id |
|---|---|---|---|---|---|
| necklace | हार | हारः | gjerdan | mkufu | kalung |
| bead | मनका | मणिः | rruazë | ushanga | manik |
| ring (the circle the elements sit on) | छल्ला | वलयः | unazë | pete | cincin |
| coset | सहसमुच्चय | सहसमुच्चयः | klasë fqinje | kosesi | koset |
| orbit | कक्षा | कक्षा | orbitë | obiti | orbit |
| chord | जीवा | जीवा | kordë | kamba | tali busur |
| cardinality | गणनांक | गणनाङ्कः | kardinalitet | idadi ya vipengele (vya kundi dogo) | kardinalitas |
| polygon | बहुभुज | बहुभुजम् | shumëkëndësh | poligoni | poligon |
| layer | परत | स्तरः | shtresë | tabaka | lapisan |
| forward / backward path | अग्रगामी / पश्चगामी पथ | अग्रपथः / पश्चपथः | shtegu përpara / mbrapsht | njia ya mbele / nyuma | lintasan maju / mundur |
| clockwise / counterclockwise | दक्षिणावर्त / वामावर्त | दक्षिणावर्तम् / वामावर्तम् | në drejtim orar / kundërorar | kuelekea saa / kinyume cha saa | searah / berlawanan arah jarum jam |
| browser (exportFailed) | ब्राउज़र | जालदर्शकः | shfletues | kivinjari | peramban |

## [ASSUMED] values

All the coined terms above are `[ASSUMED]`, since none was checked against a published glossary or reviewed by a native speaker. Those I am least sure of:

- sa `जालदर्शके` ("browser"): no sibling sa value renders "browser". The only candidate, ब्राउज़र, carries a nukta, which the Classical repertoire forbids.
- sa `सहसमुच्चय` and `गणनाङ्कः`.
- sw `kosesi` (a loan word for coset) and the phrase `idadi ya vipengele` for cardinality, chosen so that it differs from `daraja` (order).
- hi `हार दृश्यीकरण` in the title for "Necklace Visualizer".
- sq `Çelësi i ngjyrave` for "Color key".

## Deviations from Plan

None. The plan was executed as written.

## Self-Check: PASSED

The five fragments and `allow-05.json` exist in the fragments directory, and the final VALIDATE and TRACKED-CHANGES checks passed. No commits were made, as instructed.
