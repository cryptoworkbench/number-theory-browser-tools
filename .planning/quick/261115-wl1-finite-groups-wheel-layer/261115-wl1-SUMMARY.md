---
quick_id: 261115-wl1
status: complete
commit: 4eaf59b
branch: perf-wheel-layer
---

# 261115-wl1 Summary

Commits: 9eefd91 (wheel layer, compositor-turned), 81b3780 (slow step patches the ring in place, from perf-incremental-ring), 4eaf59b (slow step keeps the card's blur).

Measured (headless Chrome on this machine's GPU, 9 s of slow aᵏ with wheel, raw results, Keep the result on top): main 46–47 fps, p90 67 ms, p99 117–133 ms, frames over 50 ms 66–71; branch 58–61 fps, p90 50 ms, p99 100 ms, frames over 50 ms 39–43. Without turns 70 → 80 fps, frames over 33 ms 197 → 115.

Checks: screenshots of 17 states against main — identical without the wheel; with the wheel identical apart from the wheel numbers' grey (composited) anti-aliasing; PNG export markup byte-identical; patched steps DOM-identical to full redraws (ring, window, wheel layer, blur layer; 92 steps, ten configurations).

Rejected on the way: will-change on the wheel inside the ring svg (turns collapse to 6–9 fps); converting the remaining ~40 :has() rules (cost spread across all of them, interaction states at risk).

What remains: the GPU rasterizing the ring svg (beads, paths, labels) as arrows grow and the ring turns, and ~80 ms of style/layout per k step for the redrawn lines.
