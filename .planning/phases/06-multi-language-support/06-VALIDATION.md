---
phase: "6"
slug: "multi-language-support"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: validated
nyquist_compliant: true
wave_0_complete: true
created: "2026-10-01"
validated: "2026-10-01"
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

Filled in by the planner per task. Commands run from the repo root; `C` = `node .planning/phases/06-multi-language-support/i18n-check.js`, `B` = `node .planning/phases/06-multi-language-support/i18n-browser.js`, `S` = `node .planning/phases/07-shared-js-module-refactor/shadow-check.js`.

Requirement → gate map (the API was renamed during planning: `t()` is `translate()` because `t` collides with existing locals in all 16 pages; I18N-05 uses the new `i18n-browser.js` instead of Phase 7's `browser-diff.js`, whose OLD-vs-NEW comparison differs by design once i18n attributes and the switcher are added — i18n-browser normalizes exactly those away and compares English against the pre-phase BASE):

| Requirement | Behavior | Test Type | Automated Command | Created in |
|-------------|----------|-----------|-------------------|------------|
| I18N-01 | Switcher present; canonical header on every page | static | `C --switcher-present --all`, `C --header --all` | 06-02 T1 |
| I18N-02 | translate/translateInto/bindText/applyStaticDom/setLang + change event; live re-render keeps state | unit (Node `vm`) + headless | `C --api`, `C --smoke`, `B "<page>" --mode switch` | 06-01 T1/T3, 06-02 T2 |
| I18N-03 | Identical key sets/placeholders/plurals; no undefined key; no visible English left | static + headless | `C --coverage --all`, `C --literals --all`, `B "<page>" --mode langs` | 06-02 T1/T2 |
| I18N-04 | URL param / cookie / localStorage precedence, allow-list, cross-tab, cross-session | unit (Node `vm`) + headless | `C --persistence`, `C --smoke` (cross-session run) | 06-01 T3 |
| I18N-05 | English byte-identical to pre-phase; theming unaffected; no layout overflow | headless differential | `B "<page>" --mode en-parity,langs,layout` | 06-02 T2 |
| I18N-06 | html lang tracks language; no locale number formatting; no prose via innerHTML | static + headless | `C --no-locale-number-format --all`, `C --literals --all` (INNERHTML-PROSE), `B` langs meta.lang | 06-01 T1, 06-02 T1/T2 |

Per-task map:

| Plan-Task | Requirement(s) | Automated Command(s) | Status |
|-----------|----------------|----------------------|--------|
| 06-01 T1 (tracer) | I18N-01, I18N-02, I18N-06 | `node --check` on new files; `C --smoke` | ✅ green |
| 06-01 T2 (decision) | I18N-04 | — (checkpoint:decision, resolved option-a) | ✅ green |
| 06-01 T3 | I18N-04, I18N-02 | `C --api` (122 assertions); `C --persistence` (71 assertions); `C --smoke` (123 assertions) | ✅ green |
| 06-02 T1 | I18N-01, I18N-03, I18N-06 | `C --coverage --header --includes --no-locale-number-format --literals-markup "<Sieve>"` (5/5 PASS); `C --api && C --smoke` | ✅ green |
| 06-02 T2 | I18N-02, I18N-03, I18N-05 | `C "<Sieve>"` (6/6 PASS); `B "<Sieve>"` (ALL PASS); `B "<Sieve>" --mutant <4 kinds>` (4/4 MUTANT-DETECTED) | ✅ green |
| 06-02 T3 | I18N-01 (convention gate) | `node .planning/phases/07-shared-js-module-refactor/harness.js` (PASS total=2856003); `S --all` (15/15 PASS) | ✅ green |
| 06-03 T1-T3 | I18N-01/02/03/05/06 | `C "<page>"`; `S "<page>"` (tools); `B "<page>"` — index, Factor Tree, Euler's Totient, all ALL PASS | ✅ green |
| 06-04 T1-T2 | I18N-01/02/03/05/06 | same trio — Cayley Table, Equivalence Wheel, all ALL PASS | ✅ green |
| 06-05 T1-T2 | I18N-01/02/03/05/06 | same trio — Group Isomorphism, Fermat's Method, all ALL PASS | ✅ green |
| 06-06 T1-T2 | I18N-01/02/03/05/06 | same trio — Chinese Remainder Theorem, Euclidean Algorithm, all ALL PASS | ✅ green |
| 06-07 T1-T2 | I18N-01/02/03/05/06 | same trio — Square and Multiply, Shor's Algorithm, all ALL PASS | ✅ green |
| 06-08 T1 / T2 | I18N-01/03 / I18N-02/03/05/06 | T1: `C --coverage --header --includes --no-locale-number-format --literals-markup`, `S`; T2: trio — Venn Diagram, all ALL PASS | ✅ green |
| 06-09 T1 / T2 | as 06-08 | as 06-08 — Diffie-Hellman Key Exchange, all ALL PASS | ✅ green |
| 06-10 T1 / T2 | as 06-08 | as 06-08 — Elliptic Curve Diffie-Hellman, all ALL PASS | ✅ green |
| 06-11 T1 / T2 / T3 | I18N-01/03 / I18N-03/05 / I18N-02/03/05/06 | T1: static subset + `S`; T2: static subset + `B --mode en-parity`; T3: trio — RSA, all ALL PASS | ✅ green |
| 06-12 T1 / T2 | docs | `grep -c` doc checks; `S --docs` (SHADOW-CHECK PASS --docs) | ✅ green |
| 06-12 T3 | all | `C --all` (6/6 static modes × 16 pages PASS), `C --api`/`--persistence`/`--smoke`, `B` on all 16 pages (16/16 ALL PASS), 4 Sieve mutants (4/4 MUTANT-DETECTED), harness (PASS total=2856003), `S --all` (15/15 PASS), `S --docs` (PASS) | ✅ green |

Sampling continuity: every task has an automated command except 06-01 T2 (a decision checkpoint between two automated tasks).

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `.planning/phases/06-multi-language-support/i18n-check.js` — smoke (06-01 T1), API unit and persistence (06-01 T3), coverage/literals/header/switcher/includes/locale-number-format (06-02 T1)
- [x] `.planning/phases/06-multi-language-support/i18n-browser.js` — en-parity, langs, switch, layout + mutant self-tests (06-02 T2)
- [x] Authoritative per-page string extraction — realized as the `--literals` static scan (markup + JS) plus the `langs` render diff, run per page by each wave-3 plan rather than as a separate up-front inventory; wave sizing used a heuristic count recorded in the planning notes

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Translation quality and math terminology | I18N-03 | Correctness of nl/de/fr/es wording can't be checked by a script | Review the glossary and sample pages in each language; human-verify checkpoint |
| Cross-tab language sync | I18N-04 | Needs two real browser tabs | Open two pages, switch language in one, confirm the other follows |
| Switcher layout beside theme toggle at phone width | I18N-01 | Visual | Check header at ~375px in day and night themes |
| Firefox file:// carry via the cookie channel | I18N-04 | Firefox's per-file origins; headless runs use Chrome | Open pages from disk in Firefox, choose a language, navigate and reopen |
| Equivalence Wheel exports, Venn drag/double-click/hover, RSA scratchpad scroll reveal | I18N-02 | Phase 7 recorded these as headless-unsafe | Exercise them in a non-English language (06-04, 06-08, 06-11 human checks) |

Per `workflow.human_verify_mode=end-of-phase`, none of the five rows above (nor 06-12 Task 3's own `<human-check>`, which repeats and extends the translation-quality/cross-tab/Firefox-file:///phone-width checks across the whole site) were exercised by an executor — they are harvested into the end-of-phase `06-UAT.md` by `/gsd-verify-work`.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated — 06-12 Task 3's consolidated sweep (`i18n-check.js --all/--api/--persistence/--smoke`, `i18n-browser.js` on all 16 pages plus 4 Sieve mutants, Phase 7's `harness.js` and `shadow-check.js --all/--docs`) is green in one run; every per-task row above is ✅ green; the five manual-only rows plus 06-12 T3's own `<human-check>` are deferred to end-of-phase UAT by design.

---

## Validation Audit 2026-10-01
| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

Re-ran after UAT: `i18n-check.js --all` (all static modes × 16 pages PASS), `--api` (122), `--persistence` (71), `--smoke` (123, mutant detected, cross-session OK), `shadow-check.js --all` (PASS). The five manual-only rows passed in `06-UAT.md` (5/5).
