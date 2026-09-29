---
phase: quick-260929-qqt
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Factor Tree/factor-tree.html
  - Venn Diagram/venn-diagram.html
autonomous: true
requirements: ["quick-260929-qqt"]

estimate:
  tokens: 70000
  raw_tokens: 45000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Opening `Factor Tree/factor-tree.html?n=<valid>` lands the tool in Balanced (Fermat's Method) mode with that number already factorized — the mode buttons, the Balanced caveat note, the input's max and the preset chips all match a hand-clicked Balanced switch."
    - "Opening the Factor Tree tool with no `n` param, an unparseable one, or one outside 1..1,000,000 behaves exactly as it does today: Classic mode, input value 60, Classic preset chips, the caveat note hidden."
    - "Hovering the Venn Diagram's three-circle `A∩B∩C` centre chip opens a Factor-Tree-only panel: one section, one heading, no nested-squares content, no scroll affordance, and wheel/ArrowDown/ArrowUp over that chip move nothing and do not swallow the event."
    - "Every other previewable chip (the two-circle `A ∩ B` overlap and the three pairwise `ab`/`ac`/`bc` chips) keeps today's two stacked sections — Factor Tree on top, Euclidean Algorithm below, same 268x196 footprint, same clamps, same affordance, same reset-to-top on every fresh hover or focus."
    - "Double-clicking a previewable chip opens whichever tool the section currently in view belongs to: the Factor Tree tool (with that chip's composite value as `?n=`) while the top section is in view, the Euclidean Algorithm tool (with the chip's existing `a`/`b` params) once the panel is scrolled to the Euclidean section."
    - "The `A∩B∩C` centre chip, which had no click target at all before, now always opens the Factor Tree tool with its composite value — and can never resolve to anything else, because it has no second section to scroll to."
    - "When the section in view has no valid target for its own tool, the double-click does nothing at all — no navigation, no thrown error, and no fallback to the other tool."
    - "Each section shows the `double-click to open the full view →` hint only when that section's own tool link is real: the Factor Tree section gains one, the Euclidean section keeps its existing one byte-identical, and the centre chip can only ever show the Factor Tree one."
    - "A chip's accessible name names exactly the click targets it actually has — both when both exist, one when one exists, and the centre chip names only the Factor Tree."
  artifacts:
    - "Factor Tree/factor-tree.html — gains a single-param URL entry point and a shared mode-applying helper; no other behaviour changes"
    - "Venn Diagram/venn-diagram.html — gains the Factor Tree link trio, a per-link `showEuclid` section switch, a per-layer scroll ceiling and a scroll-aware double-click resolver"
  key_links:
    - "`showRegionPreview(layer, opts)` ↔ `opts.showEuclid` — the one switch that decides whether a panel is one section or two; also the one place that sets the layer's scroll ceiling, so panel shape and scrollability can never disagree"
    - "`scrollNestedPreview(layer, delta)` ↔ `layer._npMax` — a zero ceiling is what makes the centre chip's wheel/key events genuine no-ops that leave `defaultPrevented` false"
    - "the `dblclick` handler ↔ `layer._npOffset` ↔ `NP_MAX_SCROLL / 2` — the click-time read that turns scroll position into a navigation target; reading the live offset (not a value captured at render time) is the whole point"
    - "`factorTreeHref(value)` ↔ `FT_MAX_N` ↔ the Factor Tree tool's `MAX_BALANCED_N` — both caps are 1,000,000 today, and that parity is what guarantees every URL this tool emits is one the target tool accepts"
    - "`isFactorTreeRange(value)` ↔ `drawTreeSection`'s over-cap bail ↔ the Factor Tree hint gate — one named predicate behind all three, so a hint can never be drawn in a section that bailed"
---

<!-- planner-discipline-allow: showEuclid, treeHref, factorTreeHref, isFactorTreeRange, FACTOR_TREE_PATH, readNParam, applyMode, drawTreeSection, drawEuclidSection, showRegionPreview, scrollNestedPreview, hideNestedPreview, appendCompositeBadge, openXref, euclidHref, isEuclidRange, EUCLID_PATH, MAX_BALANCED_N, FT_MAX_N, NP_MAX_SCROLL, np-scroll-hint, np-heading, np-hint, data-xref-href, data-xref-tree-href, Factor Tree, Euclidean Algorithm -->

<objective>
Give the Venn Diagram tool's `A∩B∩C` centre chip a Factor-Tree-only hover panel, and make every previewable chip's double-click open whichever tool the section currently in view belongs to — which means giving the Factor Tree tool a `?n=` deep link it does not have today.

Purpose: the centre chip's stacked panel currently offers a Euclidean Algorithm section built on a synthetic `gcd(gcd(a,b),c)` pair, which describes no real two-circle relationship the user is looking at. And since quick task `260929-q1o` made Factor Tree the top, default-visible section, the chip's double-click now contradicts what the user is looking at: it opens the Euclidean Algorithm tool no matter which miniature is on screen. Both halves of that are fixed here, and the Factor Tree tool finally becomes a link target rather than a dead end.

Output: two edited files, `Factor Tree/factor-tree.html` and `Venn Diagram/venn-diagram.html`, plus a scratchpad-only headless-Chrome behavioural harness (not committed).
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

@Venn Diagram/venn-diagram.html
@Factor Tree/factor-tree.html
</context>

<environment>
`node` (`/usr/bin/node`) and `google-chrome` (`/usr/bin/google-chrome`) are both on PATH. This repo has no package manager, no test runner and no build step — verification is a headless-Chrome behavioural harness written to the session scratchpad, exactly as quick tasks `260929-c11`, `260929-g19`, `260929-o99`, `260929-p80` and `260929-q1o` did. Reuse that recipe; do not invent a second one and do not commit the harness.

`$SP` below means this session's scratchpad directory. Record its real path in the SUMMARY.

Every path in this plan is relative to the checkout root; run all commands with the checkout root as cwd. Both tool directories contain a space, so quote `'Venn Diagram/venn-diagram.html'` and `'Factor Tree/factor-tree.html'` everywhere.

Line numbers below were read at plan time against a 2575-line `venn-diagram.html` and an 864-line `factor-tree.html`, both clean in the working tree. They may drift once you start editing — re-locate by identifier, never by line number alone.
</environment>

<current_shape>
Read once; do not re-read these ranges.

**`Factor Tree/factor-tree.html`**
- `#numInput` (`:365`) is `<input type="number" min="1" step="1" max="1000000000000">`; `#balancedNote` (`:366`) is `<p style="display:none">`; the two mode buttons (`:363-364`) are `.mode-btn[data-mode="classic"]` (born `is-active`) and `.mode-btn[data-mode="balanced"]`.
- Module state: `let mode = 'classic'` (`:432`), `const MAX_BALANCED_N = 1000000` (`:433`), `CLASSIC_CHIPS` first entry `n:2` (`:437`), `BALANCED_CHIPS` first entry `n:899` (`:445`), `renderChips(currentMode)` (`:452`).
- `factorize(raw)` ends at `:823`; it enforces `MAX_BALANCED_N` itself when `mode === 'balanced'` (`:801-806`).
- The mode-button click handler (`:839-850`) does exactly five things: set `mode`, toggle `is-active` across `modeButtons`, set `balancedNote.style.display`, set `numInput.max`, call `renderChips(mode)` — then re-factorizes when the input is non-empty.
- `renderChips(mode);` runs once at `:852`, outside any handler.
- The load handler (`:855-858`) is unconditionally `numInput.value = 60; factorize('60');`.
- There is no `location.search` / `URLSearchParams` read anywhere in the file except the shared theme snippet in `<head>` (`:5`), which is untouched by this plan.

**`Euclidean Algorithm/euclidean-algorithm.html`** — the pattern to mirror, not to edit:
- `readABParams()` (`:558-577`): a `try`/`catch` around the `/[?&]a=([^&#]*)/` regex returning `null` on throw, a `null` return when the match is absent, a second `try`/`catch` around `parseInt(decodeURIComponent(m[1]), 10)`, then explicit finiteness and range tests, then `{ a: a, b: b }`. `readExtParam()` (`:579-580`) is the same shape compressed for a single param and carries the comment that names the mirroring.

**`Venn Diagram/venn-diagram.html`**
- `var FT_MAX_N = 1000000;` (`:1100`) and `var EUCLID_MAX_INPUT = 1000000;` (`:649`).
- `NP_W=268, NP_H=196, NP_PAD=10, NP_GAP=26, NP_EDGE=6` (`:1206`); `NP_SECTION_GAP = 10, NP_MAX_SCROLL = NP_H + NP_SECTION_GAP` (`:1207`). None of these change.
- `hideNestedPreview(layer)` (`:1209-1213`): wipes `innerHTML`, sets `layer._npOffset = 0`.
- `previewPanelRect(opts)` (`:1218-1225`): the unchanged 268x196 anchor-and-clamp arithmetic.
- `drawEuclidSection(host, px, sy, opts)` (`:1232-1276`): heading at `sy + 15`, nested squares into `bx = px + NP_PAD, by = sy + 22, bw = NP_W - 2*NP_PAD, bh = NP_H - 56`, caption at `sy + NP_H - 18`, and — gated on `opts.showHint` — one `np-hint` at `sy + NP_H - 5` reading `double-click to open the full view →`.
- `drawTreeSection(host, px, sy, opts)` (`:1282-1362`): heading, then an inline over-cap bail (`typeof opts.value !== 'number' || !isFinite(opts.value) || opts.value < 1 || opts.value > FT_MAX_N`) that draws a caption plus an `np-hint`-classed message reading `over 1,000,000 — no balanced tree` and returns; otherwise the tree, then a caption at `sy + NP_H - 18` and **no hint at all**.
- `scrollNestedPreview(layer, delta)` (`:1371-1383`): returns `false` when there is no layer or no `.np-scroll`; otherwise clamps `layer._npOffset + delta` into `[0, NP_MAX_SCROLL]`, writes `data-offset` and `transform: translate(0, -next)` on `.np-scroll`, toggles `.np-scroll-hint`'s `visibility` attribute (`hidden` above 0, `visible` at 0), returns `true`.
- `showRegionPreview(layer, opts)` (`:1389-1430`): clears the layer and `_npOffset`, draws the `np-panel` rect, a per-layer `clipPath` (`layer.id + '-clip'`), a clip-only `<g>` host, a transform-only `.np-scroll` `<g>` inside it, then `drawTreeSection(scroll, px, py, opts)` and `drawEuclidSection(scroll, px, py + NP_H + NP_SECTION_GAP, opts)`, then appends the `.np-scroll-hint` affordance (text `↓ more`) to the **layer**, at `x: px + NP_W - NP_PAD, y: py + 15`.
- `appendCompositeBadge(target, anchor, value, notation, compact, key, link)` (`:2040-2101`): `hasHref = !!(link && link.href)`, `hasPreview = !!(link && link.previewLayer)`; `is-linked` class from `hasHref`, `is-previewable` from `hasPreview`; `titleText = notation + ' = ' + text` then `if (hasHref) titleText += ' — double-click to ' + link.label;` (`:2051-2052`); `role="img"` + `aria-label` + `tabindex="0"` on previewable chips, a native `<title>` otherwise; `data-xref-href` stamped and a `dblclick` listener wired only when `hasHref` (`:2064-2070`); `previewOpts = { anchor, vbW, vbH, a, b, value, showHint: hasHref }` (`:2075`) plus the `mouseenter`/`mouseleave`/`focus`/`blur`/`wheel`/`keydown` listeners (`:2076-2098`).
- `renderComposite()` (`:2103-2118`): the ONE two-circle link site, `:2114`, built only when `euclidHref(pair.a, pair.b)` is non-null; `label` is `confirm this GCD with the Euclidean Algorithm`.
- `renderComposite3()` (`:2261-2282`): the pairwise link site (`:2272`, same `label`, built only when `euclidHref` is non-null) and the `abc` centre site (`:2273-2279`, built only when `isEuclidRange(centreA, centreB)` passes, with `href: null`). The comment above the centre branch (`:2274-2276`) asserts the chip "never links" and becomes false in Task 3.
- `EUCLID_PATH` (`:2215`), `isEuclidRange(a, b)` (`:2221-2223`), `euclidHref(a, b)` (`:2228-2231`) and `openXref(href, label)` (`:2235-2242`, the file's only `window.open` call, reporting through `setMessage`).
- `factor-tree.html` currently appears twice in the file (both nav/markup links).

**Reachability note, load-bearing for Task 3's gates.** A previewable chip can never carry a composite value above `FT_MAX_N`. Every chip's value is the product of the primes in one region, and that region sits inside a circle whose total the link gate already caps at `EUCLID_MAX_INPUT` (1,000,000) — so the value divides a number ≤ 1,000,000 and is itself ≤ 1,000,000. `drawTreeSection`'s over-cap bail is therefore defensive, not reachable through the UI. Task 3 verifies the "resolved target missing ⇒ do nothing" behaviour by stripping the target attribute off a live chip instead of trying to construct an impossible one, and proves the bail/hint can never disagree structurally rather than behaviourally. Say so explicitly in the SUMMARY.
</current_shape>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Give the Factor Tree tool a `?n=` deep link that lands in Balanced mode</name>
  <files>Factor Tree/factor-tree.html</files>
  <read_first>`Factor Tree/factor-tree.html` lines 825-859 (the handler block and the load handler) to re-locate the mode-button handler and the load handler by identifier. `Euclidean Algorithm/euclidean-algorithm.html` lines 558-580 for the exact defensive shape to mirror. The `<current_shape>` block above already summarises both — use it instead of re-reading if it is sufficient.</read_first>
  <precondition>`node` and `google-chrome` both resolve on PATH, and `google-chrome --headless=new` can start with a fresh `--user-data-dir`; every automated gate in this plan depends on it.</precondition>
  <behavior>
    Proven end-to-end by harness scenario `t1`, which loads the tool page in a same-origin iframe once per query string and reads only its visible DOM:
    - No query string at all: the input's value is `60`, the Classic mode button carries the active class and the Balanced one does not, the caveat note's inline display is `none`, the preset chips are the Classic set (first chip's `data-n` is `2`), the input's `max` attribute is unchanged from its markup default, and a tree is rendered in the stage.
    - `?n=899`: the input's value is `899`, the Balanced button carries the active class and Classic does not, the caveat note's inline display is `block`, the input's `max` attribute is `1000000`, the preset chips are the Balanced set (first chip's `data-n` is `899`), and a tree is rendered whose root label reads `899`.
    - `?n=1000000` is accepted the same way (the cap is inclusive); `?n=1` is accepted and produces the tool's existing not-prime-not-composite message rather than a tree or an error.
    - Every one of `?n=1000001`, `?n=0`, `?n=-5`, `?n=3.5`, `?n=abc`, `?n=` and `?m=899` reproduces the no-query-string state exactly, field for field.
    - `?theme=day&n=899` still takes the deep link (the param is matched after a `&`, not only after a `?`), and the theme snippet in the document head is unaffected.
    - Clicking a mode button after any of the above still switches mode, note, `max` and chips exactly as it does today, and re-factorizes the current input value.
  </behavior>
  <action>
**(a) Snapshot the baselines first.** Copy `'Factor Tree/factor-tree.html'` to `$SP/qqt-ft-base.html` and `'Venn Diagram/venn-diagram.html'` to `$SP/qqt-venn-base.html`, then record a checksum manifest of every OTHER tracked file to `$SP/qqt-others.sha` (`git ls-files` minus those two paths, piped through `sha256sum`). All three are gate inputs for all three tasks; create them before your first edit.

**(b) Extract the mode-applying state change into one helper.** The mode-button click handler currently inlines five state mutations and then re-factorizes. Lift the first five — assigning the module `mode`, toggling the active class across the mode buttons, setting the caveat note's inline display, setting the input's `max`, and calling the chip renderer — into one helper taking the target mode name, and have the click handler call it and then keep its existing non-empty-input re-factorize step verbatim. Toggle the active class by comparing each button's `data-mode` attribute to the target mode rather than by node identity, so the helper is callable without a button in hand; that is equivalent because each button's `data-mode` is unique. Change nothing else about the handler, and leave the standalone chip-render call that runs at module init exactly where and as it is — do not route it through the new helper, because that would start writing the input's `max` and the note's display at init where today they come from the markup.

**(c) Add the URL reader.** Add a single-param reader beside the load handler that mirrors `readABParams()` in `Euclidean Algorithm/euclidean-algorithm.html` move for move: the `/[?&]n=([^&#]*)/` regex executed against `location.search` inside a `try`/`catch` that returns `null` on throw, a `null` return when the match is absent, a second `try`/`catch` around `parseInt(decodeURIComponent(...), 10)` returning `null` on throw, then explicit finiteness, integrality and range tests returning `null` unless the value is at least 1 and at most the existing Balanced cap constant, then the number. Reuse that existing cap constant — do not introduce a second constant for the same bound, and do not read any second query param; the presence of a valid `n` is itself the instruction to use Balanced mode, because the Venn Diagram tool is the only caller and always wants Balanced.

Carry a one-line comment naming the function it mirrors, the way the Euclidean tool's own single-param reader does.

**(d) Branch the load handler, additively.** In the existing load handler, call the reader first. When it returns a number: call the mode helper with the Balanced mode name, set the input's value to that number, factorize it, and return. When it returns `null`, fall through to the two lines that are there today, which must remain byte-identical — the default load path is not being redesigned, only preceded by a guarded early return.

**(e) Write the harness.** Create `$SP/venn-ft-xref-harness.js`, Node standard library only, no install, taking one scenario argument (`t1`, `t2`, `t3`). It serves the checkout root (its own cwd) on an ephemeral loopback port, serves one in-memory `/__driver.html` route, and accepts one POST route on which it records the verdict. The driver clears `localStorage` AND `document.cookie` for the origin before each scenario — this repo's tools mirror shared params into cookies, and cookies are origin-scoped rather than iframe-scoped, so a value left by an earlier scenario in the same profile would otherwise survive into a supposedly fresh frame. It then loads the target page in a same-origin iframe (one fresh iframe per query string in `t1`), waits for that document's load handler to finish, and drives it through its visible DOM only. It POSTs `PASS` or `FAIL` with the check count and, on failure, the first mismatch.

Spawn Chrome as `google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir="$(mktemp -d)" --virtual-time-budget=20000 "<loopback driver URL>"`, wait for the POST, kill Chrome, print the verdict, exit 0 only on `PASS`. <!-- planner-discipline-allow: http: --> The loopback URL belongs to the scratchpad harness and is never written into either edited HTML file; the dependency gate greps the diffs only, so the two cannot collide.

**(f) Vacuity-check before trusting the gate.** Temporarily stub the URL reader to return `null` unconditionally and confirm `t1` FAILS on the deep-link assertions only (the seven fallback query strings and the no-query-string case must still pass); restore and confirm green. Then temporarily make it return a number unconditionally and confirm `t1` FAILS on the fallback assertions. Record both results in the SUMMARY.

Add no literal colour, `<script>`, `<link>` or URL to the edited file.
  </action>
  <verify>
    <automated>test -s "$SP/qqt-ft-base.html" && test -s "$SP/qqt-venn-base.html" && node "$SP/venn-ft-xref-harness.js" t1 && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Factor Tree/factor-tree.html' | grep -c 'MAX_BALANCED_N')" -ge 4 ] && [ "$(grep -c '= 1000000;' 'Factor Tree/factor-tree.html')" = "$(grep -c '= 1000000;' "$SP/qqt-ft-base.html")" ] && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Factor Tree/factor-tree.html' | grep -c 'readNParam')" = 2 ] && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Factor Tree/factor-tree.html' | grep -c 'applyMode')" = 3 ] && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Factor Tree/factor-tree.html' | grep -c 'renderChips(mode);')" = 1 ] && { diff -u "$SP/qqt-ft-base.html" 'Factor Tree/factor-tree.html' > "$SP/t1.diff"; true; } && [ "$(grep -E '^\+[^+]' "$SP/t1.diff" | grep -vE '^\+[[:space:]]*(//|/\*|\*)' | grep -cE '#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|<script|<link|https?://')" = 0 && sha256sum -c --status "$SP/qqt-others.sha" && [ "$(git diff --name-only)" = "Factor Tree/factor-tree.html" ]</automated>
    <manual>Open `Factor Tree/factor-tree.html?n=899` in a browser: it lands on Balanced with 899 already grown and the Balanced caveat note showing. Open the same file with no query string: Classic, 60, note hidden — indistinguishable from before.</manual>
  </verify>
  <done>The Factor Tree tool accepts a single `n` query param, validated against its existing Balanced cap, and lands in Balanced mode with that number factorized; every invalid or absent param reproduces today's Classic/60 load field for field; the mode-button click handler still behaves identically, now through a shared helper. Harness scenario `t1` exits 0 and was vacuity-checked in both directions; no other repo file changed.</done>
  <reversibility rating="reversible">One file, one added reader, one extracted helper and one guarded early return; `git checkout` on the single file restores the prior behaviour whole.</reversibility>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Drop the Euclidean section from the `A∩B∩C` centre chip's panel</name>
  <files>Venn Diagram/venn-diagram.html</files>
  <read_first>`Venn Diagram/venn-diagram.html` around `showRegionPreview` and `scrollNestedPreview` (`:1364-1430`) and the three `link` construction sites (`:2114`, `:2272`, `:2273-2279`). The `<current_shape>` block already summarises them — use it instead of re-reading if it is sufficient.</read_first>
  <behavior>
    Proven by harness scenario `t2`, driving both diagram modes through the visible DOM:
    - Hovering the three-circle centre chip opens a panel whose preview layer contains exactly one `np-heading`, reading the factor-tree section's name; zero `nsquare`, zero `ncap` and zero `nframe` nodes; and zero `np-scroll-hint` nodes.
    - That panel still has its `np-panel` rect at `width=268 height=196` at the same `{px, py}` the unchanged panel-rect helper returns, and still has a clip host wrapping an `np-scroll` group whose `data-offset` is `0`.
    - A `wheel` event with `deltaY` 200 dispatched over the centre chip reports `defaultPrevented` false and leaves the scroll group's `data-offset` and `transform` byte-identical; an `ArrowDown` `keydown` on the focused centre chip does the same; so does `ArrowUp`.
    - The two-circle `A ∩ B` chip and the three pairwise chips are untouched: two `np-heading` nodes in document order (factor tree first, Euclidean second), the second heading's `y` exactly `NP_H + NP_SECTION_GAP` (206) greater than the first's, one `np-scroll-hint` present and visible at offset 0 and hidden above it, `wheel`/`ArrowDown` reporting `defaultPrevented` true and clamping at 206, `ArrowUp` returning to 0, and `mouseleave` + fresh `mouseenter` (and `blur` + fresh `focus`) reopening at 0.
    - The three exclusive-region chips still open no panel at all, in either mode.
  </behavior>
  <action>
**(a) Add an explicit section switch to the link descriptor.** At each of the three sites that build a `link` object, add a boolean field naming whether that chip's panel carries a Euclidean section: `true` at the two-circle overlap site in the two-circle composite renderer, `true` at the pairwise site in the three-circle composite renderer, and `false` at the centre-chip site in that same renderer. Do not derive this from the existing hint-gating flag or from whether the descriptor has an href — Task 3 gives the centre chip a real click target, so "has a click target" and "has a Euclidean section" become genuinely independent facts and must be carried by separate fields.

**(b) Thread it through the badge.** In `appendCompositeBadge()`, add the field to the `previewOpts` object literal alongside the existing anchor/viewBox/a/b/value/hint fields, coerced to a boolean so a descriptor that omitted it could never be read as truthy by accident. Change none of the existing fields and none of the six listeners.

**(c) Make the panel builder honour it.** In `showRegionPreview(layer, opts)`, keep the factor-tree section call exactly as it is — first, unconditional, at the unchanged vertical offset. Then draw the Euclidean section, at its unchanged `NP_H + NP_SECTION_GAP` offset expression, only when the new flag is set; and append the scroll affordance, unchanged in class, text, anchor and position, only when that same flag is set. Both belong under one condition, not two, so a panel can never advertise a section it did not draw.

**(d) Give the layer a scroll ceiling.** Beside the existing per-layer scroll-offset reset at the top of the builder, store a per-layer maximum: the existing max-scroll constant when the flag is set, zero when it is not. Reset that same stored maximum to zero in `hideNestedPreview(layer)`, next to where it already resets the offset, so a torn-down layer can never leave a stale ceiling behind for the next chip that borrows it.

**(e) Teach the scroll helper about the ceiling.** In `scrollNestedPreview(layer, delta)`, after the existing early returns for a missing layer and a missing scroll group, read the stored maximum and return `false` immediately when it is not above zero — moving nothing and writing no attribute. Otherwise clamp against that stored maximum instead of against the constant. Returning `false` is what keeps the wheel and key handlers on the chip from calling `preventDefault()`, so the page keeps its own scrolling and the centre chip's arrow keys stay available to the browser.

Change no section-renderer body, no geometry constant, no listener in `appendCompositeBadge()`, and no `link`-creation condition — which chips are previewable at all must not move in this task. Add no literal colour, `<script>`, `<link>` or URL, and write no code comment that restates the removed section's name as if it were still drawn.

**(f) Extend the harness** with scenario `t2` per `<behavior>`, selecting chips as `g.composite-chip.is-previewable` filtered by `data-region`, synthesising `wheel` events with an explicit `deltaY` and `cancelable: true` and `keydown` events with an explicit `key`, and reading `defaultPrevented` off the dispatched event. Vacuity-check it: temporarily force the new flag to `true` at the centre-chip site and confirm `t2` FAILS on exactly the centre-chip assertions while every other chip's assertions still pass; restore and confirm green. Record the result in the SUMMARY.
  </action>
  <verify>
    <automated>node "$SP/venn-ft-xref-harness.js" t2 && node "$SP/venn-ft-xref-harness.js" t1 && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Venn Diagram/venn-diagram.html' | grep -c 'showEuclid: true')" = 2 ] && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Venn Diagram/venn-diagram.html' | grep -c 'showEuclid: false')" = 1 ] && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Venn Diagram/venn-diagram.html' | grep -c '_npMax')" -ge 4 ] && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Venn Diagram/venn-diagram.html' | grep -c 'drawTreeSection(scroll, px, py, opts);')" = 1 ] && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Venn Diagram/venn-diagram.html' | grep -c 'py + NP_H + NP_SECTION_GAP, opts)')" = 1 ] && [ "$(grep -c 'NP_MAX_SCROLL = NP_H + NP_SECTION_GAP' 'Venn Diagram/venn-diagram.html')" = "$(grep -c 'NP_MAX_SCROLL = NP_H + NP_SECTION_GAP' "$SP/qqt-venn-base.html")" ] && [ "$(grep -c 'np-scroll-hint' 'Venn Diagram/venn-diagram.html')" = "$(grep -c 'np-scroll-hint' "$SP/qqt-venn-base.html")" ] && { diff -u "$SP/qqt-venn-base.html" 'Venn Diagram/venn-diagram.html' > "$SP/t2.diff"; true; } && [ "$(grep -E '^\+[^+]' "$SP/t2.diff" | grep -vE '^\+[[:space:]]*(//|/\*|\*)' | grep -cE '#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|<script|<link|https?://')" = 0 && sha256sum -c --status "$SP/qqt-others.sha"</automated>
    <manual>Three-circle mode: hover the `A∩B∩C` chip — one factor-tree section, no scroll cue, and the wheel over it scrolls the page rather than the panel. Hover a pairwise chip beside it — still two sections, still scrollable.</manual>
  </verify>
  <done>The centre chip's panel is a single Factor Tree section with no Euclidean content, no affordance and no scroll capability, while the two-circle overlap and the three pairwise chips keep today's two-section scrollable panel bit for bit. Harness scenarios `t1` and `t2` exit 0, `t2` was vacuity-checked, and every file outside the two in scope is byte-identical.</done>
  <reversibility rating="reversible">One boolean threaded through three descriptors and one builder, plus a per-layer ceiling; removing the field restores the two-section panel everywhere.</reversibility>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Resolve each chip's double-click from the section currently in view</name>
  <files>Venn Diagram/venn-diagram.html</files>
  <read_first>`Venn Diagram/venn-diagram.html` lines 2040-2101 (`appendCompositeBadge`) and 2215-2242 (the Euclidean link trio and the opener). The `<current_shape>` block already summarises both — use it instead of re-reading if it is sufficient.</read_first>
  <behavior>
    Proven by harness scenario `t3`, which stubs the tool frame's `window.open` to record its arguments and return a truthy object — the same interception quick task `260929-c11` used, reused rather than reinvented:
    - Two-circle `A ∩ B` chip, hovered and left at offset 0: a `dblclick` records exactly one opener call whose URL is the Factor Tree tool's path with an `n` param equal to the chip's displayed composite value, and the tool's message area reports an opened tab.
    - The same chip scrolled to its clamp (a `wheel` of +300): a `dblclick` records exactly one opener call whose URL is byte-identical to that chip's existing Euclidean attribute value.
    - Boundary, exercised exactly: from a fresh hover, a `wheel` of +102 resolves to the Factor Tree tool and a `wheel` of +103 resolves to the Euclidean Algorithm tool — the midpoint itself belongs to the second section.
    - Each of the three pairwise chips behaves identically to the two-circle chip in all of the above.
    - The `A∩B∩C` centre chip records exactly one opener call to the Factor Tree tool with its own composite value, at offset 0 and again after a wheel and an `ArrowDown` that move nothing; it never produces a Euclidean URL under any input.
    - With the chip's factor-tree target attribute removed from the live DOM and the panel at offset 0, a `dblclick` records zero opener calls and throws nothing — the missing target is a no-op, never a fallback to the other tool.
    - Loading the exact URL captured from the two-circle chip's offset-0 double-click into a fresh iframe reproduces Task 1's Balanced-mode landing for that value: the round trip works, not just the string.
    - Hint counts: every previewable chip's panel contains exactly one `np-hint` inside the factor-tree section (`y` below `py + NP_H`); the two-circle and pairwise chips each contain exactly one more inside the Euclidean section (`y` at or beyond `py + NP_H`); the centre chip contains exactly one in total. Both hint strings are the same string.
    - Accessible names: the two-circle and pairwise chips' `aria-label` names both click targets; the centre chip's names only the Factor Tree one and contains no mention of the other tool; the three exclusive chips keep a native `<title>` with no double-click invitation at all.
    - The centre chip now carries the linked-chip class and the pointer affordance that goes with it, exactly as the other clickable chips do.
  </behavior>
  <action>
**(a) Add the Factor Tree link trio, mirroring the Euclidean one.** Beside the existing Euclidean path constant, range predicate and URL builder, add the same three for the Factor Tree tool: a path constant pointing at the sibling tool file, a range predicate that accepts a finite integral number from 1 through the existing `FT_MAX_N` constant, and a builder returning `null` when the predicate fails and otherwise the path with a single `n` query param whose value goes through `encodeURIComponent`. Reuse `FT_MAX_N` — do not add a second constant for the same bound. Carry the same one-comment-per-function rationale the Euclidean trio carries, naming why a null return is what makes a chip unlinked rather than pointed at a broken query.

Also add one module-level label string for the Factor Tree target, describing what a double-click there does, in the same voice as the Euclidean descriptors' existing label. One constant, not a per-descriptor field: unlike the Euclidean label it is identical at every site, and three copies of one string is exactly how they drift.

**(b) Collapse the over-cap bail onto the new predicate.** In `drawTreeSection`, replace the inline four-clause range test in its bail condition with a call to the new range predicate, negated. The bail's body — its caption and its over-cap message — stays byte-identical, and the bail stays unconditional in the sense that nothing new gates it. This is what makes it structurally impossible for the hint added in step (e) to be drawn in a section that bailed: one named predicate now decides both whether a URL exists and whether the tree renders.

**(c) Give every link descriptor a Factor Tree target.** At all three `link` construction sites, add a field carrying the Factor Tree URL built from that chip's composite value — including the centre-chip site, whose composite value is already computed and in scope in the three-circle composite renderer's loop, and which gains a click target for the first time. Do not change which chips get a descriptor at all: every existing creation condition stays exactly as it is, so no chip becomes newly previewable. Reword the centre-chip branch's existing comment, which currently asserts that chip carries no link, so it states what is now true; leave the rest of that comment's explanation of the left-fold pair intact.

**(d) Rework the badge's click wiring.** In `appendCompositeBadge()`, derive a second boolean for whether the descriptor carries a Factor Tree target, and a third for whether it carries either. Then:
- Drive the linked-chip class from "carries either", not from the Euclidean target alone, so the centre chip gains the pointer affordance that matches its new behaviour. Note this in the SUMMARY as a judgement call: an accessible name that invites a double-click on a chip with no pointer cursor would be an affordance mismatch, so the class follows the behaviour.
- Stamp the existing Euclidean attribute exactly as today when that target exists, and stamp a second, differently-named attribute carrying the Factor Tree target when that one exists. Two attributes, one per tool, so both stay statically inspectable and the existing one keeps its current meaning.
- Register the `dblclick` listener when either target exists. Inside it, after the existing `preventDefault()`, read the chip's own preview layer's stored scroll offset at click time (defaulting to zero when there is none), compare it against half the existing max-scroll constant, and pick the factor-tree attribute when the offset is strictly below that midpoint or the Euclidean attribute otherwise. Read the chosen attribute; when it is absent or empty, return without calling the opener and without touching the message area. Otherwise call the existing opener with that URL and the label belonging to the tool you chose. Reading the offset inside the handler, not at render time, is the entire mechanism — a value captured when the chip was drawn would always be zero.

**(e) Give the factor-tree section its own hint.** In `drawTreeSection`, after its existing caption in the success path, draw one hint node in the same class and at the same `sy + NP_H - 5` baseline the Euclidean section's hint uses, with the same text that section already emits — the wording is generic and tool-agnostic, so no new copy is written. Gate it on the Factor Tree URL now threaded into the options object, so a section with no target promises no click. `drawEuclidSection` is not edited: its hint stays gated on the existing flag and byte-identical in wording and position.

**(f) Thread the target and rebuild the accessible name.** Add the Factor Tree URL to the `previewOpts` object literal alongside the fields already there. Then replace the single-clause title assembly: start from the existing notation-and-value text, collect the labels of the targets that actually exist in section order — factor tree first, matching the section order on screen — and append the existing `— double-click to ` connector followed by those labels joined by a short disjunction only when at least one exists. A chip with neither target keeps exactly today's bare text.

Change no geometry constant, no panel-builder structure, no scroll helper, and no hover/focus/wheel/keydown listener. Add no literal colour, `<script>`, `<link>` or URL to the file, and add no second `window.open` call — the existing opener stays the only one.

**(g) Extend the harness** with scenario `t3` per `<behavior>`. Stub the tool frame's opener before dispatching, record every call's first argument, and reset the record between chips. For the missing-target case, remove the factor-tree attribute from the live chip node rather than trying to construct an out-of-range chip: per `<current_shape>`'s reachability note that state is unreachable through the UI, and the attribute removal exercises the exact branch that matters. For the round-trip case, load the captured URL into a fresh iframe and re-run Task 1's Balanced-mode assertions against it.

Vacuity-check `t3`: temporarily pin the resolver to always choose the Euclidean attribute and confirm `t3` FAILS on every offset-0 assertion and on all of the centre chip's; then pin it to always choose the factor-tree attribute and confirm it FAILS on the scrolled-past-midpoint assertions. Restore and confirm green. Record both results in the SUMMARY.
  </action>
  <verify>
    <automated>node "$SP/venn-ft-xref-harness.js" t3 && node "$SP/venn-ft-xref-harness.js" t2 && node "$SP/venn-ft-xref-harness.js" t1 && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Venn Diagram/venn-diagram.html' | grep -c 'treeHref: factorTreeHref(value)')" = 3 ] && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Venn Diagram/venn-diagram.html' | grep -c 'isFactorTreeRange')" = 3 ] && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Venn Diagram/venn-diagram.html' | grep -c 'FACTOR_TREE_PATH')" -ge 2 ] && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Venn Diagram/venn-diagram.html' | grep -c 'data-xref-tree-href')" = 2 ] && [ "$(grep -vE '^[[:space:]]*(//|/\*|\*)' 'Venn Diagram/venn-diagram.html' | grep -c 'NP_MAX_SCROLL / 2')" = 1 ] && [ "$(grep -c 'factor-tree.html' 'Venn Diagram/venn-diagram.html')" = "$(( $(grep -c 'factor-tree.html' "$SP/qqt-venn-base.html") + 1 ))" ] && [ "$(grep -c 'double-click to open the full view' 'Venn Diagram/venn-diagram.html')" = "$(( $(grep -c 'double-click to open the full view' "$SP/qqt-venn-base.html") + 1 ))" ] && [ "$(grep -c 'window.open' 'Venn Diagram/venn-diagram.html')" = "$(grep -c 'window.open' "$SP/qqt-venn-base.html")" ] && [ "$(grep -c 'data-xref-href' 'Venn Diagram/venn-diagram.html')" = "$(grep -c 'data-xref-href' "$SP/qqt-venn-base.html")" ] && [ "$(grep -c 'over 1,000,000 — no balanced tree' 'Venn Diagram/venn-diagram.html')" = "$(grep -c 'over 1,000,000 — no balanced tree' "$SP/qqt-venn-base.html")" ] && { diff -u "$SP/qqt-venn-base.html" 'Venn Diagram/venn-diagram.html' > "$SP/t3.diff"; true; } && [ "$(grep -E '^\+[^+]' "$SP/t3.diff" | grep -vE '^\+[[:space:]]*(//|/\*|\*)' | grep -cE '#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|<script|<link|https?://')" = 0 && sha256sum -c --status "$SP/qqt-others.sha" && [ "$(git diff --name-only)" = "Venn Diagram/venn-diagram.html" ]</automated>
    <manual>Two-circle mode: hover `A ∩ B` and double-click without scrolling — the Factor Tree tool opens in a new tab, Balanced, on that number. Scroll the panel down to the nested squares and double-click again — the Euclidean Algorithm tool opens on the same `a`/`b` as before. Three-circle mode: double-click `A∩B∩C` — the Factor Tree tool opens on its composite, and there is no way to make it open anything else.</manual>
  </verify>
  <done>Double-click resolves at click time from the live scroll offset: below the midpoint it opens the Factor Tree tool with the chip's composite, at or above it the Euclidean Algorithm tool with the chip's `a`/`b`, and with no target for the section in view it does nothing. The centre chip always resolves to the Factor Tree and now carries the linked-chip affordance. Each section shows a hint only when its own link is real, the Euclidean hint is unchanged, and every chip's accessible name lists exactly the targets it has. All three harness scenarios exit 0, `t3` was vacuity-checked in both directions, and exactly two files are modified.</done>
  <reversibility rating="reversible">One link trio, one attribute, one resolver inside an existing listener and one hint line, all in one file; the prior always-Euclidean behaviour is a `git checkout` away.</reversibility>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL query params → Factor Tree page | A brand-new untrusted input surface: `n` arrives from another page, a bookmark or a hand-typed address bar and is parsed at load |
| Venn composite value → outgoing URL | A number computed from user-placed primes becomes part of a URL the tool asks the browser to open |
| localStorage / cookie → page | Both tools' shared params are user-writable and read back at load; unchanged by this plan |
| (none new) | No network call, no package install, no new persisted value, and no new `innerHTML` sink carrying user data |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-qqt-01 | Tampering | the Factor Tree tool's new `n` query param | medium | mitigate | Parsed inside a `try`/`catch` mirroring `readABParams()`, then integrality- and range-tested against the existing Balanced cap before use; anything else returns null and falls through to the unchanged default load, so a hostile URL can at worst reproduce today's page |
| T-qqt-02 | Denial of Service | `factorize()` reached from a URL rather than a click | medium | mitigate | The param is capped at the same `MAX_BALANCED_N` the Balanced path already enforces internally, and the load path forces Balanced mode, so a URL can never request more work than the tool's own controls already permit; no second cap constant is introduced that could drift from the first |
| T-qqt-03 | Spoofing | the outgoing Factor Tree URL built from a composite value | low | mitigate | Built by one named builder against one named range predicate, with the value passed through `encodeURIComponent`, and returning null rather than a malformed query when out of range — the same single-builder-per-target-tool discipline `euclidHref()` already enforces |
| T-qqt-04 | Elevation of Privilege | the new-tab navigation target | low | mitigate | Routed through the existing `openXref()`, which is the file's only `window.open` call and already passes `noopener,noreferrer`; no second opener is added and a count gate enforces that |
| T-qqt-05 | Repudiation | a double-click that silently does nothing when the section in view has no target | low | accept | Deliberate per the spec — falling back to the other tool would open something the user is not looking at; the case is unreachable through the UI (see the reachability note) and the hint for that section is suppressed by the same predicate, so nothing promises the click |
| T-qqt-06 | Denial of Service | `wheel` / `keydown` handlers calling `preventDefault()` | low | mitigate | The scroll helper returns false whenever the layer's stored ceiling is not above zero, so the centre chip's single-section panel never swallows a wheel or arrow event; asserted directly in `t2` |
| T-qqt-SC | Tampering | npm/pip/cargo installs | high | mitigate | Not applicable and enforced as such: this repo has no package manager and this plan installs nothing; the per-task diff gate fails on any added `<script>`, `<link>` or URL |
</threat_model>

<verification>
Run from the checkout root after all three tasks:

1. `node "$SP/venn-ft-xref-harness.js" t1`, `t2`, `t3` — all exit 0, and each was shown to FAIL against a deliberately broken build before being trusted.
2. `git status --porcelain` lists exactly two modified tracked paths: `Factor Tree/factor-tree.html` and `Venn Diagram/venn-diagram.html`.
3. `sha256sum -c --status "$SP/qqt-others.sha"` — every other tracked file byte-identical.
4. The added-lines scan over both diffs finds no literal colour, no `<script>`, no `<link>` and no URL.
5. Manual browser pass: the Factor Tree tool with and without `?n=`; the Venn Diagram's centre chip (one section, inert wheel, opens the Factor Tree tool); a two-circle and a pairwise chip double-clicked both before and after scrolling; the day/night toggle still recolours both pages.
</verification>

<success_criteria>
- The Factor Tree tool accepts `?n=<1..1,000,000>` and lands in Balanced mode with that number factorized; every other load reproduces today's Classic/60 default exactly.
- The Venn Diagram's `A∩B∩C` centre chip shows a Factor-Tree-only panel with no Euclidean content, no affordance and no scroll capability; every other previewable chip's panel is unchanged.
- Double-click resolves at click time from the live scroll offset, below the midpoint to the Factor Tree tool and at or above it to the Euclidean Algorithm tool, with no cross-tool fallback when the resolved target is missing.
- The centre chip always opens the Factor Tree tool and carries the linked-chip affordance; it never produces a Euclidean URL.
- Each section shows the shared hint string only when its own link is real; the Euclidean section's hint is byte-identical to today's; chips' accessible names list exactly the targets they have.
- Two files modified, no new external dependency, no literal colour added, no second opener and no second cap constant.
</success_criteria>

<output>
Create `.planning/quick/260929-qqt-venn-diagram-factor-tree-abc-centre-chip/260929-qqt-SUMMARY.md` when done.

Record in it: the real `$SP` path; the vacuity-check result for each of the three scenarios (which assertions failed under which deliberate break); the reachability finding that an over-cap previewable chip cannot be constructed through the UI and how that verification item was discharged instead; and the judgement call that the centre chip now takes the linked-chip class and pointer affordance because it gained a real click target.
</output>
</content>
</invoke>
