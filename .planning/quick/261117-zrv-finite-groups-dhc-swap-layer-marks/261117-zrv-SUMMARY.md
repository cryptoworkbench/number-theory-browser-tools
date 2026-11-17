---
quick_id: 261117-zrv
status: complete
commit: c7c21a8
---

# 261117-zrv Summary

From MANUAL_REVIEW_SCREENSHOTS/"Cyclic Groups:  DH cylinder THE BEADS IN RED CIRCLES SHOULDN'T BE THERE.png" (g = 7, a = 2, b = 3, Per hop, Separate, Per computer): the swap slice showed a lone dot for A in Alice's cylinder and for B in Bob's. Those were the step-3 'pub' marks, drawn in every cylinder, left without their beads since 261117-zps kept only the landing beads there. drawDhCyl now works out, per cylinder, the beads the swap's links land on (landed) and, on Per hop's swap slice (swapOnly), draws only those beads and marks.

Checked in Chrome with the screenshot's settings: layer 2 shows B in Alice's cylinder and A in Bob's, each where its dashed line lands, nothing else.
