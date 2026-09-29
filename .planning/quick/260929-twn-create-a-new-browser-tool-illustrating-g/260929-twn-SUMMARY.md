---
phase: quick-260929-twn
plan: 01
subsystem: ui
tags: [group-theory, number-theory, svg, vanilla-js, static-site]

requires: []
provides:
  - "Group Isomorphism/group-isomorphism.html — fourteenth tool: two single-ring SVG wheels showing Z/nZ (additive) and (Z/mZ)* (multiplicative) side by side for every genuinely isomorphic (n, m) pair up to m=100"
  - "Runtime-derived isoPairs(maxM)/primitiveRoot(m)/totient(m)/imageOf/discreteLog math layer (duplicated in-file per repo convention, not shared)"
  - "Fifteen-entry site nav and hub card registration across all fifteen pages"
affects: [index.html, all thirteen pre-existing tool pages]

actuals:
  tokens: 12591
  tasks: 3
  commits: 3
  plan_head_before: 198b907f9c4033bda4cb20f4c68cf83483a52de6
  plan_head_after: f1d11b83e225c19ddf9d31b8c3b26246f18352d9

tech-stack:
  added: []
  patterns:
    - "One shared renderWheel(dynGroup, n, opts) function draws both wheels so their sector geometry (and, later, their role classes) can never diverge"
    - "A pick is always stored as a left-wheel element k; a right-wheel click converts through discreteLog(value, g, m, n) first, so the two wheels can never disagree about what is selected"
    - "rawPowSafe(g, k) returns null instead of an imprecise huge number when g^k would exceed Number.MAX_SAFE_INTEGER, so the readout never displays a wrong un-reduced power for large exponents"

key-files:
  created:
    - "Group Isomorphism/group-isomorphism.html"
  modified:
    - "index.html (nav entry, hub card, two tool-count lines)"
    - "Sieve Of Eratosthenes/sieve-of-eratosthenes.html (nav entry only)"
    - "Factor Tree/factor-tree.html (nav entry only)"
    - "Venn Diagram/venn-diagram.html (nav entry only)"
    - "Euclidean Algorithm/euclidean-algorithm.html (nav entry only)"
    - "Chinese Remainder Theorem/chinese-remainder-theorem.html (nav entry only)"
    - "Equivalence Wheel/equivalence-wheel.html (nav entry only)"
    - "Eulers Totient/eulers-totient.html (nav entry only)"
    - "Cayley Table/cayley-table.html (nav entry only)"
    - "Square And Multiply/square-and-multiply.html (nav entry only)"
    - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html (nav entry only)"
    - "RSA/rsa.html (nav entry only)"
    - "Fermats Method/fermats-method.html (nav entry only)"
    - "Shors Algorithm/shors-algorithm.html (nav entry only)"

key-decisions:
  - "MAX_M = 100, yielding the 49 pairs of grounded fact 6 — bounds the pair list to one scrollable panel while keeping every classical case type (prime, odd prime power, twice-prime-power, and the m=4 special case) present"
  - "m is the only persisted parameter; n, g and the unit list are always recomputed from it, so a stored value can never describe a pair that is not an isomorphism"
  - "Default pair m = 13 — the headline example from the request"
  - "Two right-wheel layouts, powers-of-g (default, teaching layout) and numeric (the honest layout — same map, looks scrambled against ascending units)"
  - "Cross-link is one-way (this tool -> Equivalence Wheel) — a return link would require editing the Equivalence Wheel's body, out of this plan's scope"
  - "Slot colors reuse the Equivalence Wheel's three semantic aliases (--role-active/--role-input/--role-result for first element/second element/result)"
  - "rawPowSafe(g,k) added beyond the plan's letter to keep the readout's un-reduced-power display always exact or explicitly absent, never an imprecise huge JS Number for large exponents"

patterns-established:
  - "Group-theory tool pages that need a math layer duplicate primeFactors/gcd-style helpers in-file rather than importing a shared module (unchanged repo convention, reaffirmed for this tool)"

requirements-completed: ["quick-260929-twn"]

coverage:
  - id: D1
    description: "Two wheels (Z/nZ additive, (Z/mZ)* multiplicative) render side by side for every (n,m) pair where a true isomorphism exists, derived at runtime from the cyclicity test, never a hand-typed table"
    verification:
      - kind: other
        ref: "scratchpad iso-math-check.js (independent re-implementation): 83068 checks across all 49 pairs, all pass"
      - kind: automated_ui
        ref: "scratchpad iso-harness.js scenario t1 (headless Chrome, DOM-driven): 100 checks, PASS"
    human_judgment: false
  - id: D2
    description: "Selecting an element on either wheel highlights its counterpart on the other (discrete-log inverse of the powers-of-g map); a second pick shows the sum on the left and product on the right and states their correspondence"
    verification:
      - kind: automated_ui
        ref: "scratchpad iso-harness.js scenario t2 (headless Chrome, DOM-driven clicks/keydowns): 18 checks, PASS"
      - kind: other
        ref: "scratchpad iso-math-check.js homomorphism law check across all 49 pairs and every element pair: PASS"
    human_judgment: false
  - id: D3
    description: "Tool is registered site-wide: fifteen-entry nav on all fifteen pages, one hub card, tool count reading fourteen"
    verification:
      - kind: automated_ui
        ref: "scratchpad iso-harness.js scenario t3 (headless Chrome, walks all 15 pages + follows the hub link): 47 checks, PASS"
      - kind: other
        ref: "grep -c site-nav-link index.html */*.html: all fifteen files report 15"
    human_judgment: false
  - id: D4
    description: "No literal color anywhere in the new page or index.html; day/night themes both legible"
    verification:
      - kind: other
        ref: "scratchpad iso-gates.js Gates A-D against both files: PASS; calibration controls (Cayley Table passing, assets/palette.css failing) both behaved as expected"
      - kind: manual_procedural
        ref: "headless Chrome screenshots of the tool page and the hub in both themes (day/night), reviewed inline"
    human_judgment: false

duration: ~35min
completed: 2026-09-29
status: complete
---

# Quick Task 260929-twn: Group Isomorphism Tool Summary

**Fourteenth tool added: two single-ring SVG wheels (Z/nZ additive, (Z/mZ)* multiplicative) for every one of the 49 isomorphic pairs up to m=100, derived at runtime from a primitive-root cyclicity test, with element-by-element correspondence navigable from either wheel.**

## Performance

- **Duration:** ~35 min
- **Tasks:** 3
- **Files modified:** 15 (1 created, 14 modified)

## Accomplishments

- New self-contained `Group Isomorphism/group-isomorphism.html`: math layer (`gcd`, `unitsMod`, `totient`, `multOrder`, `primitiveRoot`, `isoPairs`, `imageOf`, `powerList`, `discreteLog`), a single shared `renderWheel()` drawing both wheels so sector counts can never diverge, a pair selector + scrolling reference list of all 49 pairs, and localStorage persistence of `m` only (re-validated against the pair list on every load).
- Two-slot selection cycle mirroring the Equivalence Wheel: clicking either wheel always resolves to a left-wheel element `k` (a right-wheel click converts through `discreteLog` first), highlighting the sum on the left and the product on the right and stating that they agree — computed and compared live, not asserted.
- Powers-of-g / Numeric layout tabs (mouse + arrow keys); switching layout preserves the current selection, switching pair clears it.
- Registered across the whole site: fifteen-entry nav on all fifteen pages, a hub card with an inline two-wheel `var()`-only icon, and the tool-count wording updated from thirteen to fourteen.

## Task Commits

Each task was committed atomically:

1. **Task 1: End-to-end "see the two wheels for a real isomorphic pair"** - `5588999` (feat)
2. **Task 2: Make the correspondence navigable from either wheel** - `52daef6` (feat)
3. **Task 3: Register the tool across the site** - `f1d11b8` (feat)

**Plan metadata:** `198b907` (docs: plan)

## Files Created/Modified

- `Group Isomorphism/group-isomorphism.html` - the new tool (880 lines)
- `index.html` - nav entry, hub card with inline SVG icon, two tool-count lines
- 13 other tool pages - one inserted nav-entry line each, zero deletions

## Decisions Made

See `key-decisions` in frontmatter. Notable: `MAX_M = 100` (49 pairs, all classical case types represented); `m` is the sole persisted parameter (n/g/units always re-derived, so a corrupted stored value can never render a non-isomorphic pair); powers-of-g is the default layout with numeric as the "honest" alternative; the cross-link to the Equivalence Wheel is one-way by design.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing critical functionality] Added `rawPowSafe(g, k)` guard against imprecise large-number display**
- **Found during:** Task 2 (readout implementation)
- **Issue:** The plan's behavior spec shows the readout stating the un-reduced power exactly (e.g. "2^5 = 32 ≡ 6 mod 13"). With `m` up to 100, `n` can reach 96, so `g^k` for large `k` (e.g. `7^95`) is far beyond `Number.MAX_SAFE_INTEGER` — displaying it directly would render an inaccurate, misleading "exact" value, a correctness bug in a page whose whole point is showing math truthfully.
- **Fix:** Added `rawPowSafe(g, k)`, which returns the exact value only when it fits within `Number.MAX_SAFE_INTEGER` and `null` otherwise; the readout falls back to stating only the reduced congruence with an explicit "too large to show exactly" note when the un-reduced power would not be exact.
- **Files modified:** `Group Isomorphism/group-isomorphism.html`
- **Verification:** `iso-math-check.js` confirms the reduced values are always correct (round trip + homomorphism law across all 49 pairs); the small-number case (m=13, k=5) used in the plan's own behavior spec still displays the exact "32" as required by scenario t2.
- **Committed in:** `52daef6` (Task 2 commit)

**2. [Rule 3 - Blocking] Fixed test-harness bugs discovered while proving the behavior spec, not production code**
- **Found during:** Task 2 (t2 harness authoring)
- **Issue:** Three harness-only bugs surfaced while building `iso-harness.js`'s scenario t2: (a) SVG `<g>` wedge elements don't implement `HTMLElement.click()`, so the initial `.click()` calls threw; (b) every click triggers a full `innerHTML` wipe-and-rebuild of both wheels, so cached DOM references to wedges went stale immediately after the click that was supposed to update them; (c) the plan's illustrative click sequence, read literally as one continuous narrative, left the two-slot select cycle mid-pair (`awaiting: 'b'`) going into the isolated "case 2" check, so a fresh single-pick assertion needed the pending pair completed first.
- **Fix:** Switched wedge clicks to dispatched `MouseEvent`s, always re-queried wedges by label immediately before each assertion instead of reusing pre-click references, and inserted one extra click to complete the pending pair before testing case 2 in isolation.
- **Files modified:** none in the repo (scratchpad-only: `iso-harness.js`, not committed per plan instruction)
- **Verification:** `iso-harness.js t2` passes 18/18 checks after the fix; `iso-gates.js` gate D was also found to be too strict about relative-path depth (`../assets/theme.js` vs `assets/theme.js` for `index.html` at repo root vs. a one-level-deep tool page) and was corrected to normalize leading `../` segments before comparing script `src` sets — confirmed via the calibration re-run showing Cayley Table still passes and `assets/palette.css` still fails.
- **Committed in:** not applicable (scratchpad-only, not committed)

---

**Total deviations:** 2 auto-fixed (1 missing-critical, 1 blocking/test-only)
**Impact on plan:** Both fixes keep the shipped page's math and readout exact; neither changed scope. No production regression risk — the second item touched only the scratchpad verification harness, never committed.

## Known Stubs

None.

## Threat Flags

None — this plan's own threat model (T-twn-01 through T-twn-05, T-twn-SC) already covers the surface area introduced (the `?m=` param, the `localStorage` key, the nav/hub links, rendering cost, and the absence of any package-manager install), and no additional surface was introduced beyond what it anticipated.

## Issues Encountered

None beyond the deviations documented above.

## User Setup Required

None - no external service configuration required. Static client-side page, no build step, no server.

## Next Phase Readiness

- Group Isomorphism tool is fully registered and functional; no follow-up work required by this task.
- The `rawPowSafe` guard and the layout-preservation-on-selection pattern are reusable references if a future tool needs to display modular exponentiation results at scale.

---
*Phase: quick-260929-twn*
*Completed: 2026-09-29*

## Self-Check: PASSED

- FOUND: `Group Isomorphism/group-isomorphism.html`
- FOUND: `.planning/quick/260929-twn-create-a-new-browser-tool-illustrating-g/260929-twn-SUMMARY.md`
- FOUND commit: `5588999` (Task 1)
- FOUND commit: `52daef6` (Task 2)
- FOUND commit: `f1d11b8` (Task 3)
- FOUND commit: `198b907` (plan doc)
