---
phase: quick-261003-bqz
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "index.html"
  - "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
  - "Factor Tree/factor-tree.html"
  - "Venn Diagram/venn-diagram.html"
  - "Euclidean Algorithm/euclidean-algorithm.html"
  - "Chinese Remainder Theorem/chinese-remainder-theorem.html"
  - "Equivalence Wheel/equivalence-wheel.html"
  - "Eulers Totient/eulers-totient.html"
  - "Cayley Table/cayley-table.html"
  - "Group Isomorphism/group-isomorphism.html"
  - "Square And Multiply/square-and-multiply.html"
  - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
  - "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html"
  - "RSA/rsa.html"
  - "Fermats Method/fermats-method.html"
  - "Shors Algorithm/shors-algorithm.html"
  - "assets/site.css"
  - "assets/i18n/site.js"
  - ".planning/phases/06-multi-language-support/i18n-check.js"
  - ".planning/phases/06-multi-language-support/i18n-browser.js"
  - ".planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js"
  - "CLAUDE.md"
  - ".claude/CLAUDE.md"
  - ".planning/PROJECT.md"
  - ".planning/REQUIREMENTS.md"
  - ".planning/codebase/ARCHITECTURE.md"
  - ".planning/codebase/CONCERNS.md"
  - ".planning/codebase/STRUCTURE.md"
  - ".planning/codebase/TESTING.md"
autonomous: true
requirements: [QUICK-261003-bqz, I18N-01]

estimate:
  tokens: 240000
  raw_tokens: 240000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "On all 16 pages the site header keeps the brand, the 16 nav links and the day/night toggle but no longer contains the language switcher. The switcher block is unchanged: the label, the globe icon, select#lang-switch-select with its data-i18n-title/data-i18n-aria-label attributes, and the 16 options in order. It now sits inside one <footer class=\"site-footer\"> that is byte-identical on every page and is the last element before the page's closing scripts. A page's own tool footer stays where it was, before the site footer (D-01, D-02; MARKUP-EXACT, FOOTER-GATE)."
    - "Choosing a language in the footer select switches the page exactly as the header select did. assets/nt-i18n.js, assets/theme.js and assets/palette.css are byte-identical to 81c4d14, i18n-browser.js switch mode passes with langs=15 on all 16 pages, and --smoke/--api/--persistence report 123/399/248 assertions (D-10)."
    - "English output is still byte-identical to the pre-i18n BASE after en-parity strips one thing only: a site footer that holds nothing but the canonical switcher. Extra content anywhere in the footer, an extra option, or a switcher put back in the header makes en-parity fail (STRIP-GATE 9 checks, footer-extra mutant detected, en-parity IDENTICAL on all 16 pages) (D-12)."
    - "In both day and night themes, the site footer has the header's background and border colors on every page, and its computed style is identical on all 16 pages within a theme. No page's own bare footer rule leaks into it: computed opacity 1, white-space normal, margins 0, overflow visible, font-family system-ui (STYLE-PARITY, D-04, D-05)."
    - "At a true 375px viewport, neither the document, the header nor the footer overflows horizontally on any of the 16 pages, in en, de, ru and el. The switcher sits fully inside the viewport, the header contains no select, and no non-script element follows the footer (FOOTER-375 64 runs, D-13)."
    - "On RSA and Diffie-Hellman at the end of the page, the fixed public-values panel at its maximum footprint never overlaps the footer's language switcher at 390x800, 420x800, 520x800, 700x900 or 1280x900. With the reserve left on .app, the negative control overlaps (SCRATCH-CLEAR, PROBE-NEG, D-07)."
    - "i18n-check.js --header and --switcher-present report SWITCHER-IN-HEADER, SWITCHER-NOT-IN-FOOTER, FOOTER-COUNT, FOOTER-DRIFT (byte-exact) and FOOTER-POSITION, and catch all 8 FOOTER-GATE mutants with no finding on any unmutated page. --all still passes the same six static modes on 16 pages, and no existing check is loosened (D-11)."
    - "No user-visible string changes in any of the 16 languages (DICT-UNCHANGED, 18 namespaces). Every living doc places the switcher in the site footer: DOC-STALE goes from 14 lines at 81c4d14 to 0, and shadow-check.js --docs passes (D-15)."
  artifacts:
    - path: "assets/site.css"
      provides: "the .site-footer / .site-footer-inner rules, the print rule, and the .lang-switch rule without its left margin"
      contains: ".site-footer-inner{"
    - path: ".planning/phases/06-multi-language-support/i18n-check.js"
      provides: "extractSiteFooters, checkSiteFooter and the SWITCHER-IN-HEADER / SWITCHER-NOT-IN-FOOTER placement checks"
      contains: "SWITCHER-IN-HEADER"
    - path: ".planning/phases/06-multi-language-support/i18n-browser.js"
      provides: "the strict whole-footer en-parity strip, the footer-extra mutant, and the stripI18nArtifacts export"
      contains: "footer-extra"
    - path: ".planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js"
      provides: "the markup, strip, gate, css, w375, style, scratch and neg verification modes"
      contains: "SCRATCH-CLEAR"
    - path: "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
      provides: "the canonical site footer, which every other page's footer must equal"
      contains: "<footer class=\"site-footer\">"
  key_links:
    - from: "select#lang-switch-select inside the site footer on all 16 pages"
      to: "NT.i18n init/applyLang in assets/nt-i18n.js (unchanged)"
      via: "document.getElementById lookup by id, so its position in the page does not matter"
      pattern: "getElementById\\('lang-switch-select'\\)"
    - from: "i18n-browser.js stripI18nArtifacts"
      to: "the serialized site footer in every en-parity snapshot"
      via: "one non-global structural regex whose option count comes from i18nCheck.SWITCHER_OPTIONS.length"
      pattern: "site-footer-inner"
    - from: "i18n-check.js checkHeader"
      to: "the Sieve's site footer as the canonical byte-exact reference"
      via: "checkSiteFooter(relPath, html, canonical, findings)"
      pattern: "checkSiteFooter\\("
    - from: "RSA and Diffie-Hellman page styles"
      to: "the position:fixed scratchpad (z-index 900, at most 236px tall at the bottom right)"
      via: "a 240px bottom reserve on body, below the site footer"
      pattern: "  body\\{ padding-bottom: 240px; \\}"
    - from: ".claude/CLAUDE.md GSD architecture section"
      to: ".planning/codebase/ARCHITECTURE.md"
      via: "verbatim mirror lines (shadow-check.js --docs MIRROR-DRIFT)"
      pattern: "site footer's `#lang-switch-select`"
---

<objective>
Move the language switcher out of the shared site header and into a new shared site footer at the bottom of all 16 pages (index.html and the 15 tool pages).

- The 21-line switcher block leaves the canonical header unchanged and goes inside a new canonical `<footer class="site-footer">`. This footer is identical on every page and is the last element before the page's scripts.
- The footer is styled in `assets/site.css` with palette tokens only, so it matches the header in day and night themes and does not overflow at 375px.
- The gate tooling enforces the new placement without loosening any check.
- The living docs describe the switcher in the footer.

NT.i18n, theme.js, palette.css and every dictionary value stay exactly as they are.

Purpose: the header keeps its navigation role (brand, nav, theme toggle). The language choice moves to a single, consistent place at the end of every page. It behaves exactly as before: same persistence, `?lang=`, cross-tab sync and no-reset re-render.

Output:
- 16 pages whose only change is the moved block plus the footer wrapper. RSA and Diffie-Hellman also move their scratchpad reserve (D-07).
- New footer rules in site.css.
- New footer gates in i18n-check.js.
- A strict footer strip, a mutant and an export in i18n-browser.js.
- A task-local verification probe.
- Updated living docs.

Baseline: HEAD `81c4d14` at planning time is the fixed baseline for every "unchanged" check (MARKUP-EXACT, DICT-UNCHANGED, ENGINE-UNCHANGED, DOC-STALE, CHANGE-SCOPE, SITE-CSS).

Execution environment:
- Run everything in the main checkout. There is no worktree, because `workflow.use_worktrees` is false. `i18n-browser.js` needs the real git repository to build its BASE.
- Stage files by explicit path only. Never use `git add -A`, `git add .` or `git commit -a`.
- Never stage the modified `.planning/config.json`. Also never stage any of these untracked items: `.gsd/`, `.planning/state.json`, `.planning/ui-reviews/`, `.planning/quick-batches/`, `.planning/phases/07-shared-js-module-refactor/.gitkeep`, `possible_menubar_configuration`, or the file whose name starts with `Last '`.
- Do not commit this PLAN.md or the SUMMARY; the orchestrator commits them with STATE.md. Commit `footer-probe.js` with the task that creates or extends it.
- The user asked for an uninterrupted run. Every judgment call below is a recorded decision, not an open question. Apply each decision and record any deviation in the SUMMARY.
- Verify commands are copied into the shell tool verbatim. They contain no backslash-u escapes; keep it that way in any command you write.

**Planner decisions (D-NN).** This quick task has no CONTEXT.md. The decisions below were made at planning time from live observation of HEAD 81c4d14 and a scratch-copy prototype (see context). Task actions cite them by ID.

- **D-01 Footer markup and placement.**
  - The canonical site footer is exactly these lines, in order:
    1. `<footer class="site-footer">`
    2. `  <div class="site-footer-inner">`
    3. the 21 switcher lines, unchanged (from the `    <label class="lang-switch" title="Language" data-i18n-title="site.lang.label">` line through its `    </label>` line, keeping their 4/6/8-space indentation, so the moved lines are byte-identical)
    4. `  </div>`
    5. `</footer>`
  - Insert the block immediately before each page's first body-end line that starts with `<script src="` and points into `assets/`. On the 15 tool pages that is `../assets/`; on index.html it is `assets/`. Insert exactly one blank line between `</footer>` and that script line. The page's existing blank line before the script stays, and now precedes the footer.
  - The footer has no other attribute and holds the switcher only: no text, links or credits.
  - The 21 lines are removed from the header. The theme toggle stays in the header.
  - A page's own tool `<footer>` (10 pages) is left untouched, and the site footer follows it.
  - On RSA and Diffie-Hellman, the site footer follows the `</aside>` of the position:fixed scratchpad. That aside is out of flow, so DOM order does not change the layout.
- **D-02 Inner wrapper.** `.site-footer-inner` mirrors `.site-header-inner`: max-width 1180px, centered, the same 20px side padding. It also puts the moved lines at exactly their old nesting depth, so they stay byte-identical.
- **D-03 Alignment.** The switcher is centered at every width. This matches the header's own centered layout at 760px and below. At about 760px and wider it also keeps the switcher horizontally clear of the 260px-wide panel pinned at the bottom right on RSA and Diffie-Hellman.
- **D-04 Visuals: one chrome.** The footer uses the header's existing tokens:
  - background `var(--st-header-bg)`
  - `border-top: 1px solid var(--st-header-border)`
  - color `var(--st-header-text)`
  - the header's font stack `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`
  - inner padding 14px 20px
  It has no backdrop-filter, because it is not sticky. No new token is added, palette.css is not touched, and no literal color is used. The select keeps its existing `.lang-switch select` rules (header tokens), so header and footer read as one chrome in both themes.
- **D-05 No page footer rule may leak in.** 10 pages carry a bare `footer{}` element rule in their own `<style>`:
  - index :146, DH :147, ECDH :199, Equivalence Wheel :285 (plus its print rule :307), Group Isomorphism :277, RSA :160, Shor :128, Sieve :340, Square and Multiply :110, Fermat :228.
  - Between them these rules set margin-top, padding, font-family (JetBrains Mono), font-size, line-height, color and text-align. They also set opacity 0.6 (Sieve and Fermat) and white-space nowrap with overflow-x auto (Wheel and Group Isomorphism).
  - `.site-footer` is a class selector, so it outranks those element selectors. It must therefore declare every one of these properties explicitly: margin 0, padding 0 (the inner div carries the padding), font-family, font-size 1rem, line-height normal, color, text-align center, opacity 1, white-space normal, overflow visible, plus box-sizing border-box on both elements.
  - Page styles are not edited for this. This is the same bug class as PROJECT.md's `.page-header` decision, where bare `header{}` rules leaked onto the site header. STYLE-PARITY proves no leak remains.
- **D-06 Stacking.** `.site-footer` gets `position: relative; z-index: 2`. Factor Tree's position:fixed decorative layers, `#sky` (z-index 0) and `#snow` (z-index 1), would otherwise paint over the in-flow footer. The footer stays below RSA/DH's panel (900) and the header (1000).
- **D-07 RSA and Diffie-Hellman bottom reserve.**
  - Both pages pin a position:fixed public-values panel at the bottom right: at most min(40vh, 220px) tall, a bottom offset of clamp(8px, 2vw, 16px), z-index 900, pointer-events none. Each page also reserves `.app{ padding-bottom: 240px; }` (RSA :170, DH :161), which now sits above the site footer.
  - Planner measurement: with the reserve on `.app`, the worst-case panel covers the footer switcher at the end of the page at 390 to 700px width (overlap of up to 220px).
  - Fix, in both pages:
    - Replace the line `  .app{ padding-bottom: 240px; }` with `  body{ padding-bottom: 240px; }`.
    - Directly above that new line, add this exact single comment line: `  /* The reserve sits on body, below the shared site footer, so at the end of the page this panel (at most 236px: min(40vh, 220px) tall plus a bottom offset of at most 16px) also clears the language switcher in the site footer. */`
    - Keep the existing multi-line comment above it byte-identical.
  - The document after each section only grows (by the footer's height), so the scroll-past reveal the existing comment protects still works. At the end of the page the switcher sits at least 240px above the viewport bottom: clear of the panel by 18 to 34px in the prototype, at every tested size.
  - The panel already has pointer-events none, so the select stays operable while scrolling too.
- **D-08 `.lang-switch` rule.**
  - Drop its left-margin declaration. That margin only spaced the switcher from the nav, and in a centered footer it would push the switcher 5px off-center.
  - Rewrite its comment block (site.css :147-150) to describe the footer placement.
  - Leave `.lang-switch-icon`, `.lang-switch select`, its focus-visible rule and its option rule unchanged.
- **D-09 Print.** Add `@media print{ .site-footer{ display: none; } }` to site.css. The Equivalence Wheel's print stylesheet hides `.site-header` (:303), which used to carry the switcher. Hiding the site footer in print keeps that printed output unchanged, and a language select has no use on paper on any page.
- **D-10 Untouched.**
  - `assets/nt-i18n.js` finds the select by id (:399, :453), so it does not change. Neither do `assets/theme.js` or `assets/palette.css`.
  - No dictionary key or value changes in any language.
  - `assets/i18n/site.js` changes only its header comment: "shared header chrome" becomes "shared site chrome (header and footer)", so it still names where the `lang.label` string is used.
- **D-11 i18n-check.js gates.** Existing checks stay exactly as they are; these are additions only.
  - In checkHeader, a byte-exact site-footer comparison against the Sieve's footer (no normalization: the footer has no relative path or active state). It reports FOOTER-COUNT, FOOTER-DRIFT and FOOTER-POSITION.
  - In checkSwitcherPresent, SWITCHER-IN-HEADER and SWITCHER-NOT-IN-FOOTER.
  - Both flags therefore enforce placement, and `--all` (which runs `--header`) enforces everything.
- **D-12 i18n-browser.js en-parity strip.**
  - Replace the bare-label strip (:254) with ONE non-global replace. It removes a serialized site footer only when it holds exactly the canonical switcher shape, with the option count taken from `i18nCheck.SWITCHER_OPTIONS.length`. Anything else in or around it stays in the snapshot and produces a DIFF.
  - Removing the bare-label strip tightens the gate: a switcher put back in the header now fails en-parity.
  - Add a `footer-extra` mutant that targets en-parity.
  - Export `stripI18nArtifacts` for the STRIP-GATE unit cases.
  - The prototype proved this strip yields IDENTICAL on Sieve, RSA, DH, index, Equivalence Wheel and Fermat, and a DIFF for an injected span in the inner div, in the label, or an optgroup in the select.
- **D-13 True 375px.**
  - Measured at planning time: headless Chrome 153 clamps `--window-size` to a viewport at least 500px wide (`375,812` gives 500x669). So i18n-browser.js layout mode, and the HEADER-375 probes of earlier quick tasks, actually measured 500px.
  - This task's FOOTER-375 probe measures at a true 375px by loading each page in a 375x812 iframe.
  - Layout mode itself is not changed here (out of scope). Record this in the SUMMARY as an observation and a follow-up candidate.
- **D-14 Headless reveal.** requestAnimationFrame ticks about once per second under `--virtual-time-budget` (measured), so RSA's scroll-driven reveal cannot be relied on headless. SCRATCH-CLEAR therefore performs the real clicks, then forces the panel to its worst-case footprint: is-shown on the panel and every row, and a 60-digit numeral in every value line, which drives the panel to its min(40vh, 220px) cap.
- **D-15 Living docs.** These edits are listed in Task 3:
  - CLAUDE.md
  - .claude/CLAUDE.md and its mirror lines in .planning/codebase/ARCHITECTURE.md
  - PROJECT.md (Validated I18N bullet)
  - REQUIREMENTS.md (I18N-01 wording)
  - CONCERNS.md, STRUCTURE.md and TESTING.md
  ROADMAP.md's Phase 6 text says "shared site chrome", which stays true, so it is not edited.
- **D-16 Accepted consequences.**
  - On the 10 pages with their own body-level tool `<footer>`, there are now two footer (contentinfo) landmarks. Screen readers list both. Changing those page footers would break en-parity and is out of scope.
  - The switcher moves to the end of the keyboard tab order, which is inherent to the requested footer placement.
- **D-17 Browser chunks.** At 15 non-English languages, the 57k full-mode chunk times total about 46 minutes (Sieve 117s in the prototype). Run nine chunks, each at most about 6.5 minutes, as separate Bash calls with run_in_background, and wait for each:
  - Sieve (Task 1)
  - index + RSA + Group Isomorphism
  - Factor Tree + Venn
  - Euclidean + CRT
  - Equivalence Wheel + Totient
  - Cayley
  - Square and Multiply + DH
  - ECDH + Shor
  - Fermat
- **D-18 Fermat flake.** A Fermat's Method en-parity DIFF at a mid-animation step snapshot is the pre-existing `animateRearrange()` timing flake recorded in STATE.md and in the 57k SUMMARY. Re-run that chunk once. A second failure is a real failure. Record any retry in the SUMMARY.
- **D-19 Fix policy.** If a gate fails, fix the root cause in site.css, the page block or the gate code as specified here. Never loosen a gate, widen a regex beyond D-12's shape, or add an en-parity exception.

**Source coverage audit**

| Source | ID | Item | Task | Status |
|---|---|---|---|---|
| GOAL | — | Switcher moves from the header to a shared site footer on all 16 pages | 1 | COVERED |
| REQ | QUICK-261003-bqz | Full quick-task description | 1, 2, 3 | COVERED |
| REQ | I18N-01 | Every page exposes the switcher (now in the shared footer); chrome markup identical on every page | 1 (markup, gates), 3 (wording) | COVERED |
| TASK-DESC | — | Remove the label block from the canonical header; place it byte-identical in a new canonical `<footer class="site-footer">`, last before the scripts | 1 (D-01, D-02, MARKUP-EXACT) | COVERED |
| TASK-DESC | — | Pages with their own footer keep it; the site footer comes after it | 1 (D-01, MARKUP-EXACT, FOOTER-POSITION) | COVERED |
| TASK-DESC | — | Select keeps its id, all data-i18n attributes and all 16 options in order; NT.i18n needs no logic change | 1 (MARKUP-EXACT, SWITCHER checks), 3 (ENGINE-UNCHANGED) | COVERED |
| TASK-DESC | — | Style .site-footer and the moved .lang-switch in site.css with palette tokens only | 1 (D-04, D-05, D-08, D-09, SITE-CSS) | COVERED |
| TASK-DESC | — | Visually consistent with the header in day and night themes | 2 (STYLE-PARITY bgEq/bdEq, theme-reactive) | COVERED |
| TASK-DESC | — | Responsive at 375px with no overflow | 2 (FOOTER-375 at a true 375px, D-13), 1-2 (layout mode) | COVERED |
| TASK-DESC | — | i18n-check.js --header/--switcher-present: the header no longer contains the switcher; the footer is identical on all 16 pages | 1 (D-11, FOOTER-GATE) | COVERED |
| TASK-DESC | — | i18n-browser.js en-parity strips the site footer like the switcher was stripped; no other check loosened | 1 (D-12, STRIP-GATE, footer-extra mutant), 1-2 (en-parity on 16 pages) | COVERED |
| TASK-DESC | — | Keep header-height/overflow checks | 2 (FOOTER-375 reports hdrH and asserts hdrOvf=0; layout mode unchanged) | COVERED |
| TASK-DESC | — | Update living docs (CLAUDE.md, .claude/CLAUDE.md, codebase/*.md, PROJECT.md) to say footer | 3 (D-15, DOC-STALE, shadow-check --docs) | COVERED |
| TASK-DESC | — | All 16 languages' text unchanged | 3 (DICT-UNCHANGED) | COVERED |
| ORCH-NOTE | — | Inspect existing footers before choosing placement; do not break page layouts (full-height grids, sticky elements) | D-05, D-06 (no page has a full-height body grid; Factor Tree's fixed layers handled), 2 (STYLE-PARITY, FOOTER-375) | COVERED |
| ORCH-NOTE | — | Footer must not collide with the RSA/DH bottom-right scratchpads | D-07, 2 (SCRATCH-CLEAR + negative control) | COVERED |
| ORCH-NOTE | — | Prove the en-parity change is not a loosening | D-12, 1 (STRIP-GATE incl. header-placement case, footer-extra mutant) | COVERED |
| ORCH-NOTE | — | Phase 7 harness.js and shadow-check.js (--all, --docs mirror) stay green | 3 | COVERED |
| ORCH-NOTE | — | Browser chunks of at most 10 minutes, run_in_background, waited for | D-17, 1, 2 | COVERED |
| ORCH-NOTE | — | Main checkout; never stage config.json or the scratch files | Execution environment, 3 (CHANGE-SCOPE) | COVERED |
| ORCH-NOTE | — | Judgment calls (alignment, spacing, footer content) recorded as decisions | D-01 to D-19 | COVERED |
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@assets/site.css
@.planning/quick/261003-57k-add-russian-ru-and-greek-el-as-supported/261003-57k-SUMMARY.md

Gate scripts are large. Read only these ranges (line numbers at HEAD 81c4d14):
- `.planning/phases/06-multi-language-support/i18n-check.js` (2628 lines):
  - SWITCHER_OPTIONS :1497-1514
  - PAGES :1541-1558
  - the `--header (+ --switcher-present)` section :1850-1946:
    - extractHeaderHtml :1852
    - normalizeHeaderHtml :1857
    - checkSwitcherPresent :1868-1894
    - checkHeader :1896-1936 (the Sieve is the canonical reference)
    - checkSwitcherPresentMode :1938
  - static-mode PASS/FAIL printing :2545-2546
  - module.exports :2610-2628
- `.planning/phases/06-multi-language-support/i18n-browser.js` (566 lines):
  - header comment :1-33 (en-parity :13-17, switch :21-23, mutant list :10 and :28-33)
  - MUTANT_SCRIPTS :104-114
  - injectCustomMutant :116
  - stripI18nArtifacts :251-263 (bare-label strip at :254)
  - doEnParity :287-321
  - MUTANT_TARGET_MODE :507
  - usage strings :513 and :532
  - module.exports :566
- `.planning/phases/07-shared-js-module-refactor/harness.js` exports `mkScratch(prefix)` (self-cleaning scratch root) and `chromeEnv()`. Requiring it does not run its CLI.

Observed at planning time (HEAD 81c4d14):
- Every page's header carries the identical 21-line switcher block at:
  - index 186-206
  - Cayley 273-293
  - CRT 284-304
  - DH 235-255
  - ECDH 243-263
  - Equivalence Wheel 345-365
  - Euclidean 272-292
  - Totient 256-276
  - Factor Tree 349-369
  - Fermat 268-288
  - Group Isomorphism 326-346
  - RSA 243-263
  - Shor 169-189
  - Sieve 386-406
  - Square and Multiply 176-196
  - Venn 447-467
- On every page, the first body-end `<script src=` line pointing into assets is preceded by a blank line. Its line numbers:
  - index 403
  - Cayley 356
  - CRT 417
  - DH 382 (after `</aside>`)
  - ECDH 390
  - Equivalence Wheel 446
  - Euclidean 389
  - Totient 348
  - Factor Tree 411
  - Fermat 377
  - Group Isomorphism 418
  - RSA 362 (after `</aside>`)
  - Shor 322
  - Sieve 487 (nt-i18n.js)
  - Square and Multiply 293
  - Venn 590
- No page has a full-height body grid or flex layout: bodies use only min-height:100vh.
- Factor Tree has position:fixed `#sky` (z-index 0, :38) and `#snow` (z-index 1, :54) under `.wrap` (z-index 2, :78).
- Page CSS rules that touch label/select are all scoped under `.field`, so none reaches the footer.
- `assets/site.css` (193 lines):
  - :1-5 top comment
  - :147-150 `.lang-switch` comment
  - :151-157 `.lang-switch` (left margin at :155)
  - :158-181 icon/select/focus/option rules
  - :183-193 the 760px media block
- Baselines:
  - `i18n-check.js --all` passes six modes on 16 pages; `--switcher-present --all` passes 16 pages.
  - `--api` 399, `--persistence` 248, `--smoke` 123 assertions.
  - harness.js `HARNESS PASS total=2856003`.
  - shadow-check.js `--all` and `--docs` PASS.
  - DOC-STALE (a doc line that mentions the switcher and the header but not the footer) is 14 at 81c4d14: .claude/CLAUDE.md 214/250/296, PROJECT.md 19, REQUIREMENTS.md 68, ARCHITECTURE.md 60/114/195, CONCERNS.md 30, STRUCTURE.md 64/247, TESTING.md 239/249/252.
- Planner prototype: a scratch copy of 81c4d14 with D-01 to D-09 applied, with browser runs reading the real repository's git store read-only.
  - `--all` PASS.
  - en-parity IDENTICAL on Sieve (11 snaps), RSA (14), DH (24), index (1), Equivalence Wheel (26), Fermat (17).
  - Sieve full mode ALL PASS in 117s.
  - At a true 375px: all 16 pages ovf=0, hdrOvf=0, fOvf=0. The footer is 58-59px tall, and the switcher is 180-188px wide and centered.
  - Header height at a true 375px drops from 361/371/405px to 320/328/362px.
  - STYLE-PARITY: one vector per theme across the 16 pages, with footer and header background and border colors equal.
  - SCRATCH-CLEAR worst case (panel 220px): gap 18-34px and no overlap from 390x800 to 1280x900. The negative control with the reserve left on `.app` overlaps at 390 to 700px.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Tracer — the switcher moves into the canonical site footer on all 16 pages, gated statically and proven end-to-end in the browser on the Sieve</name>
  <files>index.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factor Tree/factor-tree.html, Venn Diagram/venn-diagram.html, Euclidean Algorithm/euclidean-algorithm.html, Chinese Remainder Theorem/chinese-remainder-theorem.html, Equivalence Wheel/equivalence-wheel.html, Eulers Totient/eulers-totient.html, Cayley Table/cayley-table.html, Group Isomorphism/group-isomorphism.html, Square And Multiply/square-and-multiply.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html, RSA/rsa.html, Fermats Method/fermats-method.html, Shors Algorithm/shors-algorithm.html, assets/site.css, .planning/phases/06-multi-language-support/i18n-check.js, .planning/phases/06-multi-language-support/i18n-browser.js, .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js</files>
  <read_first>
    - assets/site.css (whole file, 193 lines)
    - Sieve Of Eratosthenes/sieve-of-eratosthenes.html lines 380-500 (header switcher block, page footer, first script)
    - RSA/rsa.html lines 160-210 and Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html lines 150-200 (reserve rule and scratchpad CSS)
    - .planning/phases/06-multi-language-support/i18n-check.js :1850-1946 and :2610-2628
    - .planning/phases/06-multi-language-support/i18n-browser.js :1-33, :104-120, :251-263, :505-566
  </read_first>
  <action>
1. **Page markup (D-01, D-02, D-07).**
   - Apply one Node transform from the repo root, inline via `node -e` or as a script saved outside the repository, to the 16 page paths listed in i18n-check.js PAGES. It must be anchored and fail loudly: abort without writing any file if an anchor is missing or appears more than once.
   - For each page:
     - Find the line equal to `    <label class="lang-switch" title="Language" data-i18n-title="site.lang.label">` and the next line equal to `    </label>`. Require that span to be exactly 21 lines, and remove it.
     - Find the first line matching `^<script src="(\.\./)?assets/`. Insert immediately before it the D-01 block: the footer start line, the inner div start line, the 21 removed lines unchanged, the inner div end line, the footer end line, then one empty line.
   - For `RSA/rsa.html` and `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` only:
     - Replace the single line `  .app{ padding-bottom: 240px; }` with two lines: the exact D-07 comment line, then `  body{ padding-bottom: 240px; }`.
     - Leave the existing multi-line comment above it as it is.
   - Change nothing else in any page.

2. **`assets/site.css` (D-03, D-04, D-05, D-06, D-08, D-09).**
   - Top comment (:1-5): say the shared chrome is the header (brand, nav, day/night toggle) plus the site footer (language switcher), and that header and footer colors derive from palette.css.
   - Replace the `.lang-switch` comment (:147-150) with a comment saying the switcher is the only control in the site footer, centered on its own row at every width, and keeps the header's tokens. Delete the left-margin declaration from `.lang-switch`.
   - After the `.lang-switch select option` rule and before the 760px media block, add three things:
     - A comment that names the bare `footer{}` rules on 10 pages and why every property below is declared explicitly (D-05), plus the Factor Tree stacking reason (D-06).
     - `.site-footer` with, in this order: position relative; z-index 2; box-sizing border-box; margin 0; padding 0; background var(--st-header-bg); border-top 1px solid var(--st-header-border); color var(--st-header-text); font-family system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; font-size 1rem; line-height normal; text-align center; opacity 1; white-space normal; overflow visible.
     - `.site-footer-inner` with: box-sizing border-box; max-width 1180px; margin 0 auto; padding 14px 20px; display flex; align-items center; justify-content center; gap 14px; flex-wrap wrap.
   - Then add the D-09 print block: a `@media print` block containing `.site-footer{ display: none; }`.
   - Use 2-space indentation and the file's existing `selector{` style. Use tokens only.

3. **`i18n-check.js` (D-11).** Rename the section comment to `--header (+ --switcher-present, site footer)`.
   - Next to extractHeaderHtml, add `extractSiteFooters(html)`. It returns every non-overlapping match of a `<footer class="site-footer">` start tag through the first following `</footer>`, or an empty array.
   - Add `checkSiteFooter(relPath, html, canonical, findings)`:
     - If the count is not 1, push `FOOTER-COUNT <relPath>: expected exactly 1 <footer class="site-footer">, found <n>` and return.
     - If canonical is non-null and differs byte for byte, push `FOOTER-DRIFT <relPath> at offset <i>: ` followed by the JSON of the next 80 characters.
     - Take the text after the footer up to the first `</body>` (if there is none, push FOOTER-POSITION). Remove every `<script ...>...</script>` element from it and trim it. If anything remains, push `FOOTER-POSITION <relPath>: only <script> elements may follow the site footer before </body>, found ` followed by the JSON of the first 80 characters.
   - In checkHeader:
     - Read the Sieve's footers next to sieveHeader. canonical is the single footer when there is exactly one, otherwise null.
     - If canonical is null, push one `FOOTER-COUNT Sieve Of Eratosthenes/sieve-of-eratosthenes.html (canonical reference): expected exactly 1 <footer class="site-footer">` finding per call.
     - Call checkSiteFooter for each target, after the ACTIVE-LINK checks and before checkSwitcherPresent.
   - At the end of checkSwitcherPresent, keep every existing check and add:
     - SWITCHER-IN-HEADER: when extractHeaderHtml(html) is non-null and contains `lang-switch`, push `SWITCHER-IN-HEADER <relPath>: the site header must not contain the language switcher (it lives in the site footer)`.
     - SWITCHER-NOT-IN-FOOTER: when no extracted site footer contains a select start tag with `id="lang-switch-select"`, push `SWITCHER-NOT-IN-FOOTER <relPath>: #lang-switch-select must sit inside <footer class="site-footer">`.
   - Add `extractSiteFooters` and `checkSiteFooter` to module.exports.
   - Do not change normalizeHeaderHtml, the header comparison, ACTIVE-LINK, the option-table comparison, the nav count or any other mode.

4. **`i18n-browser.js` (D-12).**
   - In stripI18nArtifacts, replace the bare-label replace with ONE non-global replace. Build its regular expression once at module level, with the option count from `i18nCheck.SWITCHER_OPTIONS.length`. It must match only this shape, with nothing at all between the tags (snapshots are already whitespace-collapsed):
     1. the exact start tag `<footer class="site-footer">`
     2. the exact start tag `<div class="site-footer-inner">`
     3. a label start tag with exactly `class="lang-switch"` and one `title="…"` attribute
     4. the span `<span class="lang-switch-icon" aria-hidden="true">` with text only, then its close
     5. a select start tag with exactly `id="lang-switch-select"` and one `aria-label="…"` attribute
     6. exactly N option elements, each `<option value="…" lang="…">` with an optional ` selected=""` before the `>`, holding text only
     7. the closing select, label, div and footer tags
     Attribute values exclude quotes and angle brackets. Keep the replace at the same position, after the data-i18n attribute strip and before the href rewrite.
   - Add MUTANT_SCRIPTS `footer-extra`: on DOMContentLoaded, append a span with id `i18n-mutant-footer-extra` and text `extra` to `.site-footer-inner`, if present. Set MUTANT_TARGET_MODE `footer-extra` to `en-parity`.
   - Add `footer-extra` to the usage strings (:10, :513, :532) and to the mutant list in the header comment.
   - Update header comment :13-17 to say en-parity strips the canonical site footer only when it holds nothing but the language switcher, and :21-22 to say the footer select.
   - Add `stripI18nArtifacts` to module.exports.
   - Change nothing else.

5. **`footer-probe.js` static modes.**
   - Create `.planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js`: a "use strict" Node CLI.
     - ROOT is three directories up. It requires i18n-check.js (PAGES, SWITCHER_OPTIONS), i18n-browser.js (stripI18nArtifacts) and harness.js (mkScratch, chromeEnv).
     - It takes `<mode>` plus optional `--base <sha>` (default `81c4d14`), `--root <dir>` and `--only <substring>`. It exits 0 only on PASS.
     - Its default scratch copy copies every `git ls-files` path from the working tree into `harness.mkScratch`. It never writes inside the repository.
   - `markup`: MARKUP-EXACT. For each of the 16 pages, rebuild the expected file from `git show <base>:<page>` with the exact step-1 transform, including the D-07 two-line replacement on RSA and DH. Require byte equality with the working-tree file. Print `MARKUP-EXACT PASS 16 pages`, or FAIL with the first differing line number.
   - `strip`: STRIP-GATE. Take F from the working-tree Sieve's site footer block: collapse `>\s+<` to `><`, trim, and turn the ` selected>` attribute into ` selected="">`. Assert these 9 cases through stripI18nArtifacts:
     1. A main element followed by F becomes exactly the main element.
     2. F plus a span before the inner div close keeps `site-footer`.
     3. F plus a span before the label close keeps it.
     4. F plus text before the footer close keeps it.
     5. F with an extra `data-x="1"` attribute on the footer start tag keeps it.
     6. F twice leaves `site-footer` exactly once.
     7. F plus an empty optgroup before the select close keeps it.
     8. F's label element alone, inside a header element (a switcher back in the header), keeps `lang-switch`.
     9. F plus a seventeenth option keeps `site-footer`.
     Print `STRIP-GATE PASS 9 checks`.
   - `gate`: FOOTER-GATE.
     - First run `i18n-check.js --header --all` and `--switcher-present --all` on the real tree and require exit 0.
     - Then make one scratch copy and apply 8 mutations:
       1. Factor Tree: the 21 switcher lines re-inserted into its header directly before the theme-switch label line.
       2. Venn: a span line inserted before the footer's inner div close.
       3. Euclidean: a `<p>late</p>` line inserted between `</footer>` and the first script.
       4. CRT: the whole site footer deleted.
       5. Totient: the site footer duplicated.
       6. index.html: one trailing space added to the footer's inner div close line.
       7. Cayley: the footer start and end tags renamed to div.
       8. Shor: the `>Magyar<` option label changed to `>Magyarul<` inside the footer.
     - Run the copied i18n-check.js with `--header --all` and with `--switcher-present --all`. Both must exit 1.
     - Require these finding prefixes, each followed by the page path:
       - `SWITCHER-IN-HEADER` for Factor Tree, in both runs
       - `FOOTER-DRIFT` for Venn, index.html and Shor
       - `FOOTER-POSITION` for Euclidean
       - `FOOTER-COUNT` for CRT, Totient and Cayley
       - `SWITCHER-NOT-IN-FOOTER` for CRT and Cayley
     - Every finding line, meaning every line not starting with `I18N-CHECK `, must name one of the 8 mutated pages.
     - Print `FOOTER-GATE PASS 8 mutants`.
   - `css`: SITE-CSS.
     - In the `+` lines of `git diff -U0 <base> -- assets/site.css`, every declaration of a color-bearing property (color, background, background-color, border, any border side or border color, outline, box-shadow, text-shadow, fill, stroke) must leave nothing but whitespace and commas once these are removed: `var(--name)` references, numbers with px/em/rem/% units, and the words solid, dashed, dotted and none.
     - No added non-comment line may contain a hex color.
     - The file must contain a print media block whose only rule hides `.site-footer` (whitespace-insensitive match).
     - Print `SITE-CSS PASS` with the count of color declarations checked.

6. Run the verify block. Run the Sieve browser chunk and the mutant loop as separate Bash calls with run_in_background, one at a time, waiting for each. Fix root causes per D-19, then commit this task by explicit paths.
  </action>
  <verify>
    <automated>node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js markup | tail -3 | grep -q "MARKUP-EXACT PASS 16 pages" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js css | grep -q "SITE-CSS PASS" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js strip | grep -q "STRIP-GATE PASS 9 checks" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js gate | grep -q "FOOTER-GATE PASS 8 mutants"</automated>
    <automated>out=$(node .planning/phases/06-multi-language-support/i18n-check.js --all) && echo "$out" && for m in coverage header includes no-locale-number-format literals-markup literals-js; do echo "$out" | grep -qx "I18N-CHECK PASS $m: 16 page(s)" || exit 1; done && node .planning/phases/06-multi-language-support/i18n-check.js --switcher-present --all | grep -q "I18N-CHECK PASS switcher-present: 16 page(s)" && git diff --quiet 81c4d14 -- assets/nt-i18n.js assets/theme.js assets/palette.css && echo "ENGINE-UNCHANGED PASS"</automated>
    <automated>for p in "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for m in untranslated stale-switch en-change overflow footer-extra; do node .planning/phases/06-multi-language-support/i18n-browser.js "Sieve Of Eratosthenes/sieve-of-eratosthenes.html" --mutant $m | grep -q "MUTANT-DETECTED $m" || exit 1; done && echo "MUTANTS PASS 5"</automated>
  </verify>
  <done>
- MARKUP-EXACT PASS 16 pages: every page equals its 81c4d14 version with only the switcher block moved into the canonical footer, plus the D-07 reserve line on RSA and DH.
- SITE-CSS PASS, STRIP-GATE PASS 9 checks, and FOOTER-GATE PASS 8 mutants.
- i18n-check.js `--all` passes six modes on 16 pages, and `--switcher-present --all` passes.
- The engine, theme.js and palette.css are unchanged.
- The Sieve passes en-parity IDENTICAL, langs and switch at langs=15, and layout. All five mutants, including footer-extra, are detected.
- Committed as one `feat(quick-261003-bqz): ...` commit by explicit paths.
  </done>
</task>

<task type="auto">
  <name>Task 2: Runtime proof on every page — true-375px layout, day/night style parity, RSA/DH scratchpad clearance and the full 16-page browser sweep</name>
  <files>.planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js, assets/site.css</files>
  <read_first>
    - .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js (as written in Task 1)
    - .planning/phases/06-multi-language-support/i18n-browser.js :139-160 (runChrome flags, harness.chromeEnv use)
    - RSA/rsa.html :1355-1410 (updateScratchpad / initScratchpad) and Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html :997-1012 (showScratchRow)
  </read_first>
  <action>
1. **Shared runtime helpers in `footer-probe.js`.** Add the runtime modes on top of Task 1's static ones.
   - Each run writes a probe copy of a page next to the original, inside the scratch root, named `<name>.footer-probe.html`. The copy is the page with one inline script inserted before `</body>`.
   - Launch google-chrome with `--headless=new --disable-gpu --no-sandbox`, a fresh `--user-data-dir` inside the scratch root, `--virtual-time-budget`, `--dump-dom` and `harness.chromeEnv()`, under a 90-second timeout. Read the result from a `data-m` attribute on the dumped document element.
   - When `--root` is given, use that directory as the site instead of a fresh copy. `--only` filters pages by substring.

2. **`w375` mode (D-13): FOOTER-375.**
   - For each page and each language in `en de ru el`, write a wrapper `footer-probe-wrap.html` at the scratch root. It holds a 375x812 borderless iframe whose src is the URI-encoded probe path plus `?lang=<l>&theme=night`, and a message listener that copies `event.data` into the wrapper's `data-m`. Run Chrome on the wrapper with window 1400,1000 and budget 3000.
   - In the probe page, 600ms after load, post to the parent as JSON:
     - vw (innerWidth)
     - ovf: document scrollWidth minus clientWidth
     - hdrOvf and fOvf: the same difference for the header and for the site footer
     - hdrH and fH: rounded header and footer heights
     - hdrSel: the number of select elements inside `.site-header`
     - inFooter: whether the footer contains `#lang-switch-select`
     - parent: the footer's parent tagName
     - after: the number of element siblings after the footer whose tagName is not SCRIPT
     - swL and swR: the rounded left and right of `.site-footer .lang-switch`
     - lang: documentElement.lang
   - A run passes when:
     - vw is 375
     - ovf, hdrOvf and fOvf are 0
     - hdrSel is 0
     - inFooter is true
     - parent is BODY
     - after is 0
     - swL is at least 0 and swR is at most 375
     - lang equals the requested language
   - Print one `FOOTER-375 <page> <lang> <json>` line per run, then `FOOTER-375 PASS <n> runs`, where n is 64 without `--only`, or `FOOTER-375 FAIL`.

3. **`style` mode (D-04, D-05): STYLE-PARITY.**
   - For each page and each theme in `night day`, load the probe page directly with window 1280,900, budget 3000 and `?lang=en&theme=<t>`. 600ms after load, set the document's `data-m` to JSON with:
     - bgEq: footer background-color equals header background-color
     - bdEq: footer border-top-color equals header border-bottom-color
     - vec: these computed values, joined:
       - `.site-footer`: display, position, z-index, margin-top, margin-bottom, padding-top, padding-bottom, border-top-width, border-top-style, opacity, white-space, overflow-x, text-align, font-family, color, background-color
       - `.site-footer-inner`: display, justify-content, max-width, padding-top, padding-left
       - `.lang-switch`: margin-left
       - `#lang-switch-select`: color, background-color, border-top-color, font-family
   - Pass when:
     - Within each theme, all 16 pages share exactly one vec.
     - bgEq and bdEq are true on every page.
     - The night vec differs from the day vec.
     - The values are: opacity `1`, white-space `normal`, overflow-x `visible`, margin-top and margin-bottom `0px`, text-align `center`, position `relative`, z-index `2`, justify-content `center`, max-width `1180px`, lang-switch margin-left `0px`, and both font-families starting with `system-ui`.
   - Print `STYLE-PARITY PASS pages=16 themes=2`, or FAIL with the differing pages.

4. **`scratch` mode (D-07, D-14): SCRATCH-CLEAR.**
   - Pages:
     - RSA: click `#bob-gen-btn`, then `#alice-gen-btn`; the panel is `#pubkey-scratchpad`.
     - Diffie-Hellman: click `#instantBtn`; the panel is `#dh-scratchpad`.
   - Sizes: 390x800, 420x800, 520x800, 700x900, 1280x900, each through the iframe wrapper with `?lang=en`, budget 8000.
   - Timing: 600ms after load, click. 1500ms later, add is-shown to the panel and to every `.scratch-row` in it, and set every `.scratch-kv` to `n = ` followed by 60 digits. Then scroll to the document's scrollHeight. 800ms later, scroll up by 1 and back to the end. 800ms later, measure.
   - Post shown (is-shown and computed display not none), padH (the panel's height), atEnd (scrollY plus innerHeight within 2px of scrollHeight), hit (rect intersection of the panel and `.site-footer .lang-switch`) and gap (panel top minus switcher bottom).
   - A run passes when shown is 1, padH is at least 150, atEnd is 1 and hit is 0.
   - Print one line per run, then `SCRATCH-CLEAR PASS 10 runs`.

5. **`neg` mode: PROBE-NEG.** Build three scratch copies of the working tree. Spawn this script on each with `--root` and require a non-zero exit:
   - NEG-STYLE: delete the `  opacity: 1;` line from site.css; run `style`.
   - NEG-375: insert `<span style="display:inline-block;width:600px">x</span>` on its own line right after the Sieve's inner div start line; run `w375 --only "Sieve Of Eratosthenes"`.
   - NEG-SCRATCH: in RSA and DH, turn `  body{ padding-bottom: 240px; }` back into `  .app{ padding-bottom: 240px; }`; run `scratch`.
   Print `PROBE-NEG PASS 3 controls`.

6. **Run the verify block** as separate Bash calls with run_in_background, one at a time, waiting for each: w375, style, scratch, neg, then the eight browser chunks (D-17).
   - If a probe fails, fix the root cause in site.css within the D-04 to D-09 rules, never by editing a page style beyond D-07 (D-19).
   - Fermat follows D-18.
   - Record in the SUMMARY: every FOOTER-375 hdrH/fH figure for en, the SCRATCH-CLEAR gap per size, and every CHUNK-TIME line.
   - Commit footer-probe.js, plus site.css if a fix was needed, by explicit paths.
  </action>
  <verify>
    <automated>node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js w375 | tee /dev/stderr | grep -q "FOOTER-375 PASS 64 runs"</automated>
    <automated>node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js style | grep -q "STYLE-PARITY PASS pages=16 themes=2" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js scratch | tee /dev/stderr | grep -q "SCRATCH-CLEAR PASS 10 runs"</automated>
    <automated>node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js neg | grep -q "PROBE-NEG PASS 3 controls"</automated>
    <automated>for p in "index.html" "RSA/rsa.html" "Group Isomorphism/group-isomorphism.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Factor Tree/factor-tree.html" "Venn Diagram/venn-diagram.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Euclidean Algorithm/euclidean-algorithm.html" "Chinese Remainder Theorem/chinese-remainder-theorem.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Equivalence Wheel/equivalence-wheel.html" "Eulers Totient/eulers-totient.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Cayley Table/cayley-table.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Square And Multiply/square-and-multiply.html" "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" "Shors Algorithm/shors-algorithm.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <automated>for p in "Fermats Method/fermats-method.html"; do s=$(date +%s); out=$(node .planning/phases/06-multi-language-support/i18n-browser.js "$p"); rc=$?; echo "$out"; echo "CHUNK-TIME $p $(( $(date +%s) - s ))s"; [ $rc -eq 0 ] && echo "$out" | grep -q "en-parity IDENTICAL" && echo "$out" | grep -q "langs PASS snaps=[0-9]* langs=15" && echo "$out" | grep -q "switch PASS points=[0-9]* langs=15" && echo "$out" | grep -q "layout PASS" || exit 1; done</automated>
    <human-check>Pending, recorded in the SUMMARY for end-of-phase review, not blocking: open the Sieve, RSA and index.html at phone width (about 375px) and at desktop width, in day and night themes. Confirm that the footer reads as part of the site chrome (same band and border as the header), that the centered switcher looks deliberate, and that on RSA, after generating both keypairs and scrolling to the end, the public-keys panel sits below the switcher rather than over it.</human-check>
  </verify>
  <done>
- FOOTER-375 PASS 64 runs (true 375px, en/de/ru/el, 16 pages), STYLE-PARITY PASS pages=16 themes=2, SCRATCH-CLEAR PASS 10 runs, and PROBE-NEG PASS 3 controls.
- All 15 remaining pages pass i18n-browser.js full mode: en-parity IDENTICAL, langs=15, switch, and layout.
- The CHUNK-TIME, header-height and gap figures are recorded in the SUMMARY.
- Committed by explicit paths.
  </done>
</task>

<task type="auto">
  <name>Task 3: Living docs and the site.js comment say "footer", then the consolidated regression sweep</name>
  <files>assets/i18n/site.js, CLAUDE.md, .claude/CLAUDE.md, .planning/PROJECT.md, .planning/REQUIREMENTS.md, .planning/codebase/ARCHITECTURE.md, .planning/codebase/CONCERNS.md, .planning/codebase/STRUCTURE.md, .planning/codebase/TESTING.md</files>
  <read_first>
    - CLAUDE.md line 41 (the Multi-language support bullet)
    - .claude/CLAUDE.md lines 210-300 and .planning/codebase/ARCHITECTURE.md lines 55-200 (mirrored GSD architecture section)
    - .planning/PROJECT.md line 19, .planning/REQUIREMENTS.md line 68
    - .planning/codebase/CONCERNS.md lines 26-34, STRUCTURE.md lines 60-66, 135-139, 199-203, 244-248, TESTING.md lines 236-253
    - assets/i18n/site.js lines 1-12
  </read_first>
  <action>
Apply these edits (D-15, D-10). Edit each mirrored line identically in `.claude/CLAUDE.md` and `.planning/codebase/ARCHITECTURE.md`, so that `shadow-check.js --docs` finds every mirror line in its source.

1. `assets/i18n/site.js` header comment line 1: the namespace holds the shared site chrome, meaning the header and the site footer. Comment only, no key or value changes.

2. `CLAUDE.md`, Multi-language bullet:
   - The new-tool checklist item about copying the canonical header now says the canonical header and the canonical site footer are copied from the Sieve of Eratosthenes.
   - Add a sentence: the language switcher (`#lang-switch-select`) lives in the canonical site footer, `<footer class="site-footer">`, which is the last element before a page's scripts and byte-identical on every page (enforced by `i18n-check.js --header`); the header keeps the brand, nav and day/night toggle.

3. Mirrored in `.claude/CLAUDE.md` and `ARCHITECTURE.md`:
   - The Site Chrome component-table row becomes: sticky header (tool navigation, day/night toggle) and site footer (language switcher).
   - The Site Chrome layer's Purpose line adds the language-switcher footer.
   - Its Contains line becomes: sticky header HTML and site footer HTML, both included in each page's markup.
   - The i18n layer's Location line ends with the canonical site footer's `#lang-switch-select` switcher.
   - Language Switch Flow step 1 says the user selects a language in the site footer's `#lang-switch-select`.

4. `PROJECT.md` line 19:
   - The language switcher is in the shared site footer.
   - Append to that bullet: switcher moved from the header to a shared site footer on 2026-10-03 by quick task 261003-bqz.

5. `REQUIREMENTS.md` I18N-01: the switcher is exposed in the shared site footer. Its closing clause says the header markup is identical on every page apart from relative paths and the active link, and the site footer markup is byte-identical on every page.

6. `CONCERNS.md`, the identical-copies concern:
   - Its title covers header and site-footer edits.
   - Issue: each page carries the canonical header (brand, 16 nav links) and the canonical site footer (the `#lang-switch-select` switcher).
   - Impact: a change copied to only some pages produces HEADER-DRIFT or FOOTER-DRIFT.
   - Fix approach: `i18n-check.js --header --all` catches header and site-footer drift.

7. `STRUCTURE.md`:
   - The assets Purpose (:64) and the Special Directories contents (:247) name the site footer with the language switcher.
   - The shared-styling line (:137) names the site footer and language switch styling.
   - New-tool step 4 (:201) also copies the canonical site footer: byte-identical, `<footer class="site-footer">`, placed as the last element before the page's scripts.

8. `TESTING.md`:
   - Line 239: `--header`/`--switcher-present` check canonical header and site-footer drift (HEADER-DRIFT, FOOTER-DRIFT, FOOTER-COUNT, FOOTER-POSITION) and that `#lang-switch-select` sits in the site footer and not in the header (SWITCHER-IN-HEADER, SWITCHER-NOT-IN-FOOTER).
   - Line 244: add `footer-extra` to the mutant list. Say that en-parity strips the canonical site footer only when it holds nothing but the switcher.
   - Line 249: the manual check uses the footer switcher.
   - Line 252: view the site footer and the header at about 375px in both themes with German active, and confirm the footer's centered switcher and the header's nav and theme toggle neither overlap nor overflow.

9. Every edited line that mentions the switcher must also mention the footer. Then run the verify block. Commit by explicit paths, then confirm `.planning/config.json` is in no commit since 81c4d14.
  </action>
  <verify>
    <automated>node -e 'const fs=require("fs"),cp=require("child_process");const F=["CLAUDE.md",".claude/CLAUDE.md",".planning/PROJECT.md",".planning/REQUIREMENTS.md"].concat(fs.readdirSync(".planning/codebase").filter(f=>f.endsWith(".md")).map(f=>".planning/codebase/"+f));const bad=t=>t.split("\n").filter(l=>/switcher|lang-switch|language switch/i.test(l)&&/header/i.test(l)&&!/footer/i.test(l)).length;let b=0,n=0;const hits=[];for(const f of F){b+=bad(cp.execFileSync("git",["show","81c4d14:"+f],{encoding:"utf8"}));const c=bad(fs.readFileSync(f,"utf8"));n+=c;if(c)hits.push(f)}const ok=b===14&&n===0;console.log(ok?"DOC-STALE PASS 14 -> 0":"DOC-STALE FAIL base="+b+" now="+n+" "+hits.join(","));process.exit(ok?0:1)' && grep -q "site-footer" CLAUDE.md && grep -q "site-footer" .planning/codebase/STRUCTURE.md && grep -q "FOOTER-DRIFT" .planning/codebase/TESTING.md && grep -q "footer-extra" .planning/codebase/TESTING.md && grep -q "FOOTER-DRIFT" .planning/codebase/CONCERNS.md && grep -qF "site footer's \`#lang-switch-select\`" .claude/CLAUDE.md && grep -qF "site footer's \`#lang-switch-select\`" .planning/codebase/ARCHITECTURE.md && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs | grep -q "SHADOW-CHECK PASS --docs"</automated>
    <automated>node -e 'const fs=require("fs"),vm=require("vm"),cp=require("child_process");const B="81c4d14";const files=cp.execFileSync("git",["ls-tree","--name-only",B,"assets/i18n/"],{encoding:"utf8"}).split("\n").filter(Boolean);const load=get=>{const cat={};const NT={i18n:{register:(n,d)=>{cat[n]=d}}};for(const f of files)vm.runInNewContext(get(f),{NT,window:{NT}});return cat};const O=load(f=>cp.execFileSync("git",["show",B+":"+f],{encoding:"utf8"})),N=load(f=>fs.readFileSync(f,"utf8"));const ks=Object.keys(O);const bad=ks.filter(k=>JSON.stringify(O[k])!==JSON.stringify(N[k])).concat(Object.keys(N).filter(k=>!(k in O)));const same=fs.readdirSync("assets/i18n").sort().join()===files.map(f=>f.split("/").pop()).sort().join();const ok=ks.length===18&&!bad.length&&same;console.log(ok?"DICT-UNCHANGED PASS "+ks.length+" namespaces":"DICT-UNCHANGED FAIL "+bad.join(","));process.exit(ok?0:1)' && git diff --quiet 81c4d14 -- assets/nt-i18n.js assets/theme.js assets/palette.css && echo "ENGINE-UNCHANGED PASS"</automated>
    <automated>out=$(node .planning/phases/06-multi-language-support/i18n-check.js --all) && echo "$out" && for m in coverage header includes no-locale-number-format literals-markup literals-js; do echo "$out" | grep -qx "I18N-CHECK PASS $m: 16 page(s)" || exit 1; done && node .planning/phases/06-multi-language-support/i18n-check.js --switcher-present --all | grep -q "I18N-CHECK PASS switcher-present: 16 page(s)" && node .planning/phases/06-multi-language-support/i18n-check.js --api | grep -q "I18N-CHECK PASS api: 399 assertions" && node .planning/phases/06-multi-language-support/i18n-check.js --persistence | grep -q "I18N-CHECK PASS persistence: 248 assertions" && node .planning/phases/06-multi-language-support/i18n-check.js --smoke | grep -q "I18N-CHECK PASS smoke: 123 assertions (mutant detected)" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js markup | grep -q "MARKUP-EXACT PASS 16 pages" && node .planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js gate | grep -q "FOOTER-GATE PASS 8 mutants"</automated>
    <automated>node .planning/phases/07-shared-js-module-refactor/harness.js | tail -1 | grep -q "HARNESS PASS total=2856003" && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --docs | grep -q "SHADOW-CHECK PASS --docs"</automated>
    <automated>node -e 'const cp=require("child_process");const A=new Set(require("./.planning/phases/06-multi-language-support/i18n-check.js").PAGES.map(p=>p.file).concat(["assets/site.css","assets/i18n/site.js",".planning/phases/06-multi-language-support/i18n-check.js",".planning/phases/06-multi-language-support/i18n-browser.js",".planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/footer-probe.js","CLAUDE.md",".claude/CLAUDE.md",".planning/PROJECT.md",".planning/REQUIREMENTS.md",".planning/codebase/ARCHITECTURE.md",".planning/codebase/CONCERNS.md",".planning/codebase/STRUCTURE.md",".planning/codebase/TESTING.md"]));const ch=cp.execFileSync("git",["diff","--name-only","81c4d14","HEAD"],{encoding:"utf8"}).split("\n").filter(Boolean);const bad=ch.filter(f=>!A.has(f));console.log(bad.length?"CHANGE-SCOPE FAIL "+bad.join(","):"CHANGE-SCOPE PASS "+ch.length+" files");process.exit(bad.length?1:0)' && names=$(git diff --name-only 81c4d14 HEAD) && ! printf '%s\n' "$names" | grep -qx ".planning/config.json" && echo "CONFIG-NOT-COMMITTED PASS"</automated>
  </verify>
  <done>
- DOC-STALE PASS (14 lines down to 0), with the positive doc markers present and shadow-check `--docs` PASS (mirrors identical).
- DICT-UNCHANGED PASS across 18 namespaces, and ENGINE-UNCHANGED PASS.
- i18n-check `--all` passes six modes on 16 pages, `--switcher-present` passes, and api/persistence/smoke report 399/248/123.
- MARKUP-EXACT and FOOTER-GATE still pass.
- harness.js reports 2856003, and shadow-check `--all` passes.
- CHANGE-SCOPE PASS, and config.json appears in no commit.
- Committed by explicit paths.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| URL `?lang=` / cookie / localStorage `site-lang` → NT.i18n | Untrusted input. This task does not change it: the engine is byte-identical, and the select is still found by id. |
| Static page markup → DOM | The footer is static markup only. No script-rendered text, no innerHTML, and no new input surface. |
| Gate tooling → release decisions | The en-parity normalization and the footer gates decide whether a regression ships, so a loosened gate is the main risk in this task. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-bqz-01 | Tampering | i18n-browser.js stripI18nArtifacts (en-parity normalization) | medium | mitigate | D-12: one non-global structural strip that matches only a footer holding exactly the canonical switcher (option count from SWITCHER_OPTIONS). The bare-label strip is removed, so a switcher back in the header fails. STRIP-GATE (9 cases) and the footer-extra mutant prove extra content is detected. |
| T-bqz-02 | Tampering | i18n-check.js header/footer identity | medium | mitigate | D-11: byte-exact FOOTER-DRIFT against the Sieve, plus FOOTER-COUNT, FOOTER-POSITION, SWITCHER-IN-HEADER and SWITCHER-NOT-IN-FOOTER. FOOTER-GATE catches 8 mutants with findings confined to the mutated pages. No existing check changed (`--all` still runs the same six modes). |
| T-bqz-03 | Denial of Service | language switcher usability (RSA/DH fixed panel, page bare `footer{}` rules) | medium | mitigate | D-07 body reserve, proven by SCRATCH-CLEAR (10 runs) and its negative control. D-05 explicit overrides, proven by STYLE-PARITY (opacity 1, white-space normal, margins 0) and NEG-STYLE. |
| T-bqz-04 | Information Disclosure | site-lang persistence | low | mitigate | ENGINE-UNCHANGED: nt-i18n.js, theme.js and palette.css are byte-identical to 81c4d14. `--api` 399 and `--persistence` 248 assertions are unchanged. |
| T-bqz-05 | Elevation of Privilege | XSS through new markup | low | accept | The footer is static, attribute-only markup with no dynamic text. `--literals-markup` still passes, and no innerHTML is introduced. |
| T-bqz-SC | Tampering | npm/pip/cargo installs | low | accept | This plan installs no package. Node 22.23.1 and Google Chrome 153 are already present. There is no install task, so no legitimacy checkpoint is needed. |
</threat_model>

<verification>
- Task 1: MARKUP-EXACT, SITE-CSS, STRIP-GATE and FOOTER-GATE; i18n-check `--all` and `--switcher-present`; ENGINE-UNCHANGED; the Sieve full browser run; 5 mutants including footer-extra.
- Task 2: FOOTER-375 (true 375px, 64 runs), STYLE-PARITY (16 pages, 2 themes), SCRATCH-CLEAR (10 runs) and PROBE-NEG (3 controls); full browser mode on the remaining 15 pages in eight background chunks.
- Task 3: DOC-STALE 14 to 0 plus the positive doc markers; shadow-check `--docs`; DICT-UNCHANGED; ENGINE-UNCHANGED; i18n-check `--all`, `--switcher-present`, api 399, persistence 248 and smoke 123; MARKUP-EXACT and FOOTER-GATE re-run; harness 2856003; shadow-check `--all`; CHANGE-SCOPE; CONFIG-NOT-COMMITTED.
</verification>

<success_criteria>
- The switcher lives in one byte-identical `<footer class="site-footer">` per page, which is the last element before the scripts, and no header contains it.
- Language switching, persistence and re-render behave exactly as before: the engine is unchanged and switch mode passes at langs=15 on all 16 pages.
- English is byte-identical to the pre-i18n BASE under a strictly tighter normalization, and en-parity is IDENTICAL on all 16 pages.
- The footer matches the header in both themes, is identical on every page, does not overflow at a true 375px, and clears the RSA/DH panel at the end of the page.
- No dictionary value changes, and the living docs describe the footer placement.
</success_criteria>

<output>
Create `.planning/quick/261003-bqz-move-the-language-switcher-to-a-shared-s/261003-bqz-SUMMARY.md` when done. Record:
- every gate result line: MARKUP-EXACT, SITE-CSS, STRIP-GATE, FOOTER-GATE, FOOTER-375 (summary), STYLE-PARITY, SCRATCH-CLEAR (per size, with gaps), PROBE-NEG, DOC-STALE, DICT-UNCHANGED, ENGINE-UNCHANGED, the i18n-check modes and counts, HARNESS, SHADOW-CHECK, CHANGE-SCOPE and CONFIG-NOT-COMMITTED;
- the en header and footer heights at a true 375px per page;
- every CHUNK-TIME line, and any D-18 Fermat retry;
- the D-13 observation: headless Chrome's minimum viewport width is 500px, so i18n-browser.js layout mode and earlier HEADER-375 probes measured 500px, not 375px. This is a follow-up candidate, not fixed here;
- the D-16 accepted consequences;
- the pending visual human-check from Task 2;
- the commit hashes.
</output>
