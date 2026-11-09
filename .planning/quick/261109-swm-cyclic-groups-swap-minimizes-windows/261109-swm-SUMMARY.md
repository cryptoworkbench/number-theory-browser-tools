---
quick_id: 261109-swm
status: complete
commit: 246be6b
---

# 261109-swm summary

minimizeWindows clicks SWAP_MIN_BTNS whose section is shown and not docked, then hands the focus
back; startSwapSpin calls it and posts ringhost 'minwins', which the pane answers with its own
minimizeWindows. Docked plots stay docked; the Diffie–Hellman windows (close only) are left.
Verified in Chrome: ⟨ℤ/13ℤ, ×⟩ ≅ ⟨ℤ/12ℤ, +⟩ with polygon, Cayley table and formula settings open
on the left and polygon and Cayley table in the pane: all hidden 300 ms after the swap click,
tasks in the bar on both sides, the swap completes; no errors.
