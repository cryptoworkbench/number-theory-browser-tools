---
quick_id: 261115-kr1
status: complete
commit: 3429198
---

# 261115-kr1 Summary

drawRingWheel split into drawRingWheel + drawRingWheelCells; with the switch off the wheel group carries rotate(turn), the clip rect counter-turns it (turnRingWheelClip), "% n" stays upright, and wheelKept moves the previous wheel's nodes into the redrawn ring when group, size, direction and arrangement match. Verified in Chrome on ℤ/12ℤ: nodes reused across turns, wheel aligned with beads, On restores upright numbers, no console errors.
