---
quick_id: 261117-r2f
status: complete
commit: 6c4c158
branch: main
---

# 261117-r2f Summary

Removed the time cylinder's Floor slider (#dhc-floor-gap): its markup, input handler, dhc.floorGap and its stored key cyclic-groups-dhc-floor-gap (now simply ignored), DHC_FLOOR_GAP_MAX, and the en-only dhCylFloorGap/dhCylFloorGapTip strings. The congruence wheel floor always sits at the cylinders' foot (the slider's default, 0), and the auto-fit (dhcAutoView) and the floor's split line drop the gap term.

Checked in Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 7, floor on): the window's controls no longer show Floor, the cylinders and floors draw at their foot, and the drawing fits the picture (14–457 of 471 across).
