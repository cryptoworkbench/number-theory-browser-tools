---
phase: "6"
slug: "multi-language-support"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-10-01"
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None in project — dev-only Node.js script (Phase 7 precedent: `harness.js`, `browser-diff.js`) |
| **Config file** | none — Wave 0 writes `.planning/phases/06-multi-language-support/i18n-check.js` |
| **Quick run command** | `node .planning/phases/06-multi-language-support/i18n-check.js "<tool file>"` |
| **Full suite command** | `node .planning/phases/06-multi-language-support/i18n-check.js --all` |
| **Estimated runtime** | ~5 seconds (static); browser differential per tool ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run the quick command (`--coverage` + `--no-locale-number-format`) on the page just changed
- **After every plan wave:** Run `i18n-check.js --all`, plus a manual click-through of 1–2 sampled pages in all 5 languages
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

Filled in by the planner per task; each requirement maps to these automated commands:

| Requirement | Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|----------|-----------|-------------------|-------------|--------|
| I18N-01 | Switcher present in shared header on all 16 pages | static | `node i18n-check.js --switcher-present --all` | ❌ W0 | ⬜ pending |
| I18N-02 | `t()` / `setLang()` / static-DOM apply + re-render event | unit (Node `vm`) | `node i18n-check.js --api` | ❌ W0 | ⬜ pending |
| I18N-03 | 5 dictionaries have identical key sets; no undefined key referenced | static | `node i18n-check.js --coverage --all` | ❌ W0 | ⬜ pending |
| I18N-04 | Persistence via URL param / cookie / localStorage; `?lang=` allow-listed | unit (Node `vm`) | `node i18n-check.js --persistence` | ❌ W0 | ⬜ pending |
| I18N-05 | No functional/theming regression after language switch | headless differential | `node .planning/phases/07-shared-js-module-refactor/browser-diff.js "<tool file>"` | ✅ (needs lang step) | ⬜ pending |
| I18N-06 | `<html lang>` updates; no locale number formatting of math output | static + DOM | `node i18n-check.js --no-locale-number-format --all` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.planning/phases/06-multi-language-support/i18n-check.js` — switcher-presence, API unit, key-coverage, persistence, locale-number-format checks
- [ ] Authoritative per-page string extraction (replaces the research's heuristic count) before page-translation waves are sized

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Translation quality and math terminology | I18N-03 | Correctness of nl/de/fr/es wording can't be checked by a script | Review the glossary and sample pages in each language; human-verify checkpoint |
| Cross-tab language sync | I18N-04 | Needs two real browser tabs | Open two pages, switch language in one, confirm the other follows |
| Switcher layout beside theme toggle at phone width | I18N-01 | Visual | Check header at ~375px in day and night themes |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
