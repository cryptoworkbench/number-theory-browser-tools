---
quick_id: 261109-ece
status: complete
commit: 1c256a9
---

# 261109-ece summary

syncExprCtx's sections carry the formula key whose math names them (ggroup, gsub); on a curve the
heading's name span holds mInline(that math, plain name). gsub's math now builds its own
mGroupFull(G) instead of sharing the ggroup node (one node cannot sit in two headings). Groups of
numbers keep their plain-text headings. Verified in Chrome on the curve 17,2,2: both headings
show ⟨E₂,₂(𝔽₁₇), +_E⟩ with a capital E, and the subgroup's Name preview still names the group.
