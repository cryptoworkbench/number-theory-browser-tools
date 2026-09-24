---
phase: 01-palette-unification
plan: 02
subsystem: ui
tags: [css, custom-properties, theming, design-tokens, day-night-mode, svg]

# Dependency graph
requires:
  - phase: 01-palette-unification (plan 01)
    provides: "assets/palette.css token set (surface/text/accent/role layers) and the approved palette literal"
provides:
  - "Christmas Trees/factor-tree.html rendering entirely from assets/palette.css tokens in both themes"
  - "Fairy-light colors driven by CSS classes instead of JS-injected hexes, so they re-theme on toggle"
affects: [01-05-PLAN]

# Actuals (#2632)
actuals:
  tokens: 2526
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Diagram role-mapping: composite node -> --role-input, prime leaf -> --role-result, terminal-1 -> translucent --role-inert, matching the pattern plan 01-01 established for the Sieve"
    - "JS-injected SVG presentation attributes (fill, inline style.filter) replaced with CSS classes keyed to role tokens, so currentColor-driven glows re-theme without any JS changes"
    - "Retained local custom properties that are pure var()/color-mix() derivations (--page-bg, --pine-grad-*, --trunk-grad-*, --sky-opacity) so downstream JS references (SVG stop-color) keep working untouched"

key-files:
  modified:
    - "Christmas Trees/factor-tree.html"

key-decisions:
  - "Token deletion in Task 1 shrank the file enough that .edge-line's stroke (originally ~line 247, a Task 2 diagram-rule item) landed at line 214, inside Task 1's own line 1-240 literal-sweep boundary. Fixed it in Task 1 using Task 2's already-specified target value (var(--panel-border-strong)) rather than leaving a literal in place to fail verification — a Rule 3 blocking-issue fix, not a scope change, since the value used was already the plan's own final answer for that exact rule."
  - "Task 1 could not simply delete --gold/--node-*/--pine-grad-*/--trunk-grad-* (their hex declarations also fall within the 1-240 sweep window) without breaking the diagram rules Task 1 was told not to touch. Resolved by redefining them in Task 1 as var()-derived aliases using their eventual Task 2 target values (e.g. --gold: var(--accent), --node-fill: var(--role-input)), then having Task 2 inline those values directly into the consuming rules and delete the now-unused aliases — same final state as the plan specifies, just reached via a two-step alias-then-inline path forced by the verification boundary interacting with token deletion."

patterns-established: []

requirements-completed: [PAL-01, PAL-02, PAL-03, PAL-04]

coverage:
  - id: D1
    description: "Factor tree page chrome (background, title, subtitle, input, button, chips, messages, footnote) renders entirely from assets/palette.css tokens in both themes; no chrome token remains declared locally"
    requirement: "PAL-01"
    verification:
      - kind: unit
        ref: "bash: grep-based token-absence check + whole-region literal sweep + script-region md5 no-op check (Task 1 automated <verify>)"
        status: pass
      - kind: automated_ui
        ref: "headless Chrome screenshots, night and day mode (scratchpad shots/tree-night.png, shots/tree-day3.png)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Snowflakes are visible in day mode (previously invisible white-on-near-white) — genuine PAL-03 defect fix, not just a token rename"
    requirement: "PAL-03"
    verification:
      - kind: automated_ui
        ref: "headless Chrome screenshot, day mode (scratchpad shots/tree-day3.png) — dark snowflakes visible against light background"
        status: pass
    human_judgment: false
  - id: D3
    description: "Tree diagram (composite nodes, prime leaves, terminal-1 nodes, edges, trunk/pine gradients, tree-top star) renders from role tokens in both themes with the three node kinds still visually distinct"
    requirement: "PAL-04"
    verification:
      - kind: unit
        ref: "bash: grep-based token-absence/gradient-derivation check + whole-<style>-block literal sweep + script-region md5 no-op check (Task 2 automated <verify>)"
        status: pass
      - kind: automated_ui
        ref: "headless Chrome screenshots factoring 60, night and day mode (scratchpad shots/tree-night.png, shots/tree-day3.png) — blue composite nodes, teal/green prime leaves, faint gray terminal-1 nodes, tree gradient and star all render"
        status: pass
    human_judgment: false
  - id: D4
    description: "Fairy lights are driven by five palette-role CSS classes (LIGHT_CLASSES) instead of the JS-injected LIGHT_COLORS hex array and inline style.filter; they now re-theme on day/night toggle"
    requirement: "PAL-02"
    verification:
      - kind: unit
        ref: "bash: LIGHT_COLORS/style.filter absence check, LIGHT_CLASSES + five .light-* class presence check, whole-file literal sweep (Task 3 automated <verify>)"
        status: pass
      - kind: automated_ui
        ref: "headless Chrome screenshots showing colored fairy-light dots along tree edges in both themes (scratchpad shots/tree-night.png, shots/tree-day3.png)"
        status: pass
    human_judgment: false

duration: 13min
completed: 2026-09-24
status: complete
---

# Phase 01 Plan 02: Factor Tree Palette Unification Summary

**Retired the factor tree's bespoke Christmas green-and-gold scheme for `assets/palette.css` role tokens, fixed the previously-invisible day-mode snowflakes, and moved fairy-light colors out of JavaScript into re-themeable CSS classes.**

## Performance

- **Duration:** 13 min
- **Started:** 2026-09-24T10:49:00Z (approx., from prior plan's completion commit)
- **Completed:** 2026-09-24T11:01:00Z
- **Tasks:** 3
- **Files modified:** 1

## Accomplishments

- Page chrome (background, title, subtitle, input, button, chips, message states, equation, footnote) now resolves entirely from `assets/palette.css` — every superseded local token (`--pine-1/2/3`, `--page-text`, `--msg-error`, `--msg-info`, `--input-bg`, `--input-text`, `--chip-bg`, `--chip-text`, `--footnote`, `--btn-text`, local `--panel`/`--panel-border`) deleted
- Day-mode snowflakes are now visible: `.flake`'s hardcoded white was invisible against the near-white day background before this plan — a real PAL-03 defect fix, not just a token rename
- Tree diagram fully remapped to shared role tokens: composite nodes → `var(--role-input)`, prime leaves → `var(--role-result)`, terminal `1` nodes → translucent `var(--role-inert)`, keeping the three-way visual distinction the tool teaches
- Tree-top star recolored to `var(--accent)` with its pulse keyframe rewritten to use `currentColor`, preserving the original 4px-to-12px / 60%-to-100% glow intensity swing
- Fairy lights moved out of JS entirely: `LIGHT_COLORS` (a hardcoded hex array) replaced with `LIGHT_CLASSES`, five new `.fairy-light.light-*` CSS rules drive fill/glow via role tokens — fairy lights now re-theme on toggle, which they never did before
- Whole file (CSS and JS) contains zero color literals outside comments and the Google Fonts link; the entire `<script>` block is byte-identical through Tasks 1-2, and Task 3's JS edit is confined to the light-building loop

## Task Commits

Each task was committed atomically:

1. **Task 1: Unify the factor tree's page chrome onto palette tokens** - `b73c185` (feat)
2. **Task 2: Unify the tree diagram's role colors and SVG gradients** - `8424f4a` (feat)
3. **Task 3: Move fairy-light colors out of JavaScript into palette-driven CSS classes** - `cacd814` (feat)

**Plan metadata:** commit pending (this SUMMARY + STATE.md + ROADMAP.md + REQUIREMENTS.md)

## Files Created/Modified

- `Christmas Trees/factor-tree.html` - Local color custom properties reduced from 24 to 6 (all non-color or pure `var()`/`color-mix()` derivations); every hardcoded hex/rgba literal replaced with palette tokens; `LIGHT_COLORS` JS array replaced with `LIGHT_CLASSES` + CSS role classes

## Decisions Made

- Task 1's own literal-sweep boundary (lines 1-240 of the file) is line-number-based, not task-ownership-based. Deleting the superseded chrome tokens shrank the `:root`/day blocks enough that two diagram-owned items — the `.edge-line` stroke rule and the diagram's own local token declarations (`--gold`, `--node-*`, `--pine-grad-*`, `--trunk-grad-*`) — shifted inside that boundary even though they conceptually belong to Task 2. Resolved by applying Task 2's already-specified final values to these items one task early, as var()-derived aliases in Task 1, then letting Task 2 inline them into the consuming rules and delete the aliases exactly as its own table and acceptance criteria require. The end state after Task 2 matches the plan's target precisely; only the intermediate path taken to satisfy Task 1's own verification gate differed from a literal line-by-line reading of task boundaries.
- Used headless Chrome screenshots (night mode directly; day mode via a throwaway copy with `localStorage.setItem('site-theme','day')` injected before the page's pre-paint script, then deleted) in place of an interactive `<human-check>`, consistent with plan 01-01's precedent for this auto-mode/no-test-runner repository.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `.edge-line` stroke fell inside Task 1's literal-sweep window after token deletion**
- **Found during:** Task 1 (page chrome unification) — running the plan's own automated `<verify>` command
- **Issue:** Deleting 12 superseded chrome tokens shrank the file by ~33 lines, moving `.edge-line{ stroke:rgba(255,255,255,.4); }` from its original position (~line 247, explicitly assigned to Task 2 in the plan's diagram-mapping table) to line 214 — inside Task 1's own `sed -n '1,240p'` literal sweep, which would otherwise fail on this untouched diagram rule.
- **Fix:** Applied the plan's own Task 2 target value early: `stroke:var(--panel-border-strong)`. No new value was invented — this is exactly what Task 2's table already specifies for this rule.
- **Files modified:** `Christmas Trees/factor-tree.html`
- **Verification:** Task 1's automated literal sweep passes clean; Task 2's later automated sweep (which re-checks the same rule) also passes since the value is unchanged.
- **Committed in:** `b73c185` (Task 1 commit)

**2. [Rule 3 - Blocking] Diagram-owned local tokens' hex declarations also fell inside Task 1's sweep window**
- **Found during:** Task 1 (page chrome unification) — same verify run as above
- **Issue:** `--gold`, `--node-fill`, `--node-stroke`, `--node-text`, `--node-one-fill`, `--node-one-stroke`, `--pine-grad-1/2`, and `--trunk-grad-1/2` are all declared inside the shared `:root`/day blocks Task 1 rewrites (lines 14-63, well within the 1-240 sweep), but their hex values and semantic remapping are Task 2's job per the plan's own task boundary and "do not touch the tree diagram rules" instruction.
- **Fix:** Redefined these tokens in Task 1 as `var()`-derived aliases using their eventual Task 2 target values (e.g. `--gold: var(--accent)`, `--node-fill: var(--role-input)`, `--pine-grad-1: var(--accent-2)`), without touching any consuming rule. This satisfied Task 1's zero-literal requirement while leaving the diagram's rendered appearance functionally unchanged (in most cases already closer to the target look). Task 2 then rewrote the consuming rules to reference the role tokens directly and deleted these now-unused aliases, exactly matching Task 2's specified action and acceptance criteria.
- **Files modified:** `Christmas Trees/factor-tree.html`
- **Verification:** Task 1's automated sweep passes; Task 2's automated checks (`--gold`/`--node-*` no longer declared, gradient tokens declared once and `var()`-derived, JS gradient reference intact) all pass; whole-`<style>`-block sweep clean.
- **Committed in:** `b73c185` (Task 1 alias), finished in `8424f4a` (Task 2 inline + delete)

---

**Total deviations:** 2 auto-fixed (both Rule 3 — blocking verification issues caused by line-count shrinkage from token deletion, not scope changes; both resolved using the plan's own already-specified target values)
**Impact on plan:** No functional or visual deviation from the plan's intent — both fixes used values the plan itself specifies for Task 2, applied one task earlier than a literal task-by-task reading would suggest, purely to satisfy Task 1's own line-range-based verification gate.

## Issues Encountered

- No browser test runner exists in this repo (per CLAUDE.md), so the plan's `<human-check>` visual-verification steps were performed via headless Chrome screenshots instead of an interactive session, consistent with plan 01-01. Day-mode required a throwaway file copy with `localStorage.setItem('site-theme','day')` injected ahead of the page's pre-paint script (the shared `assets/theme.js` re-applies theme from `localStorage` after `DOMContentLoaded`, overriding a same-directory copy's pre-paint attribute alone); the copy was deleted immediately after the screenshot and never committed.
- Screenshots (night: factoring 60; day: factoring 60) confirmed: unified chrome matching the rest of the site, visible dark snowflakes in day mode, distinct blue/teal/gray node coloring for composite/prime/terminal-1, rendered pine and trunk gradients, and colored fairy-light dots along the tree edges in both themes.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `Christmas Trees/factor-tree.html` is fully unified against `assets/palette.css`; plans 01-03 and 01-04 can proceed independently against the same token set without touching this file.
- The role-token mapping used here (composite → `--role-input`, prime/final-answer → `--role-result`, terminal/inert → `--role-inert`, decorative chrome → `--accent`) is available as a second worked example (after the Sieve in plan 01-01) for plan 01-05's cross-tool consistency sweep.
- No blockers.

---
*Phase: 01-palette-unification*
*Completed: 2026-09-24*

## Self-Check: PASSED

- FOUND: Christmas Trees/factor-tree.html
- FOUND: commit b73c185
- FOUND: commit 8424f4a
- FOUND: commit cacd814
