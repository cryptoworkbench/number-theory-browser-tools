# Phase 06 — UI Review

**Audited:** 2026-10-01
**Baseline:** Abstract 6-pillar standards (no UI-SPEC.md)
**Screenshots:** Not captured (dev server running different project)
**Interaction captures:** off (workflow.ui_interaction_capture is false)

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 4/4 | All strings translated into 5 languages with proper glossary adherence; no generic labels |
| 2. Visuals | 4/4 | Language switcher clearly visible with globe icon + label; proper header hierarchy |
| 3. Color | 4/4 | All colors use palette tokens via var(); no hardcoded hex/rgb values |
| 4. Typography | 4/4 | Consistent font sizes and weights; proper visual hierarchy |
| 5. Spacing | 4/4 | Consistent spacing scale (4px–14px); responsive via clamp() |
| 6. Experience Design | 3/4 | Proper accessibility (aria-labels, focus-visible); state preservation verified; code fragility in edge cases |

**Overall: 23/24**

---

## Top 3 Priority Fixes

1. **WR-02: Add global flag to PARAM_RE regex** — Inconsistency between `decorateLinks` (non-global) and `stripUrlParam` (global) can cause duplicate `lang=` params in edge cases — Add `g` flag to `PARAM_RE` in `assets/nt-i18n.js:61` and use a shared factory function to prevent divergence

2. **WR-01: Document rich-template cache constraints** — `richChildrenMap` in `applyStaticDom()` will silently discard or resurrect DOM children if page code mutates them after load — Add loudly-commented guard ("a rich `data-i18n` element's children must never be mutated after load") at line 287 and in `register()` call sites, or implement self-healing by re-capturing children when count changes

3. **WR-03: Mark state-destroying functions to prevent regression** — Informal invariant that `renderMessages()` must never appear in `onLangChange` handlers (RSA, Diffie-Hellman, others) has no structural enforcement — Add consistent `// STATE-DESTROYING: do not call from onLangChange` comment above every full-rebuild function so future diffs have something greppable to check

---

## Detailed Findings

### Pillar 1: Copywriting (4/4)

**EXCELLENT — No defects.**

- **Complete translation coverage:** All 17 i18n dictionary files (`assets/i18n/*.js`) present and contain entries for all 5 supported languages (nl, en, de, fr, es). Verified flat-key parity across all languages per code review.
- **No generic labels:** Grep found zero instances of generic UI labels ("Submit", "OK", "Cancel", "Click Here", "Save") across all 17 i18n files. Every CTA and message is context-specific and translated.
- **Glossary adherence:** Tool names, mathematical terms (prime, composite, factor, gcd, lcm, etc.) follow the 06-GLOSSARY.md terminology decisions and per-language tone (informal Dutch/German/Spanish, formal French, neutral English). Eponym spelling (Eratosthenes, Euler, Fermat) handled per glossary.
- **Plural forms:** Complex plural entries (`{one, other}` syntax) present in Sieve's `banner.done` and handled correctly by `Intl.PluralRules` logic in `assets/nt-i18n.js:180-188`.
- **Placeholder consistency:** All placeholder names (`{n}`, `{count}`, `{time}`, `{0}`, `{1}`, `{2}`) consistent across languages per code review's 72-key audit.
- **No hardcoded numerals in dictionaries:** Math output (RSA moduli, GCD results) never locale-formatted; numerals stay byte-identical across all languages per CLAUDE.md's numerals-are-never-locale-formatted rule.

### Pillar 2: Visuals (4/4)

**EXCELLENT — Clear hierarchy and legible design.**

- **Language switcher visibility:** New `.lang-switch` component sits prominently between the nav bar and the theme toggle in the header (`Sieve Of Eratosthenes/sieve-of-eratosthenes.html:386-395`), with a globe emoji icon (🌐) paired with a `<select>` dropdown showing language names in native script (Nederlands, English, Deutsch, Français, Español).
- **Visual hierarchy:** Header layout is `[brand] [nav] [lang-switch] [theme-toggle]`. The language switcher uses `inline-flex` with 6px gap between icon and select, making the switch accessible without overwhelming the header.
- **Icon + label pairing:** The globe icon has `aria-hidden="true"` and pairs with a visible label rendered from `data-i18n-title="site.lang.label"`, so the component is self-documenting without relying on the icon alone.
- **Responsive behavior:** At 760px breakpoint, header layout shifts to center-aligned flexbox, keeping the language switcher legible on mobile (same breakpoint as the theme toggle).
- **Proper focal points:** Each page maintains clear visual hierarchy: page title (gradient text, `clamp(1.4rem, 3.2vw, 2.1rem)`), subtitle/lede, control panels, and main visualization — the language switcher in the header does not compete with page-level focal points.
- **Minor: Native `<select>` styling variations** — The dropdown uses browser-native `<option>` styling, which varies across browsers/OSes (Chrome/Firefox desktop render option backgrounds differently, Safari doesn't support all CSS). This is acceptable for a vanilla HTML project, but tool-specific `<optgroup>` or a custom dropdown component would offer more control. No blocker; native control is more accessible.

### Pillar 3: Color (4/4)

**EXCELLENT — Palette-token compliance, no hardcoded colors.**

- **All switcher colors via var():** `.lang-switch select` uses `color: var(--st-header-text)`, `background: var(--st-active-bg)`, `border: 1px solid var(--st-header-border)` — every color token-routed, not hardcoded.
- **Options inherit palette:** `<option>` elements styled with `color: var(--text)` and `background: var(--bg-1)`, pulling from the site's shared palette.
- **Focus-visible accent:** Focus state uses `outline: 2px solid var(--st-header-accent)` with proper offset, matching the theme toggle's own focus styling.
- **No hardcoded hex/rgb:** Grep of `assets/site.css` and all page `<style>` blocks found zero literal hex colors (`#xxx`), no `rgb()` or `rgba()` calls in the new switcher code.
- **Theme-aware:** Both day and night themes supported via the shared `data-theme="day|night"` attribute; all var() tokens are defined in `assets/palette.css` for both themes.
- **Opacity used intentionally:** The globe icon uses `opacity: 0.75` as a design choice (not a color value), which is appropriate for a decorative icon.

**Color distribution:** The language switcher uses semantic roles (header text, active bg, border, accent) rather than raw brand colors. The new component does not over-use accent colors; it appears in one element (the focus outline) and reserves the accent for the primary CTA (Generate button, Play button, etc.) on tool pages.

### Pillar 4: Typography (4/4)

**EXCELLENT — Consistent sizes and weights, proper hierarchy.**

- **Font sizes in switcher:** `.lang-switch select` uses `font-size: 0.82rem` and `.lang-switch-icon` uses `font-size: 0.8rem`, both smaller than body text (typically 15px base) to de-emphasize secondary controls while keeping them legible. Sizes are consistent with other secondary controls in the header (theme toggle).
- **Font inheritance:** The select element uses `font: inherit`, inheriting the page's sans-serif family (`'Segoe UI', system-ui, -apple-system, Roboto, sans-serif`) rather than defaulting to the browser's monospace or serif fallback.
- **Font weights:** No explicit font-weight set on the switcher (defaults to `font-weight: 400` / normal), matching the body text. Page headings use `font-weight: 700` for hierarchy.
- **Letter-spacing:** Headers use `letter-spacing: 0.5px` for distinction; the switcher does not override, keeping neutral spacing.
- **Text transform:** No `text-transform` applied to the switcher (option text is capitalized in the dictionary, not via CSS), which is correct for proper casing per language (e.g., "Español" in Spanish, not "ESPAÑOL").
- **Line height:** `.lang-switch-icon` sets `line-height: 1` to compress the icon vertically, keeping it aligned with the select box baseline.

**Consistency:** Font size distribution across the site shows 0.8rem (icon), 0.82rem (select), 0.95rem (nav links), and title sizes up to 2.1rem; no font creep or excessive size proliferation.

### Pillar 5: Spacing (4/4)

**EXCELLENT — Consistent scale, responsive design.**

- **Spacing values used:** The language switcher uses `gap: 6px` (icon to select), `margin-left: 10px` (switcher to previous element), `padding: 4px 8px` (inside select), and `outline-offset: 2px` (focus ring offset). All values are even increments (multiples of 2px) and part of a coherent scale.
- **Comparison to page spacing:** Main controls use `gap: 14px` (flex rows), smaller grouped controls use `gap: 4px` or `6px` — the switcher's 6px is appropriate for a compact header element.
- **Responsive padding:** The `.app` container uses `padding: clamp(12px, 3vw, 32px)` for responsive spacing; the switcher does not need this (fixed header) but the approach is consistent with the site's responsive philosophy.
- **Breakpoint consistency:** At the 760px mobile breakpoint, the header reflow uses the same spacing values; no compressed-mode spacing surprises.
- **No arbitrary values:** No `[12.5px]` Tailwind-style arbitrary spacing; all values (4, 6, 8, 10, 14, 18) form a clean scale.

**Vertical rhythm:** The select's `padding: 4px 8px` yields ~24px height (accounting for line-height and border), matching the nav link height; the switcher sits vertically centered in the header without gaps.

### Pillar 6: Experience Design (3/4)

**GOOD — Proper accessibility and state preservation; code fragility noted.**

#### Strengths

- **Aria-labels:** Both the `<label>` and `<select>` carry `aria-label="Language"` paired with `data-i18n-aria-label="site.lang.label"`, so screen readers announce the control's purpose in the active language.
- **Focus-visible styling:** Clear 2px solid outline on tab focus with 2px offset, matching the theme toggle and meeting WCAG 2.1 Level AA standards.
- **Data-i18n integration:** The select's `<option>` labels are hardcoded in English but bound to the DOM (not from dictionaries); however, the select's aria-label and title are translated via `data-i18n-aria-label="site.lang.label"` and `data-i18n-title="site.lang.label"`, so the control's label is localized.
- **State preservation on switch:** Code review confirmed (via inspection of every tool page's `onLangChange` handler) that switching languages does NOT re-run the tool's initialization, does NOT reset user inputs or playback state, and does NOT wipe scratchpads or selections. The language switch only re-renders translated text and updates link `href`s to include `?lang=`.
- **Cross-tab sync:** The language choice persists to `localStorage` and cookie, and a storage event listener in another tab applies the change without re-persisting (avoiding double-write or storm loops).
- **Link propagation:** All `<a>` elements are decorated with `?lang=` on page load and re-decorated on every language switch via `decorateLinks()`, including dynamically-built cross-tool reference links (Cayley ↔ Equivalence Wheel, etc.) which explicitly re-run on `onLangChange`.

#### Defects and Fragility (code-level, from 06-REVIEW.md)

- **WR-02: Non-global regex in decorateLinks** — `PARAM_RE` lacks the `g` flag, so `href.replace(PARAM_RE, '$1')` only removes the *first* `lang=` occurrence. If any link ever has `lang=` twice before hitting `decorateLinks` (via a bug in dynamic link generation), the href leaks a duplicate param. `stripUrlParam()` (line 426–428) correctly uses a global regex; the inconsistency is a maintenance trap. **Functional impact today: None** (decorateLinks always produces at most one `lang=` per href, then appends exactly one). **Impact if a future tool builds hrefs with multiple lang= params: Potential stale lang value in URL.**

- **WR-01: Rich-template cache fragility** — `applyStaticDom()` caches a rich `data-i18n` element's child elements on first visit (line 318–327), then re-inserts the cached children on every language switch without re-capturing. If a tool's JS mutates the children *after* load (appends an icon, removes a legend item), the next language switch will silently discard new children or resurrect removed ones. **Functional impact today: None** (all current rich `data-i18n` elements are static markup). **Impact if a future tool dynamically updates a rich-template's children: Silent child resurrection/deletion on language switch.**

- **WR-03: Informal state-preservation invariant** — Every tool page has an `onLangChange` handler that deliberately does NOT call full-rebuild functions like `renderMessages()` (see RSA/rsa.html:966–969, 1407–1430 for the comment "never rebuild"). This invariant is documented only in prose comments, with no structural enforcement (no lint rule, no `assert`, no naming convention). **Functional impact today: None** (every tool's handler is written correctly). **Impact if a future dev simplifies an `onLangChange` handler by calling a rebuild function to "reuse code": User's typed input or playback state silently wipes on a language switch.**

#### Scoring Rationale for 3/4

These three defects are not currently user-visible (the UI works correctly today), but they represent fragile code patterns that could silently break in future maintenance. The adversarial audit stance requires surfacing edge cases and maintenance traps, not just current functionality. The UI itself is well-designed and accessible; the defects are in the supporting JavaScript layer. Score reduced from 4 to 3 to flag these structural risks.

---

## Files Audited

**Core i18n module:**
- `assets/nt-i18n.js` (478 lines) — language resolution, persistence, DOM translation, storage-event sync

**Dictionary files (17 total):**
- `assets/i18n/site.js` — brand, nav labels, language/theme switcher labels (site + common namespaces)
- `assets/i18n/hub.js` — index.html page titles and descriptions
- `assets/i18n/sieve-of-eratosthenes.js`, `assets/i18n/factor-tree.js`, ... (15 more) — one per tool page

**CSS:**
- `assets/site.css` (`.lang-switch*` rules, ~30 lines) — switcher styling, responsive breakpoint

**HTML pages modified (16 total):**
- `index.html` — header, i18n script includes, data-i18n attributes on all nav links, hero text, card grid
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` — language switcher in header, data-i18n attributes, i18n script includes, dynamic banner translation
- 14 other tool pages (Factor Tree, RSA, Equivalence Wheel, Euclidean Algorithm, Chinese Remainder Theorem, Euler's Totient, Cayley Table, Group Isomorphism, Square and Multiply, Diffie-Hellman Key Exchange, Elliptic Curve Diffie-Hellman, Venn Diagram, Fermat's Method, Shor's Algorithm) — all follow the same pattern

**Total scope:** 17 i18n files created, 1 CSS module modified, 16 HTML pages modified, 1 core JS module created. All 16 pages + hub now ship 5-language support with persistent user choice, cross-tab sync, and state preservation on switch.

---

## Summary

Phase 06 successfully implements site-wide multi-language support across all 16 tools and the hub page, with comprehensive translations in Dutch, English, German, French, and Spanish. The language switcher is well-designed, accessible, and properly integrated into the header. All colors and spacing follow the project's design system; copywriting adheres to the phase's glossary; and user state is preserved across language switches without side effects.

Three code-level defects were identified by the code review (WR-01, WR-02, WR-03) that do not currently impact users but represent fragility in edge cases or future maintenance scenarios. These are noted above as priority fixes to improve robustness and prevent regression. No BLOCKER-level defects were found. The UI audit scores 23/24 overall.
