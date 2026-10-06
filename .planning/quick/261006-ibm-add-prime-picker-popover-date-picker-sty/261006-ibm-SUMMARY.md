---
phase: quick-261006-ibm
plan: 01
subsystem: shared-modules / RSA / Diffie-Hellman
tags: [nt-picker, popover, shared-palette, i18n, a11y]
requires: [NT.bigint.isPrimeBig, NT.store palette API, NT.i18n]
provides: [NT.picker.attachPrimePicker, .prime-pop-* styles, common.primePickerOpen, common.primePickerHeading]
affects: [RSA/rsa.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, shadow-check, i18n-check, harness, project docs]
tech-stack:
  added: []
  patterns: [body-appended dialog popover, frozen NT namespace, createElement-only DOM, rich data-i18n template for the empty note]
key-files:
  created:
    - assets/nt-picker.js
    - .planning/quick/261006-ibm-add-prime-picker-popover-date-picker-sty/picker-probe.js
  modified:
    - assets/site.css
    - assets/i18n/site.js
    - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
    - RSA/rsa.html
    - .planning/phases/07-shared-js-module-refactor/shadow-check.js
    - .planning/phases/07-shared-js-module-refactor/harness.js
    - .planning/phases/06-multi-language-support/i18n-check.js
    - CLAUDE.md
    - .claude/CLAUDE.md
    - .planning/PROJECT.md
    - .planning/codebase/CONVENTIONS.md
    - .planning/codebase/ARCHITECTURE.md
    - .planning/codebase/STRUCTURE.md
decisions:
  - "Shared popover is a seventh module (NT.picker), canonical order core, bigint, svg, store, layout, i18n, picker"
  - "Prime filter uses NT.bigint.isPrimeBig (the page's own validator), memoized"
  - "RSA picks only fill the field (Generate stays the commit); DH passes rebuild as onPick"
status: complete
commits: 4
plan_head_before: 76cf4afe9a549490a9d7ebf0e91ff95cad162da6
plan_head_after: 71603a177ab20b5e179240a02d5e58093de71648
actuals:
  tokens: 38000
  tasks: 3
  commits: 4
---

# Phase quick-261006-ibm Plan 01: Prime picker popover Summary

A date-picker-style prime popover (`NT.picker.attachPrimePicker`) now sits beside Diffie-Hellman's p field and RSA's four prime fields. It shows the shared palette's primes as 44px `--role-result` circles, about two rows tall, with the rest reached by scrolling inside the panel.

## What was built

- `assets/nt-picker.js` (new, seventh shared module). The panel is built with `createElement` only and appended to `document.body`. It opens under the field, or above it when there is no room.
  - Primes are filtered by `NT.bigint.isPrimeBig`, memoized, deduplicated, ascending, and at or above the page minimum (RSA 3, DH 5).
  - It handles keyboard (arrows, Home, End), Escape and Tab (focus returns to the trigger), outside click, and one open panel at a time.
  - It refreshes from the palette `storage` event and relabels on a language switch without closing.
  - An empty palette shows `common.paletteEmptySieve` with a Sieve link labelled by `site.nav.sieve`.
- `assets/site.css`: `.prime-pop-*` section, tokens only (0 literal colours), plus a thin token-coloured scrollbar so night mode does not get a light native bar.
- `assets/i18n/site.js`: `common.primePickerOpen` and `common.primePickerHeading` in all 16 languages (ru/el in their own script).
- DH: `#pPickBtn` beside `#pInput`, `attachPrimePicker(pInput, $('pPickBtn'), { min: 5, onPick: rebuild })`. RSA: `#bob-p-pick`, `#bob-q-pick`, `#alice-p-pick`, `#alice-q-pick` with `min: 3` and no `onPick`.
- shadow-check, harness and i18n-check now know the seventh module and its dependencies. CLAUDE.md, `.claude/CLAUDE.md`, PROJECT.md, CONVENTIONS.md, ARCHITECTURE.md and STRUCTURE.md name `nt-picker.js` and the new canonical order.

## Verification

- `picker-probe.js all`: 18/18 PASS (D1-D12 on DH, R1-R6 on RSA), both done markers.
- `shadow-check.js --all`: SHADOW-CHECK PASS on every page (15 lines printed). Exit 0.
- `i18n-check.js --all`: coverage, header, includes, no-locale-number-format, literals-markup and literals-js all PASS on 16 pages.
- `shadow-check.js --docs --report`: still 8 findings (all pre-existing), none about the picker.
- Colour grep over the new CSS section: 0. `innerHTML` grep over `nt-picker.js` (non-comment lines): 0.
- Visual check in headless Chrome with a seeded 125-entry palette (composites and large primes included): day and night on both pages show about two rows plus a half-row peek, a scrollbar, the current value ringed, and the field flush with its circles button. Screenshots:
  - /tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools/06b2a5cb-995e-4f0c-bf97-d1603b9b57e3/scratchpad/shots/picker-dh-day.png
  - /tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools/06b2a5cb-995e-4f0c-bf97-d1603b9b57e3/scratchpad/shots/picker-dh-night.png
  - /tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools/06b2a5cb-995e-4f0c-bf97-d1603b9b57e3/scratchpad/shots/picker-rsa-day.png
  - /tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools/06b2a5cb-995e-4f0c-bf97-d1603b9b57e3/scratchpad/shots/picker-rsa-night.png

  They come from `PICKER_SHOTS=<dir> node picker-probe.js shots`.

## Deviations from Plan

**1. [Rule 3 - Blocking] i18n-check.js cannot be `require`d.** Its export list names `checkSiteFooter`, which no longer exists, so `require()` throws a ReferenceError (the CLI is unaffected because `main()` exits first). The probe therefore carries a small local copy of `loadCatalog()` instead of requiring it. The checker itself is untouched apart from `CANONICAL_NS_ORDER`. This is a pre-existing defect, logged below.

**2. [Rule 1 - Bug in probe expectation] D5 panel anchoring.** The plan expects the panel below the input. At the probe's 757px viewport the DH p field sits at y=576, leaving 181px below against 198px needed, so the panel correctly flips above (`is-above`). D5 now accepts either placement, matched to the `is-above` class.

**3. [Rule 2 - Missing critical functionality] Scrollbar colour.** The native scrollbar rendered light on the night theme. I added `scrollbar-width: thin` and a token-based `scrollbar-color` (commit 71603a1).

**4. Grid centring.** The plan's CSS omitted `justify-items: center`. Without it, grid items stretch to the column width and the Venn-style widest-chip sizing never narrows. It is added, matching Venn's `.prime-picker`.

**5. Prime ink token.** The chip uses `--role-result-ink` as the plan states. It is the same value as the `--accent-ink` Venn and Factor Tree use.

## Deferred / known issues

- `.planning/phases/06-multi-language-support/i18n-check.js` line ~2656 exports `checkSiteFooter`, which is undefined, so the module cannot be `require`d. Out of scope; not fixed.
- `shadow-check --all` prints 15 page lines, not 16 as the plan states; all pass.
- Wide palette entries (for example 6-digit primes) widen every column, so the popover shows fewer columns. This follows Venn's `sizePickerCells` behaviour as the plan specifies.

## Known Stubs

None.

## Threat Flags

None. The Sieve link is a same-site relative href, and the picked value is still validated by each page's own `readInputs` / `generateKeys`.

## Commits

- 0613141 feat: NT.picker prime popover wired to Diffie-Hellman's p field
- 655af49 feat: wire RSA's four prime fields and register NT.picker as the seventh module
- 92225af docs: mirror the seventh shared module (nt-picker.js) in the project docs
- 71603a1 fix: thin token-coloured scrollbar in the prime popover grid

## Self-Check: PASSED

Files verified present: assets/nt-picker.js, picker-probe.js. Commits 0613141, 655af49, 92225af and 71603a1 are ancestors of HEAD.
