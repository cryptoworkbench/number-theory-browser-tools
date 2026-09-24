# Roadmap: Number Theory & Abstract Algebra Browser Tools

## Overview

Five number-theory tools already ship as a unified site (shared nav, hub, day/night toggle). This
milestone closes out the number-theory scope: first unify all eight tools (five existing + three
new) under one literal color palette so every new tool is authored once against the final shared
pattern, then ship three new self-contained visualizers — Euclidean Algorithm/GCD, Chinese
Remainder Theorem, and Continued Fractions — in the order that lets each build on the visual
grammar and math logic the previous one established. Each phase ships one independently-working
piece end-to-end, matching this project's existing pattern of independently-functioning tools.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Palette Unification** - Unify all eight tools under one shared color palette with day/night theming preserved
- [ ] **Phase 2: Euclidean Algorithm / GCD Tool** - Ship an animated GCD/Euclidean-algorithm visualizer with a geometric rectangle-tiling view and Extended Euclidean mode
- [ ] **Phase 3: Chinese Remainder Theorem Tool** - Ship an interactive CRT visualizer with coprimality validation, residue-class visuals, and a GCD cross-link
- [ ] **Phase 4: Continued Fractions Tool** - Ship a continued-fractions visualizer sharing GCD's rectangle-tiling geometry, with nav updated across all eight tools

## Phase Details

### Phase 1: Palette Unification

**Goal**: All eight tools (five existing, three to come) render with one unified color palette and consistent day/night theme, with pedagogically meaningful role colors preserved.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: PAL-01, PAL-02, PAL-03, PAL-04
**Success Criteria** (what must be TRUE):

  1. Every existing tool visually renders with the same palette tokens (background, text, accent, border) — no tool retains a bespoke, distinct color scheme
  2. Palette tokens live in one centralized file (`assets/palette.css`) that every tool's `<style>` block consumes via `var()`, rather than redeclaring its own colors
  3. Toggling day/night mode re-themes every tool correctly using the unified tokens
  4. Role-specific colors (e.g., RSA's Bob/Alice/Eve, Sieve's prime/composite) still convey the same meaning after unification, derived from the shared palette rather than hardcoded per tool

**Plans**: 5/5 plans executed + 1 gap-closure plan

Plans:

- [x] 01-01-PLAN.md — Create `assets/palette.css`, prove it end-to-end on the Sieve, derive the shared nav chrome from it (wave 1, tracer)
- [x] 01-02-PLAN.md — Unify the factor tree: chrome, diagram role colors, and fairy-light colors moved out of JS (wave 2)
- [x] 01-03-PLAN.md — Unify RSA: surfaces plus Bob/Alice/Eve/discrete-log role mapping, fixing the day-mode black washes (wave 2)
- [x] 01-04-PLAN.md — Unify the Congruence Wheel, the completing-the-square tool and the `index.html` hub (wave 2)
- [x] 01-05-PLAN.md — Repo-wide palette audit, record the convention for the three tools to come, developer sign-off (wave 3)
- [ ] 01-06-PLAN.md — Gap closure: un-inset the shared nav header on 4 pages (G-01-1a), add a window.name persistence fallback for theme selection (G-01-1b) (wave 1)

**UI hint**: yes

### Phase 2: Euclidean Algorithm / GCD Tool

**Goal**: Users can explore the Euclidean algorithm and GCD computation through an animated, interactive visualization with both a numeric trace and a geometric view, shipped as a new self-contained tool.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: GCD-01, GCD-02, GCD-03, GCD-04, GCD-05, GCD-06, NAV-02
**Success Criteria** (what must be TRUE):

  1. User can input two integers via a validated form and pick from preset example pairs (coprime pair, one-is-multiple-of-other, equal pair)
  2. User can play/pause/step/instant-finish through an animated `(a,b) → (b, a mod b)` step trace, ending with the final GCD clearly highlighted
  3. User can view a geometric rectangle-tiling visualization alongside the numeric trace, with large-quotient inputs capped so the diagram stays readable
  4. User can toggle an Extended Euclidean/Bézout coefficients mode showing `s, t` such that `gcd(a,b) = sa + tb`
  5. The tool ships as a single self-contained HTML file in its own top-level directory, following the established architecture (inline `<style>`/`<script>`, no external JS dependency beyond Google Fonts)

**Plans**: TBD
**UI hint**: yes

### Phase 3: Chinese Remainder Theorem Tool

**Goal**: Users can explore the Chinese Remainder Theorem (simultaneous congruences) through an interactive interface that visualizes residue-class intersections and safely handles non-coprime moduli, with a path back to the GCD tool.
**Mode:** mvp
**Depends on**: Phase 1, Phase 2
**Requirements**: CRT-01, CRT-02, CRT-03, CRT-04, CRT-05, CRT-06, CRT-07, CRT-08
**Success Criteria** (what must be TRUE):

  1. User can input two or three congruences of the form `x ≡ a (mod m)` and toggle between 2 and 3 simultaneous congruences
  2. User receives a clear validation warning when the moduli are not pairwise coprime, rather than a silently wrong answer
  3. User sees a visual representation of each modulus's residue class, with the simultaneous solution shown as their intersection
  4. User can watch an animated brute-force scan land on the simultaneous solution, then reveal an Extended-Euclidean-based construction method as a faster alternative
  5. User can pick preset examples (including a classic "remainders riddle") and navigate from the CRT tool to the GCD tool's modular-inverse step

**Plans**: TBD
**UI hint**: yes

### Phase 4: Continued Fractions Tool

**Goal**: Users can explore continued fractions through an animated rectangle-tiling visualization that echoes the GCD tool's visual grammar, with a synced convergents table, and the site navigation reflects all eight completed tools.
**Mode:** mvp
**Depends on**: Phase 1, Phase 2
**Requirements**: CF-01, CF-02, CF-03, CF-04, CF-05, CF-06, CF-07, CF-08, NAV-01
**Success Criteria** (what must be TRUE):

  1. User can input a fraction/rational number and see its continued-fraction expansion `[a0; a1, a2, ...]`
  2. User can watch an animated square-filling-rectangle visualization of the expansion and adjust a terms slider that redraws both the diagram and the convergents table
  3. User sees a convergents table (`p_k/q_k`, decimal value, approximation error) kept in sync with the animation
  4. User can pick preset chips including the golden ratio φ and a rational approximation (22/7), with a golden-spiral callout shown for φ or Fibonacci-pair-ratio inputs
  5. User can navigate from the Continued Fractions tool to the GCD tool, and every tool's shared nav header plus the `index.html` hub lists all eight tools with the current one marked active

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Palette Unification | 5/5 | In Progress|  |
| 2. Euclidean Algorithm / GCD Tool | 0/? | Not started | - |
| 3. Chinese Remainder Theorem Tool | 0/? | Not started | - |
| 4. Continued Fractions Tool | 0/? | Not started | - |
