---
quick_id: 261109-f7f
status: complete
commit: 9d4a31f
---

# Summary

- The swap button starts a 700 ms carousel: copies of the two rings in a fixed overlay; the left
  copy swings across in front (up to 112%), the right one behind (down to 80%, dimmed to 50%),
  each sized from its own pane's ring to the other's.
- The text and controls keep their values until the copies arrive; then the swap runs. The left
  side snaps at once, and the right side keeps the old frame (ring hidden, copy over it) until the
  new frame loads (about 300 ms in testing). No blank pane.
- Reduced motion: an instant swap as before. A timer finishes the turn if animation frames are
  held back; if the pane doesn't answer within 400 ms the swap happens without animation.
- Verified in Chrome (positions sampled through the turn, the handoff, the old frame held to
  within 1 px, no console errors). Three new i18n literal findings are internal id strings
  (false positives).

## Revision (c2bd0d4): flip instead of carousel

The user wanted option 1, a flip. The two copies now flip over together like one coin about the
dividing line, as a ring flips (flipRing): squashed across the line by |cos θ| with
easeInOutCubic over FLIP_MS (700 ms), sinking by FLIP_SINK at mid-turn; up to edge-on each ring
stands on its own side, then opens out on the other side at the place of the ring it trades with,
never seen reversed. The snapshot, hold-the-old-frame and snap logic is unchanged. Verified in
Chrome: sampled boxes (inner edges stay at the axis x ≈ 761, width → 0 at mid-turn), a frozen
mid-turn screenshot, clean landing, no console errors.
