---
quick_id: 261116-pzs
mode: quick
branch: smooth-zoom-fit
---

# 261116-pzs: stop button for slow arrows, Space shortcut, lit fit switch

1. #combine-stop (pause icon) right after .combine-seg, shown while slowRun or abAnim (watchSlowStop, rAF watch started with each run); slowAbort: wheelWalk++, slowStop() for aᵏ, abAnim cleared + redrawRing for a ∗ b.
2. Space (capture-phase keydown) triggers slowAbort while the button shows, except in text fields.
3. #zoom-fit joins the .ring-corner key-corner pressed rule (it sits inside .zoom-wrap, so the child selector missed it).
