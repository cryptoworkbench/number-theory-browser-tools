# Phase 5: Cayley Table Generator - Research

**Researched:** 2026-09-27
**Domain:** Client-side vanilla-JS/HTML/CSS interactive math visualizer (no framework, no build step) — group operation table for ℤ/Nℤ under addition and (ℤ/Nℤ)ˣ under multiplication
**Confidence:** HIGH

## Summary

This phase ships one new self-contained tool that is a close structural sibling of `Congruence Wheel/congruence-wheel.html`, reusing that tool's exact `MODES` config shape, `unitsMod(N)`/`gcd(a,b)` helpers, mode-tab ARIA pattern, and `--slot-*`-over-`--role-*` palette-alias convention — all duplicated into the new file per this repo's explicit no-shared-module convention (`CLAUDE.md`). The one genuinely new design problem is the table itself: an HTML `<table>` (not SVG, not a CSS-grid `<div>` matrix) is the right primitive, because it gets semantic row/column headers, native `scope="row"`/`scope="col"` accessibility, trivial row highlighting via the `<tr>` element, and `position:sticky` headers for free — none of which a hand-built SVG or CSS-grid matrix gives you without re-deriving what `<table>` already does. The Sieve of Eratosthenes tool is this repo's only existing precedent for a size-driven, scrolling, shrinking grid of numbered cells (`Sieve Of Eratosthenes/sieve-of-eratosthenes.html`'s `cellMinPx(size)` breakpoint function + `--cell-min` custom property + `.grid-container{ max-height:62vh; overflow:auto; }`), and it is the direct template for D-02's scroll/shrink strategy, adapted from a 1-D auto-filling grid to an explicit N+1-column table.

The four simultaneous highlight states required by D-03 through D-06 (click-selected cell + row/col, identity row/col, diagonal-symmetry mirror pair, self-inverse cells) can be kept legible together by mapping three of them onto the Congruence Wheel's own `is-a`/`is-b`/`is-sum` role triad (row header = a = `--role-active`, column header = b = `--role-input`, selected cell = sum = `--role-result` — the row/col-pair-produces-a-cell structure is a near-exact match for the wheel's two-operand model) and giving the remaining two states — identity and self-inverse — different *visual channels* (a static background wash vs. a static ring/border) rather than competing hues, plus a dashed-outline echo for the diagonal-mirror cell (echoing the wheel's own `is-multi` combinator device for "this element also carries a second role").

**Primary recommendation:** Build the table as a semantic `<table>` (row/col `<th>` headers with `scope`, `<caption>`), duplicate the Congruence Wheel's `MODES`/`unitsMod`/`gcd`/mode-tab code verbatim into the new file, adapt the Sieve's `cellMinPx`-style breakpoint function for the table's cell sizing, and encode the four highlight states as CSS classes combining role-derived `--slot-*` aliases for the click-select triad with two new locally-declared `--slot-*` aliases (`--slot-identity: var(--role-special)`, `--slot-inverse: var(--role-alt)`) for D-04/D-06, plus a dashed-outline-only (no new fill) treatment for D-05's diagonal mirror.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Modulus (N) input, validation, clamping | Browser/Client | — | Single-file static page; all logic runs in the browser, matching every existing tool (`Congruence Wheel`'s `nRange` input handler) |
| Additive/Multiplicative mode toggle | Browser/Client | — | `MODES` config object + mode-tab click/keydown handlers, duplicated from Congruence Wheel |
| Element list + operation computation (`elements(N)`, `op(a,b,N)`, `identity(N)`) | Browser/Client | — | Pure JS functions, no network/server involved |
| Table rendering (rows/cols/headers) | Browser/Client | — | DOM/`<table>` construction in a `render()` function, same pattern as every other tool's `render()`/`buildGrid()` |
| Click-cell → equation + highlight interaction | Browser/Client | — | Event listeners + class toggling, same as Congruence Wheel's `select(idx)` |
| Scroll/shrink layout at large N | Browser/Client | — | Pure CSS (custom property + `overflow:auto`), same as the Sieve's `cellMinPx`/`--cell-min` mechanism |
| Cross-link to Congruence Wheel | Browser/Client | — | Static `<a href>` with `.xref` styling, same as the Euclidean Algorithm ↔ Venn Diagrams cross-link |
| Nav header / hub registration | Browser/Client | — | Static markup duplicated across `index.html` and all tool pages, no server-side templating exists in this repo |

This repo has no server, API, or database tier — every capability in this phase is Browser/Client. There is nothing to misassign across tiers; the map is included for completeness per the research protocol.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CAYLEY-01 | User can set a modulus N via a validated input to generate the group's operation table | Congruence Wheel's `nRange` input handler + `clamp()` pattern (see Code Examples); D-02 requires a plain `<input type="number">` instead of the wheel's `max="60"` range slider, with its own validation ceiling |
| CAYLEY-02 | Toggle Additive/Multiplicative modes, echoing Congruence Wheel's mode-toggle pattern | Congruence Wheel's `MODES` object (`elements`, `op`, `identity`, wording) — duplicate verbatim, see Code Examples |
| CAYLEY-03 | Click any cell to see the underlying equation with row/col headers highlighted | Congruence Wheel's `updateCaption()` equation-string construction + `select(idx)`/`rolesFor(idx)` — adapt from single-operand-list selection to (row, col) pair selection |
| CAYLEY-04 | Identity element's row/col visually distinguished | `MODES[mode].identity(N)` already exists in the wheel; apply a static `--slot-identity` background wash to that row's/col's `<th>` (and optionally its cells) |
| CAYLEY-05 | Table visually demonstrates diagonal symmetry (commutativity) as a teaching point | New pattern (no direct repo precedent) — recommended: dashed-outline mirror-cell echo on hover/select, described under Architecture Patterns |
| CAYLEY-06 | Self-inverse diagonal cells visually highlighted | New pattern — `op(x,x,N) === identity(N)` check per diagonal cell, static `--slot-inverse` ring/border treatment |
| CAYLEY-07 | Two-way cross-link between Cayley Table Generator and Congruence Wheel | Exact `.xref` pattern from Euclidean Algorithm ↔ Venn Diagrams cross-link (see Code Examples) |
| NAV-03 | `index.html` hub and every page's nav header list all eleven tools, current tool marked active | `index.html`'s `.card-grid` + every page's `<nav class="site-nav">` — both need one new entry added on every one of the (soon) eleven pages |
</phase_requirements>

## Standard Stack

### Core
No external libraries. This repo's convention (`CLAUDE.md`, `.claude/CLAUDE.md`) is vanilla HTML5/CSS3/ES2020 only, single self-contained file, no npm, no bundler `[VERIFIED: CLAUDE.md]`.

| Resource | Version | Purpose | Why Standard |
|----------|---------|---------|---------------|
| Google Fonts (Fraunces, Source Sans 3, JetBrains Mono) | latest via `fonts.googleapis.com` | Site typography | Already loaded identically on every existing page, e.g. `Congruence Wheel/congruence-wheel.html:12-13` `[VERIFIED: Congruence Wheel/congruence-wheel.html:12-13]` |
| `assets/palette.css` | repo-local | Color tokens (`--role-*`, `--bg-*`, `--text*`, `--accent*`) | Sole source of truth for color per PAL-02, linked before every tool's own `<style>` block `[VERIFIED: assets/palette.css:1-19]` |
| `assets/site.css` / `assets/theme.js` | repo-local | Shared nav header, day/night toggle | Linked identically on every page, e.g. `Congruence Wheel/congruence-wheel.html:9-11` `[VERIFIED: Congruence Wheel/congruence-wheel.html:9-11]` |

### Supporting
None — no state management library, no charting library, no templating engine. A Cayley table's numeric grid is small enough that hand-written DOM construction (as every other tool does) is standard for this repo.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| HTML `<table>` for the grid | SVG grid via `svgEl()` (this repo's more common diagram idiom — see Factor Tree, Congruence Wheel) | SVG gives free export-to-PNG/SVG (Congruence Wheel has `Download PNG`/`Download SVG`/`Print as PDF` buttons), but loses native `<th scope>` semantics, native row highlighting via `<tr>`, and native `text` reflow/wrapping at small cell sizes — all of which the D-02 scroll/shrink requirement needs. Recommend table; if a future phase wants export parity with the wheel, that is a clean additive follow-up, not a reason to pick SVG now. |
| HTML `<table>` | CSS Grid of `<div>` cells (Sieve's approach) | Works for a 1-D list of numbered cells, but the Sieve's grid has no headers at all — it is a flat N-cell field, not an operand × operand matrix. A Cayley table fundamentally needs two header axes (row values, column values) which `<table>` provides natively (`<thead>`, row `<th>`) and a `<div>`-grid would have to fake with extra sentinel divs. |

**Installation:** None — no package to install. Link only `../assets/palette.css`, `../assets/site.css`, `<script defer src="../assets/theme.js">`, and the same Google Fonts `<link>` tags every other tool uses `[VERIFIED: Congruence Wheel/congruence-wheel.html:9-13]`.

## Package Legitimacy Audit

**Not applicable.** This phase installs no external packages — the repo has no package manager (`CLAUDE.md`: "no build system, package manager, or test suite"), and this tool follows the identical zero-dependency pattern as all ten existing tools. The only external resource is the Google Fonts `<link>`, which is not an installable package and is already in use identically across the site.

## Architecture Patterns

### System Architecture Diagram

```
User input (N, mode click, cell click)
        │
        ▼
┌───────────────────────────┐
│  state = { N, mode,       │   in-memory, closure-scoped
│  selRow, selCol }         │   (mirrors Congruence Wheel's `state` object)
└──────────┬─────────────────┘
           │
           ▼
┌───────────────────────────┐
│  currentMode()             │  MODES[state.mode] → { elements(N), op(a,b,N),
│                             │  identity(N), wording, sign, ... }
└──────────┬─────────────────┘
           │  els = mode.elements(N)   (all 0..N-1, or unitsMod(N))
           ▼
┌───────────────────────────┐
│  render()                  │  builds <table>: <thead> col headers = els,
│                             │  <tbody> one <tr> per element with a
│                             │  <th scope="row"> + N <td> cells = op(row,col,N)
└──────────┬─────────────────┘
           │
           ▼
┌────────────────────────────────────────────┐
│  CSS class pass (identity / self-inverse)   │  static, independent of selection:
│  applied once per render() to header +      │  identity(N) row/col get .is-identity;
│  diagonal cells                              │  diagonal cells where op(x,x,N)===identity
└──────────┬───────────────────────────────────┘
           │
           ▼  user clicks a <td>
┌───────────────────────────┐
│  select(row, col)          │  sets state.selRow/selCol, computes equation
│                             │  string via mode.raw()/mode.sign, computes
│                             │  mirror cell (col,row) for D-05
└──────────┬─────────────────┘
           │
           ▼
┌───────────────────────────┐
│  re-render highlight pass  │  toggles .is-a on row <th>, .is-b on col <th>,
│                             │  .is-sum on selected <td>, .is-mirror on
│                             │  mirror <td>; updates caption text (aria-live)
└───────────────────────────┘
```

A reader can trace the full loop: input → mode/element resolution → table build → static structural highlights (identity/self-inverse, always on) → click → selection highlights + equation caption (transient, on top of the static layer).

### Recommended Project Structure
```
Cayley Table Generator/
└── cayley-table-generator.html   # single self-contained file, matching every
                                    # other tool directory (e.g. `Congruence Wheel/`)
```

### Pattern 1: Duplicate the `MODES` config shape from Congruence Wheel
**What:** A per-mode object supplying `elements(N)`, `op(a,b,N)`, `identity(N)`, and mode-specific wording strings, keyed by `additive`/`multiplicative`.
**When to use:** Directly — this is a locked decision (D-01) to echo, not extend, the Congruence Wheel's mode logic.
**Example (verbatim source to duplicate into the new file):**
```javascript
// Source: Congruence Wheel/congruence-wheel.html:435-472 (read this session)
var MODES = {
  additive: {
    elements: function(N){ var o = []; for (var r = 0; r < N; r++) o.push(r); return o; },
    op: function(a, b, N){ return (a + b) % N; },
    raw: function(a, b){ return a + b; },
    identity: function(N){ return 0; },
    sign: '+',
    // ...wording fields (note, heading, words, tags, verbing, joiner) —
    // adapt strings for a table context, keep the function shapes identical
  },
  multiplicative: {
    elements: unitsMod,
    op: function(a, b, N){ return (a * b) % N; },
    raw: function(a, b){ return a * b; },
    identity: function(N){ return 1 % N; },
    sign: '×'
    // ...
  }
};

function gcd(a, b){ while (b){ var t = a % b; a = b; b = t; } return a; }
function unitsMod(N){ var out = []; for (var r = 0; r < N; r++) if (gcd(r, N) === 1) out.push(r); return out; }
```
`[VERIFIED: Congruence Wheel/congruence-wheel.html:435-472,523-524]` — quoted verbatim above from the file read this session; this is the exact code CONTEXT.md's D-01 instructs the planner to duplicate ("`Congruence Wheel/congruence-wheel.html:524`: `function unitsMod(N){ var out = []; for (var r = 0; r < N; r++) if (gcd(r, N) === 1) out.push(r); return out; }`").

### Pattern 2: HTML `<table>` with `scope` attributes, not SVG or `<div>`-grid
**What:** `<table><caption>…</caption><thead><tr><th></th><th scope="col">0</th>…</tr></thead><tbody><tr><th scope="row">0</th><td>…</td>…</tr>…</tbody></table>`, corner cell blank/labelled with the operator symbol.
**When to use:** For the entire table body — this is the phase's core rendering decision.
**Why (reasoning grounded in this tool's needs):**
- Row highlighting (D-03) is one `tr.classList.add('is-a')` — free with `<table>`, would require iterating every cell in a CSS-grid `<div>` matrix.
- Column highlighting (D-03) has no native CSS "select this table column" mechanism in either `<table>` or CSS Grid, so it is JS-driven either way: iterate the column index and toggle a class on each `<td>`/cell in that column. This is symmetric cost between `<table>` and CSS Grid — not a differentiator.
- `scope="row"` / `scope="col"` on header cells is a native accessibility win a `<div>`-grid must re-implement via ARIA (`role="rowheader"`/`role="columnheader"`, `aria-describedby`) — more code, same result.
- `position: sticky` on `<thead> th` and the first column's `<th>` (row headers) is a well-supported native CSS behavior for keeping headers visible while scrolling a large table — directly serves D-02's scroll requirement, and is simpler than replicating sticky headers in a CSS Grid matrix (which needs the header row's grid cells individually `position:sticky`, same mechanism, more markup).
- No existing tool in this repo renders an actual `<table>` element for its diagrams — every diagram is SVG (Congruence Wheel, Factor Tree) or a `<div>` grid (Sieve) — so this is a new but standard, well-supported HTML primitive, not a novel library dependency.

### Pattern 3: Sieve-style scroll/shrink for D-02 (adapted from 1-D grid to N+1-column table)
**What:** A breakpoint function mapping table size to a minimum cell pixel size, written to a CSS custom property, combined with a scrolling container.
**When to use:** Every render, before building the table, to compute the current mode's element count M (= N for additive, φ(N) for multiplicative) and set `--cell-min` accordingly.
**Example (precedent to adapt — read this session):**
```javascript
// Source: Sieve Of Eratosthenes/sieve-of-eratosthenes.html:553-560 (read this session)
function cellMinPx(size){
  if (size <= 100) return 40;
  if (size <= 400) return 30;
  if (size <= 1000) return 24;
  if (size <= 3000) return 18;
  if (size <= 8000) return 14;
  return 11;
}
// ...
document.documentElement.style.setProperty('--cell-min', cellMinPx(size) + 'px');
```
```css
/* Source: Sieve Of Eratosthenes/sieve-of-eratosthenes.html:213-229 (read this session) */
.grid-container{
  position: relative;
  max-height: 62vh;
  overflow: auto;
  border-radius: 14px;
  padding: 4px;
}
.grid{
  display:grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--cell-min), 1fr));
  gap: 5px;
}
```
`[VERIFIED: Sieve Of Eratosthenes/sieve-of-eratosthenes.html:213-229,553-560]` — quoted verbatim above.

**Adaptation needed for the table case:** the Sieve's `grid-template-columns: repeat(auto-fill, …)` works because a 1-D list of cells can reflow into however many columns fit. A Cayley table cannot reflow — it needs exactly M+1 columns (row-header column + M data columns) in a fixed order, so use `table-layout: fixed` with a computed `min-width` per `<td>`/`<th>` driven by the same size-to-px breakpoint idea (a `cellMinPx(M)`-equivalent function), wrapped in a `.table-scroll{ overflow: auto; max-height: <value>; }` container matching the Sieve's `.grid-container`. The breakpoint *thresholds* are Sieve-specific (tuned for up to 20,000 flat cells) and not directly reusable numerically for an O(M²) table — see Common Pitfalls and the Assumptions Log for the recommended new thresholds.

### Pattern 4: Mode tabs — exact markup/ARIA pattern to duplicate
**What:** `role="tablist"` container, two `button[role="tab"]` elements with `aria-selected`, `tabindex` roving focus, and arrow-key navigation.
**Example (verbatim source to duplicate):**
```html
<!-- Source: Congruence Wheel/congruence-wheel.html:354-357 (read this session) -->
<div class="mode-tabs" role="tablist" aria-label="Group operation">
  <button type="button" class="mode-tab is-active" role="tab" id="tab-additive" data-mode="additive" aria-selected="true" aria-controls="wheel-panel">Additive Groups</button>
  <button type="button" class="mode-tab" role="tab" id="tab-multiplicative" data-mode="multiplicative" aria-selected="false" aria-controls="wheel-panel" tabindex="-1">Multiplicative Groups</button>
</div>
```
```javascript
// Source: Congruence Wheel/congruence-wheel.html:1016-1041 (read this session)
function setMode(id){
  if (id === state.mode) return;
  state.mode = id;
  state.a = currentMode().identity(state.N);
  syncTabs();
  persist();
  render();
}
// tab click/keydown wiring with ArrowRight/ArrowLeft roving focus follows verbatim
```
`[VERIFIED: Congruence Wheel/congruence-wheel.html:354-357,1016-1041]` — quoted verbatim above; CONTEXT.md's D-03 specifically requires "same mode-toggle labels 'Additive Groups' / 'Multiplicative Groups'" so this markup (including the exact label text) should be duplicated, not paraphrased.

### Pattern 5: The `--slot-*` palette-alias pattern (reuse and extend)
**What:** A `:root{ }` block inside the tool's own `<style>` that aliases 2-3 `--role-*` tokens to tool-scoped `--slot-*` names, plus `color-mix()`-derived `-soft` fill variants.
**Example (verbatim source to duplicate, then extend):**
```css
/* Source: Congruence Wheel/congruence-wheel.html:15-27 (read this session) */
:root{
  --slot-a: var(--role-active);
  --slot-b: var(--role-input);
  --slot-sum: var(--role-result);
  --slot-a-soft: color-mix(in srgb, var(--slot-a) 22%, transparent);
  --slot-b-soft: color-mix(in srgb, var(--slot-b) 22%, transparent);
  --slot-sum-soft: color-mix(in srgb, var(--slot-sum) 22%, transparent);
}
```
`[VERIFIED: Congruence Wheel/congruence-wheel.html:15-27]` — quoted verbatim above. This tool should duplicate this exact block (reusing `--slot-a`/`--slot-b`/`--slot-sum` for the click-select triad — see Pattern 6 below) and add two new locally-scoped aliases for D-04/D-06, following the same "built entirely from `var()`/`color-mix()` references" rule CLAUDE.md requires for any new locally-named alias:
```css
--slot-identity: var(--role-special);
--slot-identity-soft: color-mix(in srgb, var(--slot-identity) 14%, transparent);
--slot-inverse: var(--role-alt);
--slot-inverse-soft: color-mix(in srgb, var(--slot-inverse) 14%, transparent);
```

### Pattern 6: Four-simultaneous-highlight visual scheme (design recommendation — Claude's Discretion per CONTEXT.md)
**What:** A concrete, non-colliding visual language for D-03 (click-select), D-04 (identity), D-05 (diagonal mirror), D-06 (self-inverse), grounded in this repo's established combinator-class device (`Congruence Wheel`'s `is-a is-b is-multi` — a single element can carry more than one role class simultaneously, and `is-multi` changes the *stroke pattern*, not the fill, specifically so two role-fills don't have to blend `[VERIFIED: Congruence Wheel/congruence-wheel.html:160]`: `.wedge.is-multi .wedge-hit{ stroke-dasharray:9 6; }`).

Recommended mapping — three highlight states use fill/text-color (hue-coded), one uses stroke-pattern only (so it never competes for the same visual channel as the others):

| State | Trigger | Elements affected | Visual channel | Token |
|-------|---------|--------------------|-----------------|-------|
| D-03 row operand (a) | click | row `<th>` | background wash + bold colored text (mirrors Congruence Wheel's `.wedge.is-a`) | `--slot-a` / `--slot-a-soft` (= `--role-active`) |
| D-03 col operand (b) | click | col `<th>` | background wash + bold colored text | `--slot-b` / `--slot-b-soft` (= `--role-input`) |
| D-03 result cell (sum) | click | selected `<td>` | filled background (mirrors Sieve's `.cell.prime` gradient-fill treatment) | `--slot-sum` / `--slot-sum-soft` (= `--role-result`) |
| D-04 identity row/col | static, every render | identity's `<th>` (row+col) | permanent low-opacity background wash, distinct hue from a/b/sum | `--slot-identity-soft` (= `--role-special`, purple) |
| D-06 self-inverse cell | static, every render | diagonal `<td>` where `op(x,x,N)===identity(N)` | permanent ring/inset border (not a fill), distinct hue | `--slot-inverse` border (= `--role-alt`, pink) |
| D-05 diagonal mirror | on click, alongside D-03 | mirror `<td>` at (col,row) | dashed outline only, no fill (echoes `.wedge.is-multi`'s stroke-dasharray device) — layers over any of the fill-based states above without hue collision | reuses whichever hue is on the selected cell (`--slot-sum`), dashed not solid |

**Why this avoids collision:** identity (D-04) and self-inverse (D-06) are *static* (always visible, independent of clicking), so they must be visually quiet — a soft background wash and a border ring respectively are both low-contrast-by-design. D-03's three roles are the *active* interaction state and get the strongest treatment (solid fill + bold text), matching how the Congruence Wheel already treats its own a/b/sum roles as the most visually dominant state on the page. D-05 is deliberately encoded as an *outline pattern change*, not a new color, specifically because a diagonal cell can simultaneously be the self-inverse cell (D-06, border) or the identity cell (D-04, background) or even the selected result cell (D-03) when the user clicks a diagonal entry — stacking a dashed outline on top of an existing fill/border never produces a fourth competing hue.

**A special case to plan for:** clicking directly on a diagonal cell makes it simultaneously the selected result AND its own mirror (row===col at selection). The equation caption and dashed-outline logic should special-case `selRow === selCol` (as Congruence Wheel special-cases `state.a === state.b` implicitly via `rolesFor` allowing multiple roles on one wedge) rather than drawing two overlapping dashed outlines on the same cell.

### Anti-Patterns to Avoid
- **Extracting a shared `cayley-congruence-common.js` module:** explicitly against repo convention — `CLAUDE.md` states math helpers are "duplicated per-file rather than shared" intentionally, and CONTEXT.md's D-01 confirms "duplicating, per repo convention — no shared module."
- **Capping the N input the way GCD-05 caps its rendered square count:** explicitly rejected by D-02 — do not add a low hard `max` attribute mirroring the Congruence Wheel's `max="60"` range slider; use a number input with a generous ceiling instead (see Common Pitfalls).
- **Encoding all four highlight states as different background hues:** would very likely fail simultaneous-legibility on a diagonal self-inverse identity cell that is also the click-selected cell (up to 3 states on one cell) — use the mixed fill/border/outline channel scheme in Pattern 6 instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Row/column semantic headers + accessible table structure | Custom ARIA grid re-implementation (`role="grid"`/`role="row"`/`role="gridcell"` on `<div>`s) | Native `<table>`/`<thead>`/`<th scope="row">`/`<th scope="col">` | Native semantics are free, better supported by screen readers than a hand-rolled ARIA grid, and every modern browser handles `<table>` sticky headers and scrolling natively |
| Sticky headers while scrolling a large table | Manual `scroll` event listener repositioning a cloned header row | `position: sticky` on `<thead> th` / first-column `<th>` | Native CSS, already well-supported, zero JS required |
| GCD/coprimality check for the multiplicative element list | A new coprimality function | Duplicate the Congruence Wheel's existing `gcd(a,b)`/`unitsMod(N)` (2 short functions, already correct and tested in production) | D-01 explicitly names this as the function to duplicate; re-deriving it risks introducing a subtly different edge case (e.g. `gcd(0, N)` handling) than the proven version |

**Key insight:** Nothing in this phase needs a library — the entire feature set (table construction, click handling, class-based highlighting, sticky headers, equation-string formatting) is achievable with the same vanilla-JS techniques already proven across ten shipped tools in this repo. The only "new" technique is the HTML `<table>` element itself, which is a browser built-in, not a dependency.

## Common Pitfalls

### Pitfall 1: O(N²) / O(φ(N)²) DOM node growth with no ceiling
**What goes wrong:** Additive mode renders N² `<td>` cells; at N in the low hundreds this is tens of thousands of DOM nodes, and D-02 explicitly forbids a low input cap. Unbounded growth (a user typing N=100000) would attempt to build 10 billion cells and hang the tab.
**Why it happens:** A table is inherently quadratic in its element count, unlike the Sieve's flat, linear list of N cells (the Sieve's own N ceiling of 20,000 is for a *linear* structure, not directly transferable).
**How to avoid:** CONTEXT.md's D-02 discretion note explicitly asks for "a large but generous [ceiling]... bounded by input validation to avoid pathological values." Recommend validating the input to a ceiling low enough to keep the *additive* mode (the worst case, since it always uses all N elements vs. multiplicative's smaller φ(N) subset) under roughly 15,000–20,000 total cells — i.e. an N ceiling on the order of 120–150 `[ASSUMED]`. This is a planner/executor judgment call per CONTEXT.md, not a locked number — flag it for confirmation. See Assumptions Log.
**Warning signs:** Frame drift/jank on `render()` for N above the chosen ceiling; test at the ceiling value during implementation.

### Pitfall 2: Reusing the Sieve's exact `cellMinPx` breakpoint thresholds unchanged
**What goes wrong:** The Sieve's thresholds (`<=100 → 40px`, `<=8000 → 14px`, `>8000 → 11px`) were tuned for a flat N-cell list where the *container width* determines column count via `auto-fill`. A Cayley table's cell count is N² for the same input N, so reusing the same size thresholds keyed to raw N would shrink cells far too aggressively (or not aggressively enough) relative to the very different area-growth curve.
**Why it happens:** Superficial pattern copying without re-deriving the breakpoints for the new growth curve (quadratic vs. linear).
**How to avoid:** Key the breakpoint function to the *effective table dimension* M (= mode.elements(N).length) rather than N directly, and re-tune the thresholds for a target floor around 22–28px (a table cell needs to remain a legible click target, arguably more so than the Sieve's inert display cells, since every Cayley cell is interactive) `[ASSUMED]`.
**Warning signs:** Cells becoming sub-20px and hard to tap/click accurately at moderate N well before the DOM-performance ceiling in Pitfall 1 is reached.

### Pitfall 3: Column highlighting implemented as a per-frame full-table re-render
**What goes wrong:** Congruence Wheel's `select()` calls `render()` wholesale on every click, which is fine for ~60 wedges but would be wasteful for a few-thousand-cell table (rebuilding the whole `<table>` on every click).
**Why it happens:** Copying the Congruence Wheel's `select(idx){ ...; render(); }` pattern verbatim without adapting it for the larger element count.
**How to avoid:** Separate the (expensive) table *structure* build from the (cheap) highlight-class pass — rebuild structure only when N or mode changes, and toggle classes on existing `<th>`/`<td>` elements on click, not a full rebuild.
**Warning signs:** Visible flicker or lag on cell click at moderate-to-large N.

### Pitfall 4: Color-only distinction between the four highlight states
**What goes wrong:** Relying purely on 4 different background hues to distinguish D-03/D-04/D-05/D-06 fails users with color-vision deficiencies and risks visual noise even for sighted users when 2-3 states stack on one cell (e.g., a self-inverse diagonal cell that is also the identity, in the trivial N=1/N=2 case).
**Why it happens:** The four requirements were scoped independently in CONTEXT.md's discussion; nothing in the requirements text mandates non-color channels.
**How to avoid:** Use the mixed fill/border/dashed-outline channel scheme in Architecture Patterns → Pattern 6, which already differentiates by channel (fill vs. border vs. outline pattern), not hue alone.
**Warning signs:** A design review (or the `gsd-ui-review` skill, given this phase's `UI hint: yes`) flagging that two states are indistinguishable on a small/low-contrast display.

### Pitfall 5: Forgetting to update all eleven pages' nav headers, not just the new file and `index.html`
**What goes wrong:** NAV-03 requires the shared nav header to list all eleven tools on *every* page, not just the new one. This repo's nav is duplicated markup per page (no shared partial/include mechanism), so adding the new tool means editing 11 files' `<nav class="site-nav">` block (10 existing tool pages + `index.html`), each with an identical new `<a href="…Cayley Table Generator/cayley-table-generator.html" class="site-nav-link">Cayley Table Generator</a>` line, all but 1 without `is-active` and the new file's own nav with `is-active` on its own entry.
**Why it happens:** Easy to update the new file's own nav and `index.html`'s card grid and forget the other nine tool pages, since there is no single source of truth for the nav markup (a documented, intentional anti-pattern — "Tight Coupling to nav duplication" is exactly the repo's established convention, verified by NAV-02's precedent: every prior tool phase updated all pages).
**How to avoid:** Grep the repo for `site-nav-link` and confirm the new `<a>` entry appears in the same relative position (after "Euclidean Algorithm") on all eleven files before considering the phase done.
**Warning signs:** `grep -rL "Cayley Table Generator" --include="*.html" .` returning any of the ten pre-existing tool pages.

## Code Examples

### Equation-string construction (adapt from Congruence Wheel's caption builder)
```javascript
// Source: Congruence Wheel/congruence-wheel.html:710-717 (read this session)
var a = state.a, b = state.b, sum = state.sum;
var raw = mode.raw(a, b);
caption.innerHTML =
  '<span class="slot-a">[' + a + ']</span> ' + mode.sign + ' <span class="slot-b">[' + b + ']</span> = <span class="slot-sum">[' + sum + ']</span> — ' +
  a + ' ' + mode.sign + ' ' + b + ' = ' + raw + ' ≡ ' + sum + ' (mod ' + N + ').';
```
`[VERIFIED: Congruence Wheel/congruence-wheel.html:710-717]` — this is the exact string-building logic that already produces output in the shape CAYLEY-03 asks for (`3 + 5 = 8 ≡ 2 (mod 6)`); reuse `mode.raw(a,b)` and `mode.sign` unchanged, feeding row/col values instead of the wheel's a/b selection state.

### Cross-link markup (adapt from Euclidean Algorithm ↔ Venn Diagrams)
```html
<!-- Source: Euclidean Algorithm/euclidean-algorithm.html:253 (read this session) -->
<p class="xref"><a href="../Venn Diagrams/venn-diagrams.html">The same GCD can also be seen as the primes the two numbers share &rarr;</a></p>
```
```css
/* Source: Euclidean Algorithm/euclidean-algorithm.html:78-80 (read this session) */
.xref{ margin:10px 0 0; font-size:13px; }
.xref a{ color:var(--role-input); text-decoration:none; border-bottom:1px solid color-mix(in srgb, var(--role-input) 45%, transparent); }
.xref a:hover{ color:var(--role-result); border-bottom-color:color-mix(in srgb, var(--role-result) 45%, transparent); }
```
`[VERIFIED: Euclidean Algorithm/euclidean-algorithm.html:78-80,253]` — quoted verbatim above. Duplicate this `.xref` block and `<p class="xref">` placement (directly inside `.page-header`, after the `.lede` paragraph) into both the new Cayley tool's page (linking to `../Congruence Wheel/congruence-wheel.html`) and add the reciprocal link into `Congruence Wheel/congruence-wheel.html`'s own `.page-header` (it currently has none — confirmed by reading the file in full this session, lines 348-352 show no `.xref` element yet).

### `svgEl(tag, attrs)` helper (cite only if any part of the tool ends up SVG-rendered)
```javascript
// Source: Congruence Wheel/congruence-wheel.html:498-502 (read this session)
function svgEl(tag, attrs){
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}
```
`[VERIFIED: Congruence Wheel/congruence-wheel.html:498-502]` — quoted verbatim. Per Pattern 2's recommendation, this phase should NOT need `svgEl()` since the table is HTML, not SVG — included here only because CONTEXT.md's code_context section flags it as a possible dependency; the planner should treat this as unnecessary unless the plan deviates from the table recommendation.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|----------------|
| A1 | Recommended N ceiling of ~120–150 for additive mode (~15,000–20,000 DOM cells) | Common Pitfalls #1 | If too high, large-N renders could visibly lag or hang the tab; if too low, contradicts D-02's "generous" ceiling intent. Executor should empirically test render time at the chosen ceiling on a mid-range device before locking the value. |
| A2 | Recommended cell-size legibility floor of ~22–28px, re-derived from (not copied from) the Sieve's thresholds | Common Pitfalls #2 | If too low, click targets become hard to hit accurately, undermining D-03's core interaction; if too high, the table hits the scroll fallback sooner than necessary. |
| A3 | Four-channel highlight scheme (fill for a/b/sum, static wash for identity, static border for self-inverse, dashed outline for diagonal mirror) is sufficient to keep all four states legible together | Architecture Patterns → Pattern 6 | This is a design proposal, not a verified UI test — CONTEXT.md flags this exact concern as "worth extra care" and leaves exact treatment to Claude's Discretion. A `gsd-ui-review` pass (phase has `UI hint: yes`) should validate this in practice, especially the worst case of 3 states stacking on one small-N diagonal cell. |
| A4 | Cayley table tool should persist `{N, mode}` to `localStorage` under a new key (e.g. `'cayley-table'`), mirroring Congruence Wheel's `'congruence-wheel'` key | Code Examples / general pattern | Low risk either way — CONTEXT.md doesn't lock this; Euclidean Algorithm's precedent shows *not* persisting tool-specific state is also an accepted pattern in this repo. Planner's choice. |

## Open Questions

1. **Exact copy for D-05's "diagonal symmetry" teaching callout — static caption, interactive hover echo, or both?**
   - What we know: CONTEXT.md explicitly leaves this to Claude's Discretion ("Whether the diagonal-symmetry teaching point (D-05) is a static caption, an interactive hover echo, or both").
   - What's unclear: Whether a static caption alone satisfies CAYLEY-05/the roadmap's success criterion 4 ("mirrored cell pairs across the main diagonal readable as such in the diagram rather than merely asserted in prose") — the roadmap language leans toward requiring an interactive/visual echo, not prose alone.
   - Recommendation: Implement the dashed-outline mirror-cell highlight on click (Pattern 6) as the primary mechanism (satisfies "readable... in the diagram"), plus a one-line static caption near the table explaining the symmetry as reinforcement — both, per the roadmap's stronger wording.

2. **Should the corner cell (row 0 / col 0 intersection of the header row and header column) show the operator symbol, "×"/"+", N, or be blank?**
   - What we know: No existing precedent in this repo for a matrix corner cell.
   - What's unclear: No CONTEXT.md decision on this cosmetic detail.
   - Recommendation: Show `mode.sign` (the `+` or `×` character already defined per-mode in the `MODES` config) — a natural, self-documenting convention for operation tables and zero extra state.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Google Fonts CDN (`fonts.googleapis.com`) | Site typography (Fraunces/Source Sans 3/JetBrains Mono) | External network resource, not locally verifiable | — | Browser falls back to the declared local stacks (`Georgia, serif` / `system-ui, sans-serif` / `monospace`) already specified in every existing tool's CSS `font-family` declarations, e.g. `Congruence Wheel/congruence-wheel.html:33` `[VERIFIED: Congruence Wheel/congruence-wheel.html:33,47]` |
| Modern browser (CSS `color-mix()`, `position: sticky`, CSS custom properties) | Palette tokens, sticky table headers, theming | Assumed present per this repo's stated `.claude/CLAUDE.md` runtime requirement ("Modern web browsers... ES2020 support") | — | None needed — same requirement every other tool already depends on `[VERIFIED: .claude/CLAUDE.md]` |

No other external dependency exists for this phase — no CLI tool, database, or service is involved; this is a static file authored directly.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None — this repo has no test suite, no `package.json`, and no test files anywhere (`find . -iname "*.test.*" -o -iname "*spec*" -o -iname "package.json"` returns nothing outside `.planning/`) `[VERIFIED: repo search this session]` |
| Config file | none |
| Quick run command | Open the file directly in a browser: `open "Cayley Table Generator/cayley-table-generator.html"` (matches `CLAUDE.md`'s documented verification method for every tool in this repo) |
| Full suite command | Manually exercise: N input at low/mid/ceiling values, both modes, cell click, identity highlight, self-inverse highlight, diagonal-mirror highlight, cross-link, nav on all 11 pages, day/night toggle |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAYLEY-01 | N input validates/clamps and regenerates table | manual-only | — (no test runner in this repo; open file, type invalid/huge/negative N) | ❌ N/A — no test infra exists in this repo by design |
| CAYLEY-02 | Mode toggle switches element list + operation | manual-only | — (click both tabs, confirm table dimensions/values change) | ❌ N/A |
| CAYLEY-03 | Cell click shows equation + row/col highlight | manual-only | — (click several cells including a diagonal one, read caption) | ❌ N/A |
| CAYLEY-04 | Identity row/col visually distinguished | manual-only | — (visually confirm identity row/col in both modes) | ❌ N/A |
| CAYLEY-05 | Diagonal symmetry visible as teaching point | manual-only | — (click an off-diagonal cell, confirm mirror cell highlights) | ❌ N/A |
| CAYLEY-06 | Self-inverse diagonal cells highlighted | manual-only | — (pick an N with a non-trivial self-inverse, e.g. N=8 multiplicative has 3,5,7 self-inverse besides 1) | ❌ N/A |
| CAYLEY-07 | Two-way cross-link works | manual-only | — (click link both directions) | ❌ N/A |
| NAV-03 | All 11 pages list all 11 tools, current active | manual-only | `grep -rL "Cayley Table Generator" --include="*.html" .` should return nothing after the phase | ❌ N/A |

**Manual-only justification:** This repo has zero test infrastructure by explicit, repeated design choice (`CLAUDE.md`: "There is no build system, package manager, or test suite"). Introducing a test framework for one phase would contradict the project's established zero-dependency, single-file convention and is out of this phase's scope. All ten prior tool phases in this project were verified the same way (open in browser, exercise controls).

### Sampling Rate
- **Per task commit:** Open the modified file in a browser and exercise the specific control just changed.
- **Per wave merge:** Full manual pass through all CAYLEY-01–07 + NAV-03 behaviors listed above.
- **Phase gate:** Full manual pass, both modes, at least one small N (e.g. 5), one mid N, and the chosen ceiling N, before `/gsd-verify-work`.

### Wave 0 Gaps
None — no test infrastructure gap to fill, consistent with every prior phase in this repo. "Framework install" is explicitly not applicable per this repo's zero-build-tooling constraint.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | No accounts/auth anywhere in this repo |
| V3 Session Management | No | No sessions; only `localStorage` UI-preference persistence |
| V4 Access Control | No | Fully public static page, no access boundaries |
| V5 Input Validation | Yes | Validate/clamp the N input the same way every existing tool does: `parseInt(value, 10)`, range check, `clamp(v, lo, hi)` before use — see `Congruence Wheel/congruence-wheel.html:521` `clamp(v, lo, hi){ return Math.max(lo, Math.min(hi, v)); }` `[VERIFIED: Congruence Wheel/congruence-wheel.html:521]`. Also validate mode string against the known `MODES` keys before indexing (as `Congruence Wheel/congruence-wheel.html:490` already does: `if (saved && (saved.mode === 'additive' || saved.mode === 'multiplicative')) state.mode = saved.mode;`). |
| V6 Cryptography | No | No cryptographic operations in this tool (unlike RSA/Diffie-Hellman) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|-----------------------|
| Unvalidated `localStorage` JSON parsed back into state (a malformed/tampered stored value crashing render or setting an out-of-range N) | Tampering | Wrap `JSON.parse(localStorage.getItem(...) || 'null')` in `try/catch`, validate each field's range/type before assigning to `state`, exactly as `Congruence Wheel/congruence-wheel.html:486-491` does `[VERIFIED: Congruence Wheel/congruence-wheel.html:486-491]` |
| Unbounded N causing a client-side denial-of-service (tab hang/crash) from excessive DOM node creation | Denial of Service | Validate N against the ceiling from Common Pitfalls #1 before calling `render()`, matching the Sieve's own `if (size > 20000) size = 20000;` clamp pattern (`Sieve Of Eratosthenes/sieve-of-eratosthenes.html:753`) `[VERIFIED: Sieve Of Eratosthenes/sieve-of-eratosthenes.html:753]` |
| `innerHTML` string-concatenation for the equation caption (XSS if any interpolated value were ever attacker-controlled) | Tampering / Injection | Not a real risk here — every interpolated value is a computed integer (`a`, `b`, `sum`, `N`), never raw user text; the existing wheel already builds captions this way safely. No change needed, but do not extend this pattern to any future free-text user input without escaping. |

## Sources

### Primary (HIGH confidence — read in full this session)
- `Congruence Wheel/congruence-wheel.html` — full file read this session; `MODES` config (lines 435-472), `unitsMod`/`gcd` (523-524), `select`/`rolesFor` (478-484, 721-734), `--slot-*` alias block (15-27), mode-tab markup (354-357) and wiring (1000-1041), `clamp` (521), localStorage validation (486-491)
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` — full file read this session; `cellMinPx` (553-560), grid/scroll CSS (213-229), size-input clamp (753)
- `Euclidean Algorithm/euclidean-algorithm.html` — `.xref` cross-link CSS (78-80) and markup (253), read this session
- `Venn Diagrams/venn-diagrams.html` — reciprocal `.xref` link (361), confirmed the two-way pattern, grepped this session
- `index.html` — full file read this session; `.card-grid` card markup pattern for all ten existing tools, nav header markup
- `assets/palette.css` — full file read this session; `--role-*` semantic layer and both theme blocks
- `.planning/phases/05-cayley-table-generator/05-CONTEXT.md`, `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md`, `.planning/PROJECT.md`, `CLAUDE.md`, `.claude/CLAUDE.md` — all read in full this session

### Secondary (MEDIUM confidence)
None — no external web sources were needed; every finding required for this phase is grounded directly in this repo's own existing code, which is authoritative for a same-repo pattern-matching phase.

### Tertiary (LOW confidence)
None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero-dependency convention is explicit and unambiguous in `CLAUDE.md`, verified by reading every sibling tool's `<head>`
- Architecture (table vs. SVG vs. div-grid): HIGH for the recommendation's reasoning (grounded in accessibility/semantics facts about `<table>` that don't depend on this codebase), MEDIUM for the specific breakpoint numbers in Pitfalls #1/#2 (tagged `[ASSUMED]`, need empirical confirmation during implementation)
- Pitfalls: HIGH for patterns directly observed in sibling tools (nav duplication, localStorage validation), MEDIUM for the two performance-threshold recommendations (A1/A2 in Assumptions Log)

**Research date:** 2026-09-27
**Valid until:** No external dependency drift risk (zero packages); re-research only if the repo's core conventions (palette, nav pattern, or the no-shared-module rule) change.
