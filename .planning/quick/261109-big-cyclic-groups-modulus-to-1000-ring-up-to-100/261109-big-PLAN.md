---
quick_id: 261109-big
description: Cyclic Groups — moduli past the old hard limits (× and curves up to 1000); the ring is not drawn past 100 elements, a note in its place
---

# Quick task 261109-big

## Task
- ⟨ℤ/nℤ, ×⟩ takes n up to 1000 (MAX_N_MUL); ⟨ℤ/nℤ, +⟩ stays up to 100, its n being its cardinality.
- A curve's modulus: a prime from 5 to 1000 or a product of two different ones up to 1000; the
  point-count limit (EC_MAX_ORDER 120) goes.
- Past MAX_DRAW = 100 elements the ring is not drawn: a note says so in its place; the rest keeps
  working. The polygon and the Cayley table need the ring; a row's members past 100 are shown as
  the first eight, …, the last.
- Whatever made such groups slow: curve element orders by the primes of |E| and double-and-add,
  the curve search by a squares table and a generator found by its order, the units' iso list by
  their structure.
- Texts giving the old limits updated (97 → 1000 in ecNTitle/ecNoteN, all languages); ecNoteSize
  removed; ringTooBig added (English first).

## Files
- Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js
