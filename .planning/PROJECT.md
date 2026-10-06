# Number Theory & Abstract Algebra Browser Tools

## What This Is

An educational website of interactive, visualization-led browser tools that make number theory, group theory, and abstract algebra intuitive for self-directed math learners. Each tool is one HTML page (no build system, no framework) built on shared JS modules under `assets/`, turning one math concept into a hands-on diagram — a factor tree, a modular-arithmetic wheel, an RSA walkthrough — rather than a wall of text. A shared `index.html` hub and site-wide nav header tie the tools together as one site.

## Core Value

Every concept gets a visualization a self-learner can interact with and immediately understand — the diagram teaches, the text supports it.

## Requirements

### Validated

- ✓ Eight number-theory tools ship as HTML pages (Sieve of Eratosthenes, Factor Tree, Completing-the-Square, Congruence Wheel [with Additive/Multiplicative Groups modes], RSA, Venn Diagrams, Diffie-Hellman Key Exchange, Square and Multiply) plus Shor's Algorithm and the Euclidean Algorithm/GCD tool — ten tools total ship as of this milestone's close
- ✓ Shared site chrome: sticky nav header (`assets/site.css`, `assets/theme.js`) with day/night toggle and a matching inline SVG brand mark (twin of the tab favicon), linking all tools, plus an `index.html` hub — existing
- ✓ All ten tools share one unified color palette/visual identity via `assets/palette.css`'s `--role-*` semantic layer — Phase 1 (Palette Unification)
- ✓ Euclidean Algorithm/GCD tool: validated two-integer input, animated numeric trace with playback controls, geometric rectangle-tiling view with a large-quotient cap, Extended Euclidean/Bézout coefficients toggle, preset pairs, two-way cross-link with Venn Diagrams — Phase 2
- ✓ Every page (hub + all tools) offers a language switcher in the shared site footer and renders all UI text in Dutch, English, German, French, Spanish, Italian, Polish, Brazilian Portuguese, European Portuguese, Swedish, Norwegian Bokmål, Romanian, Hungarian, Latvian, Russian, Greek or Hebrew; the choice persists across pages and sessions (`site-lang`) and syncs across tabs, with English output byte-identical to before — Phase 6 (Multi-Language Support); Italian added 2026-10-02 by quick task 261002-c77, Polish added 2026-10-02 by quick task 261002-fmi, Brazilian and European Portuguese added 2026-10-02 by quick task 261002-jh4, Swedish and Norwegian Bokmål added 2026-10-02 by quick task 261002-s7l, Romanian, Hungarian and Latvian added 2026-10-03 by quick task 261003-0dr, Russian and Greek added 2026-10-03 by quick task 261003-57k, Hebrew added 2026-10-06 by quick task 261006-pks (the first right-to-left script); switcher moved from the header to a shared site footer on 2026-10-03 by quick task 261003-bqz

### Active

- [ ] User can explore the Chinese Remainder Theorem (simultaneous congruences) as an interactive visualization
- [ ] User can explore continued fractions as an interactive visualization
- [ ] `index.html` hub and nav header updated to include the two remaining number-theory tools (CRT, Continued Fractions)
- [ ] **[New milestone]** User can generate and explore a Cayley table (group operation table) for additive and multiplicative groups mod N, as its own tool page that shares the Congruence Wheel's additive/multiplicative-mode and modulus-input interaction pattern and cross-links with it both ways

### Out of Scope

- Group theory / abstract algebra visualizers beyond the Cayley table generator (symmetry groups, cosets, quotient groups, permutation groups) — still explicitly deferred to a future milestone; the Cayley table generator's own milestone (below) is scoped narrowly to Z/NZ additive and multiplicative groups so the broader abstract-algebra visual language can still be designed deliberately later rather than bolted on all at once
- Build system, package manager, or JS framework — plain HTML pages plus classic-script shared modules under `assets/`, zero third-party dependencies, works for this project's scale
- Backend, accounts, or server-side persistence — everything stays client-side (localStorage only), consistent with existing tools

## Context

- Brownfield project: codebase already mapped (`.planning/codebase/`) before this initialization — five tools existed and worked independently before the first milestone; that milestone unified them into one site (shared nav/hub, `.page-header` fix, then a full palette unification) and shipped three additional tools (Venn Diagrams, Diffie-Hellman, Square and Multiply, Shor's Algorithm, and the Euclidean Algorithm/GCD tool — several added ad hoc alongside the roadmapped GCD/CRT/Continued-Fractions phases). Ten tools ship as of this milestone.
- Audience is self-learners exploring math independently (not tied to a specific course), so tools should be approachable without assuming an instructor is present to explain context.
- Explanatory depth varies by tool: some concepts (e.g. RSA) need more surrounding prose to make sense; others are self-evident from the diagram plus a short intro. Decide per-tool rather than forcing a fixed template.
- Repo convention (see root `CLAUDE.md`): number-theory/algebra helper functions (`primeFactors`, `isPrime`, `bigGcd`, `modPowPlain`, `gcd`, `unitsMod`, etc.) live in the shared `assets/nt-*.js` modules on `window.NT`, and every tool imports the ones it needs via `NT.NAME` destructuring.
- **New milestone context (Cayley table generator):** the Congruence Wheel tool already has Additive Groups / Multiplicative Groups tab modes over Z/NZ, computing the unit set (elements coprime to N) for multiplicative mode via a `unitsMod`-style helper and driving both modes through one shared `MODES` config (element list, operation, identity, wording). The Cayley table generator is a natural sibling: same underlying group data (Z/NZ under addition, (Z/NZ)ˣ under multiplication), different visualization (an N×N operation-table grid instead of a wheel of wedges). Ship it as its own tool page per repo convention, echoing the Congruence Wheel's mode-toggle and modulus-input interaction pattern and sharing its unit-set math through `NT.core`, and cross-link the two tools both ways the way the GCD tool now cross-links with Venn Diagrams.

## Constraints

- **Tech stack**: Vanilla HTML/CSS/JS only, no build tooling, no frameworks — matches every existing tool and keeps each page runnable by opening the file directly.
- **Architecture**: One top-level directory and one `.html` page per tool. Shared code lives in `assets/` — site chrome (`palette.css`, `site.css`, `theme.js`) and the seven `nt-*.js` logic modules on `window.NT` (`nt-core.js`, `nt-bigint.js`, `nt-svg.js`, `nt-store.js`, `nt-layout.js`, `nt-i18n.js`, `nt-picker.js`), plus `assets/i18n/` (translation-data files only, one per namespace). A tool's own rendering, state and playback live in its page; a helper shared across tools lives in the matching module.
- **External resources**: Only Google Fonts via `<link>` — no other CDN or third-party JS dependency, per existing convention.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fix `.page-header` CSS scoping before anything else | Bare `header{}` selectors in per-tool `<style>` blocks were leaking onto the shared `<header class="site-header">` nav bar, most severely in Pizza Slices (constrained the sticky nav to a 68ch column) | ✓ Good — fixed and verified visually across all 5 pages |
| Ship current state as v1.0 | First cohesive version of the site: shared nav, hub page, day/night toggle, consistent headers | ✓ Good — committed |
| Defer group theory / abstract algebra to v2 | Needs its own visual vocabulary (Cayley tables, symmetry groups, cosets) distinct from number-theory diagrams; better designed deliberately in its own milestone than rushed alongside number-theory polish | ✓ Good — Cayley table generator now scoped as its own narrow milestone (2026-09-27); symmetry groups/cosets/quotient/permutation groups remain deferred |
| Unify visual identity to one site-wide palette (not just shared design tokens) | User explicitly chose full palette unification over keeping each tool's distinct theming | ✓ Good — shipped in Phase 1, in continuous use across every tool added since |
| Scope the Cayley table generator milestone narrowly (Z/NZ additive/multiplicative groups only, not the full abstract-algebra bundle) | User explicitly chose the narrow scope over opening the door to symmetry/permutation groups, cosets, and quotient groups in the same milestone | — Pending |
| Cayley table generator ships as its own tool page, sharing the unit-set math and the group-params setting with the Equivalence Wheel through `NT.core` and `NT.store`, cross-linked both ways | User said "both" when asked separate-vs-paired — read as: its own page per repo convention, but designed as a close visual/interaction sibling with a cross-link, not a merged third tab inside the Equivalence Wheel | — Pending |
| Shared number-theory, BigInt, SVG, shared-state and layout helpers live in `assets/nt-*.js` classic-script modules on one `window.NT` namespace | One implementation per helper; classic scripts keep every page runnable from `file://` | ✓ Phase 7 |
| Cross-tab live sync reads the storage event's `newValue`; ordinary reads stay cookie-first | Cookie-first reads are needed for Firefox, where each `file://` page is its own origin, but inside a `storage` handler the cookie can lag the event and silently drop the update | ✓ Phase 7 (found and fixed during UAT; 40/40 rapid updates arrive) |
| All sixteen pages ship in seventeen languages (nl/en/de/fr/es/it/pl/pt-BR/pt-PT/sv/nb/ro/hu/lv/ru/el/he) via a sixth shared module, `assets/nt-i18n.js` (`NT.i18n`), with translation data in `assets/i18n/` and the language preference persisted under its own `site-lang` key (cookie + localStorage, mirroring `site-theme`'s pattern exactly rather than coupling to `theme.js` or `NT.store`) | A site-wide preference needs the same three-channel (URL param, cookie, localStorage) durability `site-theme` already has, proven across `file://` origins in Phase 7's UAT; a dedicated key keeps the language choice independent of the theme toggle and of `NT.store`'s sibling-pair tool-settings scope | ✓ Phase 6; Italian added 2026-10-02 by quick task 261002-c77, Polish added 2026-10-02 by quick task 261002-fmi, Brazilian and European Portuguese added 2026-10-02 by quick task 261002-jh4, Swedish and Norwegian Bokmål added 2026-10-02 by quick task 261002-s7l, Romanian, Hungarian and Latvian added 2026-10-03 by quick task 261003-0dr, Russian and Greek added 2026-10-03 by quick task 261003-57k, Hebrew added 2026-10-06 by quick task 261006-pks |

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
*Last updated: 2026-10-06 after quick task 261006-pks (Hebrew added as the seventeenth supported language, the first right-to-left script)*
