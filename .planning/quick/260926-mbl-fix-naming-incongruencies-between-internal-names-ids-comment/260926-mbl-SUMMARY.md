---
phase: quick-260926-mbl
plan: 01
subsystem: ui
tags: [html, static-site, naming, refactor, git-mv]

# Dependency graph
requires:
  - phase: quick-260926-mbm
    provides: Venn Diagram tool's extended prime palette (edits Venn Diagrams/venn-diagrams.html mid-file, distinct region from this plan's nav/title edits)
  - phase: quick-260926-mbn
    provides: Diffie-Hellman Eve travel animation (edits diffie-hellman-key-exchange.html mid-file, distinct region from this plan's nav edits)
provides:
  - Canonical singular "Venn Diagram" label across all eight pages (title, h1, hub card, all nav links)
  - "Pizza Slices/pizza-slices.html" renamed via git mv to "Congruence Wheel/congruence-wheel.html" with tracked history preserved
  - All nine in-repo hrefs pointing at the Congruence Wheel repointed to the new path
  - Caption element id renamed slice-caption -> wheel-caption in both markup and script
  - Living docs (CLAUDE.md, .claude/CLAUDE.md, .planning/codebase/*.md) repathed to the new location
  - Stale "Christmas Trees" cell in ARCHITECTURE.md's ASCII diagram fixed
affects: [naming-conventions, nav-links, living-docs]

# Actuals (#2632)
actuals:
  tokens: 8980
  tasks: 3
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Directory/file rename via git mv with tracked-history preservation (repeats the Christmas Trees -> Factor Tree precedent)"
    - "Element id joins an existing id family (wheel-caption alongside wheel/wheel-dynamic) rather than inventing a new vocabulary"

key-files:
  created: []
  modified:
    - "Venn Diagrams/venn-diagrams.html"
    - "index.html"
    - "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
    - "Factor Tree/factor-tree.html"
    - "Factorize By Completing The Square/factorize-completing-square.html"
    - "Congruence Wheel/congruence-wheel.html"
    - "RSA Examplifier/rsa-examplifier.html"
    - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
    - "CLAUDE.md"
    - ".claude/CLAUDE.md"
    - ".planning/codebase/ARCHITECTURE.md"
    - ".planning/codebase/STRUCTURE.md"
    - ".planning/codebase/CONVENTIONS.md"
    - ".planning/codebase/CONCERNS.md"
    - ".planning/codebase/TESTING.md"
    - ".planning/codebase/STACK.md"
    - ".planning/codebase/INTEGRATIONS.md"

key-decisions:
  - "The Venn tool's directory and filename keep their plural form (Venn Diagrams/venn-diagrams.html), deliberately NOT renamed to singular — a plural-vs-singular nit does not justify the URL-break risk, and it would collide head-on with sibling batch item 260926-mbm editing that exact file. Flagged as a possible follow-up, not silently dropped."
  - "The three venn-diagrams* localStorage keys (venn-diagrams, venn-diagrams-three, venn-diagrams-mode) keep their legacy plural slug on purpose — renaming them would silently reset a returning user's placed primes and two/three-circle mode choice. Documented with an inline comment at each declaration instead. Flagged as a possible follow-up, not silently dropped."
  - "The Congruence Wheel directory rename (Pizza Slices/ -> Congruence Wheel/) does break any pre-existing bookmark or deep link to the old path (now 404s) — accepted on the precedent of the earlier Christmas Trees/ -> Factor Tree/ rename, which made the same tradeoff for the same reason (static educational site, no published permalink contract)."
  - "TESTING.md's transitional '## Pizza Slices / Congruence Wheel' headings were collapsed to the single canonical '## Congruence Wheel' rather than mechanically becoming 'Congruence Wheel / Congruence Wheel' — the slash-pairing existed only because the directory hadn't caught up to the public name yet; now that it has, the redundant old name serves no purpose."

requirements-completed: [NAV-01, QUICK-NAMING-01]

coverage:
  - id: D1
    description: "Venn tool reads 'Venn Diagram' (singular, no qualifier) on every surface across all eight pages: title, h1, hub card heading, and every nav label"
    requirement: "QUICK-NAMING-01"
    verification:
      - kind: other
        ref: "grep gate: no 'Prime Venn' or '>Venn Diagrams<' anywhere in *.html */*.html; exactly 8 files render '>Venn Diagram<'; exactly 8 files still link to venn-diagrams.html"
        status: pass
    human_judgment: false
  - id: D2
    description: "Congruence Wheel directory and filename renamed via git mv (Pizza Slices/pizza-slices.html -> Congruence Wheel/congruence-wheel.html), tracked history preserved, all nine in-repo links repointed, caption id renamed slice-caption -> wheel-caption"
    requirement: "QUICK-NAMING-01"
    verification:
      - kind: other
        ref: "grep gate: Congruence Wheel/congruence-wheel.html exists, Pizza Slices/ gone, no 'pizza' substring anywhere in shipped html, exactly 7 files carry the full new path (self-link is bare), wheel-caption present in both markup and script, congruence-wheel storage key untouched; git log --follow confirms history followed the rename"
        status: pass
    human_judgment: false
  - id: D3
    description: "Living docs (CLAUDE.md, .claude/CLAUDE.md, .planning/codebase/*.md) repathed to the new Congruence Wheel location; stale Christmas Trees diagram cell fixed; sector/wedge visual-metaphor prose and Mountains of Christmas font name left verbatim"
    requirement: "QUICK-NAMING-01"
    verification:
      - kind: other
        ref: "grep gate: no 'Pizza Slices|pizza-slices|Christmas Trees' anywhere in CLAUDE.md, .claude/CLAUDE.md, .planning/codebase/; at least one doc carries the new full path"
        status: pass
    human_judgment: false
  - id: D4
    description: "NAV-01 preserved: all eight pages still carry eight nav links with exactly one marked is-active; repo still holds exactly eight shipped .html files"
    requirement: "NAV-01"
    verification:
      - kind: other
        ref: "grep gate: no page missing 'site-nav-link is-active'; ls count of *.html */*.html equals 8"
        status: pass
    human_judgment: false
  - id: D5
    description: "Browser-level confirmation that the renamed tool loads at its new path (no 404), Congruence Wheel and Venn Diagram localStorage state survives the rename untouched, and every page's nav still highlights itself and links correctly"
    human_judgment: true
    rationale: "Requires opening file:// pages in an actual browser, exercising sliders/prime placement, reloading, and visually confirming persisted state and nav highlighting — this is exactly the deferred human-check the plan's own <verification> section specifies for end-of-phase review; no test runner exists in this repo to automate it."

duration: 12min
completed: 2026-09-26
status: complete
---

# Quick Task 260926-mbl: Fix Naming Incongruencies Summary

**Renamed the Congruence Wheel tool's directory and file (Pizza Slices -> Congruence Wheel via git mv, history preserved), canonicalized the Venn tool's public name to singular "Venn Diagram" across all eight pages, and repathed every living doc to match — while deliberately leaving the Venn directory/filename and its three localStorage keys on their legacy plural form.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-09-26T17:07:00Z (approx.)
- **Completed:** 2026-09-26T17:19:48Z
- **Tasks:** 3
- **Files modified:** 18 (8 tool `.html` files, `index.html`, 9 living docs), plus 2 files (`.html` + `CLAUDE_RESUME_COMMAND`) moved via `git mv`

## Accomplishments
- Every one of the eight shipped `.html` pages now renders the exact label `Venn Diagram` (title, h1, hub card, and all eight nav links) — the plural `Venn Diagrams` and the `Prime Venn Diagram` qualifier are gone from every shipped page.
- `Pizza Slices/pizza-slices.html` is now `Congruence Wheel/congruence-wheel.html`, moved with `git mv` (twice — directory then file) so tracked history follows; all nine in-repo `href`s across `index.html` and the seven sibling tool pages point at the new location, and the tool's own self-nav link is now the bare `congruence-wheel.html` matching every other tool's self-link convention.
- The last pre-rename internal identifier in the Congruence Wheel tool — `slice-caption` — is now `wheel-caption` in both the markup and the script, joining the file's existing `wheel`/`wheel-dynamic` id family.
- Nine living-doc files (`CLAUDE.md`, `.claude/CLAUDE.md`, and all six `.planning/codebase/*.md` files touched, plus `STACK.md`/`INTEGRATIONS.md`) now path to `Congruence Wheel/congruence-wheel.html` instead of the retired path, and the stale `Christmas Trees` cell left over from an earlier rename is fixed in `ARCHITECTURE.md`'s component diagram.
- No `localStorage` key changed value anywhere: `congruence-wheel` was already correct and stayed untouched; the three `venn-diagrams*` keys keep their legacy plural slugs, each now carrying an inline comment explaining why (returning users' saved primes and circle-mode choice would otherwise silently reset).

## Task Commits

Each task was committed atomically:

1. **Task 1: Venn tool reads "Venn Diagram" on every surface, all eight pages** - `0cb7bca` (feat)
2. **Task 2: Rename the Congruence Wheel directory, file, and caption id to match its public name** - `5a65c36` (feat)
3. **Task 3: Repath the living docs and run the repo-wide naming gate** - `481d5d0` (docs)

_No TDD tasks in this plan — all edits were static text/path changes with no test suite to drive._

## Files Created/Modified
- `Venn Diagrams/venn-diagrams.html` - Dropped "Prime" from title/h1, singularized self-nav label, added compatibility comments above all three legacy storage-key declarations, repointed its Congruence Wheel nav link to the new path
- `index.html` - Singularized Venn nav label and hub card heading; repointed Congruence Wheel nav + hub card hrefs; changed hub copy "slice" -> "wedge" to match the tool's own vocabulary
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`, `Factor Tree/factor-tree.html`, `Factorize By Completing The Square/factorize-completing-square.html`, `RSA Examplifier/rsa-examplifier.html`, `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` - Singularized Venn nav link text; repointed Congruence Wheel nav href to the new path
- `Congruence Wheel/congruence-wheel.html` (renamed from `Pizza Slices/pizza-slices.html` via `git mv`, history preserved) - Self-nav href now bare `congruence-wheel.html`; caption id `slice-caption` -> `wheel-caption` in markup and script
- `Congruence Wheel/CLAUDE_RESUME_COMMAND` (renamed from `Pizza Slices/CLAUDE_RESUME_COMMAND` via `git mv`) - Contents untouched, rode along with the directory move
- `CLAUDE.md` - Repathed the tool inventory bullet to the new location, kept "pizza-slice sectors" visual-metaphor prose verbatim
- `.claude/CLAUDE.md` - Repathed naming-pattern examples and component-responsibility table row
- `.planning/codebase/ARCHITECTURE.md` - Repathed three references plus fixed the stale `Christmas Trees` / `Pizza Slices` cell in the ASCII component diagram
- `.planning/codebase/STRUCTURE.md` - Repathed directory tree entry, section heading, key-files list, entry-points list, and two prose examples
- `.planning/codebase/CONVENTIONS.md` - Repathed two naming-pattern example lists
- `.planning/codebase/CONCERNS.md` - Repathed six file-reference lists across concern entries
- `.planning/codebase/TESTING.md` - Repathed the manual-open command and collapsed two transitional "Pizza Slices / Congruence Wheel" headings to the single canonical name
- `.planning/codebase/STACK.md` - Repathed the localStorage-key ownership note
- `.planning/codebase/INTEGRATIONS.md` - Repathed three font-sharing bullets and the localStorage-key description

## Decisions Made
See `key-decisions` in frontmatter — summarized: (1) Venn directory/filename stay plural (URL-break risk plus a direct file collision with sibling batch item 260926-mbm); (2) the three `venn-diagrams*` storage keys stay on their legacy slug (compatibility); (3) the Congruence Wheel rename does break old bookmarks of the retired path, accepted on the `Christmas Trees` -> `Factor Tree` precedent; (4) TESTING.md's transitional dual-name headings were collapsed to the single canonical name rather than mechanically duplicated.

## Deviations from Plan

None - plan executed exactly as written. All three tasks' automated verification gates passed on first run; no auto-fixes, no blocking issues, no architectural questions arose.

## Issues Encountered
None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- The repo now has exactly one name per tool across every surface (`Venn Diagram`, `Congruence Wheel`), matching NAV-01's intent that nav labels and tool identity stay in lockstep.
- Two flagged non-changes remain as possible follow-ups for the developer to decide on later: singularizing the Venn directory/filename, and renaming the three `venn-diagrams*` localStorage keys. Neither blocks any other work.
- No blockers for subsequent quick tasks or roadmap phases.

---
*Phase: quick-260926-mbl*
*Completed: 2026-09-26*

## Self-Check: PASSED

- FOUND: `Congruence Wheel/congruence-wheel.html`
- CONFIRMED ABSENT: `Pizza Slices/`
- FOUND: `Congruence Wheel/CLAUDE_RESUME_COMMAND`
- FOUND: `Venn Diagrams/venn-diagrams.html` (unchanged path, per plan)
- FOUND commit: `0cb7bca` (Task 1)
- FOUND commit: `5a65c36` (Task 2)
- FOUND commit: `481d5d0` (Task 3)
