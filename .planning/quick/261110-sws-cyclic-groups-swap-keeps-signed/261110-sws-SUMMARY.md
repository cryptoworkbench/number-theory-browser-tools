---
quick_id: 261110-sws
status: complete
commit: 17d4b82
---

# 261110-sws summary

swapHostGroup and takeGroupSpec built a fresh query without signed/signedexp, so applyRingQuery
reset both; keepSignedQuery now copies them in. Verified in Chrome: Z/12Z with ± and g± on, swapped
for ⟨E3,1(F7), +E⟩, keeps signed=1 and signedexp=1, both buttons pressed.
