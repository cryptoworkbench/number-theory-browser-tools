---
phase: 05-cayley-table-generator
plan: 03
subsystem: ui
tags: [vanilla-js, html-table, group-theory, cayley-table, palette-css, cross-link, responsive-sizing]

# Dependency graph
requires:
  - phase: 05-cayley-table-generator/05-01
    provides: "Cayley Table Generator/cayley-table-generator.html — buildTable/applyHighlights/cellMatrix/rowHeads/colHeads armature, --cell-min declared once on .table-scroll as a static 46px placeholder, page-header intentionally carrying no cross-link yet"
  - phase: 05-cayley-table-generator/05-02
    provides: "applyStaticStates (identity/self-inverse/on-diag), mirror-twin echo, legend — no new DOM structure inside .table-scroll/.cayley-table beyond classes on existing th/td"
provides:
  - "cellMinPx(M) six-branch sizing ladder (46/40/34/29/25/22px) keyed to the current mode's element count M, wired into buildTable via setProperty('--cell-min', ...) on #table-scroll"
  - "Two-way .xref cross-link between the Cayley Table Generator and the Congruence Wheel, duplicating the Euclidean Algorithm <-> Venn Diagrams pattern"
  - "Phase-wide consolidated behavioral sweep (182 assertions) and site sweep proving all eight phase requirements green on the final files"
affects: []

# Actuals (#2632)
actuals:
  tokens: 1020
  tasks: 3
  commits: 2
plan_head_before: fdbf2ce272644be382628773f526a9e8466c3b12
plan_head_after: 2d54d296b7dfe9867ce21b7b415c132573e77490

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "cellMinPx(M) re-derived (not copied) from the Sieve's cellMinPx(size): the Sieve's cell count grows linearly in its input, this table's grows quadratically (M x M), so both the breakpoints and the 22px floor are new numbers for a new curve; keyed to the current mode's element count M, never to N, so multiplicative mode's phi(N)-sized table never inherits additive mode's floor at the same N"
    - "Structure-build-time sizing: cellMinPx(M) is called once per buildTable(), before any cell is created, and written onto #table-scroll (the container) rather than documentElement — a property only this table consumes stays scoped to this table"
    - "Click-timing methodology: a real mouse click can only ever land on a cell already inside the viewport, so the click budget is measured against a visible cell at scrollTop=0/scrollLeft=0, not an arbitrary off-screen cell — the browser's native scrollIntoView-on-focus (triggered when focusing an off-screen element, the keyboard arrow-key case) is a separate cost from the O(M) highlight-pass the 60ms budget is about, and conflating the two produced a false failure during measurement (see Deviations)"
    - ".xref cross-link duplicated verbatim from the Euclidean Algorithm <-> Venn Diagrams pair: a single p.xref anchor in .page-header after the lede, three single-line CSS rules resolving through --role-input/--role-result, placed outside any mode-swapped span so a mode switch can never make the link disappear"

key-files:
  modified:
    - "Cayley Table Generator/cayley-table-generator.html"
    - "Congruence Wheel/congruence-wheel.html"

key-decisions:
  - "Click-budget measurement target changed from an arbitrary far cell (ri=50,ci=60) to a viewport-visible cell (ri=1,ci=1) at scrollTop=0/scrollLeft=0. The original target, combined with a scroll position left over from the sticky-header test, forced the browser's native focus-triggered scrollIntoView machinery to run (confirmed by instrumenting HTMLElement.prototype.focus in the harness: ~228ms of the ~250ms measured was inside focus() itself, not inside select()/applyHighlights()). A real mouse click can only ever land on an already-visible cell, so this is a test-methodology correction, not a product code change — select()'s unconditional td.focus() (no {preventScroll:true}) is left as-is because scrollIntoView-on-focus is the correct, wanted behavior for keyboard arrow-key navigation past the viewport edge."
  - "MAX_N stayed at 120 — the measured 120x120 additive build (~38-65ms across runs) and a same-viewport click (~12-25ms) both land far inside their 600ms/60ms budgets, so no lowering was needed and plan 05-01's ceiling stands unchanged."

requirements-completed: [CAYLEY-01, CAYLEY-02, CAYLEY-03, CAYLEY-04, CAYLEY-05, CAYLEY-06, CAYLEY-07, NAV-03]

coverage:
  - id: sizing-ladder
    description: "cellMinPx(M) returns the derived 46/40/34/29/25/22px ladder keyed to the current mode's element count M (not N); the units table at N=120 (32 elements) renders at 34px while the additive table at N=120 (120 elements) renders at the 22px floor"
    requirement: "CAYLEY-01"
    verification:
      - kind: automated_ui
        ref: "headless Chrome harness (Task 1): eight additive readings N=6..120, two multiplicative readings N=120/N=100 proving M-keying, font-size clamp at both ends (15px/9px), square cells at both ends — 27/27 PASS; vacuity check confirmed a deliberately wrong multiplicative expectation (22px instead of 34px) reports FAIL"
        status: pass
      - kind: manual_procedural
        ref: "headless-Chrome screenshots at N=120 in both modes (night theme): additive renders at the 22px floor with horizontal+vertical scroll and pinned headers; multiplicative renders comfortably larger (34px), proving the units table never inherits additive's floor at the same N"
        status: pass
    human_judgment: false
  - id: scroll-and-sticky
    description: "Cells shrink to the legibility floor before the container scrolls; at the ceiling both axes scroll with thead/tbody/corner headers pinned, opaque, and correctly z-index-stacked"
    requirement: "CAYLEY-01"
    verification:
      - kind: automated_ui
        ref: "headless Chrome harness (Task 1): no horizontal overflow at N=6, real overflow at N=120, sticky headers stay within 2px of the container edge under a real scrollTop/scrollLeft=200 scroll, corner z-index numerically outranks both axes, corner background is non-transparent — all PASS"
        status: pass
      - kind: manual_procedural
        ref: "headless-Chrome screenshot walking N from 6 to 120 in both modes: cells visibly shrink, then the panel scrolls with the top header row and left header column staying put and the corner symbol pinned; three-digit values at N=120 are not clipped"
        status: pass
    human_judgment: false
  - id: perf-budget
    description: "The 120x120 additive build completes under 600ms and a single cell click at that size completes under 60ms, measured rather than assumed"
    requirement: "CAYLEY-01"
    verification:
      - kind: automated_ui
        ref: "headless Chrome harness (Task 1 isolated run: build=38.40ms click=25.10ms; Task 3 consolidated run: build=65.10ms click=11.70ms) — both runs comfortably inside budget across repeated measurements"
        status: pass
    human_judgment: false
  - id: mode-toggle-carryforward
    description: "Additive/Multiplicative mode toggle continues to switch element list, operation, corner symbol and group summary correctly after the sizing and cross-link changes"
    requirement: "CAYLEY-02"
    verification:
      - kind: automated_ui
        ref: "consolidated phase-wide harness (Task 3) section A8/A9, ported from plan 05-01's own 93-assertion harness — re-run against the final file, 0 regressions"
        status: pass
    human_judgment: false
  - id: click-select-carryforward
    description: "Click/keyboard cell selection and the equation caption continue to work correctly after the sizing and cross-link changes"
    requirement: "CAYLEY-03"
    verification:
      - kind: automated_ui
        ref: "consolidated phase-wide harness (Task 3) section A4-A7, ported from plan 05-01's harness — re-run against the final file, 0 regressions"
        status: pass
    human_judgment: false
  - id: identity-carryforward
    description: "Identity row/column marking and its survival under a click selection continue to work correctly after the sizing and cross-link changes"
    requirement: "CAYLEY-04"
    verification:
      - kind: automated_ui
        ref: "consolidated phase-wide harness (Task 3) section B, ported from plan 05-02 Task 1's 30-assertion harness — re-run against the final file, 0 regressions"
        status: pass
    human_judgment: false
  - id: diagonal-mirror-carryforward
    description: "Diagonal axis, mirror-twin echo, both-equations notes and the whole-table commutativity invariant continue to hold after the sizing and cross-link changes"
    requirement: "CAYLEY-05"
    verification:
      - kind: automated_ui
        ref: "consolidated phase-wide harness (Task 3) section C, ported from plan 05-02 Task 2's 23-assertion harness — re-run against the final file, 0 regressions"
        status: pass
    human_judgment: false
  - id: self-inverse-carryforward
    description: "Self-inverse ring marking across moduli and both modes continues to work correctly after the sizing and cross-link changes"
    requirement: "CAYLEY-06"
    verification:
      - kind: automated_ui
        ref: "consolidated phase-wide harness (Task 3) section B (self-inverse sub-assertions across N=6/7/8/12 additive and multiplicative, plus N=1 both modes) — re-run against the final file, 0 regressions; dedicated coexistence check (section D) confirms selection + identity + self-inverse + on-diagonal remain simultaneously legible on one cell"
        status: pass
    human_judgment: false
  - id: cross-link
    description: "A learner can move between the Cayley Table Generator and the Congruence Wheel in both directions from a visible in-page link"
    requirement: "CAYLEY-07"
    verification:
      - kind: automated_ui
        ref: "presence/direction gate (both hrefs resolve to real files, exactly one p.xref per page, wheel's anchor sits after its mode-swapped lede), no-collateral gate (wheel gained 4 insertions/0 deletions, all xref-related), both-directions render gate (both dumps carry class=\"xref\", no Uncaught, wheel's diagram + both mode tabs still render) — all PASS"
        status: pass
      - kind: manual_procedural
        ref: "headless-Chrome screenshots of both pages in both themes: the link reads as a quiet signpost styled identically to the Euclidean Algorithm <-> Venn Diagrams pair, legible in day and night"
        status: pass
    human_judgment: false
  - id: nav-sweep
    description: "All twelve pages list all eleven tools in the shared nav with exactly one active link; index.html carries eleven cards and both eleven-tool count sentences"
    requirement: "NAV-03"
    verification:
      - kind: automated_ui
        ref: "final site sweep (Task 3): 12 site-nav-link + exactly 1 is-active per page across all 12 pages, Cayley link present on all 12, 11 class=\"card\" in index.html, no stale ten-tool phrasing, both eleven-tool sentences present (hero + footer)"
        status: pass
    human_judgment: false

# Metrics
duration: ~25min
completed: 2026-09-28
status: complete
---

# Phase 5 Plan 3: Cayley Table Generator (large-N sizing, cross-link, phase close) Summary

**Derived and measured a quadratic-growth cellMinPx(M) sizing ladder that shrinks cells to a 22px floor before the container scrolls (headers pinned, opaque, correctly stacked) at the N=120 ceiling; wired a two-way cross-link with the Congruence Wheel; closed the phase with a 182-assertion consolidated sweep proving all eight requirements green**

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-09-28
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- `cellMinPx(M)` added as a six-branch step function returning the derived 46/40/34/29/25/22px ladder, keyed to the current mode's element count `M` (never to `N`) — called once per `buildTable()`, before any cell is created, writing `--cell-min` onto `#table-scroll` via `setProperty`
- Confirmed and proved at the ceiling (not assumed): `.table-scroll` scrolls both axes, every `th`/`td` derives its size and font from `--cell-min`, `thead th`/`tbody th`/`th.corner` stay sticky and opaque with `th.corner` outranking both axes in `z-index`, and `border-collapse:separate` is intact
- Measured in headless Chrome: the 120×120 additive build completes in 38-65ms (budget 600ms) and a same-viewport cell click completes in 12-25ms (budget 60ms) — `MAX_N` stayed at 120, no lowering needed
- Verified the M-keying is real, not accidental: multiplicative mode at N=120 (φ(120)=32 elements) renders at 34px, nowhere near the 22px floor additive mode hits at the same N — confirmed both by a headless-Chrome computed-style assertion and by side-by-side screenshots
- Added a two-way `.xref` cross-link between the Cayley Table Generator and the Congruence Wheel, duplicating the Euclidean Algorithm ↔ Venn Diagrams pattern verbatim; the wheel's anchor sits after its mode-swapped lede so a mode switch never hides it; the wheel gained exactly 4 insertions and 0 deletions
- Closed the phase with a single consolidated 182-assertion headless-Chrome harness (ported and re-run from all three plans' own harnesses: 93 from 05-01 + 30 + 23 from 05-02 + 27 from 05-03, for a floor of 173) plus a final site sweep (twelve-page nav, eleven hub cards, both tool-count sentences, self-containment, literal-color audits) — all green with zero regressions found

## Task Commits

Each task was committed atomically:

1. **Task 1: Shrink, then scroll — size the table to its element count and prove it at the ceiling** - `089f9da` (feat)
2. **Task 2: Two-way cross-link with the Congruence Wheel** - `2d54d29` (feat)
3. **Task 3: Phase-wide sweep — every requirement, every page, one green run** - no code commit (verification-only task; zero regressions found, nothing to fix)

_Both code commits land on `main` directly, matching this project's `git.branching_strategy: none` / `workflow.use_worktrees: false` configuration and the pattern established by plans 05-01 and 05-02._

## Files Created/Modified

- `Cayley Table Generator/cayley-table-generator.html` - Added `cellMinPx(M)` and its `buildTable()` wiring; added the outbound `p.xref` to the Congruence Wheel plus its three CSS rules
- `Congruence Wheel/congruence-wheel.html` - Added the reciprocal `p.xref` to the Cayley Table Generator (placed after the mode-swapped lede) plus its three CSS rules — 4 insertions, 0 deletions total

## Decisions Made

- Click-budget measurement target moved from an arbitrary far cell to a viewport-visible cell at `scrollTop=0`/`scrollLeft=0`. Instrumenting `HTMLElement.prototype.focus` in the harness showed the original measurement (~250ms) was ~228ms inside the browser's own native `focus()`-triggered `scrollIntoView`, not inside `select()`/`applyHighlights()` — a test-methodology artifact from picking an off-screen click target after an earlier sticky-scroll assertion had left the container scrolled. Since a real mouse click can only ever land on an already-visible cell, the harness now measures that case; production code's unconditional `td.focus()` is unchanged, since scroll-into-view-on-focus is the correct behavior for keyboard arrow-key navigation past the viewport edge.
- `MAX_N` stayed at 120 (no plan 05-01 ceiling change needed) — both the build and click budgets were met with wide margin across every measurement run.

## Deviations from Plan

None affecting shipped product code — plan executed exactly as written for both feature tasks. One test-harness methodology correction is documented above under Decisions Made (not a Rule 1-4 deviation, since no production code changed): the click-timing measurement target was corrected to a viewport-visible cell so the budget measures the O(M) highlight-pass cost the plan's 60ms figure is about, rather than the browser's separate native scroll-into-view cost for an off-screen focus target.

## Issues Encountered

None blocking. The click-timing methodology issue above was caught and resolved during Task 1's own verification loop before commit, so it never reached Task 3's phase-wide sweep as a live gap.

## User Setup Required

None - no external service configuration required.

## Phase Close — Requirement Coverage Record

| Requirement | Gate(s) |
|---|---|
| CAYLEY-01 | `STATIC-COMPLETE` (sizing wiring), sizing/sticky/timing headless-Chrome harness (Task 1, 27/27), consolidated sweep section E (Task 3) |
| CAYLEY-02 | consolidated sweep section A8/A9 (ported from 05-01's 93-assertion harness), `data-cayley-phase="PASS 182"` |
| CAYLEY-03 | consolidated sweep section A4-A7 (ported from 05-01), `data-cayley-phase="PASS 182"` |
| CAYLEY-04 | consolidated sweep section B (ported from 05-02 Task 1's 30-assertion harness), `data-cayley-phase="PASS 182"` |
| CAYLEY-05 | consolidated sweep section C (ported from 05-02 Task 2's 23-assertion harness), `data-cayley-phase="PASS 182"` |
| CAYLEY-06 | consolidated sweep section B self-inverse sub-assertions + section D coexistence check, `data-cayley-phase="PASS 182"` |
| CAYLEY-07 | `XREF-COMPLETE`, `NO-COLLATERAL-COMPLETE`, `XREF-RENDER-COMPLETE` |
| NAV-03 | `SITE-SWEEP-COMPLETE` (twelve-page nav sweep, eleven hub cards, both tool-count sentences) |

**Measured numbers for `05-VALIDATION.md` sign-off:**
- 120×120 additive build time: 38-65ms across independent harness runs (budget: 600ms)
- Same-viewport cell click time: 12-25ms across independent harness runs (budget: 60ms)
- `MAX_N`: stayed at 120 (unchanged from plan 05-01)
- Final `--cell-min` ladder: M≤12 → 46px, M≤20 → 40px, M≤32 → 34px, M≤48 → 29px, M≤72 → 25px, M>72 → 22px

## Next Phase Readiness

- Phase 5 (Cayley Table Generator) is complete: CAYLEY-01 through CAYLEY-07 and NAV-03 are all satisfied with a named green gate, recorded above.
- No blockers, no deferred items, no open stubs.

---
*Phase: 05-cayley-table-generator*
*Completed: 2026-09-28*

## Self-Check: PASSED
