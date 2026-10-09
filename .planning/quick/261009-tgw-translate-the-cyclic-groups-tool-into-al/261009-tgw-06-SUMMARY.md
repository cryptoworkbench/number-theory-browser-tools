---
phase: quick-261009-tgw
plan: 06
subsystem: i18n
tags: [i18n, cyclic-groups, zh, ja, ko, zgh-Latn, zgh-Tfng]
requires: []
provides:
  - "Cyclic Groups fragments for zh, ja, ko, zgh-Latn and zgh-Tfng (cyclicGroups 100 keys, site nav.cyclicGroups, hub card title and desc)"
  - "allow-06.json (the three BASE allowSame entries only)"
affects: [261009-tgw-07 merge]
tech-stack:
  added: []
  patterns: ["overlay fragment validated in a scratch copy of the repo", "zgh-Tfng derived letter for letter from zgh-Latn with a throw-away helper"]
key-files:
  created:
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/zh.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/ja.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/ko.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/zgh-Latn.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/zgh-Tfng.js
    - .planning/quick/261009-tgw-translate-the-cyclic-groups-tool-into-al/fragments/allow-06.json
  modified: []
decisions:
  - "legendSubgroups is { other } for zh, ja, ko and { one, other } for zgh-Latn, zgh-Tfng"
  - "Korean avoids Hangul particles that depend on a final consonant after placeholders and variables ({n}, {g}, {h}), by rephrasing (copula 입니다, 의, 에, 만큼)"
  - "In zgh-Tfng only the variable n, Z, p, k stay Latin; the Tamazight preposition n is transliterated"
metrics:
  duration: "about 40 minutes"
  completed: 2026-10-09
status: complete
actuals:
  tokens: 7200
  tasks: 3
  commits: 0
plan_head_before: 8668ed72cf70d47a81ecf54783bdfc4ad5c95856
plan_head_after: 8668ed72cf70d47a81ecf54783bdfc4ad5c95856
---

# Phase quick-261009-tgw Plan 06: zh, ja, ko, zgh-Latn, zgh-Tfng Summary

Five checker-clean Cyclic Groups fragments (Simplified Chinese, Japanese, Korean, Standard Moroccan Tamazight in IRCAM Latin, and its letter-for-letter IRCAM Tifinagh derivation), ready for plan 07's merge.

## Result

Final VALIDATE output for `zh ja ko zgh-Latn zgh-Tfng` (the plan's Task 3 verify command, run with the scratchpad as TMPDIR):

```
TGW-VALIDATE 0
TRACKED-CHANGES 0
```

Each fragment registers all 100 cyclicGroups keys in English key order, `site.nav.cyclicGroups` and the two `hub.card.cyclicGroups.*` keys, in the brief's section-2 format. No commit was made, and nothing under `assets/`, any page or `.planning/phases/` was touched (`git status` shows only the untracked quick directory).

## Own allowSame entries

None. `allow-06.json` holds exactly the three BASE entries (`cyclicGroups.nLabel`, `cosetTitleAdd`, `cosetTitleMul`). No value of the five languages is byte-identical to English apart from the two pure-notation coset titles already covered by BASE.

## Terms coined

zh, ja, ko reused the existing sibling terms (subgroup, order, identity, inverse, generator, cyclic group, Cayley table, reset).

| Concept | zh | ja | ko |
|---|---|---|---|
| necklace | 项链 | ネックレス | 목걸이 |
| coset | 陪集 | 剰余類 | 잉여류 |
| orbit | 轨道 | 軌道 | 궤도 |
| chord | 弦 | 弦 | 현 |
| cardinality (of a subgroup) | 元素个数 | 要素数 | 원소 수 |
| polygon | 多边形 | 多角形 | 다각형 |
| layer | 图层 | レイヤー | 레이어 |
| forward / backward path | 前进路径 / 后退路径 | 前進の経路 / 後退の経路 | 정방향 경로 / 역방향 경로 |
| auto-rotate | 自动旋转 | 自動回転 | 자동 회전 |

Cardinality is kept distinct from order in all three (元素个数 vs 阶, 要素数 vs 位数, 원소 수 vs 위수). All of these are `[ASSUMED]`.

zgh (Latin / Tifinagh), all `[ASSUMED]`; a native review is recommended, as for the existing zgh vocabulary:

| Concept | zgh-Latn | zgh-Tfng |
|---|---|---|
| necklace (Arabic qilada adapted) | taqlada | ⵜⴰⵇⵍⴰⴷⴰ |
| coset (reuses "class") | taggayt, tiggayin | ⵜⴰⴳⴳⴰⵢⵜ, ⵜⵉⴳⴳⴰⵢⵉⵏ |
| orbit (reuses "path") | abrid, ibriden | ⴰⴱⵔⵉⴷ, ⵉⴱⵔⵉⴷⴻⵏ |
| chord (plural of awtr) | iwtarn | ⵉⵡⵜⴰⵔⵏ |
| cardinality (number of elements, distinct from urdr) | amḍan n ifrdisn | ⴰⵎⴹⴰⵏ ⵏ ⵉⴼⵔⴷⵉⵙⵏ |
| polygon (b for p, like bulinumyalt) | abulignun | ⴰⴱⵓⵍⵉⴳⵏⵓⵏ |
| layer | taṭbaqt, tiṭbaqin | ⵜⴰⵟⴱⴰⵇⵜ, ⵜⵉⵟⴱⴰⵇⵉⵏ |
| ring (of beads) | twrirt, twririn | ⵜⵡⵔⵉⵔⵜ, ⵜⵡⵔⵉⵔⵉⵏ |
| bead (point on the ring) | tnqqiḍt | ⵜⵏⵇⵇⵉⴹⵜ |
| generators (plural) | imsnulfuyn | ⵉⵎⵙⵏⵓⵍⴼⵓⵢⵏ |
| cyclic subgroups (plural) | tigrawin timẓẓiyin tisutlanin | ⵜⵉⴳⵔⴰⵡⵉⵏ ⵜⵉⵎⵥⵥⵉⵢⵉⵏ ⵜⵉⵙⵓⵜⵍⴰⵏⵉⵏ |
| forward / backward path | abrid n zdat / abrid n uɣal | ⴰⴱⵔⵉⴷ ⵏ ⵣⴷⴰⵜ / ⴰⴱⵔⵉⴷ ⵏ ⵓⵖⴰⵍ |
| clockwise / counterclockwise | am ifassn n tswiɛt / mgal ifassn n tswiɛt | ⴰⵎ ⵉⴼⴰⵙⵙⵏ ⵏ ⵜⵙⵡⵉⵄⵜ / ⵎⴳⴰⵍ ⵉⴼⴰⵙⵙⵏ ⵏ ⵜⵙⵡⵉⵄⵜ |
| inside / outside | daxl / brra | ⴷⴰⵅⵍ / ⴱⵔⵔⴰ |
| arrow | asahm, isahmn | ⴰⵙⴰⵀⵎ, ⵉⵙⴰⵀⵎⵏ |
| color | alun, ilwan | ⴰⵍⵓⵏ, ⵉⵍⵡⴰⵏ |
| rotate / rotation | dwr / adwar | ⴷⵡⵔ / ⴰⴷⵡⴰⵔ |
| automatic (adapted) | awtumatik | ⴰⵡⵜⵓⵎⴰⵜⵉⴽ |
| grid / list | tacbakt / tabdart | ⵜⴰⵛⴱⴰⴽⵜ / ⵜⴰⴱⴷⴰⵔⵜ |
| mixture | lxlita | ⵍⵅⵍⵉⵜⴰ |
| axis | amiḥwar | ⴰⵎⵉⵃⵡⴰⵔ |
| color key / legend | tasarut n ilwan | ⵜⴰⵙⴰⵔⵓⵜ ⵏ ⵉⵍⵡⴰⵏ |
| walk (nominal) | tikli, tikliwin | ⵜⵉⴽⵍⵉ, ⵜⵉⴽⵍⵉⵡⵉⵏ |

"Order labels" is rendered as "Imḍanen n urdr" (order numbers), because the labels are numbers; "no cosets" and "explore" use "war" and "rzu".

## Unsure values `[ASSUMED]`

- zgh-Latn: every sentence with newly coined vocabulary above, especially `lede`, `hint.mirror`, `hint.notCyclic` ("zzat ad tmmd twrirt"), `autoShift` / `autoShiftTitle`, `combineSelfInverse` and the hub `card.cyclicGroups.desc`. zgh-Tfng inherits all of these letter for letter.
- ko: `layerOrders` uses 라벨 and `resizeTitle` is a polite statement; neither term is attested in a sibling namespace.
- ja/zh: `exportFailed` is a new phrasing (the wheel's message is PNG-specific).

## Deviations from Plan

None - plan executed as written. The helper used to derive zgh-Tfng was a throw-away script in the session scratchpad, now outside the repo and not a deliverable. It kept Latin only the English notation letters (variable n in `nLabel`, `nNoteClamped`, `notice.whyPowerOfTwo`, `notice.whyFourAndOdd`, `notice.whyTwoOddPrimes` and `notice.rule`, plus Z, p and k in `notice.rule`) and transliterated the Tamazight preposition n. The two ambiguous values (`notice.whyPowerOfTwo`, `notice.rule`) were resolved by hand through an ordinal override: the variable occurrences stay Latin, the preposition occurrences become ⵏ.

## Known Stubs

None.

## Threat Flags

None. Values are plain text with no markup, and no new surface was introduced.

## Self-Check: PASSED

- FOUND: fragments/zh.js, ja.js, ko.js, zgh-Latn.js, zgh-Tfng.js, allow-06.json
- Task 3 verify command printed `TGW-VALIDATE 0` and `TRACKED-CHANGES 0`
- No git commit was made in this plan, so there are no hashes to check (commits: 0 by design)
