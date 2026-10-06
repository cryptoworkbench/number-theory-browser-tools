---
phase: quick-261006-p2s
plan: 01
subsystem: site-chrome
tags: [logo, favicon, svg, site-css]
requires: []
provides:
  - Cayley-table brand mark in the header of all 16 pages
  - Matching assets/favicon.svg with literals re-synced to palette.css
affects: [assets/site.css, assets/favicon.svg, index.html, all 15 tool pages]
key-files:
  created:
    - .planning/quick/261006-p2s-replace-the-site-logo-with-a-simplified-/brand-logo.js
    - .planning/quick/261006-p2s-replace-the-site-logo-with-a-simplified-/header-day.png
    - .planning/quick/261006-p2s-replace-the-site-logo-with-a-simplified-/header-night.png
    - .planning/quick/261006-p2s-replace-the-site-logo-with-a-simplified-/favicon-sizes.png
  modified:
    - assets/site.css
    - assets/favicon.svg
    - index.html
    - 15 tool pages
decisions:
  - Favicon literals refreshed from stale #7c9bff/#0b0e1a/#3457c9 to palette.css's current #8ea6de/#111318 (night) and #2f4c96/#ffffff (day); approved by the orchestrator
  - No stroke-width adjustment was needed
status: complete
commits: 4
plan_head_before: b8110eccb933942bdceb86e8c6c04c8f0b99c2ca
plan_head_after: ed81120a60b8c6949269cf1cae911c0f4f66111e
actuals:
  tokens: 24000
  tasks: 3
  commits: 4
---

# Phase quick-261006-p2s Plan 01: Cayley-table site logo Summary

The numbered digit tile is replaced by a simplified Cayley table (header row and column at 40% opacity, three solid diagonal cells, grid lines, outer frame) on the rounded accent plate, in the header of all 16 pages and in the favicon.

## What was done

- **Task 1 (5ccee83):** `brand-logo.js --swap` replaced the brand SVG block in 16 pages (all-or-nothing, idempotent; the second run wrote 0 files). `assets/site.css` got the five `.brand-icon-plate/-head/-diag/-grid/-frame` rules, all via `var(--st-header-accent[-ink])`, the digit rule is gone, and the comment is rewritten. The header block is byte-identical in all 16 pages (one md5), and `i18n-check.js --header` passes for 16 pages.
- **Task 2 (f65bfdc):** `assets/favicon.svg` rewritten with the same eight shapes and the same class names. Literals re-synced to palette.css: default #8ea6de/#111318, light #2f4c96/#ffffff. This replaces the stale #7c9bff/#0b0e1a/#3457c9 (approved). `brand-logo.js --check favicon` asserts the shapes, the palette sync and the comment wording.
- **Task 3 (9e4dbf4, ed81120):** `--shots` mode and the three evidence PNGs.

## Deviations from Plan

**1. [Rule 1 - Bug] Favicon comment made the SVG unparseable**
- **Found during:** Task 3, screenshot review (favicon-sizes.png showed broken-image icons)
- **Issue:** The rewritten comment named `--accent` and `--accent-ink`. A double hyphen inside an XML comment is illegal, so the SVG failed to parse. The plan's own checks did not catch it.
- **Fix:** Reworded to "accent token" / "accent ink token" (commit 9e4dbf4). Added a `favicon-xml-wellformed` check to `brand-logo.js --check favicon`. `xmllint --noout` passes.
- **Files modified:** assets/favicon.svg, brand-logo.js

No stroke-width adjustment was needed in Task 3.

## Screenshots (inspected)

- `.planning/quick/261006-p2s-replace-the-site-logo-with-a-simplified-/header-night.png`: light periwinkle plate, dark table marks, no digits.
- `.planning/quick/261006-p2s-replace-the-site-logo-with-a-simplified-/header-day.png`: dark blue plate, light table marks.
- `.planning/quick/261006-p2s-replace-the-site-logo-with-a-simplified-/favicon-sizes.png`: favicon at 16/22/32/64 px on a light and a dark strip. At 16 px it still reads as a gridded tile with a diagonal. Headless Chrome reports a light colour scheme, so both strips show the light-scheme (dark plate, white marks) variant; the night variant was not rendered here.

## Verification

- `brand-logo.js --check`: 9 PASS lines, no FAIL.
- `i18n-check.js --all`: coverage, header, includes, no-locale-number-format, literals-markup and literals-js all PASS on 16 pages.
- No `brand-icon-digit` anywhere outside `.planning`.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

Commits 5ccee83, f65bfdc, 9e4dbf4 and ed81120 exist on main. All created files are present.
