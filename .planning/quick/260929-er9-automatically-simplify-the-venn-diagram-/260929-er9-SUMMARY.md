---
phase: quick-260929-er9
plan: 01
subsystem: venn-diagram
tags: [canonicalization, region-mask, gcd, state-machine, localstorage]
status: complete
dependency-graph:
  requires: []
  provides: ["mask-based region canonicalizer (simplifyRegions) reused by both two- and three-circle modes", "commitRegions clone-mutate-simplify-commit wrapper for all six region mutators"]
  affects: ["Venn Diagram/venn-diagram.html"]
tech-stack:
  added: []
  patterns:
    - "Regions addressed by a circle-membership bitmask (REGION_MASK / REGION_MASK3) so simplifyRegions() is written once against masks and knows nothing about two-vs-three circles -- a fourth circle later would be a new mask table, not a second algorithm"
    - "Greedy widest-region-first decomposition of each prime's per-circle exponent vector (the same min-of-the-two rule fillFromNumbers() already used for two circles, lifted to arbitrary masks)"
    - "Check-then-commit: every mutator clones the active regions map, applies its own change to the clone, simplifies the clone, and only assigns it into state if no region exceeded its cap -- making cap rejection atomic with no in-place undo needed"
key-files:
  created: []
  modified:
    - "Venn Diagram/venn-diagram.html"
decisions:
  - "simplifyRegions() reuses existing {id,p} entry objects and never mints an id -- a prime's canonical count is max() of its circle exponents, never more than the count it started with, so pooled surplus entries are simply dropped rather than reallocated"
  - "The pairwise-conflict case (5 in (A∩B)\\C plus 5 in (A∩C)\\B) splits into TWO chips -- one in A∩B∩C, one in A\\(B∪C) -- rather than naively merging into one, because A must keep both copies of its exponent while B and C keep one each"
  - "canonicalizeOnLoad's overflow fallback uses a bounded (max 10 iterations) retry loop rather than a single slice-and-retry, since a widest region can exceed its own cap purely from OTHER regions' conflicting entries collapsing into it, even though every individually-restored region already passed isValidStoredRegion/3's own per-region cap check before this pass ever runs"
metrics:
  duration: "~16 min"
  completed: "2026-09-29"
actuals:
  tokens: 3838
  tasks: 3
  commits: 3
  plan_head_before: 54bb84e54cb679501c797691495d6d87d9208c0a
  plan_head_after: c72412e29eea6cedad57e0516c2a48e455cbe3ac
---

# Phase quick-260929-er9 Plan 01: Automatically simplify the Venn Diagram Summary

The Venn Diagram tool is now self-simplifying: placing the same prime into two regions that contradict each other (e.g. 5 in `A \ B` and 5 in `B \ A`) leaves exactly one chip, in the single region that correctly names which circles that prime divides, reactively after every add/remove/drag gesture in both two- and three-circle modes, and on load for a stored layout.

## What was built

**`simplifyRegions(regions, keys, maskOf, cap)`** (new, mode-agnostic): a single canonicalizer shared by both modes, addressed entirely through circle-membership bitmasks (`REGION_MASK` for two-circle, `REGION_MASK3` for three-circle). For each prime it accumulates a per-circle exponent, then greedily assigns widest-mask-first regions the minimum remaining exponent across the bits they touch (exactly the `shared = Math.min(ca, cb)` rule `fillFromNumbers()` already used for two circles, generalized to arbitrary masks). A cap gate refuses the whole pass atomically before any list is touched; the diff step keeps each prime's first N occurrences in place and reuses pooled surplus entries for shortfalls elsewhere, so ids are never re-minted and drag wiring stays coherent.

**`commitRegions(ctx, mutate)`** (new): the clone-mutate-simplify-commit wrapper. All six region mutators (`placePrime`, `removeToken`, `moveToken`, `placePrime3`, `removeToken3`, `moveToken3`) now build a draft copy of the live regions, apply their own change to the draft, run it through `simplifyRegions`, and only assign the result back into `state` if no region overflowed its cap -- `commitRegions` is the only place that writes `state.regions`/`state.regions3`. `clearAll` keeps its own direct path since an emptied map is canonical by definition.

**`canonicalizeOnLoad(ctx)`** (new): a one-shot pass wired into the `load` handler after the existing restore/fillFromNumbers/shared-pair reconciliation (two-circle) and restore3/defaults (three-circle) branches, before `setMode()` renders. Corrects a legacy or hand-edited stored layout before first paint and persists only when the pass actually changed something, so an already-canonical returning user's stored record stays byte-identical. A bounded (max 10 iterations) fallback loop handles the rare case where a widest region's simplified target exceeds its own cap purely from conflicting entries collapsing in from other regions.

Every existing surface keeps working unmodified: `?a=&b=`/`?mode=` inbound params, the `ab-params` shared store and its `storage` listener, the `venn-diagram`/`venn-diagram-three`/`venn-diagram-mode` records, drag-to-move, clear, mode switch, the Euclidean Algorithm prose anchor, and the overlap double-click deep links.

## Task Commits

1. **Task 1: Canonicalizer + check-then-commit, wired end-to-end through two-circle placement** - `bb7bb0b` (feat)
2. **Task 2: Route the remaining five mutators through the same commit path, covering the full three-circle lattice** - `b406331` (feat)
3. **Task 3: Canonicalize restored layouts on load, then sweep for regressions** - `c72412e` (feat)

## Files Created/Modified
- `Venn Diagram/venn-diagram.html` - Adds `REGION_MASK`/`REGION_MASK3`, `popcount`, `cloneRegions`, `simplifyRegions`, `commitRegions`, `twoCtx`/`threeCtx`, `canonicalizeOnLoad`; rewrites all six region mutators to route through `commitRegions`; wires the load-time canonicalization pass into both mode branches of the `load` handler

## Decisions Made

See frontmatter `decisions` above -- entry-reuse-never-mint-id, the two-chip pairwise-conflict split, and the bounded overflow-retry loop on load.

## Deviations from Plan

None -- plan's `<action>` blocks were followed as specified for all three tasks. Two test-harness-only corrections were needed while building the verification harness (session scratchpad only, no product code touched):

**1. [Rule 1 - test-harness bug, not product code] Repeated same-prime arming toggled the prime OFF instead of placing it**
- **Found during:** Building Task 2's `t2` scenario (placing prime 5 into `aOnly` then `bOnly` in sequence)
- **Issue:** The harness's `clickPrimeInto` helper always called `btn.click()` on the prime picker button. The tool's own `toggleArm()` toggles arm state on repeated clicks of the *same* prime button -- since the prime stays armed after a placement (unchanged, pre-existing app behavior), a second consecutive placement of the same prime disarmed it instead of re-arming it, silently no-opping the intended gesture.
- **Fix:** Harness now checks `aria-pressed` before clicking and only clicks if the target prime isn't already armed.
- **Files modified:** none in the checkout -- harness (`venn-simplify-harness.js`) lives in the session scratchpad, never committed.

**2. [Rule 1 - test-harness bug, not product code] Compound three-circle captions matched single-circle caption substrings**
- **Found during:** Task 2's `t2-outer-collapse-none-elsewhere` check
- **Issue:** The harness's chip-lookup helpers matched region captions via `indexOf` substring search. Compound captions like "A and B only" and "B and C only" contain "B only" / "C only" as literal substrings, so a check asking "is there a chip in the `B only` region" incorrectly matched chips actually in the `ab`/`bc` regions.
- **Fix:** Replaced substring search with exact caption extraction (`chipCaption()`) parsed from the `aria-label`'s fixed `"Remove {prime} from the {caption} region"` format, compared for strict equality.
- **Files modified:** none in the checkout -- harness only.

Additionally, two harness sub-tests needed a cookie-clear step alongside the existing `localStorage.clear()` when constructing fresh iframes manually (rather than through the shared `loadFrame` helper, which already clears cookies) -- `ab-params` is cookie-mirrored and cookies are origin-scoped, not iframe-scoped, so a value written by an earlier scenario in the same headless-Chrome profile survived into a later scenario's "fresh" frame and silently short-circuited `writeSharedAB`'s no-op-on-unchanged guard. Fixed by adding a shared `clearSharedCookies()` helper used by every manually-constructed iframe in `t3`. Harness-only, no product code touched.

---

**Total deviations:** 0 in product code; 3 test-harness fixes (all harness-scoped, never committed)
**Impact on plan:** None on shipped behavior -- all three fixes corrected test-harness bugs that were producing false negatives against already-correct product code.

## Issues Encountered

None beyond the harness fixes documented above.

## Verification

Built a dependency-free Node harness (`venn-simplify-harness.js`, session scratchpad, never committed) reusing the proven recipe from quick tasks `260928-t3t`/`260929-c11`: serves the checkout root over HTTP, drives real headless Chrome (`google-chrome --headless=new`) against an in-memory driver page that iframes the tool under test, dispatches real DOM events (click/keydown/pointerdown+move+up) against the page's own visible controls -- the IIFE closure is never reached directly -- and reports PASS/FAIL with per-check detail over an HTTP POST.

- **Scenario `t1`** (two-circle placement, Task 1): 26/26 checks pass -- fixed-point defaults, contradiction collapse (7 armed into `A \ B` while already in `B \ A` merges into the lens with `A=210, B=35`), legal-exponent non-collapse (5 armed into `A \ B` while already in `A ∩ B` leaves both, `A=150, B=35`), the symmetric exponent case (`A=30, B=175`), lens-equals-`gcd(A,B)` after every mutation, cap rejection (filling the lens to 8 then attempting a 9th conflicting placement leaves every count and total unchanged with the region-full warning), and no-op idempotence.
- **Scenario `t2`** (remaining five mutators + full three-circle lattice, Task 2): 43/43 checks pass -- two-circle removal and drag-to-move (including the constructed "second 3" case proving a drag-triggered collapse), three-circle outer-crescent collapse into a pairwise lens, escalation of a pairwise 5 into the triple center, the pairwise `(A∩B)\C` + `(A∩C)\B` conflict correctly splitting into TWO chips (`A∩B∩C` plus `A\(B∪C)`, not a naive merge), three-circle removal, three-circle drag, three-circle cap rejection, and the full invariant set (`abc = gcd(gcd(A,B),C)`, each pairwise chip × `abc` = that pair's GCD) plus idempotence.
- **Scenario `t3`** (load-time canonicalization + regression sweep, Task 3): 22/22 checks pass -- a contradictory legacy two-circle `localStorage` record is corrected on first paint and the correction is written back as a fixed point; a contradictory legacy three-circle record (`aOnly` + `bc` both holding 5) collapses into the triple center; the shared `ab-params` store and the Euclidean Algorithm cross-link stay neutral (same pair a clean layout would have written); untouched defaults render byte-identical to the pre-change baseline for all ten product lines; `?a=&b=` and `?mode=` inbound links still work; a seeded 200-gesture deterministic property sweep (seed `20260929`) across both modes found zero cap violations and zero GCD-invariant violations.
- **Full re-run:** all three scenarios (`t1`/`t2`/`t3`, 91 checks total) re-run green against the final committed tree. The diff-scoped gate (grep for added color literals, `<script>`/`<link>` elements, absolute URLs, excluding comment-only lines) is clean across the cumulative 300-insertion/66-deletion diff. `Venn Diagram/venn-diagram.html` is the only file touched across all three commits (`git diff --stat 54bb84e..HEAD`).

## Threat Model Disposition

All four register entries (`T-er9-01` through `T-er9-03` plus the supply-chain entry `T-er9-SC`) are mitigated or accepted as written in the plan, no code changes required beyond what was specified: `simplifyRegions` only ever runs on entries that have already passed `isValidStoredRegion`/`isValidStoredRegion3`'s array/cap/primality checks (T-er9-01, and the bounded overflow-retry loop in `canonicalizeOnLoad` additionally guarantees termination even in the pathological cross-region-overflow case); circle totals are preserved by construction so the shared `ab-params` write after a load-time correction carries the same pair it always would have (T-er9-02, proven by the `t3` shared-neutrality check); no new `innerHTML`/`outerHTML`/`document.write` call was added, the only new user-visible string (the simplification note) is built from integer primes and the file's own NOTATION dictionaries through the existing `setMessage`→`textContent` path (T-er9-03); no package-manager install exists in this plan (T-er9-SC).

## Known Stubs

None.

## Self-Check: PASSED

- `Venn Diagram/venn-diagram.html` -- FOUND
- Commit `bb7bb0b` (Task 1) -- FOUND
- Commit `b406331` (Task 2) -- FOUND
- Commit `c72412e` (Task 3) -- FOUND
- `git rev-list --count 54bb84e..HEAD` = 3 (matches `commits: 3` above)
