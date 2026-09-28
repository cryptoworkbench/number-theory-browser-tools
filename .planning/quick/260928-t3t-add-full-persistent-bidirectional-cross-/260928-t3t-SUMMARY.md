---
phase: quick-260928-t3t
plan: 01
subsystem: cross-tool-persistence
tags: [localstorage, cookie, storage-event, euclidean-algorithm, venn-diagram]
status: complete
dependency-graph:
  requires: ["260928-r1v", "260928-r1w"]
  provides: ["shared ab-params store (a, b) across Euclidean Algorithm and Venn Diagram's two-circle view"]
  affects: ["Euclidean Algorithm/euclidean-algorithm.html", "Venn Diagram/venn-diagram.html"]
tech-stack:
  added: []
  patterns:
    - "Layered read (cookie-first, then localStorage), write-both persistence, mirroring assets/theme.js's theme storage pattern and the already-shipped group-params feature (260928-r1w)"
    - "window.addEventListener('storage', ...) for live cross-document sync, re-reading through the same validated reader rather than trusting e.newValue, never writing back"
    - "One derivation function (currentPair()) feeding both the rendered display and the shared-store write, so what is shared is by construction what is shown"
key-files:
  created: []
  modified:
    - "Euclidean Algorithm/euclidean-algorithm.html"
    - "Venn Diagram/venn-diagram.html"
decisions:
  - "Shared store key is 'ab-params', spelled as a literal exactly once per file (var SHARED_AB_KEY); every other use goes through the constant."
  - "The Venn Diagram's private 'venn-diagram' localStorage record is kept (not retired) as a cold-start fallback carrying region LAYOUT, which the numeric pair alone can't express. persist() splits into persistRegions() (private record) + a shared write; the two-circle load reconciliation refactorizes from the shared pair only when the restored layout's own currentPair() disagrees with it, so an agreeing layout keeps its exact region placement across a reload."
  - "Each tool clamps the shared pair to its own ceiling on read (MAX_INPUT / EUCLID_MAX_INPUT, both 1000000); a clamped read is display-only and is never written back, so a page showing 1000000 does not destroy a stored 2500000."
  - "Neither the load restore, the load reconciliation, nor either storage-event handler ever calls writeSharedAB -- only a genuine user-initiated change (typing, a preset chip, or an explicit ?a=&b= link arrival on the Euclidean side; place/remove/move/clear on the Venn Diagram's two-circle view) writes the shared store, which is what keeps two open tools from ping-ponging. The three-circle view's own gestures write only its private venn-diagram-three record and never touch the shared pair."
metrics:
  duration: "~90 minutes"
  completed: "2026-09-28"
actuals:
  tokens: 3399
  tasks: 3
  commits: 3
  plan_head_before: b28cf86e614e160b53bcdfe7101258cd1a67db5c
  plan_head_after: a67d0422f597e0790b97dabbb11f28cfadb628c9
---

# Phase quick-260928-t3t Plan 01: Cross-tool ab-params sharing between Euclidean Algorithm and Venn Diagram Summary

The pair (a, b) is now one setting shared persistently and live between the Euclidean Algorithm page and the Venn Diagram's two-circle view, via a single `ab-params` localStorage+cookie store with a `storage`-event listener in each tool, mirroring `assets/theme.js`'s theme-sharing pattern and the already-shipped `group-params` feature between the Cayley Table and Equivalence Wheel.

## What was built

Both tools duplicate (verbatim, per this repo's per-file convention -- a static gate diffs the two copies) a `readSharedAB()` / `writeSharedAB()` pair under the key `ab-params`:

- `readSharedAB()` reads cookie-first then localStorage, requires both `a` and `b` to be real non-negative integers, rejects a both-zero pair, and returns a fresh `{ a, b }` object (or `null`) so no extra or tampered field from a stale schema can ride along. No upper bound is enforced here -- the ceiling belongs to each caller.
- `writeSharedAB(a, b)` serializes `{ a, b }` in that canonical key order, no-ops if the canonical payload is unchanged (the guard that stops a same-value re-persist from emitting a pointless `storage` event), and writes both localStorage and a cookie mirror (`path=/;max-age=31536000;samesite=lax`, matching `theme.js`'s own cookie attributes).

**Euclidean Algorithm (`Euclidean Algorithm/euclidean-algorithm.html`):**
- The live-field parser was refactored into `readLiveFields()` (single trim/regex/parse/non-negative check), with `syncXrefLinkFromFields()` reduced to calling it. A new `shareFieldsToSharedStore()` shares the same reader and calls `writeSharedAB()`.
- On load, the shared pair (if present) is restored into `#aInput`/`#bInput`, each clamped with `Math.min(..., MAX_INPUT)` -- display-only, never written back.
- Three genuine user-initiated write paths: the `input` listener on both fields (Task 1), a preset chip click (Task 2), and an explicit `?a=&b=` link arrival (Task 2) -- the two chip/link paths are needed because a programmatic `.value` assignment fires no `input` event.
- A `storage` listener (Task 3) re-reads through the shared reader, clamps to `MAX_INPUT`, no-ops if the incoming pair already matches the displayed fields, otherwise assigns both fields and calls `buildRun()` -- never writing back.

**Venn Diagram (`Venn Diagram/venn-diagram.html`):**
- `persist()` split into `persistRegions()` (the unchanged private `venn-diagram` record, now explicitly documented as the region-LAYOUT cold-start fallback) plus (Task 2) a `writeSharedAB(pair.a, pair.b)` call fed by a new `currentPair()` helper. `currentPair()` is also what `renderProducts()` now derives its two totals from, so the shared value and the on-screen totals come from one path.
- `fillFromNumbers` gained a third parameter, `source` (`'url'` | `'shared'`), controlling whether the fill writes the shared store too (`'url'`, an explicit link arrival) or only the private record (`'shared'`, a reconciliation/receive that must not re-trigger a shared write) and whether the "Filled from the Euclidean Algorithm page" message is shown.
- On load, after the private record (or hardcoded default) populates the two-circle regions, the page reconciles against the shared pair: it refactorizes only when the restored layout's own `currentPair()` disagrees with the (unclamped) stored pair, comparing unclamped-vs-unclamped so a Venn-only pair that legitimately exceeds the Euclidean ceiling doesn't destroy its own layout on every reload.
- A `storage` listener (Task 3) re-reads through the shared reader, no-ops if `currentPair()` already matches the incoming (unclamped) pair, otherwise calls `fillFromNumbers(..., 'shared')` + `render()`. Only `state.regions` is touched -- mode-agnostic and safe while the user is in three-circle mode.
- Three-circle mode (`regions3`, `persist3`, `restore3`, `STORAGE_KEY3`, `MODE_STORAGE_KEY`) is untouched by every edit: no shared read or write ever reaches it.

## Deviations from Plan

None -- the plan's own `<action>` blocks were followed verbatim for both tools' shared-store shape, restore/reconciliation logic, and listener wiring. Two documentation-only adjustments were made during verification, both zero-scope:

**1. [Rule 1 - test-harness bug, not product code] Behavioral harness's own case seeds masked a real fix under test**
- **Found during:** Building Task 3's behavioral harness, case "clamp on receive never overwrites the sender."
- **Issue:** The harness's own test-data seed wrote a huge value to `localStorage` only, leaving a stale cookie from an earlier case in place. Since `readSharedAB()` correctly reads cookie-first (matching the plan's own read order), the listener under test picked up the stale cookie value and appeared not to react -- a bug in the test's seed, not in the shipped code.
- **Fix:** Added a `seedShared(a, b)` helper to the harness that writes both channels together, matching what a genuine `writeSharedAB` call leaves behind, and used it at every point the harness simulates an external write.
- **Files modified:** none in the checkout -- the harness (`share-harness.js`, `driver.html`) lives in the session scratchpad, never committed.

**2. [Rule 1 - cosmetic, gate-driven] Reworded one comment to avoid an unintended self-reference count**
- **Found during:** Task 3 static gate (c), which pins `readSharedAB` at exactly 4 occurrences per file (definition, writer guard, restore/reconciliation call, listener call) as structural proof of the reader's actual call sites.
- **Issue:** The first draft of each `storage` listener's explanatory comment mentioned `readSharedAB()` by name, pushing the count to 5 and diluting the gate's precision.
- **Fix:** Reworded both comments to say "the shared reader" instead of repeating the function name, with no change to behavior.
- **Files modified:** `Euclidean Algorithm/euclidean-algorithm.html`, `Venn Diagram/venn-diagram.html` (comment text only, part of the Task 3 commit).

No other deviations -- every static gate count specified in the plan (key-literal spelling, `SHARED_AB_KEY`/`writeSharedAB`/`readSharedAB` occurrence counts, `persist()`/`persistRegions`/`currentPair`/`fillFromNumbers`/`buildRun()`/`render();` counts, `persist3()`/`restore3()` byte-for-byte against the pre-task baseline, and the byte-identical helper-function diff between the two files) matched on the first implementation pass.

## Verification

Built a dependency-free Node harness (`share-harness.js` + `driver.html`, kept in the session scratchpad, never committed) that serves the checkout root over HTTP and drives headless Chrome against an in-memory driver document opening both tools in same-origin iframes, so cross-document `storage` events and `document.cookie` behave as they will on the deployed site. (The plan's suggested `--dump-dom --virtual-time-budget` recipe paused/serialized before the multi-second async iframe-driving script could finish; switched to a real headless run where the driver reports its result to the harness over an actual HTTP request to `/__done`, with a 90s wall-clock timeout as the safety net.)

- **Task 1 static gates:** all key-literal, call-count, and byte-identical-duplication checks pass exactly as specified (`ab-params` spelled once per file; `SHARED_AB_KEY` >=5 per file; `localStorage.` at 3/Euclidean and 9/Venn; `writeSharedAB`/`readSharedAB` counts; `readLiveFields`/`syncXrefLinkFromFields`/`shareFieldsToSharedStore`/`buildRun()` counts; `persist()`/`persistRegions`/`currentPair`/`fillFromNumbers` counts; `persist3()`/`restore3()` unchanged from the pre-task baseline; no literal color added; scope limited to the two tool files).
- **Task 1 behavioral gate:** `T1 RESULT: PASS 26` (12 numbered cases, >=24 required). Non-vacuity proven by pointing a chip-count assertion at the wrong value, confirming `FAIL`, then restoring.
- **Task 2 static gates:** `writeSharedAB` pinned at exactly 2 per file (one definition + one call site each); `persist()`/`persistRegions` call-site counts unchanged; `shareFieldsToSharedStore` up to 4 (chip handler and URL branch added); scope and color checks clean.
- **Task 2 behavioral gate:** `T2 RESULT: PASS 21` (9 numbered cases, >=20 required), including the three-circle byte-identity check and the repeated-clear no-op guard. Non-vacuity proven twice: flipping the expected stored string confirmed `FAIL`; then temporarily adding a `writeSharedAB(1, 1)` call inside `persist3()` confirmed the three-circle isolation case failed (`expected {"a":1,"b":55} got {"a":1,"b":1}`) -- both flips restored before the final run.
- **Task 2 regression:** `T1 RESULT: PASS 26` re-run clean against the Task 2 tree.
- **Task 3 static gates:** one `storage` listener added per file; `writeSharedAB`/`shareFieldsToSharedStore`/`persist()` counts unchanged (structural proof neither listener writes back); `readSharedAB` at exactly 4 per file; `buildRun()` up to 5, `render();` up to 9, `fillFromNumbers` up to 4 (both handlers re-render through existing entry points); `persist3()`/`restore3()` still matching the pre-task baseline.
- **Task 3 behavioral gate:** `T3 RESULT: PASS 53` (12 numbered cases, >=40 required), covering live bidirectional sync, the exact-one-write-per-gesture counter, a clamped-receive case that leaves the sender's larger stored value intact, explicit-link precedence winning over a live-synced pair in both directions, an 11-payload tamper sweep (9 malformed shapes, one accepted stale-extra-field payload, one cookie-only delivery that correctly does NOT propagate live since cookie writes fire no `storage` event), and three-circle-mode/unrelated-setting preservation. Non-vacuity proven twice: flipping the expected event count confirmed `FAIL`; then temporarily adding a `shareFieldsToSharedStore()` call at the end of the Euclidean listener confirmed the clamped-receive case failed (`expected {"a":2500000,...} got {"a":1000000,...}`) -- both flips restored before the final run.
- **Full re-run:** `t1`/`t2`/`t3` all re-run green against the final committed tree (`PASS 26` / `PASS 21` / `PASS 53`). Scope confirmed: `git diff --name-only` against the pre-task base lists exactly the two tool files; a diff against `assets`, `index.html`, `Cayley Table`, `Equivalence Wheel`, and both `CLAUDE.md` files is empty; `git status --short` shows no untracked file inside the checkout.
- **Manual visual spot-check:** headless-Chrome screenshots of the Euclidean page (night theme, `?a=89&b=55` link arrival) and the Venn Diagram (day theme, default layout) both render correctly with no visual regressions.

## Threat Model Disposition

All six register entries (`T-t3t-01` through `T-t3t-06`) plus the supply-chain entry (`T-t3t-SC`) are mitigated or accepted as written in the plan -- no code changes required beyond what the plan specified. The strict `typeof`/`Number.isInteger`/non-negative/non-both-zero validation and fresh-object return (T-t3t-01), the clamp-before-`factorize()` ordering (T-t3t-02), the `.value`-only assignment with `readInputs()` re-validation downstream (T-t3t-03), the structural one-write-site-per-file guarantee plus the no-op guard (T-t3t-04), the cookie exposure parity with the existing theme cookie (T-t3t-05, accepted), and the three-circle isolation (T-t3t-06) are exactly what Tasks 1-3 implemented and the harness's cases individually assert (T-t3t-01 via Task 1 case 12 and Task 3 case 11's ten malformed shapes; T-t3t-04 via Task 3 case 5's exact-one-write counter and case 6's clamped-receive-doesn't-clobber-sender check; T-t3t-06 via Task 2 case 8 and Task 3 case 8's byte-identity checks). No package-manager install exists in this plan, so the supply-chain entry has no input to check.

## Known Stubs

None.

## Self-Check: PASSED

- `Euclidean Algorithm/euclidean-algorithm.html` -- FOUND
- `Venn Diagram/venn-diagram.html` -- FOUND
- Commit `96eeaed` (Task 1) -- FOUND
- Commit `2c0f662` (Task 2) -- FOUND
- Commit `a67d042` (Task 3) -- FOUND
- `git rev-list --count b28cf86..HEAD` = 3 (matches `commits: 3` above)
