---
quick_id: 261117-z6k
status: complete
---

# 261117-z6k Summary

Step 2 of the user's request (remaining stutter with Keep the result on top), first pass.

Located: a full run has ~300 of its 427 slow frames in steps 2–10 (the walk down through the wheel), main-thread bound (busy p90 ~20 ms; Layerize is the largest part headless); plus long redraws at the first step (457 ms) and at the zoom-fit change (400 ms). Details and the attempts without effect in the perf log (Open item 5).

Kept (marginal): the :has() shim ignores attribute changes that no rewritten rule reads (READ_ATTRS built at load from the rules' selectors), and syncIsoLinks writes chip attributes only when they differ, so the idle address-bar flush no longer sets off a full shim sync each step. Steps 2–10, alternated: HEAD 286/28, 320/32 vs new 280/25, 313/24 (frames > 25 / > 50 ms). Shim equivalence checks pass; no page errors.
