---
quick_id: 261109-ni5
status: complete
commit: b9bc367
---

# Summary

- Divide's submenu (both places) is a grid: header row (empty, Additive Groups, Multiplicative Groups
  from common.*, plus Elliptic Curves on a curve's ring), then per divisor d a row: ÷ d
  (cardDivideRow), ⟨ℤ/(|G|/d)ℤ, +⟩, the cyclic groups of units of order |G|/d stacked, the cyclic
  curves stacked; empty cells show a dash. Units are now listed for every ring (also additive ones).
- Picks as before: additive → reduction warning unless the ring is additive and unlocked; others →
  divideTo, lock warning when locked. No returns to the table.
- The grid's max-content falls short of its laid-out MathML columns, so the width is set from
  scrollWidth after layout; the adjacent-heading rule's margin/border is reset in the table.
- Verified in Chrome: ⟨ℤ/13ℤ,×⟩ (÷2: ⟨ℤ/6ℤ,+⟩ | ⟨ℤ/7ℤ,×⟩ ⟨ℤ/9ℤ,×⟩ ⟨ℤ/14ℤ,×⟩ ⟨ℤ/18ℤ,×⟩ …; ÷4 dash),
  ⟨ℤ/6ℤ,+⟩ warns, No returns, ⟨ℤ/7ℤ,×⟩ applies; ⟨E₁,₂(𝔽₁₃),+ₑ⟩ shows the third column.
- New English-first keys: cardDivideRow, cardDivideCurves.
