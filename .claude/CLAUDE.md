<!-- GSD:project-start source:PROJECT.md -->

## Project

**Number Theory & Abstract Algebra Browser Tools**

An educational website of interactive, visualization-led browser tools that make number theory, group theory, and abstract algebra intuitive for self-directed math learners. Each tool is one HTML page (no build system, no framework) built on shared JS modules under `assets/`, turning one math concept into a hands-on diagram — a factor tree, a modular-arithmetic wheel, an RSA walkthrough — rather than a wall of text. A shared `index.html` hub and site-wide nav header tie the tools together as one site.

**Core Value:** Every concept gets a visualization a self-learner can interact with and immediately understand — the diagram teaches, the text supports it.

### Constraints

- **Tech stack**: Vanilla HTML/CSS/JS only, no build tooling, no frameworks — matches every existing tool and keeps each page runnable by opening the file directly.
- **Architecture**: One top-level directory and one `.html` page per tool. Shared code lives in `assets/` — site chrome (`palette.css`, `site.css`, `theme.js`) and the seven `nt-*.js` logic modules on `window.NT` (`nt-core.js`, `nt-bigint.js`, `nt-svg.js`, `nt-store.js`, `nt-layout.js`, `nt-i18n.js`, `nt-picker.js`), plus `assets/i18n/` (translation-data files only, one per namespace). A tool's own rendering, state and playback live in its page; a helper shared across tools lives in the matching module.
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
- `requestAnimationFrame` for animation loops (Sieve tool, Fermat's Method tool)
- `performance.now()` for timing measurements
- `BigInt` native type (RSA tool for cryptographic calculations)

## Configuration

- No environment variables required
- All configuration via CSS custom properties (`:root` variables)
- Theme system (day/night mode) follows the OS `prefers-color-scheme` by default; an explicit toggle choice is persisted under key `site-theme-choice` (legacy `site-theme` is deleted on load)
- Language preference (nl/en/de/fr/es/it/pl/pt-BR/pt-PT/sv/nb/ro/hu/lv/ru/el/he/hi/ar/sq/sw/zh/ja/ko/id/zgh-Latn/zgh-Tfng) persisted under key `site-lang`, mirroring the theme preference's cookie + localStorage pattern exactly (same cookie attributes, same URL-param > cookie > localStorage > browser-default read order), owned entirely by `assets/nt-i18n.js`; the `?lang=` URL parameter can override it for one load and is stripped from the address bar after the value is folded into the durable stores; browser-language detection resolves a browser's Albanian preference (`sq`, `sq-AL`, `SQ_xk`: any region, any case, `-` or `_`) to `sq` and its Swahili preference (`sw`, `sw-KE`, `SW_tz`) to `sw`, while `en-KE` stays English; every Chinese browser tag (`zh`, `zh-CN`, `zh-TW`, `zh-Hant-TW`, `zh-HK`: any region or script subtag, any case, `-` or `_`) resolves to `zh`, which is Simplified Chinese (Traditional-script readers get Simplified rather than English), `ja`/`ja-JP` to `ja` and `ko`/`ko-KR` to `ko`, while `en-SG` stays English; a browser's Indonesian preference (`id`, `id-ID`, `ID_id`: any region, any case, `-` or `_`) resolves to `id` while `en-ID` stays English, and the legacy Indonesian tag `in` (`in`, `in-ID`) maps to `id` in detection only (`in` is never an accepted code on any other channel); a browser tag whose primary subtag is `zgh`, `tzm` or `ber` (any case, `-` or `_`) resolves to `zgh-Latn` when it carries a `Latn` script subtag and to `zgh-Tfng` otherwise (Tifinagh is the official script of zgh), while `kab`, `shi` and `rif` are not mapped
- `Intl.PluralRules` is the one `Intl` API this project uses (for pluralizing a dictionary value with a `{one, other}` shape, or `{one, few, many, other}` for Polish and Russian, `{one, few, other}` for Romanian or `{zero, one, other}` for Latvian, or `{one, two, other}` for Hebrew, or `{zero, one, two, few, many, other}` for Arabic; Hindi uses the plain `{one, other}` shape, where `one` also covers 0; Albanian and Swahili use the plain `{one, other}` shape too, where 0 and fractions select `other`; Chinese, Japanese, Korean and Indonesian use the single-category `{other}` shape, where `Intl.PluralRules` reports only `other`, so their one form reads correctly for every count and Indonesian marks plurality only by reduplication, which never follows a count; Standard Moroccan Tamazight (`zgh-Latn`, `zgh-Tfng`) uses `{one, other}` with `one` for exactly 1, a rule `NT.i18n` fixes itself because `Intl.PluralRules` has no zgh data and would fall back to the runtime's default locale); no other `Intl` formatting (number/date/currency) is used — numerals stay plain and locale-independent per I18N-06
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

- `localStorage` for explicit theme choice (`site-theme-choice` key) and language preference (`site-lang` key, a raw language code, either two-letter, the region-tagged `pt-BR`/`pt-PT` or the script-tagged `zgh-Latn`/`zgh-Tfng`, same cookie + localStorage pattern as theme)
- Per-tool state persistence in `localStorage`:
- All calculations are ephemeral
- No user accounts, sessions, or databases

## Performance Characteristics

- Pure JavaScript number-theory functions (no optimization libraries), living in `assets/nt-core.js` (`NT.core`, plain `Number` domain) and `assets/nt-bigint.js` (`NT.bigint`, `BigInt` domain):
- Optimized for clarity over performance; suitable for educational visualization
- Trial division for factorization (no advanced sieves or Pollard's rho)
- SVG for all diagrams (hand-drawn via `document.createElementNS`, not canvas)
- CSS animations via `@keyframes` for decorative effects (snow, twinkling stars)
- Playback controls use `setTimeout` with a `generation` counter to invalidate stale callbacks

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

## Naming Patterns

- HTML tools use kebab-case: `factor-tree.html`, `congruence-wheel.html`, `sieve-of-eratosthenes.html`, `rsa.html`
- Shared assets use kebab-case: `site.css`, `theme.js`, `nt-core.js`, `nt-bigint.js`, `nt-svg.js`, `nt-store.js`, `nt-layout.js`, `nt-i18n.js`, `nt-picker.js`
- Translation-data files use kebab-case under `assets/i18n/`: `site.js` (shared `site`/`common` namespaces), `hub.js` (`index.html`), and `assets/i18n/<page-slug>.js` — one per tool, matching the tool's own HTML filename
- Directory names use Title Case with spaces: `Factor Tree`, `Congruence Wheel`, `RSA`
- camelCase for all variable declarations: `nRange`, `depthRange`, `dynGroup`, `refList`, `messageEl`
- Computed geometric constants also camelCase: `wedgeAngle`, `ringWidth`, `levelHeight`
- DOM elements: `numInput`, `equationEl`, `treeArea`, `generateBtn`, `playBtn`
- camelCase for all function names: `primeFactors()`, `smallestPrimeFactor()`, `isPrime()`, `render()`, `select()`, `persist()`
- Descriptive names indicating purpose: `buildFactorTree()`, `assignTreeX()`, `flattenTree()`, `pinePath()`, `svgEl()`, `modPowPlain()`, `extendedGcdSteps()`
- Prefixed with underscore pattern not used; instead, functions are organized by section with comments
- All caps for module-level constants in some tools: `CX`, `CY`, `HOLE_R`, `OUTER_R`, `LIFT`, `SVG_NS`
- camelCase for named constant objects: `SPEED_LABELS`, `STORAGE_KEY`, `LIGHT_COLORS`
- CSS custom properties use double-dash prefix: `--bg`, `--ink`, `--accent`, `--prime`, `--composite`

## Code Style

- No build system or formatter in use
- Indentation: 2 spaces (observed consistently across all files)
- Line length: No strict limit; lines typically 80-100 characters
- Semicolons: Present and used consistently
- Each tool is one HTML page; shared JS logic lives in `assets/nt-*.js` (site chrome lives in `assets/site.css`/`assets/theme.js`)
- Inline `<style>` block in `<head>` (no external CSS except shared `assets/palette.css`/`assets/site.css`)
- Inline `<script>` block at end of `<body>`, preceded by the `assets/nt-*.js` modules the tool imports
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
- `<script src="../assets/nt-core.js"></script>` — plain, non-deferred, no `type="module"`, so the module runs synchronously before the tool's own script
- Each needed module is included on its own line, immediately before the tool's own inline `<script>` at the end of `<body>`, in the canonical order core, bigint, svg, store, layout, i18n, picker
- `nt-i18n.js` is followed by the data files `assets/i18n/site.js` and the page's own `assets/i18n/<page-slug>.js` (`assets/i18n/hub.js` for `index.html`), each a plain, non-deferred `<script src>` in that order, before the tool's own inline `<script>`
- The tool's inline `<script>` opens with an import block, e.g. `const { clamp, randomInt, unitsMod } = NT.core;`
- Shared helpers come from `NT` via the import block, one `const { ... } = NT.NAME;` line per namespace used, in the canonical namespace order core, bigint, svg, store, layout, i18n, picker
- Names within an import line are sorted by code point, so uppercase constants come first (e.g. `const { SHARED_GROUP_KEY, readModeNParams } = NT.store;`)
- A tool never redefines or mutates an `NT` member — each namespace object is frozen and its slot on `NT` is read-only
- Every user-visible string comes from a dictionary entry present in all twenty-seven languages (nl, en, de, fr, es, it, pl, pt-BR, pt-PT, sv, nb, ro, hu, lv, ru, el, he, hi, ar, sq, sw, zh, ja, ko, id, zgh-Latn, zgh-Tfng), with English as source of truth
- Static markup is translated via `data-i18n`/`data-i18n-attr`/`data-i18n-placeholder`/`data-i18n-params` attributes, applied automatically by `applyStaticDom()`
- Script-rendered text is translated via `translate()`/`translateInto()`/`bindText()`, always as a whole-sentence template (never concatenating two translated fragments) and always landing in the DOM as a text node or via `textContent`/`setAttribute` — never `innerHTML`
- Numerals are never locale-formatted by language (`NT.bigint.fmt` is the one sanctioned plain-number formatter; thousands-grouping stays literal and identical in every language; Hindi, Arabic, Albanian, Swahili, Chinese, Japanese, Korean, Indonesian and Standard Moroccan Tamazight values carry exactly their English value's numerals — DIGIT-PARITY, with zgh-Tfng held equal to zgh-Latn letter for letter by ZGH-TRANSLIT and ZGH-NOTATION — never Albanian's space grouping or comma decimal, never Indonesian's dot grouping or comma decimal, and never full-width digits, CJK numerals in place of digits or 万/億/만/억 grouping; full-width punctuation appears only in Chinese and Japanese prose and formulas stay ASCII; Chinese values are Simplified Chinese in Han characters, Japanese values kanji (shinjitai) with hiragana and katakana and Korean values Hangul without hanja, all rendered in the browser's system fallback font, while Indonesian values are standard Indonesian in plain ASCII letters that render in the existing webfonts and Standard Moroccan Tamazight values are in the IRCAM Latin transcription (`zgh-Latn`) or its letter-for-letter Tifinagh transliteration (`zgh-Tfng`), both left to right, Tifinagh rendered in the browser's system fallback font; while zh, ja or ko is active `<em>` is upright bold instead of a synthesized oblique and Korean wraps between words, never inside them (`assets/site.css`))
- A page's `onLangChange` callback re-renders its own dynamic text when the active language changes, without resetting tool state (grid, scan position, playback, selections)

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

- Shared modules export by assigning one frozen object to `window.NT.NAME` (`assets/nt-core.js` → `NT.core`, and so on); tool pages export nothing
- Window-level state sometimes avoided; most tool-specific state is module-scoped
- Event listeners and DOM queries use module-scoped variables
- Not applicable — each tool is its own page plus the `assets/nt-*.js` modules it includes

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
| Fermat's Method Tool | Visualize Fermat's factoring method via algebra → geometry | `Fermats Method/fermats-method.html` |
| Congruence Wheel Tool | Display modular arithmetic partitions as polar sectors | `Congruence Wheel/congruence-wheel.html` |
| RSA Tool | Walk through RSA key generation, encryption, and cryptanalysis | `RSA/rsa.html` |
| Site Chrome | Sticky header (tool navigation, language switcher, day/night toggle) | `assets/site.css`, `assets/theme.js` |
| Shared Logic Modules | Number theory, BigInt arithmetic, SVG element/geometry helpers, cross-tool shared state, diagram layouts, multi-language translation, and the shared-palette prime-picker popover used by every consuming tool | `assets/nt-core.js`, `assets/nt-bigint.js`, `assets/nt-svg.js`, `assets/nt-store.js`, `assets/nt-layout.js`, `assets/nt-i18n.js`, `assets/nt-picker.js` |

## Pattern Overview

- Each tool is one `.html` page that runs immediately in a browser without a build step, just by opening it
- Tool-specific HTML, CSS and JS live in the page; shared helpers come from `assets/nt-*.js`, loaded as classic scripts immediately before the page's own inline script
- Vanilla JavaScript (ES5+ compatible) with no frameworks or transpilation
- SVG-rendered diagrams using `document.createElementNS` and manual geometry calculation
- CSS custom properties (`:root` variables) for theme support (day/night mode)
- localStorage for state persistence and user preferences
- Responsive design via `@media` breakpoints and CSS Grid/Flexbox

## Layers

- Purpose: Landing page and tool discovery
- Location: `index.html`
- Contains: Hero text, card grid with links to each tool, shared site header
- Depends on: `assets/site.css`, `assets/theme.js`
- Used by: User's first entry point; nav from other pages links back here
- Purpose: Individual tool UI — controls, visualizations, outputs, interactive elements
- Location: Each `[Tool Name]/[tool-name].html`
- Contains: Inline `<style>` block with tool-specific CSS + animations, static markup (inputs, buttons, SVG containers), inline `<script>` with logic
- Depends on: `assets/site.css`, `assets/theme.js`, Google Fonts
- Used by: Browser navigation directly to tool file
- Purpose: Consistent header, navigation, language switcher and theme toggle across all pages
- Location: `assets/site.css` (styling), `assets/theme.js` (interactivity)
- Contains: Sticky header HTML included in each page's markup, CSS for layout, JavaScript for theme persistence
- Depends on: localStorage API
- Used by: Every page includes `<link rel="stylesheet" href="../assets/site.css">` and `<script defer src="../assets/theme.js"></script>`
- Purpose: Number theory, BigInt arithmetic, SVG element/geometry helpers, cross-tool shared state, diagram layout algorithms, and multi-language translation used by more than one tool
- Location: `assets/nt-core.js`, `assets/nt-bigint.js`, `assets/nt-svg.js`, `assets/nt-store.js`, `assets/nt-layout.js`, `assets/nt-i18n.js`, `assets/nt-picker.js`, each assigning one frozen object to its own `window.NT` namespace (`NT.core`, `NT.bigint`, `NT.svg`, `NT.store`, `NT.layout`, `NT.i18n`, `NT.picker`)
- Contains: the exported functions/constants listed in Key Abstractions below
- Load order: plain, non-deferred `<script src>` tags in the canonical order core, bigint, svg, store, layout, i18n, picker, included immediately before a tool's own inline `<script>`; `nt-layout.js` requires `nt-core.js` to already be loaded; a page's own `assets/i18n/site.js` and `assets/i18n/<page-slug>.js` translation-data files are included after `nt-i18n.js`, in the same non-deferred style
- Used by: every tool page that imports one or more `NT.NAME` namespaces via its import block
- Purpose: Site-wide multi-language translation — language resolution, DOM text binding, durable persistence, and cross-tab/cross-session sync, so a visitor's chosen language follows them across every tool
- Location: `assets/nt-i18n.js` (`NT.i18n` — the engine: `translate`/`translateInto`/`bindText`/`applyStaticDom`/`setLang`/`getLang`/`onLangChange`/`detectDefaultLang`), the data files under `assets/i18n/` (`site.js`'s shared `site` and `common` namespaces plus one page-specific namespace per tool, e.g. `assets/i18n/sieve-of-eratosthenes.js`; `index.html`'s is `assets/i18n/hub.js`), and the canonical site header's `#lang-switch-select` switcher
- Contains: twenty-seven supported languages (nl, en, de, fr, es, it, pl, pt-BR, pt-PT, sv, nb, ro, hu, lv, ru, el, he, hi, ar, sq, sw, zh, ja, ko, id, zgh-Latn, zgh-Tfng) with English as source of truth; every user-visible string reaches the DOM as a `data-i18n`-bound text node or via `translate()`/`translateInto()`/`bindText()`, never `innerHTML`
- Load order: the sixth shared module, included after `nt-layout.js`, before `nt-picker.js` when a page uses it, and before a page's own `assets/i18n/*.js` data files and its inline `<script>`
- Used by: every tool page; a page's own `onLangChange` callback re-renders its dynamic text (messages, banners, captions) from tracked state when the active language changes, without resetting tool state (grid, scan position, playback, selections)
- Purpose: Number-theory algorithms (primality testing, factorization, modular arithmetic, RSA crypto)
- Location: `assets/nt-core.js` (`NT.core` — plain-Number math) and `assets/nt-bigint.js` (`NT.bigint` — BigInt-domain math); a tool imports the functions it needs via the import block at the top of its inline `<script>`
- Contains: Stateless utility functions for computation
- Depends on: JavaScript BigInt (`NT.bigint`, used by RSA, Diffie-Hellman Key Exchange, Square and Multiply) for large-number arithmetic
- Used by: Render functions and event handlers
- Purpose: Geometry calculation and SVG element creation
- Location: `assets/nt-svg.js` (`NT.svg.svgEl` plus polar/annular-sector geometry) and `assets/nt-layout.js` (`NT.layout`'s nested-squares and factor-tree geometry); render functions within each tool's own `<script>` (e.g., `render()`, `draw()`) consume these and add tool-specific drawing
- Contains: `NT.svg.svgEl` for creating SVG elements, `NT.svg`/`NT.layout` layout math (polar coordinates, tree positioning, nested-square tiling)
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

### Language Switch Flow

1. **User selects a language** in the site header's `#lang-switch-select` → `NT.i18n.setLang(code)`
2. **Persistence** → an explicit choice is written to `localStorage` under `site-lang` first, then to the cookie `site-lang=<code>;path=/;max-age=31536000;samesite=lax`; a detected browser default is never written
3. **DOM update** → `applyStaticDom()` re-binds every `data-i18n`/`data-i18n-attr`/`data-i18n-placeholder` element, decorates same-site links with `&lang=`/`?lang=`, and updates `<html lang>` (plus `dir="rtl"` while Hebrew or Arabic is active, removed for every other language)
4. **Page re-render** → the page's own `onLangChange` callback re-renders its dynamic text (messages, banners, captions) from tracked state, without resetting tool state
5. **Cross-tab sync** → a `storage` event for the `site-lang` key re-applies the language in another open tab, without re-persisting; events for any other key (including `site-theme`) are ignored

## Key Abstractions

- Purpose: Create SVG elements without typing `document.createElementNS` repeatedly
- Examples: `svgEl('circle', {cx:100, cy:100, r:50})`, `svgEl('path', {d:'M0 0 L10 10'})`
- Pattern: Wrapper around `document.createElementNS('http://www.w3.org/2000/svg', tag)` with batch attribute setting
- Used by: Every tool that imports `NT.svg` for diagram construction
- `polar(cx, cy, r, angleDeg)` — Convert polar coords to Cartesian for SVG placement (centre passed explicitly, so any page can use its own)
- `annularSectorPath(cx, cy, rInner, rOuter, startDeg, endDeg)` — SVG path for pizza-slice wedges
- `computeNestedLayout(steps, tileCap)` — Euclidean nested-squares tiling geometry
- `buildFactorTree(v, { balanced, maxIter })` with `assignTreeX`/`flattenTree` — recursive factor-tree structure and layout
- Pattern: Pure functions returning coordinates, path strings, or plain node/edge data; state-agnostic
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
- **Global state:** Each tool's own UI/animation state lives in a closure-scoped object — no tool shares its own state via a module-level singleton. `window.NT` is the one shared global, and each of its sub-namespaces (`NT.core`, `NT.bigint`, `NT.svg`, `NT.store`, `NT.layout`, `NT.i18n`, `NT.picker`) is frozen after construction; no page may assign to `NT` or to any of its members. Theme preference is stored in `localStorage` under `site-theme`; the active language preference is stored under `site-lang` by `NT.i18n`, mirroring the same cookie + localStorage pattern.
- **Module dependency direction:** Tools depend on `NT.*` modules, never the reverse; `nt-layout.js` depends on `nt-core.js` (and throws if loaded without it); `nt-picker.js` depends on `nt-bigint.js`, `nt-store.js` and `nt-i18n.js`, and `attachPrimePicker` throws if they are absent; no module depends on a tool. No ES modules are used, so every page still works when opened over `file://`.
- **No build step:** All code runs as-is in browser; no transpilation, minification, or bundling.
- **Module boundary:** Each helper exists once, in the matching `assets/nt-*.js` file; a tool includes only the modules whose namespaces it imports.
- **Load order:** A page's `nt-*.js` `<script src>` tags are plain and non-deferred, placed immediately before its own inline `<script>`, because that inline script calls shared helpers synchronously at IIFE top level (starting with its own import block). The canonical order is core, bigint, svg, store, layout, i18n, picker, followed by the page's own `assets/i18n/site.js` and `assets/i18n/<page-slug>.js` data files.
- **BigInt support:** RSA tool uses native `BigInt` for key generation and modular exponentiation; requires modern browser (not IE11 or earlier).
- **SVG rendering:** All diagrams hand-drawn via path/circle/text elements; no charting library (D3, Recharts, etc.).

## Anti-Patterns

### Architectural Smell: Shadowing a Shared Helper

- Never declare a local function or variable with the same name as an `NT` export the page imports
- Change shared behavior in the owning `assets/nt-*.js` module, never by overriding it in one tool

### Architectural Smell: Deferred or Modular Shared-Module Includes

- Include every `assets/nt-*.js` module as a plain `<script src>`: no `defer`, no `async`, no `type="module"`
- Place the includes immediately before the tool's own inline script, in the order core, bigint, svg, store, layout

### Architectural Smell: Monolithic Tool File (1000+ lines)

- Import block from `NT` (one `const { ... } = NT.NAME;` line per namespace used, first thing in the script)
- Tool-specific geometry/helper functions not already covered by an `NT` import
- State initialization and defaults
- Render functions (rebuild DOM/SVG)
- Event handler wiring (input, button, keyboard)
- Initialization on DOMContentLoaded

### Architectural Smell: Concatenating Translated Fragments

- Write one whole-sentence dictionary value per language, with `{0}`/`{name}`-style placeholders for the variable parts, and call `translate()`/`translateInto()` once per message, never concatenating two translated pieces.

### Architectural Smell: Prose via innerHTML

- Build the sentence via DOM construction (`createElement`/`createTextNode`) and `translateInto()` with Node params for any embedded `<strong>`/`<sup>`/`<span>` child, matching the project's long-standing DOM-construction convention for every other dynamic region.

### Architectural Smell: Tight Coupling to localStorage Key Name

- Factor Tree: `'factor-tree'`
- Congruence Wheel: `'congruence-wheel'`
- RSA: keeps no tool-specific key; persists nothing beyond the shared theme preference

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
