---
phase: quick-260928-r1u
plan: 01
subsystem: ui
tags: [static-html, navigation, rename, git-mv]

requires:
  - phase: quick-260928-fdz
    provides: canonical nav pill order (12 pages) that this rename edits in place, unreordered
provides:
  - Cayley Table Generator/cayley-table-generator.html renamed to Cayley Table/cayley-table.html (git mv, history preserved via --follow)
  - "<title>, <h1>, hub card <h2>, and all twelve site-wide nav labels read the two-word name Cayley Table"
  - Equivalence Wheel two-way cross-link (static anchor + updateCayleyXref() JS builder) repointed to the new path, mode/n query-param logic unchanged
  - localStorage key 'cayley-table' left untouched — returning visitors keep their saved modulus/group mode
affects: [quick-260928-r1v, quick-260928-r1w]

actuals:
  tokens: 5500
  tasks: 2
  commits: 1
  plan_head_before: 30ba006eac14e34c4416016d4b4aca5993b947e0
  plan_head_after: 7ea4b5e59d519ae9d8a454fab6cbd2172eaa4826

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - "Cayley Table/cayley-table.html (renamed from Cayley Table Generator/cayley-table-generator.html)"
    - "index.html"
    - "Equivalence Wheel/equivalence-wheel.html"
    - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
    - "Euclidean Algorithm/euclidean-algorithm.html"
    - "Factor Tree/factor-tree.html"
    - "Fermats Method/fermats-method.html"
    - "RSA/rsa.html"
    - "Shors Algorithm/shors-algorithm.html"
    - "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
    - "Square And Multiply/square-and-multiply.html"
    - "Venn Diagrams/venn-diagrams.html"

key-decisions:
  - "Used two git mv calls (directory, then file) rather than mkdir+copy, so git rename detection recorded exactly one R099 rename and --follow history stayed intact across all 11 prior commits."
  - "Moved and repointed all 18 references in a single commit rather than splitting the move from the link fixes, since a half-renamed state would leave nine pages with dead nav links."

requirements-completed: [NAV-01, NAV-03]

coverage:
  - id: D1
    description: "Tool directory and file renamed from 'Cayley Table Generator/cayley-table-generator.html' to 'Cayley Table/cayley-table.html' via git mv, with history preserved"
    requirement: NAV-01
    verification:
      - kind: other
        ref: "git show --name-status -M --format= HEAD | grep '^R' -> exactly 1 rename; git log --follow --oneline -- 'Cayley Table/cayley-table.html' -> 11 commits"
        status: pass
    human_judgment: false
  - id: D2
    description: "All twelve site pages' nav bars, the hub card, and the tool's own title/h1 read the two-word name Cayley Table, with exactly one active pill per page and zero broken in-repo hrefs"
    requirement: NAV-03
    verification:
      - kind: other
        ref: "git grep -oh 'Cayley Table/cayley-table\\.html' -- '*.html' -> 14; git grep -oh 'class=\"site-nav-link[^\"]*\">Cayley Table<' -- '*.html' -> 12; git grep -oh 'class=\"site-nav-link is-active\"' -- '*.html' -> 12; href-resolution scan over all tracked+untracked .html files -> 0 broken links"
        status: pass
    human_judgment: false
  - id: D3
    description: "Equivalence Wheel two-way cross-link (static anchor + JS query-param builder) still resolves and still carries ?mode=/&n=; storage key 'cayley-table' and regenerate() untouched so returning visitors keep saved state"
    verification:
      - kind: other
        ref: "git grep -q 'function regenerate' -- 'Cayley Table/cayley-table.html'; git grep -q 'encodeURIComponent(state.mode)' -- 'Equivalence Wheel/equivalence-wheel.html'; git grep -oh \"'cayley-table'\" -- 'Cayley Table/cayley-table.html' -> 3"
        status: pass
    human_judgment: true
    rationale: "Automated checks confirm the storage key, query-param builder, and function name are byte-preserved and the hrefs resolve, but actually loading both pages in a browser, round-tripping the cross-link in both directions, and confirming a saved modulus/mode survives reload requires visual/interactive confirmation this text-only executor session cannot perform."

duration: 12min
completed: 2026-09-28
status: complete
---

# Quick Batch Item 260928-r1u: Rename Cayley Table Generator to Cayley Table Summary

**Renamed the tool's directory, file, title, heading, hub card, and all twelve site-wide nav links from "Cayley Table Generator" to "Cayley Table" in a single atomic git-mv commit, preserving file history and leaving the localStorage key, `regenerate()`, and the Equivalence Wheel cross-link's query-param builder untouched.**

## Performance

- **Duration:** 12 min
- **Tasks:** 2
- **Files modified:** 12 (1 renamed, 11 edited in place)

## Accomplishments
- `Cayley Table Generator/cayley-table-generator.html` renamed to `Cayley Table/cayley-table.html` via `git mv` (two calls: directory, then file), recorded as a single R099 rename with `git log --follow` showing all 11 prior commits intact
- Tool's own `<title>`, self-nav pill (unqualified href, `is-active` class preserved), and `<h1>` all updated to the two-word name
- `index.html` hub nav link, hub card href, and hub card `<h2>` repointed/relabeled (card icon and descriptive paragraph left untouched)
- `Equivalence Wheel/equivalence-wheel.html` nav link, static `xref` anchor, and the `updateCayleyXref()` JS path string all repointed — the `?mode=`/`&n=` concatenation and both `encodeURIComponent` calls preserved exactly
- Nine sibling pages' single nav `<a>` each updated to `../Cayley Table/cayley-table.html` / `Cayley Table` label, at their original baseline line numbers, preserving nav order and indentation
- Task 2 scope-guard sweep (tracked + untracked, HTML + non-HTML, repo-wide) confirmed the retired three-word name exists nowhere outside `.planning/` — no stray references found, no fix commit needed

## Task Commits

1. **Task 1: git mv the tool and repoint all 18 references in one atomic commit** - `7ea4b5e` (feat)
2. **Task 2: Final scope-guard sweep for stray references** - no commit (clean audit, no stray references found)

## Files Created/Modified
- `Cayley Table/cayley-table.html` - renamed from `Cayley Table Generator/cayley-table-generator.html`; title, self-nav pill, h1 updated
- `index.html` - nav link, hub card href, hub card h2 repointed/relabeled
- `Equivalence Wheel/equivalence-wheel.html` - nav link, xref anchor, `updateCayleyXref()` JS builder repointed
- `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` - nav link repointed
- `Euclidean Algorithm/euclidean-algorithm.html` - nav link repointed
- `Factor Tree/factor-tree.html` - nav link repointed
- `Fermats Method/fermats-method.html` - nav link repointed
- `RSA/rsa.html` - nav link repointed
- `Shors Algorithm/shors-algorithm.html` - nav link repointed
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` - nav link repointed
- `Square And Multiply/square-and-multiply.html` - nav link repointed
- `Venn Diagrams/venn-diagrams.html` - nav link repointed

## Decisions Made
- Used two `git mv` calls (directory, then file) instead of `mkdir`+copy, so git's rename detection recorded exactly one R-status rename and `--follow` history stayed intact.
- Bundled the move and all 18 repoints into one commit — a half-renamed intermediate state would have left nine pages with dead nav links, which must never be a commit anyone can check out.

## Deviations from Plan

None - plan executed exactly as written. Task 2's audit found zero stray references, matching the plan's baseline expectation; no fix commit was needed.

## Issues Encountered

Sandboxed `Bash` tool rejected several compound `git ... | ...` / `VAR=$(git ...)` commands run from inside this worktree as "too complex to verify worktree containment." Worked around by splitting each into plain single-purpose `git` invocations (no pipes, no command substitution around `git`) and writing intermediate output to small scratch/temp files instead, which the sandbox permitted. No functional impact — all planned verification checks still ran and passed.

## For the Batch Orchestrator (per plan's `<output>` spec)

- **Files touched (all 12 carry a nav bar; siblings 260928-r1v and 260928-r1w also edit these same files):** `Cayley Table/cayley-table.html` (renamed), `index.html`, `Equivalence Wheel/equivalence-wheel.html`, `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html`, `Euclidean Algorithm/euclidean-algorithm.html`, `Factor Tree/factor-tree.html`, `Fermats Method/fermats-method.html`, `RSA/rsa.html`, `Shors Algorithm/shors-algorithm.html`, `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`, `Square And Multiply/square-and-multiply.html`, `Venn Diagrams/venn-diagrams.html`.
- **Task 2 sweep result:** clean — zero stray references to the retired name found anywhere in the working tree outside `.planning/` (tracked or untracked, HTML or non-HTML). No fix commit was made.
- **Confirmed in place for 260928-r1w:** `Cayley Table/cayley-table.html` exists at the new path, and the `localStorage` key `'cayley-table'` is unchanged (3 literal occurrences preserved in the moved file) — both are exactly what 260928-r1w depends on.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

`Cayley Table/cayley-table.html` and its stable `cayley-table` storage key are in place for batch item 260928-r1w to build shared state on. Sibling batch items 260928-r1v and 260928-r1w touch the same 12 nav-bar files — the orchestrator should sequence or merge carefully to avoid conflicting edits on the same lines.

---
*Phase: quick-260928-r1u*
*Completed: 2026-09-28*

## Self-Check: PASSED

- FOUND: `Cayley Table/cayley-table.html`
- FOUND: commit `7ea4b5e`
