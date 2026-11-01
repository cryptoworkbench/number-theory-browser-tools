---
quick_id: 261101-uz0
phase: quick-261101-uz0
plan: 01
subsystem: cyclic-groups formula sliders
tags: [cyclic-groups, sliders, tooltips]
requires: [261101-u47]
completed: 2026-11-01
status: complete
---

# Quick 261101-uz0: column-led complexity tooltips, no captions

Every complexity slot's tooltip (including the blocked, SLS-neither and greyed-out SLS variants)
now opens with its column's name and a blank line: Short, Compact, Complete; compact SLS sits in
the Compact column. fslShortTip lost its own "Short: " lead. The slots' captions (Short, compact,
complete, compact SLS) are no longer shown (display:none, --fsl-lh 0), so the forked track is
shorter. Commit 72cb7fb. tooltip-check.mjs: 8 pass, 0 fail (ℤ/12ℤ and (ℤ/13ℤ)*).
