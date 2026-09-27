---
phase: "02"
slug: "euclidean-algorithm-gcd-tool"
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-27"
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — this repo has no build system, package manager, or test suite by design (per CLAUDE.md: "verify changes by opening the modified `.html` file directly in a browser"). Verification follows Phase 01's established pattern: inline shell `<automated>` blocks embedded in each plan's `<verify>` tags (grep-based literal-color sweeps, tile-cap engagement checks, script-body-unchanged checks) plus `<human-check>` items for rendered/animated appearance. |
| **Config file** | none — no test framework config exists or is needed |
| **Quick run command** | Each task's own `<automated>` block (to be authored by the planner per task) |
| **Full suite command** | A repo-wide sweep across the new tool file plus the two touched pages (`index.html`, `Venn Diagrams/venn-diagrams.html`) for literal-color violations, nav registration, and cross-link presence |
| **Estimated runtime** | < 5 seconds (grep/awk over a handful of small HTML/CSS files — no build/compile step) |

---

## Sampling Rate

- **After every task commit:** Task's own `<automated>` block (color-literal sweep, and/or targeted functional checks — e.g. tile-cap engaging on a large-quotient input, Bézout identity holding, playback controls firing).
- **After every plan wave:** Re-run the full literal-color and nav-registration sweep across all touched files.
- **Before `/gsd-verify-work`:** Full sweep green, plus the large-quotient tile-cap pitfall explicitly exercised (per `.planning/research/PITFALLS.md` Pitfall 5's own suggested acceptance check: `gcd(2, 500000)`).
- **Max feedback latency:** ~5 seconds (no build/compile step).

---

## Per-Task Verification Map

*To be populated by the planner once tasks are defined — each task's `<verify>` block becomes a row here.*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | 02-01 | 1 | GCD-01–06, NAV-02 | — | N/A | shell/grep | TBD — filled by planner | ⬜ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — every task ships its own automated `<verify>` block; no separate test-framework bootstrap is needed or appropriate for a build-free static-HTML repo, consistent with Phase 01's precedent.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|--------------------|
| Numeric trace + geometric view animate correctly and stay in sync across playback controls (play/pause/step/instant-finish), in both day and night themes | GCD-02, GCD-03, GCD-05 | Grep can assert token/function presence, not that an animation actually plays smoothly and stays synchronized — genuine rendered/timing judgment requires a human or a browser observation | Open the new tool page, run each preset (coprime pair, multiple pair, equal pair, `gcd(a,0)` edge case), exercise play/pause/step/instant-finish, toggle day/night mid-animation, confirm the numeric trace and geometric tiling stay in lockstep and the final GCD is clearly highlighted |
| Extended Euclidean/Bézout mode toggle produces a correct, readable identity | GCD-06 | Correctness of `s, t` values and readability of the added trace columns is a domain + visual judgment | Toggle Extended Euclidean mode on a few preset pairs, confirm `gcd(a,b) = s·a + t·b` holds arithmetically and the added columns read clearly alongside the existing trace |
| Capped-tile badge is visually obvious, not just technically present | GCD-05 | "Is it obvious to a learner that this collapsed tile represents many more tiles" is a visual/pedagogical judgment, not a grep-able property | Run `gcd(2, 500000)` (from PITFALLS.md's own suggested check), confirm the geometric view does not freeze/stutter and the ×N badge is legible and clearly distinct from a normal tile |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (none expected — no Wave 0 needed)
- [ ] No watch-mode flags (no test runner exists)
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
