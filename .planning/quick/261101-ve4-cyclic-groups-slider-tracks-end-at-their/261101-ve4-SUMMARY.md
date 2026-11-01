---
quick_id: 261101-ve4
phase: quick-261101-ve4
plan: 01
subsystem: cyclic-groups formula sliders
tags: [cyclic-groups, sliders]
requires: [261101-vcx]
completed: 2026-11-01
status: complete
---

# Quick 261101-ve4: no protruding track ends

The form track (.fsl-track, left/right 100%/6) and the complexity track's top line (M31 0H155)
now end at the centres of their outer slots instead of running 7 px past them. Commit 8554cc0.
tooltip-check.mjs re-run: 8 pass; screenshot checked.
