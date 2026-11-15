---
status: complete
quick_id: 261115-eew
date: 2026-11-15
commits: [cb6cfe0]
---

# 261115-eew: Finite Groups aᵏ Slow arrows

- Arrows heading (Instant / Slow) in the aᵏ button's right-click menu; state.combineSlow, URL combineslow=1, shared with a linked pane.
- Engine (slowTo/slowNext/slowTick/slowApply): k climbs one step per arrow (520 ms grow + 260 ms head slide-back, 520 ms recolour); drawNecklace draws the hop in progress separately and slowRig hands it to the animator, so redraws mid-animation keep it.
- Raw (congruence-wheel) hops grow the same way; their reduction line and raw number appear once the spiral has grown.
- English only (combineArrows, combineArrowsInstant, combineArrowsSlow in en).
- Verified in Chrome over http://127.0.0.1: grow (head tip on the line's end), recolour (old colour under, new colour travelling, head/number switching), field locked while drawing, Enter-only typing, instant decrease, Instant mode unchanged; no console errors. Automated Chrome throttled rAF to ~6 fps, so smoothness was not judged there.
