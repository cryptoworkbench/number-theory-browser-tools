# Stack Research

**Domain:** Interactive browser-based math visualizations (Euclidean algorithm/GCD, Chinese Remainder Theorem, continued fractions) — vanilla SVG/CSS/JS, zero-dependency, single-file-per-tool
**Researched:** 2026-09-23
**Confidence:** HIGH for core web-platform APIs (foundational, Baseline-stable, cross-checked against MDN-class sources); MEDIUM for domain-visualization conventions (no single canonical reference implementation, but the geometric technique is well established in math-education literature)

This document does **not** revisit the existing stack decision (vanilla HTML/CSS/JS, no framework, no build step) — that is locked in and confirmed correct by `.planning/codebase/STACK.md`. It extends that stack with the specific vanilla techniques needed for three new visualizers and for the site-wide palette unification, and is explicit about where a library would be tempting but wrong for this codebase.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Inline SVG via `document.createElementNS` | DOM Level 3 Core / SVG 1.1+ | Renders all three new diagrams (rectangle-tiling grid, residue wheels, staircase/spiral) | Already the established pattern in all 5 existing tools (`svgEl()` helper). SVG is a retained-mode DOM tree, so each shape (square, sector, dot) is a real element that can carry its own CSS transition, `title`/`aria-label`, and click/hover handler — exactly what "click a residue to see why it's excluded" or "hover a square to see the quotient step" interactions need. No new API surface to learn; just more geometry. |
| CSS transitions + `@keyframes` | CSS3 | Staggered step reveals, hover states, decorative motion | Matches the existing per-tool style (`Christmas Trees`, `Sieve of Eratosthenes` both animate reveal via CSS transition on freshly-inserted SVG/DOM nodes). Declarative, GPU-composited for `transform`/`opacity`, and needs zero JS beyond toggling a class or setting inline style — cheapest possible animation for one-shot reveals. |
| `requestAnimationFrame` (rAF) loop with a `generation` counter | Web API, universal support | Playback controls (play/pause/step/scrub) for multi-step algorithms (Euclidean subtraction steps, CRT search-and-check, continued-fraction convergent walk) | Already the pattern in `Sieve of Eratosthenes` and `Factorize By Completing The Square`. rAF syncs to the browser's paint cycle (60fps, no jank) unlike `setInterval`/`setTimeout` for continuous animation; the existing `generation` counter idiom (increment on restart, closures check they're still current) is the correct fix for "user mashes restart mid-animation" — no cancellation-token library needed, it's ~3 lines of vanilla JS. |
| `stroke-dasharray` / `stroke-dashoffset` | SVG/CSS, universal support | "Line drawing" animation — e.g. animating the Euclidean algorithm's subtraction line, a continued-fraction convergent line converging onto the target ratio, or a CRT search pointer sweeping a number line | Standard, GPU-composited technique for animating an SVG `<path>`/`<line>` being "drawn." No dependency (historically people reached for Vivus.js for this — no longer needed; native CSS/SVG does it in ~5 lines). |
| `SVGGeometryElement.getPointAtLength()` / `getTotalLength()` | SVG DOM API, universal support (Chrome, Firefox, Safari, Edge — has been supported for over a decade) | Moving a marker/dot smoothly along an arbitrary path — e.g. a "convergent approaching the target value" dot walking a staircase path, or a point spiraling inward for the GCD nested-square animation | This is the correct vanilla primitive for "animate a dot along a non-linear path" and is directly relevant to the "staircase/spiral" continued-fraction visualization named in the milestone brief. Interpolate `length = progress * totalLength` inside the existing rAF loop and call `getPointAtLength(length)` each frame to get `{x, y}` — no path-animation library (e.g. GSAP's MotionPath plugin) needed. |
| CSS custom properties (`:root` tokens), consolidated into `assets/site.css` | CSS3 | Site-wide palette unification across all 8 tools | Already the mechanism each tool uses locally (`--bg`, `--accent`, etc., per `.planning/codebase/STACK.md`). Unifying means deleting each tool's local `:root` palette block and pointing at the shared tokens already established by `assets/site.css`/`assets/theme.js` — a CSS-only change, no new technology required. |
| `<defs>` + `<use href="#id">` | SVG 1.1+, universal support | De-duplicating repeated shapes — e.g. the unit squares in a GCD/continued-fraction rectangle-tiling diagram, or a reusable arrowhead `<marker>` between CRT residue wheels | Worst-case inputs (e.g. consecutive Fibonacci numbers passed to the GCD tool) can produce many small tiling squares. Defining one `<rect id="unit-square">` in `<defs>` and instancing it via `<use x="…" y="…">` keeps the DOM light without introducing any virtualization/diffing library — this is the native SVG answer to "avoid duplicating markup," directly analogous to a `<symbol>`/sprite sheet. |

### Supporting Libraries

None needed beyond what's already in the repo (Google Fonts). See "What NOT to Use" below — this section is intentionally empty because every technique above is a native browser API already exercised by the existing 5 tools; the three new tools are a geometry/interaction design problem, not a tooling gap.

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| — | — | — | No supporting library is warranted for these three visualizers under the zero-dependency constraint. If a genuine gap appears during implementation (it hasn't in research), re-evaluate against "What NOT to Use" first. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Browser DevTools (any modern browser) | Manual verification by opening the `.html` file directly | Matches existing repo convention — no test runner, no linter config exists or is needed at this scale. |
| Browser DevTools "Animations" panel | Debugging rAF/CSS-transition timing for the new playback controls | Useful for tuning stagger/easing on the rectangle-tiling reveal and the CRT wheel rotation without adding any tooling dependency. |

## Installation

```bash
# No package manager, no build step — this project has no npm install step.
# New tools are created by copying the existing single-file pattern:
#   <NewTool>/<new-tool>.html  — inline <style> + inline <script>, IIFE-wrapped.
# The only external resource permitted is a Google Fonts <link> tag, exactly as
# in the 5 existing tools.
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|--------------------------|
| Inline SVG (`document.createElementNS`) | HTML5 `<canvas>` | Only if you needed thousands of independently-animated particles (e.g. a physics-style sieve of Eratosthenes with hundreds of bouncing dots) where per-element DOM overhead would matter. None of the three new visualizers approach that scale (GCD steps, CRT residues, continued-fraction terms are all small counts, typically <100 elements) — SVG's per-element interactivity (hover a specific square, click a specific residue) is more valuable here than canvas's raw draw throughput, and it matches all 5 existing tools. |
| CSS transitions/`@keyframes` + rAF | GSAP / anime.js / Motion One | Only if you needed complex timeline sequencing (parallel + sequential tweens, scrubbable master timelines with labels) that plain rAF + a `generation` counter can't express cleanly. The existing tools already prove this pattern scales to fairly elaborate playback controls (Sieve, Completing-the-Square) without a library; the three new tools have comparable or simpler animation needs. |
| Hand-rolled `Fraction`/rational-number helper (numerator/denominator pair + a `gcd()` reduce step, duplicated per file per repo convention) | `fraction.js` / `big.js` / `decimal.js` | Only if the project needed arbitrary-precision decimal arithmetic or fraction arithmetic beyond what native `BigInt` + a ~15-line reduce-by-gcd helper provides. Continued fractions and CRT both only need integer/rational arithmetic well within what the RSA tool's existing `BigInt` usage already demonstrates is sufficient. |
| Manually authored CSS custom-property palette in `assets/site.css` | `chroma.js` / `d3-color` / `culori` (runtime color manipulation, palette generation, contrast checking) | Only if the palette needed to be generated or adjusted at runtime (e.g. a user-facing "pick an accent hue" control that derives a full ramp). This milestone's palette unification is a one-time design decision baked into static CSS values — no runtime color math is required. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|--------------|
| Charting/dataviz libraries (D3.js, Chart.js, Plotly, Observable Plot) | These are built for statistical charts (axes, scales, legends, data-binding to arrays of records). The three new diagrams are bespoke geometric/pedagogical illustrations (a tiled rectangle, two intersecting wheels, a staircase of convergents) with hand-tuned, non-data-driven layout — none of D3's scale/axis machinery buys anything here, and D3 alone is a bigger dependency than every existing tool's entire codebase combined. It would also be the first external JS dependency in the repo besides fonts, breaking the zero-dependency constraint for no functional gain. | Hand-computed geometry in the render function (as all 5 existing tools already do) + `svgEl()` helper. |
| Canvas-based drawing/animation libraries (p5.js, Two.js, Konva, Fabric.js, PixiJS) | Canvas is immediate-mode: there is no per-shape DOM node to attach a CSS transition, a hover listener, or an `aria-label` to — you'd have to hand-roll hit-testing and re-implement the transition/interactivity behavior that SVG's retained-mode DOM gives for free, which is exactly what all 5 existing tools rely on (e.g. hovering an individual factor-tree node, clicking an individual pizza slice). Introducing Canvas for only 3 of 8 tools would also fragment the codebase's single rendering model. | Inline SVG via `document.createElementNS`, per existing convention. |
| SMIL (`<animate>`, `<animateTransform>` SVG elements) as the primary animation mechanism | SMIL is deprecated in favor of CSS Animations/Web Animations API per browser vendor guidance (Chrome intended to remove native SMIL support years ago; while it still works today in all major engines, it's a frozen/legacy feature with no further investment, and CSS transitions already cover everything the new tools need). | CSS `@keyframes`/transitions for one-shot reveals; rAF loop for interactive, scrubbable, or state-dependent animation (play/pause/step). |
| Any general animation library (GSAP, anime.js, Motion One, Lottie, Framer Motion) | None of the three new visualizers need timeline sequencing, physics-based easing, or SVG morphing beyond what CSS transitions + a rAF loop with a generation counter already deliver (proven by the existing Sieve and Completing-the-Square tools). This would be the single largest violation of the "no external JS dependency beyond Google Fonts" constraint for a capability the repo doesn't actually need. | CSS transitions/`@keyframes` for declarative motion; rAF + `getPointAtLength()` for programmatic path-following motion. |
| A shared/extracted JS module for the new math helpers (`gcdSteps()`, `continuedFractionTerms()`, `crtSolve()`) | Explicitly against repo convention: `CLAUDE.md` states number-theory helpers are intentionally duplicated per file, not extracted into a shared module, "unless explicitly asked." | Write each new tool's math helpers inline in its own `<script>` block, following the same naming/style as `primeFactors()`, `bigGcd()`, `modPowPlain()` in the existing tools. |
| A JS build step / bundler (esbuild, Vite, webpack, Rollup) "just to share a small `svgEl()`/palette-token utility" | The project has zero build tooling by design — introducing one for 3 new files would be a bigger architectural change than anything the milestone actually asks for, and breaks "open the `.html` file directly" as the dev/test loop. | Copy-paste the `svgEl()` helper into each new tool's `<script>` block (already the pattern across all 5 existing tools — it is "repeated verbatim," per `CLAUDE.md`). |

## Stack Patterns by Variant

**Euclidean Algorithm / GCD visualizer (subtractive/rectangle-tiling):**
- Use the classic square-tiling geometric proof as the primary diagram: represent the two inputs as a rectangle's side lengths, repeatedly inscribe the largest possible squares along the longer side (equivalent to one division step, quotient = number of squares placed), recurse into the leftover rectangle; final square size = GCD.
- Build it as nested `<rect>` elements sized/positioned by a JS layout function (mirrors the existing `Christmas Trees` factor-tree's "compute geometry from container width, then reveal with staggered timeouts" structure) with `<use>`/`<defs>` for repeated unit squares when the quotient is large.
- Reuse the same playback-control idiom as `Sieve of Eratosthenes` (play/pause/step/instant-finish via rAF + generation counter) so a learner can step through Euclid's algorithm one division at a time.
- Because this exact geometric process also produces the continued-fraction terms (the sequence of quotients), design the rectangle-tiling renderer as a reusable pattern (copy-pasted, per convention) between the GCD tool and the continued-fractions tool rather than inventing two unrelated visual languages — this is a design-consistency win, not a code-sharing one (still duplicate the file-local implementation).

**Chinese Remainder Theorem visualizer (intersecting residue classes):**
- Extend the existing "Congruence Wheel" visual language from `Pizza Slices` rather than inventing a new metaphor: render two (or more) circular wheels, each partitioned into sectors for one modulus, and animate them "spinning" (CSS `transform: rotate()` with transition, or synchronized via rAF) until the sectors that satisfy both congruences visually align — this reuses a pattern the target audience (self-learners who may have already used the Pizza Slices tool) already recognizes, and reuses the existing SVG-sector-drawing code shape (arcs via `<path d="A rx ry …">`).
- Alternative/supplementary diagram: a 2D grid (residue mod *m* on one axis, mod *n* on the other) where the CRT solution is the highlighted intersecting cell, useful for learners who find the grid model clearer than two rotating wheels — worth prototyping both and picking one, or offering both as tabs, during phase planning rather than deciding now.
- A number-line variant (two colored dot-sequences marking `x ≡ a (mod m)` and `x ≡ b (mod n)` candidates on a shared line, converging visually on the shared solution) is the simplest to implement and is a reasonable MVP fallback if the wheel/grid prove too complex for the phase budget.

**Continued fractions visualizer (rational approximation staircase/spiral):**
- Primary diagram: the same rectangle/square-tiling decomposition used for the GCD tool (a rectangle of dimensions *p*/*q* decomposed into squares yields the continued-fraction terms directly as the quotients) — pair this with a "peeling" animation (CSS transition shrinking/removing each square in sequence).
- Secondary/companion diagram: a "staircase" of convergents *p₀/q₀, p₁/q₁, …* plotted as points converging on the target value along a number line or zoomed axis; animate a marker walking the staircase path using `getPointAtLength()` inside the existing rAF loop, giving the "approaching the true value" feel named in the milestone brief without needing a charting/scale library — compute the linear (or log-scaled, for visual clarity on rapidly-converging fractions) axis position in the layout function, exactly as the existing tools compute geometry from container width.
- A true logarithmic "spiral" (à la a Fibonacci/golden-spiral of quarter-circle arcs) is visually appealing but adds real arc-geometry complexity (`<path d="A …">` radius/sweep math) for marginal pedagogical benefit over the rectangle-tiling diagram — treat it as a stretch enhancement, not the baseline diagram, when phase planning estimates scope.

**Site-wide palette unification (all 8 tools):**
- Consolidate every tool's local `:root { --bg: …; --accent: …; }` block into the shared `assets/site.css` tokens (already established by the v1.0 shared-nav work), then delete the per-tool duplicate blocks — a CSS-only change, no new technology.
- Optional enhancement (not required for functionality): register key animated tokens (e.g. an accent hue used in a transition) with `@property` in `assets/site.css` so theme-toggle transitions ease smoothly instead of snapping — safe to use today since `@property` is Baseline Widely Available (Chrome 85+, Safari 16.4+, Firefox 128+ as of 2024), and unsupported browsers simply fall back to the current snap-instead-of-ease behavior with zero breakage.

## Version Compatibility

| Feature | Minimum Browser Support | Notes |
|---------|--------------------------|-------|
| `document.createElementNS` (SVG creation) | All evergreen browsers, IE9+ | Already relied on by all 5 existing tools; no change. |
| `requestAnimationFrame` | All evergreen browsers, IE10+ | Already relied on by existing tools. |
| `stroke-dasharray`/`stroke-dashoffset` (CSS-driven) | All evergreen browsers | GPU-composited in most browsers; safe default for line-draw effects. |
| `SVGGeometryElement.getPointAtLength()`/`getTotalLength()` | All evergreen browsers, supported for over a decade | No feature-detection needed for this project's target audience (self-learners on modern browsers, per `.planning/codebase/STACK.md`'s stated requirement of "modern web browsers"). |
| CSS `@property` | Chrome 85+ (2020), Safari 16.4+ (Mar 2023), Firefox 128+ (Jul 2024) — Baseline Widely Available since Jul 2024 | Purely a progressive enhancement for smoother theme-toggle transitions; degrades gracefully (snap instead of ease) in older engines, so it is safe to adopt without a fallback branch. |
| `<use href="#id">` (SVG) | All evergreen browsers | Prefer the unprefixed `href` attribute over the legacy `xlink:href` (both still work, but `href` alone is sufficient for the target browser set). |

No compatibility conflicts exist between any of these features and the existing stack (BigInt, `localStorage`, `performance.now()`) documented in `.planning/codebase/STACK.md`.

## Sources

- WebSearch: "vanilla SVG animation techniques step-by-step algorithm visualization no framework requestAnimationFrame" — confirmed rAF as the standard loop primitive over setTimeout/setInterval for algorithm-step animation (confidence: MEDIUM, cross-checked across multiple independent 2025/2026 sources).
- WebSearch: "SVG path animation stroke-dashoffset Web Animations API browser support" — confirmed stroke-dasharray/dashoffset as the standard line-draw technique, CSS preferred over SMIL, GPU-composited (confidence: MEDIUM).
- WebSearch: "CSS @property animating custom properties browser support baseline" — confirmed Baseline Widely Available status and exact per-browser ship versions (confidence: MEDIUM, corroborated by web.dev and CSS-Tricks results).
- WebSearch: "Euclidean algorithm visualization rectangle subtraction spiral interactive diagram" — confirmed the rectangle/square-tiling geometric method as the standard pedagogical visualization for the Euclidean algorithm (confidence: MEDIUM; see stackedboxes.org and Wikipedia's Euclidean algorithm article for the geometric formulation).
- WebSearch: "continued fractions visualization staircase rectangle diagram interactive" — confirmed the same rectangle/square-jigsaw decomposition is the standard visualization for continued fractions, plus the "staircase diagram" (Riemenschneider point diagram) as an alternative representation (confidence: MEDIUM; see r-knott.surrey.ac.uk's continued fractions introduction).
- `SVGGeometryElement.getPointAtLength()`/`getTotalLength()` and `<use>`/`<defs>` recommendations are drawn from long-standing, stable SVG DOM specification behavior (confidence: HIGH — these are foundational, decade-plus-stable web-platform APIs, not subject to churn; not separately web-searched because the underlying spec has not materially changed).
- `.planning/codebase/STACK.md` — existing stack analysis (source of truth for what's already locked in; this document extends rather than repeats it).

---
*Stack research for: interactive browser-based number-theory math visualizations (Euclidean algorithm, CRT, continued fractions) for self-learners*
*Researched: 2026-09-23*
