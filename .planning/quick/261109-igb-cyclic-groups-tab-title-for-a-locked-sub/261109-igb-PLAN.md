---
quick_id: 261109-igb
mode: quick
---

# Quick task 261109-igb: tab title for a locked subgroup isomorphism

While a subgroup is locked to a group, name the tab 'G ∈ G₁ ≅ G₂' or 'G₁ ≅ G ∈ G₂', matching the
order on screen (was 'G₁ & G₂').

## Task 1
- files: Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js
- action: ringTitle: isoLinked() && !isoWholeMatch() → fsRingIsoSubRight when isoPane.hsub, else
  fsRingIsoSubLeft; two new English-first keys.
- verify: Chrome, ⟨ℤ/13ℤ,×⟩ with ⟨ℤ/5ℤ,×⟩ locked, swap and swap back.
