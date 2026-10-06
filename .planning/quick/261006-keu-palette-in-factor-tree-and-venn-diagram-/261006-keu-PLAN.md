---
phase: quick-261006-keu
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Venn Diagram/venn-diagram.html
  - Factor Tree/factor-tree.html
  - .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js
autonomous: true
requirements: [QUICK-KEU-01, QUICK-KEU-02, QUICK-KEU-03]

estimate:
  tokens: 70000
  raw_tokens: 70000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "On Venn Diagram, the bin and the garbage-truck Delete all sit in the add row (#palette-add-input, #palette-add-btn, #palette-random-btn), after Randomize and pushed to the row's right end, vertically centred with the input and buttons (UD-1, QUICK-KEU-01)"
    - "On Factor Tree, the bin and Delete all sit in the palette's add row (#addInput, #addBtn, #randomBtn), after Randomize and pushed to the row's right end, vertically centred with the input and buttons (UD-1, QUICK-KEU-02)"
    - "Each palette's heading row now holds only its heading (#picker-heading / #paletteHeading), with a 10px gap down to the add row, matching the add row's 10px gap down to the palette grid"
    - "On narrow widths the add row still wraps: the two icons stay together and sit at the right end of whichever line they land on, with no horizontal overflow"
    - "Dragging a chip or circle onto the bin still removes it, Delete all still empties the shared palette, and both icons keep their ids, roles, translated aria-label/title and 40x40 size (QUICK-KEU-03)"
    - "No new dictionary string and no colour literal is introduced; the only new CSS is a margin-left:auto rule per page plus the heading-row margin; i18n-check --all and shadow-check --all still pass"
  artifacts:
    - path: "Venn Diagram/venn-diagram.html"
      provides: "the bin and Delete all moved from the picker heading row into the add row, pushed right"
      contains: ".picker-add .palette-tools{ margin-left:auto; }"
    - path: "Factor Tree/factor-tree.html"
      provides: "the bin and Delete all moved from the palette section-head into the palette's add row, pushed right"
      contains: ".palette-panel .controls .palette-tools{ margin-left:auto; }"
    - path: ".planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js"
      provides: "U1 rewritten for the add-row layout; new sequence K with K1 for Factor Tree's add-row layout"
      contains: "EXPECTED = 29"
  key_links:
    - from: "Venn Diagram/venn-diagram.html #palette-bin dragover/drop listeners"
      to: "document.getElementById('palette-bin')"
      via: "listeners bind by id, so moving the element to a new parent does not unwire them"
      pattern: "getElementById\\('palette-bin'\\)"
    - from: "Factor Tree/factor-tree.html overBin()"
      to: "paletteBin.getBoundingClientRect()"
      via: "drop detection reads the bin's live rect, so it follows the bin to its new position"
      pattern: "paletteBin\\.getBoundingClientRect\\(\\)"
---

<objective>
Move the palette's two icon tools — the bin and the garbage-truck "Delete all" button — from the palette heading row into the add row (number input + Add + Randomize), on both Factor Tree and Venn Diagram, so the icons sit on the same row and at the same height as the add controls, at the row's right end.

User decision (from the task description, cited as UD-1 below):
- UD-1: In Factor Tree and Venn Diagram, the bin and the Delete-all icon sit on the same row/height as the Add function (the number input + Add + Randomize buttons).

Claude's discretion (documented choices):
- The icons' wrapper moves unchanged (same element, same children, same ids, roles and i18n attributes) and becomes the LAST child of the add row, pushed right with a scoped margin-left:auto rule, so the icons stay at the right edge where the user already finds them.
- With the 40px-tall icons gone from the heading row, the heading row shrinks to the heading's own line height. Its bottom margin goes from 8px to 10px, so the panel reads as an even rhythm: 10px panel padding, heading, 10px, add row, 10px, palette grid. On Factor Tree this margin is scoped to the palette panel, because the shared section-head class also styles the composition/factorization area's heading row (heading + Clear), which must not change.
- The existing pl0 probe's U1 scenario asserted the old heading-row placement. It is rewritten to assert the new add-row placement, and a Factor Tree counterpart (K1) is added, so the layout is regression-tested in headless Chrome rather than only by eye.

Purpose: the icons belong to the palette editing controls; putting them on the add row aligns them with the controls they sit next to and frees the heading row.
Output: two edited tool pages and an updated regression probe (28 → 29 scenarios).
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
@.planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js

<interfaces>
Current markup and CSS, verified at plan time (line numbers approximate):

Venn Diagram/venn-diagram.html
- CSS ~47: `.picker-head{ display:flex; justify-content:space-between; align-items:center; gap:10px; margin:0 0 8px; }`
- CSS ~54: `.picker-add{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin:0 0 10px; }`
- CSS ~109: `.palette-tools{ display:flex; align-items:center; gap:4px; }`; bin and Delete all are 40x40 each.
- Markup ~553-570 inside `<div class="picker-panel">`: `<div class="picker-head">` holds `<h2 id="picker-heading">` then `<div class="palette-tools">` (children `#palette-bin`, `#palette-empty-btn`); then `<div class="picker-add">` holds `#palette-add-input`, `#palette-add-btn`, `#palette-random-btn`; then `<div id="prime-picker" class="prime-picker">`.
- JS ~707-708 and ~2245-2260: `paletteBin`/`paletteEmptyBtn` are fetched by id; the bin's dragover/dragleave/drop listeners are on the element itself. No JS looks up the tools via a parent or via the heading row.

Factor Tree/factor-tree.html
- CSS ~36: `.controls{ display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px; }`
- CSS ~119: `.section-head{ display:flex; justify-content:space-between; align-items:center; gap:10px; margin:0 0 8px; }`. This class is SHARED: it is also used at ~613 for the work-area heading row (`#workHeading` + `#clearBtn`). Do not edit the base rule.
- CSS ~154: `.palette-panel .controls{ align-items:center; margin:0 0 10px; }`
- CSS ~351: `.palette-tools{ display:flex; align-items:center; gap:4px; }`
- CSS ~510: `@media (max-width:480px){ #addInput{ width:150px; } }`
- Markup ~584-603 inside `<div class="palette-panel">`: `<div class="section-head">` holds `<h2 id="paletteHeading" class="section-title">` then `<div class="palette-tools">` (children `#paletteBin`, `#paletteEmptyBtn`); then `<div class="controls">` holds `#addInput`, `#addBtn`, `#randomBtn`; then `<div id="palette" class="palette">`. The palette panel's `.controls` is the only element with that class on the page.
- JS ~646: `const paletteBin = document.getElementById('paletteBin');` ~1931 `overBin()` reads `paletteBin.getBoundingClientRect()`. Position-independent.

Probe .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js
- `var EXPECTED = 28;` (~30); `SEQUENCES` (~40) is a list of `{ name, runs: [[pageKey, defsKey], ...] }`, each sequence on a fresh Chrome profile at `--window-size=1280,900`; pageKey `ft` = Factor Tree, `venn` = Venn Diagram.
- In-page helpers available inside `inPage`: `assert`, `same`, `arr`, `T(key, params)` (NT.i18n.translate), `noErrors(label)`, `storedList()`.
- `defs.U` (~500) returns steps U1-U4; U1 "venn-palette-head" (~503-520) currently asserts the tools live in `.picker-head` and NOT in `.picker-add` — this assertion is what this plan inverts.
- `defs[cfg.run]()` dispatches on the run key; a step is `{ name, fn }` where fn returns the PASS message.
- Baseline at plan time: `PL0-PROBE PASS (28 scenarios)`.

Pre-existing stale probes (NOT gates for this plan, do not edit):
- .planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js already fails at plan time with exactly these scenario names: D1, D2, P4, P8, P9, P11, P12, P13 (`KAZ-PROBE FAIL (19 pass, 14 fail ...)`); P11 already fails on an outdated parent assertion. It is used only as a no-new-failure regression guard.
- .planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js targets a removed `goBtn` and fails 9/11 at plan time; ignore it.
</interfaces>
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Venn Diagram end-to-end — bin and Delete all move into the add row, probe U1 asserts it in headless Chrome</name>
  <files>Venn Diagram/venn-diagram.html, .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js</files>
  <action>
Per UD-1, QUICK-KEU-01 and QUICK-KEU-03, in Venn Diagram/venn-diagram.html:

1. Markup: cut the whole `<div class="palette-tools">` element (with its two children `#palette-bin` and `#palette-empty-btn`, every attribute and both inline SVGs byte-for-byte unchanged) out of `<div class="picker-head">`, and paste it as the LAST child of `<div class="picker-add">`, directly after the `#palette-random-btn` button. Re-indent it to the add row's child depth (6 spaces for the wrapper, 8 for its children, 10 for the SVGs). The heading row then contains only `<h2 id="picker-heading" ...>`. Do not touch any id, class, role, aria-label, title or data-i18n-* attribute.

2. CSS: directly after the existing `.palette-tools{ display:flex; align-items:center; gap:4px; }` rule, add the scoped rule `.picker-add .palette-tools{ margin-left:auto; }` (exactly this text, one line) so the icons stay at the add row's right end. The add row already has `display:flex; align-items:center; flex-wrap:wrap`, so the 40px icons centre on the 40px input/buttons and, on a narrow screen, the wrapper wraps as one unit to the right end of the next line. In the `.picker-head` rule change `margin:0 0 8px;` to `margin:0 0 10px;` (discretion: even 10px rhythm; see objective). Leave the rest of `.picker-head` as is (harmless with one child). Introduce no colour value of any kind; no new strings; no JS change (the bin's listeners bind by id — confirm by reading ~2240-2265 and leave them unchanged).

3. Probe: in .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js rewrite step U1 in `defs.U`, renaming it "U1 venn-palette-tools-row". Keep its existing label/SVG/enabled assertions (aria-label and title equal `T("venn.emptyPaletteLabel")`, an svg inside the button, button not disabled, both icons 40x40, `noErrors("U1")`). Replace the placement assertions with:
   - `document.querySelector(".picker-add .palette-tools")` exists, its child ids are exactly `["palette-bin", "palette-empty-btn"]`, it is the add row's `lastElementChild`, and its `previousElementSibling.id` is `"palette-random-btn"`;
   - `document.querySelector(".picker-head").children.length === 1` (only the heading is left) and `document.querySelector(".picker-head .palette-tools")` is null;
   - vertical centring: for each of `#palette-bin` and `#palette-empty-btn`, the rect's vertical centre (top + height/2) is within 1px of the vertical centre of `#palette-add-input`, `#palette-add-btn` and `#palette-random-btn`;
   - right end: `Math.abs(toolsRect.right - addRowRect.right) <= 1`, and `toolsRect.left > randomBtnRect.right` (pushed right, not touching Randomize).
   Return the message "bin and garbage-truck Delete all (both 40x40) at the right end of the add row, centred with the input and buttons; heading row holds only the heading; translated label". Update the U-sequence comment line above `defs.U` and the file header comment to mention quick task 261006-keu moving the tools into the add row. EXPECTED stays 28 in this task.
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && [ "$(awk '/<div class="picker-add">/,/<div id="prime-picker"/' 'Venn Diagram/venn-diagram.html' | grep -c 'class="palette-tools"')" = 1 ] && [ "$(grep -c 'class="palette-tools"' 'Venn Diagram/venn-diagram.html')" = 1 ] && grep -Fq '.picker-add .palette-tools{ margin-left:auto; }' 'Venn Diagram/venn-diagram.html' && node .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js | tail -1 | grep -Fx 'PL0-PROBE PASS (28 scenarios)'</automated>
  </verify>
  <done>The Venn page's single palette-tools wrapper lives inside the add row after Randomize; the scoped margin-left:auto rule exists; the pl0 probe prints `PL0-PROBE PASS (28 scenarios)` with U1 asserting add-row placement, vertical centring and right-end alignment in headless Chrome, and U2 (Delete all) still passes.</done>
</task>

<task type="auto">
  <name>Task 2: Factor Tree — same move into the palette's add row, probe K1, full regression gates</name>
  <files>Factor Tree/factor-tree.html, .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js</files>
  <action>
Per UD-1, QUICK-KEU-02 and QUICK-KEU-03, in Factor Tree/factor-tree.html:

1. Markup: cut the whole `<div class="palette-tools">` element (children `#paletteBin` and `#paletteEmptyBtn`, every attribute and both inline SVGs byte-for-byte unchanged) out of the palette panel's `<div class="section-head">` (the one holding `#paletteHeading`; NOT the work-area one holding `#workHeading`/`#clearBtn`), and paste it as the LAST child of the palette panel's `<div class="controls">`, directly after `#randomBtn`. Indent it at the add row's child depth (4 spaces for the wrapper, 6 for its children, 8 for the SVGs — fixing the flat indentation it had before). The palette heading row then holds only `<h2 id="paletteHeading" ...>`. Do not touch any id, class, role, aria-label, title or data-i18n-* attribute.

2. CSS: directly after the existing `.palette-tools{ display:flex; align-items:center; gap:4px; }` rule, add `.palette-panel .controls .palette-tools{ margin-left:auto; }` (exactly this text, one line). The palette panel's `.controls` already has `display:flex; flex-wrap:wrap; gap:10px` plus `align-items:center` from `.palette-panel .controls`, so the 40px icons centre on the 40px input/buttons and wrap as one unit on narrow widths (the existing 480px media query that narrows `#addInput` stays as is). Directly after the `.palette-panel .controls{ ... }` rule add `.palette-panel .section-head{ margin-bottom:10px; }` (discretion: even 10px rhythm, scoped so the shared base section-head rule and the work-area heading row are unchanged). No colour value of any kind; no new strings; no JS change (drop detection in `overBin()` reads `paletteBin.getBoundingClientRect()` live — confirm and leave it).

3. Probe: in .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js add a new sequence `{ name: "K", runs: [["ft", "K"]] }` at the end of `SEQUENCES` (fresh profile, so the default 30-prime palette is present), and a `defs.K` block after `defs.U` (with a one-line comment naming quick task 261006-keu) returning one step "K1 ft-palette-tools-row" that asserts, mirroring U1:
   - `document.querySelector(".palette-panel .controls .palette-tools")` exists, child ids exactly `["paletteBin", "paletteEmptyBtn"]`, it is the add row's `lastElementChild`, its `previousElementSibling.id` is `"randomBtn"`;
   - `document.getElementById("paletteHeading").parentElement.children.length === 1`;
   - both icons are 40x40 (rounded), and each icon's vertical centre is within 1px of the vertical centres of `#addInput`, `#addBtn` and `#randomBtn`;
   - `Math.abs(toolsRect.right - controlsRect.right) <= 1` and `toolsRect.left > randomBtnRect.right`;
   - `#paletteBin` aria-label and title equal `T("factorTree.binLabel")`; `#paletteEmptyBtn` aria-label and title equal `T("factorTree.emptyPaletteLabel")`; `#paletteEmptyBtn` is not disabled; `noErrors("K1")`.
   Return "bin and Delete all (both 40x40) at the right end of Factor Tree's add row, centred with the input and buttons; heading row holds only the heading". Raise `var EXPECTED = 28;` to `var EXPECTED = 29;` and extend the header comment to mention sequence K.

4. Regression gates: run the pl0 probe, `node .planning/phases/06-multi-language-support/i18n-check.js --all`, `node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all`, and the stale kaz probe (`node .planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js`): the kaz probe's set of failing scenario names must be exactly the plan-time set D1, D2, P4, P8, P9, P11, P12, P13 — no new name. Do not edit the kaz or ing probes. Confirm the diff of both pages against the plan-time base commit 510f835 (so Task 1's already-committed Venn change is included) adds no colour literal (see verify).
  </action>
  <verify>
    <automated>cd "$(git rev-parse --show-toplevel)" && [ "$(awk '/<div class="controls">/,/<div id="palette" /' 'Factor Tree/factor-tree.html' | grep -c 'class="palette-tools"')" = 1 ] && [ "$(grep -c 'class="palette-tools"' 'Factor Tree/factor-tree.html')" = 1 ] && grep -Fq '.palette-panel .controls .palette-tools{ margin-left:auto; }' 'Factor Tree/factor-tree.html' && grep -Fq '.palette-panel .section-head{ margin-bottom:10px; }' 'Factor Tree/factor-tree.html' && KEU_DIFF="$(git diff -U0 510f835 -- 'Factor Tree/factor-tree.html' 'Venn Diagram/venn-diagram.html')" && [ -n "$KEU_DIFF" ] && [ "$(printf '%s\n' "$KEU_DIFF" | grep '^+' | grep -v '^+++' | grep -Eci '#[0-9a-f]{3,8}[;, )]|rgba?\(|hsla?\(')" = 0 ] && node .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js | tail -1 | grep -Fx 'PL0-PROBE PASS (29 scenarios)' && node .planning/phases/06-multi-language-support/i18n-check.js --all >/dev/null && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all >/dev/null && [ "$(node .planning/quick/261005-kaz-factor-tree-rehaul-prime-circle-palette-/palette-probe.js 2>&1 | grep -E 'FAIL [A-Z][0-9]+ ' | sed -E 's/^.*FAIL ([A-Z][0-9]+) .*/\1/' | sort -u | tr '\n' ' ')" = "D1 D2 P11 P12 P13 P4 P8 P9 " ] && echo KEU-GATES-OK</automated>
    <human-check>Open "Factor Tree/factor-tree.html" and "Venn Diagram/venn-diagram.html" from file:// in a browser, in both day and night theme. (a) At desktop width the bin and the garbage-truck Delete-all icons sit on the same row as the number field, Add and Randomize, at the row's right end, vertically centred with the field and buttons; the "Prime palette" heading sits alone above with even spacing. (b) Narrow the window to about 360px: the row wraps, the two icons stay together at the right end of their line, nothing overflows. (c) Drag a palette circle (Factor Tree) or chip (Venn) onto the bin: the lid opens and the number is removed. (d) Delete all empties the palette and disables itself. (e) Factor Tree's composition/factorization heading row (heading + Clear) looks unchanged.</human-check>
  </verify>
  <done>Factor Tree's single palette-tools wrapper lives inside the palette's add row after Randomize, pushed right; the palette heading row holds only the heading with a 10px gap; the work-area heading row is unchanged; the pl0 probe prints `PL0-PROBE PASS (29 scenarios)`; i18n-check --all and shadow-check --all pass; the kaz probe shows no failing scenario beyond its plan-time set; the diff adds no colour literal; the gate prints KEU-GATES-OK.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| none new | markup/CSS relocation only; the shared number-palette (NT.store, localStorage/cookie) and the add field's input validation are untouched |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-keu-01 | Tampering | bin drop target / Delete all handlers on both pages | low | mitigate | elements move with ids and attributes unchanged; handlers bind by id (Venn listeners on #palette-bin, Factor Tree overBin() reads paletteBin's live rect), so no handler is lost or rebound to a different element; probe U2 (Delete all) and the kaz no-new-failure guard confirm behaviour |
| T-keu-02 | Information disclosure | i18n attributes on moved icons | low | accept | no new strings and no innerHTML; translated aria-label/title are asserted by U1/K1 |
| T-keu-SC | Tampering | npm/pip/cargo installs | high | accept | no package-manager installs in this plan; nothing to vet |
</threat_model>

<verification>
- Task 1 gate: Venn's tools wrapper is inside `.picker-add`, appears once, and the pl0 probe prints `PL0-PROBE PASS (28 scenarios)`.
- Task 2 gate prints `KEU-GATES-OK`: Factor Tree's tools wrapper is inside the palette's `.controls`, appears once; both scoped CSS rules present; the diff adds no colour literal; pl0 probe `PL0-PROBE PASS (29 scenarios)`; i18n-check --all and shadow-check --all pass; kaz probe failing-name set unchanged from plan time.
- End-of-phase human check (Task 2 `<human-check>`): visual alignment at desktop and ~360px, drag-to-bin, Delete all, both themes.
</verification>

<success_criteria>
- On both pages the bin and Delete-all icons share the add row with the number field, Add and Randomize, at its right end and vertically centred (UD-1).
- Heading rows hold only their headings, with an even 10px rhythm; Factor Tree's work-area heading row is unchanged.
- Drag-to-bin and Delete all behave exactly as before; ids, roles and translated labels unchanged; no new strings; no colour literals.
- pl0 probe passes 29/29; i18n-check and shadow-check pass; no new kaz-probe failure.
</success_criteria>

<output>
Create `.planning/quick/261006-keu-palette-in-factor-tree-and-venn-diagram-/261006-keu-SUMMARY.md` when done
</output>
