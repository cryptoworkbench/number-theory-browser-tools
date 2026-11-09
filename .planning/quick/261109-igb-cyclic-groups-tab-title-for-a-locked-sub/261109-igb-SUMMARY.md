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

## Follow-ups

- bfdfa24: with the subgroup on the pane's side (mirrored lock), the bottom panel's right column now
  colours every member like its bead on the pane's ring (Colour members like their beads): the pane
  reports its bead paints after each render that changes them (`isopane: 'beads'`, validated:
  class [a-z0-9 -], style only an --ord colour); renderMirroredSubgroups paints each member with
  them (memberMath's new paint argument). Before: only the four members of the locked subgroup were
  coloured, as their preimages on the left ring (green against the pane's pink where the left had
  not borrowed). Verified: 89 chips, 0 mismatches against the pane's bead fills.
- 236cecb: {sub} replaces G in the title: '⟨g⟩' of the left ring's G (state.gen) or of the pane's selected
  row (isoPane.row), G when none is selected. Verified: '⟨5⟩ ∈ ⟨ℤ/13ℤ, ×⟩ ≅ ⟨ℤ/5ℤ, ×⟩', after the swap
  '⟨ℤ/5ℤ, ×⟩ ≅ ⟨5⟩ ∈ ⟨ℤ/13ℤ, ×⟩', then ⟨8⟩, ⟨2⟩, ⟨12⟩ as rows were picked.
- d4314ae (root cause, replacing the 'beads' report of bfdfa24 and the swap's carried paints from
  81cd192): the host computes the pane's paints synchronously in the mirrored lock: panePainter(H) =
  beadPainter(H, orderClasses(H.order), inversePairs(H)) with isoBorrowed null (the pane borrows
  nothing there; colours/colorBy/picks are shared while linked). borrowedPaints uses paneLinkPaints()
  (h^k for h = isoPane.h) before isoPaints; isoTakePaints no longer re-renders on that side;
  renderMirroredSubgroups paints every right member with panePainter. Recorded every 3 ms: the swap
  into the mirrored lock and a left-ring swap each draw the left ring once, in its final colours;
  0 of ~1,900 and ~2,400 samples showed a wrong right-column colour; 89/89 chips match the pane's
  beads (compared by each chip's base mn: the earlier 89/0 check had parsed '0501' as 501 and so
  compared nothing).
