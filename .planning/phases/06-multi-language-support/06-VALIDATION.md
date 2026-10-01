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
| 06-01 T1 (tracer) | I18N-01, I18N-02, I18N-06 | `node --check` on new files; `C --smoke` | ⬜ pending |
| 06-01 T2 (decision) | I18N-04 | — (checkpoint:decision) | ⬜ pending |
| 06-01 T3 | I18N-04, I18N-02 | `C --api`; `C --persistence`; `C --smoke` | ⬜ pending |
| 06-02 T1 | I18N-01, I18N-03, I18N-06 | `C --coverage --header --includes --no-locale-number-format --literals-markup "<Sieve>"`; `C --api && C --smoke` | ⬜ pending |
| 06-02 T2 | I18N-02, I18N-03, I18N-05 | `C "<Sieve>"`; `B "<Sieve>"`; `B "<Sieve>" --mutant <4 kinds>` | ⬜ pending |
| 06-02 T3 | I18N-01 (convention gate) | `node .planning/phases/07-shared-js-module-refactor/harness.js`; `S --all` | ⬜ pending |
| 06-03 T1-T3 | I18N-01/02/03/05/06 | `C "<page>"`; `S "<page>"` (tools); `B "<page>"` — index, Factor Tree, Euler's Totient | ⬜ pending |
| 06-04 T1-T2 | I18N-01/02/03/05/06 | same trio — Cayley Table, Equivalence Wheel | ⬜ pending |
| 06-05 T1-T2 | I18N-01/02/03/05/06 | same trio — Group Isomorphism, Fermat's Method | ⬜ pending |
| 06-06 T1-T2 | I18N-01/02/03/05/06 | same trio — Chinese Remainder Theorem, Euclidean Algorithm | ⬜ pending |
| 06-07 T1-T2 | I18N-01/02/03/05/06 | same trio — Square and Multiply, Shor's Algorithm | ⬜ pending |
| 06-08 T1 / T2 | I18N-01/03 / I18N-02/03/05/06 | T1: `C --coverage --header --includes --no-locale-number-format --literals-markup`, `S`; T2: trio — Venn Diagram | ⬜ pending |
| 06-09 T1 / T2 | as 06-08 | as 06-08 — Diffie-Hellman Key Exchange | ⬜ pending |
| 06-10 T1 / T2 | as 06-08 | as 06-08 — Elliptic Curve Diffie-Hellman | ⬜ pending |
| 06-11 T1 / T2 / T3 | I18N-01/03 / I18N-03/05 / I18N-02/03/05/06 | T1: static subset + `S`; T2: static subset + `B --mode en-parity`; T3: trio — RSA | ⬜ pending |
| 06-12 T1 / T2 | docs | `grep -c` doc checks; `S --docs` | ⬜ pending |
| 06-12 T3 | all | `C --all`, `C --api`, `C --persistence`, `C --smoke`, `B` on all 16 pages, harness, `S --all`, `S --docs` | ⬜ pending |

Sampling continuity: every task has an automated command except 06-01 T2 (a decision checkpoint between two automated tasks).

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.planning/phases/06-multi-language-support/i18n-check.js` — smoke (06-01 T1), API unit and persistence (06-01 T3), coverage/literals/header/switcher/includes/locale-number-format (06-02 T1)
- [ ] `.planning/phases/06-multi-language-support/i18n-browser.js` — en-parity, langs, switch, layout + mutant self-tests (06-02 T2)
- [ ] Authoritative per-page string extraction — realized as the `--literals` static scan (markup + JS) plus the `langs` render diff, run per page by each wave-3 plan rather than as a separate up-front inventory; wave sizing used a heuristic count recorded in the planning notes

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Translation quality and math terminology | I18N-03 | Correctness of nl/de/fr/es wording can't be checked by a script | Review the glossary and sample pages in each language; human-verify checkpoint |
| Cross-tab language sync | I18N-04 | Needs two real browser tabs | Open two pages, switch language in one, confirm the other follows |
| Switcher layout beside theme toggle at phone width | I18N-01 | Visual | Check header at ~375px in day and night themes |
| Firefox file:// carry via the cookie channel | I18N-04 | Firefox's per-file origins; headless runs use Chrome | Open pages from disk in Firefox, choose a language, navigate and reopen |
| Equivalence Wheel exports, Venn drag/double-click/hover, RSA scratchpad scroll reveal | I18N-02 | Phase 7 recorded these as headless-unsafe | Exercise them in a non-English language (06-04, 06-08, 06-11 human checks) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
