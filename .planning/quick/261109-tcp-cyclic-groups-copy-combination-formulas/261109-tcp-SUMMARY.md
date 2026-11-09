---
quick_id: 261109-tcp
status: complete
commit: b78eda7
---

# 261109-tcp summary

The combination's lines under the ring are user-select:text; the ring's pointerdown ignores
presses on them or inside a line's box (the gaps between terms), so a drag selects. Each line
carries data-plain (combinePlain: cells joined by spaces, sup/hi parts as ^(…), lo as _(…)); a
capture-phase copy listener writes the touched lines' plain forms, one per line. The tooltip
rect over a ∗ b's powers line sits behind the text, its glyphs carrying the tip. The lines'
right-click menu ends with Copy these formulas (combineText, all lines). Verified in Chrome with
a real drag over the square-and-multiply lines (ring did not turn) and synthetic copies of aᵏ,
square and multiply and a ∗ b.
