---
status: complete
quick_id: 261115-eew
date: 2026-11-15
commits: [cb6cfe0, 31475eb, 17e7474, a7ad780]
---

# 261115-eew: Finite Groups aᵏ Slow arrows

- Arrows heading (Instant / Slow) in the aᵏ button's right-click menu; state.combineSlow, URL combineslow=1, shared with a linked pane.
- Engine (slowTo/slowNext/slowTick/slowApply): k climbs one step per arrow (520 ms grow + 260 ms head slide-back, 520 ms recolour); drawNecklace draws the hop in progress separately and slowRig hands it to the animator, so redraws mid-animation keep it.
- Raw (congruence-wheel) hops grow the same way; their reduction line and raw number appear once the spiral has grown.
- English only (combineArrows, combineArrowsInstant, combineArrowsSlow in en).
- Verified in Chrome over http://127.0.0.1: grow (head tip on the line's end), recolour (old colour under, new colour travelling, head/number switching), field locked while drawing, Enter-only typing, instant decrease, Instant mode unchanged; no console errors. Automated Chrome throttled rAF to ~6 fps, so smoothness was not judged there.

## Follow-up (31475eb)

- Slow mode: a growing arrow out to a congruence-wheel cell (raw aᵏ results on) lights that cell when its head arrives and walks it down to its bead (walkWheelCell, the double-tap animation); the next arrow waits for the walk. Extra time per such arrow: max(0, (q+1)·min(260, 2600/(q+1)) − 260) ms for a cell q rings out: +260 ms (q=1), +520 ms (q=2), up to +2340 ms (q≥9). Arrows ending on a bead are unchanged.

## Follow-up 2 (17e7474)

- A hop out to a cell: spiral grows (520 ms); the cell walk starts as the head arrives and the dashed reduction line grows inward with it, the head at its tip in each cell as that cell lights and at the bead with the halo; then the head returns up the line and along the spiral to the middle (SLOW_BACK_CELL 420 ms). Such an arrow now takes 520 + (q+1)·min(260, 2600/(q+1)) + 420 ms: 1.46 s for q=1, 1.72 s for q=2, 3.54 s at the 2.6 s cap (a plain arrow 0.78 s).
- Verified with rAF replaced by a 16 ms timer (the automated tab throttled rAF to ~1 fps): head at the reduce-line tip at 528/788/~1050 ms matching the lit cells and halo, home by ~1440 ms; no console errors.

## Follow-up 3 (a7ad780)

- The head no longer rides back: at the destination it fades out (first ~35% of SLOW_BACK, now 300 ms) while a head at the path's middle fades in and shrinks from 2.6× onto its place (slowDropHead). SLOW_BACK_CELL removed. Plain arrow 0.82 s; arrow out to a cell 520 + walk + 300 ms (1.34 s for q=1, 1.60 s for q=2, 3.42 s at the cap).
- Verified (rAF swapped for a 16 ms timer): tip opacity 1→0, drop opacity 0→1 with scale 2.6→1, landing on the drawn arrow's head position, for a plain hop and a cell hop.
