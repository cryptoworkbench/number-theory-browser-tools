---
quick_id: 261117-zak
status: complete
commit: 1f39e77
---

# 261117-zak Summary

Switching the time cylinder from Separate + Per variable to Shared first jumped the pieces to Per computer and then closed the cylinders: during the Shared / Separate morph (dhcLayoutNow draws the split layout eased to one), dhcByVariable() already read dhc.cyls === 'shared' and returned false. In the one cylinder both owners draw alike, so the two ways end the same. dhcByVariable() now also holds while dhc.cylMorph runs, so the cylinders close straight from Per variable (and part straight into it going back to Separate); the swap links already follow dhc.follow in dhcLayoutSplit.

Checked in Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3, Per frame, step 4, clock slowed): mid-morph the swap links stay vertical as in Per variable.
