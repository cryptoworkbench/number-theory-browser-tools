# Phase 01 — UI Review

**Audited:** 2026-09-24
**Baseline:** No UI-SPEC.md exists for this phase — audited against abstract 6-pillar standards, with `assets/palette.css` and the phase's PLAN/SUMMARY files used as the stated intent (single shared palette, day/night parity, role-token consistency).
**Screenshots:** Captured (headless Chrome, `file://` URLs, no dev server running) — night mode, forced day mode (via `localStorage` injection before `theme.js`'s `DOMContentLoaded` listener), and an interactive walkthrough of the Sieve, Factor Tree, Completing-the-Square, Congruence Wheel, and RSA Examplifier (key generation, wire tap, Eve's notebook).

---

## Pillar Scores

| Pillar | Score | Key Finding |
|--------|-------|-------------|
| 1. Copywriting | 3/4 | No generic labels or unhandled empty/error copy found; out of this phase's scope so not deeply exercised. |
| 2. Visuals | 2/4 | Factor Tree's parent-child edge lines are nearly invisible in day mode, breaking the diagram's core teaching structure. |
| 3. Color | 2/4 | Palette centralization itself is genuinely excellent (verified, zero literal colors outside `assets/palette.css`), but one role-token choice (`--panel-border-strong` on SVG edges) fails contrast against a colored diagram fill in day mode. |
| 4. Typography | 2/4 | Extremely fragmented font-size scale (48+ distinct declared sizes across the repo) — pre-existing, not introduced by this phase, but still a real defect an abstract audit must flag. |
| 5. Spacing | 3/4 | No arbitrary bracketed values found; spacing looks consistent in screenshots; not deeply audited at the class level since this phase didn't touch layout. |
| 6. Experience Design | 3/4 | Day/night toggle, loading/progress states, disabled "locked" RSA steps, and validation states all present and screenshot-verified working; docked by the same day-mode edge-visibility bug degrading task completion on Factor Tree. |

**Overall: 15/24**

---

## Top 3 Priority Fixes

1. **Factor Tree edges vanish in day mode** (`Christmas Trees/factor-tree.html:207-208`, `.edge-line{ stroke:var(--panel-border-strong); }`) — In day theme `--panel-border-strong` resolves to `rgba(15,23,42,0.22)`, a value tuned for subtle borders on flat neutral panels. Drawn as a 1-2px stroke over the tool's saturated teal-green pine silhouette, it is functionally invisible: only the two edges that happen to cross the off-white page background (root's two children) remain visible; every deeper parent→child connection in the tree disappears. This breaks the primary pedagogical device of the tool — showing which number split into which children — in day mode. **Fix:** give edges their own always-visible token, e.g. a semi-opaque `--text-dim`-derived or dedicated `--diagram-line` role, or increase stroke opacity/add a drop-shadow so it reads against both the page background and the diagram's own fill in both themes. Verify by screenshotting a multi-level tree (e.g. 60) in day mode and confirming every parent-child line is traceable by eye.
2. **Typography scale is unbounded** (repo-wide: 48+ distinct `font-size` values found via grep, including near-duplicates like `.85rem`/`0.85rem`/`0.82rem`/`.82rem` and raw pixel values mixed with rem) — while out of this phase's stated scope (palette unification, not type scale), an abstract 6-pillar audit still has to score what ships. This much fragmentation makes it likely new tools (phases 2-4) will each introduce their own ad hoc sizes rather than converging on a scale, and it already makes text hierarchy inconsistent tool-to-tool. **Fix:** not a Phase 01 blocker, but worth flagging into a future phase's backlog: define a `--fs-*` step scale in `assets/palette.css` or a new shared tokens file, alongside the color role layer, since the project is already building a shared-token habit in this phase.
3. **Role-token contrast is unverified by the phase's own automated gates** — Every plan (01-01 through 01-05) verified token *substitution* (grep for `var(--old-token)` absence, hash-based script-integrity, link-order) but never verified rendered *contrast* of a token pair against a page's own background/foreground combination. The day-mode edge bug above passed every one of the plan's automated checks and was still auto-approved at three separate "blocking" checkpoints (01-01 Task 3, 01-05 Task 3) via headless screenshots that a human did not actually review pixel-by-pixel. **Fix:** for future palette-consuming phases, add a manual (or automated contrast-ratio) check specifically for non-text/non-panel uses of border and outline tokens (SVG strokes, dividers, focus rings) drawn over colored fills, not just over flat panel backgrounds — this is exactly the case flat-panel-tuned tokens like `--panel-border-strong` are not designed for.

---

## Detailed Findings

### Pillar 1: Copywriting (3/4)
- No `Submit`/`Click Here`/generic `OK`/`Cancel` labels found repo-wide (`grep -rn` clean).
- No "went wrong"/generic error copy or unhandled `No data`/`No results` empty-state boilerplate found.
- Copy is consistently tool-specific and narrative (e.g. "Give every natural number its own box — then watch the sieve strike out everything that isn't prime.", RSA's Bob/Alice/Eve framing). This is inherited from before this phase and untouched by it; scored 3 rather than 4 only because copy wasn't itself exercised for edge cases (e.g. invalid prime input, N=0) during this audit.

### Pillar 2: Visuals (2/4)
- Sieve, Congruence Wheel, Completing-the-Square, RSA Examplifier, and the hub all render with a clear focal point and correct visual hierarchy in both themes (verified by screenshot).
- **Factor Tree fails in day mode**: the diagram's connecting lines between parent and child factor nodes (`.edge-line`) are invisible against the tree's fill in day theme (see Top Fix #1). This is a genuine visual-hierarchy break, not a subjective nit — a user cannot trace which number produced which children in day mode past the first level.
- Icon-only controls (Sieve's chime toggle button, RSA's lock icons) were not checked for `aria-label`/tooltip coverage in this pass; flagging as a gap in this audit's own coverage rather than a confirmed defect.

### Pillar 3: Color (2/4)
- Repo-wide literal-color sweep (`grep -nE "#[0-9a-fA-F]{3,8}|rgb\(|rgba\(|hsl\("` across all six HTML files and `assets/site.css`, excluding Google Fonts URLs) returns **zero** genuine color literals outside `assets/palette.css` — the phase's central claim (single source of truth) is independently verified true, not just self-reported.
- Day and night palettes both maintain the 60/30/10-style split visually: large neutral surfaces (`--bg-1`/`--bg-2`/`--surface`), text/panel-border as secondary, and `--accent`/`--role-*` as the minority signal color — confirmed by screenshot across all six pages.
- However, one token misapplication (`--panel-border-strong` used for SVG diagram strokes, see Top Fix #1) demonstrates the role-token layer's meanings were mapped by name-matching convenience ("this is a border-ish line, use the border-strong token") rather than by verifying rendered contrast in-context, and it is not an isolated case worth ignoring — it directly reproduces the same day-mode failure mode (dark-tuned semi-transparent token over a colored fill) that Plan 01-04's own deviation log had to catch and hand-fix twice for Pizza Slices and Completing-the-Square's *script-embedded* `var()` references. The CSS-side `.edge-line` rule was not caught by that same scrutiny.

### Pillar 4: Typography (2/4)
- `grep -rohE "font-size:\s*[0-9.]+(px|rem|em)"` across all HTML/CSS returns 48 distinct declared values, including redundant near-duplicates differing only in leading-zero/decimal formatting (`.85rem` vs `0.85rem`, `.82rem` vs `0.82rem`, `.78rem` vs `0.78rem`) that are almost certainly meant to be the same size but are declared inconsistently tool-to-tool.
- Raw pixel sizes (`19px`, `17px`, `16px`, `15px`, `14.5px`, `13px`, `12.5px`, `12px`, `11px`, `0px`) are mixed with rem-based sizing throughout, meaning text does not uniformly scale with the user's root font size.
- This is pre-existing and not something Phase 01 (scoped to color/palette only) was tasked with fixing, so it isn't a regression — but an abstract 6-pillar audit has no license to skip it, and it should be logged for a future phase since the project is already building shared-token discipline this phase.

### Pillar 5: Spacing (3/4)
- No arbitrary bracketed spacing values (`grep -n "\[.*px\]\|\[.*rem\]"`) found — not applicable here since this is a non-Tailwind, hand-authored-CSS repo, but confirms no ad hoc inline magic numbers were spotted in a manual pass over the six files' layout rules.
- Visual spacing in every screenshot (card grids, form controls, panel padding) reads as consistent and intentional across all six pages and both themes.
- Not scored 4/4 because spacing classes/rem-values were not exhaustively diffed against a declared scale (none exists, and this phase didn't introduce one) — this is a shallower check than the color-literal sweep, so scored conservatively.

### Pillar 6: Experience Design (3/4)
- Loading/progress states: Sieve's Play/Step/Instant/Reset controls and progress bar render and function correctly in both themes.
- Disabled/locked states: RSA Examplifier correctly locks steps 3-5 ("Generate both keypairs first.") until prerequisites are met, and un-locks and populates correctly once Bob's and Alice's keypairs are generated (verified via scripted click-through screenshot).
- Day/night toggle itself works correctly and instantly re-themes the shared header and all six pages' content — this was the phase's central goal and it is solidly delivered.
- Docked one point for the same Factor Tree day-mode edge-visibility defect: it isn't just a color nitpick, it's an experience regression — a self-directed learner opening this tool in day mode (a very plausible default, e.g. daytime browsing) gets a materially worse teaching tool than in night mode, and nothing in the UI indicates a "better" mode exists.

---

## Registry Safety

Not applicable — this repo has no `components.json` / shadcn registry setup (per `CLAUDE.md`: vanilla HTML/CSS/JS, no build tooling, no component registries). Skipped per audit instructions.

---

## Files Audited

- `assets/palette.css`
- `assets/site.css`
- `index.html`
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`
- `Christmas Trees/factor-tree.html`
- `Factorize By Completing The Square/factorize-completing-square.html`
- `Pizza Slices/pizza-slices.html`
- `RSA Examplifier/rsa-examplifier.html`
- `.planning/phases/01-palette-unification/01-01-PLAN.md` through `01-05-PLAN.md`
- `.planning/phases/01-palette-unification/01-01-SUMMARY.md` through `01-05-SUMMARY.md`
- `CLAUDE.md`, `.claude/CLAUDE.md`

---

## Resolution

**Top Fix #1 (Factor Tree edges invisible in day mode) — fixed 2026-09-24, commit `60ad096`.**

`Christmas Trees/factor-tree.html:207-208`'s `.edge-line{ stroke:var(--panel-border-strong); }` was changed to `stroke:var(--text-dim);` — an opaque token designed for legible contrast in both themes, replacing a translucent hairline-border token that resolved to ~22% opacity over the diagram's saturated teal fill in day mode. Verified visually via headless-Chrome CDP screenshots (factoring 60 = 2×2×3×5) in both day and night mode: every parent-child edge is now traceable by eye in day mode, and night mode is unaffected.

Top Fixes #2 (repo-wide typography scale) and #3 (contrast-of-non-text-tokens verification gap) are out of this phase's scope — logged for a future phase's backlog, not blocking Phase 01 completion.
