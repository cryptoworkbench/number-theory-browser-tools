# Project Research Summary

**Project:** Number Theory Browser Tools — new visualizers (Euclidean Algorithm/GCD, Chinese Remainder Theorem, Continued Fractions) + site-wide palette unification
**Domain:** Static, zero-build, single-file-per-tool educational web app (interactive number-theory visualizations)
**Researched:** 2026-09-23
**Confidence:** HIGH

## Executive Summary

This milestone adds three new self-contained HTML visualizers to an established zero-dependency repo (5 existing tools, each a single `.html` file with inline SVG/CSS/vanilla-JS, no build step, no framework) and unifies the color palette across all 8 tools. Experts building this class of product lean entirely on native web platform primitives already proven in this codebase — `document.createElementNS` for SVG diagrams, CSS transitions/`@keyframes` for reveals, a `requestAnimationFrame` + `generation`-counter loop for scrubbable playback, and `getPointAtLength()` for path-following animation. No new library or tooling is warranted; the three new tools are a geometry/interaction design problem, not a tooling gap, and the research is explicit that charting libraries, canvas frameworks, animation libraries, and build tooling would all violate the repo's zero-dependency, open-the-file-directly constraint for no functional benefit.

The recommended approach: each new tool reuses well-established pedagogical visual metaphors — rectangle/square-tiling for GCD and Continued Fractions (the same geometric operation, so they should feel like visual siblings while remaining independently-coded per repo convention), and an extension of the existing "Congruence Wheel" (from Pizza Slices) for CRT's residue-class intersection. All three reuse the site's house patterns for playback controls and preset chips rather than inventing new UI. Palette unification should happen as its own phase, first, via a new `assets/palette.css` that existing tools' `--st-*`/tool tokens alias into, before any new tool is built — so new tools are authored once against the final pattern rather than retrofitted.

The key risks are all concrete and specific, not generic: (1) naive palette unification can silently flatten pedagogically-meaningful role colors (RSA's Bob/Alice/Eve, Sieve's prime/composite) if collapsed into one hex set instead of split into shared-structural + derived-role tiers; (2) the GCD tool's naive rectangle-tiling visualization can render a number of tiles proportional to the *quotient* (unbounded, not the O(log n) step count), which is a sharper performance cliff than anything in the existing five tools and must be capped from the start; (3) CRT's combined modulus can silently overflow `Number` precision even with small-looking individual moduli, so it must use `BigInt` from day one, following the RSA tool's precedent rather than the other four tools' `Number`-based pattern; and (4) Continued Fractions must explicitly label truncation for irrational inputs (float precision otherwise falsely implies termination, undermining the concept the tool exists to teach) and needs a first-class convergents/error view, not just a reused GCD-style division animation, or it's pedagogically redundant with the GCD tool.

## Key Findings

### Recommended Stack

No new libraries or build tooling. The three new tools extend the existing native-web-platform toolkit already exercised by all 5 current tools: inline SVG built via `svgEl()`-style helpers, CSS custom-property theming, CSS transitions/`@keyframes` for reveals, and rAF-driven playback with a `generation` counter for restart-safety. Two additional native primitives are newly relevant for this milestone: `stroke-dasharray`/`stroke-dashoffset` for "line drawing" animations (e.g. a convergent line, a search-pointer sweep), and `SVGGeometryElement.getPointAtLength()`/`getTotalLength()` for animating a marker along a non-linear path (e.g. a convergent "walking" a staircase toward the target value). `<defs>`/`<use>` should be used to de-duplicate repeated shapes (unit tiling squares) when a quotient/term count is large, keeping the DOM light without a virtualization library. CSS `@property` is a safe, gracefully-degrading progressive enhancement for smoother theme-toggle transitions if adopted in the shared palette work.

**Core technologies:**
- Inline SVG via `document.createElementNS` — renders all new diagrams — matches the existing `svgEl()` house pattern and gives per-element interactivity (hover/click) that canvas/charting libraries can't offer without reimplementing hit-testing
- CSS transitions + `@keyframes` — staggered step reveals — declarative, GPU-composited, zero extra JS, matches existing tools
- `requestAnimationFrame` + `generation` counter — playback controls (play/pause/step/instant-finish) — the established house pattern from Sieve and Completing-the-Square; correctly invalidates stale callbacks on restart
- `stroke-dasharray`/`stroke-dashoffset` and `getPointAtLength()` — new to this milestone — native, GPU-composited primitives for line-draw and path-following animation (convergent staircase, CRT search sweep), replacing what other projects would reach for a path-animation library to do
- BigInt (already used by RSA) — must be adopted for CRT's core arithmetic to avoid silent `Number` precision overflow

### Expected Features

Three topics researched in depth (GCD/Euclidean, CRT, Continued Fractions), plus a cross-cutting palette-unification UX section.

**Must have (table stakes), per new tool:**
- GCD: integer input validation, animated `(a,b)→(b,a mod b)` step trace with playback controls, final-GCD highlight, preset chips (coprime pair, multiple-of pair, equal pair)
- CRT: ≥2 congruence inputs (`x ≡ a mod m`), pairwise-coprimality validation with explicit rejection messaging, visual residue-class intersection (ring or number-line), step-by-step trace, preset "remainders riddle" chips
- Continued Fractions: fraction/rational input with `[a0;a1,...]` expansion, square-filling-rectangle animated visualization (the field's dominant pedagogical device), convergents table synced to the animation, preset chips (φ, 22/7)
- Site-wide: shared base palette (bg/text/border/accent tokens) applied identically across all 8 tools

**Should have (competitive/differentiators):**
- GCD: optional rectangle/geometric tiling view alongside the numeric trace; Extended Euclidean/Bézout-coefficient "advanced mode" (feeds CRT's construction method)
- CRT: animated brute-force scanning search as the primary "watch it land" beat; toggle between 2 and 3 congruences; cross-link to the GCD tool for the modular-inverse step
- Continued Fractions: Fibonacci/golden-ratio spiral callout for φ inputs; terms slider redrawing both diagram and table; approximation-error column in the convergents table

**Defer (v2+):**
- Stern-Brocot tree alternate view for Continued Fractions (high complexity, second unfamiliar diagram vocabulary)
- N>3 general CRT solver (actively hurts visualization legibility past 3 residue classes)
- "Try it yourself" predictive-recall mode
- Arbitrary-precision decimal input for irrationals in Continued Fractions

### Architecture Approach

The existing per-tool architecture (single self-contained `.html` file, one sanctioned shared-CSS exception in `assets/`) extends cleanly: add a new `assets/palette.css` as the single source of canonical color tokens (bg, panel, text, text-dim, accent, accent-2, border, danger, success, with night-default / day-override `:root` blocks), which `assets/site.css`'s existing `--st-*` chrome tokens alias into, and which every tool's inline `<style>` block consumes via `var()` rather than redeclaring. Each tool keeps a narrowed local `:root` block for genuinely tool-specific semantic tokens (RSA's actor colors, Sieve's cell states, and new ones like GCD's `--quotient`/`--remainder` or CRT's per-congruence colors), ideally derived from the shared accent via `color-mix()` rather than hardcoded hex, preserving the "derive tints from one base" pattern already load-bearing in 3 of 5 existing tools.

**Major components:**
1. `assets/palette.css` (new) — canonical color-token source of truth, loaded first in every `<head>`
2. `assets/site.css` (existing, modified) — chrome layout/behavior; its tokens become one-line aliases into `palette.css`
3. Each new tool's `<style>`/`<script>` (Euclidean, CRT, Continued Fractions) — tool-local semantic tokens + math/render logic, following the existing single-file, no-shared-JS-module convention

### Critical Pitfalls

1. **Bare element selectors in a new tool's `<style>` leak onto shared site chrome** — already happened once this session (a `header{}` rule collapsed the shared nav). Scope every page-local selector under a page-root class; grep-check for bare top-level element selectors before considering a tool/edit done.
2. **Naive palette unification flattens pedagogically-meaningful role colors** (RSA's Bob/Alice/Eve, Sieve's prime/composite) — split unification into a shared structural tier (bg/text/accent) and a derived-role tier (role colors as `color-mix()` tints of the shared accent), never a single flat hex set.
3. **Dangling references to renamed CSS variables fail silently** — after renaming tokens during the palette pass, grep each file for every old variable name (including inside `<script>`-built SVG attribute strings) before moving to the next file.
4. **GCD/Euclidean rectangle-tiling animation cost scales with the quotient, not the step count** — an innocuous-looking input like `gcd(2, 500000)` can try to render ~250,000 tiles. Cap rendered units per step and collapse excess into a labeled group, designed in from the start.
5. **CRT's combined modulus overflows `Number` precision** even with small individual moduli (multiplicative, not linear, risk growth) — implement CRT's core arithmetic in `BigInt` from the start, following the RSA precedent, not the other four tools' `Number` pattern.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Palette Unification
**Rationale:** Must come first — the palette is a prerequisite design artifact, and building the 3 new tools against today's bespoke per-tool pattern means reworking them immediately after. A migrated existing tool becomes the copy-paste template for the new tools, so it must already be correct before copying begins.
**Delivers:** `assets/palette.css` with canonical tokens (night-default/day-override); `assets/site.css`'s `--st-*` tokens aliased to it; all 5 existing tools migrated (token rename, dangling-reference sweep, bare-selector audit, role-color preservation verified in both themes).
**Addresses:** the "unify color palette" requirement; cross-cutting palette UX findings from FEATURES.md.
**Avoids:** Pitfalls 1 (bare-selector leak), 2 (role-color flattening), 3 (dangling variable references), 4 (dropping the `color-mix()` tint pattern).

### Phase 2: Euclidean Algorithm / GCD Tool
**Rationale:** Simplest of the three new tools conceptually and geometrically; its rectangle-tiling visual is the shared ancestor of the Continued Fractions tool's diagram, so building it first establishes the reusable (copy-pasted, per convention) visual grammar the CF tool will echo. Also produces the Extended Euclidean/Bézout logic CRT's construction method will need.
**Delivers:** Two-integer input, animated `(a,b)→(b,a mod b)` step trace with playback controls, final-GCD highlight, preset chips; tile-count cap on the geometric view engaged for large-quotient inputs.
**Uses:** `svgEl()` SVG rendering, rAF + generation-counter playback, `<defs>`/`<use>` for repeated tiling squares.
**Implements:** self-contained tool file following the migrated Phase-1 template.
**Avoids:** Pitfall 5 (quotient-scaled tile blowup) — cap designed in from the start, not retrofitted.

### Phase 3: Chinese Remainder Theorem Tool
**Rationale:** Depends conceptually on the Extended Euclidean logic from Phase 2 for its construction-method reveal (though it can duplicate that logic locally per repo convention rather than block on Phase 2). Reuses the existing "Congruence Wheel" visual language from Pizza Slices, giving it strong in-house precedent.
**Delivers:** ≥2 congruence inputs with pairwise-coprimality validation, residue-class visual (rings or number-line) with intersection shown, brute-force scanning animation as primary teaching beat, preset "remainders riddle" chips.
**Addresses:** FEATURES.md CRT table-stakes; P1 items (coprimality validation, residue visual, scanning animation).
**Avoids:** Pitfall 6 (Number overflow on combined modulus — BigInt from day one) and Pitfall 7 (accepting non-coprime moduli silently).

### Phase 4: Continued Fractions Tool
**Rationale:** Comes last because it shares core geometry with the GCD tool (Phase 2) and should visually read as a sibling of it — building it after GCD lets the rectangle-tiling pattern be proven once and echoed, not invented twice independently.
**Delivers:** Fraction/rational input with expansion, square-filling-rectangle animation, convergents table with approximation-error awareness, preset chips (φ, 22/7); explicit truncation labeling for irrational/decimal inputs; dual input mode (exact rational vs. approximated irrational) with distinct arithmetic paths.
**Addresses:** FEATURES.md Continued Fractions table-stakes and the convergents-view differentiator.
**Avoids:** Pitfall 8 (float precision falsely implying termination for irrationals) and Pitfall 9 (redundancy with the GCD tool if the convergents view is skipped).

### Phase Ordering Rationale

- Palette work must precede all new-tool work so new tools are authored once, correctly, against the final shared-token pattern (ARCHITECTURE.md's explicit "Build Order" recommendation).
- GCD before Continued Fractions because they share the same rectangle-tiling geometric operation; building GCD first establishes a visual grammar CF can deliberately echo without literally sharing code (per repo's no-shared-JS-module convention).
- CRT can run in parallel with GCD/CF in principle (FEATURES.md notes the three new tools have no hard dependency on each other beyond Phase 1), but sequencing GCD's Extended-Euclidean logic before CRT reduces the risk of solving the same modular-inverse problem twice independently.
- Each new-tool phase must decide its performance/precision guardrails (tile caps, BigInt, truncation labeling) as part of initial design, not as a post-hoc fix — all three are called out in PITFALLS.md as "decide before implementation, expensive to retrofit."
- Nav-list consistency (each of the 8 tool files' `.site-nav` block + `index.html`) must be checked after every new-tool phase, not just at the end.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (CRT):** two credible visual vocabularies (rotating wheels vs. residue grid vs. number-line) are still open per STACK.md — worth prototyping/deciding during phase planning rather than research-phase, but the coprimality-validation UX and the brute-force-vs-construction sequencing deserve a closer look during `/gsd-plan-phase`.
- **Phase 4 (Continued Fractions):** the dual-arithmetic-mode design (exact rational vs. truncated-irrational) is a data-model decision, not just a visualization one — flag for deeper planning-time research if the interaction design isn't obvious from FEATURES.md/PITFALLS.md alone.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Palette Unification):** architecture and exact token/aliasing pattern already fully specified in ARCHITECTURE.md — implementation-ready.
- **Phase 2 (GCD/Euclidean):** rectangle-tiling visualization and playback-control pattern are both well-established house conventions with a single clear cap-the-tile-count mitigation already specified.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH for core web-platform APIs (foundational, long-stable); MEDIUM for domain-visualization conventions (no single canonical reference, but well-established in math-ed literature) |
| Features | MEDIUM | Cross-checked against multiple calculator/visualizer sites and math-ed sources, but no single canonical reference implementation exists for any of the three topics |
| Architecture | HIGH | Verified directly against this repo's actual code (`assets/site.css`, all 5 tools' `:root` blocks), not external inference |
| Pitfalls | HIGH for implementation/CSS/architecture pitfalls (verified directly against repo code, including one pitfall that already occurred this session); MEDIUM for pedagogy pitfalls (grounded in known math-ed patterns, not user-tested against this project's actual learners) |

**Overall confidence:** HIGH

### Gaps to Address

- CRT's primary visual metaphor (rings vs. grid vs. number-line) is not settled — flagged as a phase-planning decision, not a blocker, in STACK.md and FEATURES.md.
- Exact canonical palette token values (hex codes for the unified accent/bg/text) are not chosen by this research — explicitly deferred to the palette-design work itself, per STACK.md ("exact list to be finalized as part of the palette-design work, not this research").
- The precise tile-count cap for GCD's geometric view and the exact term-depth cap for Continued Fractions' irrational truncation are not numerically fixed — both need a concrete default chosen during phase planning (PITFALLS.md suggests ~12 tiles/group and ~10–15 terms as reasonable starting points).

## Sources

### Primary (HIGH confidence)
- Direct inspection of this repository: `assets/site.css`, `assets/theme.js`, `index.html`, all 5 existing tools' `<style>`/`<script>` blocks — grep-verified variable usage, `color-mix()` counts, bare-selector patterns
- `.planning/codebase/STACK.md`, `ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `CONCERNS.md` — recently generated by `/gsd-map-codebase` against the current commit
- `.planning/PROJECT.md` — milestone scope and explicit constraint set
- Long-standing SVG/CSS platform specs (`document.createElementNS`, `getPointAtLength()`, `<use>`/`<defs>`, CSS custom properties + cascade) — foundational, not subject to churn

### Secondary (MEDIUM confidence)
- WebSearch results on rAF-vs-setTimeout animation patterns, `stroke-dasharray`/dashoffset line-draw technique, CSS `@property` baseline support, rectangle-tiling as the standard Euclidean-algorithm/continued-fraction visualization (cross-checked across multiple 2025/2026 sources, math-education sites including r-knott.surrey.ac.uk and stackedboxes.org)
- Survey of CRT/GCD/continued-fraction calculator and visualizer sites (dCode, monocalc, agentcalc, Alpertron, Zerethon, Toolexe, MiniWebTool, Baeldung, NRICH, Robert Dickau, adamponting.com, Wolfram Demonstrations) for feature-landscape and pedagogical-convention findings

### Tertiary (LOW confidence)
- None flagged — all findings were corroborated by at least two independent sources or direct repo inspection

---
*Research completed: 2026-09-23*
*Ready for roadmap: yes*
