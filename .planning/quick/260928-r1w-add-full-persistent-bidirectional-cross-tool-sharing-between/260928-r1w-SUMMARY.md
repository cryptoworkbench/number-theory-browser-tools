---
phase: quick-260928-r1w
plan: 01
subsystem: cross-tool-persistence
tags: [localstorage, cookie, storage-event, cayley-table, equivalence-wheel]
status: complete
dependency-graph:
  requires: ["260928-r1u"]
  provides: ["shared group-params store (mode + N) across Cayley Table and Equivalence Wheel"]
  affects: ["Cayley Table/cayley-table.html", "Equivalence Wheel/equivalence-wheel.html"]
tech-stack:
  added: []
  patterns:
    - "Layered read (cookie-first, then localStorage), write-both persistence, mirroring assets/theme.js's theme storage pattern"
    - "window.addEventListener('storage', ...) for live cross-document sync, re-reading through the same validated reader rather than trusting e.newValue"
key-files:
  created: []
  modified:
    - "Cayley Table/cayley-table.html"
    - "Equivalence Wheel/equivalence-wheel.html"
decisions:
  - "Shared store key is 'group-params', spelled as a literal exactly once per file (var SHARED_GROUP_KEY), every other use goes through the constant."
  - "The Cayley Table's private 'cayley-table' localStorage record is retired outright (both its fields moved into the shared store). The Wheel's 'equivalence-wheel' record is reduced to its one unrelated field, depth."
  - "Each tool clamps the shared modulus to its own ceiling on read (120 Cayley, 60 Wheel); a clamped read is display-only and is never written back, so a Wheel showing 60 does not destroy a stored 90."
  - "Neither the read nor the storage-event handler ever calls persist() -- only a genuine user-initiated change (slider, input, mode tab, or an explicit ?mode=&n= link arrival) writes the shared store, which is what keeps two open tools from ping-ponging."
metrics:
  duration: "~50 minutes"
  completed: "2026-09-28"
actuals:
  tokens: 2440
  tasks: 2
  commits: 2
  plan_head_before: e07800b5dd60a0803f520623d9fea564fbc0aa88
  plan_head_after: a3d0d2428e54fed87f300eecef27f1840ddba0df
---

# Phase quick-260928-r1w Plan 01: Cross-tool group-params sharing between Cayley Table and Equivalence Wheel Summary

Group type (additive/multiplicative) and modulus N are now one setting shared persistently and live between the Cayley Table and the Equivalence Wheel, via a single `group-params` localStorage+cookie store with a `storage`-event listener in each tool, mirroring `assets/theme.js`'s own theme-sharing pattern.

## What was built

Both tools duplicate (verbatim, per this repo's per-file convention) a `readSharedGroup()` / `writeSharedGroup()` pair under the key `group-params`:

- `readSharedGroup()` reads cookie-first then localStorage, validates the group type against the two known values and N as a real, integer, `>= 1` number, and returns a fresh `{ mode, N }` object (or `null`) so no extra or tampered field can ride along.
- `writeSharedGroup(mode, n)` serializes `{ mode, N }` in that canonical key order, no-ops if the canonical payload is unchanged (the guard that stops a same-value re-persist from emitting a pointless `storage` event), and writes both localStorage and a cookie mirror (`path=/;max-age=31536000;samesite=lax`, matching theme.js's own cookie attributes).

**Cayley Table (`Cayley Table/cayley-table.html`):**
- The restore block now calls `readSharedGroup()` instead of parsing its own `cayley-table` localStorage record (which is retired outright — both its fields moved into the shared store).
- `persist()` is now a single call to `writeSharedGroup(state.mode, state.N)`.
- A new `storage` listener re-reads the shared store, clamps to `MAX_N` (120), resets `#n-input`'s dedupe guard and clamp note, recomputes the default selection, and calls `syncTabs()` + `buildTable()` — never `persist()`.
- **Deviation (Rule 1 — bug fix):** the load handler previously only synced `#n-input`'s visible value when a `?mode=&n=` URL link was present; a value restored from storage (the shared store, or previously the private `cayley-table` key) updated `state.N` but left the input box showing the stale HTML default. Moved `nInputEl.value = state.N;` outside the URL-param `if` block so the field always reflects `state.N` regardless of source. This was required to satisfy the plan's explicit truth that opening a fresh Cayley Table shows the shared N in `#n-input`.

**Equivalence Wheel (`Equivalence Wheel/equivalence-wheel.html`):**
- The restore block keeps its try/catch but reduced to its one unrelated field, `depth` (still honoured, `>= 2 && <= 10`). Immediately after, and before the existing `readModeNParams()` URL branch (which still wins on arrival), it calls `readSharedGroup()` and clamps to `WHEEL_MAX_N` (60).
- `persist()` still writes the tool-local record, now `{ depth: state.depth }` only, and additionally calls `writeSharedGroup(state.mode, state.N)`.
- A new `storage` listener performs the Wheel's own `setMode()`-style reset (identity element, clear B/sum, `awaiting = 'a'`) and calls `syncTabs()` + `render()` — never `persist()`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Cayley Table's `#n-input` never reflected a storage-restored N**
- **Found during:** Task 1 behavioural gate (harness case t1.5 — opening the Cayley Table fresh after a Wheel change showed `#n-input` = 6 instead of 18, even though the table itself correctly rendered 18's group).
- **Issue:** The original code only assigned `nInputEl.value = state.N;` inside the `if (modeNParams)` branch of the load handler. A value restored from any storage path (the new shared store, and — pre-existing — the old private `cayley-table` key) updated `state.N` (driving the table render) but left the visible number input showing the hardcoded HTML default of `6`.
- **Fix:** Moved the `nInputEl.value = state.N;` assignment out of the conditional so it runs unconditionally, right before `syncTabs(); buildTable();`, syncing the field regardless of whether `state.N` came from a URL link, the shared store, or the default.
- **Files modified:** `Cayley Table/cayley-table.html`
- **Commit:** `8225dd6`

No other deviations — Task 1 and Task 2's remaining edits match the plan's specification exactly (verified via the `SHARED_GROUP_KEY`/`writeSharedGroup` byte-identical diffs between the two files, and the exact `persist()` call-count pins of 4/Cayley and 6/Wheel).

## Verification

Built a dependency-free Node harness (`share-harness.js`, kept in the session scratchpad, not committed) that serves the checkout root over HTTP and drives headless Chrome (`google-chrome --headless=new --dump-dom --virtual-time-budget=...`) against an in-memory driver document with two live iframes, so cross-document `storage` events and `document.cookie` behave as they will on the deployed site.

- **Task 1 static gates:** all key-literal, call-count, and byte-identical-duplication checks pass (`SHARED_GROUP_KEY` spelled once per file; `persist()` at 4/Cayley and 6/Wheel; `localStorage.` counts of 3/Cayley and 5/Wheel confirming the Cayley record was replaced rather than duplicated; no literal color added; scope limited to the two tool files).
- **Task 1 behavioural gate:** `T1-HARNESS-PASS: PASS 27` (14 numbered cases, ≥20 required). Non-vacuity proven by flipping case 7's expected row count (6→5), confirming `FAIL`, then restoring.
- **Task 2 static gates:** one `storage` listener added per file, `persist()` counts unchanged, no `BroadcastChannel`/`setInterval` added, render-entry-point call counts each up by exactly one.
- **Task 2 behavioural gate:** `T2-HARNESS-PASS: PASS 19` (7 numbered cases, ≥18 required), including the decisive event-count triple (1, 0, 1) proving no write-back and no selection-triggered write. Non-vacuity proven twice: flipping case 4's expected event count (1→2) confirmed `FAIL`; then temporarily adding a `persist()` call inside the Wheel's `storage` handler and re-running confirmed case 6 failed (`expected 90 got 60`) because the clamped receive wrote back over the sender's value — both flips restored before the final run.
- **Task 3 regression sweep:** `T3-HARNESS-PASS: PASS 78` (11 numbered cases, ≥40 required) covering explicit-link precedence, depth/selection/clamp-note preservation, and 7 tampered/stale-payload shapes (non-JSON, unknown mode, string N including an HTML-tag-bearing string, out-of-range N, absurdly-high N, stale-schema extra field, non-object payloads `null`/`[]`/`42`, one case via the cookie channel). Non-vacuity proven by flipping case 9's Wheel expectation (60→90), confirming `FAIL`, then restoring.
- **Full re-run:** all three scenarios plus both static gate groups re-run against the final committed working tree — all green. Scope confirmed: only the two tool files differ from the pre-task base (`e07800b5`); `assets/`, `index.html`, and both `CLAUDE.md` files are untouched; no untracked files inside the checkout.

## Threat Model Disposition

All six register entries (`T-r1w-01` through `T-r1w-06`) plus the supply-chain entry (`T-r1w-SC`) are mitigated or accepted as written in the plan — no code changes required beyond what the plan specified; the mitigations (strict `typeof`/`Number.isInteger` validation, fresh-object return discarding extra fields, per-tool ceiling clamping, no-write-back structural guarantee) are exactly what Task 1/2 implemented and Task 3's harness cases individually assert.

## Known Stubs

None.

## Self-Check: PASSED

- `Cayley Table/cayley-table.html` — FOUND
- `Equivalence Wheel/equivalence-wheel.html` — FOUND
- Commit `8225dd6` — FOUND
- Commit `a3d0d24` — FOUND
- `git rev-list --count e07800b5..HEAD` = 2 (matches `commits: 2` above)
