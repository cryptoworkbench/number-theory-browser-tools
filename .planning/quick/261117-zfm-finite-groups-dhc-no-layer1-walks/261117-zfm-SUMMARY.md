---
quick_id: 261117-zfm
status: complete
commit: 06e43a3
branch: dhc-rise-walks
---

# 261117-zfm Summary

On branch dhc-rise-walks, after 261117-zeh. Per frame no longer draws the walks to A and B as chords on layer 1 (dhcTimelineFrame drops walk(1, …)); the rises up to layer 1 carry everything they showed. drawDhCyl's riseWalk draws each hop of a rise as its own piece: a line (its chord, or out to its raw result over the floor), reduce's dashed way back with its floor-aligned raw label and, with slow arrows, its walk down the floor (dhcWalkRig), the head halfway along (Hops depicted as arrows) and the hop number (Hop numbers). Each hop is its own chain (hop h), so slow arrows grow the rise hop by hop with heads riding the tip, Alice's and Bob's side by side; the rise/knots machinery of 261117-zeh is gone. dhcWheelRings counts the rises' raw results. English tooltip dhCylPerFrameTip updated (other languages keep the old wording).

Checked in Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3, raw results on): step 2 has no layer-1 chords, the rise carries numbers 1–5, heads and raw 16; slow: hops grow in turn, cells 16 then 3 light during the dashed return; step 4's layer-2 walks unchanged; no console errors.
