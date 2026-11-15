---
quick_id: 261115-rl1
status: complete
branch: perf-ring-layers
commit: b39dc2e
---

# 261115-rl1 summary: ring split into layers

## Measured first (main)
- GPU raster, not compositing, is the bottleneck. Hiding the subgroup paths removes most of the per-frame raster in spins: frames over 33 ms go from 89 to 19.
- The card's blur, a `<use>` of the whole wheel under `filter: blur`, was blurred again on every frame of a turn.
- Every turn's end redraws the ring, which rebuilds the wheel and re-rasters its whole layer (4261 px square) and the blur.

## Changed
- The guide, cord, mirror axis and paths are in their own composited svg (`#ring-paths-host`/`#ring-paths-svg`/`#ring-paths-turn`), turned by the compositor with the wheel. They are carried in the ring for flips and rearranges (`wheelIntoRing`/`wheelOutOfRing`) and put back for pictures (`ringLayerParts`, `snapshotRing`). Previews keep them in the ring.
- The card's blur turns by the compositor inside a window on the card (`#ring-frost-window`, `placeFrostWindow`). The window takes the card's ground colour and rounded clip. The svg clip and ground are kept for pictures.
- A turn alone keeps the wheel's group (`wheelReused`, a fast path in `drawRingWheel`). Its new turn is carried by the layer's own rotation (`wheelTurnOffset`) and folded back for flips and pictures (`foldWheelTurn`, `trueWheelTurn`). The card's blur is kept with it.
- The ring's reach is measured from the layers' own transforms (`measureRingReach`), and wheel-cell taps check the fixed clip in the drawing's frame.
- On the mobile page the frame isolates its stacking so the paths layer shows; the wheel's layers stay hidden there, as before.

## Results (3 interleaved runs, machine under load; main → branch)
- Spins, n=24 with the wheel: frames over 50 ms 48 → 26; GPU raster 3.86 s → 0.89 s; about 42 → 55 fps.
- Slow aᵏ, Keep result on top, no wheel: frames over 50 ms 65 → 39; about 41 → 58 fps.
- Slow aᵏ, Keep result on top, wheel and raw results: frames over 50 ms 89 → 84; GPU raster −20 %; about 27 → 30 fps.

## Verified
- Screenshots against main for 17 desktop scenes, plus previews, ring windows and the mobile page. Differences:
  - text anti-aliasing (grey instead of subpixel) now also without the wheel;
  - after a turn, the wheel's digits are the compositor's rotated image, a sub-pixel difference.
- PNG export markup equal to main's apart from attribute order.
- The debug harness finds patched steps and turn-only redraws equal to full redraws in all 10 cases. The kept wheel is compared normalized.

## Remaining
- With the wheel and raw results, the lit cells' fades (CSS opacity on SVG cells) repaint the wheel layer and the blur every frame. Moving them out would tint the digits.
- The ring svg's own arrows and halos re-raster as the arrows grow.
