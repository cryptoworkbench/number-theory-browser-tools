# Roadmap: Number Theory & Abstract Algebra Browser Tools

## Overview

Five number-theory tools already ship as a unified site (shared nav, hub, day/night toggle). This
milestone closes out the number-theory scope: first unify all eight tools (five existing + three
new) under one literal color palette so every new tool is authored once against the final shared
pattern, then ship three new self-contained visualizers — Euclidean Algorithm/GCD, Chinese
Remainder Theorem, and Continued Fractions — in the order that lets each build on the visual
grammar and math logic the previous one established. Each phase ships one independently-working
piece end-to-end, matching this project's existing pattern of independently-functioning tools.

**Appended milestone (2026-09-27) — Cayley Table Generator:** Phase 5 belongs to a separate,
narrowly-scoped milestone (see PROJECT.md) and is appended rather than interleaved. It adds one
new tool — a Cayley (group operation) table generator for ℤ/Nℤ under addition and (ℤ/Nℤ)ˣ under
multiplication — as the site's first, deliberately narrow step into group theory. It depends only
on Phase 1's shared palette, so it can be planned and executed independently of the still-pending
Phase 3 and Phase 4 number-theory work.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Palette Unification** - Unify all eight tools under one shared color palette with day/night theming preserved
- [x] **Phase 2: Euclidean Algorithm / GCD Tool** - Ship an animated GCD/Euclidean-algorithm visualizer with a geometric rectangle-tiling view and Extended Euclidean mode
- [x] **Phase 3: Chinese Remainder Theorem Tool** - Ship an interactive CRT visualizer with coprimality validation, residue-class visuals, and a GCD cross-link
- [ ] **Phase 4: Continued Fractions Tool** - Ship a continued-fractions visualizer sharing GCD's rectangle-tiling geometry, with nav updated across all eight tools
- [x] **Phase 5: Cayley Table Generator** - Ship a standalone Cayley (group operation) table generator for additive and multiplicative groups mod N, cross-linked with the Congruence Wheel

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

**Plans**: 6/6 plans executed + 1 gap-closure plan

Plans:

- [x] 01-01-PLAN.md — Create `assets/palette.css`, prove it end-to-end on the Sieve, derive the shared nav chrome from it (wave 1, tracer)
- [x] 01-02-PLAN.md — Unify the factor tree: chrome, diagram role colors, and fairy-light colors moved out of JS (wave 2)
- [x] 01-03-PLAN.md — Unify RSA: surfaces plus Bob/Alice/Eve/discrete-log role mapping, fixing the day-mode black washes (wave 2)
- [x] 01-04-PLAN.md — Unify the Congruence Wheel, the completing-the-square tool and the `index.html` hub (wave 2)
- [x] 01-05-PLAN.md — Repo-wide palette audit, record the convention for the three tools to come, developer sign-off (wave 3)
- [x] 01-06-PLAN.md — Gap closure: un-inset the shared nav header on 4 pages (G-01-1a), add a window.name persistence fallback for theme selection (G-01-1b) (wave 1)

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

**Plans**: 4/4 plans executed

Plans:

- [x] 02-01-PLAN.md — Tracer: the new page end-to-end (validated input, `euclidSteps`, playback, growing division-algorithm chain, highlighted GCD) plus eleven-page nav and hub registration (wave 1)
- [x] 02-02-PLAN.md — Seven preset chips including the `gcd(a, 0)` immediate-termination case, and the two-way Venn Diagrams cross-link (wave 2)
- [x] 02-03-PLAN.md — Geometric rectangle-tiling view with the 40-square cap and labelled excess tile, bound to the chain's current step (wave 3)
- [x] 02-04-PLAN.md — Extended Euclidean toggle: `s`/`t` columns on the same trace plus the closing Bézout identity, and the phase-wide sweep (wave 4)

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

**Plans**: 3/3 plans executed and verified — the consolidated phase-wide sweep (03-03 Task 3), re-run in a follow-up session after the earlier tooling failure cleared, is green: all static/color/nav/collateral/render gates from all three plans, the receiving-end and behavioral harnesses, the one-answer-everywhere check across five systems, the eight-requirement walk, and the no-regression check all pass — see 03-03-SUMMARY.md

Plans:
**Wave 1**
- [x] 03-01-PLAN.md — Tracer: the new page end-to-end (validated congruence fields, pairwise-coprimality gate, span guard, shared-scroll residue strips with the `all agree` row, one authoritative `solveCrt`, generation-guarded scan, Sun Tzu riddle chip) plus thirteen-page nav and hub registration (wave 1)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 03-02-PLAN.md — The two-versus-three congruence control with its idempotency and mid-scan guarantees, and the remaining two preset chips including the shares-a-factor case that makes the CRT-02 warning discoverable (wave 2)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 03-03-PLAN.md — The Extended-Euclidean construction reveal rendered from the same solver record, the one-directional deep link into the Euclidean Algorithm tool's Bézout step via a new `ext` load param, and the phase-wide consolidated sweep (Task 3, completed in a follow-up session) (wave 3)

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

### Phase 5: Cayley Table Generator

**Goal**: Users can generate and explore a group operation table (Cayley table) for ℤ/Nℤ under addition and (ℤ/Nℤ)ˣ under multiplication, shipped as a new self-contained tool that reads as a close visual/interaction sibling of the Congruence Wheel and uses the table's own structure — identity row/column, diagonal symmetry, self-inverse cells — to teach group properties.
**Mode:** mvp
**Depends on**: Phase 1 (shared palette tokens only — independent of Phase 3 and Phase 4, which belong to the number-theory milestone thread)
**Requirements**: CAYLEY-01, CAYLEY-02, CAYLEY-03, CAYLEY-04, CAYLEY-05, CAYLEY-06, CAYLEY-07, NAV-03
**Success Criteria** (what must be TRUE):

  1. User can set a modulus N via a validated input and toggle between Additive Group (ℤ/Nℤ — all N elements under `+`) and Multiplicative Group ((ℤ/Nℤ)ˣ — the φ(N) units under `·`) modes, with the operation table redrawing for that mode's own element list and operation, echoing the Congruence Wheel's existing mode-toggle and modulus-input interaction pattern
  2. User can click any table cell to see the underlying equation spelled out (e.g. `3 + 5 = 8 ≡ 2 (mod 6)`) with that cell's row and column headers simultaneously highlighted
  3. User can see the identity element's row and column visually distinguished from the rest of the table, and the self-inverse elements (diagonal cells whose value equals the identity) visually highlighted — in both modes
  4. User can see the table's diagonal symmetry made visible as a commutativity teaching point, with mirrored cell pairs across the main diagonal readable as such in the diagram rather than merely asserted in prose
  5. User can navigate between the Cayley Table Generator and the Congruence Wheel in both directions, and the tool ships as one self-contained HTML file in its own top-level directory, registered in `index.html` and every page's shared nav header so all eleven tools are listed with the current one marked active

**Plans**: 3/3 plans executed

Plans:

- [x] 05-01-PLAN.md — Tracer: the new page end-to-end (validated modulus, duplicated `MODES`/`unitsMod`/`gcd`, semantic `<table>` in a scrolling container with sticky headers, click-and-keyboard cell selection lighting row/column/cell, equation caption) plus twelve-page nav and hub registration (wave 1)
- [x] 05-02-PLAN.md — The teaching states: identity row/column with a selection-surviving edge bar, self-inverse rings, the diagonal drawn as an axis of symmetry, mirror-twin echo with both equations, and a four-channel legend (wave 2)
- [x] 05-03-PLAN.md — D-02's shrink-then-scroll sizing keyed to the mode's element count with a measured ceiling, the two-way Congruence Wheel cross-link, and the phase-wide sweep (wave 3)

**UI hint**: yes

## Progress

**Execution Order:**
Phases 1 → 2 → 3 → 4 run in numeric order (number-theory milestone). Phase 5 belongs to the
appended Cayley Table Generator milestone and depends only on Phase 1, so it may be planned and
executed at any point after Phase 1 — before, after, or alongside Phases 3 and 4.

**Remaining order (set 2026-09-30):** Phase 7 (Shared JS Module Refactor) runs next, then Phase 4, then Phase 6 — so the new tool and the i18n work both build on the shared-module layout.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Palette Unification | 6/6 | Complete | 2026-09-27 |
| 2. Euclidean Algorithm / GCD Tool | 4/4 | Complete | 2026-09-27 |
| 3. Chinese Remainder Theorem Tool | 3/3 | Complete | 2026-09-29 |
| 4. Continued Fractions Tool | 0/? | Not started | - |
| 5. Cayley Table Generator | 3/3 | Complete | 2026-09-28 |
| 5. Cayley Table Generator | 3/3 | In Progress|  |

### Phase 6: Multi-Language Support

**Goal:** Every page on the site (the `index.html` hub and every tool page) offers a language switcher and renders its UI strings in the user's chosen language, supporting Dutch, English, German, French, and Spanish.
**Mode:** mvp
**Depends on:** Phase 1 (shared nav/site chrome only — independent of Phase 4's and Phase 5's tool-specific content)
**Requirements**: TBD
**Success Criteria** (what must be TRUE):

  1. Every page (hub + every tool) exposes a language switcher control in the shared site chrome
  2. Switching language re-renders that page's UI strings (labels, buttons, headings, instructional copy) in the selected language without a full page reload where feasible
  3. All five languages (Dutch, English, German, French, Spanish) are fully translated for every page — no untranslated fallback strings in shipped languages
  4. The selected language persists across navigation between pages and across browser sessions
  5. Day/night theming and existing tool functionality are unaffected by the language switch

**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 6 to break down)

### Phase 7: Shared JS Module Refactor

**Goal:** Extract the helpers duplicated across all 15 tools (svgEl, gcd, clamp, isPrime/isPrimeBig, modPowPlain/modPowSmall, bigGcd, modInverse, totient, primeFactors, etc.) into clean shared classic-script modules under `assets/`, attached to a single global namespace (no ES `import`, so every page still runs over `file://`). Reconcile drifted variants (Number vs BigInt, abs/no-abs) per call site. Rewrite the current docs (CLAUDE.md, .claude/CLAUDE.md, .planning/PROJECT.md, .planning/codebase/*) to present shared modules as the normal architecture; git history and archived phase/quick records stay untouched.
**Success criteria:** every tool loads its shared modules and no longer defines local copies of extracted helpers; zero behavior regressions, verified per tool in a browser; local /code-review clean (user then runs /code-review ultra).
**Requirements**: TBD
**Depends on:** None (touches every tool page — do not run concurrently with Phase 4/6 tool edits)
**Plans:** 3/9 plans executed

Plans:
**Wave 1**
- [x] 07-01-PLAN.md — Tracer: `assets/nt-core.js` (window.NT.core) proven end-to-end on the CRT tool, plus the dev-only verification toolchain (parity harness, shadow-check, headless BASE-vs-new browser differential); complete NT.core and move Euler's Totient onto it

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 07-02-PLAN.md — `assets/nt-svg.js` (centre-explicit polar geometry, svgEl, easing); Fermat's Method, Shor's Algorithm, ECDH migrated (renamed near-duplicates retired)
- [x] 07-03-PLAN.md — `assets/nt-bigint.js` + RSA; `assets/nt-store.js` (shared group/a-b settings, deep-link readers, legacy keys) + Cayley Table

**Wave 3** *(blocked on Wave 2 completion)*
- [ ] 07-04-PLAN.md — Diffie-Hellman and Square and Multiply onto NT.bigint + NT.svg
- [ ] 07-05-PLAN.md — Equivalence Wheel and Group Isomorphism onto NT.core + NT.svg (+ NT.store), centre-explicit wheel geometry
- [ ] 07-06-PLAN.md — `assets/nt-layout.js` (nested-squares layout, factor-tree builder) + Euclidean Algorithm and Factor Tree

**Wave 4** *(blocked on Wave 3 completion)*
- [ ] 07-07-PLAN.md — Venn Diagram onto all four modules, its ported nested-squares and balanced-tree previews unified with NT.layout
- [ ] 07-08-PLAN.md — Rewrite CLAUDE.md, .claude/CLAUDE.md, PROJECT.md and .planning/codebase/*.md for the shared-module architecture

**Wave 5** *(blocked on Wave 4 completion)*
- [ ] 07-09-PLAN.md — Phase sweep: all gates across 15 tools + hub, Claude-in-Chrome per-tool pass, local code review and fixes (user then runs /code-review ultra)
