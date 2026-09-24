---
phase: 01-palette-unification
reviewed: 2026-09-24T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - CLAUDE.md
  - Christmas Trees/factor-tree.html
  - Factorize By Completing The Square/factorize-completing-square.html
  - Pizza Slices/pizza-slices.html
  - RSA Examplifier/rsa-examplifier.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - assets/palette.css
  - assets/site.css
  - index.html
findings:
  critical: 1
  warning: 2
  info: 1
  total: 4
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-09-24
**Depth:** standard
**Files Reviewed:** 9
**Status:** issues_found

## Summary

Reviewed the full palette-unification diff (base `3bdb067^` → `HEAD`, i.e. every commit from `cacd814` through `b6bf1dc`): the new `assets/palette.css` token file, the rewiring of `assets/site.css` and all five tools onto it, and the deletion of every tool's bespoke `:root`/`:root[data-theme="day"]` block. The mechanical migration is largely correct — I grepped every `var(--...)` reference across all nine files against the tokens `palette.css` actually declares and found only one orphaned reference (see CR-01... actually WR-01 below), no leftover hardcoded hex colors outside `palette.css` itself, and no leftover inverted `[data-theme="night"]` override blocks (Pizza Slices previously had its default/override polarity backwards relative to the rest of the site; that block is now gone entirely, which is correct).

The one already-known issue (Factor Tree's `.edge-line` day-mode contrast, fixed via `var(--text-dim)`) is confirmed fixed and not re-flagged. However, the same *class* of regression — a role token that is theme-invariant pre-migration becoming theme-adaptive post-migration, paired with a fixed/adaptive ink color that no longer tracks it correctly — recurs in the Sieve tool's prime-cell styling and was not caught by the prior audit. I computed WCAG contrast ratios (not just eyeballed) for the flagged findings below; math is included so it can be independently re-verified.

## Critical Issues

### CR-01: Sieve prime cells are unreadable in day mode (contrast as low as 1.96:1)

**File:** `Sieve Of Eratosthenes/sieve-of-eratosthenes.html:297-303`

**Issue:** Before this phase, `.cell.prime` used a hardcoded, theme-invariant background (`var(--prime)`, `#33f5c0` in *both* themes — the old day-mode override block did not touch `--prime`, only `--prime-text`) paired with a hardcoded dark ink (`#06251d`). That pairing was always high-contrast because the background never changed.

The migration replaced both sides with theme-adaptive tokens:

```css
.cell.prime{
  color: var(--accent-ink);
  background: linear-gradient(145deg, var(--role-result), color-mix(in srgb, var(--role-result) 55%, white));
  ...
}
```

`--role-result` is theme-adaptive (`#33f5c0` bright mint at night, `#0f9a80` a much darker teal in day mode — see `assets/palette.css:79`), and `--accent-ink` is also theme-adaptive (`#0b0e1a` dark at night, `#ffffff` white in day). In night mode this still works (dark text on a bright gradient). In day mode it inverts the requirement: the gradient is now a *medium-to-light* teal, and the text is *white*, which is the wrong pairing.

Computed WCAG 2.x contrast ratios (day mode, white `#ffffff` text against the actual gradient colors):

| Position on gradient | Background | Contrast vs. white text |
|---|---|---|
| 0% (pure `--role-result`) | `#0f9a80` | 3.53 |
| 50% (visual midpoint of the cell) | `#458dad`-ish `rgb(69,176,156)` | 2.64 |
| 100% (`color-mix(role-result 55%, white)`) | `rgb(123,199,185)` | **1.96** |

WCAG AA requires 4.5:1 for normal text (this is small bold numeral text in a grid cell, not large text). Every point along the gradient fails AA in day mode, and the low end (1.96:1) is close to unreadable. This affects every prime number shown in the Sieve grid whenever a user is in day mode — i.e. the tool's primary "found a prime" signal is illegible for a large share of users. (Night mode is unaffected: contrast there is 13.7–15.5:1.)

The same broken background is reused, without text, in `.swatch.prime` (the legend key) — that one is not a contrast bug since it has no overlaid text, but confirms the gradient itself, not just the pairing, changed meaning across themes.

**Fix:** Use a fixed dark ink for prime cells regardless of theme (matching the pre-migration behavior, since the intent is "this cell is always the bright 'found' color"), or make the text track the *actual* rendered luminance instead of the theme:

```css
.cell.prime{
  color: var(--surface); /* or a new dedicated always-dark token, not the theme-flipping accent-ink */
  background: linear-gradient(145deg, var(--role-result), color-mix(in srgb, var(--role-result) 55%, white));
  ...
}
```
Verify by toggling to day mode and reading the numerals inside primed cells directly (not just checking DevTools computed styles).

## Warnings

### WR-01: Dead reference to a deleted local token — `var(--page-text)` in Factor Tree

**File:** `Christmas Trees/factor-tree.html:30`

**Issue:** The phase deleted Factor Tree's local `--page-text` declaration from both its `:root` and `:root[data-theme="day"]` blocks (per `01-02-PLAN.md`'s own mapping table: `--page-text` → `var(--text)`, delete), but the single consuming declaration was never updated:

```css
html,body{
  margin:0;
  min-height:100%;
  background: var(--page-bg);
  color: var(--page-text);   /* <-- --page-text no longer exists anywhere */
  ...
}
```

`--page-text` is not defined in `palette.css`, in this file's own `:root` block, or anywhere else in the repo (confirmed via repo-wide grep). Per CSS custom-property semantics, `var()` with an undefined custom property and no fallback makes the declaration invalid at computed-value time; for the inherited `color` property on the root element this collapses to the property's initial value (`canvastext`), not any of this site's theme colors.

Currently this has no *visible* symptom because every element that actually renders text inside `.wrap` sets its own explicit `color`/`fill` (h1 uses a background-clip gradient, `.subtitle`/`.chip`/`.footnote` use `var(--text-dim)`, `#numInput`/`#goBtn` set their own color, etc.) — so nothing currently inherits this broken value. But it is exactly the failure mode the project's own `.planning/research/PITFALLS.md` calls out by name ("If even one `var(--page-text)` reference survives in Christmas Trees after `--page-text` is renamed... that element silently goes invisible/wrong-colored in both themes and is easy to miss in a spot-check") — it survived, and it is a live trap for the next person who adds a bare text node under `html`/`body` without an explicit color.

**Fix:**
```css
color: var(--text);
```

### WR-02: Borderline/failing day-mode contrast on Factor Tree's "Grow the Tree" button

**File:** `Christmas Trees/factor-tree.html:125-139`

**Issue:** Same architectural pattern as CR-01, milder in effect: `#goBtn` renders white-ish `var(--accent-ink)` text over a gradient that mixes `var(--accent)` with white:

```css
#goBtn{
  color:var(--accent-ink);
  background:linear-gradient(180deg, color-mix(in srgb, var(--accent) 55%, white), var(--accent));
  ...
}
```

In day mode, `--accent-ink` is white and `--accent` is `#3457c9`. Computed contrast of white text against the gradient: 2.47:1 at the gradient's light end (top of the button, near where the label vertically sits), ~3.88:1 at the button's visual center, 6.26:1 at the bottom (pure `--accent`). WCAG AA requires 4.5:1 for this text (600-weight, 1rem/~16px — under the "large text" bold threshold of ~18.7px). The upper portion of the button is a clear fail; the vertical center is also short of 4.5:1.

**Fix:** Either drop the white-mix stop from the gradient in day mode (e.g. gate it behind `:root[data-theme="day"] #goBtn{ background: var(--accent); }`), or keep `color` fixed to a value that stays readable across the whole gradient span rather than tracking the theme-flipping `--accent-ink`.

## Info

### IN-01: Semantic-role tokens documented but bypassed at their own call sites

**Files:** `Pizza Slices/pizza-slices.html:119` (`.wedge.is-selected .cell-num{ fill:var(--accent); }`), `Christmas Trees/factor-tree.html:249` (`.node-text.one{ fill:var(--text); }`)

**Issue:** `assets/palette.css`'s header comment and inline role annotations explicitly document `--role-input` as covering "Congruence Wheel selected class" and `--role-inert-text` as covering "tree terminal `1` nodes" — but the actual CSS at those sites uses `var(--accent)` and `var(--text)` directly instead of the semantic role tokens. Because `--role-input: var(--accent)` is a straight alias today, this happens to render identically, so it's not a visible bug. But it defeats the stated purpose of the role layer (PAL-04: "each role token names what a color MEANS... rather than which tool happens to use it") — if a future change makes `--role-input` diverge from `--accent` (or `--role-inert-text` diverge from `--text`), these two call sites will silently stop matching the documented intent, and nothing will catch it since there's no lint/test for token usage in this repo.

**Fix:** Swap these two declarations to use `var(--role-input)` and `var(--role-inert-text)` respectively so the code matches the documentation it references, or update the `palette.css` comments to stop claiming these sites use the role layer.

---

## Resolution

**CR-01 (Sieve prime-cell contrast) — fixed, commit `0f1fd2b`.** Added a new `--role-result-ink` token to `assets/palette.css` (fixed dark in both themes — role-result is never bright enough in either theme for light ink) and pointed `.cell.prime` at it instead of `--accent-ink`. Verified via headless-Chrome screenshot in day mode.

**WR-01 (dead `--page-text` reference) — fixed, commit `6e7509e`.** `html,body{ color: var(--page-text); }` in `factor-tree.html` now reads `var(--text)`.

**WR-02 (Factor Tree Go-button contrast) — fixed, commit `0f1fd2b`.** Narrowed `#goBtn`'s gradient white-mix from 55% to 10%, restoring ≥4.5:1 contrast at the light end (computed ~5.06:1) without touching the already-fine dark end (~6.26:1). Verified via headless-Chrome screenshot in day mode.

**IN-01 (role-token bypass) — partially fixed, commit `1c94420`.** `Pizza Slices/pizza-slices.html`'s `.wedge.is-selected .cell-num` now uses `var(--role-input)` — verified as a true, undifferentiated alias to `var(--accent)` (declared once in `:root`, never overridden per theme), so this is a pure no-op today that closes the semantic-drift risk. The review's second suggested swap (`factor-tree.html`'s `.node-text.one` from `var(--text)` to `var(--role-inert-text)`) was **not** applied: those two tokens are independently-declared, genuinely different literal colors in both themes (not aliases), so that swap would have been a real, unintended visual regression to the terminal `1` node's text color, not the no-op the finding assumed. Left as `var(--text)`.

_Reviewed: 2026-09-24_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
