---
quick_id: 261101-vmv
phase: quick-261101-vmv
plan: 01
subsystem: cyclic-groups log-base picker
tags: [cyclic-groups, log-base, tooltips]
requires: [261101-vht]
completed: 2026-11-01
status: complete
---

# Quick 261101-vmv: log-base picker introduced

Whenever the base row shows, a sentence (.lb-intro, English-only logBaseIntro) sits directly above
it: "This mode uses a logarithm in order to function, so pick a generator from the group in order
to use as the base for the logarithm (*):". The * (.lb-intro-star, focusable) carries the tooltip
logBaseIntroStar, the user's text verbatim. Commit 92068ee.
log-base-intro-check.mjs (ℤ/12ℤ, (ℤ/13ℤ)*): 10 pass; screenshots checked.
