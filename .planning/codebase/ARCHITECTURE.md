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
│  Sieve of           │ │ Factor Tree  │ │ Completing the │ │ Congruence  │ │ RSA         │
│  Eratosthenes       │ │              │ │ Square         │ │ Wheel       │ │ Examplifier │
│ `Sieve Of.../       │ │ `Christmas   │ │ `Factorize     │ │ `Pizza      │ │ `RSA        │
│  sieve-of-...html` │ │  Trees/...`  │ │  By.../...`    │ │  Slices/..` │ │  Exampl.`   │
│                    │ │              │ │                │ │             │ │             │
│ · Animated grid    │ │ · Tree       │ │ · Completing   │ │ · Polar     │ │ · Step-by   │
│   with playback    │ │   diagram    │ │   square viz   │ │   sectors   │ │   step RSA  │
│ · Prime marking    │ │ · Recursive  │ │ · Animation    │ │ · Modular   │ │   flow      │
│ · Audio chimes     │ │   branches   │ │   controls     │ │   arithmetic│ │ · Bob/Alice │
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
| Completing Square Tool | Visualize Fermat's factoring method via algebra → geometry | `Factorize By Completing The Square/factorize-completing-square.html` |
| Congruence Wheel Tool | Display modular arithmetic partitions as polar sectors | `Pizza Slices/pizza-slices.html` |
| RSA Examplifier Tool | Walk through RSA key generation, encryption, and cryptanalysis | `RSA Examplifier/rsa-examplifier.html` |
| Site Chrome | Sticky header, tool navigation, day/night toggle | `assets/site.css`, `assets/theme.js` |

## Pattern Overview

**Overall:** Self-contained, single-file HTML tools — no build system, no package manager, no external JS dependencies (only Google Fonts).

**Key Characteristics:**

- Each tool is a standalone `.html` file that runs immediately in a browser without a build step
- All code (HTML, CSS, JavaScript) is contained in a single file
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

**Business Logic (Math):**

- Purpose: Number-theory algorithms (primality testing, factorization, modular arithmetic, RSA crypto)
- Location: Top of each tool's `<script>` block (pure functions like `isPrime`, `primeFactors`, `modPow`)
- Contains: Stateless utility functions for computation
- Depends on: JavaScript BigInt (RSA tool only) for large number arithmetic
- Used by: Render functions and event handlers

**Rendering (SVG):**

- Purpose: Geometry calculation and SVG element creation
- Location: Render functions within each tool's `<script>` (e.g., `render()`, `draw()`)
- Contains: `svgEl` helper (repeated across tools) for creating SVG elements, layout math (polar coordinates, tree positioning, grid cells)
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

## Key Abstractions

**svgEl(tag, attrs):**

- Purpose: Create SVG elements without typing `document.createElementNS` repeatedly
- Examples: `svgEl('circle', {cx:100, cy:100, r:50})`, `svgEl('path', {d:'M0 0 L10 10'})`
- Pattern: Wrapper around `document.createElementNS('http://www.w3.org/2000/svg', tag)` with batch attribute setting
- Used by: All tools for diagram construction

**Geometry Helpers (tool-specific):**

- `polar(r, angleDeg)` — Convert polar coords to Cartesian for SVG placement
- `annularSectorPath(...)` — SVG path for pizza-slice wedges
- `treeLayout(...)` — Recursive positioning for factor tree branches
- Pattern: Pure functions returning coordinates or path strings; state-agnostic

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
- **Global state:** Each tool's state lives in a closure-scoped object; no module-level singletons shared between tools. Theme preference stored in `localStorage`.
- **Circular imports:** No imports; single-file architecture prevents this.
- **No build step:** All code runs as-is in browser; no transpilation, minification, or bundling.
- **Dependency isolation:** Each tool is self-contained; math functions duplicated per-file rather than shared (intentional, per CLAUDE.md).
- **BigInt support:** RSA tool uses native `BigInt` for key generation and modular exponentiation; requires modern browser (not IE11 or earlier).
- **SVG rendering:** All diagrams hand-drawn via path/circle/text elements; no charting library (D3, Recharts, etc.).

## Anti-Patterns

### Architectural Smell: Copy-Paste Math Functions

**What happens:** Prime-testing, factorization, and GCD functions are duplicated across multiple tool files (e.g., `isPrime` appears in both factor-tree.html and sieve-of-eratosthenes.html).

**Why it's wrong:** Maintenance burden — if a bug is found in `isPrime`, it must be fixed in multiple places. Inconsistent updates lead to diverging implementations.

**Do this instead:** Per CLAUDE.md philosophy, duplication is *intentional* to keep each tool self-contained without a shared JS module. If you discover a bug in a math function:

1. Fix it in the tool file where the bug manifests (`git diff` will show you which file)
2. Grep for the same function in other tools: `grep -n "function isPrime" */*.html`
3. Port the fix to all instances with the same change
4. Cite the bug fix in the commit message to clarify the multi-file edit

### Architectural Smell: Monolithic Tool File (1000+ lines)

**What happens:** A tool's HTML file grows beyond 500–700 lines, with render logic, state management, event handlers, and CSS all tangled.

**Why it's wrong:** Harder to debug, test, and onboard to the code; visual tools especially benefit from isolating geometry from interaction.

**Do this instead:** Refactor the `<script>` block into logical sections with clear comments and helper functions:

- Math functions at top (e.g., `primeFactors`, `isPrime`)
- Geometry/layout helpers (e.g., `polar`, `svgEl`)
- State initialization and defaults
- Render functions (rebuild DOM/SVG)
- Event handler wiring (input, button, keyboard)
- Initialization on DOMContentLoaded

See `Pizza Slices/pizza-slices.html` (562 lines, well-sectioned) as a model.

### Architectural Smell: Tight Coupling to localStorage Key Name

**What happens:** Tool stores state under a generic key like `'state'`, and a later tool accidentally uses the same key, causing data loss or cross-contamination.

**Why it's wrong:** Silent data corruption; user preferences silently overwrite each other.

**Do this instead:** Use a tool-specific localStorage key that's unlikely to collide. Convention: `[tool-name]` in kebab-case.

- Factor Tree: `'factor-tree'`
- Congruence Wheel: `'congruence-wheel'`
- RSA Examplifier: `'rsa-examplifier'`

See `Pizza Slices/pizza-slices.html` line 343: `JSON.parse(localStorage.getItem('congruence-wheel') || 'null')` — tool-specific key.

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
