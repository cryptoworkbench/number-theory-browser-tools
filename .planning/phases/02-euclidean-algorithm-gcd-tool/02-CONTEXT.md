# Phase 2: Euclidean Algorithm / GCD Tool - Context

**Gathered:** 2026-09-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Ship a new, self-contained tool (`Euclidean Algorithm/euclidean-algorithm.html` or similar) that lets a self-learner explore the Euclidean algorithm and GCD computation two ways at once: an animated numeric step trace `(a,b) → (b, a mod b)` with playback controls, and a geometric rectangle-tiling view of the same process ("repeatedly cut the largest square from a shrinking rectangle"). Optional Extended Euclidean/Bézout coefficients mode. This is the first of three new tools this milestone (GCD → CRT → Continued Fractions), establishing the rectangle-tiling visual grammar the other two will echo.

</domain>

<decisions>
## Implementation Decisions

### Geometric view: large-quotient capping (GCD-05)
- **D-01:** When a step's quotient would require more tiles than a readable cap (e.g. 40), draw the cap's worth of full-size squares, then collapse the remainder into one labeled tile reading `×N` (N = actual excess count) rather than switching to a different view or silently scaling everything down. — **Reversibility:** reversible — purely a rendering rule inside one render function.
- Per project research (`.planning/research/PITFALLS.md` Pitfall 5), the naive "one visual tile per unit of quotient" approach must be capped independent of the step count — a plausible input like `gcd(2, 500000)` would otherwise try to draw ~250,000 tiles and freeze the tab. The cap must engage automatically and be visually obvious (not just "smooth by luck of the demo inputs"), per `PITFALLS.md`'s own suggested acceptance check.
- Every input cap must be surfaced to the user with a visible, specific message near where it kicks in (not a silent truncation) — matches `PITFALLS.md`'s cross-cutting guidance and this repo's existing range-checked-input convention.

### Extended Euclidean / Bézout mode presentation (GCD-06)
- **D-02:** When the user toggles Extended Euclidean mode on, the existing numeric trace table gains two additional columns (`s`, `t`) computed via back-substitution as the animation plays forward — one unified table, not a second animation pass or a static end-only reveal. — **Reversibility:** costly — the trace-table schema and its animation/reveal logic would need to change shape to switch to a different presentation later.
- The toggle stays off by default so a first-time learner sees the uncluttered base visualization first (per `FEATURES.md`'s differentiator guidance: "best as an optional toggle/expand, not default-on").
- On completion, show the final identity explicitly (e.g. `gcd(240,46) = 46·(-9) + 240·(2) = 2`) as a confirmation/landing beat, echoing the existing tools' "clearly highlighted answer" pattern (GCD-03).

### Numeric trace display style (GCD-02)
- **D-03:** Each step appends a line to a growing equation chain in classic division-algorithm form (e.g. `240 = 5·46 + 10`), building downward as a readable derivation — not a compact `a|b|q|r` table. — **Reversibility:** reversible — a display-format choice over the same underlying step data.
- Playback controls (play/pause/step/instant-finish) reuse the existing `requestAnimationFrame` + `generation`-counter pattern already established in the Sieve and Completing-the-Square tools, per `CLAUDE.md` and `FEATURES.md`'s table-stakes guidance — do not invent a new playback mechanism.

### Preset examples (GCD-04)
- **D-04:** Include at minimum: a coprime pair, a pair where one is a multiple of the other, an equal pair, and an edge case exercising the `gcd(a, 0)` / immediate-termination condition — per `FEATURES.md`'s "include an edge case that teaches termination" guidance. Exact numeric values are Claude's/the planner's discretion (see Claude's Discretion below).

### Cross-link with Venn Diagrams (new decision, not in original roadmap text)
- **D-05:** Add a two-way cross-link between this tool and the existing Venn Diagrams tool: the GCD tool notes "see GCD via shared prime factors →" linking to Venn Diagrams, and Venn Diagrams gets a reciprocal "see GCD via the Euclidean algorithm →" link back. Both tools already independently frame themselves around GCD (Venn Diagrams' center row already states `GCD(leftTotal, rightTotal)` explicitly per prior quick-task history), so this makes an existing conceptual connection discoverable from either page. — **Reversibility:** reversible — additive nav/copy change on both pages, easy to remove.
- This means Phase 2's file scope includes a small, additive edit to `Venn Diagrams/venn-diagrams.html` (one link/note added) in addition to the new tool file itself.

### Input range (from research, not re-discussed — carried forward)
- Cap inputs to a friendly range (e.g. up to a few thousand) the same way the Sieve bounds its grid size — this tool has no cryptographic-realism reason to need `BigInt` the way RSA does. Plain `Number` arithmetic is sufficient and matches `PITFALLS.md`'s explicit guidance ("acceptable for GCD... since those inputs are naturally smaller and bounded the same way existing tools already are").

### Claude's Discretion
- Exact preset numeric pairs (beyond the four required categories in D-04).
- Exact visual/geometric styling of the rectangle-tiling view (colors resolve through `assets/palette.css` `var()` tokens per `CLAUDE.md`; specific role mapping is an implementation call).
- Exact wording/placement of the cross-link note (D-05) and the cap-exceeded message (D-01).
- Whether to include the research-suggested "try it yourself — predict the next remainder" stretch feature (`FEATURES.md` explicitly flags this as optional/MEDIUM priority, "only if scope allows — do not let this block shipping the core visualization"). Default to NOT building it in the first pass unless it's trivial once the core trace exists; do not let it block shipping.
- One short caption line on algorithm efficiency (e.g. "Fibonacci pairs take the most steps") is fine; a full complexity-theory section is explicitly an anti-feature per `FEATURES.md` — do not add one.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & roadmap
- `.planning/REQUIREMENTS.md` — GCD-01 through GCD-06 (exact requirement text), NAV-02 (architecture-pattern compliance, already satisfied by prior quick tasks but must remain true for this tool too)
- `.planning/ROADMAP.md` — Phase 2 section: goal, success criteria, mode (mvp), depends_on (Phase 1)

### Research (already gathered at milestone setup, before this discussion)
- `.planning/research/PITFALLS.md` — Pitfall 5 (quotient-scaled tile rendering blowup — the capping requirement behind D-01); also the cross-cutting input-cap-must-be-visible guidance and the acceptance-check note ("verify with a deliberately large-quotient input e.g. gcd(2, 500000)")
- `.planning/research/FEATURES.md` — Topic 1 (Euclidean Algorithm / GCD): table stakes, differentiators, and anti-features tables that this CONTEXT.md's decisions are grounded in; also the cross-topic notes on sharing (not extracting) rectangle-tiling visual grammar with the future Continued Fractions tool (Phase 4)
- `.planning/research/ARCHITECTURE.md`, `.planning/research/STACK.md` — general project architecture/stack constraints (single-file, vanilla JS, no framework)

### Project-level
- `CLAUDE.md` and `.claude/CLAUDE.md` — architecture pattern (single self-contained HTML file per tool, inline `<style>`/`<script>`, `svgEl()` SVG helper, playback-controls `generation`-counter pattern, math helpers duplicated per-file not shared, `assets/palette.css` `var()`-only color rule including the `--role-*` semantic layer)
- `.planning/PROJECT.md` — core value, audience (self-directed learners), explicitly-out-of-scope items (group theory/Cayley tables — irrelevant to this phase, noted here only so the planner doesn't accidentally scope-creep toward it)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `assets/palette.css` — shared color tokens (including `--role-*` semantic layer); all new tool colors must resolve through `var()` against this file, no literal colors.
- `assets/site.css` / `assets/theme.js` — shared nav header, day/night toggle; every new tool links these the same way the nine existing tool pages do.
- Sieve of Eratosthenes and Completing-the-Square tools — source of the established play/pause/step/instant-finish playback pattern (`requestAnimationFrame`-driven loop + `generation` counter to invalidate stale callbacks on restart).
- Congruence Wheel tool (`Congruence Wheel/congruence-wheel.html`) — recently added `--slot-a`/`--slot-b`/`--slot-sum` palette-alias pattern and reference-list UI conventions; useful precedent for role-color aliasing if the GCD tool needs its own named slots (e.g. for "current a", "current b", "remainder").
- Venn Diagrams tool (`Venn Diagrams/venn-diagrams.html`) — already has a `gcd()` Euclidean helper and GCD-framed center row; D-05's cross-link touches this file additively.

### Established Patterns
- `svgEl(tag, attrs)` helper — repeated verbatim per file for SVG element construction; the rectangle-tiling geometric view should use this, not Canvas.
- IIFE-wrapped `<script>`, math helpers at top of script block, then render functions, then event wiring at bottom, then a `window.addEventListener('load', ...)` that runs an example on page load — the standard per-file structure documented in `CLAUDE.md`.

### Integration Points
- New tool needs registration in `index.html` hub (new card) and every existing page's shared nav header (`.site-nav` link list) — matches how Diffie-Hellman and Venn Diagrams were onboarded previously.
- D-05's Venn Diagrams cross-link is the one integration point that reaches back into already-shipped tool code.

</code_context>

<specifics>
## Specific Ideas

- Rectangle-tiling view should be designed to *feel like a sibling* of the future Continued Fractions tool's rectangle view (same visual grammar, same "cut the largest square" loop) even though the code itself is duplicated per-file per repo convention — a learner may use both tools back-to-back.
- The `×N` capped-tile badge (D-01) and the final Bézout identity line (D-02) are both "landing beat" moments — treat them with the same visual weight/emphasis the existing tools give their answer-reveal moments (e.g. Sieve's primes, Factor Tree's leaves).

</specifics>

<deferred>
## Deferred Ideas

- "Try it yourself" predict-the-next-remainder interactive mode — explicitly optional per research (`FEATURES.md`), left to planner/executor discretion whether it's cheap enough to include; not required.
- Full algorithmic-complexity / Lamé's theorem content — explicitly out per research anti-features; at most one short caption line.
- Group theory / Cayley table visualizers — out of scope for this entire milestone per `PROJECT.md`; unrelated to this phase, noted only to prevent confusion since it came up in the same conversation as this phase's discussion.

### Reviewed Todos (not folded)
None — no pending todos matched this phase during discussion.

</deferred>

---

*Phase: 2-euclidean-algorithm-gcd-tool*
*Context gathered: 2026-09-27*
