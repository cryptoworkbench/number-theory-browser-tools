---
phase: "05"
slug: "cayley-table-generator"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-27"
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
| **Estimated runtime** | < 5 seconds for grep/awk gates; a few seconds per headless-Chrome behavioral harness run — no build/compile step. |

---

## Sampling Rate

- **After every task commit:** Task's own `<automated>` block (color-literal sweep, and/or targeted functional checks — e.g. click-to-highlight, identity/self-inverse/diagonal-symmetry highlight states, large-N scroll/shrink behavior).
- **After every plan wave:** Re-run the full literal-color and nav-registration sweep across all touched files.
- **Before `/gsd-verify-work`:** Full sweep green, plus a large-N case explicitly exercised to confirm the scroll/shrink approach (D-02) holds up without freezing or becoming illegible.
- **Max feedback latency:** ~5 seconds (no build/compile step).

---

## Per-Task Verification Map

*To be populated by the planner once tasks are defined — each task's `<verify>` block becomes a row here.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | 05-01 | 1 | CAYLEY-01–07, NAV-03 | — | N/A | shell/grep | TBD — filled by planner | ⬜ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — every task ships its own automated `<verify>` block; no separate test-framework bootstrap is needed or appropriate for a build-free static-HTML repo, consistent with Phase 01/02's precedent.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|--------------------|
| The table renders correctly and stays legible at both a small N (e.g. 6) and a large N (per D-02's scroll/shrink approach), in both day and night themes | CAYLEY-01, CAYLEY-02 | Grep can assert markup/token presence, not that a grid actually reads as legible at scale — genuine visual judgment | Open the tool, set N to a small value and a large value in each mode, confirm the table redraws correctly, scrolls or shrinks sensibly, and stays legible in both themes |
| The four simultaneous highlight states (click-selected cell + row/col, identity row/col, diagonal-symmetry mirror, self-inverse diagonal) are visually distinguishable together, not colliding into noise | CAYLEY-03, CAYLEY-04, CAYLEY-05, CAYLEY-06 | "Do these four states read as visually distinct" is a design/legibility judgment, not a grep-able property | Click various cells (including the identity, a self-inverse cell, and an off-diagonal pair) and confirm each highlight state is distinguishable and clearly explained |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (none expected — no Wave 0 needed)
- [ ] No watch-mode flags (no test runner exists)
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
