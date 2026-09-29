---
phase: 03-chinese-remainder-theorem-tool
plan: 02
subsystem: ui
tags: [chinese-remainder-theorem, aria-pressed, preset-chips, modular-arithmetic, accessibility]

# Dependency graph
requires:
  - phase: 03-chinese-remainder-theorem-tool (plan 01)
    provides: count-generic setCount()/buildRun()/buildStrips() pipeline, single riddle preset chip, MIN_COUNT/MAX_COUNT constants
provides:
  - "Explicit two-vs-three congruence count control (#countTwoBtn/#countThreeBtn, .count-toggle) with aria-pressed announced state, mirroring the Venn Diagram tool's mode-switch (CRT-06)"
  - "syncCountButtons() as the single source writing both buttons' aria-pressed from state.count, so the visual and announced states can never desync"
  - "Idempotent, concurrency-safe setCount(): a re-press of the already-active count is a genuine no-op (E10), and a count change routes through resetScan() before buildRun() so a mid-scan switch cancels the pending frame and bumps generation before the replacement strips exist (E11)"
  - "Two remaining preset chips completing D-07's set of three: the plain coprime pair (also the page's default state) and the pair whose moduli share a factor, making the CRT-02 coprimality warning discoverable by clicking rather than by accident (CRT-07)"
affects: [03-03-extended-euclidean-construction-and-gcd-crosslink]

# Actuals (#2632)
actuals:
  tokens: 680
  tasks: 2
  commits: 2
  plan_head_before: 64e1602985810787d2f9d13a5bafce34e1ef0ed8
  plan_head_after: 21d7c20877c036b773634adcc8223db5fe4bf478

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Count-toggle reuses the Venn Diagram tool's .mode-btn / aria-pressed-driven visual-state pattern (D-06) rather than inventing a new toggle shape -- pressed state is read from the aria-pressed attribute in CSS, never a separate class"
    - "syncCountButtons() centralizes both buttons' aria-pressed writes from one state read, so the two attributes are always set together and can never both read true (or both false)"

key-files:
  created: []
  modified:
    - "Chinese Remainder Theorem/chinese-remainder-theorem.html"

key-decisions:
  - "setCount(n) early-returns before touching the hidden attribute, resetScan(), or buildRun() when the requested count already equals state.count -- the re-press no-op contract E10 requires"
  - "setCount(n) calls resetScan() before buildRun() on an actual count change, so a mid-scan switch cancels the pending animation frame and bumps generation before the replacement strips exist (E11 / T-03-04), even though buildRun()'s own abortScan() would also catch this -- the extra call is the plan's explicit, belt-and-suspenders instruction"

patterns-established: []

requirements-completed: [CRT-06, CRT-07]

coverage:
  - id: D1
    description: "Two buttons (Two congruences / Three congruences) with exact label text, both carrying aria-pressed, exactly one true at any moment including on arrival; pressed visual state is selected by the aria-pressed attribute, not a class"
    requirement: "CRT-06"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome DOM harness (Task 1), assertions 1a-1d, 2e-2f, 3-suite (35 assertions total)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Two -> three -> two round-trips to the same answer (x = 8 mod 15) with the third row's typed values preserved across the hide/show cycle"
    requirement: "CRT-06"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome DOM harness (Task 1), assertions 2a-2d, 3a-3f"
        status: pass
    human_judgment: false
  - id: D3
    description: "Re-pressing the already-active count button is a genuine no-op: strip markup, answer line, and marked solution column are byte-identical before and after"
    requirement: "CRT-06"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome DOM harness (Task 1), assertions 4a-4c; vacuity-checked by deliberately corrupting the expected solution column and confirming FAIL"
        status: pass
    human_judgment: false
  - id: D4
    description: "A count change mid-scan cancels the pending animation frame and leaves at most one cursor cell, with the new diagram's cell count matching the new span and nothing recorded by window.onerror"
    requirement: "CRT-06"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome DOM harness (Task 1), assertions 9a-9b, 10 (riddle chip -> Play -> immediate count switch -> deferred-tick check)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Boundary behaviour at count 3: modulus exactly 1 and exactly 12 are accepted; 0 and 13 are each refused with the strip cell count unchanged across the rejected edit"
    requirement: "CRT-06"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome DOM harness (Task 1), assertions 6a-6f"
        status: pass
    human_judgment: false
  - id: D6
    description: "The coprimality gate and span-ceiling guard behave identically at count 3 as at count 2 -- a non-coprime triple fires the note before any span arithmetic, and a coprime triple whose lcm exceeds 400 is refused by name"
    requirement: "CRT-06"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome DOM harness (Task 1), assertions 7a-7b (gcd(4,6)=2 at count 3), 8a-8c (385 renders, 924 refused)"
        status: pass
    human_judgment: false
  - id: D7
    description: "Three preset chips exist (riddle, coprime pair, shares-a-factor pair), each carrying a data-count and every value it sets, re-entering through readCongruences/coprimeVerdict/spanVerdict rather than assigning solver state directly"
    requirement: "CRT-07"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome DOM harness (Task 2), assertion 1, 2a-2g, 3a-3i"
        status: pass
    human_judgment: false
  - id: D8
    description: "The shares-a-factor chip fires the coprimality note naming gcd(4,6)=2, renders both residue strips (12 cells/row), marks no solution and no agreement cell, disables all four scan buttons, and never claims the system is unsolvable"
    requirement: "CRT-07"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome DOM harness (Task 2), assertions 3a-3i, 4a-4b; vacuity-checked by corrupting the expected zero-solution count and confirming FAIL"
        status: pass
    human_judgment: false
  - id: D9
    description: "Clicking from the warning chip back to a valid chip clears the warning state and re-enables the scan buttons; a chip carrying no third-row data leaves #a3/#m3 untouched; a count-3 chip followed by a count-2 chip hides row3Fields and syncs aria-pressed"
    requirement: "CRT-07"
    verification:
      - kind: automated_ui
        ref: "headless-Chrome DOM harness (Task 2), assertions 5a-5c, 6a-6c, 7a-7b"
        status: pass
    human_judgment: false
  - id: D10
    description: "Day/night theme legibility of the count-toggle's pressed-state color (--role-active/--role-result-ink) and the chip warning text across both themes"
    verification: []
    human_judgment: true
    rationale: "Visual color-distinguishability across two themes is a perceptual judgment call; a night-theme screenshot was captured and visually inspected during this session, but day-theme and a human sign-off on contrast/legibility were not solicited as part of this autonomous run."

duration: 20min
completed: 2026-09-29
status: complete
---

# Phase 3 Plan 2: Chinese Remainder Theorem Tool (Count Control + Presets) Summary

**Adds an explicit, announced two-vs-three congruence toggle mirroring the Venn Diagram tool's mode-switch, and completes the three-preset-chip set with a plain coprime pair and a pair whose moduli share a factor — so the CRT-02 coprimality warning is one click away instead of accidental.**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-09-29
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- `#countTwoBtn` / `#countThreeBtn` (`.count-toggle`, `.mode-btn`) give the learner a real, announced control over the congruence count, wired onto plan 03-01's `setCount()`; `syncCountButtons()` keeps `aria-pressed` on both buttons in lockstep with `state.count` from one source.
- `setCount()` is now idempotent on a re-press (E10) and routes through `resetScan()` before `buildRun()` on an actual change, so switching count mid-scan cancels the pending animation frame and bumps `generation` before the replacement strips exist (E11 / T-03-04) — no stale cursor, no runtime error.
- Two more preset chips ship alongside the Sun Tzu riddle: `2 mod 3 · 3 mod 5 · coprime pair` (the page's own default, `x ≡ 8 (mod 15)`) and `2 mod 4 · 3 mod 6 · shares a factor` (fires the `gcd(4, 6) = 2` warning, renders both residue strips, marks nothing, and disables all four scan buttons without ever claiming the system is unsolvable).
- Modulus cap, coprimality gate, and span-ceiling guard verified unchanged at count 3 as well as count 2.

## Task Commits

Each task was committed atomically:

1. **Task 1: The two-versus-three congruence control** - `4085e09` (feat)
2. **Task 2: The remaining two preset chips** - `21d7c20` (feat)

## Files Created/Modified

- `Chinese Remainder Theorem/chinese-remainder-theorem.html` - Count-toggle markup/CSS/script (Task 1); coprime-pair and shares-a-factor preset chips (Task 2)

## Decisions Made

- `setCount(n)` returns before touching `hidden`, `resetScan()`, or `buildRun()` when `n === state.count` — makes the re-press a genuine no-op rather than a harmless-looking rebuild that could still disturb a landed answer.
- `setCount(n)` calls `resetScan()` immediately before `buildRun()` on a real count change, per the plan's explicit instruction, even though `buildRun()`'s own `abortScan()` already pauses and bumps `generation` — the extra call clears the *old* strip's cursor/solution classes defensively before those DOM nodes are torn down, at negligible cost.

## Deviations from Plan

None in the shipped production code — plan executed exactly as written for both tasks. One deviation is worth recording in the *verification harness only* (no code change):

### Test-Harness Correction (not a Rule 1-4 code deviation)

**Task 1's behavior block names a coprimality-gate test vector of moduli `4, 5, 20` at count 3.** Modulus `20` exceeds this tool's `MAX_MODULUS = 12` constant, established in plan 03-01 and explicitly left unchanged by this plan — so that literal triple cannot be entered; `readCongruences()` would reject row 3 with a range error before the coprimality gate ever runs, which contradicts the vector's own stated expectation (that the coprimality note fires). This is a planning-time authoring inconsistency in the hand-computed example, not a defect in the shipped code (the code's behavior — reject out-of-range moduli before running the coprimality gate — is exactly what plan 03-01 established and this plan's own boundary truths require). The automated behavioral harness substitutes an in-range non-coprime triple, `4, 6, 9` (`gcd(4, 6) = 2`, the first non-coprime pair by index order), which exercises the identical "coprimality note fires before any span arithmetic matters" guarantee at count 3 without hitting the unrelated modulus-range guard. No production code was touched by this substitution.

## Issues Encountered

- See Test-Harness Correction above — resolved by substituting the test harness's own input values; no plan re-scope or code change was needed.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 03-03 can add the Extended-Euclidean construction reveal directly on top of `crtConstruct()`'s already-returned `terms` array, unaffected by this plan's changes (count-toggle and preset chips touch only the input/control layer, not `solveCrt()`/`crtConstruct()`).
- The `--slot-ext` palette alias remains declared and unused, ready for plan 03-03 to consume.
- No blockers identified for the follow-on plan.

---
*Phase: 03-chinese-remainder-theorem-tool*
*Completed: 2026-09-29*

## Self-Check: PASSED

- FOUND: `Chinese Remainder Theorem/chinese-remainder-theorem.html`
- FOUND: `.planning/phases/03-chinese-remainder-theorem-tool/03-02-SUMMARY.md`
- FOUND commit: `4085e09`
- FOUND commit: `21d7c20`
