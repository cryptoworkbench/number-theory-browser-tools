# Phase 5: Cayley Table Generator - Context

**Gathered:** 2026-09-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship a new, standalone self-contained tool that generates and displays a Cayley table (group operation table) for Z/NZ under addition and (Z/NZ)ˣ under multiplication, as this milestone's single narrowly-scoped step into group theory. Not in scope: symmetry groups, permutation groups, cosets, quotient groups, or any abstract-algebra visualizer beyond this one tool (per PROJECT.md's Out of Scope section and the user's own milestone-scoping decision).

</domain>

<decisions>
## Implementation Decisions

### Relationship to the Congruence Wheel tool
- **D-01:** Ships as its own standalone tool — own top-level directory, own single self-contained HTML file — NOT a third tab merged into `Congruence Wheel/congruence-wheel.html`. — **Reversibility:** reversible — a separate file is easy to fold together or split further later.
- The user's exact framing when asked standalone-vs-paired was "Both": read as *separate file* (per repo's one-tool-one-file convention) but *designed as a close interaction sibling* — same modulus input, same Additive/Multiplicative mode-toggle pattern, same math (Z/NZ addition, (Z/NZ)ˣ multiplication), and a two-way cross-link between the two tools (mirroring how the Euclidean Algorithm/GCD tool now cross-links with Venn Diagrams).
- Reuse (by duplicating, per repo convention — no shared module) the Congruence Wheel's exact `MODES` config shape: `elements(N)` (element list per mode — all of `0..N-1` for additive, `unitsMod(N)` for multiplicative), `op(a,b,N)`, `identity(N)`, plus per-mode wording. The Congruence Wheel's `unitsMod(N)` helper (`Congruence Wheel/congruence-wheel.html:524`: `function unitsMod(N){ var out = []; for (var r = 0; r < N; r++) if (gcd(r, N) === 1) out.push(r); return out; }`) is the exact helper to duplicate for the multiplicative element list here.

### Large-N handling (LOCKED — user explicitly chose this over the recommended cap-the-input alternative)
- **D-02:** Do NOT cap the modulus input to a small fixed max. Allow larger N; the table container scrolls (horizontally and/or vertically) and/or cells shrink below their default size as N grows, rather than clamping N down the way GCD-05's tile view clamps its rendered square count. — **Reversibility:** costly — switching to a hard input cap later would change the input's `max` attribute and the layout/CSS strategy together, and could invalidate any test/preset built around a large-N scroll case.
- This was an explicit, considered choice against the recommended alternative (cap the input) — the roadmapper's flagged concern (an unbounded N produces an unreadable/slow grid, especially additive mode's N×N vs multiplicative mode's smaller φ(N)×φ(N)) still applies and must be addressed within the scroll/shrink approach, not ignored: cells must have a legibility floor (a minimum px size below which they stop shrinking and the container scrolls instead), and there should still be a sane practical ceiling on N (a large but generous one, e.g. bounded by input validation to avoid pathological values) so the DOM node count and render time stay reasonable — this is an implementation-detail decision for the planner/executor, not a re-litigation of D-02's core choice.

### Interactive features (all locked, from the milestone-scoping conversation)
- **D-03:** Click any table cell to see the underlying equation (e.g. `3 + 5 = 8 ≡ 2 (mod 6)` in additive mode, or the analogous product form in multiplicative mode) with that cell's row and column headers simultaneously highlighted.
- **D-04:** The identity element's row and column are visually distinguished (identity is `0` in additive mode, `1 % N` in multiplicative mode, matching the Congruence Wheel's `identity(N)` per-mode function).
- **D-05:** The table visually demonstrates diagonal symmetry (commutativity) as an explicit teaching point — not merely true by construction, but called out/visible in the diagram (e.g. a note, or a visual echo when hovering/selecting a cell that also highlights its mirror across the diagonal).
- **D-06:** Elements that are their own inverse (diagonal cells where `op(x, x, N) === identity(N)`) are visually highlighted, distinct from the identity highlight (D-04) and the diagonal-symmetry treatment (D-05) — three distinct visual treatments that must remain readable together, not collide into visual noise.

### Colors
- All colors resolve through `var()` against `assets/palette.css` tokens, including the `--role-*` semantic layer. Reuse/extend the Congruence Wheel's `--slot-*` local-alias pattern (`Congruence Wheel/congruence-wheel.html:21-26`) for this tool's own needs (e.g. a selected-cell highlight, the identity row/column, the self-inverse-diagonal highlight) — no new literal colors, no new base hues.

### Claude's Discretion
- The exact legibility floor (minimum cell px size) and the practical N ceiling within D-02's scroll/shrink approach.
- Exact visual treatment distinguishing D-04 (identity), D-05 (diagonal symmetry), and D-06 (self-inverse) from each other and from the D-03 click-selection highlight — four things that can all be simultaneously visible and must stay legible together.
- Exact wording/copy throughout (headings, captions, equation format per mode).
- Whether the diagonal-symmetry teaching point (D-05) is a static caption, an interactive hover echo, or both.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — CAYLEY-01 through CAYLEY-07, NAV-03 (exact requirement text)
- `.planning/ROADMAP.md` — Phase 5 section: goal, success criteria, mode (mvp), depends_on (Phase 1 only — independent of Phase 3/Phase 4)

### Project-level
- `.planning/PROJECT.md` — Cayley table generator milestone scope, Key Decisions table entries dated 2026-09-27, and the Out-of-Scope boundary (no symmetry/permutation groups, cosets, or quotient groups in this phase)
- `CLAUDE.md` and `.claude/CLAUDE.md` — architecture pattern (single self-contained HTML file per tool, `svgEl()` helper if SVG is used, math helpers duplicated per-file, `assets/palette.css` `var()`-only color rule including `--role-*` semantic layer)

### Sibling tool to echo/cross-link
- `Congruence Wheel/congruence-wheel.html` — the `MODES` config (lines ~435-472), `unitsMod(N)` helper (line 524), `select(idx)` interaction (line 721), and the `--slot-*` palette-alias pattern (lines 15-27) are all direct precedent for this tool's own implementation. Read in full before planning.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets (duplicate, per repo convention — do not extract a shared module)
- `assets/palette.css` — shared color tokens including `--role-*` semantic layer.
- `assets/site.css` / `assets/theme.js` — shared nav header, day/night toggle.
- Congruence Wheel's `MODES` config shape, `unitsMod(N)`, `gcd()` helper, and `--slot-*` palette-alias pattern — see canonical_refs above.
- Euclidean Algorithm tool's recent Venn Diagrams cross-link (D-05 of Phase 2's CONTEXT.md) is the most recent precedent for how to build a two-way cross-link between two already-shipped tools — same pattern applies here between the new Cayley tool and the Congruence Wheel.

### Established Patterns
- `svgEl(tag, attrs)` helper if any part of the table is SVG-rendered (may not be needed — a Cayley table is naturally an HTML `<table>` or CSS-grid of cells, not necessarily an SVG diagram; this is a planner/executor judgment call, not locked here).
- IIFE-wrapped `<script>`, math helpers at top, render functions, event wiring, load-time example — standard per-file structure.

### Integration Points
- New tool needs registration in `index.html` hub (new card) and every existing page's shared nav header — now eleven pages including the Euclidean Algorithm tool just shipped in Phase 2 — matching how the GCD tool was onboarded.
- The Congruence Wheel cross-link (D-01) is the one integration point reaching back into already-shipped tool code.

</code_context>

<specifics>
## Specific Ideas

- The three simultaneous visual highlights (identity row/column, diagonal symmetry, self-inverse cells) plus the click-to-select equation highlight are the tool's core pedagogical payload — worth extra care in planning to keep them visually distinct and non-colliding (see Claude's Discretion).
- This tool should feel like a visual sibling of the Congruence Wheel (same modulus input, same mode-toggle labels "Additive Groups" / "Multiplicative Groups") even though its own diagram (a grid, not a wheel) is completely different.

</specifics>

<deferred>
## Deferred Ideas

- Symmetry groups, permutation groups, cosets, quotient groups, or any other abstract-algebra visualizer — explicitly out of scope for this milestone per PROJECT.md; a future milestone's work.
- A hard input cap on N — considered and explicitly rejected in favor of D-02's scroll/shrink approach.

### Reviewed Todos (not folded)
None — no pending todos matched this phase during discussion.

</deferred>

---

*Phase: 5-cayley-table-generator*
*Context gathered: 2026-09-27*
