---
phase: 01-palette-unification
plan: 04
subsystem: ui
tags: [css, custom-properties, theming, design-tokens, day-night-mode]

# Dependency graph
requires:
  - phase: 01-palette-unification (plan 01)
    provides: "assets/palette.css single source of truth, and the token names/values every plan in this wave maps onto"
provides:
  - "Congruence Wheel (Pizza Slices/pizza-slices.html) fully unified onto assets/palette.css, in both day and night mode"
  - "Completing-the-square factorizer fully unified onto core + role tokens, with success/warn/special meanings matching the Sieve and RSA"
  - "index.html hub deduplicated onto the shared palette (pure deletion, no consumption-site edits needed)"
  - "Every page in the repo now renders entirely from assets/palette.css — phase 01's objective is complete after this plan"
affects: [01-05-PLAN]

# Actuals (#2632)
actuals:
  tokens: 3523
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Same core/role token mapping pattern as plans 01-01/01-02/01-03: local :root blocks deleted outright, consumption sites renamed to the equivalent palette token"
    - "Dynamic SVG attribute values set via JS string literals (svgEl(tag, {stroke:'var(--token)', ...})) are consumption sites too — they must be renamed in lockstep with the CSS declarations that define them, even though they live inside a <script> block"

key-files:
  created: []
  modified:
    - "Pizza Slices/pizza-slices.html"
    - "Factorize By Completing The Square/factorize-completing-square.html"
    - "index.html"

key-decisions:
  - "Plan's per-task <verify> included a byte-identical script-region hash intended to prove the polar-geometry/Fermat-trial-loop/playback logic was untouched. In both Pizza Slices and the completing-the-square tool, that hash target was computed against the file's pre-task state, which still contained 3 (resp. 3) var() references to the very tokens being deleted, embedded as literal JS strings inside svgEl() attribute objects. Deleting the :root blocks without touching those lines would have left `stroke:'var(--ring-a)'`-style attributes resolving to nothing — an invisible-diagram Rule 1 bug, and exactly the failure the plan's own T-01-04-b threat entry warns about. Fixed those 3 lines per file (pure token-name substitution, zero logic change) and accepted that the script-region hash verify would then report SCRIPT-CHANGED instead of SCRIPT-UNTOUCHED, since satisfying both constraints simultaneously was not possible given the file's actual content."
  - "index.html required no such tradeoff: it has no <script>-embedded color references, so its pure-deletion task passed every automated check including the markup-hash-unchanged assertion, with no deviation needed."
  - "Verification was performed via headless Chrome screenshots (google-chrome --headless --screenshot) in both day and night mode for all three pages, consistent with plan 01-01's precedent, since this is an autonomous/auto-mode execution with no interactive human available and this repo has no test runner."

patterns-established: []

requirements-completed: [PAL-01, PAL-02, PAL-03, PAL-04]

coverage:
  - id: D1
    description: "The Congruence Wheel (Pizza Slices/pizza-slices.html) renders entirely from assets/palette.css in both themes; its inverted :root=day/[data-theme=night]=override structure (unique to this page) no longer exists"
    requirement: "PAL-01"
    verification:
      - kind: unit
        ref: "bash: grep-based token-presence/absence check + literal-color sweep over pizza-slices.html (plan Task 1 automated <verify>) — all pass"
        status: pass
      - kind: automated_ui
        ref: "headless Chrome screenshots: Congruence Wheel in night mode and forced day mode (scratchpad shots/pizza-night.png, shots/pizza-day3.png) — wheel sectors, ring bands, selected-class highlight and header all correctly themed; day mode confirmed light, night mode confirmed dark"
        status: pass
    human_judgment: false
  - id: D2
    description: "The completing-the-square tool renders from core + role tokens in both themes; success (--role-result), failure/limit (--role-warn) and advanced/secondary (--role-special) colors match the meanings the Sieve and RSA use for the same roles"
    requirement: "PAL-04"
    verification:
      - kind: unit
        ref: "bash: grep-based token-presence/absence check + literal-color sweep over factorize-completing-square.html (plan Task 2 automated <verify>) — all pass"
        status: pass
      - kind: automated_ui
        ref: "headless Chrome screenshots: completing-the-square tool mid-result in night mode and forced day mode (scratchpad shots/square-night.png, shots/square-day.png) — success row, removed-corner warn dash, geometric diagram and result chips all legible and correctly themed"
        status: pass
    human_judgment: false
  - id: D3
    description: "index.html no longer declares its own copy of the eight core tokens; it consumes assets/palette.css directly with zero consumption-site edits, and renders unchanged apart from the day-mode --accent-2 alignment"
    requirement: "PAL-02"
    verification:
      - kind: unit
        ref: "bash: grep-based token-presence/absence check + literal-color sweep + markup-hash-unchanged check over index.html (plan Task 3 automated <verify>) — all pass, including the byte-identical markup hash"
        status: pass
      - kind: automated_ui
        ref: "headless Chrome screenshots: hub in night mode and forced day mode (scratchpad shots/hub-night.png, shots/hub-day.png) — hero, tool card grid and header render correctly in both themes"
        status: pass
    human_judgment: false

duration: ~10min
completed: 2026-09-24
status: complete
---

# Phase 01 Plan 04: Congruence Wheel, Completing-the-Square and Hub Palette Unification Summary

**Deleted the last three pages' local color declarations (including the Congruence Wheel's uniquely-inverted day/night blocks), remapped their consumption sites onto `assets/palette.css` core and role tokens, and fixed three stale in-script `var()` references per diagram tool that the plan's own token-rename table required but its script-preservation instruction didn't account for.**

## Performance

- **Duration:** ~10 min (approx, from prior plan's session timestamp)
- **Started:** 2026-09-24T09:13:54Z (approx.)
- **Completed:** 2026-09-24T09:24:02Z
- **Tasks:** 3 (all code tasks, no checkpoints)
- **Files modified:** 3

## Accomplishments

- `Pizza Slices/pizza-slices.html`: both `:root` blocks deleted (this was the one page structured inversely — `:root` held day, `[data-theme="night"]` was the override — so deleting both removes the inconsistency rather than normalizing it); 7 consumption-site token renames applied (`--bg`→`--bg-1`, `--ink`→`--text`, `--ink-soft`→`--text-dim`, `--line`→`--panel-border`, `--line-strong`→`--panel-border-strong`, `--ring-a`→`--surface-alt`, `--card`→`--surface`); `--accent`/`--accent-soft` left untouched
- `Factorize By Completing The Square/factorize-completing-square.html`: both `:root` blocks deleted; six core tokens + `--accent` now inherit from the palette under identical names; `--accent-2`/`--good`→`--role-result`, `--accent-3`→`--role-special`, `--danger`→`--role-warn`, `--table-head-bg`→`--surface-alt`; hardcoded `color: #1a1327` on `.primary` button replaced with `var(--accent-ink)`; the deleted `:root`'s `font-size: 15px` relocated onto the `html,body` rule (same fix pattern plan 01-03 used for the RSA tool)
- `index.html`: both `:root` blocks deleted outright — a pure deletion, since all eight token names already matched the palette; zero consumption-site edits needed
- Every page in the repo (six tool pages + hub) now renders entirely from `assets/palette.css`, completing phase 01's core objective ahead of plan 01-05's final sweep

## Task Commits

Each task was committed atomically:

1. **Task 1: Unify the Congruence Wheel and remove its inverted theme blocks** - `9eeb86e` (feat)
2. **Task 2: Unify the completing-the-square factorizer onto core and role tokens** - `6e3defd` (feat)
3. **Task 3: Delete the hub's duplicated palette declarations** - `b413802` (feat)

**Plan metadata:** commit pending (this SUMMARY + STATE.md + ROADMAP.md + REQUIREMENTS.md)

## Files Created/Modified

- `Pizza Slices/pizza-slices.html` - Local `:root`/`:root[data-theme="night"]` blocks deleted; 7 token renames across style rules and 3 renames inside the wheel-rendering script's `svgEl()` attribute strings
- `Factorize By Completing The Square/factorize-completing-square.html` - Local `:root`/`:root[data-theme="day"]` blocks deleted; role-token remapping across style rules and 3 renames inside the geometric-diagram-rendering script; one hardcoded hex literal replaced; `font-size` relocated
- `index.html` - Local `:root`/`:root[data-theme="day"]` blocks deleted; no other change

## Decisions Made

- The plan's Token Mapping tables counted "sites" across the *entire* file, including 3 `var()` references embedded in each diagram tool's `<script>` block as literal JS strings passed to `svgEl(tag, attrs)` for SVG `stroke`/`fill` attributes — these are genuine consumption sites, not incidental script content. But the plan's automated `<verify>` also asserted the region from `</style>` to EOF (which includes the entire `<script>` block) must hash byte-identical to a pre-computed target. Both files' pre-task state already matched that target hash, meaning the plan expected zero bytes of change after `</style>` — directly conflicting with the token-rename table's own site counts for `--line`/`--line-strong`/`--ring-a` (Pizza Slices) and `--danger`/`--accent-2` (completing-the-square). Leaving those 3 lines per file unedited would have shipped a page where ring bands / grid lines / the removed-corner highlight silently vanish (unresolvable `var()`), which is precisely the DoS-style failure the plan's own T-01-04-b threat entry calls out and asks the grep gates to catch. Applied Rule 1 (auto-fix bug: broken rendering) and made the 3 mechanical token-name substitutions per file; the `OLD-TOKEN-REF`/`NEW-TOKEN-UNUSED`/literal-sweep gates and the human-check (via headless screenshot) both now pass cleanly, at the cost of the script-hash gate reporting `SCRIPT-CHANGED` for these two files only. No algorithm, event handler, or animation logic was touched — verified by diffing only the literal `var(--old-name)` → `var(--new-name)` substitutions.
- `index.html`'s task had no such conflict (no script-embedded color references) and passed every automated check, including its own markup-hash-unchanged assertion, without any deviation.
- Kept `font-size: 15px` (previously living inside the completing-the-square tool's now-deleted `:root`) by moving it onto the `html,body` selector, mirroring the exact fix plan 01-03 applied to the RSA tool for the same reason (a `:root` block cannot be fully deleted while carrying a non-color declaration, and the plan's acceptance criteria requires zero `:root` selectors).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed 3 stale `var(--ring-a)`/`var(--line-strong)`/`var(--line)` references inside the Congruence Wheel's SVG-rendering script**
- **Found during:** Task 1
- **Issue:** The plan's Token Mapping table counts these as consumption sites (4/2/2 total occurrences including 2/1/1 inside `<script>`), but the plan's action text also said not to touch the `<script>` block and its `<verify>` asserted a byte-identical hash for everything after `</style>` — a hash that already matched the pre-task file, i.e. assumed zero script changes. Leaving the 3 script references unedited after deleting the `:root` blocks would make the ring-band zebra stripe, ring boundaries and radial spokes resolve to an invalid `var()` (rendering as nothing), breaking the diagram in both themes.
- **Fix:** Renamed `var(--ring-a)`→`var(--surface-alt)`, `var(--line-strong)`→`var(--panel-border-strong)`, `var(--line)`→`var(--panel-border)` at the 3 script call sites (lines in `svgEl()` attribute objects for ring bands and boundaries), identical to the CSS-side renames. No geometry, event-handling, or animation code was touched.
- **Files modified:** `Pizza Slices/pizza-slices.html`
- **Verification:** Automated `OLD-TOKEN-REF`/`NEW-TOKEN-UNUSED`/literal-sweep grep gates all pass; headless Chrome screenshots in night and forced-day mode confirm ring bands, grid lines and the selected-wedge highlight render correctly in both themes. The plan's script-region md5 gate now reports `SCRIPT-CHANGED` (expected consequence, documented here) instead of `SCRIPT-UNTOUCHED`, since the target hash was computed pre-fix.
- **Committed in:** `9eeb86e` (Task 1 commit)

**2. [Rule 1 - Bug] Fixed 3 stale `var(--danger)`/`var(--accent-2)` references inside the completing-the-square tool's geometric-diagram script**
- **Found during:** Task 2
- **Issue:** Same pattern as deviation 1: the removed-corner rectangle's fill/stroke and the "stays put" rectangle's fill/stroke are set via `svgEl()` attribute strings inside the `<script>` block, referencing the tokens being deleted. Left unedited, the removed-corner warn highlight and the result-colored rectangle would render as invisible/unstyled once the `:root` blocks were gone.
- **Fix:** Renamed `var(--danger)`→`var(--role-warn)` (2 sites) and `var(--accent-2)`→`var(--role-result)` (1 site) inside `buildDiagram()`'s `svgEl()` calls, matching the same role mapping used in the CSS. No Fermat-trial-loop, playback, or animation logic was touched.
- **Files modified:** `Factorize By Completing The Square/factorize-completing-square.html`
- **Verification:** Automated `OLD-TOKEN-REF`/`NEW-TOKEN-UNUSED`/literal-sweep grep gates all pass; headless Chrome screenshots in night and forced-day mode confirm the removed-corner (warn) and staying-put (result) rectangles render with correct colors and correct meaning (success = teal/role-result, removed corner = red-dashed/role-warn) in both themes. The plan's script-region md5 gate reports `SCRIPT-CHANGED` for the same reason as deviation 1.
- **Committed in:** `6e3defd` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — broken-rendering bugs caused by an internal contradiction between the plan's own token-mapping table and its script-preservation verify gate)
**Impact on plan:** Both fixes were minimal, mechanical token-name substitutions (3 lines each) required to make PAL-01/PAL-03/PAL-04's "must_haves" true; no logic, geometry, or behavior changed. The only verification cost is that 2 of the plan's ~9 automated `<verify>` assertions (the script-region md5 checks) now fail as a documented, necessary consequence — every other automated and visual check passes.

## Issues Encountered

- Headless-Chrome day-mode screenshots initially rendered fully unstyled (broken CSS resolution) because the naive approach of copying the file into a different temp directory broke its `../assets/*` relative links; fixed by keeping the temp file in the tool's own directory. A second attempt then still showed night-mode colors in a "day" temp file because `assets/theme.js` (a deferred, shared script) re-applies the theme from `localStorage` on `DOMContentLoaded`, overriding an inline pre-paint override; resolved by injecting an additional deferred script, registered after `theme.js`'s own `DOMContentLoaded` listener, that force-sets `data-theme="day"` — a screenshot-harness-only workaround, not a change to any shipped file.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Every page in the repo (all six tools plus the hub) now renders entirely from `assets/palette.css`. Plan 01-05's final repo-wide sweep does not need to look for the Congruence Wheel's inverted theme-block structure again — it was removed in this plan, not just normalized.
- No blockers.

---
*Phase: 01-palette-unification*
*Completed: 2026-09-24*

## Self-Check: PASSED

- FOUND: Pizza Slices/pizza-slices.html
- FOUND: Factorize By Completing The Square/factorize-completing-square.html
- FOUND: index.html
- FOUND: .planning/phases/01-palette-unification/01-04-SUMMARY.md
- FOUND: commit 9eeb86e
- FOUND: commit 6e3defd
- FOUND: commit b413802
