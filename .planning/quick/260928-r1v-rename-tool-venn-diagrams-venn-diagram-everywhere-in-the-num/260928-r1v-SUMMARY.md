---
phase: 260928-r1v
plan: 01
subsystem: ui
tags: [static-html, rename, localstorage, nav]

requires:
  - phase: 260928-r1u
    provides: Cayley Table Generator -> Cayley Table rename (this plan's Task 2 enumerates pages by glob so it is robust regardless of whether that rename has landed in the fork base)
provides:
  - Venn Diagram tool moved from "Venn Diagrams/venn-diagrams.html" to "Venn Diagram/venn-diagram.html" as a git-tracked move
  - Singular "Venn Diagram" name used everywhere: page title/h1, all 12 site nav entries, the index.html hub card, and the Euclidean Algorithm two-way cross-link
  - Non-destructive localStorage key migration (venn-diagrams* -> venn-diagram*) with a read-through fallback that never deletes the legacy entries
affects: [venn-diagram, euclidean-algorithm, index-nav]

actuals:
  tokens: 4720
  tasks: 3
  commits: 3
plan_head_before: 30ba006eac14e34c4416016d4b4aca5993b947e0
plan_head_after: 61d7759c97206a83789e0066b91d5d6f9324360f

tech-stack:
  added: []
  patterns: ["readMigrating(key, legacyKey) localStorage fallback helper — reads current key, falls back to legacy key on first read and copies forward without deleting the legacy entry"]

key-files:
  created: []
  modified:
    - "Venn Diagram/venn-diagram.html (git move from Venn Diagrams/venn-diagrams.html)"
    - index.html
    - "Cayley Table Generator/cayley-table-generator.html"
    - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
    - "Equivalence Wheel/equivalence-wheel.html"
    - "Euclidean Algorithm/euclidean-algorithm.html"
    - "Factor Tree/factor-tree.html"
    - "Fermats Method/fermats-method.html"
    - RSA/rsa.html
    - "Shors Algorithm/shors-algorithm.html"
    - "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
    - "Square And Multiply/square-and-multiply.html"

key-decisions:
  - "Enumerated the 11 tool pages by glob (ls -1 */*.html) rather than a hardcoded path list, per the plan's own ordering note, since the fork base for this worktree had not actually picked up the 260928-r1u Cayley rename yet (see Deviations)"
  - "Kept the plan's exact localStorage migration design: LEGACY_-prefixed constants holding the pre-rename literals, a single readMigrating() helper, zero removeItem calls"

patterns-established:
  - "readMigrating(key, legacyKey) as the template for any future storage-key rename in this repo: read current, fall back to legacy on null, copy forward, never delete"

requirements-completed: [260928-r1v]

coverage:
  - id: D1
    description: "Venn Diagram tool reachable only at Venn Diagram/venn-diagram.html, moved via git mv with no duplicate left at the old path"
    requirement: "260928-r1v"
    verification:
      - kind: other
        ref: "Task 1 automated gate script (repo-root shell checks: DIR-MISSING, OLD-DIR-STILL-PRESENT, FILE-MISSING, OLD-PATH-STILL-TRACKED, CONTENT-NOT-PRESERVED, TITLE-WRONG, H1-WRONG, SELF-NAV-WRONG, ACTIVE-COUNT-WRONG, INDEX-NAV-WRONG, INDEX-CARD-WRONG, INDEX-H2-WRONG)"
        status: pass
    human_judgment: false
  - id: D2
    description: "All 12 site pages carry a working nav entry to the tool; the Euclidean Algorithm cross-link works in both its static and runtime-rewritten form with a/b params intact"
    requirement: "260928-r1v"
    verification:
      - kind: other
        ref: "Task 2 automated gate script (repo-wide zero-grep for old name/filename, per-page nav-count=12/active-count=1 checks, sibling-href test -f resolution, Euclidean static+runtime xref grep, per-page numstat collateral check)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Returning user's pre-rename placed primes and mode choice are carried forward to the new localStorage keys without deleting the legacy entries"
    requirement: "260928-r1v"
    verification:
      - kind: other
        ref: "Task 3 automated gate script (active/legacy key literal checks, region-scoped old-stem grep, readMigrating call-site checks, zero removeItem count, cross-page key-leak check) — all pass"
        status: unknown
      - kind: manual_procedural
        ref: "Plan's Task 3 <human-check>: seed pre-rename localStorage keys in devtools, reload, confirm carry-forward into the new keys, then clear and confirm a clean two-circle-mode load with no console errors"
        status: unknown
    human_judgment: true
    rationale: "This execution environment has no browser/devtools harness to drive the seed-reload-inspect sequence the plan's human-check specifies; automated static-analysis gates for Task 3 all passed, but the actual browser carry-forward behavior has not been exercised and needs a human (or a UI-capable follow-up) to confirm."

duration: 4min
completed: 2026-09-28
status: complete
---

# Quick Item 260928-r1v: Rename Venn Diagrams tool to Venn Diagram Summary

**Git-moved the Venn Diagrams tool to Venn Diagram/venn-diagram.html, swept its nav link and the Euclidean Algorithm cross-link across all 12 site pages, and migrated its three localStorage keys to the singular stem via a non-destructive read-through fallback.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-09-28T20:06:26+02:00
- **Completed:** 2026-09-28T20:10:22+02:00
- **Tasks:** 3
- **Files modified:** 12

## Accomplishments
- Moved `Venn Diagrams/venn-diagrams.html` to `Venn Diagram/venn-diagram.html` as a real git rename (history preserved, no duplicate left at the old path); updated its title, h1, and self-nav to the singular name; repointed index.html's nav link and hub card to the new path
- Swept the Venn Diagram nav link on the other 10 tool pages to the new sibling-relative path/label, and updated the Euclidean Algorithm page's static xref anchor and its runtime `updateXrefLink()` string concatenation (a/b query params preserved byte-identically)
- Renamed the tool's three localStorage keys to the singular stem (`venn-diagram`, `venn-diagram-three`, `venn-diagram-mode`), added matching `LEGACY_`-prefixed constants holding the exact pre-rename literals, and added a `readMigrating()` helper that reads the new key, falls back to the legacy key on first read, copies the value forward, and never deletes the legacy entry — rewired `restore()`, `restore3()`, and `readStoredMode()` through it

## Task Commits

1. **Task 1: Move the tool to its singular path and make the hub reach it end-to-end** - `9f98fe0` (feat)
2. **Task 2: Sweep the remaining referrers — nav on 10 pages plus the Euclidean cross-link** - `9693e4c` (feat)
3. **Task 3: Rename the three localStorage keys with a non-destructive read-through fallback** - `61d7759` (feat)

_No TDD tasks in this plan; each task is a single commit._

## Files Created/Modified
- `Venn Diagram/venn-diagram.html` - Moved from `Venn Diagrams/venn-diagrams.html`; title/h1/self-nav renamed; storage keys migrated
- `index.html` - Nav link and hub card repointed to the new path/label
- `Cayley Table Generator/cayley-table-generator.html` - Venn nav link updated
- `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` - Venn nav link updated
- `Equivalence Wheel/equivalence-wheel.html` - Venn nav link updated
- `Euclidean Algorithm/euclidean-algorithm.html` - Venn nav link, static xref anchor, and runtime xref href updated
- `Factor Tree/factor-tree.html` - Venn nav link updated
- `Fermats Method/fermats-method.html` - Venn nav link updated
- `RSA/rsa.html` - Venn nav link updated
- `Shors Algorithm/shors-algorithm.html` - Venn nav link updated
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` - Venn nav link updated
- `Square And Multiply/square-and-multiply.html` - Venn nav link updated

## Decisions Made
- Followed the plan's own ordering note and enumerated pages by glob (`ls -1 */*.html`) rather than a hardcoded list, since the sibling rename (260928-r1u) had not actually landed in this worktree's fork base at execution time (see Deviations). The glob-based approach worked unmodified regardless of the Cayley tool's current directory name.
- Kept the localStorage migration exactly as specified: singular active keys, `LEGACY_`-prefixed constants for the pre-rename literals, one `readMigrating()` helper, zero `removeItem` calls so the change stays revertible and non-destructive to user data.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Plan's stated dependency (260928-r1u) had not actually landed in this worktree's fork base**
- **Found during:** Task 2 precondition check
- **Issue:** The plan's constraints stated 260928-r1u (Cayley Table Generator -> Cayley Table) was "already merged to the base you are forking from," but this worktree's branch (`worktree-agent-af977cdca5145474d`) forked from a commit (`30ba006`) that predates the r1u merge commits present on `main`. The directory was still `Cayley Table Generator/cayley-table-generator.html`, not `Cayley Table/cayley-table.html`.
- **Fix:** No fix needed to the codebase — the plan itself was already designed to be robust to this ("every task here enumerates the site's pages by glob rather than by a hardcoded path list"). Task 2's `<files>` tag names the post-rename Cayley path as documentation only; the actual edit used `ls -1 */*.html` to discover the real 11 pages, which found `Cayley Table Generator/cayley-table-generator.html` and edited its Venn nav link successfully. All Task 2 gates passed against the actual (pre-r1u) directory name.
- **Files modified:** None beyond the plan's own files — this is a note about the execution environment, not a code change.
- **Verification:** Task 2's full gate suite (zero-grep for old Venn name/filename, 12/1 nav counts on every page, sibling-href resolution, Euclidean xref checks, per-page collateral-damage numstat) all passed with the pre-r1u Cayley directory name still in place.

**2. [Rule 1 - Bug] Task 1's automated verify gate expects index.html numstat=4, actual correct edit produces numstat=3**
- **Found during:** Task 1 verification
- **Issue:** The plan's action prose specifies "change exactly four strings" in index.html (nav href, nav text, card href, card h2 text), but the nav href and nav text sit on the same source line, so the four target strings span only three changed lines. The automated gate's `git diff --numstat` check (`= 4`) does not account for this and would fail on a correct edit.
- **Fix:** No code fix — this is a miscount in the plan's verify script, not a defect in the implementation. Manually confirmed all four semantic checks (INDEX-NAV-WRONG, INDEX-CARD-WRONG, INDEX-H2-WRONG, exact nav-line content) pass and that `git diff -- index.html` shows exactly the three intended lines changed with no collateral edits.
- **Files modified:** None (verify-script discrepancy only, documented here for the record).
- **Verification:** `git diff -- index.html` reviewed line-by-line; all three changed lines are exactly the ones the action prose specifies.

---

**Total deviations:** 2 auto-fixed/documented (1 blocking — pre-existing environment state handled by the plan's own glob design, 1 bug — plan verify-script off-by-one, not a code defect)
**Impact on plan:** No scope creep, no code changes beyond what the plan specified. Both items are documentation of environment/plan-script discrepancies discovered during execution, not corrections to the shipped code.

## Issues Encountered
None beyond the two items documented above.

## User Setup Required
None - no external service configuration required.

## Known Stubs
None.

## Next Phase Readiness
- The Venn Diagram tool's rename is fully self-consistent: filesystem path, page identity, all 12 nav entries, the Euclidean cross-link, and localStorage keys all agree on the singular name.
- **Outstanding:** the plan's Task 3 `<human-check>` (seed pre-rename localStorage values in a browser, reload, confirm carry-forward into the new keys, then clear and confirm a clean load) has not been run — no browser harness is available in this execution environment. Recorded as `coverage` item D3 with `human_judgment: true` for `/gsd-verify-work` to route to a human, and logged to `.planning/WINDOWS.md` as an unrun-verify entry.
- If 260928-r1u has not yet landed on the branch this work merges into, no further action is needed: this plan's edits are glob-derived and will apply correctly to whichever Cayley directory name is present at merge time.

---
*Phase: 260928-r1v*
*Completed: 2026-09-28*

## Self-Check: PASSED

- FOUND: `Venn Diagram/venn-diagram.html`
- FOUND: `.planning/quick/260928-r1v-rename-tool-venn-diagrams-venn-diagram-everywhere-in-the-num/260928-r1v-SUMMARY.md`
- FOUND: commit `9f98fe0` (Task 1)
- FOUND: commit `9693e4c` (Task 2)
- FOUND: commit `61d7759` (Task 3)
