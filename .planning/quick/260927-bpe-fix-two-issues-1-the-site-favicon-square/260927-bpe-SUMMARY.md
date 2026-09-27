---
phase: quick-260927-bpe
plan: 01
subsystem: ui
tags: [svg, favicon, palette, congruence-wheel, hub]

requires: []
provides:
  - "assets/favicon.svg — shared numbered 1-2-3-4 tab-icon asset"
  - "rel=\"icon\" link wired into all ten pages' <head>"
  - "Inline two-ring 12-hour clock SVG replacing the pizza emoji on the Congruence Wheel hub card"
affects: [index.html, "Congruence Wheel"]

actuals:
  tokens: 3742
  tasks: 3
  commits: 3
  plan_head_before: 6cdb9b949d5ce5b046b9ea0436f5402ea86b87ed
  plan_head_after: fc82a3da91b45b9134d0c2e3f137398a582337c4

tech-stack:
  added: []
  patterns:
    - "Favicon is the one file on the site exempt from CLAUDE.md's var()-only color rule (documented in-file): a favicon is fetched as its own document and cannot resolve the host page's CSS custom properties, so its two colors are copied verbatim from assets/palette.css (night default plus an optional prefers-color-scheme: light swap to day values)."
    - "Hub card icons that are SVG (not emoji) get color exclusively through class-based CSS rules referencing assets/palette.css var() tokens, never as SVG presentation attributes, keeping index.html literal-color-free."

key-files:
  created:
    - assets/favicon.svg
  modified:
    - index.html
    - Congruence Wheel/congruence-wheel.html
    - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
    - Factorize By Completing The Square/factorize-completing-square.html
    - Factor Tree/factor-tree.html
    - RSA/rsa.html
    - Shors Algorithm/shors-algorithm.html
    - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
    - Square And Multiply/square-and-multiply.html
    - Venn Diagrams/venn-diagrams.html

key-decisions:
  - "Favicon plate/ink colors copied verbatim from :root --accent / --accent-ink (night, default) with an optional @media (prefers-color-scheme: light) swap to the day-theme values, per the plan's spec — both variants use only literals already present in assets/palette.css."
  - "Icon link inserted immediately after each page's <title> and before its palette stylesheet link, using a bare assets/ prefix on index.html and ../assets/ on the nine tool pages one directory down."
  - "Clock icon geometry (two rings at r=10.4/6.2, twelve ticks at 30-degree steps, one highlighted class-0 wedge, hour+minute hands, pivot dot) computed via polar-to-Cartesian math and verified against the plan's exact wedge path and tick endpoints before writing markup."

patterns-established:
  - "Hand-copied color literals in a non-HTML asset (favicon) must be traceable verbatim to assets/palette.css; a machine check (grep colors out of the file, confirm each exists in palette.css) is the drift gate."

requirements-completed: [NAV-01, NAV-02, PAL-02, PAL-04]

coverage:
  - id: D1
    description: "assets/favicon.svg exists, is valid XML, contains no active content or external reference, and every color literal in it appears verbatim in assets/palette.css"
    requirement: PAL-02
    verification:
      - kind: other
        ref: "xmllint --noout assets/favicon.svg && node color-trace check (Task 1 verify gate)"
        status: pass
    human_judgment: false
  - id: D2
    description: "All ten pages (hub + nine tools) declare a rel=\"icon\" link whose href resolves to assets/favicon.svg relative to that page's own directory"
    requirement: NAV-02
    verification:
      - kind: other
        ref: "repo-root resolution loop over index.html and */*.html (Task 2 verify gate) — 10/10 OK"
        status: pass
      - kind: manual_procedural
        ref: "python3 -m http.server + curl HEAD on assets/favicon.svg — 200, Content-type: image/svg+xml"
        status: pass
    human_judgment: false
  - id: D3
    description: "Congruence Wheel hub card shows a two-ring, twelve-divider clock face with hands and a highlighted class-0 wedge; the pizza-slice food emoji is gone from index.html; index.html remains literal-color-free"
    requirement: PAL-04
    verification:
      - kind: other
        ref: "node codepoint scan (food glyph absent) + element-count greps (12 ticks, 2 rings, 1 wedge, 2 hands) + literal-color grep (Task 3 verify gate)"
        status: pass
      - kind: automated_ui
        ref: "headless Chrome screenshots of index.html in night and day theme (scratchpad hub-night.png / hub-day.png) — clock icon renders at sibling icon size in both themes"
        status: pass
    human_judgment: false

duration: 15min
completed: 2026-09-27
status: complete
---

# Quick Task 260927-bpe: Site Favicon + Congruence Wheel Card Icon Summary

**Added a shared numbered-tile SVG favicon wired into all ten pages, and replaced the Congruence Wheel hub card's pizza emoji with an inline two-ring 12-hour clock icon that echoes the tool's own diagram.**

## Performance

- **Duration:** ~15 min
- **Tasks:** 3/3 completed
- **Files modified:** 11 (1 created, 10 modified)
- **Commits:** 3

## Accomplishments

- Created `assets/favicon.svg`, a self-contained, inert SVG tab icon (rounded tile + four digits "1234" in a 2x2 grid) whose two colors are copied verbatim from `assets/palette.css` (night `--accent`/`--accent-ink` by default, with an optional light-scheme swap to the day values).
- Wired `<link rel="icon" type="image/svg+xml" ...>` into all ten pages' `<head>` — bare `assets/` prefix on the hub, `../assets/` on the nine tool pages — each inserted right after `<title>` and before the palette stylesheet link.
- Replaced the pizza-slice emoji on the hub's Congruence Wheel card with an inline `wheel-icon` SVG: two concentric rings, twelve 30-degree tick dividers (one per residue class of the additive group of order 12), one highlighted class-0 wedge, an hour hand at 12 and a minute hand at 4, and a pivot dot — all colored via new `.wheel-icon-*` class rules against existing `var()` palette tokens.

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end tab icon — the asset plus one wired page** - `1bf6efa` (feat)
2. **Task 2: Wire the same icon link into all nine tool pages** - `931d975` (feat)
3. **Task 3: Replace the Congruence Wheel card icon with a two-ring 12-hour clock** - `fc82a3d` (feat)

## Files Created/Modified

- `assets/favicon.svg` - New shared tab-icon asset (numbered tile, colors copied from palette.css)
- `index.html` - Icon link added; Congruence Wheel card icon swapped from emoji to inline clock SVG plus matching `.wheel-icon-*` style rules
- `Congruence Wheel/congruence-wheel.html` - Icon link added
- `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` - Icon link added
- `Factorize By Completing The Square/factorize-completing-square.html` - Icon link added
- `Factor Tree/factor-tree.html` - Icon link added
- `RSA/rsa.html` - Icon link added
- `Shors Algorithm/shors-algorithm.html` - Icon link added
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` - Icon link added
- `Square And Multiply/square-and-multiply.html` - Icon link added
- `Venn Diagrams/venn-diagrams.html` - Icon link added

## Decisions Made

- Favicon colors are the one exception to CLAUDE.md's var()-only color rule, documented directly in the file's header comment: a favicon is fetched as its own document and cannot resolve the host page's CSS custom properties, so its plate/ink colors are hand-copied from `assets/palette.css` night values (with an optional `prefers-color-scheme: light` swap to day values), verified character-for-character by the Task 1 gate.
- Clock icon geometry was computed with polar-to-Cartesian math (r=10.4 outer ring / r=6.2 inner ring, 30-degree steps) and cross-checked against the plan's literal wedge path and tick coordinates before being written into markup, to avoid any drift from the specified geometry.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

xmllint initially rejected the favicon's header comment because it used a double-hyphen (`--`) inside an XML comment when describing CSS custom-property names (e.g. `--accent`) and inline em-dashes — invalid per the XML comment grammar. Fixed by rewording the comment to avoid any `--` sequence while preserving the same explanation of why colors are copied rather than referenced. This is scoped entirely to the comment text; no markup or color logic changed. (Rule 1 - Bug, fixed during Task 1, before the first commit — no separate commit needed since the fix landed in the same uncommitted working tree.)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

The site now has a real browser-tab icon on every page, and the Congruence Wheel hub card icon matches its subject matter. No blockers for future work. NAV-01, NAV-02, PAL-02, and PAL-04 were already marked complete in REQUIREMENTS.md from prior phases; this task reinforces them (favicon and clock icon compliance) without changing their status.

## Self-Check: PASSED

- `assets/favicon.svg` — FOUND
- `index.html` icon link (`assets/favicon.svg`) — FOUND
- All nine tool-page icon links (`../assets/favicon.svg`) — FOUND (10/10 resolved in verification loop)
- Congruence Wheel `wheel-icon` SVG in `index.html` — FOUND (12 ticks, 2 rings, 1 wedge, 2 hands)
- Commit `1bf6efa` — FOUND in `git log`
- Commit `931d975` — FOUND in `git log`
- Commit `fc82a3d` — FOUND in `git log`

---
*Phase: quick-260927-bpe*
*Completed: 2026-09-27*
