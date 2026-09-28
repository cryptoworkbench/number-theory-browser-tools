---
phase: "05"
slug: "cayley-table-generator"
status: ready
nyquist_compliant: true
wave_0_complete: true
created: "2026-09-27"
updated: "2026-09-28"
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — this repo has no build system, package manager, or test suite by design (per CLAUDE.md). Verification follows Phase 01/02's established pattern: inline shell `<automated>` blocks embedded in each plan's `<verify>` tags (grep-based literal-color sweeps, structural/identifier checks) plus throwaway headless-Chrome behavioral harnesses and `<human-check>` items for rendered/interactive appearance. |
| **Config file** | none — no test framework config exists or is needed |
| **Quick run command** | Each task's own `<automated>` block (to be authored by the planner per task) |
| **Full suite command** | A repo-wide sweep across the new tool file plus the two touched pages (`index.html`, `Congruence Wheel/congruence-wheel.html`) for literal-color violations, nav registration, and cross-link presence |
| **Estimated runtime** | < 5 seconds for every grep/awk/node static gate; roughly 5-15 seconds per headless-Chrome behavioral harness (the consolidated phase harness in 05-03-T3 carries a 25-second virtual-time budget as its ceiling) — no build/compile step anywhere. |

---

## Sampling Rate

- **After every task commit:** Task's own `<automated>` block (color-literal sweep, and/or targeted functional checks — e.g. click-to-highlight, identity/self-inverse/diagonal-symmetry highlight states, large-N scroll/shrink behavior).
- **After every plan wave:** Re-run the full literal-color and nav-registration sweep across all touched files.
- **Before `/gsd-verify-work`:** Full sweep green, plus a large-N case explicitly exercised to confirm the scroll/shrink approach (D-02) holds up without freezing or becoming illegible.
- **Max feedback latency:** ~5 seconds (no build/compile step).

---

## Per-Task Verification Map

Populated 2026-09-28 from the three plans' `<verify>` blocks. Every task ships at least one `<automated>` gate; the `<human-check>` items listed under Manual-Only Verifications run at phase close, per `workflow.human_verify_mode: end-of-phase`.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-T1 | 05-01 | 1 | CAYLEY-01, CAYLEY-02, CAYLEY-03 | T-05-01, T-05-02, T-05-03, T-05-04 | Validated/clamped `N` before any build; `localStorage` state range-checked before assignment; `#n-note` written with `textContent`; delegated click via `closest()` | shell/grep + headless-Chrome harness | `STATIC-COMPLETE` structure gate, `COLOR-AUDIT-COMPLETE` literal-color gate, `data-cayley-check="PASS` harness (15 assertion groups) | ⬜ | ⬜ pending |
| 05-01-T2 | 05-01 | 1 | NAV-03 | — (markup-only; covered by T-05-SC's phase-level acceptance) | Every nav href resolved and `test -f`-ed so no dead link ships | shell/grep + headless-Chrome render sweep | `NAV-SWEEP-COMPLETE`, `NO-COLLATERAL-COMPLETE`, `RENDER-SWEEP-COMPLETE` across all twelve pages | ⬜ | ⬜ pending |
| 05-02-T1 | 05-02 | 2 | CAYLEY-04, CAYLEY-06 | T-05-05, T-05-06 | Static states assigned inside the single build pass (no extra O(M²) sweeps); `indexOf` identity lookup guarded against `-1` | shell/grep/awk + headless-Chrome harness | `STATIC-COMPLETE` (cascade-order and channel gates), `COLOR-AUDIT-COMPLETE`, `data-cayley-static="PASS` (13 assertion groups over 8 moduli) | ⬜ | ⬜ pending |
| 05-02-T2 | 05-02 | 2 | CAYLEY-05 | T-05-07 | Notes built only from computed integers and in-file per-mode wording; nothing from storage or input reaches a markup sink | shell/grep/awk + headless-Chrome harness | `STATIC-COMPLETE` (pseudo-element and dashed-outline gates), `COLOR-AUDIT-COMPLETE`, `data-cayley-mirror="PASS` (13 assertion groups incl. whole-table transposition invariant) | ⬜ | ⬜ pending |
| 05-03-T1 | 05-03 | 3 | CAYLEY-01, CAYLEY-02 | T-05-08 | Ceiling cost measured, not assumed: 120×120 build under 600ms and a click under 60ms, else `MAX_N` lowered and recorded | shell/grep/awk + headless-Chrome sizing/sticky/timing harness | `STATIC-COMPLETE` (six-branch, M-keyed, single-declaration gates), `COLOR-AUDIT-COMPLETE`, `data-cayley-size="PASS build=<ms> click=<ms>` (11 assertion groups) | ⬜ | ⬜ pending |
| 05-03-T2 | 05-03 | 3 | CAYLEY-07 | T-05-09, T-05-10 | Both relative hrefs resolved and `test -f`-ed; pinned-range `git diff` caps the already-shipped Congruence Wheel at 6 insertions / 0 deletions; wheel re-rendered after the edit | shell/grep + pinned-range git diff + headless-Chrome render gate | `XREF-COMPLETE`, `NO-COLLATERAL-COMPLETE`, `XREF-RENDER-COMPLETE` | ⬜ | ⬜ pending |
| 05-03-T3 | 05-03 | 3 | CAYLEY-01…07, NAV-03 (all) | T-05-SC | Zero packages installed across the phase; tool still self-contained (one external script, `../assets/theme.js`) | consolidated headless-Chrome harness + repo-wide shell sweep | `data-cayley-phase="PASS`, `SITE-SWEEP-COMPLETE`, `COVERAGE-COMPLETE` | ⬜ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Anti-vacuity requirement:** every headless-Chrome gate in this phase carries an explicit non-vacuity step — one expectation is deliberately pointed at a wrong value and must report `FAIL` before a green run is trusted. A harness that cannot fail is not evidence.

**Grep hygiene:** all match-counting in this phase uses `grep -o <pattern> <file> | wc -l`, never `grep -c` (which counts lines, not matches — the correctness fix applied in Phase 02's plans), and every literal-color sweep runs over a `node`-extracted, CSS-comment-stripped copy of the `<style>` region so comment prose can neither trip nor mask the gate.

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — every task ships its own automated `<verify>` block; no separate test-framework bootstrap is needed or appropriate for a build-free static-HTML repo, consistent with Phase 01/02's precedent.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|--------------------|
| The table renders correctly and stays legible at both a small N (e.g. 6) and a large N (per D-02's scroll/shrink approach), in both day and night themes | CAYLEY-01, CAYLEY-02 | Grep can assert markup/token presence, not that a grid actually reads as legible at scale — genuine visual judgment | Open the tool, set N to a small value and a large value in each mode, confirm the table redraws correctly, scrolls or shrinks sensibly, and stays legible in both themes |
| The four simultaneous highlight states (click-selected cell + row/col, identity row/col, diagonal-symmetry mirror, self-inverse diagonal) are visually distinguishable together, not colliding into noise | CAYLEY-03, CAYLEY-04, CAYLEY-05, CAYLEY-06 | "Do these four states read as visually distinct" is a design/legibility judgment, not a grep-able property | Click various cells (including the identity, a self-inverse cell, and an off-diagonal pair) and confirm each highlight state is distinguishable and clearly explained |
| Sticky headers actually hold position while scrolling a large table, and the pinned corner stays above both axes without cells bleeding through it | CAYLEY-01, CAYLEY-02 | Partially automated — 05-03-T1 asserts real engagement by scrolling the container and comparing bounding rects — but "looks right while scrolling with a pointer" stays a visual judgment | At N = 120 additive, scroll both axes and watch the header row, header column and corner cell |
| The two-way cross-link reads as a quiet signpost matching the Euclidean Algorithm ↔ Venn Diagrams pair, and survives a Congruence Wheel mode switch | CAYLEY-07 | Presence and href resolution are automated; visual weight and placement are judgment | Switch wheel modes once, confirm the link is still there and still subordinate to the lede, then click both directions |

Partial automation note: the first two manual rows are not purely manual. 05-03-T1 asserts the computed `--cell-min` ladder, the derived font sizes, real scroll overflow and real sticky engagement; 05-02-T1 asserts channel coexistence by reading `getComputedStyle` for a simultaneous non-`none` `box-shadow` and non-transparent background on a cell that is at once identity-row, identity-column, self-inverse and selected. What stays manual in both rows is aesthetic legibility, which no gate can assert.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies — all seven tasks (05-01-T1/T2, 05-02-T1/T2, 05-03-T1/T2/T3) carry at least one `<automated>` block; no task relies on `<human-check>` alone
- [x] Sampling continuity: no 3 consecutive tasks without automated verify — zero consecutive gaps; every task is gated
- [x] Wave 0 covers all MISSING references — none exist; no `<automated>MISSING` placeholder appears in any plan, and no test-framework bootstrap is appropriate in a build-free static-HTML repo (Phase 01/02 precedent)
- [x] No watch-mode flags — no test runner exists; every gate is a one-shot shell/node/headless-Chrome invocation
- [x] Feedback latency — static gates under 5s; behavioral harnesses 5-15s each, bounded by explicit `--virtual-time-budget` ceilings, with no build step in front of them
- [x] `nyquist_compliant: true` set in frontmatter
- [x] Every headless-Chrome gate carries an explicit non-vacuity step (a deliberately wrong expectation must report `FAIL`)

**Approval:** approved at planning time (2026-09-28) — all seven sign-off conditions satisfied by the three committed plans.
