---
quick_id: 261115-sp1
status: complete
commit: 156fda6
branch: perf-animation-spikes
---

# 261115-sp1 Summary

Found: each slow-arrow step redrew the whole ring twice in one frame (slowTick then slowNext → combineScalar); a k step or a turn rebuilt and measured parts it does not change (formula head, arrow key, wheel fit, subgroup rows); a viewBox reset fired the cluster observer's 20 ms layout; the overlap check measured the drawing's reach even over the wheel, where it is not needed.

Interleaved runs (three pairs, machine under varying load): tasks > 50 ms 4.0–4.7 s on main vs 1.6–3.0 s; mean long task 125–155 vs 86–99 ms; worst 297–428 vs 114–215 ms; p99 frame 333–400 vs 133–233 ms.

Screenshots of 13 states (wheel, no wheel, zoom, isomorphism pane, pane with turns, a ∗ b card, aᵏ after a slow run with and without the wheel, Keep the result on top, button turns, auto-shift turns, detached window, light theme) match main; one zoom difference in the row buttons' frost did not reproduce in three reruns.

What remains per k step (~90 ms): drawing the new ring (~35 ms of script), its first layout (~20 ms) and a few style recalcs for the lines under the ring; the GPU is busy rasterizing in headless runs regardless of content.
