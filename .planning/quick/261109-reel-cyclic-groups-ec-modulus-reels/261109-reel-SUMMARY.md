---
quick_id: 261109-reel
status: complete
commit: ae320ba
---

# 261109-reel summary

openEcReels builds (once) a fixed overlay (.ec-reels, in the full-screen element) with two
makeReel drums: EC_REEL_ITEMS = 1 and the primes 5…97, drawn as a 3D drum (rotateX + translateZ,
fading with the angle), wrapping round, under a payline. Drag turns a reel (speed capped at
REEL_VMAX, running on and settling on an item; held still before release it settles at once),
the wheel steps one item per notch (small touchpad deltas add up), arrow/Page keys step too.
syncEcReelsSum writes a × b = n and a note: prime, product of two primes, a square, no modulus a
curve takes, or a modulus the current curve (a, b) gives no group for. closeEcReels (button,
Enter, Escape, a click beside the card) applies n through typedCurve only when ecValid(n, a, b),
else keeps the modulus. Opened only in curve mode with the group not locked. Page-wide wheel,
arrow, space and +/− handlers skip .ec-reels so the ring underneath stays put.
Verified in Chrome: opens on 1 × 17, wheel and drag turn the reels, 5 × 17 = 85 flagged for
a = 2, b = 2, 1 × 13 applied on Enter (curve 13,2,2), focus back on the modulus; no errors.
