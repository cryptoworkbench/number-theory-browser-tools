---
quick_id: 261118-a5k
status: complete
commit: 860348b
branch: dhc-auto-distance
---

# 261118-a5k Summary

On branch dhc-auto-distance (from main, independent of dhc-auto-frame and dhc-distance-shared). The separate cylinders' distance is no longer the viewer's: the Distance slider is hidden and dhcAutoView, called by drawDhCyl before the layout, sets dhc.cylApart to twice the farthest reach from an axis plus a 12-unit gap. That reach is the larger of the floor's (its rings, counted as for the exchange's last step, plus a ring for the ⋯ marks; none for an Infinite floor) and the raw results' (the farthest raw result over the whole exchange), plus an 8-unit pad, all in the layout's radius units, so it does not change during playback or as the cylinders turn. dhcAutoView then works out, for the current tilt, the largest zoom at which that drawing fits in the picture with an 8-unit margin (dhc.zoomCap), lowers the zoom to it when needed (a wider distance zooms out by itself), and keeps the position within the room that leaves it all in sight (dhcClampPanTo). The zoom pill's + and 100% stop at the cap; its slider reaches down to 5%.

Checked in headless Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3, Per frame, Separate, floor with rings as far as all the steps reach, last step): distance 521, zoom 70%, no piece (floors included) outside the picture, the floors clear of the middle; the same with raw results on and after turning; + disabled at the cap.
