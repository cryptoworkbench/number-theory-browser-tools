---
quick_id: 261003-kwa
status: complete
commits:
  - c28e87a  # shared foundation: palette, header/menu, fonts, emoji strip
  - 2ef5493  # per-page normalisation + Factor Tree de-seasoning
  - a6da488  # hub
---

# Quick 261003-kwa: Mature visual refinement — Summary

Executed inline (planning and execution in the orchestrator session, no planner/executor
subagents) because the design decisions depended on before/after screenshots taken in-session.

## What changed

**Shared foundation (`assets/`)**
- `palette.css`: same token names and role meanings, desaturated values. Night uses a graphite ground
  `#111318` with a muted ink-blue accent `#8ea6de`; day uses cool paper `#f6f7f9` with accent
  `#2f4c96`. Every text/fill pair is ≥ 4.5:1. `--role-result-ink` is now white in day mode
  (dark ink on the deeper day sage measured 3.44:1).
- `site.css`: `--font-sans/serif/mono`, `--radius-ctl` (6px), `--radius-card` (10px), `--ctl-focus`,
  `--ease-ctl` tokens. The header is one 52px row (brand · Tools menu · day/night switch with SVG
  icons), down from three rows/~155px. The Tools menu lists all 16 pages in a 3-column panel
  (2 columns ≤ 760px, 1 column ≤ 420px). Shared focus-visible rings and an icon-button shape.
- `theme.js`: menu behaviour (aria-expanded, Escape closes and refocuses, outside click/focus closes).
- One Google Fonts link on every page: Source Serif 4 + Source Sans 3 + JetBrains Mono. Fraunces,
  Poppins, Mountains of Christmas and the Segoe-first stack are gone.

**i18n (16 languages)**
- 849 emoji sequences stripped from dictionary values and markup (✅/❌ → ✓/✗). `rsa.eveSeesOnlyC`
  regained its subject ("Eve sees only c") in every language.
- New keys: `site.menu`, `sieve.sound`, `hub.group.primes|modular|crypto`.
- Changed: `hub.hero.title` ("Number theory, visualized"), `hub.card.factorTree.desc` (seasonal clause
  dropped).
- Removed: `hub.hero.eyebrow`, `hub.openTool`, `crt|euclid|totient.eyebrow`.
- `i18n-config/*.json` allowLiteral keys `"▶ Play"` → `"Play"`.

**Tool pages**
- Flat page ground, one serif title + 68ch lede treatment, solid primary buttons, no hover
  lift/press scale/backdrop blur/all-caps labels, 16px base text, left-aligned example chips.
- Sieve: sound toggle is an SVG speaker with `aria-pressed` and a translated label; glows and the
  completion sweep removed.
- RSA/DH/ECDH: emoji avatars → small participant colour dots.
- Factor Tree: starfield, snow, pine silhouette, fairy lights, trunk, star and display font removed.
  Edges now render beneath all nodes (previously lines crossed parent labels).

**Hub**: left-aligned hero, tools grouped into three labelled sections, 9 emoji icons redrawn as
line-diagram SVGs, two-column cards.

## Verification
- `i18n-check.js --all`: coverage, header, includes, no-locale-number-format, literals-markup and
  literals-js all PASS on 16 pages. `--smoke` PASS (123 assertions).
- `i18n-browser.js --mode langs,switch,layout`: PASS on 11 pages (Sieve, Cayley, CRT, DH, ECDH, Wheel,
  Euclid, Totient, Factor Tree, Fermat, Isomorphism). The run was stopped by the host for low memory
  before RSA, Shor, Square and Multiply, Venn and the hub; those five still need it.
- Headless screenshots reviewed for all 16 pages (night), Factor Tree/RSA/hub (day), hub at 390px,
  and the open Tools menu in German.

## Not changed (deliberately)
- Diagram colours and teaching animations inside each tool (beyond removing glows) — they carry meaning.
- Playful copy inside tools (for example the Sieve's "No numbers were harmed" footnote) — copy edits
  need 16-language rewrites; left for a follow-up.
