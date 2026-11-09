---
quick_id: 261109-iao
status: complete
commit: 9eb96c8
---

# Summary

- otherSpecs / paneOtherList no longer exclude linked pairs; groupsAlike keeps the item away for
  isomorphic (whole-group locked) pairs. The pane shows paneOthers whenever the host sends them.
- Left ring: picking ⟨ℤ/4ℤ,+⟩ makes it ⟨ℤ/4ℤ,+⟩ ≅ ⟨ℤ/5ℤ,×⟩, still locked (takeGroupSpec, unchanged).
- Pane: first tried in place (takeGroupSpec in the pane): its rows were left half merged (its
  subgroup row over the merged one). Now a linked pane posts `isopane: 'other'`; the host's
  openPaneOther finds the matching chip in its whole-group list (or builds one for its own group)
  and calls openIsoPane(a, G.generators[0]), like the picker's group-to-group list.
- Verified in Chrome: the item on both rings while subgroup-locked; pane picks ⟨ℤ/12ℤ,+⟩ and
  ⟨ℤ/13ℤ,×⟩ give clean locked whole-group pairs; absent while whole groups are locked; no errors.
