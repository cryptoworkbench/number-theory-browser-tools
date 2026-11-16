---
quick_id: 261116-ozr
mode: quick
branch: smooth-zoom-fit
---

# 261116-ozr: Finite Groups smooth ring zoom and Keep every arrow in sight

Planned and executed inline (the orchestrator already held the zoom/render analysis).

1. Finer ladder: RING_ZOOMS 0.25–4, ~10% apart, keeping old link values; slider max 23.
2. Gesture preview: slider input, wheel bursts (40px per step, remainder carried) and +/− scale ring svg + wheel/frost/paths/combo hosts by CSS transform about the view box's fixed point; one render() when the gesture settles (160 ms / slider change); the settle render replaces the preview without an ease.
3. Fit switch (#zoom-fit): rawReach records every raw-result cell (walks, aᵏ, a ∗ b) by ring q and element; fitRingZoom picks the largest ladder zoom ≤ 100% keeping each cell's outer edge inside ringWheelClip, from ringLayerMap and the render's view (no layout reads); queued as a microtask after render, redrawing only when the target differs. Manual zoom turns it off; persisted under cyclic-groups-zoom-fit. English-only zoomFit key.

Verify: headless Chrome (playwright-core) — no page errors; fit 100%→75% for (ℤ/13ℤ)* ×6 with raw results; preview vs drawn geometry identical; in-page wheel burst 1 redraw vs 5 on main.
