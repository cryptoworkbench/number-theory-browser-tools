---
quick_id: 261117-zdt
status: complete
commit: fe88d08
branch: dhc-rise-with-walk
---

# 261117-zdt Summary

On branch dhc-rise-with-walk. Time cylinder, slow arrows, Per frame, step 2: the threads rising from layer 0 to layer 1 (hop 0) grew first, the walks' chords on layer 1 (hops 1…) after. Now a rising thread (chain.rise: a thread piece of hop 0) takes no slot: it grows from the step's start over the whole of its owner's walk (chain.grow = the latest arrival of that owner's hop chains), reaching layer 1 as the walk's last hop arrives; Alice's spans her a hops, Bob's his b. Chains carry their owner, and the per-chain growth time (c.grow, SLOW_GROW otherwise) replaces SLOW_GROW in dhcGrowApply and dhcWalkApply.

Checked in Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3): chords start at 0; Bob's thread finishes ≈1.8 s, Alice's ≈3.3–3.8 s with her last chord.
