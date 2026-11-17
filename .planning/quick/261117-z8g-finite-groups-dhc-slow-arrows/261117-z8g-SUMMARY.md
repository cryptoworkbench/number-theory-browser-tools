---
quick_id: 261117-z8g
status: complete
commit: 0872843
---

# 261117-z8g Summary

Slow arrows for the Diffie–Hellman time cylinder, like slow aᵏ / a ∗ b on the ring. The cylinder's right-click menu gains an Arrows heading with Instant / Slow (reusing combineArrows* keys; stored under `cyclic-groups-dhc-slow-arrows`). With Slow, a step's new pieces no longer fade in: each hop's lines (thread pieces, chords, reduction lines, swap links, uses) grow along their path, SLOW_GROW each, hops one after another (Alice's and Bob's side by side); with Hops depicted as arrows, the head rides the tip and then drops onto the chord's middle (slowPlaceHead/slowDropHead reused). Rims and beads fade in as their hop starts, marks/dots/numbers/raw results as it arrives. The growth survives redraws (turning, zooming) at the same step (dhc.growAnim). Reduced motion keeps the fade.

Checked in Chrome on ⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3: Per hop threads grow slice by slice; Per frame thread then chords 1–5 grow in order, heads riding and dropping; no console errors.
