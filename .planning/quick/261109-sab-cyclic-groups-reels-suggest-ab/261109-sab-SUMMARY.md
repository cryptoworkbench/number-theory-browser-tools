---
quick_id: 261109-sab
status: complete
commit: 9786958
---

# 261109-sab summary

ecSuggestAB(n, a, b) searches outward by |Δa| + |Δb| (a before b, down before up) for the first
pair with ecSingularAt null, within 0 … EC_COEF_MAX. syncEcReelsSum stores it as
ecReels.suggest, keeps the sum unflagged and writes ecReelsSuggest; closeEcReels then sets the
modulus, a and b fields and runs typedCurve. Verified in Chrome from ⟨E₂,₂(𝔽₁₇)⟩: 5 × 17 = 85
and 7 × 17 = 119 suggest a = 2, b = 1, and closing on 85 took curve 85,2,1; no errors.
