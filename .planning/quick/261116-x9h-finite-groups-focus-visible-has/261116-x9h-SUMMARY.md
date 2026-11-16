---
quick_id: 261116-x9h
status: complete
commit: be069bd
---

# 261116-x9h Summary

The :focus-visible family caused most of the cost; replaced by has-fv/has-fv-sub classes kept by syncFocusVisible. Headless insert pass 5.3 → 4.5 ms (floor 2.6); user's Chrome forced layout per step 44-53 → 27-30 ms. The rest is spread over all remaining rules: only converting all would remove it (generic shim, not built).
