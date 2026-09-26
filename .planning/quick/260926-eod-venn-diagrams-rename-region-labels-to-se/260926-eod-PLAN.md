---
phase: quick-260926-eod
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Venn Diagrams/venn-diagrams.html
  - index.html
autonomous: true
requirements: [QUICK-VENN-SETNOTATION-01]

estimate:
  tokens: 60000
  raw_tokens: 60000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "The two-circle region dictionary reads exactly `Left \\ Right`, `Left ∩ Right`, `Right \\ Left` and the three-circle one reads exactly `A \\ (B ∪ C)`, `B \\ (A ∪ C)`, `C \\ (A ∪ B)`, `(A∩B) \\ C`, `(A∩C) \\ B`, `(B∩C) \\ A`, `A∩B∩C` — these two dictionaries stay the single source of truth feeding the SVG captions, the status messages, the region aria-labels and the placed-chip aria-labels (D-01)"
    - "The set-difference character rendered in the DOM is one literal ASCII backslash per label, not a swallowed escape — JS silently turns `'Left \\ Right'` into `Left  Right`, so every backslash is written doubled in source (D-01)"
    - "No element carrying class `region-label` and no element carrying class `product-value` has text containing the standalone word for exclusivity that the old dictionaries used, in either mode (D-01, D-04)"
    - "The two-circle side rows are composed by the existing `formatSegments` helper over the renamed region names, so with the default seed they read exactly `Left = 2 * 3 (Left \\ Right) * 5 (Left ∩ Right) = 30` and `Right = 7 (Right \\ Left) * 5 (Left ∩ Right) = 35`; the now-unused `formatSide` helper is deleted rather than left dead (D-01, D-04, D-05)"
    - "The three-circle number rows take their exclusive-part note from the renamed three-circle dictionary and keep their existing pairwise and centre notes, reading exactly `A = 2 (A \\ (B ∪ C)) * 7 (with B) * 11 (with C) * 17 (all three) = 2618`, `B = 3 (B \\ (A ∪ C)) * 7 (with A) * 13 (with C) * 17 (all three) = 4641`, `C = 5 (C \\ (A ∪ B)) * 11 (with A) * 13 (with B) * 17 (all three) = 12155` for the default seed (D-01, D-04)"
    - "Two new SVG text elements `circle-name-left` and `circle-name-right` name the whole left and right circles, and three new ones `circle-name-a`, `circle-name-b`, `circle-name-c` name the whole A, B and C circles — five genuinely new elements, none of them a rename or a move of an existing caption (D-02)"
    - "Each circle-name anchor lies strictly inside its own circle (under 0.9 of the radius from that circle's centre) and strictly outside every other circle in the same diagram (over one radius from each other centre) (D-02)"
    - "Each circle-name rendered bounding box intersects no other circle-name box, no `region-label` box, and no worst-case placed-chip block (8 primes per two-circle region, 3 per three-circle region) (D-02)"
    - "The circle names are present and visible whether a region holds primes or none — they are built once in the static layer, not rebuilt by `renderTokens` (D-02)"
    - "No text anywhere in the rendered page — region captions, product rows, both lede paragraphs, the page heading — displays the three-letter greatest-common-divisor acronym; the intersection of two numbers is written with the ∩ infix instead (D-03, D-04)"
    - "With the default seed the two-circle centre row reads exactly `Left ∩ Right = 30 ∩ 35 = 5`, and the three-circle rows read exactly `A∩B = 2618 ∩ 4641 = 119`, `A∩C = 2618 ∩ 12155 = 187`, `B∩C = 4641 ∩ 12155 = 221`, `A∩B∩C = 2618 ∩ 4641 ∩ 12155 = 17` (D-03)"
    - "The row labels on the pairwise product rows stay the full intersections `A∩B`, `A∩C`, `B∩C` and are NOT sourced from the renamed region dictionary, whose `ab`/`ac`/`bc` entries now name the exclusive lens `(A∩B) \\ C` rather than the full intersection (D-03)"
    - "Every value printed after an ∩ chain still comes from the untouched Euclidean `gcd` helper applied to the circle totals produced by `productOf` — only the surrounding display text changed (D-03, D-05)"
    - "Both lede paragraphs and the Prime Venn Diagram card paragraph on index.html describe the tool in ∩ / \\ / ∪ vocabulary instead of spelling out the acronym (D-04)"
    - "The tool's `<style>` block and every SVG attribute written from JavaScript declare no literal colour value — the new circle-name rule resolves its fill through var() against assets/palette.css tokens, reusing --role-input, --role-alt and --role-special so each name matches its own circle's stroke (D-05)"
    - "No shared JS module is introduced, no number-theory helper is duplicated, and no new external resource is added — the only script src in the tool file is still ../assets/theme.js (D-05)"
    - "Placing, removing, clearing, switching mode, the `?mode=` parameter and per-mode reload persistence all still work in both modes, with no console error in either theme (D-05)"
  artifacts:
    - "Venn Diagrams/venn-diagrams.html"
    - "index.html"
  key_links:
    - "REGION_NAMES / REGION_NAMES3 -> the SVG `region-label` captions, `regionAriaLabel`/`regionAriaLabel3`, the placed / removed / full status messages, the placed-chip aria-labels, AND (new) the segment notes inside the product rows — one edit to the dictionary propagates to every surface (D-01)"
    - "The five new `circle-name` text elements -> appended in `buildStatic` / `buildStatic3` only, never touched by `renderTokens`/`renderTokens3` -> persistence of the names across every re-render (D-02)"
    - "state.regions / state.regions3 -> primesOf -> productOf -> the circle totals -> the existing gcd() helper -> the ∩ chains printed in the centre and pairwise rows, so a printed intersection can never disagree with the circle totals printed above it (D-03)"
    - "REGION_NAMES.overlap -> the two-circle centre row's label, because in two-circle mode the overlap region IS the full intersection; REGION_NAMES3.ab/ac/bc are deliberately NOT wired to the pairwise rows, because those regions are the exclusive lenses, not the full intersections (D-03)"
---

<objective>
Shift the Prime Venn Diagram tool's vocabulary from plain-English divisor talk to set-theory notation, in both the two-circle and three-circle modes: rename every region to a set-difference / intersection expression, pin a persistent name label inside each whole circle, and print the intersection of two numbers with the ∩ infix instead of a named function call.

Purpose: the tool already draws the set picture; the words on it were still describing the arithmetic. Naming the regions `A \ (B ∪ C)` and `(A∩B) \ C` makes the diagram teach the notation a self-learner will meet in every later text, and writing `2618 ∩ 4641 = 119` makes the punchline — that intersecting two numbers' prime sets *is* taking their greatest common divisor — something the reader derives from the picture rather than reads as a label.
Output: one substantially edited file, `Venn Diagrams/venn-diagrams.html` (two renamed dictionaries, five new SVG labels, one new CSS rule, rewritten product rows, two rewritten ledes, one deleted helper), plus a one-paragraph copy fix to the hub card in `index.html`.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

Target file: `Venn Diagrams/venn-diagrams.html` (~1206 lines, single self-contained tool)
Secondary file: `index.html` (hub card paragraph only)
</context>

<decisions>
Locked with the user before planning. Non-negotiable; do not re-litigate, do not simplify, do not stage into a "v1".

- **D-01** — Region names become set-difference / intersection expressions. Two-circle: `left` → `Left \ Right`, `overlap` → `Left ∩ Right`, `right` → `Right \ Left`. Three-circle: `aOnly` → `A \ (B ∪ C)`, `bOnly` → `B \ (A ∪ C)`, `cOnly` → `C \ (A ∪ B)`, `ab` → `(A∩B) \ C`, `ac` → `(A∩C) \ B`, `bc` → `(B∩C) \ A`, `abc` → `A∩B∩C`.
- **D-02** — Add a NEW persistent per-circle name label, additive, never a rename or relocation of an existing caption. `Left`/`Right` in the two-circle diagram, `A`/`B`/`C` in the three-circle one. Positioned inside its own circle, always visible regardless of what is placed, and not colliding with the existing region captions, the chip stacks, or the other circles. The existing region captions keep their current anchors.
- **D-03** — Where the page currently displays the greatest-common-divisor acronym as text with the two or three totals as arguments, display the operands joined by the ∩ infix instead. The `gcd()` computation helper is unchanged; only the display string changes.
- **D-04** — General framing: where wording is at the executor's discretion (the segment notes, the two lede paragraphs, the hub card paragraph), lean on ∩ / \ / ∪ vocabulary rather than prose naming the acronym.
- **D-05** — Carried-over tool constraints: no literal colour values (everything through `var()` against `assets/palette.css` tokens); no shared JS module; reuse the existing `svgEl`, `gcd`, `productOf`, `primesOf`, `formatSegments`, `isPrime` helpers rather than duplicating them; touch only this tool's file plus the hub card paragraph in `index.html`.
</decisions>

<tasks>

<!-- planner-discipline-allow: GCD -->
<!-- planner-discipline-allow: only -->
<!-- The two literals above appear in this plan's prose because they name the text being removed.
     The acceptance gates read element textContent out of the rendered DOM (never a raw grep of the
     source file), so a mention in this plan cannot leak into a gate. The executor must still NOT
     write either literal into a source-code comment. -->

<task type="tracer">
  <name>Task 1: Rename both region dictionaries to set notation and rewire every consumer</name>
  <files>Venn Diagrams/venn-diagrams.html</files>
  <precondition>`google-chrome` is on PATH (confirmed at /usr/bin/google-chrome); the verify step drives it headless. Halt and report if absent.</precondition>
  <reversibility rating="reversible">Single file, single commit, text-only change to string dictionaries and their consumers.</reversibility>
  <read_first>
Read `Venn Diagrams/venn-diagrams.html` once, in full, before editing. In that single pass extract: the `REGION_NAMES` and `REGION_NAMES3` dictionaries and every site that reads them (`regionAriaLabel`, `regionAriaLabel3`, `placePrime`, `placePrime3`, `removeToken`, `removeToken3`, the placed-chip aria-labels inside `renderTokens`/`renderTokens3`, the caption text in `buildStatic`/`buildStatic3`); the `formatSide` and `formatSegments` helpers and their callers; `renderProducts` and `renderProducts3`; the geometry constants `R`, `CY`, `CXA`, `CXB`, `CENTERS3`, `R3`, `REGION_ANCHOR`, `CHIP_ANCHOR3`, `CAPTION_ANCHOR3`, `MAX_PER_REGION`, `MAX_PER_REGION3` (Task 2 needs all of these); and the `.region-label` style rule. Do not re-read the file afterwards — use Grep with a specific pattern if a detail is missing.
  </read_first>
  <action>
Work inside the existing IIFE. Do not add a module, do not duplicate a helper, do not touch `gcd`, `productOf`, `isPrime`, `primesOf` or `svgEl` (D-05).

**The escaping trap — read this before typing a single label.** In a JavaScript string literal, `'Left \ Right'` evaluates to `Left  Right`: backslash-space is not a recognised escape, so the backslash is silently dropped and you get two spaces. Every set-difference label must be written with the backslash doubled — `'Left \\ Right'` — or the label will look almost right and be wrong. This was verified in this environment before planning. The intersection glyph is U+2229 and the union glyph is U+222A, both written literally; the file is already UTF-8 and already contains U+2229.

Rewrite `REGION_NAMES` to exactly `{ left: 'Left \\ Right', overlap: 'Left ∩ Right', right: 'Right \\ Left' }` and `REGION_NAMES3` to exactly `{ aOnly: 'A \\ (B ∪ C)', bOnly: 'B \\ (A ∪ C)', cOnly: 'C \\ (A ∪ B)', ab: '(A∩B) \\ C', ac: '(A∩C) \\ B', bc: '(B∩C) \\ A', abc: 'A∩B∩C' }` (D-01). Change nothing about the keys, the key order, the `REGION_KEYS3` array, or any anchor table.

Both dictionaries are already the single source of truth for the SVG captions, the aria-labels and the status messages, so those propagate with no further edit. Walk each consumer once and confirm the resulting sentence still reads sensibly — `Placed 5 in the Left ∩ Right region.`, `The A∩B∩C region is full — max 3 primes.`, `Remove 2 from the A \ (B ∪ C) region`, `C \ (A ∪ B) region, currently holding 5`. If one of them reads badly, adjust the surrounding sentence, never the region name.

Then remove the last of the exclusivity wording from the product rows (D-01, D-04):

- Delete `formatSide` entirely and compose the two-circle side rows with the existing `formatSegments` helper instead, passing the region names as the notes: the left row over `[{ list: leftOnlyList, note: REGION_NAMES.left }, { list: sharedList, note: REGION_NAMES.overlap }]`, the right row over `[{ list: rightOnlyList, note: REGION_NAMES.right }, { list: sharedList, note: REGION_NAMES.overlap }]`. This is behaviour-preserving: `formatSegments` skips empty lists, falls back to `(empty)`, and multiplies the concatenation of every surviving list, which equals the product-of-products `formatSide` computed. Confirm `formatSide` has no other caller before deleting it; leaving it as dead code is not acceptable.
- In `renderProducts3`, replace the exclusive-part note of each of the three number rows with the matching region name — `REGION_NAMES3.aOnly` for A's first segment, `REGION_NAMES3.bOnly` for B's, `REGION_NAMES3.cOnly` for C's. Leave the `'with A'` / `'with B'` / `'with C'` / `'all three'` notes exactly as they are: the user explicitly ruled those acceptable, and lengthening them would push the product rows into needless wrapping.

Leave the centre and pairwise rows' divisor-function display alone in this task — Task 3 owns that. Assign every row with `textContent` only. Do not write either of the two retired words into a source comment.
  </action>
  <verify>
    <automated>Dump both modes and assert the renamed strings, from the repo root:
`REPO=/home/mainaccount/Claude/number-theory-browser-tools; SP="$SCRATCH"; U="file://$REPO/Venn%20Diagrams/venn-diagrams.html"; for M in two three; do google-chrome --headless=new --disable-gpu --user-data-dir="$(mktemp -d)" --virtual-time-budget=4000 --dump-dom "$U?mode=$M" > "$SP/dom-$M.html"; done`
Then, against `$SP/dom-two.html`, assert every one of these is present with `grep -F -q`: `>Left \ Right<`, `>Left ∩ Right<`, `>Right \ Left<`, `>A \ (B ∪ C)<`, `>B \ (A ∪ C)<`, `>C \ (A ∪ B)<`, `>(A∩B) \ C<`, `>(A∩C) \ B<`, `>(B∩C) \ A<`, `>A∩B∩C<`, `Left = 2 * 3 (Left \ Right) * 5 (Left ∩ Right) = 30`, `Right = 7 (Right \ Left) * 5 (Left ∩ Right) = 35`, `A = 2 (A \ (B ∪ C)) * 7 (with B) * 11 (with C) * 17 (all three) = 2618`, `B = 3 (B \ (A ∪ C)) * 7 (with A) * 13 (with C) * 17 (all three) = 4641`, `C = 5 (C \ (A ∪ B)) * 11 (with A) * 13 (with B) * 17 (all three) = 12155`. Each hit proves the backslash survived escaping. Exit non-zero on the first miss.</automated>
    <automated>Element-scoped exclusivity gate — run node over the dump so source comments and identifiers such as `aOnly` cannot be mistaken for rendered text:
`node -e 'const fs=require("fs"),h=fs.readFileSync(process.argv[1],"utf8");const L=[...h.matchAll(/<text[^>]*class="region-label"[^>]*>([^<]*)<\/text>/g)].map(m=>m[1]);const V=[...h.matchAll(/<span[^>]*class="product-value"[^>]*>([^<]*)<\/span>/g)].map(m=>m[1]);if(L.length!==10||V.length!==10){console.error("element count",L.length,V.length);process.exit(1);}const bad=[...L,...V].filter(t=>/\bonly\b/i.test(t));if(bad.length){console.error("BAD",bad);process.exit(1);}console.log("PASS",L.length,V.length);' "$SP/dom-two.html"`
Assert it prints `PASS 10 10`. The counts pin 3+7 captions and 3+7 product rows, so a silently dropped element also fails.</automated>
    <automated>Assert `formatSide` is gone: `grep -c 'formatSide' "$REPO/Venn Diagrams/venn-diagrams.html"` returns 0.</automated>
  </verify>
  <done>Both dictionaries read the D-01 expressions, every caption, message, aria-label and product-row note derives from them, each rendered backslash is a single literal backslash, no `region-label` or `product-value` text carries the retired exclusivity word, and `formatSide` no longer exists.</done>
</task>

<task type="auto">
  <name>Task 2: Add the five persistent per-circle name labels</name>
  <files>Venn Diagrams/venn-diagrams.html</files>
  <precondition>`google-chrome` is on PATH; the geometry gate drives it headless against a scratchpad copy of the tool.</precondition>
  <reversibility rating="reversible">Additive — one CSS rule and five appended SVG text elements.</reversibility>
  <action>
Add a new `.circle-name` style rule next to the existing `.region-label` rule: JetBrains Mono, `font-size:20px`, `font-weight:600`, `text-anchor:middle`, `pointer-events:none`, and no `fill` of its own. Add three modifier rules setting `fill` only — `.circle-name.name-a{ fill:var(--role-input); }`, `.circle-name.name-b{ fill:var(--role-alt); }`, `.circle-name.name-c{ fill:var(--role-special); }` — so each name takes the stroke colour of the circle it names (`circle-left`/`circle-a` already use `--role-input`, `circle-right`/`circle-b` use `--role-alt`, `circle-c` uses `--role-special`). Declare no literal colour anywhere and add no new custom property (D-05). Do not give any new element an id whose first three characters after the `#` are all hexadecimal digits — `circle-name-*` is safe, keep it.

Build the labels in the static layer only, so they survive every re-render and are present with zero primes placed (D-02):

- In `buildStatic`, append two `text` elements via the existing `svgEl` helper: id `circle-name-left`, class `circle-name name-a`, at **x=325, y=100**, text `Left`; and id `circle-name-right`, class `circle-name name-b`, at **x=575, y=100**, text `Right`.
- In `buildStatic3`, append three: id `circle-name-a`, class `circle-name name-a`, at **x=206, y=189**, text `A`; id `circle-name-b`, class `circle-name name-b`, at **x=694, y=189**, text `B`; id `circle-name-c`, class `circle-name name-c`, at **x=353, y=547**, text `C`.

Those five anchors were derived from the file's own constants, not guessed, and the verify gate re-derives them:

- Two-circle (`R`=190, `CY`=250, `CXA`=355, `CXB`=545): each name sits 30px outboard of its circle's centre-x and 150px above centre-y, i.e. 0.81·R from its own centre and 1.40·R from the other centre — inside its own lobe, outside the other circle. The worst-case chip block (8 primes → 4 rows of 2 → 116×152 centred on `REGION_ANCHOR`) spans y 174–326, and the region captions sit at y=478, so y=100 clears both.
- Three-circle (`R3`=190, centres A(346.08,270), B(553.92,270), C(450,450), centroid (450,330)): A and B sit 0.85·R3 from their own centre along the ray pointing away from the centroid; C sits 0.72·R3 from its centre along that ray rotated 45° toward the lower left, because C's straight-down ray is already occupied by the `cOnly` chip stack (y 478–562) and the `cOnly` caption (y=600), which D-02 forbids disturbing. Worst-case three-circle chip blocks are 44×84 centred on `CHIP_ANCHOR3`.

Append the names inside the static groups, after the circles and fills, so they paint under the `.region` hit groups and clicks still reach the regions; `pointer-events:none` is belt-and-braces on top of that. Add `.circle-name` to nothing in the reduced-motion rule — it has no transition.

If the geometry gate reports a collision, adjust only these five anchor constants — never a circle centre, a radius, `REGION_ANCHOR`, `CHIP_ANCHOR3` or `CAPTION_ANCHOR3` — and re-run.
  </action>
  <verify>
    <automated>Real-bbox geometry gate. Copy the tool file into the scratchpad, rewrite its two `../assets/` hrefs and its `../assets/theme.js` src to absolute `file://` paths, and append before `</body>` a script that registers its own `load` listener (it runs after the tool's, which is registered earlier) and, for the visible diagram, computes: (1) for each `.circle-name`, the distance from its x/y attributes to its own circle centre — asserting under 0.9·R — and to every other centre in that diagram — asserting over R, using R=190 with centres (355,250)/(545,250) for the two-circle svg and (450-120·√3/2,270)/(450+120·√3/2,270)/(450,450) for the three-circle svg; (2) `getBBox()` for every `.circle-name` and every `.region-label` in that svg plus the synthesised worst-case chip rects (two-circle: 116×152 centred on each `REGION_ANCHOR`; three-circle: 44×84 centred on each `CHIP_ANCHOR3`), asserting no `.circle-name` box intersects any other box in that set; (3) that every `.circle-name` box has non-zero width and height. Write `PASS` or the failing detail into `document.body.dataset.nameCheck`. Run it twice with a fresh `--user-data-dir` each time — once with `?mode=two`, once with `?mode=three`, because `[hidden]{display:none}` makes `getBBox()` return zeros for the inactive diagram — and assert both dumps contain `data-name-check="PASS"`. Keep the harness in the session scratchpad; never write it into the repo.</automated>
    <automated>Assert the five elements exist in the real file's rendered DOM with the right text, against a fresh `--dump-dom` of `Venn Diagrams/venn-diagrams.html`: `grep -F -q 'id="circle-name-left"'` through `id="circle-name-c"` (five ids), and that a node pass over `<text[^>]*class="circle-name[^>]*>([^<]*)</text>` yields exactly the five strings `Left`, `Right`, `A`, `B`, `C`.</automated>
    <automated>Re-run Task 1's `PASS 10 10` element-count gate unchanged, proving the ten `region-label` captions were neither renamed, moved nor absorbed by the new labels.</automated>
    <human-check>Open the file in a browser in both modes: each circle carries its own name in its own colour, inside its own outline, never overlapping a region caption or a prime chip even with every region filled to its maximum.</human-check>
  </verify>
  <done>Five new `circle-name` text elements render in their own circle's colour, each anchor is provably inside its own circle and outside every other, no rendered box collides with a region caption, another name, or a worst-case chip stack, the names are visible with zero primes placed, and the ten region captions are untouched.</done>
</task>

<task type="auto">
  <name>Task 3: Replace the divisor-function display text with the ∩ infix, and reframe the prose</name>
  <files>Venn Diagrams/venn-diagrams.html, index.html</files>
  <precondition>`google-chrome` is on PATH; the final gates dump both modes headless.</precondition>
  <reversibility rating="reversible">Display strings and prose only; no computation changes.</reversibility>
  <action>
Change only the display text of the intersection rows — the Euclidean `gcd` helper, every call to it, and every total fed to it stay exactly as they are (D-03, D-05).

In `renderProducts`, the centre row becomes the overlap region's own name, then the two circle totals joined by the ∩ infix, then the computed value: `REGION_NAMES.overlap + ' = ' + leftTotal + ' ∩ ' + rightTotal + ' = ' + gcd(leftTotal, rightTotal)`. Sourcing the label from `REGION_NAMES.overlap` is correct here and only here: in two-circle mode the overlap region *is* the full intersection.

In `renderProducts3`, the three pairwise rows and the centre row keep their existing literal labels and swap the function-call text for the infix: `'A∩B = ' + totalA + ' ∩ ' + totalB + ' = ' + gcd(totalA, totalB)`, the same shape for `A∩C` and `B∩C`, and `'A∩B∩C = ' + totalA + ' ∩ ' + totalB + ' ∩ ' + totalC + ' = ' + gcd(gcd(totalA, totalB), totalC)`. Do **not** source these four labels from `REGION_NAMES3` — after Task 1 its `ab`/`ac`/`bc` entries name the *exclusive* lenses `(A∩B) \ C` etc., which is a different set from the full `A∩B` these rows report. Getting this wrong would make the rows state a falsehood.

Rewrite both lede paragraphs in the same vocabulary (D-04), dropping the acronym entirely:

- `#lede-two`: keep the opening two clauses about the circles being two numbers written as prime factorizations, then continue — `Left ∩ Right` holds the primes both numbers share, so that intersection multiplies out to the largest number dividing both, while `Left \ Right` and `Right \ Left` hold the primes each number keeps to itself.
- `#lede-three`: keep the opening clause, then — a prime in `(A∩B) \ C` is shared by exactly A and B, so that whole lens multiplies out to `A ∩ B`; a prime in `A∩B∩C` is shared by all three, so the centre multiplies out to `A ∩ B ∩ C`; a prime in `A \ (B ∪ C)` belongs to A alone.

Write the ledes as HTML source, where a literal `\` needs no escaping — the doubling rule from Task 1 applies to JS string literals only. Keep the existing `&mdash;` entity style and the `class="lede"` / `id` / `hidden` attributes exactly as they are.

In `index.html`, rewrite only the paragraph inside the Prime Venn Diagram card (currently line 183) so it describes each overlap as an intersection rather than naming the acronym; leave the card's markup, icon, heading, link and every other card untouched.

Do not write the acronym into a source comment anywhere.
  </action>
  <verify>
    <automated>Dump both modes fresh (`?mode=two` and `?mode=three`, a new `--user-data-dir` each) and assert with `grep -F -q`: `Left ∩ Right = 30 ∩ 35 = 5`, `A∩B = 2618 ∩ 4641 = 119`, `A∩C = 2618 ∩ 12155 = 187`, `B∩C = 4641 ∩ 12155 = 221`, `A∩B∩C = 2618 ∩ 4641 ∩ 12155 = 17`. These are the seed values: totalA=2·7·11·17=2618, totalB=3·7·13·17=4641, totalC=5·11·13·17=12155.</automated>
    <automated>Element-scoped prose gate over the dump — extend Task 1's node pass to also collect `<p[^>]*class="lede"[^>]*>([^<]*)</p>` and assert that none of the collected `region-label`, `product-value` or `lede` strings matches `/gcd/i`, and that the earlier `PASS 10 10` counts still hold. Scoping to element text (rather than grepping the raw dump) is deliberate: the dump embeds the inline script, whose lowercase `gcd()` helper legitimately survives.</automated>
    <automated>Assert the hub card is reworded and nothing else moved: `grep -ci 'gcd' index.html` returns 0, and `git -C /home/mainaccount/Claude/number-theory-browser-tools diff --numstat -- index.html` shows exactly `1` line added and `1` line removed.</automated>
    <automated>Palette gate (baseline was zero, so any hit is new): from the repo root, `grep -nEi 'rgba?\(|hsla?\(|#[0-9a-f]{3}([0-9a-f]{3})?\b' "Venn Diagrams/venn-diagrams.html" | grep -vE '/\*|<!--' | wc -l` returns 0.</automated>
    <automated>Dependency gate: `grep -c 'script src' "Venn Diagrams/venn-diagrams.html"` returns exactly 1 and the matching line references `../assets/theme.js`.</automated>
    <automated>Regression sweep: capture four headless screenshots with a fresh `--user-data-dir` at window size 1300x2200 — `?theme=day&mode=two`, `?theme=night&mode=two`, `?theme=day&mode=three`, `?theme=night&mode=three` — and assert all four files are non-empty. In each of the two DOM dumps assert the page reports no console error by loading with `--enable-logging=stderr --log-level=0` and confirming stderr contains no `ERROR:CONSOLE` line.</automated>
    <human-check>Review the four screenshots and then drive the live page: the product rows still fit their cards after the longer set-notation notes (wrapping is acceptable, clipping is not); place and remove primes in both modes; switch modes; press Clear all; reload and confirm each mode restored its own placements independently.</human-check>
  </verify>
  <done>Every intersection row prints the ∩ infix between real totals with the value from the untouched `gcd` helper, the pairwise labels still name the full intersections rather than the exclusive lenses, no rendered caption, row or lede spells out the acronym, the hub card matches the page it links to, no literal colour or new dependency was introduced, and both modes still place, remove, clear, switch and persist without a console error.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| `localStorage` → DOM | Stored region payloads under `venn-diagrams`, `venn-diagrams-three`, `venn-diagrams-mode` are attacker-writable by any script on the same origin (or by hand on a `file://` origin) and are read back on load. |
| URL query string → DOM | The `?mode=` and `?theme=` parameters are read at load. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-eod-01 | Tampering | `restore` / `restore3` reading `localStorage` | medium | mitigate | No change in scope — the existing `isValidStoredRegion` / `isValidStoredRegion3` guards (array shape, length ≤ MAX, every entry passes `isPrime`) already reject a crafted payload and fall back to the seed. Verify they are still called and still reject after this change; do not weaken them. |
| T-eod-02 | Tampering | `readModeParam` reading `?mode=` | low | mitigate | No change in scope — the parameter is compared against the exact whitelist `two`/`three` and never reaches a DOM sink. Preserve that comparison. |
| T-eod-03 | Tampering | New label and product-row text assignment | medium | mitigate | Every new string (five circle names, renamed captions, rewritten rows, rewritten ledes) is a page-authored constant or a number derived from a prime that already passed `isPrime`, and is assigned via `textContent` or `svgEl` attributes only. No `innerHTML` is introduced anywhere in this change. |
| T-eod-04 | Elevation of Privilege | External resources | low | accept | No dependency is added; the dependency gate in Task 3 asserts the only script src remains `../assets/theme.js`. No package-manager install occurs in this plan, so no legitimacy gate applies. |
</threat_model>

<verification>
Run from the repo root `/home/mainaccount/Claude/number-theory-browser-tools`, with headless Chrome and a fresh `--user-data-dir` per invocation so the default seed (rather than a leftover profile's `localStorage`) drives every assertion:

1. Every Task 1 caption and product-row string is present in the rendered DOM of both modes, each set-difference label carrying exactly one literal backslash.
2. The element-scoped node gate prints `PASS 10 10` and reports no retired exclusivity word and no divisor acronym in any `region-label`, `product-value` or `lede` text.
3. The geometry harness reports `data-name-check="PASS"` for both `?mode=two` and `?mode=three`.
4. All five intersection rows print the ∩ infix with the seed totals and the correct computed values.
5. `formatSide` is gone; the colour-literal count is 0; `script src` count is 1; `index.html` shows a one-line diff.
6. Four theme × mode screenshots render non-empty with no console error.
</verification>

<success_criteria>
- Both region dictionaries read the exact D-01 expressions and remain the single source of truth for captions, messages, aria-labels and product-row notes.
- Five new persistent circle-name labels render inside their own circles, provably clear of every other circle, caption and worst-case chip stack.
- No rendered text on the page or on its hub card names the greatest-common-divisor acronym or the retired exclusivity word; intersections are written with ∩.
- The `gcd` helper and every value it returns are unchanged; only display text moved.
- No literal colour, no new dependency, no shared module, no duplicated helper, no regression in placing, removing, clearing, mode switching or per-mode persistence.
</success_criteria>

<output>
Create `.planning/quick/260926-eod-venn-diagrams-rename-region-labels-to-se/260926-eod-SUMMARY.md` when done.
</output>
