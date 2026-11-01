---
quick_id: 261101-tpr
phase: quick-261101-tpr
plan: 01
subsystem: cyclic-groups formula sliders
tags: [cyclic-groups, sliders, sls, probes]
requires: [261101-so1]
provides: [one forked four-slot Complexity slider for every group; SLS branch grayed out and inaccessible on EC and multiplicative groups]
affects: [Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js, two CDP probes]
completed: 2026-11-01
status: complete
---

# Quick 261101-tpr: universal forked Complexity slider

EC and multiplicative groups now show the same four-slot forked Complexity slider as additive
groups. The Compact SLS slot, its label and the lower branch are grayed out and inaccessible there
(aria-disabled, tooltip saying SLS forms exist only for additive groups). Additive groups are unchanged.

## Verification
Stopped early at the user's request. additive-slider-check passed (207, incl. the new EC and
multiplicative cases). slider-check was not completed after its assertions were updated; screenshots
and the i18n gates were skipped.
