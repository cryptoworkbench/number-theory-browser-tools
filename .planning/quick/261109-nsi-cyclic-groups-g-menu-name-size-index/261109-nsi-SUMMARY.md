---
quick_id: 261109-nsi
status: complete
commit: 4f7c036
---

# 261109-nsi summary

rowFormulaH(G, h, x, paint, natOff) and cosetGenWrite(G, h, reveal, natOff) pass natOff to
subFormat; menuFormulas uses natOff true for gsub, sorder and cindex, and ctxSubName reuses
cosetGenWrite. CTX_NAMES: gsub → ctxItemName 'Name', sorder → ctxItemSize 'Size', cindex →
ctxItemIndex 'Index' (Ec 'Cofactor', in IDX_KEYS). Verified in Chrome on ⟨ℤ/13ℤ, ×⟩ with ⟨5⟩:
items Name | Size | Index, each writing ⟨05⟩ while the row shows 05⁰¹; no script errors.
