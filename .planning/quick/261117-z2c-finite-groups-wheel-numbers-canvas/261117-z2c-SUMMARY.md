---
quick_id: 261117-z2c
status: complete
commit: 7da315d
---

# 261117-z2c Summary

Regression check (headless, against 75b23bd):
- screenshots: mobile identical; wheel, raw results, upright-after-turn, turned and ring-window differ only by text anti-aliasing (same placement);
- blur copy 288 numbers, same attributes; lit copy same x, y, size, turn, text;
- PNG export 1476 numbers, same paint attributes; the swap/ring-window copy 2448 numbers, same as before;
- flips: numbers go into the ring as svg and back to the canvas; the ring-flip copy after turn and flip is the same as before;
- theme change repaints; :has() shim equivalence 0 diffs in two layouts; no page errors.

Performance: headless first step ~480-570 → ~330-480 ms with no long paint after; in the user's Chrome the zoom-out's main-thread work 372/468 → 350/288 ms (paint not measurable there, window occluded).
