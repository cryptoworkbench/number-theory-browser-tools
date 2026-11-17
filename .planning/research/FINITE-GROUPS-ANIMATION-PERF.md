# Finite Groups: animation performance log

One record of every approach tried to make the main area's animations (slow aᵏ above all, slow a ∗ b, turns, zoom) cheaper, kept or rejected, with what was measured. **Read this before trying a new idea, and add to it after every attempt**, rejected ones included.

Detail per attempt lives in the quick task's SUMMARY.md (directory in brackets).

**Benchmark scenario since 2026-11-17 (user's choice): ⟨ℤ/59ℤ, ×⟩ arranged by powers of 56, a = 56, slow aᵏ to k = 57 (56 has order 58), wheel and raw aᵏ results on, Keep every arrow in sight on, and Keep the result on top pressed (`#combine-top`, the ⤒ button by the k field; not saved, press it after picking the bead: it lets go of Keep on top, the ring then turns aᵏ's result to the top every step). The user: only tests with Keep the result on top count; every other test is irrelevant.** Runs before this note (identity on top, the page default) don't measure the benchmark (zoom goes to 25%, wheel thickness 0.5). URL: `finite-groups.html?mode=multiplicative&n=59&gen=56&arrangegen=56&combine=scalar&combinek=0&combineslow=1&wheel=1&wheelrawak=1` (the arrangement generator is `arrangegen`, not `logbase`), then a JS click on `#cg-enter`, `#zoom-fit` pressed, and a real click on bead 56 (`circle.bead[data-el="56"]`). A run takes ~172 s. Before: ⟨ℤ/37ℤ, ×⟩, a = 35, slow aᵏ to k = 36.
- Claude in Chrome: a `javascript_tool` call that waits more than a few seconds while the animation runs times out or drops the connection. Start the run with the result stored in `window.__res`, wait with a background `sleep`, then read it with a call that doesn't wait.
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
| 11-16 | slow step writes the lines under the ring, their copy buttons and the card's plate into the ones drawn last (`ringKept.oldLines`, `patchCombineRoots`, `morphTree`; copy buttons read `btn.copyPlain` when clicked); the ≡ badge and the a ∗ b / aᵏ names change text-node data (`setTextData`) | step frames 92–129 → 57–63 ms, forced layout 56–82 → 29–34 ms; patched lines identical to a fresh drawing at k = 5 and 36 | 09787cf [x3m] |
| 11-16 | keyboard focus marked with classes (`syncFocusVisible`: `has-fv` on the focused element and its ancestors, `has-fv-sub` inside `.sub-ctls`), and the rules asking `:has(:focus-visible)` / `:has(… :focus-visible)` (22 selector occurrences in 17 rules) rewritten to `.has-fv`, `:has(> X.has-fv)` or `.has-fv-sub` | headless insert pass 5.3 → 4.5 ms (2.6 with no `:has()` at all); user's Chrome forced layout per step 44–53 → 27–30 ms; old and new selectors match the same elements | be069bd [x9h] |
| 11-16 | **generic `:has()` shim** (`hasShim`, top of the page script): at load every `:has(ARG)` in the CSSOM (79 rules, 35 distinct ARGs) becomes `:is(:where(.hs-N), ARG:not(*))` (same specificity), and `hs-N` is kept on candidate anchors by `el.matches(':has(ARG)')`. Candidates come from live `getElementsByClassName` lists. Synced on mutations outside svgs (inline `style` ignored), focus/input/change, keydown (focus ARGs), pointerover/out (hover ARGs) and a wrapped `HTMLInputElement.checked` setter | checked first: JS `:has()` queries set no invalidation flags (insert pass 2.30 ms before and after querying all rules, rules off). Sync ~0.7 ms (a document-wide `querySelectorAll` per ARG was 9 ms). About 2.5 syncs per step. Insert pass in the user's Chrome 4.0 → 0.0–0.1 ms (A/B/A page loads). Selectors match the originals in every state tried | 2b4731a [y2s] |
| 11-17 | shim: candidates cached (one `querySelectorAll` of all anchors only when page elements come or go; `recheck` of one element on class/id/hidden changes); arguments ending at an id-named element asked the other way round (`holds`: mark the anchor with `data-hs-at`, ask the element `[data-hs-at] ARG`, walks only its ancestors; 12 of 35 arguments) | first step of a slow run, 16 syncs: 111 → 6.3 ms headless. A live class list read after any change re-walks the whole document; `:has()` with a descendant argument on `.fs-win-body` walks the wheel's thousands of elements (1.5 ms a call). Screenshots identical to 2b4731a, selectors equal | 75b23bd [z1f] |
| 11-17 | **wheel numbers on a canvas** (`#ring-num-canvas`, `paintWheelNums`, `queueWheelNums`, `g.numData`, `appendWheelNums`, `wheelNumAt`). The canvas is a square about the wheel's centre reaching the window's farthest corner, turned with the layer, at most 4000 px a side. SVG texts are written from the data in the ring (flips, rearrangements), the blur copy (its rings), the lit copies and the pictures (PNG with resolved paint, swap/ring-window copies) | headless first step: task + paint ~480–570 → ~330–480 ms with no long paint after; layout 141–158 → 56–62 ms. User's Chrome, zoom-out main-thread work (no paint): 372/468 → 350/288 ms. Same places, sizes, turns and texts (blur, lit, export markup equal), screenshots differ by anti-aliasing only | 7da315d [z2c] |
| 11-17 | canvas vs svg numbers checked in the user's Chrome (first step only, ~15 s runs, alternated) | worst frame 75b23bd 817/744/510 vs 7da315d 356/425/368 ms; time in frames > 50 ms 1417/1462/1077 vs 674/742/702 ms | [z3m] |
| 11-17 | shim: candidates kept incrementally (`addFrom`/`dropGone`; exact, all 29 anchors are compound selectors on class/id/hidden) instead of `findAll` over the document; **bug fix**: `sync` no longer drops page changes the observer had not yet delivered (`note(mo.takeRecords())` first; `.fs-win-body` gaining `is-clu-on-ring` on entering had left `:has(> #expr-slot)` off). `mirrorToUrl`'s address write and `syncIsoLinks` at idle (`flushMirror`, flushed by `isoHref` and pagehide); `postIsoShared` stays synchronous | first step, headless busiest block 182–212 → 141–191 ms; user's Chrome worst frame 401–494 → 272–418 ms, long frame 431–514 → 301–448 ms (4 alternated pairs, new better in each) | 16c3ed2 [z3m] |
| 11-17 | **Keep the result on top**: the wheel's turn folded into its drawing once the ring is at rest (`foldWheelAtRest`, 150 ms after the last layer turn: `foldWheelTurn`, the blur copy turned by the same amount on top of its own, layers straight, canvas repainted). Cause: after each turn the kept wheel's layers (above all the 3198² number canvas, then the wheel svg) were turned by the compositor, the GPU just over budget every frame | result on top, settled 10 s: HEAD 564/36, 530/68 vs 569/15, 565/18 frames/slow; positions exact (< 0.005 px over 7 folds) | 9f2102a [z4r] |

**User's Chrome, 11-17, new benchmark, window in front (rAF 60/s), interleaved full runs, 2b4731a+75b23bd+7da315d (NEW) against 6b46109 (PRE, before the shim):**

| Run | median / p90 / p99 frame | frames > 50 ms | > 100 ms | worst | first-step frame (script, forced) | median forced per step frame |
|---|---|---|---|---|---|---|
| PRE 1 | 17 / 17 / 33 | 43 | 8 | 934 | (not recorded) | 56 |
| NEW 1 | 17 / 17 / 33 | 36 | 6 | 594 | 648 (432, 122) | 34 |
| PRE 2 | 17 / 17 / 33 | 40 | 7 | 683 | 661 (638, 395) | 49 |
| NEW 2 | 17 / 17 / 33 | 35 | 6 | 600 | 561 (403, 117) | 32 |

- Between new arrows both run at 60 fps (p90 17 ms); the shim and the canvas cut the janky frames by ~15% (40–43 → 35–36 over ~9,700 frames), forced layout per step frame 49–56 → 32–34 ms, and the first step's forced layout 395 → ~120 ms.
- The first-step frame stays at ~560–650 ms: ~400 ms of script with only ~120 ms forced, so ~280 ms is plain JS, plus raster. That is now the one visible stall; the step frames are ~100–200 ms at most (a handful per run).
- No page errors in any run.

Earlier: User's Chrome after 11-16: median frame 14–33 ms between steps; about 57–68 ms at each new arrow before 2b4731a (step frames after the shim not measured yet: the user's window was occluded, rAF throttled to ~1/s). The first step of a run with Keep every arrow in sight zooming to 25% takes one ~1.4 s frame (the whole wheel redrawn at the new zoom and cell height); not looked at yet.

### Micro-measurements (user's Chrome, 11-16; median of 9, change plus forced layout)
- Attribute change on an svg element: 0.0–0.3 ms. Class toggle: 0.0 ms.
- Text node `.data` change: 0.5 ms. Replacing it through `textContent`: 18.5 ms on a tspan, 13.5 ms on an HTML span.
- Insert: ~10–11 ms **per style pass, not per element** (1 element 10.1 ms, 20 elements 11.1 ms, fragment of 20 11.4 ms). Removal alone: ~0 ms; a tspan removal inside a text, 13.9 ms (text relayout).
- So a step that has to insert anything (its new arrow) pays one such pass, whatever else is patched. Patching the combination layer's walk and halos in place would not remove that pass (not done for that reason).

## Rejected (don't retry without a new reason)

- **Wheel numbers on a canvas (7da315d) and folding the wheel's turn at rest (9f2102a), both reverted 11-17** [z5v]: with Keep the result on top (the benchmark), the single 3198² px canvas is either turned by the compositor every frame (GPU over budget) or, folded, repainted and re-rastered every step (a > 50 ms frame per step). SVG numbers in the wheel's layer raster in tiles and turn cheaply. User's Chrome, result on top, 15 s windows once settled (frames / > 25 ms / > 50 ms), alternated: 9f2102a 837/37/8, 822/47/8; 75b23bd (svg numbers) 874/26/0, 886/14/0, 889/10/0; 6b46109 876/21/1, 869/28/2; reverted (75b23bd + 16c3ed2) 894/6/0, 889/11/0. The canvas did halve the first step's zoom-out frame (identity on top: 817/744/510 → 356/425/368 ms); that gain is lost with the revert.

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

1. **The redraw at each new k**: now ~57–63 ms in the user's Chrome (was ~80 ms of style/layout on 11-15 [wl1], 230–270 ms early on 11-16). Done for the lines, copy buttons, plate and badge (09787cf).
   - What's left in it: one forced style+layout (~30 ms) that pays for the combination layer's insertions (the new arrow; its walk group and ~10 halos are still rebuilt), plus the lifecycle pass.
   - Patching the combination layer would not remove the one pass (see Micro-measurements).
2. **Done by 2b4731a (generic shim).** Kept for the record: **the remaining `:has()` rules** (85 selectors in the CSSOM before be069bd). Measured on 11-16:
   - Upper bound in the user's Chrome, interleaved runs, every rule off vs on: step frames 84–100 → 51–63 ms, forced 44–53 → 7–30 ms.
   - Headless insert pass, family on alone vs all off (2.5): `:focus-visible` family 5.0 (all on 5.3) → fixed by be069bd.
   - After be069bd: all on 4.5, all off 2.6. Each remaining rule alone adds roughly 0.3–1.3 ms over the baseline, and they don't add up. That fits a largely fixed cost once any `:has()` rule can be affected by an insertion. Only converting all of them would remove it.
   - Not effective: rewriting `:focus-visible` to a class inside the same descendant `:has()` (`.is-fv`), 5.0 → 4.2; marking ancestors and dropping the descendant search did better.
   - Switching off the 25 rules anchored on an ancestor of the ring's layers, or the 10 of those with descendant arguments: no measurable change.
   - Candidate not tried: a generic shim that rewrites every `X:has(arg)` to a class kept by JS (`el.matches(':has(arg)')` on anchors, rerun on focus, hover, change events and on mutations outside the svg layers). Check first whether a JS `matches(':has(…)')` call itself sets Chrome's has-invalidation flags.
   - Gotchas met building it: anchors must drop pseudo-elements (`::after` makes the query throw and silently skips the ARG); a `pkill -f "http.server 8731"` inside a shell command also kills that shell.
   - Measurement caution: the user's machine drifts 2–4× within minutes (median frame flips between 17 and 33 ms). Only interleaved comparisons count.
   - Candidates not tried yet:
     - rewrite only the rules whose argument is a descendant combinator anchored on `.fs-win-body` (e.g. `:has(:is(#coset-btn, #dir-toggle):is(:hover, :focus-visible))`, `:has(> .expr-slot:not(.is-side) :focus-visible …)`) into JS-set classes, as pf1 did for the `> …` ones;
     - move the big svg layers out of `.fs-win-body`.
4. **The first step's long task** (~1.4 s in the user's Chrome before the shim; headless 418–499 ms before the shim, ~375–380 ms now, plus 43–65 ms paint). Measured 11-17:
   - The wheel's numbers (~3,300 `<text>` at 25% zoom, cell height 0.75) cost ~100–160 ms of the task plus ~50 ms of paint, against ~3,300 → 0 in a no-numbers test copy (277–329 ms left).
   - Their CSS is not the lever: `dominant-baseline`, the webfont, tabular-nums, `text-anchor` changed nothing measurable (3,000 texts insert + layout 47–65 ms in every variant).
   - The rest: forced layouts read by `ringWheelFill` (before the wheel is drawn), `renderCombineKey` (its `getComputedStyle` is the first read after the wheel is redrawn, so the wheel's style+layout lands there) and `inTopBand`/`bandHoles` (top-band hover); building the number elements (~30 ms JS); the step itself (~20 ms).
   - Done 7da315d: the numbers on a canvas (see Kept). Done z3m: shim upkeep and the address-bar write out of the frame (see Kept). Left (headless ~150–190 ms): drawNecklace ~56 (forced layout in refitRingWheel/ringWheelFill ~17–30), fillText ~32, renderCombineKey ~30 (the wheel's style recalc lands on its getComputedStyle), renderSubgroups ~11, renderIso ~11; a zoom runs the whole `render()`. Note for profiling: focus the k field before the measured window (its focusin runs `inTopBand`/`bandHoles`, ~30 ms, which is not part of the step). Left in the first step: ~150 ms JS headless (forced layouts in `ringWheelFill`, `inTopBand`/`bandHoles`, `renderCombineKey`; ~36 ms of `fillText` for ~3,300 numbers). Measured in the user's Chrome on 11-17 (table under Kept): first-step frame ~560–650 ms, ~400 ms script, ~120 ms forced.
   - Other candidates, not tried:
     - leave out numbers whose cells lie outside the main area, but the wheel layer turns by the compositor, so culled corners would show during turns;
     - skip numbers too small to read: a visual change.
5. **Result on top, what's left** after the revert (6–11 slow, none > 50 ms, per 15 s settled): to be located. The first step's zoom-out frame is back at ~500–800 ms (svg numbers). Measuring lessons: only interleaved short windows within one run count (baseline drifts 95→158 frames in 30 s); an idle page's rAF rate is meaningless here (40–50 fps idle while the running animation holds 60).
3. **GPU raster of the ring svg's arrows and halos as they grow** [rl1 remaining]: partly addressed by the combo layer.
