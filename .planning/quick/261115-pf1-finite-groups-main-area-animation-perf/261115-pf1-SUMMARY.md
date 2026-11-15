---
quick_id: 261115-pf1
status: complete
commit: 7c91a45
branch: perf-main-area-animation
---

# 261115-pf1 Summary

Measured (headless Chrome with GPU compositing via ANGLE, 1345×896, 9 s of the scenario, rAF frame times):

| | fps | median frame | p99 | worst |
|---|---|---|---|---|
| main | ~34 | 33 ms | ~440 ms | ~480 ms |
| branch | ~45 | 16.7 ms | ~190 ms | ~215 ms |

Root causes found: (1) ~190 `.fs-win-body.is-ring:has(> …)` style rules made every element added to or removed from the ring svg cost ~9 ms of style recalc (micro-benchmark: 8.9 ms → 2.4 ms after replacing them with body classes at equal specificity); (2) the slow arrow replaced its head element every frame; (3) getCTM in identityAxis forced a layout every spin frame; (4) a turn rebuilt and re-measured everything (arrow key, lines under the ring, title/formulas, wheel fit, reach).

Remaining cost: the full redraw at each new k (real content change) and the layout/paint of the new drawing. Next candidates: keep the congruence wheel in a persistent layer outside the rebuilt ring group; rebuild arrows incrementally.

Regression check: screenshots of wheel, no wheel, zoom, isomorphism pane, a ∗ b card, aᵏ after an animated run with turns, button turns, detached window, light theme — identical to main or differing only by sub-threshold anti-aliasing; no page errors.
