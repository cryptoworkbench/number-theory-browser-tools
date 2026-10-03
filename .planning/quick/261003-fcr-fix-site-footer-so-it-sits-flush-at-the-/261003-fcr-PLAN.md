---
phase: quick-261003-fcr
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "assets/site.css"
  - "RSA/rsa.html"
  - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
  - ".planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/flush-probe.js"
  - ".planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js"
  - "CLAUDE.md"
  - ".planning/codebase/STRUCTURE.md"
autonomous: true
requirements: [QUICK-261003-fcr]

estimate:
  tokens: 150000
  raw_tokens: 150000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Pages are loaded by default on all 16 pages, in night and day themes, at true CSS viewports of 375x812, 1280x800, 1920x1080, 2000x1333 (device scale factor 1.368, the user's 2736x1823 screen) and 2560x1440. In every run, the site footer's bottom edge equals document.documentElement.scrollHeight within 1px and is at least the viewport height minus 1px. No rendered box that is not position:fixed and not clipped by an overflow ancestor extends below the footer. The same holds after scrolling to the end of the page (FLUSH, 160 runs) (D-01, D-02, D-10)."
    - "No element outside the site footer moves. In the same page load, every non-fixed element in body outside the site footer has the same document-relative rect within 0.5px under the new site.css and under the 5185635 site.css. A flex-column body variant fails this gate (LAYOUT-INVARIANT, 160 runs; NEG-LAYOUT) (D-01)."
    - "On RSA and Diffie-Hellman, the 240px reserve is the site footer's own bottom padding, so the footer band runs to the bottom edge of the page. This is tested after a full generation, with the fixed panel forced to its worst-case footprint and the page scrolled to the end, at the four desktop sizes in both themes. In every run the footer is flush, nothing is below it, and the panel does not overlap the language switcher (FLUSH-LONG, 16 runs). The bqz SCRATCH-CLEAR still passes 10 runs (D-06, D-07)."
    - "The probe is not vacuous. Each of these mutations makes it fail: deleting `top: 100vh` (Sieve at 1920x1080); weakening `html > body` to `body` (Factor Tree at 2560x1440); moving the reserve back onto body (RSA at 1920x1080); and replacing the mechanism with a flex-column body (Sieve at 1280x800, LAYOUT-INVARIANT) (FLUSH-NEG, 4 controls)."
    - "Printed output keeps its page count. Every page prints the same number of PDF pages as at 5185635, and RSA and Diffie-Hellman print no more pages than before (PRINT-PAGES, 16 pages) (D-03)."
    - "The site footer markup and styling contract from 261003-bqz still holds. These gates pass: MARKUP-EXACT (16 pages, with the documented fcr reserve delta), SITE-CSS, STRIP-GATE (9), FOOTER-GATE (8), FOOTER-375 (64), STYLE-PARITY (16 pages, 2 themes; position sticky; padding-bottom 240px on RSA and DH only, 0px elsewhere), SCRATCH-CLEAR (10) and PROBE-NEG (3) (D-08)."
    - "Nothing else regresses. nt-i18n.js, theme.js, palette.css and assets/i18n/ are unchanged since 5185635. i18n-check.js --all passes its six modes on 16 pages; --switcher-present passes; --api, --persistence and --smoke report 399, 248 and 123 assertions. i18n-browser.js full mode passes on all 16 pages (en-parity IDENTICAL, langs=15, switch, layout). harness.js reports total=2856003. shadow-check.js passes --all and --docs (D-11, D-13)."
  artifacts:
    - path: "assets/site.css"
      provides: "the sticky site footer (position sticky, top 100vh) plus the screen-only html > body one-viewport min-height"
      contains: "top: 100vh;"
    - path: "RSA/rsa.html"
      provides: "the 240px fixed-panel reserve as page-local bottom padding on the site footer"
      contains: "  .site-footer{ padding-bottom: 240px; }"
    - path: "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
      provides: "the 240px fixed-panel reserve as page-local bottom padding on the site footer"
      contains: "  .site-footer{ padding-bottom: 240px; }"
    - path: ".planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/flush-probe.js"
      provides: "the flush, long, print and neg verification modes (FLUSH, LAYOUT-INVARIANT, FLUSH-LONG, PRINT-PAGES, FLUSH-NEG)"
      contains: "LAYOUT-INVARIANT"
    - path: ".planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js"
      provides: "bqz gates updated where this task revises bqz decisions: the MARKUP-EXACT fcr reserve delta, STYLE-PARITY expecting sticky plus per-page padding-bottom, and NEG-SCRATCH re-anchored"
      contains: "FCR_RESERVE_LINE"
  key_links:
    - from: "assets/site.css .site-footer (position sticky, top 100vh)"
      to: "assets/site.css screen block html > body (min-height 100vh then 100dvh)"
      via: "sticky offset bounded by its containing block (body): the footer is pushed down to the bottom of a body that is at least one viewport tall, never past it"
      pattern: "html > body\\{"
    - from: "RSA/rsa.html and Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html page styles"
      to: "the position:fixed public-values panel (z-index 900, at most 236px including its bottom offset)"
      via: "page-local .site-footer padding-bottom 240px, which outranks site.css's .site-footer padding 0 by source order"
      pattern: "\\.site-footer\\{ padding-bottom: 240px; \\}"
    - from: "footer-probe.js transformPageSrc"
      to: "the RSA/DH reserve lines in the working tree"
      via: "an exact, occurrence-checked fcr delta step after bqz's D-07 step"
      pattern: "FCR_RESERVE_COMMENT_LINE"
---

<objective>
Make the shared site footer (added by quick task 261003-bqz) sit flush at the bottom on all 16 pages:
- Its bottom edge is the bottom edge of the document.
- On a page shorter than the window, it is also the bottom edge of the window.
- Nothing renders below it.

The user's screenshots (2000x1333 CSS, full-screen) show two failures:
- The Sieve stops short of the window bottom, with page background showing underneath.
- RSA and Diffie-Hellman end with a band of page background more than 240px tall below the footer. This is the scratchpad reserve that 261003-bqz moved onto `body`.

Purpose: the footer must read as the end of the page, like a normal sticky footer, without disturbing any page's own layout.

Output:
- `assets/site.css` gets a sticky footer: `position: sticky; top: 100vh` on `.site-footer`, plus a screen-only `html > body` min-height of one viewport.
- RSA and Diffie-Hellman move the reserve into the footer as page-local `padding-bottom`.
- A new task-local probe, `flush-probe.js`, with flush, layout-invariance, long-content, print and negative-control modes.
- Surgical updates to bqz's `footer-probe.js`, so its gates track the two bqz decisions this task revises.
- Two doc sentences.

Baseline: HEAD `5185635` at planning time is the fixed baseline for every "unchanged" check: LAYOUT-INVARIANT, PRINT-PAGES, ENGINE-UNCHANGED and CHANGE-SCOPE. MARKUP-EXACT and SITE-CSS keep their bqz base `81c4d14`.

Execution environment:
- Run everything in the main checkout. There is no worktree, because `workflow.use_worktrees` is false, and `i18n-browser.js` needs the real repository to build its BASE.
- Stage files by explicit path only. Never use `git add -A`, `git add .` or `git commit -a`.
- Never stage the modified `.planning/config.json`.
- Never stage any of these untracked items: `.gsd/`, `.planning/state.json`, `.planning/ui-reviews/`, `.planning/quick-batches/`, `.planning/phases/07-shared-js-module-refactor/.gitkeep`, `possible_menubar_configuration`, the file whose name starts with `Last '`, or the three `* webtool screenshot.png` files in the repo root.
- Do not commit this PLAN.md or the SUMMARY; the orchestrator commits them with STATE.md.
- The user asked for an uninterrupted run. Every judgment call below is a recorded decision. Apply each one, and record any deviation in the SUMMARY.
- Verify commands are copied into the shell tool verbatim. They contain no backslash-u escapes; keep it that way in any command you write.
- Long commands (each probe matrix, each i18n-browser chunk) run as separate Bash calls with run_in_background, one at a time, and each is waited for.

**Planner decisions (D-NN).** This quick task has no CONTEXT.md. The decisions come from live observation of HEAD 5185635 and a scratch-copy prototype run outside the repository (see context). Task actions cite them by ID.

- **D-01 Mechanism: a sticky footer, not a flex or grid body.**
  - `.site-footer` changes its declaration `position: relative;` to `position: sticky;` and gains `top: 100vh;` directly after it.
  - A screen-only rule gives body a min-height of one viewport (D-02, D-03, D-04).
  - How it works: a sticky box is offset only within its containing block (body). With `top: 100vh`:
    - On a page shorter than the viewport, the footer is pushed down until its bottom meets body's bottom, which is the viewport bottom.
    - On a longer page it never moves, at any scroll position, because body ends where the footer ends.
  - Rejected alternative: body as a flex column with `margin-top: auto` on the footer. This was measured in the prototype at 1280x800 by toggling the rule within the same page load:
    - Sieve: 172 element rects moved, and `.app` shrank to fit-content (left 92.5 to 124px).
    - Factor Tree: 11 rects moved. Cayley Table: 18.
    - Group Isomorphism: 350 rects moved, plus 16 boxes ending up below the footer.
    - Cause: a flex or grid item with `margin: 0 auto` is sized to fit-content instead of stretching, and sibling margins stop collapsing. Grid has the same auto-margin sizing.
  - Chosen mechanism: the sticky footer moved 0 rects on all 16 pages at 375x812, 1280x800, 2000x1333 and 2560x1440.
  - This supersedes 261003-bqz D-06's `position: relative`. Sticky is also a positioned value, so `z-index: 2` still keeps the footer above Factor Tree's fixed `#sky`/`#snow` layers (z-index 0/1) and below the RSA/DH panel (900) and the sticky header (1000).
- **D-02 Selector `html > body`.** Specificity (0,0,2) outranks every page's own rule:
  - `body{ min-height:100vh }` (11 pages).
  - `html,body{ min-height:100% }` on index.html and Factor Tree, where the percentage never resolves because html has no definite height.
  - Measured: with a plain `body` selector, Factor Tree's footer ends at 1219px in a 1440px viewport (2560x1440). With `html > body` it ends at 1440.
  - No page sets body display, padding (once D-06 lands) or margin-bottom.
- **D-03 Screen only.** The min-height rule sits in an `@media screen{ ... }` block, so printed layout is unchanged by construction. The footer is already `display: none` in print (bqz D-09). The Equivalence Wheel's print stylesheet and the five pages without their own body min-height (index, Factor Tree, Venn, Equivalence Wheel, Group Isomorphism) therefore print exactly as before.
  - RSA and DH lose only their 240px trailing blank in print, because the reserve now lives in the hidden footer.
  - PRINT-PAGES checks page counts. In the prototype the Wheel printed 1 page and RSA and the Sieve 2 pages each, at both base and candidate.
- **D-04 Viewport unit.** Declare `min-height: 100vh;` and then `min-height: 100dvh;`, so browsers without dvh fall back. dvh tracks mobile toolbars, so on a short page the footer sits at the visible bottom. On desktop dvh equals vh. `top: 100vh` stays vh: any offset of at least the viewport height gives the same result, because the containing block bounds the offset.
- **D-05 site.css comments, no new tokens, no colors.**
  - Rewrite the last sentence of the comment above `.site-footer`: it describes position:sticky/top:100vh and keeps the z-index rationale.
  - Precede the new screen block with a comment that states:
    - the flush guarantee;
    - why a flex or grid body was rejected (D-01);
    - why `html > body` (D-02);
    - why screen only (D-03);
    - the rule for pages: never body padding or margin below the site footer; bottom room a page needs is page-local `padding-bottom` on `.site-footer`.
  - Write no `#` character anywhere in the new or rewritten site.css text, because SITE-CSS's hex scan reads comment-continuation lines too.
  - No palette change, no new custom property, no color declaration.
- **D-06 RSA/DH reserve moves into the footer.**
  - In each page, replace the two bqz lines with two new lines. The old lines are RSA :170-171 and DH :161-162: the one-line comment that begins `  /* The reserve sits on body, below the shared site footer,` and the rule line that follows it.
  - The new lines are exactly:
    - line 1: `  /* The reserve sits inside the shared site footer as its bottom padding, so the footer band runs to the bottom edge of the page with nothing below it, while at the end of the page this panel (at most 236px: min(40vh, 220px) tall plus a bottom offset of at most 16px) still clears the language switcher at the top of that band. */`
    - line 2: `  .site-footer{ padding-bottom: 240px; }`
  - The pre-bqz multi-line comment above them stays byte-identical.
  - The page `<style>` follows the site.css `<link>` (RSA :10/:12, DH :10/:14), so this equal-specificity rule wins over site.css's `padding: 0`.
  - The geometry is unchanged: the switcher bottom is still the document bottom minus 240px minus the inner 14px. Prototype SCRATCH-CLEAR gaps were identical to bqz's: RSA 34/34/32/28/26, DH 26/25/24/20/26, hit 0.
  - This supersedes 261003-bqz D-07's body placement.
- **D-07 No smaller reserve on wide viewports (the optional refinement is declined).**
  - At about 742px wide and above, the centered switcher (about 190px) and the 260px panel at the right edge no longer overlap horizontally, so the switcher alone would not need the reserve.
  - The reserve predates the footer, though. The pre-bqz comment says it gives the scroll room that RSA's and DH's scroll-past panel reveal needs, and it keeps the panel off the page's own footer text. Both are independent of width.
  - A width-dependent reserve would need a media query tied to that overlap threshold, and would reopen the reveal problem.
  - Keep 240px at every width. Record this in the SUMMARY with the FLUSH-LONG gap figures.
- **D-08 Probe placement.**
  - New assertions live in a new task-local `flush-probe.js` in this task's directory. It reuses only bqz's exported `makeScratchCopy`, plus `harness.js` (`mkScratch`, `chromeEnv`) and `i18n-check.js` (`PAGES`).
  - bqz's `footer-probe.js` is edited only where this task deliberately revises a bqz decision, and each edit replaces one exact assertion with another exact assertion (D-12):
    - (a) MARKUP-EXACT gets an fcr delta step for the D-06 lines.
    - (b) STYLE-PARITY expects `position` `sticky`. It compares the shared vector without `paddingBottom`, and asserts `paddingBottom` per page: `240px` on RSA and DH, `0px` on the other 14.
    - (c) NEG-SCRATCH re-anchors on the new reserve line.
  - SITE-CSS, STRIP-GATE, FOOTER-GATE, FOOTER-375 and SCRATCH-CLEAR need no edit. The prototype confirmed that FOOTER-375 (64) and SCRATCH-CLEAR (10) pass unchanged against the candidate.
- **D-09 Measurement technique.**
  - Every runtime run uses bqz's iframe technique: a wrapper page holding a borderless iframe of the exact CSS size, inside a 2700x1600 outer window. Headless Chrome cannot hit exact sizes top-level: a 2000x1333 top-level window measured innerHeight 1190.
  - The 2000x1333 size adds `--force-device-scale-factor=1.368`. The prototype read devicePixelRatio 1.368, footer bottom 1333.322 and scrollHeight 1333.
  - Timers follow bqz D-14 (rAF and paint are scarce under virtual time): setTimeout only, and no reliance on transitions settling.
- **D-10 FLUSH definition.**
  - Measured once at scroll top, and again 800ms after scrolling to `scrollHeight`:
    - `fb` = footer rect bottom + scrollY
    - `sh` = scrollHeight
    - `vh` = innerHeight
  - Pass requires all of:
    - `|fb - sh| <= 1` and `fb >= vh - 1`, at both measurements;
    - `vw` and `vh` equal the requested size;
    - devicePixelRatio within 0.01 of a requested factor;
    - BELOW = 0 at both measurements.
  - BELOW counts elements in body whose clipped bottom + scrollY exceeds `fb + 1`.
    - Skip: SCRIPT/STYLE/NOSCRIPT/TEMPLATE/LINK/META, the site footer subtree, any element with a position:fixed self or ancestor, computed visibility hidden or collapse, and zero-area rects.
    - The clipped bottom is the rect bottom, reduced to the rect bottom of every ancestor below html whose overflow-x or overflow-y is not `visible`.
  - Why clipping matters: at 375px, Group Isomorphism's `.ref-list` (overflow:auto) holds 136 list items whose raw rects pass the footer but are clipped. A naive scan reports them, at HEAD and with the fix alike.
- **D-11 Untouched.**
  - `assets/nt-i18n.js`, `assets/theme.js`, `assets/palette.css`, every `assets/i18n/` file, and the site-footer markup on every page (FOOTER-DRIFT stays green).
  - Every page except RSA and DH, and in those two pages everything except the two D-06 lines.
- **D-12 Fix policy.** If a gate fails, fix the root cause in site.css or the D-06 lines. Never loosen a gate, widen a tolerance beyond D-10's 1px/0.5px, exclude a page, or add an en-parity exception.
- **D-13 Browser chunks and the Fermat flake.**
  - i18n-browser.js full mode runs in nine chunks of at most about 6 minutes each, using bqz's CHUNK-TIME figures:
    - Sieve + RSA (Task 1)
    - index + Group Isomorphism
    - Factor Tree + Venn
    - Euclidean + CRT
    - Equivalence Wheel + Totient
    - Cayley
    - Square and Multiply + DH
    - ECDH + Shor
    - Fermat
  - A Fermat en-parity DIFF at a mid-animation step snapshot is the known `animateRearrange()` timing flake (STATE.md, bqz D-18). Re-run that chunk once; a second failure is real. Record any retry.
- **D-14 Docs.**
  - `CLAUDE.md`: add one sentence after the footer-placement sentence in the Multi-language bullet.
  - `.planning/codebase/STRUCTURE.md` :137: name the sticky footer.
  - No mirrored `.claude/CLAUDE.md`/ARCHITECTURE.md line needs a change: they describe the footer's contents, not its layout. `shadow-check.js --docs` must stay green.
- **D-15 Accepted consequences.**
  - On RSA and DH the footer band is 300px tall at the end of the page: the switcher row sits at the top, and the reserve runs to the bottom edge. The fixed panel overlays the band's lower right, which is the user-requested shape.
  - On a short page the space between the content and the footer shows the page's own body background.
  - `position: sticky` and dvh are supported by every browser the site targets: sticky in Chrome 56+, Firefox 59+ and Safari 13+; dvh in Chrome 108+, Firefox 101+ and Safari 15.4+, with the vh fallback first. Only headless Chrome is automated, so a cross-browser look is a pending human-check.

**Source coverage audit**

| Source | ID | Item | Task | Status |
|---|---|---|---|---|
| GOAL | — | Footer sits flush at the bottom on all 16 pages, with no empty band below | 1, 2 (FLUSH 160 runs) | COVERED |
| REQ | QUICK-261003-fcr | Full quick-task description | 1, 2, 3 | COVERED |
| TASK-DESC | — | Sticky-footer layout in site.css (min-height 100vh/100dvh plus a footer mechanism that does not fight page layouts); footer bottom equals document bottom and, on short pages, viewport bottom; nothing below | 1 (D-01 to D-05), 2 (FLUSH, LAYOUT-INVARIANT) | COVERED |
| TASK-DESC | — | RSA/DH reserve moves into the footer as page-local padding-bottom on .site-footer, with the switcher row above the panel | 1 (D-06), 2 (FLUSH-LONG, SCRATCH-CLEAR, NEG-RESERVE) | COVERED |
| TASK-DESC | — | Optional smaller reserve on wide viewports: decide and record | D-07 (declined, with rationale and gap figures in the SUMMARY) | COVERED |
| TASK-DESC | — | Do not break page layouts (body/html/container rules, Factor Tree #sky/#snow, 10 tool footers, Equivalence Wheel print, full-height grids) | D-01, D-02, D-03; 2 (LAYOUT-INVARIANT on 16 pages x 5 sizes x 2 themes, STYLE-PARITY z-index, PRINT-PAGES) | COVERED |
| TASK-DESC | — | Palette tokens only, no literal colors | D-05; 1 (SITE-CSS, MARKUP-EXACT pins the RSA/DH lines) | COVERED |
| TASK-DESC | — | Runtime probe: 16 pages x day/night x 1280x800, 1920x1080, 2000x1333 at DPR 1.37, 2560x1440; footer bottom equals scrollHeight within 1px and is at least the viewport height; nothing below; RSA/DH clearance | 2 (FLUSH, plus 375x812; FLUSH-LONG; SCRATCH-CLEAR) | COVERED |
| TASK-DESC | — | Short-content (default load) and long-content (RSA/DH generated, scrolled to end) states | 2 (FLUSH at top and end; FLUSH-LONG) | COVERED |
| TASK-DESC | — | Use the iframe technique; virtual-time paint/rAF scarcity | D-09 | COVERED |
| TASK-DESC | — | Negative control proves the probe is not vacuous | 2 (FLUSH-NEG, 4 controls) | COVERED |
| TASK-DESC | — | en-parity and all existing gates stay green (i18n-check --all/--api/--persistence/--smoke, i18n-browser on 16 pages, footer-probe modes, harness, shadow-check) | 1 (Sieve + RSA browser, static), 2 (bqz runtime modes), 3 (14 pages, consolidated sweep) | COVERED |
| TASK-DESC | — | Main checkout; never stage config.json or scratch files | Execution environment; 3 (CHANGE-SCOPE, CONFIG-NOT-COMMITTED) | COVERED |
| TASK-DESC | — | Uninterrupted run; judgment calls recorded as decisions | D-01 to D-15 | COVERED |
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@assets/site.css
@.planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/261003-bqz-SUMMARY.md

Read only these ranges (line numbers at HEAD 5185635):
- `.planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js` (950 lines):
  - parseArgs :49
  - makeScratchCopy :81
  - RESERVE_* constants :96-101
  - GISO delta precedent :103-114
  - transformPageSrc :119-166 (D-07 step :152-156)
  - runtime helpers :576-645:
    - resolveSiteRoot :576
    - runChromeDumpDom :582
    - extractDataM :601
    - buildProbeCopy :607
    - buildIframeSrc :624
    - writeWrapperAndRun :635
  - scratchMetricsScript :810-850 (worst-case panel forcing, D-14)
  - modeStyle :746-798 (expect block :779-790)
  - modeNeg :880-925 (NEG-SCRATCH :905-915)
  - module.exports :946-950
- `assets/site.css` (236 lines):
  - `.site-footer` comment :184-193
  - `.site-footer` :194-210 (position :195)
  - `.site-footer-inner` :211-221
  - print block :223-225
- `RSA/rsa.html` :163-171 and `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` :155-162 (reserve comments and rule).
- `.planning/phases/07-shared-js-module-refactor/harness.js` exports `mkScratch(prefix)`, a scratch dir that is removed when the creating process exits, and `chromeEnv()`. Requiring it does not run its CLI. footer-probe.js exports `makeScratchCopy`, `transformPageSrc` and `buildCanonicalFooterString`. Requiring it does not run its CLI.

Observed at planning time (HEAD 5185635):
- Body rules:
  - 11 pages: `html,body{ margin:0; padding:0; min-height:100% }` plus `body{ min-height:100vh }`.
  - index and Factor Tree: `html,body{ min-height:100% }` only. Factor Tree also has `overflow-x:hidden; position:relative` on html and body, which makes body a scroll container.
  - Venn, Equivalence Wheel and Group Isomorphism: no min-height.
  - RSA and DH: also `body{ padding-bottom: 240px }`.
  - No page sets body display.
  - The bare `footer{}` rules on 10 pages set no position or top.
- HEAD failure reproduced:
  - Sieve's footer ends at 983px in a 1920x1080 viewport, and at 978px in a 2000x1333 one at DPR 1.368 (scrollHeight 1333).
  - RSA's and DH's footers end 240px above scrollHeight at every size.
  - Venn, CRT, Totient and Cayley also stop short at 2560x1440.
- Prototype: a scratch copy outside the repo, with D-01 to D-04 and D-06 applied.
  - FLUSH held on all 16 pages at 375x812, 1280x800, 2000x1333 (DPR 1.368) and 2560x1440, with 0 layout diffs.
  - The long state held: RSA and DH generated and scrolled to the end at 1280x800, 1920x1080 and 2560x1440 (RSA footer at 4914.48 vs scrollHeight 4914; DH 3728.64 vs 3729).
  - bqz SCRATCH-CLEAR PASS 10, FOOTER-375 PASS 64.
  - bqz STYLE-PARITY failed only on `position` (sticky) and on the RSA/DH padding-bottom vector split. Both are expected; D-08(b) fixes them.
- Cost: about 1.2-1.5s per Chrome run (iframe flush run or print-to-pdf). bqz scratch: 10 runs in 12s; style: 32 runs in 37s; w375: 64 runs in 77s.
- Baselines (all PASS at 5185635):
  - i18n-check: `--all` six modes on 16 pages; `--switcher-present` 16 pages; `--api` 399; `--persistence` 248; `--smoke` 123 (mutant detected).
  - harness.js total=2856003.
  - shadow-check `--all` and `--docs` PASS.
  - footer-probe: MARKUP-EXACT 16, SITE-CSS (3 color declarations), STRIP-GATE 9, FOOTER-GATE 8.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Tracer — sticky site footer plus the RSA/DH reserve in the footer, proven flush end-to-end by a new probe at the user's screen size</name>
  <files>assets/site.css, RSA/rsa.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, .planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/flush-probe.js, .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js</files>
  <read_first>
    - assets/site.css (whole file, 236 lines)
    - RSA/rsa.html :155-212 and Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html :155-202
    - .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js :1-170 and :570-650
  </read_first>
  <action>
1. **Create the flush-probe.js `flush` mode first (red phase, D-08, D-09, D-10).**
   - Create `.planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/flush-probe.js` as a "use strict" Node CLI.
     - Header comment: what it verifies, for quick task 261003-fcr; dev-only; never referenced by any page.
     - ROOT is three directories up.
     - It requires i18n-check.js (PAGES), harness.js (mkScratch, chromeEnv) and bqz's footer-probe.js (makeScratchCopy).
     - Options: `<mode>`, `--base <sha>` (default `5185635`), `--root <dir>`, `--only <substring>` (filters pages), `--sizes <comma list>` and `--themes <comma list>`.
     - A size is `WxH` or `WxH@F`, where F is a device scale factor.
     - It exits 0 only on PASS and never writes inside the repository.
   - Helpers, modeled on footer-probe.js :576-645:
     - The site root is a fresh `makeScratchCopy` unless `--root` is given.
     - The probe copy is the page with injected content, written next to the original as `<name>.flush-probe.html` so `../assets/` resolves.
     - The wrapper is written at the scratch root. It holds a borderless iframe of exactly W by H CSS pixels, whose src is the URI-encoded probe path plus `?lang=en&theme=<t>`. A message listener copies `event.data` into the wrapper's `data-m`.
     - Chrome runs with `--headless=new --disable-gpu --no-sandbox`, a fresh profile from harness.mkScratch, `--virtual-time-budget`, `--window-size=2700,1600`, `--dump-dom`, and `--force-device-scale-factor=F` only for `@F` sizes. It uses harness.chromeEnv() and a 90-second timeout.
   - `flush` mode (FLUSH and LAYOUT-INVARIANT):
     - Defaults: sizes `375x812,1280x800,1920x1080,2000x1333@1.368,2560x1440` and themes `night,day`.
     - Read the base site.css with `git show <base>:assets/site.css`.
     - Build each probe copy:
       - Immediately after the page's site.css `<link>` line, insert an inline style element with id `flush-probe-base` and attribute `media="not all"`, holding the base site.css text.
       - Before `</body>`, insert the metrics script. Budget is 4000.
     - The metrics script, 1500ms after it starts:
       - (i) Records RECTS: for every element in body, the label, left, top + scrollY, width and height, each rounded to 0.5px.
         - Skip SCRIPT/STYLE/NOSCRIPT/TEMPLATE/LINK/META, the `.site-footer` subtree, and any element with a position:fixed self or ancestor (walking up to body).
       - Takes FLUSH metrics at the top per D-10: fb (2 decimals), sh, vh, vw, dpr, and the BELOW count with the first offender's label. BELOW is clip-aware exactly as D-10 defines.
       - (ii) Disables the page's site.css link element (its `disabled` property) and sets the base style's media to `all`. Records RECTS again, then restores both.
       - (iii) Scrolls to scrollHeight. 800ms later it takes the FLUSH metrics again (fbEnd, shEnd, belowEnd, sy).
       - Posts JSON to the parent with these metrics, n (rect count), ndiff, and the first differing label.
     - Comparison: ndiff counts elements whose left, top, width or height differ by more than 0.5px between the two RECTS passes. A length mismatch counts as a diff.
     - Run pass rules:
       - flushOk: D-10's conditions at both measurements, plus vw === W, vh === H, and dpr within 0.01 of F when given.
       - layoutOk: n > 0 and ndiff === 0.
     - Output:
       - One line per run: `FLUSH-RUN <page> <theme> <size> <json>`.
       - Then exactly two summary lines: `FLUSH PASS <n> runs` or `FLUSH FAIL <k> of <n> runs`, then `LAYOUT-INVARIANT PASS <n> runs` or `LAYOUT-INVARIANT FAIL <k> of <n> runs`.
       - Exit 0 only when both pass.
   - Before editing site.css or any page, run `flush --only "Sieve Of Eratosthenes" --sizes 2000x1333@1.368 --themes night` and `flush --only "RSA" --sizes 1920x1080 --themes night`. Both must print `FLUSH FAIL` (Sieve: fb well below sh; RSA: fb = sh - 240). Record both lines in the SUMMARY as the reproduced bug. If either passes, the probe is wrong: fix it before going on.

2. **`assets/site.css` (D-01 to D-05).**
   - In `.site-footer`, replace the single declaration line `  position: relative;` with the two lines `  position: sticky;` and `  top: 100vh;`. Every other declaration stays as it is and in order.
   - Rewrite the comment's final sentence (the one about position:relative and z-index:2) per D-05.
   - Between the `.site-footer-inner` rule and the print block, add the D-05 comment, then the block: `@media screen{`, `  html > body{`, `    min-height: 100vh;`, `    min-height: 100dvh;`, `  }`, `}`, followed by one blank line.
   - Use 2-space indentation. Write no `#` character anywhere in the new text. Leave the print block and every other rule byte-identical.

3. **RSA and DH (D-06).**
   - In each page, replace exactly the two bqz lines with the two D-06 lines. Use a Node transform run from the repo root (inline `node -e` or a script saved outside the repository), anchored on the old comment line and the line after it. It must abort without writing if either anchor occurs other than exactly once.
   - Change nothing else.

4. **bqz footer-probe.js MARKUP-EXACT delta (D-08a).**
   - Next to the RESERVE constants, add `FCR_RESERVE_COMMENT_LINE` and `FCR_RESERVE_LINE`, holding the exact D-06 lines, under a comment naming quick task 261003-fcr and D-06.
   - In transformPageSrc, directly after the D-07 replacement step, add a step for RESERVE_PAGES. It requires exactly one occurrence of `RESERVE_COMMENT_LINE + "\n" + RESERVE_NEW_LINE` and replaces it with `FCR_RESERVE_COMMENT_LINE + "\n" + FCR_RESERVE_LINE`. Throw a descriptive error on any other count.
   - Add one line to the file's header comment saying it was updated by 261003-fcr where that task revises bqz D-06/D-07. Change nothing else in this task.

5. Run the verify block. Run the Sieve + RSA browser chunk as a separate Bash call with run_in_background and wait for it. Fix root causes per D-12. Commit by explicit paths: the five files above, with the new probe added.
  </action>
  <verify>
    <automated>for p in "Sieve Of Eratosthenes" "RSA" "Factor Tree" "Venn Diagram"; do out=$(node .planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/flush-probe.js flush --only "$p" --sizes 2000x1333@1.368,2560x1440); echo "$out"; echo "$out" | grep -q "FLUSH PASS 4 runs" && echo "$out" | grep -q "LAYOUT-INVARIANT PASS 4 runs" || exit 1; done</automated>
    <automated>node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js markup | grep -q "MARKUP-EXACT PASS 16 pages" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js css | grep -q "SITE-CSS PASS" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js strip | grep -q "STRIP-GATE PASS 9 checks" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js gate | grep -q "FOOTER-GATE PASS 8 mutants" && out=$(node .planning/phases/06-multi-language-support/i18n-check.js --all) && for m in coverage header includes no-locale-number-format literals-markup literals-js; do echo "$out" | grep -qx "I18N-CHECK PASS $m: 16 page(s)" || exit 1; done && node .planning/phases/06-multi-language-support/i18n-check.js --switcher-present --all | grep -q "I18N-CHECK PASS switcher-present: 16 page(s)" && git diff --quiet 5185635 -- assets/nt-i18n.js assets/theme.js assets/palette.css assets/i18n && echo "STATIC PASS"</automated>
    <automated>for p in "Sieve Of Eratosthenes/sieve-of-eratosthenes.html" "RSA/rsa.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
  </verify>
  <done>
- The probe reproduced the bug before the fix: both red-phase runs printed `FLUSH FAIL`, recorded in the SUMMARY.
- After the fix, Sieve, RSA, Factor Tree and Venn each report `FLUSH PASS 4 runs` and `LAYOUT-INVARIANT PASS 4 runs` at 2000x1333 (DPR 1.368) and 2560x1440, night and day.
- MARKUP-EXACT 16, SITE-CSS, STRIP-GATE 9 and FOOTER-GATE 8 pass.
- i18n-check `--all` passes its six modes on 16 pages, and `--switcher-present` passes.
- The engine, palette and dictionaries are unchanged since 5185635.
- Sieve and RSA pass i18n-browser full mode (en-parity IDENTICAL, langs=15, switch, layout). CHUNK-TIME is recorded.
- Committed as one `feat(quick-261003-fcr): ...` commit by explicit paths.
  </done>
</task>

<task type="auto">
  <name>Task 2: Runtime proof on every page — full flush/layout matrix, RSA/DH long state, print parity, negative controls, and the bqz runtime gates updated to the revised decisions</name>
  <files>.planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/flush-probe.js, .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js</files>
  <read_first>
    - .planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/flush-probe.js (as written in Task 1)
    - .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js :740-930
  </read_first>
  <action>
1. **`long` mode (FLUSH-LONG; D-06, D-07, D-10).**
   - Pages:
     - RSA: click `#bob-gen-btn`, then `#alice-gen-btn`; the panel is `#pubkey-scratchpad`.
     - Diffie-Hellman: click `#instantBtn`; the panel is `#dh-scratchpad`.
   - Default sizes are the four desktop ones (`1280x800,1920x1080,2000x1333@1.368,2560x1440`); themes are night and day. Budget is 8000.
   - Timing:
     - 600ms after load, click.
     - At 2100ms, force the worst-case panel exactly as footer-probe.js scratchMetricsScript does (is-shown on the panel and every `.scratch-row`, and every `.scratch-kv` set to `n = ` followed by 60 digits), then scroll to scrollHeight.
     - At 2900ms, scroll up by 1 and back to the end.
     - At 3700ms, measure:
       - fb, sh, vh, vw, dpr;
       - atEnd: scrollY + innerHeight within 2px of sh;
       - BELOW per D-10;
       - shown: panel has is-shown and its computed display is not none;
       - padH;
       - hit: panel rect intersects `.site-footer .lang-switch`;
       - gap: panel top minus switcher bottom.
   - A run passes when:
     - D-10's flush conditions hold;
     - sh > vh + 200 (proves the long state);
     - atEnd is 1, shown is 1, padH is at least 150 and hit is 0.
   - Print one `FLUSH-LONG-RUN` line per run, then `FLUSH-LONG PASS 16 runs` or `FLUSH-LONG FAIL ...`.

2. **`print` mode (PRINT-PAGES; D-03).**
   - Base tree: extract `git archive <base>` into a harness.mkScratch directory (via `tar -x -C`). New tree: resolveSiteRoot.
   - For each of the 16 pages and each tree, print to PDF with `--headless=new --disable-gpu --no-sandbox`, a fresh profile, `--virtual-time-budget=3000`, `--no-pdf-header-footer` and `--print-to-pdf=<scratch file>`, at `?lang=en&theme=day`.
   - Count pages as the matches of the regular expression `/Type` + optional whitespace + `/Page` not followed by a letter, over the file read as latin1.
   - Pass when every count is at least 1, and the new count equals the base count on the 14 other pages and is at most the base count on RSA and DH.
   - Print one line per page with both counts, then `PRINT-PAGES PASS 16 pages` or FAIL.

3. **`neg` mode (FLUSH-NEG).**
   - Build four scratch copies with makeScratchCopy, apply one mutation to each, and spawn this script on it with `--root`, `--themes night` and the given `--only`/`--sizes`.
   - Each control passes only when the child exits non-zero AND its stdout contains the named FAIL line:
     - NEG-STICKY: delete the `  top: 100vh;` line from site.css. Run `flush`, `--only "Sieve Of Eratosthenes"`, `--sizes 1920x1080`. Expect `FLUSH FAIL`.
     - NEG-SPEC: replace the line `  html > body{` with `  body{`. Run `flush`, `--only "Factor Tree"`, `--sizes 2560x1440`. Expect `FLUSH FAIL`.
     - NEG-RESERVE: in RSA only, replace the D-06 rule line with `  body{ padding-bottom: 240px; }`. Run `flush`, `--only "RSA"`, `--sizes 1920x1080`. Expect `FLUSH FAIL`.
     - NEG-LAYOUT: append to site.css a screen block that gives `html > body` display flex and flex-direction column, and gives `.site-footer` position relative and margin-top auto. Run `flush`, `--only "Sieve Of Eratosthenes"`, `--sizes 1280x800`. Expect `LAYOUT-INVARIANT FAIL`.
   - Each mutation is anchored and throws if its anchor is missing.
   - Print each control's name and exit code, then `FLUSH-NEG PASS 4 controls` or FAIL.

4. **bqz footer-probe.js runtime updates (D-08b, D-08c).**
   - modeStyle:
     - Change the expected `position` from `relative` to `sticky`.
     - Assert per page and theme that payload.paddingBottom equals `240px` when the page is in RESERVE_PAGES and `0px` otherwise. Push a failure naming the page, theme, and actual and expected values.
     - Build the per-theme shared-vector comparison and the night/day difference check from a copy of each payload with `paddingBottom` removed.
     - Change nothing else.
   - modeNeg NEG-SCRATCH: the anchor becomes the D-06 rule line, and it is replaced with `  .app{ padding-bottom: 240px; }`. The control must still make `scratch` fail.
   - Extend the header-comment line from Task 1 to mention these two updates.

5. **Run the verify block** as separate background Bash calls, waiting for each.
   - Fix root causes per D-12.
   - Record in the SUMMARY:
     - the FLUSH and LAYOUT-INVARIANT totals per size chunk;
     - every page's fb/vh at 2000x1333 (night);
     - the FLUSH-LONG gap per size;
     - the PRINT-PAGES counts;
     - the four FLUSH-NEG exit codes.
   - Commit both probe files by explicit paths.
  </action>
  <verify>
    <automated>out=$(node .planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/flush-probe.js flush --sizes 375x812,1280x800,1920x1080); echo "$out"; echo "$out" | grep -q "FLUSH PASS 96 runs" && echo "$out" | grep -q "LAYOUT-INVARIANT PASS 96 runs"</automated>
    <automated>out=$(node .planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/flush-probe.js flush --sizes 2000x1333@1.368,2560x1440); echo "$out"; echo "$out" | grep -q "FLUSH PASS 64 runs" && echo "$out" | grep -q "LAYOUT-INVARIANT PASS 64 runs"</automated>
    <automated>node .planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/flush-probe.js long | tee /dev/stderr | grep -q "FLUSH-LONG PASS 16 runs" && node .planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/flush-probe.js print | tee /dev/stderr | grep -q "PRINT-PAGES PASS 16 pages" && node .planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/flush-probe.js neg | tee /dev/stderr | grep -q "FLUSH-NEG PASS 4 controls"</automated>
    <automated>node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js style | tee /dev/stderr | grep -q "STYLE-PARITY PASS pages=16 themes=2" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js scratch | tee /dev/stderr | grep -q "SCRATCH-CLEAR PASS 10 runs" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js w375 | tail -1 | grep -q "FOOTER-375 PASS 64 runs" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js neg | tee /dev/stderr | grep -q "PROBE-NEG PASS 3 controls" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js markup | grep -q "MARKUP-EXACT PASS 16 pages"</automated>
    <human-check>Pending, recorded in the SUMMARY for end-of-phase review, not blocking. In a real desktop browser at full screen (Firefox too, if available), in day and night themes:
- Open the Sieve and Venn Diagram. The footer band touches the window bottom with no page background below it.
- Open RSA and Diffie-Hellman, generate everything and scroll to the end. The footer band runs to the window bottom, the switcher sits at the top of the band, and the fixed panel overlays only the band's lower right, never the switcher.
- Open a long page such as Shor's Algorithm. The footer appears only at the end of the page; it never sticks while scrolling.</human-check>
  </verify>
  <done>
- `FLUSH PASS 96 runs` and `LAYOUT-INVARIANT PASS 96 runs` (375x812, 1280x800, 1920x1080), and `FLUSH PASS 64 runs` and `LAYOUT-INVARIANT PASS 64 runs` (2000x1333 at DPR 1.368, 2560x1440): 16 pages, two themes.
- `FLUSH-LONG PASS 16 runs`, `PRINT-PAGES PASS 16 pages`, and `FLUSH-NEG PASS 4 controls`.
- The bqz gates pass: STYLE-PARITY (16 pages, 2 themes), SCRATCH-CLEAR 10, FOOTER-375 64, PROBE-NEG 3 and MARKUP-EXACT 16.
- The figures listed in action step 5 are in the SUMMARY.
- Committed by explicit paths.
  </done>
</task>

<task type="auto">
  <name>Task 3: Docs name the sticky footer, then the consolidated regression sweep including the remaining 14 pages in the browser</name>
  <files>CLAUDE.md, .planning/codebase/STRUCTURE.md</files>
  <read_first>
    - CLAUDE.md line 41 (the Multi-language support bullet; the sentence beginning "The language switcher (`#lang-switch-select`) lives in the canonical site footer")
    - .planning/codebase/STRUCTURE.md line 137
  </read_first>
  <action>
1. **`CLAUDE.md` (D-14).** In the Multi-language support bullet, directly after the sentence that ends "the header keeps the brand, nav and day/night toggle.", insert this exact sentence: "`assets/site.css` keeps the site footer flush with the bottom of the page, and with the bottom of the window on a page shorter than the window, through a screen-only `html > body` one-viewport `min-height` plus `position: sticky; top: 100vh` on `.site-footer`, which moves nothing else on the page; so a page never adds body padding or margin below the site footer, and bottom room a page needs (RSA's and Diffie-Hellman's 240px fixed-panel reserve) is page-local `padding-bottom` on `.site-footer`." Change nothing else on that line.

2. **`.planning/codebase/STRUCTURE.md` line 137 (D-14).** It becomes: "- `assets/site.css` — Header, nav, theme switch, site footer (a sticky footer, flush with the bottom of the page and of the viewport) and language switch styling (loaded by every page)".

3. **Run the verify block.**
   - Run the eight browser chunks as separate Bash calls with run_in_background, one at a time, waiting for each (D-13). Fermat follows D-13's single-retry rule.
   - Record every CHUNK-TIME line in the SUMMARY.
   - Commit the two docs by explicit paths. Then run the CHANGE-SCOPE command last.
  </action>
  <verify>
    <automated>grep -qF 'position: sticky; top: 100vh' CLAUDE.md && grep -qF 'page-local `padding-bottom` on `.site-footer`' CLAUDE.md && grep -qF 'site footer (a sticky footer, flush with the bottom of the page and of the viewport)' .planning/codebase/STRUCTURE.md && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs | grep -q "SHADOW-CHECK PASS --docs" && echo "DOCS PASS"</automated>
    <automated>out=$(node .planning/phases/06-multi-language-support/i18n-check.js --all) && for m in coverage header includes no-locale-number-format literals-markup literals-js; do echo "$out" | grep -qx "I18N-CHECK PASS $m: 16 page(s)" || exit 1; done && node .planning/phases/06-multi-language-support/i18n-check.js --switcher-present --all | grep -q "I18N-CHECK PASS switcher-present: 16 page(s)" && node .planning/phases/06-multi-language-support/i18n-check.js --api | grep -q "I18N-CHECK PASS api: 399 assertions" && node .planning/phases/06-multi-language-support/i18n-check.js --persistence | grep -q "I18N-CHECK PASS persistence: 248 assertions" && node .planning/phases/06-multi-language-support/i18n-check.js --smoke | grep -q "I18N-CHECK PASS smoke: 123 assertions (mutant detected)" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js markup | grep -q "MARKUP-EXACT PASS 16 pages" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js css | grep -q "SITE-CSS PASS" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js gate | grep -q "FOOTER-GATE PASS 8 mutants" && git diff --quiet 5185635 -- assets/nt-i18n.js assets/theme.js assets/palette.css assets/i18n && node .planning/phases/07-shared-js-module-refactor/harness.js | tail -1 | grep -q "HARNESS PASS total=2856003" && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all && echo "SWEEP PASS"</automated>
    <automated>for p in "index.html" "Group Isomorphism/group-isomorphism.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Factor Tree/factor-tree.html" "Venn Diagram/venn-diagram.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Euclidean Algorithm/euclidean-algorithm.html" "Chinese Remainder Theorem/chinese-remainder-theorem.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Equivalence Wheel/equivalence-wheel.html" "Eulers Totient/eulers-totient.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Cayley Table/cayley-table.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Square And Multiply/square-and-multiply.html" "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" "Shors Algorithm/shors-algorithm.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Fermats Method/fermats-method.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>node -e 'const cp=require("child_process");const D=".planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/";const A=new Set(["assets/site.css","RSA/rsa.html","Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html",".planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js",D+"flush-probe.js","CLAUDE.md",".planning/codebase/STRUCTURE.md"]);const ch=cp.execFileSync("git",["diff","--name-only","5185635","HEAD"],{encoding:"utf8"}).split("\n").filter(Boolean);const bad=ch.filter(f=>!A.has(f)&&f.indexOf(D)!==0);console.log(bad.length?"CHANGE-SCOPE FAIL "+bad.join(","):"CHANGE-SCOPE PASS "+ch.length+" files");process.exit(bad.length?1:0)' && names=$(git diff --name-only 5185635 HEAD) && ! printf '%s\n' "$names" | grep -qx ".planning/config.json" && echo "CONFIG-NOT-COMMITTED PASS"</automated>
  </verify>
  <done>
- DOCS PASS: both doc sentences are present, and shadow-check `--docs` passes.
- SWEEP PASS:
  - i18n-check `--all` passes its six modes on 16 pages, and `--switcher-present` passes;
  - api, persistence and smoke report 399, 248 and 123;
  - MARKUP-EXACT, SITE-CSS and FOOTER-GATE pass;
  - the engine, palette and dictionaries are unchanged;
  - harness reports 2856003, and shadow-check `--all` passes.
- All 14 remaining pages pass i18n-browser full mode; with Task 1's Sieve and RSA, that is all 16 pages. CHUNK-TIME is recorded, plus any Fermat retry.
- CHANGE-SCOPE PASS, and config.json appears in no commit.
- Committed by explicit paths.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL `?lang=`/`?theme=`, cookie, localStorage → NT.i18n / theme.js | Untrusted input. Unchanged by this task: the engine, theme.js, palette.css and the dictionaries are byte-identical to 5185635. |
| Static CSS → layout | The change is CSS only: one site.css rule change, one screen block, and one page-local rule on two pages. No script, markup or input surface is added. |
| Gate tooling → release decisions | This task edits a prior task's gate (footer-probe.js). A loosened gate is the main integrity risk. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-fcr-01 | Tampering | bqz footer-probe.js (MARKUP-EXACT, STYLE-PARITY, NEG-SCRATCH) | medium | mitigate | D-08: each edit swaps one exact assertion for another exact assertion. The fcr delta is occurrence-checked. STYLE-PARITY still compares every other property across 16 pages and now also pins padding-bottom per page. NEG-SCRATCH still must make scratch fail. PROBE-NEG 3 and MARKUP-EXACT 16 re-run green. D-12 forbids widening tolerances or excluding pages. |
| T-fcr-02 | Denial of Service | Page usability: the footer covering content, the panel covering the switcher, layouts shifting | medium | mitigate | LAYOUT-INVARIANT (160 runs, 0.5px) proves no element outside the footer moves. FLUSH-LONG and SCRATCH-CLEAR prove the panel never overlaps the switcher. FLUSH-NEG proves each guard is load-bearing (sticky offset, selector specificity, reserve placement, layout invariance). |
| T-fcr-03 | Tampering | A vacuous probe (passes regardless of the fix) | medium | mitigate | Red phase: FLUSH must FAIL on the unmodified Sieve and RSA before the fix (Task 1 step 1). FLUSH-NEG covers 4 mutations. D-10's BELOW scan is clip-aware rather than relaxed. |
| T-fcr-04 | Information Disclosure | site-lang / site-theme persistence | low | mitigate | ENGINE-UNCHANGED covers nt-i18n.js, theme.js, palette.css and assets/i18n against 5185635. `--api` 399 and `--persistence` 248 are unchanged. |
| T-fcr-05 | Elevation of Privilege | XSS through new content | low | accept | No markup, script or dynamic text is added to any page. The probes run only on scratch copies outside the repository and are never shipped. |
| T-fcr-SC | Tampering | npm/pip/cargo installs | low | accept | No package is installed. Node 22.23.1 and Google Chrome 153 are already present. There is no install task, so no legitimacy checkpoint is needed. |
</threat_model>

<verification>
- Task 1:
  - Red: FLUSH fails on the unmodified Sieve (2000x1333 at DPR 1.368) and RSA (1920x1080).
  - Green: FLUSH and LAYOUT-INVARIANT pass on Sieve, RSA, Factor Tree and Venn at 2000x1333 (DPR 1.368) and 2560x1440.
  - MARKUP-EXACT, SITE-CSS, STRIP-GATE and FOOTER-GATE pass. i18n-check `--all` and `--switcher-present` pass. Engine and dictionaries are unchanged.
  - Sieve and RSA pass i18n-browser full mode.
- Task 2:
  - FLUSH and LAYOUT-INVARIANT on 16 pages x 5 sizes x 2 themes (160 runs), FLUSH-LONG 16, PRINT-PAGES 16 and FLUSH-NEG 4.
  - bqz STYLE-PARITY, SCRATCH-CLEAR, FOOTER-375, PROBE-NEG and MARKUP-EXACT.
- Task 3:
  - DOCS and shadow-check `--docs`.
  - i18n-check: all modes plus api 399, persistence 248 and smoke 123.
  - MARKUP-EXACT, SITE-CSS and FOOTER-GATE. ENGINE-UNCHANGED.
  - harness 2856003 and shadow-check `--all`.
  - i18n-browser full mode on the remaining 14 pages.
  - CHANGE-SCOPE and CONFIG-NOT-COMMITTED.
</verification>

<success_criteria>
- On every page, in both themes and at every tested viewport (including the user's 2000x1333 screen at DPR 1.368), the footer's bottom edge is the document's bottom edge. On short pages it is also the viewport's. Nothing renders below it.
- RSA and Diffie-Hellman have no empty band below the footer. Their reserve is the footer's own bottom padding, and the fixed panel never covers the switcher.
- No element on any page moves (LAYOUT-INVARIANT), printed page counts are unchanged, and the probe demonstrably fails when any part of the mechanism is removed.
- Every pre-existing gate stays green, en-parity stays IDENTICAL on all 16 pages, and the docs tell future tools never to put body padding or margin below the site footer.
</success_criteria>

<output>
Create `.planning/quick/261003-fcr-fix-site-footer-so-it-sits-flush-at-the-/261003-fcr-SUMMARY.md` when done. Record:
- the two red-phase FLUSH FAIL lines (the reproduced bug);
- every gate result line: FLUSH and LAYOUT-INVARIANT per size chunk, FLUSH-LONG (with the gap per size and theme), PRINT-PAGES (both counts per page), FLUSH-NEG (four exit codes), STYLE-PARITY, SCRATCH-CLEAR, FOOTER-375, PROBE-NEG, MARKUP-EXACT, SITE-CSS, STRIP-GATE, FOOTER-GATE, the i18n-check modes and counts, HARNESS, SHADOW-CHECK, DOCS, CHANGE-SCOPE and CONFIG-NOT-COMMITTED;
- each page's fb/vh at 2000x1333 (night);
- every CHUNK-TIME line, and any D-13 Fermat retry;
- the D-07 decision, which declines the smaller reserve on wide viewports, with its rationale;
- the D-01 measurements that rejected the flex body;
- the D-15 accepted consequences;
- the pending human-check from Task 2;
- the commit hashes.
</output>
