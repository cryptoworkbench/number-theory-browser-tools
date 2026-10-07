---
last_mapped_commit: 5bb8919024dcaaee469701a9086df5dc814ba501
last_mapped_at: 2026-09-23
---
# Codebase Structure

**Analysis Date:** 2026-09-23

## Directory Layout

```
number-theory-browser-tools/
├── .planning/
│   └── codebase/                    # Planning documents (created by /gsd-map-codebase)
│       ├── ARCHITECTURE.md
│       ├── STRUCTURE.md
│       ├── CONVENTIONS.md
│       ├── TESTING.md
│       ├── STACK.md
│       ├── INTEGRATIONS.md
│       └── CONCERNS.md
├── assets/                          # Shared site infrastructure and JS logic modules
│   ├── site.css                     # Header, nav, theme toggle styling
│   ├── theme.js                     # Day/night theme persistence and switching
│   ├── nt-core.js                   # NT.core — plain-Number number theory
│   ├── nt-bigint.js                 # NT.bigint — BigInt-domain number theory
│   ├── nt-svg.js                    # NT.svg — SVG element/geometry helpers
│   ├── nt-store.js                  # NT.store — cross-tool shared-state persistence
│   ├── nt-layout.js                 # NT.layout — shared diagram layouts (needs nt-core.js)
│   ├── nt-i18n.js                   # NT.i18n — the sixth shared module: multi-language translation engine
│   ├── nt-picker.js                 # NT.picker — the seventh shared module: shared-palette prime-picker popover (needs nt-bigint, nt-store, nt-i18n)
│   └── i18n/                        # Translation-data files: site.js (site/common namespaces), hub.js, <page-slug>.js x 14
├── Factor Tree/
│   ├── factor-tree.html             # Prime factorization tree visualizer
│   └── example_prime_factorization   # Example/documentation file (unused in app)
├── Fermats Method/
│   ├── fermats-method.html          # Fermat's factoring method viz
│   └── CLAUDE_RESUME_COMMAND        # Session residue (leave as-is)
├── Congruence Wheel/
│   ├── congruence-wheel.html        # Congruence wheel (modular arithmetic)
│   └── CLAUDE_RESUME_COMMAND        # Session residue (leave as-is)
├── RSA/
│   ├── rsa.html                     # RSA key generation + encryption demo
│   └── CLAUDE_RESUME_COMMAND        # Session residue (leave as-is)
├── Sieve Of Eratosthenes/
│   ├── sieve-of-eratosthenes.html   # Prime sieve with playback controls
│   └── RESUME_CLAUDES_CHAT          # Session residue (leave as-is)
├── CLAUDE.md                        # Project guidelines for Claude Code
├── README.md                        # Project description (minimal)
└── index.html                       # Portal page: links to all tools

Total: 5 tools (one HTML file each) + 1 portal + 7 shared asset files
```

## Directory Purposes

**Root Directory (`./`):**

- Purpose: Main entry point and project root
- Contains: Portal page (`index.html`), project documentation (CLAUDE.md, README.md), tool directories
- Key files: `index.html` (landing page), `CLAUDE.md` (project guidelines)

**`assets/`:**

- Purpose: Shared CSS and JavaScript for site infrastructure (header, nav, theme toggle, site footer with the language switcher) and shared JS logic used across tools
- Contains: Styling rules for all pages, theme persistence logic, the seven `nt-*.js` shared logic modules on `window.NT`, and the `i18n/` translation-data directory
- Key files: `site.css` (layout + styling), `theme.js` (day/night mode), `nt-core.js`, `nt-bigint.js`, `nt-svg.js`, `nt-store.js`, `nt-layout.js`, `nt-i18n.js`, `nt-picker.js` (shared number theory, BigInt, SVG, shared-state, layout, multi-language-translation and prime-picker helpers); `i18n/site.js` (shared `site`/`common` namespaces) and `i18n/<page-slug>.js` (one per tool, `i18n/hub.js` for `index.html`) hold translation data only
- Not committed to: Individual tool styling (each tool has inline `<style>`)

**`Factor Tree/`:**

- Purpose: Prime factorization tree visualizer
- Contains: Single HTML file with all logic, styling, and markup
- Key files: `factor-tree.html`
- Concept: User enters a number, sees animated tree where internal nodes branch down to prime leaf nodes

**`Fermats Method/`:**

- Purpose: Fermat's factoring method — searches for a² − N = b² and turns the algebra into a picture
- Contains: Single HTML file with animation controls
- Key files: `fermats-method.html`
- Concept: User enters a target number N, solver searches for a² − N = b², animates the algebra and geometry

**`Congruence Wheel/`:**

- Purpose: Congruence wheel (modular arithmetic visualizer)
- Contains: Single HTML file with polar-coordinate SVG rendering
- Key files: `congruence-wheel.html`
- Concept: User sets modulus N, sees natural numbers arranged as concentric rings partitioned into wedges (residue classes)

**`RSA/`:**

- Purpose: Step-by-step RSA key generation, encryption, and cryptanalysis
- Contains: Single HTML file with multi-panel layout for Bob/Alice/Eve narrative
- Key files: `rsa.html`
- Concept: User supplies primes for Bob and Alice, system derives keys, shows Eve's captured public keys and failed attack

**`Sieve Of Eratosthenes/`:**

- Purpose: Animated prime sieve with playback controls and audio feedback
- Contains: Single HTML file with animation state machine
- Key files: `sieve-of-eratosthenes.html`
- Concept: Grid of natural numbers, algorithm progressively marks multiples, user can play/pause/step/fast-forward

**`.planning/codebase/`:**

- Purpose: Architecture and quality documentation (created by GSD tools)
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md
- Auto-generated by `/gsd-map-codebase` skill (do not manually edit)

## Key File Locations

**Entry Points:**

- `index.html` — Portal/landing page (main URL on page load)
- `Factor Tree/factor-tree.html` — Factor tree tool (opened from portal)
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` — Sieve tool
- `Congruence Wheel/congruence-wheel.html` — Congruence wheel tool
- `Fermats Method/fermats-method.html` — Fermat's Method tool
- `RSA/rsa.html` — RSA tool

**Configuration:**

- `CLAUDE.md` — Project guidelines and architectural philosophy for Claude Code
- `README.md` — Basic project description

**Core Logic (Math Functions):**

- Number-theory functions come from `assets/nt-core.js` (`NT.core`) and `assets/nt-bigint.js` (`NT.bigint`); each `[tool].html` imports only what it needs via its import block
  - `primeFactors(n)` — Recursive factorization — `NT.core`
  - `isPrime(n)` — Primality test — `NT.core`
  - `modPowPlain(base, exp, mod)` — Modular exponentiation — `NT.bigint`
  - `bigGcd(a, b)` — Extended Euclidean algorithm — `NT.bigint`
  - `smallestPrimeFactor(n)` — Greedy factorization — `NT.core`

**Styling (Shared):**

- `assets/site.css` — Header, nav, theme switch, site footer (a sticky footer, flush with the bottom of the page and of the viewport) and language switch styling (loaded by every page)

**Styling (Tool-Specific):**

- Inline `<style>` block in each `[tool].html` — Tool-specific colors, animations, layouts
- Day/night theme via CSS custom properties (`:root[data-theme="day"]`, `:root[data-theme="night"]`)

**SVG & Rendering:**

- Inline `<script>` block in each `[tool].html` imports shared helpers (including `svgEl`) from `NT.svg`/`NT.layout` via its import block, and defines only:
  - `render()` or `draw()` — Rebuild visualization from state
  - Tool-specific geometry helpers not already covered by an `NT` import

**Testing:**

- No test files present (no test suite, per CLAUDE.md)
- Verification: Manual browser testing only

## Naming Conventions

**Files:**

- Tool HTML: kebab-case, descriptive name ending in `-[tool-name].html` (e.g., `sieve-of-eratosthenes.html`)
- Directories: Title Case with spaces (e.g., `Congruence Wheel`, `Factor Tree`)
  - Rationale: User-facing tool names for discovery; spaces OK because each tool lives in its own folder
- Assets: lowercase, descriptive name (e.g., `site.css`, `theme.js`)

**Functions & Variables:**

- Pure math functions: camelCase (e.g., `primeFactors`, `modPow`, `bigGcd`, `isPrime`)
- State variables: camelCase (e.g., `state`, `N`, `depth`, `selected`)
- DOM element IDs: kebab-case (e.g., `#n-range`, `#theme-switch-input`, `#bob-gen-btn`)
- CSS classes: kebab-case or BEM-lite (e.g., `.wedge`, `.wedge-hit`, `.is-selected`, `.error-box`)
- Event handlers: descriptive, often prefixed with handler context (e.g., `nRange.addEventListener`, `input.addEventListener`)

**CSS Custom Properties (Variables):**

- Prefix with `--` (standard CSS)
- Descriptive, lowercase with hyphens (e.g., `--bg`, `--ink`, `--accent`, `--panel`, `--text-dim`)
- Tool-scoped for tool-specific colors (e.g., `:root { --pine-1, --gold }` in factor-tree.html for Christmas theme)
- Shared prefix for site chrome: `--st-` (e.g., `--st-header-bg`, `--st-active-bg`)

**DOM IDs:**

- Input elements: descriptive + `-[input-type]` (e.g., `#n-range` for N modulus input, `#bob-p` for Bob's prime p)
- Buttons: descriptive + `-btn` (e.g., `#bob-gen-btn`, `#play-btn`)
- Containers: descriptive + purpose (e.g., `#wheel-dynamic` for animated wheel group, `#slice-caption` for output caption)
- Error/status areas: `-error`, `-status` suffix (e.g., `#bob-error`)

## Where to Add New Code

**New Tool (e.g., "Quadratic Residues Visualizer"):**

1. Create new top-level directory: `Quadratic Residues/`
2. Create a single HTML page: `Quadratic Residues/quadratic-residues.html`
   - Copy structure from an existing tool (e.g., `Equivalence Wheel/equivalence-wheel.html`)
   - Keep tool-specific code inline: `<style>` block + `<script>` IIFE-wrapped
   - Include shared site header/nav markup (copy from any tool)
   - Link shared assets: `<link rel="stylesheet" href="../assets/site.css">`, `<script defer src="../assets/theme.js"></script>`
   - Include the `assets/nt-*.js` modules the tool needs, on their own lines immediately before the inline `<script>`, in the canonical order core, bigint, svg, store, layout, i18n, picker, followed by `assets/i18n/site.js` and the new page's own `assets/i18n/<page-slug>.js` data file
   - Open the `<script>` with an import block: import shared helpers; define only tool-specific functions (e.g. `legendreSymbol`, `isQuadraticResidue` if no `NT` module already exports them)
   - Define `render()` and state management in closure
   - Wire events at bottom
3. Add entry to portal: Edit `index.html`, add new `<a class="card">` with link to new tool in grid, plus `hub.card.<id>.title`/`.desc` keys in `assets/i18n/hub.js` (all twenty-one languages)
4. Update site nav: Each tool's header nav must list all tools via `data-i18n="site.nav.<id>"`; add the new `site.nav.<id>` key to `assets/i18n/site.js` in all twenty-one languages, then copy the canonical header (e.g. from the Sieve of Eratosthenes) into the new tool and into every existing tool's nav. Also copy the canonical site footer, byte-identical, `<footer class="site-footer">`, placed as the last element before the page's scripts
5. Translate the new tool: write `assets/i18n/<page-slug>.js` with one namespace covering every static and dynamic string in all twenty-one languages (English is source of truth); mark static text with `data-i18n`/`data-i18n-attr`/`data-i18n-placeholder`; route dynamic text through `translate()`/`translateInto()`/`bindText()`; wire an `onLangChange` callback that re-renders dynamic text without resetting tool state
6. Add a row to `.planning/phases/06-multi-language-support/i18n-check.js`'s `PAGES` table so the static/runtime i18n gates cover the new page

**New Math Function (Shared Across Multiple Tools):**

- Add the function inside the matching `assets/nt-*.js` module's IIFE (a plain-`Number` helper goes in `nt-core.js`, a `BigInt` helper in `nt-bigint.js`, an SVG/geometry helper in `nt-svg.js`, a shared-state helper in `nt-store.js`, a layout helper in `nt-layout.js`)
- Add it to that module's frozen export object (e.g. `NT.core = Object.freeze({ ..., newFn: newFn });`)
- Import it in every consuming tool via the import block (`const { ..., newFn } = NT.NAME;`)
- Never define the function locally in a tool page — a local declaration with the same name would silently shadow the import (`shadow-check.js`'s SHADOW gate flags this)

**New Utility/Helper Function (Tool-Specific):**

- Add to the top-level helper section of that tool's `<script>` block, after its `NT` import block
- Example: `cellMinPx(M)` in Cayley Table is tool-internal (re-derived from, not shared with, the Sieve of Eratosthenes's own sizing helper)
- Once a second tool needs the same helper, move it into the matching `assets/nt-*.js` module's frozen export object and have both tools import it from there

**Bug Fix in Math Function:**

- Locate the function in the tool's `<script>` block (e.g., `isPrime` in sieve-of-eratosthenes.html)
- Fix the implementation
- Search for same function in other tools: `grep -n "function functionName" */*.html`
- Apply identical fix to all instances
- Commit with message noting the cross-file edit and which tools are affected

**New Feature in Existing Tool (e.g., "Add keyboard shortcuts to Sieve"):**

- Edit tool HTML file (e.g., `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`)
- Add new event listener at bottom of `<script>` block (see pattern: `nRange.addEventListener(...)`)
- Add corresponding button/control in HTML markup if user-facing
- Add CSS for new element in `<style>` block
- Test in browser: `open "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"`

**Site-Wide Change (e.g., "Update header background color for all tools"):**

- Edit `assets/site.css` to change `.site-header` styles (affects all pages)
- Or edit `:root { --st-header-bg }` CSS custom property in `assets/site.css`
- Instantly applies to all tools (site.css is shared)

## Special Directories

**`assets/`:**

- Purpose: Shared resources loaded by every page
- Generated: No (hand-written)
- Committed: Yes (core to app functionality)
- Contents: `site.css` (styling for header/nav/theme switch/site footer/language switch), `theme.js` (day/night toggle logic), the seven `nt-*.js` shared logic modules (`nt-core.js`, `nt-bigint.js`, `nt-svg.js`, `nt-store.js`, `nt-layout.js`, `nt-i18n.js`, `nt-picker.js`) on `window.NT`, and `i18n/` (translation-data files: `site.js` plus one `<page-slug>.js` per tool)

**`[Tool Name]/` directories:**

- Purpose: Isolation of tool-specific code; a tool's own rendering, state and playback live here, while helpers shared across tools live in `assets/nt-*.js`
- Generated: No (hand-written HTML files)
- Committed: Yes
- Stray files in each: `CLAUDE_RESUME_COMMAND` or `RESUME_CLAUDES_CHAT` (session artifacts, leave as-is)

**`.planning/codebase/`:**

- Purpose: Architecture documentation for GSD tools
- Generated: Yes (by `/gsd-map-codebase` skill)
- Committed: Yes (part of repo)
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, STACK.md, INTEGRATIONS.md, CONCERNS.md
- Refresh command: `/gsd-map-codebase` (overwrites with current date)

---

*Structure analysis: 2026-09-23*
