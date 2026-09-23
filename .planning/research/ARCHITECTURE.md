# Architecture Research

**Domain:** Static, zero-build, single-file-per-tool educational web app (number-theory visualizers)
**Researched:** 2026-09-23
**Confidence:** HIGH

This research is scoped to a single design question: how do three new tools and a site-wide color-palette unification integrate with the existing per-file architecture without a build step. It draws on direct inspection of the current codebase (`.planning/codebase/ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `assets/site.css`, and the `:root` blocks of all five existing tools) rather than external ecosystem research — the relevant technology (CSS custom properties + cascade, `<link>` loading over `file://`) is a stable, long-established web platform capability, not a fast-moving library choice.

## Current State (verified by direct inspection)

`assets/site.css` already establishes the precedent this milestone should extend: a shared stylesheet, loaded via `<link rel="stylesheet" href="../assets/site.css">` in every tool's `<head>`, defines chrome-only tokens under a `--st-` prefix (`--st-header-bg`, `--st-header-accent`, etc.) with a `:root{...}` (night/default) block and a `:root[data-theme="day"]{...}` override block. This is the one sanctioned exception to "no shared code" called out in `PROJECT.md`, and it already works over `file://` with no build step — proven by the existing site, not a hypothesis.

Each tool's own inline `<style>` block *also* defines a `:root{...}` / `:root[data-theme="..."]{...}` pair, but the token names are **not** consistent across tools today:

| Tool | Base surface | Text | Text-dim | Accent | Notes |
|---|---|---|---|---|---|
| Pizza Slices | `--bg`, `--card` | `--ink` | `--ink-soft` | `--accent` | Default block is *day* colors; `[data-theme="night"]` overrides |
| Christmas Trees | `--page-bg` (gradient) | `--page-text` | `--footnote` | `--gold` | Fully bespoke Christmas-themed names, no shared vocabulary at all |
| Completing-the-Square | `--bg-1`/`--bg-2`, `--panel` | `--text` | `--text-dim` | `--accent`, `--accent-2`, `--accent-3` | Default block is *night*; `[data-theme="day"]` overrides |
| RSA Examplifier | `--bg-1`/`--bg-2`, `--panel` | `--text` | `--text-dim` | `--accent` | Adds narrative-role tokens: `--bob`, `--alice`, `--eve`, `--dlp` (+ `-bg` variants via `color-mix()`) |
| Sieve of Eratosthenes | `--bg-1`/`--bg-2`, `--panel` | `--text` | `--text-dim` | `--accent`, `--accent-2` | Adds cell-state tokens: `--prime`, `--composite`, `--current`, `--one` |

Two findings drive the recommendation below:

1. **Partial convergence already exists.** Three of five tools (Completing-the-Square, RSA, Sieve) already agree on `--bg-1`/`--bg-2`/`--panel`/`--text`/`--text-dim`/`--accent`/`--accent-2`. Pizza Slices uses an equivalent but differently-named set. Christmas Trees is the true outlier with no shared vocabulary. Unification is closer than it looks — it is a naming/value convergence problem, not a from-scratch design problem.
2. **Every tool already has a category of tokens that must stay local** — narrative/semantic tokens tied to that tool's specific diagram (RSA's `--bob`/`--alice`/`--eve`, Sieve's `--prime`/`--composite`/`--current`, Christmas Trees' `--pine-1..3`). These are not "palette" in the site-identity sense; they are tool-specific semantic roles and should remain in each tool's own `<style>` block, ideally *derived from* the shared palette rather than hand-picked independently.

## Standard Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────────┐
│                         assets/ (shared, loaded by every page)        │
│  ┌───────────────────────┐   ┌────────────────────────────────────┐  │
│  │   palette.css (NEW)    │   │            site.css                │  │
│  │  Canonical color       │──▶│  Chrome layout (header/nav/switch) │  │
│  │  tokens: --bg, --panel,│   │  --st-* tokens now ALIAS the       │  │
│  │  --text, --text-dim,   │   │  canonical palette instead of      │  │
│  │  --accent, --accent-2, │   │  carrying independent values       │  │
│  │  --border, --danger,   │   └────────────────────────────────────┘  │
│  │  --success              │                                          │
│  │  :root{...}  (night)   │   ┌────────────────────────────────────┐  │
│  │  :root[data-theme=     │   │            theme.js                │  │
│  │   "day"]{...}          │   │  Sets [data-theme] attribute;       │  │
│  └───────────┬─────────────┘   │  unchanged by this milestone       │  │
│              │                 └────────────────────────────────────┘  │
└──────────────┼──────────────────────────────────────────────────────┘
               │ inherited via CSS cascade (:root is document-wide)
               ▼
┌───────────────────────────────────────────────────────────────────────┐
│              Each tool's own <style> block (unchanged pattern)        │
│  - Does NOT redefine --bg / --text / --accent / etc. anymore          │
│  - DOES define its own tool-local semantic tokens, e.g.:              │
│      --prime, --composite, --current      (Sieve)                     │
│      --bob, --alice, --eve, --dlp         (RSA)                       │
│      --quotient, --remainder              (new: Euclidean/GCD)        │
│      --congruence-1..k                    (new: CRT)                  │
│      --numerator, --denominator, --convergent  (new: Continued Fr.)   │
│    ...each ideally defined as var(--accent), var(--accent-2), etc.    │
│    or a color-mix()/tint of one, so it stays visually harmonious.     │
└───────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|-------------------------|
| `assets/palette.css` (new) | Single source of truth for the site-wide color identity — the values every tool's surfaces, text, and primary accent resolve to | Two `:root` blocks (default = night, `[data-theme="day"]` = override), token names only, no selectors beyond `:root` |
| `assets/site.css` (existing) | Chrome layout/behavior (header, nav, theme switch) | Keeps its `.site-header`, `.site-nav`, `.theme-switch` rules; its `--st-*` tokens become one-line aliases to the canonical tokens (`--st-header-accent: var(--accent);`) instead of a second, independently-maintained color set |
| `assets/theme.js` (existing) | Persist/toggle `data-theme` attribute | Unchanged — this milestone is CSS-only |
| Each tool's inline `<style>` (existing pattern, migrated) | Tool-specific layout, animation, and *tool-local semantic* tokens only | `:root` block shrinks to just the tokens with no site-wide equivalent (diagram-specific role colors); base tokens are consumed via `var(--accent)` etc., never re-declared |
| Each tool's inline `<script>` (existing pattern) | Math logic + SVG rendering | Unaffected by palette work — duplication convention (per `CLAUDE.md`) is orthogonal to CSS tokens and stays as-is |

## Recommended Project Structure

```
number-theory-browser-tools/
├── assets/
│   ├── site.css          # unchanged responsibility; --st-* now aliases palette.css
│   ├── palette.css        # NEW — canonical color tokens only, no layout rules
│   └── theme.js           # unchanged
├── Euclidean Algorithm/                       # NEW tool directory (Title Case, matches convention)
│   └── euclidean-algorithm.html                # copies head structure from an already-migrated tool
├── Chinese Remainder Theorem/                  # NEW
│   └── chinese-remainder-theorem.html
├── Continued Fractions/                        # NEW
│   └── continued-fractions.html
├── Christmas Trees/ ... (existing 5, migrated to consume palette.css)
├── Pizza Slices/ ...
├── Factorize By Completing The Square/ ...
├── RSA Examplifier/ ...
├── Sieve Of Eratosthenes/ ...
└── index.html             # hub — gains 3 new cards, unaffected structurally otherwise
```

### Structure Rationale

- **`assets/palette.css` is a new, separate file from `site.css`, not folded into it.** `site.css` owns *chrome component styling* (header/nav layout, focus rings, media queries for the nav bar). `palette.css` owns *pure design tokens* consumed by chrome AND by all eight tools' own diagram/UI CSS. Splitting them keeps each file single-responsibility and makes it trivial to locate "the palette" when a future milestone (e.g., the deferred group-theory v2) needs its own extended token set — you edit one small file, not a large chrome stylesheet.
- **Not a new architectural direction — a small extension of an already-approved exception.** `PROJECT.md` explicitly names "shared site chrome in `assets/`" as the one intentional exception to the single-file-per-tool rule. A second, equally small, CSS-only file in the same directory, loaded the same way (`<link>`), is the same exception, not a new one. It does not touch JavaScript, so it does not conflict with the `CLAUDE.md` rule against shared JS modules (that rule is scoped to number-theory helper *functions*, not CSS tokens).
- **Tool-local `:root` blocks are not eliminated, only narrowed.** Each tool keeps a local `:root`/`:root[data-theme="day"]` block for tokens with no site-wide meaning (narrative actor colors, cell-state colors, diagram-specific hues). This matches the existing precedent (RSA and Sieve already layer tool-specific tokens on top of a base set) and keeps each `.html` file visually self-explanatory without requiring a reader to cross-reference `palette.css` to understand every color in the file.

## Architectural Patterns

### Pattern 1: Shared token file, consumed but not overridden

**What:** `assets/palette.css` defines canonical `--bg`, `--panel`, `--text`, `--text-dim`, `--accent`, `--accent-2`, `--border`, `--danger`, `--success` (exact list to be finalized as part of the palette-design work, not this research). Every tool's `<style>` block stops declaring these names in its own `:root`; it only *reads* them via `var(--accent)`, `var(--text)`, etc., exactly where it previously read its own hand-picked value.

**When to use:** For any token that should look identical on every page (page background, body text, primary accent, borders, success/error states).

**Trade-offs:** Gains a true single source of truth — one edit in `palette.css` re-themes all 8 tools instantly, the explicit goal of this milestone. Costs one more `<link>` in every `<head>` (trivial — `file://` `<link rel="stylesheet">` already works today for `site.css`, proven, not a risk) and a one-time mechanical migration of the 5 existing tools (rename divergent token names to the canonical set, delete now-redundant hardcoded values, sweep any raw hex codes used outside `:root` — e.g. inline `fill="#33f5c0"` in generated SVG attributes — since `var()`-free hardcoding anywhere defeats the unification).

**Example:**
```css
/* assets/palette.css */
:root{
  --bg: #0b0c0f;
  --panel: rgba(255,255,255,0.05);
  --text: #e8ecf7;
  --text-dim: #9098b5;
  --accent: #7c9bff;
  --accent-2: #45e0c1;
  --border: rgba(255,255,255,0.09);
  --danger: #ff6b81;
  --success: #45e0c1;
}
:root[data-theme="day"]{
  --bg: #fbfaff;
  --panel: rgba(15,20,40,0.035);
  --text: #241f33;
  --text-dim: #6b6482;
  --accent: #0f6e68;
  --accent-2: #c97a1f;
  --border: rgba(15,20,40,0.1);
  --danger: #d6455f;
  --success: #0f9a80;
}
```
```html
<!-- every tool's <head>, in this order -->
<link rel="stylesheet" href="../assets/palette.css">
<link rel="stylesheet" href="../assets/site.css">
<script defer src="../assets/theme.js"></script>
<!-- Google Fonts link -->
<style>
  :root{
    /* only tool-local tokens remain here, e.g.: */
    --prime: var(--accent-2);
    --composite: color-mix(in srgb, var(--text-dim) 40%, transparent);
    --current: #ffcf5c; /* a genuinely tool-unique highlight color is fine to hardcode locally */
  }
  body{ background: var(--bg); color: var(--text); }
</style>
```

### Pattern 2: Chrome tokens alias the palette instead of duplicating it

**What:** `assets/site.css`'s existing `--st-header-accent`, `--st-header-text`, etc. are redefined as one-line references to the canonical palette (`--st-header-accent: var(--accent);`) rather than carrying their own independently-chosen hex values as they do today.

**When to use:** Always, once `palette.css` exists — there is no longer a reason for the header/nav to use a *different* blue than the rest of the page now that the whole site shares one accent color.

**Trade-offs:** Removes the last bit of independent color decision-making from `site.css`, finishing the unification instead of leaving a chrome-vs-content seam. Slight risk: `site.css` currently loads without depending on any other stylesheet; aliasing to `var(--accent)` makes it depend on `palette.css` having loaded first (load-order-sensitive, but `<link>` elements are parsed and applied in document order by all browsers, so this is a documented ordering requirement, not a fragile runtime race).

### Pattern 3: Tool-local semantic tokens derive from, don't replace, the base palette

**What:** New/migrated tool-specific tokens (`--prime`, `--bob`, future `--quotient`/`--remainder` for the Euclidean tool, future per-congruence colors for CRT) are defined as `var(--accent)`, `var(--accent-2)`, or a `color-mix()` tint of one of those, rather than as a fresh hardcoded hex value.

**When to use:** Any time a tool needs more than the ~6 base roles (e.g., RSA needs 4 actor colors; Sieve needs 4 cell states; CRT will need one color per congruence in the system, likely 2-4).

**Trade-offs:** Keeps every tool's "extra" colors visually related to the one accent family instead of introducing a second unrelated hue per tool (which is exactly the "each tool has its own bespoke palette" problem this milestone is fixing). The cost is a small constraint on tool design — a tool can no longer reach for an arbitrary hue just because it reads well in isolation; new narrative colors should be picked as tints/shades of the canonical accent(s), or, if a genuinely new hue is required (e.g., a fourth CRT congruence needing to be visually distinct from the third), it should be proposed as an addition to `palette.css` so it is available to every tool, not invented locally.

## Data Flow

### Palette / Theme Propagation

```
[assets/palette.css loads]           (first <link> in <head>, all pages)
      │  defines --bg/--text/--accent/... on :root and :root[data-theme="day"]
      ▼
[assets/site.css loads]              (second <link>, all pages)
      │  --st-* tokens alias var(--accent) etc. from palette.css
      ▼
[tool's inline <style> loads]        (last, per-page)
      │  consumes var(--bg)/var(--text)/var(--accent) directly in its own rules
      │  defines ONLY tool-local semantic tokens (derived from the base palette)
      ▼
[body/SVG elements painted]          using var(--*) throughout, never a bare hex
      ▲
      │ theme.js sets documentElement[data-theme] = "day" | "night" on toggle
      │ → EVERY :root[data-theme="..."] block (palette.css, site.css, tool <style>)
      │   re-resolves simultaneously — no JS re-render needed, pure CSS cascade
```

### Key Data Flows

1. **Palette edit → whole site:** Changing a value in `assets/palette.css` (one file, no build step) instantly re-colors all 8 tool pages and the portal on next load/refresh, because every page's `<link>` points at the same file. This is the entire mechanism that satisfies "one unified color palette" — no JS, no templating, no build.
2. **Theme toggle → whole page:** Unchanged from today's working mechanism — `theme.js` flips `[data-theme]`, and because `palette.css`, `site.css`, and the tool's own `<style>` all key off the same attribute, everything re-themes atomically via CSS cascade. This milestone does not add a new theming mechanism, it consolidates *where* the color values live.
3. **New tool authored → inherits palette automatically:** A new tool that copies the `<head>` structure from an already-migrated existing tool (per `STRUCTURE.md`'s "copy structure from an existing tool" guidance) gets the canonical palette for free by including the same two `<link>` tags — it never needs to hand-pick a `--bg`/`--text`/`--accent` value at all, only its own tool-unique semantic tokens.

## Build Order (roadmap sequencing implication)

**Palette unification should be Phase 1, before the three new tools are built — not after, and not interleaved.**

Rationale:

1. **Avoid building the same work twice.** If the 3 new tools are built first using today's per-tool bespoke-`:root` pattern (the only pattern that currently exists to copy from), each one gets its own hand-picked colors — then has to be reworked immediately afterward to adopt the shared palette. Sequencing palette first means every new tool is authored once, correctly, against `palette.css` from its first commit.
2. **The palette itself is a design decision that must exist before it can be copied.** "One unified color palette" requires choosing actual values (background, text, accent hues, day/night pairs) — that choice is a prerequisite artifact, not something a tool-building phase can infer on its own.
3. **A migrated existing tool becomes the copy-paste template for new tools.** `STRUCTURE.md` already directs new-tool authors to "copy structure from an existing tool." If that existing tool has already been migrated to consume `palette.css`, the new tool inherits the correct `<head>` structure and the discipline of "only add tool-local tokens" automatically. If palette work happens after, the template being copied still has the old bespoke pattern baked in, and whoever builds the new tools has no working example of the target pattern to follow.
4. **Migrating 5 files vs. 8 files is a similar-sized, mechanical, low-risk task either way** — sequencing it first doesn't materially increase total effort, it just avoids doing the new-tool work under a soon-to-be-obsolete convention.

Within Phase 1 (palette unification), the necessary steps, in order:
   a. Design/choose the canonical token set and day/night values → `assets/palette.css`.
   b. Migrate `assets/site.css`'s `--st-*` tokens to alias the canonical tokens.
   c. Migrate each of the 5 existing tools: add the `palette.css` `<link>`, rename divergent token names to the canonical set, delete redundant hardcoded `:root` values, keep/derive only tool-local semantic tokens, sweep any hardcoded hex values used outside `:root` (SVG fills/strokes set directly in JS, inline styles) to reference tokens instead.
   d. Visual smoke-test all 5 existing tools in both day and night themes (manual browser check — no test suite exists in this repo, per `CONVENTIONS.md`).

After Phase 1, each of the 3 new tools (Euclidean Algorithm/GCD, Chinese Remainder Theorem, Continued Fractions) is its own phase (or can be parallelized — they have no dependency on each other, only on Phase 1 being complete), each following the now-established pattern: copy head structure from a migrated tool, define only tool-local semantic tokens, add its `index.html` card and its own copy of the site nav (per `STRUCTURE.md`'s existing "update nav in your new tool to include all tools" step — this already requires touching every tool's nav markup when a tool is added, palette work does not change that requirement).

## Anti-Patterns

### Anti-Pattern 1: Renaming instead of aliasing `--st-*` tokens

**What people do:** Delete `site.css`'s `--st-*` tokens entirely and have `.site-header` rules reference `var(--accent)`/`var(--text)` directly.
**Why it's wrong:** Collapses the distinction between "chrome-specific token that happens to currently equal the content accent" and "content token" — if a future milestone ever wants the header to diverge slightly from content color (e.g., a translucent header needs a different alpha than body text), there's no longer a seam to adjust without touching every chrome rule. Keeping `--st-*` as a thin alias layer preserves that seam at near-zero cost.
**Do this instead:** Keep `--st-*` names in `site.css`, just point their values at `var(--accent)` etc. from `palette.css`.

### Anti-Pattern 2: Introducing a build step or CSS preprocessor to manage the palette

**What people do:** Reach for Sass variables, a PostCSS token pipeline, or a JS-based theming library to "properly" manage design tokens once there's a second shared stylesheet.
**Why it's wrong:** Directly contradicts the explicit constraint in `PROJECT.md` ("no build tooling, no frameworks") and the entire reason this project is easy to maintain — every tool still opens by double-clicking the `.html` file. Native CSS custom properties + the cascade already solve this problem completely at this project's scale (8 files, one palette).
**Do this instead:** Plain CSS custom properties in a second static file, loaded via `<link>`, exactly like `site.css` already is.

### Anti-Pattern 3: Letting "tool-local" tokens become a second palette

**What people do:** When a new tool needs "just one more color" for its diagram, hardcode a fresh hex value locally instead of deriving it from `var(--accent)`/`var(--accent-2)`, and this happens repeatedly across the 3 new tools.
**Why it's wrong:** Re-creates exactly the fragmentation this milestone is meant to eliminate, one tool at a time, under the cover of "it's just a tool-local token so the rule doesn't apply." Diagram-specific colors are legitimate (RSA's Bob/Alice/Eve genuinely need to be distinguishable), but they should visually read as *the same family* as the rest of the site.
**Do this instead:** Derive new semantic tokens from the existing `--accent`/`--accent-2` (via `color-mix()`, opacity, or a documented small set of tints) by default. Only add a genuinely new base hue to `palette.css` itself (available to all tools) if a tool has a hard requirement for 3+ simultaneously-visible, clearly-distinct hues (e.g., CRT with several congruences) that the 2-accent base can't satisfy — and treat that as a deliberate, visible addition to the shared file, not a local workaround.

### Anti-Pattern 4 (pre-existing, worth fixing during migration): Inconsistent default-theme convention

**What happens today:** Pizza Slices' unprefixed `:root{}` block holds *day* values with `:root[data-theme="night"]` as the override, while Completing-the-Square, RSA, and Sieve do the opposite (unprefixed block = *night*, `:root[data-theme="day"]` = override). `theme.js`'s inline head script defaults to `'night'` when no `localStorage` preference exists, so pages following the Pizza Slices convention are relying on the explicit `[data-theme="night"]` selector always being present at first paint — it works today, but the inconsistency is a latent trap for whoever edits `:root` by hand next.
**Why it's wrong:** Two different mental models for "which block is the default" across files increases the chance of a copy-paste edit landing in the wrong block and shipping the wrong default theme.
**Do this instead:** During the Phase 1 migration, standardize every file (including the new `palette.css`) on the majority convention already used by 3 of 5 tools and by `site.css` itself: unprefixed `:root{}` = night/default, `:root[data-theme="day"]{}` = explicit override.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `assets/palette.css` ↔ `assets/site.css` | CSS `var()` reference (site.css consumes palette.css's tokens) | Load order matters: `palette.css` `<link>` must precede `site.css` `<link>` in every `<head>` so the cascade resolves `--st-header-accent: var(--accent)` against a value that already exists |
| `assets/palette.css` ↔ each tool's inline `<style>` | CSS `var()` reference (tool consumes palette tokens; never re-declares them) | Tool's inline `<style>` loads last (already true today), so it can still add tool-local tokens without any special ordering concern — it only must *not* redeclare a canonical token name |
| `assets/theme.js` ↔ `[data-theme]` attribute | DOM attribute on `<html>`, read by every `:root[data-theme=...]` CSS block | Unchanged by this milestone; no JS changes required for palette work |
| New tool `.html` ↔ `index.html` hub | Static `<a class="card">` markup added manually | Same manual-edit pattern already documented in `STRUCTURE.md`; not automated, not affected by palette architecture |
| New tool `.html` ↔ other tools' nav markup | Each tool's `<nav class="site-nav">` markup lists all tools; adding a tool means editing this list in all N existing tool files | Pre-existing requirement (per `STRUCTURE.md`), unrelated to palette but relevant to new-tool phase sequencing/checklist |

## Sources

- Direct inspection of this repository: `assets/site.css`, `Pizza Slices/pizza-slices.html`, `Christmas Trees/factor-tree.html`, `Factorize By Completing The Square/factorize-completing-square.html`, `RSA Examplifier/rsa-examplifier.html`, `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` (confidence: HIGH — primary source, current code as of commit `5bb8919`)
- `.planning/codebase/ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md` (confidence: HIGH — recently generated by `/gsd-map-codebase` against the same commit)
- `.planning/PROJECT.md` (confidence: HIGH — states the explicit constraint set and requirement list for this milestone)
- CSS custom properties (`:root`, cascade, `var()`) and `<link rel="stylesheet">` behavior over `file://`: stable, long-standing web platform behavior, not a fast-moving library; no external lookup required, treated as HIGH-confidence general web-standards knowledge

---
*Architecture research for: number-theory browser tools — palette unification + new-tool integration*
*Researched: 2026-09-23*
