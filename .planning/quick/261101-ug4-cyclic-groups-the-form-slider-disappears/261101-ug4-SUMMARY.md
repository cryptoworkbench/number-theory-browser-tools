---
quick_id: 261101-ug4
phase: quick-261101-ug4
plan: 01
subsystem: cyclic-groups formula sliders
tags: [cyclic-groups, sliders]
requires: [261101-ue7]
completed: 2026-11-01
status: complete
---

# Quick 261101-ug4: form slider hidden at Short

While a formula's Complexity knob is at Short its LCM / neither / GCD slider row is not displayed
(.fsl-row.is-gone, display:none); it returns at compact, compact SLS or complete. Commit d36dcb9.
map-window-check.mjs gained two assertions: 30 pass, 0 fail.
