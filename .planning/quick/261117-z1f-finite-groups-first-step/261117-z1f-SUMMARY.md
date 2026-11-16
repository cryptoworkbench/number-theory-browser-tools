---
quick_id: 261117-z1f
status: complete
commit: 75b23bd
---

# 261117-z1f Summary

The shim itself cost 111 ms over the first 1.5 s (live-list re-walks, descendant :has() walks): now 6.3 ms. The first step's task stays ~380 ms headless: mostly the ~3,300 wheel numbers (creation, style, layout, paint). Regression: screenshots of 5 states identical to 2b4731a (one flaky capture re-run 3x identical), selector equivalence 0 diffs in two layouts, slow run to k=28 without errors.
