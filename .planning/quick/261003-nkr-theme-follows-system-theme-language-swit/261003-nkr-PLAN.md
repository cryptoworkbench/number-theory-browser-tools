---
quick_id: 261003-nkr
type: quick
date: 2026-10-03
---

# Quick 261003-nkr: theme follows the OS, language switcher in the header, full-width prose

## Task 1 — Theme follows the system-wide theme
- `assets/theme.js`: with no explicit choice (no `?theme=`, cookie or localStorage value) the theme comes
  from `prefers-color-scheme` and tracks live OS changes; nothing is persisted and links are not
  decorated until the visitor flips the toggle. An explicit choice keeps today's behavior.
- Every page's inline `<head>` pre-paint script falls back to `matchMedia('(prefers-color-scheme: light)')`
  instead of a hard-coded `'night'`.

## Task 2 — Language switcher back in the header
- Move the `<label class="lang-switch">` block into the canonical header, immediately before the
  theme switch, on all 16 pages; delete the now-empty `<footer class="site-footer">` everywhere.
- `assets/site.css`: drop the footer rules, restyle `.lang-switch` for the header row (compact select,
  icon hidden on narrow screens).
- RSA/DH scratchpad dock still sits at the end of the body (sticky bottom:0), unaffected.
- `i18n-check.js --header`: switcher must be in the header; no site footer allowed.
  `i18n-browser.js`: strip the canonical switcher label wherever it sits.
- CLAUDE.md docs updated.

## Task 3 — Intro prose spans the content width
- Remove the `max-width: NNch` caps on `.hero p` (hub), `.page-header`, `.page-header p`, `.lede`,
  `.subtitle` and Factor Tree's `.mode-caveat`. Centered diagram captions keep their measure.

## Verify
- `node .planning/phases/06-multi-language-support/i18n-check.js --all` green.
- Browser check: hub + a tool page in light/dark OS emulation, header layout at desktop and phone width.
