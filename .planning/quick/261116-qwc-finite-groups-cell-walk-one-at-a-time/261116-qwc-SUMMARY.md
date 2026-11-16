---
quick_id: 261116-qwc
status: complete
commit: 78a0ae1
branch: smooth-zoom-fit
---

# 261116-qwc Summary

Headless Chrome, ℤ/12ℤ with the wheel: a double-clicked cell's walk lit 10 cells in turn, never more than one at once, none left afterwards. No page errors. Same timers and DOM work as before, fewer lit paths on screen at once.

Follow-up (33bcfb2): the flag is gone — every walkWheelCell caller (double tap, Ctrl + R, slow aᵏ, slow a ∗ b) lights one cell at a time. Slow aᵏ (ℤ/26ℤ, ×, a = 15, k 1 → 5): 34 cells lit, never more than one at once, none left.
