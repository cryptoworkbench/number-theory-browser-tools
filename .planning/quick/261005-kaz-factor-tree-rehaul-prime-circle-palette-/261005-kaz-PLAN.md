---
phase: quick-261005-kaz
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "Factor Tree/factor-tree.html"
  - "assets/i18n/factor-tree.js"
  - ".planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js"
  - ".planning/quick/261005-hz0-factor-tree-drop-prime-from-header-title/mirror-probe.js"
  - ".planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js"
  - ".planning/quick/261005-j2e-factor-tree-fold-and-unfold-sub-trees-in/fold-probe.js"
autonomous: true
requirements: [QUICK-FT-PALETTE-01]

estimate:
  tokens: 140000
  raw_tokens: 140000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "On load the Factor Tree page shows a 'Circle palette' of exactly 30 blue circles labelled 2, 3, 5, ..., 113 in ascending order, and an empty 'Working area' showing a hint. No tree grows on its own. The old number field with its Grow button and the preset chips are gone (per PD-1, PD-2, user note b)"
    - "A number field sits directly left of an Add button. Typing an integer and pressing Add (or Enter in the field) appends one more blue circle with that number to the end of the palette. This works for primes and composites alike, repeatedly, and duplicates are allowed. Empty input, 0, a negative number, a decimal, an exponent form, 1, or a value over the current mode's cap adds nothing and shows a translated message. Non-digit keystrokes are refused (per PD-4, user point 2, user note c)"
    - "Dragging a palette circle with a mouse or a finger shows a copy following the pointer and highlights the working area. Releasing over the working area places a new tree card there, and the palette circle stays where it was (copy semantics). Releasing elsewhere, pressing Escape or a pointercancel places nothing (per PD-5, user point 1, user note a)"
    - "A newly placed tree is one blue circle with a + button at its bottom edge. Each + unfolds exactly one split. A blue 2 unfolds into a small gray 1 and a green 2. A blue composite unfolds into its two factor circles, which are themselves blue, folded and carry their own +. When every split in a tree is unfolded, the tree's card shows its equation and the message line reports the factorization (per PD-3, PD-8, user points 1 and 3)"
    - "Several trees sit side by side in the working area, wrapping onto new rows. Each card resizes smoothly to its visible tree. Each card has a labelled remove (x) button, and a Clear button empties the area. Mirroring and folding keep working independently in every tree (per PD-6, PD-7)"
    - "Clicking, tapping, Enter or Space on a palette circle also places a copy. Keyboard placement moves focus to the new tree's + button, and a held key does not place repeated copies (per PD-5)"
    - "A mode switch rebuilds every working-area tree fresh and folded in the new mode. Trees over Balanced's cap are dropped and the message says so. Randomize only fills the number field. A ?n= deep link selects Balanced, adds n to the palette if it is missing and places a folded copy. A language switch relabels everything without moving, folding or unfolding anything. Under reduced motion every animation is instant (per PD-9 to PD-12)"
    - "Every new user-visible string exists in all sixteen languages, with ru and el in their own script. The keys the new workflow no longer uses are deleted. No new CSS line carries a literal colour. assets/nt-*.js, assets/i18n/site.js and assets/i18n/hub.js are byte-identical to f4749ed. i18n-check --all, shadow-check --all and the phase-07 harness pass (per PD-13)"
  artifacts:
    - "Factor Tree/factor-tree.html"
    - "assets/i18n/factor-tree.js"
    - ".planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js"
  key_links:
    - "palette pointerdown (delegated on #palette) -> window pointermove/pointerup/pointercancel/keydown listeners -> overWork(clientX, clientY) rect test -> dropTree(n) -> buildCard(n) -> views.push(view)"
    - "palette click (delegated; skipped while dragJustEnded) -> dropTree(n, { keyboard: e.detail === 0 }) -> on keyboard, focus the new root badge"
    - "#addBtn click / Enter in #addInput -> addFromInput() -> validation -> addPaletteItem(n, true) -> setMessage('factorTree.msgAdded', { n }, true)"
    - "fold badge -> toggleFold(view, nv) -> layoutTree(view) -> syncControls(view) -> animateTree(view, phases, onDone) -> placeTree(view), which writes circles, labels, axes, rings, badges, edges and the svg width/height/viewBox from view.w/view.h -> onDone -> updateEquation(view)"
    - "mode button -> applyMode(mode) -> rebuildWork() (fresh folded cards, over-cap ones dropped with msgTooLargeBalanced)"
    - "onLangChange -> renderMessage(), renderBalancedNote(), relabelPalette(), and for each live view: syncControls(view) plus relabelRemove(view)"
---

<objective>
Rehaul the Factor Tree tool around a circle palette. Prime circles (and composites the user adds) are copied by drag-and-drop into a working area. Each copy lands folded and is unfolded one split at a time through the + button that quick task 261005-j2e already built.

User request, verbatim (the authoritative spec):
"Rehaul the Factor Tree tool:
1). The page should have a palette of circles which all correspond to a prime number, for example a blue 2 circle, or a blue 3 or 11 circle. When these circles are drag-and-dropped into the working area, then they remain folded. When the user clicks the "+" at the bottom of the circle, then the circle is 'unfolded'. For example: a blue 2 circle would unfold a little gray 1 and a green 2.
2). A blue circle represting a composite number can be added to the palette through an 'Add()' function. As the '()' indicate; this function will operate through a text-field (which can only take numbers). When the field contains '5', and the user clicks 'Add', then another blue circle with '5' appears in the palette. If the field contained 10, when the user clicked 'Add', then a composite-number representing blue circle is a added to the palette (in this case represting 10). The first one in the case that the 'Add' function is used for the first time, of course. But the add function can also be used repeatedly in order to add multiple composites to the palette, or the same one twice.
3). It follows from points '1). ' and '1). ' that this constitutes an overhaul of the Factor Tree tool, albeit not necessarily such a big one. The basic workflow of this tool will change in the following way:
    After the changes, when the user want to figure out a prime factorization using the 'Factor Tree' tool, he/she will have to manually add the composite to the 'circle-palette' using the 'Add' function, and will then have to drag-and-drop that circle into the working area below, and then unfold that circle in the working area using the "+" at the bottom of the circle.
A few things to note:
a). The blue circles in the circle palette copy upon dropping; they are drag and drop, but they do not disappear from the palette.
b). The palette is pre-filled with the first 30 primes upon loading.
c). Place the text-field (or rather number-field) left or right to the button which says 'Add', whichever side seems most reasonable to you."

How it works today. The planner read the source at HEAD f4749ed; line numbers refer to `Factor Tree/factor-tree.html`.
- Colour semantics. `buildFactorTree` (assets/nt-layout.js) gives every node with children kind `root` (depth 0) or `internal`. Both render blue: fill `var(--role-input)`, which is `var(--accent)`. A prime p is a node whose children are a `one` leaf (value 1, gray `--role-inert`, smaller `oneRadius`) and a `prime-leaf` p (green `--role-result`). So "blue 2 unfolds into a little gray 1 and a green 2" is exactly the existing tree of 2 with its root folded, and nt-layout.js needs no change.
- CSS (lines 14-266):
  - controls `#numInput` 43-59, `#goBtn` 60-73, `#randomBtn` 74-90;
  - `.chips`/`.chip` 92-106, mode toggle 108-115, `.message` 117-124, `.stage` 126-132;
  - `.equation`/`.fac` 134-153, `.tree-area` 155-163, `.edge-line` 165-170;
  - the depth-group reveal (`.depth-group` opacity and `.node-circle` scale) 172-181;
  - node kinds 183-206, mirror 208-222, fold 223-250, reduced-motion block 251-254;
  - footnote 257-261, and the `@media (max-width:480px)` rule for `#numInput` 263-265.
- Markup:
  - page header 332-335, mode toggle and `#balancedNote` 337-341;
  - `.controls` (`#numInput`, `#goBtn`, `#randomBtn`) 343-347, `.chips` 349, `#message` 351;
  - `.stage` with `#treeArea` and `#equation` 353-356, footnote 358;
  - script includes 361-366: core, svg, layout, i18n, site.js, factor-tree.js. These stay unchanged.
- Inline script 367-1092:
  - import block 370-373, element lookups 376-384;
  - state and constants 386-412: `generation`, `mode`, `treeView`, MIRROR_MS 450, FOLD_MS 400, RING_GAP 3.5, MIRROR_ARM_AFTER_MS, RANDOM_* and the two chip lists;
  - `renderChips` 414-424, `groupFactors` 430-441, `exponentText` 443-445, `setMessage`/`renderMessage` 447-459;
  - `clearStage` 461-465, `popEquation` 467-475;
  - `renderTree` 480-616: full-tree `assignTreeX`, the full-width `pxX` spread, the radius/font formulas, per-depth edge and node groups, the staggered reveal, the equation timer and the arm timer;
  - `armMirrors` 623-649, `armFolds` 656-694, `anchorOf`/`isHidden`/`buildShadow`/`copyShadowX`/`layoutTree`/`currentTargets`/`finalTargets` 696-748;
  - `descendantsOf` 750-753, `syncControls` 755-786, `toggleFold` 788-814, `reverseBranch`/`mirrorBranch` 816-828;
  - `opacityText` 830-832, `placeTree` 836-895, `animateTree` 902-954;
  - `factorize` 956-996, `pickRandomN` 999-1010, wiring 1012-1026, `renderBalancedNote` 1028-1031;
  - `applyMode` 1033-1039, mode buttons 1041-1048, `onLangChange` 1052-1057, `readNParam` 1060-1077 (Balanced cap), load handler 1080-1090 (deep link, otherwise grows 60).
  - Every animation and arm guard is `view === treeView`, a single global.
- The fold engine (j2e FD-1 to FD-10) is reused as is: per-node displayed state `{px, py, s, o}`, the pruned shadow layout, phased `animateTree` with `tweenToken` and per-phase done flags, `syncControls` with focus rescue, and the badge on the lower edge drawing − or + as strokes.
- Probe pattern: `.planning/quick/261005-j2e-factor-tree-fold-and-unfold-sub-trees-in/fold-probe.js`, which uses the harness at `.planning/phases/07-shared-js-module-refactor/harness.js` and runs headless Chrome with `--virtual-time-budget`. rAF does not fire under virtual time, so settle timers drive the chains. The three Factor Tree probes from 261005-hz0, 261005-ing and 261005-j2e all drive `#numInput`, `#goBtn`, the chips or the auto-grown 60, so this rehaul supersedes them.

Planner decisions (PD). The user is away. These are the planner's choices, made under the orchestrator's guidance, and the executor implements them as written.
- PD-1 (entry path). The palette plus Add replaces the "enter N, Grow" path. `#numInput`, `#goBtn`, the chips, `renderChips`, both chip lists, `factorize`, `renderTree`'s staggered reveal, the `generation` counter and the arm timer are removed. Nothing grows on load.
- PD-2 (palette). The palette is pre-filled synchronously at IIFE time, not in the load handler, with the first PALETTE_PRIMES = 30 primes (2..113) found with `NT.core.isPrime`.
  - Each item is an HTML `<button type="button" class="palette-item" data-n>`. Its text is `String(n)`, a plain numeral. Its `aria-label` and `title` come from `translate('factorTree.paletteItemLabel', { n })`.
  - It is a 44px circle that stretches into a pill for long numbers: min-width 44px, height 44px, padding 0 10px, border-radius 22px.
  - It is coloured like a blue tree node: background `var(--role-input)`, text `var(--accent-ink)`.
  - Added items are appended at the end, duplicates included. The palette is not persisted: every load starts from the 30 primes.
- PD-3 (fold-start semantics). A placed tree starts with every node that has children folded. Each + therefore reveals exactly one split, which is how the user "figures out" a factorization step by step and keeps every revealed blue circle consistent with the palette's blue 2. There is no unfold-all shortcut. Inner fold and mirror states keep j2e's FD-6 behaviour.
- PD-4 (Add field). The field is `<input id="addInput" type="number" inputmode="numeric" pattern="[0-9]*" min="2" step="1">`.
  - It sits LEFT of `#addBtn`, matching the page's existing field-then-button row and the usual type-then-confirm flow, with `#randomBtn` after them.
  - Its accessible name comes from `aria-label` plus `data-i18n-aria-label="factorTree.addInputLabel"`. Its existing translated hint-text attribute and key ("e.g. 60") carry over unchanged from `#numInput`.
  - `max` is the current mode's cap.
  - Filters: a keydown filter calls preventDefault for e, E, +, -, . and ,. A `beforeinput` filter calls preventDefault when `e.data` contains a non-digit. Enter runs `addFromInput()`.
  - Validation in `addFromInput()`, in this order:
    1. trimmed empty → `msgEmpty`;
    2. not `/^\d+$/` → `msgInvalid`;
    3. 0 → `msgInvalid`;
    4. 1 → `msgOne`, shown as a warning;
    5. over the cap (`BALANCED_MAX_N` in Balanced, CLASSIC_MAX_N = 1000000000000 in Classic) → `msgTooLargeBalanced` or `msgTooLargeClassic`;
    6. otherwise `addPaletteItem(n, true)` and `setMessage('factorTree.msgAdded', { n }, true)`.
  - After an add the field keeps its value with the text selected (`addInput.select()`), so the same number can be added again and typing replaces it.
- PD-5 (drag-and-drop). Drag-and-drop uses Pointer Events, not HTML5 DnD, so mouse, pen and touch all work.
  - A delegated `pointerdown` on `#palette` handles a primary pointer only (button 0, isPrimary). It calls preventDefault, which stops text selection, and records `{ item, n, pointerId, x0, y0, active:false }`. It then adds `pointermove`, `pointerup`, `pointercancel` and `keydown` listeners on `window`.
  - Use window listeners filtered by pointerId, not setPointerCapture, so synthetic probe events work too.
  - Movement beyond DRAG_SLOP = 6 px activates the drag:
    - an aria-hidden `div.drag-ghost` that looks like the item follows the pointer via `transform`;
    - `body.is-dragging` is set;
    - `#workArea` toggles `is-drop-over` from a `getBoundingClientRect` containment test (`overWork`).
  - On `pointerup`: if the drag was active and the pointer is over the work area, call `dropTree(n)`. In every case, clean up (remove the listeners and the ghost, clear both classes, set drag to null). After an active drag, set `dragJustEnded = true` and reset it with `setTimeout(..., 0)`, so the browser's trailing click does not place a second copy.
  - `pointercancel` and the Escape key end the drag with nothing placed; Escape also sets `dragJustEnded`.
  - Palette items get `touch-action:none`, `user-select:none` and `cursor:grab`.
  - Click placement (also tap, Enter and Space, since the item is a native button) uses a delegated `click` on `#palette`. When `dragJustEnded` is false it calls `dropTree(n, { keyboard: e.detail === 0 })`. A keyboard placement focuses the new tree's root badge.
  - A delegated keydown on `#palette` calls preventDefault for Enter or Space when `e.repeat`, so a held key does not place repeated copies.
  - A placed card is appended at the end of the working area and scrolled into view with `scrollIntoView({ block: 'nearest' })`.
- PD-6 (working area). The working area holds many trees, each in its own card.
  - `#workArea` (class `stage work-area`) is a flex-wrap, centred row of `div.tree-card`. Each card contains the tree `svg.tree-svg`, a `button.tree-remove` and a `div.equation.tree-equation`.
  - The remove button holds an inline aria-hidden SVG × (two lines, `stroke: currentColor`) and no text. Its `aria-label` and `title` are `translate('factorTree.removeLabel', { n })`. It sits absolutely at the card's top-right, inside a 28px top padding, so it never covers the circle.
  - `#workHint` is a `<p>` inside `#workArea`, hidden (the `hidden` attribute) whenever a card exists.
  - `#clearBtn` sits in the working area's heading row and is disabled when the area is empty.
  - Removing a card (or clearing) sets `view.live = false`, which stops its animation chain, and removes its DOM.
  - Focus after a removal goes to the nearest remaining card's remove button, otherwise to the first palette item. After Clear it goes to the first palette item.
  - The single `treeView` global becomes `views`, an array of live views in DOM order. Every `view === treeView` guard becomes `view.live`.
- PD-7 (per-card geometry; this replaces j2e FD-4's full-width spread).
  - Each card's svg is sized to its visible tree, and the size tweens with the nodes.
  - Fixed per tree, computed in `buildCard` from the fully unfolded tree:
    - `maxSvgWidth = Math.max(200, Math.min(600, (workArea.clientWidth || 600) - 56))`;
    - `levelHeight` keeps today's formula;
    - `spacing = fullLeaves > 1 ? Math.min(SPACING_MAX, (maxSvgWidth - 2*SIDE_PAD) / (fullLeaves - 1)) : SPACING_MAX`, with SPACING_MAX = 56 and SIDE_PAD = 30;
    - `radius`, `oneRadius`, `fontSize`, `oneFontSize`, `axisHalf` and `badgeR` keep today's formulas, with `spacing` in place of `xSpacing`.
  - Then:
    - `sidePad = Math.max(SIDE_PAD, Math.ceil(String(n).length * fontSize * 0.31) + 6)`, so a long root label never clips;
    - `spacing` is recomputed with that `sidePad`, and the radius stays;
    - `topPad = 26` and `bottomPad = Math.max(26, radius + badgeR + 6)`, so a folded circle's badge fits.
  - `pxX(node) = view.sidePad + node.x * view.spacing` and `pxY(node) = view.topPad + node.depth * view.levelHeight`.
  - `sizeOf(view)` returns `w = 2*sidePad + (view.leafCount - 1)*spacing` and `h = topPad + visDepth*levelHeight + bottomPad`, where `visDepth` is the deepest node that is not hidden.
  - The displayed size lives in `view.w`/`view.h`. Target maps carry one extra entry under a module-level `SIZE_KEY = Object.freeze({})`:
    - `currentTargets` stores the displayed size;
    - `finalTargets` stores `sizeOf(view)`;
    - `animateTree` interpolates and applies it like any node;
    - `placeTree` writes the svg `width`, `height` and `viewBox` from it.
  - Consequences: fold phase 1 keeps the size and phase 2 shrinks it; unfold phase 1 grows it while space opens; a mirror keeps it.
- PD-8 (equation and message). Each card shows its equation only while it is fully unfolded, meaning no node with children is folded.
  - `updateEquation(view)` pops the lines into the card's `.tree-equation`, with today's text rules: a prime p reads "p = p × 1"; a composite reads the factor product, plus the exponent line when a factor repeats.
  - Each time a tree becomes fully unfolded it also sets the message: `msgPrime` `{ n }` or `msgFactors` `{ n, count }` (info).
  - Folding anything clears the card's equation immediately.
  - `animateTree(view, phases, onDone)` gains an optional `onDone`, called once after the last phase finishes while the view is alive, and synchronously on the reduced-motion path. Unfold passes `() => updateEquation(view)`.
- PD-9 (mode). The Classic/Balanced toggle stays and decides how placed trees split.
  - `applyMode` updates the button state, the note and `addInput.max`, then calls `rebuildWork()`.
  - `rebuildWork()` re-places every working-area tree, in order, fresh and fully folded in the new mode. A tree over the new mode's cap is dropped, and `msgTooLargeBalanced` is shown.
  - `dropTree` refuses an over-cap n (palette items can exceed Balanced's cap) with the same message.
- PD-10 (Randomize). It stays next to Add and only fills `#addInput` with `pickRandomN()`: a value in [12, 9999] with at least 3 prime factors, different from the field's current value. It never adds to the palette, because the user's workflow keeps Add as the only way into the palette.
- PD-11 (deep link). The `?n=` link from Venn Diagram's Factor Tree link is handled in the load handler, with `readNParam` unchanged:
  - Select Balanced.
  - n = 1 → `msgOne` (info).
  - Otherwise, append n to the palette unless an item with that number already exists, then `dropTree(n)`.
  - Without a deep link the page opens with an empty working area.
- PD-12 (language and motion).
  - `onLangChange` relabels and moves nothing: `syncControls` and `relabelRemove` for every live view, `relabelPalette()`, `renderMessage()` and `renderBalancedNote()`. Static text re-binds via `applyStaticDom`.
  - Under reduced motion, `animateTree` applies its phases instantly (as today), and the new `cardIn` pop and the drop highlight transition are switched off.
  - `#message` gains `role="status"` and `aria-live="polite"`, so adds, errors and finished factorizations are announced.
- PD-13 (strings and scope).
  - New keys: `add`, `addInputLabel`, `paletteHeading`, `paletteItemLabel` `{n}`, `workHeading`, `workHint`, `clear`, `removeLabel` `{n}` and `msgAdded` `{n}`.
  - `subtitle` is rewritten for the new workflow.
  - Two keys are deleted: the old grow-button label and the prime-chip label.
  - Every other key stays and is still used.
  - The header comment of `assets/i18n/factor-tree.js` is updated to match.
  - No change to `assets/nt-*.js`, `assets/i18n/site.js`, `assets/i18n/hub.js`, `index.html` or CLAUDE.md.

Source audit:
- User point 1 (prime palette, drag-and-drop, lands folded, + unfolds, blue 2 → gray 1 + green 2): PD-2, PD-3, PD-5; Tasks 1 and 2.
- User point 2 (Add with a numbers-only field; primes and composites; repeatable; duplicates): PD-4; Task 1.
- User point 3 (new workflow: Add → drag → unfold): PD-1, PD-3, PD-8; Tasks 1 and 2.
- Note a (copy on drop): PD-5; Task 1, probe P3.
- Note b (30 primes on load): PD-2; Task 1, probe P1.
- Note c (field placement): PD-4; Task 1, probe P2.
- Orchestrator asks:
  - multiple trees with remove/clear → PD-6, Task 2;
  - existing controls → PD-1, PD-9, PD-10, PD-11, Tasks 2 and 3;
  - pointer DnD on mouse and touch plus keyboard → PD-5, Tasks 1 and 2;
  - numeric field bounds and translated validation → PD-4, Task 1;
  - 16 languages, no literal colours, no innerHTML prose, keep i18n-check green, remove unused keys → PD-13, Tasks 1 and 3;
  - headless verification → all tasks.

Nothing is unplanned.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@assets/i18n/factor-tree.js
@assets/nt-layout.js
@.planning/quick/261005-j2e-factor-tree-fold-and-unfold-sub-trees-in/261005-j2e-SUMMARY.md

Read the page directly; its path has a space: `Factor Tree/factor-tree.html`. The line map is in the objective.

Probe template: `.planning/quick/261005-j2e-factor-tree-fold-and-unfold-sub-trees-in/fold-probe.js`. Copy its shape:
- `loadDicts` (vm with a stub `NT.i18n.register`; never require i18n-check.js);
- `nodeScenario`/`nodeAssert`;
- `inPage(cfg)` with `emit`/`assert`/`near`/`sleep`/`waitFor` and a sequential step runner whose first step runs synchronously in the probe's load listener;
- `buildSite` (copies `assets/` and the page into `harness.mkScratch`, injecting `<pre>` + script before `</body>`);
- `runChrome` (`google-chrome --headless=new ... --dump-dom` with `harness.chromeEnv()`), `runPage`, `unescapeHtml` and `main`.

Its geometry helpers (`labelEl`/`labelOf`/`badgeOf`/`ringOf`, `collapsedInto`, `visibleCoherent`) and hz0's `mirroredAbout`/`samePositions` (mirror-probe.js, lines 180-190) are the models for the new helpers. Use the no-literal-colour regex from fold-probe.js N2 (line 75).

Shared-module export names a local identifier must not reuse (shadow-check): `NT.core` (gcd, clamp, mod, modInverse, modPowSmall, isPrime, isqrt, isPerfectSquare, primeFactors, smallestPrimeFactor, fermatSplit, unitsMod, totient, euclidSteps, randomInt, FERMAT_MAX_ITER), `NT.svg` (svgEl, polar, annularSectorPath, easeInOutCubic, SVG_NS), `NT.layout` (assignTreeX, BALANCED_MAX_N, buildFactorTree, computeNestedLayout, flattenTree, TILE_CAP), `NT.i18n` (applyStaticDom, bindText, detectDefaultLang, getLang, onLangChange, register, setLang, translate, translateInto, SUPPORTED_LANGS, LANG_STORAGE_KEY).
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Tracer: palette of 30 primes plus Add, pointer drag of a copy into the working area, a folded card, and + unfolding blue 2 into gray 1 and green 2 (all strings, multi-tree engine, sized cards, probe)</name>
  <files>assets/i18n/factor-tree.js, Factor Tree/factor-tree.html, .planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js</files>
  <action>
A. Strings in `assets/i18n/factor-tree.js`, per PD-13. Do this in one pass over all sixteen language blocks.
- Delete the grow-button key and the prime-chip key from every block.
- Replace `subtitle` with the values below.
- Append the nine new keys after `unfoldLabel` in this order: add, addInputLabel, paletteHeading, paletteItemLabel, workHeading, workHint, clear, removeLabel, msgAdded.
- Keep each block's existing quoting style. Use the typographic apostrophe ’ where a value needs one, as in the existing fr and it values.
- The `{n}` slot is identical everywhere, and ru and el stay entirely in their own script apart from `{n}` and `+`.
- Update the header comment so it describes the palette/Add/working-area keys and no longer mentions the Grow button or the chip label.

Values, in the order subtitle | add | addInputLabel | paletteHeading | paletteItemLabel | workHeading | workHint | clear | removeLabel | msgAdded:
- en: 'Add a number to the palette, drag its circle into the working area, then press + to unfold it — branch by branch, down to its prime leaves.' | 'Add' | 'Number to add to the palette' | 'Circle palette' | 'Place {n} in the working area' | 'Working area' | 'Drag a circle from the palette here, or click it, then press its + to unfold it.' | 'Clear' | 'Remove {n} from the working area' | 'Added {n} to the palette.'
- nl: 'Voeg een getal toe aan het palet, sleep de cirkel naar het werkgebied en druk op + om hem uit te vouwen — tak voor tak, tot aan zijn priembladeren.' | 'Toevoegen' | 'Getal om aan het palet toe te voegen' | 'Cirkelpalet' | 'Zet {n} in het werkgebied' | 'Werkgebied' | 'Sleep een cirkel uit het palet hierheen, of klik erop, en druk dan op zijn + om hem uit te vouwen.' | 'Wissen' | 'Haal {n} uit het werkgebied' | '{n} is aan het palet toegevoegd.'
- de: 'Füge eine Zahl zur Palette hinzu, zieh ihren Kreis auf die Arbeitsfläche und drück auf +, um ihn auszuklappen — Ast für Ast, bis zu den Primblättern.' | 'Hinzufügen' | 'Zahl, die zur Palette hinzugefügt wird' | 'Kreispalette' | '{n} auf die Arbeitsfläche legen' | 'Arbeitsfläche' | 'Zieh einen Kreis aus der Palette hierher oder klick ihn an, und drück dann auf sein +, um ihn auszuklappen.' | 'Leeren' | '{n} von der Arbeitsfläche entfernen' | '{n} wurde zur Palette hinzugefügt.'
- fr: "Ajoutez un nombre à la palette, faites glisser son cercle dans la zone de travail, puis appuyez sur + pour le déplier — branche par branche, jusqu’à ses feuilles premières." | 'Ajouter' | 'Nombre à ajouter à la palette' | 'Palette de cercles' | 'Placer {n} dans la zone de travail' | 'Zone de travail' | "Faites glisser un cercle de la palette jusqu’ici, ou cliquez dessus, puis appuyez sur son + pour le déplier." | 'Effacer' | 'Retirer {n} de la zone de travail' | '{n} a été ajouté à la palette.'
- es: 'Añade un número a la paleta, arrastra su círculo al área de trabajo y pulsa + para desplegarlo — rama por rama, hasta sus hojas primas.' | 'Añadir' | 'Número para añadir a la paleta' | 'Paleta de círculos' | 'Colocar {n} en el área de trabajo' | 'Área de trabajo' | 'Arrastra aquí un círculo de la paleta, o haz clic en él, y luego pulsa su + para desplegarlo.' | 'Borrar' | 'Quitar {n} del área de trabajo' | '{n} se ha añadido a la paleta.'
- it: 'Aggiungi un numero alla tavolozza, trascina il suo cerchio nell’area di lavoro e premi + per espanderlo — ramo per ramo, fino alle sue foglie prime.' | 'Aggiungi' | 'Numero da aggiungere alla tavolozza' | 'Tavolozza dei cerchi' | 'Metti {n} nell’area di lavoro' | 'Area di lavoro' | 'Trascina qui un cerchio dalla tavolozza, o fai clic su di esso, poi premi il suo + per espanderlo.' | 'Svuota' | 'Togli {n} dall’area di lavoro' | '{n} è stato aggiunto alla tavolozza.'
- pl: 'Dodaj liczbę do palety, przeciągnij jej koło do obszaru roboczego i naciśnij +, aby je rozwinąć — gałąź po gałęzi, aż do liści pierwszych.' | 'Dodaj' | 'Liczba do dodania do palety' | 'Paleta kół' | 'Umieść {n} w obszarze roboczym' | 'Obszar roboczy' | 'Przeciągnij tutaj koło z palety albo je kliknij, a potem naciśnij jego +, aby je rozwinąć.' | 'Wyczyść' | 'Usuń {n} z obszaru roboczego' | 'Dodano {n} do palety.'
- pt-BR: 'Adicione um número à paleta, arraste o círculo dele para a área de trabalho e pressione + para expandi-lo — galho por galho, até as folhas primas.' | 'Adicionar' | 'Número para adicionar à paleta' | 'Paleta de círculos' | 'Coloque {n} na área de trabalho' | 'Área de trabalho' | 'Arraste um círculo da paleta para cá, ou clique nele, e depois pressione o + dele para expandi-lo.' | 'Limpar' | 'Remova {n} da área de trabalho' | '{n} foi adicionado à paleta.'
- pt-PT: 'Adiciona um número à paleta, arrasta o seu círculo para a área de trabalho e carrega em + para o expandir — ramo por ramo, até às folhas primas.' | 'Adicionar' | 'Número a adicionar à paleta' | 'Paleta de círculos' | 'Coloca {n} na área de trabalho' | 'Área de trabalho' | 'Arrasta um círculo da paleta para aqui, ou clica nele, e depois carrega no seu + para o expandir.' | 'Limpar' | 'Remove {n} da área de trabalho' | '{n} foi adicionado à paleta.'
- sv: 'Lägg till ett tal i paletten, dra dess cirkel till arbetsytan och tryck på + för att fälla ut den — gren för gren, ända ner till primtalsbladen.' | 'Lägg till' | 'Tal att lägga till i paletten' | 'Cirkelpalett' | 'Placera {n} på arbetsytan' | 'Arbetsyta' | 'Dra hit en cirkel från paletten, eller klicka på den, och tryck sedan på dess + för att fälla ut den.' | 'Rensa' | 'Ta bort {n} från arbetsytan' | '{n} har lagts till i paletten.'
- nb: 'Legg til et tall i paletten, dra sirkelen til arbeidsområdet og trykk på + for å folde den ut — gren for gren, helt ned til primtallsbladene.' | 'Legg til' | 'Tall som skal legges til i paletten' | 'Sirkelpalett' | 'Plasser {n} i arbeidsområdet' | 'Arbeidsområde' | 'Dra en sirkel fra paletten hit, eller klikk på den, og trykk deretter på + under den for å folde den ut.' | 'Tøm' | 'Fjern {n} fra arbeidsområdet' | '{n} er lagt til i paletten.'
- ro: 'Adaugă un număr în paletă, trage cercul lui în zona de lucru și apasă + ca să-l extinzi — ramură cu ramură, până la frunzele prime.' | 'Adaugă' | 'Număr de adăugat în paletă' | 'Paleta de cercuri' | 'Plasează {n} în zona de lucru' | 'Zona de lucru' | 'Trage aici un cerc din paletă, sau dă clic pe el, apoi apasă pe + al lui ca să-l extinzi.' | 'Golește' | 'Elimină {n} din zona de lucru' | '{n} a fost adăugat în paletă.'
- hu: 'Adj hozzá egy számot a palettához, húzd a körét a munkaterületre, majd nyomd meg a + gombot a kinyitásához — ágról ágra, egészen a prímlevelekig.' | 'Hozzáadás' | 'A palettához adandó szám' | 'Körpaletta' | 'Tedd a munkaterületre: {n}' | 'Munkaterület' | 'Húzz ide egy kört a palettáról, vagy kattints rá, majd nyomd meg a + gombját a kinyitásához.' | 'Törlés' | 'Eltávolítás a munkaterületről: {n}' | '{n} bekerült a palettába.'
- lv: 'Pievieno skaitli paletei, ievelc tā apli darba laukumā un nospied +, lai to izvērstu — zaru pēc zara, līdz pat pirmskaitļu lapām.' | 'Pievienot' | 'Skaitlis, ko pievienot paletei' | 'Apļu palete' | 'Novietot {n} darba laukumā' | 'Darba laukums' | 'Ievelc šeit apli no paletes vai noklikšķini uz tā, tad nospied tā +, lai to izvērstu.' | 'Notīrīt' | 'Noņemt {n} no darba laukuma' | '{n} pievienots paletei.'
- ru: 'Добавь число в палитру, перетащи его круг в рабочую область и нажми +, чтобы развернуть его — ветвь за ветвью, до простых листьев.' | 'Добавить' | 'Число для добавления в палитру' | 'Палитра кругов' | 'Поместить {n} в рабочую область' | 'Рабочая область' | 'Перетащи сюда круг из палитры или нажми на него, затем нажми его +, чтобы развернуть.' | 'Очистить' | 'Убрать {n} из рабочей области' | 'Число {n} добавлено в палитру.'
- el: 'Πρόσθεσε έναν αριθμό στην παλέτα, σύρε τον κύκλο του στην περιοχή εργασίας και πάτησε + για να τον ξεδιπλώσεις — κλαδί προς κλαδί, μέχρι τα πρώτα φύλλα του.' | 'Προσθήκη' | 'Αριθμός για προσθήκη στην παλέτα' | 'Παλέτα κύκλων' | 'Τοποθέτησε το {n} στην περιοχή εργασίας' | 'Περιοχή εργασίας' | 'Σύρε εδώ έναν κύκλο από την παλέτα ή κάνε κλικ πάνω του και μετά πάτησε το + του για να τον ξεδιπλώσεις.' | 'Καθαρισμός' | 'Αφαίρεσε το {n} από την περιοχή εργασίας' | 'Το {n} προστέθηκε στην παλέτα.'

B. Markup and CSS in `Factor Tree/factor-tree.html` (PD-1, PD-2, PD-4, PD-6, PD-12). Every colour comes from a `var()` token; no new line may contain hex, rgb/hsl or a named colour.
- Markup:
  - `.controls` becomes `#addInput` (per PD-4), `<button id="addBtn" type="button" data-i18n="factorTree.add">Add</button>`, then the existing `#randomBtn`.
  - Delete the `.chips` div. Give `#message` `role="status"` and `aria-live="polite"`.
  - Add a palette section: a `div.section-head` holding `<h2 id="paletteHeading" class="section-title" data-i18n="factorTree.paletteHeading">Circle palette</h2>`, followed by `<div id="palette" class="palette" role="group" aria-labelledby="paletteHeading"></div>`.
  - Add a working-area section: a `div.section-head` holding `<h2 id="workHeading" class="section-title" data-i18n="factorTree.workHeading">Working area</h2>` and `<button id="clearBtn" type="button" class="clear-btn" data-i18n="factorTree.clear" disabled>Clear</button>`.
  - Replace the old `.stage` block (`#treeArea`, `#equation`) with `<div id="workArea" class="stage work-area" role="region" aria-labelledby="workHeading"><p id="workHint" class="work-hint" data-i18n="factorTree.workHint">…English workHint…</p></div>`.
  - The footnote stays.
- CSS:
  - Rename the `#numInput` rules, including the 480px media rule, to `#addInput`; rename `#goBtn` to `#addBtn`.
  - Delete `.chips`/`.chip`, `.tree-area` and the depth-group reveal rules (lines 172-181). The `g.depth-group` elements stay as plain layer groups.
  - Keep `.equation`/`.fac`, and add `.tree-equation{ font-size:.95rem; margin-top:6px; min-height:0; }`.
  - Add:
    - `.section-head` (flex, space-between, align centre, gap 10px, margin 0 0 8px);
    - `.section-title` (sans, .85rem, 600, `color:var(--text-dim)`, margin 0);
    - `.palette` (flex-wrap, gap 8px, margin-bottom 22px);
    - `.palette-item` per PD-2: border 1px solid `var(--role-input)`, sans 700, .9375rem, `cursor:grab`, `touch-action:none`, `user-select:none` and `-webkit-user-select:none`, transition filter. Hover `filter:brightness(1.08)`, `:focus` `outline:none`, `:focus-visible` `box-shadow:var(--ctl-focus)`;
    - `.palette-item.is-new` and `.tree-card`: `animation:cardIn .25s ease-out`, with `@keyframes cardIn{ from{ opacity:0; transform:scale(.6); } }`;
    - `.drag-ghost` (the `.palette-item` look plus `position:fixed; left:0; top:0; z-index:1000; pointer-events:none; opacity:.9; filter:drop-shadow(0 4px 10px var(--scrim))`);
    - `.work-area` (flex-wrap, `justify-content:center`, `align-items:flex-start`, gap 12px, min-height 160px, `transition:background var(--ease-ctl), border-color var(--ease-ctl)`);
    - `.work-hint` (width 100%, centred, `color:var(--text-dim)`, margin auto 0) and `.work-hint[hidden]{ display:none; }`;
    - `body.is-dragging .work-area{ border-style:dashed; border-color:var(--role-input); }`;
    - `.work-area.is-drop-over{ background:var(--role-input-soft); border-color:var(--accent); }`;
    - `.tree-card` (position relative, `background:var(--surface)`, border 1px solid `var(--panel-border)`, `border-radius:var(--radius-card)`, padding 28px 8px 10px, max-width 100%), and `.tree-card .tree-svg{ display:block; margin:0 auto; }`;
    - `.tree-remove` (absolute, top 4px, right 4px, 24×24, round, border 1px solid `var(--panel-border)`, `background:var(--surface)`, `color:var(--text-dim)`, grid centring, padding 0, cursor pointer). Hover `color:var(--role-warn)`, `:focus-visible` `box-shadow:var(--ctl-focus)`; the inner svg lines use `stroke:currentColor` and stroke-width 1.6;
    - `.clear-btn` (the `#randomBtn` look at height 32px, padding 0 12px, .85rem), with `:disabled{ opacity:.5; cursor:default; }` and no hover accent while disabled.
  - Add `.palette-item.is-new, .tree-card{ animation:none; }` and `.work-area{ transition:none; }` to the reduced-motion block.

C. Script in `Factor Tree/factor-tree.html` (PD-1 to PD-8).
- Import changes: `const { isPrime, primeFactors, randomInt } = NT.core;`. The other import lines are unchanged.
- Elements: addInput, addBtn, randomBtn, paletteEl, workArea, workHint, clearBtn, messageEl, modeButtons, balancedNote.
- Remove: `generation`, `treeView`, MIRROR_ARM_AFTER_MS, both chip lists, `renderChips` (and every call), `clearStage`, `factorize` and `renderTree`.
- Add constants: PALETTE_PRIMES = 30, CLASSIC_MAX_N = 1000000000000, SIDE_PAD = 30, SPACING_MAX = 56, DRAG_SLOP = 6, SIZE_KEY = Object.freeze({}). Add the state `views = []`, `drag = null` and `dragJustEnded = false`.
- `capFor(m)` returns BALANCED_MAX_N for 'balanced', otherwise CLASSIC_MAX_N.
- `popEquation(el, lines)` takes its target element.
- `equationLines(view)` returns today's line rules for `view.n`/`view.topFactors`.
- Palette:
  - `addPaletteItem(n, isNew)` creates the button per PD-2 (class `is-new` when isNew) and appends it.
  - `relabelPalette()` re-sets `aria-label`/`title` on every item.
  - Pre-fill synchronously at IIFE time: walk n = 2, 3, … and call `addPaletteItem(n, false)` for the first PALETTE_PRIMES n where `isPrime(n)` holds.
- `addFromInput()` follows PD-4. Wire `#addBtn` click, Enter in `#addInput`, and the keydown and beforeinput filters.
- `buildCard(n)` creates the card and returns its view:
  - Build the tree with `buildFactorTree(n, { balanced: mode === 'balanced' })`, run the full `assignTreeX` and `flattenTree`, and compute the PD-7 geometry.
  - View fields: `n`, `root`, `topFactors` (primeFactors(n)), `card`, `svg`, `eqEl`, `removeBtn`, `pxX`, `pxY`, `nodeViews`, `edgeViews`, `radius`, `tweenToken:0`, `leafCount`, `axisHalf`, `badgeR`, `spacing`, `sidePad`, `topPad`, `bottomPad`, `levelHeight`, `w`, `h`, `live:true`, `eqShown:false`.
  - DOM: the svg (class `tree-svg`) with the per-depth edge groups first, then the per-depth node groups. Each node is a circle plus its label `<text>`, in today's sibling order; edges are plain `line.edge-line` with no dash styles.
  - Node views keep j2e's fields. Every node with children starts with `folded = true` (PD-3).
  - Then run `layoutTree(view)`, set each node's `{px, py, s, o}` and `view.w`/`view.h` from `finalTargets(view)`, run `armMirrors(view)` and `armFolds(view)`, and finally `syncControls(view)` and `placeTree(view)`.
  - Remove button per PD-6, with click → `removeTree(view)` (its full behaviour lands in Task 2; here it removes the card and sets `live` false).
- `dropTree(n, opts)`:
  - Refuse an n over `capFor(mode)` with `msgTooLargeBalanced`/`msgTooLargeClassic` and return null.
  - Otherwise build the card, append it to `#workArea`, push it into `views`, call `syncWorkState()` (hint hidden when cards exist; `clearBtn.disabled` when empty) and scroll it into view. On `opts.keyboard`, focus the root badge. Return the view.
- Engine edits:
  - Every `view === treeView` guard becomes `view.live`, in armMirrors, armFolds, toggleFold, mirrorBranch and animateTree's `alive`. `armMirrors` no longer touches edge dash styles.
  - `pxX`/`pxY` follow PD-7. `layoutTree` keeps j2e's pruned-shadow logic and `view.leafCount`.
  - `currentTargets`/`finalTargets` add the SIZE_KEY entry; add `sizeOf(view)`.
  - `animateTree(view, phases, onDone)` interpolates `view.w`/`view.h` from SIZE_KEY alongside the nodes; `apply` and the reduced-motion branch also set them. Call `onDone` per PD-8.
  - `placeTree` also writes the svg `width`, `height` and `viewBox` ('0 0 ' + w + ' ' + h).
  - In `toggleFold`, the fold branch calls `updateEquation(view)` right after `syncControls` (this clears the equation), and the unfold branch passes `() => updateEquation(view)` as onDone.
  - `updateEquation` per PD-8.
- Drag per PD-5:
  - Delegated pointerdown on `#palette`.
  - `onDragMove`, `onDragEnd`, `onDragCancel` and `onDragKey` on `window`, all filtered by `drag.pointerId`.
  - `overWork(x, y)` tests the `#workArea` rect.
  - `endDrag()` does the cleanup.
  - The delegated click on `#palette` places a copy unless `dragJustEnded`.
- `onLangChange`: `renderMessage()`, `renderBalancedNote()`, `relabelPalette()`, then `views.forEach(syncControls)`.
- `applyMode` drops its `renderChips` call and sets `addInput.max = String(capFor(targetMode))`. Mode buttons call `applyMode` only; the rebuild comes in Task 2.
- Load handler: keep `readNParam`. With a deep link: `applyMode('balanced')`, and `dropTree` it only when it is at least 2 (the palette part comes in Task 3). Without one: do nothing.
- Every new label lands via `setAttribute` or `textContent`; never use innerHTML for text. Clearing a container with `innerHTML = ''` is acceptable, as today.

D. Probe `.planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js`, built from fold-probe.js's skeleton.
- Setup: output goes to `<pre id="kaz-out">`; scratch prefixes are `kaz-site-`/`kaz-profile-`; the summary lines read `KAZ-PROBE PASS (N scenarios)` or `KAZ-PROBE FAIL ...`.
- Chrome: `--virtual-time-budget=180000`, spawn timeout 240000, window 1280,900.
- `runPage(page, extraArgs, tag, query)` defaults `query` to `?lang=en`.
- Node scenarios:
  - N1 key-catalog. For all sixteen languages:
    - the nine new keys and `subtitle` are non-empty strings;
    - paletteItemLabel, removeLabel and msgAdded contain `{n}`;
    - every non-en value of the ten differs from en;
    - with `{n}` removed, ru values have no Latin letter and at least one Cyrillic letter, and el values have no Latin letter and at least one Greek letter.
  - N2 dead-keys. In all sixteen languages the old `grow` and `chipPrime` keys are absent. Every key of the en `factorTree` dict appears as the literal `factorTree.<key>` in factor-tree.html, and every `factorTree.<key>` literal in the page exists in en.
  - N3 no-literal-colour. Apply fold-probe's regex to every `<style>` line matching /palette|drag|work|tree-card|tree-remove|clear-btn|section-|cardIn|tree-equation|addInput|addBtn/. At least 10 lines must match, and none may contain a literal colour.
- In-page helpers:
  - `items()`, `cards()`, `cardCircles(card)`, `cardEdges(card)`;
  - `shownCircles(card)`, using computed display;
  - `labelOf`, `badgeOf`, `ringOf` (as in fold-probe, scoped to the card);
  - `svgW(card)`/`svgH(card)` from the svg attributes;
  - `geom(card)` = [cx, cy, r] of every circle;
  - `msg()` = `#message` text;
  - `T(key, params)` = `NT.i18n.translate('factorTree.' + key, params)`;
  - `ptr(type, target, x, y, pointerType)` dispatches `new PointerEvent(type, { bubbles:true, cancelable:true, clientX:x, clientY:y, pointerId: 7, pointerType, button:0, buttons: type === 'pointerup' ? 0 : 1, isPrimary:true })`;
  - `centre(el)` from getBoundingClientRect;
  - `dragTo(item, x, y, pointerType)`: pointerdown on the item at its centre, pointermove on document 3 px away, pointermove on document at (x, y), pointerup on document at (x, y);
  - `visibleCoherent(card)`:
    - every shown edge's endpoints are on shown circle centres;
    - every shown circle whose badge has aria-expanded "true" has exactly 2 shown outgoing edges and sits at their mean x;
    - every shown `is-folded` circle has 0 shown outgoing edges;
    - every shown cx is in [0, svgW] and cy in [0, svgH], and every shown badge disc's bottom is at most svgH;
    - the slot circles (shown, no shown outgoing edge), sorted by cx, have equal consecutive gaps, and min cx + max cx = svgW (±0.01).
  - Wait constant TW = 1400 ms after any fold, unfold or mirror.
  - Capture `window.onerror` into an array; every step asserts it is empty.
- Steps (default run; EXPECTED = 7 in this task: N1-N3 + P1-P4):
  - P1 load (synchronous):
    - 30 `.palette-item` buttons whose labels equal the first 30 primes computed in the probe (2..113), in order;
    - each has aria-label and title = T('paletteItemLabel', { n });
    - computed touch-action is none;
    - zero `.tree-card`;
    - `#workHint` is shown, and `#clearBtn` is disabled;
    - `#numInput`, `#goBtn` and `.chip` do not exist.
  - P2 add-validation:
    - `#addInput` has type number, inputmode numeric, aria-label T('addInputLabel'), and its nextElementSibling is `#addBtn`, whose text is T('add'); `#randomBtn` follows `#addBtn`.
    - A cancelable keydown 'e' on the field is defaultPrevented; '5' is not.
    - For each of these values: set it, click `#addBtn`, then the palette count is still 30, the message equals the expected text, and `#message` lacks class info:
      - '' → msgEmpty;
      - '0', '-4', '3.5' and '1e3' → msgInvalid;
      - '1' → msgOne;
      - '1000000000001' → msgTooLargeClassic.
    - '10' + Add → 31 items. The last item reads '10' with label T('paletteItemLabel', { n: 10 }). The message is T('msgAdded', { n: 10 }) with class info.
    - '10' again → 32. '60' + a keydown Enter on the field → 33, and the last item reads '60'.
  - P3 drag-drop:
    - `dragTo(item[0] '2', workArea centre, 'mouse')`. Mid-drag, before the pointerup (split dragTo so it can be checked): a `.drag-ghost` exists and `#workArea` has `is-drop-over`. After the pointerup, dispatch `new MouseEvent('click', { bubbles:true, detail:1 })` on the item in the same synchronous step. Then:
      - exactly 1 card, no ghost, no `is-drop-over`, `body` lacks `is-dragging`;
      - 33 items, and item[0] still reads '2' (copy semantics, and the trailing click was suppressed);
      - the card has 1 shown circle, labelled '2', class root, and its computed fill equals item[0]'s computed backgroundColor (blue);
      - the 2 other circles are not shown, and 0 edges are shown;
      - its ring is shown and no axis is shown;
      - its badge has aria-expanded false and aria-label T('unfoldLabel', { n: 2 }), the vertical glyph is shown, and the disc centre is at (cx, cy + r);
      - svgW = 2·cx; the equation is empty; `#workHint` is hidden; `#clearBtn` is enabled.
    - Touch drag of item[1] '3' → 2 cards, the new one labelled '3'.
    - A drag released over the h1 → still 2 cards and no ghost.
    - pointerdown, a move past the slop, then pointercancel → still 2 cards and no ghost.
    - pointerdown, a move past the slop, then a keydown Escape on window → still 2 cards, no ghost, and a click on the item in the same step places nothing.
  - P4 unfold-prime. Click card 1's root badge, wait TW. Unless reduced, sample svgW after 300 ms and require it already above its folded value (the card opens while space opens). Then:
    - 3 shown circles, with the root '2' still class root and blue;
    - a circle labelled '1' with class `one`, r less than the root's r, and a fill different from the root's (gray);
    - a circle labelled '2' with class `prime-leaf` and a fill different from both (green);
    - the root badge has aria-expanded true and label T('foldLabel', { n: 2 }), its ring is hidden, and the root circle is `mirrorable`;
    - 2 edges are shown; `visibleCoherent` holds; svgW and svgH are larger than when folded;
    - the card's `.tree-equation` text is '2 = 2 × 1', and the message is T('msgPrime', { n: 2 }).
  </action>
  <verify>
    <automated>node .planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js && node .planning/phases/06-multi-language-support/i18n-check.js --coverage --literals --header --switcher-present --includes --no-locale-number-format "Factor Tree/factor-tree.html"</automated>
  </verify>
  <done>palette-probe prints KAZ-PROBE PASS (7 scenarios). The page opens with 30 blue prime circles and an empty working area. Add validates input and appends copies, duplicates included. A mouse or touch drag places a folded copy while the palette keeps its circle. The + on a dropped 2 reveals a small gray 1 and a green 2, the card grows to fit, and the equation 2 = 2 × 1 appears. The page-level i18n-check passes: the new keys exist in all sixteen languages and no untranslated literal remains.</done>
</task>

<task type="auto">
  <name>Task 2: Expansion: step-by-step composites, mirror, click and keyboard placement, multiple trees with remove and Clear, mode switch, Randomize, language switch</name>
  <files>Factor Tree/factor-tree.html, .planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js</files>
  <action>
A. Page, in `Factor Tree/factor-tree.html` (PD-5, PD-6, PD-9, PD-10, PD-12).
- Keyboard placement per PD-5:
  - the delegated keydown on `#palette` calls preventDefault for an Enter or Space keydown with `e.repeat`;
  - a click with `e.detail === 0` focuses the new card's root badge;
  - a pointer click (detail ≥ 1) leaves focus alone.
- `removeTree(view)`:
  - set `view.live = false`, bump `view.tweenToken`, remove the card, splice it from `views` and call `syncWorkState()`;
  - when the removed card held focus, or its remove button was the trigger, focus the next card's remove button, else the previous card's, else the first palette item.
- `relabelRemove(view)` re-sets the remove button's `aria-label`/`title`.
- `clearWork()` marks every view dead, removes every card, empties `views` and calls `syncWorkState()`. The `#clearBtn` click runs `clearWork()`, `setMessage(null)` and focuses the first palette item.
- `rebuildWork()` per PD-9:
  - record `views.map(v => v.n)`, run `clearWork()`, then `dropTree` each n that is within `capFor(mode)`, in order;
  - if any n was skipped, show `setMessage('factorTree.msgTooLargeBalanced')`.
  - Mode buttons call `applyMode(btn mode)` and then `rebuildWork()`.
- Randomize per PD-10. `pickRandomN()` avoids `Number(addInput.value)` instead of the old tree root. `#randomBtn` sets `addInput.value = pickRandomN()` and does nothing else.
- `onLangChange` also calls `relabelRemove` for every live view.
- Fix any gap the new probe steps expose without touching the shared `assets/` files.

B. Probe steps appended to the default run. EXPECTED in this task is 13: N1-N3 plus P1-P10 in the default run. D1 and the reduced-motion run arrive in Task 3.
- P5 composite-step-by-step:
  - Place item '60' (the last) with a pointer-style click (`MouseEvent` detail 1). The new card has 1 shown circle '60' with aria-expanded false, and focus is not on its badge.
  - Unfold the root and wait TW: 3 shown circles; both children are class internal and `is-folded`, with rings shown and aria-expanded false; svgW has grown; no equation yet; `visibleCoherent` holds.
  - Loop: while a shown badge in the card has aria-expanded false, click it and wait TW (at most 10 iterations). The loop runs exactly 6 more times. Then:
    - 15 shown circles and 14 shown edges, and all 7 badges have aria-expanded true;
    - the equation lines read '60 = 2 × 2 × 3 × 5' and '60 = 2^2 × 3 × 5';
    - the message is T('msgFactors', { n: 60, count: 4 });
    - `visibleCoherent` holds. Record G = geom.
  - Click the root circle (mirror) and wait: hz0's `mirroredAbout` over every circle about the root holds. Click again: geom equals G.
  - Fold the circle labelled '30':
    - immediately, its card's equation is empty;
    - after TW, its 10 descendants are collapsed into it (not shown, r ≈ 0, centre on 30's centre), svgW is smaller, and `visibleCoherent` holds.
  - Unfold it: geom equals G, and the equation is back.
- P6 placement-by-click-and-keyboard:
  - item '5' (index 2) `.click()`, so detail is 0: a new card '5', and `document.activeElement` is its root badge.
  - A keydown Enter with repeat:true on item '7' is defaultPrevented, and the card count is unchanged.
  - A MouseEvent click with detail 1 on item '7': a new card '7', and activeElement is not its badge.
- P7 multi-tree-remove-clear:
  - With at least 3 cards, record card A's geom and its card-relative position. Unfold card B's root and wait TW: card A's geom (its own svg coordinates) is unchanged.
  - Card B's remove button has aria-label and title T('removeLabel', { n }). Clicking it leaves one card fewer, card B gone, and focus on a remaining card's remove button.
  - Fold-then-remove: click a card's root badge, then its remove button in the same step, wait TW: no window errors.
  - `#clearBtn` click: 0 cards, `#workHint` shown, `#clearBtn` disabled, focus on item[0], the message is empty, and the palette count is unchanged.
- P8 mode-switch:
  - Add '45' and '1000003', then place both by click. Unfold 45's root: its shown children's labels are {3, 15}.
  - Click the Balanced mode button:
    - exactly 1 card, the 45 one, folded (aria-expanded false);
    - the message is T('msgTooLargeBalanced');
    - `#addInput.max` is '1000000'.
  - Unfold the root: children {5, 9}.
  - Clicking the '1000003' palette item adds no card, and the message is T('msgTooLargeBalanced').
  - '2000000' + Add: the palette count is unchanged and the message is T('msgTooLargeBalanced').
  - Click Classic: `max` is '1000000000000', and the 45 card is rebuilt folded. Then Clear.
- P9 randomize:
  - Empty the field and click `#randomBtn`: the field value is an integer string in [12, 9999] with at least 3 prime factors (`NT.core.primeFactors`); the palette and card counts are unchanged.
  - A second click gives a different value.
- P10 language:
  - Place '2' and unfold it, and place '60' folded. Record geom of both and the badge aria-expanded states. Then `NT.i18n.setLang('ru')`:
    - geom and expanded states are unchanged;
    - item[0]'s aria-label is the ru T('paletteItemLabel', { n: 2 }) and differs from the en one recorded before the switch;
    - a remove button's aria-label is the ru removeLabel;
    - the badges carry the ru fold/unfold labels;
    - `#workHint` text and both h2 texts equal their ru keys, and `#addBtn` text is the ru `add`;
    - `#message` was re-rendered in ru.
  - `setLang('en')`, then Clear.
  </action>
  <verify>
    <automated>node .planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js && node .planning/phases/06-multi-language-support/i18n-check.js --coverage --literals --header --switcher-present --includes --no-locale-number-format "Factor Tree/factor-tree.html" && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all</automated>
  </verify>
  <done>palette-probe prints KAZ-PROBE PASS (13 scenarios: N1-N3 plus P1-P10 in the default run). A composite unfolds one split per +, with blue folded children at each step, and its equation and message appear once it is fully unfolded. Mirroring and refolding restore the exact geometry. Click, tap and keyboard placement work, and keyboard placement focuses the new + button. Trees are independent, removable and clearable. A mode switch rebuilds trees folded and drops over-cap ones with a message. Randomize only fills the field. A language switch relabels everything without moving anything. The page-level i18n-check and shadow-check --all pass.</done>
</task>

<task type="auto">
  <name>Task 3: Deep link into the palette, reduced-motion and deep-link probe runs, superseded-probe notes and full regression</name>
  <files>Factor Tree/factor-tree.html, .planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js, .planning/quick/261005-hz0-factor-tree-drop-prime-from-header-title/mirror-probe.js, .planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js, .planning/quick/261005-j2e-factor-tree-fold-and-unfold-sub-trees-in/fold-probe.js</files>
  <action>
A. Deep link per PD-11, in the load handler of `Factor Tree/factor-tree.html`. With `readNParam()` non-null:
- call `applyMode('balanced')`;
- n = 1 → `setMessage('factorTree.msgOne', null, true)`;
- otherwise, if no `.palette-item` has `data-n` equal to String(n), call `addPaletteItem(n, true)`; then `dropTree(n)`.

Without a deep link nothing is placed.

B. Probe runs. `main` runs Chrome three times:
1. the default run (`?lang=en`, P1-P10);
2. a reduced-motion run (`--force-prefers-reduced-motion`, `?lang=en`, P1-P10, tag `[reduced] `);
3. a deep-link run (`?n=45&lang=en`, tag `[deeplink] `).

The in-page script picks its step list from `location.search`: when it contains `n=`, it runs only D1.
- Reduced branches:
  - P4 skips the 300 ms sample, and every final-state assertion holds right after the click.
  - P2 additionally checks that the new item's computed animationName is 'none'.
- D1 deep-link:
  - the Balanced mode button has `is-active`;
  - 31 palette items, the last reading '45';
  - exactly 1 card, root '45', folded;
  - unfolding the root and waiting TW shows children {5, 9}.

EXPECTED = 3 + 10 + 10 + 1 = 24.

C. Superseded notes. Add one comment line as the first line inside the header block comment of each of the three older Factor Tree probes (mirror-probe.js, randomize-probe.js, fold-probe.js): "SUPERSEDED by quick task 261005-kaz: this probe drives controls the palette rehaul removed; run palette-probe.js instead." Change nothing else in those files.

D. Regression gates. Run:
- palette-probe (24 scenarios);
- `i18n-check.js --all`;
- `shadow-check.js --all`;
- the phase-07 `harness.js`;
- the byte-identity check of the shared files against f4749ed.

Fix only the page or the probe.
  </action>
  <verify>
    <automated>node .planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js && node .planning/phases/06-multi-language-support/i18n-check.js --all && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all && node .planning/phases/07-shared-js-module-refactor/harness.js && git diff --quiet f4749ed -- assets/nt-core.js assets/nt-bigint.js assets/nt-svg.js assets/nt-store.js assets/nt-layout.js assets/nt-i18n.js assets/i18n/site.js assets/i18n/hub.js index.html</automated>
  </verify>
  <done>palette-probe prints KAZ-PROBE PASS (24 scenarios) across the default, reduced-motion and deep-link runs. A ?n=45 link opens in Balanced mode with 45 appended to the palette and placed folded. Reduced motion is instant everywhere. The three older Factor Tree probes are marked superseded. i18n-check --all, shadow-check --all and HARNESS PASS hold, and the shared modules, site.js, hub.js and index.html are unchanged since f4749ed.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user input → palette/tree | The Add field's text becomes a number that sizes a factor tree and a palette label |
| URL → page | The `?n=` deep link places a tree on load |
| pointer/keyboard events → drag state and animation loop | Synthetic or rapid events start drags, placements and tween chains |
| dictionary → DOM | Translated labels and messages land in aria-label, title and text nodes |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-kaz-01 | Tampering | `addFromInput` → `addPaletteItem` | low | mitigate | The input must match `/^\d+$/` and fall in [2, capFor(mode)] before `Number()` is used. Labels are written only via `textContent`/`setAttribute` with `translate(..., { n })`; prose never goes through innerHTML. Probe P2 and i18n-check `--literals` verify this |
| T-kaz-02 | Denial of service | Tree size from Add, drop or deep link | low | mitigate | The cap is re-checked at Add, at drop and on a mode switch (CLASSIC_MAX_N 1e12, so trial division stays at or below 1e6 steps, and BALANCED_MAX_N 1e6). Over-cap input adds or places nothing and shows a message. Probes P2 and P8 verify this |
| T-kaz-03 | Denial of service | Drag listeners and animation chains | low | mitigate | Window listeners are attached per drag and always removed in `endDrag`, and a second pointerdown during a drag is ignored. A removed or cleared view sets `live = false` and bumps `tweenToken`, so frames and settle timers stop. Probes P3 and P7 verify this, P7 with no window errors after fold-then-remove |
| T-kaz-04 | Tampering | `?n=` deep link | low | accept | `readNParam`'s parse, round-trip and cap checks are unchanged. The worst case is one extra palette circle and one folded tree |
| T-kaz-05 | Denial of service | Unbounded palette or cards from repeated Add or placement | low | accept | Growth is user-driven, local to the visitor's own tab and never persisted |
| T-kaz-SC | Tampering | npm/pip/cargo installs | high | accept | No package-manager installs: vanilla JS plus the in-repo harness and the system google-chrome |
</threat_model>

<verification>
- `node .planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js` exits 0 with KAZ-PROBE PASS (24 scenarios).
- `node .planning/phases/06-multi-language-support/i18n-check.js --all`, `node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all` and `node .planning/phases/07-shared-js-module-refactor/harness.js` all pass.
- `git diff --quiet f4749ed -- assets/nt-*.js assets/i18n/site.js assets/i18n/hub.js index.html` exits 0.
- Manual check in a visible browser (end-of-phase human check, not blocking):
  1. Drag the 2 with a mouse and press + to see a gray 1 and a green 2.
  2. Add 60, drag it in and unfold it step by step until the equation appears.
  3. Drag with a finger on a touch device or in emulation.
  4. Tab to a palette circle and press Enter, which focuses the new + button.
</verification>

<success_criteria>
- The palette opens with the first 30 primes; Add appends any valid integer at least 2, repeatedly; the field is left of Add and refuses non-digits (PD-1, PD-2, PD-4).
- Pointer drag (mouse and touch) and click/keyboard placement copy a circle into the working area, folded, and the palette keeps its circle (PD-5).
- Every + reveals one split; a prime p shows a gray 1 and a green p; a fully unfolded tree shows its equation and message (PD-3, PD-8).
- Several independent, removable, clearable trees; cards resize smoothly; mirroring and folding unchanged per tree (PD-6, PD-7).
- Mode switch, Randomize, deep link, language switch and reduced motion behave per PD-9 to PD-12.
- All strings in 16 languages, dead keys removed, no literal colours, shared files untouched, every gate green (PD-13).
</success_criteria>

<output>
Create `.planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/261005-kaz-SUMMARY.md` when done. Note in it:
- PD-3: every node starts folded, so each + reveals one split;
- PD-7: per-card sizing replaced j2e's full-width spread, and the size tweens with the nodes;
- PD-10: Randomize only fills the field;
- that the hz0, ing and j2e Factor Tree probes are superseded by palette-probe.js;
- whether a human checked mouse and touch dragging in a visible browser.
</output>
