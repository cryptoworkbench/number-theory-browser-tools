---
quick_id: 261116-ozr
status: complete
commit: a15c73a
branch: smooth-zoom-fit
---

# 261116-ozr Summary

- Zoom ladder: 24 steps, 25%–400%, old ?zoom= values kept.
- Gestures (slider drag, scroll wheel, +/−) preview by compositor transform and redraw once on settle. In-page burst of 8 wheel events 25 ms apart: main 5 redraws / 642 ms long tasks, branch 1 redraw / 120 ms.
- getScreenCTM ignores the svg's own CSS transform, so the settle render skips easeRingResize when the preview already shows the target zoom (verified: bead geometry identical before/after settle, no animation running).
- Keep every arrow in sight: (ℤ/13ℤ)*, element 6, raw results on → 75%; element 11 → 60%; back to 6 → 75%. Adds no redraws when the zoom stays (same viewBox mutation counts as main for bead clicks).

Known limits: "in sight" is the main area (ringWheelClip) with 8px padding, so a cell may sit under the expression card or the frosted control rows; the fit caps at 100%; with two rings zooming together only the holding ring's arrows count.
