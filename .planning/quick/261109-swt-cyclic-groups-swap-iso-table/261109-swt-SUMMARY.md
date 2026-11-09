---
quick_id: 261109-swt
status: complete
commit: 633d600
---

# 261109-swt summary

groupCell is a top-level function (refit callback), used by setRingDivide (fitRingDivide) and
setRingSwap (its own refit: width from scrollWidth, then placeRingSub). setRingSwap sorts
swapSpecs() into the three columns by curve/mode. The curves offered are the swap chips' (one
per prime), not the deeper scan Divide/Multiply use. Verified in Chrome on ⟨ℤ/12ℤ, +⟩: — |
⟨ℤ/13ℤ, ×⟩, ⟨ℤ/26ℤ, ×⟩ | two curves and +, + revealing three more; picking ⟨ℤ/13ℤ, ×⟩ swaps;
the Cardinality copy submenu is a plain list again; Divide's table and + unchanged; no errors.
