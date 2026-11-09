---
quick_id: 261109-trb
status: complete
commit: ee995de
---

# 261109-trb summary

workRight and topRowsBottom are back (above the corner's Show switches), their comment no longer
naming the scratchpad. A diff of every top-level function/var before and after 261109-scr found
these two as the only removed names still referenced. Verified in Chrome: + then ⟨ℤ/12ℤ, +⟩
opens the locked pane, the middle-line controls sit in their place, no script errors.
