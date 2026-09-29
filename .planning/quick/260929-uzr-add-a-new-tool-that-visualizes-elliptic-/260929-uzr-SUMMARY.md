---
phase: quick-260929-uzr
plan: 01
subsystem: tools
tags: [elliptic-curve, diffie-hellman, cryptography, svg, playback, group-law]
status: complete
dependency-graph:
  requires: ["Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html", "Group Isomorphism/group-isomorphism.html", "assets/palette.css"]
  provides: ["Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html"]
  affects: ["index.html", "all fourteen other tool pages (nav registration)"]
tech-stack:
  added: []
  patterns:
    - "plain Number modular arithmetic (no BigInt) for elliptic-curve group law, capped at p<=199"
    - "O(p) point enumeration via a y^2-mod-p reverse-lookup table, cross-checked against a naive O(p^2) double loop"
    - "single pointAdd() branch handles identity/vertical/tangent/chord; scalarMul() and the group-law explorer both route through it"
    - "progressive narrative log + SVG participant-role marking driven by a ten-step playback engine (generation-guarded, mirrors the Diffie-Hellman tool's pattern)"
key-files:
  created:
    - "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html"
  modified:
    - "index.html"
    - "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
    - "Factor Tree/factor-tree.html"
    - "Venn Diagram/venn-diagram.html"
    - "Euclidean Algorithm/euclidean-algorithm.html"
    - "Chinese Remainder Theorem/chinese-remainder-theorem.html"
    - "Equivalence Wheel/equivalence-wheel.html"
    - "Eulers Totient/eulers-totient.html"
    - "Cayley Table/cayley-table.html"
    - "Group Isomorphism/group-isomorphism.html"
    - "Square And Multiply/square-and-multiply.html"
    - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
    - "RSA/rsa.html"
    - "Fermats Method/fermats-method.html"
    - "Shors Algorithm/shors-algorithm.html"
decisions:
  - "Scalar bound relaxed from ord(G)-1 to (full group order)-1 — the plan's own p=97 worked example (ka=14, kb=23 against ord(G)=5) requires it; ord(G)-1 as literally specified would reject that example"
  - "MAX_P = 199, p prime in [5, 199]"
  - "Default curve y^2 = x^3 + 4x + 20 mod 29, matching grounded fact 5 exactly"
  - "Base point user-choosable via a <select>, always paired with its computed order"
  - "Line-through-two-points drawn as its own lattice of dots, never a stroked segment"
  - "Persisted state {p, a, b, Gx, Gy, ka, kb, speed} under its own localStorage key, not the shared group-params store"
  - "Cross-link to Diffie-Hellman Key Exchange is one-way"
  - "Slot colors reuse --role-active/--role-input/--role-result (first pick/second pick/result); Alice/Bob/Eve reuse --role-alt/--role-input/--role-warn from the Diffie-Hellman tool"
  - "Nav label 'Elliptic Curve DH', hub card title 'Elliptic Curve Diffie-Hellman'"
metrics:
  duration: "~85 min"
  completed: 2026-09-29
actuals:
  tokens: 15983
  tasks: 3
  commits: 4
  plan_head_before: 80bdacb8810de62d3a01838a95f873b92bccad3a
  plan_head_after: 4f4ec6e0bc077ebf39163e240667b8710e893236
---

# Quick Task 260929-uzr: Elliptic Curve Diffie-Hellman Tool Summary

Added a fifteenth tool: the full point set of a small elliptic curve over a prime field plotted as a symmetric lattice scatter, with scalar multiplication shown as a walk, a full ECDH exchange between Alice and Bob computed by two independent paths, an interactive group-law explorer, and Eve's discrete-log brute-force attempt — registered across all sixteen pages.

## What Was Built

**`Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html`** — one new self-contained tool, following the repo's single-file convention (inline `<style>`, one inline IIFE `<script>`, no external JS beyond the shared theme script and Google Fonts):

- **Math layer** (plain `Number` arithmetic, no `BigInt`, `MAX_P = 199`): `mod`, `isPrimeSmall`, `modInv` (extended Euclid), `isNonSingular` (discriminant check), `isOnCurve`, `enumeratePoints` (O(p) via a y²-mod-p reverse lookup table), `pointAdd` (the single group law covering identity/vertical/tangent/chord as four distinguishable branches), `scalarMul` (double-and-add, routed entirely through `pointAdd`), `pointOrder` (Hasse-bound capped), `pointsEqual`, `formatPoint`.
- **The point field**: an SVG lattice scatter (`viewBox 0 0 560 560`) with axis ticks, a dashed midline captioned with the mirror-symmetry reason, a distinct off-lattice marker for the point at infinity, and one focusable/activatable dot per affine point.
- **Curve/scalar validation**: refuses non-prime p, out-of-range p, singular curves, off-curve base points, and out-of-range scalars, each with its own stated reason, leaving the previously valid curve on screen.
- **The exchange**: computed by two independent paths (`k_A·B` and `k_B·A`) plus a third `(k_A·k_B mod ord(G))·G` cross-check, all compared and reported as a finding rather than asserted.
- **Ten-step narrative playback** (Play/Pause/Step/Instant/Reset, speed control) mirroring the Diffie-Hellman Key Exchange tool's `generation`-guarded pattern: agree on the curve → Alice/Bob pick scalars privately → each computes their public value (animated as a walk) → each value crosses the wire → each computes the shared secret (animated as a walk) → they agree.
- **The walk**: `computeWalkHops()` builds `1·X, 2·X, …, k·X` by repeated addition (not double-and-add), capped at `ord(G)` hops — safe by Lagrange's theorem since every point reachable from G has an order dividing `ord(G)` — and asserted at animation time to agree with `scalarMul()`.
- **Eve**: a notebook that reveals only the curve/G/A/B as each becomes public (never the private scalars or the shared secret), and a brute-force button that walks multiples of G against A, reporting the recovered scalar, the point-addition count, elapsed time, and an honest note about cost at cryptographic curve sizes.
- **Group-law explorer**: a two-slot point-picking idiom (first pick / second pick / result, reusing the Equivalence Wheel's and Group Isomorphism's semantic role colors) that draws the chord or tangent line as its own point lattice, marks the third curve intersection and its midline-reflected sum, and handles the vertical (mirror-pair) case as its own branch with no division by zero.
- **Multiples-of-G reference table**, click-to-highlight, mirroring the `.ref-list`/`.row-btn` pattern from Group Isomorphism.

**Site-wide registration**: a sixteen-entry nav on all sixteen pages (one inserted line, zero deletions, on each of the fourteen pre-existing tool pages), a hub card on `index.html` with an inline var()-only curve-scatter icon in the slot matching nav order, and the tool-count wording moved from fourteen to fifteen (hero paragraph + footer).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Relaxed scalar validation bound from `ord(G)-1` to `(group order)-1`**
- **Found during:** Task 1, first harness run of scenario t1 (the p=97 chip)
- **Issue:** The plan's `<action>` text specifies refusing "a private scalar outside 1 to `ord(G) - 1`", but the plan's own grounded-fact-7 worked example for the p=97 small-subgroup preset uses `k_A = 14, k_B = 23` against `ord(G) = 5` — both scalars exceed `ord(G) - 1 = 4`. Implementing the literal bound made the plan's own required worked example unreachable through the UI.
- **Fix:** Bounded scalars by the full group order (affine points + infinity) minus 1 instead. This is consistent with all four presets — for three of them `ord(G)` equals the group order (both prime), so the bound is unchanged; for the p=97 preset the group order is 100, comfortably containing 14 and 23. Scalar periodicity (`kP` depends only on `k mod ord(P)`, and `ord(P) | ord(G)` for any point reachable from G) makes any positive scalar mathematically valid regardless of the bound chosen; this bound is a UI sanity ceiling, not a correctness requirement.
- **Files modified:** `Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html` (`readInputs()` and the randomize-scalars handler)
- **Commit:** f025b69 (folded into Task 1's commit, found and fixed before that commit landed)

**2. [Rule 1 - Bug] Point-at-infinity label was clipped at the SVG viewBox edge**
- **Found during:** post-Task-3 manual visual verification (headless-Chrome screenshots in both themes, per the plan's `<verification>` step)
- **Issue:** The "∞ (identity)" label was center-anchored on the off-lattice infinity marker near the viewBox's right edge; the text ran past `x=560` and was silently clipped to "∞ (identit" with no visible error.
- **Fix:** Right-anchored the label a few pixels from the viewBox edge instead, so it grows leftward and stays fully inside the viewBox in both themes.
- **Files modified:** `Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html`
- **Commit:** 4f4ec6e

### Harness tooling note (not a deviation, but worth recording)

The gate script's negative-color-word list initially included `transparent` and its Gate-D dependency-comparison initially flagged the SVG `xmlns` namespace URI as an unauthorized "absolute URL." Both were calibration bugs in the scratchpad harness itself (never committed — see Output below), fixed during Task 1 before any gate result was trusted: `transparent` is excluded from the named-color list (it is not a hue, and all fifteen existing pages use it dozens of times legitimately outside `color-mix()`), and Gate D now allows any `https://fonts.googleapis.com/*` URL plus the literal `http://www.w3.org/2000/svg` namespace string.

## Verification

- **Scratchpad:** `/tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools/f1499cf8-e5a5-4f5d-be3f-a51de57793b9/scratchpad/` — `ecdh-gates.js`, `ecdh-math-check.js`, `ecdh-harness.js` (none committed; all dependency-free Node).
- **Gate calibration (grounded fact 12):** all four static gates (no color literal, named colors only as `color-mix()` shade anchors, no stale palette token, no new dependency) pass on 14 of 15 existing pages; the sole exception is `Equivalence Wheel/equivalence-wheel.html`, which fails Gate A only (its runtime SVG-export serializer builds an `rgb()` string — a feature this tool does not have). `Cayley Table/cayley-table.html` passes as the positive control; `assets/palette.css` fails (31 hex literals, 5+ `rgba(` matches) as the negative control, proving the gate can fail.
- **Math layer confirmation:** `enumeratePoints(4, 20, 29)` reproduces all 36 points of grounded fact 5 in order; `pointOrder([1,5], 4, 29) === 37`; `scalarMul(k, [1,5], 4, 29)` for k=1..37 reproduces the full multiples list ending at infinity; the chord/tangent/vertical worked examples of grounded fact 6 all reproduce exactly (λ=24/c=10, λ=21, and the (1,5)/(1,24) vertical pair).
- **Independent math checker:** 6525 checks, 0 failures, across the four preset curves (full ECDH identity over every pair of nonzero scalars, group axioms, Lagrange, the three worked group-law examples) plus 20 deterministically-generated additional curves (point-on-curve + Lagrange checks).
- **Behavioral harness** (real headless Chrome, same-origin iframe, visible-DOM-only driving, per the established grounded-fact-11 recipe): scenario t1 (25 checks) — default load, chip switching including the p=97 small-subgroup case, five distinct invalid-input error messages, reload persistence, and corrupt-storage fallback to the default curve. Scenario t2 (12 checks) — Step/Instant/Reset behavior, Eve's notebook wording, the group-law explorer's chord construction. Scenario t3 (50 checks) — all sixteen pages carry a sixteen-entry nav with exactly one active entry and a link to the new tool, and following the hub card link reaches a correctly-titled document. All three scenarios: 0 failures.
- **Structural checks:** all sixteen pages report exactly 16 `site-nav-link` occurrences; the fourteen pre-existing tool pages each show a `1 0` diff (one insertion, zero deletions); `index.html` shows `27 2` (within the plan's stated ≤32/≤3 bound); `git status --porcelain --untracked-files=no` is clean after every commit.
- **Manual visual confirmation:** headless-Chrome screenshots of the full page in both night and day themes confirm the point field, highlighted G/A/B/S points, midline caption, arithmetic log, multiples table, Eve's notebook, and group-law explorer are all legible and correctly themed in both modes.

## Known Stubs

None. Every feature specified in the plan's `must_haves.truths` is wired to live computation — no hardcoded tables, no placeholder text, no unwired mock data.

## Self-Check: PASSED

- `Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html` — FOUND
- Commit f025b69 — FOUND (`git log --oneline --all | grep f025b69`)
- Commit 0d3567c — FOUND
- Commit 9a6d778 — FOUND
- Commit 4f4ec6e — FOUND
- `index.html` hub card and nav entry — FOUND (`grep -c elliptic-curve-diffie-hellman.html index.html` = 2)
- All 14 other tool pages carry the nav entry — FOUND (16/16 `site-nav-link` count on every page)
