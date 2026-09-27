# Phase 2: Euclidean Algorithm / GCD Tool - Research

**Researched:** 2026-09-27
**Domain:** Single-file vanilla-JS/SVG browser visualizer, extending an established 9-tool repo pattern
**Confidence:** HIGH (all findings grounded in direct inspection of this repo's own code — no external ecosystem research was needed or performed, per phase brief)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01 (geometric view large-quotient capping, GCD-05):** When a step's quotient would require more tiles than a readable cap (e.g. 40), draw the cap's worth of full-size squares, then collapse the remainder into one labeled tile reading `×N` (N = actual excess count) rather than switching to a different view or silently scaling everything down. Reversible — purely a rendering rule inside one render function. Every input cap must be surfaced to the user with a visible, specific message near where it kicks in (not a silent truncation).
- **D-02 (Extended Euclidean / Bézout mode presentation, GCD-06):** When the user toggles Extended Euclidean mode on, the existing numeric trace table gains two additional columns (`s`, `t`) computed via back-substitution as the animation plays forward — one unified table, not a second animation pass or a static end-only reveal. Costly to reverse — the trace-table schema and its animation/reveal logic would need to change shape to switch presentation later. Toggle stays off by default. On completion, show the final identity explicitly (e.g. `gcd(240,46) = 46·(-9) + 240·(2) = 2`) as a landing beat.
- **D-03 (numeric trace display style, GCD-02):** Each step appends a line to a growing equation chain in classic division-algorithm form (e.g. `240 = 5·46 + 10`), building downward as a readable derivation — not a compact `a|b|q|r` table. Reversible. Playback controls (play/pause/step/instant-finish) reuse the existing `requestAnimationFrame` + `generation`-counter pattern already established in the Sieve and Completing-the-Square tools — do not invent a new playback mechanism.
- **D-04 (preset examples, GCD-04):** Include at minimum: a coprime pair, a pair where one is a multiple of the other, an equal pair, and an edge case exercising the `gcd(a, 0)` / immediate-termination condition. Exact numeric values are Claude's/the planner's discretion.
- **D-05 (cross-link with Venn Diagrams, new decision):** Add a two-way cross-link: the GCD tool notes "see GCD via shared prime factors →" linking to Venn Diagrams, and Venn Diagrams gets a reciprocal "see GCD via the Euclidean algorithm →" link back. Reversible — additive nav/copy change on both pages. Phase 2's file scope therefore includes a small, additive edit to `Venn Diagrams/venn-diagrams.html`.
- **Input range (carried forward, not re-discussed):** Cap inputs to a friendly range (e.g. up to a few thousand) the same way the Sieve bounds its grid size — no `BigInt` needed, plain `Number` arithmetic is sufficient.

### Claude's Discretion

- Exact preset numeric pairs (beyond the four required categories in D-04).
- Exact visual/geometric styling of the rectangle-tiling view (colors resolve through `assets/palette.css` `var()` tokens; specific role mapping is an implementation call).
- Exact wording/placement of the cross-link note (D-05) and the cap-exceeded message (D-01).
- Whether to include the "try it yourself — predict the next remainder" stretch feature — default to NOT building it in the first pass unless trivial; do not let it block shipping.
- One short caption line on algorithm efficiency (e.g. "Fibonacci pairs take the most steps") is fine; a full complexity-theory section is an anti-feature — do not add one.

### Deferred Ideas (OUT OF SCOPE)

- "Try it yourself" predict-the-next-remainder interactive mode — optional, left to planner/executor discretion, not required.
- Full algorithmic-complexity / Lamé's theorem content — at most one short caption line.
- Group theory / Cayley table visualizers — out of scope for this entire milestone, unrelated to this phase.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| GCD-01 | User can input two integers (a, b) with validation | Reuse the Sieve/Completing-the-Square `input[type="number"]` + clamp-on-submit pattern (`Sieve Of Eratosthenes/sieve-of-eratosthenes.html:399,750-753`; `Factorize By Completing The Square/factorize-completing-square.html:289,794-800`). See Code Examples. |
| GCD-02 | Animated step-by-step `(a,b) → (b, a mod b)` trace with playback controls | Playback engine pattern verified verbatim from Sieve and Completing-the-Square (function names, shapes documented in Architecture Patterns / Code Examples below); display format is D-03's division-algorithm equation chain, not the events-array table those tools use. |
| GCD-03 | Final GCD clearly highlighted at the end of the trace | `--role-result` token (`assets/palette.css:53`) is the established "the computed answer" role across every existing tool — reuse for the final GCD line/landing beat, same as Sieve's prime cells and Completing-the-Square's success row. |
| GCD-04 | Preset example pairs (coprime, multiple-of, equal, `gcd(a,0)` edge case) | `EXAMPLES` array + chip-click pattern verified in Completing-the-Square (`factorize-completing-square.html:382-390,455-464`). |
| GCD-05 | Geometric rectangle-tiling view alongside the numeric trace | Tile-capping approach (D-01) sanity-checked against this repo's own established SVG-element-count ceiling (Square And Multiply's 64-bit/"more rows than a browser tab can render" cap, `Square And Multiply/square-and-multiply.html:412`). See Common Pitfalls / Code Examples for a concrete cap recommendation. |
| GCD-06 | Extended Euclidean / Bézout coefficients toggle | Standard iterative extended-Euclidean recurrence computes `s`,`t` in the *same* forward loop as `q`,`r` — satisfies D-02's "one unified table... as the animation plays forward" without a literal second reverse pass. See Code Examples. |
| NAV-02 | New tool follows established architecture (one dir, one file, inline style/script, `svgEl()` helper, no external JS dep beyond Google Fonts) | Verified: every one of the 9 existing tools follows this exactly; `svgEl(tag, attrs)` helper shape confirmed near-identical in 3 files (Completing-the-Square, Congruence Wheel, Venn Diagrams — see Code Examples). Nav/hub registration pattern verified from the two most recently added tools (Venn Diagrams, Diffie-Hellman) in `index.html`. |

</phase_requirements>

## Summary

This phase ships `Euclidean Algorithm/euclidean-algorithm.html`, the first of three new tools this milestone, and makes one small additive edit to `Venn Diagrams/venn-diagrams.html` for the D-05 cross-link. All required research (feature landscape, pitfalls, stack choice) was already done at milestone setup — this document goes one level deeper into *this repo's actual code* so the planner has copy-paste-grade implementation references rather than generic guidance.

Two distinct animation subsystems are needed, and this repo already has both, in different existing files:

1. **The numeric trace's playback controls** (play/pause/step/instant-finish) should copy the `playing` boolean + `rafId`/`cancelAnimationFrame` + per-speed events-per-frame pattern used identically in Sieve of Eratosthenes and Completing-the-Square — function names `play()`, `pause()`, `stepOnce()`, `instantFinish()`, `frameStep()`, and a `speedToPerFrame(v)` lookup table are duplicated near-verbatim across both files today. GCD-02's trace should follow this same shape, operating over a precomputed array of step objects, but rendered as D-03's growing division-algorithm equation chain rather than either tool's table/grid format.
2. **The geometric rectangle-tiling view's per-step reveal animation** needs the *other* pattern this repo already has: Completing-the-Square's `diagramGen` counter, which invalidates stale `requestAnimationFrame` callbacks when the user replays/resets mid-animation (`myGen !== diagramGen` guard inside the frame callback). This is the pattern CLAUDE.md's "generation-counter" language actually refers to — it lives in the *geometric diagram* code, not the trials/events playback loop, in the one existing tool that has a comparable optional geometric sub-animation.

For D-01's tile cap, this repo's own precedent (Square And Multiply's explicit 64-bit/65-row ceiling, justified in its own error message as "more rows than a browser tab can render") and Congruence Wheel's proven-fine ~600-800-element wheel at N=60/depth=10 together support keeping the suggested cap of ~40 tiles-per-step exactly as CONTEXT.md proposed — it is conservative relative to what this repo has already shipped and confirmed performant.

**Primary recommendation:** Build the numeric trace playback engine by copying Sieve/Completing-the-Square's `play/pause/stepOnce/instantFinish/frameStep` shape verbatim (renamed for GCD's own step data), build the geometric view using `svgEl()` + Completing-the-Square's `diagramGen`-guarded animation pattern, cap rendered tiles at 40 per step per D-01, compute Bézout `s`/`t` via the standard forward-iterating extended-Euclidean recurrence (no second pass needed), and register the new tool in `index.html` + all 10 existing pages' nav lists following the Venn Diagrams/Diffie-Hellman onboarding precedent.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Two-integer input + validation (GCD-01) | Browser / Client | — | Pure client-side form validation, no server exists in this project |
| Numeric trace computation (`(a,b)→(b,a mod b)`) | Browser / Client | — | Plain-`Number` arithmetic run synchronously in the page's own `<script>`, matches every existing tool's math-helpers-at-top-of-file pattern |
| Playback engine (play/pause/step/instant) | Browser / Client | — | `requestAnimationFrame` loop, no server/worker involvement, identical to Sieve/Completing-the-Square |
| Rectangle-tiling SVG rendering | Browser / Client | — | `document.createElementNS` via `svgEl()`, hand-drawn geometry, no charting library, matches repo-wide SVG convention |
| Extended Euclidean / Bézout computation | Browser / Client | — | Same synchronous arithmetic tier as the base trace; no separate service |
| Site chrome (nav, theme toggle, hub card) | Browser / Client | — | Static markup + `assets/site.css`/`assets/theme.js`, shared across all tools, no new tier introduced |

(This project has no Frontend-Server/SSR, API/Backend, CDN, or Database tier — every tool, including this one, is 100% Browser/Client. This map is included for planner sanity-checking completeness, not because any capability needs tier reassignment.)

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `document.createElementNS` (inline SVG) | DOM Level 3 Core / SVG 1.1+, native | Renders the rectangle-tiling geometric view | Every existing tool uses this; no charting/canvas library exists anywhere in the repo `[VERIFIED: repo-wide grep, 9/9 tool files use svgEl()]` |
| `requestAnimationFrame` + `cancelAnimationFrame` | Web API, native | Playback loop for the numeric trace | Verified identical pattern in Sieve and Completing-the-Square (see Code Examples) `[VERIFIED: Sieve Of Eratosthenes/sieve-of-eratosthenes.html:662-703; Factorize By Completing The Square/factorize-completing-square.html:503-533]` |
| CSS custom properties via `assets/palette.css` | CSS3, native | All tool colors, including any new role-color aliases this tool needs | Confirmed current token roster below `[VERIFIED: assets/palette.css:21-88]` |

### Supporting

None — no supporting library is needed. This phase introduces zero new technology; it is a geometry/interaction design exercise on top of primitives every other tool in the repo already exercises (per `.planning/research/STACK.md`, already-completed milestone research, not re-derived here).

### Alternatives Considered

Not re-researched — `.planning/research/STACK.md` already evaluated and rejected Canvas, D3/charting libraries, and animation libraries (GSAP etc.) for this exact tool category with an explicit "What NOT to Use" table. No new alternatives surfaced during this deeper code-level pass.

**Installation:**
```bash
# No package manager — this is a new self-contained HTML file, same as every
# other tool. No npm install step exists in this repo.
```

**Version verification:** N/A — no npm/pip/cargo packages are installed by this phase. All APIs used (`requestAnimationFrame`, `document.createElementNS`, CSS custom properties) are native, Baseline-stable browser platform features, already relied upon by all 9 existing tools with no compatibility issues reported.

## Package Legitimacy Audit

**Not applicable.** This phase installs zero external packages — no npm, pip, or cargo dependency is introduced. The tool is a single self-contained `.html` file using only native browser APIs and the existing `assets/palette.css`/`assets/site.css`/`assets/theme.js` (already-shipped, in-repo files, not external packages), per the repo-wide "zero-dependency beyond Google Fonts" constraint (`CLAUDE.md`, `.claude/CLAUDE.md`).

## Architecture Patterns

### System Architecture Diagram

```
User types a, b (or clicks a preset chip)
        │
        ▼
validate + clamp inputs (GCD-01)
        │
        ▼
buildSteps(a, b)  ──────────────────────────────►  steps[] = [{a,b,q,r}, ...]
        │                                                      │
        │  (if Extended Euclidean toggle is ON)                │
        ▼                                                      │
extendedGcdSteps(a, b) augments each step with {s, t}          │
        │                                                      │
        ▼                                                      ▼
resetPlaybackState()                          buildDiagram(steps[0])  (geometric view,
        │                                       current step only, svgEl()-drawn)
        ▼                                                      │
play() / stepOnce() / instantFinish()                          │
   │  (rAF loop, `playing` flag, per Sieve/Completing-Square)   │
   ▼                                                            │
frameStep() → applyStep(steps[idx])                             │
   │   - appends one division-algorithm line to the equation    │
   │     chain (D-03: "240 = 5·46 + 10")                        │
   │   - if Extended mode: also reveals that row's s, t columns │
   │   - triggers buildDiagram(steps[idx]) for the NEXT step ───┘
   │     (diagramGen-guarded rAF animation, per
   │      Completing-the-Square's animateRearrange pattern,
   │      caps rendered tiles at 40 per D-01)
   ▼
on last step (b === 0): highlight final GCD (--role-result),
   if Extended mode: print final Bézout identity line
```

### Recommended Project Structure

```
Euclidean Algorithm/
└── euclidean-algorithm.html      # single self-contained file
    <head>                        # identical <link> order to every existing tool:
                                   #   palette.css, site.css, theme.js, Google Fonts
    <style>                       # :root{} tool-local tokens only (no --bg/--text/--accent
                                   # redeclaration); layout + animation CSS
    <body>
      <header class="site-header">...</header>   # copied verbatim, is-active on new link
      <div class="wrap">  (or .app, matching whichever migrated tool is copied)
        page-header (title + lede + D-05 cross-link note)
        controls panel (a/b inputs, preset chips, Extended Euclidean toggle,
                         play/pause/step/instant + speed slider)
        equation-chain panel (D-03 growing division-algorithm derivation,
                               gains s/t columns when Extended mode is on)
        geometric panel (svg.diagram — rectangle-tiling view, current step)
        final-GCD landing beat (--role-result highlight; Bézout identity if Extended mode)
      </div>
      <script> (function(){ "use strict";
        // math helpers: gcdSteps(a,b), extendedGcdSteps(a,b)
        // svgEl(tag, attrs) helper
        // playback engine: play/pause/stepOnce/instantFinish/frameStep/speedToPerFrame
        // geometric diagram: buildDiagram(step), animateRearrange-style reveal w/ diagramGen guard
        // event wiring + window.addEventListener('load', ...) example run
      })(); </script>
```

### Pattern 1: Numeric-trace playback engine (copy verbatim, per D-03)

**What:** A `playing` boolean + module-scoped `rafId` + a precomputed array (`steps[]`) + an index cursor (`stepIndex`), driven by `requestAnimationFrame`. `pause()` calls `cancelAnimationFrame(rafId)`; restarting via `play()`/`stepOnce()`/`instantFinish()` is safe because the loop checks `playing` at the top of every frame and the array/index model has no stale-closure risk (unlike the geometric diagram's rAF-driven tweening, which does need a generation guard — see Pattern 2).

**When to use:** The GCD tool's numeric equation-chain reveal (GCD-02). This is the *outer* playback loop — one call per algorithm step, not per animation-frame-of-a-single-step's tween.

**Example (verified function shapes, Sieve of Eratosthenes):**
```javascript
// Source: Sieve Of Eratosthenes/sieve-of-eratosthenes.html:655-732 (verified read this session)
function speedToEventsPerFrame(v){
  const table = {1:1,2:2,3:4,4:8,5:16,6:35,7:75,8:160,9:400,10:100000};
  return table[v] || 1;
}
function frameStep(){
  if (!playing) return;
  const perFrame = speedToEventsPerFrame(parseInt(speedInput.value, 10));
  let processed = 0;
  while (processed < perFrame && stepIndex < events.length){
    applyEvent(events[stepIndex], true);
    stepIndex++;
    processed++;
    if (events[stepIndex - 1].type === 'done') break;
  }
  if (stepIndex >= events.length){ pause(); return; }
  rafId = requestAnimationFrame(frameStep);
}
function play(){
  if (playing || !events.length || stepIndex >= events.length) return;
  playing = true;
  playBtn.textContent = '⏸ Pause';
  stepBtn.disabled = true;
  rafId = requestAnimationFrame(frameStep);
}
function pause(){
  playing = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;
  playBtn.textContent = '▶ Play';
  stepBtn.disabled = stepIndex >= events.length;
}
```
The identical shape (`SPEED_LABELS` object, `speedToPerFrame` table, `play/pause/stepOnce/instantFinish/frameStep`) appears in Completing-the-Square at `factorize-completing-square.html:377,491-549`, confirming this is a stable, repeated house pattern, not a one-off. For GCD, replace `events`/`applyEvent` with `steps`/`applyStep`, where `applyStep` appends one division-algorithm line (and, in Extended mode, that step's `s`/`t`) instead of mutating a grid cell.

### Pattern 2: Geometric diagram's stale-animation guard (the actual "generation counter", per D-03/CLAUDE.md)

**What:** A module-scoped integer (`diagramGen` in the source tool) incremented every time the diagram is cleared/rebuilt; each `requestAnimationFrame` tween closure captures the generation value active *when it started* (`myGen`) and checks `myGen !== diagramGen` on every frame, silently no-op'ing if the diagram has since moved on. This is what protects against "user clicks Step again while the previous step's square-placement animation is still tweening."

**When to use:** GCD-05's rectangle-tiling view specifically — every time `buildDiagram(step)` is called for a new step (via `frameStep`'s per-step callback, or a manual Step click, or Instant-finish), the previous step's in-flight tween must be invalidated, exactly as Completing-the-Square must invalidate an in-flight square-slide when the user clicks a new factor chip mid-animation.

**Example (verified, Completing-the-Square):**
```javascript
// Source: Factorize By Completing The Square/factorize-completing-square.html:560-570,585-588,660-702 (verified read this session)
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs){
  const el = document.createElementNS(SVG_NS, tag);
  for (const key in attrs) el.setAttribute(key, attrs[key]);
  return el;
}
let animFrame = null;
let diagramGen = 0;

function clearDiagram(){
  diagramGen++;                 // invalidate any in-flight animation
  diagramSvg.innerHTML = '';
  if (animFrame) cancelAnimationFrame(animFrame);
  animFrame = null;
}
function buildDiagram(a, b){
  clearDiagram();
  const myGen = diagramGen;     // snapshot the generation this build belongs to
  // ... draw geometry ...
  animateRearrange(a, b, /*...*/, myGen);
}
function animateRearrange(a, b, /*...*/, myGen){
  if (myGen !== diagramGen) return;      // stale call from a superseded build — bail
  function frame(now){
    if (myGen !== diagramGen) { animFrame = null; return; }  // bail mid-tween too
    // ... interpolate + requestAnimationFrame(frame) ...
  }
  animFrame = requestAnimationFrame(frame);
}
```
For GCD's rectangle-tiling view, mirror this exactly: `buildDiagram(step)` clears + snapshots `diagramGen`, draws up to 40 unit squares (D-01) via `svgEl('rect', {...})` (optionally staggered in with a short CSS transition, matching the repo's "reveal with staggered timing" convention), and the reveal's per-frame callback checks `myGen !== diagramGen` before continuing.

### Pattern 3: Extended Euclidean coefficients computed in the *same* forward pass (satisfies D-02 without a second animation pass)

**What:** The standard iterative extended-Euclidean recurrence computes `s`/`t` alongside `q`/`r` in one forward loop — it does **not** require literally reversing through the steps after the fact, even though the technique is traditionally taught as "back-substitution." Seed `s_{-1}=1, s_0=0, t_{-1}=0, t_0=1`; at each step `i`, `s_i = s_{i-2} - q_i·s_{i-1}` and `t_i = t_{i-2} - q_i·t_{i-1}`.

**When to use:** GCD-06's Extended Euclidean toggle. Precompute the full `steps[]` array (with `s`/`t` already attached) once, before playback starts — D-02 requires the columns to *appear* as the animation plays forward, which this satisfies naturally since the data is already there; only the reveal (via the existing `applyStep`/`frameStep` cadence) needs to be forward-sequenced, not the computation.

**Example (new code, not yet in the repo — follows the math-helpers-at-top-of-file convention seen in every existing tool, e.g. `bigGcd`/`modPowPlain` in RSA):**
```javascript
function extendedGcdSteps(a, b){
  const steps = [];
  let a0 = a, b0 = b;
  let s0 = 1, s1 = 0, t0 = 0, t1 = 1;   // s_{-1},s_0 and t_{-1},t_0
  while (b0 !== 0){
    const q = Math.floor(a0 / b0);
    const r = a0 - q * b0;
    const s2 = s0 - q * s1;
    const t2 = t0 - q * t1;
    steps.push({ a: a0, b: b0, q: q, r: r, s: s1, t: t1 }); // s1/t1 = coeffs for THIS a0,b0 pair
    a0 = b0; b0 = r;
    s0 = s1; s1 = s2;
    t0 = t1; t1 = t2;
  }
  return { steps: steps, gcd: a0, s: s0, t: t0 };  // final identity: gcd = s*a + t*b
}
```
This produces exactly the identity CONTEXT.md's D-02 example shows (`gcd(240,46) = 46·(-9) + 240·(2) = 2` style — note argument order/sign convention should be sanity-checked against the actual example during planning, since `s0`/`t0` pair with the *original* `a`/`b`, not the last step's `a0`/`b0`).

### Anti-Patterns to Avoid

- **Rendering all previous steps' geometric tiles simultaneously:** Only the *current* step's rectangle needs on-screen tiles (per D-01's "a step's quotient"); keep the geometric view single-step, not cumulative, or the 40-tile-per-step cap stops bounding total DOM size.
- **Literal two-pass back-substitution animation:** Do not compute the base trace first, finish playback, then run a second pass revealing `s`/`t` after the fact — D-02 explicitly forbids this ("not a second animation pass"). Use Pattern 3 instead.
- **Hardcoding a new hex color for tile/badge/actor roles:** Every color must resolve through `var()` against `assets/palette.css`'s existing tokens or a tool-local alias derived from them (`color-mix()` or direct `var()` reference), per `CLAUDE.md` and the precedent in Pattern 4 below.

### Pattern 4: Tool-local semantic color aliasing (precedent from Congruence Wheel, for GCD's "current a/current b/remainder/capped-tile" needs)

**What:** A small `:root{}` block in the tool's own `<style>` that aliases the shared `--role-*` tokens under tool-specific names, plus `color-mix()`-derived `-soft` variants for tinted fills — never a fresh hardcoded hex value.

**Verified example, Congruence Wheel's additive-group slot colors:**
```css
/* Source: Congruence Wheel/congruence-wheel.html:15-27 (verified read this session) */
:root{
  /* Group-operation slot colors, aliased from the shared semantic roles:
     --slot-a is the first addend a learner clicks (yellow / --role-active),
     --slot-b is the second addend (blue / --role-input), and --slot-sum is
     the resulting class (a+b) mod N (green / --role-result). The *-soft
     variants tint a marked wedge's fill without a literal color. */
  --slot-a: var(--role-active);
  --slot-b: var(--role-input);
  --slot-sum: var(--role-result);
  --slot-a-soft: color-mix(in srgb, var(--slot-a) 22%, transparent);
  --slot-b-soft: color-mix(in srgb, var(--slot-b) 22%, transparent);
  --slot-sum-soft: color-mix(in srgb, var(--slot-sum) 22%, transparent);
}
```
**Recommended GCD role mapping** (against the confirmed current `--role-*` roster — see next section): `--slot-a`/`--current-a` → `var(--role-input)` (a value the user typed in, matching Congruence Wheel's own `[r] = ... Congruence Wheel selected class` comment at `assets/palette.css:54`), `--slot-b`/`--current-b` → `var(--role-active)` (the current step, matching Sieve's "current multiple" usage of the same token), `--remainder`/result-in-progress → `var(--role-alt)` or a `color-mix()` tint of `--role-input` (a genuinely new hue is not warranted — the base roster already covers "input," "active step," and "result"), the capped-tile `×N` badge → `var(--role-warn)` (matches the established "this is a guard/limit kicking in" meaning already used for Sieve's/Completing-the-Square's validation-error and RSA's failure-verdict text at `assets/palette.css:46`), the final GCD/Bézout identity landing beat → `var(--role-result)` (matches every existing tool's "the computed answer" convention, `assets/palette.css:53`).

**Confirmed current `--role-*` roster (verbatim, do not invent a new base hue without strong justification):**
```css
/* Source: assets/palette.css:42-61 (verified read this session) */
--role-active: #ffcf5c;       /* the current step: Sieve's current multiple, tree's fairy-light accent */
--role-inert: #3a4160;        /* eliminated / inert: Sieve composites, tree terminal `1` nodes and trunk */
--role-inert-text: #5b6382;   /* label text drawn on top of a --role-inert fill */
--role-warn: #ff6b81;         /* error / adversary: Sieve validation error, tree error message, completing-the-square failure, RSA Eve and failure verdict */
--role-special: #c792ea;      /* advanced or optional concept: Sieve secondary accent, completing-the-square advanced step, RSA discrete-log aside */
--role-alt: #ff7ac6;          /* a second participant / edge case: Sieve `1` cell, RSA Alice */
--role-result: var(--accent-2); /* the computed answer */
--role-input: var(--accent);    /* a user input / value being operated on */
```
Note `--role-special` (`#c792ea`) is the established "advanced/optional concept" token — a strong candidate for styling the Extended Euclidean mode's `s`/`t` columns themselves (visually marking them as the "advanced" addition to the base table), distinct from the `--role-result` final-answer highlight.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Playback scheduling (play/pause/step/instant, speed control) | A new timer/animation-scheduling abstraction | Copy Sieve/Completing-the-Square's `play/pause/stepOnce/instantFinish/frameStep` shape verbatim | Already proven, already the CLAUDE.md-mandated house pattern; inventing a second mechanism is an explicit anti-pattern per D-03 |
| SVG element construction | A wrapper library or hand-repeated `document.createElementNS` calls with no helper | The repo's own `svgEl(tag, attrs)` one-liner, copied into this file per the intentional per-file duplication convention | Verified near-identical in 3 files already (`factorize-completing-square.html:561-565`, `congruence-wheel.html:497-501`, `venn-diagrams.html:664-668`) |
| Color values for new tool-local roles | Hardcoded hex/`rgb()` | `var(--role-*)` aliases per Pattern 4 | `CLAUDE.md` forbids literal colors in any tool `<style>` block; Congruence Wheel's `--slot-*` pattern is the exact precedent to imitate |

**Key insight:** This phase requires zero new *infrastructure* — every mechanism it needs (playback loop, stale-animation guard, SVG helper, color aliasing) already exists in the repo in a working, battle-tested form. The actual engineering work is entirely in the GCD-specific math (`gcdSteps`, `extendedGcdSteps`) and geometry (rectangle-tiling layout + tile-cap rule), not in re-deriving patterns this repo has already settled.

## Common Pitfalls

### Pitfall 1: Quotient-scaled tile count (already documented as PITFALLS.md Pitfall 5 — reconfirmed against this repo's actual SVG-element ceiling)

**What goes wrong:** A naive "one visual square per unit of quotient" rectangle-tiling renderer will, for an input like `gcd(2, 500000)`, attempt to draw ~250,000 SVG rects in a single step and freeze the tab.

**Why it happens:** The geometric metaphor's natural node count is the *quotient* `⌊a/b⌋`, which is unbounded independent of step count — unlike this repo's other tools, where node count is bounded by `log(n)` (Factor Tree) or a fixed grid size chosen by the user upfront (Sieve).

**How to avoid — concretely calibrated against this repo's own precedent (new finding, not in the original PITFALLS.md):** Square And Multiply already drew a hard line on exactly this class of problem — its bit-ladder diagram (one animated SVG row per exponent bit) is explicitly capped at 64 bits, with the tool's own error message stating the reasoning: `[VERIFIED: Square And Multiply/square-and-multiply.html:412]` `if (exp >= (1n << 64n)){ errorBox.textContent = 'Exponent must be below 2^64 (65 bits) — the ladder would need more rows than a browser tab can render.'; return null; }`. That is a *cumulative, simultaneously-visible* cap of 64 rows (each row carrying several SVG elements — lines, text, group). By contrast, Congruence Wheel renders up to `N=60 × depth=10` ≈ 600–800 simultaneously-visible SVG elements (wedges, hit-paths, ring circles, radial lines, per-cell text) with no reported performance issue — that tool's own `<input>` bounds (`n-range max="60"`, `depth-range max="10"`) are hardcoded in its markup `[VERIFIED: Congruence Wheel/congruence-wheel.html:362,369]`. Since GCD-05's geometric view only ever needs to show the *current* step's tiles (not all steps at once, per D-01's per-step framing), a cap of **40 tiles per step** (D-01's own suggested number) sits comfortably below both of these already-shipped, already-working ceilings — recommend keeping 40 as the concrete cap rather than raising it.

**Warning signs:** Tab freeze/stutter on `gcd(2, 500000)` or similar large-first-quotient inputs — this is the exact acceptance check PITFALLS.md and CONTEXT.md both specify testing before considering the tool done.

### Pitfall 2: Dropping the visible cap-exceeded message (cross-cutting guidance, reconfirmed)

**What goes wrong:** A silent truncation (drawing 40 tiles and just... stopping) reads as a bug, not a deliberate design choice, to a self-learner.

**How to avoid:** D-01 already mandates a visible `×N` collapsed badge — implement it as a real, styled SVG group (rect + text) using `--role-warn` (the established "guard/limit kicked in" token, see Pattern 4), not a console-only or `title`-only annotation. Match the existing convention of range-checked inputs surfacing their cap in the UI (`.banner`/`.trail`/`.message`-style status area), not just disabling a button silently.

### Pitfall 3: XSS-safe interpolation for the equation-chain lines (cross-cutting, reconfirmed against actual current usage)

**What goes wrong:** D-03's growing equation chain (`240 = 5·46 + 10`) will most naturally be built via `innerHTML` + template literals, matching every existing tool's `.trail`/`.banner`/`resultEl.innerHTML` pattern. This is safe **only** as long as every interpolated value is numeric/computed.

**How to avoid:** Every value placed into an equation-chain line (`a`, `b`, `q`, `r`, `s`, `t`) is a computed integer, never raw user-typed text — safe to interpolate via `innerHTML`/template literal, matching the existing convention `[VERIFIED: repo-wide convention, already followed by every existing `.trail`/`.banner`/`resultEl` usage across Completing-the-Square, Sieve, RSA]`. Do not echo the raw `<input>` string value directly into any `innerHTML` call if an invalid-input error message needs to quote back what the user typed — use `textContent` for that one case, per the repo's documented XSS-mistake guardrail (`.planning/research/PITFALLS.md`, Security Mistakes section).

### Pitfall 4: Forgetting the `gcd(a, 0)` / equal-pair edge cases break the "growing chain" UI, not just the math

**What goes wrong:** D-04 requires an immediate-termination preset (`gcd(a, 0)`). If the numeric trace's playback engine assumes at least one step exists (e.g. `play()` guard `if (!events.length ...)` pattern from Sieve, line 681), a zero-step case needs its own explicit "already done" UI path — the equation chain has nothing to grow, and the final-GCD landing beat must still render immediately.

**How to avoid:** Treat `steps.length === 0` (b starts at 0) as a valid, explicitly-handled terminal state in the same code path that normally waits for `instantFinish()`/last-step completion — verify this specific preset renders the landing beat correctly on load, not just that it "doesn't crash."

## Code Examples

### Base Euclidean step generator (new, follows `primeFactors`/`isPrime`-style math-helper convention)

```javascript
// Pattern matches e.g. primeFactors()/isPrime() placement at top of <script>
// in every existing tool (Venn Diagrams: venn-diagrams.html:436-481).
function gcdSteps(a, b){
  const steps = [];
  let a0 = a, b0 = b;
  while (b0 !== 0){
    const q = Math.floor(a0 / b0);
    const r = a0 - q * b0;
    steps.push({ a: a0, b: b0, q: q, r: r });
    a0 = b0; b0 = r;
  }
  return { steps: steps, gcd: a0 };
}
```

### `svgEl` helper (confirm this exact shape before writing the geometric view)

```javascript
// Source: Factorize By Completing The Square/factorize-completing-square.html:560-565
// (const-based; Congruence Wheel and Venn Diagrams use an equivalent var-based
// version — congruence-wheel.html:497-501, venn-diagrams.html:664-668 — all three
// are functionally identical: create via createElementNS, set every attr in a loop)
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs){
  const el = document.createElementNS(SVG_NS, tag);
  for (const key in attrs) el.setAttribute(key, attrs[key]);
  return el;
}
```

### Preset chip pattern (for GCD-04)

```javascript
// Source: Factorize By Completing The Square/factorize-completing-square.html:382-390,455-464
const EXAMPLES = [
  {a: /* coprime pair */ 0, b: 0, note: 'coprime — gcd is 1'},
  {a: /* multiple pair */ 0, b: 0, note: 'b divides a exactly'},
  {a: /* equal pair */ 0, b: 0, note: 'equal inputs — immediate gcd'},
  {a: /* edge case */ 0, b: 0, note: 'b = 0 — immediate termination'}
];
function buildChips(){
  chips.innerHTML = '';
  EXAMPLES.forEach(ex => {
    const c = document.createElement('span');
    c.className = 'chip';
    c.textContent = `${ex.a}, ${ex.b} — ${ex.note}`;
    c.addEventListener('click', () => { aInput.value = ex.a; bInput.value = ex.b; startTrace(); });
    chips.appendChild(c);
  });
}
```

## State of the Art

Not applicable in the usual sense — this phase does not adopt or replace any external library version. The one relevant "state of the art" finding is internal: this repo's own conventions have matured across 9 prior tools (e.g. the `--role-*` semantic layer in `palette.css` post-dates and supersedes each tool's originally bespoke `:root` palette, per Phase 1/Palette Unification). The GCD tool should be authored directly against the *current, already-unified* `palette.css` — there is no legacy pattern to migrate away from for a brand-new file.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The exact sign/argument convention for the final Bézout identity display (`gcd(240,46) = 46·(-9) + 240·(2) = 2`, note `46` and `240` in *reversed* order from typical `s*a+t*b`) should be sanity-checked against CONTEXT.md's own example during planning, since the `extendedGcdSteps` helper above naturally pairs `s0`/`t0` with the original `a`/`b` in that order, not reversed. | Code Examples / Pattern 3 | Low — a display-order mismatch is a one-line fix, not a data-model change, but could confuse learners if shipped backwards from the example CONTEXT.md itself specified |
| A2 | Recommended cap of 40 tiles-per-step is carried forward from CONTEXT.md's own suggested number, cross-checked only against two *other* tools' element counts (Square And Multiply's 64-row ceiling, Congruence Wheel's ~600-800-element wheel) — no direct browser profiling of a 40-tile SVG rectangle-tiling diagram was performed this session. | Common Pitfalls / Pitfall 1 | Low — 40 is well below both reference ceilings, so this is a conservative, not aggressive, recommendation; if execution reveals it's too low or too high, it's a single-constant tuning change |
| A3 | Exact friendly input-range cap for `a`/`b` (CONTEXT.md says only "e.g. up to a few thousand" without a specific number) — no specific `max` attribute value was locked by research; the acceptance-check input `gcd(2, 500000)` from PITFALLS.md implies the range must comfortably include 500000, so a cap somewhere around 1,000,000 (order of magnitude below Completing-the-Square's 2,000,000 search-space cap) is a reasonable planner default, but this exact number was not independently re-verified against a performance profile. | User Constraints / Standard Stack | Low — this governs an `<input max="...">` attribute only; the tile-cap mechanism (D-01) is the actual safety net regardless of what the input max is set to |

**If this table is empty:** N/A — see entries above.

## Open Questions

1. **Exact rectangle-tiling recursion direction (does the "leftover" rectangle recurse visually inward, or does each step draw a fresh, independent rectangle?)**
   - What we know: `.planning/research/STACK.md`'s "Stack Patterns by Variant" section describes the classic approach (inscribe squares along the longer side, recurse into the leftover rectangle) at a conceptual level; Completing-the-Square's `buildDiagram`/`animateRearrange` shows a working precedent for "compute geometry from container width, animate a piece sliding/rearranging" but for a *different* geometric operation (rearranging a difference-of-squares, not recursive square-tiling).
   - What's unclear: Whether the planner should design a single persistent SVG canvas where each step's rectangle visually shrinks in place (continuous, all steps overlaid/replaced smoothly) versus a fresh redraw per step (simpler, matches the "one step at a time" playback cadence more directly).
   - Recommendation: Default to fresh-redraw-per-step (simpler, matches D-01's explicit "a step's quotient" framing and this repo's existing `clearDiagram()`+`buildDiagram()` per-call pattern) unless the planner has strong reason to build continuous recursion; this is a scoping call, not a blocking unknown.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None — this repo has no automated test runner, linter config, or CI, by design (`CLAUDE.md`: "There is no build/lint/test command"). Verified: no `package.json`, `pytest.ini`, `jest.config.*`, or `test/`/`tests/` directory exists anywhere in the repo. |
| Config file | none — see Wave 0 |
| Quick run command | Manual: open the file directly in a browser (`file://.../Euclidean Algorithm/euclidean-algorithm.html`) and exercise controls — matches the verification method documented for every prior phase in this repo (`CLAUDE.md`: "verify changes by opening the modified `.html` file directly in a browser ... and exercising the controls") |
| Full suite command | Manual: click through to every *other* tool page afterward and confirm the shared header/nav still renders identically (catches nav-registration drift), per the existing "Looks Done But Isn't" checklist precedent in `.planning/research/PITFALLS.md` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Manual Verification Steps | File Exists? |
|--------|----------|-----------|---------------------------|-------------|
| GCD-01 | Two-integer input with validation | manual | Enter non-numeric/negative/zero-`b`-only values; confirm clamp/error messaging, not silent failure or NaN propagation | ❌ new file |
| GCD-02 | Animated step trace with playback controls | manual | Press Play, Pause, Step, Instant-Finish on a multi-step pair (e.g. `gcd(240,46)`); confirm each control behaves per the Sieve/Completing-the-Square reference behavior | ❌ new file |
| GCD-03 | Final GCD highlighted | manual | Run any preset to completion; confirm the final GCD renders visually distinct (`--role-result`) | ❌ new file |
| GCD-04 | Preset chips (4 categories incl. edge case) | manual | Click each of the 4 required presets; confirm `gcd(a,0)` renders the immediate-termination UI correctly (Pitfall 4) | ❌ new file |
| GCD-05 | Geometric rectangle-tiling view, tile-capped | manual | Run `gcd(2, 500000)` (PITFALLS.md's own specified acceptance input); confirm no freeze/stutter and the `×N` capped-tile badge renders with a visible message | ❌ new file |
| GCD-06 | Extended Euclidean / Bézout toggle | manual | Toggle on for `gcd(240,46)`-style input; confirm `s`,`t` columns populate in the same table as the animation plays, and the final identity line matches `gcd = s·a + t·b` | ❌ new file |
| NAV-02 | Architecture-pattern compliance | manual | Diff the `.site-nav` block across all 10 existing tool files + `index.html` + the new file; confirm all 11 entries present with correct `is-active` class on each page (per PITFALLS.md's documented "Nav list drift" gotcha) | N/A — cross-file check |

### Sampling Rate

- **Per task commit:** Open the tool in a browser, exercise the specific control(s) just added.
- **Per wave merge:** Full manual click-through of every page's nav (per NAV-02 check above), both day and night themes.
- **Phase gate:** All 7 rows above manually verified green before `/gsd-verify-work`.

### Wave 0 Gaps

- No automated test framework exists to install — this repo's established convention (0 of 9 existing tools have automated tests) means "Wave 0" for this phase is establishing the manual verification checklist above, not scaffolding a test runner. Introducing a test framework for one new file, when none of the other 9 tools have one, would be a scope-creep architectural change outside this phase's boundary.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No accounts/auth exist anywhere in this project |
| V3 Session Management | No | No sessions/cookies beyond the existing theme-preference `localStorage` mechanism (unaffected by this phase) |
| V4 Access Control | No | No access-controlled resources |
| V5 Input Validation | Yes | Numeric `<input>` bounds-checking + `parseInt`/`Number.isFinite` guard, matching the existing `clamp(v, lo, hi)` convention used in Sieve (`sizeInput` clamp, line 751-753) and Completing-the-Square (`nInput` clamp, line 794-800) |
| V6 Cryptography | No | This tool performs no cryptographic operations (unlike RSA/Diffie-Hellman); plain integer GCD arithmetic only |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Reflected/DOM-based XSS via `innerHTML` echoing raw user input | Tampering | Interpolate only numeric/computed values via `innerHTML` (matches repo-wide convention, see Pitfall 3 above); use `textContent` for any error message that must quote the raw typed string back |
| Client-side resource-exhaustion (uncontrolled tile rendering) | Denial of Service (client-local, single-tab) | D-01's 40-tile-per-step cap + visible cap-exceeded message (see Common Pitfalls Pitfall 1) — this is this phase's actual highest-severity "security-shaped" concern, framed as a performance pitfall in `.planning/research/PITFALLS.md` but functionally a client-side DoS guard |

## Sources

### Primary (HIGH confidence — direct inspection this session)

- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` — playback engine (`play/pause/stepOnce/instantFinish/frameStep`, `SPEED_LABELS`, input clamp), read in full this session
- `Factorize By Completing The Square/factorize-completing-square.html` — playback engine (identical shape), `svgEl()` helper, `diagramGen` stale-animation-guard pattern, preset-chip pattern, `MAX_ITER`/`MAX_N` caps, read in full this session
- `Congruence Wheel/congruence-wheel.html` — `--slot-*` role-color-aliasing precedent, `gcd()` helper, reference-list UI, `n-range`/`depth-range` max attributes, read in full this session
- `Venn Diagrams/venn-diagrams.html` — `gcd()` helper, `intersectionLine()`/center-row GCD framing, page-header lede structure (D-05 insertion point), read in full this session
- `assets/palette.css` — full `--role-*` token roster and comments, read in full this session
- `index.html` — hub card registration pattern (Venn Diagrams, Diffie-Hellman cards), nav list, read in full this session
- `Square And Multiply/square-and-multiply.html` — 64-bit/"more rows than a browser tab can render" cap, grepped and read this session as the SVG-element-ceiling sanity check requested by the phase brief
- `Factor Tree/factor-tree.html` — number-input max attribute, grepped this session (naturally log-bounded node count, contrasted against GCD's quotient-bounded risk)
- `.planning/config.json` — `workflow.nyquist_validation: true`, `workflow.security_enforcement: true`, `workflow.security_asvs_level: 1`, read this session to determine which optional RESEARCH.md sections are required

### Secondary (MEDIUM confidence — already-completed milestone research, not re-verified this session)

- `.planning/research/FEATURES.md` Topic 1 — table stakes/differentiators/anti-features for the Euclidean Algorithm/GCD tool category
- `.planning/research/PITFALLS.md` Pitfall 5 — quotient-scaled tile rendering blowup, cross-cutting input-cap-visibility guidance
- `.planning/research/ARCHITECTURE.md`, `.planning/research/STACK.md` — general single-file/no-build-step project constraints, already-decided technology choices (SVG over Canvas, no animation library, etc.)

### Tertiary (LOW confidence)

None — this research relied entirely on direct codebase inspection and already-completed milestone research; no new WebSearch-only claims were introduced.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new technology, every API already exercised repo-wide
- Architecture: HIGH — both required animation patterns (outer playback loop, inner stale-animation guard) verified with exact line citations from working code
- Pitfalls: HIGH for the tile-cap sanity-check (cross-referenced against two other tools' actual, shipped element counts); MEDIUM for the exact numeric cap recommendation itself (40 is carried forward from CONTEXT.md, not independently re-derived from a fresh performance benchmark — see Assumption A2)

**Research date:** 2026-09-27
**Valid until:** No expiry driver — this research is grounded entirely in this repo's own static code, which only changes when someone edits it; safe to treat as current until the referenced files are next modified.
