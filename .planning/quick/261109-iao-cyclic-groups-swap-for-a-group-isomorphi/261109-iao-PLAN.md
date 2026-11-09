---
quick_id: 261109-iao
mode: quick
---

# Quick task 261109-iao: Swap for a group isomorphic to … while subgroup-locked

Make the ring menu's "Swap for a group isomorphic to {group}" always available while a
subgroup-to-group isomorphism is locked (it was offered only while the rings were unlinked).

## Task 1
- files: Cyclic Groups/cyclic-groups.html
- action: drop the isoLinked() exclusion from otherSpecs/paneOtherList (groupsAlike still hides it
  for locked whole groups); the pane shows the host's list whenever sent; a linked pane's pick goes
  to the host (isopane 'other'), which opens the pane on it whole-to-whole (openPaneOther).
- verify: Chrome, ⟨ℤ/13ℤ,×⟩ with ⟨ℤ/5ℤ,×⟩ locked: item on both rings, picks clean, no errors.
