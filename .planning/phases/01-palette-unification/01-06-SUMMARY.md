---
phase: 01-palette-unification
plan: 06
subsystem: site-chrome
tags: [css, layout, theme-persistence, gap-closure, uat]
dependency-graph:
  requires: [assets/site.css, assets/theme.js]
  provides: [full-width-nav-header, cross-page-theme-persistence]
  affects:
    - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
    - Factorize By Completing The Square/factorize-completing-square.html
    - RSA Examplifier/rsa-examplifier.html
    - Pizza Slices/pizza-slices.html
    - index.html
    - Christmas Trees/factor-tree.html
    - assets/theme.js
tech-stack:
  added: []
  patterns:
    - "window.name as a same-tab, file://-safe fallback persistence channel when localStorage throws (Safari file:// SecurityError)"
    - "Page-gutter padding owned by each page's content container, never by <body>, so full-bleed shared chrome (.site-header) is never at the mercy of an ancestor's padding"
key-files:
  created: []
  modified:
    - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
    - Factorize By Completing The Square/factorize-completing-square.html
    - RSA Examplifier/rsa-examplifier.html
    - Pizza Slices/pizza-slices.html
    - index.html
    - Christmas Trees/factor-tree.html
    - assets/theme.js
decisions:
  - "Fix condition B of the header AND-gate (move padding off <body> onto each page's content container) rather than hardening .site-header in assets/site.css — keeps the shared stylesheet untouched and matches the debug session's preferred fix direction."
  - "Used window.name instead of the originally-suggested document.cookie fallback for theme persistence — document.cookie writes are silently dropped on file:// origins (no host/domain component) in both Chromium and WebKit, empirically verified during this plan's own research before implementation; window.name survives same-tab file:// navigation regardless of storage-permission model."
metrics:
  duration: 25min
  completed: 2026-09-24
status: complete
actuals:
  tokens: 2315
  tasks: 2
  commits: 2
  plan_head_before: 9b4c769fe86a4aaaebc11f223a195cd1b99d9218
---

# Phase 01 Plan 06: Gap Closure — Full-Width Nav Header & Cross-Page Theme Persistence Summary

Closed the two major-severity UAT gaps blocking Phase 01 sign-off: the shared sticky nav header was inset on 4 of 6 pages because their `<body>` padding shrank its containing block, and the day/night theme selection did not survive cross-tool navigation in any environment where `localStorage` throws (Safari's file:// `SecurityError` restriction) — both root causes had already been fully diagnosed by prior debug sessions and this plan implemented the fixes.

## What Was Built

**Task 1 (G-01-1a — full-width nav header):** On the four affected pages (Sieve of Eratosthenes, Factorize by Completing the Square, RSA Examplifier, Pizza Slices), removed the page-gutter `padding` declaration from each page's `body{...}` rule and relocated the exact same literal value onto that page's own content container (`.app` or `.wrap`) instead. `index.html` and `Christmas Trees/factor-tree.html` were untouched — they already had zero body padding and were already rendering correctly. `<body>` now carries zero padding on all six pages, so `.site-header`'s containing block is unpadded everywhere and the header renders full-bleed identically on every page. Pizza Slices' asymmetric `44px 22px 64px` value was preserved exactly, not normalized to the other three pages' `clamp(12px, 3vw, 32px)`.

**Task 2 (G-01-1b — theme persistence across navigation):** Layered a `window.name` fallback onto `assets/theme.js`'s existing `localStorage`-primary persistence:
- `setTheme()` now also writes `window.name = theme` (wrapped in its own try/catch) immediately before calling `applyTheme()`, in addition to its existing `localStorage.setItem` call.
- `readTheme()` first attempts `localStorage.getItem`; if that throws or returns anything other than exactly `'day'`/`'night'`, it falls back to `window.name`, using it only under strict `=== 'day'` / `=== 'night'` equality (never writing an arbitrary `window.name` value into `data-theme`). Defaults to `'night'` if neither source resolves.
- Added a comment above the IIFE recording why `window.name` was chosen over `document.cookie` (cookie writes are silently dropped on `file://` origins in both Chromium and WebKit — no host/domain component — verified empirically for this repo before writing the fix).
- Mirrored the identical fallback logic inline in each of the six pages' pre-paint `<head>` script (this script runs synchronously before `assets/theme.js` loads, so it repeats the same two-step read itself). The replacement was byte-identical across all six files, matching the original script's byte-identical starting state.
- `applyTheme()` and the existing cross-tab `storage` event listener were left completely unchanged.

## Deviations from Plan

None — plan executed exactly as written. Both tasks' exact literal values, selectors, and file lists matched the plan's specification with no adjustments needed.

## Verification

Both tasks' automated `<verify>` scripts were run against the final committed state (not just mid-edit) using the zero-dependency Node/CDP approach specified in the plan (Node 22, `google-chrome --headless=new`):

- **Task 1:** All six pages report `OK` — `.site-header` spans the full viewport width with zero left offset on every page, and each of the four previously-affected pages' content container (`.app`/`.wrap`) carries exactly its original padding value (32px for the three `clamp()` pages, 22px for Pizza Slices' `.wrap`) — confirming no double-gutter regression. Final line: `PASS: header is full-width and edge-pinned on all six pages; no double-gutter on any content container`.
- **Task 2 (throwing-localStorage simulation):** With `window.localStorage` shimmed to throw a `SecurityError` on every access (simulating Safari file://), toggling the real theme switch on Sieve, then following the real nav-header links across two same-tab hops (Sieve → RSA Examplifier → Pizza Slices), the selected `'day'` theme survived both navigations. Final line: `PASS: theme persisted across two same-tab navigations via the window.name fallback while localStorage throws.`
- **Task 2 (normal-environment regression check):** Re-ran the same click-and-navigate flow with no throwing shim — `localStorage` writes/reads worked normally (`site-theme` key correctly set to `'day'` and read back on the destination page), and a separate cross-tab `storage`-event live-sync check (two open CDP targets, toggling one and observing the other update its `data-theme` attribute without a reload) also passed. Confirms neither the localStorage-primary path nor the existing cross-tab sync regressed.

Per plan instructions, a Safari-specific human-check (repeating both flows over a real `file://` URL in actual Safari) could not be exercised in this headless-Chrome-only environment; both automated proxies for the Safari-specific behavior (the throwing-localStorage shim) passed.

## Known Stubs

None.

## Threat Flags

None — this plan's threat model (STRIDE register in 01-06-PLAN.md) was pre-populated with all four applicable threats (T-01-06-01 through T-01-06-04), all dispositioned `accept` or `mitigate` with mitigations already implemented as part of the plan's own action steps (strict `'day'`/`'night'` equality validation, try/catch wrapping on every storage access point). No new security-relevant surface was introduced beyond what the plan's threat model already covered.

## Self-Check: PASSED

- FOUND: Sieve Of Eratosthenes/sieve-of-eratosthenes.html
- FOUND: Factorize By Completing The Square/factorize-completing-square.html
- FOUND: RSA Examplifier/rsa-examplifier.html
- FOUND: Pizza Slices/pizza-slices.html
- FOUND: index.html
- FOUND: Christmas Trees/factor-tree.html
- FOUND: assets/theme.js
- FOUND commit f59cff0 (Task 1)
- FOUND commit ff975d9 (Task 2)
