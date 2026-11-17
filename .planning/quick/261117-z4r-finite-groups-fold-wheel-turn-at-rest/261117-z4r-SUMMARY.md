---
quick_id: 261117-z4r
status: complete
---

# 261117-z4r Summary

Diagnosis (user's Chrome, result on top, 10 s windows once settled, k ≥ 15):
- identity on top 600 frames / 0 slow (> 25 ms); result on top 536 / 63.
- Not script: slowApply 0.5 ms a frame, main thread busy 8.8 ms (p90 14.6).
- Slow frames are single 33 ms frames through the arrow phase with the ring at rest (54 of 83), not during turns (5) — the GPU just over budget.
- Not the angle: a ring held at the same angle by `rot` (layers drawn at it) runs 598 / 1.
- It is the layers left turned by the compositor after each turn (a wheel kept through a turn, `wheelTurnOffset`). Interleaved hide tests (5 × 1.5 s each): number canvas (3198² px) hidden 10 slow vs 59 base; wheel svg 22 vs 56; frost, combo, paths, lit no effect. Wheel svg's rotation alone removed: 34 vs 56.
- Misleading on the way: idle-page rAF rates (an idle page measured 40–50 fps even at rot 0), single non-interleaved windows (drift 95→158 frames within 30 s).

Fix: `foldWheelAtRest` — 150 ms after the last turn of the wheel's layer (timer in `turnWheelLayer`), with the ring at rest (`ringAngleNow` 0, no spin, wheel not in the ring), `foldWheelTurn()` writes the layer's turn into the wheel's group (clip turned back, lit group too), the blur's copy is turned by the same amount on top of its own (foldWheelTurn's copying of the wheel's transform is wrong for a copy built later in its own frame: measured 31–135 px off), the layers stand straight (`turnWheelLayer(0)`) and the canvas is painted again at the new turn.

Checks: positions of wheel cells, lit cells and blur-copy elements measured inside the fold, before vs after, over 7 folds: < 0.005 px. Card clip/ground are zero-size in layer mode (the HTML window clips). Screenshots at rest: numbers centred in cells, card blur aligned. No page errors.

Performance, user's Chrome, result on top, alternated: HEAD 564/36, 530/68 vs new 569/15, 565/18 (frames / slow per 10 s).
