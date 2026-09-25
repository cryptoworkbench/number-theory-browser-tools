<!-- GSD:project-start source:PROJECT.md -->

## Project

**Number Theory & Abstract Algebra Browser Tools**

An educational website of interactive, visualization-led browser tools that make number theory, group theory, and abstract algebra intuitive for self-directed math learners. Each tool is a single self-contained HTML page (no build system, no framework) that turns one math concept into a hands-on diagram — a factor tree, a modular-arithmetic wheel, an RSA walkthrough — rather than a wall of text. A shared `index.html` hub and site-wide nav header tie the tools together as one site.

**Core Value:** Every concept gets a visualization a self-learner can interact with and immediately understand — the diagram teaches, the text supports it.

### Constraints

- **Tech stack**: Vanilla HTML/CSS/JS only, no build tooling, no frameworks — matches every existing tool and keeps each page runnable by opening the file directly.
- **Architecture**: One top-level directory per tool, one self-contained `.html` file — new tools must match this, not introduce shared JS/CSS modules for logic (shared site chrome in `assets/` is the one intentional exception, already established).
- **External resources**: Only Google Fonts via `<link>` — no other CDN or third-party JS dependency, per existing convention.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

## Languages

- HTML5 - Markup for all pages
- CSS3 - Styling with custom properties, animations, responsive design
- JavaScript (ECMAScript 2020+) - Application logic, number theory algorithms, SVG rendering
- ES2020 (BigInt support for large-number arithmetic in RSA tool)
- SVG (Scalable Vector Graphics for animated diagrams)
- DOM APIs, Canvas not used

## Runtime

- Modern web browsers (Chrome, Firefox, Safari, Edge)
- Requirements: ES2020 support, SVG support, localStorage API
- No server runtime (purely client-side)
- Browser-based, cross-platform (Windows, macOS, Linux)

## Frameworks

## Key Dependencies

- Google Fonts (`https://fonts.googleapis.com`)
- `document.createElementNS()` for SVG creation
- `localStorage` for theme preference and tool state persistence
- `requestAnimationFrame` for animation loops (Sieve tool, Completing-the-Square tool)
- `performance.now()` for timing measurements
- `BigInt` native type (RSA tool for cryptographic calculations)

## Configuration

- No environment variables required
- All configuration via CSS custom properties (`:root` variables)
- Theme system (day/night mode) persisted in `localStorage` under key `site-theme`
- Background colors: `--bg`, `--bg-1`, `--bg-2`
- Text colors: `--ink`, `--text`, `--text-dim`
- Accent colors: `--accent`, `--accent-2`
- Layout tokens: `--panel`, `--panel-border`
- No build configuration files present
- No `package.json`, `tsconfig.json`, `.eslintrc`, or similar configuration
- Direct HTML file execution (open `.html` files in browser via `file://` URL)

## Platform Requirements

- Text editor or IDE (no tooling required)
- Modern browser for testing changes
- Static file hosting (GitHub Pages, Netlify, any HTTP server serving files)
- No backend, database, or server-side runtime required

## Storage

- `localStorage` for theme preference (`site-theme` key)
- Per-tool state persistence in `localStorage`:
- All calculations are ephemeral
- No user accounts, sessions, or databases

## Performance Characteristics

- Inline, pure JavaScript number-theory functions (no optimization libraries):
- Optimized for clarity over performance; suitable for educational visualization
- Trial division for factorization (no advanced sieves or Pollard's rho)
- SVG for all diagrams (hand-drawn via `document.createElementNS`, not canvas)
- CSS animations via `@keyframes` for decorative effects (snow, twinkling stars)
- Playback controls use `setTimeout` with a `generation` counter to invalidate stale callbacks

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- HTML tools use kebab-case: `factor-tree.html`, `pizza-slices.html`, `sieve-of-eratosthenes.html`, `rsa-examplifier.html`
- Shared assets use kebab-case: `site.css`, `theme.js`
- Directory names use Title Case with spaces: `Factor Tree`, `Pizza Slices`, `RSA Examplifier`
- camelCase for all variable declarations: `nRange`, `depthRange`, `dynGroup`, `refList`, `messageEl`
- Computed geometric constants also camelCase: `wedgeAngle`, `ringWidth`, `levelHeight`
- DOM elements: `numInput`, `equationEl`, `treeArea`, `generateBtn`, `playBtn`
- camelCase for all function names: `primeFactors()`, `smallestPrimeFactor()`, `isPrime()`, `render()`, `select()`, `persist()`
- Descriptive names indicating purpose: `buildTree()`, `assignX()`, `flatten()`, `pinePath()`, `svgEl()`, `modPowPlain()`, `extendedGcdSteps()`
- Prefixed with underscore pattern not used; instead, functions are organized by section with comments
- All caps for module-level constants in some tools: `CX`, `CY`, `HOLE_R`, `OUTER_R`, `LIFT`, `SVG_NS`
- camelCase for named constant objects: `SPEED_LABELS`, `STORAGE_KEY`, `LIGHT_COLORS`
- CSS custom properties use double-dash prefix: `--bg`, `--ink`, `--accent`, `--prime`, `--composite`

## Code Style

- No build system or formatter in use
- Indentation: 2 spaces (observed consistently across all files)
- Line length: No strict limit; lines typically 80-100 characters
- Semicolons: Present and used consistently
- All tools are single-file HTML documents
- Inline `<style>` block in `<head>` (no external CSS except shared `assets/site.css`)
- Inline `<script>` block at end of `<body>`
- IIFE-wrapped main logic: `(function(){ ... })();`
- Event listeners wired at bottom of IIFE
- ES6 syntax used in newer tools (const/let, arrow functions, template literals)
- Older ES5 patterns coexist (var, function declarations, for loops)
- No transpilation or build step
- Native DOM APIs only (no jQuery, no frameworks)
- BigInt used for cryptographic operations in RSA tool
- Day/night theme support via `:root[data-theme="night"]` and `:root[data-theme="day"]`
- CSS custom properties define all colors and sizes for theme switching
- Keyframe animations for decorative effects (snow, twinkling, fairy lights, pulse effects)
- Responsive design via `clamp()` and `@media` queries
- Flexbox and CSS Grid for layouts

## Import Organization

- Shared stylesheet: `<link rel="stylesheet" href="../assets/site.css">`
- Shared theme script (deferred): `<script defer src="../assets/theme.js"></script>`
- Google Fonts via link tag: `<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">`
- Theme detection script inline in `<head>` to prevent flash of wrong theme
- Single-file design precludes import/require statements
- Math utility functions (primeFactors, isPrime, modPow) are duplicated per-file
- SVG helper function `svgEl()` is repeated verbatim across tools

## Error Handling

- Silent failures for localStorage operations wrapped in try/catch
- User-facing validation errors displayed in designated error elements
- Input parsing with explicit error messages

## Logging

- Error and status messages rendered directly to DOM via `textContent` or `innerHTML`
- Message elements (`messageEl`, error boxes, banners) display validation errors and progress
- Performance timing via `performance.now()` (RSA brute-force factoring demo)

## Comments

- Minimal inline comments — code is self-documenting
- Section markers using /* ---------- Text ---------- */ format
- Descriptive comments for complex algorithms

## Function Design

- Most functions 10–30 lines
- Pure number-theory functions (primeFactors, isPrime, modPowPlain) are 5–15 lines
- Render functions 30–100+ lines for complex layouts
- No explicit size limit enforced
- Typically 1–3 parameters per function
- Callback functions use closure over module state (state object, counters)
- Counter/box objects passed by reference for accumulation (assignX, flatten)
- Number-theory functions return primitives (boolean, BigInt, number, array)
- Render functions return void (mutate DOM)
- Builder functions return objects: `{value, kind, children, depth, x, y}`
- Helper functions return computed values for geometry and styling

## Module Design

- No explicit exports (single-file design)
- Window-level state sometimes avoided; most state is module-scoped
- Event listeners and DOM queries use module-scoped variables
- Not applicable — each tool is a complete, standalone HTML file

## Shared Patterns

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

## System Overview

```text

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

- Each tool is a standalone `.html` file that runs immediately in a browser without a build step
- All code (HTML, CSS, JavaScript) is contained in a single file
- Vanilla JavaScript (ES5+ compatible) with no frameworks or transpilation
- SVG-rendered diagrams using `document.createElementNS` and manual geometry calculation
- CSS custom properties (`:root` variables) for theme support (day/night mode)
- localStorage for state persistence and user preferences
- Responsive design via `@media` breakpoints and CSS Grid/Flexbox

## Layers

- Purpose: Landing page and tool discovery
- Location: `index.html`
- Contains: Hero text, card grid with links to each tool, shared site header/footer
- Depends on: `assets/site.css`, `assets/theme.js`
- Used by: User's first entry point; nav from other pages links back here
- Purpose: Individual tool UI — controls, visualizations, outputs, interactive elements
- Location: Each `[Tool Name]/[tool-name].html`
- Contains: Inline `<style>` block with tool-specific CSS + animations, static markup (inputs, buttons, SVG containers), inline `<script>` with logic
- Depends on: `assets/site.css`, `assets/theme.js`, Google Fonts
- Used by: Browser navigation directly to tool file
- Purpose: Consistent header, navigation, theme toggle across all pages
- Location: `assets/site.css` (styling), `assets/theme.js` (interactivity)
- Contains: Sticky header HTML (included in each page's markup), CSS for layout, JavaScript for theme persistence
- Depends on: localStorage API
- Used by: Every page includes `<link rel="stylesheet" href="../assets/site.css">` and `<script defer src="../assets/theme.js"></script>`
- Purpose: Number-theory algorithms (primality testing, factorization, modular arithmetic, RSA crypto)
- Location: Top of each tool's `<script>` block (pure functions like `isPrime`, `primeFactors`, `modPow`)
- Contains: Stateless utility functions for computation
- Depends on: JavaScript BigInt (RSA tool only) for large number arithmetic
- Used by: Render functions and event handlers
- Purpose: Geometry calculation and SVG element creation
- Location: Render functions within each tool's `<script>` (e.g., `render()`, `draw()`)
- Contains: `svgEl` helper (repeated across tools) for creating SVG elements, layout math (polar coordinates, tree positioning, grid cells)
- Depends on: DOM APIs, browser SVG support
- Used by: Animation and interactive feedback loops
- Purpose: Track user inputs, selections, and animation progress
- Location: Closure-scoped `state` object in each tool's IIFE
- Contains: Current slider values, selected items, animation frame counters, playback status
- Depends on: localStorage for persistence, requestAnimationFrame for animation loops
- Used by: Event handlers (input changes, clicks) → validation → state update → render

## Data Flow

### Primary Request Path (User Interaction → Visualization)

- User adjusts "N" slider → `nRange.input` event listener
- State updates `state.N = parseInt(nRange.value)`
- localStorage persists the new value
- `render()` recalculates `wedgeAngle = 360 / state.N`, redraws sectors
- SVG path elements regenerated, text positions rotated for new N

### Animation Flow (Frame-by-Frame Reveal)

- Grid rendered initially but hidden (opacity: 0)
- Play button starts `generation++` and begins looping
- Per-frame, next multiple marked (via CSS class change), transition animates opacity
- Chime sound plays (if enabled)
- Pause freezes the generation counter; Step increments it by 1

### Theme Toggle Flow

- Preference persists across browser sessions via localStorage
- Cross-tab sync via `storage` event listener (theme.js)
- Pre-render script in `<head>` sets theme before first paint (prevents flash)

## Key Abstractions

- Purpose: Create SVG elements without typing `document.createElementNS` repeatedly
- Examples: `svgEl('circle', {cx:100, cy:100, r:50})`, `svgEl('path', {d:'M0 0 L10 10'})`
- Pattern: Wrapper around `document.createElementNS('http://www.w3.org/2000/svg', tag)` with batch attribute setting
- Used by: All tools for diagram construction
- `polar(r, angleDeg)` — Convert polar coords to Cartesian for SVG placement
- `annularSectorPath(...)` — SVG path for pizza-slice wedges
- `treeLayout(...)` — Recursive positioning for factor tree branches
- Pattern: Pure functions returning coordinates or path strings; state-agnostic
- Structure: `{ paramName: value, ...}` plus `selected: idx` for interactive selections
- Lifecycle: Initialized at startup (defaults or localStorage), modified on user input, persisted, triggers render
- Example: `state = { N: 10, depth: 6, selected: 0 }` in Congruence Wheel
- Purpose: Rebuild visualization from current state
- Pattern: Clear `innerHTML = ''`, recalculate all geometry, create SVG/DOM elements, attach event handlers
- Cost: O(state-dependent size); called on every input change and animation frame
- Optimization: Use CSS class toggles (`.is-selected`) instead of full rebuild where possible

## Entry Points

- Location: `/index.html`
- Triggers: Direct browser navigation to repo root or `file:///.../index.html`
- Responsibilities: Display hero text, list all tools as clickable cards, manage site navigation
- Location: `./[Tool Name]/[tool-name].html` (relative to repo root)
- Triggers: Clicking tool card on portal, direct browser navigation, or back-link navigation
- Responsibilities: Render tool UI (controls + visualization), initialize state from localStorage, wire events, run on load example
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

### Architectural Smell: Monolithic Tool File (1000+ lines)

- Math functions at top (e.g., `primeFactors`, `isPrime`)
- Geometry/layout helpers (e.g., `polar`, `svgEl`)
- State initialization and defaults
- Render functions (rebuild DOM/SVG)
- Event handler wiring (input, button, keyboard)
- Initialization on DOMContentLoaded

### Architectural Smell: Tight Coupling to localStorage Key Name

- Factor Tree: `'factor-tree'`
- Congruence Wheel: `'congruence-wheel'`
- RSA Examplifier: `'rsa-examplifier'`

## Error Handling

- Number inputs: Clamp to valid range (e.g., "N must be 1–60") with `clamp(v, min, max)` before render
- Prime inputs (RSA tool): Test primality, display error message if false, disable "Generate" button
- Calculation limits: Silently cap N or iterations if computation gets slow (no explicit error, just ignore input above threshold)
- localStorage failures: Wrapped in `try/catch` with fallback to defaults (e.g., "if localStorage is disabled, use hardcoded state")

## Cross-Cutting Concerns

- Range validation: `clamp(v, lo, hi)` before state update
- Type validation: `parseInt(..., 10)` ensures number
- Domain validation: `if (N < 1) N = 1` for modulus
- No error dialogs; UI controls disabled if invalid (e.g., buttons turned gray)

<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
