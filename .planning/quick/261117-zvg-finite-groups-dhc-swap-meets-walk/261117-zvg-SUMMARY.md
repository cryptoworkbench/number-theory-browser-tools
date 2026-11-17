---
quick_id: 261117-zvg
status: complete
commit: 96dc8d1
branch: dhc-swap-meets-walk
---

# 261117-zvg Summary

On branch dhc-swap-meets-walk. Per frame: the swap's dashed lines (step 3) land on the end of the receiver's first hop to K, but that hop grew only at step 4. The walks to K now take their first hop (e ∗ B = B, the number received entering the walk) with the swap: toK's piece is step 3 and its via carries rest: 4; riseWalk draws hop 1 at step 3 as a hop-0 chain, so it grows in the same slot as the links and both arrive together, and hops 2… at step 4 (lanes, synced as before; laneArrive now starts at a lane's first hop). The dot on K waits for step 4.

Checked in Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3, slow, Separate, Per computer): at step 3 the 2 links and 2 first hops both settle at 511 ms; step 4 adds the other 11 rise pieces, Alice and Bob reaching K at 7688 ms; no console errors.

## Follow-up (20c6c88): the swap's speed

The pair grew in SLOW_GROW (520 ms) while on main a walk's first hop took its synced lane's time, the shorter walk's stretched (Bob's ≈1.07 s for a = 5, b = 3). riseWalk now gives the early hop a plan (each hop's own time in its walk, walks down included) and meetKey (the number it receives); the link landing on it gets meet (the number it carries). dhcGrowStart works out, as the synced lanes would, how long each walk's first hop lasts (plan[0] + its stretch) and gives that time (dur) to the early hop and its link.

Checked in headless Chrome over CDP (the extension was disconnected): B's line and Alice's first hop settle at 520 ms, A's line and Bob's first hop at 1069 ms.
