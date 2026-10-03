---
phase: quick-261003-bqz
plan: 01
subsystem: ui
tags: [i18n, css, headless-chrome, gate-tooling, responsive]

requires:
  - phase: 06-multi-language-support
    provides: the 16-page multi-language switcher, i18n-check.js, i18n-browser.js
provides:
  - a shared <footer class="site-footer"> on all 16 pages holding the byte-identical language switcher, moved out of the site header
  - assets/site.css .site-footer/.site-footer-inner rules, print-hide, and a trimmed .lang-switch
  - i18n-check.js FOOTER-COUNT/FOOTER-DRIFT/FOOTER-POSITION/SWITCHER-IN-HEADER/SWITCHER-NOT-IN-FOOTER checks
  - i18n-browser.js's strict whole-footer en-parity strip plus the footer-extra mutant
  - footer-probe.js (markup/strip/gate/css/w375/style/scratch/neg verification modes)
  - two pre-existing true-375px responsive fixes on Group Isomorphism (h1 overflow-wrap, select width cap)
affects: [06-multi-language-support, any future quick task touching site.css header/footer chrome]

actuals:
  tokens: 39200
  tasks: 3
  commits: 3
  plan_head_before: 81c4d147b0d28a2e039fece0ed2b67ada6e13e4f
  plan_head_after: 46f6c9e6e47fb5e2319f1469be527de511879bf1

tech-stack:
  added: []
  patterns:
    - "iframe-nested headless-Chrome probing to escape the ~500px minimum --window-size floor and reach a true narrow viewport (e.g. 375px) inside a larger outer window"
    - "encoding a documented, exact page-content deviation inside a byte-exact rebuild-and-diff gate (footer-probe.js's transformPageSrc), rather than loosening the comparison itself"

key-files:
  created:
    - .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js
  modified:
    - index.html
    - "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
    - "Factor Tree/factor-tree.html"
    - "Venn Diagram/venn-diagram.html"
    - "Euclidean Algorithm/euclidean-algorithm.html"
    - "Chinese Remainder Theorem/chinese-remainder-theorem.html"
    - "Equivalence Wheel/equivalence-wheel.html"
    - "Eulers Totient/eulers-totient.html"
    - "Cayley Table/cayley-table.html"
    - "Group Isomorphism/group-isomorphism.html"
    - "Square And Multiply/square-and-multiply.html"
    - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
    - "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html"
    - "RSA/rsa.html"
    - "Fermats Method/fermats-method.html"
    - "Shors Algorithm/shors-algorithm.html"
    - assets/site.css
    - assets/i18n/site.js
    - .planning/phases/06-multi-language-support/i18n-check.js
    - .planning/phases/06-multi-language-support/i18n-browser.js
    - CLAUDE.md
    - .claude/CLAUDE.md
    - .planning/PROJECT.md
    - .planning/REQUIREMENTS.md
    - .planning/codebase/ARCHITECTURE.md
    - .planning/codebase/CONCERNS.md
    - .planning/codebase/STRUCTURE.md
    - .planning/codebase/TESTING.md

key-decisions:
  - "D-01..D-19 (planner decisions, see PLAN.md) applied as written — footer placement, styling tokens, strip-gate shape, browser-chunk sizing, D-18 Fermat-retry policy"
  - "A true 375px viewport is reached by nesting the target page in an <iframe> sized to the exact target CSS pixels inside a larger (1400x1000) outer --window-size, since headless Chrome 153 clamps top-level --window-size to a ~500px floor (confirms D-13's observation empirically: hdrH dropped from 320-419px at the old ~500px measurement to the same 320-419px range now correctly attributed to a true 375px)"
  - "scratch mode's 'shown' check reads panel.classList.contains('is-shown') + display!=='none' rather than the CSS-transitioned opacity/visibility computed values — those properties need a real paint frame to settle a 0.18s transition, and paint frames are as scarce under --virtual-time-budget as the rAF ticks D-14 already documented (confirmed empirically: opacity read 0 immediately and for 200ms+ after the class was added, then correctly read 1 once ~2.4s of virtual time had actually produced a frame)"
  - "Fixed two pre-existing, task-unrelated responsive bugs that the new true-375px FOOTER-375 sweep surfaced on Group Isomorphism (see Deviations) and encoded them as an explicit, exact delta inside footer-probe.js's transformPageSrc rather than loosening MARKUP-EXACT's byte-for-byte comparison"

patterns-established:
  - "Site-footer placement is: last element before a page's first assets/-pointing <script src>, after any page-local <footer> and after RSA/DH's position:fixed scratchpad <aside>"
  - "A quick-task-local verification probe (footer-probe.js) can extend incrementally across tasks within one plan (static modes in Task 1, runtime modes in Task 2) while staying a single committed file"

requirements-completed: [QUICK-261003-bqz, I18N-01]

coverage: []

duration: single session
completed: 2026-10-03
status: complete
---

# Quick Task 261003-bqz: Move the language switcher into a shared site footer — Summary

**Moved the 21-line, byte-identical language switcher out of the canonical site header into a new canonical `<footer class="site-footer">` on all 16 pages, with new placement/drift gates, a stricter en-parity strip, and a true-375px headless-Chrome verification technique that surfaced and fixed two pre-existing responsive bugs.**

## Performance

- **Duration:** single session
- **Tasks:** 3 of 3 completed
- **Files modified:** 29 (across three commits)
- **Commits:** 3

## Accomplishments

- All 16 pages now carry a byte-identical `<footer class="site-footer">` holding only the switcher, as the last element before each page's scripts (RSA/Diffie-Hellman after their scratchpad's `</aside>`); the header keeps brand, nav and theme toggle only
- `assets/site.css` styles the new footer and its inner wrapper purely with the header's existing tokens, explicitly overriding every property 10 pages' own bare `footer{}` rules could otherwise leak, with a print-hide rule
- RSA and Diffie-Hellman's 240px bottom reserve moved from `.app` to `body`, so it still clears the footer's switcher at the end of the page
- `i18n-check.js` gained `extractSiteFooters`/`checkSiteFooter` (FOOTER-COUNT, FOOTER-DRIFT, FOOTER-POSITION) and SWITCHER-IN-HEADER/SWITCHER-NOT-IN-FOOTER placement checks, with zero existing checks loosened
- `i18n-browser.js`'s en-parity strip is now one strict structural match for the canonical footer shape (option count driven by `SWITCHER_OPTIONS.length`), tightening the gate — a switcher put back in the header now fails en-parity — plus a new `footer-extra` mutant
- `footer-probe.js` (new, task-local) proves all of the above: MARKUP-EXACT (16-page byte rebuild), STRIP-GATE (9 cases), FOOTER-GATE (8 scratch mutants), SITE-CSS (token-only diff check), and four runtime modes (FOOTER-375, STYLE-PARITY, SCRATCH-CLEAR, PROBE-NEG) built on an iframe-nesting technique that reaches a genuine 375px viewport under headless Chrome
- All 16 pages pass the full `i18n-browser.js` suite (en-parity IDENTICAL, langs=15, switch, layout); the engine (`nt-i18n.js`), `theme.js` and `palette.css` are byte-identical to the 81c4d14 baseline

## Task Commits

1. **Task 1: Tracer — the switcher moves into the canonical site footer on all 16 pages, gated statically and proven end-to-end in the browser on the Sieve** - `5038455` (feat)
2. **Task 2: Runtime proof on every page — true-375px layout, day/night style parity, RSA/DH scratchpad clearance and the full 16-page browser sweep** - `e7ca278` (feat)
3. **Task 3: Living docs and the site.js comment say "footer", then the consolidated regression sweep** - `46f6c9e` (docs)

## Files Created/Modified

- `.planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js` - task-local verification probe: markup/strip/gate/css (Task 1) plus w375/style/scratch/neg (Task 2)
- `assets/site.css` - new `.site-footer`/`.site-footer-inner` rules, print-hide block, trimmed `.lang-switch` (left-margin removed)
- 16 page `.html` files - switcher moved from header into the new canonical footer; RSA and Diffie-Hellman also carry the reserve-line swap; Group Isomorphism additionally carries the two CSS fixes below
- `.planning/phases/06-multi-language-support/i18n-check.js` - `extractSiteFooters`, `checkSiteFooter`, SWITCHER-IN-HEADER/SWITCHER-NOT-IN-FOOTER
- `.planning/phases/06-multi-language-support/i18n-browser.js` - strict footer en-parity strip, `footer-extra` mutant, exported `stripI18nArtifacts`
- `assets/i18n/site.js`, `CLAUDE.md`, `.claude/CLAUDE.md`, `.planning/PROJECT.md`, `.planning/REQUIREMENTS.md`, `.planning/codebase/{ARCHITECTURE,CONCERNS,STRUCTURE,TESTING}.md` - living docs now describe the switcher's footer placement

## Decisions Made

See `key-decisions` in the frontmatter. In addition, every planner decision D-01 through D-19 recorded in `261003-bqz-PLAN.md` was applied as written; none required reinterpretation during execution.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Group Isomorphism h1 overflows a true 375px viewport in German**

- **Found during:** Task 2, full `w375` sweep (first run, before the fix)
- **Issue:** The h1 heading's German text, "Gruppenisomorphismen", is a single unbreakable compound word. At `font-size:clamp(30px, 4.4vw, 44px)` (30px at 375px viewport width) it is wider than the page's ~316px content column, overflowing the document by 8px (`ovf=8`) — a true 375px measurement this quick task's own `w375` probe is the first to ever exercise (see D-13 below; earlier probes measured 500px and could not have caught this). The footer and header themselves were not overflowing (`hdrOvf=0`, `fOvf=0`) — this was a pre-existing, unrelated page bug, not caused by the footer move.
- **Fix:** Added `overflow-wrap:break-word;` to the page's `h1` rule, so the word can break instead of overflowing.
- **Files modified:** `Group Isomorphism/group-isomorphism.html`
- **Verification:** `footer-probe.js w375 --only "Group Isomorphism"` now passes with `ovf=0` in en/de/ru/el; `i18n-browser.js` on the full page still reports en-parity IDENTICAL (the fix is a CSS-only addition with no rendered-text change).
- **Committed in:** `e7ca278` (Task 2 commit)

**2. [Rule 2 - Missing critical functionality] Group Isomorphism's pair-select had no upper width bound**

- **Found during:** Task 2, investigating the same overflow before isolating the real root cause (deviation 1 above) via a `getBoundingClientRect()` child-by-child scan
- **Issue:** `.field select` declared only `min-width:280px` with no `width`/`max-width`, so its rendered width could grow unbounded past its flex container at narrow viewports. This was not the actual cause of the measured 8px overflow (deviation 1 was), but it is a genuine, pre-existing correctness gap in the same responsive surface this task's own true-375px testing is explicitly verifying, so it was fixed alongside it rather than left half-addressed.
- **Fix:** Added `width:100%; max-width:100%;` to `.field select`.
- **Files modified:** `Group Isomorphism/group-isomorphism.html`
- **Verification:** `footer-probe.js w375` and the full `i18n-browser.js` sweep both still pass for the page.
- **Committed in:** `e7ca278` (Task 2 commit)

**3. [Rule 3 - Blocking/tooling] MARKUP-EXACT's byte rebuild updated to encode deviations 1-2 as an explicit delta**

- **Found during:** Task 3, re-running Task 1's own `footer-probe.js markup` gate after Task 2's CSS fixes landed
- **Issue:** `transformPageSrc` rebuilds each page's expected content from the pre-task baseline plus only the D-01/D-02/D-07 transform, then requires byte equality with the working tree. Deviations 1-2 are real, intentional content changes beyond that transform, so the rebuild and the working tree legitimately diverged for Group Isomorphism.
- **Fix:** Added an explicit, exact third transform step (anchored on the precise pre-task CSS text) that applies deviations 1-2's two one-line additions, so the gate still proves byte-exactness everywhere except this now-documented, intentional delta — never loosening the comparison itself (D-19).
- **Files modified:** `.planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js`
- **Verification:** `footer-probe.js markup` reports `MARKUP-EXACT PASS 16 pages`; `footer-probe.js gate` still reports `FOOTER-GATE PASS 8 mutants`.
- **Committed in:** `46f6c9e` (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 1 missing-critical, 1 tooling/blocking)
**Impact on plan:** All three were required for the plan's own FOOTER-375/MARKUP-EXACT must-haves to be genuinely green across all 16 pages rather than silently excluding or loosening a gate. No scope creep beyond one page's CSS and the probe script that verifies it.

## Gate Results

**Task 1 (static + Sieve tracer):**
- `MARKUP-EXACT PASS 16 pages`
- `SITE-CSS PASS 3 color declarations checked`
- `STRIP-GATE PASS 9 checks`
- `FOOTER-GATE PASS 8 mutants`
- `i18n-check.js --all`: coverage/header/includes/no-locale-number-format/literals-markup/literals-js all `PASS: 16 page(s)`
- `i18n-check.js --switcher-present --all`: `PASS: 16 page(s)`
- `ENGINE-UNCHANGED PASS` (nt-i18n.js, theme.js, palette.css byte-identical to 81c4d14)
- Sieve full `i18n-browser.js`: `en-parity IDENTICAL snaps=11`, `langs PASS snaps=11 langs=15`, `switch PASS points=2 langs=15`, `layout PASS`, `ALL PASS` (CHUNK-TIME 143s)
- Mutants: `untranslated`, `stale-switch`, `en-change`, `overflow`, `footer-extra` all `MUTANT-DETECTED`

**Task 2 (runtime proof):**
- `FOOTER-375 PASS 64 runs` (16 pages x en/de/ru/el, true 375px)
- `STYLE-PARITY PASS pages=16 themes=2`
- `SCRATCH-CLEAR PASS 10 runs` (RSA + Diffie-Hellman x 5 widths)
- `PROBE-NEG PASS 3 controls` (NEG-STYLE, NEG-375, NEG-SCRATCH all correctly fail when the mitigation is removed)
- Full `i18n-browser.js` sweep on the remaining 15 pages: all `ALL PASS`, no D-18 Fermat retry needed

**Task 3 (docs + consolidated sweep):**
- `DOC-STALE PASS 14 -> 0` (plus positive doc markers present in CLAUDE.md, STRUCTURE.md, TESTING.md, CONCERNS.md, `.claude/CLAUDE.md`, ARCHITECTURE.md)
- `SHADOW-CHECK PASS --docs`
- `DICT-UNCHANGED PASS 18 namespaces`, `ENGINE-UNCHANGED PASS`
- `i18n-check.js --all` (6 modes, 16 pages), `--switcher-present` (16 pages), `--api 399 assertions`, `--persistence 248 assertions`, `--smoke 123 assertions (mutant detected)`
- `MARKUP-EXACT PASS 16 pages` and `FOOTER-GATE PASS 8 mutants` (re-run after the Task 2 deviations)
- `harness.js`: `HARNESS PASS total=2856003`
- `shadow-check.js --all`: PASS on all 15 shared-module-consuming pages
- `CHANGE-SCOPE PASS 20 files`, `CONFIG-NOT-COMMITTED PASS`

## FOOTER-375: en header/footer heights at a true 375px (per page)

| Page | hdrH (en) | fH (en) |
|---|---|---|
| index.html | 328 | 59 |
| Sieve Of Eratosthenes | 320 | 58 |
| Factor Tree | 362 | 59 |
| Venn Diagram | 328 | 59 |
| Euclidean Algorithm | 320 | 58 |
| Chinese Remainder Theorem | 320 | 58 |
| Equivalence Wheel | 328 | 59 |
| Eulers Totient | 320 | 58 |
| Cayley Table | 320 | 58 |
| Group Isomorphism | 328 | 59 |
| Square And Multiply | 320 | 58 |
| Diffie-Hellman Key Exchange | 320 | 58 |
| Elliptic Curve Diffie-Hellman | 320 | 58 |
| RSA | 320 | 58 |
| Fermats Method | 320 | 58 |
| Shors Algorithm | 320 | 58 |

All 16 pages: `ovf=0`, `hdrOvf=0`, `fOvf=0` in en/de/ru/el (64/64 runs pass).

## SCRATCH-CLEAR: panel/switcher gap per size (final confirmation run)

| Page | Size | shown | padH | atEnd | hit | gap |
|---|---|---|---|---|---|---|
| RSA | 390x800 | 1 | 220 | 1 | 0 | 34 |
| RSA | 420x800 | 1 | 220 | 1 | 0 | 34 |
| RSA | 520x800 | 1 | 220 | 1 | 0 | 32 |
| RSA | 700x900 | 1 | 220 | 1 | 0 | 28 |
| RSA | 1280x900 | 1 | 169-220 | 1 | 0 | 26-69 |
| Diffie-Hellman | 390x800 | 1 | 220 | 1 | 0 | 26 |
| Diffie-Hellman | 420x800 | 1 | 220 | 1 | 0 | 25 |
| Diffie-Hellman | 520x800 | 1 | 220 | 1 | 0 | 24 |
| Diffie-Hellman | 700x900 | 1 | 220 | 1 | 0 | 20 |
| Diffie-Hellman | 1280x900 | 1 | 220 | 1 | 0 | 18 |

RSA's 1280x900 `padH`/`gap` varied slightly between runs (169-220px / 26-69px) depending on exact wrap/layout at that width, but `hit=0` (no overlap) held on every run, matching the planner's prototype measurement (gap 18-34px, no overlap 390-1280px).

## CHUNK-TIME (full i18n-browser.js sweep, all 16 pages)

| Page | Time |
|---|---|
| Sieve Of Eratosthenes (Task 1) | 143s |
| index.html | 78s |
| RSA | 147s |
| Group Isomorphism | 120s |
| Factor Tree | 173s |
| Venn Diagram | 149s |
| Euclidean Algorithm | 132s |
| Chinese Remainder Theorem | 129s |
| Equivalence Wheel | 190s |
| Eulers Totient | 143s |
| Cayley Table | 339s |
| Square And Multiply | 171s |
| Diffie-Hellman Key Exchange | 144s |
| Elliptic Curve Diffie-Hellman | 179s |
| Shors Algorithm | 144s |
| Fermats Method | 248s (no D-18 retry needed — passed first run) |

## D-13 observation: headless Chrome's true viewport floor

Confirmed empirically: `google-chrome --headless=new --window-size=375,812 --dump-dom` on a direct top-level navigation reports `document.documentElement.clientWidth` of 485-500px, not 375px — headless Chrome 153 clamps the top-level `--window-size` to roughly a 500px floor. `i18n-browser.js`'s own `layout` mode and any earlier `HEADER-375`-style probe therefore measured ~500px, not 375px, and would not have caught the Group Isomorphism overflow this task's own `footer-probe.js w375` found and fixed.

This task's `w375`/`scratch` modes work around it by nesting the page under test in an `<iframe>` sized to the exact target CSS pixel dimensions inside a much larger outer window (1400x1000, well above the floor); the iframe's own content viewport is then genuinely 375px (or whatever size is requested), unaffected by the outer window's clamping. This is a verified, reusable technique — not a workaround specific to this task — and is recorded here as a follow-up candidate: `i18n-browser.js`'s own `layout` mode could adopt the same iframe-nesting technique in a future task to measure a true 375px instead of ~500px for every page/language combination it already runs.

## D-16 accepted consequences

- On the 10 pages with their own body-level tool `<footer>`, there are now two footer (contentinfo) landmarks. Screen readers list both. Changing those page footers would break en-parity and is out of scope for this task.
- The switcher moved to the end of the keyboard tab order, which is inherent to the requested footer placement.

## Pending human-check (Task 2, non-blocking)

Recorded for end-of-phase/milestone review, not blocking this task's completion: open the Sieve, RSA and index.html at phone width (about 375px) and at desktop width, in day and night themes. Confirm the footer reads as part of the site chrome (same band and border as the header), the centered switcher looks deliberate, and on RSA, after generating both keypairs and scrolling to the end, the public-keys panel sits below the switcher rather than over it.

## Known Stubs

None.

## Issues Encountered

None beyond the two pre-existing responsive bugs documented above as deviations 1-2, and the tooling-side CSS-transition/rAF-under-virtual-time quirk documented as a key-decision (scratch mode's "shown" check).

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The language switcher's canonical location is now the shared site footer everywhere; any future tool addition must copy both the canonical header and the canonical site footer from the Sieve of Eratosthenes (STRUCTURE.md step 4 updated accordingly).
- The iframe-nesting true-viewport technique in `footer-probe.js` is a candidate for folding into `i18n-browser.js`'s own `layout` mode in a future task, so every page's 375px layout check becomes genuinely 375px rather than ~500px (see D-13 observation above).
- No blockers for Phase 4 (Continued Fractions) or any other roadmap work; this quick task touched only shared site chrome and one page's pre-existing CSS.

---
*Quick task: 261003-bqz*
*Completed: 2026-10-03*

## Self-Check: PASSED

All created/modified files verified present on disk (assets/site.css, footer-probe.js, all 16 pages, i18n-check.js, i18n-browser.js, .claude/CLAUDE.md, ARCHITECTURE.md). All three task commits (5038455, e7ca278, 46f6c9e) verified present in git log.
