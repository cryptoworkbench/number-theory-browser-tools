---
quick_id: 261103-fls
status: complete
branch: fixed-logarithm-fixed-text
commit: 4348482
---

# Summary: Fixed logarithm with fixed text

6563b3f (cherry-pick of 9279078) + 4348482 on `fixed-logarithm-fixed-text`: drawFlog takes the ring's
parent and puts the label after the ring at polar(T); no counter-rotation. Verified in Chrome
(ℤ/19ℤ×, arranged by powers of 2, auto-rotate): text stays put, k counts 14, 15, 16 as beads
6, 12, 5 land.
