---
status: complete
quick_id: 261101-vxv
commit: de695ff
---
# Log-base star tooltip, conditional

The (*) tooltip above the logarithm-base picker now has two texts:
- generator-powers arrangement (always for additive groups and curves): logBaseIntroStar;
- a multiplicative group with Sequential pressed: logBaseIntroStarSeq, adding "(if it were order by generator powers)".

logBaseIntro(G) picks the key from state.bygen; the formula box rebuilds on every render, so toggling Sequential updates it. English-only strings.
