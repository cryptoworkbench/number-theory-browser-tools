# Finite Groups: animation performance log

One record of every approach tried to make the main area's animations (slow aᵏ above all, slow a ∗ b, turns, zoom) cheaper, kept or rejected, with what was measured. **Read this before trying a new idea, and add to it after every attempt**, rejected ones included.

Detail per attempt lives in the quick task's SUMMARY.md (directory in brackets).

Benchmark scenario used since 2026-11-16: ⟨ℤ/37ℤ, ×⟩, a = 35, slow aᵏ to k = 36, wheel and raw aᵏ results on, Keep every arrow in sight on (zoom 25%).
- Measure in the user's real Chrome (Claude in Chrome on a `python3 -m http.server` localhost; it refuses file://). Headless numbers came out several times lower than the user's and hid problems: median frame 17–67 ms headless against 117–150 ms in the user's Chrome for the same code.
- Bead 35 is picked by a real click (a JS click does not pick it); a second click unpicks it.
- Tools: rAF frame gaps; `long-animation-frame` entries (forcedStyleAndLayoutDuration); CDP traces (devtools.timeline plus invalidationTracking and stack) for Layerize, Layout and UpdateLayoutTree with callers; hide one layer at a time and compare frame times.

## Kept

| Date | What | Effect | Commit [task] |
|---|---|---|---|
| 11-15 | ~190 `.fs-win-body.is-ring:has(> …)` rules replaced with body classes at equal specificity | insert/remove in the ring svg 8.9 → 2.4 ms of style | 7c91a45 [pf1] |
| 11-15 | slow arrow morphs its head (`morphEl`) instead of replacing it each frame; no getCTM in identityAxis per spin frame; a turn no longer rebuilds and re-measures everything | median 33 → 16.7 ms headless | 7c91a45, 156fda6 [pf1] |
| 11-15 | congruence wheel in its own svg layer, turned by the compositor | | 9eefd91 [wl1] |
| 11-15 | slow aᵏ step patches the ring in place (`ringKept`, `patchRingCombo`) | | 81b3780 [wl1] |
| 11-15 | slow step keeps the card's blur | | 4eaf59b [wl1] |
| 11-15 | paths (guide, cord, mirror axis, subgroup paths) in their own compositor-turned layer; card blur in a window on the card; a turn alone keeps the wheel (`wheelReused`) | spins: GPU raster 3.86 → 0.89 s | b39dc2e [rl1] |
| 11-15 | the combination (aᵏ walk, growing arrow, a ∗ b raw, halos) in its own layer (`#ring-combo-host`) | growing arrow rasters only that layer | 46a01b0 [rl1] |
| 11-15 | a turn alone keeps the paths layer (`pathsReused`) | | 2ad8209 [rl1] |
| 11-15 | lines under the ring measured in one layout (`fitLater`); card reach kept through a turn (`cardExtKept`) | | 649b6ef [rl1] |
| 11-15 | no backdrop blur where none shows (`::before` grounds at `none`, not `blur(0px)`) | | f6433af [rl1] |
| 11-16 | wheel numbers left as drawn: aᵏ numbers and % n turn with the ring; a turn keeps the combination layer | | cc02140, 85bd96a |
| 11-16 | zoom gestures preview by compositor transform, one redraw on settle | 8-event burst: 5 redraws → 1 | a15c73a [ozr] |
| 11-16 | **zooming out** redraws for real at most once a frame (the preview left bare background); zooming in keeps the preview | user request; costs a redraw per frame while zooming out | 6e98b81 |
| 11-16 | card blur: a static copy of the wheel without lit cells, refreshed on wheel redraw, instead of a live `<use>` | headless median 67 → 17 ms; did NOT fix the user's Chrome. See "live mirror" under Rejected: possibly a repeat | cf3f291 [u5w] |
| 11-16 | walk down: each cell lights at t0 + n·step, late cells skipped (setTimeout chain drifted behind the clock-driven diving head) | head and cell in step | cf3f291 [u5w] |
| 11-16 | lit cells in their own svg (`#ring-lit-svg`), each with a copy of its cell's number over the tint (keeps the look: the 11-15 objection was that moving them out tints the digits) | user's Chrome: hiding lit cells alone took 150 → 17 ms; this was the flicker | 35982c5 [v2k] |
| 11-16 | lit cells pooled (`takeLitCell`/`dropLitCell`, `litUse` guard): shown, hidden and reshaped by attributes only | each insert/remove cost 10–29 ms of style under the remaining `:has()` rules | 35982c5 [v2k] |
| 11-16 | blur copy keeps only numbers in the rings the card reaches (`frostRings`) | 2988 → 252 numbers; user's Chrome 56 → 34 ms with nothing else changing | 35982c5 [v2k] |
| 11-16 | wheel numbers share one `rotate()` per wedge group (`dhc-wheel-nums`), placed pre-rotated, instead of a transform each | Layerize 3.3 → 1.9 s per 8 s (each transform was its own paint chunk); pixel-identical | dbdb828 [w8n] |
| 11-16 | blur copy drops the wheel's clip-path (turned each step, it invalidated every copied number); copy rebuilt only when `frostRings` changes | | dbdb828 [w8n] |
| 11-16 | `combineCopies` computes the card's hug before inserting its buttons (`combineHug`) | one forced style+layout fewer per step | dbdb828 [w8n] |

User's Chrome after 11-16: median frame 17–33 ms between steps; about 80–130 ms at each new arrow.

## Rejected (don't retry without a new reason)

- **will-change on the wheel inside the ring svg** [wl1]: turns collapse to 6–9 fps.
- **Converting the remaining ~40 `:has()` rules** [wl1]: the cost is spread over all of them, and interaction states (hover, focus-visible) are at risk.
  - 11-16 re-measured in the user's Chrome (85 `:has(` selectors counted in the stylesheets): one insert costs 32–51 ms with them and 11 ms with all of them off. Turning rules on one at a time showed no single culprit.
  - Moving the wheel's host out of `.fs-win-body` saves only ~8 ms per recalc (22–25 → 15).
- **A live mirror of the wheel for the card's blur instead of `<use>`** [rl1]: less layout, but more GPU raster.
  - The 11-16 static copy (cf3f291) is close to this; it was tried without reading this log.
  - It only paid off once the copy was culled to the card's rings (35982c5, dbdb828).
- **Setting the ring svg's viewBox once** [rl1]: no measurable gain, and it changed text measurement slightly.
- **A bounded square for the wheel layer** [rl1]: no fewer rasters.
- **11-16, not a fix:** `backdrop-filter` off, and `filter` off, each barely moved frame times in the user's Chrome. They are not the bottleneck.

## Open (what's left, with what is already known)

1. **The redraw at each new k** (~80–130 ms in the user's Chrome; noted as ~80 ms of style/layout already on 11-15 [wl1]).
   - What's left in it: one forced style+layout in `fitText` (after `drawCombineLine` rebuilds the lines), plus the lifecycle pass.
   - Every DOM insert, remove or text change in the window costs ~10 ms there, attributes ~0.1–1 ms.
   - Candidate: patch the lines under the ring and the combination in place (text/attribute changes only, like the lit-cell pool) instead of rebuilding them.
2. **The remaining `:has()` rules** (see Rejected).
   - Candidates not tried yet:
     - rewrite only the rules whose argument is a descendant combinator anchored on `.fs-win-body` (e.g. `:has(:is(#coset-btn, #dir-toggle):is(:hover, :focus-visible))`, `:has(> .expr-slot:not(.is-side) :focus-visible …)`) into JS-set classes, as pf1 did for the `> …` ones;
     - move the big svg layers out of `.fs-win-body`.
3. **GPU raster of the ring svg's arrows and halos as they grow** [rl1 remaining]: partly addressed by the combo layer.
