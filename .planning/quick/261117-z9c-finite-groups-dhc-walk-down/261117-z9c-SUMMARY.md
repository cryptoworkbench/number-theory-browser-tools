---
quick_id: 261117-z9c
status: complete
commit: 1a6b9b2
---

# 261117-z9c Summary

Time cylinder, Slow arrows, congruence wheel floor with raw results on: a hop out to a raw result now walks down as slow aᵏ does on the ring. After the line reaches the raw result, the floor cell under it (ring q of the residue's wedge) lights and the lit cell steps in ring by ring (wheelWalkStep/wheelWalkMs timing) to ring 0, while the reduction line grows behind the head diving down it (slowDive, the head in each cell's middle as it lights). The bead then flashes as .bead-reduced does (three blinks over 1.5 s). Lit cells and the flash are driven by the growth clock (dhcWalkRig/dhcWalkApply), so they survive redraws. A hop's slot is as long as its slowest chain (growth + walk + head drop). New CSS: .dhc-wheel-lit, .dhc-reduced.

Checked in Chrome on ⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3, Per hop, rings "as far as all the steps reach", page clock slowed 10× (the window was occluded, rAF at 1/s): Alice's 8·2 = 16 lights the floor cell 16, then cell 3, then bead 3 flashes; no console errors.
