---
phase: 06-multi-language-support
plan: 10
subsystem: i18n
tags: [i18n, nt-i18n, nt-core, nt-svg, localization, elliptic-curve-diffie-hellman, playback, group-law-explorer, dom-construction]

# Dependency graph
requires:
  - phase: 06-multi-language-support
    provides: "06-01's NT.i18n contract and canonical header; 06-02's shared `common` vocabulary (play/pause/step/instant/speed.N), 06-GLOSSARY.md terminology/tone contract, the per-page translation procedure (P1-P10), i18n-check.js's static gate suite, i18n-browser.js's runtime gate suite, and shadow-check.js's NT.i18n-aware convention gate; 06-09's worked precedent for a page whose stage/field accumulates DOM-visible history across resets (retranslate in place, never rebuild)"
provides:
  - "Elliptic Curve Diffie-Hellman fully translated into all five languages — static interface, curve point-field scatter plot, group-law explorer, and every narrative string (arithmetic log, multiples table, Eve's notebook, discrete-log brute-force result)"
  - "assets/i18n/elliptic-curve-diffie-hellman.js ('ecdh' namespace) data file"
  - "The point-dot click/keydown handlers now close over the point object already in scope instead of parsing it back out of the displayed (and therefore per-language) aria-label text — the only place in the phase where displayed text previously drove program logic"
  - "A second worked precedent (after 06-09's Diffie-Hellman) for a page whose field/stage accumulates progressive, non-idempotent DOM side effects (role-marking circles/labels, walk-trail animations): onLangChange must recompute state (revealedThroughStep()) and rebuild only the plain-re-render panels, never replay the side-effecting render path"
affects: ["06-11", "06-12"]

# Actuals (#2632)
actuals:
  tokens: 27900
  tasks: 2
  commits: 2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Point-dot click/keydown handlers capture the point object via an IIFE at creation time (mirroring this same page's pre-existing renderMultiples() row-button pattern) instead of deriving it from the dot's own displayed aria-label text — the aria-label is now purely presentational and safe to translate"
    - "A plain JS array registry (dotRegistry: [{el, P}], baseOptionRegistry: [{el, P, ord}]) tracks every per-point/per-option DOM node without adding new DOM attributes, letting onLangChange retranslate aria-labels/option text in place without rebuilding the field or losing the current selection"
    - "A second instance of the order(G)-collision class 06-09 found for Diffie-Hellman's 'order(g) =': this page's pre-existing 'ord(G)' abbreviation is translated per language via a new `ordWord` key (kept literal only in English, matching the pre-phase byte-identical requirement) rather than left as invariant notation like gcd/mod, since a literal shared abbreviation made the whole rendered segment byte-identical to English for every numeric value"
    - "onLangChange recomputes eveRevealed from the step list alone (revealedThroughStep()) and replays only appendLogEntry()/renderEveNotebook() — never applyStepVisual() itself — because applyStepVisual()'s markPointRole()/animateWalk() calls are NOT idempotent (each appends a fresh point-label element or re-triggers a walk-trail animation); this is a stricter instance of 06-09's 'retranslate in place, never rebuild' rule, extended to cover replay-by-side-effect, not just rebuild-by-markup"
    - "eveBruteForceState ({key, params}) tracks the last Eve brute-force result so onLangChange can re-render it via a renderEveBruteForceResult() helper, mirroring the errorState/bannerState pattern already established by Diffie-Hellman Key Exchange (06-09)"

key-files:
  created:
    - assets/i18n/elliptic-curve-diffie-hellman.js
    - .planning/phases/06-multi-language-support/i18n-config/elliptic-curve-diffie-hellman.json
  modified:
    - Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html

key-decisions:
  - "pointFromAriaLabel() deleted outright rather than kept as a dead helper — grep-confirmed unused after the click/keydown handlers were rewritten to close over the point already in scope"
  - "'ord(G)' is translated per language via a new ecdh.ordWord key (orde/Ordnung/ordre/orden) rather than kept as invariant math notation like gcd/mod — the same exact-value collision class 06-09 fixed for Diffie-Hellman's 'order(g) ='; English keeps the pre-existing literal abbreviation 'ord' unchanged"
  - "The field's role-marking circles/labels (G/A/B/S + coordinates) and walk-trail animations are never touched by a language switch — their text content is either a single neutral uppercase letter or raw coordinates, so there is nothing to translate, and re-running markPointRole()/animateWalk() would duplicate point-label elements or replay animations"
  - "renderMultiples()/renderExplorer() are called fresh (not replayed) on language switch since both are already idempotent plain re-renders driven entirely by tracked state (ex.multiples, explorerState) with no DOM history of their own"
  - "The base-point select's <option> elements and the curve's per-point <circle> aria-labels are retranslated via plain-array registries (dotRegistry/baseOptionRegistry) rather than new DOM attributes, to keep English markup byte-identical to before this phase"

requirements-completed: [I18N-01, I18N-02, I18N-03, I18N-05, I18N-06]

coverage:
  - id: D1
    description: "The ECDH page's static interface and curve plot — intro (incl. the Diffie-Hellman cross-link), field labels, base-point select options, chips with words, buttons, curve aria-label, point aria-labels, axis/lattice labels, explorer panel — reads in the active language; clicking or keyboard-selecting a curve point works identically in every language since no logic depends on displayed text"
    requirement: "I18N-01"
    verification:
      - kind: unit
        ref: "node i18n-check.js --coverage --header --includes --no-locale-number-format --literals-markup \"Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html\" (5/5 PASS)"
        status: pass
      - kind: unit
        ref: "node shadow-check.js \"Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html\" (SHADOW-CHECK PASS)"
        status: pass
      - kind: unit
        ref: "grep -v '^\\s*//' \"Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html\" | grep -c \"getAttribute('aria-label')\" == 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "Every step-log entry, the multiples list, Eve's notebook and brute-force result, banner and validation messages read in the active language as whole sentences; formulas, coordinates and numbers are unchanged in every language; switching language at any point (mid-exchange and after a finished exchange) keeps the exchange, step, explorer selection and walk; English renders exactly as before this phase"
    requirement: "I18N-02, I18N-03, I18N-05, I18N-06"
    verification:
      - kind: unit
        ref: "node i18n-check.js \"Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html\" (6/6 static modes PASS, incl. literals-js)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html\" (en-parity IDENTICAL snaps=21; langs PASS snaps=21 langs=4; switch PASS points=2 langs=4 [step-2, eve-brute-force]; layout PASS; ALL PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html\" --mutant {untranslated,stale-switch,en-change,overflow} (4/4 MUTANT-DETECTED)"
        status: pass
    human_judgment: false
  - id: D3
    description: "shadow-check and harness remain green across all 15 tool pages after this plan"
    requirement: "I18N-01 (convention gate)"
    verification:
      - kind: unit
        ref: "node shadow-check.js --all (SHADOW-CHECK PASS on all 15 tool pages)"
        status: pass
      - kind: unit
        ref: "node harness.js (HARNESS PASS total=2856003)"
        status: pass
    human_judgment: false

duration: single session (commit span cd3f12c..0be02ba)
completed: 2026-10-01
status: complete
plan_head_before: 837e662688fe9c90e71c9bd52d48eefaf59c953b
plan_head_after: 0be02bacff84d169a6baaff0d6b0b4b9feff16ca
---

# Phase 06 Plan 10: Elliptic Curve Diffie-Hellman Translation Summary

**The Elliptic Curve Diffie-Hellman tool — its point-field scatter plot, base-point dropdown, arithmetic log, Eve's notebook and brute-force attack, and group-law explorer — now reads completely in Dutch/English/German/French/Spanish, with the point-dot click/keyboard handlers rewritten to stop parsing the displayed aria-label text (the only place in this phase where program logic read translated text) and a language switch that recomputes Eve's reveal state and rebuilds only the plain-re-render panels, never replaying the field's non-idempotent role-marking/walk-trail side effects.**

## Performance

- **Duration:** single session (commit span `cd3f12c`..`0be02ba`)
- **Tasks:** 2 (both complete)
- **Files modified:** 3 (2 created, 1 modified — excluding this SUMMARY)

## Accomplishments

- **Static interface, curve plot and point selection** (Task 1): canonical i18n header with the five-language switcher; new `assets/i18n/elliptic-curve-diffie-hellman.js` `ecdh` namespace — heading/lede (rich form, with a `dhLinkText` cross-link to Diffie-Hellman Key Exchange whose per-language text duplicates `dh.heading`'s own translations byte-for-byte, since a page namespace cannot reference another page's), the two-paragraph intro (rich form, with the curve-formula span and Alice/Bob/Eve `<strong>` children as positional params), field labels (including the k_A/k_B rich labels with their `<sub>` children), the small-subgroup caution chip, Build exchange/Randomize private scalars, the curve SVG's aria-label, legend, section headings, the explorer's hint/color words, footer. The point-dot `click`/`keydown` handlers no longer call `pointFromAriaLabel(this.getAttribute('aria-label'))` — they close over the point object already in scope via an IIFE (mirroring this same page's pre-existing `renderMultiples()` row-button pattern), and `pointFromAriaLabel()` was deleted outright. A new `onLangChange` callback retranslates the base-point `<option>` texts (`dotRegistry`/`baseOptionRegistry` plain-array registries, no new DOM attributes) and the field's midline/infinity captions in place, without rebuilding the field or losing the current selection.
- **Dynamic narrative** (Task 2): `readInputs()` and the Randomize-scalars handler now track an `errorState {key, params}` instead of writing English directly to `#errorBox`. `STEPS` lost its pre-rendered `caption` strings in favor of a `STEP_CAPTION_KEY` id-to-dictionary-key map (deliberately not built via an `'ecdh.step.' + id` concatenation, per P6). `appendLogEntry`'s ten per-step formula builders, `renderMultiples`, `renderEveNotebook`, `runEveBruteForce`'s three result-box branches, and the group-law explorer's readout/log builders (`renderExplorer`) were all converted from `innerHTML` string concatenation to DOM construction with `translateInto()` and Node params, producing the identical English DOM (including the discrete-log result's embedded `<sup>128</sup>` and the notebook's `<strong>not</strong>` emphasis). The local `SPEED_LABELS` word table was deleted in favor of `translate('common.speed.' + value)`.
- **A second order(G)-collision fix**: `ecdh`'s pre-existing `ord(G)` abbreviation (used in the "agree" log formula, the multiples count, and the match-step's independent-check sentence) is now translated per language via a new `ordWord` key (`orde`/`Ordnung`/`ordre`/`orden`) rather than kept literal like `gcd`/`mod` — the exact same exact-value collision class 06-09 found and fixed for Diffie-Hellman's `order(g) =`, caught here by the runtime `langs` gate flagging `", ord(G) ="` as `UNTRANSLATED` in Dutch and German (see Deviations).
- **Switch-safe replay without side-effect replay**: `onLangChange` retranslates the play/pause label, speed word, error box, base-point options, point aria-labels, and midline/infinity captions directly; then recomputes `eveRevealed` purely from the step list via a new `revealedThroughStep()` helper (no field side effects) and rebuilds only the log (`appendLogEntry` loop) and Eve's notebook from that recomputed state — deliberately never calling `applyStepVisual()` again, since its `markPointRole()`/`animateWalk()` calls are **not idempotent**: each appends a fresh `point-label` SVG text element and `animateWalk()` would re-trigger a walk-trail animation on every switch. `renderMultiples()` and `renderExplorer()` are called fresh (not replayed) since both are already idempotent re-renders driven by tracked state with no accumulated DOM history of their own. Play/pause state and `stepIndex` are untouched.

## Task Commits

Each task was committed atomically:

1. **Task 1: The ECDH page's interface, curve plot and point selection work in all five languages** — `cd3f12c` (feat)
2. **Task 2: The ECDH step log, multiples, Eve's notebook and brute force read as whole sentences in all five languages, and a switch keeps the exchange and walk** — `0be02ba` (feat)

**Plan metadata:** this commit (docs: complete plan)

## Files Created/Modified

- `assets/i18n/elliptic-curve-diffie-hellman.js` — new, `ecdh` namespace (~95 keys: static interface/field/explorer keys from Task 1; validation/step-caption/log-formula/notebook/brute-force-result/explorer-readout keys plus `ordWord` from Task 2) in nl/en/de/fr/es
- `.planning/phases/06-multi-language-support/i18n-config/elliptic-curve-diffie-hellman.json` — new, `allowSame` (French `multiples`/`Point` cognates), `allowLiteral` (`Math.random` code notation, internal step-id tokens, the `prefers-reduced-motion` media query, JS-owned static placeholders overwritten on load), `allowRenderText` (the same cognates mirrored for the runtime `langs` gate), `switchPoints: ["step-2", "eve-brute-force"]`
- `Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html` — canonical header, data-i18n on static markup, point-dot handler rewrite (`pointFromAriaLabel` removed), `dotRegistry`/`baseOptionRegistry`/`midCaptionEl`/`infLabelEl` plain JS refs, `errorState`/`bannerState`/`eveBruteForceState` tracking, DOM-construction log/notebook/brute-force/explorer builders, `STEP_CAPTION_KEY`, `revealedThroughStep()`, `onLangChange` wiring

## Decisions Made

See `key-decisions` in the frontmatter above: `pointFromAriaLabel()` deleted (confirmed unused); `ord(G)` translated per language via `ordWord` (English keeps the literal abbreviation); the field's role-marking circles/labels and walk-trail animations are never touched by a switch (nothing to translate, and re-running them would duplicate state); `renderMultiples()`/`renderExplorer()` called fresh rather than replayed (already idempotent); base-point options/point aria-labels retranslated via plain-array registries, no new DOM attributes.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Eight camelCase step-id tokens and a pre-existing media-query string were flagged `UNTRANSLATED-JS` by the static `--literals-js` gate**
- **Found during:** Task 2, first `i18n-check.js` run on the full page
- **Issue:** `alicePicks`, `bobPicks`, `aliceComputesA`, `bobComputesB`, `sendA`, `sendB`, `aliceSecret`, `bobSecret` (switch-case `step.id` labels) and `(prefers-reduced-motion: reduce)` were flagged — the checker's prose heuristic treats any 3+ letter mixed-case identifier as prose regardless of code position (the same gap 06-07/06-09's equivalent deviations found).
- **Fix:** Added `allowLiteral` entries for all nine tokens, mirroring the Diffie-Hellman Key Exchange precedent.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/elliptic-curve-diffie-hellman.json`
- **Verification:** `--literals-js` passes cleanly
- **Committed in:** `0be02ba` (Task 2 commit)

**2. [Rule 1 - Bug] `", ord(G) ="` was flagged `UNTRANSLATED` by the runtime `langs` check in Dutch and German**
- **Found during:** Task 2, first `i18n-browser.js --mode langs` run
- **Issue:** The initial implementation kept `ord(G)` as invariant math notation (mirroring `gcd`'s literal treatment), but the trailing numeric value makes the whole rendered text segment between the two adjacent value spans byte-identical to English for every possible order value — the exact collision class 06-09 already resolved for Diffie-Hellman's `order(g) =`. (French and Spanish happened not to surface the finding at this exact segment position due to an unrelated upstream segment-count shift elsewhere on the page, but the underlying collision was equally present in all four non-English languages and is fixed uniformly.)
- **Fix:** Added a new `ecdh.ordWord` key translating the word "ord" per language (`orde`/`ord`/`Ordnung`/`ordre`/`orden`), applied at all three call sites (`logAgreeGroupFormula`, `multiplesCount`, `logMatchAgree`) via a `{ordWord}` placeholder present in every language's template (required for the `--coverage` `PLACEHOLDERS` gate).
- **Files modified:** `assets/i18n/elliptic-curve-diffie-hellman.js`, `Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html`
- **Verification:** `langs PASS snaps=21 langs=4` on re-run
- **Committed in:** `0be02ba`

**3. [Rule 1 - Bug] Two Dutch/nl translation slips caught by `--coverage` IDENTICAL-TO-EN before any runtime gate ran**
- **Found during:** Task 1, first `i18n-check.js --coverage` run
- **Issue:** `ecdh.explorerBuildFirst`'s Dutch entry was accidentally left as the literal English copy ("Build a curve first.") during drafting; `ecdh.multiplesCount` and `ecdh.pointAriaLabel` are genuinely identical in French ("multiples"/"Point" are French-English cognates spelled the same).
- **Fix:** Corrected the Dutch translation to "Stel eerst een kromme in."; added `allowSame`/`allowRenderText` cognate exemptions (dictionary-level and runtime-level) for the two French cognates, following the established dual-exemption pattern from 06-04.
- **Files modified:** `assets/i18n/elliptic-curve-diffie-hellman.js`, `.planning/phases/06-multi-language-support/i18n-config/elliptic-curve-diffie-hellman.json`
- **Verification:** `--coverage` passes cleanly
- **Committed in:** `cd3f12c` (Task 1 commit)

---

**Total deviations:** 3 auto-fixed, all Rule 1 (genuine bugs/translation slips surfaced by the plan's own static and runtime gates; no production-scope change). **Impact on plan:** None on scope or architecture — every fix either resolves a genuine cross-language collision the plan's own gates exist to catch, or corrects a drafting slip caught before any commit.

## Issues Encountered

None beyond the deviations above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- A second worked precedent (after 06-09's Diffie-Hellman Key Exchange) now exists for a page whose field/stage accumulates non-idempotent DOM side effects across a run: `onLangChange` must recompute reveal/progress state from the step list itself and rebuild only the plain-re-render panels, never replay the side-effecting render path (`markPointRole`/`animateWalk` here; DH's packet animations there).
- The `order(G)`/`order(g)`-style exact-value collision (a literal shared word/abbreviation making the WHOLE rendered segment byte-identical to English regardless of the numeric value) is now a two-time pattern (06-09, 06-10); any later page with similar "word(X) =" notation should check for this before assuming the word is safely invariant.
- Outstanding for end-of-phase UAT: none newly introduced by this plan. The human-review items already on record from 06-01/06-02/06-04 (switcher legibility/two-tab sync/Firefox cookie persistence, `06-GLOSSARY.md` terminology review, the Equivalence Wheel's export human-check) remain the only outstanding human checks for this phase.

---
*Phase: 06-multi-language-support*
*Completed: 2026-10-01*

## Self-Check: PASSED

- All 3 claimed files found on disk (2 created, 1 modified — see Files Created/Modified above; this SUMMARY itself is the 4th).
- Both claimed task commits found in `git log` (`cd3f12c`, `0be02ba`).
- Re-ran every acceptance-criteria/verification command fresh immediately before writing this SUMMARY:
  - `node i18n-check.js --coverage --header --includes --no-locale-number-format --literals-markup "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html"` — 5/5 PASS
  - `node i18n-check.js "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html"` (all 6 static modes) — 6/6 PASS
  - `node shadow-check.js "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html"` — SHADOW-CHECK PASS
  - `node shadow-check.js --all` — SHADOW-CHECK PASS on all 15 tool pages
  - `node harness.js` — HARNESS PASS total=2856003, zero FAIL
  - `node i18n-browser.js "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html"` — en-parity IDENTICAL snaps=21, langs PASS snaps=21 langs=4, switch PASS points=2 langs=4, layout PASS, ALL PASS
  - `node i18n-browser.js "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" --mutant {untranslated,stale-switch,en-change,overflow}` — 4/4 MUTANT-DETECTED
  - `grep -c 'id="lang-switch-select"'` = 1, `grep -c 'data-i18n="site.nav\.'` = 16, `grep -c '= NT.i18n;'` = 1
  - `grep -v '^\s*//' "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" | grep -c "getAttribute('aria-label')"` = 0
  - `grep -v '^\s*//' "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" | grep -c "SPEED_LABELS"` = 1 (a doc comment confirming removal, not a code reference — the `var SPEED_LABELS` declaration itself is gone)
