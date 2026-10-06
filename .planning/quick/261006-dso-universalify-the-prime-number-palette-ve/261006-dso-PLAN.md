---
phase: quick-261006-dso
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Venn Diagram/venn-diagram.html
  - assets/i18n/venn-diagram.js
  - .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js
autonomous: true
requirements: [QUICK-DSO-01, QUICK-DSO-02, QUICK-DSO-03]

estimate:
  tokens: 110000
  raw_tokens: 110000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "Venn Diagram's palette chips look like Factor Tree's palette circles: 44px pills, prime = --role-result fill with --accent-ink text, composite (data-composite) = --role-composite fill with --role-composite-ink text, laid out in a grid whose columns all share the widest chip's width (--palette-cell) (UD-1, UD-2)"
    - "An armed Venn chip (aria-pressed=true) and a chip being dragged stay visibly distinct while keeping their prime/composite fill: armed = a --role-active outline ring, dragging = reduced opacity (UD-2)"
    - "Venn's palette head shows the heading on the left and, on the right, the bin plus a garbage-truck Delete-all button, both 40x40, same SVGs and styling as Factor Tree (UD-3)"
    - "Delete all empties the shared palette (NT.store number-palette becomes []), clears the armed chip, shows 'The palette has been emptied.' (translated), focuses the add field, and is disabled while the palette is empty (UD-3)"
    - "A Randomize button sits right after Add in Venn's add row; clicking it fills the add field with a random number 12-9999 with at least three prime factors, different from the value shown, and adds nothing (UD-4)"
    - "The existing Venn toolbar Randomize (#randomize-btn, randomizeDiagram) and every existing chip interaction (click-to-arm, drag to a region, drag to the bin, Delete key) keep working; Factor Tree and the shared assets are untouched"
    - "Every new string exists in all sixteen languages (wording copied verbatim from Factor Tree), no new literal colour appears in Venn Diagram, and i18n-check --all, shadow-check --all, the harness and the pl0/edj probes pass"
  artifacts:
    - path: "Venn Diagram/venn-diagram.html"
      provides: "Factor-Tree-style palette: pill chips with prime/composite colouring, --palette-cell grid, .palette-tools head (bin + Delete all), add row with Randomize"
      contains: "palette-empty-btn"
    - path: "assets/i18n/venn-diagram.js"
      provides: "venn.emptyPaletteLabel, venn.paletteRandomize, venn.msg.paletteEmptied in all 16 languages"
      contains: "paletteEmptied"
    - path: ".planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js"
      provides: "V5 flipped to the new colour logic; new U sequence U1-U4 for head layout, Delete all, chip look/grid/armed, palette Randomize"
      contains: "EXPECTED = 28"
  key_links:
    - from: "Venn Diagram/venn-diagram.html renderPicker()"
      to: "isPrimeMemo(n)"
      via: "data-composite attribute on composite chips, CSS :not([data-composite]) selects primes"
      pattern: "data-composite"
    - from: "Venn Diagram/venn-diagram.html #palette-empty-btn click"
      to: "NT.store clearSharedPalette()"
      via: "adoptPalette(clearSharedPalette())"
      pattern: "adoptPalette\\(clearSharedPalette\\(\\)\\)"
    - from: "Venn Diagram/venn-diagram.html #palette-random-btn click"
      to: "NT.core randomInt / primeFactors"
      via: "pickRandomN() writes addInput.value"
      pattern: "pickRandomN"
---

<objective>
Universalize the number palette: Venn Diagram's palette becomes the same palette as Factor Tree's (Factor Tree is the reference and is NOT edited).

User decisions (from the task description, verbatim intent; cited as UD-n below):
- UD-1: Factor Tree and Venn Diagram use exactly the same palette, modelled after Factor Tree's.
- UD-2: Venn's palette obeys Factor Tree's colour logic, differentiating primes from composites.
- UD-3: Venn's palette gets the garbage-truck (Delete all) icon.
- UD-4: Venn's palette gets a Randomize button next to the number-addition field.

Purpose: one look and one set of palette tools across both tools that share the NT.store number-palette.
Output: restyled/re-laid-out Venn palette (CSS + markup + JS), three new `venn` i18n keys in 16 languages, and the pl0 shared-palette probe extended to cover the new behaviour.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md
@./.claude/CLAUDE.md

Reference implementation (read, never edit) — `Factor Tree/factor-tree.html`:
- CSS lines 59-90 (`#addBtn`, `#randomBtn`), 108-165 (`.section-head`, `.section-title`, `.palette` grid using `--palette-cell`, `.palette-item` pill + prime/composite colours, hover/focus), 324-350 (`.palette-tools`, `.palette-bin`, `.palette-empty-btn`, bin/truck SVG sizing, `.bin-lid` animation, dragging/open bin states).
- Markup lines 563-582 (controls row; `.section-head` with heading + `.palette-tools` holding `#paletteBin` and `#paletteEmptyBtn` with the garbage-truck SVG).
- JS: constants lines 635-638 (`RANDOM_MIN` 12, `RANDOM_MAX` 9999, `RANDOM_MIN_FACTORS` 3, `RANDOM_TRIES` 200); `sizePaletteCells()` line 766; `syncPaletteHeading()` line 774 (disables Delete all when empty); `pickRandomN()` + `randomBtn`/`paletteEmptyBtn` handlers lines 2035-2056.
- `assets/i18n/factor-tree.js`: keys `randomize`, `emptyPaletteLabel`, `msgPaletteEmptied` exist in all 16 languages — copy their values verbatim.

Target — `Venn Diagram/venn-diagram.html`:
- CSS lines 34-157 (`.picker-panel`, `.picker-panel h2`, `.picker-head`, `.picker-add`, `#palette-add-input`, `#palette-add-btn`, `.palette-bin`, `.bin-lid`, `body.is-chip-dragging .palette-bin`, `.palette-bin.is-open`, `.picker-hint`, `.prime-picker`, `.prime-chip` and its `:hover`/`:focus-visible`/`[aria-pressed="true"]`/`.is-dragging` rules); lines 453-459 (560px media rule for `.prime-chip`, reduced-motion transition list).
- Markup lines 553-566 (picker-panel).
- JS: import block lines 663-667; element refs lines 702-706; `setMessage(key, paramsFn, isWarn)` line 1516; `toggleArm` line 1531; `isPrimeMemo`/`syncPickerHeading`/`renderPicker`/`adoptPalette`/`addFromInput`/`removeFromPalette` lines 2059-2138; add/keydown/bin wiring lines 2140-2188.
- The toolbar `#randomize-btn` (`venn.randomize`, `randomizeDiagram()`) fills the DIAGRAM — leave it and its key untouched. The new palette Randomize is a separate button.
- Keep the class/id names `.prime-chip`, `#prime-picker`, `#palette-bin`, `#palette-add-input`, `#palette-add-btn`, `body.is-chip-dragging` — existing JS and the pl0/dn2/edj probes select by them.

Probe to extend — `.planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js`: `EXPECTED` line 27, `SEQUENCES` lines 37-42, in-page helpers lines 170-270 (`vennChips`, `msg`, `storedList`, `same`, `assert`, `noErrors`, `T`, `headingText`, `chipNamed`, `addViaField`, `dropOn`, `placedTexts`), V5 scenario lines 294-300, runner `defs[cfg.run]()` line 474.

Baseline facts (measured at planning time, HEAD 39f76c3):
- `node .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js` → `PL0-PROBE PASS (24 scenarios)` (~22 s).
- `node .planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/enter-probe.js` → `EDJ-PROBE PASS (9 scenarios)`.
- `node .planning/quick/261005-dn2-venn-diagram-double-click-on-a-chip-open/dblclick-probe.js` → `DN2-PROBE FAIL (7 pass, 1 fail, expected 8 scenarios)`, the one failure being the PRE-EXISTING `S8 two-overlap-tree-preview` (unrelated to the palette). This plan must not add a failure; it does not have to fix S8.
- `i18n-check.js --all` and `shadow-check.js --all` pass. `venn.randomize` and `factorTree.randomize` currently hold identical values in all 16 languages.
- Note: `require()`-ing i18n-check.js from another script throws (its `module.exports` references an undefined `checkSiteFooter`); run it only as a CLI.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Tracer — Delete all (garbage truck) end-to-end in Venn's palette head</name>
  <files>assets/i18n/venn-diagram.js, Venn Diagram/venn-diagram.html, .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js</files>
  <read_first>
    - Factor Tree/factor-tree.html lines 108-125, 324-350, 571-582, 766-780, 2052-2056
    - assets/i18n/factor-tree.js (the emptyPaletteLabel and msgPaletteEmptied entries, all 16 languages)
    - Venn Diagram/venn-diagram.html lines 34-120, 553-566, 663-667, 702-706, 2059-2138, 2166-2190
    - assets/i18n/venn-diagram.js (locate the register block holding addInputLabel/binLabel and the one holding msg.paletteRemoved)
    - .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js lines 20-45, 170-270, 460-570
  </read_first>
  <action>
    Wire one path — the Delete-all button — through every layer (i18n data, markup, CSS, JS, NT.store), per UD-1 and UD-3.

    1. i18n (`assets/i18n/venn-diagram.js`): add `emptyPaletteLabel` next to `binLabel` and `msg.paletteEmptied` next to `msg.paletteRemoved`, in all 16 languages, copying the values of Factor Tree's `emptyPaletteLabel` and `msgPaletteEmptied` VERBATIM per language (they already pass the ru/el script rules). Use the same quoting style as the neighbouring Venn keys. Mention the two keys in the file's header comment if it enumerates keys.

    2. Markup (`Venn Diagram/venn-diagram.html`, picker-panel): inside `.picker-head`, after `#picker-heading`, add a `div.palette-tools`. MOVE the existing `#palette-bin` div (unchanged attributes, keeps `venn.binLabel`) out of `.picker-add` into `.palette-tools`, then add `button#palette-empty-btn.palette-empty-btn` (type="button") after it, with English fallback aria-label and title "Delete all: empty the palette", `data-i18n-aria-label="venn.emptyPaletteLabel"` and `data-i18n-title="venn.emptyPaletteLabel"`, containing Factor Tree's garbage-truck SVG copied byte-for-byte from `#paletteEmptyBtn` (same viewBox, paths, circles, `aria-hidden="true" focusable="false"`). `.picker-add` now holds only the input and Add (Task 2 adds Randomize).

    3. CSS (Venn `<style>`): make the palette-head layout and tool styling identical to Factor Tree's:
       - `.picker-head` gets Factor Tree's `.section-head` declarations (flex, space-between, align-items center, gap 10px, margin 0 0 8px).
       - `.picker-panel h2` gets Factor Tree's `.section-title` typography (font-sans, .85rem, weight 600, text-dim colour, margin 0) — Claude's discretion under UD-1: the heading is part of the palette widget, so it matches FT; the bordered `.picker-panel` frame itself stays (it is Venn's page container).
       - Add `.palette-tools` and `.palette-empty-btn` rules copied verbatim from Factor Tree (hover = role-warn on role-warn-soft, focus-visible = `var(--ctl-focus)`, disabled = opacity .4), and replace Venn's `.palette-bin` and `.palette-bin svg` declarations with Factor Tree's shared `.palette-bin, .palette-empty-btn` / `... svg` declarations (40x40, `border:1px dashed transparent` at rest, 26px icons, stroke 1.7). Keep `flex:none` on the bin harmlessly or drop it.
       - Keep Venn's dragging hook class: `body.is-chip-dragging .palette-bin` gets FT's `body.is-dragging .palette-bin` declarations; `.palette-bin.is-open` keeps its current (unqualified) selector with FT's open colours; keep `.bin-lid` and the open-lid transform.
       - Add `.palette-empty-btn` to the reduced-motion `transition:none` list.
       - Only `var(--token)` colours; the keyword `transparent` is allowed (FT precedent). No hex, rgb()/rgba(), hsl()/hsla() or named colour.

    4. JS (Venn IIFE):
       - Add `clearSharedPalette` to the NT.store import line, keeping names sorted by code point (it goes right after `addToSharedPalette`). Do not declare any local name that shadows an NT import.
       - Add `var paletteEmptyBtn = document.getElementById('palette-empty-btn');` with the other element refs (lines ~702-706), before any `renderPicker()` call.
       - In `syncPickerHeading()` set `paletteEmptyBtn.disabled = palette.length === 0;` (mirrors FT's `syncPaletteHeading`), so it re-syncs on every render, add, remove, storage event and pageshow.
       - Next to the add-button wiring, add a click handler: `adoptPalette(clearSharedPalette())` (adoptPalette already drops an armed value that is no longer in the list), then `setMessage('venn.msg.paletteEmptied', null, false)`, then `addInput.focus()`. Do not touch placed regions, mode or the diagram.

    5. Probe (`shared-palette-probe.js`): add a new sequence `{ name: "U", runs: [["venn", "U"]] }` (fresh profile → default 30 primes) and `defs.U` returning:
       - `U1 venn-palette-head`: `.picker-head .palette-tools` exists and its element children are exactly `#palette-bin` then `#palette-empty-btn`; `.picker-add` no longer contains `#palette-bin`; both tools' bounding rects are 40x40; the tools' left edge is right of `#picker-heading`'s right edge; `#palette-empty-btn` aria-label and title both equal `T("venn.emptyPaletteLabel")`; it holds an svg; it is enabled; `noErrors`.
       - `U2 venn-delete-all`: click chip "7" so its aria-pressed is "true"; click `#palette-empty-btn`; assert `vennChips()` is `[]`, `storedList()` is `[]`, `msg() === T("venn.msg.paletteEmptied")`, `document.activeElement` is `#palette-add-input`, the button is disabled, `headingText() === T("venn.picker.heading")`; then `addViaField("7")` and assert the new chip 7 has aria-pressed "false" (armed was cleared) and the button is enabled again; then `NT.i18n.setLang("de")` and assert the button's aria-label equals `T("venn.emptyPaletteLabel")` and differs from the English text; `noErrors`.
       - Raise `EXPECTED` from 24 to 26 and add a header-comment line noting quick task 261006-dso extended the probe.
  </action>
  <verify>
    <automated>node .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js && node .planning/phases/06-multi-language-support/i18n-check.js --all && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all</automated>
  </verify>
  <done>Probe prints `PL0-PROBE PASS (26 scenarios)` (U1, U2 included); i18n-check --all and shadow-check --all pass; in Venn the bin and garbage truck sit right of the heading, Delete all empties the shared palette, shows the translated message, focuses the add field and is disabled while the palette is empty.</done>
</task>

<task type="auto">
  <name>Task 2: Factor-Tree chip look and colour logic, column grid, and palette Randomize in Venn</name>
  <files>Venn Diagram/venn-diagram.html, assets/i18n/venn-diagram.js, .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js</files>
  <read_first>
    - Factor Tree/factor-tree.html lines 59-90, 126-165, 563-567, 635-638, 726-731, 766-770, 2035-2050
    - Venn Diagram/venn-diagram.html lines 56-92, 119-157, 453-459, 1531-1540, 2066-2100, 2140-2152
    - .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js lines 294-300 (V5) and the U sequence added in Task 1
  </read_first>
  <action>
    Per UD-1 and UD-2 (chips) and UD-4 (Randomize). Factor Tree stays untouched.

    1. Chip look (CSS, keep the `.prime-chip` / `#prime-picker` names):
       - `.prime-picker`: replace the flex-wrap layout with Factor Tree's `.palette` grid — `display:grid`, `grid-template-columns:repeat(auto-fill, var(--palette-cell, 44px))`, `justify-items:center`, `gap:8px`, margin 0 (the panel already pads).
       - `.prime-chip`: replace its declarations with Factor Tree's `.palette-item` set — inline-flex centred, min-width 44px, height 44px, padding 0 10px, border-radius 22px, 1px border + background `var(--role-composite)`, colour `var(--role-composite-ink)`, font-sans 700 .9375rem, tabular-nums, `cursor:grab`, `user-select:none` (+ -webkit-), `transition:filter var(--ease-ctl)`. Do NOT copy `touch-action:none` (Venn uses HTML5 drag plus click/tap-to-arm; blocking touch panning over the palette would hurt mobile scrolling).
       - `.prime-chip:not([data-composite])`: border and background `var(--role-result)`, colour `var(--accent-ink)` (FT's prime rule).
       - Hover `filter:brightness(1.08)`; `.prime-chip:focus{outline:none}`; `.prime-chip:focus-visible{box-shadow:var(--ctl-focus)}` (FT's), replacing Venn's border-colour hover and outline focus ring.
       - Armed state WITHOUT touching the fill: `.prime-chip[aria-pressed="true"], .prime-chip[aria-pressed="true"]:focus` → `outline:2px solid var(--role-active); outline-offset:2px;` placed AFTER the `:focus{outline:none}` rule so a focused armed chip keeps its ring (4px reach stays inside the 8px grid gap). Remove the old armed background/colour/border override.
       - `.prime-chip.is-dragging`: keep only `opacity:.4` (drop the `--role-inert` background).
       - Delete the now-redundant `@media (max-width:560px)` `.prime-chip` 44px rule (chips are 44px everywhere).
       - No literal colours (tokens only).

    2. Chip colour logic and column sizing (JS):
       - In `renderPicker()`, when a chip's number is not prime (`!isPrimeMemo(prime)`), set the `data-composite` attribute (empty value), exactly as FT's `addPaletteItem` does.
       - Add `sizePickerCells()` modelled on FT's `sizePaletteCells()`: start at 44, take the max `offsetWidth` over `#prime-picker .prime-chip`, write it to the picker as the `--palette-cell` custom property (`picker.style.setProperty`). Call it at the end of `renderPicker()` and once from `document.fonts.ready` when `document.fonts` exists.

    3. Add-row controls and Randomize:
       - CSS: `#palette-add-input` and `#palette-add-btn` height 36px → 40px; `.picker-add` gap 8px → 10px (FT's `.controls`). Add `#palette-random-btn` with Factor Tree's `#randomBtn` declarations and hover verbatim. Add `#palette-random-btn` to the reduced-motion list.
       - Markup: add `<button id="palette-random-btn" type="button" data-i18n="venn.paletteRandomize">Randomize</button>` immediately after `#palette-add-btn`.
       - i18n: add `paletteRandomize` to the `venn` namespace in all 16 languages, values copied verbatim from Factor Tree's `randomize` (a separate key from the toolbar's `venn.randomize` so the two actions can diverge later).
       - JS: add `randomInt` to the NT.core import line (sorted: `euclidSteps, gcd, isPrime, primeFactors, randomInt`). Add `var paletteRandomBtn = document.getElementById('palette-random-btn');` with the element refs. Add constants in Venn's `var` style — `PALETTE_RANDOM_MIN = 12`, `PALETTE_RANDOM_MAX = 9999`, `PALETTE_RANDOM_MIN_FACTORS = 3`, `PALETTE_RANDOM_TRIES = 200` — and `pickRandomN()` ported from FT: read the shown value as `Number(addInput.value)`; a candidate is acceptable when it differs from it and `primeFactors(n).length >= PALETTE_RANDOM_MIN_FACTORS`; try `randomInt(min, max)` up to TRIES times, then scan min..max linearly, then fall back to min. Click handler sets `addInput.value = pickRandomN()` only — no add, no message, no focus change (FT behaviour). Do not touch `#randomize-btn` / `randomizeDiagram()`.

    4. Probe (`shared-palette-probe.js`):
       - Flip V5 (intentional change, record as a deviation in the SUMMARY): keep the className checks; assert chip 73 has no `data-composite` and chip 77 has it; their computed backgroundColors differ; using an in-page helper that resolves a token by appending a temporary span inside `.picker-panel` with the inline style property set to `var(--token)` and reading its computed value, assert 73's background equals `--role-result` and text colour equals `--accent-ink`, and 77's background equals `--role-composite` and text colour equals `--role-composite-ink`. Rename the scenario to `V5 venn-chip-colours-prime-vs-composite` and update its return text.
       - Append to `defs.U`: `U3 venn-chip-look-grid-armed`: `#prime-picker` computed display is `grid`; every chip's offsetHeight is 44 and computed borderTopLeftRadius is `22px`; `addViaField("1024")`, then the picker's `--palette-cell` inline value equals the max chip offsetWidth plus `px` and exceeds 44; with `cols` = number of chips sharing the first chip's top, every chip i and chip i+cols have equal rounded centre-x; record chip "5"'s computed background, click it, re-find it: aria-pressed "true", background unchanged, computed outlineStyle not `none`, outlineColor equals resolved `--role-active`; click again: outlineStyle `none`; dispatch a `dragstart` DragEvent (with a DataTransfer) on chip "1024": it gains `is-dragging`, computed opacity < 1 and its background still equals resolved `--role-composite`; dispatch `dragend`; `noErrors`.
       - `U4 venn-palette-randomize`: `#palette-random-btn` previousElementSibling is `#palette-add-btn`, its height is 40, its text equals `T("venn.paletteRandomize")`; snapshot `vennChips()`, `storedList()` and `placedTexts()`; click it 25 times, each time asserting the field value is an integer in [12, 9999], has at least 3 prime factors counted with multiplicity by the probe's own trial division, and differs from the previous value; afterwards the three snapshots are unchanged; then click `#palette-add-btn` and assert the randomized number is now a chip carrying `data-composite`; `noErrors`.
       - Raise `EXPECTED` from 26 to 28.
  </action>
  <verify>
    <automated>node .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js && node .planning/phases/06-multi-language-support/i18n-check.js --all && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all && node .planning/phases/07-shared-js-module-refactor/harness.js && node .planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/enter-probe.js && node .planning/quick/261005-dn2-venn-diagram-double-click-on-a-chip-open/dblclick-probe.js 2>&1 | tr '\n' '|' | grep -Eq 'DN2-PROBE PASS|FAIL S8 two-overlap-tree-preview.*DN2-PROBE FAIL \(7 pass, 1 fail' && git diff --quiet 39f76c3 -- "Factor Tree/factor-tree.html" assets/i18n/factor-tree.js assets/nt-core.js assets/nt-store.js assets/palette.css assets/site.css && git diff -U0 39f76c3 -- "Venn Diagram/venn-diagram.html" > "${TMPDIR:-/tmp}/dso-venn.diff" && ! grep -Ei '^\+.*(#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\b(black|white|red|green|blue|gr[ae]y|yellow|orange|purple|pink|silver)\b)' "${TMPDIR:-/tmp}/dso-venn.diff"</automated>
    <human-check>Open `Venn Diagram/venn-diagram.html` and `Factor Tree/factor-tree.html` side by side in day and night themes: palette chips/circles, heading, bin, garbage truck, Add and Randomize look the same; an armed Venn chip shows a gold ring over its green/blue fill.</human-check>
  </verify>
  <done>Probe prints `PL0-PROBE PASS (28 scenarios)`; i18n-check, shadow-check, harness and the edj probe pass; the dn2 probe shows no failure beyond the pre-existing S8; Factor Tree and shared assets are byte-identical to 39f76c3; no literal colour was added to Venn; Venn chips are FT-style pills coloured prime vs composite in aligned columns, armed/dragging remain distinct, and the palette Randomize fills the add field without adding.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| localStorage/cookie -> Venn page | the shared number-palette may be hand-edited or written by another same-origin tool or tab |
| Add field -> palette | free user text (existing validation in addFromInput, unchanged) |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-dso-01 | Tampering | renderPicker chip text / data-composite | low | mitigate | chips still read the list only through NT.store's validating readers (loadSharedPalette/readSharedPalette/clearSharedPalette return values); chip text set via textContent, never innerHTML |
| T-dso-02 | Denial of Service | pickRandomN | low | mitigate | bounded search: at most PALETTE_RANDOM_TRIES random draws, then one linear scan of 12..9999 with trial-division primeFactors on 4-digit numbers, then a constant fallback |
| T-dso-03 | Information Disclosure | Delete all | low | accept | only clears the public, non-sensitive shared number list; no new storage keys, payload shape unchanged (NT.store contract preserved) |
| T-dso-SC | Tampering | npm/pip/cargo installs | low | accept | no package installs in this plan; vanilla HTML/CSS/JS only |
</threat_model>

<verification>
- `node .planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js` → `PL0-PROBE PASS (28 scenarios)`.
- `node .planning/phases/06-multi-language-support/i18n-check.js --all` and `node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all` pass; `node .planning/phases/07-shared-js-module-refactor/harness.js` passes.
- edj enter-probe passes; dn2 dblclick-probe has no failure other than the pre-existing S8.
- `git diff --quiet 39f76c3 -- "Factor Tree/factor-tree.html" assets/i18n/factor-tree.js assets/nt-core.js assets/nt-store.js assets/palette.css assets/site.css` (Factor Tree and shared assets untouched).
- No added Venn line (diff vs 39f76c3, captured to a file first so a git failure is not swallowed) matches the literal-colour regex in Task 2's verify.
</verification>

<success_criteria>
- Venn's palette is visually and behaviourally Factor Tree's palette: same pill chips with prime/composite colours, aligned columns, heading + bin + garbage truck head, Add + Randomize row (UD-1..UD-4).
- Armed and dragging chips are distinguishable without losing their prime/composite colour.
- Existing Venn interactions and the toolbar Randomize still work; Factor Tree unchanged.
- Three new `venn` keys in all sixteen languages; all checks green.
</success_criteria>

<output>
Create `.planning/quick/261006-dso-universalify-the-prime-number-palette-ve/261006-dso-SUMMARY.md` when done
</output>
