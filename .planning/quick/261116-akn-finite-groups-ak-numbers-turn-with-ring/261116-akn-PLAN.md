---
quick_id: 261116-akn
type: quick
---

# 261116-akn: aᵏ's numbers turn with the ring when Keep the numbers readable at every turn is off

With the congruence wheel shown and Keep the numbers readable at every turn off, the wheel's numbers already turn with the ring and are not drawn again. The numbers on aᵏ's arrows (the hop numbers and the raw results) were still drawn upright again after every turn. They should behave like the wheel's numbers, so a turn alone can keep the combination's layer as it is.

## Tasks
- `comboNumTurn(G, place, m)`: the turn of the identity-at-top frame while the wheel is shown and the option is off, else 0.
- The hop numbers (`hopNum`) and the raw numbers (`rawNumRot`, used by `drawRawHop` and `drawRawCombine`) are drawn in that frame, so they lie exactly as the wheel's own figures do.
- A turn alone keeps the combination's layer (`comboReused`), turned by `comboTurnOffset`, as the paths' layer is kept; folded back for flips, rearrangements, pictures and the PNG (`foldComboTurn`, `ringLayerParts`, `snapshotRing`); reset by a slow step's patch.
- With the option on, or without the wheel, nothing changes.

## Verify
- The debug harness: a kept layer matches a full redraw in screen space, text angles included.
- Screenshots against main: only aᵏ scenes with the wheel after a turn differ.
- Per-layer raster counts against main.
