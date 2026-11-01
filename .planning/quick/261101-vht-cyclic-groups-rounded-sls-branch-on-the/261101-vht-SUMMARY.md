---
quick_id: 261101-vht
phase: quick-261101-vht
plan: 01
subsystem: cyclic-groups formula sliders
tags: [cyclic-groups, sliders]
requires: [261101-vfd]
completed: 2026-11-01
status: complete
---

# Quick 261101-vht: rounded SLS branch

The Complexity track's branch no longer bends at 45° corners: from Short it leaves level with the
top line in a cubic S-curve down to the branch level, and mirrors that up to Complete. The knob's
geometry samples each curve at 8 points (fslForkBend, fslForkBendEdges), so gliding and dragging
follow the drawn curve. Commit 019f95e. tooltip-check.mjs: 8 pass, no page exceptions; 3x screenshot
shot-vht-zn-3x.png checked.
