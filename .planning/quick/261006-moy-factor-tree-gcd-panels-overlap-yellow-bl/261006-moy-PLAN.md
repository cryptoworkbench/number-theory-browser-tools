---
phase: quick-261006-moy
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Factor Tree/factor-tree.html
  - .planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-probe.js
  - .planning/quick/261006-l6v-add-redo-and-undo-buttons-to-the-number-/undo-probe.js
  - .planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-day.png
  - .planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-night.png
autonomous: true
requirements: [QUICK-MOY-01, QUICK-MOY-02, QUICK-MOY-03, QUICK-MOY-04]

estimate:
  tokens: 170000
  raw_tokens: 170000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Dropping a Factor Tree panel on another panel's right (gcd) half no longer merges anything: two separate panels remain, the left holding a = (a/g) × g with its g branch on the right, the right holding b = g × (b/g) with its g branch on the left, each tree complete with its own copy of the g sub-tree (D-01)"
    - "Before the panels overlap, the left panel turns yellow (--role-active tint) and the right panel blue (--role-input tint); only then does the right panel slide left until its g sub-tree lies exactly on the left panel's g sub-tree (shared circle centres within 1px), and the region where the two panels overlap is green (--role-result tint), painted explicitly, in both day and night themes, with every circle, line and label of both trees readable on top (D-02, D-03)"
    - "The combined pair is one glued unit: it occupies one slot of the composition/factorization area (it wraps and reflows as one), and whenever either tree changes shape (fold, unfold, mirror) the right panel follows frame by frame so the g sub-trees stay on top of each other; folding or mirroring a circle of the g sub-tree in either panel does the same to its copy in the other panel, as one undo step (D-04)"
    - "Separate first removes the yellow, blue and green colouring, then physically slides the panels apart, and ends with two ordinary standalone panels (drag grip, normal background, same trees and mirror order as today's split, every circle open, no highlight) (D-05)"
    - "Everything the old gcd overlap supported still works for the pair: × removes the pair; Undo/Redo restores a pair exactly (joined, tinted, aligned, same folds and mirrors) including mid-join and mid-separate; Venn Diagram's ?a=&b= deep link places a pair that is not an undo step; Balanced-mode shapes; the equation lines a = …, b = …, gcd(a, b) = g and the msgGcd / msgCoprime / msgSplit messages; a language switch relabels everything without resetting the pair; reduced motion skips every animation; no new user-visible string; assets/ untouched (D-06)"
    - "Every gate that passed at 2fd5962 still passes (i18n-check all modes, shadow-check --all, l6v undo probe 31 with its ftpair scenarios updated to the pair, pl0 29, edj 9, kaz known-failure set unchanged), the new MOY probe passes, and no colour literal, black/white colour keyword or markup-string assignment is added to the page (D-06)"
  artifacts:
    - path: "Factor Tree/factor-tree.html"
      provides: "gcd pair: buildGcdPair, alignPair, tweenJoin, separatePair, updatePairEquation, twin-synced fold/mirror, pair encode/decode, .tree-pair CSS with --pair-a-bg/--pair-b-bg/--pair-ab-bg"
      contains: "--pair-ab-bg"
    - path: ".planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-probe.js"
      provides: "headless-Chrome regression probe (drag and link modes) over a 127.0.0.1 http.server"
      contains: "MOY-PROBE PASS"
    - path: ".planning/quick/261006-l6v-add-redo-and-undo-buttons-to-the-number-/undo-probe.js"
      provides: "ftpair scenarios P1-P3 retargeted from the single overlap card to the glued pair"
      contains: "tree-pair"
    - path: ".planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-day.png"
      provides: "day-theme screenshot of a joined pair for the human check"
    - path: ".planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-night.png"
      provides: "night-theme screenshot of a joined pair for the human check"
  key_links:
    - from: "Factor Tree/factor-tree.html overlapViews() and the ?a=&b= load path"
      to: "buildGcdPair(a, b, true)"
      via: "the drop on the gcd half and the deep link both build the pair in the target's slot"
      pattern: "buildGcdPair\\("
    - from: "Factor Tree/factor-tree.html placeTree(view)"
      to: "alignPair(view.gcdPair)"
      via: "every tween frame of either half re-aligns the right panel (the glue)"
      pattern: "alignPair\\("
    - from: "Factor Tree/factor-tree.html mirrorBranch()/toggleFold()"
      to: "the twin node in the other half (P.twin)"
      via: "same action applied to the copy inside the same trackWork gesture"
      pattern: "\\.twin\\.get\\("
    - from: "Factor Tree/factor-tree.html encodeView()/decodeView()"
      to: "buildGcdPair(a, b, false, bal)"
      via: "a pair snapshot {a, b, bal, folds, presses} restores a joined, tinted, aligned pair"
      pattern: "buildGcdPair\\([^)]*false"
---

<objective>
Factor Tree's gcd overlap becomes two overlapping panels instead of one merged panel.

Decisions, taken from the user's request (verbatim intent) and the orchestrator's code findings:
- D-01: Dropping a panel on another panel's right "gcd(a, b)" half no longer merges the trees. The two panels stay two panels, each holding its own tree in the gcd-facing shape: left a = (a/g) × g with the g branch on its right, right b = g × (b/g) with the g branch on its left. No node is deleted.
- D-02: Before they overlap, the left panel becomes yellow and the right panel blue (site convention: yellow = --role-active, blue = --role-input, green = --role-result, as in Equivalence Wheel's --slot-a/--slot-b/--slot-sum).
- D-03: The right panel then slides left until its g sub-tree lies exactly on the left panel's g sub-tree; the overlapping part is green. Green is painted explicitly as an intersection layer (never blend modes), so it is green in both themes; trees stay readable on top.
- D-04: Once combined, the panels move together as if glued: one layout slot in the area, and when either tree's layout changes the right panel follows so the g sub-trees stay superimposed; fold/mirror on the shared g sub-tree acts on both copies.
- D-05: Separate removes the yellow/blue (and green) colouring, then physically slides the panels apart, ending in two ordinary standalone panels as today.
- D-06: Everything else keeps working: remove, undo/redo, Venn deep link, Balanced mode, equation + messages, language relabel without reset, aria labels, reduced motion. No new strings (existing keys removeOverlapLabel, splitOverlap, splitOverlapLabel, msgGcd, msgCoprime, msgSplit still read correctly; assets/i18n/factor-tree.js has no "merge" wording, so no copy changes). assets/nt-layout.js is not touched (Venn Diagram uses buildOverlapTree).

Claude's discretion (documented choices):
- The pair is not draggable. In this tool a card drag never repositions anything; it only multiplies with, or overlaps on, a drop target, and a pair has no defined product. "Glued" is delivered as: one flex slot (the pair wraps/reflows as one) plus frame-by-frame realignment whenever a tree changes. The old merged card was not draggable either.
- One pair-level equation block under the two panels (the three lines the old card showed). Per-panel equations would collide in the overlap.
- The Separate button sits at the left panel's top-left and the pair's × at the right panel's top-right, which are the outer corners of the joined pair. The left panel's own × is dropped.
- The tints are page-local aliases on .tree-pair built only from var()/color-mix() with var(--surface), so they are opaque. palette.css is not touched because its *-soft tokens are translucent and unsuitable for stacked panels.

Purpose: the user wants the gcd to be read as two physical panels overlapping, where yellow ∩ blue = green, instead of as one merged tree.
Output: the reworked gcd interaction in Factor Tree/factor-tree.html, a new headless probe, the l6v probe's pair scenarios retargeted, and two screenshots for the human check.

## Source coverage audit

| SOURCE | ID | Item | Task | Status |
|--------|----|------|------|--------|
| GOAL | — | Panels overlap (yellow / blue / green) instead of merging; glued; Separate uncolours and slides apart | 1, 2, 3 | COVERED |
| CONTEXT | D-01 | Two panels, gcd-facing trees, nothing merged | 1 | COVERED |
| CONTEXT | D-02 | Left yellow, right blue, before the overlap | 1 | COVERED |
| CONTEXT | D-03 | Slide until g lies on g; green intersection, both themes, readable | 1 (built), 2 (day theme + edge shapes) | COVERED |
| CONTEXT | D-04 | Glued unit: one slot + follows every layout change; twin-synced fold/mirror | 1 (one slot), 2 (glue + sync) | COVERED |
| CONTEXT | D-05 | Separate: uncolour, slide apart, two standalone panels | 1 | COVERED |
| CONTEXT | D-06 | Remove, undo/redo, deep link, Balanced, equation/messages, i18n relabel, aria, reduced motion, no new strings, nt-layout untouched | 1, 2, 3 | COVERED |
| ORCH | — | Check help/intro copy for "merging" wording | 3 (asserted: assets/ unchanged; no such copy exists) | COVERED |
| ORCH | — | "Pair draggable as a unit" suggestion | — | DISCRETION: not draggable (see above); glue delivered as one slot + realignment |
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@Factor Tree/factor-tree.html
@assets/palette.css
@.planning/quick/261006-l6v-add-redo-and-undo-buttons-to-the-number-/undo-probe.js

<interfaces>
Grounded facts (read from the tree at 2fd5962; line numbers approximate). These are EXISTING names, listed so the executor can find them.

Factor Tree/factor-tree.html — CSS
- `.work-area` (≈213): flex, wrap, justify-content:center, align-items:flex-start, gap 12px. #workArea's first child is `p#workHint`, so `workArea.children[idx + 1]` is the DOM slot of `views[idx]`.
- `.tree-card` (≈234): position:relative, background var(--surface), border 1px var(--panel-border), radius var(--radius-card), padding 28px 8px 10px, max-width:100%, cursor:grab; `.palette-item.is-new, .tree-card{ animation:cardIn .25s }` (≈194, cardIn scales from .6, so it uses a transform). Old overlap-card cursor rule at ≈265. `.tree-split` (Separate pill, absolute top-left) ≈266-289, `.tree-remove` (absolute top-right) ≈243, `.tree-grip` ≈321. `.node-circle.shared` (≈503) gives the g circle a --role-active ring. Reduced-motion block ≈508. `.wrap` is position:relative; z-index:2.

Factor Tree/factor-tree.html — script (IIFE)
- Imports: `isPrime, primeFactors, randomInt` (NT.core); `easeInOutCubic, svgEl` (NT.svg); `BALANCED_MAX_N, assignTreeX, buildFactorTree, buildOverlapTree, flattenTree` (NT.layout); `onLangChange, translate` (NT.i18n).
- Constants ≈697: MIRROR_MS 450, FOLD_MS 400, OVERLAP_MS 700, OVERLAP_HOLD_MS 250.
- `equationLines(view)` ≈762 has an overlap branch producing `a = (a/g) × g`, `b = g × (b/g)`, `gcd(a, b) = g` (lines omitted when a === g / b === g).
- `cardMetrics(widest, fullLeaves, maxDepth)` ≈1061 (uses workArea.clientWidth). `cardShell(withGrip)` ≈1082 returns {card, svg, eqEl, removeBtn, grip}. `newView(shell, m, fields)` ≈1111 (defaults include `overlap:null, locked:null`). `drawNodes(view, nodes, edges, maxDepth, m, foldedOf)` ≈1126. `applyTargets` ≈1168. `buildCard(n, prebuilt)` ≈1178.
- Old overlap machinery to replace: `cloneTree(node, twinOf)` ≈1226 (copy → real Map; keep, it builds the right panel's g copy), `overlapGraph` ≈1235, `buildOverlapCard(a, b, animate, balanced)` ≈1248 (animate true / false / 'split'), `splitButton()` ≈1308 (keep), `detachTree` ≈1326 / `standaloneView(top)` ≈1333 / `splitHalves(o)` ≈1341 (keep the first two; the coprime rule of the third moves into the pair), `splitOverlap(view)` ≈1345, `mergeOverlap(view)` ≈1381, `relabelRemove(view)` ≈1410, `killView` ≈1433, `removeTree` ≈1439, `placeOverlap(a, b, animate)` ≈1473.
- Undo/redo: `encodeView(view)` ≈1495 returns an ARRAY of entries (a mid-split overlap encodes as two plain trees with all flags false); `snapshotWork`, `decodeView(entry)` ≈1533 (`entry.tree` = plain card, else `{a, b, bal, folds?, presses?}`; pressed circles rebuilt with `reverseBranch` + aria-pressed), `restoreWork(json)` ≈1564 (appends each decoded `view.card` to #workArea, then `setMessage(null)`), `trackWork(gesture)` ≈1590.
- `overlapViews(source, target)` ≈1710 (placed-earlier panel goes left; result takes the target's slot; source removed). `armMirrors` ≈1730 / `armFolds` ≈1759 skip `view.locked` nodes and wire `trackWork(()=> mirrorBranch(view, nv))` / `trackWork(()=> toggleFold(view, nv))`. `overlapShadow` ≈1826 + its branch in `layoutTree` ≈1834. `finalTargets` ≈1854 has a merged-state twin redirect. `updateEquation(view)` ≈1913 (overlap rule: ignore primes folded on their P = P × 1 split; overlap messages msgGcd {a,b,g} / msgCoprime {a,b}). `toggleFold(view, nv)` ≈1941, `mirrorBranch(view, nv)` ≈2002, `placeTree(view)` ≈2018, `animateTree(view, phases, onDone)` ≈2088 (token = ++view.tweenToken; rAF + settle setTimeout(ms + 60); reduced motion applies all phases at once).
- Drag: `cardAt(x, y)` ≈2163 skips overlap cards; `markTarget` ≈2174 toggles `.is-drop-target` on every `views[i].card`; `halfAt` ≈2199 (x < centre → 'mul', else 'gcd'); `onDragEnd` ≈2259 calls `overlapViews` for 'gcd'; work-area pointerdown ≈2321 starts a drag only for a `.tree-card` that is some `views[i].card` and not an overlap.
- `onLangChange` ≈2403: `views.forEach(v=>{ syncControls(v); relabelRemove(v); })`. Load handler ≈2465: `readPairParams()` → `applyMode('balanced')`, `ensurePaletteItem` × 2, `placeOverlap(a, b, true)` (not wrapped in trackWork).

NT.layout.buildOverlapTree(a, b, {balanced}) (assets/nt-layout.js ≈209, read-only) returns `{ g, G, a: side, b: side }`, side = `{ root, rest, top }`. G.shared = true. G is built at depth 1 unless a === b === g (then depth 0). side for x === g is `{ root:null, rest:null, top:G }`, so a number equal to g keeps G at depth 1, and vertical alignment of the two g sub-trees is automatic. a's root children are [rest, G], b's root children are [G, rest]. Both sides reference the SAME G object, so the right panel must swap in a clone. A prime node has children [1, P] (kind 'one', 'prime-leaf'). g = 1 gives G = {value 1, kind 'one'}.

Colour arithmetic (checked): at 28% over var(--surface), --role-active gives R > G > B, --role-input gives B > G > R and --role-result gives G > B > R, in BOTH themes. A probe can therefore assert hue by channel order.

Gates passing at 2fd5962: i18n-check `--all`, `--switcher-present --all`, `--api` (399), `--persistence` (248), `--smoke`; shadow-check `--all`; l6v `undo-probe.js` ft = 18, ftpair = 3, all = 31; pl0 `shared-palette-probe.js` = 29; edj `enter-probe.js` = 9; kaz `palette-probe.js` failing set = `D1 D2 P11 P12 P13 P4 P8 P9 ` (pre-existing). The j2e fold-probe and hz0 mirror-probe already fail at baseline and are NOT gates. google-chrome is at /usr/bin/google-chrome; python3 is available. The l6v probe runs in ~3 s.
</interfaces>
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Tracer — drop on the gcd half builds two panels that tint, slide into a green overlap, and Separate un-tints and slides them apart</name>
  <files>Factor Tree/factor-tree.html, .planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-probe.js</files>
  <precondition>google-chrome and python3 are on PATH (the probe serves a scratch copy over 127.0.0.1 and drives headless Chrome).</precondition>
  <read_first>Factor Tree/factor-tree.html (≈180-520 CSS, ≈1038-1480 building/overlap/split, ≈1481-1575 undo/redo, ≈1698-1723 overlapViews, ≈1823-1870 layout/targets, ≈1910-1936 updateEquation, ≈2015-2151 placeTree/animateTree, ≈2153-2332 drag, ≈2403-2483 lang + load); .planning/quick/261006-l6v-add-redo-and-undo-buttons-to-the-number-/undo-probe.js (whole file: it is the scaffold to copy); Equivalence Wheel/equivalence-wheel.html lines 15-27 (the --slot-a/--slot-b/--slot-sum alias comment to mirror)</read_first>
  <behavior>
    - T1 (drag mode, ?lang=en): add 12 and 18 to the palette, click each to place a panel (12 first), drag 18's grip to the point at 75% of 12's panel width. #workArea then has exactly one direct child .tree-pair, whose .tree-pair-row holds exactly two .tree-card: the first's root label is 12, the second's 18. Neither has a .tree-grip. Only the first has a .tree-split and only the second a .tree-remove. There is one .pair-equation. Each panel has exactly one .node-circle.shared, and the g sub-tree labels (6, 2, 3) appear in BOTH panels, so nothing was merged.
    - T2 (sequence): right after the drop the pair is not .is-tinted and the panels do not overlap (second.left ≥ first.right). About 150 ms after FOLD_MS the pair is .is-tinted and the panels still do not overlap (colour comes before the overlap). After ~2500 ms the pair is joined.
    - T3 (colours, night theme): the left panel's computed background-color equals a scratch element styled background-color: var(--pair-a-bg) inside the pair, with R > B. The right panel's equals var(--pair-b-bg), with B > R. The .pair-lens equals var(--pair-ab-bg), with G > R and G > B, and it is visible (opacity 1, not display:none). Parse both rgb()/rgba() and color(srgb …) serialisations.
    - T4 (geometry, after scrolling the pair into view): the two .node-circle.shared centres agree within 1 px on x and y. The second panel's left edge is left of the first panel's right edge. The lens rect is within 2 px of the intersection of the two panel rects. elementFromPoint at the shared centre lies inside a .tree-svg. elementFromPoint 4 px inside the lens's bottom-left corner is the lens itself.
    - T5 (text): .pair-equation lines read "12 = 2 × 6", "18 = 6 × 3", "gcd(12, 18) = 6"; #message equals the en msgGcd for a=12, b=18, g=6 (from the catalog).
    - T6 (Separate): click .tree-split. About 150 ms later the pair has lost .is-tinted while the panels still overlap (colouring is removed first). After ~2000 ms there is no .tree-pair, two .tree-card with roots 12 and 18 each carrying a .tree-grip, no .node-circle.shared, each panel's computed background equal to a scratch var(--surface), and #message equals the en msgSplit.
  </behavior>
  <action>
Implements D-01, D-02, D-03, D-05 end-to-end, plus the D-04 one-slot glue and the D-06 plumbing the drop gesture needs (the drop runs inside trackWork, so encode must already work).

CSS (per D-02/D-03), in the page `<style>`:
- Delete the old overlap-card cursor rule at ≈265.
- Add a commented `.tree-pair` block. On `.tree-pair` declare three page-local aliases built only from var()/color-mix() over var(--surface): `--pair-a-bg` from var(--role-active), `--pair-b-bg` from var(--role-input), `--pair-ab-bg` from var(--role-result). Start at 28% and tune only for legibility. Use no hex/rgb/hsl and no black/white keyword. Mirror the Equivalence Wheel alias comment: left yellow, right blue, overlap green, and the overlap is painted as its own layer rather than blended.
- `.tree-pair`: display:flex, flex-direction:column, align-items:center, max-width:100%, and an opacity-only entry keyframe. Use no transform, because alignment measures client rects.
- `.tree-pair-row`: position:relative, isolation:isolate, display:flex, align-items:flex-start, gap:12px.
- `.tree-pair .tree-card`: flex:none, max-width:none, cursor:auto, animation:none, and a .25s transition on background-color and border-color.
- `.tree-pair.is-tinted .pair-a`: background-color var(--pair-a-bg), border-color var(--role-active). `.tree-pair.is-tinted .pair-b`: var(--pair-b-bg) and var(--role-input).
- `.pair-lens`: absolute, z-index 1, pointer-events none, background var(--pair-ab-bg), radius var(--radius-card), opacity 0 with a .25s opacity transition, and opacity 1 under `.tree-pair.is-tinted`.
- Layering inside the row: `.tree-pair .tree-svg` gets position:relative and z-index 2. `.tree-pair .tree-split, .tree-pair .tree-remove` get z-index 3. The cards stay non-stacking (no z-index, transform, filter or opacity < 1 on them), so both svgs paint above both backgrounds and the lens. The left tree's a→g edge and its g copy stay visible under the right panel.
- Reduced-motion block: `.tree-pair` gets animation:none, and `.tree-pair .tree-card` and `.pair-lens` get transition:none.

Model (D-01): replace the one-card overlap builder at ≈1248 and its helper at ≈1235 with `buildGcdPair(a, b, animate, balanced)`.
- `balanced` defaults to `mode === 'balanced'`.
- Call t = buildOverlapTree(a, b, {balanced}).
- Clone t.G with cloneTree into a fresh Map. P.twin is one Map holding BOTH directions (each G node ↔ its copy).
- Left top = t.a.top. Right top = t.b.root with its G child replaced by the clone, or the clone itself when b === g.
- Shared metrics: assignTreeX each top with its own counter and get maxDepth over both via flattenTree. Then m = cardMetrics(Math.max(a, b), leavesL + leavesR + 1, maxDepth). The +1 keeps the apart pair inside the area as the old card did.
- Build each half with newView(cardShell(false), m, {...}). Fields: n = top.value, root = top, topFactors = primeFactors(top.value), leafCount, gcdPair = P, locked = new Set([that side's root].filter(Boolean)), rest = that side's rest (or null), shared = its G or the copy, fresh = new Set().
- In newView's defaults, replace the overlap field with `gcdPair:null`.
- Draw each half: flattenTree(top), then drawNodes with foldedOf = the node has a prime-leaf child (primes stay folded on P = P × 1, as before). Then layoutTree, applyTargets(finalTargets), armMirrors, armFolds, syncControls, placeTree.
- Add class pair-a to the left card and pair-b to the right card.

DOM:
- P.card = div.tree-pair. Inside it, P.row = div.tree-pair-row holds the left card, the right card and P.lens = div.pair-lens (aria-hidden="true").
- After the row comes P.eqEl = div.equation.tree-equation.pair-equation.
- Remove each half's own eqEl from its card, and remove the left card's own ×.
- Put splitButton() first in the left card as P.splitBtn. The right card's × becomes P.removeBtn.
- Wire P.splitBtn → trackWork(()=> separatePair(P)) and P.removeBtn → trackWork(()=> removeTree(P)).
- P also carries a, b, g, balanced, halves [L, R], join 0, mx 0, myL 0, myR 0, state 'joining', live true, tweenToken 0, eqShown false.

alignPair(P) (D-03):
- No-op unless P.live and P.card.isConnected.
- For each half, take the nodeView of half.shared. Its centre relative to P.row is (svgRect.left − rowRect.left + nv.px, svgRect.top − rowRect.top + nv.py), with svgRect and rowRect from getBoundingClientRect.
- Subtract the margins applied now (P.mx on the right card's margin-left; P.myL / P.myR as margin-top) to get natural positions.
- Compute mx* = xL − xR(natural) and dy* = yL(natural) − yR(natural).
- Set the right card's margin-left to P.join × mx*. Put P.join × |dy*| as margin-top on whichever card's g sits higher, and 0 on the other. Store the values back into P.
- Then size P.lens to the intersection of the two cards' layout boxes (offsetLeft/offsetTop/offsetWidth/offsetHeight; the row is their offsetParent), inset by 1 px so both borders stay visible. Use display none when the intersection is empty.
- Every path that inserts a pair into #workArea calls alignPair(P) right after insertion.

Join (D-02 then D-03), for animate === true:
- Each half starts with every descendant collapsed onto its top, as the old builder did, and grows with animateTree(half, [{ms: FOLD_MS, targets: finalTargets}]).
- A separate pair-level chain runs on setTimeout steps guarded by P.live and its own captured ++P.tweenToken. It is independent of the halves' tween tokens, so a fold during the grow cannot stall it.
- After FOLD_MS it adds is-tinted to P.card. After a further OVERLAP_HOLD_MS it runs tweenJoin(P, 1, OVERLAP_MS, done). done sets P.state = 'joined' and calls updatePairEquation(P).
- tweenJoin(P, to, ms, onDone) eases P.join from its current value with easeInOutCubic on requestAnimationFrame and calls alignPair every frame. It has a settle setTimeout(ms + 60) like animateTree and is token-guarded. Under prefers-reduced-motion it sets the value, aligns and finishes at once.
- animate === false, and reduced motion, produce the joined end state directly: is-tinted, join 1, state 'joined', equation.

Equation and message (D-06):
- equationLines keys its pair branch on `view.halves` (same three lines).
- updateEquation(view) for a half delegates to updatePairEquation(view.gcdPair). That function acts only when state === 'joined'. It applies the old overlap rule across both halves: primes folded on their split don't count. When everything is open it pops P.eqEl (popEquation) once and sets msgGcd, or msgCoprime when g === 1. When something is folded it clears P.eqEl with textContent = '' or replaceChildren(), not the markup property.

Separate (D-05): separatePair(P).
- Return if P is not live or is already separating.
- Set state 'separating', ++P.tweenToken (this cancels a pending join step), disable P.splitBtn and P.removeBtn, and remove is-tinted (colours and lens fade).
- After OVERLAP_HOLD_MS run tweenJoin(P, 0, OVERLAP_MS, finish).
- finish: the trees are [L.root, R.root], except when g === 1, where each half's rest is used (the coprime rule the old split helper had). Build left = standaloneView(...) and right = standaloneView(...); these keep the current mirrored child order, open every fold and drop the highlight, as today.
- Insert both before P.card, killView(P), views.splice(at, 1, left, right), syncWorkState(), setMessage('factorTree.msgSplit', {a, b}, true), and focus right.removeBtn.
- Under reduced motion, finish at once.
- Delete the old split routine at ≈1345.

Plumbing:
- overlapViews builds buildGcdPair(p.first.n, p.second.n, true) into the target's slot. P is exactly one entry of views and one child of #workArea, so the children[idx + 1] arithmetic still holds. It then calls alignPair and scrollIntoView.
- The load path's placement uses buildGcdPair(a, b, true) and then alignPair.
- killView(view) also sets live = false and bumps tweenToken on both halves when view.halves.
- cardAt skips any view with halves, replacing the old overlap test.
- The work-area pointerdown never finds a half in views. Keep it that way: halves have no grip and are not drag sources.
- relabelRemove gets a pair branch (P.removeBtn ← removeOverlapLabel {a, b}; P.splitBtn ← splitOverlapLabel and its text ← splitOverlap). onLangChange runs syncControls on each half of a pair and relabelRemove on the pair.
- encodeView(P): when separating, return the two trees separatePair would build, as plain entries with all flags false (same shape as the old mid-split encoding). Otherwise return one entry {a, b, bal, folds, presses} listing every nodeView of the left half, then the right half, in Map order.
- decodeView: an {a, b} entry → buildGcdPair(a, b, false, bal). When the folds length matches, set each nv.folded, and for every pressed nv that has a title apply reverseBranch plus aria-pressed (as today). Then run layoutTree, applyTargets(finalTargets), syncControls and placeTree per half, and finally updatePairEquation.
- restoreWork calls alignPair after appending a pair.

Delete the now-dead single-card machinery:
- the twin-merge routine called at the end of the old merge animation (≈1381);
- the hidden-root overlap shadow (≈1826) and its branch in layoutTree, so halves lay out as ordinary trees;
- the merged-state twin redirect in finalTargets (≈1856);
- the merged flag.

Rewrite the two section comments (overlap / separate) to describe the pair. Do not name the removed routines in any new comment. Do not touch assets/.

Probe (new file pair-probe.js): copy undo-probe.js's scaffolding: loadCatalog, the in-page helpers and scenario/ok/eq/wait, buildSite, writeProbePage, freePort, waitForServer, runChrome, runPage, main.
- Rename the output to pre#moy-out and the final line to `MOY-PROBE PASS (N scenarios)` / `MOY-PROBE FAIL (...)`.
- PAGES: drag (?lang=en) and link (?a=12&b=18&lang=en), each with an exact expected count. Usage is `node pair-probe.js [drag|link|all]`.
- Raise --virtual-time-budget (e.g. 120000) so the waits fit.
- A drop helper must target a point at 75% of the target panel's width; the gcd half is x ≥ centre.
- Implement T1-T6 in drag mode. link mode may hold zero scenarios until Task 2.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && Q='.planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl' && F='Factor Tree/factor-tree.html' && node "$Q/pair-probe.js" drag | tail -1 | grep -Eq '^MOY-PROBE PASS \([0-9]+ scenarios\)$' && ! grep -v '^[[:space:]]*//' "$F" | grep -Eq 'mergeOverlap|buildOverlapCard|overlapShadow|is-overlap|view\.merged|view\.overlap\b' && grep -Fq -- '--pair-ab-bg' "$F" && grep -Fq 'function buildGcdPair(' "$F" && grep -Fq 'function alignPair(' "$F" && grep -Fq 'function separatePair(' "$F" && node .planning/quick/261006-l6v-add-redo-and-undo-buttons-to-the-number-/undo-probe.js ft | tail -1 | grep -Fxq 'L6V-PROBE PASS (18 scenarios)' && node .planning/phases/06-multi-language-support/i18n-check.js --all >/dev/null && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all >/dev/null && git diff --quiet 2fd5962 -- assets/ && echo MOY-T1-OK</automated>
  </verify>
  <done>Dropping 18 on 12's gcd half yields two panels in one .tree-pair. They turn yellow and blue first, then slide until the two 6-branches coincide within 1 px, and the intersection is green with both trees readable. Separate un-tints first, slides apart and leaves two standalone panels with grips. The equation and messages match the old card's. Undo snapshots of a pair encode and decode. The single-card merge machinery is gone, assets/ is unchanged, and the drag-mode probe passes T1-T6.</done>
</task>

<task type="auto">
  <name>Task 2: Glue and interactions — frame-by-frame realignment, twin-synced fold/mirror, undo/redo, remove, language, deep link and edge shapes</name>
  <files>Factor Tree/factor-tree.html, .planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-probe.js</files>
  <read_first>Factor Tree/factor-tree.html (the Task 1 pair code, plus placeTree ≈2018, toggleFold ≈1941, mirrorBranch ≈2002, armMirrors/armFolds ≈1730-1796, decodeView/restoreWork, the load handler); .planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-probe.js</read_first>
  <behavior>
    - E1 glue (drag mode): build the pair (72, 60) (g = 12, a/g = 6). Fold the 6 circle of the left panel with its badge. Sampled about 200 ms into the tween and again after it ends, the shared centres stay within 1 px, the left panel ends narrower than before, and the lens still matches the intersection within 2 px.
    - E2 mirror sync: click the left panel's shared 12 circle. Both panels' shared circles get aria-pressed="true", and the x-ordered labels of the g sub-tree read the same in both panels. Centres stay within 1 px after the tween. One work Undo returns both to aria-pressed="false".
    - E3 fold sync: fold the RIGHT panel's shared circle via its badge. Both shared badges show aria-expanded="false", the panels stay aligned, and .pair-equation empties. Unfolding restores both and the equation.
    - E4 undo/redo: fold something, then Clear. Undo brings the pair back joined at once: .is-tinted, aligned within 1 px, equation shown, the same aria-expanded/aria-pressed lists per panel. Redo empties the area; undo again. Separate then Undo before the slide ends leaves exactly one .tree-pair with two panels and no stray panel after 2200 ms.
    - E5 remove: the pair's × leaves no .tree-pair and none of its panels. Undo restores it aligned.
    - E6 not draggable: pointerdown/pointermove/pointerup on a half panel's background never creates .drag-ghost or body.is-dragging. A standalone 5 panel dragged to 75% of the pair's right panel leaves the pair unchanged (roots 72, 60) and composes nothing.
    - E7 language: setLang('nl') gives .tree-split text = nl splitOverlap, the × aria-label = nl removeOverlapLabel {a:72, b:60}, and a fold badge label in nl, while the pair stays tinted, aligned and folded exactly as before. Then setLang('en').
    - E8 day theme: with data-theme="day" on html, after 400 ms the channel orders of T3 hold again and the lens equals var(--pair-ab-bg). Then restore the theme.
    - E9 edge shapes, each aligned within 1 px: (6, 12) where a divides b; (8, 15) coprime, where the shared circles are the 1s, the equation includes "gcd(8, 15) = 1" and #message equals en msgCoprime; (12, 12) full overlap, where elementFromPoint at the centres of .tree-split and .tree-remove hits those buttons above the lens.
    - L1 (link mode, ?a=12&b=18): exactly one .tree-pair, and work Undo is disabled (the deep link is not an undo step). After 2500 ms it is joined, tinted and aligned within 1 px.
    - L2 (link mode): Separate gives two standalone panels [12, 18]; Undo restores a joined pair with the same Balanced shape.
  </behavior>
  <action>
Implements D-04 and the rest of D-06.

Glue (D-04):
- At the end of placeTree(view), when view.gcdPair, call alignPair(view.gcdPair). Every frame of any tween of either half then re-aligns the right panel: grow, fold, unfold, mirror, and the restore path. The pair-level tweenJoin keeps aligning on its own frames.
- Nothing else may set the panels' margins.

Twin sync (D-04):
- Give mirrorBranch(view, nv, fromTwin) and toggleFold(view, nv, fromTwin) a third parameter.
- After acting on view, when view.gcdPair is set, fromTwin is falsy and P.twin.get(nv.node) exists, perform the same action on the other half's nodeView for that twin node, with fromTwin = true, synchronously. Both changes then land in the same trackWork gesture (one undo step) and both tweens start together.
- Before toggling the twin, check that its folded/pressed state equals the source's pre-action state, so a desync can never invert the pair.
- The armMirrors/armFolds handlers keep calling the two-argument form.

Edge shapes (D-03):
- Keep buildOverlapTree's node depths. A number equal to g has its g circle at depth 1, so its panel shows a one-level band above it and the g sub-trees align vertically by construction. alignPair's dy handling stays as a safety net.
- a === b gives full overlap; the Separate pill and × stay clickable via their z-index.
- Coprime pairs overlap on the 1 circles.
- Balanced shapes come from the balanced flag; decode uses the recorded flag.

Remove and keyboard (D-06):
- The pair's × removes both panels through removeTree(P). Focus moves as today, so P.removeBtn serves as the focus target when the next view is a pair.
- × and Separate are disabled while separating.
- Fold badges and mirror circles inside the halves keep their translated aria labels through syncControls.

Language (D-06):
- onLangChange relabels the pair (Task 1) without touching state.
- Equation lines are notation and need no relabel. The message re-renders through renderMessage as today.

Deep link (D-06): the ?a=&b= path still runs applyMode('balanced'), ensurePaletteItem for both numbers, then builds the pair with animation outside trackWork, so it is never an undo step.

Probe: extend pair-probe.js with E1-E9 (drag mode; reset the area between scenarios with Clear) and L1-L2 (link mode). Set each mode's exact expected count.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && Q='.planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl' && F='Factor Tree/factor-tree.html' && node "$Q/pair-probe.js" all | tail -1 | grep -Eq '^MOY-PROBE PASS \([0-9]+ scenarios\)$' && awk '/function placeTree\(/,/^  }$/' "$F" | grep -q 'alignPair(' && grep -Eq 'function toggleFold\(view, nv, fromTwin\)' "$F" && grep -Eq 'function mirrorBranch\(view, nv, fromTwin\)' "$F" && grep -Fq '.twin.get(' "$F" && node .planning/quick/261006-l6v-add-redo-and-undo-buttons-to-the-number-/undo-probe.js ft | tail -1 | grep -Fxq 'L6V-PROBE PASS (18 scenarios)' && node .planning/phases/06-multi-language-support/i18n-check.js --all >/dev/null && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all >/dev/null && git diff --quiet 2fd5962 -- assets/ && echo MOY-T2-OK</automated>
  </verify>
  <done>The pair stays glued (g on g within 1 px) through every fold, unfold and mirror of either panel, frame by frame. Shared-branch actions apply to both copies as one undo step. Undo/redo, remove, the language switch, day/night, the deep link and the divides/coprime/equal shapes all behave as specified. The probe passes in drag and link modes.</done>
</task>

<task type="auto">
  <name>Task 3: Regression gates, l6v pair scenarios retargeted, screenshots for the human check</name>
  <files>.planning/quick/261006-l6v-add-redo-and-undo-buttons-to-the-number-/undo-probe.js, .planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-day.png, .planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/pair-night.png</files>
  <read_first>.planning/quick/261006-l6v-add-redo-and-undo-buttons-to-the-number-/undo-probe.js (ftpairRun ≈497-551 and its helpers ≈118-150)</read_first>
  <action>
Implements D-06's "every gate still passes".

Retarget l6v ftpairRun (P1-P3) from the single overlap card to the glued pair, keeping expected = 3 and the scenario intent:
- Its counting helper counts `#workArea .tree-pair` (one pair = two `.tree-card`). The "exactly one card / only the overlap card" checks become two panels inside one pair.
- P2 reads the equation from `#workArea .pair-equation`. It keeps toggling the first folded badge of cards()[0], which is the left panel, and comparing that panel's aria-expanded list after Clear + Undo.
- P3 keeps clicking cards()[0]'s .tree-split, because the Separate pill now lives on the left panel. Its wait stays ≥ 2200 ms.
- Change nothing else in that file.

Screenshots (for the human check): run google-chrome headless with a throwaway --user-data-dir under the session scratch dir, --virtual-time-budget=6000, a window tall enough to show the composition/factorization area (e.g. 1280×1700), and --screenshot. The target is the page over file:// with ?a=72&b=60&lang=en&theme=day, written to pair-day.png in the quick directory, and the same with theme=night to pair-night.png. Afterwards remove the throwaway profile.

Run the full gate below. If the pl0/edj/kaz probes regress, fix the page, not the probe.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && Q='.planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl' && F='Factor Tree/factor-tree.html' && node "$Q/pair-probe.js" all | tail -1 | grep -Eq '^MOY-PROBE PASS \([0-9]+ scenarios\)$' && node .planning/quick/261006-l6v-add-redo-and-undo-buttons-to-the-number-/undo-probe.js all | tail -1 | grep -Fxq 'L6V-PROBE PASS (31 scenarios)' && node .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js | tail -1 | grep -Fxq 'PL0-PROBE PASS (29 scenarios)' && node .planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/enter-probe.js | tail -1 | grep -Fxq 'EDJ-PROBE PASS (9 scenarios)' && [ "$(node .planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js 2>&1 | grep -E 'FAIL [A-Z][0-9]+ ' | sed -E 's/^.*FAIL ([A-Z][0-9]+) .*/\1/' | sort -u | tr '\n' ' ')" = "D1 D2 P11 P12 P13 P4 P8 P9 " ] && node .planning/phases/06-multi-language-support/i18n-check.js --all >/dev/null && node .planning/phases/06-multi-language-support/i18n-check.js --switcher-present --all >/dev/null && node .planning/phases/06-multi-language-support/i18n-check.js --api | tail -1 | grep -q '^I18N-CHECK PASS api' && node .planning/phases/06-multi-language-support/i18n-check.js --persistence | tail -1 | grep -q '^I18N-CHECK PASS persistence' && node .planning/phases/06-multi-language-support/i18n-check.js --smoke | tail -1 | grep -q '^I18N-CHECK PASS smoke' && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all >/dev/null && git diff --quiet 2fd5962 -- assets/ && G="$(git diff -U0 2fd5962 -- "$F")" && D="$(printf '%s\n' "$G" | grep '^+' | grep -v '^+++')" && [ -n "$D" ] && [ "$(printf '%s\n' "$D" | grep -Eci '#[0-9a-f]{3,8}[;, )]|rgba?\(|hsla?\(')" = 0 ] && [ "$(printf '%s\n' "$D" | grep -c 'innerHTML')" = 0 ] && [ "$(printf '%s\n' "$D" | grep -Eci 'color-mix\([^;]*\b(black|white)\b')" = 0 ] && [ -s "$Q/pair-day.png" ] && [ -s "$Q/pair-night.png" ] && echo MOY-T3-OK</automated>
    <human-check>Open pair-day.png and pair-night.png, then the live page (Factor Tree/factor-tree.html in place). Place 72 and 60 and drag 60 onto 72's right half. Watch the panels turn yellow and blue before they slide together. Confirm the overlap reads green in both themes and every circle, line and label is legible. Fold the 6 and see the right panel follow. Press Separate and see the colours go first, then the panels part.</human-check>
  </verify>
  <done>Every pre-existing gate passes with the l6v pair scenarios retargeted. The MOY probe passes. No colour literal, black/white keyword or markup-string assignment was added. assets/ is unchanged. Both screenshots exist for the end-of-phase human check.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL → page | `?a=&b=` (from Venn Diagram) chooses the numbers of a pair at load |
| page → DOM | pair labels, equation lines and messages are written into the document |
| probe → local machine | the dev probe starts an http server and a headless browser |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-moy-01 | Tampering | ?a=&b= deep link → buildGcdPair | low | mitigate | readPairParams is unchanged (integer round-trip, 1..BALANCED_MAX_N, the pair (1, 1) rejected); a drop only pairs numbers of panels already under capFor(mode) |
| T-moy-02 | Tampering (script injection) | pair aria labels, Separate text, .pair-equation, #message | low | mitigate | text goes only through translate() + setAttribute/textContent and popEquation's createElement path; the Task 3 diff gate forbids any added markup-string assignment |
| T-moy-03 | Denial of service | per-frame alignPair layout reads | low | accept | bounded to two panels per pair per frame and only while a tween runs; every chain is token-guarded and stops on remove, Clear, undo or Separate |
| T-moy-04 | Elevation of privilege | pair-probe http server / screenshot runs | low | mitigate | python3 http.server bound to 127.0.0.1 serving a scratch copy and killed through its child handle; throwaway Chrome profiles, so the user's browser storage is untouched |
| T-moy-SC | Tampering | npm/pip/cargo installs | low | accept | no package installs: Node built-ins, the python3 standard library and the existing google-chrome only |
</threat_model>

<verification>
- Task 3's automated command is the phase gate. In one run it covers the MOY probe (drag + link), the l6v probe on all three pages (with the retargeted pair scenarios), pl0, edj, the kaz known-failure set, every i18n-check mode, shadow-check, the untouched assets/ tree and the colour-literal / markup-string / black-white diff checks against 2fd5962.
- The human check (end-of-phase) confirms the yellow → blue → slide → green reading and legibility in both themes from the two screenshots and the live page.
</verification>

<success_criteria>
- A gcd drop shows two panels: yellow left, blue right. They slide until the g sub-trees coincide within 1 px, and the overlap is green in day and night themes.
- The pair is one glued unit that follows every fold, unfold and mirror. Shared-branch actions act on both copies as one undo step.
- Separate un-tints first, then slides apart into two standalone panels.
- Remove, undo/redo (including mid-animation), the deep link, Balanced mode, equation/messages, the language switch and reduced motion all work. No new strings. assets/ is untouched.
- All gates listed in Task 3 pass.
</success_criteria>

<output>
Create `.planning/quick/261006-moy-factor-tree-gcd-panels-overlap-yellow-bl/261006-moy-SUMMARY.md` when done
</output>
