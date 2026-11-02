---
quick_id: 261102-dk4
status: complete
branch: formula-settings-per-type
commit: 2b95b08
---

# Summary: formula settings per formula type

Commit 2b95b08 on `formula-settings-per-type`:
- Row formula follows its type's map position (subRowFormula → mapFormula, chosen log
  base; the merged rows' right side uses state.fmapR). Bar menu Row place: Show/Hide only;
  subLcm/subLcmR removed, old sublcm/sublcmr links seed the maps. Dead lcm row writers removed.
- Two windows (#fmap-win-order, #fmap-win-index), Sliders/Map tabs + generator control each;
  shown while the type shows in the main area or the row. state.fmapOpen = {order, index},
  minimized per type; URL fmapopen/fmapmin = order|index|both (legacy 1 = both).
- Openers: gear per form slider, formula menu per line, bar menu Settings row; bar task per
  minimized window. fmapUsed() (main ∪ row) drives settling, refusals and the checkbox.
- Verified in Chrome: row LCM→GCD from the Index window, Settings row, minimize/bar task,
  checkbox reaching a row-only formula, two gears, phone layout; no console errors.

Left as is: translated keys now unused (barGcd, barLcm, fmapWinOrder, fmapWinIndex, the
formula.*Lcm plain-text keys) stay in the dictionaries.
