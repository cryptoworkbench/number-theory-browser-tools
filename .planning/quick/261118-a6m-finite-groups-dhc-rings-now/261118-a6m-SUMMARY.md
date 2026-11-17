---
quick_id: 261118-a6m
status: complete
commit: 5a33497
branch: dhc-rings-now
---

# 261118-a6m Summary

On branch dhc-rings-now (from main, after the automatic distance of 261118-a5k). The congruence wheel floor's Rings dropdown (Manually / As far as the steps so far reach / As far as all the steps reach / Infinite) and its number field are removed with their storage keys, handlers, dhcWheelDepth and dhcWheelFill: the floor always has exactly as many rings as the hops shown so far reach out to before reduction (dhcWheelRings(G, tl, upTo), upTo the step on show). A rise carrying a walk now counts each hop from the step it is drawn at (with via.rest, all but the first at rest), so step 3's first hops to K do not bring in step 4's rings. The automatic distance and zoom (dhcAutoView) size for the floor at the exchange's last step, so the view stays put while the floor grows. The Rings dictionary keys are left unused.

Checked in headless Chrome (⟨ℤ/13ℤ, ×⟩, g = 2, a = 5, b = 3, Per frame): no dropdown; floor rings by step 1, 1, 2, 2, 8; distance 521 and zoom 70% throughout.
