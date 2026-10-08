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
- `requestAnimationFrame` for animation loops (Sieve tool, Fermat's Method tool)
- `performance.now()` for timing measurements
- `BigInt` native type (RSA tool for cryptographic calculations)

## Configuration

**Environment:**

- No environment variables required
- All configuration via CSS custom properties (`:root` variables)
- Theme system (day/night mode) persisted in `localStorage` under key `site-theme`
- Language preference (nl/en/de/fr/es/it/pl/pt-BR/pt-PT/sv/nb/ro/hu/lv/ru/el/he/hi/ar/sq/sw/zh/ja/ko/id/zgh-Latn/zgh-Tfng/ku/ckb/sa/la) persisted under key `site-lang`, mirroring the theme preference's cookie + localStorage pattern exactly (same cookie attributes, same URL-param > cookie > localStorage > browser-default read order), owned entirely by `assets/nt-i18n.js`; the `?lang=` URL parameter can override it for one load and is stripped from the address bar after the value is folded into the durable stores; browser-language detection resolves a browser's Albanian preference (`sq`, `sq-AL`, `SQ_xk`: any region, any case, `-` or `_`) to `sq` and its Swahili preference (`sw`, `sw-KE`, `SW_tz`) to `sw`, while `en-KE` stays English; every Chinese browser tag (`zh`, `zh-CN`, `zh-TW`, `zh-Hant-TW`, `zh-HK`: any region or script subtag, any case, `-` or `_`) resolves to `zh`, which is Simplified Chinese (Traditional-script readers get Simplified rather than English), `ja`/`ja-JP` to `ja` and `ko`/`ko-KR` to `ko`, while `en-SG` stays English; a browser's Indonesian preference (`id`, `id-ID`, `ID_id`: any region, any case, `-` or `_`) resolves to `id` while `en-ID` stays English, and the legacy Indonesian tag `in` (`in`, `in-ID`) maps to `id` in detection only (`in` is never an accepted code on any other channel); a browser tag whose primary subtag is `zgh`, `tzm` or `ber` (any case, `-` or `_`) resolves to `zgh-Latn` when it carries a `Latn` script subtag and to `zgh-Tfng` otherwise (Tifinagh is the official script of zgh), while `kab`, `shi` and `rif` are not mapped; a browser tag whose primary subtag is `ckb` (any region, script or case, `-` or `_`), or a `ku` tag carrying an `Arab` script subtag (`ku-Arab`, `ku-Arab-IQ`), resolves to `ckb`, while `kmr` (Northern Kurdish) and every other `ku` tag (`ku`, `ku-TR`, `ku-Latn`) resolve to `ku` and `sdh` (Southern Kurdish) and `lki` are not mapped, while Sanskrit and Latin need no detection branch: `sa`, `sa-IN` and the ISO 639-2 `san` (any case, `-` or `_`) reach `sa`, and `la`, `la-VA` and `lat` reach `la`, through the two-letter fallback, which also maps the unrelated three-letter tags sharing those prefixes (Santali `sat`, Yakut `sah`, Sango `sag` and the like to `sa`; Ladino `lad`, Lahnda `lah`, the ISO 639-2 Latvian `lav` and a bare `Latn` script subtag to `la`), a recorded collision
- `Intl.PluralRules` is the one `Intl` API this project uses (for pluralizing a dictionary value with a `{one, other}` shape, or `{one, few, many, other}` for Polish and Russian, `{one, few, other}` for Romanian or `{zero, one, other}` for Latvian, or `{one, two, other}` for Hebrew, or `{zero, one, two, few, many, other}` for Arabic; Hindi uses the plain `{one, other}` shape, where `one` also covers 0; Albanian and Swahili use the plain `{one, other}` shape too, where 0 and fractions select `other`; Chinese, Japanese, Korean and Indonesian use the single-category `{other}` shape, where `Intl.PluralRules` reports only `other`, so their one form reads correctly for every count and Indonesian marks plurality only by reduplication, which never follows a count; Standard Moroccan Tamazight (`zgh-Latn`, `zgh-Tfng`) uses `{one, other}` with `one` for exactly 1, a rule `NT.i18n` fixes itself because `Intl.PluralRules` has no zgh data and would fall back to the runtime's default locale; Sanskrit (`sa`) uses `{one, two, other}` (`one` for exactly 1, `two` for exactly 2, its grammatical dual) and Latin (`la`) uses `{one, other}` (`one` for exactly 1), rules `NT.i18n` fixes itself (FIXED_PLURAL_LANGS, with FIXED_DUAL_LANGS for the dual) because `Intl.PluralRules` has no sa or la data and would fall back to the runtime's default locale; Kurmanji and Sorani Kurdish use `{one, other}` with `Intl.PluralRules`' own CLDR data (`one` for exactly 1)); no other `Intl` formatting (number/date/currency) is used — numerals stay plain and locale-independent per I18N-06

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

- `localStorage` for theme preference (`site-theme` key) and language preference (`site-lang` key, a raw language code, either two-letter, the three-letter `ckb`, the region-tagged `pt-BR`/`pt-PT` or the script-tagged `zgh-Latn`/`zgh-Tfng`, same cookie + localStorage pattern as theme)
- Per-tool state persistence in `localStorage`:
  - Congruence Wheel tool: `congruence-wheel` key stores N and depth parameters
  - No other persistence; other tools recalculate on each use

**No Server-Side Storage:**

- All calculations are ephemeral
- No user accounts, sessions, or databases

## Performance Characteristics

**Numbers Module (shared):**

- Pure JavaScript number-theory functions (no optimization libraries), living in `assets/nt-core.js` (`NT.core`, plain `Number` domain) and `assets/nt-bigint.js` (`NT.bigint`, `BigInt` domain):
  - `primeFactors()`, `isPrime()`, `smallestPrimeFactor()` (trial division) — `NT.core`
  - `bigGcd()`, `modPowPlain()` (Euclidean algorithm, modular exponentiation) — `NT.bigint`
  - `isPrimeBig()` (Miller-Rabin primality test for RSA tool using `BigInt`) — `NT.bigint`
- Optimized for clarity over performance; suitable for educational visualization
- Trial division for factorization (no advanced sieves or Pollard's rho)

**Rendering:**

- SVG for all diagrams (hand-drawn via `document.createElementNS`, not canvas)
- CSS animations via `@keyframes` for decorative effects (snow, twinkling stars)
- Playback controls use `setTimeout` with a `generation` counter to invalidate stale callbacks

---

*Stack analysis: 2026-09-23*
