---
quick_id: 261117-zjb
status: complete
commit: 61ebc86
---

# 261117-zjb Summary

Per frame, slow arrows, step 2: hop h of Alice's and Bob's rises grew together, so with a ≠ b the one with fewer hops reached its public number first (the still picture already has both reach layer 1 together, each walk sharing the height among its own hops). The walks to A and B now carry via.sync; riseWalk puts their hop chains in a lane per owner, and dhcGrowStart runs each lane's hops one after another and stretches the shorter lane's growth (c.grow, c.reach += extra per hop) so both lanes' last hops land at the same moment T; hop-0 'after' pieces (the marks on A and B) wait for T. A chain's hop number and raw label now show as that chain arrives (chain.after), not by hop index. The walks to K (step 4) are unchanged.

Checked in Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3, slow, raw results on): Alice's and Bob's rises settle at 4598 / 4599 ms; no console errors.
