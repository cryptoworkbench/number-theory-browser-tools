---
phase: quick-260928-fdw
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Venn Diagrams/venn-diagrams.html
autonomous: true

must_haves:
  truths:
    - "Both the two-circle and three-circle diagram frames render two side-by-side panes: an unchanged interactive pane (same ids, same click/keyboard/drag behaviour as before) and a new read-only composite pane, stacking to a single column under 860px viewport width."
    - "With no saved state, the two-circle composite pane shows exactly 6, 5, 7 for its left/overlap/right regions -- the product of ONLY the primes physically placed in that region (2*3, 5, 7) -- not the 30/35 totals the shared products panel below prints for A and B."
    - "Loading `?a=12&b=18` (a different, code-derived left/overlap/right split of [2]/[2,3]/[3]) makes the two-circle composite pane show exactly 2, 6, 3 -- proving the numbers are derived live from current state, not a hardcoded seed."
    - "With no saved state, the three-circle composite pane shows exactly 2, 3, 5, 7, 11, 13, 17 for its seven regions (aOnly, bOnly, cOnly, ab, ac, bc, abc) -- each equal to that region's own single seeded prime, not the 2618/4641/12155 circle totals the shared products panel prints."
    - "Placing or removing a prime through the existing interactive pane (click, keyboard, or drag) immediately updates the matching region's number in the composite pane, in both modes, with zero interaction on the composite pane itself, and the update survives switching modes and switching back."
    - "The composite pane's badges carry no `.region` class, no `tabindex`, and no `role` attribute, and are built only by the shared static-drawing function -- never by `createRegion`/`createRegion3` -- so clicking or dragging onto them does nothing."
    - "The `.products-panel` rows (A=.., B=.., A ∩ B=.., etc.) and the `#message` status line remain single, unduplicated elements shared by both panes in both modes -- exactly one DOM node per id, unchanged from before this change."
    - "No literal colour value (hex, rgb/rgba, hsl/hsla) is introduced anywhere in the file, and the file still declares exactly one `<script src=...>` (the deferred `../assets/theme.js`) -- no new external dependency."
  artifacts:
    - "Venn Diagrams/venn-diagrams.html"
  key_links:
    - "`state.regions.{left,overlap,right}` / `state.regions3.{aOnly,bOnly,cOnly,ab,ac,bc,abc}` -> `render()` -> `renderComposite()`/`renderComposite3()` -> `productOf(primesOf(...))` -> each composite `<text>` node, so the composite pane can never disagree with the interactive pane -- both read the exact same arrays."
    - "`buildStatic(target)` / `buildStatic3(target)` are parameterised over a target `<g>` so the interactive pane's static geometry (circles, overlap fills, captions, circle-name letters) and the composite pane's are drawn by the SAME function calls, not two hand-maintained copies that could drift apart."
    - "`.diagram-split` / `.diagram-pane` wrap only the two `<svg>` frames inside `#frame-two` / `#frame-three`; `.products-panel` and `#message` sit outside that wrapper entirely, at the same DOM level as before, so they are never duplicated per pane."
    - "`appendCompositeBadge()` is the single place a composite value reaches the DOM, always via `textContent`, never `innerHTML`, and it is called only from `renderComposite()`/`renderComposite3()` -- never from any click/keydown/drag handler."
---

<objective>
Add a split view to the Venn Diagrams tool: each diagram frame (two-circle and three-circle) gains a second, read-only pane alongside the existing interactive one, showing -- per region -- only the composite number formed by multiplying the primes currently placed in that region. The shared products panel and message line below the diagrams stay singular, unduplicated.

Purpose: the interactive diagram already teaches "primes placed in a region multiply out to something"; a bare number is the natural, wordless answer to "so what does this region actually multiply to?" placed right next to the question, without touching the proven interactive mechanics at all.
Output: one edited file, `Venn Diagrams/venn-diagrams.html` -- a layout split, two new read-only SVG panes (one per mode), and the small rendering code that keeps them in sync with existing state.
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

- **D-01 -- "mirrored" means the paired counterpart side of the split, not a geometric flip.** The composite pane draws the exact same (non-flipped) geometry as the interactive pane -- same circle positions, same region shapes -- because flipping coordinates would require re-deriving every arc's sweep flag for no functional gain, and would visually swap which side reads A vs B while the persistent circle-name letters stayed put, making the diagram misread. "Mirrored" is read per the request's own framing ("One side... the other (mirrored) side") as "the other side of the split."
- **D-02 -- the composite number is the RAW region-only product, not the circle total.** "The composite number formed by multiplying together the prime factors that region currently contains" means only the primes physically placed in that one bucket (e.g. `state.regions.left`), never the union with sibling regions that the shared products panel already totals into A / B (or A / B / C). This is a new, previously-undisplayed derived value.
- **D-03 -- captions and circle-name letters are duplicated; the products panel and message line are not.** Everything drawn inside the SVG viewBox (circles, overlap fills, the "A only" / "both" / "B only"-style captions, the A/B/C letters) is part of "the interactive Venn diagram" per the request and is redrawn identically in the composite pane by reusing the same static-build call. Everything living in `.products-panel` and `#message`, which sits in the DOM below `.diagram-frame`, is "the text labels underneath the Venn diagram" the request says must stay singular -- it is left completely alone.
- **D-04 -- the composite pane is read-only by construction, not by convention.** It is built from the shared static-drawing function alone, and NEVER from `createRegion` / `createRegion3` / `buildRegions` / `buildRegions3` -- so there is no code path by which it could become a second control surface, and no ARIA button/tabindex semantics are ever attached to it.
- **D-05 -- layout.** A `.diagram-split` flex row holds `.diagram-pane.pane-interactive` and `.diagram-pane.pane-composite` inside each existing `#frame-two` / `#frame-three`, stacking to one column under 860px. `.diagram-frame`'s `max-width` grows from 880px to 1040px (still inside the page's existing 1120px `.wrap`) so neither pane is squeezed.
- **D-06 -- reusing the static-drawing functions for both panes requires dropping their five hardcoded circle-name ids** (`circle-name-left`, `circle-name-right`, `circle-name-a`, `circle-name-b`, `circle-name-c`) -- confirmed by repo search to be unused by any CSS selector or other script line -- so calling each function a second time never produces a duplicate DOM id.

</decisions>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Two-circle split view end to end -- layout, shared static-draw refactor, composite pane, live sync</name>
  <files>Venn Diagrams/venn-diagrams.html</files>
  <precondition>google-chrome (or google-chrome-stable) is on PATH; the verify step drives it headless. Halt and report if absent.</precondition>
  <reversibility rating="reversible">Single file, single commit, three-circle mode and every existing interactive handler untouched -- revertible with one git revert.</reversibility>
  <read_first>
Read `Venn Diagrams/venn-diagrams.html` in full before editing -- one pass, extracting: `svgEl`, `productOf`, `primesOf`, `REGION_ANCHOR`, `REGION_NOTATION`, `REGION_CAPTIONS`; the `buildStatic()` function (circles, lens fill, the three `region-label` captions with their `<title>` tooltips, the two `circle-name` letters, including the two now-to-be-dropped `id: 'circle-name-left'/'circle-name-right'` attributes); the `.placed-chip` CSS rules and the exact attribute order `svgEl('rect', {x,y,width,height,rx})` / `svgEl('text', {x,y})` used in `renderTokens`; the `.diagram-frame` / `svg#venn, svg#venn3` CSS rules; and the `window.addEventListener('load', ...)` bootstrap order (`buildStatic(); buildRegions(); ...`).
  </read_first>
  <behavior>
    End-to-end path being proven: `state.regions.{left,overlap,right}` reaching a brand-new, read-only badge in a sibling pane, with zero duplication of the shared labels below.
    - Default seed (no query string): the composite pane shows exactly 6 (left), 5 (overlap), 7 (right) -- the product of ONLY each region's own primes, not the 30 / 35 totals `#product-left` / `#product-right` show for A / B.
    - `?a=12&b=18` (existing `fillFromNumbers` logic yields left=[2], overlap=[2,3], right=[3]): the composite pane shows exactly 2, 6, 3 -- proving live derivation, not a hardcoded seed.
    - Arming prime 11 from the picker and clicking the existing `#region-left` region (exactly as today) updates the composite pane's left badge from 6 to 66, with no interaction on the composite pane itself.
    - The composite pane's three badges carry no `tabindex`, no `role`, and no `.region` class -- nothing there is clickable or keyboard-focusable.
    - `document.querySelectorAll('.products-panel').length` is 3 and `#product-left` / `#product-overlap` / `#product-right` / `#message` each still resolve to exactly one element -- unchanged from before this task.
  </behavior>
  <action>
Style block: change `.diagram-frame{ width:100%; max-width:880px; margin:0 auto; }` to `max-width:1040px`. Immediately after it add three new rules, each its own multi-line block matching the file's existing style (selector, then indented properties): `.diagram-split{ display:flex; gap:18px; align-items:flex-start; }`; `.diagram-pane{ flex:1 1 0; min-width:0; }`; `.pane-caption{ font-family:'JetBrains Mono', monospace; font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--text-dim); text-align:center; margin:0 0 6px; }`; and inside the existing `@media (prefers-reduced-motion...)` block's sibling area add a new `@media (max-width: 860px){ .diagram-split{ flex-direction:column; } }` block. Change the selector line `svg#venn, svg#venn3{ width:100%; height:auto; display:block; overflow:visible; }` to add `, svg#venn-composite` before the `{`. Near the `.placed-chip` rules add three new rules: `.composite-chip rect{ fill:var(--surface); stroke:var(--panel-border-strong); stroke-width:1.4; }`; `.composite-chip text{ font-family:'JetBrains Mono', monospace; font-size:15px; font-weight:600; fill:var(--text); text-anchor:middle; dominant-baseline:central; pointer-events:none; }`; `.composite-chip.chip-compact text{ font-size:13px; }`. Every value is a `var()` against an existing `assets/palette.css` token or a plain non-colour literal -- introduce no hex/rgb/hsl value (D-05).

Markup: replace the `#frame-two` block's single `<svg id="venn" ...>` with a `<div class="diagram-split">` containing two `<div class="diagram-pane pane-interactive">` / `<div class="diagram-pane pane-composite">` children. The interactive pane keeps the existing `<p>`-free markup: just the untouched `<svg id="venn" ...>` exactly as it is today, preceded by a new `<p class="pane-caption">Interactive diagram</p>`. The composite pane gets `<p class="pane-caption">Region composites</p>` followed by a new `<svg id="venn-composite" viewBox="0 0 900 520" role="img" aria-label="Read-only mirror of the two-circle diagram showing each region's composite number, the product of only the primes placed in that region">` containing empty `<g id="venn-composite-static"></g>` and `<g id="venn-composite-dynamic"></g>`. Leave `#frame-three` untouched in this task (D-01, D-03, D-05).

Script: refactor `function buildStatic(){` to `function buildStatic(target){`, replacing every `svgStatic.appendChild(` inside its body with `target.appendChild(`, and deleting the two `id: 'circle-name-left'` / `id: 'circle-name-right'` object properties from the `nameLeft` / `nameRight` `svgEl('text', {...})` calls -- keep every other property (class, x, y) and the `textContent` assignments exactly as they are (D-06). Add two new `var` declarations next to the existing `svgStatic` / `svgDynamic` lookups: `var svgCompositeStatic = document.getElementById('venn-composite-static');` and `var svgCompositeDynamic = document.getElementById('venn-composite-dynamic');`. Add two new functions near `renderTokens`: `function badgeWidth(text, compact){ var perChar = compact ? 8 : 10; var pad = compact ? 16 : 20; var base = compact ? 44 : 54; return Math.max(base, text.length * perChar + pad); }` and `function appendCompositeBadge(target, anchor, value, notation, compact){ var text = String(value); var w = badgeWidth(text, compact); var h = compact ? 24 : 32; var g = svgEl('g', { class: compact ? 'composite-chip chip-compact' : 'composite-chip' }); g.appendChild(svgEl('title')).textContent = notation + ' = ' + text; g.appendChild(svgEl('rect', { x: anchor[0] - w / 2, y: anchor[1] - h / 2, width: w, height: h, rx: compact ? 6 : 8 })); var t = svgEl('text', { x: anchor[0], y: anchor[1] }); t.textContent = text; g.appendChild(t); target.appendChild(g); }` (attribute order on the `rect`/`text` calls matters -- match it exactly, it mirrors `renderTokens`'s own `svgEl` calls). Add `function renderComposite(){ svgCompositeDynamic.innerHTML = ''; var keys = ['left', 'overlap', 'right']; for (var i = 0; i < keys.length; i++){ var key = keys[i]; var value = productOf(primesOf(state.regions[key])); appendCompositeBadge(svgCompositeDynamic, REGION_ANCHOR[key], value, REGION_NOTATION[key], false); } }`. Inside `render()`, add a call to `renderComposite();` immediately after the existing `refreshRegionLabels();` line (before the three-circle calls). Inside the `window.addEventListener('load', ...)` bootstrap, change `buildStatic();` to `buildStatic(svgStatic);` and add a new line `buildStatic(svgCompositeStatic);` directly after it, before `buildRegions();`. Do not touch `buildStatic3`, `buildRegions3`, or any three-circle code path in this task.
  </action>
  <verify>
    <automated>Static gates, cwd at the repo root, `F="Venn Diagrams/venn-diagrams.html"`. Run each line below; every one must exit 0 (existence checks use `grep -q`, absence checks use `! grep -q`, the two remaining counts are the safe `== 1` presence idiom):
`grep -q 'id="venn-composite"' "$F"`
`grep -q 'venn-composite-static' "$F"`
`grep -q 'venn-composite-dynamic' "$F"`
`grep -q 'function buildStatic(target)' "$F"` (confirms the refactor signature)
`grep -q 'buildStatic(svgStatic)' "$F"` (confirms the first call site was updated)
`grep -q 'buildStatic(svgCompositeStatic)' "$F"` (confirms the second call site was added)
`! grep -q 'circle-name-left' "$F"` (id removed -- was present before this task)
`! grep -q 'circle-name-right' "$F"` (id removed -- was present before this task)
`grep -q 'function renderComposite()' "$F"`
`grep -q 'renderComposite();' "$F"` (confirms it is called from `render()`)
`grep -q 'function appendCompositeBadge(' "$F"`
`grep -q 'function badgeWidth(' "$F"`
Read-only-ness (no `createRegion`/`buildRegions` wiring against the composite target) is proven behaviourally in the next gate, via real DOM queries, rather than by a static occurrence count.
`[ "$(grep -c 'script.*src=' "$F")" = 1 ]` (no new external dependency)
`[ "$(grep -c 'id="product-left"' "$F")" = 1 ]`
`[ "$(grep -c 'id="product-overlap"' "$F")" = 1 ]`
`[ "$(grep -c 'id="product-right"' "$F")" = 1 ]`
`[ "$(grep -c 'id="message"' "$F")" = 1 ]`
`! (grep -v '/\*' "$F" | grep -qE '#[0-9A-Fa-f]{3,8}\b|rgb\(|rgba\(|hsl\(|hsla\(')` (literal-colour gate)
Print `T1-STATIC-COMPLETE` once every line above exits 0.</automated>
    <automated>Behavioural gate via headless Chrome. Build a throwaway harness under the session scratchpad (never inside the repo): copy `Venn Diagrams/venn-diagrams.html`, rewrite its two `../assets/...` references to absolute filesystem paths so the copy still loads `palette.css` / `site.css` / `theme.js`, inject a `window.onerror` recorder as the first element in `<head>`, and inject an assertion script just before `</body>` that runs from its own `load` listener plus a `setTimeout` of 0 (so it runs after the page's own init) and writes a result into `document.body.dataset.splitCheck` -- mirror the harness technique used in quick tasks 260926-dgk and 260928-e7e. Run each load with `google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir="$(mktemp -d)" --virtual-time-budget=4000 --dump-dom "file://$HARNESS[?query]"`. LOAD A (no query string): assert `document.getElementById('venn-composite').getAttribute('role')` is `img`; `document.getElementById('venn-composite-static').children.length > 0`; `document.getElementById('venn-composite-dynamic').children.length === 3`; the three badges' own `<text>` children, read in DOM order, equal `['6','5','7']`; `document.getElementById('venn-composite-dynamic').querySelectorAll('[tabindex],[role],.region').length === 0`; then simulate a real click by finding the `.prime-chip` button whose `textContent` is `'11'` and dispatching a `click` on it, followed by a `click` dispatched on `document.getElementById('region-left')`, and re-reading the first composite badge's `<text>` -- expect `'66'`; finally assert `document.querySelectorAll('.products-panel').length === 3` and the recorded `window.onerror` array is empty. LOAD B (`?a=12&b=18`): assert the three composite badges read `['2','6','3']`. Write `PASS` or a specific `FAIL <case> expected <x> got <y>` into `document.body.dataset.splitCheck` and assert with `grep -qF 'data-split-check="PASS' "$dump"` for each load. Print `T1-BEHAVIOUR-COMPLETE`.</automated>
  </verify>
  <done>Two-circle mode renders a working split view: the interactive pane is byte-identical in behaviour to before, the composite pane shows the correct region-only product for the default seed and for a URL-supplied pair, updates live when a prime is placed through the interactive pane, carries no interactive affordance of its own, and the shared products panel / message line remain singular. Both gates print their completion markers.</done>
</task>

<task type="auto">
  <name>Task 2: Three-circle split view, responsive polish, and full-file regression</name>
  <files>Venn Diagrams/venn-diagrams.html</files>
  <action>
Mirror Task 1's pattern for the three-circle frame. Markup: replace `#frame-three`'s single `<svg id="venn3" ...>` with the same `.diagram-split` / two `.diagram-pane` structure used in `#frame-two` -- interactive pane keeps the existing `<svg id="venn3" ...>` untouched, preceded by `<p class="pane-caption">Interactive diagram</p>`; composite pane gets `<p class="pane-caption">Region composites</p>` followed by a new `<svg id="venn3-composite" viewBox="0 0 900 700" role="img" aria-label="Read-only mirror of the three-circle diagram showing each region's composite number, the product of only the primes placed in that region">` containing empty `<g id="venn3-composite-static"></g>` / `<g id="venn3-composite-dynamic"></g>`.

Style: extend the selector line touched in Task 1 so it reads `svg#venn, svg#venn3, svg#venn-composite, svg#venn3-composite{ ... }`. No other new CSS is needed -- `.diagram-split` / `.diagram-pane` / `.pane-caption` / `.composite-chip` from Task 1 already apply.

Script: refactor `function buildStatic3(){` to `function buildStatic3(target){`, replacing every `svg3Static.appendChild(` with `target.appendChild(`, and deleting the three `id: 'circle-name-a'` / `id: 'circle-name-b'` / `id: 'circle-name-c'` properties from the `nameA` / `nameB` / `nameC` calls (D-06). Add `var svg3CompositeStatic = document.getElementById('venn3-composite-static');` and `var svg3CompositeDynamic = document.getElementById('venn3-composite-dynamic');` next to the existing `svg3Static` / `svg3Dynamic` lookups. Add `function renderComposite3(){ svg3CompositeDynamic.innerHTML = ''; for (var i = 0; i < REGION_KEYS3.length; i++){ var key = REGION_KEYS3[i]; var value = productOf(primesOf(state.regions3[key])); appendCompositeBadge(svg3CompositeDynamic, CHIP_ANCHOR3[key], value, REGION_NOTATION3[key], true); } }` (reuses Task 1's `appendCompositeBadge`/`badgeWidth` -- do not duplicate them). Inside `render()`, add a call to `renderComposite3();` as the last line of the function, after `refreshRegionLabels3();`. Inside the load bootstrap, change `buildStatic3();` to `buildStatic3(svg3Static);` and add `buildStatic3(svg3CompositeStatic);` directly after it, before `buildRegions3();`.

Before finishing, re-read `buildRegions3()` and confirm this task added no new caller of it and no new `createRegion3(` call site -- the composite pane must stay wired from `buildStatic3(target)` alone.
  </action>
  <verify>
    <automated>Static gates, cwd at the repo root, `F="Venn Diagrams/venn-diagrams.html"`. Run each line below; every one must exit 0:
`grep -q 'id="venn3-composite"' "$F"`
`grep -q 'venn3-composite-static' "$F"`
`grep -q 'venn3-composite-dynamic' "$F"`
`grep -q 'function buildStatic3(target)' "$F"`
`grep -q 'buildStatic3(svg3Static)' "$F"`
`grep -q 'buildStatic3(svg3CompositeStatic)' "$F"`
`! grep -q 'circle-name-a' "$F"` (id removed -- was present before this task)
`! grep -q 'circle-name-b' "$F"` (id removed -- was present before this task)
`! grep -q 'circle-name-c' "$F"` (id removed -- was present before this task)
`grep -q 'function renderComposite3()' "$F"`
`grep -q 'renderComposite3();' "$F"` (confirms it is called from `render()`)
`grep -q 'productOf(primesOf(' "$F"` (the one helper from Task 1, reused, not duplicated)
`grep -A3 'id="frame-two"' "$F" | grep -q 'diagram-split'` (two-circle frame still split)
`grep -A3 'id="frame-three"' "$F" | grep -q 'diagram-split'` (three-circle frame now split too)
`grep -A12 'id="frame-two"' "$F" | grep -q 'pane-composite'` (12 lines comfortably spans past the interactive pane's own `<div>...</div>` block down to where the composite pane's div opens)
`grep -A12 'id="frame-three"' "$F" | grep -q 'pane-composite'`
`[ "$(grep -c 'script.*src=' "$F")" = 1 ]`
`[ "$(grep -c 'id="product-left"' "$F")" = 1 ]`
`[ "$(grep -c 'id="product-overlap"' "$F")" = 1 ]`
`[ "$(grep -c 'id="product-right"' "$F")" = 1 ]`
`[ "$(grep -c 'id="product-a"' "$F")" = 1 ]`
`[ "$(grep -c 'id="product-b"' "$F")" = 1 ]`
`[ "$(grep -c 'id="product-c"' "$F")" = 1 ]`
`[ "$(grep -c 'id="product-ab"' "$F")" = 1 ]`
`[ "$(grep -c 'id="product-ac"' "$F")" = 1 ]`
`[ "$(grep -c 'id="product-bc"' "$F")" = 1 ]`
`[ "$(grep -c 'id="product-abc"' "$F")" = 1 ]`
`[ "$(grep -c 'id="message"' "$F")" = 1 ]`
`! (grep -v '/\*' "$F" | grep -qE '#[0-9A-Fa-f]{3,8}\b|rgb\(|rgba\(|hsl\(|hsla\(')` (literal-colour gate, same command as Task 1)
Print `T2-STATIC-COMPLETE` once every line above exits 0.</automated>
    <automated>Behavioural gate via headless Chrome, same harness technique as Task 1, extended. LOAD (`?mode=three`): assert `document.getElementById('venn3-composite').getAttribute('role')` is `img`; `document.getElementById('venn3-composite-dynamic').children.length === 7`; the seven badges' `<text>` children, read in DOM order (aOnly, bOnly, cOnly, ab, ac, bc, abc), equal `['2','3','5','7','11','13','17']`; `document.getElementById('venn3-composite-dynamic').querySelectorAll('[tabindex],[role],.region').length === 0`. Then arm prime `19` from the picker and click `document.getElementById('region3-cOnly')`; re-read the third composite badge -- expect `'95'`. Click `document.getElementById('mode-two').click()`, re-read `venn-composite-dynamic`'s three badges -- still `['6','5','7']` (untouched by the three-circle interaction). Click `document.getElementById('mode-three').click()` again and re-read the seven three-circle badges -- `cOnly` still reads `'95'` (state, not just the view, persisted across the mode round-trip) and every other badge is unchanged. Assert `document.querySelectorAll('.products-panel').length === 3`, `document.querySelectorAll('[id="message"]').length === 1`, and the recorded `window.onerror` array is empty throughout. Write `PASS`/`FAIL` into `document.body.dataset.splitCheck3` and assert with `grep -qF`. Print `T2-BEHAVIOUR-COMPLETE`.</automated>
    <human-check>Open the file in a browser at a wide window (~1300px) in both day and night theme: both frames show two legible side-by-side panes, the composite badges don't clip their circles or collide with the plain-language captions, and the composite pane visibly offers no hover/cursor affordance where the interactive pane does. Then narrow the window below ~860px and confirm each frame's two panes stack into a single column without overlap.</human-check>
  </verify>
  <done>Three-circle mode has the same split-view treatment as two-circle mode, sharing the Task 1 layout CSS and badge-drawing helpers; both modes' composite panes stay correct and in sync with the interactive pane and with each other across mode switches; the shared products panel and message line remain singular across the whole file; no literal colour and no new external dependency anywhere; both themes and both layout breakpoints render cleanly.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Existing validated state -> a second render target | `state.regions` / `state.regions3` (already constrained to primes by `placePrime`/`placePrime3`/`restore`/`restore3`'s existing validation) now also feed a brand-new rendering surface, `renderComposite()` / `renderComposite3()`. No new input, parsing, or storage path is introduced -- only a new consumer of an already-trusted value. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-fdw-01 | Tampering | `appendCompositeBadge()` writing computed products into the composite `<text>` node | low | mitigate | Value is assigned via `t.textContent = text`, never `innerHTML`; the only inputs are `productOf(primesOf(state.regions[key]))` / `state.regions3[key]`, both already prime-validated arrays -- no new deserialization or parsing path is added. |
| T-fdw-02 | Denial of Service | Per-region product magnitude in a composite badge | low | accept | `MAX_PER_REGION`=8 / `MAX_PER_REGION3`=3 primes up to 101 can already produce numbers up to ~17 digits -- a pre-existing characteristic of `productOf`, already exercised at larger scale by the existing combined A/B totals in the products panel (which combine up to twice as many primes). `badgeWidth()` scales the badge for the common case; an extreme worst-case badge may visually overflow its region. Accepted as a rare, cosmetic-only edge case consistent with the tool's existing Number-precision conventions, not a functional break. |
| T-fdw-03 | Tampering | Duplicate DOM ids from calling `buildStatic`/`buildStatic3` a second time against the composite pane's static group | medium | mitigate | The five previously-hardcoded `circle-name-*` ids are deleted from `buildStatic`/`buildStatic3` (confirmed unused by any other selector or script line in the file, D-06) before either function is ever called twice, so no element id is duplicated in the document. |
| T-fdw-SC | Tampering | npm/pip/cargo installs | high | mitigate | Not applicable -- this plan adds no package, dependency, or build step; only inline markup/CSS/JS inside the existing single file. No install task exists, so the package-legitimacy gate is vacuously satisfied. |

</threat_model>

<verification>
1. **Split-layout sweep.** Both `#frame-two` and `#frame-three` contain a `.diagram-split` with exactly two `.diagram-pane` children each; the interactive pane's `<svg>` in each frame is unchanged (same id, same children built by the same `buildRegions`/`buildRegions3` calls as before this plan).
2. **Region-only-product sweep.** For both modes, every composite badge equals `productOf(primesOf(...))` over exactly that region's own array -- verified against the default seed and, for two-circle mode, against a second URL-derived state, in both cases distinct from the combined totals the shared products panel prints.
3. **Read-only sweep.** No composite badge anywhere carries `.region`, `tabindex`, or `role`; `createRegion(` / `createRegion3(` occurrence counts are unchanged from before this plan, proving no interactive wiring was added to either composite pane.
4. **No-duplication sweep.** Every shared-label id (`product-left` through `product-abc`, `message`) and the `products-panel` class count remain exactly what they were before this plan -- one full traversal of the finished file.
5. **Palette / dependency sweep.** The repo-wide literal-colour gate over this file is clean and the file still declares exactly one `<script src=...>`.
6. **Cross-mode persistence.** A prime placed through one mode's interactive pane, reflected in that mode's composite pane, survives switching to the other mode and back.
</verification>

<success_criteria>
- Both diagram modes show the existing interactive diagram unchanged, side by side with a new read-only pane that prints, per region, only the product of that region's own placed primes.
- The two panes never disagree, because both are painted from the same `state.regions` / `state.regions3` on every `render()`.
- The composite panes are provably inert: no click, keyboard, or drag interaction reaches them.
- The shared products panel and message line are not duplicated -- exactly one instance each, in both modes.
- The file remains a single self-contained page with no new external dependency and no literal colour, and both themes render legibly at both a wide (side-by-side) and narrow (stacked) viewport.
</success_criteria>

<output>
Create `.planning/quick/260928-fdw-venn-diagrams-tool-add-a-split-view-one-side-keeps-the-curre/260928-fdw-SUMMARY.md` when done
</output>
