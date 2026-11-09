---
quick_id: 261109-nqv
mode: quick
---

# Quick task 261109-nqv: Multiply

Add 'Multiply', working as Divide does, suggesting only groups with 2, 3 or 5 times the cardinality.

## Task 1
- files: Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js
- action: factorRows/factorItem shared by divideItem/multiplyItem (FACTOR_KEYS per op); setRingDivide
  reads data-op; Multiply after Divide in the Swap section and under Group cardinality.
- verify: Chrome, ⟨ℤ/13ℤ,×⟩ and ⟨ℤ/60ℤ,+⟩.
