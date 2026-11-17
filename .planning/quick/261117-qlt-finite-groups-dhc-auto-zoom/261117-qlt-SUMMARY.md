---
quick_id: 261117-qlt
status: complete
commit: 849882f
branch: finite-groups-dhc-auto-zoom
---

# 261117-qlt Summary

On branch finite-groups-dhc-auto-zoom. The Cylindrical DH view's zoom is now the program's: always the largest at which the floors, cylinders and raw results fit (the cap dhcAutoView already computed). dhcZoomTo sets it: at once on opening, when zooming out (so nothing runs off) or with reduced motion; otherwise easing in (exponential, DHC_ZOOM_TAU = 120 ms). Removed: the zoom pill (−, slider, +, percentage) and its CSS, wheel zoom, dhcZoomAt/dhcZoomMid/syncDhcZoom, DHC_ZOOM_MIN/MAX and Reset's zoom = 1. + and − are still swallowed on the picture so they no longer reach the ring's zoom behind. The fit's "up" now counts the floor's far side (rMax·sin − (L/2 + floor gap)·cos), which rises above the cylinders at a steep tilt. English hint and Reset tooltip updated (en-only strings).

Checked in Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 7, floor on): at every step and in default/side tilts the drawing spans the width to the margin (12–796 of 808); top-down it spans the height (17–343 of 360); before the far-side fix top-down ran to y = −5.
