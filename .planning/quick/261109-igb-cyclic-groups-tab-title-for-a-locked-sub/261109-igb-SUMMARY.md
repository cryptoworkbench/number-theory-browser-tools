---
quick_id: 261109-igb
status: complete
commit: e803b30
---

# Summary

- ringTitle names a locked subgroup link by the subgroup's side: 'G ∈ {left} ≅ {right}' (subgroup of
  the left ring's group) or '{left} ≅ G ∈ {right}' (isoPane.hsub, the pane's). Whole groups locked
  keep '{left} ≅ {right}'; unlinked pairs keep '{left} & {right}'.
- New keys fsRingIsoSubLeft / fsRingIsoSubRight, English first (listed in the i18n header).
- Verified in Chrome: 'G ∈ ⟨ℤ/13ℤ, ×⟩ ≅ ⟨ℤ/5ℤ, ×⟩'; after the swap '⟨ℤ/5ℤ, ×⟩ ≅ G ∈ ⟨ℤ/13ℤ, ×⟩';
  swapped back as before; no errors.
