---
phase: quick-260930-pin
plan: 01
subsystem: docs
tags: [project-conventions, claude-md, codebase-map, i18n-prep]

requires: []
provides:
  - "Repo policy no longer prohibits shared JS logic modules — per-file duplication is documented as the default, not a hard constraint"
  - "A shared JS logic module under assets/ is now an explicitly allowed engineering choice, named for the upcoming Phase 6 (Multi-Language Support) translation dictionary"
affects: ["06-multi-language-support"]

actuals:
  tokens: 2400
  tasks: 3
  commits: 3
  plan_head_before: e1af69d
  plan_head_after: fc5d1c0

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - CLAUDE.md
    - .planning/PROJECT.md
    - .planning/codebase/ARCHITECTURE.md
    - .planning/codebase/CONVENTIONS.md
    - .claude/CLAUDE.md

key-decisions:
  - "Scope expanded from the 3 files named in the task to 5: .claude/CLAUDE.md is GSD-generated from .planning/PROJECT.md and .planning/codebase/{ARCHITECTURE,CONVENTIONS}.md via <!-- GSD:*-start source:... --> markers, so editing only the generated file would have been silently reverted by the next /gsd-docs-update or /gsd-map-codebase run"
  - "The 'Architectural Smell: Copy-Paste Math Functions' anti-pattern section in .claude/CLAUDE.md is heading-only — its body prose lives only in .planning/codebase/ARCHITECTURE.md, so that source file's 'Do this instead' paragraph was reworded (heading, 'What happens', and 'Why it's wrong' paragraphs left untouched)"
  - "Per-file duplication kept as the documented default for a tool's own math/rendering logic; only the prohibition on sharing was lifted — a shared module under assets/ is now a deliberate, allowed choice, not the new default"
  - "Historical rationale for why duplication was originally chosen preserved verbatim in all three source docs (CLAUDE.md, PROJECT.md, ARCHITECTURE.md)"
  - "All historical records that quote the old rule (.planning/phases/**, .planning/quick/**, .planning/research/**, STATE.md log rows) deliberately left untouched — they document decisions made under the old policy and rewriting them would falsify that history"

patterns-established: []

requirements-completed: ["QUICK-260930-pin"]

coverage:
  - id: D1
    description: "CLAUDE.md and .planning/PROJECT.md's human-authored policy bullets reworded to permit a shared JS logic module under assets/, with historical duplication rationale preserved"
    requirement: "QUICK-260930-pin"
    verification:
      - kind: other
        ref: "grep -cF 'shared JS logic module' CLAUDE.md .planning/PROJECT.md; grep -cF 'unless explicitly asked' / 'one intentional exception' / 'not extracted into a shared module' (all zero)"
        status: pass
    human_judgment: false
  - id: D2
    description: ".planning/codebase/ARCHITECTURE.md (Dependency isolation constraint + Copy-Paste Math Functions anti-pattern remedy) and .planning/codebase/CONVENTIONS.md (Import Organization bullet) reworded to match"
    requirement: "QUICK-260930-pin"
    verification:
      - kind: other
        ref: "grep -cF 'shared JS logic module' on both files; anti-pattern heading/What-happens/Why-it's-wrong/four numbered steps and CONVENTIONS.md's SVG Helper label all preserved byte-identical"
        status: pass
    human_judgment: false
  - id: D3
    description: ".claude/CLAUDE.md's three generated mirror lines resynced to be byte-identical to their generation sources, so a future doc regeneration is a no-op rather than a silent revert"
    requirement: "QUICK-260930-pin"
    verification:
      - kind: other
        ref: "diff between each of the 3 mirror lines in .claude/CLAUDE.md and its source sentence in PROJECT.md/CONVENTIONS.md/ARCHITECTURE.md — all exit 0; all 14 GSD:*-start/-end markers intact"
        status: pass
    human_judgment: false

duration: ~8min (executor) + manual merge
completed: 2026-09-30
status: complete
---

# Quick Task 260930-pin: Remove "No Shared JS Modules for Logic" Constraint — Summary

**Retired the repo-wide policy that prohibited shared JS logic modules across tool pages. Per-file duplication of math/rendering logic stays the documented default (kept for its original single-file-per-tool rationale), but a shared module under `assets/` — e.g. a site-wide translation dictionary — is now an explicitly allowed engineering choice rather than something requiring the user to "explicitly ask" for an exception.**

This was a prerequisite for planning Phase 6 (Multi-Language Support): translating UI strings across ~16 pages into 5 languages is the wrong problem to solve by duplicating a translation dictionary into every tool file.

## Performance

- **Tasks:** 3
- **Files modified:** 5 (`CLAUDE.md`, `.planning/PROJECT.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONVENTIONS.md`, `.claude/CLAUDE.md`)
- **Commits:** 3 (executed in an isolated worktree, merged back into `main` via `git merge --no-ff`)

## Accomplishments

- **Task 1** — Reworded the two human-authored policy docs: `CLAUDE.md`'s final "Working with this codebase" bullet, and `.planning/PROJECT.md`'s "Repo convention" context bullet plus its "Architecture" constraints bullet. Each now states duplication is the default, not a hard rule, and names a shared JS logic module under `assets/` as an allowed choice (translation dictionary given as the motivating example).
- **Task 2** — Discovered `.claude/CLAUDE.md` is GSD-generated from these same docs (`<!-- GSD:project-start -->`, `<!-- GSD:conventions-start -->`, `<!-- GSD:architecture-start -->` markers) plus `.planning/codebase/ARCHITECTURE.md` and `CONVENTIONS.md`, which the original task description hadn't named. Reworded `CONVENTIONS.md`'s Import Organization math-utility bullet and `ARCHITECTURE.md`'s "Dependency isolation" constraint, and specifically the "Do this instead" lead-in of the "Copy-Paste Math Functions" anti-pattern section (its heading, "What happens", "Why it's wrong", and four numbered steps left untouched — the remedy procedure is still correct for functions that remain duplicated).
- **Task 3** — Resynced the three generated mirror lines inside `.claude/CLAUDE.md` to be byte-identical to their now-updated sources, so a future `/gsd-docs-update` or `/gsd-map-codebase` regeneration won't silently restore the old prohibition. All 14 `GSD:*-start`/`-end` markers left intact.

## Task Commits

1. **Task 1: Human-authored policy docs** — `ebc3637`
2. **Task 2: Codebase-map generation sources** — `4e8ab54`
3. **Task 3: Resync generated mirror lines** — `fc5d1c0`

(All three executed in an isolated worktree forked from a slightly stale base — `origin/HEAD` predated this session's Phase 6 roadmap commit — then merged back into `main` with `git merge --no-ff`; the merge was conflict-free since the two commit ranges touched disjoint files.)

## Files Created/Modified

- `CLAUDE.md` — final bullet reworded
- `.planning/PROJECT.md` — Context "Repo convention" bullet + Constraints "Architecture" bullet reworded
- `.planning/codebase/ARCHITECTURE.md` — "Dependency isolation" bullet + "Copy-Paste Math Functions" remedy paragraph reworded
- `.planning/codebase/CONVENTIONS.md` — Import Organization math-utility bullet reworded
- `.claude/CLAUDE.md` — three generated mirror lines resynced to match sources

## Decisions Made

See `key-decisions` in frontmatter.

## Deviations from Plan

None — all three tasks' verification gates passed on the first attempt with the exact replacement text specified in the plan (per executor report). The plan itself had already expanded scope from 3 to 5 files during planning (documented in its own `<objective>` "Scope note"), so this was absorbed at planning time, not as an execution-time deviation.

## Issues Encountered

- **Worktree base mismatch:** the isolated executor forked from `origin/HEAD` (`e1af69d`), which predated this session's own `b372fa8` (Phase 6 roadmap addition) commit on local `main`. Verified the two commit ranges touch disjoint files before merging; `git merge --no-ff` completed with zero conflicts.
- **Lost uncommitted SUMMARY.md:** the executor left `260930-pin-SUMMARY.md` uncommitted in the worktree per instructions (orchestrator handles the docs commit); the worktree was then removed with `--force` before copying it out, so this file was reconstructed from the executor's final task-completion report rather than copied verbatim.

## User Setup Required

None.

## Next Phase Readiness

- Phase 6 (Multi-Language Support) can now be planned assuming a shared translation-dictionary module under `assets/` is an available architectural option, not a documented violation.
- No `.html` file or `assets/` file was touched by this task — zero behavioral change to the site.

---
*Phase: quick-260930-pin*
*Completed: 2026-09-30*
