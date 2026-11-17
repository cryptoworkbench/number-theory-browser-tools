---
quick_id: 261117-z7m
status: complete
commit: 2f6731a
---

# 261117-z7m Summary

The minimized aᵏ (or a ∗ b) card's task in the bottom bar flickered during a slow aᵏ with Keep the result on top: each step turns the ring, and a redraw for a turn alone keeps the lines drawn last; minimized, there were none (placeCombineCard had removed them), so the task was dropped, and the next step drew the lines again and brought it back, rebuilding the whole bar each time.

Fix: while minimized the lines are not drawn at all (drawNecklace's `linesMin`), and placeCombineCard gets `due` (lines would be drawn: combineRoles(G).size && comboLive(G)) so the task stays as long as there is a combination to bring back. Restoring it redraws the ring in full, which draws the lines.

Checked in the user's Chrome: task present and the bar unchanged (0 mutations) from k = 16 to 21. Frame times not measured: the window was in the background (rAF ~1/s). Perf log updated.
