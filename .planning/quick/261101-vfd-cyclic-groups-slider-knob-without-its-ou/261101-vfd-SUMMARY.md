---
quick_id: 261101-vfd
phase: quick-261101-vfd
plan: 01
subsystem: cyclic-groups formula sliders
tags: [cyclic-groups, sliders]
requires: [261101-ve4]
completed: 2026-11-01
status: complete
---

# Quick 261101-vfd: knob without its ring

The sliders' knob loses its 2 px surface border and 1 px outer ring (also in the dragged and inert
states): a plain accent disc with its soft drop shadow; the drag halo stays. Commit e7a020b.
tooltip-check.mjs re-run: 8 pass; screenshot checked.
