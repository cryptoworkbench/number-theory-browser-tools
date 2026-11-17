---
quick_id: 261117-zuf
status: complete
commit: fea795e
---

# 261117-zuf Summary

Show raw results before reduction (time cylinder menu) switched the turns out over the floor on and off at once. Now flipping it calls dhcRawMorph, which redraws every frame for DHC_RAW_MS (700 ms, smoothstep) while dhcRawMix eases from the current value to the new one; drawDhCyl's excursion puts each turn at R + (q + ½)·ring·mix (ex.r), so it grows out of its bead or shrinks into it, the dashed way back shortening to nothing; riseWalk splits a hop's height by that radius; the raw label rides at ex.r with opacity mix. Reduced motion switches at once. Per hop's threads, which run round the surface without raw results, jump from the chord to the arc as the easing ends.

Checked in Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3, Per frame): off, labels fade 1 → 0 and the reduction lines shrink 22.1 → 0 over ~0.7 s; on, back again; no console errors.
