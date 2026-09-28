---
phase: "3"
slug: "chinese-remainder-theorem-tool"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-28"
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — this repo has no test suite, no `package.json`, and no test files anywhere (verified: `find . -iname "*.test.*" -o -iname "*spec*"` and `find . -maxdepth 1 -iname "package.json"` both return nothing) |
| **Config file** | none |
| **Quick run command** | Open the file directly in a browser: `open "Chinese Remainder Theorem/chinese-remainder-theorem.html"` (matches `CLAUDE.md`'s documented verification method) |
| **Full suite command** | Manually exercise: 2-congruence and 3-congruence modes, every preset (including the non-coprime one), the coprimality warning path, Play/Pause/Step/Instant on the scan, the Extended-Euclidean reveal toggle, the cross-link to the Euclidean Algorithm tool (confirm `?ext=1` lands on its Bézout step), nav on all twelve pages, day/night toggle |
| **Estimated runtime** | ~10 minutes for a full manual pass |

---

## Sampling Rate

- **After every task commit:** Open the modified file in a browser and exercise the specific control just changed.
- **After every plan wave:** Full manual pass through all CRT-01–08 behaviors listed below.
- **Before `/gsd-verify-work`:** Full manual pass across both modes, all presets (including the non-coprime one), and the cross-link.
- **Max feedback latency:** ~1 minute (open file, click through the relevant control)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 03-01-* | 01 | 1 | CRT-01, CRT-03, CRT-07 | T-03-01 | Regex+parseInt+range-clamp on every `a_i`/`m_i` field, same as every existing tool | manual | Open file, type congruences, confirm strips render | ❌ W0 (no infra by design) | ⬜ pending |
| 03-01-* | 01 | 1 | CRT-02 | T-03-01 | Pairwise `gcd` check on every input change; warning uses `--role-warn`, never a silently wrong answer | manual | Use the non-coprime preset, confirm warning banner and no solve | ❌ W0 | ⬜ pending |
| 03-02-* | 02 | 2 | CRT-04, CRT-06 | T-03-02 | Modulus/lcm cap enforced before any render call (DoS guard, mirrors Sieve's size clamp) | manual | Play scan, confirm it advances and stops at the correct `x`; toggle 2↔3 congruences | ❌ W0 | ⬜ pending |
| 03-03-* | 03 | 2 | CRT-05 | T-03-02 | Extended-Euclidean reveal computed from the same integers already validated, no new input surface | manual | Toggle reveal, confirm `M_i`, `y_i`, final sum match the scan's answer | ❌ W0 | ⬜ pending |
| 03-04-* | 04 | 3 | CRT-08 | T-03-01, T-03-03 | New `?ext=1`/`?a=&b=` params on the Euclidean Algorithm tool parsed defensively (finite/range checks), falling back to defaults on malformed input, never throwing | manual | Click cross-link, confirm `euclidean-algorithm.html` loads with Extended Euclidean mode already on | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

*Task IDs are placeholders (`03-0N-*`) until the planner assigns concrete plan/task numbers — this map is re-keyed against the actual PLAN.md task list at execution time.*

---

## Wave 0 Requirements

*None — this repo has zero test infrastructure by explicit, repeated design choice (`CLAUDE.md`: "There is no build system, package manager, or test suite"). Existing infrastructure (manual browser verification) covers all phase requirements, consistent with every prior phase (see `.planning/phases/05-cayley-table-generator/05-RESEARCH.md`'s identical justification for the immediately preceding phase).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Input 2 or 3 congruences `x ≡ a (mod m)` | CRT-01 | No test infra in this repo by design | Open the file, type values in both 2- and 3-congruence modes |
| Non-coprime moduli trigger a clear warning, not a wrong answer | CRT-02 | No test infra in this repo by design | Use the non-coprime preset, confirm `--role-warn` banner and no solve |
| Residue-class visualization with solution as intersection | CRT-03 | No test infra in this repo by design | Visually confirm each row's highlighted cells and the aligned solution column |
| Animated brute-force scan lands on the solution | CRT-04 | No test infra in this repo by design | Press Play, confirm scan advances and stops at the correct `x` |
| Reveal Extended-Euclidean construction as faster alternative | CRT-05 | No test infra in this repo by design | Toggle reveal, confirm `M_i`, `y_i`, and final sum match the scan's answer |
| Toggle between 2 and 3 congruences | CRT-06 | No test infra in this repo by design | Click toggle, confirm third row appears/disappears and re-solves |
| Preset examples including the classic riddle | CRT-07 | No test infra in this repo by design | Click each preset chip, confirm correct fill and solve |
| Navigate to GCD tool's modular-inverse step | CRT-08 | No test infra in this repo by design | Click cross-link, confirm `euclidean-algorithm.html` loads with Extended Euclidean mode already on |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies — N/A, manual-only by repo-wide design; every task instead carries a concrete manual verification step (see Per-Task Verification Map)
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify — N/A for the same reason; manual verification runs after every task commit
- [ ] Wave 0 covers all MISSING references — N/A, no Wave 0 gap (see Wave 0 Requirements)
- [ ] No watch-mode flags — N/A, no test runner exists
- [ ] Feedback latency < 60s — met (manual browser check per task)
- [ ] `nyquist_compliant: true` set in frontmatter — left `false` until `/gsd-validate-phase` or the verifier explicitly confirms the manual-only story is sufficient for this phase, consistent with prior phases in this repo

**Approval:** pending
