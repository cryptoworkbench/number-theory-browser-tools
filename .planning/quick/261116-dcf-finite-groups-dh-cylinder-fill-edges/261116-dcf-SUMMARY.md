---
quick_id: 261116-dcf
status: complete
---

# 261116-dcf summary: the filled time cylinder window, edge to edge

## Changed
- `dhcFill` sizes and places the filled window on the room's own edges, without the 8 px margins and without rounding its size.
- `syncDhcFill` sets `is-filled` on the window while it is filled; `.fs-win-body.is-ring > .dhc-plot.is-filled` has square corners.

## Verified
- 1345×896: the window is at x 0 to 1345 and y 135.2 to 863.6, the body being 0 to 1345, the last top row ending at 135.2 and the bottom bar starting at 863.6.
- 1000×700: x 0 to 1000 and y 168.8 to 667.6, again exactly the body's sides, the row's bottom and the bar's top.
- Unfilling, closing and a grip drag still restore or drop the filled state (`dhcFill(false)`, `dhcDropFill`), which clear the class through `syncDhcFill`.
