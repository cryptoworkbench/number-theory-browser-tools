---
status: complete
quick_id: 261115-dz0
date: 2026-11-15
commits: [eeca211]
---

# 261115-dz0: Algebra window for the Extended Euclid animation

- A fixed, draggable, minimisable Algebra window (bottom sheet under 760px) opens on Run and closes on Exit.
- Lines appear with the beat that animates them, the current beat's lines highlighted and scrolled into view; bars coloured like the arrows. A click on a line pauses and jumps to its beat.
- Content: goal, invariant r = s·N + t·a, r₀/r₁; per step the division solved for the remainder (or the stop line), the t and s recurrences, r = s·N + t·a, the reduction t·a = r − s·N and r ≡ t·a (mod N); finale Bézout, inverse with check or the no-inverse argument, and the back-substitution chain.
- English only (new wheel.euclidPad* keys in en).
- Verification: pad-check.mjs (pad26, pad12, a 10-pair Bézout/back-substitution sweep, viewport shots) ALL PASSED in night and day; euclid-check.mjs regression ALL PASSED. Screenshots: /tmp/pad-viewport-{night,day}.png, /tmp/euclid-pad26-*-night.png, /tmp/euclid-pad12-finale-{night,day}.png.
