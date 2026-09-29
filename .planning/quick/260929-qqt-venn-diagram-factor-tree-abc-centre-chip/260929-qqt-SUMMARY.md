---
phase: quick-260929-qqt
plan: 01
subsystem: ui
tags: [svg, venn-diagram, factor-tree, hover-preview, deep-link, double-click]

requires:
  - phase: quick-260929-q1o
    provides: "The stacked hover-preview panel with Factor Tree as the first/default-visible section and Euclidean Algorithm as the second, scroll-revealed section"
  - phase: quick-260929-c11
    provides: "The double-click deep-link pattern (data-xref-href + dblclick listener + openXref()) this plan extends with a second, tool-specific attribute"
provides:
  - "Factor Tree/factor-tree.html accepts a `?n=<1..1,000,000>` deep link that lands the tool in Balanced mode with that number already factorized"
  - "The Venn Diagram A∩B∩C centre chip's hover panel is now Factor-Tree-only: one section, no Euclidean content, no scroll affordance, wheel/ArrowDown/ArrowUp are genuine no-ops"
  - "Every previewable chip's double-click resolves at click time from the live scroll offset -- Factor Tree below the panel's midpoint, Euclidean Algorithm at or above it -- with no cross-tool fallback when the resolved target is missing"
  - "The centre chip now carries a real click target (Factor Tree) and the linked-chip/pointer affordance that goes with it"
affects: [venn-diagram, factor-tree]

actuals:
  tokens: 3780
  tasks: 3
  commits: 3
  plan_head_before: 188b76929bc530fc54ea108c854dbd83d2279025
  plan_head_after: 40929a064b8f7ab32d52f559287e216e5b8ee77f

tech-stack:
  added: []
  patterns:
    - "Deep-link URL reader mirrored move-for-move from an existing tool's readABParams()-style helper, with an added round-trip string comparison to reject fractional query values parseInt would otherwise silently truncate into a valid-looking integer"
    - "Per-target link trio (PATH constant + range predicate + href builder) duplicated for a second cross-tool target, sharing the existing range/cap constant rather than introducing a second one"
    - "Live-read scroll offset at dblclick time (not captured at render time) as the mechanism for resolving which of two stacked panel sections a click targets"

key-files:
  created: []
  modified:
    - "Factor Tree/factor-tree.html"
    - "Venn Diagram/venn-diagram.html"

key-decisions:
  - "Used a round-trip string comparison (String(n) !== raw) in readNParam(), not literal parseInt-only mirroring, because parseInt(\"3.5\",10) truncates to 3 -- a valid-looking integer -- which would have silently accepted fractional query strings the plan's own behavior contract requires rejected. Documented as a Rule 1 auto-fix on the literal mirror instruction."
  - "Linked-chip class (`is-linked`) now follows \"carries either target\" (Factor Tree or Euclidean) rather than the Euclidean href alone, so the centre chip's pointer affordance matches its new double-click behavior -- an accessible name inviting a double-click on a chip with no pointer cursor would be an affordance mismatch. Called out explicitly per the plan's own judgment-call instruction."
  - "FACTOR_TREE_LABEL kept as one shared module-level constant (unlike the Euclidean label, which is a literal string repeated at each of its two link sites) because it is identical at all three Factor Tree link sites, and three independent copies of one string is exactly how such text drifts."

patterns-established: []

requirements-completed: ["quick-260929-qqt"]

coverage:
  - id: D1
    description: "Factor Tree tool accepts ?n=<1..1,000,000>, lands in Balanced mode with that number factorized; every invalid/absent param reproduces today's Classic/60 default field-for-field; mode-button clicks still work identically through the new shared applyMode() helper"
    requirement: "quick-260929-qqt"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome harness ($SP/venn-ft-xref-harness.js t1), 102 assertions covering no-query-string, ?n=899, ?n=1000000 (inclusive cap), ?n=1 (not-prime-not-composite message), seven invalid fallback query strings, ?theme=day&n=899 (matched after '&'), and a post-deep-link mode-button click"
        status: pass
    human_judgment: false
  - id: D2
    description: "The A∩B∩C centre chip's hover panel is Factor-Tree-only (one np-heading, zero nsquare/ncap/nframe/np-scroll-hint nodes), still 268x196 at the unchanged panel-rect position, and wheel/ArrowDown/ArrowUp over it leave defaultPrevented false and the scroll group untouched; every other previewable chip keeps its two-section, scrollable panel bit for bit"
    requirement: "quick-260929-qqt"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome harness ($SP/venn-ft-xref-harness.js t2), 77 assertions across the two-circle overlap chip, all three three-circle pairwise chips, the three-circle centre chip, and the three exclusive-region no-preview chips"
        status: pass
    human_judgment: false
  - id: D3
    description: "Double-click resolves at click time from the live scroll offset -- below NP_MAX_SCROLL/2 opens Factor Tree with the chip's composite value, at/above it opens Euclidean Algorithm with the chip's a/b -- with no cross-tool fallback when the resolved target is missing; the centre chip always resolves to Factor Tree and never produces a Euclidean URL; each section's hint is gated on its own link; accessible names list exactly the targets that exist"
    requirement: "quick-260929-qqt"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome harness ($SP/venn-ft-xref-harness.js t3), 101 assertions covering the two-circle overlap chip and all three pairwise chips at offset 0, at the scroll clamp, and at the exact +102/+103 boundary; the centre chip at offset 0 and after a no-op wheel+ArrowDown; a missing-target no-op case (attribute stripped from a live chip); a round trip loading a captured Factor Tree URL into a fresh iframe and re-running Task 1's Balanced-mode assertions against it; hint counts and accessible-name content"
        status: pass
    human_judgment: false

duration: 70min
completed: 2026-09-29
status: complete
---

# Quick Task 260929-qqt: Venn Diagram Factor Tree A∩B∩C Centre Chip Summary

**Gave the Factor Tree tool a `?n=` deep link into Balanced mode, made the Venn Diagram's A∩B∩C centre chip show a Factor-Tree-only hover panel (no more synthetic Euclidean gcd(gcd(a,b),c) section), and made every previewable chip's double-click resolve at click time from whichever panel section is actually in view.**

## Performance

- **Duration:** ~70 min
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments

- `Factor Tree/factor-tree.html` reads a single `n` query param (`readNParam()`, mirroring `readABParams()` in the Euclidean Algorithm tool) validated against the existing `MAX_BALANCED_N` cap; a valid value lands the load handler in Balanced mode with that number already grown, via a new shared `applyMode(targetMode)` helper the mode-button click handler now calls too. Every invalid or absent param reproduces today's Classic/60 default exactly.
- The Venn Diagram's `showRegionPreview()` now takes a `showEuclid` flag (set at each of the three link-descriptor sites: `true` for the two-circle overlap and the three pairwise chips, `false` for the centre chip) that gates both the Euclidean section and its scroll affordance under one condition. A per-layer scroll ceiling (`layer._npMax`) mirrors the flag; `scrollNestedPreview()` returns `false` — a genuine no-op, no `preventDefault()` — whenever that ceiling is not above zero.
- A Factor Tree link trio (`FACTOR_TREE_PATH`, `isFactorTreeRange()`, `factorTreeHref()`) mirrors the existing Euclidean one and reuses the existing `FT_MAX_N` constant. `drawTreeSection`'s over-cap bail now calls `isFactorTreeRange()` instead of its own inline four-clause test, and draws its own hint line (gated on a threaded-through `opts.treeHref`) once a URL exists.
- Every link descriptor now carries a `treeHref` alongside its existing fields. `appendCompositeBadge`'s `dblclick` handler reads the chip's own preview layer's live scroll offset at click time and picks the Factor Tree attribute below `NP_MAX_SCROLL / 2`, the Euclidean attribute at or above it; a missing target for the resolved section is a no-op, never a fallback to the other tool.
- The centre chip gains a real click target (Factor Tree) for the first time, the `is-linked` class (now driven by "carries either target," not the Euclidean href alone), and an accessible name naming only the Factor Tree target. It can never resolve to a Euclidean URL because it has no second section to scroll to.

## Task Commits

Each task was committed atomically:

1. **Task 1: Give the Factor Tree tool a `?n=` deep link that lands in Balanced mode** - `1f3e038` (feat)
2. **Task 2: Drop the Euclidean section from the `A∩B∩C` centre chip's panel** - `3486766` (feat)
3. **Task 3: Resolve each chip's double-click from the section currently in view** - `40929a0` (feat)

**Plan metadata:** commit for STATE.md/SUMMARY.md handled by the orchestrator (docs artifacts not committed by this executor per dispatch constraints).

## Files Created/Modified

- `Factor Tree/factor-tree.html` - Extracted `applyMode(targetMode)` helper from the mode-button click handler; added `readNParam()` (mirrors `readABParams()`, plus a round-trip string check for genuine integrality); branched the load handler additively on a valid deep-link `n`
- `Venn Diagram/venn-diagram.html` - Added `showEuclid` to all three link descriptors and threaded it through `previewOpts`/`showRegionPreview`/`scrollNestedPreview`'s new per-layer `_npMax` ceiling; added the Factor Tree link trio (`FACTOR_TREE_PATH`, `isFactorTreeRange()`, `factorTreeHref()`, `FACTOR_TREE_LABEL`); collapsed `drawTreeSection`'s bail onto the new predicate and gave it its own hint; added `treeHref` to every link descriptor; reworked `appendCompositeBadge`'s classing, accessible-name assembly, attribute stamping, and `dblclick` resolver

## Decisions Made

- **Integrality check via round-trip string comparison, not literal `parseInt`-only mirroring** (Task 1). The plan's action text named `parseInt(decodeURIComponent(...), 10)` as the literal mirror of `readABParams()`, but `parseInt("3.5", 10)` truncates to `3` — a value that then passes every subsequent finiteness/range/`Number.isInteger` test, silently accepting a fractional query string the plan's own behavior contract explicitly requires rejected (`?n=3.5` must reproduce the no-query-string default). Fixed by comparing the parsed integer's string form back against the raw decoded string (`String(n) !== raw`) before accepting it. Treated as a Rule 1 auto-fix (bug: literal mirror would silently accept invalid input) rather than a deviation from intent — the plan's behavior contract is the authoritative spec, the "mirror move for move" instruction is the implementation guidance for achieving it.
- **`is-linked` class now follows "carries either target"** (Task 3, judgment call flagged in the plan's own action text). Previously the class was driven solely by the Euclidean `href`. Now that the centre chip carries a real Factor Tree target, driving the class from "has either target" is what keeps its pointer-cursor affordance consistent with its new double-click behavior; leaving it href-only would have left the centre chip's accessible name inviting a double-click with no visual cue that it does anything.
- **`FACTOR_TREE_LABEL` as one shared constant, not a per-descriptor field.** The Euclidean label is the literal string `'confirm this GCD with the Euclidean Algorithm'` repeated at its two link-creation sites; the Factor Tree label is identical at all three of its sites, so it was pulled into a single module-level constant to remove the risk of the three copies drifting apart.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] readNParam() integrality check strengthened beyond literal parseInt mirroring**
- **Found during:** Task 1 (writing `readNParam()`)
- **Issue:** A literal move-for-move mirror of `readABParams()`'s `parseInt(decodeURIComponent(...), 10)` shape would accept `?n=3.5` as `n=3` (parseInt truncates at the first non-digit character), contradicting the plan's own `<behavior>` block, which requires `?n=3.5` to reproduce the no-query-string default exactly.
- **Fix:** Added `raw = decodeURIComponent(mn[1])` as an explicit intermediate, then gate acceptance on `String(n) !== raw` in addition to the existing finiteness/integer/range tests — rejecting any query value whose string form doesn't round-trip through `parseInt`.
- **Files modified:** `Factor Tree/factor-tree.html`
- **Verification:** Harness scenario `t1`'s `?n=3.5` fallback assertion passes; vacuity-checked in both directions (see Harness Details below) — the always-accept stub failed specifically on the fallback assertions, confirming the check is load-bearing, not vacuous.
- **Committed in:** `1f3e038` (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Necessary for correctness against the plan's own explicit behavior contract. No scope creep — same function, same signature, same call sites.

## Issues Encountered

- The harness's initial `exerciseTwoSectionChip` helper asserted `ArrowUp` returns the scroll offset to `0` after a single keypress, but the keyboard step size is `Math.round(NP_H / 4)` = 49 against a clamp of 206 — a single `ArrowUp` only reaches 157. Fixed the harness (not production code) to press `ArrowUp` repeatedly (6x) before asserting, matching the pattern the plan's own reference harness (`venn-section-order-harness.js` from task `260929-q1o`) already used for the same clamp.
- The screenshot-based manual-verification helper initially rendered an oversized, unstyled black rounded rectangle because the throwaway static server used for the screenshot didn't map `.css` to `text/css` — CSS never loaded into the iframe. Fixed the server's MIME map and re-shot; not a production issue, purely a manual-verification tooling gap.

## Harness Details

- Scratchpad path: `/tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools/29a3de7f-6dd1-4f83-9bd5-96ffb9eb3a55/scratchpad/`
- Harness: `venn-ft-xref-harness.js` (Node stdlib only — `http` static file server rooted at the checkout root, an in-memory `/__driver.html` + `/__driver.js` route pair selected by a CLI scenario argument (`t1`/`t2`/`t3`), and a `/__report` POST endpoint; spawns `google-chrome --headless=new` against the driver URL, same recipe as tasks `260929-c11`/`g19`/`o99`/`p80`/`q1o`)
- Baseline snapshots: `qqt-ft-base.html` and `qqt-venn-base.html` (captured via `git show HEAD:...` before any edits); others checksum manifest `qqt-others.sha` (`git ls-files` minus the two edited paths, `sha256sum`'d) — verified byte-identical post-edit via `sha256sum -c --status` after every task
- **t1 vacuity check (Task 1):** stubbing `readNParam()` to always return `null` made `t1` FAIL at the `?n=899` deep-link assertion (assertion 9/102) while the no-query-string case still passed; restoring returned it to 102/102 PASS. Stubbing it to always accept the matched value (skipping the final range/integrality check) made `t1` FAIL at the `?n=1000000` in-range assertion first (the stub also broke a valid in-range value by hardcoding it) and, on a corrected stub that preserved valid in-range values, FAILed specifically at the `?n=1000001` fallback assertion (18/102) — confirming the validation logic is load-bearing in both directions.
- **t2 vacuity check (Task 2):** forcing `showEuclid: true` at the centre-chip link site made `t2` FAIL at "three-circle centre (abc) chip: exactly one np-heading, got 2" (assertion 55/77) — the first centre-chip-specific assertion — while all 54 prior assertions (covering the overlap and pairwise chips) still passed; restoring returned it to 77/77 PASS.
- **t3 vacuity check (Task 3):** pinning the resolver to always choose the Euclidean attribute made `t3` FAIL at "two-circle overlap chip: offset-0 dblclick opens the Factor Tree URL, got .../euclidean-algorithm.html?a=30&b=35" (assertion 6/101) — the first offset-0 assertion; pinning it to always choose the Factor Tree attribute made `t3` FAIL at "two-circle overlap chip: clamped dblclick opens the byte-identical Euclidean URL, got .../factor-tree.html?n=5" (assertion 10/101) — the first scrolled-past-midpoint assertion. Restoring returned it to 101/101 PASS in both cases.
- Static diff gates (literal counts of `showEuclid: true/false`, `_npMax`, `treeHref: factorTreeHref(value)`, `isFactorTreeRange`, `FACTOR_TREE_PATH`, `data-xref-tree-href`, `NP_MAX_SCROLL / 2`, `factor-tree.html`, the hint string, `window.open`, `data-xref-href`, the over-cap message) all matched the plan's exact expected counts per task.
- No literal color, `<script>`, `<link>`, or URL was added in any of the three diffs (grep-scanned added lines only, comments excluded).

## Reachability Note

Per the plan's `<current_shape>` reachability note: a previewable chip can never carry a composite value above `FT_MAX_N` (1,000,000), because every chip's value divides a region total the link gate already caps at `EUCLID_MAX_INPUT` (also 1,000,000). `drawTreeSection`'s over-cap bail (and the parallel `isFactorTreeRange()` predicate that now drives it) is therefore defensive, not reachable through the UI. Task 3's "resolved target missing" behavior was verified instead by stripping the `data-xref-tree-href` attribute off a live, already-rendered chip and confirming the `dblclick` handler makes zero opener calls and throws nothing — exercising the exact branch that matters (`if (!chosenHref) return;`) without attempting to construct an impossible out-of-range chip.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- No blockers. Both edited tools behave identically to their prior shipped state along every axis this plan didn't touch; only the `?n=` deep link (Factor Tree), the centre-chip panel shape, and the double-click resolver (Venn Diagram) changed.
- Manual browser confirmation (headless-Chrome screenshots, not just harness assertions): `Factor Tree/factor-tree.html?n=899` visually lands on Balanced mode with 899 already grown; the Venn Diagram's three-circle centre chip hover panel visually shows exactly one "Factor Tree" section (a small tree for the prime 17) with the "double-click to open the full view →" hint and no second section or scroll cue.

---
*Phase: quick-260929-qqt*
*Completed: 2026-09-29*

## Self-Check: PASSED

- FOUND: `Factor Tree/factor-tree.html`
- FOUND: `Venn Diagram/venn-diagram.html`
- FOUND: commit `1f3e038` (`git log --oneline --all`)
- FOUND: commit `3486766` (`git log --oneline --all`)
- FOUND: commit `40929a0` (`git log --oneline --all`)
- FOUND: `.planning/quick/260929-qqt-venn-diagram-factor-tree-abc-centre-chip/260929-qqt-SUMMARY.md`
