---
phase: 01-palette-unification
plan: 03
subsystem: ui
tags: [css, custom-properties, theming, design-tokens, day-night-mode]

# Dependency graph
requires:
  - phase: 01-palette-unification (plan 01)
    provides: "assets/palette.css token set (surface/text/accent/role layers) and the approved palette literal"
provides:
  - "RSA Examplifier/rsa-examplifier.html rendering entirely from assets/palette.css tokens in both themes"
  - "Bob/Alice/Eve/discrete-log-aside mapped onto shared --role-* tokens, proving the role layer's expressiveness for four simultaneous actor colors plus verdict colors"
affects: [01-05-PLAN]

# Actuals (#2632)
actuals:
  tokens: 3257
  tasks: 2
  commits: 2

tech-stack:
  added: []
  patterns:
    - "Actor role-mapping: sender -> --role-input, second participant -> --role-alt, adversary -> --role-warn, advanced/tangential concept -> --role-special, successful verdict -> --role-result, failed verdict -> --role-warn (shared with adversary, since both were already the same literal in this tool)"
    - "Participant button gradients derive their darker end via color-mix(in srgb, var(--role-X) 78%, black) instead of a hardcoded hex, so the gradient stays in sync with the role token across themes"
    - "Root-level non-color properties (font-size) that shared a :root block with now-deleted color tokens get hoisted onto the nearest real selector (html,body) rather than left behind in an otherwise-empty :root"

key-files:
  modified:
    - "RSA Examplifier/rsa-examplifier.html"

key-decisions:
  - "var(--text-dim) proved legible on var(--overlay) wells in day mode (see human-check screenshots) — confirming the plan's prediction that the --well-label day override (#333844) was only needed because the old day --text-dim (#5b6178) read poorly against the black wash it is now paired with the theme-aware var(--overlay) tint instead, and legibility holds at every formula well and result box screenshotted."
  - "font-size:15px was declared in the same :root block as the ten actor/verdict color tokens Task 2 deletes; deleting only the color tokens would have left a dangling :root{ font-size:15px; } that fails the plan's own 'zero :root selectors' acceptance criterion. Moved font-size:15px onto the existing html,body rule (the same element :root refers to in an HTML document), which preserves the exact root font size all rem-based sizing in this file depends on. (Rule 3 — blocking issue forced by the plan's own deletion instruction, resolved with a value-preserving move, not a new value.)"

patterns-established: []

requirements-completed: [PAL-01, PAL-02, PAL-03, PAL-04]

coverage:
  - id: D1
    description: "RSA page chrome, code wells, wire packet pill, notebook grid and result box render entirely from assets/palette.css tokens in both themes; the four hardcoded rgba(0,0,0,...) black washes are gone and re-theme correctly in day mode"
    requirement: "PAL-03"
    verification:
      - kind: unit
        ref: "bash: grep-based token-absence check + black-wash absence check + var(--overlay)/var(--scrim) presence check + script-region md5 no-op check (Task 1 automated <verify>)"
        status: pass
      - kind: automated_ui
        ref: "headless Chrome screenshots, night and day mode, pre-interaction and mid-walkthrough (scratchpad shots/rsa-night.png, rsa-day.png, rsa-walk-night-full.png, rsa-walk-day-full.png) — formula wells, notebook grid, wire packet pill and lock scrim are light tinted panels with legible text in day mode, unchanged dark tints in night mode"
        status: pass
    human_judgment: false
  - id: D2
    description: "Bob, Alice, Eve and the discrete-log aside render from shared role tokens (--role-input/--role-alt/--role-warn/--role-special) and remain four visually distinct participants, with Eve reading as the adversary, in both themes; good/bad verdicts distinguishable via --role-result/--role-warn"
    requirement: "PAL-04"
    verification:
      - kind: unit
        ref: "bash: ten actor/verdict tokens absent, zero custom properties and zero :root selectors in the whole file, all five role tokens present (Task 2 automated <verify>)"
        status: pass
      - kind: automated_ui
        ref: "headless Chrome screenshots of a full scripted walkthrough (key generation, wire tap, Eve's brute-force factoring of both moduli, discrete-log demo, Bob<->Alice encrypted message exchange) in both themes (scratchpad shots/rsa-walk-night-full.png, rsa-walk-day-full.png) — Bob (blue), Alice (pink/magenta), Eve (red, dashed adversarial notebook styling) and the discrete-log aside (purple) stay distinct; public-key/success styling reads green-teal, private-key/failure styling reads red in both themes"
        status: pass
    human_judgment: false
  - id: D3
    description: "The whole file declares no custom properties and no color literal outside comments and the Google Fonts link; the RSA key-generation, modular-exponentiation and brute-force-factoring script is byte-identical before and after both tasks"
    requirement: "PAL-02"
    verification:
      - kind: unit
        ref: "bash: whole-file color-literal sweep (grep for hex/rgba/hsla outside comments and fonts.googleapis/fonts.gstatic) + </style>-to-EOF md5 hash check against 2ae4a0ffbe6f0207c7179f711fd7c29f, both Task 1 and Task 2 automated <verify>"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-09-24
status: complete
---

# Phase 01 Plan 03: RSA Examplifier Palette Unification Summary

**Retired the RSA tool's bespoke blue/pink/red/purple actor palette and its four theme-blind `rgba(0,0,0,...)` black washes for `assets/palette.css` role tokens, keeping Bob, Alice, Eve and the discrete-log aside as four immediately distinguishable narrative participants in both themes.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-09-24T11:02:58+02:00 (approx., from prior plan's completion commit)
- **Completed:** 2026-09-24T11:14:00+02:00 (approx.)
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments

- RSA's page chrome (background, panels, text, borders) now inherits `--bg-1`, `--bg-2`, `--panel`, `--panel-border`, `--text`, `--text-dim` and `--accent` directly from `assets/palette.css` — the local declarations of all seven were deleted
- The four theme-blind `rgba(0,0,0,...)` black washes (code/formula wells, wire packet pill, notebook grid cells, result box) are gone, replaced with the palette's theme-aware `var(--overlay)` / `var(--scrim)` tokens — this was the phase's clearest day-mode defect (PAL-03) and is now fixed: these regions are light tinted panels with legible text in day mode instead of black rectangles
- The locked-panel scrim (`--lock-scrim`/`--lock-text`) and the well label color (`--well-label`) were retired in favor of the shared `var(--scrim)` and `var(--text)`/`var(--text-dim)` tokens; `var(--text-dim)` proved legible against `var(--overlay)` wells in day mode, confirmed by screenshot, so no special-case override was needed
- Bob, Alice, Eve and the discrete-log aside are remapped onto shared role tokens (`--role-input`, `--role-alt`, `--role-warn`, `--role-special`), and success/failure verdicts onto `--role-result`/`--role-warn` — a full scripted walkthrough (key generation, wire tap, Eve's brute-force attack on both moduli, the discrete-log demo, and an encrypted Bob<->Alice message exchange) confirms all four participants stay visually distinct and Eve still reads as the adversary in both themes
- The three participant buttons (Bob/Alice primary, Eve/danger) keep their gradient look, with the darker gradient end now derived via `color-mix(in srgb, var(--role-X) 78%, black)` instead of a hardcoded hex, and label ink on `var(--accent-ink)` (flips dark-on-light / white-on-dark with the theme)
- Both `:root` blocks are deleted entirely: the file declares zero custom properties and contains zero `:root` selectors, satisfying the phase-wide "no local color declarations" rule; the whole file (CSS and JS) contains zero color literals outside comments and the Google Fonts link
- The RSA math (`BigInt` key generation, modular exponentiation, extended Euclidean algorithm, Miller-Rabin primality, brute-force factoring) is byte-identical throughout: the `</style>`-to-EOF region hashes to `2ae4a0ffbe6f0207c7179f711fd7c29f` before and after both tasks

## Task Commits

Each task was committed atomically:

1. **Task 1: Unify RSA's surfaces, chrome and theme-blind black washes** - `43c9039` (feat)
2. **Task 2: Map Bob, Alice, Eve and the discrete-log aside onto shared role tokens** - `317994c` (feat)

**Plan metadata:** commit pending (this SUMMARY + STATE.md + ROADMAP.md + REQUIREMENTS.md)

## Files Created/Modified

- `RSA Examplifier/rsa-examplifier.html` - Both `:root` blocks deleted entirely (17 local color custom properties removed); four `rgba(0,0,0,...)` washes replaced with `var(--overlay)`/`var(--scrim)`; ten actor/verdict tokens remapped to shared `--role-*` tokens; button gradients and label ink derived from role tokens via `color-mix()`/`var(--accent-ink)`; `font-size:15px` moved from `:root` onto `html,body`; RSA math/script untouched

## Decisions Made

- `var(--text-dim)` reads legibly on `var(--overlay)` wells in day mode (confirmed via headless-Chrome screenshot of the "Composite modulus" / "Euler's totient" formula wells and the extended-Euclidean result box) — this validates the plan's premise that the tool-specific `--well-label` day override (`#333844`) existed only to compensate for the old black wash, and is no longer needed now that the wash itself is theme-aware.
- `font-size: 15px` shared a `:root` block with the ten actor/verdict tokens Task 2 deletes. Since `:root` in an HTML document refers to the `<html>` element, moving the declaration onto the existing `html,body{...}` rule is behaviorally identical (same root font size, same rem-unit cascade throughout the file) while letting `:root` be removed entirely, as the plan's Task 2 acceptance criteria require.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `font-size:15px` would have left a dangling `:root` block after deleting the ten actor/verdict tokens**
- **Found during:** Task 2 (mapping actors/verdicts onto role tokens), while planning the token deletion required by "both `:root` blocks are empty and are removed from the file entirely"
- **Issue:** The plan's Task 2 action deletes all ten actor/verdict tokens from `:root`, but `font-size: 15px` — a non-color property this plan never mentions — lived in the same `:root` block. Deleting only the ten tokens would leave `:root{ font-size:15px; }`, failing the plan's own acceptance criterion of zero `:root` selectors, while simply dropping the declaration would silently change the root font size (and therefore every `rem`-based size in the file, which is most of them).
- **Fix:** Moved `font-size:15px` onto the pre-existing `html,body{...}` rule (the very next rule after `:root`). `:root` addresses the `<html>` element in an HTML document, so this is value-for-value identical — no rendering change, no rem-cascade change.
- **Files modified:** `RSA Examplifier/rsa-examplifier.html`
- **Verification:** Task 2's automated checks (zero custom properties, zero `:root` selectors) pass; visual screenshots at both plan-verification steps (pre-interaction and full-walkthrough, both themes) show identical typography scale to the pre-phase version.
- **Committed in:** `317994c` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 3 — blocking issue forced by the plan's own token-deletion instruction interacting with a co-located non-color property; resolved with a value-preserving move, not a new value or scope change)
**Impact on plan:** No functional or visual deviation from the plan's intent — root font size and the visual result are unchanged; the only thing that moved is which selector declares it.

## Issues Encountered

- No browser test runner exists in this repo (per CLAUDE.md), so the plan's `<human-check>` visual-verification steps were performed via headless Chrome screenshots instead of an interactive session, consistent with plans 01-01 and 01-02's precedent. Day mode required a throwaway same-directory copy of the file with `localStorage.setItem('site-theme','day')` injected ahead of the page's pre-paint script (the shared `assets/theme.js` re-applies theme from `localStorage` after `DOMContentLoaded`, so a copy without this override falls back to night); the throwaway copy was deleted immediately after each screenshot and never committed (confirmed via `git status --short` after each cleanup).
- For the full-narrative human-check (Task 2), a second throwaway copy had an inline script appended before `</body>` that synchronously clicks through Bob's keygen, Alice's keygen, Eve's brute-force attack on both moduli, the discrete-log demo, and both directions of the encrypted message exchange, captured via `--virtual-time-budget` so the `setTimeout`-delayed brute-force result renders before the screenshot. This copy was also deleted immediately after use and never committed.
- Screenshots (night and day: pre-interaction, and a full scripted walkthrough) confirmed: unified chrome matching the rest of the site; light, legible formula wells, notebook grid, wire packet pill and lock scrim in day mode (previously black); Bob (blue), Alice (pink/magenta), Eve (red, dashed adversarial-styled notebook) and the discrete-log aside (purple) all visually distinct in both themes; public-key/success styling in green-teal, private-key/failure styling in red; button labels legible on their gradients in both themes.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `RSA Examplifier/rsa-examplifier.html` is fully unified against `assets/palette.css`; plan 01-05's cross-tool consistency sweep can treat this as a third worked example of the role-token mapping pattern (after the Sieve in 01-01 and the Factor Tree in 01-02), and the first example that exercises four simultaneous actor roles plus two verdict roles at once.
- No blockers.

---
*Phase: 01-palette-unification*
*Completed: 2026-09-24*

## Self-Check: PASSED

- FOUND: RSA Examplifier/rsa-examplifier.html
- FOUND: .planning/phases/01-palette-unification/01-03-SUMMARY.md
- FOUND: commit 43c9039
- FOUND: commit 317994c
