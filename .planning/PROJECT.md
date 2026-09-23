# Number Theory & Abstract Algebra Browser Tools

## What This Is

An educational website of interactive, visualization-led browser tools that make number theory, group theory, and abstract algebra intuitive for self-directed math learners. Each tool is a single self-contained HTML page (no build system, no framework) that turns one math concept into a hands-on diagram — a factor tree, a modular-arithmetic wheel, an RSA walkthrough — rather than a wall of text. A shared `index.html` hub and site-wide nav header tie the tools together as one site.

## Core Value

Every concept gets a visualization a self-learner can interact with and immediately understand — the diagram teaches, the text supports it.

## Requirements

### Validated

- ✓ Five number-theory tools ship as self-contained HTML pages (factor tree, completing-the-square factorization, modular-arithmetic "Congruence Wheel", RSA walkthrough, Sieve of Eratosthenes) — existing
- ✓ Shared site chrome: sticky nav header (`assets/site.css`, `assets/theme.js`) with day/night toggle, linking all tools, plus an `index.html` hub — existing (v1.0, this session)
- ✓ Per-page title header structurally and visually consistent across all tools (`.page-header`, scoped so page-local CSS can no longer leak onto the shared nav) — v1.0, this session

### Active

- [ ] User can explore the Euclidean algorithm / GCD computation as an interactive visualization
- [ ] User can explore the Chinese Remainder Theorem (simultaneous congruences) as an interactive visualization
- [ ] User can explore continued fractions as an interactive visualization
- [ ] All eight tools (five existing + three new) share one unified color palette/visual identity, not per-tool distinct schemes
- [ ] Each new tool follows the established architecture: one top-level directory, one self-contained `.html` file, inline `<style>`/`<script>`, no external JS dependency beyond Google Fonts
- [ ] `index.html` hub and nav header updated to include the three new tools

### Out of Scope

- Group theory / abstract algebra visualizers (Cayley tables, symmetry groups, cosets, quotient groups, permutation groups) — explicitly deferred to a future milestone; this milestone is number-theory-only, so the visual language for algebraic-structure diagrams can be designed deliberately rather than bolted on
- Build system, package manager, or JS framework — the zero-dependency single-file-per-tool pattern is intentional and works for this project's scale
- Backend, accounts, or server-side persistence — everything stays client-side (localStorage only), consistent with existing tools

## Context

- Brownfield project: codebase already mapped (`.planning/codebase/`) before this initialization — five tools existed and worked independently before this milestone; this session unified them into one site (shared nav/hub, `.page-header` fix) and defined what comes next.
- Audience is self-learners exploring math independently (not tied to a specific course), so tools should be approachable without assuming an instructor is present to explain context.
- Explanatory depth varies by tool: some concepts (e.g. RSA) need more surrounding prose to make sense; others are self-evident from the diagram plus a short intro. Decide per-tool rather than forcing a fixed template.
- Each existing tool currently has its own hand-picked color palette (Christmas green/gold, RSA blue/pink/red for Bob/Alice/Eve, sieve teal, etc.) defined via per-file CSS custom properties — the "unify visual identity" requirement means replacing these with one consistent site-wide palette, which is a bigger visual change than the nav-header fix already done.
- Repo convention (see root `CLAUDE.md`): number-theory helper functions (`primeFactors`, `isPrime`, `bigGcd`, `modPowPlain`, etc.) are duplicated per-file intentionally, not extracted into a shared module — new tools should follow this same duplication pattern for their own math helpers.

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS only, no build tooling, no frameworks — matches every existing tool and keeps each page runnable by opening the file directly.
- **Architecture**: One top-level directory per tool, one self-contained `.html` file — new tools must match this, not introduce shared JS/CSS modules for logic (shared site chrome in `assets/` is the one intentional exception, already established).
- **External resources**: Only Google Fonts via `<link>` — no other CDN or third-party JS dependency, per existing convention.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fix `.page-header` CSS scoping before anything else | Bare `header{}` selectors in per-tool `<style>` blocks were leaking onto the shared `<header class="site-header">` nav bar, most severely in Pizza Slices (constrained the sticky nav to a 68ch column) | ✓ Good — fixed and verified visually across all 5 pages |
| Ship current state as v1.0 | First cohesive version of the site: shared nav, hub page, day/night toggle, consistent headers | ✓ Good — committed |
| Defer group theory / abstract algebra to v2 | Needs its own visual vocabulary (Cayley tables, symmetry groups, cosets) distinct from number-theory diagrams; better designed deliberately in its own milestone than rushed alongside number-theory polish | — Pending |
| Unify visual identity to one site-wide palette (not just shared design tokens) | User explicitly chose full palette unification over keeping each tool's distinct theming | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-23 after initialization*
