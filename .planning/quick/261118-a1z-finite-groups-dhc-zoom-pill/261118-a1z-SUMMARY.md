---
quick_id: 261118-a1z
status: complete
commit: 2769e87
---

# 261118-a1z Summary

The time cylinder's corner row had separate − and + buttons. They are now a zoom pill like the ring's bottom bar (.zoom-ctl): − (#dhc-zoom-out), a slider (#dhc-zoom-slider, over the zoom's logarithm from DHC_ZOOM_MIN 0.4 to DHC_ZOOM_MAX 8), + (#dhc-zoom-in) and the percentage (#dhc-zoom-pct, .zoom-reset), which sets 100% when clicked, as does a double click on the slider. syncDhcZoom (called by drawDhCyl) keeps the slider, the percentage and the end buttons' disabled state in step with every zoom (wheel, keys, buttons, reset). Existing strings only (zoomLabel, ctxZoomOut/In, zoomReset).

Checked in headless Chrome: start 100% (percentage resting); slider to ln 2 → 200%; + → 250% with the slider following; percentage click → 100%; the pill draws as the bottom bar's.
