---
last_mapped_commit: 5bb8919024dcaaee469701a9086df5dc814ba501
last_mapped_at: 2026-09-23
---
<!-- refreshed: 2026-09-23 -->

# Architecture

**Analysis Date:** 2026-09-23

## System Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                       Portal / Landing Page                     │
│                    `index.html` (main entry)                    │
│                                                                 │
│  Grid of linked cards to all available tools                   │
│  Uses shared header, nav, theme toggle                         │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ├─────────────────────┬───────────────┬──────────────────┬──────────────┐
          ▼                     ▼               ▼                  ▼              ▼
┌──────────────────────┐ ┌──────────────┐ ┌────────────────┐ ┌──────────┐ ┌─────────────┐
│  Sieve of           │ │ Factor Tree  │ │ Fermat's       │ │ Congruence  │ │ RSA         │
│  Eratosthenes       │ │              │ │ Method         │ │ Wheel       │ │             │
│ `Sieve Of.../       │ │ `Factor      │ │ `Fermats       │ │ `Congruence │ │ `RSA/       │
│  sieve-of-...html` │ │  Tree/...`   │ │  Method/...`   │ │  Wheel/..`  │ │  rsa.html`  │
│                    │ │              │ │                │ │             │ │             │
│ · Animated grid    │ │ · Tree       │ │ · Fermat's     │ │ · Polar     │ │ · Step-by   │
│   with playback    │ │   diagram    │ │ factoring      │ │   sectors   │ │   step RSA  │
│ · Prime marking    │ │ · Recursive  │ │ · Geometric    │ │ · Modular   │ │   flow      │
│ · Audio chimes     │ │   branches   │ │ picture        │ │   arithmetic│ │ · Bob/Alice │
└──────────────────────┘ └──────────────┘ └────────────────┘ └──────────────┘ │ · Eve taps  │
         │                      │                │                  │         │   wire     │
         │                      │                │                  │         │ · BigInt   │
         └──────────────────────┴────────────────┴──────────────────┴─────────┘ │   crypto   │
                                       │                                         └─────────────┘
                                       ▼
                          ┌─────────────────────────────┐
                          │   Shared Site Infrastructure│
                          │                             │
                          │ · Header + Nav (site.css)   │
                          │ · Theme toggle (theme.js)   │
                          │ · Google Fonts link         │
                          │ · Local Storage persistence │
                          └─────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Portal | Discover and navigate to all tools; present metadata | `index.html` |
| Sieve Tool | Visualize prime-finding algorithm with playback | `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` |
| Factor Tree Tool | Animate recursive factorization as tree diagram | `Factor Tree/factor-tree.html` |
| Fermat's Method Tool | Visualize Fermat's factoring method via algebra → geometry | `Fermats Method/fermats-method.html` |
| Congruence Wheel Tool | Display modular arithmetic partitions as polar sectors | `Congruence Wheel/congruence-wheel.html` |
| RSA Tool | Walk through RSA key generation, encryption, and cryptanalysis | `RSA/rsa.html` |
| Site Chrome | Sticky header, tool navigation, day/night toggle, language switcher | `assets/site.css`, `assets/theme.js` |
| Shared Logic Modules | Number theory, BigInt arithmetic, SVG element/geometry helpers, cross-tool shared state, diagram layouts, and multi-language translation used by every consuming tool | `assets/nt-core.js`, `assets/nt-bigint.js`, `assets/nt-svg.js`, `assets/nt-store.js`, `assets/nt-layout.js`, `assets/nt-i18n.js` |

## Pattern Overview

**Overall:** HTML tool pages built on shared assets — no build system, no package manager, only Google Fonts as an external dependency.

**Key Characteristics:**

- Each tool is one `.html` page that runs immediately in a browser without a build step, just by opening it
- Tool-specific HTML, CSS and JS live in the page; shared helpers come from `assets/nt-*.js`, loaded as classic scripts immediately before the page's own inline script
- Vanilla JavaScript (ES5+ compatible) with no frameworks or transpilation
- SVG-rendered diagrams using `document.createElementNS` and manual geometry calculation
- CSS custom properties (`:root` variables) for theme support (day/night mode)
- localStorage for state persistence and user preferences
- Responsive design via `@media` breakpoints and CSS Grid/Flexbox

## Layers

**Presentation (Portal):**

- Purpose: Landing page and tool discovery
- Location: `index.html`
- Contains: Hero text, card grid with links to each tool, shared site header/footer
- Depends on: `assets/site.css`, `assets/theme.js`
- Used by: User's first entry point; nav from other pages links back here

**Presentation (Tool-Specific):**

- Purpose: Individual tool UI — controls, visualizations, outputs, interactive elements
- Location: Each `[Tool Name]/[tool-name].html`
- Contains: Inline `<style>` block with tool-specific CSS + animations, static markup (inputs, buttons, SVG containers), inline `<script>` with logic
- Depends on: `assets/site.css`, `assets/theme.js`, Google Fonts
- Used by: Browser navigation directly to tool file

**Site Chrome:**

- Purpose: Consistent header, navigation, theme toggle across all pages
- Location: `assets/site.css` (styling), `assets/theme.js` (interactivity)
- Contains: Sticky header HTML (included in each page's markup), CSS for layout, JavaScript for theme persistence
- Depends on: localStorage API
- Used by: Every page includes `<link rel="stylesheet" href="../assets/site.css">` and `<script defer src="../assets/theme.js"></script>`

**Shared Modules:**

- Purpose: Number theory, BigInt arithmetic, SVG element/geometry helpers, cross-tool shared state, diagram layout algorithms, and multi-language translation used by more than one tool
- Location: `assets/nt-core.js`, `assets/nt-bigint.js`, `assets/nt-svg.js`, `assets/nt-store.js`, `assets/nt-layout.js`, `assets/nt-i18n.js`, each assigning one frozen object to its own `window.NT` namespace (`NT.core`, `NT.bigint`, `NT.svg`, `NT.store`, `NT.layout`, `NT.i18n`)
- Contains: the exported functions/constants listed in Key Abstractions below
- Load order: plain, non-deferred `<script src>` tags in the canonical order core, bigint, svg, store, layout, i18n, included immediately before a tool's own inline `<script>`; `nt-layout.js` requires `nt-core.js` to already be loaded; a page's own `assets/i18n/site.js` and `assets/i18n/<page-slug>.js` translation-data files are included after `nt-i18n.js`, in the same non-deferred style
- Used by: every tool page that imports one or more `NT.NAME` namespaces via its import block

**i18n Layer:**

- Purpose: Site-wide multi-language translation — language resolution, DOM text binding, durable persistence, and cross-tab/cross-session sync, so a visitor's chosen language follows them across every tool
- Location: `assets/nt-i18n.js` (`NT.i18n` — the engine: `translate`/`translateInto`/`bindText`/`applyStaticDom`/`setLang`/`getLang`/`onLangChange`/`detectDefaultLang`), the data files under `assets/i18n/` (`site.js`'s shared `site` and `common` namespaces plus one page-specific namespace per tool, e.g. `assets/i18n/sieve-of-eratosthenes.js`; `index.html`'s is `assets/i18n/hub.js`), and the canonical header's `#lang-switch-select` switcher
- Contains: five supported languages (nl, en, de, fr, es) with English as source of truth; every user-visible string reaches the DOM as a `data-i18n`-bound text node or via `translate()`/`translateInto()`/`bindText()`, never `innerHTML`
- Load order: the sixth shared module, included after `nt-layout.js` and before a page's own `assets/i18n/*.js` data files and its inline `<script>`
- Used by: every tool page; a page's own `onLangChange` callback re-renders its dynamic text (messages, banners, captions) from tracked state when the active language changes, without resetting tool state (grid, scan position, playback, selections)

**Business Logic (Math):**

- Purpose: Number-theory algorithms (primality testing, factorization, modular arithmetic, RSA crypto)
- Location: `assets/nt-core.js` (`NT.core` — plain-Number math) and `assets/nt-bigint.js` (`NT.bigint` — BigInt-domain math); a tool imports the functions it needs via the import block at the top of its inline `<script>`
- Contains: Stateless utility functions for computation
- Depends on: JavaScript BigInt (`NT.bigint`, used by RSA, Diffie-Hellman Key Exchange, Square and Multiply) for large-number arithmetic
- Used by: Render functions and event handlers

**Rendering (SVG):**

- Purpose: Geometry calculation and SVG element creation
- Location: `assets/nt-svg.js` (`NT.svg.svgEl` plus polar/annular-sector geometry) and `assets/nt-layout.js` (`NT.layout`'s nested-squares and factor-tree geometry); render functions within each tool's own `<script>` (e.g., `render()`, `draw()`) consume these and add tool-specific drawing
- Contains: `NT.svg.svgEl` for creating SVG elements, `NT.svg`/`NT.layout` layout math (polar coordinates, tree positioning, nested-square tiling)
- Depends on: DOM APIs, browser SVG support
- Used by: Animation and interactive feedback loops

**State Management:**

- Purpose: Track user inputs, selections, and animation progress
- Location: Closure-scoped `state` object in each tool's IIFE
- Contains: Current slider values, selected items, animation frame counters, playback status
- Depends on: localStorage for persistence, requestAnimationFrame for animation loops
- Used by: Event handlers (input changes, clicks) → validation → state update → render

## Data Flow

### Primary Request Path (User Interaction → Visualization)

1. **User interacts** with control (slider, button, keyboard) → event listener fires (`[Tool Name].html`, embedded handler)
2. **State update** → validation and clamping of input, new `state` values computed
3. **Persistence** → `localStorage.setItem(...)` stores state for next session
4. **Render** → `render()` or animation frame loop recalculates geometry (positions, radii, text) based on new state
5. **DOM/SVG output** → Creates/modifies SVG elements or updates HTML content
6. **Browser renders** → User sees updated visualization

**Example flow (Congruence Wheel):**

- User adjusts "N" slider → `nRange.input` event listener
- State updates `state.N = parseInt(nRange.value)`
- localStorage persists the new value
- `render()` recalculates `wedgeAngle = 360 / state.N`, redraws sectors
- SVG path elements regenerated, text positions rotated for new N

### Animation Flow (Frame-by-Frame Reveal)

1. **User clicks "Play"** or loads page with preset → Animation state initialized (e.g., `generation` counter)
2. **requestAnimationFrame loop** → Per-frame callback checks `generation` counter to invalidate stale animations
3. **Staggered reveals** → `setTimeout` callbacks staged at intervals reveal SVG elements with CSS transitions
4. **Playback controls** → Play/Pause/Step/Instant buttons modify animation frame counter
5. **Completion** → When counter reaches final frame, animation halts; user can restart

**Example (Sieve of Eratosthenes):**

- Grid rendered initially but hidden (opacity: 0)
- Play button starts `generation++` and begins looping
- Per-frame, next multiple marked (via CSS class change), transition animates opacity
- Chime sound plays (if enabled)
- Pause freezes the generation counter; Step increments it by 1

### Theme Toggle Flow

1. **User clicks theme toggle** → Hidden checkbox triggers `change` event
2. **theme.js handler** reads checkbox state, calls `setTheme(theme)`
3. **localStorage update** → Persists choice as `'site-theme': 'day' | 'night'`
4. **CSS variable swap** → `document.documentElement.setAttribute('data-theme', theme)` triggers `:root[data-theme="day"]` or `:root[data-theme="night"]` selectors
5. **All CSS colors** on current page re-bind to new theme variables via `var(--color-name)`
6. **Browser repaint** → Instant theme switch with CSS transition smoothing

**State Management:**

- Preference persists across browser sessions via localStorage
- Cross-tab sync via `storage` event listener (theme.js)
- Pre-render script in `<head>` sets theme before first paint (prevents flash)

### Language Switch Flow

1. **User selects a language** in the header's `#lang-switch-select` → `NT.i18n.setLang(code)`
2. **Persistence** → an explicit choice is written to `localStorage` under `site-lang` first, then to the cookie `site-lang=<code>;path=/;max-age=31536000;samesite=lax`; a detected browser default is never written
3. **DOM update** → `applyStaticDom()` re-binds every `data-i18n`/`data-i18n-attr`/`data-i18n-placeholder` element, decorates same-site links with `&lang=`/`?lang=`, and updates `<html lang>`
4. **Page re-render** → the page's own `onLangChange` callback re-renders its dynamic text (messages, banners, captions) from tracked state, without resetting tool state
5. **Cross-tab sync** → a `storage` event for the `site-lang` key re-applies the language in another open tab, without re-persisting; events for any other key (including `site-theme`) are ignored

## Key Abstractions

**NT.svg.svgEl(tag, attrs):**

- Purpose: Create SVG elements without typing `document.createElementNS` repeatedly
- Examples: `svgEl('circle', {cx:100, cy:100, r:50})`, `svgEl('path', {d:'M0 0 L10 10'})`
- Pattern: Wrapper around `document.createElementNS('http://www.w3.org/2000/svg', tag)` with batch attribute setting
- Used by: Every tool that imports `NT.svg` for diagram construction

**Geometry Helpers (`NT.svg` / `NT.layout`):**

- `polar(cx, cy, r, angleDeg)` — Convert polar coords to Cartesian for SVG placement (centre passed explicitly, so any page can use its own)
- `annularSectorPath(cx, cy, rInner, rOuter, startDeg, endDeg)` — SVG path for pizza-slice wedges
- `computeNestedLayout(steps, tileCap)` — Euclidean nested-squares tiling geometry
- `buildFactorTree(v, { balanced, maxIter })` with `assignTreeX`/`flattenTree` — recursive factor-tree structure and layout
- Pattern: Pure functions returning coordinates, path strings, or plain node/edge data; state-agnostic

**State Object (closure-scoped per tool):**

- Structure: `{ paramName: value, ...}` plus `selected: idx` for interactive selections
- Lifecycle: Initialized at startup (defaults or localStorage), modified on user input, persisted, triggers render
- Example: `state = { N: 10, depth: 6, selected: 0 }` in Congruence Wheel

**Render Function:**

- Purpose: Rebuild visualization from current state
- Pattern: Clear `innerHTML = ''`, recalculate all geometry, create SVG/DOM elements, attach event handlers
- Cost: O(state-dependent size); called on every input change and animation frame
- Optimization: Use CSS class toggles (`.is-selected`) instead of full rebuild where possible

## Entry Points

**Portal Page:**

- Location: `/index.html`
- Triggers: Direct browser navigation to repo root or `file:///.../index.html`
- Responsibilities: Display hero text, list all tools as clickable cards, manage site navigation

**Tool Pages:**

- Location: `./[Tool Name]/[tool-name].html` (relative to repo root)
- Triggers: Clicking tool card on portal, direct browser navigation, or back-link navigation
- Responsibilities: Render tool UI (controls + visualization), initialize state from localStorage, wire events, run on load example

**Theme Initialization:**

- Location: Inline script in `<head>` of every page (before CSS loads)
- Triggers: Page load
- Responsibilities: Read localStorage theme preference, set `[data-theme]` attribute before first paint (prevents theme flash)

## Architectural Constraints

- **Threading:** Single-threaded event loop (browser JS standard). Animation via `requestAnimationFrame` and `setTimeout`; no Web Workers used.
- **Global state:** Each tool's own UI/animation state lives in a closure-scoped object — no tool shares its own state via a module-level singleton. `window.NT` is the one shared global, and each of its sub-namespaces (`NT.core`, `NT.bigint`, `NT.svg`, `NT.store`, `NT.layout`, `NT.i18n`) is frozen after construction; no page may assign to `NT` or to any of its members. Theme preference is stored in `localStorage` under `site-theme`; the active language preference is stored under `site-lang` by `NT.i18n`, mirroring the same cookie + localStorage pattern.
- **Module dependency direction:** Tools depend on `NT.*` modules, never the reverse; `nt-layout.js` depends on `nt-core.js` (and throws if loaded without it); no module depends on a tool. No ES modules are used, so every page still works when opened over `file://`.
- **No build step:** All code runs as-is in browser; no transpilation, minification, or bundling.
- **Module boundary:** Each helper exists once, in the matching `assets/nt-*.js` file; a tool includes only the modules whose namespaces it imports.
- **Load order:** A page's `nt-*.js` `<script src>` tags are plain and non-deferred, placed immediately before its own inline `<script>`, because that inline script calls shared helpers synchronously at IIFE top level (starting with its own import block). The canonical order is core, bigint, svg, store, layout, i18n, followed by the page's own `assets/i18n/site.js` and `assets/i18n/<page-slug>.js` data files.
- **BigInt support:** RSA tool uses native `BigInt` for key generation and modular exponentiation; requires modern browser (not IE11 or earlier).
- **SVG rendering:** All diagrams hand-drawn via path/circle/text elements; no charting library (D3, Recharts, etc.).

## Anti-Patterns

### Architectural Smell: Shadowing a Shared Helper

**What happens:** A tool declares a local function or variable with the same name as an export it already imports from `NT` (e.g. a local `function clamp(...)` in a page that also runs `const { clamp } = NT.core;`).

**Why it's wrong:** The local declaration silently shadows the import — the page still runs, but its behavior has quietly diverged from every other tool that calls `NT.core.clamp`, and a fix later landed in `assets/nt-core.js` never reaches this page.

**Do this instead:** Fix the behavior once, in the owning `assets/nt-*.js` module, and let every importing tool pick it up automatically. `shadow-check.js`'s SHADOW gate flags a local declaration that shadows an `NT` export.

- Never declare a local function or variable with the same name as an `NT` export the page imports
- Change shared behavior in the owning `assets/nt-*.js` module, never by overriding it in one tool

### Architectural Smell: Deferred or Modular Shared-Module Includes

**What happens:** A page includes an `assets/nt-*.js` module with `defer`, `async`, or `type="module"`.

**Why it's wrong:** A tool's inline `<script>` calls shared helpers synchronously at the top of its IIFE, starting with its own import block; a deferred or async module load runs after that point, so the import block throws (`NT` or a namespace is undefined) the first time the page tries to render. `type="module"` additionally breaks the page when opened directly over `file://`, since browsers block ES module imports on that origin.

**Do this instead:** Include every `assets/nt-*.js` module as a plain `<script src>` — no `defer`, no `async`, no `type="module"` — immediately before the tool's own inline script, in the canonical order core, bigint, svg, store, layout.

- Include every `assets/nt-*.js` module as a plain `<script src>`: no `defer`, no `async`, no `type="module"`
- Place the includes immediately before the tool's own inline script, in the order core, bigint, svg, store, layout

### Architectural Smell: Monolithic Tool File (1000+ lines)

**What happens:** A tool's HTML file grows beyond 500–700 lines, with render logic, state management, event handlers, and CSS all tangled.

**Why it's wrong:** Harder to debug, test, and onboard to the code; visual tools especially benefit from isolating geometry from interaction.

**Do this instead:** Refactor the `<script>` block into logical sections with clear comments and helper functions:

- Import block from `NT` (one `const { ... } = NT.NAME;` line per namespace used, first thing in the script)
- Tool-specific geometry/helper functions not already covered by an `NT` import
- State initialization and defaults
- Render functions (rebuild DOM/SVG)
- Event handler wiring (input, button, keyboard)
- Initialization on DOMContentLoaded

See `Equivalence Wheel/equivalence-wheel.html` as a model.

### Architectural Smell: Concatenating Translated Fragments

**What happens:** A dynamic message is built by concatenating several `translate()` calls, or a `translate()` result with literal English punctuation or connective words (e.g. `translate('a') + ' of ' + translate('b')`).

**Why it's wrong:** Word order, articles and connectives differ per language — a fragment-by-fragment concatenation only reads correctly in English and produces broken grammar in every other language. `06-GLOSSARY.md` and the per-page translation procedure both call this out as the reason every message is a whole-sentence dictionary template.

**Do this instead:** Write one whole-sentence dictionary value per language, with `{0}`/`{name}`-style placeholders for the variable parts, and call `translate()`/`translateInto()` once per message, never concatenating two translated pieces.

- Write one whole-sentence dictionary value per language, with `{0}`/`{name}`-style placeholders for the variable parts, and call `translate()`/`translateInto()` once per message, never concatenating two translated pieces.

### Architectural Smell: Prose via innerHTML

**What happens:** A render function builds a sentence containing translated text by concatenating an HTML string and assigning it to `innerHTML`.

**Why it's wrong:** `NT.i18n`'s rendering rule puts every translated string into the DOM as a text node or via `textContent`/`setAttribute`, never `innerHTML` — a dictionary value is never parsed as markup, and an `innerHTML` builder can't be exempted by the static i18n gates (`i18n-check.js`'s `INNERHTML-PROSE` finding).

**Do this instead:** Build the sentence via DOM construction (`createElement`/`createTextNode`) and `translateInto()` with Node params for any embedded `<strong>`/`<sup>`/`<span>` child, matching the project's long-standing DOM-construction convention for every other dynamic region.

- Build the sentence via DOM construction (`createElement`/`createTextNode`) and `translateInto()` with Node params for any embedded `<strong>`/`<sup>`/`<span>` child, matching the project's long-standing DOM-construction convention for every other dynamic region.

### Architectural Smell: Tight Coupling to localStorage Key Name

**What happens:** Tool stores state under a generic key like `'state'`, and a later tool accidentally uses the same key, causing data loss or cross-contamination.

**Why it's wrong:** Silent data corruption; user preferences silently overwrite each other.

**Do this instead:** Use a tool-specific localStorage key that's unlikely to collide. Convention: `[tool-name]` in kebab-case.

- Factor Tree: `'factor-tree'`
- Congruence Wheel: `'congruence-wheel'`
- RSA: keeps no tool-specific key; persists nothing beyond the shared `site-theme` preference

See `Congruence Wheel/congruence-wheel.html` line 343: `JSON.parse(localStorage.getItem('congruence-wheel') || 'null')` — tool-specific key.

## Error Handling

**Strategy:** Client-side validation of user inputs; graceful degradation on invalid state.

**Patterns:**

- Number inputs: Clamp to valid range (e.g., "N must be 1–60") with `clamp(v, min, max)` before render
- Prime inputs (RSA tool): Test primality, display error message if false, disable "Generate" button
- Calculation limits: Silently cap N or iterations if computation gets slow (no explicit error, just ignore input above threshold)
- localStorage failures: Wrapped in `try/catch` with fallback to defaults (e.g., "if localStorage is disabled, use hardcoded state")

**No exceptions propagate to user:** All errors are caught and either silently handled or displayed in error message div (e.g., `#bob-error` in RSA tool).

## Cross-Cutting Concerns

**Logging:** No logging framework. Debug via browser console; tools print no output by default. Errors silently revert to safe state (no stack traces exposed to user).

**Validation:** Input validation is immediate and silent:

- Range validation: `clamp(v, lo, hi)` before state update
- Type validation: `parseInt(..., 10)` ensures number
- Domain validation: `if (N < 1) N = 1` for modulus
- No error dialogs; UI controls disabled if invalid (e.g., buttons turned gray)

**Authentication:** Not applicable (all client-side, no login).

**Authorization:** Not applicable (single-user, browser-based).

**Theming:** CSS custom properties per `:root[data-theme]` selector; all color values override atomically. Transition smooth via CSS `transition: color .25s ease` on body.

---

*Architecture analysis: 2026-09-23*
