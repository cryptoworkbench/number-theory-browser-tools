---
quick_id: 261109-gsf
status: complete
commit: d03d535
---

# 261109-gsf summary

syncExprCtx('gsub') builds two sections: the group's (ggroup, gorder, gens, struct) under
"{name} formulas" with the group's plain name, and the subgroup's (gsub, sorder, cindex) under
the subgroup's plain name as the row writes it. sorder and cindex come from menuFormulas
(orderFormulas, as currently figured), so they offer the formula preview and the four copy
formats. The name sits in .fs-menu-head-name (no upper-casing or letter-spacing). With no
subgroup only the group's section shows. Verified in Chrome on ⟨ℤ/13ℤ, ×⟩ with ⟨5⟩.
