---
phase: 06-multi-language-support
plan: 05
subsystem: i18n
tags: [i18n, nt-i18n, nt-bigint, localization, group-isomorphism, fermats-method, requestAnimationFrame]

# Dependency graph
requires:
  - phase: 06-multi-language-support
    provides: "06-01's NT.i18n contract and canonical header; 06-02's shared `common` vocabulary (play/pause/step/instant/speed.N), 06-GLOSSARY.md terminology/tone contract, the per-page translation procedure (P1-P10), i18n-check.js's static gate suite, i18n-browser.js's runtime gate suite, and shadow-check.js's NT.i18n-aware convention gate"
provides:
  - "Group Isomorphism and Fermat's Method fully translated into all five languages"
  - "assets/i18n/group-isomorphism.js (`iso` namespace), assets/i18n/fermats-method.js (`fermat` namespace) data files"
  - "Fermat's Method's animateRearrange() gains a floor-clamped elapsed-time fraction and a replay-click that cancels the pending auto-replay timer — both pre-existing bugs, surfaced only because exact-snapshot i18n testing captures byte-for-byte SVG state"
  - "A worked example (i18n-config/fermats-method.json) of masking an active CSS/SVG transition's transient attributes via `volatile`, and of replacing a play()/pause()-timed 'mid-search' switchPoint with a deterministic stepBtn-driven one, for any later plan whose tool has a continuously-interpolated (not setTimeout-staggered) animation"
affects: ["06-06", "06-07", "06-08", "06-09", "06-10", "06-11", "06-12"]

# Actuals (#2632)
actuals:
  tokens: 22356
  tasks: 2
  commits: 3
  commits_note: "3rd commit (ddeaaad) is a shared dev-tooling fix (headless-Chrome scratch cleanup) made by a different session to resolve an environment interruption that halted this plan mid-Task-2, not a plan deliverable — see Deviations/Issues Encountered."

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Fermat's Method's number-formatting calls (search-log cells, stats, diagram labels, factor chips, results, banner) converted from plain string interpolation to NT.bigint.fmt — the page did not use browser-locale Number formatting before, but fmt() is the project's one sanctioned plain-number formatter and keeps thousands-grouping literal in every language per I18N-05"
    - "A page's local speed-word lookup table (duplicating common.speed.N) deleted once the shared translate('common.speed.' + value) replacement was wired, rather than left dead"
    - "Rich banner/result messages with a <sup>, <strong> or <span class=err> substructure converted from innerHTML string concatenation to translateInto() with DOM-node params, mirroring the T-06-16/T-06-17 pattern from 06-04; a resultState/bannerState object records which scenario + params are showing so onLangChange can re-render the same message in the new language without re-running the search"
    - "An onLangChange callback for a page with an active search/diagram rebuilds the search-log table from the trials already applied (not from scratch) and re-reads a tracked diagramCaptionState, preserving play/pause state and the diagram's current animation rather than restarting either"

key-files:
  created:
    - assets/i18n/group-isomorphism.js
    - assets/i18n/fermats-method.js
    - .planning/phases/06-multi-language-support/i18n-config/fermats-method.json
  modified:
    - Group Isomorphism/group-isomorphism.html
    - Fermats Method/fermats-method.html

key-decisions:
  - "Fermat's Method's animateRearrange() clamps its elapsed-time fraction to [0,1] (was only ceiling-clamped) — fixed as a Rule 1 bug because an un-clamped lower bound let an early rAF timestamp slightly precede the animation's own start time, producing a mathematically impossible opacity > 1 that broke exact-snapshot en-parity comparisons"
  - "Fermat's Method's replayBtn.onclick now cancels the pending one-time auto-replay setTimeout before starting its own animation — fixed as a Rule 1 race condition; previously a user clicking Replay before the natural ~500ms auto-play fire could leave two animateRearrange() invocations able to reset each other's start time unpredictably"
  - "The i18n-config's custom 'mid-search' run step was rewritten from a play-then-pause (factorBtn, playBtn) sequence to a single synchronous js step combining both clicks (so no requestAnimationFrame callback can land between them) followed by three deterministic stepBtn clicks — the original play/pause sequence left the exact captured trial count racy across separate Chrome launches, since real-world rAF cadence for a live, not-yet-paused loop is not virtual-time-deterministic the way setTimeout-based waits are"
  - "The i18n-config's custom run adds a dedicated 'finished-search' snapshot (N=15, instant-finish, 50ms wait) rather than reusing a later 'n-XXX' label or the existing 'after-replay' label as the switch test's finished-search point — both of the latter interact with Fermat's Method's one-time, 500ms-delayed auto-replay animation, whose visual completion depends on how many requestAnimationFrame callbacks the headless --dump-dom harness happens to deliver (observed to vary between zero, giving a frozen pristine diagram, and one very-late frame that jumps straight to the fully-interpolated end state) — a page behavior correctly reproduced by the harness, but not something a single fixed 'wait' margin can convert into a byte-identical switch-vs-direct comparison. 50ms keeps the snapshot strictly before the diagram's own 500ms auto-replay timer on both the direct and switched path, so neither the timer nor its interpolation is ever part of the compared state"
  - "`volatile` patterns added to i18n-config/fermats-method.json mask the removed rect's dynamically-set `opacity` value and r2's four geometry attributes while it is mid-interpolation — the same category of inherently-time-variant rendered content the project already masks via the RSA/Diffie-Hellman `\\d+\\.\\d{2} ms` timing-text patterns, not a weakening of the translation gate itself (both attributes depend only on elapsed real time and fixed geometry, never on the active language)"

requirements-completed: [I18N-01, I18N-02, I18N-03, I18N-05, I18N-06]

coverage:
  - id: D1
    description: "Group Isomorphisms — pair select and its options, randomize, layout tabs, wheel aria labels and SVG labels, captions, readout, pair list and formula line — reads entirely in the active language; switching keeps the pair, layout and selected element"
    requirement: "I18N-01, I18N-02, I18N-03, I18N-05"
    verification:
      - kind: unit
        ref: "node i18n-check.js \"Group Isomorphism/group-isomorphism.html\" (6/6 static modes PASS: coverage, header, includes, no-locale-number-format, literals-markup, literals-js)"
        status: pass
      - kind: unit
        ref: "node shadow-check.js \"Group Isomorphism/group-isomorphism.html\" (SHADOW-CHECK PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Group Isomorphism/group-isomorphism.html\" (en-parity IDENTICAL; langs PASS langs=4; switch PASS langs=4; layout PASS; ALL PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Group Isomorphism/group-isomorphism.html\" --mutant {untranslated,stale-switch,en-change,overflow} (4/4 MUTANT-DETECTED)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Fermat's Method — controls, chips, stats labels, search-log table, diagram labels and caption, legend, banner, result and footer — reads entirely in the active language; switching mid-search keeps the trial position, play/pause state and the drawn diagram"
    requirement: "I18N-01, I18N-02, I18N-03, I18N-05"
    verification:
      - kind: unit
        ref: "node i18n-check.js \"Fermats Method/fermats-method.html\" (6/6 static modes PASS, including no-locale-number-format)"
        status: pass
      - kind: unit
        ref: "node shadow-check.js \"Fermats Method/fermats-method.html\" (SHADOW-CHECK PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Fermats Method/fermats-method.html\" (en-parity IDENTICAL snaps=17; langs PASS snaps=17 langs=4; switch PASS points=2 langs=4 [mid-search, finished-search]; layout PASS; ALL PASS) — re-run 5 consecutive times with zero flake after the fixes below"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Fermats Method/fermats-method.html\" --mutant {untranslated,stale-switch,en-change,overflow} (4/4 MUTANT-DETECTED)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Numbers on Fermat's Method render exactly as before in every language (no browser-locale grouping); with English active both pages render exactly as before this phase"
    requirement: "I18N-06"
    verification:
      - kind: unit
        ref: "node i18n-check.js --no-locale-number-format \"Fermats Method/fermats-method.html\" PASS"
        status: pass
      - kind: e2e
        ref: "en-parity IDENTICAL on both pages (Group Isomorphism; Fermat's Method snaps=17)"
        status: pass
    human_judgment: false

duration: ~2h wall clock across three sessions (two interrupted by unrelated environment failures — see Issues Encountered)
completed: 2026-10-01
status: complete
plan_head_before: f6f6e65ff62e1115efc06fe4e1fcc9fa9b2772ea
plan_head_after: 9050709c5642721674fe9bd339c8f0dcfee57135
---

# Phase 06 Plan 05: Group Isomorphism and Fermat's Method Translation Summary

**Group Isomorphism and Fermat's Method now read completely in Dutch/English/German/French/Spanish; Fermat's Method also gained a `volatile`-pattern worked example for testing a continuously-interpolated SVG animation and two small pre-existing bugs (an un-clamped animation-time fraction, a replay-click that didn't cancel a pending auto-replay timer) fixed after exact-snapshot i18n testing exposed them.**

## Performance

- **Duration:** ~2h wall clock across three sessions; Task 2 was interrupted twice by unrelated environment failures (a filled per-user /tmp quota, then a machine restart) before this continuation finished it — see Issues Encountered
- **Tasks:** 2 (all complete)
- **Files modified:** 5 (3 created, 2 modified — excluding this SUMMARY)

## Accomplishments

- **Group Isomorphism** (`Group Isomorphism/group-isomorphism.html`): canonical i18n header; new `assets/i18n/group-isomorphism.js` `iso` namespace (25 keys) covering title/eyebrow/lede/xref, the pair label and select aria-label, Randomize, the layout tablist and its two tabs, both wheel aria-labels, captions, the "Isomorphic pairs" heading and formula line. The wedge aria-labels, captions and the correspondence readout were converted from innerHTML string concatenation to DOM construction + `translateInto()` (T-06-17), keeping the English DOM byte-identical. One `onLangChange(render)` callback re-renders everything from state, preserving the current pair, layout and selection across a switch.
- **Fermat's Method** (`Fermats Method/fermats-method.html`): canonical i18n header; new `assets/i18n/fermats-method.js` `fermat` namespace covering title/heading/lede, the math-panel note, the N label, Factorize, the five stat labels, the search-log "square?" header, both diagram headings, Replay, the four legend items, the seven preset-chip notes, the search-log cell words, the stat readout words, every banner/result message (searching, error, power-of-two, limit-reached, perfect-square, trivial-pair, trivial-prime, found), the factor-chip title, the result hint, the trail prefix and the footer. `assets/nt-bigint.js` is now included and every number-formatting call (rows, stats, diagram labels, factor chips, results, banner) routes through `NT.bigint.fmt`, replacing plain string interpolation with the project's one sanctioned plain-number formatter (I18N-06: thousands-grouping stays literal, never browser-locale, in every language). The local speed-word lookup table was deleted in favor of `common.speed.N`. Every banner/result message in `showResult()`/`startFactorization()` was converted from innerHTML (with `<strong>`, `<sup>`, `<span class="err">`) to DOM construction through `translateInto()` with Node params (T-06-16). One `onLangChange` callback rebuilds the search-log table from the trials already applied, re-renders stats/banner/result/diagram-caption for the current state, and preserves play/pause and the diagram's animation — it never restarts the search or the diagram.
- **Two pre-existing bugs fixed, both surfaced only because exact-snapshot i18n testing captures byte-for-byte SVG attribute state** (see Deviations): `animateRearrange()`'s elapsed-time fraction is now floor-clamped to 0 (previously only ceiling-clamped to 1), and `replayBtn.onclick` now cancels the pending one-time auto-replay `setTimeout` before starting its own animation.
- **A worked example for testing continuously-interpolated (rAF-driven) animations under the headless i18n-browser.js harness**, added to `i18n-config/fermats-method.json`: a deterministic `stepBtn`-driven replacement for a `play()`/`pause()`-timed "mid-search" switchPoint, a dedicated "finished-search" snapshot taken strictly before the diagram's own auto-replay timer fires, and `volatile` patterns masking the diagram's transient `opacity`/geometry attributes — the first page in this phase with a sustained multi-frame CSS/SVG transition (as opposed to Factor Tree's `setTimeout`-staggered reveals), so the first to expose this class of harness interaction.

## Task Commits

Each task was committed atomically:

1. **Task 1: Group Isomorphisms reads entirely in all five languages and keeps the chosen pair and selection across a switch** — `2506b60` (feat)
2. **Task 2: Fermat's Method reads entirely in all five languages and keeps the search position across a switch** — `9050709` (feat)

**Plan metadata:** this commit (docs: complete plan)

**Note:** one non-plan commit (`ddeaaad`, shared dev-tooling fix for headless-Chrome scratch cleanup) also falls inside this plan's commit range — see Issues Encountered.

## Files Created/Modified

- `assets/i18n/group-isomorphism.js` — `iso` namespace (title, eyebrow, h1, lede, xref, pairLabel/selectAriaLabel, randomize, layoutTablistLabel, powersTab/numericTab, wheel aria-labels, captions, readout, isomorphicPairsHeading, refCount, formulaLine) in all five languages
- `assets/i18n/fermats-method.js` — `fermat` namespace (title, heading, lede, mathNote, nLabel, factorize, 5 stat labels, searchLogHeading, tableSquareHeader, diagramHeading, replay, 4 legend items, footer, 5 chip-note keys, cellYes/No, statHitYes/No, factorChipTitle, diagramPerfectSquareCaption, errEnterInteger, searchingPlain/WithK, kNote, resultPowerOfTwo/Limit(Err)/PerfectSquare/Trivial(Prime)/Found, resultHint, trailPrefix) in all five languages
- `.planning/phases/06-multi-language-support/i18n-config/fermats-method.json` — `allowSame`/`allowRenderText` for the legitimately-borrowed "final" in fr/es (`legendFinal`), `allowLiteral` for the three JS-owned static placeholders, a custom `runs` override (deterministic stepBtn-driven "mid-search", a dedicated "finished-search" snapshot), `switchPoints: ["mid-search", "finished-search"]`, and `volatile` patterns for the diagram's transient opacity/geometry attributes
- `Group Isomorphism/group-isomorphism.html` — canonical header, data-i18n on static markup, DOM-construction wedge/caption/readout helpers, onLangChange wiring
- `Fermats Method/fermats-method.html` — canonical header, data-i18n on static markup, `nt-bigint.js` include + `fmt` import, DOM-construction banner/result builders, `animateRearrange()`'s floor-clamp fix, `replayBtn.onclick`'s timer-cancellation fix, onLangChange wiring

## Decisions Made

See `key-decisions` in the frontmatter above (animation-fraction clamp, replay-timer cancellation, the deterministic `stepBtn`-based mid-search switchPoint, the dedicated pre-timer finished-search switchPoint, and the `volatile`-pattern masking rationale).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `animateRearrange()`'s elapsed-time fraction could go negative, producing an impossible `opacity > 1`**
- **Found during:** Task 2, first `i18n-browser.js` en-parity runs (surfaced as a non-reproducing "DIFF at load/step-1/n-15" with an `opacity` value like `1.0225886...` or `1.0000005...`)
- **Issue:** `const t = Math.min(1, (now - t0) / duration);` only ceiling-clamped `t`. An early `requestAnimationFrame` timestamp can occasionally precede the `performance.now()` captured as `t0` by a sub-millisecond amount, making `t` slightly negative; `easeInOutCubic` doesn't re-clamp, so `removed.setAttribute('opacity', String(1 - 0.75 * e))` could compute a value fractionally above 1 — a real (if visually imperceptible) bug, independent of i18n, that happened to break exact-snapshot en-parity comparisons.
- **Fix:** `const t = Math.max(0, Math.min(1, (now - t0) / duration));`
- **Files modified:** `Fermats Method/fermats-method.html`
- **Verification:** en-parity re-run 3× clean after the fix (the one remaining "load" epsilon case was the *position* analog of the same root cause, resolved by decision #5 below, not this clamp)
- **Committed in:** `9050709` (Task 2 commit)

**2. [Rule 1 - Bug] Clicking Replay didn't cancel the pending one-time auto-replay timer**
- **Found during:** Task 2, `i18n-browser.js` switch-mode runs against an early "after-replay" switchPoint (showing a full, deterministic swing between the diagram's pristine start position and its fully-animated end position depending on which code path's `animateRearrange()` call survived)
- **Issue:** `buildDiagram()` schedules a one-time `autoplayTimer` (500ms after drawing) that also calls `animateRearrange()`. `replayBtn.onclick` called `animateRearrange()` directly without clearing that timer, so a user replaying before the natural auto-play fired left two invocations able to cancel and restart each other's `t0` unpredictably.
- **Fix:** `replayBtn.onclick` now clears `autoplayTimer` (if still pending) before calling `animateRearrange()`.
- **Files modified:** `Fermats Method/fermats-method.html`
- **Verification:** confirmed via a standalone instrumented reproduction (loading the page directly with explicit diagnostic `js` steps) before and after the fix; real root cause of the "after-replay" switchPoint instability turned out to be a *separate*, harness-level limitation (decision #5), which is why "after-replay" was replaced rather than kept as the finished-search switchPoint — this fix is independently correct and left in place
- **Committed in:** `9050709` (Task 2 commit)

**3. [Rule 1 - Bug] `legendFinal`'s identical fr/es rendered text flagged as UNTRANSLATED by `i18n-browser.js`'s runtime `langs` check**
- **Found during:** Task 2, first `i18n-browser.js` run
- **Issue:** The config already carried a dictionary-level `allowSame` entry for `fermat.legendFinal` (French/Spanish genuinely borrow "final"), but the *runtime* `langs` check uses a separate, rendered-text-keyed exemption (`allowRenderText`), which wasn't yet populated for this page.
- **Fix:** Added an `allowRenderText` entry for the rendered string `"final (a+b) × (a−b)"`, mirroring the dual dictionary-level/runtime-level pattern 06-04 established.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/fermats-method.json`
- **Verification:** `langs PASS` on re-run
- **Committed in:** `9050709`

**4. [Rule 1 - Bug] The English dictionary entry for `lede` used a curly apostrophe where the static markup used a straight one**
- **Found during:** Task 2, first `i18n-browser.js` en-parity run (`DIFF at load`, "Fermat's method" vs "Fermat's method" with a different U+2019 vs U+0027 apostrophe)
- **Issue:** Simple transcription mismatch between the dictionary's `en` entry and the pre-existing static markup it needed to reproduce byte-for-byte.
- **Fix:** Changed the dictionary's `en.lede` to use the same straight apostrophe (`'`) as the original markup.
- **Files modified:** `assets/i18n/fermats-method.js`
- **Verification:** en-parity `IDENTICAL` on re-run
- **Committed in:** `9050709`

**5. [Rule 3 - Blocking] The originally-planned "mid-search" and "after-replay"/"n-8051" switchPoints were not reliably byte-reproducible across two separate headless-Chrome launches**
- **Found during:** Task 2, repeated `i18n-browser.js` switch-mode runs
- **Issue:** (a) Pausing a live `requestAnimationFrame`-driven search loop via `factorBtn` then `playBtn` captures however many trials happened to process in the gap between the two dispatched clicks — not deterministic across two separate Chrome launches under `--virtual-time-budget`. (b) The diagram's one-time, 500ms-delayed auto-replay animation needs multiple `requestAnimationFrame` callbacks to visually interpolate, and the headless `--dump-dom` harness was observed (via a standalone instrumented reproduction) to deliver either zero further callbacks (animation frozen at its pristine start) or one very-late callback that jumps straight to the fully-interpolated end state, depending on unrelated timing elsewhere in the same run — a real, correctly-reproduced browser behavior, not something any fixed `wait` margin could convert into a byte-identical switch-vs-direct comparison when only ONE of the two compared paths performs the extra DOM-mutating language-switch action.
- **Fix:** Replaced the play()/pause() "mid-search" sequence with a single synchronous `js` step issuing both clicks back-to-back (so no `requestAnimationFrame` callback can land between them, reliably pausing at trial 0) followed by three deterministic `stepBtn` clicks (synchronous, no rAF involved). Added a dedicated "finished-search" snapshot (N=15, instant-finish, 50ms wait — strictly before the 500ms auto-replay timer on both the direct and switched path) and used it as the "finished-search" switchPoint instead of "after-replay"/"n-8051". Also added `volatile` patterns masking the removed rect's `opacity` and r2's geometry attributes for the residual sub-pixel/epsilon jitter the same root cause produces near either timing boundary.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/fermats-method.json`
- **Verification:** full `i18n-browser.js` suite re-run 5 times consecutively (en-parity, langs, switch, layout) with zero failures after this change, plus the 4 `--mutant` self-tests
- **Committed in:** `9050709`

---

**Total deviations:** 5 auto-fixed (4 Rule 1 bugs — two genuine, pre-existing page bugs and two gate-tooling/dictionary exemption fixes — and 1 Rule 3 blocking test-determinism fix). **Impact on plan:** The two page-code fixes (animation clamp, replay-timer cancellation) are small, surgical, and improve real user-facing correctness beyond what i18n alone required; no architectural change. The switchPoint rework only affects dev-only test configuration, not shipped behavior.

## Issues Encountered

- **Environment interruptions, not implementation problems.** Two earlier attempts at Task 2 were interrupted by unrelated environment failures: first the per-user `/tmp` quota filled from interrupted headless-Chrome checker runs leaving scratch directories behind, then the machine restarted. Both are resolved — a separate session (commit `ddeaaad`, by a different agent) hardened `harness.js`'s `mkScratch()`/`chromeEnv()` to keep all scratch under a self-cleaning `/tmp/nt-scratch-<pid>-*` root, removed on exit/signal and swept on the next run. That commit falls inside this plan's measured commit range (`plan_head_before`..`HEAD`) because of when it landed chronologically, not because it is a 06-05 deliverable; it is called out here and in the `actuals.commits_note` so the measured count (3) is not misread as three task commits.
- No other issues. All verification commands (static, shadow, runtime, mutant self-tests, and the acceptance-criteria greps) were re-run fresh immediately before writing this SUMMARY and pass cleanly.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Group Isomorphism and Fermat's Method are two more proven reference implementations of the P1–P10 procedure.
- `i18n-config/fermats-method.json` is a worked example for any later wave-3 page with a sustained, multi-frame rAF-interpolated animation (as opposed to `setTimeout`-staggered reveals like Factor Tree's): prefer deterministic `stepBtn`/synchronous-`js`-step sequences over `play()`/`pause()` timing races for switchPoints, snapshot strictly before any auto-triggered timer rather than trying to outwait it with a larger margin, and reach for `volatile` patterns (same category as RSA/Diffie-Hellman's `\d+\.\d{2} ms`) for attributes that depend only on elapsed real time.
- `NT.bigint.fmt` is now used by a page (Fermat's Method) that previously had no number-formatting call at all — confirms the pattern generalizes beyond the pages that already used it before this phase.

---
*Phase: 06-multi-language-support*
*Completed: 2026-10-01*

## Self-Check: PASSED

- All 5 claimed files found on disk (3 created, 2 modified — see Files Created/Modified above; this SUMMARY itself is the 6th).
- Both claimed task commits found in `git log` (`2506b60`, `9050709`); the non-task commit `ddeaaad` also confirmed present and correctly attributed in Issues Encountered.
- Re-ran all acceptance-criteria/verification commands fresh immediately before writing this SUMMARY:
  - `node i18n-check.js "Group Isomorphism/group-isomorphism.html"` and `"Fermats Method/fermats-method.html"` — 6/6 static modes PASS on both pages
  - `node shadow-check.js --all` — SHADOW-CHECK PASS on all 15 tool pages (including both pages this plan touched)
  - `node i18n-browser.js "Group Isomorphism/group-isomorphism.html"` — en-parity IDENTICAL, langs PASS, switch PASS, layout PASS, ALL PASS
  - `node i18n-browser.js "Fermats Method/fermats-method.html"` — en-parity IDENTICAL snaps=17, langs PASS snaps=17 langs=4, switch PASS points=2 langs=4, layout PASS, ALL PASS (re-run 4 consecutive times, zero flake)
  - `node i18n-browser.js "Fermats Method/fermats-method.html" --mutant {untranslated,stale-switch,en-change,overflow}` — 4/4 MUTANT-DETECTED
  - `node i18n-check.js --api` (122) / `--persistence` (71) / `--smoke` (123, mutant detected) — all PASS, no regression
  - `grep -c 'id="lang-switch-select"'` = 1, `grep -c 'data-i18n="site.nav\.'` = 16, `grep -c '= NT.i18n;'` = 1, `grep -c '= NT.bigint;'` = 1 on Fermat's Method; `= NT.i18n;` = 1 on Group Isomorphism
