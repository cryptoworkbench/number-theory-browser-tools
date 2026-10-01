---
phase: 06-multi-language-support
plan: 09
subsystem: i18n
tags: [i18n, nt-i18n, nt-bigint, nt-svg, localization, diffie-hellman-key-exchange, playback, dom-construction]

# Dependency graph
requires:
  - phase: 06-multi-language-support
    provides: "06-01's NT.i18n contract and canonical header; 06-02's shared `common` vocabulary (play/pause/step/instant/speed.N), 06-GLOSSARY.md terminology/tone contract, the per-page translation procedure (P1-P10), i18n-check.js's static gate suite, i18n-browser.js's runtime gate suite, and shadow-check.js's NT.i18n-aware convention gate"
provides:
  - "Diffie-Hellman Key Exchange fully translated into all five languages — static interface, stage SVG, and every narrative string (arithmetic log, Eve's notebook, discrete-log-problem panel, brute-force result boxes, AES sentence)"
  - "assets/i18n/diffie-hellman-key-exchange.js ('dh' namespace) data file"
  - "A worked precedent for a page whose stage visualization persists DOM state (row opacity/style/is-active history) across language switches: onLangChange retranslates text in place rather than rebuilding the stage, to avoid discarding that history"
  - "i18n-browser.js's VOLATILE-sentinel exemption in the langs check — any future plan whose volatile regex spans inter-tag text (not just an attribute value) is now covered"
affects: ["06-10", "06-11", "06-12"]

# Actuals (#2632)
actuals:
  tokens: 27000
  tasks: 2
  commits: 2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "A page whose SVG stage elements accumulate opacity/style/class history across resets (not just current language) must retranslate text IN PLACE on language switch rather than rebuilding the stage from scratch — rebuilding via buildStage() would discard that history and silently diverge from a direct-load snapshot at the same point, since the pre-existing (and left unchanged by this plan) resetPlayback() only resets opacity, never textContent, leaving a prior reveal's text sitting invisibly in a row"
    - "retranslateAllRows(ex): a page-level helper that unconditionally retranslates EVERY stage row from the exchange's own data, not just officially-revealed ones — matching this page's own pre-existing quirk (stale-but-numerically-identical text left behind by Reset) rather than fixing it, since fixing it would change English output and break en-parity"
    - "A step-id -> dictionary-key map (STEP_CAPTION_KEY) used instead of a 'dh.step.' + id concatenation — P6 reserves that key-prefix-concatenation idiom for common.speed.<n> alone; a second instance of the idiom is not recognized by the checker's key-argument exemption and is flagged as UNTRANSLATED-JS"
    - "A volatile regex spanning inter-tag TEXT content (not just an attribute value, e.g. a <g class='packet'>...</g> animation element whose inner <text> is itself displayed text) needs the shared i18n-browser.js langs check to skip a text segment composed entirely of the volatile sentinel — the 8-letter 'VOLATILE' token in '█VOLATILE█' is not covered by isProse's all-uppercase-<=5-letters neutral rule"

key-files:
  created:
    - assets/i18n/diffie-hellman-key-exchange.js
    - .planning/phases/06-multi-language-support/i18n-config/diffie-hellman-key-exchange.json
  modified:
    - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
    - .planning/phases/06-multi-language-support/i18n-browser.js

key-decisions:
  - "Eve is kept as the literal English name 'Eve' in every language (never localized to 'Ève'/'Eva') — the glossary's own proper-noun table note ('Kept per the project's narrative convention — see Alice above') and i18n-check.js's NEUTRAL_TOKENS list (which only recognizes lowercase 'eve', never 'ève'/'eva') both point to the same invariant convention already established for Alice"
  - "'order(g) =' is translated per language via a new dh.orderLabel key (orde(g)/order(g)/Ordnung(g)/ordre(g)/orden(g)) rather than kept as invariant math-function notation (unlike gcd/mod) — a literal shared prefix made the ENTIRE rendered text segment identical to English for every numeric order value, which the exact-match allowRenderText exemption cannot cover since the value varies per run (same class of collision as 06-07's mulBase fix)"
  - "resetPlayback()'s pre-existing behavior (clearing row opacity/active-class but never textContent, so a prior reveal's text sits invisibly in a row after Reset) was deliberately left unchanged rather than fixed — fixing it would alter English output and break en-parity's byte-identical requirement; instead onLangChange's retranslateAllRows() reproduces the same quirk, correctly translated, rather than silently diverging from it"
  - "aesSentence's secret param is rendered via secret.toString() (no digit grouping), not NT.bigint.fmt() — the original pre-phase code used toString() for this one value, and fmt()'s comma grouping would have been an unplanned English output change"

requirements-completed: [I18N-01, I18N-02, I18N-03, I18N-05, I18N-06]

coverage:
  - id: D1
    description: "The Diffie-Hellman page's static interface and stage — intro panel (rich form with Alice/Bob/Eve strong children and a teaching-demo em child), field labels, buttons, bit-size select, legend, stage SVG aria-label and prose labels (Eve/tap), scratchpad labels, section headings, footer — reads in all five languages"
    requirement: "I18N-01"
    verification:
      - kind: unit
        ref: "node i18n-check.js --coverage --header --includes --no-locale-number-format --literals-markup \"Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html\" (5/5 PASS)"
        status: pass
      - kind: unit
        ref: "node shadow-check.js \"Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html\" (SHADOW-CHECK PASS)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Every arithmetic-log entry, Eve's notebook and discrete-log-problem panel, her brute-force attempt result, the AES sentence, banner and validation messages read as whole sentences in all five languages; formulas and numbers are unchanged; switching language at any point (mid-exchange and after the finished exchange) keeps the exchange, step index, delivered packets, Eve's notebook and the scratchpad; English renders exactly as before this phase"
    requirement: "I18N-02, I18N-03, I18N-05, I18N-06"
    verification:
      - kind: unit
        ref: "node i18n-check.js \"Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html\" (6/6 static modes PASS, incl. literals-js)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html\" (en-parity IDENTICAL snaps=24; langs PASS snaps=24 langs=4; switch PASS points=2 langs=4 [step-sendAliceToBob, step-match]; layout PASS; ALL PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html\" --mutant {untranslated,stale-switch,en-change,overflow} (4/4 MUTANT-DETECTED)"
        status: pass
    human_judgment: false
  - id: D3
    description: "shadow-check and harness remain green across all 15 tool pages after this plan's edit to the shared i18n-browser.js langs check (VOLATILE-sentinel exemption)"
    requirement: "I18N-01 (convention gate)"
    verification:
      - kind: unit
        ref: "node shadow-check.js --all (SHADOW-CHECK PASS on all 15 tool pages)"
        status: pass
      - kind: unit
        ref: "node harness.js (HARNESS PASS total=2856003)"
        status: pass
    human_judgment: false

duration: 22 min (commit span 07e15e5..d09bee0); actual working time, including research into the per-page translation pattern, drafting ~90 dictionary keys in 5 languages, and iterating through the switch/en-parity gate failures described below, was considerably longer
completed: 2026-10-01
status: complete
plan_head_before: f961e9fe5dba0791a87a5f2f9aad260ba346afb5
plan_head_after: d09bee0ddc5369ebbd099fc8fbd76f9170781458
---

# Phase 06 Plan 09: Diffie-Hellman Key Exchange Translation Summary

**The Diffie-Hellman Key Exchange tool — every arithmetic-log entry, Eve's notebook, her discrete-log brute-force attack, the AES hand-off sentence and the stage diagram's two prose labels — now reads completely in Dutch/English/German/French/Spanish, with every innerHTML narrative builder rebuilt as DOM construction and a language switch retranslating the stage in place rather than rebuilding it, so the exchange, step position, delivered packets and Eve's notebook survive the switch exactly.**

## Performance

- **Duration:** 22 min (git commit span `07e15e5`..`d09bee0`); the session's actual elapsed working time — reading the plan and reference pages (06-01/06-02/06-07 PLANs and SUMMARYs, the shipped Square and Multiply page as the DOM-construction/onLangChange precedent), drafting the ~90-key `dh` dictionary in five languages, converting every `innerHTML` builder, and iterating through three rounds of runtime-gate failures (en-parity, langs, switch) — was considerably longer than the commit-to-commit span captures.
- **Started:** 2026-10-01T19:16:57+02:00 (first production commit)
- **Completed:** 2026-10-01T19:38:24+02:00 (last production commit)
- **Tasks:** 2 (both complete)
- **Files modified:** 4 (2 created, 2 modified — excluding this SUMMARY)

## Accomplishments

- **Static interface and stage** (Task 1): canonical i18n header with the five-language switcher; new `assets/i18n/diffie-hellman-key-exchange.js` `dh` namespace (title/heading/lede, the intro panel's two rich-form paragraphs with Alice/Bob/Eve `<strong>` children and a `teachingDemo` `<em>` child, the four field labels, Build exchange/Randomize a,b/Generate safe prime, the bit-size label and its three `{n}-bit` option templates, the stage `aria-label`, the four legend items, the Arithmetic log heading, the scratchpad's title/group labels, the footer and its three pills). `buildStage()`'s two prose SVG labels (`Eve — tapping the wire`, `🕵 tap`) now render via `translate()`; the Alice/Bob labels stay literal (invariant proper nouns, confirmed by `06-GLOSSARY.md`'s own note and `i18n-check.js`'s `NEUTRAL_TOKENS`).
- **Dynamic narrative** (Task 2): `readInputs()`, `genPrimeBtn` and `randomSecretsBtn` now track an `errorState {key, params}` instead of writing English directly to `#errorBox`. `buildExchange()`'s step captions are no longer pre-rendered strings — `renderStep`/`applyStepVisual` derive them from a `STEP_CAPTION_KEY` id-to-dictionary-key map. `renderNotebook`, `renderEveProblem`, `runEveDlog`'s three result boxes (giveup-large, win, giveup-after) and `appendLogEntry`'s ten per-step formula builders were all converted from `innerHTML` string concatenation to DOM construction with `translateInto()` and Node params, producing the identical English DOM (including the discrete-log-problem panel's embedded `<sup>ab</sup>` and the notebook's `<strong>not</strong>` emphasis). `applyStepVisual`/`renderStep` is split exactly like the Square and Multiply precedent — a replay-safe visual half plus a banner-setting wrapper. The local `SPEED_LABELS` table was deleted in favor of `translate('common.speed.' + value)`.
- **Stage-state-preserving language switch**: `onLangChange` retranslates the two prose SVG labels and every row's text **in place** via a new `retranslateAllRows(ex)` helper, deliberately never calling `buildStage()` again — rebuilding the stage would discard the opacity/style/`is-active` history every row has accumulated through resets and reveals this session, which a switch must preserve byte-for-byte to match a direct page load in the target language at the same point. The log/notebook/problem/AES/scratchpad panels (which carry no such history — they are always cleanly cleared on reset/rebuild) are rebuilt by replaying `applyStepVisual` up to the current step index, restoring Eve's interception state via the real `recordEveIntercept()` rather than re-launching any packet animation.

## Task Commits

Each task was committed atomically:

1. **Task 1: The Diffie-Hellman page's interface and stage read in all five languages** — `07e15e5` (feat)
2. **Task 2: The exchange narrative, Eve's notebook and her attack read as whole sentences in all five languages, and a switch keeps the exchange where it is** — `d09bee0` (feat)

**Plan metadata:** this commit (docs: complete plan)

## Files Created/Modified

- `assets/i18n/diffie-hellman-key-exchange.js` — new, `dh` namespace (~90 keys: static interface/stage keys from Task 1; validation/step-caption/notebook/discrete-log-problem/brute-force-result/log-formula keys from Task 2) in nl/en/de/fr/es
- `.planning/phases/06-multi-language-support/i18n-config/diffie-hellman-key-exchange.json` — new, `allowLiteral` (JS-owned static placeholders, `Math.random` code notation, internal step-id/DOM-id camelCase tokens, the `prefers-reduced-motion` media query), `allowRenderText` (`Math.random`), `volatile` (the packet-animation `<g class="packet">...</g>` element), `switchPoints: ["step-sendAliceToBob", "step-match"]`
- `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` — canonical header, data-i18n on static markup, `STEP_CAPTION_KEY`, `errorState`/`bannerState` tracking, DOM-construction notebook/problem/result/log builders, `retranslateAllRows()`, `onLangChange` wiring
- `.planning/phases/06-multi-language-support/i18n-browser.js` — `doLangs()`'s per-segment loop now skips a segment composed entirely of the volatile sentinel before the `isProse` check (see Deviations)

## Decisions Made

See `key-decisions` in the frontmatter above: Eve kept literal in every language (matching Alice's established precedent and `NEUTRAL_TOKENS`); `order(g) =` translated per language (`dh.orderLabel`) rather than kept as invariant notation, to avoid an exact-value collision with English; `resetPlayback()`'s pre-existing stale-text-after-reset behavior left unchanged (not "fixed") to preserve en-parity, with `retranslateAllRows()` reproducing it correctly translated instead; `aesSentence`'s secret rendered via `toString()` not `fmt()`, matching the pre-phase code exactly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Two step-caption/row-text issues found by the static `--literals-js` gate on first run**
- **Found during:** Task 2, first `i18n-check.js` run on the full page
- **Issue:** (a) Eight camelCase step-id/DOM-id tokens (`alicePicks`, `bobPicks`, …, `svgAlicePg`, `svgEveB`, `eveDlogBtn`, `eveDlogResult`) and a pre-existing `(prefers-reduced-motion: reduce)` media-query string were flagged `UNTRANSLATED-JS` — the checker's prose heuristic treats any 3+ letter mixed-case identifier as prose regardless of code position (the same gap 06-07's Shor's Algorithm deviation #5 found); (b) a `'dh.step.' + step.id` key-prefix concatenation was flagged, since P6 reserves that idiom for `common.speed.<n>` alone and the checker's key-argument exemption only recognizes the literal argument to `translate`/`translateInto`, not a concatenation assigned to a variable first.
- **Fix:** Added `allowLiteral` entries for the step-id/DOM-id tokens and the media-query string (mirroring the Shor's Algorithm precedent); replaced the concatenation with a `STEP_CAPTION_KEY` id-to-full-dotted-key map, whose bare object-literal property names are never scanned as string literals.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/diffie-hellman-key-exchange.json`, `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html`
- **Verification:** `--literals-js` passes cleanly
- **Committed in:** `d09bee0` (Task 2 commit)

**2. [Rule 1 - Bug] `order(g) = {value}` was flagged `UNTRANSLATED` by the runtime `langs` check in every non-English language**
- **Found during:** Task 2, first `i18n-browser.js` run
- **Issue:** The initial implementation kept `order(g) = ` as invariant math-function notation (mirroring `gcd(a,b)`'s established literal treatment), but since the trailing numeric value is the SAME across languages, the entire rendered text segment was byte-identical to English for every possible order value — an exact-match `allowRenderText` exemption cannot cover a value that varies per run (the same class of collision 06-07's Square and Multiply `mulBase` fix resolved).
- **Fix:** Added a new `dh.orderLabel` key translating the word "order" per language (`orde(g) =` / `order(g) =` / `Ordnung(g) =` / `ordre(g) =` / `orden(g) =`), which is linguistically correct (unlike `gcd`, "order" has a per-language term in `06-GLOSSARY.md`) and resolves the collision without an exemption.
- **Files modified:** `assets/i18n/diffie-hellman-key-exchange.js`, `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html`, `.planning/phases/06-multi-language-support/i18n-config/diffie-hellman-key-exchange.json` (removed the now-unneeded `allowLiteral` entry)
- **Verification:** `langs PASS snaps=24 langs=4` on re-run
- **Committed in:** `d09bee0`

**3. [Rule 1 - Bug] An extra `<span>` wrapper around the "They agree" step's labels and match-result text broke en-parity**
- **Found during:** Task 2, first `en-parity` run (`DIFF at load`)
- **Issue:** The initial DOM-construction rewrite wrapped `Alice's secret =`/`Bob's secret =`/the match-result text in bare `<span>` elements via `translateInto`, but the original markup had these as plain text nodes (no wrapper) concatenated around the two `.val` spans — an unplanned DOM-shape change.
- **Fix:** Rewrote the `'match'` case to append `translate(...)` results as plain text nodes (`document.createTextNode`), matching the original's exact text/element structure.
- **Files modified:** `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html`
- **Verification:** `en-parity IDENTICAL` on re-run
- **Committed in:** `d09bee0`

**4. [Rule 1 - Bug] `aesSentence`'s secret value used comma-grouped formatting (`fmt()`), diverging from the pre-phase code's `secret.toString()`**
- **Found during:** Task 2, second `en-parity` run (`DIFF at chip-2`)
- **Issue:** The original `aesSentence()` helper used `secret.toString()` (no digit grouping); the DOM-construction rewrite substituted `NT.bigint.fmt()` for consistency with every other displayed number on the page, changing English output for large secrets.
- **Fix:** Reverted to `ex.secretAlice.toString()` for this one parameter, matching the pre-phase behavior exactly.
- **Files modified:** `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html`
- **Verification:** `en-parity IDENTICAL` on re-run
- **Committed in:** `d09bee0`

**5. [Rule 1 - Bug] The `switch` gate's exact-HTML comparison diverged on `style=""`-attribute presence and on stale-but-numerically-identical row text, because the first `onLangChange` implementation rebuilt the stage via `buildStage()`**
- **Found during:** Task 2, first `switch` mode run, at both configured switch points
- **Issue:** `buildStage()` recreates every stage element from scratch, discarding (a) the `style=""` (present-but-empty) attribute a row accumulates once `resetPlayback()` has ever reset its opacity, and (b) a prior reveal's stale-but-invisible text that `resetPlayback()` leaves behind (it only resets opacity/class, never `textContent` — a pre-existing quirk of the untouched page, confirmed present in the direct-language baseline too). A direct page load in the target language naturally carries both artifacts by the time it reaches the same point in the browser-diff step sequence; a freshly rebuilt stage has neither.
- **Fix:** Replaced the `buildStage()`-based rebuild with in-place retranslation: `retranslateAllRows(ex)` unconditionally rewrites every row's `textContent` from the exchange's own data (reproducing the stale-but-identical-value quirk, correctly translated, rather than silently diverging from it), and the two prose SVG labels are retranslated via plain JS references (`eveLabelEl`/`tapLabelEl`, set once by `buildStage()` — no new DOM `id`/`class` was added, since either would itself be a markup change absent from the pre-phase baseline). Opacity/style/class are left completely untouched by the switch.
- **Files modified:** `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html`
- **Verification:** `switch PASS points=2 langs=4` on re-run
- **Committed in:** `d09bee0`

**6. [Rule 1 - Bug] A transient packet-animation element (`<g class="packet">...</g>`) left stuck in the DOM by this test harness's headless-Chrome timing caused a further `switch` mismatch, requiring a `volatile` exemption that itself needed a shared-tooling fix**
- **Found during:** Task 2, second `switch` mode run (after fix #5)
- **Issue:** Under this harness's virtual-time-budget headless Chrome, a `sendPacket()` animation's `requestAnimationFrame` loop does not reliably complete within the configured waits, leaving a `<g class="packet">` element present in the direct-language run but absent from the switched run (whose `onLangChange` never re-launches packets, per the plan's own instruction). Adding a `volatile` regex (`<g class=.packet[^>]*>.*?</g>`) to strip this element from both sides before comparison then surfaced a SECOND, shared-tooling bug: the volatile sentinel itself (`█VOLATILE█`) was flagged `UNTRANSLATED` by the runtime `langs` check in every non-English language, because the 8-letter "VOLATILE" token isn't covered by `isProse`'s all-uppercase-≤5-letters neutral-word rule, and the sentinel is identical in English and every other language by construction.
- **Fix:** Added the `volatile` entry to this plan's `i18n-config`; fixed `i18n-browser.js`'s `doLangs()` to skip a text segment composed entirely of the volatile sentinel before running `isProse` — a general fix benefiting any future plan whose `volatile` regex spans inter-tag text rather than just an attribute value.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/diffie-hellman-key-exchange.json`, `.planning/phases/06-multi-language-support/i18n-browser.js`
- **Verification:** `switch PASS points=2 langs=4`, `langs PASS snaps=24 langs=4`, `ALL PASS` on re-run; `shadow-check --all` and `harness.js` both still green across all 15 pages
- **Committed in:** `d09bee0`

---

**Total deviations:** 6 auto-fixed, all Rule 1 (five page-level gate/behavior fixes surfaced by the static and runtime gates, one of which required a shared-tooling fix in `i18n-browser.js` to resolve correctly). **Impact on plan:** None on scope or architecture. No user-facing English behavior changed beyond what the plan specified — every fix either restores exact pre-phase byte-identity (deviations #3, #4, #5) or resolves a genuine cross-language collision the plan's own gates exist to catch (deviations #1, #2, #6).

## Issues Encountered

None beyond the deviations above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- A worked precedent now exists for any later wave-3 (or future) plan whose tool's stage/canvas accumulates DOM-visible history across resets: retranslate text in place, never rebuild the stage, when the pre-existing behavior (right or wrong) must be preserved for en-parity.
- `i18n-browser.js`'s `doLangs()` volatile-sentinel exemption is now a permanent part of the shared runtime gate, available to any future plan whose own `volatile` regex spans displayed text.
- Outstanding for end-of-phase UAT: none newly introduced by this plan. The human-review items already on record from 06-01/06-02/06-04 (switcher legibility/two-tab sync/Firefox cookie persistence, `06-GLOSSARY.md` terminology review, the Equivalence Wheel's export human-check) remain the only outstanding human checks for this phase.

---
*Phase: 06-multi-language-support*
*Completed: 2026-10-01*

## Self-Check: PASSED

- All 4 claimed files found on disk (2 created, 2 modified — see Files Created/Modified above; this SUMMARY itself is the 5th).
- Both claimed task commits found in `git log` (`07e15e5`, `d09bee0`).
- Re-ran every acceptance-criteria/verification command fresh immediately before writing this SUMMARY:
  - `node i18n-check.js --coverage --header --includes --no-locale-number-format --literals-markup "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"` — 5/5 PASS
  - `node i18n-check.js "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"` (all 6 static modes) — 6/6 PASS
  - `node shadow-check.js "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"` — SHADOW-CHECK PASS
  - `node shadow-check.js --all` — SHADOW-CHECK PASS on all 15 tool pages
  - `node harness.js` — HARNESS PASS total=2856003, zero FAIL
  - `node i18n-browser.js "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"` — en-parity IDENTICAL snaps=24, langs PASS snaps=24 langs=4, switch PASS points=2 langs=4, layout PASS, ALL PASS
  - `node i18n-browser.js "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html" --mutant {untranslated,stale-switch,en-change,overflow}` — 4/4 MUTANT-DETECTED
  - `grep -c 'id="lang-switch-select"'` = 1, `grep -c 'data-i18n="site.nav\.'` = 16, `grep -c '= NT.i18n;'` = 1
  - `grep -v '^\s*//' "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html" | grep -c "SPEED_LABELS"` = 0
