---
phase: "7"
slug: "shared-js-module-refactor"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-30"
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None in project — dev-only Node.js harness (Node v22.23.1), not a project dependency |
| **Config file** | none — Wave 0 installs the harness |
| **Quick run command** | `node .planning/phases/07-shared-js-module-refactor/harness.js` |
| **Full suite command** | `node .planning/phases/07-shared-js-module-refactor/harness.js --all && bash .planning/phases/07-shared-js-module-refactor/shadow-check.sh` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick harness for the helpers the migrated tool uses, plus `shadow-check.sh <tool file>`
- **After every plan wave:** Run the full suite command across all migrated tools
- **Before `/gsd-verify-work`:** Full suite must be green AND the per-tool browser checklist (07-RESEARCH.md §Validation Architecture) passed for all 15 tools
- **Max feedback latency:** 10 seconds (automated); browser pass is per-tool manual

---

## Per-Task Verification Map

*Filled in by the planner once task IDs exist. Every tool-migration task must map to: harness (helpers it consumes) + shadow-check (its file) + browser checklist steps 1–3 (plus 4–6 where applicable).*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | SC-1 (shared modules exist, parity) | — | N/A | unit (Node harness) | `node .planning/phases/07-shared-js-module-refactor/harness.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.planning/phases/07-shared-js-module-refactor/harness.js` — extracts each helper's pre-migration body from the pre-phase commit's HTML (via `git show <base>:<file>`), loads the new `assets/*.js` module into a `vm` context with a stub `window`, and deep-compares outputs over the ranges in 07-RESEARCH.md §Wave 0 Gaps (gcd over [-50,50]², isPrime 0..10000, BigInt RSA-scale triples, euclidSteps subset parity, etc.)
- [ ] `.planning/phases/07-shared-js-module-refactor/shadow-check.sh` — asserts zero remaining local declarations (`function X(` or `const X =`) of any now-shared helper name in the given file(s)
- [ ] Per-tool browser checklist — reuse 07-RESEARCH.md §"Per-tool browser verification checklist" verbatim

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Tool loads with no console error over `file://` | SC-1, SC-2 | No DOM test framework; load-order bugs (`window.NT` undefined) only surface in a real page | Open tool via `file://`, check console for `ReferenceError` / `NT` errors |
| Preset chips + on-load example render identically to pre-migration | SC-2 | Visual SVG output | Click every chip; compare against pre-phase commit rendering |
| Playback controls (play/pause/step/finish) | SC-2 | Timing/animation behavior | Exercise once per tool that has them |
| Cross-tool persistence + deep links round-trip | SC-2 | Multi-tab `storage` events | Two tabs per linked pair; change one, confirm the other updates |
| Venn preview subsystems (nested squares, balanced factor tree) match the full tools | SC-2 | Composite render parity | Hover region chip, inspect both sections, follow both double-click links |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
