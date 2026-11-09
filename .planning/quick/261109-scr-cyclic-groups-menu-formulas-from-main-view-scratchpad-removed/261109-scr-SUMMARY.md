---
quick_id: 261109-scr
status: complete
commit: 11d7663
---

# 261109-scr summary

menuFormulas no longer reads the scratchpad's list: sorder/cindex come from mapFormula
(state.fmap, mapBase, rowFormulaH) where hasMap, ecRowFormula on other curves, else
subOrderFormula/cosetCountFormula, classes stripped for copying. CTX_NAMES replaces
SCRATCH_NAMES (cindex → ctxSubIndex, so the item and its submenu read Subgroup index / cofactor).
The scratchpad (HTML, CSS, JS, copy listener, FS_PANELS id) is gone; .formula-pieces keeps the
copy submenu's preview layout; 63 unused i18n entries removed (keysets still consistent, no
extras). The empty 'pad' grid row in the ring body's grid templates was left in place.
Verified in Chrome: curve 17,2,2 menu offers Subgroup cardinality and Subgroup index from the
maps; ⟨ℤ/12ℤ, +⟩ with lcm-full maps gives the same lcm formulas in the menu as on screen; no
script errors; full-screen layout unchanged.
