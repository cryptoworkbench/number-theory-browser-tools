---
phase: "01"
slug: "palette-unification"
status: validated
nyquist_compliant: true
wave_0_complete: true
created: "2026-09-24"
---

# Phase 01 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — this repo has no build system, package manager, or test suite by design (per CLAUDE.md: "verify changes by opening the modified `.html` file directly in a browser"). Verification is done via inline shell `<automated>` blocks embedded in each plan's `<verify>` tags (grep-based literal-color sweeps, link-order checks, `md5sum` script-body-unchanged checks) plus `<human-check>` items for rendered appearance. |
| **Config file** | none — no test framework config exists or is needed |
| **Quick run command** | Each task's own `<automated>` block, e.g. `sed -n '/<style>/,/<\/style>/p' "<file>" \| grep -nEi '#[0-9a-f]{3}\b\|#[0-9a-f]{6}\b\|rgba?\(\|hsla?\('` (literal-color sweep) |
| **Full suite command** | 01-05 Task 1's repo-wide audit (`AUDIT-COMPLETE` / `LINKS-COMPLETE` / `LOCALS-COMPLETE` / `ANCHORS-COMPLETE` markers) re-runs every file's literal-color sweep, link-order check, and JS-anchor preservation check across all seven source files in one pass |
| **Estimated runtime** | < 5 seconds (grep/awk/md5sum over 7 small HTML/CSS files) |

---

## Sampling Rate

- **After every task commit:** Executor ran that task's own `<automated>` block (color-literal sweep, token-presence check, and/or script-body hash) before committing.
- **After every plan wave:** Wave 3's plan (01-05) re-ran the full repo-wide audit across all seven files, superseding per-task spot checks.
- **Before `/gsd-verify-work`:** Full audit is green (confirmed by 01-05's Task 1, `AUDIT-COMPLETE` with zero findings).
- **Max feedback latency:** ~5 seconds (no build/compile step).

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-T1 | 01-01 | 1 | PAL-01, PAL-02, PAL-04 | — | N/A | shell/grep | Palette token completeness + Sieve literal-color sweep + script-hash | ✅ | ✅ green |
| 01-01-T2 | 01-01 | 1 | PAL-01, PAL-03 | — | N/A | shell/grep | All-page link-order + body-hash + site.css derivation sweep | ✅ | ✅ green |
| 01-01-T3 | 01-01 | 1 | PAL-01–04 (sign-off) | — | N/A | human-check | N/A — subjective visual-identity approval | ✅ | ✅ green (auto-approved, see SUMMARY) |
| 01-02-T1 | 01-02 | 2 | PAL-01, PAL-02 | — | N/A | shell/grep | Chrome token removal sweep + script-hash | ✅ | ✅ green |
| 01-02-T2 | 01-02 | 2 | PAL-01, PAL-04 | — | N/A | shell/grep | Role-color/gradient token sweep + JS-gradient-ref check + script-hash | ✅ | ✅ green |
| 01-02-T3 | 01-02 | 2 | PAL-01, PAL-03 | — | N/A | shell/grep | Fairy-light class migration sweep + literal-color sweep | ✅ | ✅ green |
| 01-03-T1 | 01-03 | 2 | PAL-01, PAL-03 | — | N/A | shell/grep | Local-token removal + theme-blind black-wash sweep | ✅ | ✅ green |
| 01-03-T2 | 01-03 | 2 | PAL-01, PAL-04 | — | N/A | shell/grep | Actor role-token mapping sweep + literal-color sweep + script-hash | ✅ | ✅ green |
| 01-04-T1 | 01-04 | 2 | PAL-01, PAL-03 | — | N/A | shell/grep | Old/new token sweep + literal-color sweep + script-hash | ✅ | ✅ green |
| 01-04-T2 | 01-04 | 2 | PAL-01, PAL-04 | — | N/A | shell/grep | Old/new token sweep + literal-color sweep + script-hash | ✅ | ✅ green |
| 01-04-T3 | 01-04 | 2 | PAL-01 | — | N/A | shell/grep | Local-token/root-block removal + literal-color sweep + markup-hash | ✅ | ✅ green |
| 01-05-T1 | 01-05 | 3 | PAL-01–04 | — | N/A | shell/grep | Repo-wide literal-color, link-order, unexpected-local-declaration, JS-anchor sweep across 7 files | ✅ | ✅ green (zero findings) |
| 01-05-T2 | 01-05 | 3 | PAL-02, PAL-04 (documentation) | — | N/A | shell/grep | CLAUDE.md convention text presence + role-token comment presence + palette-token-intact check | ✅ | ✅ green |
| 01-05-T3 | 01-05 | 3 | PAL-01–04 (final sign-off) | — | N/A | human-check | N/A — rendered-appearance and pedagogical-legibility judgment | ✅ | ✅ green (auto-approved, see SUMMARY) |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — every task shipped its own automated `<verify>` block; no separate test-framework bootstrap was needed or appropriate for a build-free static-HTML repo.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Rendered color correctness in both themes on all six pages, each tool exercised | PAL-01, PAL-03, PAL-04 | Grep can assert token *names* are used, not what they *render as* — genuine rendered-appearance and pedagogical-legibility judgment (e.g. "does Eve read as hostile", "is the answer visually the answer") requires a human or a browser screenshot review | Open each page (`file://` — no server needed), toggle day/night, exercise the tool (run sieve, generate tree, step a factorization, select a residue class, generate RSA keys + run Eve's attack), confirm no element is stuck in the other theme's colors and the seven role meanings read consistently. See 01-01 Task 3 and 01-05 Task 3 `<how-to-verify>` for the full checklist. |

Both manual-only checkpoints were exercised: 01-01's executor and 01-05's executor each performed this walkthrough themselves via headless-Chrome screenshots (documented in their SUMMARY.md files) and auto-approved per this run's auto-mode instructions, since neither carried an explicit `gate="blocking-human"` attribute.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (only the 2 checkpoint tasks are human-check-only, and neither is adjacent to the other)
- [x] Wave 0 covers all MISSING references (none — no Wave 0 needed)
- [x] No watch-mode flags (no test runner exists)
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-09-24
