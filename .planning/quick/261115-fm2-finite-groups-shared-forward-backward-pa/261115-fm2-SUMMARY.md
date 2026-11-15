---
status: complete
quick_id: 261115-fm2
date: 2026-11-15
commits: [f3d01dd]
---

# 261115-fm2: shared forward/backward path stretches green

- markSharedWalks (called at the end of ring.redrawWalks) parses the drawn polylines of .walk-el and .walk-inv (chords, outer arcs, raw-hop spirals and dashed reductions), finds forward stretches within 0.35px of the backward path for at least 16px (grid-binned segments), and draws them in a .walk-shared group over both, stroke --arrow-both, dashed for reductions.
- On the ring the two paths are always on opposite sides, so the overlaps that occur are the wheel's reduction lines both paths make from the same cell (e.g. ℤ/12ℤ, a = 5: 12→0 … 16→4 green, 17→5 and 18→6 stay blue). The first try at 1.1px/8px also marked shallow spiral/arc crossings; tightened.
- Verified in Chrome: additive ℤ/12ℤ a = 5 and multiplicative ℤ/13ℤ a = 2 with both raw-result switches on, also after turning the ring; no console errors.
