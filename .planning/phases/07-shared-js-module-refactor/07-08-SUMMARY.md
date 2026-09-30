---
phase: 07-shared-js-module-refactor
plan: 08
subsystem: docs
tags: [documentation, shared-js-module, window-NT, claude-md, codebase-map]

# Dependency graph
requires:
  - phase: 07-shared-js-module-refactor (plan 01)
    provides: "assets/nt-core.js, the NT namespace/include/import conventions, and shadow-check.js's --docs audit mode"
  - phase: 07-shared-js-module-refactor (plan 02)
    provides: "assets/nt-svg.js"
  - phase: 07-shared-js-module-refactor (plan 03)
    provides: "assets/nt-bigint.js, assets/nt-store.js"
  - phase: 07-shared-js-module-refactor (plan 06)
    provides: "assets/nt-layout.js"
provides:
  - "CLAUDE.md, .planning/PROJECT.md, .claude/CLAUDE.md and every .planning/codebase/*.md rewritten to describe the five assets/nt-*.js modules on window.NT as the project's normal architecture"
  - "shadow-check.js --docs exits 0 with zero DOC-PHRASE (retired single-file/duplication wording) or MIRROR-DRIFT findings"
  - "A documented path for a future cross-page concern (e.g. Phase 6 translations) to become its own assets/nt-NAME.js module on NT.NAME"
affects: [04, 06]

actuals:
  tokens: 17484
  tasks: 3
  commits: 3
  plan_head_before: f34e934f6b6ebde2ff8f7862fc0eb5c9e4a2fce4
  plan_head_after: 8be43b60d29a8a8a24e0c9a8ee1c70601d2e4b6a

tech-stack:
  added: []
  patterns:
    - "Docs edited hand-in-hand with their .claude/CLAUDE.md mirror in the same task (source + mirror, per commits d441342/15d63d6/fc5d1c0 precedent), never via a mirror generator — shadow-check.js --docs MIRROR-DRIFT proves every mirrored line still exists verbatim in its source"

key-files:
  modified:
    - CLAUDE.md
    - .planning/PROJECT.md
    - .claude/CLAUDE.md
    - .planning/codebase/ARCHITECTURE.md
    - .planning/codebase/CONVENTIONS.md
    - .planning/codebase/STACK.md
    - .planning/codebase/STRUCTURE.md
    - .planning/codebase/CONCERNS.md
    - .planning/codebase/TESTING.md

key-decisions:
  - "Cayley table Key Decisions row (PROJECT.md) now names the Equivalence Wheel consistently in both the Decision and Rationale columns (the actual tool directory is 'Equivalence Wheel/equivalence-wheel.html'; only the Rationale column previously said 'Congruence Wheel') — Rule 1 fix while rewording the row's shared-module wording, no scope change"
  - "ARCHITECTURE.md's Global state bullet reworded to 'no tool shares its own state via a module-level singleton' (was 'no module-level singletons shared between tools') so the new window.NT-is-a-shared-global sentence added to the same bullet doesn't contradict the existing sentence about per-tool state isolation — Rule 1 fix, no scope change"
  - "STRUCTURE.md's tree-summary line ('...+ 2 shared asset files') updated to '...+ 7 shared asset files' to stay consistent with the five nt-*.js files just added to the same directory tree two lines above — Rule 1 fix, no scope change"
  - "ARCHITECTURE.md's Anti-Patterns model file reference moved from the no-longer-existing 'Congruence Wheel/congruence-wheel.html' to 'Equivalence Wheel/equivalence-wheel.html' per the plan's explicit instruction, without repeating the old line-count claim (562 lines) since the file has since grown to 1097 lines and a stale count would be its own small inaccuracy"

requirements-completed: [SC-5]

coverage:
  - id: D1
    description: "CLAUDE.md and .planning/PROJECT.md (plus the mirrored .claude/CLAUDE.md project section) describe the five assets/nt-*.js modules on window.NT, the non-deferred canonical-order include convention, and the NT import-block pattern as the project's normal architecture, with no reference to a former no-shared-JS rule or to duplication being deliberate/default"
    requirement: "SC-5"
    verification:
      - kind: other
        ref: "node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs --report | grep -E '^(DOC-PHRASE (CLAUDE\\.md|\\.planning/PROJECT\\.md):|MIRROR-DRIFT project)' — zero lines"
        status: pass
      - kind: other
        ref: "positive grep for nt-core.js/nt-bigint.js/nt-svg.js/nt-store.js/nt-layout.js/window.NT in CLAUDE.md and PROJECT.md; nt-core.js in .claude/CLAUDE.md; nt-i18n.js pattern named in CLAUDE.md"
        status: pass
    human_judgment: false
  - id: D2
    description: "ARCHITECTURE.md, CONVENTIONS.md and STACK.md (plus their .claude/CLAUDE.md mirror sections) document the Shared Modules layer, load order, dependency direction, the import-block pattern, the shared-module skeleton, and two new anti-patterns (shadowing an NT export; deferred/modular includes) replacing the retired copy-paste-math anti-pattern"
    requirement: "SC-5"
    verification:
      - kind: other
        ref: "node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs --report | grep -E '^(DOC-PHRASE (\\.claude/CLAUDE\\.md|\\.planning/codebase/(ARCHITECTURE|CONVENTIONS|STACK)\\.md):|MIRROR-DRIFT)' — zero lines"
        status: pass
      - kind: other
        ref: "grep -q window.NT / 'polar(cx, cy' in ARCHITECTURE.md; grep -q '= NT.core;' in CONVENTIONS.md; grep -c nt-core.js .claude/CLAUDE.md = 10 (>= 3 required)"
        status: pass
    human_judgment: false
  - id: D3
    description: "STRUCTURE.md's new-tool and shared-vs-tool-specific-helper guidance, and the topic-scoped CONCERNS.md/TESTING.md lines, present the assets/nt-*.js frozen-export convention as the place a shared helper belongs, with CONCERNS.md's other sections and front-matter untouched"
    requirement: "SC-5"
    verification:
      - kind: other
        ref: "node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs — exits 0, zero findings across all nine rewritten docs"
        status: pass
      - kind: other
        ref: "git diff SHA^..SHA -- .planning/codebase/CONCERNS.md (SHA=8be43b6) touches only the Architectural Deviation section, the File Size fix-approach line, and the svgEl concern's file reference"
        status: pass
    human_judgment: false

duration: 45min
completed: 2026-09-30
status: complete
---

# Phase 7 Plan 8: Documentation Rewrite for Shared-Module Architecture Summary

**CLAUDE.md, .planning/PROJECT.md, .claude/CLAUDE.md and all six .planning/codebase/*.md files rewritten so the five assets/nt-*.js modules on window.NT read as this project's normal architecture, with zero retired-rule phrases or mirror drift left in any of the nine files.**

## Performance

- **Duration:** 45 min
- **Started:** 2026-09-30
- **Completed:** 2026-09-30T21:47:41Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- CLAUDE.md and .planning/PROJECT.md (plus the mirrored `.claude/CLAUDE.md` project section) now describe the repo as HTML tool pages built on `assets/nt-core.js`, `nt-bigint.js`, `nt-svg.js`, `nt-store.js` and `nt-layout.js` on one `window.NT` namespace — non-deferred, canonical-order includes immediately before a page's inline script, one `const { ... } = NT.NAME;` import line per namespace, and a documented `nt-i18n.js`/`NT.i18n` pattern for a future cross-page concern (Phase 6 translations)
- PROJECT.md gained a new Key Decisions row for the shared-module convention and a reworded Cayley Table row that names the Equivalence Wheel and its `NT.core`/`NT.store` sharing instead of the retired "echoing (not sharing code with)" framing
- ARCHITECTURE.md gained a Shared Modules layer/component row, `NT.svg`/`NT.layout`-sourced Key Abstractions with real signatures (`polar(cx, cy, r, angleDeg)`, `annularSectorPath(...)`, `computeNestedLayout(steps, tileCap)`, `buildFactorTree(v, { balanced, maxIter })`), a module-dependency-direction and load-order Architectural Constraint, and two new Anti-Patterns (shadowing an `NT` export; deferred/modular shared-module includes) that replace the retired copy-paste-math anti-pattern — its monolithic-file model now points at `Equivalence Wheel/equivalence-wheel.html`, the file that actually exists
- CONVENTIONS.md gained the shared-module include-line pattern, the NT import-block pattern (sorted names, frozen members), and a prose "shared module skeleton" pattern (IIFE, `window.NT` root, frozen export); STACK.md's Numbers Module now points at `NT.core`/`NT.bigint`
- STRUCTURE.md's directory tree, purpose/key-files lines, per-tool script-contents description, and "Where to Add New Code" subsections (new tool, new shared math function, new tool-specific helper) all now route through `assets/nt-*.js` and the import block instead of per-file duplication; the tool-specific-helper example is Cayley Table's still-true `cellMinPx(M)`
- CONCERNS.md's Architectural Deviation section now names shared-module coupling (not the old single-file-vs-shared-assets framing) as the live concern, with matching fixes to the File Size fix-approach line and the `svgEl` error-handling file reference — every other CONCERNS.md section and its front-matter are untouched; TESTING.md's manual-testing rationale now mentions the shared `nt-*.js` helpers
- `node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs` exits 0 with zero findings across all nine files — no `DOC-PHRASE` (retired single-file/self-contained/duplication wording) and no `MIRROR-DRIFT` (source/`.claude/CLAUDE.md` mismatch) remain

## Task Commits

Each task was committed atomically:

1. **Task 1: Root CLAUDE.md, PROJECT.md and the mirrored project section** - `e152f7f` (docs)
2. **Task 2: ARCHITECTURE.md, CONVENTIONS.md, STACK.md and their mirrored sections** - `987813a` (docs)
3. **Task 3: STRUCTURE.md, CONCERNS.md (topic lines only) and TESTING.md** - `8be43b6` (docs)

## Files Created/Modified

- `CLAUDE.md` — repo description, Architecture pattern section (shared-module include list, rewritten inline-script bullet, external-resources bullet), Working-with-this-codebase shared-module-guidance bullet
- `.planning/PROJECT.md` — What-This-Is/Validated/Active/Out-of-Scope/Context/Constraints lines, new + reworded Key Decisions rows
- `.claude/CLAUDE.md` — GSD project/stack/conventions/architecture mirror sections, kept byte-identical to their new sources
- `.planning/codebase/ARCHITECTURE.md` — Component Responsibilities row, Pattern Overview, Layers (new Shared Modules layer + rewritten Math/SVG layers), Key Abstractions, Architectural Constraints, Anti-Patterns
- `.planning/codebase/CONVENTIONS.md` — naming examples, file-structure bullets, Import Organization, Module Design, Shared Patterns
- `.planning/codebase/STACK.md` — Numbers Module heading and bullets
- `.planning/codebase/STRUCTURE.md` — directory tree, purpose/key-files lines, per-tool script description, naming rationale, new-tool/new-helper "Where to Add New Code" subsections, Special Directories bullets
- `.planning/codebase/CONCERNS.md` — Architectural Deviation section, File Size fix-approach line, svgEl file reference (topic lines only)
- `.planning/codebase/TESTING.md` — Test Framework rationale line

## Decisions Made

See `key-decisions` in the frontmatter for the four Rule-1 consistency fixes made while rewording the requested passages (Equivalence Wheel naming, the Global-state bullet's self-contradiction, the asset-count line, and the monolithic-file model-file reference). No architectural or scope decisions were required — the plan's context section supplied every module/namespace/convention fact needed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Consistency] Reworded PROJECT.md's Cayley Key Decisions row to name the Equivalence Wheel in both columns**
- **Found during:** Task 1
- **Issue:** The plan's instructed Decision-column text names "the Equivalence Wheel" (the tool's real directory name), but the row's unedited Rationale column still said "Congruence Wheel," which would leave a self-contradictory row
- **Fix:** Reworded the Rationale column to say "Equivalence Wheel" as well, and replaced "standalone-vs-paired" (itself a DOC-PHRASE hit) with "separate-vs-paired"
- **Files modified:** `.planning/PROJECT.md`
- **Verification:** `shadow-check.js --docs --report` shows zero DOC-PHRASE/MIRROR-DRIFT findings for PROJECT.md
- **Committed in:** `e152f7f` (Task 1 commit)

**2. [Rule 1 - Consistency] Reworded ARCHITECTURE.md's Global-state bullet to avoid self-contradiction**
- **Found during:** Task 2
- **Issue:** The plan asked to add "window.NT is the one shared global" to the existing Global-state bullet, but the bullet's own retained sentence said "no module-level singletons shared between tools" — which `window.NT` literally is
- **Fix:** Reworded the retained sentence to scope it to tool-owned UI/animation state ("no tool shares its own state via a module-level singleton") before appending the new `window.NT` sentence
- **Files modified:** `.planning/codebase/ARCHITECTURE.md`, `.claude/CLAUDE.md` (mirror)
- **Verification:** Re-read passage; no remaining internal contradiction
- **Committed in:** `987813a` (Task 2 commit)

**3. [Rule 1 - Consistency] Updated STRUCTURE.md's shared-asset-file count**
- **Found during:** Task 3
- **Issue:** Adding five `nt-*.js` files to the `assets/` tree left the tree's own summary line ("...+ 2 shared asset files") contradicting the seven files now listed two lines above
- **Fix:** Updated the count to "7 shared asset files"
- **Files modified:** `.planning/codebase/STRUCTURE.md`
- **Verification:** Visual re-check of the tree block
- **Committed in:** `8be43b6` (Task 3 commit)

---

**Total deviations:** 3 auto-fixed (all Rule 1 — internal-consistency wording fixes surfaced while making the plan's own requested edits, no scope change).
**Impact on plan:** None of the three changed any file, section boundary, or acceptance criterion beyond what the plan already specified for that task; each just prevented the requested rewrite from reading as self-contradictory.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `shadow-check.js --docs` is clean (exit 0) and stays part of the phase's verification toolchain for any future doc touch-up.
- Phase 4 (Continued Fractions) and Phase 6 (Multi-Language Support/translations) can now be planned directly against the documented shared-module architecture — including the `nt-i18n.js`/`NT.i18n` pattern CLAUDE.md names for Phase 6 specifically.
- Ready for 07-09 (real-browser Claude-in-Chrome verification pass, per 07-VALIDATION.md's Per-Task Verification Map) — the final plan in this phase.

## Self-Check: PASSED

- `CLAUDE.md` exists: FOUND
- `.planning/PROJECT.md` exists: FOUND
- `.claude/CLAUDE.md` exists: FOUND
- `.planning/codebase/ARCHITECTURE.md` exists: FOUND
- `.planning/codebase/CONVENTIONS.md` exists: FOUND
- `.planning/codebase/STACK.md` exists: FOUND
- `.planning/codebase/STRUCTURE.md` exists: FOUND
- `.planning/codebase/CONCERNS.md` exists: FOUND
- `.planning/codebase/TESTING.md` exists: FOUND
- Commit `e152f7f` in git log: FOUND
- Commit `987813a` in git log: FOUND
- Commit `8be43b6` in git log: FOUND
- `node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs`: exits 0, `SHADOW-CHECK PASS --docs`
- `git diff --name-only e152f7f^..8be43b6 -- '.planning/phases/0[1-6]*' .planning/quick .planning/REQUIREMENTS.md .planning/ROADMAP.md`: empty (no archived-phase edits)

---
*Phase: 07-shared-js-module-refactor*
*Completed: 2026-09-30*
