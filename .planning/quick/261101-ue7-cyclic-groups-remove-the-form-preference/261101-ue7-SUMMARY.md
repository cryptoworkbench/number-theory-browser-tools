---
quick_id: 261101-ue7
phase: quick-261101-ue7
plan: 01
subsystem: cyclic-groups formula sliders
tags: [cyclic-groups, sliders]
requires: [261101-u47]
completed: 2026-11-01
status: complete
---

# Quick 261101-ue7: no Form preference caption

The Form preference slider's visible caption is removed (the .fsl-name element, its CSS and the
English-only fslForm string); the slider keeps its aria-label. Commit 0588912.
map-window-check.mjs updated to expect no captions: 28 pass, 0 fail.
