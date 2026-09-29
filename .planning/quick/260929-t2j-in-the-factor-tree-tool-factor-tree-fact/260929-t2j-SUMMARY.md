---
phase: quick-260929-t2j
plan: 01
subsystem: ui
tags: [factor-tree, svg, animation, text-rendering]

requires: []
provides:
  - "Factor Tree/factor-tree.html renders its found factorization below the tree diagram (not above it) as one or two lines: the expanded product always, plus a caret-exponent compact line whenever some prime repeats"
affects: [factor-tree]

actuals:
  tokens: 800
  tasks: 2
  commits: 2
  plan_head_before: 795825804d64e066c5b8605f3452756b7172d90c
  plan_head_after: 70fad75c2146522a07887aefa08c8063cb799af3

tech-stack:
  added: []
  patterns:
    - "Adjacent-run grouping over an already-ascending, already-grouped factor list (groupFactors()), rather than a map/object keyed by prime -- valid specifically because the existing factorization helper returns factors sorted and pre-grouped"
    - "Result renderer widened from a single string to a list of lines (popEquation(lines)), looped inside the same single guarded reveal timer, rather than adding a second timer or a second call site"

key-files:
  created: []
  modified:
    - "Factor Tree/factor-tree.html"

key-decisions:
  - "Multiplication sign stays x00D7 (x), not the ASCII asterisk the user's request typed in prose, so the result line agrees with the footnote directly under it."
  - "Exponent written as a literal caret plus digits (2^2), not a Unicode superscript or a <sup> element -- unambiguous in the script font, survives copy-paste, and keeps the renderer on textContent rather than introducing a markup sink."
  - "The compact line is suppressed whenever it would be character-for-character identical to the expanded line (no repeated prime) -- printing an identical second equation for 30, 2310, 97, or the seed would read as a rendering bug, not a second, more-compact form. This also keeps the prime and seed paths at exactly one line each."

patterns-established: []

requirements-completed: ["quick-260929-t2j"]

coverage:
  - id: t2j-01
    description: "Result renders below the tree in both DOM order and on-screen geometry; two-line stacking for repeated-prime numbers; caret exponents never printed for a count of one; suppressed second line when expanded and compact forms are identical; reveal timer/stale-generation guard/entrance animation/stage wipe all unchanged"
    requirement: "quick-260929-t2j"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome harness ($SP/factor-tree-equation-harness.js t1), 18 assertions against the default 60 load: line text/order/count, DOM order, geometry, block stacking, tree/trunk/star still rendering and animating"
        status: pass
      - kind: automated_ui
        ref: "headless-Chrome harness ($SP/factor-tree-equation-harness.js t2), 84 assertions across Classic exact-line cases (60, 1024, 360, 30, 2310, 97, 9973 via chip, 2 via chip, 1), cleared/invalid paths (empty, 3.5, negative, over-cap Classic, over-cap Balanced), Classic/Balanced/deep-link parity (1024 both modes, 899 Balanced, ?n=1024), and a repeat-run no-doubling case"
        status: pass
      - kind: automated_static
        ref: "no-collateral diff gates: element/id counts, timer/guard/wipe counts, literal-color/script/link/URL scan over added lines, caret-followed-by-1 scan, sha256 manifest of every other tracked file"
        status: pass
    human_judgment: false

duration: ~55min
completed: 2026-09-29
status: complete
---

# Quick Task 260929-t2j: Factor Tree Result Below Diagram, Compact Exponent Line Summary

**Moved the Factor Tree tool's found-factorization result from a heading above the tree to a two-line conclusion beneath it: the expanded product always, plus a caret-exponent compact form whenever a prime repeats.**

## Performance

- **Duration:** ~55 min
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- Swapped the stage markup so `#treeArea` precedes `#equation`; the result now reads as the diagram's conclusion rather than a heading above it. Element ids, classes, and the script's by-id lookups are untouched.
- `.equation`'s bottom margin (previously reserving space for the tree that used to follow it) became an equivalent top margin; `.fac` line spans switched from `display:inline-block` to `display:block` with a 2px adjacent-sibling gap, so multiple result lines stack instead of running together, using the existing entrance animation verbatim.
- Added `groupFactors(topFactors)` (adjacent-run folding over the existing factorization helper's already-ascending output into `{prime, count}` records) and `exponentText(groups)` (joins records with the multiplication sign, rendering a bare prime for count 1 and `prime^count` for count > 1, never `^1`).
- `popEquation()` widened from a single string to a list of lines, looped inside its existing wipe-first behavior — still one definition, one call site.
- The existing guarded final reveal timer now builds a line list: `['1']` for the seed, the single `n = n × 1` string for a prime input (unchanged), or `[expanded, compact]` for a composite input — with the compact line appended only when `groupFactors` finds at least one repeated prime.
- Proved the whole input space (Task 2): Classic exact-line cases, cleared/invalid paths, Classic/Balanced/deep-link parity, and a repeat-run no-doubling case, via a second headless-Chrome harness scenario. The sweep passed on first run — Task 1's implementation needed no further production-code changes, apart from one comment wording fix surfaced by Task 2's own no-collateral gate (below).

## Task Commits

Each task was committed atomically:

1. **Task 1: Render the factorization below the tree as an expanded line plus a compact exponent line** - `42c4ddd` (feat)
2. **Task 2: Prove the whole input space — degenerate, prime, cleared, Balanced and deep-link paths** - `70fad75` (test, includes one Rule 1 fix)

**Plan metadata:** commit for STATE.md/SUMMARY.md handled by the orchestrator (docs artifacts not committed by this executor per dispatch constraints).

## Files Created/Modified

- `Factor Tree/factor-tree.html` — swapped `#treeArea`/`#equation` markup order; `.equation` margin-bottom to margin-top; `.equation .fac` inline-block to block plus adjacent-sibling gap; added `groupFactors()`/`exponentText()`; widened `popEquation()` to accept a line list; built the line list (with compact-line suppression) at the single existing call site inside the unchanged guarded reveal timer.

## Decisions Made

- **Kept `×` (U+00D7) rather than the ASCII `*` the user's request typed in prose.** The tool, its footnote, and its messages already use `×` everywhere; switching only the new result line to `*` would make it visually disagree with the footnote directly under it (Claude's discretion, called out in the plan's `<current_shape>`).
- **Wrote the exponent as a literal caret plus digits (`2^2`)**, not a Unicode superscript glyph or a `<sup>` element. Unambiguous in the script font, survives copy-paste into a calculator or text note, and keeps the result renderer on `textContent` rather than introducing a markup-parsing sink (Claude's discretion, called out in the plan's `<current_shape>`).
- **Suppress the compact line whenever it equals the expanded line character-for-character** (30, 2310, 97, 9973, 2, and the seed `1` all print one line only). Printing an identical second equation would read as a rendering bug, not a second, more-compact form — and it's also what keeps the prime and seed paths at exactly one line each without a separate special case.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] groupFactors() comment named the factorization helper literally, breaking a no-collateral gate**
- **Found during:** Task 2, running the automated verify gate's `primeFactors` literal-count check
- **Issue:** The plan's own action text (Task 1, step (e)) explicitly asked for a comment stating that adjacent-run folding is valid "because the existing factorization helper returns its factors in ascending order" — deliberately not naming the function. My first draft named it directly (`primeFactors() above`), which added a third literal `primeFactors` match against the pre-edit file's two (definition + one call site), failing the task's own diff gate.
- **Fix:** Reworded the comment to say "the existing factorization helper above" instead of naming the function.
- **Files modified:** `Factor Tree/factor-tree.html`
- **Verification:** Task 2's automated gate's `primeFactors` count check passes (2 = 2); both harness scenarios still green afterward.
- **Committed in:** `70fad75` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix, comment wording only — no behavior change)
**Impact on plan:** None on behavior. Task 2's sweep produced no production-diff change beyond this one comment edit.

## Vacuity-Check Results

**Task 1 (`t1`), three deliberate breaks, each reverted immediately after:**

1. **Result element moved back above the tree container.** `t1` FAILed at "equation is last element child of stage" (the first-recorded order assertion; the geometry assertion further down the sequence would also have failed, but the harness records only the first mismatch per run). Reverted, confirmed green.
2. **Compact line's append guard disabled (`if(false && ...)`)** so the second line never appends. `t1` FAILed at "line count for 60, expected 2, got 1" — exactly the two-line assertion. Reverted, confirmed green.
3. **`.equation .fac` left `display:inline`** instead of `block`. `t1` FAILed at "line 0 computed display is block, expected block, got inline" — exactly the stacking assertion. Reverted, confirmed green.

**Task 2 (`t2`), two deliberate breaks:**

1. **Compact line append made unconditional** (restructured so both the composite and prime branches always compute and push a second, `groupFactors`-derived line, matching the plan's "identical lines print twice" framing literally across every branch, not just the composite one). `t2` FAILed first at "30 expected one line: line count, expected 1, got 2", with debug instrumentation confirming the full failure set was exactly the no-repeat cases (`30`, `2310`, `97`, `9973` via chip, `2` via chip, and `899` in Balanced mode) while `60`, `360`, and `1024` — the repeated-prime cases — still passed. Reverted, confirmed green (84/84).
2. **`popEquation()`'s own wipe-first line removed.** `t2` still PASSed (84/84) — this break does **not** surface through any DOM-only-driven flow, because `renderTree()` calls the still-intact `clearStage()` at the very start of every run (including the second run of the repeat-run case), which wipes `#equation` before the delayed `popEquation()` call ever fires. `popEquation()`'s own wipe is therefore genuinely redundant defense-in-depth under the current call graph, not a load-bearing guard against doubling reachable from the UI — a legitimate finding, not a harness gap: the production code was kept as originally written (with the wipe) per the plan's explicit instruction, this vacuity check just could not manufacture a front-end-reachable failure to prove it necessary. Reverted (no functional change, since the "break" already behaved identically to the fix).

## Issues Encountered

- The `t1` harness's initial run failed on "star has the shown class" — not a production bug, but a harness race: the star's reveal timer fires 300ms after the result's own timer, and the test performed all remaining assertions synchronously right after the result populated, before that later timer had fired. Fixed by adding a short (3s) `pollUntil` wait for the trunk's and star's `show` class before asserting on them.

## Harness Details

- Scratchpad path: `/tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools/5209db38-bb48-4345-9503-fdd4ef5fbc9e/scratchpad/`
- Harness: `factor-tree-equation-harness.js` (Node stdlib only — `http` static file server rooted at the checkout root, an in-memory driver document selected by a CLI scenario argument (`t1`/`t2`), and a `/__verdict__` POST endpoint; spawns `google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir=<mktemp -d> --virtual-time-budget=60000`, same recipe as prior quick tasks `260929-c11`/`g19`/`p80`/`q1o`/`qqt`)
- Baseline snapshot: `t2j-ft-base.html` (copied from the working tree before any edits); others checksum manifest `t2j-others.sha` (`git ls-files` minus the edited path, `sha256sum`'d) — verified byte-identical post-edit via `sha256sum -c --status` after both tasks
- Driver clears `localStorage` and `document.cookie` before each case (both tools mirror shared params into cookies, and cookies are origin- not frame-scoped) and drives the page exclusively through its own visible DOM (`numInput.value`, `.click()` on `goBtn`/chips/mode buttons) — the IIFE closure is never reached directly
- No literal color, `<script>`, `<link>`, or URL was added in the diff (grep-scanned added lines only, comments excluded); no `^1` was ever introduced

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- No blockers. The tree's construction, staggered reveal, trunk, star, stale-generation guard, and timer count are byte-for-byte unchanged in behavior; only the result text's position and content changed.
- Manual browser pass recommended per the plan's `<verification>` section: default load; 1024; 360; 30; 97; 1; a negative number; Balanced mode with 1024; `?n=1024`; and the day/night toggle on the finished result. All of these are also covered by the automated harness scenarios above.

---
*Phase: quick-260929-t2j*
*Completed: 2026-09-29*

## Self-Check: PASSED

- FOUND: `Factor Tree/factor-tree.html`
- FOUND: commit `42c4ddd` (`git log --oneline --all`)
- FOUND: commit `70fad75` (`git log --oneline --all`)
- FOUND: `.planning/quick/260929-t2j-in-the-factor-tree-tool-factor-tree-fact/260929-t2j-SUMMARY.md`
