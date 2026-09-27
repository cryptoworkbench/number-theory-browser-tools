---
phase: quick-260927-cr7
plan: 01
subsystem: ui
tags: [svg, pointer-events, drag-and-drop, venn-diagrams, accessibility]

requires: []
provides:
  - "Venn Diagrams tool renamed to plural on every user-visible surface (title, h1, self-nav, hub card, all 8 sibling nav labels)"
  - "Drag-to-move for already-placed prime tokens between regions, in both two-circle and three-circle mode, built on one shared pointer-event gesture helper"
  - "Three-circle hover tooltip stripped to set notation alone"
affects: []

actuals:
  tokens: 5615
  tasks: 3
  commits: 3
  plan_head_before: 6d890d7ebc48fa9ce56707e27b9692a45b857ac8
  plan_head_after: 84702c2b7bd999aba05d7eb17434b89878e8de58

tech-stack:
  added: []
  patterns:
    - "Mode-agnostic drag gesture: a single wireTokenDrag(g, ctx, regionKey, tokenId) helper takes a small { els, dynamic, move } descriptor so two-circle and three-circle mode share one pointer-event implementation instead of forking it"
    - "Resolve-before-cleanup ordering in a pointerup handler: read document.elementFromPoint while the dragged layer still has pointer-events:none, THEN restore pointer-events/transform/class state, THEN call the state-mutating function — reversing this order re-exposes sibling elements to the hit test before resolution runs"

key-files:
  created: []
  modified:
    - "Venn Diagrams/venn-diagrams.html"
    - "index.html"
    - "Congruence Wheel/congruence-wheel.html"
    - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
    - "Factorize By Completing The Square/factorize-completing-square.html"
    - "Factor Tree/factor-tree.html"
    - "RSA/rsa.html"
    - "Shors Algorithm/shors-algorithm.html"
    - "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
    - "Square And Multiply/square-and-multiply.html"

key-decisions:
  - "D-01: Renamed the tool to plural 'Venn Diagrams' on all 13 user-facing text sites across 10 files; left the three localStorage keys and index.html's card-body prose untouched per the context decisions"
  - "D-02/D-03: Implemented moveToken/moveToken3 as splice-then-push on the same {id, p} entry object through the existing persist/render path, with the per-region cap check strictly before the splice so a full target rejects losslessly"
  - "D-04: Three-circle region <title> now shows REGION_NOTATION3[key] alone; REGION_CAPTIONS3 keeps its 6 other consumers (status lines, aria-labels)"
  - "Rule 1 fix (bug found during Task 2 harness verification): the original finish() handler restored pointer-events and cleared the drag transform BEFORE resolving the drop target, which re-exposed sibling placed-chip elements to elementFromPoint and caused a drop landing near another token's own rect to resolve to that token instead of the region beneath it. Fixed by resolving the region first (while pointer-events:none is still active on the dynamic layer), then doing cleanup, then calling the state-mutating move — consistent with the plan's grounded fact 3 about why pointer-events:none is needed at resolution time"

requirements-completed: [NAV-01, NAV-02, PAL-02]

coverage:
  - id: D1
    description: "Venn Diagrams tool name is plural on every user-visible surface across all 10 pages, with zero singular survivors"
    requirement: "NAV-01"
    verification:
      - kind: automated_ui
        ref: "grep-based label sweep (13 plural sites / 0 singular survivors) + headless-Chrome DOM dump asserting notation-only tooltip and 11 default chips"
        status: pass
    human_judgment: false
  - id: D2
    description: "Already-placed prime tokens are draggable between regions in two-circle mode, moving set membership in one gesture; full-region drops are rejected losslessly; click-to-remove still works"
    requirement: "PAL-02"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome PointerEvent harness (venn-drag-harness.js, scratchpad-only): move, same-region no-op, off-diagram no-op, full-region rejection, click-still-removes — all PASS, ALL_PASS sentinel"
        status: pass
    human_judgment: false
  - id: D3
    description: "Drag-to-move extended to three-circle mode via the same wireTokenDrag helper (no fork); cross-mode drops are inert; full-abc rejection is lossless"
    requirement: "PAL-02"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome PointerEvent harness, three-circle section: move (aOnly->bc), full-region rejection, cross-mode no-op, click-still-removes — all PASS, ALL_PASS sentinel"
        status: pass
    human_judgment: false
  - id: D4
    description: "Three-circle hover tooltip shows set notation alone, with no plain-language caption"
    requirement: "NAV-02"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome DOM dump: zero 'only (' occurrences, exact '<title>A \\ (B ∪ C)</title>' match"
        status: pass
    human_judgment: false
  - id: D5
    description: "Visual affordance (grab/grabbing cursor, drop-target highlight, dragging opacity) reads correctly in both day and night themes"
    verification: []
    human_judgment: true
    rationale: "Cursor affordance and theme-correct highlight color are a subjective visual read; self-performed headless-Chrome screenshots in both themes were taken and look correct, but final call on cursor feel/highlight legibility is a human judgment call per this plan's own human-check verification step"

duration: 26min
completed: 2026-09-27
status: complete
---

# Quick Task 260927-cr7: Venn Diagrams Rename, Drag-to-Move, Tooltip Fix Summary

**Renamed the Venn Diagrams tool to plural everywhere, added a mode-agnostic pointer-event drag gesture that moves an already-placed prime between regions in one motion (two- and three-circle), and stripped the plain-language caption from the three-circle hover tooltip.**

## Performance

- **Duration:** 26 min
- **Started:** 2026-09-27T07:42:01Z
- **Completed:** 2026-09-27T08:08:00Z (approx)
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments
- Flipped the tool's name to plural "Venn Diagrams" on its `<title>`, `<h1>`, self-nav link, the hub card heading, and all 8 sibling pages' nav labels (13 sites, 10 files) — zero singular survivors
- Retired the two storage-key comments that asserted a singular public name, keeping only the do-not-rename-the-key rationale
- Added drag-to-move for already-placed prime tokens: `moveToken`/`moveToken3` splice the existing `{id, p}` entry out of one region and push it into another through the existing `persist`/`render` path, with the per-region cap checked strictly before the splice so a full target rejects losslessly
- Built one mode-agnostic `wireTokenDrag(g, ctx, regionKey, tokenId)` pointer-event gesture, wired into both `renderTokens` (two-circle) and `renderTokens3` (three-circle) via a small `{ els, dynamic, move }` descriptor per mode — no forked implementation
- Stripped the plain-language caption from the three-circle hover tooltip so it shows `REGION_NOTATION3[key]` alone; `REGION_CAPTIONS3` keeps its 6 other consumers (status lines, region/chip `aria-label`s)
- Proved the whole drag gesture end-to-end with a headless-Chrome `PointerEvent` harness covering both modes: move, same-region no-op, off-diagram no-op, full-region rejection, cross-mode inertness, and click-to-remove-still-works

## Task Commits

Each task was committed atomically:

1. **Task 1: Plural name on every surface, notation-only three-circle tooltip** - `3ee6ea5` (feat)
2. **Task 2: Drag a placed token between regions — two-circle mode** - `7cfd3a2` (feat)
3. **Task 3: Extend drag-to-move to three-circle mode** - `84702c2` (feat)

_TDD tasks (2 and 3) verified via a headless-Chrome `PointerEvent` harness before each commit; the harness itself is scratchpad-only and was never committed._

## Files Created/Modified
- `Venn Diagrams/venn-diagrams.html` - Pluralized title/h1/self-nav; retired singular-naming comments; notation-only three-circle tooltip; added `warnRegionFull`/`moveToken`/`warnRegionFull3`/`moveToken3`, the mode-agnostic `wireTokenDrag` pointer-event gesture, click-suppression after a completed drag, and `.placed-chip` drag affordance CSS
- `index.html` - Pluralized nav label and hub card `<h2>`
- `Congruence Wheel/congruence-wheel.html`, `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html`, `Factorize By Completing The Square/factorize-completing-square.html`, `Factor Tree/factor-tree.html`, `RSA/rsa.html`, `Shors Algorithm/shors-algorithm.html`, `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`, `Square And Multiply/square-and-multiply.html` - Pluralized the one Venn Diagrams nav-label link in each

## Decisions Made
- Followed D-01 through D-04 from `260927-cr7-CONTEXT.md` exactly as scoped (see `key-decisions` in frontmatter for details)
- Placed `wireTokenDrag` and its supporting `regionElementAt`/`keyForRegionEl` helpers in the two-circle interaction section (before `renderTokens`), since function declarations hoist and the helper is explicitly mode-agnostic — Task 3 reused it verbatim with a three-circle descriptor, adding no fork

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed resolve-after-cleanup ordering bug in the drag-drop pointerup handler**
- **Found during:** Task 2 (headless-Chrome harness verification — the very first "drag token 2 into region-right" expectation failed)
- **Issue:** The initial `finish()` implementation restored `ctx.dynamic.style.pointerEvents` and cleared the drag `transform` *before* resolving the drop target via `elementFromPoint`. Restoring pointer-events re-exposed every sibling placed-chip to hit-testing, so a drop landing at or near an existing token's own rect (exactly the kind of point the harness — and the plan's own suggested harness technique — uses as a reliable target) resolved to that sibling token's `<rect>` instead of the `.region` beneath it, silently failing the move.
- **Fix:** Reordered `finish()` to resolve the drop target first (while `pointer-events:none` is still active on the dynamic layer, per the plan's grounded fact 3), and only then perform the unconditional cleanup (detach listeners, restore pointer-events, remove `is-dragging`, clear transform) before calling `ctx.move`/`ctx.move3`.
- **Files modified:** `Venn Diagrams/venn-diagrams.html`
- **Verification:** Re-ran the full headless-Chrome harness after the fix — all 20 two-circle expectations and all 12 three-circle expectations passed (`ALL_PASS`)
- **Committed in:** `7cfd3a2` (part of Task 2's commit — the bug was found and fixed before the task was ever committed, so no separate fix commit was needed)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary for the drag gesture to work correctly against realistic drop points (including drops that land near existing tokens). No scope creep — the fix stayed entirely inside `wireTokenDrag`'s already-planned `finish()` function.

## Issues Encountered
None beyond the deviation documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The Venn Diagrams tool is fully renamed, drag-to-move works in both modes, and the three-circle tooltip is notation-only
- No blockers for future work on this tool

---
*Phase: quick-260927-cr7*
*Completed: 2026-09-27*

## Self-Check: PASSED

All 3 task commits (3ee6ea5, 7cfd3a2, 84702c2) verified present in git history; all 10 modified files verified present on disk.
