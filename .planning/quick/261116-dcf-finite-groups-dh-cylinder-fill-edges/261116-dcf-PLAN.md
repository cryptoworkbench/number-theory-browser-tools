---
quick_id: 261116-dcf
type: quick
---

# 261116-dcf: the filled time cylinder window, edge to edge

The Diffie–Hellman time cylinder's fill button left an 8 px gap on every side. Filled, the window should touch the Ring window's left and right edges, the bottom of the lowest top control row and the top of the bottom control bar.

## Task
- `dhcFill`: drop the 8 px margins and the rounding of the size, so the window spans `boxOf(body).left` to `workRight(body)` and `topRowsBottom(body)` to `plotFloor(body)`.
- While filled, the window has square corners (`.dhc-plot.is-filled`), so its corners meet the edges too.

## Verify
- Measure the filled window's box against the body, the last top row and the bottom bar at 1345×896 and 1000×700.
