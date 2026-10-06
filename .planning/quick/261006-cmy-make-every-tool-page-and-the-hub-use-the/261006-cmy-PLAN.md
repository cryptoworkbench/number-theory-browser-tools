---
phase: quick-261006-cmy
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - .planning/quick/261006-cmy-make-every-tool-page-and-the-hub-use-the/width-probe.js
  - RSA/rsa.html
  - Cayley Table/cayley-table.html
  - Chinese Remainder Theorem/chinese-remainder-theorem.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html
  - Euclidean Algorithm/euclidean-algorithm.html
  - Eulers Totient/eulers-totient.html
  - Fermats Method/fermats-method.html
  - Shors Algorithm/shors-algorithm.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Square And Multiply/square-and-multiply.html
  - index.html
  - Equivalence Wheel/equivalence-wheel.html
  - Group Isomorphism/group-isomorphism.html
  - Venn Diagram/venn-diagram.html
autonomous: true
requirements: [QUICK-WIDTH-01, QUICK-WIDTH-02]

estimate:
  tokens: 90000
  raw_tokens: 90000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "At a 1900px-wide window, the hub (index.html) and every tool page lay out their main content container across the full window width, the way Factor Tree's .wrap already does. No page-level container (.app, .wrap, .hub) keeps a px max-width (per PD-1)"
    - "Every page's lede paragraph (the hub's hero lede and each tool's subtitle under its h1) stays capped at 72ch, exactly like Factor Tree's .subtitle, so the intro text stays readable on wide screens (per PD-2)"
    - "Fixed-aspect diagram SVGs that scale with width (Diffie-Hellman stage, ECDH curve, Euclidean tile and nested views, Fermat diagram, Square-and-Multiply ladder) fill the full width but never render taller than max(80% of the viewport height, their native viewBox height) (per PD-3)"
    - "Venn Diagram's two-pane diagram frame grows with the page on ordinary 16:9 screens and is bounded only where the three-circle pane would exceed about 80% of the viewport height. Dragging chips still lands where the pointer is (per PD-4)"
    - "Intrinsic diagram caps are unchanged: the Equivalence Wheel frame (880px), the Group Isomorphism wheels (460px), Shor's cycle ring (max-height 520px), and the existing 62ch/64ch prose and 160px field caps (per PD-5)"
    - "No page has horizontal overflow at 1900px. The RSA and Diffie-Hellman public-values dock is untouched (per PD-6)"
    - "The site's existing gates still pass: i18n-check --all and shadow-check --all"
  artifacts:
    - path: ".planning/quick/261006-cmy-make-every-tool-page-and-the-hub-use-the/width-probe.js"
      provides: "static CSS checks plus headless-Chrome layout checks at 1900x1000 for all 16 pages, with optional screenshots. Prints CMY-PROBE PASS"
      contains: "CMY-PROBE"
    - path: "Square And Multiply/square-and-multiply.html"
      provides: "ladder height guard driven by --ladder-h, written in buildLadder"
      contains: "--ladder-h"
    - path: "Venn Diagram/venn-diagram.html"
      provides: "viewport-bounded diagram frame growth"
      contains: "max(1040px, 205vh)"
    - path: "index.html"
      provides: "uncapped .hub container with a 72ch hero lede"
      contains: "72ch"
  key_links:
    - from: ".planning/quick/261006-cmy-make-every-tool-page-and-the-hub-use-the/width-probe.js"
      to: ".planning/phases/07-shared-js-module-refactor/harness.js"
      via: "require for mkScratch and chromeEnv, the same pattern as shared-palette-probe.js"
      pattern: "07-shared-js-module-refactor"
    - from: "Square And Multiply/square-and-multiply.html buildLadder"
      to: "#ladderSvg max-height rule"
      via: "ladderSvg.style.setProperty('--ladder-h', H + 'px') read by max(80vh, var(--ladder-h, 0px))"
      pattern: "--ladder-h"
    - from: "Venn Diagram/venn-diagram.html .diagram-frame"
      to: "Venn chip drag scale (svg.getBoundingClientRect().width)"
      via: "width-driven scaling only. Venn SVGs get no max-height, so the svg box is never letterboxed and the drag math stays exact"
      pattern: "max\\(1040px, 205vh\\)"
---

<objective>
Make the hub (index.html) and every tool page use the full width of the window, the way Factor Tree already does. Factor Tree's `.wrap` has no max-width, and only its subtitle keeps a 72ch readability cap.

The user's request, verbatim: "make all the tools on the website use the full width of the page when possible, this is the current behaviour of 'Factor Tree'; all pages should be like that".

Purpose: on wide monitors, every page except Factor Tree is currently squeezed into a centred 980–1120px column with large empty margins. After this change, panels, grids, tables and diagrams use the whole window. Diagrams are guarded so they never grow taller than the viewport, which is what "when possible" means here.

Output: one CSS edit set per page (15 pages), one small JS line in Square and Multiply, and a reusable layout probe, `width-probe.js`.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

Reference behaviour: `Factor Tree/factor-tree.html`, lines 26-34. `.wrap` declares `position:relative; z-index:2; margin:0 auto; padding:...` and has NO max-width. `.subtitle` declares `max-width:72ch`. Factor Tree is not modified by this plan. The probe uses it as the known-good reference.

Probe pattern to imitate: `.planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js`:
- `buildSite()` copies `assets/` and each page into a harness scratch dir.
- `pageFor()` injects a probe `<script>` and a `<pre>` before `</body>` into a copy of the page.
- `runChrome()` spawns `google-chrome --headless=new ... --dump-dom` with `harness.chromeEnv()`.
- `unescapeHtml()` decodes the dumped `<pre>`.

`.planning/phases/07-shared-js-module-refactor/harness.js` exports `mkScratch(prefix)` and `chromeEnv()`.

Out of scope (leave as-is): the site header inner width (`assets/site.css` `.site-header-inner`, 1180px), which is the same on every page including Factor Tree. Also out of scope: each page's own container padding values, and any CLAUDE.md or README wording.

## Inventory of the caps this plan removes (planner-verified, 2026-10-06)

| Page | Container rule (line) | Lede rule (line) | Diagram guard (line, native viewBox height) |
|------|------------------------|------------------|---------------------------------------------|
| index.html | `.hub{` multi-line (24-28, cap on line 25) | `.hero p{` multi-line (41-46) | none |
| RSA/rsa.html | `.app{` one-line (27) | `.page-header p{` (31) | none |
| Cayley Table/cayley-table.html | `.app{` (60) | `.lede{` (66) | none |
| Chinese Remainder Theorem/chinese-remainder-theorem.html | `.app{` (59) | `.lede{` (63) | none |
| Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html | `.app{` (28) | `.page-header p{` (32) | `#stageSvg{` (98, 460) |
| Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html | `.app{` (40, the 1080 variant) | `.page-header p{` (44) | `#curveSvg{` (98, 560) |
| Euclidean Algorithm/euclidean-algorithm.html | `.app{` (54) | `.lede{` (58) | `#tileSvg{` (162, 360), `#nestedSvg{` (185, 420) |
| Eulers Totient/eulers-totient.html | `.app{` (54) | `.lede{` (58) | none |
| Fermats Method/fermats-method.html | `.app{` multi-line (34-41, cap on line 36) | `.page-header p{` (47) | `svg.diagram{` (179, 400) |
| Shors Algorithm/shors-algorithm.html | `.app{` (28) | `.page-header p{` (32) | none (`#cycleRing` keeps its 520px cap, per PD-5) |
| Sieve Of Eratosthenes/sieve-of-eratosthenes.html | `.app{` multi-line (41-48, cap on line 43) | `.page-header p{` (56) | none |
| Square And Multiply/square-and-multiply.html | `.app{` (28) | `.page-header p{` (32) | `#ladderSvg{` (107, dynamic H set in `buildLadder`, line 484) |
| Equivalence Wheel/equivalence-wheel.html | `.wrap{` (35) | `.lede{` (41) | none (`.diagram-frame` 880px kept, per PD-5) |
| Group Isomorphism/group-isomorphism.html | `.wrap{` (37) | `.lede{` (43) | none (`.diagram-frame` 460px kept, per PD-5) |
| Venn Diagram/venn-diagram.html | `.wrap{` (23) | `.lede{` (29) | `.diagram-frame{` (211) gets viewport-bounded growth instead, per PD-4 |

Line numbers are as of commit 6b3c6b1. Locate each rule by its selector if lines have shifted.

Planner-verified JS width dependencies: none of the changed pages lays out from a cached container width that the cap protected.
- CRT's strip uses clientWidth only for scroll-into-view.
- Sieve, Totient and Cayley size cells from n, not from width.
- Venn's drag converts pointer pixels to viewBox units via `svg.getBoundingClientRect().width` (line ~1699), which stays exact as long as Venn SVGs are never letterboxed. That is why PD-3's height guard is NOT applied to Venn.
- Only Factor Tree and Venn read pointer coordinates. No page uses getScreenCTM.

## Planner decisions (PD) — the executor implements these exactly

- **PD-1 (page container).** Remove the px max-width declaration from the page-level container rule on all 15 pages in the inventory: `.app` on 11 tool pages, `.wrap` on Equivalence Wheel, Group Isomorphism and Venn, and `.hub` on index.html.
  - Keep `margin:0 auto` and each page's existing padding untouched. Factor Tree's `.wrap` is exactly this shape.
  - Delete the declaration outright. Do not replace it with `max-width:none` or `100%`, and add no CSS comment mentioning the removed value.
  - The Equivalence Wheel `@media print` rule that sets `.wrap{ max-width:none; padding:0; }` stays as it is.
- **PD-2 (lede readability cap).** Append `max-width:72ch;` to each page's lede rule, the second column of the inventory. This gives exact parity with Factor Tree's `.subtitle`.
  - Add no other new prose caps. In-panel paragraphs, form rows and controls go full width, like Factor Tree's work area.
  - Existing inner caps stay as they are: 62ch/64ch captions and notes, and 160px fields.
- **PD-3 (diagram height guard).** The SVGs in the inventory's guard column use `width:100%; height:auto` with a fixed aspect ratio. At full width they would balloon: ECDH's 560x560 curve would reach about 1800px tall at 1900px wide. Each one gets `max-height:max(80vh, Hpx)` appended to its existing rule, where H is its native viewBox height (460 / 560 / 360 / 420 / 400).
  - Result: the svg box still spans the full width. When the viewport is too short, the drawing is letterboxed and centred by its xMidYMid meet aspect handling. It is never rendered below 1:1 viewBox scale, so labels never shrink below their designed size.
  - Square and Multiply's ladder height is data-driven. Its rule gets `max-height:max(80vh, var(--ladder-h, 0px))`. `buildLadder` writes `--ladder-h` as `H + 'px'` via `ladderSvg.style.setProperty`, right after it sets the viewBox. This is a non-colour runtime custom property, the same pattern as the Sieve's `--cell-min`, and is allowed by CLAUDE.md's palette rule.
  - Known, accepted side effect: on a short laptop viewport (for example 1366x768), the ECDH curve now fits the window (about 614px) instead of running about 990px tall. Record this in the SUMMARY.
- **PD-4 (Venn frame).** Change Venn's `.diagram-frame` max-width from its fixed px value to `max(1040px, 205vh)`.
  - The frame holds the interactive pane and the composite pane side by side (above 860px). Each 900x700 three-circle pane is therefore about (frameWidth − 18)/2 × 7/9 tall.
  - The 205vh bound keeps that at or below about 80vh. It never binds on a 16:9 screen: at 1900x1000 the frame spans the full 1856px content width. It binds only on ultra-wide screens, and the frame is never narrower than before.
  - Do NOT add max-height to any Venn svg. Letterboxing would break the width-based drag scale.
- **PD-5 (intrinsic caps kept).** Leave these unchanged: Equivalence Wheel `.diagram-frame` max-width 880px (plus its print rules), Group Isomorphism `.diagram-frame` max-width 460px, and Shor `#cycleRing` max-height 520px. These square diagrams are bounded by viewport height, not width.
  - Also unchanged: Cayley's 70vh table scroller, Sieve's 62vh grid scroller, the table/list max-heights, Cayley's 160px field and 64ch note, DH's inline 160px field, and the 62ch captions.
- **PD-6 (public-values dock).** RSA and Diffie-Hellman hang their bottom-right public-values panel from `.scratchpad-dock`, which sits outside `.app` and is pinned to the viewport's right edge. Do not change it.
  - At wide viewports the panel used to sit in the empty right margin. Now it floats over the right edge of the full-width panels while scrolling, exactly as it already does on any viewport narrower than about 1600px. Record this in the SUMMARY.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Tracer — layout probe plus full-width RSA, verified end-to-end in headless Chrome</name>
  <files>.planning/quick/261006-cmy-make-every-tool-page-and-the-hub-use-the/width-probe.js, RSA/rsa.html</files>
  <read_first>
    - .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js (buildSite, pageFor, unescapeHtml, runChrome, runSequence, around lines 488-560, plus its ROOT/harness require at the top)
    - .planning/phases/07-shared-js-module-refactor/harness.js (mkScratch, chromeEnv, around lines 330-372)
    - Factor Tree/factor-tree.html lines 20-35 (the reference .wrap and .subtitle)
    - RSA/rsa.html lines 20-45 and 155-170 (.app, .page-header p, the scratchpad dock)
  </read_first>
  <action>
Step 1, write the probe. Create `.planning/quick/261006-cmy-make-every-tool-page-and-the-hub-use-the/width-probe.js` as a CommonJS Node script.
- Use only Node built-ins (fs, path, child_process, url) plus `harness.js`, required the same way shared-palette-probe.js does it. ROOT is the repo root, resolved from __dirname.
- Define a PAGES table with 16 keys. Each entry gives dir, file, container selector, lede selector and a diagrams list. Diagram entries may carry `optional:true`.
  - hub: dir is the repo root, file index.html, container `main.hub`, lede `.hero p`.
  - factorTree: the reference page, container `.wrap`, lede `.subtitle`.
  - `.app` pages:
    - rsa: lede `.page-header p`.
    - cayley, crt: lede `.lede`.
    - dh: lede `.page-header p`, diagram `#stageSvg`.
    - ecdh: lede `.page-header p`, diagram `#curveSvg`.
    - euclid: lede `.lede`, diagrams `#nestedSvg` and `#tileSvg` (optional, because the default view hides it).
    - totient: lede `.lede`.
    - fermat: lede `.page-header p`, diagram `#diagramSvg`.
    - shor: lede `.page-header p`, diagram `#cycleRing`.
    - sieve: lede `.page-header p`.
    - sqm: lede `.page-header p`, diagram `#ladderSvg`.
  - `.wrap` pages, all with lede `.lede`:
    - wheel: diagram `#wheel`.
    - iso: diagrams `#wheel-left` and `#wheel-right`.
    - venn: diagrams `#venn` and `#venn-composite` (optional). Also a frame check on `#frame-two`.
  - A diagram may be marked optional only if it is hidden in the page's default state, and the SUMMARY must name every optional entry.
- CLI: positional arguments select page keys. The default is all 16, and an unknown key exits with code 2. The flag `--shots` adds screenshots.
- Static checks per selected page. Read the HTML source, concatenate the text of its `<style>` blocks, and walk every `selector { body }` block, with multi-line bodies included.
  - S1: no block whose selector is exactly the page's container class (`.app`, `.wrap`, or `.hub`, optionally prefixed by `main`) declares a max-width with a px value.
  - S2: the block for the page's lede selector declares a max-width of 72ch, whitespace-tolerant.
- Browser checks:
  - Build a scratch site with `harness.mkScratch('cmy-site-')`, copying `assets/` and each selected page's html into its own dir. The hub goes at the scratch root.
  - Inject the probe script and a `<pre id="cmy-out">` before `</body>` into a copy named `cmy-probe.html` that sits next to the page copy, so relative asset paths still resolve.
  - Run google-chrome with `--headless=new`, `--disable-gpu`, `--no-sandbox`, `--user-data-dir` set to a fresh `harness.mkScratch('cmy-profile-')` dir, `--window-size=1900,1000`, `--virtual-time-budget=10000` and `--dump-dom`, against the copy's file URL plus `?lang=en`. Pass `env: harness.chromeEnv()`.
  - The in-page probe waits for window load plus 3000ms, then emits one line per check. When it finishes it sets `data-done="1"` on the pre.
  - B1: the container's bounding-rect width is at least `document.documentElement.clientWidth − 1`, meaning it spans the window like Factor Tree.
  - B2: the lede's computed maxWidth is not 'none', and its px value is at most 0.6 × clientWidth.
  - B3: `documentElement.scrollWidth` is at most clientWidth + 1, so there is no horizontal overflow.
  - B4: for each listed diagram, if its rect height is 0, report SKIP when it is optional and FAIL otherwise. If the svg has no viewBox, FAIL. Otherwise its height must be at most max(0.8 × innerHeight, viewBox.baseVal.height) + 1, and its width must be at least its parent element's content-box width (clientWidth minus horizontal padding) − 1.
  - B5 (venn only): the `#frame-two` width is at least its parent's content-box width − 1.
- Output:
  - Print each check as a `PASS`, `FAIL` or `SKIP` line prefixed with `[key]`.
  - A missing pre, or one without data-done, counts as FAIL.
  - The last line is `CMY-PROBE PASS` with exit code 0, or `CMY-PROBE FAIL <n>` with exit code 1.
- With `--shots`, screenshot the ORIGINAL in-repo page of each selected key, not the injected copy.
  - Use `--headless=new`, `--disable-gpu`, `--no-sandbox`, a fresh profile, `--window-size=1900,1000`, `--hide-scrollbars`, `--virtual-time-budget=6000` and `--screenshot=<shotsDir>/<key>.png`, against the file URL plus `?lang=en`.
  - shotsDir comes from `harness.mkScratch('cmy-shots-')`. Print `SHOTS <dir>`.
  - Never write screenshots or injected copies inside the repo tree.
  - Remove the scratch site and profiles at the end (best effort). Keep the shots dir.

Step 2, run it red. Run the probe with the keys `rsa factorTree`. Every factorTree check must PASS, and rsa must FAIL S1, S2, B1 and B2. If factorTree fails, the probe is wrong: fix the probe, never Factor Tree.

Step 3, apply PD-1 and PD-2 to RSA.
- In the one-line `.app{` rule (line ~27), delete the max-width declaration. Leave padding, margin, display, flex-direction and gap untouched.
- Append `max-width:72ch;` to the `.page-header p{` rule (line ~31).
- Do not touch `.scratchpad-dock` or `.pubkey-scratchpad` (PD-6).

Step 4, run it green. Run the probe with `rsa factorTree --shots` until it prints CMY-PROBE PASS. Then Read `rsa.png` and `factorTree.png` from the printed shots dir and confirm:
- RSA's panels span the window edge to edge, like Factor Tree's work area.
- The lede wraps at about 72ch.
- The two keycards sit side by side.
- Nothing is clipped or overflowing.
  </action>
  <verify>
    <automated>node .planning/quick/261006-cmy-make-every-tool-page-and-the-hub-use-the/width-probe.js rsa factorTree && ! grep -lPz '\.(app|wrap|hub)\s*\{[^}]*max-width:\s*[0-9]+px' RSA/rsa.html && grep -qPz '\.page-header p\s*\{[^}]*max-width:\s*72ch' RSA/rsa.html</automated>
  </verify>
  <done>width-probe.js exists, and before the RSA edit it reported RSA red and Factor Tree green. After the edit, `width-probe.js rsa factorTree` ends with CMY-PROBE PASS. The RSA screenshot at 1900x1000 shows full-width panels with a 72ch lede. The RSA dock is unchanged.</done>
</task>

<task type="auto">
  <name>Task 2: Full-width layout for the remaining ten .app tool pages, with diagram height guards</name>
  <files>Cayley Table/cayley-table.html, Chinese Remainder Theorem/chinese-remainder-theorem.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html, Euclidean Algorithm/euclidean-algorithm.html, Eulers Totient/eulers-totient.html, Fermats Method/fermats-method.html, Shors Algorithm/shors-algorithm.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Square And Multiply/square-and-multiply.html</files>
  <read_first>
    - The inventory table and PD-1/PD-2/PD-3/PD-5/PD-6 in this plan's context section
    - Square And Multiply/square-and-multiply.html lines 100-110 and 476-490 (#ladderSvg rule and buildLadder)
  </read_first>
  <action>
This task touches ten files, more than the usual five-file guidance. That is deliberate: every edit is the same one-to-three-declaration CSS change, and splitting would exceed the quick plan's three-task budget.

Apply PD-1 to all ten pages: delete the max-width declaration from the page-level `.app` rule, at the lines given in the inventory.
- Cayley, CRT, DH, ECDH, Euclid, Totient, Shor and Square-and-Multiply have one-line rules. Delete just that declaration.
- Fermat (line ~36) and Sieve (line ~43) have multi-line rules. Delete that whole line.
- Keep every other declaration in each rule, and add no comment.

Apply PD-2: append `max-width:72ch;` to the lede rule.
- `.lede{` on Cayley, CRT, Euclid and Totient.
- `.page-header p{` on DH, ECDH, Fermat, Shor, Sieve and Square-and-Multiply.

Apply PD-3 by appending a height guard to each listed rule:
- DH `#stageSvg{`: `max-height:max(80vh, 460px);`
- ECDH `#curveSvg{`: `max-height:max(80vh, 560px);`
- Euclid `#tileSvg{`: `max-height:max(80vh, 360px);`
- Euclid `#nestedSvg{`: `max-height:max(80vh, 420px);`
- Fermat `svg.diagram{`: `max-height:max(80vh, 400px);`
- Square-and-Multiply `#ladderSvg{`: `max-height:max(80vh, var(--ladder-h, 0px));`. Then, in `buildLadder(run)`, on the line right after the statement that sets the `viewBox` attribute to `'0 0 900 ' + H`, add `ladderSvg.style.setProperty('--ladder-h', H + 'px');`. Use the same quote style and two-space indentation as the surrounding code.

Per PD-5 and PD-6, do not touch:
- Shor `#cycleRing`'s 520px cap.
- Cayley's 160px field, 64ch note and 70vh table scroller.
- DH's inline 160px field.
- Sieve's 62vh grid scroller.
- Fermat's 320px table and ECDH's 320px list max-heights.
- The DH scratchpad dock.

Then run the probe with the keys `cayley crt dh ecdh euclid totient fermat shor sieve sqm --shots` until it prints CMY-PROBE PASS. Read at least the dh, ecdh, euclid, fermat, sqm and sieve screenshots and confirm:
- The panels span the window.
- Each diagram fills the panel width and is no taller than the window (ECDH's square curve is centred inside a full-width box).
- The Sieve and Totient grids show more columns than before.
- No control row or table is clipped.

If a screenshot shows a real breakage that the probe missed, such as overlapping elements or an unreadable layout, fix it within PD-1 to PD-6 and record the fix in the SUMMARY. Do not re-add a page-level cap.
  </action>
  <verify>
    <automated>node .planning/quick/261006-cmy-make-every-tool-page-and-the-hub-use-the/width-probe.js cayley crt dh ecdh euclid totient fermat shor sieve sqm && ! grep -lPz '\.(app|wrap|hub)\s*\{[^}]*max-width:\s*[0-9]+px' "Cayley Table/cayley-table.html" "Chinese Remainder Theorem/chinese-remainder-theorem.html" "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html" "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" "Euclidean Algorithm/euclidean-algorithm.html" "Eulers Totient/eulers-totient.html" "Fermats Method/fermats-method.html" "Shors Algorithm/shors-algorithm.html" "Sieve Of Eratosthenes/sieve-of-eratosthenes.html" "Square And Multiply/square-and-multiply.html" && test "$(grep -lP 'max-height:\s*max\(80vh,' "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html" "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" "Euclidean Algorithm/euclidean-algorithm.html" "Fermats Method/fermats-method.html" "Square And Multiply/square-and-multiply.html" | wc -l)" = 5 && grep -q "setProperty('--ladder-h'" "Square And Multiply/square-and-multiply.html"</automated>
  </verify>
  <done>All ten .app pages have no page-level px max-width and have a 72ch lede. The DH, ECDH, Euclid, Fermat and Square-and-Multiply diagrams fill the width and stay within max(80vh, native height). The ladder guard tracks the ladder's viewBox height through --ladder-h. The probe reports CMY-PROBE PASS for all ten keys, and the screenshots show no breakage.</done>
</task>

<task type="auto">
  <name>Task 3: Full-width hub and .wrap pages, Venn frame growth, and full-site verification</name>
  <files>index.html, Equivalence Wheel/equivalence-wheel.html, Group Isomorphism/group-isomorphism.html, Venn Diagram/venn-diagram.html</files>
  <read_first>
    - The inventory table and PD-1/PD-2/PD-4/PD-5 in this plan's context section
    - Venn Diagram/venn-diagram.html lines 205-222 and 1690-1705 (diagram-frame/split CSS and the drag scale)
    - Equivalence Wheel/equivalence-wheel.html lines 278-290 (print rules that must stay)
  </read_first>
  <action>
index.html:
- Delete the max-width line from the multi-line `.hub{` rule (line ~25), keeping margin and padding (PD-1).
- Add `max-width: 72ch;` to the multi-line `.hero p{` rule (PD-2), matching that rule's spaced declaration style.
- The `.card-grid` auto-fill minmax(400px, 1fr) stays. At 1900px it gives four card columns.

Equivalence Wheel:
- Delete the max-width declaration from `.wrap{` (line ~35) (PD-1).
- Append `max-width:72ch;` to `.lede{` (line ~41) (PD-2).
- Leave the 880px `.diagram-frame`, the 62ch caption and the whole `@media print` block untouched (PD-5).

Group Isomorphism:
- Delete the max-width declaration from `.wrap{` (line ~37) (PD-1).
- Append `max-width:72ch;` to `.lede{` (line ~43) (PD-2).
- Leave the 460px `.diagram-frame` and the 62ch caption untouched (PD-5).

Venn Diagram:
- Delete the max-width declaration from `.wrap{` (line ~23) (PD-1).
- Append `max-width:72ch;` to `.lede{` (line ~29) (PD-2).
- In `.diagram-frame{` (line ~211), replace the fixed px max-width value with `max(1040px, 205vh)`, keeping `width:100%` and `margin:0 auto` (PD-4).
- Add no max-height to any Venn svg, because the drag scale at line ~1699 depends on width-only scaling.

Then run the full probe with no keys and `--shots`, so all 16 pages are checked, until it prints CMY-PROBE PASS. Read the hub, venn, wheel and iso screenshots and skim the remaining ones. Confirm:
- Every page's content spans the window like factorTree.png.
- The hub shows four card columns with a 72ch hero lede.
- The Venn panes sit side by side, each about half the window wide.
- The wheel and iso diagrams are centred at their kept sizes.

Then run the regression gates, unchanged from earlier tasks: `node .planning/phases/06-multi-language-support/i18n-check.js --all` and `node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all`. Both must exit 0, as they did at baseline.

Write the SUMMARY. It must include:
- the per-page list of removed caps;
- PD-3's ECDH short-viewport side effect;
- PD-6's dock-overlap note;
- every diagram the probe treats as optional;
- the shots directory path.
  </action>
  <verify>
    <automated>node .planning/quick/261006-cmy-make-every-tool-page-and-the-hub-use-the/width-probe.js && ! grep -lPz '\.(app|wrap|hub)\s*\{[^}]*max-width:\s*[0-9]+px' index.html */*.html && ! grep -LPz '\.(lede|subtitle|hero p|page-header p)\s*\{[^}]*max-width:\s*72ch' index.html */*.html && grep -q 'max(1040px, 205vh)' "Venn Diagram/venn-diagram.html" && node .planning/phases/06-multi-language-support/i18n-check.js --all >/dev/null && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all >/dev/null</automated>
    <human-check>Open index.html, Venn Diagram/venn-diagram.html, Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html and RSA/rsa.html from disk in a maximised browser window on a wide monitor. Confirm that each page uses the full width like Factor Tree. Drag a prime chip into a Venn region and confirm it lands where you drop it. Scroll RSA and confirm the bottom-right public-key panel is still usable.</human-check>
  </verify>
  <done>No page in the site keeps a page-level px max-width, and every page has a 72ch lede. The full 16-page probe prints CMY-PROBE PASS at 1900x1000. Venn's frame uses max(1040px, 205vh), and its drag math is untouched. i18n-check --all and shadow-check --all both exit 0. The SUMMARY records the decisions, the side effects and the shots directory.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none new | Static CSS layout changes plus one JS line that writes a numeric custom property. No new input, storage key, network call or DOM-injection path. |
| probe -> filesystem | width-probe.js writes injected page copies, Chrome profiles and screenshots. It must only write to harness scratch dirs. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-cmy-01 | Tampering | width-probe.js page copies | low | mitigate | Injected copies, profiles and screenshots go only into `harness.mkScratch` dirs, never into the repo tree. Screenshots read the original pages without modifying them. The Task 3 grep gates scan the real pages, which the probe never writes. |
| T-cmy-02 | Denial of Service (usability) | full-width SVG diagrams | low | mitigate | The PD-3 `max(80vh, native)` guards and the PD-4 Venn 205vh bound keep diagrams within the viewport. Probe check B4 asserts this on every diagram page at 1900x1000. |
| T-cmy-03 | Information Disclosure | --ladder-h inline style | low | accept | The value is a px length computed from the step count of the user's own run. Nothing user-supplied reaches CSS as text. |
| T-cmy-SC | Tampering | npm/pip/cargo installs | low | accept | This plan installs no packages. The probe uses only Node built-ins and the existing in-repo harness.js. |
</threat_model>

<verification>
- `node .planning/quick/261006-cmy-make-every-tool-page-and-the-hub-use-the/width-probe.js` ends with CMY-PROBE PASS for all 16 pages at 1900x1000 (S1, S2, B1-B5).
- `! grep -lPz '\.(app|wrap|hub)\s*\{[^}]*max-width:\s*[0-9]+px' index.html */*.html` prints nothing. Before this plan it listed exactly the 15 inventory pages, and never Factor Tree.
- `! grep -LPz '\.(lede|subtitle|hero p|page-header p)\s*\{[^}]*max-width:\s*72ch' index.html */*.html` prints nothing.
- `node .planning/phases/06-multi-language-support/i18n-check.js --all` and `node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all` exit 0.
- The screenshots at 1900x1000, viewed by the executor, show every page spanning the window like Factor Tree, with diagrams no taller than the window.
</verification>

<success_criteria>
- All 15 pages in the inventory behave like Factor Tree on wide screens: the content container spans the full window, and only the lede is capped at 72ch.
- Diagrams use the extra width without overflowing the viewport vertically. Intrinsic square-diagram caps are unchanged.
- No horizontal overflow on any page, and no regression in i18n or shadow gates.
- `width-probe.js` remains in the quick dir as a reusable layout regression check.
</success_criteria>

<output>
Create `.planning/quick/261006-cmy-make-every-tool-page-and-the-hub-use-the/261006-cmy-SUMMARY.md` when done
</output>
