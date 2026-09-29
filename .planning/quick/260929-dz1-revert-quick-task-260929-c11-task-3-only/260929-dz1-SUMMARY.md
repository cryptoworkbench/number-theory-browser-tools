---
phase: quick-260929-dz1
plan: 01
subsystem: ui
tags: [venn-diagram, chinese-remainder-theorem, revert, deep-link, static-html]

# Dependency graph
requires:
  - phase: quick-260929-c11
    provides: "Double-click deep links from Venn Diagram overlap regions to Euclidean Algorithm (2-region, both modes) and Chinese Remainder Theorem (3-region, three-circle mode only)"
provides:
  - "Removal of the three-way-overlap-to-CRT deep link (f6d6683 / Task 3 of 260929-c11), leaving the two-way-overlap-to-Euclidean-Algorithm link (Tasks 1-2 of 260929-c11) fully intact"
affects: [venn-diagram, chinese-remainder-theorem]

actuals:
  tokens: 1600
  tasks: 2
  commits: 1
  plan_head_before: 0e0421f8f880ef282a8b49c599cb590715eed62e
  plan_head_after: 2565300be079c9c8f52421fedfff66ccfb8b5e4a

tech-stack:
  added: []
  patterns: ["git revert --no-commit as the mechanism for a scoped, single-commit partial feature removal"]

key-files:
  created: []
  modified:
    - "Venn Diagram/venn-diagram.html"
    - "Chinese Remainder Theorem/chinese-remainder-theorem.html"

key-decisions:
  - "Used git revert --no-commit f6d6683 (the preferred mechanism) rather than the manual fallback -- it applied cleanly, exit 0, no conflicts, both files staged"
  - "The abc chip's inertness was proven positively in a live headless browser (new r1 scenario), not only inferred from a negative grep of removed identifiers"
  - "The obsolete t3 harness scenario and standalone CRT basis checker were left on disk unmodified and reused (t3 run inverted, basis checker not run at all) rather than deleted, per the plan's explicit instruction"

requirements-completed: ["quick-260929-dz1"]

coverage:
  - id: D1
    description: "The three-way overlap (abc) chip in the Venn Diagram's three-circle mode is inert: no data-xref-href, no is-linked class, no pointer cursor, no double-click-inviting tooltip, zero opener calls on click or dblclick -- while still displaying its composite (17 on page defaults)"
    requirement: "quick-260929-dz1"
    verification:
      - kind: automated_ui
        ref: "node venn-abc-inert-harness.js r1 -- PASS 13 checks"
        status: pass
    human_judgment: false
  - id: D2
    description: "The two-way overlap deep link into the Euclidean Algorithm still works exactly as before, in both two-circle and three-circle modes"
    requirement: "quick-260929-dz1"
    verification:
      - kind: automated_ui
        ref: "node venn-xref-harness.js t1 -- PASS 19 checks (t1)"
        status: pass
      - kind: automated_ui
        ref: "node venn-xref-harness.js t2 -- PASS 18 checks (t2)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Chinese Remainder Theorem/chinese-remainder-theorem.html is byte-identical to its state at 01f74d5 (untouched by the 260929-c11 lineage)"
    requirement: "quick-260929-dz1"
    verification:
      - kind: other
        ref: "cmp against git show 01f74d5:<file> -- exit 0"
        status: pass
    human_judgment: false
  - id: D4
    description: "Venn Diagram/venn-diagram.html is byte-identical to its state at 74b1d38 (Task 2 of 260929-c11's end), not further reverted to 01f74d5"
    requirement: "quick-260929-dz1"
    verification:
      - kind: other
        ref: "cmp against git show 74b1d38:<file> -- exit 0; git diff 01f74d5 -- <file> non-empty"
        status: pass
    human_judgment: false

duration: 6min
completed: 2026-09-29
status: complete
---

# Phase quick-260929-dz1: Revert Quick Task 260929-c11 Task 3 Only Summary

**Reverted the three-way Venn overlap -> Chinese Remainder Theorem deep link (commit `f6d6683`) via a single clean `git revert`, leaving the two-way overlap -> Euclidean Algorithm link fully intact and re-verified.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-09-29T08:14:39Z
- **Completed:** 2026-09-29T08:20:51Z
- **Tasks:** 2/2 completed
- **Files modified:** 2 (`Venn Diagram/venn-diagram.html`, `Chinese Remainder Theorem/chinese-remainder-theorem.html`)

## What Was Reverted And Why

This task reverts commit `f6d6683`, which was **Task 3 of quick task `260929-c11`** (see `.planning/quick/260929-c11-add-double-click-deep-links-from-venn-di/260929-c11-PLAN.md` and `260929-c11-SUMMARY.md`). That commit wired the Venn Diagram's three-way overlap (`abc`) chip in three-circle mode to open the Chinese Remainder Theorem tool, seeded from a fixed pairwise-coprime basis table (`[3,4], [4,5], [5,7], [7,11], [3,5,7], [4,5,7], [5,7,8], [5,7,11]`).

**The user's reason, explicitly:** that cross-link was judged nonsensical. The CRT reconstruction seeded moduli with no relationship at all to the prime factorization the Venn diagram is actually displaying — the learner was shown "this number can be rebuilt from residues mod 4 and mod 5" while looking at a diagram about entirely different primes (e.g. 2, 3, 5, 7, 11, 13, 17). That undermined the mathematical connection the link was meant to illustrate, instead of reinforcing it.

**Tasks 1 and 2 of `260929-c11`** (`5fc2b1f`, `74b1d38`) — the two-way overlap deep link into the Euclidean Algorithm, in both two-circle and three-circle modes — are deliberately preserved. Those chips carry the diagram's own circle totals (not an artificial external basis), so they have no such problem, and both pre-existing behavioral scenarios re-run and pass at their original check counts.

The original `260929-c11-PLAN.md` and `260929-c11-SUMMARY.md` were left **unmodified** — project history was not rewritten. A `git diff 01f74d5..HEAD` on those two documents shows changes, but every one of them originates from the `f6d6683` commit itself (i.e. the content those documents always had); this task's own `HEAD~1..HEAD` diff touches neither file.

## Mechanism Used

**`git revert --no-commit f6d6683`** (the preferred mechanism) — applied cleanly: exit 0, no conflict, both files staged, no conflict markers. The manual fallback was not needed. `f6d6683` was confirmed still the newest commit touching either file before reverting (`git log --oneline -- "Venn Diagram/venn-diagram.html" "Chinese Remainder Theorem/chinese-remainder-theorem.html"` → `f6d6683` first line), so the conflict-free premise held.

Committed as `2565300` (`revert(quick-260929-dz1): remove three-way Venn overlap -> CRT deep link`), naming `f6d6683`, quick task `260929-c11`, the user's reason, and explicitly confirming Tasks 1/2 are preserved.

## Task Commits

1. **Task 1: Revert `f6d6683` end-to-end** — `2565300` (revert) — both files reverted to their pre-Task-3 baselines; Euclidean door proven intact.
2. **Task 2: Positively prove the three-way chip is inert** — no commit (this task changed no repository file; its entire output is evidence + this summary, per its own `<action>` instruction).

**Plan metadata:** this SUMMARY.md / STATE.md / ROADMAP.md commit is made separately by the orchestrator's docs-commit step (not by this executor, per the constraints for this quick task).

## Verification Results

### Byte-identity (Task 1)
- `cmp` of `Chinese Remainder Theorem/chinese-remainder-theorem.html` against `git show 01f74d5:<file>` → **exit 0** (byte-identical).
- `cmp` of `Venn Diagram/venn-diagram.html` against `git show 74b1d38:<file>` → **exit 0** (byte-identical).
- `git diff 01f74d5 -- "$C"` → empty. `git diff 01f74d5 -- "$V"` → non-empty (Tasks 1/2 of `260929-c11` survive, as required).
- `git diff --name-only 01f74d5..HEAD -- '*.html'` → exactly `Venn Diagram/venn-diagram.html`.
- `git diff 01f74d5..HEAD -- "Euclidean Algorithm"` → empty (untouched by the whole lineage).

### Static removal and preservation (Task 1)
- `git grep -n -E 'CRT_PATH|CRT_BASES|crtHref|readSeedParams' -- '*.html'` → no hits (exit 1).
- `chinese-remainder-theorem.html` nav-link count of `chinese-remainder-theorem.html`: dropped from 2 (pre-revert) to 1 (nav link alone).
- Line counts: Venn 1826 → **1795** (−31), CRT 1207 → **1147** (−60), matching `git show --stat f6d6683` exactly.
- All 11 Venn preservation identifiers (`euclidHref`=4, `openXref`=2, `data-xref-href`=2, `is-linked`=4, `currentTriple`=3, `currentPair`=7, `updateEuclidXref`=2, `xref-euclid`=2, `EUCLID_PATH`=3, `appendCompositeBadge`=3, `data-region`=1) unchanged from pre-revert.
- All 10 CRT preservation identifiers (`euclidean-algorithm.html`=5, `ext=1`=2, `crtConstruct`=6, `renderConstruction`=2, `data-m1`=3, `setCount(`=4, `buildRun()`=9, `MAX_MODULUS`=3, `parseInt(`=5, `location.search`=1) all matched their expected values — no count needed adjustment.

### Behavioral — preserved feature (Task 1)
Harness: `venn-xref-harness.js` (24250 bytes), checksum `c1ab1f94078ae0aada39c4b99a42ee8d03264af660cb8c6dce5e4309a62d158b`, unchanged before and after this run.
- `node venn-xref-harness.js t1` → **PASS 19 checks (t1)**, exit 0.
- `node venn-xref-harness.js t2` → **PASS 18 checks (t2)**, exit 0.

Both match their original `260929-c11` and planning-time dry-run check counts exactly — the preserved Euclidean Algorithm door is provably unaffected.

### Behavioral — new inertness proof (Task 2)
Created a new harness `venn-abc-inert-harness.js` (a copy of `venn-xref-harness.js` with one added `r1` scenario and a new `/__prerevert/` route; the original `venn-xref-harness.js` was left byte-untouched).

- `node venn-abc-inert-harness.js r1` → **PASS 13 checks (r1)**. Confirms: the `abc` chip exists and still shows `17`; carries no `data-xref-href`; has no `is-linked` class; computed cursor on its `<rect>` is not `pointer`; its `<title>` text contains no "double-click" invitation and no mention of "Chinese Remainder Theorem"; dispatching `dblclick` and `click` both record zero opener calls; in the same frame the `ab`/`ac`/`bc` pairwise chips remain linked, and a `dblclick` on `ab` records exactly one opener call with the correct URL (selective, not global, removal).

**Non-vacuity proof A (mutation-free, the stronger of the two):** `node venn-abc-inert-harness.js r1 prerevert` — pointed at `v-at-f6d6683.html` (the Venn file materialized from `git show f6d6683:...` in Task 1, never touching the working tree) via a new `/__prerevert/` route added to the harness copy. Result: **FAIL 7/13 checks**, first-mismatch line verbatim:
```
r1-abc-no-href-attr: data-xref-href=../Chinese Remainder Theorem/chinese-remainder-theorem.html?m1=4&a1=1&m2=5&a2=2
```
This proves the same assertions correctly detect the door when it exists, without mutating any repo file.

**Non-vacuity proof B (conventional flip):** a throwaway copy of the harness with the inertness assertions repointed at the `ab` chip instead of `abc` — **FAIL 7/13 checks**, first-mismatch line verbatim:
```
r1-abc-text-17: got 7
```
(The `ab` chip's own composite is 7, and it is genuinely linked, so the assertions correctly detect a real door.) The throwaway copy was discarded immediately after; `sha256sum` of the real `venn-abc-inert-harness.js` was confirmed unchanged before and after (`ae5dbd1db8b62c5e1e625cc1bd8241c1141157ef8f68282119e8a3813f814d8d`).

### Obsolete-tooling handling (Task 2)
The `t3` scenario in the original `260929-c11` harness and the standalone `crt-basis-check.js` arithmetic checker both exercise code this task removed. Per the plan, **neither was deleted, and neither was treated as a live passing gate.**

- `t3` was run **inverted**, as a third independent removal oracle: `node venn-xref-harness.js t3` was required to NOT exit 0 — it produced **`FAIL 13/43 checks (t3)`**, confirming the CRT door is gone (verbatim first failures: `t3-abc-href-default: got null`, `t3-abc-linked: no detail`, `t3-abc-dblclick-opens-crt: calls=[]`, etc.).
- `crt-basis-check.js` was **not run at all** — its arithmetic concerned the now-removed basis table.
- Both files confirmed still present on disk (`test -f`), and `venn-xref-harness.js`'s checksum confirmed unchanged (`c1ab1f94...`) across the entire session.

### Consolidated final sweep
Re-ran, in one pass against the single final committed tree (`HEAD` = `2565300`): both byte-compares, the scoped removal grep, all 21 preservation counts, `t1` (19 checks), `t2` (18 checks), and `r1` (13 checks) — all green. Final scope re-confirmed: `git diff --name-only 01f74d5..HEAD -- '*.html'` → exactly `Venn Diagram/venn-diagram.html`; `git diff 01f74d5..HEAD -- "Chinese Remainder Theorem/chinese-remainder-theorem.html"` → empty. Working tree clean throughout (`git status --porcelain --untracked-files=no` empty, `git diff --quiet HEAD` exit 0).

## Deviations from Plan

None — plan executed exactly as written. No grep count needed adjustment; `git revert --no-commit` applied cleanly on the first attempt (the preferred mechanism, no fallback needed).

## Known Stubs

None.

## Threat Flags

None — this task is a pure subtraction (91 deletions, 0 additions in production files) that reduces attack surface (the CRT page's inbound query-string parameter reader is fully removed). See the plan's `<threat_model>` for the full STRIDE analysis; all four threats (`T-dz1-01` through `T-dz1-04`) were mitigated exactly as planned, verified above.

## Self-Check: PASSED

- FOUND: `Venn Diagram/venn-diagram.html`
- FOUND: `Chinese Remainder Theorem/chinese-remainder-theorem.html`
- FOUND: commit `2565300` in `git log --oneline --all`
- FOUND: this SUMMARY.md on disk
