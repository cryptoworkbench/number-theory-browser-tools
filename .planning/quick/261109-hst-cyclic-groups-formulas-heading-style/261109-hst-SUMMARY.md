---
quick_id: 261109-hst
status: complete
commit: 3a1e158
---

# 261109-hst summary

.fs-menu-head-name keeps only text-transform none (letter-spacing inherited); the heading name is
built from the plain name, each +ₑ becoming + and a <sub>E</sub> (.75em). The curve's typeset
math in the heading (261109-ece) is replaced by this. Verified in Chrome on the curve 17,2,2:
both headings in Source Sans 3, 11.52px, 700, 1.04px spacing like Swap and Export, with +E's E
subscript and capital.
