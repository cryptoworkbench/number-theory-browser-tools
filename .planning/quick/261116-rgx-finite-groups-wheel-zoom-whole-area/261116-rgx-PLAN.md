---
quick_id: 261116-rgx
mode: quick
branch: smooth-zoom-fit
---

# 261116-rgx: scroll-wheel zoom over the whole main area

zoomWheelAt(t): ring svg or its window body itself. The zoom listener moves to the body; the two window-level wheel handlers (arrangement stepping, subgroup/expression stepping) defer to it with the same test. The pane's switch updates aria-pressed when the shared settings set it.
