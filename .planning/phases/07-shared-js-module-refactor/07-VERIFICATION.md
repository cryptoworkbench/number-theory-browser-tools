---
phase: 07-shared-js-module-refactor
verified: 2026-10-01T00:00:00Z
status: human_needed
score: 5/6 must-haves verified
covered_files:
  - ".claude/CLAUDE.md"
  - ".planning/phases/07-shared-js-module-refactor/07-01-PLAN.md"
  - ".planning/phases/07-shared-js-module-refactor/07-01-SUMMARY.md"
  - ".planning/phases/07-shared-js-module-refactor/07-02-PLAN.md"
  - ".planning/phases/07-shared-js-module-refactor/07-02-SUMMARY.md"
  - ".planning/phases/07-shared-js-module-refactor/07-03-PLAN.md"
  - ".planning/phases/07-shared-js-module-refactor/07-03-SUMMARY.md"
  - ".planning/phases/07-shared-js-module-refactor/07-04-PLAN.md"
  - ".planning/phases/07-shared-js-module-refactor/07-04-SUMMARY.md"
  - ".planning/phases/07-shared-js-module-refactor/07-05-PLAN.md"
  - ".planning/phases/07-shared-js-module-refactor/07-05-SUMMARY.md"
  - ".planning/phases/07-shared-js-module-refactor/07-06-PLAN.md"
  - ".planning/phases/07-shared-js-module-refactor/07-06-SUMMARY.md"
  - ".planning/phases/07-shared-js-module-refactor/07-07-PLAN.md"
  - ".planning/phases/07-shared-js-module-refactor/07-07-SUMMARY.md"
  - ".planning/phases/07-shared-js-module-refactor/07-08-PLAN.md"
  - ".planning/phases/07-shared-js-module-refactor/07-08-SUMMARY.md"
  - ".planning/phases/07-shared-js-module-refactor/07-09-PLAN.md"
  - ".planning/phases/07-shared-js-module-refactor/07-09-SUMMARY.md"
  - ".planning/phases/07-shared-js-module-refactor/07-PATTERNS.md"
  - ".planning/phases/07-shared-js-module-refactor/07-RESEARCH.md"
  - ".planning/phases/07-shared-js-module-refactor/07-REVIEW-DISPOSITION.md"
  - ".planning/phases/07-shared-js-module-refactor/07-REVIEW.md"
  - ".planning/phases/07-shared-js-module-refactor/07-VALIDATION.md"
  - "CLAUDE.md"
  - "assets/nt-bigint.js"
  - "assets/nt-core.js"
  - "assets/nt-layout.js"
  - "assets/nt-store.js"
  - "assets/nt-svg.js"
covered_digest: "v2:sha256:ba6edef08de0b9425a463a5d700da4145d7b860ba4b1e4eb9f91e9b59ee71cfa"
behavior_unverified: 1
overrides_applied: 0
behavior_unverified_items:
  - truth: "SC-4 (zero behavior regressions, verified per tool in a browser) — ROADMAP wording requires a real-browser verification, not only a headless differential"
    test: "Open each of the 15 tools + index.html over file:// in a real Chrome session (or via Claude-in-Chrome/claude-in-chrome tools), read the console for zero errors, and exercise presets/reload/playback per 07-RESEARCH.md's per-tool checklist"
    expected: "Same behavior as the headless browser-diff already proved structurally (16/16 IDENTICAL, errors=0) — no CSS/rendering-only regression outside the DOM, which the HTML-diff cannot see"
    why_human: "The 07-09 executor had no Claude-in-Chrome tools available and fell back to headless coverage; this was recorded honestly in 07-VALIDATION.md but the literal real-browser observation was never made in this phase"
human_verification:
  - test: "Open Cayley Table and Equivalence Wheel in two file:// tabs; change mode/modulus in one and confirm the other re-renders live via the storage event listener (repeat Euclidean Algorithm ⇄ Venn Diagram for a/b)"
    expected: "The other tab updates without a reload, same as pre-phase behavior"
    why_human: "browser-diff.js spins up one isolated Chrome profile per run with no second tab sharing localStorage/cookie state, so live cross-tab `storage` events are structurally unobservable by the automated oracle"
  - test: "In Venn Diagram, drag a placed prime from one region to another"
    expected: "The prime moves regions and the product/overlap labels update, matching pre-phase behavior"
    why_human: "browser-diff.js's driver has no pointer-drag primitive (only click/dblclick/hover/set/key), so this interaction was never exercised this phase"
  - test: "In Venn Diagram, double-click a previewed value to navigate to Factor Tree / Euclidean Algorithm and confirm the linked value arrives"
    expected: "Navigation occurs and the target tool loads with the correct deep-linked value"
    why_human: "A real navigation unloads the instrumented page before browser-diff's snapshot harness can capture output, so this is structurally unobservable by the automated oracle"
  - test: "In Equivalence Wheel, click Export SVG, Export PNG, and Print and confirm each completes without a console error"
    expected: "Same export/print behavior as pre-phase"
    why_human: "Download/export-triggering steps were explicitly excluded from headless automation (07-05's finding that they hang headless Chrome); never exercised this phase"
  - test: "Triage 07-REVIEW.md's three open findings (WR-01 warning: window.NT container itself is not frozen, only its five sub-namespaces are; IN-01/IN-02 info: two doc nits in .claude/CLAUDE.md) — decide fixed / skipped / deferred for each in 07-REVIEW-DISPOSITION.md"
    expected: "Each finding gets an explicit disposition other than 'open' before the phase's code-review gate (SC-6) is considered fully closed"
    why_human: "All three findings are still recorded as 'open' (untriaged) as of this verification; WR-01 is a genuine, independently-confirmed runtime gap (`Object.freeze(NT)` is never called on the shared container, only on each `NT.<name>` sub-object) — low severity but a real deviation from the invariant every module's header comment and .claude/CLAUDE.md both assert"
---

# Phase 7: Shared JS Module Refactor Verification Report

**Phase Goal:** Extract the helpers duplicated across all 15 tools into clean shared classic-script modules under `assets/` on a single global namespace (no ES `import`, file://-safe); reconcile drifted variants; rewrite docs to present shared modules as the normal architecture.
**Verified:** 2026-10-01
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP SC-1..SC-6, per 07-VALIDATION.md's label legend)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | SC-1: every tool that needs a shared helper loads its `nt-*.js` module(s) as a plain, non-deferred `<script>` (file://-safe) | ✓ VERIFIED | Independently re-ran `node harness.js` (2,855,890 assertions, PASS) and `node shadow-check.js --all` (15/15 SHADOW-CHECK PASS, includes INCLUDE-DEFERRED/INCLUDE-ORDER/INCLUDE-MISSING gates) from a clean shell. Grepped all 14 migrated tool pages directly: each has exactly the expected `src="../assets/nt-*.js"` lines with no `defer`/`async`/`type="module"`, immediately paired with a `const { ... } = NT.<ns>;` import block. Sieve of Eratosthenes (the one tool sharing no helper with any other tool) correctly includes zero `nt-*.js` scripts — confirmed by direct grep and by `git diff BASE` on that file being empty. |
| 2 | SC-2: no tool defines a local copy of an extracted helper (including renamed near-duplicates and Venn's ported preview subsystems) | ✓ VERIFIED | `shadow-check.js --all` (which includes the cross-tool DUP/RENAMED-DUP scan and the per-file RETIRED-NAME table) exits 0 with zero findings, re-run independently. Direct greps for `function svgEl`, `function isPrime`, `function gcd`, `function clamp`, `function modPow`, `function bigGcd`, `function modInverse`, `function totient`, `function primeFactors` across all tool HTML files found no local redeclarations outside RSA's `modInverseBig`/`modPowSteps` (confirmed to be RSA-specific step-tracking visualization functions not duplicated anywhere else — not in the RETIRED-NAME table, correctly out of scope). |
| 3 | SC-3: drifted variants (Number vs BigInt, abs vs no-abs gcd, clamp ordering, isPrime integer guard, modInverse null/m=1 contract, trimmed euclidSteps, etc.) are reconciled with parity proven against every pre-phase predecessor | ✓ VERIFIED | Independently re-ran `node harness.js` from a clean shell: `HARNESS PASS core: 2712692`, `bigint: 75039`, `layout: 56749`, `store: 302`, `svg: 11108`, `total=2855890`, exit 0 — matches 07-VALIDATION.md's claimed figures exactly (not just trusted from the SUMMARY, re-executed). |
| 4 | SC-4: zero behavior regressions, verified per tool in a browser | ⚠️ PRESENT_BEHAVIOR_UNVERIFIED | Headless differential re-run independently on 5 of 16 pages (CRT, Venn Diagram, RSA, Sieve, index.html) — all print `IDENTICAL ... errors=0`; `--mutant` on Equivalence Wheel prints `MUTANT-DETECTED` (oracle proven live, not vacuous). This proves DOM/storage/cookie parity structurally. However the ROADMAP wording is "verified per tool **in a browser**" — 07-VALIDATION.md and 07-09-SUMMARY.md honestly record that Claude-in-Chrome tools were unavailable to the 07-09 executor, so the literal real-browser pass was never performed; it fell back to the same headless engine used for SC-3/SC-1. See `behavior_unverified_items` and `human_verification`. |
| 5 | SC-5: current docs (CLAUDE.md, .claude/CLAUDE.md, .planning/PROJECT.md, .planning/codebase/*) present shared modules as the normal architecture; stale in-code comments are gone | ✓ VERIFIED | Independently re-ran `node shadow-check.js --docs` (exits 0, `SHADOW-CHECK PASS --docs`) which audits stale phrases across all doc files plus mirror-consistency between `.claude/CLAUDE.md` and its `.planning/` sources. Direct reads of root `CLAUDE.md`, `.claude/CLAUDE.md`, and `.planning/PROJECT.md` confirm they describe `assets/nt-*.js` / `window.NT` as the current, expected architecture (not an exception or future work). Grep for stale phrases (`single-file design precludes`, `duplicated per-file`, `copy-paste`, `no shared`) in the doc files returned nothing. |
| 6 | SC-6: local `/code-review` clean (user then runs `/code-review ultra`) | ✓ VERIFIED (with open triage item — see human_verification) | A local code review exists (`07-REVIEW.md`, depth standard, 21 files, 0 critical / 1 warning / 2 info) and independently re-read: no correctness bug, all three findings are either a runtime robustness gap (`window.NT` container itself not frozen — confirmed real by direct inspection of all five `assets/nt-*.js` files: each does `var NT = window.NT = window.NT || {};` and freezes only its own sub-object, never `Object.freeze(NT)`) or doc-accuracy nits. None is a functional regression. However `07-REVIEW-DISPOSITION.md` still records all three as `open` (untriaged) — not `fixed`/`skipped`/`deferred` — so "clean" is true in the sense of "no correctness findings" but not yet true in the sense of "every finding resolved or explicitly accepted." Routed as a human decision rather than silently passed or silently failed. |

**Score:** 5/6 truths verified (1 present, behavior-unverified)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `assets/nt-core.js` | NT.core — 16 frozen exports (clamp, euclidSteps, FERMAT_MAX_ITER, fermatSplit, gcd, isPerfectSquare, isPrime, isqrt, mod, modInverse, modPowSmall, primeFactors, randomInt, smallestPrimeFactor, totient, unitsMod) | ✓ VERIFIED | Exists, `Object.freeze` present, parity-proven (2,712,692 assertions), consumed by CRT and Euler's Totient (and by every other tool importing `NT.core`) |
| `assets/nt-bigint.js` | NT.bigint — BigInt arithmetic/Miller-Rabin/random/format helpers | ✓ VERIFIED | Exists, frozen, parity-proven (75,039 assertions), consumed by RSA, Diffie-Hellman, Square and Multiply |
| `assets/nt-svg.js` | NT.svg — svgEl, centre-explicit polar geometry, easing | ✓ VERIFIED | Exists, frozen, parity-proven (11,108 assertions); `grep -rln "function svgEl" */*.html` across all 15 tools returns nothing — the shared version is the only one |
| `assets/nt-store.js` | NT.store — cross-tool shared state, deep-link readers, legacy-key migration | ✓ VERIFIED | Exists, frozen, parity-proven (302 assertions), consumed by Cayley Table, Equivalence Wheel, Venn Diagram, Euclidean Algorithm |
| `assets/nt-layout.js` | NT.layout — nested-squares layout, factor-tree builder | ✓ VERIFIED | Exists, frozen, parity-proven (56,749 assertions), consumed by Euclidean Algorithm, Factor Tree, Venn Diagram; throws when NT.core absent per contract |
| `.planning/phases/07-shared-js-module-refactor/harness.js` | Dev-only Node parity harness | ✓ VERIFIED | Present, ran independently, exit 0 |
| `.planning/phases/07-shared-js-module-refactor/shadow-check.js` | Static gate (shadow/retired-name/import/include hygiene, doc audit) | ✓ VERIFIED | Present, `--all` and `--docs` both re-run independently, exit 0 |
| `.planning/phases/07-shared-js-module-refactor/browser-diff.js` | Headless-Chrome differential oracle | ✓ VERIFIED | Present, spot-re-run on 5 tools + `--mutant` on one — all as claimed, oracle proven non-vacuous |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| 14 tool pages (all but Sieve) | `assets/nt-*.js` | plain `<script src="../assets/nt-*.js">` immediately before the inline `<script>`, then `const { ... } = NT.<ns>;` | ✓ WIRED | Confirmed by direct grep on every tool file — include + import block present and correctly ordered for all 14 |
| Sieve of Eratosthenes | (none) | N/A — shares no helper with any tool | ✓ CORRECT (intentional non-link) | `git diff BASE` empty; zero `nt-*.js` includes; tool renders via plain DOM grid cells, no SVG, no shared math helper |
| `.claude/CLAUDE.md` mirror sections | `.planning/PROJECT.md`, `.planning/codebase/*.md` | mirror-consistency audit | ✓ WIRED | `shadow-check.js --docs` (which includes the MIRROR-DRIFT check) passes with zero findings |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Full parity harness (all 5 modules) | `node harness.js` | `HARNESS PASS total=2855890`, exit 0 | ✓ PASS |
| Static shadow/duplicate/hygiene gate, all 15 tools | `node shadow-check.js --all` | 15/15 `SHADOW-CHECK PASS`, exit 0 | ✓ PASS |
| Doc-rewrite audit | `node shadow-check.js --docs` | `SHADOW-CHECK PASS --docs`, exit 0 | ✓ PASS |
| Headless BASE-vs-working-tree diff, CRT | `node browser-diff.js "Chinese Remainder Theorem/chinese-remainder-theorem.html"` | `IDENTICAL snaps=11 errors=0` | ✓ PASS |
| Headless BASE-vs-working-tree diff, Venn Diagram | `node browser-diff.js "Venn Diagram/venn-diagram.html"` | `IDENTICAL snaps=30 errors=0` | ✓ PASS |
| Headless BASE-vs-working-tree diff, RSA | `node browser-diff.js "RSA/rsa.html"` | `IDENTICAL snaps=14 errors=0` | ✓ PASS |
| Headless BASE-vs-working-tree diff, Sieve | `node browser-diff.js "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"` | `IDENTICAL snaps=11 errors=0` | ✓ PASS |
| Headless BASE-vs-working-tree diff, hub | `node browser-diff.js "index.html"` | `IDENTICAL snaps=1 errors=0` | ✓ PASS |
| Oracle non-vacuity (mutant injection) | `node browser-diff.js "Equivalence Wheel/equivalence-wheel.html" --mutant` | `MUTANT-DETECTED equivalence-wheel` | ✓ PASS |
| Live real-browser session (Claude-in-Chrome / manual) | — | Not performed this phase (tool unavailable to 07-09's executor) | ? SKIP → human_verification |

### Probe Execution

No project-defined `scripts/*/tests/probe-*.sh` exist; this phase's own dev-only toolchain (`harness.js`, `shadow-check.js`, `browser-diff.js`) functions as its probe suite and was executed directly above (Behavioral Spot-Checks), not merely read from SUMMARY claims.

### Requirements Coverage

No REQ-IDs are mapped to Phase 7 in `.planning/REQUIREMENTS.md` (confirmed — no "Phase 7" row exists there); the phase instead uses phase-local success-criteria labels SC-1..SC-6, all accounted for in the Observable Truths table above. No orphaned requirements.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `assets/nt-core.js`, `nt-bigint.js`, `nt-svg.js`, `nt-store.js`, `nt-layout.js` | container construction line in each | `window.NT` container is never `Object.freeze`'d, only each sub-namespace | ⚠️ Warning (WR-01, already recorded in 07-REVIEW.md, disposition still `open`) | A future script could reassign `window.NT.core = {...}` wholesale (not just mutate a frozen member) with no runtime guard — only `shadow-check.js`'s static `NS-MUTATION` lint catches this in checked-in tool files, not a runtime enforcement. Independently re-confirmed by direct file inspection. |
| No `TBD`/`FIXME`/`XXX`/`TODO`/`HACK`/`PLACEHOLDER` markers found | — | — | — | Swept all 5 new `assets/nt-*.js` modules, RSA, Cayley Table, both CLAUDE.md files — clean |

### Human Verification Required

1. **Live cross-tab `storage` sync** — Cayley Table ⇄ Equivalence Wheel (mode/modulus) and Euclidean Algorithm ⇄ Venn Diagram (a/b), two tabs, confirm live re-render without reload. Structurally unobservable by `browser-diff.js` (one isolated Chrome profile per run).
2. **Venn Diagram pointer-drag** — drag a placed prime between regions; confirm it moves and product/overlap labels update. No drag primitive in the automated driver.
3. **Venn Diagram double-click navigation** — double-click to open Factor Tree / Euclidean Algorithm with the linked value. A real navigation unloads the page before the snapshot harness captures output.
4. **Equivalence Wheel export/print** — Export SVG, Export PNG, Print, each without a console error. Explicitly excluded from headless automation (known to hang headless Chrome).
5. **Triage the 3 open code-review findings** — `07-REVIEW-DISPOSITION.md` still shows WR-01/IN-01/IN-02 as `open`. WR-01 (unfrozen `NT` container) is a real, independently-confirmed low-severity runtime gap; IN-01/IN-02 are doc nits. None blocks correctness, but SC-6 ("local code review clean") is not fully closed until each gets an explicit fixed/skipped/deferred disposition.

Item 5 is a phase-closure housekeeping item (not a functional defect); items 1-4 are the four behaviors 07-VALIDATION.md itself already named as "genuinely manual" and explicitly did not claim as observed — this report treats them the same way rather than accepting the "auto-approved" note as direct observation, per this verification's instructions.

### Gaps Summary

No FAILED truths and no missing/stub artifacts were found. All re-run automated gates (harness, shadow-check --all, shadow-check --docs, and 6 independent browser-diff spot-checks including a mutant-injection liveness proof) passed cleanly when re-executed from a clean shell, matching the figures claimed in 07-VALIDATION.md rather than merely trusting them. The phase's architectural goal — shared classic-script `assets/nt-*.js` modules on `window.NT`, zero local duplicate helpers, docs rewritten to match — is substantively and verifiably achieved.

What keeps this phase at `human_needed` rather than `passed` is that the ROADMAP's own success-criteria wording ("zero behavior regressions, verified per tool **in a browser**") was not literally satisfied this phase — the real-browser pass fell back to the same headless engine already used for the parity proof, and four specific interactions (cross-tab storage sync, Venn drag, Venn double-click nav, Equivalence Wheel export) remain genuinely unverified by any means. A fifth item — three open, untriaged code-review findings — is a housekeeping gap in SC-6's "clean" claim, not a correctness defect. None of these five items indicates a functional regression was actually introduced; they indicate specific claims of completeness that the codebase and its own artifacts do not yet fully substantiate.

---

_Verified: 2026-10-01_
_Verifier: Claude (gsd-verifier)_
