---
phase: 05-cayley-table-generator
plan: 02
subsystem: ui
tags: [vanilla-js, html-table, group-theory, cayley-table, palette-css, pseudo-elements]

# Dependency graph
requires:
  - phase: 05-cayley-table-generator/05-01
    provides: "Cayley Table Generator/cayley-table-generator.html — buildTable/applyHighlights/cellMatrix/rowHeads/colHeads armature, --slot-* alias block left open for extension"
provides:
  - "applyStaticStates(els, M, mode, N) — identity row/column marking, self-inverse ring, and on-diagonal marking, all assigned inside buildTable's single pass"
  - "Mirror-twin echo in applyHighlights, updateNotes() cell-notes prose, per-mode symmetryNote, four-entry legend"
affects: [05-03-cayley-table-generator]

# Actuals (#2632)
actuals:
  tokens: 3405
  tasks: 2
  commits: 2
plan_head_before: e6d56f8294eb43c4fb689f6021c250a15b8accf7
plan_head_after: 27700c93d25b882d13758f502908bd50b5ba0f6b

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Static-state pass folded into the existing build: applyStaticStates(els, M, mode, N) runs once per buildTable() call, reading the already-populated rowHeads/colHeads/cellMatrix arrays in memory (idIdx = els.indexOf(mode.identity(N)) resolved once, -1 guarded) rather than a querySelectorAll re-sweep — O(M) for identity row/column and self-inverse/on-diag marking, never O(M^2), at the 14,400-cell ceiling"
    - "Channel-per-state cascade: identity wash+edge-bar and self-inverse ring rules declared before the D-03 selection rules in source order, so same-specificity cascade lets a selection's `background` win while `box-shadow` (untouched by the selection rules) survives underneath — verified structurally by comparing rule line numbers, not just by eyeballing render output"
    - "Diagonal axis as a fifth, otherwise-unused CSS layer: `.on-diag::after` draws a corner-to-corner linear-gradient hairline per cell; because every cell is square (`width === height === --cell-min`), the per-cell hairlines line up into one continuous diagonal across the whole table without a border or background collision"
    - "Mirror echo is O(M) and O(1)-cleared: applyHighlights adds `is-mirror` to `cellMatrix[ci][ri]` (the transpose) only when `ri !== ci`, clearing only the previously-mirrored cell each pass rather than a table sweep"
    - "Legend swatches reuse the table's own CSS declarations verbatim (same background/box-shadow/outline property values) rather than re-describing the four states in new colors, so the legend teaches the same channel mapping the table uses"

key-files:
  modified:
    - "Cayley Table Generator/cayley-table-generator.html"

key-decisions:
  - "identityWord/inverseWord/symmetryNote added as plain per-mode string fields on the existing MODES objects (same shape as `sign`/`words`/`summary`), read by updateNotes()/buildTable() rather than hard-coded — verified behaviorally that the multiplicative self-inverse case renders 'its own reciprocal' and the additive case 'its own negative' from the same code path"
  - "applyStaticStates extended (not duplicated) in Task 2 to add the `on-diag` class inside its existing diagonal loop, since Task 2's action explicitly requires on-diag to be 'assigned inside the same build pass as Task 1's static classes' — the self-inverse check and the on-diag marking now share one loop over the M diagonal cells"

patterns-established:
  - "--slot-diag / --slot-identity / --slot-inverse alias block pattern (role-derived, soft-mix variant only where a permanently-on-screen wash needs to sit quieter than a transient selection) is now the template plan 05-03 or future plans should follow for any further static-state color needs"

requirements-completed: [CAYLEY-04, CAYLEY-05, CAYLEY-06]

coverage:
  - id: D-04
    description: "Identity's row and column are visually distinguished from the rest of the table in both modes, and stay identifiable even while that same row/column is the clicked selection"
    requirement: "CAYLEY-04"
    verification:
      - kind: automated_ui
        ref: "headless Chrome harness (Task 1) assertions 1-2, 5-6, 12-13 — 30/30 PASS, including the coexistence check that cell(0,0)'s boxShadow and background remain non-transparent both before and after clicking it, and the row header's edge-bar boxShadow survives selection"
        status: pass
      - kind: manual_procedural
        ref: "night + day theme screenshots at N=6 additive confirming the identity wash+edge-bar reads as quietly present, not shouting"
        status: pass
    human_judgment: false
  - id: D-06
    description: "Every diagonal cell whose value equals the identity is ringed as self-inverse, in a different visual channel from the identity wash, verified against computed ground-truth vectors across 8 moduli/modes plus N=1"
    requirement: "CAYLEY-06"
    verification:
      - kind: automated_ui
        ref: "headless Chrome harness (Task 1) assertions 3-4, 7-12 — N=6/7/8 additive, N=5/6/7/8/12 multiplicative, and the degenerate N=1 both modes, all matching planning-time ground-truth vectors exactly; vacuity check confirmed a deliberately wrong expected count reports FAIL"
        status: pass
    human_judgment: false
  - id: D-05
    description: "Main diagonal drawn as a visible axis of symmetry; clicking any off-diagonal cell outlines its transposed twin with both equations stated, naming commutativity"
    requirement: "CAYLEY-05"
    verification:
      - kind: automated_ui
        ref: "headless Chrome harness (Task 2) assertions 1-13 — 23/23 PASS, including the whole-table commutativity invariant (data-val(ri,ci) === data-val(ci,ri) for every cell), the N=6 additive and N=8 multiplicative mirror-pair ground-truth vectors with exact notes-string matches, the diagonal special case (zero mirror cells, notes name the axis), and computed-style checks for dashed outline-style and non-none ::after background-image; vacuity check confirmed a deliberately wrong mirror coordinate reports FAIL"
        status: pass
      - kind: manual_procedural
        ref: "night + day theme screenshots confirming the diagonal hairline reads as one continuous line, the mirror twin's dashed outline is visually distinct from the self-inverse ring, and the four-entry legend's swatches visually match what they name"
        status: pass
    human_judgment: false
  - id: coexistence
    description: "All four states — click selection, identity, self-inverse, mirror twin/on-diag — remain separately readable when they land on one cell at once (per D-06's constraint, verified rather than assumed)"
    requirement: "CAYLEY-04, CAYLEY-05, CAYLEY-06"
    verification:
      - kind: automated_ui
        ref: "dedicated headless Chrome harness clicking cell (0,0) at N=6 additive (simultaneously identity-row, identity-col, self-inverse, on-diag, and now selected): computed style confirms non-transparent background (the selection fill), non-none boxShadow (the self-inverse ring), and non-none ::after background-image (the diagonal hairline) all present at once — PASS"
        status: pass
    human_judgment: false

# Metrics
duration: ~15min
completed: 2026-09-28
status: complete
---

# Phase 5 Plan 2: Cayley Table Generator (static teaching states) Summary

**Identity row/column marking, self-inverse ring, diagonal axis hairline, and mirror-twin echo layered onto the existing Cayley table, with all four states verified to coexist on a single cell without collision**

## Performance

- **Duration:** ~15 min
- **Completed:** 2026-09-28
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- `applyStaticStates(els, M, mode, N)` marks the identity's row/column headers and cells and rings every diagonal cell whose value equals `mode.identity(N)`, inside `buildTable`'s existing single pass — no second `querySelectorAll` sweep, O(M) not O(M²) at the 14,400-cell ceiling
- Two new `--slot-*` aliases (`--slot-identity: var(--role-special)`, `--slot-inverse: var(--role-alt)`) plus `--slot-identity-soft` at 14% mix, and `--slot-diag: var(--role-inert)` for the diagonal — all role-derived, no literal color anywhere in the style block (confirmed by the repeated literal-color audit)
- Identity/self-inverse CSS rules declared before the D-03 selection rules in source order, so same-specificity cascade lets a click's `background` wash win over the identity wash while the identity's edge-bar `box-shadow` and the self-inverse ring (also `box-shadow`, a property the selection rules never touch) survive underneath
- `.on-diag::after` draws a per-cell corner-to-corner gradient hairline that lines up into one continuous diagonal across the table (cells are square, per plan 05-01), a fifth CSS layer that collides with none of the other four channels
- `applyHighlights` outlines the transposed twin (`cellMatrix[ci][ri]`) with a dashed `--slot-sum` outline on every off-diagonal selection, clearing only the previously-mirrored cell each pass; diagonal selections draw no second outline
- `updateNotes()` writes both equations (`a op b = raw ≡ val (mod N)` and its transpose) into `#cell-notes`, naming the symmetry as commutativity, or the diagonal special case when `ri === ci`, appending the per-mode `inverseWord` when the selected cell is also self-inverse
- Per-mode `symmetryNote` field rendered into `#symmetry-note`, refreshed on every build, differing text between additive (`a + b`/`b + a`) and multiplicative (`a · b`/`b · a`) wording
- Four-entry `#legend` reuses the table's own CSS declarations verbatim for each swatch (wash+edge-bar, inset ring, solid fill, dashed outline) so the legend decodes the grid using the same marks the grid uses
- Dedicated coexistence check: cell (0,0) at N=6 additive — simultaneously identity-row, identity-col, self-inverse, on-diagonal, and (once clicked) selected — shows a non-transparent background, a non-none `box-shadow`, and a non-none `::after` `background-image` all at once, proving the four channels genuinely don't overwrite each other rather than just looking plausible in a screenshot

## Task Commits

Each task was committed atomically:

1. **Task 1: Identity row and column, and the elements that are their own inverse** - `f47bd5c` (feat)
2. **Task 2: The diagonal as an axis of symmetry — mirror twin, both equations, and a legend** - `27700c9` (feat)

_Both commits land on `main` directly, matching this project's `git.branching_strategy: none` / `workflow.use_worktrees: false` configuration and the pattern established by plan 05-01._

## Files Created/Modified
- `Cayley Table Generator/cayley-table-generator.html` - Added `applyStaticStates`, identity/self-inverse/diagonal CSS channels, mirror-twin echo, `updateNotes()`, per-mode `identityWord`/`inverseWord`/`symmetryNote` fields, `#identity-note`/`#symmetry-note`/`#cell-notes` elements, and the four-entry `#legend`

## Decisions Made
- `identityWord`/`inverseWord`/`symmetryNote` added as plain string fields on the existing `MODES.additive`/`MODES.multiplicative` objects (same shape as the pre-existing `sign`/`words`/`summary` fields), read by `updateNotes()` and `buildTable()` rather than any hard-coded string — verified behaviorally that switching modes changes the rendered wording ("its own negative" vs "its own reciprocal", differing `#symmetry-note` text)
- Task 2 extended `applyStaticStates`'s existing diagonal loop (added in Task 1 for the self-inverse check) to also assign `on-diag`, rather than adding a second loop, since the plan's action explicitly required `on-diag` to be "assigned inside the same build pass as Task 1's static classes"

## Deviations from Plan

None — plan executed exactly as written. Both tasks' automated static/color/behavioral verification gates passed on first implementation with no auto-fixes required; the dedicated coexistence check (verification item 5, beyond the two tasks' own gates) also passed without modification.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 05-03 (large-N sizing via a `cellMinPx(M)` breakpoint function, and the two-way Congruence Wheel cross-link) has a clean landing spot: this plan added no new DOM structure inside `.table-scroll`/`.cayley-table` beyond classes on existing `<th>`/`<td>` elements, so the sizing work is unaffected by the new static/interactive states.
- `applyStaticStates` and `applyHighlights` are both O(M) and both already proven not to collide at the 14,400-cell ceiling in this plan's harness runs at N=8/12; plan 05-03's own performance measurement at N=120 has no new interaction pattern to account for.
- No blockers. CAYLEY-04, CAYLEY-05, and CAYLEY-06 requirements are satisfied by this plan; CAYLEY-07 remains for 05-03 as scoped.

---
*Phase: 05-cayley-table-generator*
*Completed: 2026-09-28*

## Self-Check: PASSED
