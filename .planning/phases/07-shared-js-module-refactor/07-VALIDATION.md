---
phase: "7"
slug: "shared-js-module-refactor"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: validated
nyquist_compliant: true
wave_0_complete: true
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
| 7-01-01 | 01 | 1 | SC-1, SC-3, SC-4 | T-07-01, T-07-02, T-07-03 | NT.core frozen; nt-core.js included non-deferred before the inline script | tracer: parity harness + headless differential (CRT) | `harness.js core`; `browser-diff.js "Chinese Remainder Theorem/chinese-remainder-theorem.html"` | ✅ | ✅ |
| 7-01-02 | 01 | 1 | SC-2, SC-4 | T-07-01, T-07-02, T-07-04 | NS-MUTATION / INCLUDE-* gates; oracle proven deterministic and live | static gate + oracle vacuity | `shadow-check.js "Chinese Remainder Theorem/chinese-remainder-theorem.html"`; `browser-diff.js … --stability`; `browser-diff.js … --mutant` | ✅ | ✅ |
| 7-01-03 | 01 | 1 | SC-1, SC-2, SC-3, SC-4 | T-07-03 | isPrime integer guard; primeFactors cap parameter | unit (TDD) + static + differential (Totient) | `harness.js core`; `shadow-check.js` (Totient, CRT); `browser-diff.js "Eulers Totient/eulers-totient.html"` | ✅ | ✅ |
| 7-02-01 | 02 | 2 | SC-1, SC-2, SC-3, SC-4 | T-07-05, T-07-06 | centre-explicit geometry | unit (TDD) + static + differential (Fermat's) | `harness.js core svg`; `shadow-check.js "Fermats Method/fermats-method.html"`; `browser-diff.js "Fermats Method/fermats-method.html"` | ✅ | ✅ |
| 7-02-02 | 02 | 2 | SC-1, SC-2, SC-3, SC-4 | T-07-06 | retired aliases gone | static + differential (Shor's) | `shadow-check.js "Shors Algorithm/shors-algorithm.html"`; `browser-diff.js "Shors Algorithm/shors-algorithm.html"` | ✅ | ✅ |
| 7-02-03 | 02 | 2 | SC-1, SC-2, SC-3, SC-4, SC-5 | T-07-07 | invalid-prime inputs render the same errors | static + differential (ECDH) | `shadow-check.js "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html"`; `browser-diff.js` (same) | ✅ | ✅ |
| 7-03-01 | 03 | 2 | SC-1, SC-2, SC-3, SC-4 | T-07-10 | seeded-random parity for BigInt randomness | unit (TDD) + static + differential (RSA) | `harness.js bigint`; `shadow-check.js RSA/rsa.html`; `browser-diff.js RSA/rsa.html` | ✅ | ✅ |
| 7-03-02 | 03 | 2 | SC-1, SC-2, SC-3, SC-4 | T-07-08, T-07-09 | persisted keys/payloads unchanged; hostile cookie/localStorage/URL input rejected identically | unit (TDD) + static + differential (Cayley) | `harness.js store`; `shadow-check.js "Cayley Table/cayley-table.html"`; `browser-diff.js "Cayley Table/cayley-table.html"` | ✅ | ✅ |
| 7-04-01 | 04 | 3 | SC-1, SC-2, SC-4 | T-07-11 | BigInt input validation text identical | static + differential (DH) | `shadow-check.js` + `browser-diff.js "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"` | ✅ | ✅ |
| 7-04-02 | 04 | 3 | SC-1, SC-2, SC-4 | T-07-11, T-07-12 | large-exponent path unchanged | static + differential (S&M) | `shadow-check.js` + `browser-diff.js "Square And Multiply/square-and-multiply.html"` | ✅ | ✅ |
| 7-05-01 | 05 | 3 | SC-1, SC-2, SC-3, SC-4 | T-07-13, T-07-14 | shared group setting via NT.store; synchronous first render works | static + differential (Equivalence Wheel) | `shadow-check.js` + `browser-diff.js "Equivalence Wheel/equivalence-wheel.html"` | ✅ | ✅ |
| 7-05-02 | 05 | 3 | SC-1, SC-2, SC-3, SC-4, SC-5 | T-07-14 | synchronous first render works | static + differential (Group Isomorphism) | `shadow-check.js` + `browser-diff.js "Group Isomorphism/group-isomorphism.html"` | ✅ | ✅ |
| 7-06-01 | 06 | 3 | SC-3 | T-07-15 | tree iteration cap and balanced ceiling preserved | unit (TDD) | `harness.js layout` | ✅ | ✅ |
| 7-06-02 | 06 | 3 | SC-1, SC-2, SC-4 | T-07-16 | EA rejects ?a=0&b=0 exactly as before | static + differential (EA) | `shadow-check.js` + `browser-diff.js "Euclidean Algorithm/euclidean-algorithm.html"` | ✅ | ✅ |
| 7-06-03 | 06 | 3 | SC-1, SC-2, SC-3, SC-4 | T-07-15 | over-limit ?n and inputs rejected identically | static + differential (Factor Tree) | `shadow-check.js` + `browser-diff.js "Factor Tree/factor-tree.html"` | ✅ | ✅ |
| 7-07-01 | 07 | 4 | SC-1, SC-4 | T-07-17, T-07-18 | FACTOR_LIMIT kept on URL-supplied values; legacy keys migrate identically | differential (Venn, BASE --stability first) | `browser-diff.js "Venn Diagram/venn-diagram.html" --stability`; `browser-diff.js "Venn Diagram/venn-diagram.html"` | ✅ | ✅ |
| 7-07-02 | 07 | 4 | SC-2, SC-3, SC-4, SC-5 | T-07-17 | previews drawn by NT.layout | static + differential (Venn) | `shadow-check.js "Venn Diagram/venn-diagram.html"`; `browser-diff.js "Venn Diagram/venn-diagram.html"` | ✅ | ✅ |
| 7-08-01 | 08 | 4 | SC-5 | T-07-19, T-07-20 | docs state the non-deferred include rule | doc audit (scoped) + positive greps | `shadow-check.js --docs --report` filtered to CLAUDE.md / PROJECT.md / project mirror | ✅ | ✅ |
| 7-08-02 | 08 | 4 | SC-5 | T-07-20 | mirror in sync with sources | doc audit (scoped) + positive greps | `shadow-check.js --docs --report` filtered to ARCHITECTURE / CONVENTIONS / STACK / all mirrors | ✅ | ✅ |
| 7-08-03 | 08 | 4 | SC-5 | T-07-20 | — | doc audit (full) | `shadow-check.js --docs` | ✅ | ✅ |
| 7-09-01 | 09 | 5 | SC-1, SC-2, SC-4 | — | — | full suite | `harness.js && shadow-check.js --all && shadow-check.js --docs`; browser-diff loop over 15 tools + index.html | ✅ | ✅ |
| 7-09-02 | 09 | 5 | SC-4 | T-07-22 | only repo file:// pages opened | real-browser pass (Claude-in-Chrome unavailable this session; headless fallback per plan's explicit instruction) + human-check | `browser-diff.js "Venn Diagram/venn-diagram.html"` re-check after fixes (IDENTICAL, no fixes needed) | ✅ | ✅ (headless portion; human-check items deferred, see Manual-Only Verifications) |
| 7-09-03 | 09 | 5 | SC-6 | T-07-21 | every review fix re-verified | local code review + full re-sweep | `harness.js && shadow-check.js --all && shadow-check.js --docs` | ✅ | ✅ (code-review skill, effort high, BASE..HEAD: zero findings, no fixes needed) |
| 7-UAT-01 | UAT fix | — | SC-1 | — | each `NT.<name>` slot non-writable/non-configurable; `NT` stays extensible (review WR-01, edfc402) | unit (vm, strict + sloppy) | `harness.js namespace` | ✅ | ✅ (88 assertions; fails when the lock lines are removed) |
| 7-UAT-02 | UAT fix | — | SC-3, SC-4 | T-07-08 | storage-event handlers parse `e.newValue` instead of a cookie-first re-read (d0a4092) | unit | `harness.js store` | ✅ | ✅ (8 event-path assertions) |

All commands run from the repo root; `harness.js`, `shadow-check.js`, `browser-diff.js` abbreviate `node .planning/phases/07-shared-js-module-refactor/<name>`.

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `.planning/phases/07-shared-js-module-refactor/harness.js` — extracts each helper's pre-migration body from the pre-phase commit's HTML (via `git show <base>:<file>`), loads the new `assets/*.js` module into a `vm` context with a stub `window`, and deep-compares outputs over the ranges in 07-RESEARCH.md §Wave 0 Gaps (gcd over [-50,50]², isPrime 0..10000, BigInt RSA-scale triples, euclidSteps subset parity, etc.)
- [x] `.planning/phases/07-shared-js-module-refactor/shadow-check.js` (Node, replaces the originally sketched shadow-check.sh) — asserts zero remaining local declarations of any now-shared helper name in the given file(s), plus import/include hygiene, retired aliases, stale comments; `--all` cross-tool duplicate scan; `--docs` doc audit (plan 07-01 Task 2)
- [x] `.planning/phases/07-shared-js-module-refactor/browser-diff.js` — headless-Chrome BASE-vs-working-tree differential with `--stability`, `--mutant`, `--assets` modes (plan 07-01 Tasks 1-2)
- [x] Per-tool browser checklist — reuse 07-RESEARCH.md §"Per-tool browser verification checklist" verbatim (headless differential per migration task; Claude-in-Chrome pass in plan 07-09 Task 2)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | Outcome (07-09 Task 2) |
|----------|-------------|------------|-------------------|--------------------------|
| Tool loads with no console error over `file://` | SC-1, SC-2 | No DOM test framework; load-order bugs (`window.NT` undefined) only surface in a real page | Open tool via `file://`, check console for `ReferenceError` / `NT` errors | Verified headlessly instead: browser-diff's NEW-run error capture (`window.onerror`/`unhandledrejection`/`console.error` hooks) reported `errors=0` for all 16 pages in the 07-09 Task 1 sweep. Claude-in-Chrome was unavailable in this execution context (no `mcp__claude-in-chrome__*` tools in the executor's toolset), so the literal real-Chrome-DevTools-console read was not performed; the headless error capture is equivalent evidence for JS exceptions. |
| Preset chips + on-load example render identically to pre-migration | SC-2 | Visual SVG output | Click every chip; compare against pre-phase commit rendering | Verified headlessly: every tool's authored `browser-diff/<slug>.json` clicks its preset chips / example controls (or the default `.chip`/`.mode-btn` selectors) and diffs the resulting body HTML byte-for-byte against BASE — all 16 IDENTICAL in the Task 1 sweep. Not verified with human eyes in a real rendered browser (no screenshot/visual diff was taken); the HTML-identical proof is a strictly stronger structural check but does not catch a purely CSS/rendering-only regression outside the DOM (none expected — no CSS was touched this phase). |
| Playback controls (play/pause/step/finish) | SC-2 | Timing/animation behavior | Exercise once per tool that has them | Verified headlessly for all 10 playback tools (Euclidean Algorithm, Euler's Totient, Sieve, Fermat's Method, Square and Multiply, RSA, Diffie-Hellman, ECDH, Shor's, CRT) via each tool's own `stepBtn`/`instantBtn`/`playBtn` interaction steps, all IDENTICAL. Sieve's play/pause pair is driven as a single synchronous `js` step (two `.click()` calls with no macrotask between them) specifically to avoid the rAF-timing nondeterminism plan 07-02 diagnosed — confirmed stable across 3 `--stability` runs before use. |
| Cross-tool persistence + deep links round-trip | SC-2 | Multi-tab `storage` events | Two tabs per linked pair; change one, confirm the other updates | Deep-link query-param round-trip (Factor Tree `?n=899`, Group Isomorphism `?m=7`, and Venn's `?a=`/`?b=`/`?mode=` links) is verified headlessly — all IDENTICAL to BASE. The LIVE cross-tab `storage` event propagation itself (Cayley Table ⇄ Equivalence Wheel, Euclidean Algorithm ⇄ Venn Diagram) is NOT verifiable by browser-diff.js, which spins up one isolated Chrome process per run with no second tab sharing the same-origin storage — this remains genuinely manual. Not performed in this session (no Claude-in-Chrome tools available); this migration touched none of the `storage`-event listener code paths (`window.addEventListener('storage', ...)` sites unchanged this phase, confirmed by the shadow-check/harness sweep covering the read/write helpers those listeners call), so the risk this phase introduced a regression here is low, but it is unconfirmed by direct observation. |
| Venn preview subsystems (nested squares, balanced factor tree) match the full tools | SC-2 | Composite render parity | Hover region chip, inspect both sections, follow both double-click links | The hover-triggered render of both preview sections (`hover-overlap-chip`, `hover-overlap-chip-scrolled`, `hover-ab-chip-scrolled`, `hover-abc-centre-chip` steps) is verified headlessly — IDENTICAL. The double-click *navigation* itself (opening Factor Tree / Euclidean Algorithm in a new context) is NOT verified: `dblclick` in the driver dispatches the DOM event but a resulting `window.location`/`window.open` navigation would unload the instrumented page before the snapshot harness can capture output, so this specific interaction is structurally unobservable by this tool. Also not automatable: dragging a placed prime between regions (the driver has no pointer-drag primitive — only click/dblclick/hover/set/key) and the Equivalence Wheel's Export SVG/PNG/Print buttons (explicitly excluded from headless automation per plan 07-05's finding that export/download machinery hangs headless Chrome — not attempted this session, per this run's explicit instruction not to add download-triggering browser-diff steps). All four remain for the user's own real-browser pass. |

**Real-browser outcome (UAT, 2026-10-01 — see 07-UAT.md):** live cross-tab sync (both pairs, both directions), Venn pointer-drag, Venn double-click links to Factor Tree / Euclidean Algorithm, and Equivalence Wheel Export SVG / PNG / Print were exercised in the user's Chrome via Claude in Chrome (served over http://127.0.0.1 because the extension refuses file:// URLs) — all pass, no console errors. Two pre-existing bugs found there were fixed in d0a4092: a cookie-vs-storage-event race that dropped ~1 in 20 rapid sync updates (now 40/40 on each pair; automated by 7-UAT-02), and Venn reporting every opened cross-link tab as blocked (stays manual-only: needs a real popup; re-verified in Chrome, `window.opener === null` in the new tab).

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** All 21 Per-Task rows (7-01-01 through 7-09-03) carry a final ✅ status. Full automated sweep green in one run (harness.js 2,855,890 assertions across 5 checks; shadow-check.js --all 15/15 PASS; shadow-check.js --docs PASS; 16/16 browser-diff IDENTICAL with zero errors; 3/3 --mutant runs MUTANT-DETECTED). Real-browser pass completed via the headless fallback (Claude-in-Chrome unavailable this session) with genuinely manual items (live cross-tab storage sync, Venn pointer-drag, Venn double-click navigation, Equivalence Wheel export buttons) explicitly recorded rather than silently skipped. Local code-review skill (effort high, BASE..HEAD) returned zero findings. Approved — 2026-10-01. The user's own `/code-review ultra` pass is the next step per this phase's stated success criteria (SC-6).

## Validation Audit 2026-10-01

| Metric | Count |
|--------|-------|
| Gaps found | 1 |
| Resolved | 1 |
| Escalated | 0 |

Gap: no automated check for the WR-01 `NT` slot lock (SC-1) — resolved by `checks/namespace.check.js` (e52dbbb), proven non-vacuous by removing the lock lines from assets/ (check fails) and restoring them. Full suite after the audit: `harness.js` PASS total=2,855,986 across 6 checks.
