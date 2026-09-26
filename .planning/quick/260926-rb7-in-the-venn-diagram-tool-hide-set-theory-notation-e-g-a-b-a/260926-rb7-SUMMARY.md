---
phase: quick-260926-rb7
plan: 01
subsystem: ui
tags: [svg, accessibility, venn-diagrams, tooltip]

# Dependency graph
requires: []
provides:
  - "Venn Diagram tool: plain-word region captions in both two-circle and three-circle modes"
  - "Native browser <title> tooltips exposing set-theory notation on hover, for all 10 regions plus the 3 two-circle captions"
affects: [venn-diagrams]

# Actuals (#2632)
actuals:
  tokens: 2015
  tasks: 2
  commits: 2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Notation/caption dictionary split: a REGION_NOTATION(3) dictionary feeds tooltip-only text, a sibling REGION_CAPTIONS(3) dictionary feeds every visible/spoken surface (captions, aria-labels, status messages)"
    - "SVG <title> child element as the native-tooltip mechanism for SVG nodes (the HTML title attribute is inert on SVG)"

key-files:
  created: []
  modified:
    - "Venn Diagrams/venn-diagrams.html"

key-decisions:
  - "Resolved a self-contradiction in the plan's own Task 2 automated verify script: the action prose instructed adding a <title> child to all seven three-circle captions ('add it anyway... structurally identical'), and the per-caption regex in <verify> literally required it, but the same script's page-wide total asserted exactly 13 notation tooltips (10 regions + 3 two-circle captions) — a number stated identically in the objective, the behavior bullets, and the top-level <verification> section. Adding titles to all 7 three-circle captions makes the true total 20, never 13, so the two checks cannot both pass under any implementation. Resolved in favor of the majority-corroborated number (13): three-circle captions render as plain text with no <title> child; the region group's own <title> (already covering the same pixels, as the plan's own action prose notes) is the sole tooltip source there. Ran a corrected verify script for this task's gate (identical except the caption-title assertion in the three-circle caps regex) — it passes; the two-circle mode (Task 1) required no correction."

requirements-completed: ["260926-rb7"]

coverage:
  - id: D1
    description: "Two-circle diagram: captions read 'A only' / 'both' / 'B only' with no set-theory notation; hovering a region or its caption raises a native tooltip with the exact notation (A \\ B, A ∩ B, B \\ A)"
    requirement: "260926-rb7"
    verification:
      - kind: automated_ui
        ref: "google-chrome --headless=new --dump-dom against Venn Diagrams/venn-diagrams.html — asserts 3 plain captions, 3 caption <title> tooltips, 3 region <title> tooltips, no notation character in visible text"
        status: pass
    human_judgment: false
  - id: D2
    description: "Three-circle diagram: all seven captions read as plain words ('A only' ... 'all three') with no notation; hovering inside each of the seven regions raises a native tooltip with the exact notation"
    requirement: "260926-rb7"
    verification:
      - kind: automated_ui
        ref: "google-chrome --headless=new --dump-dom against Venn Diagrams/venn-diagrams.html — asserts 7 plain captions, 7 region <title> tooltips matching REGION_NOTATION3, 10 region-label nodes page-wide, exactly 3 is-hoverable, 13 total notation-bearing <title> elements"
        status: pass
    human_judgment: false
  - id: D3
    description: "Placement by click, keyboard (Enter/Space), and drag-and-drop still works in every region of both modes; no tooltip target steals a click; captions inside three-circle regions do not swallow placement clicks"
    verification: []
    human_judgment: true
    rationale: "Requires interacting with the live page (click, tab+Enter, drag-and-drop) in a real browser — not observable from a headless DOM dump."
  - id: D4
    description: "Readout rows and both lede paragraphs are unchanged and still teach the notation (#product-overlap keeps its ∩ infix; #lede-two keeps both A ∩ B and A \\ B)"
    requirement: "260926-rb7"
    verification:
      - kind: automated_ui
        ref: "google-chrome --headless=new --dump-dom — asserts #product-overlap matches /^A ∩ B = .+ = [0-9]+$/ and #lede-two contains both 'A ∩ B' and 'A \\ B'"
        status: pass
    human_judgment: false

duration: ~20min
completed: 2026-09-26
status: complete
---

# Quick Task 260926-rb7: Venn Diagram notation moved to hover tooltips

**Venn Diagram tool now shows plain-English region captions ('A only', 'both', 'A and B only', etc.) in both modes, with the underlying set-theory notation available as a native browser tooltip on hover over any region or two-circle caption.**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-09-26T21:58:40Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Two-circle mode: three region captions ('A only', 'both', 'B only') carry native `<title>` tooltips with their notation (`A \ B`, `A ∩ B`, `B \ A`); the three region groups carry the same tooltip so hovering anywhere in a region works, not just on the caption.
- Three-circle mode: all seven region captions read plainly ('A only' … 'A and B only' … 'all three'); each of the seven region groups carries a `<title>` tooltip with its exact notation.
- All prose the user reads or a screen reader speaks — status messages, `aria-label`s on regions and placed-prime chips — switched to the plain-word dictionaries; the notation dictionaries are now tooltip-only sources.
- The `#product-overlap` readout row and both lede paragraphs are untouched — they still teach the notation in context.
- Added exactly one new CSS rule (`.region-label.is-hoverable`) to opt the three two-circle captions into pointer interaction; declares no literal color.

## Task Commits

Each task was committed atomically:

1. **Task 1: Two-circle mode end-to-end — plain captions, notation in tooltips** - `94a25b4` (feat)
2. **Task 2: Three-circle mode — same treatment, plus whole-page regression gates** - `c40c0d8` (feat)

**Plan metadata:** not committed by this agent — the orchestrator commits SUMMARY.md/STATE.md/ROADMAP.md per this item's constraints.

## Files Created/Modified
- `Venn Diagrams/venn-diagrams.html` - Split `REGION_NAMES`/`REGION_NAMES3` into notation-only (`REGION_NOTATION`/`REGION_NOTATION3`) and plain-caption (`REGION_CAPTIONS`/`REGION_CAPTIONS3`) dictionaries; added `<title>` children to all 10 region `<g>` groups and the 3 two-circle captions; added the `.region-label.is-hoverable` CSS rule; switched all prose/aria call sites to the plain dictionary while the product-overlap readout kept reading notation.

## Decisions Made
- See `key-decisions` in frontmatter: resolved the plan's internal verify-script contradiction (7 three-circle caption titles vs. a hard total of 13) by keeping three-circle captions title-free, matching the objective/must_haves/success_criteria's repeated "13 notation tooltips (10 regions + 3 two-circle captions)" figure. The region group's own tooltip already covers the same screen pixels as each three-circle caption, so no coverage was lost.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed a self-contradictory automated verify script in Task 2**
- **Found during:** Task 2, first verify run
- **Issue:** The plan's Task 2 `<verify><automated>` script simultaneously required (a) every three-circle caption to carry a `<title>` child (`caps.length!==7` check demanding a title-bearing caption) and (b) the whole page to contain exactly 13 notation-bearing `<title>` elements total. Since 10 region groups + 3 two-circle captions already account for 13, adding a `<title>` to all 7 three-circle captions as instructed by the action prose ("add it anyway so the two modes are structurally identical") pushes the true count to 20 — the two assertions can never both pass, regardless of implementation. The "13" figure is independently stated in the objective's Output line, the Task 2 behavior bullets, and the plan's top-level `<verification>` section — three corroborating sources against the one outlier instruction.
- **Fix:** Implemented three-circle captions as plain text with no `<title>` child (the region group's own `<title>` already covers the same pixels, per the plan's own note). Ran a corrected local verify script for this task's gate — identical to the plan's script except the caption-title assertion in the three-circle `caps` regex — which passes cleanly (10 plain captions, 13 total notation tooltips, 3 hoverable captions, product row and lede unchanged).
- **Files modified:** `Venn Diagrams/venn-diagrams.html`
- **Verification:** Corrected headless-Chrome DOM-dump script passes; source gates (retired dictionary name removed, both new dictionaries in use ≥6 times each, exactly one `.region-label.is-hoverable` rule, zero literal colors, zero inert SVG `title` attributes) all pass.
- **Committed in:** `c40c0d8` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — in the plan's verify tooling, not the shipped code)
**Impact on plan:** No scope creep; the fix affects only which of two mutually-exclusive verify-script assertions is honored, resolved toward the plan's own majority-stated intent (13 tooltips, not 20).

## Issues Encountered
None beyond the verify-script contradiction documented above.

## User Setup Required
None - no external service configuration required.

## Follow-up Question (per plan's human-check, not acted on)
The plan's Task 2 human-check asks, for the record: now that the diagram captions are plain, should the `∩` infix in the readout rows below the diagram (`A ∩ B = 12 ∩ 18 = 6`, etc.) also move behind tooltips? This is explicitly out of scope for this item — noted here as a possible follow-up, not acted on. The `#product-overlap` row and all three-circle product rows were left byte-identical to before, still reading their notation directly.

## Human Verification Still Needed
The plan's Task 2 `<human-check>` (open the page in a real browser) was not executable by this headless-only leaf agent. The automated DOM-dump gates cover structure (caption text, tooltip presence and content, counts, product row and lede regression); they do not cover:
- Native tooltip actually appearing on mouse hover in a real browser.
- Click / keyboard (Enter on focused region) / drag-and-drop placement still working in every region of both modes, including clicking directly on a three-circle in-region caption without it swallowing the click.
- Day/night theme legibility of the captions.

These are worth a manual pass before considering this item fully closed from a UX standpoint (see `coverage: D3` above, `human_judgment: true`).

## Next Phase Readiness
The Venn Diagram tool's regions and captions now separate "what a learner reads" from "what a learner can look up." No blockers for other tools; this change is fully contained to `Venn Diagrams/venn-diagrams.html`.

---
*Phase: quick-260926-rb7*
*Completed: 2026-09-26*

## Self-Check: PASSED

- FOUND: `Venn Diagrams/venn-diagrams.html`
- FOUND: commit `94a25b4` (Task 1)
- FOUND: commit `c40c0d8` (Task 2)
- Corrected headless-Chrome verify script for both tasks exits 0 (see Deviations section for the one corrected assertion).
