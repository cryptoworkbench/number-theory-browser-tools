---
last_mapped_commit: 5bb8919024dcaaee469701a9086df5dc814ba501
last_mapped_at: 2026-09-23
---
# Technology Stack

**Analysis Date:** 2026-09-23

## Languages

**Primary:**

- HTML5 - Markup for all pages
- CSS3 - Styling with custom properties, animations, responsive design
- JavaScript (ECMAScript 2020+) - Application logic, number theory algorithms, SVG rendering

**Standards Used:**

- ES2020 (BigInt support for large-number arithmetic in RSA tool)
- SVG (Scalable Vector Graphics for animated diagrams)
- DOM APIs, Canvas not used

## Runtime

**Environment:**

- Modern web browsers (Chrome, Firefox, Safari, Edge)
- Requirements: ES2020 support, SVG support, localStorage API
- No server runtime (purely client-side)

**Platform:**

- Browser-based, cross-platform (Windows, macOS, Linux)

## Frameworks

**None.** The codebase uses vanilla JavaScript with no frameworks (React, Vue, Angular, Svelte, etc.) or build tools (webpack, Vite, Parcel, etc.).

## Key Dependencies

**External Resources (CDN):**

- Google Fonts (`https://fonts.googleapis.com`)
  - Fonts loaded per-tool via `<link rel="stylesheet">` tags
  - Includes: Fraunces, Source Sans 3, JetBrains Mono, Mountains of Christmas, Poppins

**Built-in Browser APIs Used:**

- `document.createElementNS()` for SVG creation
- `localStorage` for theme preference and tool state persistence
- `requestAnimationFrame` for animation loops (Sieve tool, Completing-the-Square tool)
- `performance.now()` for timing measurements
- `BigInt` native type (RSA tool for cryptographic calculations)

## Configuration

**Environment:**

- No environment variables required
- All configuration via CSS custom properties (`:root` variables)
- Theme system (day/night mode) persisted in `localStorage` under key `site-theme`

**CSS Custom Properties:**
Each tool has its own color palette via `:root` CSS variables, with separate theming for light (`[data-theme="day"]`) and dark (`[data-theme="night"]`) modes:

- Background colors: `--bg`, `--bg-1`, `--bg-2`
- Text colors: `--ink`, `--text`, `--text-dim`
- Accent colors: `--accent`, `--accent-2`
- Layout tokens: `--panel`, `--panel-border`

**Build:**

- No build configuration files present
- No `package.json`, `tsconfig.json`, `.eslintrc`, or similar configuration
- Direct HTML file execution (open `.html` files in browser via `file://` URL)

## Platform Requirements

**Development:**

- Text editor or IDE (no tooling required)
- Modern browser for testing changes

**Production / Deployment:**

- Static file hosting (GitHub Pages, Netlify, any HTTP server serving files)
- No backend, database, or server-side runtime required

## Storage

**Client-side Only:**

- `localStorage` for theme preference (`site-theme` key)
- Per-tool state persistence in `localStorage`:
  - Congruence Wheel tool: `congruence-wheel` key stores N and depth parameters
  - No other persistence; other tools recalculate on each use

**No Server-Side Storage:**

- All calculations are ephemeral
- No user accounts, sessions, or databases

## Performance Characteristics

**Numbers Module (per tool):**

- Inline, pure JavaScript number-theory functions (no optimization libraries):
  - `primeFactors()`, `isPrime()`, `smallestPrimeFactor()` (trial division)
  - `bigGcd()`, `modPowPlain()` (Euclidean algorithm, modular exponentiation)
  - `isPrimeBig()` (Miller-Rabin primality test for RSA tool using `BigInt`)
- Optimized for clarity over performance; suitable for educational visualization
- Trial division for factorization (no advanced sieves or Pollard's rho)

**Rendering:**

- SVG for all diagrams (hand-drawn via `document.createElementNS`, not canvas)
- CSS animations via `@keyframes` for decorative effects (snow, twinkling stars)
- Playback controls use `setTimeout` with a `generation` counter to invalidate stale callbacks

---

*Stack analysis: 2026-09-23*
