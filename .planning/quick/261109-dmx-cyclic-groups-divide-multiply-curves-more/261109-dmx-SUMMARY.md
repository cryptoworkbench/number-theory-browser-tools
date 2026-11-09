---
quick_id: 261109-dmx
status: complete
commit: 530a1e2
---

# 261109-dmx summary

factorRows keeps every factor (no empty-row filter) and gives curves(n) for every ring;
curvesOfOrder(k, n) extends cyclicCurves(k) lazily with nextCurveOfOrder (prime by prime, a, b
ascending, point count by a squares table, cyclicity checked only for non-squarefree orders).
The table always has three columns; cell(upto) shows 2, then a .div-more + item adding 3 per
click, and fitRingDivide (split out of setRingDivide) resizes and places the table again.
divideTo leaves mode and n as they are for a curve spec. Verified in Chrome: ⟨ℤ/13ℤ, ×⟩
Multiply ×2…×7 with curves and +, + adding three curves (12 ms); Divide ÷2 units + revealing
⟨ℤ/14ℤ, ×⟩ and ⟨ℤ/18ℤ, ×⟩; picking ⟨E₀,₁(𝔽₅), +_E⟩ switches the ring, and a units pick from the
curve's Multiply switches back; no script errors.
