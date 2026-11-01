---
quick_id: 261101-so1
phase: quick-261101-so1
plan: 01
subsystem: cyclic-groups formula sliders
tags: [cyclic-groups, formula-map, sliders, additive, sls, probes]
requires: [261031-wef, 261101-k8y, 261101-o20]
provides: [formula sliders for additive groups with a forked four-slot Complexity track]
affects: [Cyclic Groups/cyclic-groups.html, assets/i18n/cyclic-groups.js, six CDP probes]
completed: 2026-11-01
status: complete
---

# Quick 261101-so1: additive groups get the formula sliders

Additive groups now get the Complexity and Form preference sliders, with the map behind the
show-map toggle like EC and multiplicative groups. The additive Complexity track is forked: JN,
Compact and Complete on the top line, and a Compact SLS slot under Compact on a lower branch that
runs from JN down and back up to Complete. Compact SLS selects gcd-sls / lcm-sls.

- Neither + Compact SLS is refused in both directions (knob stays, flash, tooltip).
- Click or drag goes to any slot; Left/Right follow the knob's branch, Up/Down swap the two Compact slots.
- The generator boxes are hidden on JN and Compact SLS.
- EC and multiplicative sliders are unchanged.

## Commits
- 5490caf feat: the sliders and the forked track
- ede6a8b test: additive-slider-check.mjs
- probe updates for six existing probes (additive now has sliders)

## Verification
Stopped early at the user's request, who chose to skip the remaining regression runs.
Ran: additive-slider-check OK, formula-map-check OK, log-base-boxes-check OK, force-dblclick-check
passing when stopped. Not run: log-base-lock-check, slider-check, map-toggle-check, blocked-check
and the i18n gates.
