---
status: diagnosed
phase: 01-palette-unification
source: [01-VERIFICATION.md]
started: 2026-09-24T15:15:00Z
updated: 2026-09-24T15:50:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Developer sign-off on the unified palette (bypassed checkpoints)
expected: |
  No element stuck in the other theme's colors; header re-themes on all six pages; role
  meanings read consistently across pages; and the developer approves the shared-palette
  visual-identity change itself.
result: issue
reported: "the menubar still isn't universal across all pages, on homepage and on factor tree it is stuck to the screen edge, but on all the other pages the menubar is an individual thing that is just floating in the middle of the left and right edges, and a little underneath of the top edge. also I want the mode selected to stay persistent across tool navigation. Now it is not persistent across/between pages."
severity: major

## Summary

total: 1
passed: 0
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-01-1a
  truth: "The shared sticky nav header is consistently full-width/edge-pinned across all six pages, not a shared-chrome inconsistency introduced or left uncaught by this phase's palette work."
  status: failed
  reason: "User reported: the menubar still isn't universal across all pages — on the homepage and Factor Tree it is stuck to the screen edge, but on all other pages the menubar is an individual thing floating in the middle of the left/right edges and a bit below the top edge."
  severity: major
  test: 1
  root_cause: "AND-gate, both conditions necessary: (A) assets/site.css's .site-header is a full-bleed position:sticky block with no self-protection (no width:100vw, no negative margins, no position:fixed) — its full-bleed look depends entirely on its parent being full-bleed. (B) .site-header is a direct in-flow child of <body> on all six pages, and 4 of the 6 pages (Sieve, Completing-the-Square, Pizza Slices, RSA Examplifier) set padding directly on <body> in their own inline <style> block — a per-page gutter convention that predates the shared header and was never migrated when the header was introduced. That padding shrinks/offsets the header by exactly padding-left/padding-top, verified as an exact numeric match on all 4 affected pages (e.g. Sieve: header left/top=32/32 == body padding=32/32). index.html and factor-tree.html are correct only because they happen to have zero body padding, not because of any deliberate header-hardening. Pre-existing bug, not introduced by Phase 01 (confirmed via git history: the 2-vs-4 body-padding split already existed before class=\"site-header\" was introduced, and Phase 01 only added one <link> line per page)."
  artifacts:
    - path: "assets/site.css"
      issue: ".site-header (lines 17-26) has no defense against a padded ancestor containing block"
    - path: "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
      issue: "body{ padding: clamp(12px, 3vw, 32px); } (line 54) shrinks the header"
    - path: "Factorize By Completing The Square/factorize-completing-square.html"
      issue: "body{ padding: clamp(12px, 3vw, 32px); } (line 48) shrinks the header"
    - path: "RSA Examplifier/rsa-examplifier.html"
      issue: "body{ padding: clamp(12px, 3vw, 32px); } (line 34) shrinks the header"
    - path: "Pizza Slices/pizza-slices.html"
      issue: "body{ padding:44px 22px 64px; } (line 25) shrinks the header"
  missing:
    - "Move each of the 4 affected pages' body padding onto their existing content container (.app for Sieve/Completing-the-Square/RSA, .wrap for Pizza Slices) instead of <body>, preserving each page's exact padding values including Pizza Slices' asymmetric 44px/22px/64px — so the header's containing block (<body>) is unpadded on all six pages"
    - "Re-verify no double-gutter appears at narrow widths where .app/.wrap already carry their own max-width + margin:0 auto"
  debug_session: ".planning/debug/nav-header-not-full-width.md"
- gap_id: G-01-1b
  truth: "The day/night theme selection set on one page persists when navigating to another page/tool."
  status: failed
  reason: "User reported: I want the mode selected to stay persistent across tool navigation. Now it is not persistent across/between pages."
  severity: major
  test: 1
  root_cause: "AND-gate: (1) Safari/WebKit throws SecurityError (DOM Exception 18) on ANY localStorage access from a page loaded via file:// — a long-standing WebKit restriction still present in Safari 17/18 by default. Chrome and Firefox have no such restriction (confirmed empirically: real-click-and-navigate reproduction across every page pair, in both headless Chrome and headless Firefox, showed 100% correct day-mode persistence with zero console errors). (2) assets/theme.js and every page's pre-paint <head> script wrap every localStorage read/write in a silent try/catch that unconditionally falls back to 'night' with no user-visible error and no alternate persistence path. Combined: on Safari-via-file://, the toggle still visually flips the CURRENT page (applyTheme() runs unconditionally regardless of whether the swallowed localStorage.setItem succeeded), so it looks like it worked — but nothing is saved, and every subsequent page load (a different tool, or even a reload) silently defaults back to 'night'. A prior hypothesis (that Sieve/Completing-the-Square/Pizza Slices/RSA Examplifier lack a page-local [data-theme=\"day\"] CSS block) was investigated and ELIMINATED — that is the correct, intended end state of Phase 01's completed palette unification (those pages own zero local color tokens by design), not a bug."
  artifacts:
    - path: "assets/theme.js"
      issue: "readTheme()/setTheme() silently swallow a thrown SecurityError with no fallback persistence path and no user-visible warning"
    - path: "index.html, Christmas Trees/factor-tree.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factorize By Completing The Square/factorize-completing-square.html, Pizza Slices/pizza-slices.html, RSA Examplifier/rsa-examplifier.html"
      issue: "Each page's pre-paint inline <head> script has the identical silent-catch pattern, defaulting to 'night' whenever localStorage.getItem throws"
  missing:
    - "Add a document.cookie-based (or equivalent) fallback persistence path inside theme.js's setTheme()/readTheme() for when localStorage throws, shared identically by all six pages' pre-paint scripts"
    - "Optionally surface a one-time, non-blocking notice for the Safari file:// case so a user who wants full persistence knows about Safari's Develop menu > Disable Local File Restrictions option"
  debug_session: ".planning/debug/theme-not-persistent-across-pages.md"
