---
quick_id: 261116-rbw
mode: quick
branch: smooth-zoom-fit
---

# 261116-rbw: Zoom with the scroll wheel lit while on

Add #zoom-wheel[aria-pressed="true"] to the corner buttons' pressed rule (it sits inside .zoom-wrap, out of the .ring-corner > child selector). zoomWheelOn is only toggled by its own click, so − / + never turned it off.
