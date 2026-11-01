---
quick_id: 261101-vr4
phase: quick-261101-vr4
plan: 01
subsystem: cyclic-groups formula sliders
tags: [cyclic-groups, sliders, tooltips]
requires: [261101-vmv]
completed: 2026-11-01
status: complete
---

# Quick 261101-vr4: form slider caption and tooltip

The LCM / GCD slider's middle caption "neither" is hidden (.fsl-label.is-blank, visibility so LCM
and GCD keep their places). The slider has one tooltip, "Preferred formula form slider"
(fslFormTip, English-only), wherever it is hovered: its slots carry no titles of their own any more,
so the per-slot map tooltips and the refusal explanations on its slots no longer show there.
Commit 284c269. form-tooltip-check.mjs (ℤ/12ℤ, (ℤ/13ℤ)*): 6 pass.
