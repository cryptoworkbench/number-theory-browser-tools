---
quick_id: 261117-zbp
status: complete
commit: 1e67ad9
---

# 261117-zbp Summary

The user saw the time cylinder's walk down (lit floor cells) only in the last step. Every step builds the walks (checked: step 2 of ⟨ℤ/13ℤ, ×⟩, g = 2, a = 5 lights cells 16 and 3 in Per hop, Per frame, polygon and stacked polygons alike), but Play advances every DH_PACE (1.7 s) while a slow step can last longer: a = 5's reducing hop only starts at ~2.1 s, so step 3 cut it off and drew it whole. The last step has no next step, so its walks always finished.

Fix: toggleDhPlay's tick waits for dhcGrowLeft() (the growth under way, walks and flash included) plus DH_GROW_REST (500 ms) before stepping. Checked with Play: step 2 → step 3 now 4.6 s (was 1.7 s); the short swap step still advances after ~1.7 s. Manual Step mid-growth still cuts the growth short (the user's own click).
