---
quick_id: 261117-zcr
status: complete
commit: efa703d
branch: dhc-raw-on-floor
---

# 261117-zcr Summary

On branch dhc-raw-on-floor. The time cylinder's coloured raw results (dhc-raw) were upright labels 4 units above the raw point. Now each is written flat in its slice's plane exactly as the congruence wheel floor writes the same number in its cell: the slice's centre with the floor's squash (matrix(1 0 0 sin pitch, cx, slice y)), the cell's middle (polar at R + (q + ½)·ring, the wedge's mid), the floor's number size and turn (outward on the top half, inward on the bottom). Seen from straight above (pitch 90°) slice and floor project onto each other, so each raw result lies on its cell's number. The floor's size/mid/turn moved into dhcWheelNumSize, dhcWheelMid and dhcWheelRot, shared by dhcWheel, the lit cells and the label. The label sits in a .dhc-raw-g group so the Per computer / Per variable slide's transform leaves its own. .dhc-raw loses its fixed 7px size and 2px halo (now set per label, halo 0.28 × size) and gains dominant-baseline central.

Checked in Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3, Per frame, step 4, tilted to the top): 16, 60 and 64 lie exactly on the floor's 16, 60, 64.
