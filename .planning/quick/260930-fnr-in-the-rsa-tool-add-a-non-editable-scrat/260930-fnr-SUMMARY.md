---
phase: quick-260930-fnr
plan: 01
subsystem: ui
tags: [rsa, intersection-observer, css-var, single-file-tool]

requires: []
provides:
  - "A fixed, aria-hidden, read-only public-key reference panel (#pubkey-scratchpad) in RSA/rsa.html, pinned bottom-left, showing e/n for whichever of Bob/Alice has both a keypair generated and its own step section scrolled fully above the viewport"
affects: []

actuals:
  tokens: 1700
  tasks: 2
  commits: 2

commits: 2
plan_head_before: c22f2fcc570970fbe7dd461287746998da7d6e7a
plan_head_after: 64bf006293c08146af593e2ff3e83e2d1e6315e2

tech-stack:
  added: []
  patterns:
    - "IntersectionObserver used only as a 'something changed, recompute' trigger; the actual shown/hidden predicate is read live from getBoundingClientRect() inside the single update function, so an instantaneous scroll jump that skips the 'intersecting' state can never leave a stale UI flag"
    - "rAF-throttled window scroll listener as a second trigger for the same single update function, covering the same instantaneous-jump case for browsers/paths the observer's threshold-crossing misses"

key-files:
  created: []
  modified:
    - "RSA/rsa.html - added the panel markup, its CSS (panel, rows, media queries), and its JS (scratchNum, isScrolledPast, updateScratchpad, initScratchpad), wired to renderKeyOutput()'s tail"

key-decisions:
  - "Abbreviation suffix is a bare parenthesised digit count, '(28)', not '(28 digits)' — matches the plan's literal 'digit count in parentheses' phrasing and keeps the format machine-checkable"
  - "Replaced the Task-1-committed ScrolledPast flag object with a live isScrolledPast(id) read inside updateScratchpad(), and added a rAF-throttled scroll listener alongside the IntersectionObserver — both trigger the same single updateScratchpad(), so 'exactly one observer, one updateScratchpad' still holds"
  - "Added .app{ padding-bottom: 240px } so there is always enough trailing document height for the scroll-past reveal to actually become reachable at common viewport heights, even before both keypairs (and the sections they unlock) exist"

requirements-completed: ["quick-260930-fnr"]

coverage:
  - id: D1
    description: "Panel is absent at page load, absent for a party with no keypair, and absent when scrolled past a section without a keypair"
    verification:
      - kind: automated_ui
        ref: "$SP/rsa-scratchpad-harness.js t1 (checks 1-6)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Panel and a party's row reveal once that party's section scrolls fully above the viewport top, and hide again when scrolled back"
    verification:
      - kind: automated_ui
        ref: "$SP/rsa-scratchpad-harness.js t1 (checks 7-10, 28) and t2 (independence + reset-to-top checks)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Row digits mirror the party's own public keycard exactly, and never contain that party's private exponent, p, or q"
    verification:
      - kind: automated_ui
        ref: "$SP/rsa-scratchpad-harness.js t1 (mirror-fidelity + exclusion checks) and t2 (alice-mirror-fidelity), vacuity-checked by temporary inversion for all three central assertions"
        status: pass
    human_judgment: false
  - id: D4
    description: "Panel is position:fixed, pointer-events:none, has zero focusable descendants, clears the sticky header, and lets clicks pass through to whatever is underneath"
    verification:
      - kind: automated_ui
        ref: "$SP/rsa-scratchpad-harness.js t1 (placement + click-pass-through checks)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Regenerating a keypair refreshes the row; a very large modulus abbreviates with its digit count instead of growing the panel past its 220px cap; narrow/short viewports hide the panel"
    verification:
      - kind: automated_ui
        ref: "$SP/rsa-scratchpad-harness.js t2 (freshness, abbreviation-cap, narrow-340, narrow-600 checks)"
        status: pass
    human_judgment: false
  - id: D6
    description: "Panel is legible against the page's gradient in both day and night themes and does not visually obstruct controls when scrolling through the whole page"
    verification: []
    human_judgment: true
    rationale: "The plan's own <human-check> asks for a visual/aesthetic judgment across a full manual scroll-through in both themes; a static two-screenshot smoke test (top-of-page, both themes, panel not yet triggered) was taken and shows no rendering breakage, but confirming legibility/non-obstruction while the panel is actually visible requires a human look, per the plan's own instruction."

duration: ~35min
completed: 2026-09-30
status: complete
---

# Phase quick-260930-fnr Plan 01: Pinned RSA Public-Key Reference Panel Summary

**Fixed, aria-hidden bottom-left panel in RSA/rsa.html that mirrors Bob's/Alice's public (e, n) from their own keycards once each party's step section scrolls above the viewport, driven by an IntersectionObserver-triggered live geometry read (never a possibly-stale flag), with abbreviation and viewport caps.**

## Performance

- **Duration:** ~35 min
- **Completed:** 2026-09-30T10:19:44Z
- **Tasks:** 2 of 2
- **Files modified:** 1 (`RSA/rsa.html`)

## Accomplishments

- Added `#pubkey-scratchpad`, a `position:fixed`, `pointer-events:none`, `aria-hidden` panel pinned bottom-left, with per-party rows (`scratch-row-bob`, `scratch-row-alice`) that reveal only once that party has a keypair AND their step section's `getBoundingClientRect().bottom <= 0`.
- Values are read from `State[id].e` / `State[id].n` only (never `d`, `p`, `q`, or `phi`), formatted through the page's existing `fmt()` via a new `scratchNum()` that abbreviates anything over 30 characters to `first8…last8 (digitCount)`.
- Wired the single refresh call to the tail of the existing `renderKeyOutput()`, so a keypair regeneration can never leave a stale row.
- Fixed a real staleness bug (see Deviations) so an instantaneous scroll jump can never leave the panel showing (or hiding) the wrong thing.
- Added narrow-viewport (`max-width:640px`), very-small-viewport (`max-width:380px, max-height:400px` → `display:none`), and `prefers-reduced-motion` rules.
- All colors resolve through existing `assets/palette.css` tokens (`var(--role-result)`, `var(--role-input)`, `var(--role-alt)`, `var(--surface)`, `var(--overlay)`, `var(--panel-border)`, `color-mix(...)`) — no literal color notation anywhere in the diff.

## Task Commits

1. **Task 1: One pinned read-only public-key panel, wired end-to-end from the observed section to Bob's row** - `054aff3` (feat)
2. **Task 2: Alice's independent row, long-modulus abbreviation, and small-viewport behaviour** - `64bf006` (feat)

_Both tasks were `tdd="true"`; the harness-driven RED (assertion fails against unmodified baseline) → GREEN (assertions pass) cycle was executed for each task's own behavior block before committing._

## Files Created/Modified

- `RSA/rsa.html` - added the panel's markup (one `aside#pubkey-scratchpad` with two rows), its CSS (panel, title, rows, dividers, per-party color mappings, three media queries, and a `.app` bottom-padding fix), and its JS (`scratchNum`, `isScrolledPast`, `updateScratchpad`, `initScratchpad`), wired to `renderKeyOutput()`'s tail and the bottom-of-script init calls.

## Decisions Made

- **Abbreviation format:** used a bare `(28)` rather than `(28 digits)` for the digit-count suffix, matching the plan's literal "digit count in parentheses" wording and keeping the harness's regex check unambiguous.
- **Scroll-flag architecture:** replaced the flag-object (`ScrolledPast`) design from Task 1 with a live `isScrolledPast(id)` read inside `updateScratchpad()`, keeping the IntersectionObserver purely as a "something changed, recompute" trigger, and added a rAF-throttled `window` scroll listener as a second trigger for the same function — see Deviations below for why.
- **Bottom scroll buffer:** added `.app{ padding-bottom: 240px; }` so the scroll-past reveal is actually reachable at common viewport heights even in states where relatively little content follows the target section (e.g., only Bob's keypair generated, before Alice's section and the wire/Eve/messages steps unlock and add substantial height).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Insufficient trailing document height made the specified scroll-past reveal structurally unreachable**
- **Found during:** Task 1, first harness run against the plan's own `<behavior>` scenario (generate only Bob's key, scroll past `#step-bob`, expect panel to reveal)
- **Issue:** With only Bob's keypair generated (Alice's section still un-keyed, and steps 3-5 still locked/short), the page's total scrollable height fell ~68-98px short of what was needed to push `#step-bob`'s bottom above a 700px-tall viewport — an unavoidable consequence of how much shorter the page is before both keys unlock the later steps. No scroll position existed that satisfied the plan's own required behavior.
- **Fix:** Added `.app{ padding-bottom: 240px; }`, giving comfortable headroom for the reveal to trigger at common viewport heights, while incidentally also ensuring the fixed panel never visually sits over the footer's own text.
- **Files modified:** `RSA/rsa.html`
- **Verification:** Harness scenario t1 check #7 (`step-bob rect bottom is above viewport top`) passes; re-confirmed in t2 for the equivalent Alice-only and both-shown states.
- **Committed in:** `054aff3` (Task 1 commit)

**2. [Rule 1 - Bug] IntersectionObserver threshold-crossing can be skipped entirely by an instantaneous scroll jump, leaving a stale shown/hidden flag**
- **Found during:** Task 2, the independence + reset-to-top harness scenario (both keypairs generated, scroll past both sections, then jump straight back to the top)
- **Issue:** Task 1's design tracked `ScrolledPast[id]` only inside the `IntersectionObserver` callback, updated from `entry.isIntersecting`/`entry.boundingClientRect`. An instantaneous jump (this plan's own `win.scrollTo()`-based harness, but identically a user's Home-key press or a "back to top" control) can move a section directly from "fully below the viewport" to "fully above it" (or vice versa) without the browser ever reporting an intersecting frame in between — since the observer only fires on a threshold *crossing*, and both the before and after states report ratio 0, no callback fires and the last-recorded flag never clears.
- **Fix:** Removed the `ScrolledPast` flag object. `updateScratchpad()` now derives each party's shown/hidden state directly from a fresh `document.getElementById('step-'+id).getBoundingClientRect().bottom <= 0` read (`isScrolledPast(id)`) every time it runs. The `IntersectionObserver`'s callback was simplified to just call `updateScratchpad()` (no longer reads `entry` fields at all), and a `requestAnimationFrame`-throttled `window` `scroll` listener was added as a second trigger calling the same function — covering exactly the jump cases the observer's own crossing-detection can miss. This keeps "exactly one `IntersectionObserver` construction, one `updateScratchpad`" intact (both gates still count 1); the fix is a second *trigger*, not a second *predicate implementation*.
- **Files modified:** `RSA/rsa.html`
- **Verification:** Harness scenario t2's independence + reset-to-top checks pass; t1 re-run afterward for regression, unaffected.
- **Committed in:** `64bf006` (Task 2 commit)

**3. [Rule 1 - Bug] scratchNum()'s abbreviation suffix included the word "digits", breaking the plan's literal spec**
- **Found during:** Task 2's abbreviation-and-growth-cap harness check
- **Issue:** Initial implementation formatted the long-modulus abbreviation as `"first8…last8 (28 digits)"`. The plan's wording ("the value's own digit count in parentheses") and the harness's own check ("ends with a parenthesised digit count") both call for a bare numeric parenthetical.
- **Fix:** Changed the format string to `"first8…last8 (28)"`.
- **Files modified:** `RSA/rsa.html`
- **Verification:** Harness scenario t2's abbreviation-cap check passes.
- **Committed in:** `64bf006` (Task 2 commit)

---

**Total deviations:** 3 auto-fixed (all Rule 1 - bugs blocking the plan's own specified behavior from being achievable/correct)
**Impact on plan:** All three were required for the plan's own `<behavior>` blocks to be true at all (deviation 1), for correctness under real (not just monotonic) scroll patterns (deviation 2), or to match the plan's literal spec (deviation 3). No scope creep — no new files, no new external resources, no literal colors.

## Harness Notes

- Scratchpad path (`$SP`): `/tmp/claude-1000/-home-mainaccount-Claude-number-theory-browser-tools/6f26b66f-c773-40e5-aa76-9f2d412a01d3/scratchpad`
- Harness file: `$SP/rsa-scratchpad-harness.js` (Node stdlib only; spawns `google-chrome --headless=new` with `--window-size=1200,1000` — needed because a small/default headless window size caused `IntersectionObserver`'s implicit root sizing to suppress callback delivery entirely, unrelated to production code).
- Scenarios: `t1` (28 assertions, Bob-only wiring, placement, mirror-fidelity, exclusion, click-pass-through) and `t2` (34 assertions, Alice's row, independence, divider correctness, freshness, abbreviation cap, narrow-viewport).
- All three central assertions (scroll-past reveal, mirror fidelity, private-material exclusion) were vacuity-checked by temporarily inverting the corresponding production line, confirming the harness reports `FAIL` naming that exact check, then reverting — done once against `t1` in Task 1, covering the shared predicate code that both scenarios exercise.
- Baseline snapshot (`$SP/fnr-base.html`) and the other-tracked-files checksum manifest (`$SP/fnr-others.sha`) were captured before any edit and re-verified clean (`sha256sum -c --status`) after both tasks.
- The panel deliberately reads only `e` and `n` off `State[id]` — no other field of that object is ever touched by `updateScratchpad()`.

## Issues Encountered

None beyond the three deviations documented above (all resolved inline, verified, and committed as part of their respective tasks).

## Known Stubs

None.

## Threat Flags

None — this plan's `<threat_model>` already anticipated the panel's information-disclosure, tampering, and DoS/overlay-hijack surfaces (T-fnr-01 through T-fnr-04), and all four are mitigated exactly as specified (read-only `e`/`n`, `textContent`-only assignment, `pointer-events:none` plus viewport clamps, and the checksum/working-tree gates). No new surface was introduced beyond what the threat model already covers.

## Next Phase Readiness

This is a standalone quick task with no downstream phase dependency. `RSA/rsa.html` remains a single self-contained file; no other repository file was touched.

---
*Phase: quick-260930-fnr*
*Completed: 2026-09-30*

## Self-Check: PASSED

- FOUND: `RSA/rsa.html`
- FOUND: commit `054aff3` (Task 1)
- FOUND: commit `64bf006` (Task 2)
