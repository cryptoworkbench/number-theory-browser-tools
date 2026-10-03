---
quick_id: 261003-kwa
mode: quick
type: execute
autonomous: true
files_modified:
  - assets/palette.css
  - assets/site.css
  - assets/theme.js
  - assets/i18n/*.js
  - index.html
  - "*/*.html (all 15 tool pages)"
---

# Quick 261003-kwa: Mature visual refinement

**Goal:** Make the site read as a calm, precise learning instrument instead of a toy. The diagrams
keep their colour and motion because they do the teaching. The site chrome, controls and typography
around them get quieter and more consistent.

Guidance applied: `frontend-design` (one bold element, cut decoration, no template tells such as
all-caps eyebrows or emoji icons) and `ui-ux-pro-max` (contrast ≥ 4.5:1, visible focus, 36–44px
targets, no hover lift, reduced motion, semantic tokens only).

## Design system (locked for this task)

| Axis | Decision |
|------|----------|
| Night ground | cool graphite `#111318` / raised `#171a21`, no radial colour washes |
| Day ground | cool paper `#f6f7f9` / raised `#ffffff` (deliberately not cream) |
| Accent | muted ink blue (night `#8ea6de`, day `#2f4c96`); one solid fill, no gradients |
| Role hues | same meanings, desaturated: sage result, ochre active, brick warn, muted violet special, dusty mauve alt |
| Type | Source Serif 4 (page titles, card titles) + Source Sans 3 (UI/body) + JetBrains Mono (numbers/math) on every page via `--font-serif/--font-sans/--font-mono` tokens; Fraunces, Poppins, Mountains of Christmas and Segoe-first stacks removed |
| Controls | 36px tall, 6px radius, 1px border, solid primary, 120ms colour-only transitions, 2px focus-visible ring, no translateY hover lift, no scale-on-press |
| Panels | 10px radius, hairline border, no backdrop blur, no glow shadows |
| Header | one 52px row: brand · "Tools" menu button (all 16 links in a grid panel) · day/night switch with SVG icons |
| Icons | no emoji anywhere in UI chrome, buttons, or translated strings; hub cards use small line-diagram SVGs |
| Page headers | left-aligned serif title + dim lede (≤ 68ch), solid ink colour |

## Tasks

### Task 1: Shared foundation
- files: `assets/palette.css`, `assets/site.css`, `assets/theme.js`, canonical `<header class="site-header">`
  and `<footer class="site-footer">` on all 16 pages, Google Fonts `<link>` on all 16 pages, `assets/i18n/*.js`
- action: retune both palettes; add font/radius/control tokens; rebuild the header as a single row
  with a disclosure menu (`aria-expanded`, Esc/outside-click close, focus return) driven by `theme.js`;
  replace 🌙/☀️/🌐 glyphs with inline SVG; unify the font link; strip pictographic emoji from every
  dictionary value in all 16 languages (✓/✗ text marks kept, ✅/❌ mapped to ✓/✗).
- verify: `node .planning/phases/06-multi-language-support/i18n-check.js --all` passes (header + footer stay byte-identical across pages).
- done: every page renders the new header/footer/palette with no console errors.

### Task 2: Per-page normalisation
- files: all 15 tool pages
- action: flat page background; solid-ink serif titles; solid primary buttons; token fonts; 6px
  control radius; remove hover lift/press scale and decorative glows; sentence-case field/stat labels;
  Factor Tree loses its seasonal theme (snow, stars, tree silhouette, fairy lights, display font) but keeps
  the factor-tree diagram and its animation; RSA/DH/ECDH participant avatars become monogram discs.
- verify: i18n-check `--all`; headless screenshots of every page in night and day with no console errors.

### Task 3: Hub
- files: `index.html`, `assets/i18n/hub.js`
- action: left-aligned hero with a sober title ("Number theory, visualized" in 16 languages); eyebrow removed;
  card grid tightened; the 9 emoji card icons replaced by line-diagram SVGs matching the 6 existing ones;
  Factor Tree card description drops the "decorated for the season" clause in all languages.
- verify: i18n-check `--all`; screenshots at 1280 and 390 wide.
