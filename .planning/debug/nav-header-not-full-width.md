---
status: diagnosed
trigger: "the menubar still isn't universal across all pages, on homepage and on factor tree it is stuck to the screen edge, but on all the other pages the menubar is an individual thing that is just floating in the middle of the left and right edges, and a little underneath of the top edge."
created: 2026-09-24T15:07:08+02:00
updated: 2026-09-24T15:12:00+02:00
goal: find_root_cause_only
gap_id: G-01-1a
bug_class: Bohrbug (fully deterministic, reproduces 6/6 on every load)
---

## Current Focus

hypothesis: CONFIRMED — `.site-header` is a normal in-flow block child of `<body>`, so page-level `body{padding}` (present on exactly the 4 "floating" pages, absent on the 2 "edge-pinned" pages) insets it.
test: Measured `.site-header` getBoundingClientRect() vs computed `body` padding on all six pages in headless Chrome at 1280px.
expecting: header.left === body.padding-left and header.top === body.padding-top on every page.
next_action: none — diagnosis complete, returning to caller (diagnose-only mode, no fix applied)

reasoning_checkpoint:
  hypothesis: "The shared `.site-header` is full-bleed only when its containing block is full-bleed. It is a direct in-flow child of <body>, so any `padding` on <body> shrinks and offsets it. Four pages set body padding in their own <style> block; two do not — producing exactly the reported 2-vs-4 split."
  confirming_evidence:
    - "Measured: header.left/top equals body padding-left/padding-top on all 6/6 pages (0/0 on the two correct pages, 32/32 on three, 22/44 on Pizza Slices)."
    - "Measured: header.parentElement is <body> on all six — no wrapping container anywhere."
    - "Header markup is byte-identical across all six pages; zero page-level `.site-header` CSS rules exist in the repo."
  falsification_test: "If a 'floating' page had zero body padding, or an 'edge-pinned' page had non-zero body padding, the hypothesis is dead. Neither occurs — the correlation is 6/6 with no exceptions."
  fix_rationale: "N/A — diagnose-only mode. Fix direction recorded in Resolution.fix_direction."
  blind_spots: "Measured only at 1280px viewport in Chrome. The <=760px breakpoint and Firefox/Safari were not measured, but the mechanism (containing-block geometry) is layout-engine-independent and the padding values are viewport-driven via clamp(), so the inset shrinks to 12px on narrow screens rather than disappearing."
  candidate_causes:
    - "code (CSS): page-level `body{padding}` on 4 of 6 pages — CONFIRMED"
    - "code (shared chrome): `.site-header` in assets/site.css has no mechanism making it immune to ancestor padding — CONFIRMED (second half of the AND)"
    - "config (head link order): Phase 01 reordered palette.css/site.css links — ELIMINATED"
    - "environment (browser rendering difference): ELIMINATED — all six reproduced in one headless Chrome run"
    - "data: N/A — static pages, no data layer"
  and_gate: "YES — this is a genuine two-condition AND. Condition A: assets/site.css styles `.site-header` as full-bleed with no self-protection (no width:100vw, no negative margin, no position:fixed). Condition B: four page <style> blocks put padding on <body>. Neither alone produces the bug — removing either one fixes it. This matters because it determines whether the fix belongs in 1 shared file or 4 page files."

## Symptoms

expected: Every page's nav header renders identically — full width, pinned to the top/left/right screen edges.
actual: index.html and Christmas Trees/factor-tree.html render edge-to-edge (correct). Sieve Of Eratosthenes, Factorize By Completing The Square, Pizza Slices, RSA Examplifier render the header as an inset/floating card (side margins + gap below top edge).
errors: none — layout/CSS inconsistency, no crash
reproduction: Open index.html or Christmas Trees/factor-tree.html side by side with e.g. Sieve Of Eratosthenes/sieve-of-eratosthenes.html and compare the sticky nav header.
started: Present since commit fc143b6 ("feat: version 1.0 — unified site shell with standardized headers"), which introduced the shared header. Predates Phase 01.

## Eliminated

- hypothesis: The header markup differs between the correct and broken pages (extra class, different element, wrapper div)
  evidence: grep across all six pages shows byte-identical markup — `<header class="site-header">` + `<div class="site-header-inner">` — and identical nav link sets differing only in which link carries `is-active`.
  timestamp: 2026-09-24T15:08:00+02:00

- hypothesis: A wrapping container with max-width/margin (`.wrap`, `.app`) surrounds the header on the four broken pages
  evidence: The header is a DIRECT child of `<body>` and a SIBLING of `.wrap`/`.app` on all four broken pages (`</header>` is immediately followed by `<div class="app">` / `<div class="wrap">`). Measured `header.parentElement.tagName === "body"` on all six pages.
  timestamp: 2026-09-24T15:08:00+02:00

- hypothesis: A page-level `<style>` block overrides `.site-header` (e.g. adds max-width or margin) and wins the cascade over site.css
  evidence: `grep -rn "site-header" --include=*.html .` returns 12 hits, all of them markup. Zero `.site-header` CSS rules exist outside assets/site.css.
  timestamp: 2026-09-24T15:08:30+02:00

- hypothesis: Phase 01 (Palette Unification) introduced or exposed this via the palette.css/site.css link-order change
  evidence: `git show fc143b6:<page>` proves the identical 2-vs-4 body-padding split already existed at the commit that first added the shared header, before Phase 01. `git diff fc143b6..HEAD -- '*.html'` shows ZERO changes to any body padding declaration. Phase 01's only page-level edit (commit b3a98a3) was adding one `<link rel="stylesheet" href="../assets/palette.css">` line per page. Link order is irrelevant here regardless: site.css is loaded in `<head>` BEFORE each page's inline `<style>` block, so the page's `body{padding}` wins on source order no matter how the two stylesheets are ordered relative to each other.
  timestamp: 2026-09-24T15:11:00+02:00

- hypothesis: Padding/margin on the `<html>` element causes the inset
  evidence: Computed `html` padding measured as 0px top and 0px left on all six pages. Body margin also 0px left/right on all six.
  timestamp: 2026-09-24T15:10:00+02:00

- hypothesis: Browser/environment-specific rendering difference
  evidence: All six pages rendered in a single headless Chrome process at an identical 1280px viewport; two rendered correctly and four rendered inset in that same run. The split is in the source, not the environment.
  timestamp: 2026-09-24T15:10:00+02:00

## Evidence

- timestamp: 2026-09-24T15:07:08+02:00
  checked: assets/site.css (.site-header / .site-header-inner rules)
  found: `.site-header` is `position:sticky; top:0` with NO max-width and NO margin — designed to be full-bleed. `.site-header-inner` carries `max-width:1180px; margin:0 auto; padding:10px 20px` — the intended centering/inset lives on the INNER element only.
  implication: The shared stylesheet is written correctly for edge-pinned behavior but has no defense against an ancestor that constrains it.

- timestamp: 2026-09-24T15:08:00+02:00
  checked: Header markup + nesting in all six pages
  found: Identical markup on all six; `<header class="site-header">` is a direct child of `<body>`, immediately followed by the page's own `.wrap`/`.app` content container (sibling, not parent).
  implication: `<body>`'s content box IS the header's containing block. Anything applied to body's padding directly governs the header's width and offset.

- timestamp: 2026-09-24T15:08:30+02:00
  checked: `body` / `html,body` CSS rules in each page's inline <style> block
  found: PERFECT 2-vs-4 SPLIT matching the user report exactly.
    EDGE-PINNED (correct, no body padding):
      - index.html                                  -> `html,body{margin:0; min-height:100%}`, body rule sets no padding
      - Christmas Trees/factor-tree.html            -> `html,body{margin:0; ...}`, no padding
    FLOATING (broken, body padding present):
      - Sieve Of Eratosthenes/...                   -> `body{ padding: clamp(12px, 3vw, 32px); }`  (line ~54)
      - Factorize By Completing The Square/...      -> `body{ padding: clamp(12px, 3vw, 32px); }`  (line ~48)
      - Pizza Slices/pizza-slices.html              -> `body{ padding:44px 22px 64px; }`           (line ~25)
      - RSA Examplifier/...                         -> `body{ padding: clamp(12px, 3vw, 32px); }`  (line ~34)
  implication: This is the differentiating variable. Note the three `clamp()` pages also declare `html,body{padding:0}` earlier, but the later `body{padding:clamp(...)}` rule overrides it (same specificity, later source order).

- timestamp: 2026-09-24T15:09:30+02:00
  checked: Headless Chrome screenshots of all six pages at 1280x300
  found: index.html and factor-tree.html render the header flush at y=0 with its bottom border spanning the full viewport width. Sieve/Completing-Square/RSA render it as a detached bar inset ~32px on all sides; Pizza Slices inset ~22px horizontally and ~44px from the top — its bottom border visibly terminates short of both screen edges.
  implication: Symptom reproduced deterministically and matches the user's description verbatim ("floating in the middle of the left and right edges, and a little underneath of the top edge").

- timestamp: 2026-09-24T15:10:00+02:00
  checked: Programmatic measurement — .site-header getBoundingClientRect() vs computed body padding, 1280px viewport
  found: |
    index.html                     header left=0  top=0  width=1265 | body padding T/R/B/L = 0/0/0/0
    Christmas Trees/factor-tree    header left=0  top=0  width=1265 | body padding T/R/B/L = 0/0/0/0
    Sieve Of Eratosthenes          header left=32 top=32 width=1201 | body padding = 32/32/32/32
    Factorize By Completing Square header left=32 top=32 width=1201 | body padding = 32/32/32/32
    Pizza Slices                   header left=22 top=44 width=1221 | body padding = 44/22/64/22
    RSA Examplifier                header left=32 top=32 width=1201 | body padding = 32/32/32/32
    (viewport 1280, ~15px scrollbar -> 1265px available; 1265-64=1201, 1265-44=1221)
  implication: EXACT numeric correlation, 6/6 with zero exceptions. header.left === body.padding-left and header.top === body.padding-top on every single page. Causation is mechanically certain, not statistical.

- timestamp: 2026-09-24T15:11:00+02:00
  checked: git history — `git show fc143b6:<page>` for all six pages; `git diff fc143b6..HEAD -- '*.html'`
  found: The identical 2-vs-4 body-padding split already existed at fc143b6, the commit that first introduced `class="site-header"` into every page. No commit between fc143b6 and HEAD modified any body padding declaration. Phase 01's page edits (b3a98a3) were one added `<link>` line per page (+1 line x 5 files) plus a token rewrite inside assets/site.css.
  implication: Phase 01 did NOT introduce this bug and did NOT expose it via a cascade change. The defect was born in fc143b6 — the shared header was dropped into a `<body>` whose padding convention already differed per page, and that mismatch was never reconciled. Phase 01's UAT is simply the first time a human compared the header across all six pages side by side.

## Resolution

root_cause: |
  Two conditions that are both necessary and only jointly sufficient (AND-gate):

  (A) assets/site.css styles `.site-header` as a full-bleed `position:sticky` block with no
      self-protection against a constrained containing block — no `width:100vw`, no negative
      inline margins, no `position:fixed`. Its full-bleed appearance depends entirely on its
      parent being full-bleed. (assets/site.css:17-26)

  (B) `.site-header` is a direct in-flow child of `<body>` on all six pages, and four of those
      pages set padding on `<body>` in their own inline `<style>` block — a per-page page-gutter
      convention that predates the shared header:
        Sieve Of Eratosthenes/sieve-of-eratosthenes.html:54         `padding: clamp(12px, 3vw, 32px)`
        Factorize By Completing The Square/...:48                   `padding: clamp(12px, 3vw, 32px)`
        RSA Examplifier/rsa-examplifier.html:34                     `padding: clamp(12px, 3vw, 32px)`
        Pizza Slices/pizza-slices.html:25                           `padding:44px 22px 64px`
      index.html and Christmas Trees/factor-tree.html set no body padding, so their header is
      edge-pinned — the two "correct" pages are correct only by accident of a differing convention.

  Because `<body>`'s content box is the header's containing block, that padding shrinks the header
  by (padding-left + padding-right) and offsets it by padding-left / padding-top — producing the
  exact inset the user reported. `position:sticky` does not rescue it: sticky positioning is
  computed relative to the nearest scrollport but the element is clamped inside its containing
  block, so the horizontal inset persists permanently at every scroll position.

  Origin: commit fc143b6 ("feat: version 1.0 — unified site shell with standardized headers"),
  which added the shared header markup to pages whose body-gutter conventions were never
  reconciled. NOT introduced or exposed by Phase 01.

fix_direction: |
  Two viable strategies; the AND-gate means either one alone resolves the symptom.

  Preferred (fix condition B — move the gutter off <body> onto the content wrapper): on the four
  affected pages, remove the padding from the `body` rule and apply the same value to that page's
  existing content container instead — `.app` (Sieve, Completing-the-Square, RSA) and `.wrap`
  (Pizza Slices). These containers already exist as the header's next sibling, already carry
  `max-width`/`margin:0 auto` in three of the four pages, and are the correct owner of a page
  gutter. This keeps `.site-header` semantics honest (full-bleed chrome lives in a full-bleed body)
  and leaves the shared stylesheet untouched. Watch for double-gutter: `.wrap`/`.app` centering
  plus new padding should be checked at narrow widths, and Pizza Slices' asymmetric 44/22/64
  values should be preserved as-is on `.wrap` to avoid a visual regression in its own layout.

  Alternative (fix condition A — make the shared header immune): harden `.site-header` in
  assets/site.css so ancestor padding cannot affect it. A one-file change, but every available
  technique has a cost — `width:100vw` + negative margin mis-measures when a scrollbar is present
  and needs `margin-left:calc(50% - 50vw)` style compensation; `position:fixed` removes the header
  from flow and forces every page to add compensating top spacing. Only choose this if a future
  tool page is expected to reintroduce body padding.

  Whichever is chosen, apply it consistently to all six pages so index.html and factor-tree.html
  stop being correct by coincidence.

  Related but SEPARATE: gap G-01-1b (theme not persisting across pages) is a different defect in
  assets/theme.js and is NOT caused by this issue. It was not investigated in this session.

fix: [not applied — diagnose-only mode]
verification: [not applied — diagnose-only mode]
files_changed: []
