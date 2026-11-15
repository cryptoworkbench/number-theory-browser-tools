---
status: complete
quick_id: 261115-fm2
date: 2026-11-15
commits: [f3d01dd, 1034a02, c38b2aa]
---

# 261115-fm2: shared forward/backward path stretches green

- markSharedWalks (called at the end of ring.redrawWalks) parses the drawn polylines of .walk-el and .walk-inv (chords, outer arcs, raw-hop spirals and dashed reductions), finds forward stretches within 0.35px of the backward path for at least 16px (grid-binned segments), and draws them in a .walk-shared group over both, stroke --arrow-both, dashed for reductions.
- On the ring the two paths are always on opposite sides, so the overlaps that occur are the wheel's reduction lines both paths make from the same cell (e.g. ℤ/12ℤ, a = 5: 12→0 … 16→4 green, 17→5 and 18→6 stay blue). The first try at 1.1px/8px also marked shallow spiral/arc crossings; tightened.
- Verified in Chrome: additive ℤ/12ℤ a = 5 and multiplicative ℤ/13ℤ a = 2 with both raw-result switches on, also after turning the ring; no console errors.

## Follow-up (1034a02)

- Shared dashed stretches: round caps like .chord and stroke-dashoffset from the forward line's start, so the green dashes cover the yellow/blue ones exactly (before, butt caps left coloured fringes).
- Zoom: ringWheelFill multiplies the far-corner distance by the zoom factor when zoomed in, so ringWheelDepth never drops below the unzoomed depth and no raw hop falls back to a plain hop (at 3x, depth had dropped to 1 and every spiral/reduction vanished). Verified at every zoom 0.5–3: forward 11, backward 19, reductions 17, shared 5 paths throughout; no console errors.

## Follow-up 2 (c38b2aa)

- The user's screenshot (MANUAL_REVIEW_SCREENSHOTS/Cyclic Groups: 1.png, ℤ/26ℤ× a = 23) showed the real problem: forward and backward reductions from different cells (e.g. 529 and 289) to the same bead share only the inner stretch, and each counted its dashes from its own cell, so their dashes were out of phase. drawRawHop now draws the reduction from the bead out (dashes anchored at the bead); markSharedWalks' offset then counts from the bead too; slowRig/slowApplyCell swap the parsed ends and set stroke-dashoffset to the tip's distance from the bead while the dive grows.
- Verified: ℤ/26ℤ× a = 23 at 200%, bead 25's ray: green dashes bead→51 then yellow beyond in the same rhythm; Slow aᵏ dive grows cell→bead with offset falling to 0.
- The zoom issue the user still sees is not addressed in this commit (user asked to focus on the dashes first).
