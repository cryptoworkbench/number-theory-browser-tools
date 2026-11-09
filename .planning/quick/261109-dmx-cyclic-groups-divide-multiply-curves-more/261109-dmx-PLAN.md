---
quick_id: 261109-dmx
description: Cyclic Groups — Divide/Multiply table: ×7 row always, curves column on every ring, two groups per cell then a + offering more
---

# Quick task 261109-dmx

## Task
- Multiply always lists ×2, ×3, ×5 and ×7 (empty cells a dash), no longer dropping a factor whose
  row would be empty.
- The Elliptic Curves column shows on every ring, not only on a curve's.
- Each cell shows two groups; a third line, +, adds three more at a time while there are; curves
  beyond cyclicCurves' one per prime are found lazily (every cyclic curve with that many points the
  curve mode can show, counted via squares mod p).
- Picking a curve switches the ring to it (divideTo sent mode=elliptic, which the ring query
  refuses; a curve now goes by curve= alone).

## Files
- Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js (cardDivideMore, English first).
