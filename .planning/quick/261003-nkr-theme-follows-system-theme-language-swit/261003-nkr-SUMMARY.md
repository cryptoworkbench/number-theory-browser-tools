---
quick_id: 261003-nkr
status: complete
date: 2026-10-03
commit: e2e5642
---

# Quick 261003-nkr summary

- **Theme follows the OS.** `assets/theme.js` and all 16 pre-paint `<head>` scripts fall back to
  `prefers-color-scheme` and track OS changes live while no explicit choice exists. Only a toggle
  click persists, under the new key `site-theme-choice`; the legacy `site-theme` key is deleted on
  load because earlier builds wrote the `night` default for every visitor. `?theme=` link
  decoration happens only after an explicit choice.
- **Language switcher in the header**, just left of the day/night toggle, on all 16 pages. The
  site footer (which held only the switcher) is removed from markup and `assets/site.css`.
  Header fits without overflow at 340/390/600px (the globe icon hides ≤560px, the select narrows).
- **Full-width prose.** `max-width: NNch` removed from the hub hero paragraph and every page's
  `.page-header`/`.page-header p`/`.lede`/`.subtitle` (plus Factor Tree's `.mode-caveat`).
  Centered diagram captions keep their measure.
- Checkers: `i18n-check.js` now requires the switcher in the header and no site footer, and treats
  matchMedia query strings as code; `i18n-browser.js` strips the canonical switcher label wherever it sits.

## Verification
- `i18n-check.js --all` and `--switcher-present --all`: PASS on 16 pages.
- Browser (Chrome, http://127.0.0.1): hub in light OS → day theme, no stored value; hero paragraph
  1036px of a 1080px column; Euclid lede 976px; toggle stores `site-theme-choice`; RSA loads clean.
- Not run: `i18n-browser.js` harness.
