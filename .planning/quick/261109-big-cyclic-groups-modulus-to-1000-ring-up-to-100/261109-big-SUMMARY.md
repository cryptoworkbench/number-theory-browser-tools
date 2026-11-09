---
quick_id: 261109-big
status: complete
commit: 89205d9
---

# 261109-big summary

maxN(mode) (100 for +, 1000 for ×) replaces MAX_N in every clamp (queries, typing, the shared
group, leaving a curve, switching the operation, which clamps n to 100 under +). EC_MAX_P = 1000,
ecValid no longer caps the point count. ringDrawn(G) (order ≤ MAX_DRAW = 100) gates drawRing
and the combination lines in drawNecklace, with a .ring-too-big note (ringTooBig) instead;
cayleyAvail and polyAvail require it. eachShown/shownText/gapMath abbreviate a row's members past
MAX_DRAW in the plain, merged and mirrored lists. curveOrders uses the primes of |E| and
double-and-add; cyclicCurves and nextCurveOfOrder use squaresMod, curvePointCount and
curveFirstGen (results identical to before, checked in Node: 997 build 654 → 27 ms, curve search
5.3 s → 34 ms); cyclicUnitGroups scans m up to 1000 by structure (2, 4, pᵏ, 2pᵏ) with its least
primitive root. The ℤ/kℤ chips appear only for k ≤ 100. Translations: 97 → 1000 in ecNTitle and
ecNoteN in all 31 languages; ecNoteSize removed; ringTooBig added.
Verified in Chrome: ⟨ℤ/101ℤ, ×⟩ draws its 100 beads; ⟨ℤ/103ℤ, ×⟩, ⟨ℤ/1000ℤ, ×⟩, ⟨ℤ/997ℤ, ×⟩ show
the note and their lists (996 rows, abbreviated); + clamps 250 to 100; the curve mod 997 (982
points) and mod 989 (1104) load with the note, mod 37 draws again; no script errors.
