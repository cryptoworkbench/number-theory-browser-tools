---
phase: quick-260929-n8k
plan: 01
subsystem: ui
tags: [svg, factor-tree, fermat, venn-diagram, hover-preview]

requires:
  - phase: quick-260929-mhb
    provides: "Balanced (Fermat's Method) mode ported to Factor Tree/factor-tree.html (fermatSplit, buildTree balanced branch) — the logic this plan duplicates"
provides:
  - "Second toolbar hover-preview switch on the Venn Diagram tool: Euclid nested-squares miniature (default, unchanged) vs. a miniature Balanced factor tree of the hovered badge's own number"
  - "Ported, per-file-duplicated Balanced math (isqrt/isPerfectSquare/fermatSplit/smallestFactorOf/buildBalancedTree/assignTreeX/flattenTree) inside Venn Diagram/venn-diagram.html's own IIFE"
  - "previewPanelRect() — panel placement geometry extracted from showNestedPreview so both preview renderers share one clamp"
  - "showRegionPreview() — single dispatch point reading state.previewMode at event time"
affects: [venn-diagram]

actuals:
  tokens: 2936
  tasks: 2
  commits: 2
  plan_head_before: 2abaf5f3c603e163f215ec2724fca13cf75596a2
  plan_head_after: 109732961f6dbf4865156875a2eb33c45994270d

tech-stack:
  added: []
  patterns:
    - "Per-file duplication of ported number-theory logic under a suffixed name (FT_*, *Tree) with a comment block naming the source file and the CLAUDE.md rule, matching the existing euclidSteps/computeNestedLayout precedent already in this file"
    - "Single dispatch point reading UI mode state at event time (showRegionPreview), so a mode switch never needs its own re-render and cannot desync from what is on screen"

key-files:
  created: []
  modified:
    - "Venn Diagram/venn-diagram.html"

key-decisions:
  - "Guard order: the FT_MAX_N oversize check runs after the panel rect is appended and before the tree build, per the plan's Task 2 step 2 instruction, even though live-UI reachability analysis (below) shows the badge's own value can never exceed 1,000,000 while carrying a hover link (euclidHref's own EUCLID_MAX_INPUT=1,000,000 gate already bounds it, since the badge value is always <= the pair total euclidHref checks). Implemented as specified — a harmless, correctness-preserving defense-in-depth guard, not dead-code cleanup material within this plan's scope."
  - "Poppins font-family declared on .ft-label per the plan's literal instruction (matching Factor Tree's node-text styling) without adding a new Google Fonts import; the page falls back to the existing sans-serif stack since Poppins is not loaded here, preserving the 'exactly two Google Fonts URLs, no other external host' constraint over pixel-parity with the source tool's font."

requirements-completed: ["quick-260929-n8k"]

coverage:
  - id: D1
    description: "Two-circle A∩B badge: switching the new toolbar switch to 'Hover: factor tree' and hovering the badge draws a Balanced tree of the badge's own value (verified 105 -> children 7 and 15, then 15 -> 3 and 5, matching fermatSplit's real output, not smallest-factor order)"
    requirement: "quick-260929-n8k"
    verification:
      - kind: other
        ref: "node harness driving the extracted <script> in a vm context with a stubbed DOM (scratchpad/runpage.js): simulated ?a=105&b=105 load, clicked #preview-tree, dispatched mouseenter on the data-region=overlap badge, asserted node/label shape (11 nodes: root 105 -> internal 7 [one 1, prime-leaf 7] + internal 15 -> [internal 3 [one 1, prime-leaf 3], internal 5 [one 1, prime-leaf 5]]) and caption '3 * 5 * 7 = 105'"
        status: pass
    human_judgment: false
  - id: D2
    description: "Mode 2 (Euclid nested-squares) is byte-identical to pre-change behavior: same gcd caption, same hint, same panel geometry, reachable via the same switch and default-pressed"
    requirement: "quick-260929-n8k"
    verification:
      - kind: other
        ref: "same harness: clicked #preview-euclid, hovered the overlap badge, asserted caption 'gcd(105, 105) = 105', hint 'double-click to open the full view →', and 1 nsquare tile rendered (unchanged showNestedPreview path, now routed through the shared previewPanelRect)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Degenerate values: an empty overlap (value 1) draws exactly one terminal 'one' node; a prime badge draws a root over a 1 and a prime leaf"
    requirement: "quick-260929-n8k"
    verification:
      - kind: other
        ref: "same harness: ?a=2&b=3 (overlap empty, value 1) -> 1 ft-node of class 'one', caption '1'; default load (overlap=[5], value 5) -> 3 nodes (root/one/prime-leaf), caption '5'"
        status: pass
    human_judgment: false
  - id: D4
    description: "Three-circle pairwise badges (ab/ac/bc) draw a tree of their OWN badge number, not gcd(A,B); the abc centre badge and the three exclusive badges carry no preview in either mode"
    requirement: "quick-260929-n8k"
    verification:
      - kind: other
        ref: "same harness: switched to three-circle mode, hovered data-region=ab (default value 7) -> caption '7', tree rendered; confirmed data-region=abc and data-region=aOnly badges have no role=img attribute (no link, no preview wiring) in either mode"
        status: pass
    human_judgment: false
  - id: D5
    description: "Persistence: the hover-preview mode survives a reload under its own localStorage key, and a tampered/unknown stored value falls back to the Euclid default"
    requirement: "quick-260929-n8k"
    verification:
      - kind: other
        ref: "scratchpad/runpersist.js: loaded the script twice against a shared localStorage-store stub, clicked #preview-tree, reloaded and confirmed #preview-tree stayed pressed and 'venn-diagram-preview'='tree' was written; set the stored value to 'bogus' and reloaded again, confirmed #preview-euclid re-pressed as the default"
        status: pass
    human_judgment: false
  - id: D6
    description: "Oversize guard: a badge value above FT_MAX_N (1,000,000) draws a caption-only panel with an over-the-limit hint instead of attempting a tree, before any Fermat split runs"
    requirement: "quick-260929-n8k"
    verification: []
    human_judgment: true
    rationale: "Code-reviewed and unit-verified in isolation (the guard's typeof/isFinite/range check and its caption/hint output were read back verbatim from the committed file), but could not be triggered through the live UI within this session: this page's own euclidHref/EUCLID_MAX_INPUT=1,000,000 gate on the hover link already bounds every linked badge's own value at <=1,000,000 (the badge's value is always <= the pair total euclidHref checks, in both two- and three-circle mode, and MAX_PER_REGION3=3 caps three-circle pairwise regions at 101^3 < 1,000,000 regardless). A human should re-confirm this reachability analysis and/or exercise the guard via a direct code path if a future change decouples the preview link's existence from EUCLID_MAX_INPUT."
  - id: D7
    description: "No color regressions, no scope creep: only Venn Diagram/venn-diagram.html changed, zero literal colors/named-color keywords in the style block, isPrime declared exactly once, both renderers share previewPanelRect, external-resource count unchanged"
    requirement: "quick-260929-n8k"
    verification:
      - kind: other
        ref: "both PLAN.md <automated> verify blocks (Task 1 and Task 2), run directly: node vm.Script parse + string-presence checks + isPrime-declared-once + zero-literal-color/named-color regex over the <style> block + previewPanelRect call-count >=3 + fonts.googleapis.com count ==2 + git status/diff --stat showing exactly one file touched"
        status: pass
    human_judgment: false

duration: ~35min
completed: 2026-09-29
status: complete
---

# Quick Task 260929-n8k: Balanced Factor-Tree Hover Preview for the Venn Diagram Summary

**Added a second toolbar switch to the Venn Diagram tool letting the existing hover panel on singly-overlapping badges draw either the original Euclid nested-squares miniature or a miniature Balanced (Fermat's Method) factor tree of the hovered badge's own number, with Euclid squares remaining the default and persisting per user.**

## Performance

- **Duration:** ~35 min
- **Completed:** 2026-09-29
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Extracted `previewPanelRect(opts)` from `showNestedPreview`'s inline placement-clamp arithmetic so both preview renderers place their panel identically (no drift at viewBox edges)
- Ported `isqrt`/`isPerfectSquare`/`fermatSplit`/`smallestFactorOf`/`buildBalancedTree`/`assignTreeX`/`flattenTree` from Factor Tree's Balanced mode as a deliberate per-file duplication (CLAUDE.md's no-shared-JS-module rule), reusing this page's own `isPrime()` instead of a second copy
- Added `showFactorTreePreview()` which draws a miniature Balanced tree into the exact same 268x196 panel the Euclid miniature uses, and `showRegionPreview()` as the single mode dispatcher, reading `state.previewMode` at event (hover) time
- Wired a new `.mode-switch` toolbar group ("Hover: Euclid squares" / "Hover: factor tree"), `state.previewMode` defaulting to `'euclid'`, and `setPreviewMode()` which clears any open panel on both layers without triggering a diagram re-render
- Persisted the switch under its own new `venn-diagram-preview` localStorage key with a validating reader (`readStoredPreviewMode`) that falls back to the default on any unknown/tampered value
- Added the `FT_MAX_N` oversize guard in `showFactorTreePreview`, bailing to a caption-only "over 1,000,000 — no balanced tree" panel before any Fermat split runs
- Added token-only `.ft-edge` / `.ft-node.*` / `.ft-label.*` CSS scoped under `.nested-preview`, resolving every color through `var()`/`color-mix()` against `assets/palette.css`

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end balanced-tree hover preview — one path, two-circle overlap badge** - `abf69e8` (feat)
2. **Task 2: Persistence, the oversize guard, and Mode 2 left exactly as found** - `1097329` (feat)

**Plan metadata:** committed separately by the orchestrator (not part of this executor's commits, per task instructions)

## Files Created/Modified
- `Venn Diagram/venn-diagram.html` - Added the ported Balanced-tree math, the tree preview renderer, the dispatch point, the second toolbar switch with its own persisted key, the oversize guard, and scoped `.ft-*` CSS; the only file touched

## Decisions Made
- Implemented the `FT_MAX_N` oversize guard exactly as the plan specifies (Task 2 step 2), even though a reachability analysis of the current UI wiring shows a linked badge's own value can never actually exceed 1,000,000 (this page's `euclidHref`/`EUCLID_MAX_INPUT` gate, which determines whether a badge gets a hover link at all, already bounds the badge's own displayed value to <= the pair total it checks — and three-circle's `MAX_PER_REGION3 = 3` caps pairwise-region products at 101³ ≈ 872K regardless). The guard is correct, harmless, and matches the plan's STRIDE mitigation (T-n8k-01) precisely; flagged as `human_judgment: true` in coverage (D6) since live-UI reproduction wasn't possible in this session and a human should confirm or challenge the reachability reasoning above.
- Kept the `.ft-label` `font-family: 'Poppins', sans-serif` declaration from the plan verbatim without adding a new Google Fonts import (the page has no Poppins load); labels render in the existing sans-serif fallback instead of Poppins, preserving the "exactly two Google Fonts URLs" external-resource constraint that both automated gates check.

## Deviations from Plan

None — plan executed exactly as written, including exact line-level placements (`previewPanelRect` extraction, the ported-math section positioned between `computeNestedLayout` and the `NP_*` constants, the toolbar markup order, the CSS block scoped under `.nested-preview`).

## Issues Encountered
- The isolated worktree attempt for this task hit a stale fork-base and made no changes; this session re-ran the plan sequentially on the main checkout as instructed, with nothing to reconcile.
- No headless-browser click-through harness was available out of the box; built a small `node vm`-based DOM stub (see verification refs above, files under the session scratchpad, not committed) to drive the actual extracted `<script>` block end-to-end for the tracer, degenerate, three-circle, and persistence scenarios. The D6 oversize case could not be constructed through the live UI (see Decisions Made) and is left for human re-confirmation.

## Next Phase Readiness
- The Venn Diagram tool's hover panel now offers both explanatory views (division-based Euclid squares and factor-based Balanced tree) on every badge that already had a hover panel; no further phase depends on this quick task.
- D6 (the oversize guard) is unit-verified but not live-UI-verified — worth a quick manual spot-check if this guard's reachability assumptions ever change (e.g., if `MAX_PER_REGION3` or `EUCLID_MAX_INPUT` are ever raised independently of each other).

---
*Phase: quick-260929-n8k*
*Completed: 2026-09-29*

## Self-Check: PASSED

- FOUND: `Venn Diagram/venn-diagram.html`
- FOUND: commit `abf69e8` (Task 1)
- FOUND: commit `1097329` (Task 2)
- FOUND: `.planning/quick/260929-n8k-add-two-modes-to-the-venn-diagram-tool-v/260929-n8k-SUMMARY.md`
