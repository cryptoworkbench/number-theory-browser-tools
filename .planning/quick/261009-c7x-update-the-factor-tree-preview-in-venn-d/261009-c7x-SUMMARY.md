---
phase: quick-261009-c7x
plan: 01
subsystem: venn-diagram
tags: [venn, factor-tree, preview, svg, gcd-pair]
requires: [261006-moy]
provides:
  - "Venn A ∩ B Factor Tree miniature draws Factor Tree's gcd pair (yellow/blue panels, green lens, fold rings, shared highlight, equation lines)"
affects: ["Venn Diagram/venn-diagram.html"]
key-files:
  modified:
    - "Venn Diagram/venn-diagram.html"
    - ".planning/quick/261005-dn2-venn-diagram-double-click-on-a-chip-open/dblclick-probe.js"
  created:
    - ".planning/quick/261009-c7x-update-the-factor-tree-preview-in-venn-d/preview-probe.js"
    - ".planning/quick/261009-c7x-update-the-factor-tree-preview-in-venn-d/preview-day.png"
    - ".planning/quick/261009-c7x-update-the-factor-tree-preview-in-venn-d/preview-night.png"
decisions:
  - "No interactive controls (fold badges, Separate pill, x button) drawn: the preview is pointer-events:none"
  - "assets/nt-layout.js untouched: panelRect and gcdEquationLines have no second caller"
  - "Factor Tree's 1.4px node outlines not ported (named-colour keywords forbidden by the no-literal-colour rule)"
metrics:
  tasks: 3
  completed: 2026-10-09
status: complete
commits: 3
plan_head_before: 06353c336488e875d74c4d804084853f131b2e37
plan_head_after: 1ab903ecf8efa99a05c3e89fd1807f2de45bbce6
actuals:
  tokens: 30000
  tasks: 3
  commits: 3
---

# Phase quick-261009-c7x Plan 01: Venn Factor Tree preview shows the gcd pair Summary

The Venn Diagram's A ∩ B hover miniature (two-circle overlap chip and three-circle pairwise chips) now draws Factor Tree's gcd pair: a's tree on a yellow panel, b's on a blue one, overlapped on the shared g branch with a green lens under the trees, folded primes with fold rings, the shared-g highlight, and the pair's equation lines as the caption.

## Tasks

| Task | Name | Commit |
| ---- | ---- | ------ |
| 1 | Tracer: 30 ∩ 35 pair panels, lens and equation lines | 27edffb |
| 2 | Fold rings, shared highlight, composite tokens; all gcd shapes | f546dae |
| 3 | Retarget dn2 S8, day/night screenshots, gates | 1ab903e |

## What changed

- `drawTreeSection` (overlap branch): per-number `panelRect`, `ft-pair-a` / `ft-pair-b` rects and an inset `ft-pair-lens`, all appended before the first edge. Nodes are laid out in a box inset by `FT_PANEL_GAP` (7) so every panel stays inside the section's tree box. The tree box shrinks by `NP_LINE` (14) per extra caption line.
- `gcdEquationLines(a, b, g)` gives `a = (a/g) × g`, `b = g × (b/g)` (each omitted when equal to g) and `gcd(a, b) = g`.
- `foldPrimeSplits` marks `node.folded`; folded nodes get an `ft-fold-ring` circle before the node circle.
- CSS: `--pair-*-bg` aliases (same color-mix expressions as Factor Tree's `.tree-pair`), pair/lens classes, `--role-composite` / `--role-composite-ink` for composite circles and labels, shared glow, and `.ft-node.prime-leaf.shared` keeping the prime outline (Factor Tree's precedence).
- The single-value preview path renders byte-identical markup to 06353c3 (probe scenario B1).

## Gates

- C7X probe: PASS (43 scenarios) over base, r1-r6 (30/35, 72/60, 12/36, 35/12, 36/36, Arabic RTL, plus the three-circle pairwise chip)
- dn2: PASS (8 scenarios), S8 retargeted to the pair
- edj PASS (9), pl0 PASS (29), o9g PASS (18)
- i18n-check --all: PASS; shadow-check --all: PASS
- `git diff 06353c3 -- assets/`: empty
- Added page lines: 0 colour literals, 0 `innerHTML`, 0 named colours
- Probe self-test against 06353c3's page: r1 fails 6 of 8 scenarios, so the probe discriminates

Screenshots: `preview-day.png`, `preview-night.png` (72/60, 2x scale) in this directory. Both show the yellow left panel, blue right panel, green overlap around the shared 12, green primes with rings, and the three equation lines, legible in both themes.

## Deviations from Plan

- [Rule 3 - Blocking] The three-circle frame is hidden until its mode is on, so `getBBox()` returns zeros there. The probe's pairwise scenario clicks `#mode-three` before hovering and `#mode-two` afterwards. Probe-only change.
- `--shots` uses a 2x device scale factor and hides the probe's output `<pre>`, so the 268x196 panel is legible. Probe-only change.
- `preview-probe.js` has an extra `C7X_PAGE=baseline` env switch used to self-test the probe against the pre-change page.
- Plan Task 1 listed fold-ring/shared checks under r1 for Task 2; they were added in Task 2 as planned.

## Known Stubs

None.

## Threat Flags

None. All new text goes through `textContent` on `svgEl` nodes from integers; no new URL parameters or storage keys.

## Self-Check: PASSED

- FOUND: `Venn Diagram/venn-diagram.html`, `preview-probe.js`, `preview-day.png`, `preview-night.png`
- FOUND commits: 27edffb, f546dae, 1ab903e
