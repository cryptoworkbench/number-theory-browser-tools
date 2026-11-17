---
quick_id: 261118-a7p
status: complete
commit: 39d7a75
branch: dhc-distance-follows
---

# 261118-a7p Summary

On branch dhc-distance-follows. The automatic distance (261118-a5k) was sized for the exchange's last step, so the cylinders stood far apart from the start. dhcAutoView now sizes it for the step on show (the floor's rings as dhcWheelRings counts them now, and the raw results with them), and dhcApartTo eases the distance to that goal over 500 ms (smoothstep, a redraw each frame), at once when the window opens (openDhCyl clears dhc.apartGoal) or with reduced motion. So the cylinders open as close as they can be without the floors touching, part as a step makes the floor grow, and stand as close as the full floor allows when a playback ends; a Replay brings them back together. The zoom cap follows the distance shown.

Checked in headless Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3, Per frame, floor on): open 259 / 90%; step 2 eases 259 → 297 (84%); step 4 eases → 521 (61%); Replay eases back (335 after 0.3 s); the floors' gap stays 14–23 units.
