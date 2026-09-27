# Quick Task 260927-cr7: Venn Diagram tool: (1) Rename the tool to "Venn Diagrams" (plural), both internally (variable/id/file names, comments) and externally (directory name, page title, nav links, hub card). (2) Add drag-and-drop interaction so a user can pick up a prime-factor chip and drop it into a different region of the diagram (overlapping vs non-overlapping regions), moving it between set memberships. (3) In three-circle mode, the hover tooltip text still shows plain-language labels (e.g. "A only", "A and B only") alongside set notation — strip the plain-language part so the tooltip shows only set-theory notation. - Context

**Gathered:** 2026-09-27
**Status:** Ready for planning

<domain>
## Task Boundary

Three fixes to `Venn Diagrams/venn-diagrams.html` (directory/filename already plural):
1. Flip remaining singular "Venn Diagram" display text to plural "Venn Diagrams".
2. Add drag-and-drop for moving an already-placed prime between regions.
3. Strip plain-language captions from the three-circle mode's native `<title>` tooltip, leaving only set notation.

</domain>

<decisions>
## Implementation Decisions

### Rename scope
- Flip every user-facing occurrence of "Venn Diagram" to "Venn Diagrams": `<title>`, site-nav link text, `<h1>`, and the hub card heading in `index.html`.
- Also check and pluralize the hub card's description/body prose in `index.html` if it names the tool there.
- Remove/update the two code comments (around line 479 and line 613 of `venn-diagrams.html`) that explicitly lock in singular naming as an intentional past decision — that decision is now reversed.
- Do NOT touch `localStorage` keys (`venn-diagrams`, `venn-diagrams-three`, `venn-diagrams-mode`) — they are already the plural slug and changing them would drop returning users' saved state.

### Drag scope
- The picker → region drag-and-drop already works today (dragstart on a picker chip, drop on a region) — that is NOT the gap.
- The actual new capability: make already-placed prime tokens (in a region) draggable, so a user can drag one directly from its current region and drop it into a different region, changing its set membership in one motion, in both two-circle and three-circle modes.
- Dragging a placed token should remove it from its origin region and add it to the target region (equivalent to remove + re-place), reusing existing placement/removal logic rather than inventing new state.

### Full-region drop
- If the target region is already at its per-region cap (`MAX_PER_REGION` / `MAX_PER_REGION3`, currently 8) when a placed-token drag is dropped there, reject the move: the chip returns to its original region, and the existing "region is full" message is shown (same behavior as the current picker-drop full-region case) — do not bump out an existing prime.

### Tooltip text (three-circle mode)
- The native SVG `<title>` tooltip at line ~767 currently reads `REGION_CAPTIONS3[key] + ' (' + REGION_NOTATION3[key] + ')'` (e.g. "A only (A \ B \ C)"). Change it to show only `REGION_NOTATION3[key]` (set notation alone, e.g. "A \ B \ C").
- This applies only to the hover tooltip text itself. Status/message strings elsewhere that use `REGION_CAPTIONS3` (e.g. "Placed 7 in the A only region.") are out of scope — the user asked specifically about hover-only text.

### Claude's Discretion
- Exact drag-and-drop visual affordance for placed tokens (cursor, drag ghost, drop-target highlight) — reuse whatever styling/behavior the existing picker-chip drag already uses for consistency.
- Whether dragging a placed token onto its own current region is a no-op or triggers a brief visual settle — no functional difference either way.

</decisions>

<specifics>
## Specific Ideas

No specific requirements beyond the decisions above — open to standard approaches for wiring the new drag source.

</specifics>

<canonical_refs>
## Canonical References

No external specs — requirements fully captured in decisions above.

</canonical_refs>
