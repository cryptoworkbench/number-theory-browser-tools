---
phase: quick-260927-ick
plan: 01
subsystem: ui
tags: [svg, css-custom-properties, theming, nav-header, favicon]

requires: []
provides:
  - Inline SVG twin of assets/favicon.svg used as the nav-header brand mark on all ten pages
  - --st-header-accent-ink token in assets/site.css
  - .brand-icon / .brand-icon-plate / .brand-icon-digit shared CSS rules
affects: [nav-header, site-chrome, assets/site.css]

actuals:
  tokens: 3368
  tasks: 2
  commits: 2
  plan_head_before: f797471afb1a79786c48b451f62b17e05f3fbae8
  plan_head_after: ad36d8c23a5260d29309fb431a34227b26d67d6e

tech-stack:
  added: []
  patterns:
    - "Inline SVG chrome mark styled entirely through var() against assets/palette.css, with a paired *-ink token declared alongside the base accent token for text/marks drawn on that fill"

key-files:
  created: []
  modified:
    - assets/site.css
    - index.html
    - Congruence Wheel/congruence-wheel.html
    - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
    - Factorize By Completing The Square/factorize-completing-square.html
    - Factor Tree/factor-tree.html
    - RSA/rsa.html
    - Shors Algorithm/shors-algorithm.html
    - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
    - Square And Multiply/square-and-multiply.html
    - Venn Diagrams/venn-diagrams.html

key-decisions:
  - "Headless-Chrome measurement harness built under /tmp (never in the working tree) with a single-invocation-per-(page,width,theme) design (40 Chrome processes) rather than one process walking all 10 pages per run, after the combined-process design was found to stall unpredictably"
  - "Harness settle-wait switched from double requestAnimationFrame to a plain setTimeout(50ms): rAF callbacks never fire under headless virtual-time budgeting for at least one page (Factorize by Completing the Square) that has no perpetual CSS/JS animation forcing a compositor frame, so rAF starves indefinitely regardless of budget size, while a timer always fires"

requirements-completed: [PAL-02, PAL-03, NAV-01, NAV-02]

coverage:
  - id: D1
    description: "Header brand mark on all ten pages is an inline SVG whose rect/text geometry is copied verbatim from assets/favicon.svg (same plate, corner radius, four digit positions)"
    requirement: "PAL-02"
    verification:
      - kind: other
        ref: "static geometry gate (check-brand.js) comparing each page's anchor slice against assets/favicon.svg, run against all 10 pages"
        status: pass
    human_judgment: false
  - id: D2
    description: "Header mark plate/digit colors resolve via var() to the palette's accent/accent-ink and differ between night and day themes"
    requirement: "PAL-03"
    verification:
      - kind: other
        ref: "headless-Chrome rendered gate (compare.js) checking computed fill against assets/palette.css accent/accent-ink tokens for both themes, across all 10 pages"
        status: pass
    human_judgment: false
  - id: D3
    description: "Header height unchanged at 1280px and 400px in both themes on all ten pages; glyph U+1F522 removed from every HTML file; assets/favicon.svg blob untouched"
    requirement: "NAV-01"
    verification:
      - kind: other
        ref: "measure.sh + compare.js header-height equality check across 10 pages x 2 widths x 2 themes (40 records); grep for U+1F522 across all .html files; git hash-object assets/favicon.svg"
        status: pass
    human_judgment: false
  - id: D4
    description: "Visual confirmation the header mark and browser-tab favicon read as the same design, recolor with the theme toggle, and don't break layout at narrow widths"
    requirement: "NAV-02"
    verification:
      - kind: manual_procedural
        ref: "headless screenshots of index.html/RSA/Venn Diagrams at 1280px+400px in both themes, plus favicon.svg rendered standalone for side-by-side comparison"
        status: pass
    human_judgment: true
    rationale: "Visual design match ('reads as one mark') is a subjective judgment beyond what the geometry/color gates can assert; self-performed via screenshots in this auto-mode run, but the deliverable is inherently a visual one"

duration: ~50min
completed: 2026-09-27
status: complete
---

# Quick Task 260927-ick: Nav-header brand mark matches favicon Summary

**Replaced the emoji-based nav-header brand mark on all ten pages with an inline SVG twin of `assets/favicon.svg`, styled through the site's own `var()` palette so it recolors with the day/night toggle while the tab-icon favicon stays untouched.**

## Performance

- **Duration:** ~50 min (including building and debugging a throwaway headless-Chrome measurement harness)
- **Completed:** 2026-09-27T12:06:26Z
- **Tasks:** 2
- **Files modified:** 11 (`assets/site.css` + all 10 HTML pages)

## Accomplishments

- Added a paired `--st-header-accent-ink` token and three new CSS rules (`.brand-icon`, `.brand-icon-plate`, `.brand-icon-digit`) to `assets/site.css`, all colors resolving through `var()` — zero literal colors added
- Replaced the stock 🔢 (U+1F522) glyph in the `.site-brand` anchor on all ten pages with an inline `<svg>` whose `rect`/`text` geometry is copied verbatim from `assets/favicon.svg`
- Built and validated a headless-Chrome measurement harness (outside the repo, in `/tmp`) that proves, across all 10 pages x {1280px, 400px} x {night, day} = 40 combinations: header height is byte-identical to the pre-change baseline, the mark's plate/digit fills resolve to the palette's accent/accent-ink tokens, and those fills differ between themes
- Confirmed `assets/favicon.svg` is byte-for-byte untouched (`git hash-object` matches its pre-change blob in both task commits)

## Task Commits

1. **Task 1: Brand-icon styling in shared chrome, wired end-to-end on index.html, with a measurement harness** - `ca6538d` (feat)
2. **Task 2: Propagate the identical brand mark to the nine tool pages** - `ad36d8c` (feat)

_Plan metadata commit for `f797471` (docs: plan) was made by the planner, not this execution — per this run's constraints, the plan file was already committed and left as-is._

## Files Created/Modified

- `assets/site.css` - Added `--st-header-accent-ink` token and `.brand-icon`/`.brand-icon-plate`/`.brand-icon-digit` rules
- `index.html` - Brand anchor markup swapped from emoji text to inline SVG + `.site-brand-label` span
- `Congruence Wheel/congruence-wheel.html` - Same brand anchor swap (`../index.html` href)
- `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` - Same brand anchor swap
- `Factorize By Completing The Square/factorize-completing-square.html` - Same brand anchor swap
- `Factor Tree/factor-tree.html` - Same brand anchor swap
- `RSA/rsa.html` - Same brand anchor swap
- `Shors Algorithm/shors-algorithm.html` - Same brand anchor swap
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` - Same brand anchor swap
- `Square And Multiply/square-and-multiply.html` - Same brand anchor swap
- `Venn Diagrams/venn-diagrams.html` - Same brand anchor swap

## Decisions Made

- Built the plan's specified throwaway verification tooling (`probe-single.html`, `measure.sh`, `check-brand.js`, `compare.js`) entirely under `/tmp/brand-icon-260927-ick`, never inside the repo, per the plan's explicit tooling-isolation requirement.
- Switched the harness from one combined Chrome process walking all 10 pages to one process per (page, width, theme) — the documented fallback in the plan's Step A — after the combined design stalled non-deterministically partway through.
- Switched the harness's post-navigation "settle" wait from double `requestAnimationFrame` to a plain 50ms `setTimeout`: diagnosed that rAF never fires under headless virtual-time budgeting for at least one page lacking any perpetual CSS/JS animation to force a compositor frame, so rAF starved regardless of budget size (confirmed via a debug probe showing the first rAF callback only fired coincidentally alongside an unrelated fallback timer, ~6s late). This is harness-only tooling, not shipped code, so it isn't a plan deviation against the site itself.

## Deviations from Plan

None against the shipped site code — `assets/site.css` and all ten pages match the plan's specification exactly (verified by the static geometry gate and the rendered measurement gate). The only adjustments were to the throwaway verification harness's own mechanics (Chrome invocation shape and settle-wait strategy), described above, needed to get the plan's own verification gates to run reliably in this environment.

**Known pre-existing environmental condition (not caused by this task):** the plan's Task 1/Task 2 automated verify one-liners include a check that `git status --porcelain --untracked-files=all` contains no untracked path outside `.planning/` and `.gsd/`. An untracked file named `instructions` already existed at the repo root before this task began (confirmed identical in the pre-task git status snapshot) — leftover debris from an earlier session, unrelated to nav-header/favicon work, and its content (Congruence Wheel equivalence-class terminology + interactive addition feature) was already fully implemented and committed in an earlier quick task (`260927-eel`, per STATE.md). This task did not create it, does not touch it, and introduces no new untracked path. All other clauses of both verify one-liners pass individually when run: the `--st-header-accent-ink` grep, the favicon blob-hash check, the `assets/site.css` color-literal grep, the static geometry gate (`check-brand.js`), and the rendered measurement gate (`compare.js`) across all 10 pages.

## Issues Encountered

The headless-Chrome measurement harness (throwaway tooling, not committed) needed two rounds of debugging before it ran reliably:
1. `iframe.contentDocument` returned `null` for cross-directory `file://` navigations until `--allow-file-access-from-files` was added to the Chrome invocation.
2. A single combined Chrome process navigating an iframe through all 10 pages in sequence stalled non-deterministically after the first 1-2 page navigations; switched to one Chrome process per (page, width, theme) combination per the plan's documented fallback.
3. One page (`Factorize By Completing The Square`) consistently produced zero measurement output regardless of retries or virtual-time-budget size; root-caused to `requestAnimationFrame` never being invoked under headless virtual-time budgeting for a page with no perpetual animation forcing a compositor frame. Fixed by replacing the double-rAF settle wait with a plain `setTimeout(50ms)`, after which all 40 (page, width, theme) combinations measured cleanly and quickly (~40s total) for both the baseline and after passes.

All resolved; final measurement runs for both Task 1 (index.html only) and Task 2 (all 10 pages) completed cleanly with zero errors in the JSON records.

## Next Phase Readiness

The nav-header brand mark and the browser-tab favicon now share one geometry source of truth (`assets/favicon.svg`), read verbatim into every page's inline SVG copy. Any future favicon geometry edit that isn't mirrored into `assets/site.css`/the ten pages' inline SVGs would be caught by re-running `check-brand.js`, though that gate isn't wired into any ongoing CI (this repo has no build/test pipeline per CLAUDE.md) — it was throwaway tooling for this task and has been removed from `/tmp` after use. No blockers for subsequent work.

---
*Phase: quick-260927-ick*
*Completed: 2026-09-27*

## Self-Check: PASSED

All 11 claimed files found on disk; both task commit hashes (`ca6538d`, `ad36d8c`) found in git history.
