---
phase: quick-260930-jlm
plan: 01
subsystem: ui
tags: [rsa, scroll-reveal, intersectionobserver, getboundingclientrect, behavioral-testing]

requires:
  - phase: quick-260930-fnr
    provides: the pinned, aria-hidden public-key reference panel (markup, CSS, scroll-past IntersectionObserver + live-geometry recompute architecture) that this plan retargets
provides:
  - "RSA public-key panel reveal trigger retargeted from whole-section-scrolled-past to the party's own chosen-e line becoming readable"
  - "hasReachedChosenE(id) predicate: resolves the chosen-e line fresh by id every call, compares its rect.bottom against a viewport-relative threshold (window.innerHeight - 24px gutter)"
  - "resize listener sharing the existing rAF-throttled scroll scheduler, since the new threshold depends on window.innerHeight"
affects: []

actuals:
  tokens: 1636
  tasks: 2
  commits: 1
  plan_head_before: edbae2c
  plan_head_after: 6fed65cd5f63e253cfb44c35bd3b6bc91f21fc0d

tech-stack:
  added: []
  patterns:
    - "Live-geometry reveal predicate resolved fresh by id on every call (never cached across an innerHTML rebuild), compared against a viewport-relative threshold rather than a fixed pixel constant"

key-files:
  created: []
  modified:
    - RSA/rsa.html

key-decisions:
  - "Retargeted the measured node from #step-bob/#step-alice (whole section) to a new id (bob-chosen-e/alice-chosen-e) added to the existing 'chosen e =' formula line inside renderKeyOutput()'s shared template, since the brief's premise that this line already had an id was incorrect"
  - "Renamed isScrolledPast(id) to hasReachedChosenE(id); kept it a single rect-read helper (one getBoundingClientRect() call in the file) rather than adding a second predicate or a scrolled-past flag object"
  - "Read gutter constant set to 24px (CHOSEN_E_READ_GUTTER_PX) - the strip above the viewport bottom a line must clear before counting as readable"
  - "resize registered on the same shared rAF-throttled scheduler as scroll (renamed scratchScrollQueued -> scratchUpdateQueued, function extracted to scheduleScratchUpdate), not a second throttle or a resize-specific predicate"

patterns-established:
  - "Vacuity-proving deviation-rule-free tasks: for each load-bearing assertion (exclusion, regeneration-freshness, resize-trigger), the production code was temporarily broken in the exact way the assertion is supposed to catch, the harness re-run to confirm it names that specific check as FAIL, then reverted before moving on"

requirements-completed: ["quick-260930-jlm"]

coverage:
  - id: D1
    description: "Public-key panel reveals per-party at the moment that party's chosen-e line becomes readable (viewport-relative), rather than only after the whole key-generation section has scrolled past"
    requirement: "quick-260930-jlm"
    verification:
      - kind: e2e
        ref: "$SP/rsa-chosen-e-harness.js scenario r1 (45 assertions: no-keypair at top/bottom, line-present-after-generation, state A/B/C/D, mirror fidelity, exclusion, structural invariants, regeneration freshness)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Per-party independence, divider correctness, resize-alone trigger, and inherited abbreviation/narrow-viewport regressions all hold at the new reveal point"
    requirement: "quick-260930-jlm"
    verification:
      - kind: e2e
        ref: "$SP/rsa-chosen-e-harness.js scenario r2 (47 assertions: independence, divider, alice mirror/exclusion, resize-alone-flips-reveal, abbreviation cap, narrow viewport)"
        status: pass
    human_judgment: true
    rationale: "Task 2's <verify> block explicitly calls for a <human-check> visual scroll-through in both themes as a supplement to the automated assertions; not performed interactively in this autonomous run."

duration: 55min
completed: 2026-09-30
status: complete
---

# Quick Task 260930-jlm: Retarget RSA Public-Key Panel Reveal to the Chosen-e Line Summary

**Moved the RSA tool's pinned public-key reference panel's reveal trigger from "whole key-generation section scrolled above the viewport" to "this party's `chosen e = ...` line has scrolled into readable view", so the card appears while step 1 is still on screen instead of a screenful later.**

## Performance

- **Duration:** 55 min
- **Started:** 2026-09-30T12:00:00Z (approx, session scratchpad timestamps)
- **Completed:** 2026-09-30T12:55:00Z (approx)
- **Tasks:** 2
- **Files modified:** 1 (`RSA/rsa.html`)

## Accomplishments

- Added `id="${id}-chosen-e"` to the existing "chosen e =" formula line inside `renderKeyOutput()`'s shared template literal — the one enabling markup change, serving both Bob and Alice from one template with zero per-party duplication.
- Renamed `isScrolledPast(id)` (section-based) to `hasReachedChosenE(id)` (line-based): resolves `#{id}-chosen-e` fresh by id on every call (never cached — `renderKeyOutput()` destroys the old line node via `innerHTML` on every regeneration), and compares its `getBoundingClientRect().bottom` against `window.innerHeight - 24px` instead of the whole section's rect against `0`.
- Added a `resize` listener sharing the same rAF-throttled scheduler (`scheduleScratchUpdate`) that `scroll` already used, since the new threshold is derived from `window.innerHeight` and a bare window resize (no scroll) can now flip the answer.
- Verified end-to-end with a headless-Chrome behavioral harness: 45 assertions (scenario `r1`, Task 1's full behavior spec including the paired "row shown while section still on screen" assertion) + 47 assertions (scenario `r2`, per-party independence, resize-alone trigger, and the inherited abbreviation/narrow-viewport regressions), both green.
- Vacuity-proved three of the load-bearing checks by temporarily breaking the exact thing each is supposed to catch, confirming the harness names that specific check as `FAIL`, then reverting:
  - Exclusion check (F): appended the private exponent's formatted digits into the row's textContent — harness failed naming `(F) row excludes private-exponent string`.
  - Regeneration-freshness check (H): cached the resolved chosen-e node across regenerations — harness failed naming the new immediately-after-regeneration assertion (added to the harness specifically because the original (H) design didn't independently exercise the "shown" trigger, only the written values).
  - Resize-trigger check (Task 2): removed the `resize` listener registration — harness failed naming `bob row becomes shown from the resize alone, with no scroll`.
  - All three reverted; both scenarios green again with the reverted, correct code (r1: 45, r2: 47 checks).

## Task Commits

Each task was committed atomically. Task 2 required **zero additional production-code changes** — the plan itself anticipated this ("it should need no production change beyond the resize trigger Task 1 already added"), and running scenario `r2` against Task 1's already-committed state passed immediately.

1. **Task 1: Retarget the reveal to the `chosen e` line** - `6fed65c` (feat) — adds the `id` attribute, renames and re-thresholds the predicate, and adds the resize trigger, all in one commit.
2. **Task 2: Party independence, the resize trigger, and the preserved-invariant regression sweep** - no separate commit (no code delta; verified entirely by scenario `r2` against Task 1's commit, plus the resize vacuity inversion, which was reverted before this SUMMARY was written).

## Files Created/Modified

- `RSA/rsa.html` - Added `#{id}-chosen-e` id to the chosen-e formula line; renamed/re-thresholded the scroll predicate; added the shared resize listener.

## Decisions Made

See `key-decisions` in frontmatter. In short: one id attribute change, one predicate rename+re-threshold (kept to exactly one `getBoundingClientRect()` call in the whole file), one shared scheduler extended to also listen for `resize`. No new markup, no new CSS, no second predicate, no per-party branch.

## Deviations from Plan

**1. [Rule 3 - Blocking, self-corrected] Harness comment inadvertently added a third `renderKeyOutput` occurrence**

- **Found during:** Task 1, first full gate run
- **Issue:** The rewritten explanatory comment above `hasReachedChosenE` named `renderKeyOutput()` in prose, which pushed the file's occurrence count of that identifier from 2 (baseline) to 3, tripping the plan's own occurrence-count-stability gate (`grep -c 'renderKeyOutput'` must equal baseline).
- **Fix:** Reworded the comment to describe "the party's whole key-output subtree" instead of naming the function, restoring occurrence-count parity with the baseline. No behavior change.
- **Files modified:** `RSA/rsa.html`
- **Verification:** Re-ran Task 1's full automated gate; `renderKeyOutput` count now matches baseline (2), all other checks unchanged.
- **Committed in:** `6fed65c` (part of the Task 1 commit — caught before the commit was made)

**2. [Test-methodology addition, no production-code impact] Strengthened Task 1's regeneration-freshness check (H)**

- **Found during:** Task 1's caching vacuity check
- **Issue:** The originally-written harness assertion for (H) only compared the row's written modulus value against the freshly-rendered keycard's modulus (both sourced from `State['bob'].n`, which updates correctly on regeneration regardless of any bug in the *visibility* predicate). A temporarily-introduced node-caching bug (module-scoped cache keyed by party id, populated once) passed this original assertion, because the written values are correct even when the reveal predicate itself is measuring a detached, stale node.
- **Fix:** Added one assertion immediately after regeneration and before any further scrolling — that the row is *not* shown while still scrolled at the top — which the buggy cached-node behavior fails (a detached node's `getBoundingClientRect()` returns an all-zero rect, which the threshold comparison treats as "always readable"). Re-ran with the caching bug present to confirm this new assertion fails naming exactly that condition, then reverted the caching bug and confirmed the harness passes at 45 checks (44 before the addition).
- **Files modified:** `$SP/rsa-chosen-e-harness.js` (harness only, not a tracked project file)
- **Verification:** Harness FAIL with the bug present, PASS after reverting.
- **Committed in:** N/A (scratchpad-only file, never committed per plan's own output spec)

---

**Total deviations:** 1 auto-fixed (Rule 3, blocking, self-corrected before commit) + 1 test-methodology strengthening (harness-only, no production impact).
**Impact on plan:** No scope creep. The `renderKeyOutput` wording fix was required to pass the plan's own gate; the harness strengthening made an already-mandated vacuity check (the plan's own action step (e) for check (H)) actually load-bearing.

## Issues Encountered

None beyond the two items above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The panel's reveal trigger is now proven, per-party, monotone, reversible, absent-with-no-keypair, and regeneration-safe at the earlier "chosen e" reveal point, with the resize trigger verified non-vacuously.
- **Recommended manual follow-up (not performed in this autonomous run):** Task 2's `<verify>` block includes a `<human-check>` — open `RSA/rsa.html` in a real browser, generate both keypairs, scroll slowly from the top in both day and night themes, and confirm the bottom-left card fades in right as each party's `chosen e =` line becomes readable (not before, not a screen later), that Bob appears alone before Alice, both persist through the wire diagram and Eve's notebook, and clear on scroll-to-top; then drag the window shorter/taller with no scroll and confirm the card keeps up. The automated harness (92 assertions total across both scenarios, plus three explicit vacuity inversions) covers the same behavior programmatically, so this is a confirmatory pass, not a discovery step.
- No blockers for future work on the RSA tool or the wider milestone.

---
*Phase: quick-260930-jlm*
*Completed: 2026-09-30*

## Self-Check: PASSED

- FOUND: `RSA/rsa.html`
- FOUND: commit `6fed65c` (in `git log --oneline --all`)
- FOUND: `.planning/quick/260930-jlm-in-rsa-rsa-html-change-the-public-key-re/260930-jlm-SUMMARY.md`
- FOUND: `id="${id}-chosen-e"` on the chosen-e formula line (rsa.html:569) and its lookup in `hasReachedChosenE` (rsa.html:933)
