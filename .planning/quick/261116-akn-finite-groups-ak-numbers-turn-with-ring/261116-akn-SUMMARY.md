---
quick_id: 261116-akn
status: complete
commit: cc02140
---

# 261116-akn summary: aᵏ's numbers turn with the ring

## Changed
- With the wheel shown and Keep the numbers readable at every turn off, aᵏ's hop numbers and raw results, and a∗b's raw result, are drawn as they stand with the identity at the top, then turned with the ring, as the wheel's own figures are (`comboNumTurn`, `hopNum`, `rawNumRot`). The raw results now lie exactly over the wheel's figures for them.
- A turn alone keeps the combination's layer and turns it by `comboTurnOffset` (`comboReused` in `drawNecklace`/`drawRing`). `turnWheelLayer` applies the offset; `foldComboTurn` writes it into the drawing before a flip or rearrangement carries it; picture copies and `snapshotRing` apply it; `patchRingCombo` resets it.
- The paths' own raw results stay upright and are drawn again as before; nothing changes with the option on or without the wheel.

## Verified
- Debug harness: plain turns with aᵏ (k 7, −5, multiplicative n=15, counterclockwise) and a∗b keep the layer, matching a full redraw within 0.007 px in screen space, text and its angle included. Turns taken while an arrow grows keep it as well; there a full redraw restarts the growing arrow, so those are not compared, and every slow step's patch still matches a full redraw exactly. All earlier cases still pass.
- Screenshots against main: 24 scenes; only turns, wheel-ak-turned and win-ak differ, by the hop numbers turned with the ring.
- Raster (slow aᵏ to 4, result kept on top, 2 alternating runs): the combination's layer rastered 173 → 155 times; GPU raster time and frames over 33 ms change within noise.
