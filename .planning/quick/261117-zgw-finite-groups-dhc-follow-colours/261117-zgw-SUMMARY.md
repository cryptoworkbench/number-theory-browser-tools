---
quick_id: 261117-zgw
status: complete
commit: 92a4770
branch: dhc-rise-walks
---

# 261117-zgw Summary

On branch dhc-rise-walks. Switching Separate's Per variable ↔ Per computer, layer 2's walks to K swapped colours at once and then slid across, ending in the wrong colours: a mixed walk's first hop takes is-by-alice / is-by-bob from its owner, and dhcFollow moves a walk to the other cylinder by changing its owner. Now dhcFollow's moved() keeps maker (who made it) and the first-hop class uses maker || owner (lines and threads), so the colour stays with the walk and the slide carries it across.

Checked in Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3, Per frame, step 4): is-by-alice first hops go from cylinder 0 to 1 and back, is-by-bob from 1 to 0, colours unchanged.
