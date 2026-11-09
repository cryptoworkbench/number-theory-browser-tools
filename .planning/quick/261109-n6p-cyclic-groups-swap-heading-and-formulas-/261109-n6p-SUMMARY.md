---
quick_id: 261109-n6p
status: complete
commit: 5e077fd
---

# Summary

- 39ea332 (Divide, committed before this record): per divisor d, after ℤ/(|G|/d)ℤ under +, the cyclic
  groups of units (cyclicUnitGroups) or cyclic curves (cyclicCurves) of order |G|/d, picked via
  divideTo (first generator; locked: cardDivideWarnLockSame, then the padlock opens). Verified
  unlocked on ⟨ℤ/13ℤ,×⟩ (÷2 → ⟨ℤ/7ℤ,×⟩ on 3). Not verified: the locked warning (the test tab's
  renderer froze while hovering Divide), curves, the Divide under Group cardinality.
- 5e077fd: syncSwapCtx's heading uses swapHead 'Swap'; syncExprCtx puts a 'Formulas' heading
  (ctxFormulasHead) before the copy items. Verified: main menu shows Swap; the Subgroup row menu
  shows Swap, then Formulas over Group name, Subgroup name, Group cardinality, Group generator
  count, Group structure; no errors.
