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
| **Quick run command** | `node .planning/phases/07-shared-js-module-refactor/harness.js <check...>` plus `node .planning/phases/07-shared-js-module-refactor/shadow-check.js "<tool file>"` plus `node .planning/phases/07-shared-js-module-refactor/browser-diff.js "<tool file>"` |
| **Full suite command** | `node .planning/phases/07-shared-js-module-refactor/harness.js && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs`, then `browser-diff.js` for all 15 tool pages and `index.html` (loop in 07-09 Task 1) |
| **Estimated runtime** | harness + shadow-check ~10-20 seconds; browser-diff ~10-40 seconds per page (headless Chrome, virtual time) |

**Verification tools (dev-only, under the phase directory, never referenced by any page):**

- `harness.js` + `checks/{core,bigint,svg,store,layout}.check.js` — Node parity harness: every shared export vs every pre-phase per-tool copy, old bodies read from BASE via `git show` (BASE = parent of the commit that first added `assets/nt-core.js`).
- `shadow-check.js` — static gate: local shadows, retired aliases, import/include hygiene, external-script set, namespace mutation, stale comments; `--all` adds the cross-tool duplicate scan; `--docs` audits the current docs and the `.claude/CLAUDE.md` mirror.
- `browser-diff.js` + `browser-diff/<tool>.json` — headless-Chrome differential: the BASE page and the working-tree page driven through the same scripted interactions under a seeded `Math.random`; snapshots of body HTML, title, localStorage and cookie must be identical and the new page must log zero errors. `--stability` (BASE vs BASE) and `--mutant` (injected change must be detected) prove the oracle is deterministic and live.

**Success-criteria labels used in the Requirement column (Phase 7 has no REQ-IDs):** SC-1 every tool loads its shared modules (classic, non-deferred, file://-safe); SC-2 no local copies of extracted helpers (incl. renamed near-duplicates and Venn's ported subsystems); SC-3 drifted variants reconciled with parity proven; SC-4 zero behavior regressions verified per tool in a browser; SC-5 current docs present shared modules as the normal architecture and stale in-code comments are gone; SC-6 local code review clean.

---

## Sampling Rate

- **After every task commit:** Run the quick harness for the helpers the migrated tool uses, plus `shadow-check.js <tool file>` and `browser-diff.js <tool file>` (after a BASE `--stability` pass on the tool's config)
- **After every plan wave:** Run the full suite command across all migrated tools
- **Before `/gsd-verify-work`:** Full suite must be green AND the per-tool browser checklist (07-RESEARCH.md §Validation Architecture) passed for all 15 tools
- **Max feedback latency:** 10 seconds (automated); browser pass is per-tool manual

---

## Per-Task Verification Map

*Filled in by the planner once task IDs exist. Every tool-migration task must map to: harness (helpers it consumes) + shadow-check (its file) + browser checklist steps 1–3 (plus 4–6 where applicable).*

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | SC-1, SC-3, SC-4 | T-07-01, T-07-02, T-07-03 | NT.core frozen; nt-core.js included non-deferred before the inline script | tracer: parity harness + headless differential (CRT) | `harness.js core`; `browser-diff.js "Chinese Remainder Theorem/chinese-remainder-theorem.html"` | ❌ W0 (created by this task) | ⬜ pending |
| 7-01-02 | 01 | 1 | SC-2, SC-4 | T-07-01, T-07-02, T-07-04 | NS-MUTATION / INCLUDE-* gates; oracle proven deterministic and live | static gate + oracle vacuity | `shadow-check.js "Chinese Remainder Theorem/chinese-remainder-theorem.html"`; `browser-diff.js … --stability`; `browser-diff.js … --mutant` | ❌ W0 (created by this task) | ⬜ pending |
| 7-01-03 | 01 | 1 | SC-1, SC-2, SC-3, SC-4 | T-07-03 | isPrime integer guard; primeFactors cap parameter | unit (TDD) + static + differential (Totient) | `harness.js core`; `shadow-check.js` (Totient, CRT); `browser-diff.js "Eulers Totient/eulers-totient.html"` | ✅ after 7-01-01/02 | ⬜ pending |
| 7-02-01 | 02 | 2 | SC-1, SC-2, SC-3, SC-4 | T-07-05, T-07-06 | centre-explicit geometry | unit (TDD) + static + differential (Fermat's) | `harness.js core svg`; `shadow-check.js "Fermats Method/fermats-method.html"`; `browser-diff.js "Fermats Method/fermats-method.html"` | ✅ | ⬜ pending |
| 7-02-02 | 02 | 2 | SC-1, SC-2, SC-3, SC-4 | T-07-06 | retired aliases gone | static + differential (Shor's) | `shadow-check.js "Shors Algorithm/shors-algorithm.html"`; `browser-diff.js "Shors Algorithm/shors-algorithm.html"` | ✅ | ⬜ pending |
| 7-02-03 | 02 | 2 | SC-1, SC-2, SC-3, SC-4, SC-5 | T-07-07 | invalid-prime inputs render the same errors | static + differential (ECDH) | `shadow-check.js "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html"`; `browser-diff.js` (same) | ✅ | ⬜ pending |
| 7-03-01 | 03 | 2 | SC-1, SC-2, SC-3, SC-4 | T-07-10 | seeded-random parity for BigInt randomness | unit (TDD) + static + differential (RSA) | `harness.js bigint`; `shadow-check.js RSA/rsa.html`; `browser-diff.js RSA/rsa.html` | ✅ | ⬜ pending |
| 7-03-02 | 03 | 2 | SC-1, SC-2, SC-3, SC-4 | T-07-08, T-07-09 | persisted keys/payloads unchanged; hostile cookie/localStorage/URL input rejected identically | unit (TDD) + static + differential (Cayley) | `harness.js store`; `shadow-check.js "Cayley Table/cayley-table.html"`; `browser-diff.js "Cayley Table/cayley-table.html"` | ✅ | ⬜ pending |
| 7-04-01 | 04 | 3 | SC-1, SC-2, SC-4 | T-07-11 | BigInt input validation text identical | static + differential (DH) | `shadow-check.js` + `browser-diff.js "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"` | ✅ | ⬜ pending |
| 7-04-02 | 04 | 3 | SC-1, SC-2, SC-4 | T-07-11, T-07-12 | large-exponent path unchanged | static + differential (S&M) | `shadow-check.js` + `browser-diff.js "Square And Multiply/square-and-multiply.html"` | ✅ | ⬜ pending |
| 7-05-01 | 05 | 3 | SC-1, SC-2, SC-3, SC-4 | T-07-13, T-07-14 | shared group setting via NT.store; synchronous first render works | static + differential (Equivalence Wheel) | `shadow-check.js` + `browser-diff.js "Equivalence Wheel/equivalence-wheel.html"` | ✅ | ⬜ pending |
| 7-05-02 | 05 | 3 | SC-1, SC-2, SC-3, SC-4, SC-5 | T-07-14 | synchronous first render works | static + differential (Group Isomorphism) | `shadow-check.js` + `browser-diff.js "Group Isomorphism/group-isomorphism.html"` | ✅ | ⬜ pending |
| 7-06-01 | 06 | 3 | SC-3 | T-07-15 | tree iteration cap and balanced ceiling preserved | unit (TDD) | `harness.js layout` | ✅ | ⬜ pending |
| 7-06-02 | 06 | 3 | SC-1, SC-2, SC-4 | T-07-16 | EA rejects ?a=0&b=0 exactly as before | static + differential (EA) | `shadow-check.js` + `browser-diff.js "Euclidean Algorithm/euclidean-algorithm.html"` | ✅ | ⬜ pending |
| 7-06-03 | 06 | 3 | SC-1, SC-2, SC-3, SC-4 | T-07-15 | over-limit ?n and inputs rejected identically | static + differential (Factor Tree) | `shadow-check.js` + `browser-diff.js "Factor Tree/factor-tree.html"` | ✅ | ⬜ pending |
| 7-07-01 | 07 | 4 | SC-1, SC-4 | T-07-17, T-07-18 | FACTOR_LIMIT kept on URL-supplied values; legacy keys migrate identically | differential (Venn, BASE --stability first) | `browser-diff.js "Venn Diagram/venn-diagram.html" --stability`; `browser-diff.js "Venn Diagram/venn-diagram.html"` | ✅ | ⬜ pending |
| 7-07-02 | 07 | 4 | SC-2, SC-3, SC-4, SC-5 | T-07-17 | previews drawn by NT.layout | static + differential (Venn) | `shadow-check.js "Venn Diagram/venn-diagram.html"`; `browser-diff.js "Venn Diagram/venn-diagram.html"` | ✅ | ⬜ pending |
| 7-08-01 | 08 | 4 | SC-5 | T-07-19, T-07-20 | docs state the non-deferred include rule | doc audit (scoped) + positive greps | `shadow-check.js --docs --report` filtered to CLAUDE.md / PROJECT.md / project mirror | ✅ | ⬜ pending |
| 7-08-02 | 08 | 4 | SC-5 | T-07-20 | mirror in sync with sources | doc audit (scoped) + positive greps | `shadow-check.js --docs --report` filtered to ARCHITECTURE / CONVENTIONS / STACK / all mirrors | ✅ | ⬜ pending |
| 7-08-03 | 08 | 4 | SC-5 | T-07-20 | — | doc audit (full) | `shadow-check.js --docs` | ✅ | ⬜ pending |
| 7-09-01 | 09 | 5 | SC-1, SC-2, SC-4 | — | — | full suite | `harness.js && shadow-check.js --all && shadow-check.js --docs`; browser-diff loop over 15 tools + index.html | ✅ | ⬜ pending |
| 7-09-02 | 09 | 5 | SC-4 | T-07-22 | only repo file:// pages opened | real-browser pass (Claude-in-Chrome) + human-check fallback | `browser-diff.js "Venn Diagram/venn-diagram.html"` re-check after fixes | ✅ | ⬜ pending |
| 7-09-03 | 09 | 5 | SC-6 | T-07-21 | every review fix re-verified | local code review + full re-sweep | `harness.js && shadow-check.js --all && shadow-check.js --docs` | ✅ | ⬜ pending |

All commands run from the repo root; `harness.js`, `shadow-check.js`, `browser-diff.js` abbreviate `node .planning/phases/07-shared-js-module-refactor/<name>`.

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.planning/phases/07-shared-js-module-refactor/harness.js` — extracts each helper's pre-migration body from the pre-phase commit's HTML (via `git show <base>:<file>`), loads the new `assets/*.js` module into a `vm` context with a stub `window`, and deep-compares outputs over the ranges in 07-RESEARCH.md §Wave 0 Gaps (gcd over [-50,50]², isPrime 0..10000, BigInt RSA-scale triples, euclidSteps subset parity, etc.)
- [ ] `.planning/phases/07-shared-js-module-refactor/shadow-check.js` (Node, replaces the originally sketched shadow-check.sh) — asserts zero remaining local declarations of any now-shared helper name in the given file(s), plus import/include hygiene, retired aliases, stale comments; `--all` cross-tool duplicate scan; `--docs` doc audit (plan 07-01 Task 2)
- [ ] `.planning/phases/07-shared-js-module-refactor/browser-diff.js` — headless-Chrome BASE-vs-working-tree differential with `--stability`, `--mutant`, `--assets` modes (plan 07-01 Tasks 1-2)
- [ ] Per-tool browser checklist — reuse 07-RESEARCH.md §"Per-tool browser verification checklist" verbatim (headless differential per migration task; Claude-in-Chrome pass in plan 07-09 Task 2)

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
