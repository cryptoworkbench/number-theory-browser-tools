---
phase: quick-260926-dgk
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Venn Diagrams/venn-diagrams.html
  - index.html
autonomous: true
requirements: [QUICK-VENN-3CIRCLE-01]

estimate:
  tokens: 60000
  raw_tokens: 60000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "A mode switch above the prime picker offers exactly two choices, `Two circles` and `Three circles`; the pressed one carries aria-pressed=true and switching swaps which diagram, which lede paragraph and which products panel is visible (D-04)"
    - "Two-circle mode is byte-for-byte unchanged in behaviour: with no saved state its rows still read `Left = 2 * 3 (only) * 5 (shared) = 30`, `Overlap = GCD(30, 35) = 5`, `Right = 7 (only) * 5 (shared) = 35` (D-04)"
    - "Three-circle mode draws three equal circles in a symmetric Euler arrangement producing all seven regions: A only, B only, C only, A∩B only, A∩C only, B∩C only, all three (D-02, D-05)"
    - "Each of the seven regions is an independently clickable, keyboard-focusable, drag-droppable target that accepts a prime from the shared picker, exactly like the two-circle regions (D-02)"
    - "The three numbers are composed from the placed primes rather than typed: A is the product of every prime in A only, A∩B only, A∩C only and all three (D-01)"
    - "With no saved state the three-circle seed (A only 2, B only 3, C only 5, A∩B only 7, A∩C only 11, B∩C only 13, all three 17) renders exactly `A = 2 (only) * 7 (with B) * 11 (with C) * 17 (all three) = 2618`, `B = 3 (only) * 7 (with A) * 13 (with C) * 17 (all three) = 4641`, `C = 5 (only) * 11 (with A) * 13 (with B) * 17 (all three) = 12155` (D-01, D-03)"
    - "With that same seed the pairwise rows read exactly `A∩B = GCD(2618, 4641) = 119`, `A∩C = GCD(2618, 12155) = 187`, `B∩C = GCD(4641, 12155) = 221` and the centre row reads exactly `A∩B∩C = GCD(2618, 4641, 12155) = 17` (D-03)"
    - "Every GCD printed is produced by running the existing Euclidean `gcd` helper over the printed circle totals, never by multiplying a region's primes together, so the rows stay truthful when a prime is placed in two regions at once (D-03)"
    - "Emptying every three-circle region renders `A = (empty) = 1` (and likewise B and C) and `A∩B∩C = GCD(1, 1, 1) = 1` with no row breaking or disappearing (D-03)"
    - "Each of the seven region anchor points lies inside its own region's hit path and outside the other six (D-05)"
    - "Clear all clears only the regions of the mode currently showing, and each mode's placements survive a reload independently (D-07)"
    - "Loading the page with `?mode=three` opens in three-circle mode and `?mode=two` opens in two-circle mode, with any other value ignored in favour of the stored or default mode (D-04)"
    - "The tool's `<style>` block and every SVG attribute written from JavaScript declare no literal colour value -- every colour resolves through var() against an assets/palette.css token, with circle C using --role-special and all overlap fills derived from --role-result (D-06)"
    - "No new external resource is added: the only script src in the file is still ../assets/theme.js and the only remote links are still the existing Google Fonts preconnect and stylesheet"
    - "Loading the page, switching modes, placing, removing and clearing produce no console error in either theme"
    - "The hub card for this tool on index.html no longer claims the tool is two circles (D-08)"
  artifacts:
    - "Venn Diagrams/venn-diagrams.html"
    - "index.html"
  key_links:
    - "state.regions3.{aOnly,bOnly,cOnly,ab,ac,bc,abc} -> primesOf() -> formatSegments(parts) -> the three .product-value spans of the numbers panel, assigned with textContent only (D-01)"
    - "The same seven lists -> productOf() -> totalA/totalB/totalC -> the existing gcd() helper -> the four GCD rows, so a GCD row can never disagree with the circle totals printed above it (D-03)"
    - "Six circle-circle intersection points computed once from centres and radius -> the seven region path strings -> both the visible overlap fills and the invisible .region-hit targets, so what the user sees and what the user can click are the same geometry (D-05)"
    - "REGION_NAMES3 is the single source of truth for the seven SVG captions, the status messages and the region / placed-chip aria-labels (D-02)"
    - "render() repopulates BOTH modes' tokens and product rows on every call; setMode() only toggles visibility, so a hidden panel is never stale (D-07)"
---

<objective>
Add a three-circle mode to the Prime Venn Diagram tool: a mode switch that swaps the existing two-circle diagram for a symmetric three-circle Euler diagram with seven placement regions, whose products panel prints the three composed numbers, the three pairwise GCDs and the GCD of all three.

Purpose: the two-circle mode already teaches "the lens between two numbers is their GCD". Three circles extend that to the case a self-learner meets next -- a prime shared by exactly two of three numbers versus a prime shared by all three -- which is the visual that makes GCD of three numbers obvious rather than an iterated formula.
Output: one substantially edited file, `Venn Diagrams/venn-diagrams.html` (new mode switch, new SVG, new geometry helpers, new product rows, new persistence), plus a one-line copy fix to the hub card in `index.html`.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@Venn Diagrams/venn-diagrams.html
@assets/palette.css
</context>

<decisions>

These resolve the ambiguities in the request. They are binding.

- **D-01 — "pick three numbers" means compose them from primes, not type them.** The existing mode has no numeric input: the user places prime chips and the two numbers fall out of the placement. Three-circle mode keeps that idiom exactly. Adding number inputs would break parity with the mode it sits beside and would make the diagram a readout instead of a manipulable object.
- **D-02 — seven regions, same placement mechanics.** Three single-only regions, three pairwise-only crescents and one centre, each a `.region` group with click, Enter/Space and drag-drop placement, and placed chips removable by click or Enter/Space, exactly as today.
- **D-03 — GCDs are computed, not assumed.** `A∩B` prints `GCD(totalA, totalB)` run through the existing Euclidean `gcd` helper, and the centre prints `GCD(totalA, totalB, totalC)` as `gcd(gcd(a,b),c)`. Note the maths this makes visible: `GCD(A,B)` equals the A∩B-only crescent times the centre (the whole lens), not the crescent alone -- the row label names the lens, the crescent caption says "only", and both stay true even if the user puts the same prime in two regions.
- **D-04 — a mode switch, not a second page.** Both diagrams live in the same file; the switch toggles visibility. The two-circle code path is left intact and untouched rather than generalised, because it is already verified working. A `?mode=three` / `?mode=two` URL override is added, mirroring the existing `?theme=` precedent, and is whitelist-validated.
- **D-05 — symmetric three-circle geometry, derived once.** Equal radii, centres on a ring about the diagram centre, six intersection points computed from the geometry, and seven region paths built from three rotationally-symmetric templates.
- **D-06 — palette compliance is non-negotiable.** Per CLAUDE.md, the style block and any SVG attribute written from JavaScript declare no literal colour. Circle C uses `--role-special` (the third participant / advanced extension); pairwise overlap fills and the centre fill are both `color-mix` shades of `--role-result`, matching the two-circle lens's meaning of "the computed answer lives here".
- **D-07 — independent state per mode.** Separate localStorage keys, and `render()` repopulates both modes every call so a hidden panel can never be stale.
- **D-08 — hub copy.** The index.html card currently says "two overlapping circles"; reword so it is not false.

</decisions>

<geometry>

All values are SVG user units inside `viewBox="0 0 900 700"`. Centre of the arrangement is (450, 330); the three circles have radius 190 with centres on a ring of radius 120:

| Circle | Centre |
|--------|--------|
| A (top-left) | (346.077, 270) |
| B (top-right) | (553.923, 270) |
| C (bottom) | (450, 450) |

Derived: centre-to-centre distance 207.846, half-chord 159.06. Each pair has two intersection points; the **inner** one is whichever of the two lies inside the third circle (distance to the third centre under 190) -- compute it that way rather than hard-coding, then assert it. Expected values, useful as a self-check:

| Point | Coordinates |
|-------|-------------|
| A∩B outer / inner | (450, 110.94) / (450, 429.06) |
| B∩C outer / inner | (639.70, 439.53) / (364.22, 280.47) |
| A∩C outer / inner | (260.30, 439.53) / (535.78, 280.47) |

Region boundaries, with circles indexed A=0, B=1, C=2, `next = (i+1) % 3`, `prev = (i+2) % 3`. Each template is stated once and applied three times under the 120-degree rotational symmetry, which preserves both flags:

- **only(i)** -- start at outer(i, next), arc along circle **i** with large-arc 1 and sweep 0 to outer(i, prev), arc along circle **prev** with large-arc 0 and sweep 1 to inner(next, prev), arc along circle **next** with large-arc 0 and sweep 1 back to the start.
- **pair(i, j)** where j = next(i), k = prev(i) -- start at outer(i, j), arc along circle **i** with large-arc 0 and sweep 1 to inner(i, k), arc along circle **k** with large-arc 0 and sweep **0** to inner(j, k), arc along circle **j** with large-arc 0 and sweep 1 back to the start.
- **triple** -- start at inner(1, 2), arc along circle **2** with large-arc 0 and sweep 1 to inner(0, 2), arc along circle **0** with large-arc 0 and sweep 1 to inner(0, 1), arc along circle **1** with large-arc 0 and sweep 1 back to the start.

Chip-block anchors and caption anchors (all verified to sit clear of neighbouring boundaries for a 44-wide, 84-tall single-column stack of three chips):

| Region key | Caption | Chip anchor | Caption anchor |
|-----------|---------|-------------|----------------|
| aOnly | A only | (281, 232) | (281, 152) |
| bOnly | B only | (619, 232) | (619, 152) |
| cOnly | C only | (450, 520) | (450, 600) |
| ab | A∩B only | (450, 196) | (450, 141) |
| ac | A∩C only | (350, 388) | (350, 338) |
| bc | B∩C only | (550, 388) | (550, 338) |
| abc | all three | (450, 330) | (450, 282) |

</geometry>

<tasks>

<task type="tracer">
  <name>Task 1: Three-circle diagram end to end — mode switch, geometry, placement, centre GCD row</name>
  <files>Venn Diagrams/venn-diagrams.html</files>
  <precondition>google-chrome (or google-chrome-stable) is on PATH; the verify step drives it headless. Halt and report if absent.</precondition>
  <reversibility rating="reversible">Single file, single commit, two-circle path untouched — revertable with one git revert.</reversibility>
  <read_first>
Read `Venn Diagrams/venn-diagrams.html` in full before editing — one pass, extracting: the `svgEl`, `isPrime`, `productOf`, `gcd`, `primesOf`, `buildPalette` helpers (all reusable as-is from inside the same IIFE); the `createRegion(key, pathString)` event-wiring shape; the `renderTokens` chip-layout maths; the `.region`, `.region-hit`, `.placed-chip`, `.region-label`, `.circle-left`, `.lens-fill`, `.product-row`, `.product-value` style rules; and the `window.addEventListener('load', ...)` bootstrap order (buildStatic, buildRegions, restore-or-seed, render).
  </read_first>
  <action>
Work inside the existing IIFE and reuse its helpers — do not add a shared module and do not duplicate `isPrime`, `productOf`, `gcd` or `svgEl` (D-01 through D-08 all apply to this one file).

Markup: wrap the existing lede paragraph as id `lede-two` and add a sibling `lede-three` paragraph, same class, explaining that three circles are three numbers, that a prime sitting in a two-circle overlap is shared by exactly those two, that a prime in the centre is shared by all three, and that each full lens therefore multiplies out to a pairwise GCD while the centre multiplies out to the GCD of all three. Above the picker panel add a `mode-switch` group (role=group, labelled "Diagram mode") holding two buttons, `mode-two` and `mode-three`, carrying aria-pressed. Add a second diagram frame holding an svg id `venn3` with viewBox spanning 900 by 700, an aria-label describing three overlapping circles forming seven regions, and empty `venn3-static` / `venn3-dynamic` groups mirroring the existing pair. Hide the inactive mode's lede and diagram frame with the `hidden` attribute.

Styles: add `circle-a`, `circle-b`, `circle-c` rules mirroring `circle-left` (16% fill of the role token over transparent, 2px stroke of the same token) using `--role-input`, `--role-alt` and `--role-special` respectively; add `overlap-pair-fill` at 18% and `overlap-triple-fill` at 42%, both color-mix shades of `--role-result` over transparent, both pointer-events none, mirroring `lens-fill`. Add `mode-switch` and `mode-btn` rules styled from the existing `prime-chip` / `#clear-btn` rules, with the pressed state using `--role-active` with `--role-result-ink` text. Declare no literal colour value anywhere — every colour is a var() against an assets/palette.css token (D-06). Do not name any CSS id selector whose first three characters after the hash are all hexadecimal digits.

Geometry: add pure helpers near the other maths — one returning the two intersection points of two equal-radius circles, one classifying which of the pair is inner by testing containment in the third circle, and three path builders implementing the only / pair / triple templates from the geometry section above. Precompute the three centres and six intersection points once into module-scoped constants. Assert nothing by hard-coded coordinate; derive, and let the verify step compare against the expected table.

Static build: a `buildStatic3` appending the three circles, the three pairwise-only fills, the centre fill and the seven captions (class `region-label`, positioned at the caption anchors, text from a new `REGION_NAMES3` map keyed aOnly/bOnly/cOnly/ab/ac/bc/abc with values "A only", "B only", "C only", "A∩B only", "A∩C only", "B∩C only", "all three" — the intersection glyph is U+2229, written literally, the file is already UTF-8). A `buildRegions3` creating seven `.region` groups with ids `region3-aOnly` through `region3-abc`, each wrapping a `.region-hit` path from the matching builder, wired with the same click / Enter-Space / dragover / dragleave / drop handlers `createRegion` uses — factor a second creator rather than contorting the existing one. Insert the region groups before `venn3-dynamic` so chips stay on top.

State and placement: extend `state` with `mode` (default "two") and `regions3` holding the seven arrays; add `MAX_PER_REGION3` of 3 and `placePrime3` / `removeToken3` mirroring their two-circle counterparts but reading `REGION_NAMES3` for their messages and aria text. Add `renderTokens3` modelled on `renderTokens` but laying a single column of at most three chips 44 wide by 24 tall with a 6px gap, vertically centred on the region's chip anchor, chip text at font-size 13.

Mode switch: `setMode(mode)` sets `state.mode`, toggles the `hidden` attribute on the two ledes and the two diagram frames, updates aria-pressed on both buttons, persists the mode under its own localStorage key inside try/catch, and calls `render()`. On load, read a `mode` query parameter and accept it only when it is exactly "two" or "three", otherwise fall back to the stored value, otherwise "two" (D-04). Never pass the parameter to innerHTML or to any DOM sink other than that whitelist comparison.

Wiring: make `render()` call `renderTokens3` and a new `refreshRegionLabels3` in addition to the existing calls, unconditionally for both modes (D-07). Seed `regions3` on load when nothing is stored with A only 2, B only 3, C only 5, A∩B only 7, A∩C only 11, B∩C only 13, all three 17. For this task the products panel work is limited to one row: add a products panel for three-circle mode containing a single `.product-row` with id `product-abc`, populated by a new `renderProducts3` that computes the three circle totals with `productOf` and prints the centre row as the label, then `GCD(` the three totals `) = ` and `gcd(gcd(a,b),c)` (D-03). Leave the other six rows to Task 2. Point `clearBtn` at a `clearAll` that clears only the regions of the active mode.
  </action>
  <verify>
    <automated>Write a throwaway harness under the session scratchpad (never inside the repo): copy `Venn Diagrams/venn-diagrams.html`, rewrite its `../assets/` hrefs to absolute paths, inject before the closing body tag a script that registers its own load listener and, for each of the seven chip anchors and each of the seven `region3-*` hit paths, calls isPointInFill and records whether the point falls in exactly its own region and no other, writing "PASS" or a failure detail into a data-geom-check attribute on body. Run it with `google-chrome --headless=new --disable-gpu --user-data-dir="$(mktemp -d)" --virtual-time-budget=4000 --dump-dom "file://$HARNESS"` and assert the output contains `data-geom-check="PASS"` (49 assertions). In the same dump, assert the six computed intersection points match the expected table to within 0.05. Exit non-zero on any failure.</automated>
    <automated>Run the same headless dump-dom against the real file with a fresh user-data-dir and `?mode=three`, and assert the output contains `A∩B∩C = GCD(2618, 4641, 12155) = 17`.</automated>
    <human-check>Open the file in a browser, switch to three circles, and confirm the seven regions read as a clean Euler diagram — no gap or double-shaded sliver between regions, chips centred in their regions, captions inside their regions.</human-check>
  </verify>
  <done>Three-circle mode renders, every region accepts and releases a prime by click, keyboard and drag, the centre row prints the GCD of all three numbers, two-circle mode is unchanged, and the geometry self-check passes all 49 point-in-region assertions.</done>
</task>

<task type="auto">
  <name>Task 2: Complete the three-circle products panel and per-mode persistence</name>
  <files>Venn Diagrams/venn-diagrams.html</files>
  <action>
Products (D-01, D-03): add a `formatSegments(parts)` helper next to the existing `formatSide` — it takes an ordered list of entries pairing a prime list with a note, drops empty lists, joins the surviving primes with " * " annotating each group with its note in parentheses, falls back to "(empty)" when every list is empty, and appends " = " plus the product of everything. Leave `formatSide` untouched so two-circle mode cannot regress.

Render the three-circle panel as two sibling `.products-panel` containers reusing the existing `.product-row` / `.product-value` styling: the first holding rows `product-a`, `product-b`, `product-c`, the second holding `product-ab`, `product-ac`, `product-bc` and the `product-abc` row added in Task 1 (move it into that container). Extend `renderProducts3` so that:

- the number rows print the circle letter, " = ", then `formatSegments` over that circle's own-only list noted "only", its two pairwise lists noted "with B" / "with C" (and the mirror for B and C, in the order A, B, C skipping the circle itself), and the centre list noted "all three";
- the pairwise rows print the lens name, " = GCD(", the two circle totals, ") = " and the Euclidean gcd of those two totals;
- the centre row keeps the Task 1 format.

Every total comes from `productOf` over the same lists the rows print, and every GCD comes from the existing `gcd` helper applied to those totals — never from multiplying a region's own primes (D-03). Assign with textContent only.

Persistence (D-07): add `persist3` and `restore3` against a distinct storage key, mirroring the existing pair including the try/catch and an `isValidStoredRegion`-equivalent guard that rejects a payload whose arrays are missing, over-long for `MAX_PER_REGION3`, or contain a non-prime — a rejected payload falls back to the seed rather than rendering attacker-chosen content. Call `persist3` from `placePrime3`, `removeToken3` and `clearAll` when three-circle mode is active.

Accessibility: `refreshRegionLabels3` sets each region group's aria-label from `REGION_NAMES3` plus its current contents, in the same phrasing the two-circle version uses.
  </action>
  <verify>
    <automated>Headless dump-dom of the real file with a fresh user-data-dir, and assert all seven strings are present verbatim: `A = 2 (only) * 7 (with B) * 11 (with C) * 17 (all three) = 2618`, `B = 3 (only) * 7 (with A) * 13 (with C) * 17 (all three) = 4641`, `C = 5 (only) * 11 (with A) * 13 (with B) * 17 (all three) = 12155`, `A∩B = GCD(2618, 4641) = 119`, `A∩C = GCD(2618, 12155) = 187`, `B∩C = GCD(4641, 12155) = 221`, `A∩B∩C = GCD(2618, 4641, 12155) = 17`.</automated>
    <automated>In the same dump, assert the two-circle rows still read `Left = 2 * 3 (only) * 5 (shared) = 30`, `Overlap = GCD(30, 35) = 5` and `Right = 7 (only) * 5 (shared) = 35`.</automated>
    <human-check>In a browser: empty every three-circle region and confirm the rows degrade to `A = (empty) = 1` and `A∩B∩C = GCD(1, 1, 1) = 1` without breaking; place primes in both modes, reload, and confirm each mode restored its own placements independently.</human-check>
  </verify>
  <done>All seven three-circle rows print the exact expected strings for the seed, degrade correctly when regions empty, survive a reload per mode, and two-circle mode still prints its three original rows.</done>
</task>

<task type="auto">
  <name>Task 3: Palette, theme and copy audit</name>
  <files>Venn Diagrams/venn-diagrams.html, index.html</files>
  <action>
Nudge any chip stack or caption the Task 1 screenshots showed clipping its region boundary, adjusting only the anchor tables — not the geometry constants — and re-run the Task 1 geometry check afterwards.

Audit the tool file for palette compliance (D-06): every colour in the style block and in every SVG attribute assigned from JavaScript resolves through var() against an assets/palette.css token; the only locally-declared custom properties, if any, are non-colour values or are built entirely from var() / color-mix references, per CLAUDE.md. Confirm no new external resource was introduced.

Add the new elements to the reduced-motion rule alongside the existing selectors so the mode buttons and three-circle region hits stop transitioning under prefers-reduced-motion.

Reword the Prime Venn Diagram card paragraph on index.html so it no longer says the tool is two circles — state that primes drop into two or three overlapping circles and that each overlap reads out as a GCD (D-08). Change that paragraph only; leave the card markup, icon, heading and link untouched.
  </action>
  <verify>
    <automated>From the repo root, run a colour-literal gate over the tool file that first strips CSS and HTML comment lines and then searches for hexadecimal colour tokens and rgb/rgba/hsl/hsla function calls; assert zero surviving matches (the baseline before this change was zero, so any match is new).</automated>
    <automated>Assert `grep -c 'script src' "Venn Diagrams/venn-diagrams.html"` is exactly 1 and that the matching line references ../assets/theme.js.</automated>
    <automated>Capture four headless screenshots with a fresh user-data-dir at window size 1300x2200 — `?theme=day&mode=three`, `?theme=night&mode=three`, `?theme=day&mode=two`, `?theme=night&mode=two` — and confirm all four files are non-empty.</automated>
    <human-check>Review the four screenshots: circle strokes, overlap fills, captions and chip text are legible with adequate contrast in both themes; the mode switch clearly shows which mode is active; the three-circle diagram is not clipped by the viewBox.</human-check>
  </verify>
  <done>No literal colour anywhere in the tool file, no new external dependency, both themes render legibly in both modes, and the hub card copy is accurate.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| localStorage → page | Persisted region payloads are attacker-writable (shared browser, devtools, another page on the same file:// origin) and are read back and rendered |
| URL query string → page | The new `?mode=` parameter, like the existing `?theme=`, is untrusted input that selects page behaviour |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-dgk-01 | Tampering | `restore3` reading the three-circle storage key | medium | mitigate | Validate before use: reject a payload that is not an object, whose seven arrays are missing or not arrays, that exceeds `MAX_PER_REGION3`, or that holds a non-prime; fall back to the seed. Mirrors the existing `isValidStoredRegion` guard (Task 2) |
| T-dgk-02 | Tampering | Rendering restored/placed values into the SVG | medium | mitigate | All region captions, chip text, status messages, aria-labels and product rows are assigned with textContent only; no innerHTML is used with any value derived from storage or input (Tasks 1 and 2) |
| T-dgk-03 | Tampering | `?mode=` query parameter | low | mitigate | Whitelist comparison against exactly "two" and "three"; any other value is discarded before reaching any DOM sink (Task 1) |
| T-dgk-04 | Denial of Service | Region capacity in three-circle mode | low | mitigate | `MAX_PER_REGION3` caps each region at 3 chips, so the seven products stay far inside Number precision and the render loop stays bounded |
| T-dgk-05 | Information Disclosure | localStorage contents | low | accept | The only stored data is a list of small primes the user placed; there is no account, session or secret in this tool |

No package manager, install step or new third-party resource is involved in this change, so no supply-chain gate applies.
</threat_model>

<verification>
- Geometry self-check passes: each of the seven anchors is inside exactly one region hit path, its own.
- All seven three-circle product strings and all three two-circle product strings appear verbatim in a headless DOM dump of the unmodified-state page.
- Colour-literal gate returns zero matches; script-src count is exactly 1.
- Four screenshots (two modes x two themes) render without clipping and with legible contrast.
- No console error on load, mode switch, placement, removal or clear.
</verification>

<success_criteria>
Three-circle mode ships in the same file as two-circle mode, sharing the prime picker, the message line and the Clear all button; seven regions accept primes by click, keyboard and drag; the panel prints the three composed numbers, the three pairwise GCDs and the GCD of all three, all computed by the existing Euclidean helper; two-circle mode behaves exactly as before; the file remains a single self-contained page with no new dependency and no literal colour.
</success_criteria>

<output>
Create `.planning/quick/260926-dgk-add-a-three-circle-mode-to-the-venn-diag/260926-dgk-SUMMARY.md` when done
</output>
