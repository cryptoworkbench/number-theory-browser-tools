---
phase: quick-261006-cmy
plan: 01
subsystem: site-layout
tags: [css, layout, full-width, diagrams, probe]
requires: []
provides:
  - "Hub and all 14 other tool pages span the full window width like Factor Tree"
  - "width-probe.js: reusable 16-page layout regression check (static CSS plus headless Chrome at 1900x1000)"
affects: [all tool pages, index.html]
tech-stack:
  added: []
  patterns:
    - "Page-level container has no px max-width; only the lede is capped at 72ch"
    - "Fixed-aspect diagram SVGs guarded with max-height:max(80vh, native viewBox height)"
    - "--ladder-h runtime non-colour custom property (same pattern as the Sieve's --cell-min)"
key-files:
  created:
    - .planning/quick/261006-cmy-make-every-tool-page-and-the-hub-use-the/width-probe.js
  modified:
    - index.html
    - RSA/rsa.html
    - "Cayley Table/cayley-table.html"
    - "Chinese Remainder Theorem/chinese-remainder-theorem.html"
    - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
    - "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html"
    - "Euclidean Algorithm/euclidean-algorithm.html"
    - "Eulers Totient/eulers-totient.html"
    - "Fermats Method/fermats-method.html"
    - "Shors Algorithm/shors-algorithm.html"
    - "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
    - "Square And Multiply/square-and-multiply.html"
    - "Equivalence Wheel/equivalence-wheel.html"
    - "Group Isomorphism/group-isomorphism.html"
    - "Venn Diagram/venn-diagram.html"
decisions:
  - "PD-1..PD-6 implemented exactly as planned"
  - "Probe check B5 compares the Venn frame to min(parent width, max(1040px, 205vh)) because headless Chrome's innerHeight is about 857 in a 1900x1000 window"
metrics:
  tasks: 3
  files: 16
completed: 2026-10-06
status: complete
commits: 3
plan_head_before: 6b3c6b1bb9b9b894874d420ff59b0e57492b759a
plan_head_after: 4d4ea8dab237b90140859556c9979bffac48868d
actuals:
  tokens: 14000
  tasks: 3
  commits: 3
---

# Phase quick-261006-cmy Plan 01: Full-width tool pages Summary

Every tool page and the hub now lay their main container across the whole window, as Factor Tree always did. Only the lede paragraph keeps a 72ch readability cap, and fixed-aspect diagrams are bounded so they never grow taller than the viewport.

## Commits

- 58328e0: RSA full width plus `width-probe.js` (tracer, red then green)
- 12741d2: the remaining ten `.app` pages with diagram height guards and `--ladder-h`
- 4d4ea8d: hub, Equivalence Wheel, Group Isomorphism, Venn, and the probe B5 adjustment

## Caps removed per page (PD-1) and lede cap added (PD-2)

| Page | Removed | Lede capped at 72ch |
|------|---------|---------------------|
| index.html | `.hub` max-width 1080px | `.hero p` |
| RSA | `.app` 1040px | `.page-header p` |
| Cayley Table | `.app` 1040px | `.lede` |
| Chinese Remainder Theorem | `.app` 1040px | `.lede` |
| Diffie-Hellman Key Exchange | `.app` 1040px | `.page-header p` |
| Elliptic Curve Diffie-Hellman | `.app` 1080px | `.page-header p` |
| Euclidean Algorithm | `.app` 1040px | `.lede` |
| Euler's Totient | `.app` 1040px | `.lede` |
| Fermat's Method | `.app` 980px | `.page-header p` |
| Shor's Algorithm | `.app` 1040px | `.page-header p` |
| Sieve of Eratosthenes | `.app` 1080px | `.page-header p` |
| Square and Multiply | `.app` 1040px | `.page-header p` |
| Equivalence Wheel | `.wrap` 1120px | `.lede` |
| Group Isomorphism | `.wrap` 1120px | `.lede` |
| Venn Diagram | `.wrap` 1120px | `.lede` |

Factor Tree was not modified.

## Diagram guards (PD-3, PD-4)

- `max-height:max(80vh, Npx)` added to DH `#stageSvg` (460), ECDH `#curveSvg` (560), Euclid `#tileSvg` (360) and `#nestedSvg` (420), Fermat `svg.diagram` (400).
- Square and Multiply `#ladderSvg` uses `max-height:max(80vh, var(--ladder-h, 0px))`; `buildLadder` writes `--ladder-h` right after setting the viewBox.
- Venn `.diagram-frame` max-width changed from 1040px to `max(1040px, 205vh)`. No max-height was added to any Venn svg, so the width-based drag scale is untouched.
- Kept as-is (PD-5): Equivalence Wheel 880px frame, Group Isomorphism 460px frames, Shor `#cycleRing` 520px, all 62ch/64ch/160px inner caps, Cayley 70vh and Sieve 62vh scrollers.

## Side effects to know about

- **ECDH on short viewports (PD-3):** on a short laptop viewport (for example 1366x768) the elliptic curve now fits the window (about 614px tall) instead of running about 990px tall. This is intended.
- **Public-values dock (PD-6):** RSA's and Diffie-Hellman's bottom-right public-values panel is unchanged. On wide screens it used to sit in the empty right margin. It now floats over the right edge of the full-width panels while scrolling, exactly as it already did on viewports narrower than about 1600px.
- **Header unchanged:** the site header inner width (1180px) is untouched and still narrower than the page body on wide windows, as on Factor Tree.

## Optional probe entries (skipped when hidden in the default state)

- euclid `#tileSvg` (SKIP at default view)
- venn `#venn-composite` (visible in the default two-circle view, so it was checked and passed)

## Verification

- `width-probe.js` (all 16 pages, 1900x1000): `CMY-PROBE PASS`. Full-width containers, 72ch ledes, no horizontal overflow, diagram heights within `max(80% innerHeight, viewBox height)`.
- No page-level px max-width remains: `grep -lPz '\.(app|wrap|hub)\s*\{[^}]*max-width:\s*[0-9]+px' index.html */*.html` prints nothing. Every page has a 72ch lede rule.
- `i18n-check.js --all` exits 0; `shadow-check.js --all` exits 0.
- Screenshots of RSA, ECDH, Sieve, Fermat, Square and Multiply, hub, Venn, Equivalence Wheel and Group Isomorphism were viewed. Panels span the window, the hub shows four card columns with a 72ch lede, the Venn panes sit side by side, and the wheel and isomorphism diagrams are centred at their kept sizes.
- Not done: the human-check in the plan (dragging a Venn chip in a real maximised window and scrolling RSA's dock) was not performed; no code touching either was changed.

## Final wide-viewport screenshots (1900x1000, all 16 pages)

Persistent copy: `/tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools/78229de9-81a5-4b80-b3ce-d959d965cad0/scratchpad/cmy-final/` (also `/tmp/cmy-shots-cOCHiI/`)

- `.../cmy-final/hub.png`, `factorTree.png`, `rsa.png`, `cayley.png`, `crt.png`, `dh.png`, `ecdh.png`, `euclid.png`, `totient.png`, `fermat.png`, `shor.png`, `sieve.png`, `sqm.png`, `wheel.png`, `iso.png`, `venn.png`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Probe check B5 compared Venn frame to the full parent width**
- **Found during:** Task 3
- **Issue:** Headless Chrome's `innerHeight` in a `--window-size=1900,1000` window is about 857, so `205vh` is about 1757px, narrower than the 1841px parent. The plan assumed a 1000px viewport height. The CSS behaves as designed (PD-4); the check was too strict.
- **Fix:** B5 now expects `min(parent content width, max(1040, 2.05 * innerHeight))`, which verifies PD-4 at any viewport height.
- **Files modified:** `.planning/quick/261006-cmy-make-every-tool-page-and-the-hub-use-the/width-probe.js`
- **Commit:** 4d4ea8d

**2. [Probe tooling] Screenshots live outside the harness scratch root**
- The harness deletes its scratch root on process exit, which would delete the screenshots the plan says to keep. `--shots` therefore writes to `os.tmpdir()/cmy-shots-*` (outside the repo), while page copies and Chrome profiles still use harness scratch dirs.

No other deviations. Single-repo task commits were made directly on `main` as instructed by the orchestrator.

## Known Stubs

None.

## Threat Flags

None. Static CSS changes plus one JS line writing a numeric px custom property.

## Self-Check: PASSED

- width-probe.js and all 15 modified pages exist; commits 58328e0, 12741d2, 4d4ea8d are ancestors of HEAD.
