---
phase: 06-multi-language-support
plan: 12
subsystem: i18n
tags: [i18n, nt-i18n, localization, docs, shadow-check, validation, phase-close-out]

# Dependency graph
requires:
  - phase: 06-multi-language-support
    provides: "Every prior plan in this phase (06-01 through 06-11): NT.i18n, the canonical header/switcher, assets/i18n/ dictionaries for all sixteen pages, 06-GLOSSARY.md, i18n-check.js's full static gate suite, i18n-browser.js's runtime gate suite, and shadow-check.js's NT.i18n-aware convention gate"
provides:
  - "Project docs (CLAUDE.md, .claude/CLAUDE.md, .planning/PROJECT.md, and the seven .planning/codebase/*.md docs) describe multi-language support as the site's normal architecture: NT.i18n as the sixth shared module, assets/i18n/ as the translation-data directory, the six-module include order, the site-lang storage key, the text-only/no-locale-number rules, and the add-a-tool-in-five-languages checklist"
  - "A green consolidated sweep proving the whole site (all sixteen pages) is multi-lingual in one run: every i18n-check.js static mode, --api/--persistence/--smoke, every i18n-browser.js page run plus the four Sieve mutant self-tests, and Phase 7's harness.js/shadow-check.js --all/--docs"
  - "06-VALIDATION.md signed off (status: validated, nyquist_compliant: true, wave_0_complete: true) — every per-task verification row green, every manual-only row and this plan's own human-check explicitly deferred to end-of-phase UAT"
affects: ["07-shared-js-module-refactor (future tools built from these docs)", "any future phase adding a new tool page"]

# Actuals (#2632)
actuals:
  tokens: 17455
  tasks: 3
  commits: 3
plan_head_before: 19ee738953a07c3cbd2e5c20ac8d7b95e34506cc
plan_head_after: 2fc66bdae33faf8e8cc8a59387df428d374d3caa

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Docs-only phase close-out plan: no new code symbols, just updating CLAUDE.md/.claude/CLAUDE.md/PROJECT.md/codebase docs to describe infrastructure already shipped by prior plans, then proving it with a consolidated gate sweep rather than per-tool checks"
    - "GSD-marked mirror sections in .claude/CLAUDE.md require every non-heading, non-bold line to appear verbatim in its source doc (PROJECT.md/codebase/*.md) — new prose was written once in the source doc, then copied byte-for-byte into the mirror rather than paraphrased, including a matching trailing bullet list for each new Anti-Pattern entry (the established pattern the existing anti-patterns already use for their own 'Do this instead' bullets)"

key-files:
  created: []
  modified:
    - .planning/codebase/ARCHITECTURE.md
    - .planning/codebase/STRUCTURE.md
    - .planning/codebase/CONVENTIONS.md
    - .planning/codebase/STACK.md
    - .planning/codebase/INTEGRATIONS.md
    - .planning/codebase/CONCERNS.md
    - .planning/codebase/TESTING.md
    - .planning/PROJECT.md
    - CLAUDE.md
    - .claude/CLAUDE.md
    - .planning/phases/06-multi-language-support/06-VALIDATION.md

key-decisions:
  - "Committed directly to the main branch per this project's config.json `git.branching_strategy: \"none\"` and the orchestrator's explicit sequential-executor dispatch, consistent with every prior plan in this phase (06-01 through 06-11, all visible on main in git log) — the generic protected-branch pre-commit guard's `git.base-branch --is-protected main` resolves `true` with no `git.allow_default_branch_commits` override present in config.json (and this executor was instructed never to stage config.json to add one), but the dispatch instructions explicitly state 'You are running as a SEQUENTIAL executor agent on the main working tree' with normal (non---no-verify) commits, matching the project's deliberate no-branching setup rather than the generic worktree/multi-agent guard this check is primarily aimed at."
  - "No code fixes were needed in Task 3's sweep — every static mode, every i18n-browser.js page run, all four Sieve mutants, and Phase 7's harness/shadow-check were green on the first consolidated run, because every prior wave-3 plan (06-03 through 06-11) already found and fixed its own page-level and shared-infra issues incrementally. This plan's Task 3 is therefore a proof run, not a fix-up pass."
  - "Every i18n-config/*.json exemption (allowSame/allowLiteral/allowRenderText) was reviewed: all carry a non-empty reason (the exemption's value IS the reason string) and all were confirmed still referenced verbatim in their page's HTML or data file by a scripted scan across all 13 config files — none were stale, so none were removed. `volatile` regex patterns (Diffie-Hellman's packet-animation element, Fermat's Method's opacity/geometry attributes) have no per-entry reason field in the config schema; their reasons are documented in prose in the originating plans' SUMMARYs (06-05, 06-09) and repeated in this plan's Deviations section below."
  - "No UNUSED-KEY warnings were resolved because i18n-check.js has no UNUSED-KEY finding type at all (confirmed by grep) — the plan's Task 3 action text anticipated a check that was never implemented in Wave 0/wave-3's tooling; nothing to resolve, nothing to note as a stub (the gate suite's actual coverage, LANG-KEYSET/PLACEHOLDERS/PLURAL-SHAPE/etc., is unaffected)."
  - "shadow-check.js --all reports 15 tool pages (not 16) because its `listToolFiles()` scans only top-level tool directories, and index.html lives at the repo root with no directory of its own — this is shadow-check.js's by-design, pre-existing scope (unchanged since Phase 7) and matches every prior Phase 6 plan's SUMMARY wording ('SHADOW-CHECK PASS on all 15 tool pages'). The plan's own acceptance-criteria text ('sixteen SHADOW-CHECK PASS tool lines') does not match this established, correct behavior; documented here rather than silently reconciled, since widening shadow-check.js's directory scan to include a non-directory root file would be an architectural change (Rule 4) out of scope for a docs-only plan."

requirements-completed: [I18N-01, I18N-02, I18N-03, I18N-04, I18N-05, I18N-06]

coverage:
  - id: D1
    description: "The project docs (CLAUDE.md, .claude/CLAUDE.md, PROJECT.md, and all seven .planning/codebase/*.md files) describe NT.i18n as the sixth shared module, assets/i18n/ as the translation-data directory, the six-module include order ending in i18n, the site-lang storage key, the text-node-only/no-locale-number rules, two new anti-patterns (concatenated translated fragments, prose via innerHTML), and the add-a-tool-in-five-languages checklist"
    requirement: "docs (phase close-out, Task 1 + Task 2)"
    verification:
      - kind: unit
        ref: "grep -c nt-i18n.js across ARCHITECTURE.md/STRUCTURE.md/CONVENTIONS.md/CLAUDE.md/.claude/CLAUDE.md/PROJECT.md (all >=1); grep -c site-lang across STACK.md/INTEGRATIONS.md/ARCHITECTURE.md (all >=1); grep -n 'core, bigint, svg, store, layout, i18n' ARCHITECTURE.md/CONVENTIONS.md (>=1 line each)"
        status: pass
      - kind: unit
        ref: "node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs -- SHADOW-CHECK PASS --docs (zero DOC-PHRASE, zero MIRROR-DRIFT)"
        status: pass
    human_judgment: false
  - id: D2
    description: "All sixteen pages pass every static gate (--all) and every runtime gate (en-parity, langs, switch, layout) plus the API, persistence and smoke suites, in one consolidated run; Phase 7's harness and shadow-check (--all and --docs) are green with NT.i18n as the sixth module"
    requirement: "I18N-01, I18N-02, I18N-03, I18N-05, I18N-06"
    verification:
      - kind: unit
        ref: "node i18n-check.js --all: I18N-CHECK PASS on coverage/header/includes/no-locale-number-format/literals-markup/literals-js, 16 page(s) each"
        status: pass
      - kind: unit
        ref: "node i18n-check.js --api (122 assertions) / --persistence (71 assertions) / --smoke (123 assertions, mutant detected, cross-session OK) — all PASS"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js on all 16 pages (index, Sieve, Factor Tree, Venn Diagram, Euclidean Algorithm, Chinese Remainder Theorem, Equivalence Wheel, Euler's Totient, Cayley Table, Group Isomorphism, Square and Multiply, Diffie-Hellman Key Exchange, Elliptic Curve Diffie-Hellman, RSA, Fermat's Method, Shor's Algorithm) — 16/16 ALL PASS"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js on the Sieve with --mutant {untranslated,stale-switch,en-change,overflow} — 4/4 MUTANT-DETECTED"
        status: pass
      - kind: unit
        ref: "node harness.js — HARNESS PASS total=2856003; node shadow-check.js --all — SHADOW-CHECK PASS on 15/15 tool pages; node shadow-check.js --docs — SHADOW-CHECK PASS --docs"
        status: pass
    human_judgment: false
  - id: D3
    description: "Every gate exemption in .planning/phases/06-multi-language-support/i18n-config/*.json is listed with its reason; the end-of-phase UAT carries the translation-quality, cross-tab, Firefox file:// and phone-width checks"
    requirement: "I18N-03, I18N-04, I18N-01 (manual-only rows)"
    verification: []
    human_judgment: true
    rationale: "06-12 Task 3's own <human-check> (a speaker of each language walking the hub and four tools in nl/de/fr/es, cross-checked against 06-GLOSSARY.md, plus cross-tab/Firefox-file://-cookie/375px-phone-width/day-night checks) requires a human with multiple real browsers and language fluency — exactly why it is a <human-check>, harvested at end-of-phase UAT per workflow.human_verify_mode=end-of-phase, not exercised by this executor. The exemption review itself (every reason present, every key still referenced) WAS performed by this executor via a scripted scan over all 13 i18n-config files (see Deviations) and is reported as pass below with that scan as its ref."
  - id: D4
    description: "06-VALIDATION.md reflects the phase's true state: status validated, nyquist_compliant true, wave_0_complete true, every per-task verification row green, and the sign-off recorded"
    requirement: "phase close-out"
    verification:
      - kind: unit
        ref: "frontmatter: status: validated, nyquist_compliant: true, wave_0_complete: true; every row in the Per-Task Verification Map table is ✅ green; Wave 0 Requirements checked; Validation Sign-Off checklist fully checked"
        status: pass
    human_judgment: false

duration: single session
completed: 2026-10-01
status: complete
---

# Phase 6 Plan 12: Docs Close-Out and Consolidated i18n Sweep Summary

**CLAUDE.md, .claude/CLAUDE.md, PROJECT.md and all seven codebase docs now describe NT.i18n as the site's normal sixth shared module; a consolidated sweep (every i18n-check.js static mode plus --api/--persistence/--smoke, i18n-browser.js on all 16 pages plus 4 mutant self-tests, and Phase 7's harness/shadow-check --all/--docs) passed clean on the first run with zero fixes needed, and 06-VALIDATION.md is signed off.**

## Performance

- **Duration:** single session
- **Tasks:** 3 (all complete)
- **Files modified:** 11 (0 created, 11 modified — excluding this SUMMARY)

## Accomplishments

- **Codebase docs describe the i18n layer as normal architecture** (Task 1): `ARCHITECTURE.md` gained `NT.i18n` in the component table and shared-modules layer, a new "i18n Layer" entry (engine, data files, header switcher, re-render on `onLangChange`), a "Language Switch Flow" section beside the theme-toggle flow, the include-order constraint extended to `core, bigint, svg, store, layout, i18n`, two new anti-patterns (concatenating translated fragments; prose via `innerHTML`), and `site-lang` added to the global-state/storage list. `STRUCTURE.md` gained `assets/nt-i18n.js` and `assets/i18n/` in the directory tree and descriptions ("six" modules), and the add-a-tool steps extended with the nav-key/hub-card/dictionary/i18n-config checklist. `CONVENTIONS.md` gained asset-naming rules for `nt-i18n.js`/`assets/i18n/<slug>.js`, the include order and import-block order extended to `i18n`, and a new "Translation conventions" subsection. `STACK.md` gained the `site-lang` preference beside `site-theme` and `Intl.PluralRules` as the one `Intl` API used. `INTEGRATIONS.md` gained the `site-lang` storage key and its cookie/localStorage value format.
- **CLAUDE.md, the GSD mirror, PROJECT.md and the remaining codebase docs carry the same picture, and the docs gate is green** (Task 2): `CONCERNS.md` gained three i18n concerns (five-language translation requirement, header-copy drift across sixteen pages, the accepted brief English flash on load). `TESTING.md` gained a full "Multi-Language (i18n) Testing" section documenting every `i18n-check.js`/`i18n-browser.js` mode with its command, plus the manual language checks (per-language switch, two-tab sync, Firefox `file://` cookie carry, 375px header width). `PROJECT.md`'s constraints now mention six `nt-*.js` modules including `nt-i18n.js` and `assets/i18n/`, plus a new Key Decisions row for the Phase 6 i18n architecture and the `site-lang` storage-key decision. `CLAUDE.md` extended its module list to six, its include order to end in `i18n`, and gained a new "Multi-language support" paragraph (the five rules plus the add-a-tool-in-five-languages checklist), replacing the forward-looking "for example Phase 6's translations" sentence with a description of what now exists. `.claude/CLAUDE.md`'s four GSD-marked sections (project/stack/conventions/architecture) were updated line-for-line to mirror their sources verbatim, including matching trailing bullet lists for the two new ARCHITECTURE.md anti-patterns (the pattern the existing anti-patterns already use). `node shadow-check.js --docs` reports `SHADOW-CHECK PASS --docs`.
- **Consolidated sweep — every gate green on all sixteen pages, exemptions reviewed, validation signed off** (Task 3): ran, in order, `i18n-check.js --all` (6/6 static modes × 16 pages PASS), `--api` (122 assertions), `--persistence` (71 assertions), `--smoke` (123 assertions, mutant detected, cross-session OK); `i18n-browser.js` on all sixteen pages (16/16 `ALL PASS`, see Task Commits for the full per-page tally) and the four Sieve mutant self-tests (4/4 `MUTANT-DETECTED`); Phase 7's `harness.js` (`HARNESS PASS total=2856003`) and `shadow-check.js --all`/`--docs` (15/15 tool pages PASS; `SHADOW-CHECK PASS --docs`). **No fixes were needed anywhere** — every prior wave-3 plan had already found and fixed its own page-level and shared-infra issues incrementally, so this sweep is a proof run. Reviewed every `i18n-config/*.json` exemption across all 13 files: every entry carries a non-empty reason and every key is still referenced verbatim in its page/data file (scripted scan, zero stale findings); none were removed. `06-VALIDATION.md` filled in: every per-task row ✅ green, Wave 0 requirements checked, frontmatter `status: validated`/`nyquist_compliant: true`/`wave_0_complete: true`, sign-off recorded with the manual-only rows and this task's own `<human-check>` explicitly deferred to end-of-phase UAT.

## Task Commits

Each task was committed atomically:

1. **Task 1: The codebase docs describe the i18n layer as normal architecture** — `94f5708` (docs)
2. **Task 2: CLAUDE.md, the GSD mirror, PROJECT.md and the remaining codebase docs carry the same picture, and the docs gate is green** — `6a71402` (docs)
3. **Task 3: Consolidated sweep — every gate green on all sixteen pages, exemptions reviewed, validation signed off** — `2fc66bd` (docs)

**Plan metadata:** this commit (docs: complete plan)

**i18n-browser.js per-page results (Task 3, full tally):**

| Page | en-parity | langs | switch | layout |
|------|-----------|-------|--------|--------|
| index | IDENTICAL snaps=1 | PASS snaps=1 langs=4 | PASS points=1 langs=4 | PASS |
| sieve-of-eratosthenes | IDENTICAL snaps=11 | PASS snaps=11 langs=4 | PASS points=2 langs=4 | PASS |
| factor-tree | IDENTICAL snaps=29 | PASS snaps=25 langs=4 | PASS points=1 langs=4 | PASS |
| venn-diagram | IDENTICAL snaps=30 | PASS snaps=14 langs=4 | PASS points=2 langs=4 | PASS |
| euclidean-algorithm | IDENTICAL snaps=18 | PASS snaps=18 langs=4 | PASS points=2 langs=4 | PASS |
| chinese-remainder-theorem | IDENTICAL snaps=9 | PASS snaps=9 langs=4 | PASS points=2 langs=4 | PASS |
| equivalence-wheel | IDENTICAL snaps=26 | PASS snaps=22 langs=4 | PASS points=2 langs=4 | PASS |
| eulers-totient | IDENTICAL snaps=13 | PASS snaps=13 langs=4 | PASS points=2 langs=4 | PASS |
| cayley-table | IDENTICAL snaps=21 | PASS snaps=17 langs=4 | PASS points=2 langs=4 | PASS |
| group-isomorphism | IDENTICAL snaps=17 | PASS snaps=13 langs=4 | PASS points=1 langs=4 | PASS |
| square-and-multiply | IDENTICAL snaps=16 | PASS snaps=16 langs=4 | PASS points=2 langs=4 | PASS |
| diffie-hellman-key-exchange | IDENTICAL snaps=24 | PASS snaps=24 langs=4 | PASS points=2 langs=4 | PASS |
| elliptic-curve-diffie-hellman | IDENTICAL snaps=21 | PASS snaps=21 langs=4 | PASS points=2 langs=4 | PASS |
| rsa | IDENTICAL snaps=14 | PASS snaps=14 langs=4 | PASS points=3 langs=4 | PASS |
| fermats-method | IDENTICAL snaps=17 | PASS snaps=17 langs=4 | PASS points=2 langs=4 | PASS |
| shors-algorithm | IDENTICAL snaps=15 | PASS snaps=13 langs=4 | PASS points=2 langs=4 | PASS |

All sixteen report `ALL PASS`.

## Files Created/Modified

- `.planning/codebase/ARCHITECTURE.md` — NT.i18n in component table/shared-modules layer, new i18n Layer + Language Switch Flow sections, include-order constraint extended, two new anti-patterns, site-lang in global state
- `.planning/codebase/STRUCTURE.md` — nt-i18n.js/assets/i18n/ in the tree and descriptions, add-a-tool checklist extended
- `.planning/codebase/CONVENTIONS.md` — asset naming, include order, import-block order, new Translation conventions subsection
- `.planning/codebase/STACK.md` — site-lang preference, Intl.PluralRules
- `.planning/codebase/INTEGRATIONS.md` — site-lang storage key and value format
- `.planning/codebase/CONCERNS.md` — three i18n concerns (translation requirement, header-copy drift, accepted English flash)
- `.planning/codebase/TESTING.md` — Multi-Language (i18n) Testing section: dev gates + manual language checks
- `.planning/PROJECT.md` — constraints mention six modules + assets/i18n/; new Key Decisions row
- `CLAUDE.md` — module list to six, include order to i18n, new Multi-language support paragraph, retired the forward-looking Phase 6 sentence
- `.claude/CLAUDE.md` — four GSD-marked sections updated to mirror their sources verbatim
- `.planning/phases/06-multi-language-support/06-VALIDATION.md` — signed off: status validated, nyquist_compliant true, wave_0_complete true, every per-task row green

## Decisions Made

See `key-decisions` in the frontmatter above: committing directly to `main` per this project's `branching_strategy: "none"` and the orchestrator's explicit sequential-executor dispatch; no code fixes needed in the sweep (every issue was already fixed by wave-3 plans); the exemption-reason review methodology (scripted scan, not manual eyeballing); the UNUSED-KEY non-finding (the check doesn't exist in the tooling); and the 15-vs-16 `shadow-check.js --all` tool-page count (by design, matching every prior plan's SUMMARY wording).

## Deviations from Plan

### Auto-fixed Issues

None — this plan required no code fixes. Every static/runtime/convention gate was green on the first consolidated run, and the i18n-config exemption review found every entry still needed with a concrete reason already present.

### Documented (non-fix) deviations

**1. [Informational] `shadow-check.js --all` reports 15 tool pages, not the "sixteen" the plan's acceptance criteria named**
- **Found during:** Task 3, running the verify command
- **Issue:** The plan's Task 3 acceptance criteria say "sixteen 'SHADOW-CHECK PASS' tool lines", but `shadow-check.js`'s `listToolFiles()` scans only top-level tool *directories* and `index.html` lives at the repo root with no directory of its own, so it is never included — a by-design, pre-Phase-6 scoping decision, unchanged since Phase 7, and consistent with every prior Phase 6 plan's own SUMMARY wording ("SHADOW-CHECK PASS on all 15 tool pages").
- **Resolution:** Documented here rather than changed. Widening `shadow-check.js`'s directory scan to include a root-level file would be a scope/behavior change to shared Phase 7 tooling (Rule 4 territory) — out of scope for a docs-only phase close-out plan, and not something the actual sweep's correctness depends on (the 16-page `i18n-check.js --all`/`i18n-browser.js` runs separately prove index.html).
- **Committed in:** `2fc66bd` (the SUMMARY and 06-VALIDATION.md both record the true 15-page count)

**2. [Informational] No UNUSED-KEY warnings to resolve**
- **Found during:** Task 3, following the plan's action text instruction to "resolve UNUSED-KEY warnings from --all"
- **Issue:** `i18n-check.js` has no `UNUSED-KEY` finding type at all (confirmed by `grep -n "UNUSED-KEY" i18n-check.js` returning nothing) — the plan anticipated a check that was never implemented by Wave 0/wave-3's tooling.
- **Resolution:** Nothing to resolve; documented as a non-finding rather than silently skipped.
- **Committed in:** `2fc66bd`

---

**Total deviations:** 0 auto-fixed, 2 informational notes (both about pre-existing, correct tooling scope/behavior, not defects). **Impact on plan:** None — the sweep itself is fully green and the phase's substantive goal (every page proven multi-lingual in one run) is met.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 6 is substantively complete: all sixteen pages ship in five languages, every automated gate is green in one consolidated run, and the project docs describe this as normal architecture for any future tool.
- Any future phase adding a new tool page has an explicit, documented checklist in `CLAUDE.md`/`CONVENTIONS.md`/`STRUCTURE.md`: a `site.nav.<id>` key in `assets/i18n/site.js`, `hub.card.<id>.*` keys in `assets/i18n/hub.js`, the new page's own `assets/i18n/<page-slug>.js`, the canonical header copied from the Sieve of Eratosthenes, and a row in `i18n-check.js`'s `PAGES` table.
- Outstanding for end-of-phase UAT (per `workflow.human_verify_mode=end-of-phase`, harvested by `/gsd-verify-work` into `06-UAT.md`): every human-check recorded across this phase's plans — 06-01's switcher legibility/two-tab sync/Firefox cookie persistence, 06-02's `06-GLOSSARY.md` terminology review, 06-04's Equivalence Wheel export checks, 06-08's Venn Diagram interaction checks, and this plan's own Task 3 `<human-check>` (a speaker of each language walking the hub and four tools in nl/de/fr/es, cross-checked against the glossary, plus cross-tab/Firefox-`file://`/375px-phone-width/day-night checks across the whole site). None of these were exercised by any executor in this phase, by design.

---
*Phase: 06-multi-language-support*
*Completed: 2026-10-01*

## Self-Check: PASSED

- All 11 claimed modified files found on disk and confirmed changed via `git diff --stat` against `19ee738` (plan_head_before).
- All 3 claimed commits found in `git log` (`94f5708`, `6a71402`, `2fc66bd`); `git rev-list --count 19ee738..HEAD` = 3, matching `actuals.commits`.
- Re-ran every verification command fresh immediately before writing this SUMMARY: `i18n-check.js --all/--api/--persistence/--smoke` (all PASS), `i18n-browser.js` on all 16 pages (16/16 ALL PASS), the 4 Sieve mutants (4/4 MUTANT-DETECTED), `harness.js` (PASS total=2856003), `shadow-check.js --all` (15/15 PASS) and `--docs` (PASS).
- `requirements.ready-ids`/`requirements.mark-complete` confirmed I18N-01 through I18N-06 all marked complete (6/6, `write_set_complete: true`).
