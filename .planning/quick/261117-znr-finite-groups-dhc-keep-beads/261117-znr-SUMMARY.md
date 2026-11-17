---
quick_id: 261117-znr
status: complete
commit: 7877b6b
---

# 261117-znr Summary

New time cylinder menu item under Keep g's polygon on every layer: Keep all beads on every layer (dhCylKeepBeads, English only, listed in the i18n header). On by default (stored under cyclic-groups-dhc-keep-beads, '0' when off), it changes nothing; off, in polygon mode each full slice draws only the beads that are corners of its polygons (slicePolys(sl, true): the elements walked by, plus g's with Keep g's polygon). Greyed out with the other polygon switches when polygon mode is off or does not fit.

Checked in Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3, Per frame, stacked polygons): item in place under Keep g's polygon; off, beads 72 → 64, Alice's layer 2 (B = 8, order 4) keeping its 4 corners.
