---
quick_id: 261109-nqv
status: complete
commit: 2e9675b
---

# Summary

- Multiply (×) next to Divide in the Swap section and under Group cardinality: the same table with
  rows × 2, × 3, × 5 (cardinality k·|G|): ℤ/(k|G|)ℤ under + while ≤ MAX_N (100), the cyclic unit
  groups of that order, the cyclic curves on a curve's ring; rows with nothing dropped; greyed with
  cardMultiplyNone when no row is left (non-cyclic: cardDivideCyclic).
- Warnings per op via FACTOR_KEYS (cardMultiplyWarn / WarnLock / WarnBoth / WarnLockSame, English
  first); divideGroup/divideTo apply as for Divide.
- Verified in Chrome: ⟨ℤ/13ℤ,×⟩: ×2 ⟨ℤ/24ℤ,+⟩ | —; ×3 ⟨ℤ/36ℤ,+⟩ | ⟨ℤ/37ℤ,×⟩ ⟨ℤ/74ℤ,×⟩; ×5 ⟨ℤ/60ℤ,+⟩ |
  ⟨ℤ/61ℤ,×⟩; ⟨ℤ/24ℤ,+⟩ warns 'multiplied by 2'; ⟨ℤ/37ℤ,×⟩ applies; Divide unchanged on ⟨ℤ/37ℤ,×⟩;
  Multiply greyed on ⟨ℤ/60ℤ,+⟩; no errors.
