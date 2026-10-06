---
phase: quick-261006-ibm
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - assets/nt-picker.js
  - assets/site.css
  - assets/i18n/site.js
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - RSA/rsa.html
  - .planning/quick/261006-ibm-add-prime-picker-popover-date-picker-sty/picker-probe.js
  - .planning/phases/07-shared-js-module-refactor/shadow-check.js
  - .planning/phases/07-shared-js-module-refactor/harness.js
  - .planning/phases/06-multi-language-support/i18n-check.js
  - CLAUDE.md
  - .claude/CLAUDE.md
  - .planning/PROJECT.md
  - .planning/codebase/CONVENTIONS.md
  - .planning/codebase/ARCHITECTURE.md
  - .planning/codebase/STRUCTURE.md
autonomous: true
requirements: [QUICK-IBM-01, QUICK-IBM-02, QUICK-IBM-03, QUICK-IBM-04]

estimate:
  tokens: 160000
  raw_tokens: 160000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "RSA's four prime fields (#bob-p, #bob-q, #alice-p, #alice-q) and Diffie-Hellman's #pInput each have a small circles button right of the field, and the field can still be typed in. g, a, b and every other field get no button (UD-1, UD-2)"
    - "Clicking the button opens a small panel anchored under the field, or above it when there is no room below. The panel shows only the primes from the shared number palette (NT.store number-palette), each once, ascending, as 44px --role-result circles. Composites, duplicates and primes below the page's own minimum (RSA 3, DH 5) never appear (UD-3, UD-4)"
    - "The panel shows about two rows of circles plus a peek of a third row. The rest of the circles are reached by scrolling inside the panel; the page itself does not scroll (UD-3)"
    - "Choosing a circle writes its number into the field, fires input and change, closes the panel and returns focus to the button. On DH the exchange then rebuilds with the new p, the same way the preset chips rebuild it. On RSA the value waits for the existing Generate button (UD-5)"
    - "The panel closes on an outside click, on Escape (focus goes back to the button), on Tab and on choosing. Arrow keys, Home and End move between circles. Only one panel is open at a time. A palette change in another tab updates an open panel (UD-6)"
    - "With no eligible primes, the panel shows the shared common.paletteEmptySieve sentence with a working link to the Sieve of Eratosthenes, labelled by site.nav.sieve (UD-7)"
    - "The button label/tooltip and the panel heading exist in all sixteen languages and re-translate live on a language switch without closing the panel. No new literal colour and no HTML-string parsing are introduced. picker-probe.js all, i18n-check --all and shadow-check --all pass (UD-8, UD-9)"
  artifacts:
    - path: "assets/nt-picker.js"
      provides: "NT.picker.attachPrimePicker(input, trigger, options): the seventh shared module. Owns the date-picker-style prime popover: rendering, positioning, keyboard handling, outside-click/Escape/Tab close, the one-open-at-a-time rule, live storage updates and lang-change relabelling"
      contains: "attachPrimePicker"
    - path: "assets/site.css"
      provides: "Shared .prime-pop-* styles: field wrapper, trigger, panel, scroll grid, chips and empty note, all built from palette.css tokens"
      contains: ".prime-pop-chip"
    - path: "assets/i18n/site.js"
      provides: "common.primePickerOpen and common.primePickerHeading in all 16 languages"
      contains: "primePickerHeading"
    - path: "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
      provides: "#pPickBtn trigger beside #pInput, wired with min 5 and onPick rebuild"
      contains: "pPickBtn"
    - path: "RSA/rsa.html"
      provides: "#bob-p-pick, #bob-q-pick, #alice-p-pick and #alice-q-pick triggers, wired with min 3"
      contains: "alice-q-pick"
    - path: ".planning/quick/261006-ibm-add-prime-picker-popover-date-picker-sty/picker-probe.js"
      provides: "Headless-Chrome probe with 18 scenarios (D1-D12 on DH, R1-R6 on RSA)"
      contains: "EXPECTED = 18"
  key_links:
    - from: "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
      to: "NT.picker.attachPrimePicker"
      via: "attachPrimePicker(pInput, ..., { min: 5, onPick: rebuild })"
      pattern: "attachPrimePicker\\(pInput"
    - from: "RSA/rsa.html"
      to: "NT.picker.attachPrimePicker"
      via: "one attach call per prime field id, min 3"
      pattern: "attachPrimePicker\\("
    - from: "assets/nt-picker.js"
      to: "NT.store loadSharedPalette / readSharedPalette / SHARED_PALETTE_KEY"
      via: "a fresh palette read on every open, plus the storage-event re-render"
      pattern: "loadSharedPalette"
    - from: "assets/nt-picker.js"
      to: "NT.bigint.isPrimeBig"
      via: "a memoized prime filter: the same predicate RSA and DH use to validate"
      pattern: "isPrimeBig"
    - from: ".planning/phases/07-shared-js-module-refactor/shadow-check.js and .planning/phases/06-multi-language-support/i18n-check.js"
      to: "the canonical include/import order"
      via: "CANONICAL_NS_ORDER gains 'picker' after 'i18n'"
      pattern: "\"i18n\", \"picker\""
---

<objective>
Add the shared prime picker to RSA and Diffie-Hellman as a small date-picker-style popover. A circles button beside each prime field opens a small panel anchored to the field. The panel shows the shared palette's primes as the familiar 44px circles, with only about two rows visible and the rest reachable by scrolling. Choosing a circle fills the field.

User decisions. These are verbatim intent from the request plus the orchestrator's locked findings, cited as UD-n:
- UD-1: Targets are RSA `#bob-p`, `#bob-q`, `#alice-p`, `#alice-q` and DH `#pInput` only. DH's g, a and b are not primes and get no picker.
- UD-2: The picker is a small in-place pop-up panel, like a booking-site date picker. A trigger button sits beside the field, so typing still works.
- UD-3: The little window shows only a couple of circles; a vertical scroll area holds the rest.
- UD-4: The circles reuse the shared palette's prime-circle look: 44px pill, `--role-result` fill, dark-on-light ink, weight 700, tabular numerals, as on Factor Tree's `.palette-item` and Venn's `.prime-chip`. The circles show only the PRIMES of the shared `number-palette`.
- UD-5: Choosing a circle writes the value into the field, fires `input` and `change`, and closes the panel.
- UD-6: The panel closes on an outside click, on Escape (focus returns to the trigger) and on choosing. Its circles are keyboard-accessible buttons. One popover is open at a time, and it live-updates on the palette's `storage` event.
- UD-7: The empty state reuses `common.paletteEmptySieve` with a Sieve link whose text is `translate('site.nav.sieve')`, as in Venn.
- UD-8: Every new string exists in all 16 languages, with ru/el in their own script. There are no literal colours and no HTML-string parsing for prose, and the popover survives language changes.
- UD-9: Shared logic follows CLAUDE.md strictly.

Claude's discretion (grounded in the code, documented here so the checker can see why):
- New shared module `assets/nt-picker.js` exporting `NT.picker`. CLAUDE.md says "A new cross-page concern gets its own `assets/nt-NAME.js` module exporting on its own `NT.NAME` namespace". The widget fits none of the six existing modules' domains. Duplicating it per page would trip shadow-check's cross-file `DUP`/`RENAMED-DUP` scan. Canonical order becomes core, bigint, svg, store, layout, i18n, picker. The picker goes last because it calls into NT.bigint, NT.store and NT.i18n, and the i18n data files still follow the nt-*.js run.
- Shared popover CSS goes in `assets/site.css`, because it is shared chrome for two pages. Every class is prefixed `.prime-pop-` so it can never collide with Venn's `.prime-chip` or DH's `.chip`.
- The prime filter uses `NT.bigint.isPrimeBig`, overriding the orchestrator's suggested `NT.core.isPrime`. It is the exact predicate RSA's `generateKeys` and DH's `readInputs` already validate with, so the picker never offers a value the page rejects. It is also Miller-Rabin, which is fast on the palette's 12-digit entries, where trial division would cost up to 5e5 steps per prime. And both pages already include `nt-bigint.js`, so neither page needs `nt-core.js`.
- Minimum per page mirrors the page's own validator: RSA `min: 3` (from `rsa.errOddPrimes`: p, q ≥ 3) and DH `min: 5` (from `dh.errPTooSmall`: p ≥ 5).
- Commit model. Neither page listens to `input`/`change` on these fields (verified: DH commits on Enter keydown, the Build button and the preset chips; RSA commits only on the Generate button). The picker therefore fires `input` and `change` for fidelity and then calls an optional `onPick`. DH passes `rebuild`, matching how its own `#presetChips` set p and rebuild. RSA passes no callback, because its narrative makes Generate the explicit commit and auto-generating after only p is picked would flash a same-primes error mid-selection.
- The panel is appended to `document.body`, positioned absolutely in document coordinates. Both pages' `.panel` has `overflow:hidden`, which would clip an in-panel popover. The z-index is 950: above the 900 scratchpad dock, below the 1000 site header.

Output: assets/nt-picker.js, shared styles, two common.* keys in 16 languages, both pages wired, the checkers taught the seventh module, docs updated, and a headless probe.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@CLAUDE.md
@.claude/CLAUDE.md
@.planning/STATE.md

Analogs to read (only the cited ranges):
- `assets/nt-store.js` lines 1-60 (header-comment shape), 217-257 (palette API: `SHARED_PALETTE_KEY`, `readSharedPalette(raw)`, `loadSharedPalette()`), 355-382 (freeze plus `defineProperty` lock pattern).
- `assets/nt-layout.js` lines 1-55 (a module that needs another module: dependency check with a descriptive Error).
- `assets/nt-i18n.js` lines 271-356 (`translateInto`, `bindText`, `applyAttr`, `applyStaticDom`. A `data-i18n` element with element children is a rich template whose children fill `{0}`, `{1}`, ... `data-i18n-title`/`data-i18n-aria-label` are re-applied on every language switch) and 393-405 (`applyLang`: `applyStaticDom(document)`, then `decorateLinks`, then fires `nt-i18n:change`).
- `Venn Diagram/venn-diagram.html` lines 140-191 (chip, empty-note and link CSS), 571 (empty-note markup), 2113-2148 (`sizePickerCells`/`renderPicker`), 2879-2883 (`labelSieveLink`).
- `Factor Tree/factor-tree.html` lines 160-190 (`.palette-item` circle look: the visual reference).
- `RSA/rsa.html` lines 33 (`.panel` overflow hidden), 56-71 (`.field` and generic `button` rules), 284-306 (Bob/Alice field rows), 354-363 (includes plus import block), 501-524 (`generateKeys`), 1399-1400 (Generate wiring).
- `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` lines 60-80 (`.field` and `button` rules), 275-281 (controls markup), 373-385 (includes plus imports), 505-525 (`readInputs`), 1245-1320 (persistence, `rebuild`, Enter wiring, preset chips).
- `.planning/quick/261005-pl0-universal-shared-palette-for-venn-diagra/shared-palette-probe.js` lines 1-40 and 626-712 (probe pattern: scratch site via `harness.mkScratch`, injected `<pre>` output, headless `google-chrome --dump-dom`, PASS/FAIL tally against `EXPECTED`).
- `.planning/phases/07-shared-js-module-refactor/shadow-check.js` lines 36-45 and 330-400 (`CANONICAL_NS_ORDER`, `INCLUDE-MISSING`, `UNUSED-INCLUDE`). `.planning/phases/07-shared-js-module-refactor/harness.js` lines 135-158 (`loadNew` moduleOrder). `.planning/phases/06-multi-language-support/i18n-check.js` line 1976 (`CANONICAL_NS_ORDER`) and the exported `loadCatalog()`.

Facts the executor can rely on (verified while planning):
- Baselines are clean. `node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all` passes all 16 pages, and `node .planning/phases/06-multi-language-support/i18n-check.js --all` passes every static mode. `shadow-check.js --docs --report` prints exactly 8 pre-existing findings (MIRROR-DRIFT lines), and that count must not grow.
- `google-chrome` is installed at /usr/bin/google-chrome.
- The default palette when storage is empty is the first 30 primes, 2..113. With `min: 5` that leaves 28 primes (5..113); with `min: 3` it leaves 29 (3..113).
- `NT.bigint.fmt` groups thousands with commas, so RSA prints n = 67·53 as `3,551`.
- DH's `rebuild()` only reaches `persistState()` on valid input. Its localStorage key `diffie-hellman-key-exchange` holding `p: "47"` therefore proves a successful rebuild with the picked p.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: End-to-end "pick a prime for DH's p": NT.picker module + shared styles + 16-language strings + DH wiring + probe</name>
  <files>assets/nt-picker.js, assets/site.css, assets/i18n/site.js, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, .planning/quick/261006-ibm-add-prime-picker-popover-date-picker-sty/picker-probe.js</files>
  <behavior>
    DH probe scenarios. Each is one PASS/FAIL line, run in a single page load at `?lang=en` with a fresh profile, so the default palette applies:
    - D1: Exactly one `.prime-pop-trigger` exists on the page, `#pPickBtn`, right after `#pInput` inside a `.prime-pop-field`. It has `aria-haspopup="dialog"`, `aria-expanded="false"` and `aria-controls="pPickBtn-pop"`, and its aria-label and title both equal en `common.primePickerOpen`.
    - D2: Clicking the trigger shows `#pPickBtn-pop` (not hidden, offsetHeight > 0) and sets `aria-expanded="true"`. The title text equals en `common.primePickerHeading`, and exactly one `.prime-pop` is visible.
    - D3: The chip texts equal the 28 primes 5..113 in ascending order. Each chip is a `button[type=button].prime-pop-chip` with offsetHeight 44. Its computed background-color equals the computed color of a temporary span styled with `color: var(--role-result)`.
    - D4: The scroll grid's scrollHeight exceeds clientHeight by more than 20. Between 4 and 12 chips sit fully inside the grid's rect. After `grid.scrollTop = grid.scrollHeight`, the last chip is fully inside the grid's rect.
    - D5: Chip `23` (DH's default p) has `aria-current="true"` and is `document.activeElement`. The panel's top is at or below the input's bottom minus 1, and its rect lies inside `0..documentElement.clientWidth`.
    - D6: Keyboard moves between chips: ArrowRight from `23` reaches `29`, ArrowLeft returns to `23`, Home reaches `5` and End reaches `113`.
    - D7: Escape keydown on the active chip hides the panel, sets `aria-expanded="false"`, and leaves activeElement on the trigger.
    - D8: Reopen, then a `PointerEvent('pointerdown', {bubbles:true})` dispatched on `document.body` hides the panel.
    - D9: Record `input` and `change` listeners on `#pInput`, reopen, and click chip `47`. The result: `#pInput.value === '47'`, each event fired exactly once, the panel is hidden, activeElement is the trigger, `#errorBox` text is empty, and `JSON.parse(localStorage.getItem('diffie-hellman-key-exchange')).p === '47'`.
    - D10: Run `NT.store.clearSharedPalette()` then `NT.store.addToSharedPalette([3, 4, 9, 15, 7919, 7919], false)` and reopen. The chips are exactly `['7919']`.
    - D11: While open, dispatch `new StorageEvent('storage', {key: NT.store.SHARED_PALETTE_KEY, newValue: '[2,3,11,12,13]'})` on window. The chips become exactly `['11','13']` and the panel stays open.
    - D12: Close the panel, run `NT.store.clearSharedPalette()` and reopen. There are zero chips, `.prime-pop-empty` is visible, its link text equals en `site.nav.sieve`, and its href contains `sieve-of-eratosthenes.html`. Then run `NT.i18n.setLang('de')`. The panel is still open, the title equals de `common.primePickerHeading`, the trigger's aria-label equals de `common.primePickerOpen`, and the link text equals de `site.nav.sieve`.
  </behavior>
  <action>
**A. `assets/nt-picker.js` (new; UD-2..UD-7, UD-9).**

Write a classic-script IIFE with `"use strict"`, following nt-store.js and nt-layout.js.

Header comment. It states:
- the purpose: the shared-palette prime picker popover for prime-valued inputs;
- the consumers: RSA and Diffie-Hellman Key Exchange;
- the dependencies: NT.bigint (`isPrimeBig`), NT.store (`SHARED_PALETTE_KEY`, `loadSharedPalette`, `readSharedPalette`) and NT.i18n (`applyStaticDom`, `onLangChange`, `translate`);
- the include rule: a plain non-deferred `<script src>` placed after `nt-i18n.js` and before `assets/i18n/site.js`, canonical order core, bigint, svg, store, layout, i18n, picker;
- that evaluating the file never touches `document`, because harness.js loads it in a bare vm context with only `window`;
- that `NT.picker` is frozen and its slot locked.

At evaluation, do only this: create `var NT = window.NT = window.NT || {}`, declare module state (the instance list, the open instance, a prime memo object, and a listeners-installed flag), and export. Export with `NT.picker = Object.freeze({ attachPrimePicker: attachPrimePicker })` followed by `Object.defineProperty(NT, 'picker', { writable: false, configurable: false })`.

Module constants:
- `SIEVE_HREF = '../Sieve Of Eratosthenes/sieve-of-eratosthenes.html'`. Comment: every tool page sits one directory below the site root.
- `GAP = 6`, the px offset between field and panel.
- `EDGE = 8`, the minimum px from the viewport edge.

`attachPrimePicker(input, trigger, options)`. `options` is `{ min: Number, onPick: function(value) }`, both optional; `min` defaults to 2. Steps:

1. On first call, read `NT.bigint`, `NT.store` and `NT.i18n`. Throw `new Error('assets/nt-picker.js needs assets/nt-bigint.js, assets/nt-store.js and assets/nt-i18n.js loaded before it')` if any is missing. Also throw a descriptive Error if `input` or `trigger` is falsy, or if `trigger.id` is empty.
2. Build the panel with `document.createElement` only. No HTML strings anywhere: every node comes from createElement/createTextNode, and text goes in via textContent/setAttribute.
   - Panel: a `div.prime-pop` with `id = trigger.id + '-pop'`, `role="dialog"`, `aria-labelledby = id + '-title'`, `tabindex="-1"` and the `hidden` attribute.
   - Title: `p.prime-pop-title` with id `id + '-title'` and `data-i18n="common.primePickerHeading"`.
   - Grid: `div.prime-pop-grid`.
   - Empty note: `p.prime-pop-empty` with `data-i18n="common.paletteEmptySieve"` and `hidden`, containing exactly one child `a.prime-pop-sieve-link` with `href = SIEVE_HREF`. Set the link's textContent to `translate('site.nav.sieve')`. It is not data-i18n-bound, following Venn's `labelSieveLink`.
   - Append the panel to `document.body`. Then call `applyStaticDom(panel)`, so the title text and the rich `{0}` template, with the link as `{0}`, render now. nt-i18n re-renders both on every later language switch, and its DOMContentLoaded init decorates the link with `?lang=`.
3. On the trigger, set `aria-haspopup="dialog"`, `aria-expanded="false"` and `aria-controls` to the panel id. Store `{ input, trigger, pop, grid, empty, link, min, onPick }` in the instance list.
4. Trigger click toggles. If this instance is open, close it and return focus to the trigger; otherwise open it.
5. Panel keydown:
   - Escape: close and return focus to the trigger.
   - Tab or Shift+Tab: preventDefault, close and return focus to the trigger.
   - ArrowLeft/ArrowRight: move ±1. ArrowUp/ArrowDown: move ± the column count, which is the number of chips sharing the first chip's offsetTop. Home and End: first and last chip.
   - Clamp moves at the ends (no wrap), preventDefault, focus the target and reveal it.
   - Reveal adjusts only `grid.scrollTop` so the chip is fully inside the grid, never the page scroll. The grid is `position:relative`, so `chip.offsetTop` is grid-relative.
6. Panel focusout: if `relatedTarget` is non-null, outside the panel and not the trigger, close without moving focus.
7. Install the global listeners once, on the first attach:
   - document `pointerdown` in the capture phase: if an instance is open and the target is inside neither its panel nor its trigger, close without moving focus;
   - window `resize`: reposition the open panel;
   - window `storage`: if `e.key === SHARED_PALETTE_KEY` and a panel is open, run `readSharedPalette(e.newValue)`; if that returns non-null, re-render from it, keep focus on the same value when it still exists (else on the first chip), and reposition;
   - one `onLangChange` callback: reset every instance's link textContent to `translate('site.nav.sieve')`, then reposition the open panel. The title, empty-note template and trigger attributes are already re-applied by nt-i18n's `applyStaticDom(document)`.
8. Render an instance from a list, which defaults to `loadSharedPalette()`.
   - Primes: the values ≥ `min` for which `isPrimeBig(BigInt(v))` holds, memoized by value, de-duplicated, ascending.
   - Clear the grid by removing its child nodes. Then create one `button.prime-pop-chip` per prime: `type="button"`, textContent `String(v)`. If `String(v) === input.value.trim()`, it gets `aria-current="true"`. A click picks the value.
   - Set `grid.hidden` when there are no primes, and `empty.hidden` when there are some.
   - Once visible, size the cells like Venn's `sizePickerCells`: take the widest chip's offsetWidth (at least 44) and write it to the grid as `--prime-pop-cell` in px.
9. Open:
   - If another instance is open, close it without moving focus.
   - Render, remove `hidden`, set `aria-expanded="true"` and position.
   - Focus the `aria-current` chip, else the first chip, else the panel itself, using `focus({ preventScroll: true })`, then reveal it.
   - Position: union the input's and trigger's `getBoundingClientRect()`. `left = rect.left + scrollX`, clamped to `[scrollX + EDGE, scrollX + documentElement.clientWidth - panel.offsetWidth - EDGE]`. `top = rect.bottom + scrollY + GAP`. If the room below (`innerHeight - rect.bottom`) is less than `panel.offsetHeight + GAP + EDGE` while the room above (`rect.top`) is larger, use `rect.top + scrollY - panel.offsetHeight - GAP` and add class `is-above`; otherwise remove that class.
10. Close sets `hidden`, sets `aria-expanded="false"`, clears the open instance, and focuses the trigger only when asked.
11. Pick: set `input.value = String(v)`, then dispatch `new Event('input', {bubbles:true})` and `new Event('change', {bubbles:true})` on the input. Close and return focus to the trigger. Then call `onPick(v)` if it is a function (UD-5).

No English literal in this file: every visible string comes from `translate()` or `data-i18n`.

**B. `assets/site.css` (UD-3, UD-4, UD-8).**

Append one section that starts with the comment `/* ---------- prime picker popover (NT.picker) ---------- */` and ends with the comment `/* ---------- end prime picker popover ---------- */`. Every colour inside it is a `var(--token)` from palette.css or a `color-mix()` of tokens; it declares no literal colour values. Both pages' generic `button{...}` and `button:hover:not(:disabled)` rules (specificity 0,2,1) would otherwise leak in. So every button rule below sets padding, border, background, colour, font and radius explicitly, and every hover rule is written as `.prime-pop .prime-pop-chip:hover:not(:disabled)` / `.prime-pop-field .prime-pop-trigger:hover:not(:disabled)` to outrank them.

Rules:
- `.prime-pop-field`: display flex, gap 6px, align-items stretch. Its `> input` gets flex 1 1 auto and min-width 0.
- `.prime-pop-trigger`: flex none, width 40px, padding 0, inline-flex centred. Border 1px solid `var(--panel-border)`, radius `var(--radius-ctl)`. Background `color-mix(in srgb, var(--text) 6%, transparent)`, matching the field. Colour `var(--text-dim)`, cursor pointer. Its svg is 20px with `fill:currentColor`. Hover and `[aria-expanded="true"]`: colour and border-colour `var(--role-result)`. Focus: outline none. Focus-visible: box-shadow `var(--ctl-focus)`.
- `.prime-pop`: position absolute, z-index 950, box-sizing border-box, width `min(304px, calc(100vw - 16px))`, padding `10px 12px 12px`. Background `var(--surface)`, border 1px solid `var(--panel-border-strong)`, radius `var(--radius-card)`, box-shadow `0 12px 32px -8px var(--overlay)`, font-family `var(--font-sans)`. A 140ms fade/slide-in keyframe named `primePopIn` (from opacity 0 and translateY(-4px)). `.prime-pop.is-above` slides from translateY(4px) instead. `.prime-pop[hidden]{display:none}`. Focus: outline none.
- `.prime-pop-title`: margin `0 0 8px`, font-size .8125rem, weight 600, colour `var(--text-dim)`.
- `.prime-pop-grid`: position relative, display grid, `grid-template-columns: repeat(auto-fill, var(--prime-pop-cell, 44px))`, justify-content start, gap 8px, padding 4px, margin `0 -4px`, overflow-y auto, overscroll-behavior contain. max-height `calc(44px * 2.5 + 8px * 2 + 8px)`: two full rows plus a half-row peek that signals scrolling (UD-3).
- `.prime-pop-chip`: the Factor Tree `.palette-item` prime look (UD-4). Inline-flex centred, box-sizing border-box, min-width 44px, height 44px, padding `0 10px`, radius 22px. Border 1px solid `var(--role-result)`, background `var(--role-result)`, colour `var(--role-result-ink)`. font-family `var(--font-sans)`, weight 700, size .9375rem, tabular-nums, cursor pointer, transition `filter var(--ease-ctl)`. Hover keeps the `var(--role-result)` background with brightness(1.08). Focus: outline none. Focus-visible: box-shadow `var(--ctl-focus)`. `[aria-current="true"]`: outline 2px solid `var(--role-active)`, offset 2px, the same ring as Venn's armed chip.
- `.prime-pop-empty` and its link: copy Venn's `.palette-empty-note` rules (margin 0, 13px, `var(--text-dim)`; link `var(--role-input)` with a `color-mix` underline; hover `var(--role-result)`).
- Inside a `@media (prefers-reduced-motion: reduce)` block: no animation on `.prime-pop` and no transition on chip or trigger.

**C. `assets/i18n/site.js` (UD-8).**

In the `common` namespace (`NT.i18n.register('common', ...)`, starting line 398), add two keys after `paletteEmptySieve` in every one of the 16 language blocks. Add the comma after the previous last entry. Values are open label / heading:

| lang | primePickerOpen | primePickerHeading |
|------|-----------------|--------------------|
| nl | 'Kies een priemgetal uit het palet' | 'Kies een priemgetal' |
| en | 'Pick a prime from the palette' | 'Pick a prime' |
| de | 'Wähle eine Primzahl aus der Palette' | 'Wähle eine Primzahl' |
| fr | 'Choisissez un nombre premier dans la palette' | 'Choisissez un nombre premier' |
| es | 'Elige un número primo de la paleta' | 'Elige un número primo' |
| it | 'Scegli un numero primo dalla tavolozza' | 'Scegli un numero primo' |
| pl | 'Wybierz liczbę pierwszą z palety' | 'Wybierz liczbę pierwszą' |
| pt-BR | 'Escolha um número primo da paleta' | 'Escolha um número primo' |
| pt-PT | 'Escolhe um número primo da paleta' | 'Escolhe um número primo' |
| sv | 'Välj ett primtal ur paletten' | 'Välj ett primtal' |
| nb | 'Velg et primtall fra paletten' | 'Velg et primtall' |
| ro | 'Alege un număr prim din paletă' | 'Alege un număr prim' |
| hu | 'Válassz egy prímszámot a palettáról' | 'Válassz egy prímszámot' |
| lv | 'Izvēlies pirmskaitli no paletes' | 'Izvēlies pirmskaitli' |
| ru | 'Выбери простое число из палитры' | 'Выбери простое число' |
| el | 'Διάλεξε έναν πρώτο αριθμό από την παλέτα' | 'Διάλεξε έναν πρώτο αριθμό' |

The registers match each language's existing `paletteEmptySieve` wording.

**D. `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` (UD-1, UD-5).**

Markup. Wrap `#pInput` (line 277) in `<div class="prime-pop-field">`. Directly after the input, inside that wrapper, add the trigger button with these attributes:
- `type="button"`, `class="prime-pop-trigger"`, `id="pPickBtn"`;
- `aria-label="Pick a prime from the palette"` with `data-i18n-aria-label="common.primePickerOpen"`;
- `title="Pick a prime from the palette"` with `data-i18n-title="common.primePickerOpen"`.

Inside it goes the icon: `<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">` with six `<circle r="2.4">` at cx 4, 10 and 16 by cy 7 and 13. The svg has no fill attribute; CSS gives it currentColor. The label stays `for="pInput"`, and `#gInput`, `#aInput` and `#bInput` are untouched.

Includes. The run becomes nt-bigint, nt-svg, **nt-store**, nt-i18n, **nt-picker**, then i18n/site.js and i18n/diffie-hellman-key-exchange.js. Each is a plain `<script src="../assets/...">`.

Import. Add `const { attachPrimePicker } = NT.picker;` as the last line of the import block, after the NT.i18n line.

Wiring. Right after the `[pInput, gInput, aInput, bInput].forEach` Enter-key block, add one call: `attachPrimePicker(pInput, $('pPickBtn'), { min: 5, onPick: rebuild })`. Precede it with a one-line comment: DH's p must be ≥ 5 (`dh.errPTooSmall`), and a pick commits like a preset chip. No other DH logic changes.

**E. `.planning/quick/261006-ibm-add-prime-picker-popover-date-picker-sty/picker-probe.js` (new, dev-only).**

Mirror shared-palette-probe.js's structure:
- `ROOT` resolves three levels up; require harness.js for `mkScratch`/`chromeEnv`;
- require `.planning/phases/06-multi-language-support/i18n-check.js` and use its exported `loadCatalog()` to compute the EXPECTED strings (en/de `common.primePickerOpen`, `common.primePickerHeading`, `site.nav.sieve`), passing them into the in-page probe as JSON;
- build a scratch site by copying `assets/`, `Diffie-Hellman Key Exchange/` and `RSA/`;
- inject `<pre id="ibm-out"></pre>` plus the in-page probe before `</body>` of a copy named `probe-<page>.html`;
- run `google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir=<fresh scratch profile> --virtual-time-budget=60000 --window-size=1280,900 --dump-dom <fileUrl>?lang=en`;
- parse the PASS/FAIL lines and the `data-done="1"` marker.

The in-page probe starts on window `load` plus `setTimeout(…, 50)`. It runs each scenario inside try/catch, so one throw is a FAIL rather than a hang. It drives the UI with `trigger.click()`, `chip.click()`, `KeyboardEvent('keydown', {key, bubbles:true})` dispatched on `document.activeElement`, and a bubbling `PointerEvent('pointerdown')` on `document.body`.

CLI: `node picker-probe.js dh|rsa|all`, defaulting to all. Set `EXPECTED = 18` (12 DH + 6 RSA, totals per page). Write the RSA scenarios R1-R6 now, exactly as specified in Task 2's behavior block; they are expected to FAIL until Task 2 wires RSA. The process exits 0 only if every selected page reports its full count of PASS lines, zero FAIL lines and the done marker. A missing `<pre>` or done marker counts as FAIL, so the probe can never pass vacuously.
  </action>
  <verify>
    <automated>node --check assets/nt-picker.js && node .planning/quick/261006-ibm-add-prime-picker-popover-date-picker-sty/picker-probe.js dh && node .planning/phases/06-multi-language-support/i18n-check.js --coverage --literals "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"</automated>
  </verify>
  <done>
- Probe `dh` prints 12 PASS, 0 FAIL and the done marker.
- i18n-check `--coverage --literals` passes on DH, so both new keys exist in all 16 languages and the trigger's title and aria-label have their data-i18n twins.
- `sed -n '/prime picker popover (NT.picker)/,/end prime picker popover/p' assets/site.css | grep -Ec '#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\('` prints 0.
- `grep -v '^\s*\(//\|\*\|/\*\)' assets/nt-picker.js | grep -c 'innerHTML'` prints 0.
- `grep -n 'attachPrimePicker(pInput' "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"` matches once.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Wire RSA's four prime fields and teach the checkers and CLAUDE.md the seventh module</name>
  <files>RSA/rsa.html, .planning/phases/07-shared-js-module-refactor/shadow-check.js, .planning/phases/07-shared-js-module-refactor/harness.js, .planning/phases/06-multi-language-support/i18n-check.js, CLAUDE.md</files>
  <behavior>
    RSA probe scenarios, written in Task 1's picker-probe.js and run in one page load at `?lang=en` with a fresh profile:
    - R1: Exactly four `.prime-pop-trigger` elements exist: `#bob-p-pick`, `#bob-q-pick`, `#alice-p-pick` and `#alice-q-pick`. Each sits right after its input inside a `.prime-pop-field`, with `aria-haspopup="dialog"`, `aria-controls="<id>-pop"`, and aria-label equal to en `common.primePickerOpen`.
    - R2: Clicking `#bob-p-pick` shows `#bob-p-pick-pop`. The chip texts equal the 29 primes 3..113 ascending, so `2` is absent, and chip `61` has `aria-current="true"`.
    - R3: With bob-p open, clicking `#alice-q-pick` leaves exactly one visible `.prime-pop`, `#alice-q-pick-pop`, and `#bob-p-pick` has `aria-expanded="false"`.
    - R4: Close all panels and record `#bob-output` textContent. Open bob-p and click chip `67`. `#bob-p.value === '67'`, the panel is hidden, and `#bob-output` textContent is unchanged, because RSA fills only.
    - R5: Click `#bob-gen-btn`. `#bob-error` text is empty and `#bob-output` textContent matches `/3,?551/` (n = 67 × 53 = 3551).
    - R6: Clicking `#bob-q-pick` twice leaves the panel closed after the second click, with activeElement on `#bob-q-pick`.
  </behavior>
  <action>
**A. `RSA/rsa.html` (UD-1, UD-5).**

Markup. Wrap each of `#bob-p`, `#bob-q`, `#alice-p` and `#alice-q` (lines 288-289 and 302-303) in `<div class="prime-pop-field">`. After each input, add a trigger built exactly like Task 1's `#pPickBtn`: the same class, the same aria-label, title and data-i18n twins (`common.primePickerOpen`), and the same six-circle svg. The ids are `bob-p-pick`, `bob-q-pick`, `alice-p-pick` and `alice-q-pick`. Labels keep their `for=` ids.

Includes. The run becomes nt-bigint, **nt-store**, nt-i18n, **nt-picker**, then i18n/site.js and i18n/rsa.js.

Import. Add `const { attachPrimePicker } = NT.picker;` after the NT.i18n import line.

Wiring. After the two `*-gen-btn` click listeners (line 1399-1400), add a loop over `['bob-p', 'bob-q', 'alice-p', 'alice-q']` that calls `attachPrimePicker(document.getElementById(id), document.getElementById(id + '-pick'), { min: 3 })`. Precede it with a one-line comment: RSA needs odd primes ≥ 3 (`rsa.errOddPrimes`), and the Generate button stays the commit action, so there is no onPick. No other RSA logic changes, and `generateKeys` keeps its full validation.

**B. `.planning/phases/07-shared-js-module-refactor/shadow-check.js`.**
- `CANONICAL_NS_ORDER` becomes core, bigint, svg, store, layout, i18n, picker.
- In the INCLUDE-MISSING block, next to the nt-layout rule, add one finding per missing dependency when `includedNs.picker` is present without `includedNs.bigint`, `includedNs.store` or `includedNs.i18n`. Message format: `INCLUDE-MISSING <file> nt-picker included without nt-<dep>`.
- In the UNUSED-INCLUDE loop, next to the `core`-with-`layout` exemption, add: `bigint` and `store` accompanying `picker` are allowed unused. nt-picker.js calls into them itself.
- Update the comment above `importRe` that says "among the six shared modules" so it does not miscount the seventh module.

**C. `.planning/phases/07-shared-js-module-refactor/harness.js`.** Append `"nt-picker.js"` to `loadNew`'s `moduleOrder`, so `getExportedNames` and the IMPORT-UNRESOLVED check know `NT.picker`. Task 1 made nt-picker.js evaluate without touching `document`, so the bare vm context stays safe.

**D. `.planning/phases/06-multi-language-support/i18n-check.js`.** At line 1976, `CANONICAL_NS_ORDER` becomes the same seven entries.

**E. `CLAUDE.md` (root; UD-9).** It is the rule text these checkers enforce, so it changes in the same task.
- In the "Shared logic modules loaded before the inline script" bullet, add `assets/nt-picker.js` (`NT.picker` — the seventh shared module: the shared-palette prime-picker popover, attachPrimePicker; a page including it must include `nt-bigint.js`, `nt-store.js` and `nt-i18n.js` first, and its `.prime-pop-*` styles live in `assets/site.css`). Change that bullet's canonical order to core, bigint, svg, store, layout, i18n, picker.
- In the "Shared JS logic lives in ..." bullet, add `assets/nt-picker.js` and `NT.picker` to the lists, change the import-order phrase to the seven-name order, and change "the existing six modules" to "the existing seven modules".
- Wherever the "six" wording means the module count, it becomes "seven". The `nt-i18n.js` "sixth shared module" label stays, because it is still the sixth.
- Use none of the shadow-check DOC_PHRASES (for example "standalone", "self-contained", "copy-paste").
  </action>
  <verify>
    <automated>node .planning/quick/261006-ibm-add-prime-picker-popover-date-picker-sty/picker-probe.js all && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all && node .planning/phases/06-multi-language-support/i18n-check.js --all</automated>
    <human-check>Open RSA/rsa.html and Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html from disk, in both day and night themes. The circles button sits flush beside each prime field. Clicking it drops a small panel under the field that looks like the palette circles, with two rows visible and the rest scrollable. Picking a circle fills the field.</human-check>
  </verify>
  <done>
- Probe `all` prints 18 PASS, 0 FAIL and both done markers.
- `shadow-check --all` prints SHADOW-CHECK PASS for all 16 pages, with no DUP or RENAMED-DUP.
- `i18n-check --all` passes coverage, header, includes, no-locale-number-format, literals-markup and literals-js on 16 pages.
- `grep -c 'nt-picker.js' CLAUDE.md` is at least 2.
  </done>
</task>

<task type="auto">
  <name>Task 3: Sync the mirrored project docs (seventh module, canonical order) without growing the docs-audit baseline</name>
  <files>.claude/CLAUDE.md, .planning/PROJECT.md, .planning/codebase/CONVENTIONS.md, .planning/codebase/ARCHITECTURE.md, .planning/codebase/STRUCTURE.md</files>
  <action>
Per UD-9, every project doc that enumerates the shared modules or states the canonical order must now include the picker module.

Find the lines with `grep -n 'core, bigint, svg, store, layout, i18n\|nt-layout.js\`, \`nt-i18n.js\|six \`nt-\*.js\`\|Module dependency direction\|Shared Logic Modules' .claude/CLAUDE.md .planning/PROJECT.md .planning/codebase/CONVENTIONS.md .planning/codebase/ARCHITECTURE.md .planning/codebase/STRUCTURE.md`.

Edit each hit:
- Canonical order: core, bigint, svg, store, layout, i18n becomes core, bigint, svg, store, layout, i18n, picker.
- Module file and namespace lists gain `nt-picker.js` / `NT.picker`.
- "six `nt-*.js` logic modules" becomes "seven".
- The Module-dependency-direction line gains: `nt-picker.js` depends on `nt-bigint.js`, `nt-store.js` and `nt-i18n.js`, and `attachPrimePicker` throws if they are absent.
- The Shared Logic Modules table row gains the prime-picker popover in its description and file list.
- STRUCTURE.md's assets tree gains a line `nt-picker.js  # NT.picker — the seventh shared module: shared-palette prime-picker popover (needs nt-bigint, nt-store, nt-i18n)`, and its key-files/contents lines list `nt-picker.js`.
- The nt-i18n "Load order: the sixth shared module, included after `nt-layout.js` ..." line becomes "... included after `nt-layout.js`, before `nt-picker.js` when a page uses it, and before a page's own `assets/i18n/*.js` data files ...".

Mirror rule. shadow-check's `--docs` mirror audit requires every line inside a `<!-- GSD:NAME-start source:X -->` section of `.claude/CLAUDE.md` to appear verbatim in its source (`conventions` → `.planning/codebase/CONVENTIONS.md`, `architecture` → `.planning/codebase/ARCHITECTURE.md`; the `project` section mirrors `.planning/PROJECT.md`). Every edited mirror line therefore gets the byte-identical edit in its source file. Make the edits line-scoped with Edit; never rewrite a whole file. Do not touch the 8 pre-existing drifted lines. Use none of the DOC_PHRASES.
  </action>
  <verify>
    <automated>test "$(node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs --report | grep -c '^MIRROR-DRIFT\|^DOC-PHRASE')" -le 8 && ! node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs --report | grep -i 'picker' && for f in .claude/CLAUDE.md .planning/PROJECT.md .planning/codebase/CONVENTIONS.md .planning/codebase/ARCHITECTURE.md .planning/codebase/STRUCTURE.md; do grep -q 'nt-picker.js' "$f" || { echo "missing in $f"; exit 1; }; done && test "$(grep -c 'store, layout, i18n' .claude/CLAUDE.md)" -eq "$(grep -c 'store, layout, i18n, picker' .claude/CLAUDE.md)" && test "$(grep -c 'store, layout, i18n' CLAUDE.md)" -eq "$(grep -c 'store, layout, i18n, picker' CLAUDE.md)"</automated>
  </verify>
  <done>
- The docs audit reports no more than the 8 baseline findings, and none of them mention the picker.
- All five docs name `nt-picker.js`.
- In `.claude/CLAUDE.md` and the root `CLAUDE.md`, every line that states the "store, layout, i18n" canonical order continues with ", picker".
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| shared storage → popover | `number-palette` (cookie + localStorage) is writable by any sibling tool page, any tab, or by hand; a `storage` event carries an arbitrary `newValue` |
| popover → page input | a picked value enters `#pInput` / `#bob-p` etc. and flows into the page's own BigInt computations |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ibm-01 | Tampering | nt-picker.js chip rendering | low | mitigate | The list is read only through NT.store's validating readers (`loadSharedPalette`, and `readSharedPalette(e.newValue)` with JSON.parse in try plus integer 2..1e12 validation). A null result is ignored. Chips and the empty note are built with createElement/textContent/applyStaticDom, never from an HTML string (Task 1 done-grep). |
| T-ibm-02 | Elevation of Privilege | picked value into page inputs | low | mitigate | The picker only sets `input.value`. DH's `readInputs` and RSA's `generateKeys` still run `parseBigIntStrict`, `isPrimeBig` and range/length checks before any use. Task 2 and Task 1 leave that validation untouched, so the page stays authoritative. |
| T-ibm-03 | Denial of Service | prime filter over a 1000-entry palette | low | mitigate | `NT.bigint.isPrimeBig` (Miller-Rabin) is memoized per value, which bounds the cost to roughly 20 modpows per distinct entry. No per-entry trial division up to 1e6. |
| T-ibm-04 | Information Disclosure | Sieve link in the empty note | low | accept | A same-site relative href. No network request and no data leaves the page; nt-i18n/theme.js decorate it only with `?lang=`/`?theme=`. |
| T-ibm-SC | Tampering | npm/pip/cargo installs | low | accept | No package installs in this plan. Vanilla HTML/CSS/JS only; the dev probe uses Node built-ins plus the in-repo harness. |
</threat_model>

<verification>
- `node .planning/quick/261006-ibm-add-prime-picker-popover-date-picker-sty/picker-probe.js all` passes 18/18 with both done markers.
- `node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all` reports SHADOW-CHECK PASS on all 16 pages.
- `node .planning/phases/06-multi-language-support/i18n-check.js --all` passes every static mode on 16 pages.
- `shadow-check.js --docs --report` still reports exactly 8 findings, all pre-existing.
- No page other than RSA and DH changed (`git diff --stat` touches only the files_modified list).
</verification>

<success_criteria>
- The RSA prime fields (4) and DH's p field each open a small date-picker-style panel with about two rows of prime circles visible, scrolling for the rest.
- Choosing a circle fills the field. DH rebuilds; RSA waits for Generate.
- The panel follows the shared palette, including live updates, filters to primes at or above the page minimum, and shows the Sieve hint when empty.
- The panel is keyboard-accessible, closes on outside click, Escape, Tab and pick, and only one is open at a time.
- All 16 languages are covered; there are no literal colours and no HTML-string prose.
- NT.picker is a properly registered seventh shared module: the checkers, harness and docs all agree on the order core, bigint, svg, store, layout, i18n, picker.
</success_criteria>

<output>
Create `.planning/quick/261006-ibm-add-prime-picker-popover-date-picker-sty/261006-ibm-SUMMARY.md` when done
</output>
