---
phase: quick-261005-edj
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "Venn Diagram/venn-diagram.html"
  - "assets/i18n/venn-diagram.js"
  - ".planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/enter-probe.js"
autonomous: true
requirements: [QUICK-VENN-ENTER-01, QUICK-VENN-PREVIEW-LABELS-01]

estimate:
  tokens: 45000
  raw_tokens: 45000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "With previews on, hovering a previewable chip and pressing Enter opens the same target a double-click would: Factor Tree while the panel is at the top, the Euclidean Algorithm page once it is scrolled to the Euclidean section"
    - "Keyboard-only: Tab to the chip (its preview shows), ArrowDown to the Euclidean section, Enter opens the Euclidean Algorithm page"
    - "Three-circle mode behaves the same: a pairwise chip scrolled to its Euclidean section opens Euclid on Enter, the centre chip opens Factor Tree"
    - "With no preview showing, Enter is untouched: regions still place primes, tokens are still removed, buttons and links still activate"
    - "Enter typed into an input, textarea or select, Enter with Ctrl/Alt/Shift/Meta held, and auto-repeated Enter are never turned into an open, so holding Enter opens at most one tab"
    - "While a preview is showing, Enter opens it INSTEAD of the focused control's own Enter action, never in addition to it"
    - "The toolbar shows 'Previews off' first and 'Previews on' second, the group is labelled 'Hover previews', with natural translations in all sixteen languages; a stored 'venn-diagram-thumbnails' value of 'on' or 'off' still restores the setting"
    - "Double-clicking a chip behaves exactly as before (the 261005-dn2 probe still passes 7/7)"
  artifacts:
    - "Venn Diagram/venn-diagram.html"
    - "assets/i18n/venn-diagram.js"
    - ".planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/enter-probe.js"
  key_links:
    - "appendCompositeBadge: the dblclick listener and the chip's g._npOpen expando call ONE openSectionInView function, which reads link.previewLayer._npOffset at activation time and calls openXref"
    - "document keydown listener (capture phase) -> active-mode preview layer (previewLayer or previewLayer3 by state.mode) -> layer._npOwner with layer.firstChild -> owner._npOpen()"
    - "#thumbs-off / #thumbs-on data-i18n keys venn.thumbs.off / venn.thumbs.on and the group's venn.toolbar.thumbs -> assets/i18n/venn-diagram.js values in all sixteen languages; THUMBS_STORAGE_KEY stays 'venn-diagram-thumbnails'"
---

<objective>
Make Enter open the Venn Diagram preview that is showing, rename the user-facing "thumbnails" toggle to "previews", and put "Previews off" first.

Purpose: Today the only way to open a chip's preview target is a double-click, so a keyboard user who tabs to a chip and scrolls its preview with ArrowDown can't open it. A mouse user hovering a chip has no single-key shortcut either. The toggle also calls the feature "thumbnails" while the rest of the code and the user call it a preview.

How it works today (the planner checked this in the source; the line numbers are from the current file):
- A previewable composite chip is an SVG `g` with `tabindex="0"`, built in `appendCompositeBadge` (about line 1960). Its `mouseenter` and `focus` listeners both call `showOwnPreview` (about line 2044). That function calls `showRegionPreview(layer, opts, g)`, which builds the panel inside the shared layer (`#venn-preview` / `previewLayer` for two circles, `#venn3-preview` / `previewLayer3` for three) and records the chip as `layer._npOwner`. `mouseleave` and `blur` call `hideNestedPreview`, which empties the layer and resets `_npOwner` to null. So "a preview is showing" is the same as "the active layer has a child node and an `_npOwner`".
- Opening is the chip's `dblclick` handler (about line 2007). It reads `link.previewLayer._npOffset` at click time. Below `NP_MAX_SCROLL / 2` it opens the chip's `data-xref-tree-href` (Factor Tree), otherwise its `data-xref-href` (Euclidean Algorithm). It goes through `openXref(href, label)` (about line 2236), which calls `window.open(href, '_blank')`, nulls `opener` and posts a status message. If the section in view has no target, nothing happens.
- Enter is already used elsewhere on the page: interactive regions place the armed prime (about line 1284), and placed tokens are removed on Enter (about lines 2129 and 2317). Both call preventDefault. Native `button`, `a`, `select` and checkbox controls also respond to Enter. The page has no text inputs. Its only form controls are `#lang-switch-select` and the `#theme-switch-input` checkbox.

Design decisions (these are the planner's choices; the executor implements them as written):
- ED-1: The click logic is not duplicated. The dblclick body becomes one `openSectionInView` function. The dblclick listener calls it, and the chip exposes it as the expando `g._npOpen`, the same per-node `_np*` style as `_npOffset` and `_npOwner`. Enter and double-click therefore always open the same target.
- ED-2: One document-level `keydown` listener in the capture phase handles Enter for both paths: a hovered chip (focus may be anywhere) and a focused chip (the event's target is the chip). Capture phase lets it run before a focused region's or token's own Enter listener. preventDefault plus stopPropagation make Enter do exactly one thing, opening the preview, instead of also placing a prime or clicking the focused button. That is the "preview visible, so overriding is appropriate" case in the request.
- ED-3: Enter is never intercepted when the event target (or an ancestor) is an input, textarea or select element or is contentEditable, when Ctrl/Alt/Shift/Meta is held, during IME composition, or when no preview is showing in the active mode. An auto-repeated Enter while a preview shows is consumed but opens nothing. Holding Enter therefore can't open a pile of tabs, and the focused control can't fire either.
- ED-4: Only the active mode's layer counts (`state.mode === 'three'` selects `previewLayer3`, otherwise `previewLayer`). That is the only preview the user can see.
- ED-5: Only the user-facing words change. The DOM ids `thumbs-on`/`thumbs-off`, the i18n keys `venn.toolbar.thumbs`/`venn.thumbs.on`/`venn.thumbs.off`, the `state.thumbsEnabled` / `applyThumbs` / `setThumbs` identifiers and the localStorage key `venn-diagram-thumbnails` with its stored `'on'`/`'off'` values all stay as they are, so persisted settings keep working.

Output: Enter handling in `Venn Diagram/venn-diagram.html`; renamed and reordered toggle markup; sixteen-language values in `assets/i18n/venn-diagram.js`; and a dev-only headless-Chrome probe, `.planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/enter-probe.js`, modelled on the 261005-dn2 probe.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

Source file (the path has a space, so read it directly): `Venn Diagram/venn-diagram.html`
- lines 467-474: toolbar markup; the "Hover thumbnails" `mode-switch` group with `#thumbs-on` and then `#thumbs-off`
- lines 625 and 772: `previewLayer` / `previewLayer3`; line 765: `THUMBS_STORAGE_KEY`; line 943: `state` (`mode`, `thumbsEnabled`, `openPreview`)
- lines 964-970: `hideNestedPreview`; lines 1162-1170: top of `showRegionPreview` (records `_npOwner`)
- lines 1278-1320: `createRegion` (region Enter handler) and `buildRegions` (ids `region-left`, `region-overlap`, `region-right`)
- lines 1959-2075: `appendCompositeBadge`: the dblclick handler at 2006-2026, `showOwnPreview` and the show/hide listeners at 2044-2052, the wheel/ArrowUp/ArrowDown handlers at 2057-2072
- lines 2236-2245: `openXref`
- lines 2466-2512: `readStoredThumbs`, `applyThumbs`, `setThumbs`, `setMode` and the toolbar click wiring; the new Enter listener goes right after line 2512
- lines 2514-2537: `rerenderOnLangChange` (leave it untouched)

Dictionary: `assets/i18n/venn-diagram.js`. One `NT.i18n.register('venn', { ... })` call with one block per language (nl starts on line 22, en 82, de 142, fr 202, es 262, it 322, pl 382, pt-BR 442, pt-PT 502, sv 562, nb 622, ro 682, hu 742, lv 802, ru 862, el 922). In each block the keys `'toolbar.thumbs'`, `'thumbs.on'` and `'thumbs.off'` sit on the block's 9th, 12th and 13th lines.

Probe to model on (copy its runner and do not reinvent it): `.planning/quick/261005-dn2-venn-diagram-double-click-on-a-chip-open/dblclick-probe.js`. It builds a scratch site with `harness.mkScratch`, injects a `pre` and a load-time script before the last closing body tag, stubs `window.open` to capture hrefs, dispatches synthetic events, runs `google-chrome --headless=new ... --dump-dom` with `harness.chromeEnv()`, and counts PASS lines against `EXPECTED`. It passes 7/7 on the current tree in about 2 s. The fresh-profile seed for two circles is the overlap chip value 5 with pair a=30, b=35 (Euclid href prefix `../Euclidean Algorithm/euclidean-algorithm.html?a=30&b=35`, Factor Tree prefix `../Factor Tree/factor-tree.html?n=5`). Previews default to on. `NP_MAX_SCROLL` is 206 and one ArrowDown step is 49.
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Enter opens the previewed chip's target (RED probe first, then one shared open function and a capture-phase Enter listener)</name>
  <files>.planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/enter-probe.js, Venn Diagram/venn-diagram.html</files>
  <read_first>
    - .planning/quick/261005-dn2-venn-diagram-double-click-on-a-chip-open/dblclick-probe.js (the whole file: runner, `scenario`/`assert`/`ev`/`chip`/`reset` helpers)
    - Venn Diagram/venn-diagram.html lines 1278-1290, 1959-2075, 2236-2245, 2466-2512
  </read_first>
  <behavior>
    - E1 two-hover-enter-top: overlap chip, mouseenter, then Enter dispatched on document.body is cancelled and opens an href starting with `../Factor Tree/factor-tree.html?n=5`
    - E2 two-hover-scrolled-enter: mouseenter plus a wheel (offset 206), then Enter on body opens `../Euclidean Algorithm/euclidean-algorithm.html?a=30&b=35...`
    - E3 two-keyboard-only-enter: focus plus 5 ArrowDown keydowns on the chip (offset 206), then Enter dispatched on the chip itself opens the Euclid href, and the panel's first child is the same node afterwards
    - E4 no-preview-enter-inert: with the overlap chip reset (no preview), Enter on body is not cancelled and opens nothing
    - E5 pass-through: with a preview showing, Enter on a temporary text input, Enter on `#lang-switch-select`, and Ctrl+Enter on body are each not cancelled and open nothing
    - E6 preview-wins-and-repeat: with a preview showing, Enter dispatched on `#region-left` is cancelled, opens the Factor Tree href, and never reaches a probe listener on that region; then a `repeat: true` Enter on body is cancelled but opens nothing
    - E7 three-circle: after clicking `#mode-three`, the `ab` chip (mouseenter plus wheel, then Enter on body) opens a Euclid href starting with `../Euclidean Algorithm/euclidean-algorithm.html?a=`, and the `abc` chip (mouseenter, then Enter) opens one starting with `../Factor Tree/factor-tree.html?n=`; finally click `#mode-two`
    - On the unedited page E1, E2, E3, E6 and E7 FAIL. E4 and E5 assert that nothing happens, so they pass on the old page too. The probe exits 1, and that is the RED proof
  </behavior>
  <action>
Part A: the probe, written and run BEFORE touching the page (RED).

Create `.planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/enter-probe.js`. Start from a copy of the 261005-dn2 `dblclick-probe.js` and keep its runner functions (`buildSite`, `unescapeHtml`, `runChrome`, `main`), its harness usage, its fresh-profile Chrome flags and its PASS/FAIL counting exactly. Rename the scratch prefixes to `edj-site-` / `edj-profile-`, the output element id to `edj-out` and the summary words to `EDJ-PROBE PASS` / `EDJ-PROBE FAIL`. Update the header comment to name quick task 261005-edj and its purpose. Keep the "use strict" ES5 style, Node built-ins only and the in-repo harness. The probe stays dev-only and no page references it.

Keep the injected helpers `scenario`, `assert`, `ev`, `chip`, `reset` and `lastHref`, and keep the `window.open` stub. Add these helpers:
- `enter(el, extra)`: build a keydown KeyboardEvent with key 'Enter', bubbles true, cancelable true, plus any extra init fields (ctrlKey, repeat). Dispatch it on `el` and return whether it was cancelled (the negation of `dispatchEvent`'s return value).
- `opened(fn)`: record the captured-hrefs length, run fn, and return the hrefs added since.

Write scenarios E1 through E7 as described in `<behavior>`, in that order. Each starts by resetting its own chip so the preview layer is empty. For E5, create an `input` element with type text, append it to the body, dispatch Enter on it and remove it in a finally block. For E6, add a probe keydown listener to `#region-left` that sets a flag, then remove it afterwards. Chips: `#venn-composite-dynamic [data-region="overlap"]` with layer `#venn-preview`, and, after `document.getElementById('mode-three').click()`, `#venn3-composite-dynamic [data-region="ab"]` / `[data-region="abc"]` with layer `#venn3-preview`. Re-query chips after any mode switch, because render() rebuilds them. Do not hard-code the three-circle a/b values; assert on the href prefix only. Every failed assertion message names the observed value (cancelled flag, href, offset). Set `EXPECTED` to 7.

Run the probe against the unedited page. It MUST exit 1 with FAIL lines for at least E1, E2, E3, E6 and E7. Paste that RED output into the SUMMARY. If E1 passes before the fix, the probe is wrong: fix the probe, not the page.

Part B: the page change in `Venn Diagram/venn-diagram.html` (GREEN). Match the surrounding style: ES5 `var` and function expressions, 2-space indent, explanatory comments at the density of the neighbouring code. Add no new user-visible strings, no innerHTML and no `NT` change.
- In `appendCompositeBadge`, inside the existing `if (hasAnyHref)` block, move the dblclick body (offset read, midpoint choice, missing-target no-op, `openXref` call) into a function expression `openSectionInView` that takes no argument (per ED-1). Rewrite the existing "Resolved at click time" comment to say the offset is read at activation time (double-click or Enter). The dblclick listener becomes a call to `ev.preventDefault()` followed by `openSectionInView()`. Then set `g._npOpen = openSectionInView;` with a one-line comment that the page-level Enter listener calls it on the chip whose preview is showing. Chips without any href get no `_npOpen`, so Enter over them stays inert.
- Right after the `thumbsOffBtn` click wiring (current line 2512) and before the "i18n re-render (P7)" section, add a section comment and one `document.addEventListener('keydown', ..., true)` listener (capture phase, per ED-2) with a comment explaining why. It returns without doing anything unless all of these hold (per ED-3/ED-4): the key is 'Enter'; none of altKey, ctrlKey, metaKey or shiftKey is set and `isComposing` is false; the event target is not inside an input, textarea or select (use `target.closest` guarded by a typeof check, because the target may be the document) and not `isContentEditable`; and the active-mode layer (`previewLayer3` when `state.mode === 'three'`, otherwise `previewLayer`) has a `firstChild` and an `_npOwner` whose `_npOpen` is a function. When all hold, it calls `ev.preventDefault()` and `ev.stopPropagation()`, then calls `owner._npOpen()` only when `ev.repeat` is false.
- Leave `showOwnPreview`, the mouseenter/mouseleave/focus/blur/wheel/ArrowUp/ArrowDown listeners, `showRegionPreview`, `hideNestedPreview`, `openXref` and `rerenderOnLangChange` unchanged.

Re-run the new probe; it must exit 0. Re-run the 261005-dn2 probe; it must still print `DN2-PROBE PASS (7 scenarios)`, which proves the dblclick refactor changed nothing.
  </action>
  <verify>
    <automated>node ".planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/enter-probe.js" && node ".planning/quick/261005-dn2-venn-diagram-double-click-on-a-chip-open/dblclick-probe.js"</automated>
  </verify>
  <acceptance_criteria>
    - The new probe exited 1 on the unedited page with E1/E2/E3/E6/E7 FAIL (the RED output is recorded in the SUMMARY), and after the fix it exits 0 printing `EDJ-PROBE PASS (7 scenarios)`
    - The 261005-dn2 probe still exits 0 printing `DN2-PROBE PASS (7 scenarios)`
    - `grep -c "openSectionInView" "Venn Diagram/venn-diagram.html"` is >= 3 (definition, dblclick call, `_npOpen` assignment)
    - `grep -c "_npOpen" "Venn Diagram/venn-diagram.html"` is >= 2 (assignment in appendCompositeBadge, call in the Enter listener)
    - `grep -n "addEventListener('keydown'" "Venn Diagram/venn-diagram.html"` shows exactly one new `document.addEventListener` line in addition to the five existing element-level ones
  </acceptance_criteria>
  <done>Pressing Enter while a chip's preview is showing opens that preview's section-in-view target (the same target a double-click opens) on both the hover path and the keyboard-focus path, in both modes. With no preview, in form controls, with modifiers or on auto-repeat, Enter does not open anything, and double-click is unchanged.</done>
</task>

<task type="auto">
  <name>Task 2: Rename the toggle to "Previews off" / "Previews on" (off first) in markup and all sixteen languages, and extend the probe to cover the labels, order and storage key</name>
  <files>Venn Diagram/venn-diagram.html, assets/i18n/venn-diagram.js, .planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/enter-probe.js</files>
  <read_first>
    - Venn Diagram/venn-diagram.html lines 467-474 and 2466-2512
    - assets/i18n/venn-diagram.js lines 1-40 (header comment and the nl block) and, for each other language, the block's `'toolbar.thumbs'` / `'thumbs.on'` / `'thumbs.off'` lines
    - .planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/enter-probe.js (as written in Task 1)
  </read_first>
  <action>
Markup in `Venn Diagram/venn-diagram.html` (per ED-5 only words and order change):
- On the toolbar's second `mode-switch` group, change the English fallback `aria-label` to `Hover previews`. Keep `data-i18n-aria-label="venn.toolbar.thumbs"`.
- Swap the two buttons so the `#thumbs-off` button comes first and the `#thumbs-on` button second. Keep each button's id, class, `aria-pressed` default (`thumbs-on` stays `true`, `thumbs-off` stays `false`, because previews default to on) and its `data-i18n` key. Change their English fallback text to `Previews off` and `Previews on`.
- Do not touch `THUMBS_STORAGE_KEY`, `readStoredThumbs`, `applyThumbs`, `setThumbs`, the click wiring or any internal comment that says thumbnails.

Dictionary `assets/i18n/venn-diagram.js`: in each of the sixteen language blocks, replace only the values of `'toolbar.thumbs'`, `'thumbs.on'` and `'thumbs.off'` with the strings below (group label / on / off). Keep the keys, their order and the quoting style. In the file's header comment, change the phrase listing the "toolbar/mode/..." labels so it says preview-toggle labels.
- nl: `Hover-voorvertoningen` / `Voorvertoningen aan` / `Voorvertoningen uit`
- en: `Hover previews` / `Previews on` / `Previews off`
- de: `Hover-Vorschau` / `Vorschau an` / `Vorschau aus`
- fr: `Aperçus au survol` / `Aperçus activés` / `Aperçus désactivés`
- es: `Vistas previas al pasar el cursor` / `Vistas previas activadas` / `Vistas previas desactivadas`
- it: `Anteprime al passaggio del cursore` / `Anteprime attive` / `Anteprime disattivate`
- pl: `Podgląd po najechaniu` / `Podgląd włączony` / `Podgląd wyłączony`
- pt-BR: `Pré-visualizações ao passar o mouse` / `Pré-visualizações ativadas` / `Pré-visualizações desativadas`
- pt-PT: `Pré-visualizações ao passar o rato` / `Pré-visualizações ativadas` / `Pré-visualizações desativadas`
- sv: `Förhandsvisningar vid hovring` / `Förhandsvisningar på` / `Förhandsvisningar av`
- nb: `Forhåndsvisninger ved hover` / `Forhåndsvisninger på` / `Forhåndsvisninger av`
- ro: `Previzualizări la survolare` / `Previzualizări activate` / `Previzualizări dezactivate`
- hu: `Előnézet rámutatáskor` / `Előnézet be` / `Előnézet ki`
- lv: `Priekšskatījumi, pārvietojot kursoru` / `Priekšskatījumi ieslēgti` / `Priekšskatījumi izslēgti`
- ru: `Предпросмотр при наведении` / `Предпросмотр включён` / `Предпросмотр выключен` (all Cyrillic)
- el: `Προεπισκοπήσεις στο πέρασμα` / `Προεπισκοπήσεις ενεργές` / `Προεπισκοπήσεις ανενεργές` (all Greek)

Probe: add two scenarios after E7 and raise `EXPECTED` to 9.
- E8 toolbar-order-and-storage: inside the toolbar group, `#thumbs-off`'s nextElementSibling is `#thumbs-on`. In en, their textContent is exactly `Previews off` and `Previews on`, and the group's aria-label is `Hover previews`. Clicking `#thumbs-off` makes `localStorage.getItem('venn-diagram-thumbnails')` equal `off` and removes the `is-previewable` class from the re-queried two-circle overlap chip. A mouseenter on that chip followed by Enter on body is not cancelled and opens nothing. Clicking `#thumbs-on` makes the stored value `on` and the re-queried chip gets `is-previewable` back.
- E9 labels-all-languages (keep it LAST, because it changes the language): embed the sixteen-language table above in the probe as a JSON object of three-string arrays, built on the Node side with JSON.stringify and spliced into the injected script. For each language, call `NT.i18n.setLang(code)`, then compare `#thumbs-off` and `#thumbs-on` textContent and the group's aria-label against the table, collecting mismatches. Fail with the mismatch list, or pass with `16 languages x 3 labels`.

Run the probe, the 261005-dn2 probe and the i18n gate for this page. The gate's coverage mode includes the ru/el script rule.
  </action>
  <verify>
    <automated>node ".planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/enter-probe.js" && node ".planning/quick/261005-dn2-venn-diagram-double-click-on-a-chip-open/dblclick-probe.js" && node .planning/phases/06-multi-language-support/i18n-check.js "Venn Diagram/venn-diagram.html"</automated>
    <human-check>Open `Venn Diagram/venn-diagram.html` straight from disk (file://). (1) The toolbar reads "Previews off" then "Previews on", with "Previews on" pressed. (2) Hover the overlap chip and press Enter: Factor Tree opens in a new tab. Hover again, wheel-scroll to the Euclidean section, press Enter: the Euclidean Algorithm page opens. (3) Tab to the overlap chip, press ArrowDown until the Euclidean section shows, press Enter: Euclid opens. (4) Click "Previews off", reload: it stays off and hovering shows nothing, so Enter does nothing. Turn previews back on. (5) Switch the header language to Deutsch and Русский: the toggle reads "Vorschau aus / Vorschau an" and "Предпросмотр выключен / Предпросмотр включён".</human-check>
  </verify>
  <acceptance_criteria>
    - The probe exits 0 printing `EDJ-PROBE PASS (9 scenarios)`
    - The 261005-dn2 probe exits 0 printing `DN2-PROBE PASS (7 scenarios)`
    - `node .planning/phases/06-multi-language-support/i18n-check.js "Venn Diagram/venn-diagram.html"` exits 0 (coverage, header, includes, no-locale-number-format, literals-markup, literals-js all PASS)
    - `grep -c "venn-diagram-thumbnails" "Venn Diagram/venn-diagram.html"` is still 1 (storage key unchanged)
    - `grep -n 'id="thumbs-' "Venn Diagram/venn-diagram.html"` lists the `thumbs-off` line before the `thumbs-on` line
  </acceptance_criteria>
  <done>The toggle reads "Previews off" then "Previews on" under the group label "Hover previews", with natural translations in all sixteen languages (ru in Cyrillic, el in Greek). Persisted on/off values under the unchanged storage key still work. All nine probe scenarios, the dn2 probe and the i18n gate pass.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| keyboard -> document | A page-wide capture-phase keydown listener now acts on Enter; the only input it reads is the key, its modifier and repeat flags, and the event target's element type |
| dictionary -> DOM | The new label strings reach the DOM only through `applyStaticDom` (textContent / setAttribute), never innerHTML |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-edj-01 | Tampering | `openSectionInView` target resolution | low | mitigate | Enter and dblclick share one function. The href still comes only from the chip's own `data-xref-href` / `data-xref-tree-href` attributes (built by `euclidHref` / `factorTreeHref` from integer state) and still goes through the unchanged `openXref`, which nulls `win.opener`. Probe E1-E3 and E7 assert the exact target for each scroll position. |
| T-edj-02 | Denial of Service | document Enter listener | medium | mitigate | The listener acts only when a preview is showing in the active mode and the owner chip has `_npOpen`. Inputs, textareas, selects, contentEditable, modifier combinations and IME composition pass through untouched (probe E4, E5). Auto-repeat is consumed without opening, so holding Enter can't spawn tabs or re-fire the focused control (probe E6). `hideNestedPreview` clears the owner on mouseleave, blur and every render, so no stale owner keeps the key captured. |
| T-edj-03 | Tampering | `assets/i18n/venn-diagram.js` label values | low | mitigate | The values are plain strings bound by `applyStaticDom` via textContent and setAttribute. The i18n gate (literals and coverage modes, including the ru/el script rule) and probe E9 check every language. |
| T-edj-04 | Information Disclosure | dev-only `enter-probe.js` | low | accept | Runs only locally. It writes only to `harness.mkScratch` dirs that are removed on exit, uses the same headless-Chrome flags as the dn2 probe, and is never shipped or referenced by a page. |
| T-edj-SC | Tampering | npm/pip/cargo installs | low | accept | No package installs: Node built-ins and the in-repo `harness.js` only. |
</threat_model>

<verification>
- `node ".planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/enter-probe.js"` exits 0 with `EDJ-PROBE PASS (9 scenarios)`; the Task 1 RED run is recorded in the SUMMARY
- `node ".planning/quick/261005-dn2-venn-diagram-double-click-on-a-chip-open/dblclick-probe.js"` exits 0 with `DN2-PROBE PASS (7 scenarios)`
- `node .planning/phases/06-multi-language-support/i18n-check.js --all` exits 0
- The Task 2 browser human-check passes
</verification>

<success_criteria>
- Enter opens the showing preview's section-in-view target on the hover and keyboard-focus paths, in two-circle and three-circle mode. The target is identical to a double-click's.
- Enter keeps its old behaviour whenever no preview is showing, and it is never captured from form controls, from modifier combinations or on auto-repeat.
- The toggle reads "Previews off" then "Previews on" ("Hover previews" group) in natural wording in all sixteen languages. The `venn-diagram-thumbnails` storage key and its values are unchanged.
- The only shipped files that change are `Venn Diagram/venn-diagram.html` and `assets/i18n/venn-diagram.js`. The probe stays under `.planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/`.
</success_criteria>

<output>
Create `.planning/quick/261005-edj-venn-diagram-enter-opens-the-previewed-c/261005-edj-SUMMARY.md` when done
</output>
