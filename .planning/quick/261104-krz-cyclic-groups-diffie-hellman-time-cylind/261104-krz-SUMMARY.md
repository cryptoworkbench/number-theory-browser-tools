---
phase: quick-261104-krz
plan: 01
subsystem: cyclic-groups
tags: [cyclic-groups, diffie-hellman, svg, 3d-projection, variants]
requires: []
provides:
  - "Diffie-Hellman time cylinder window (Time cylinder button in the DH window) in four layout variants on four branches"
affects: ["Cyclic Groups/cyclic-groups.html", "assets/i18n/cyclic-groups.js"]
key-files:
  modified:
    - "Cyclic Groups/cyclic-groups.html"
    - "assets/i18n/cyclic-groups.js"
decisions:
  - "Branches only, nothing committed to main (main stays at 22cd9e4), per the user's explicit request"
  - "New dhCyl* strings are English-only (project's English-first rule); header comment lists them"
status: complete
commits: 9
plan_head_before: 22cd9e4
plan_head_after: 22cd9e4
actuals:
  tokens: 60000
  tasks: 3
  commits: 9
---

# Quick 261104-krz: Diffie-Hellman time cylinder, four variants

A Time cylinder button in the Diffie-Hellman window opens a separate movable window with a
see-through cylinder: time runs up the axis, each slice is the ring at one moment of the
exchange (beads in the ring's own arrangement), only slices up to the current step are drawn,
the current step's slice(s) are outlined and newly revealed pieces fade in hop by hop. A drag
on the picture (or arrow keys / Home when focused; double click resets) turns the cylinder;
dragging the window's head moves the window.

Note on `commits` / `plan_head_*`: all work is on branches, main was never advanced, so
`git rev-list main` would measure 0 and `plan_head_after` equals `plan_head_before`. The 9 is
the number of distinct commits created (1 base + 2 hop-shared + 2 frame-shared + 2 hop-split
+ 2 frame-split; several are cherry-picks of the same change).

## Branches

| Branch | Slices | Cylinders | Commits (base 9e5ad75 + two) |
|--------|--------|-----------|------------------------------|
| dh-cylinder-base | none (shell only) | none | 9e5ad75 (main + 1; the page loads clean, but the cylinder cannot be drawn: dhcTimeline/dhcLayout are undefined) |
| dh-cylinder-hop-shared | 32 (one per hop) | 1 shared | 3076303 (hop slices), c3fc845 (shared cylinder) |
| dh-cylinder-hop-split | 32 | 2 (Alice's, Bob's) | 25cfa02 (hop slices, cherry-pick), 2da045f (two cylinders) |
| dh-cylinder-frame-shared | 7 (one per frame) | 1 shared | a82a3aa (frame slices), bc3ab2f (shared cylinder, cherry-pick) |
| dh-cylinder-frame-split | 7 | 2 | e4a6b28 (frame slices, cherry-pick), b9d1bc9 (two cylinders, cherry-pick) |

main is at 22cd9e4 with no tracked changes; the working tree is back on main. Untracked files
were left alone. All commits end with the Co-Authored-By / Claude-Session trailers.

To compare: `git checkout -q BRANCH`, open `Cyclic Groups/cyclic-groups.html?mode=multiplicative&n=23&gen=5&dh=5,6,15`,
press Time cylinder in the Diffie-Hellman window, then Step / Play / Instant.

## Verification (per branch, probe = dhc-probe.mjs, headless Chrome over CDP, 1440x900)

Each branch passed the full probe with zero console errors (desktop and `&mobile=1`):
#dh-plot visible and `.dh-ctl .dh-cyl` has text; the click unhides #dhc-plot and its rect does
not overlap #dh-plot (e.g. dh [1035,133,1422,310], dhc [1116,317,1422,766]); `.dhc-wall` = 2*C;
`.dhc-rim.is-front` = C at step 0 and C*N after Instant; every cylinder has a `.dhc-mark.is-key`;
a real mouse drag across the svg changes the svg but not #dhc-plot's translate; an ArrowLeft key
turns it; a drag on the window head changes translate; second click closes, #dh-close closes both;
mobile load: #dhc-plot hidden, zero errors.

| Branch | Probe args | Result | Rim fronts step 0 / end | Primitives at end | Fresh pieces after Back, Step |
|--------|-----------|--------|-------------------------|-------------------|-------------------------------|
| hop-shared | --slices 32 --cyls 1 | all PASS | 1 / 32 | 274 | 87 |
| hop-split | --slices 32 --cyls 2 | all PASS | 2 / 64 | 415 | 129 |
| frame-shared | --slices 7 --cyls 1 | all PASS | 1 / 7 | 256 | 41 |
| frame-split | --slices 7 --cyls 2 | all PASS | 2 / 14 | 439 | 67 |

Screenshots of the end state were taken for all four (scratchpad, not committed) and read for
sanity: hop variants show the walks spiralling up the squashed cylinder, frame variants show
seven distinct ring slices with each step's chords.

Sweep per branch: the three inline scripts parse (`new Function`); `node --check
assets/i18n/cyclic-groups.js` ok; exactly one `function dhcTimeline` and one `function
dhcLayout`; `git diff --stat dh-cylinder-base..BRANCH` names only `Cyclic Groups/cyclic-groups.html`.

i18n-check `--all` (main baseline measured first, then on base and on every variant branch):

| Gate | main 22cd9e4 | every branch |
|------|--------------|--------------|
| --coverage | 91 | 91 |
| --literals-markup | 4 | 4 |
| --literals-js | 131 | 131 |

Base diff vs main: 0 added lines containing `innerHTML`, 0 containing a colour literal
(hex, rgb(a), hsl(a)).

## Deviations from Plan

**1. [Rule 3 - Blocking] Window-level arrow-key handler swallowed the cylinder's keys**
- **Found during:** Task 1 probe (arrow key did not turn the cylinder; a document-level capture
  listener never even saw ArrowLeft).
- **Issue:** a capture-phase `window` keydown handler (the ring's arrow-key navigation through
  subgroups) preventDefault/stopPropagation on every arrow key unless the target is in an
  exempted element, so the focused cylinder never got them.
- **Fix:** added `.dhc-svg` to that handler's existing exemptions (next to `.cayley-scroll`, with a
  one-line comment). Lives in the base commit, so all four branches have it.
- **Files modified:** Cyclic Groups/cyclic-groups.html
- **Commit:** 9e5ad75

**2. [Minor additions, same commit]** besides the plan's CSS: `.dhc-mark.is-now` gets a thin
text-colour stroke so the current step's marks read as highlighted; hop slices carry an optional
`hop` field (documented in the dhcTimeline contract) so a newly revealed slice's rim fades in
in step with its thread's hop; the a = b case's slice tag reads "2, 3" / "5, 6". The probe also
gained an optional `--shots DIR` screenshot flag (untracked artifact).

Otherwise: plan executed as written.

## Known Stubs

None. The six `dhCyl*` strings exist only in the English block by design (English-first rule); other
languages fall back to English through NT.i18n until translations are requested.

## Threat Flags

None. Strings reach the DOM via `textContent` / `setAttribute` on svgEl-built nodes; camera state
is two clamped angles (pitch 0.08..1.45); redraw cost is bounded by DHC_RIM_CAP / DHC_BEAD_CAP,
the fixed axis length and the signature-skipped, rAF-coalesced redraws.

## Self-Check: PASSED

All five branches exist with the commit counts above (`git rev-list --count dh-cylinder-base..BRANCH` = 2 each, base = main + 1);
main at 22cd9e4; probe, parse and i18n gates re-run on each branch during the final sweep.
The untracked verification probe is at `.planning/quick/261104-krz-cyclic-groups-diffie-hellman-time-cylind/dhc-probe.mjs`.
