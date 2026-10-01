---
phase: 06-multi-language-support
plan: 08
subsystem: i18n
tags: [i18n, nt-i18n, localization, venn-diagram, static-gates, runtime-gates, shadow-check]

# Dependency graph
requires:
  - phase: 06-multi-language-support
    provides: "06-01's NT.i18n contract and canonical header; 06-02's shared `common` vocabulary, 06-GLOSSARY.md, the i18n-check.js static gate suite, i18n-browser.js's headless runtime gate suite, and Phase 7's convention gate extended to cover NT.i18n"
provides:
  - "The Venn Diagram (the largest page in the site, ~2,500 lines) fully translated in nl/en/de/fr/es: canonical header + language switcher, both ledes, the Euclidean cross-link, toolbar/mode/thumbnail/randomize/clear controls, the prime picker, the pane captions, all four diagram aria-labels, every runtime message (place/remove/move/simplify, region-full, pick-first, cleared, randomized, filled-from-URL, opened/blocked tab, truncated), every region aria-label, the hover-preview panel's Euclidean/Factor Tree headings and hints, and the double-click target line"
  - "assets/i18n/venn-diagram.js — the 'venn' namespace in five languages"
  - "A worked precedent for a page that is translated in two passes (static interface, then dynamic text) over the same files, and for giving a &lang=-aware fix (euclidHref/factorTreeHref) to a page whose cross-tool hrefs are entirely JS-rebuilt rather than markup-static"
affects: ["06-09", "06-10", "06-11", "06-12"]

# Actuals (#2632)
actuals:
  tokens: 16822
  tasks: 2
  commits: 2

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Display-word table -> key table: REGION_CAPTIONS/REGION_CAPTIONS3 became REGION_CAPTION_KEY/REGION_CAPTION_KEY3 (key -> i18n key, never key -> display word), so every reader calls translate(REGION_CAPTION_KEY[key]) fresh at render/message time instead of reading a cached English word"
    - "Structured message state ({key, paramsFn, warn}) instead of a pre-rendered string: setMessage/renderMessage separate 'what happened' (raw prime/region-key/notation data, captured in a closure) from 'how it reads right now' (resolved by calling paramsFn() at render time, including nested translate() calls for region captions and the simplified-move notes) -- the same record is replayed verbatim by onLangChange's renderMessage() call after a switch"
    - "Explicit text-node tracking for mixed static+dynamic SVG elements: the two-circle interactive layer's region-caption <text> elements each carry a never-translated <title> (math notation) sibling; rather than touching el.textContent (which would wipe the title), each caption's own text node is captured at build time and retranslated in place by name on every language change"
    - "state.openPreview + synthetic mouseenter replay: a hover-preview panel's anchoring DOM node is destroyed and rebuilt by every render() call (including the one triggered by a language switch), so 'is the pointer still over it' can't be read back from the DOM after a rebuild -- the open preview's {mode, key} is remembered in state instead, and after render() the freshly-rebuilt badge is found by its stable data-region attribute and sent a synthetic mouseenter event through the exact same handler a real hover would use, redrawing the panel in the new language without any separate re-render path"
    - "JS-rebuilt cross-tool hrefs carry &lang= themselves (euclidHref/factorTreeHref), because decorateLinks() only re-decorates <a> elements already in the DOM at the moment it runs and never an href this script rebuilds afterward on every render() -- the same gap 06-04 found and fixed for the Cayley/Wheel cross-link, recurring here because the entire xref/badge href surface on this page is JS-owned rather than markup-static"

key-files:
  created:
    - assets/i18n/venn-diagram.js
    - .planning/phases/06-multi-language-support/i18n-config/venn-diagram.json
  modified:
    - Venn Diagram/venn-diagram.html

key-decisions:
  - "Task 1 adds the nt-i18n.js/site.js/venn-diagram.js includes but NO `const {...} = NT.i18n;` import line: nothing in Task 1's own static-markup conversion calls into NT.i18n (applyStaticDom/decorateLinks run automatically via nt-i18n.js's own init()), and shadow-check's UNUSED-IMPORT rule would fire on an import with zero genuine call sites. The plan's Task 1 acceptance criterion `grep -c '= NT.i18n;' ... prints 1` therefore isn't satisfied until Task 2's commit, within the same plan execution -- shadow-check explicitly exempts an included-but-unimported nt-i18n.js from UNUSED-INCLUDE for exactly this self-initializing reason."
  - "switchPoints are two deterministic TWO-CIRCLE snapshots (place-right-29, clear), not one two-circle and one three-circle point as the plan's action text asked for: i18n-browser.js's `doSwitch()` only reads `cfg.runs[0]` (the Phase 7 browser-diff config's first/default-query run), and the three-circle scenario lives entirely in `runs[1]` (reached only via a `#mode-three` click inside that separate run) or the `?mode=three` query run further down the list -- neither is reachable from `doSwitch`'s hard-coded `cfg.runs[0]`. Overriding `runs` in this page's own i18n-config to merge both scenarios into one combined run[0] would also change what `langs`/`en-parity` validate (they iterate ALL `cfg.runs` entries), risking regressions in gates that already passed cleanly against the unmodified Phase 7 config. Chose two points from the reachable run instead of touching shared dev infrastructure (i18n-browser.js) or risking the other gates."
  - "Region captions in buildStatic()'s two-circle interactive/composite layers are tracked via explicit text-node references (captionTextNodes), not data-i18n attributes: each caption <text> element also carries a <title> child holding the (never-translated) math notation, and translateInto()/applyStaticDom's rich-template path would need the title re-inserted via a {0} placeholder on every render -- simpler and less fragile to keep a direct reference to the caption's own text node and update it by name in retranslateCaptionLabels(), called once from the P7 onLangChange callback."
  - "euclidHref()/factorTreeHref() append `&lang=' + getLang()` directly rather than patching decorateLinks() or adding a second href-rewrite pass: every href on this page (the static xref anchor's href, both composite-badge hrefs) is set EXCLUSIVELY through these two functions, so fixing them once covers every cross-tool link surface the page has."

requirements-completed: [I18N-01, I18N-02, I18N-03, I18N-05, I18N-06]

coverage:
  - id: D1
    description: "The Venn Diagram's static interface (canonical header + language switcher, both ledes, the Euclidean cross-link text, toolbar/mode/thumbnail/randomize/clear controls, the prime picker heading/hint, the pane captions, and all four diagram aria-labels) reads in all five languages"
    requirement: "I18N-01"
    verification:
      - kind: unit
        ref: "node i18n-check.js --coverage --header --includes --no-locale-number-format --literals-markup \"Venn Diagram/venn-diagram.html\" (5/5 PASS)"
        status: pass
      - kind: unit
        ref: "node shadow-check.js \"Venn Diagram/venn-diagram.html\" (SHADOW-CHECK PASS)"
        status: pass
    human_judgment: true
    rationale: "06-GLOSSARY.md's terminology (tool names, core-term table, tone) is still gated behind the end-of-phase human review recorded in 06-02's own Task 1 human-check; this plan applies that glossary but does not re-verify it."
  - id: D2
    description: "Every Venn message, region aria-label, preview-panel heading/hint and the scroll-more affordance follows the active language live and after a language switch, in both two-circle and three-circle mode, without disturbing placed primes, the armed prime, mode or the thumbnails setting; English output is byte-identical to the pre-phase page"
    requirement: "I18N-02, I18N-03, I18N-05"
    verification:
      - kind: e2e
        ref: "node i18n-browser.js \"Venn Diagram/venn-diagram.html\" (en-parity IDENTICAL snaps=30; langs PASS snaps=14 langs=4; switch PASS points=2 langs=4; layout PASS; ALL PASS)"
        status: pass
      - kind: unit
        ref: "node i18n-check.js \"Venn Diagram/venn-diagram.html\" (all 6 static modes PASS, including --literals-js)"
        status: pass
    human_judgment: true
    rationale: "The plan's own Task 2 human-check (drag a prime between regions, double-click an overlap chip, hover a composite chip with thumbnails on, and switch language with a prime armed, in Deutsch and Español) is deferred to end-of-phase UAT per workflow.human_verify_mode=end-of-phase and was not exercised by this executor. In particular the state.openPreview re-show-on-switch mechanism (re-dispatching a synthetic mouseenter on the rebuilt badge) is implemented and reasoned through but not exercised by any automated gate -- i18n-browser's switch mode never hovers a chip mid-sequence."
  - id: D3
    description: "Phase 7's convention gate (shadow-check.js) accepts the Venn Diagram's NT.i18n include/import discipline exactly as it does for the other converted pages"
    requirement: "I18N-01 (convention gate)"
    verification:
      - kind: unit
        ref: "node shadow-check.js --all (SHADOW-CHECK PASS on all 15 tool pages, including Venn Diagram)"
        status: pass
    human_judgment: false

duration: 36min (commit-span a145f90..f91980a; actual working time, including reading the ~2,500-line page end to end before the first edit, was considerably longer)
completed: 2026-10-01
status: complete
plan_head_before: a145f9060db90d3f5d4a263591725adabbebb0ae
plan_head_after: f91980a4838c2e663f91bcf04fca948e67d05e6a
---

# Phase 06 Plan 08: Venn Diagram Translation Summary

**The Venn Diagram — the largest page in the site — reads entirely in Dutch, English, German, French and Spanish: every static label, every runtime message, every region/preview aria-label and hover-preview heading, in both two-circle and three-circle mode, with placed primes, armed prime, mode and thumbnails surviving a live language switch and English output provably unchanged.**

## Performance

- **Duration:** 36 min (git commit span a145f90 -> f91980a); reading the whole ~2,500-line page (markup, the two-circle and three-circle interaction code, the combined hover-preview panel builder, the commit/simplify pipeline) before writing any edit took considerably longer than the commit-to-commit span captures.
- **Started:** 2026-10-01T18:12:45+02:00 (prior plan's commit, used as the before-anchor)
- **Completed:** 2026-10-01T18:48:05+02:00 (last production commit)
- **Tasks:** 2 (both complete)
- **Files modified:** 3 (2 created, 1 modified)

## Accomplishments

- **Static interface (Task 1):** canonical header with the language switcher (`#lang-switch-select`) added (the Venn Diagram previously had no switcher at all), 16 `site.nav.*` nav links, eyebrow, h1, both ledes (two-circle and three-circle, set notation A \ B / A ∩ B / (A∩B) \ C / A∩B∩C / A \ (B ∪ C) kept literal in every language per 06-GLOSSARY.md), the Euclidean cross-link text, the mode/thumbnail toggle group aria-labels and their four buttons, Randomize, Clear all, the prime picker heading/hint, the four pane captions and the four diagram `aria-label`s — all via new `assets/i18n/venn-diagram.js` (`venn` namespace).
- **Dynamic text (Task 2):** `REGION_CAPTIONS`/`REGION_CAPTIONS3` converted from display-word tables to key tables; `setMessage` now stores a `{key, paramsFn, warn}` record instead of a rendered string, so `onLangChange` can replay the exact same message in a new language; every message (placing/removing/moving + the "Simplified: ... moved to ..." tail, region-full warnings, pick-first, cleared, randomized, filled-from-URL with a dedicated truncated variant, opened/blocked tab, load-time truncation) now routes through `translate`/`translateInto`; every region `aria-label` (interactive click-regions and placed-token remove buttons, both modes) and the hover-preview panel's "Euclidean Algorithm"/"Factor Tree" headings, its "double-click to open the full view" hint, the "double-click to X [or Y]" line, the "over 1,000,000" cap notice, and the "↓ more" scroll affordance are translated. `euclidHref()`/`factorTreeHref()` append `&lang=` to every cross-tool URL they build (the sole href-building functions on this page). One `onLangChange` callback retranslates the two-circle layer's static caption text nodes, re-renders the message, re-renders everything else via `render()`, and — if a hover preview was open — re-dispatches a synthetic `mouseenter` on the freshly-rebuilt badge to redraw it in the new language.
- **Gates:** `i18n-check.js` (all 6 static modes), `shadow-check.js` (this page and `--all` 15/15), and `i18n-browser.js` (en-parity `IDENTICAL snaps=30`, langs `PASS snaps=14 langs=4`, switch `PASS points=2 langs=4`, layout `PASS`, `ALL PASS`) all pass.

## Task Commits

Each task was committed atomically:

1. **Task 1: The Venn Diagram's static interface reads in all five languages with the canonical header and switcher** — `540ffa4` (feat)
2. **Task 2: Every Venn message, label, tooltip and preview heading follows the language, in both modes, without disturbing placed primes** — `f91980a` (feat)

**Plan metadata:** this commit (docs: complete plan)

## Files Created/Modified

- `Venn Diagram/venn-diagram.html` — canonical header + language switcher added; `data-i18n`/`data-i18n-aria-label` throughout the static markup; `REGION_CAPTION_KEY`/`REGION_CAPTION_KEY3` key tables; structured `messageState`/`renderMessage`; `state.openPreview` tracking; `euclidHref`/`factorTreeHref` carry `&lang=`; one `onLangChange` re-render callback
- `assets/i18n/venn-diagram.js` — new, the `venn` namespace (title, eyebrow, heading, ledes, xref, toolbar/mode/thumbs/randomize/clearAll, picker, panes, four aria.* keys, ten caption.* keys, two aria.regionHolding/nothing keys, seventeen msg.* keys, eight label.* keys) in nl/en/de/fr/es
- `.planning/phases/06-multi-language-support/i18n-config/venn-diagram.json` — new, `allowLiteral` exemptions for non-prose identifiers/paths/code fragments (`aOnly`/`bOnly`/`cOnly` array-literal keys, the `nstep-` CSS prefix, the two cross-tool path constants, `&lang=`/`?lang=`/`_blank`) and `switchPoints` (`place-right-29`, `clear`)

## Decisions Made

See `key-decisions` in the frontmatter: Task 1 ships no `NT.i18n` import line (nothing in it calls into NT.i18n yet); `switchPoints` are both two-circle (i18n-browser's switch mode only reads the Phase 7 config's first run); region captions use explicit tracked text nodes rather than `data-i18n` (to coexist with a sibling, never-translated `<title>`); `euclidHref`/`factorTreeHref` are the single place `&lang=` is appended.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Task 1's own acceptance criterion `grep -c '= NT.i18n;' ... prints 1` is not satisfiable within Task 1's commit alone**
- **Found during:** Task 1, verifying acceptance criteria after the static-interface commit
- **Issue:** The plan's Task 1 action text and acceptance criteria assume an `NT.i18n` import line exists after Task 1, but nothing in Task 1's own work (data-i18n/data-i18n-aria-label markup, canonical header) calls any `NT.i18n` function — `nt-i18n.js`'s own `init()` applies all of that automatically. Adding an import with no genuine call site would itself fail shadow-check's `UNUSED-IMPORT` rule.
- **Fix:** Shipped Task 1 without the import line (includes only); added the full, genuinely-used import (`getLang, onLangChange, translate, translateInto`) in Task 2, where real call sites exist. shadow-check explicitly exempts an included `nt-i18n.js` with no import from `UNUSED-INCLUDE` for exactly this self-initializing reason, confirmed by reading `shadow-check.js` directly before making this call.
- **Files modified:** `Venn Diagram/venn-diagram.html`
- **Verification:** `node shadow-check.js "Venn Diagram/venn-diagram.html"` passes after both Task 1 and Task 2; the import line exists (count 1) after Task 2's commit, within this same plan execution.
- **Committed in:** `540ffa4` (Task 1), `f91980a` (Task 2 adds the import)

**2. [Rule 1 - Bug] `--literals-js` flagged eight pre-existing non-prose strings the first time the gate ran on this page**
- **Found during:** Task 2, first `node i18n-check.js "Venn Diagram/venn-diagram.html"` run
- **Issue:** `'aOnly'`/`'bOnly'`/`'cOnly'` (array-literal/object-key identifiers in `REGION_KEYS3` and the three-circle default-seed assignment), `'nstep-'` (a CSS class-name prefix concatenated with a step index, ported verbatim from the Euclidean Algorithm tool), the two cross-tool path constants (`EUCLID_PATH`, `FACTOR_TREE_PATH` — their capitalized words read as prose to the heuristic), and `'&lang='`/`'?lang='`/`'_blank'` (URL query-parameter names and a `window.open` target, all code) are not displayed text but matched the prose heuristic — the same gap 06-02/06-06/06-07 recorded for this checker.
- **Fix:** Added `allowLiteral` entries with reasons for all eight in `i18n-config/venn-diagram.json`, per the established precedent rather than editing the shared checker.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-config/venn-diagram.json`
- **Verification:** `--literals-js` passes cleanly
- **Committed in:** `f91980a`

**3. [Rule 1 - Bug] "↓ more" (the hover-preview panel's scroll-more affordance) was a literal English string, not covered by the plan's own message inventory**
- **Found during:** Task 2, reading `showRegionPreview`'s affordance text while converting the surrounding panel builders
- **Issue:** The affordance line `affordance.textContent = '↓ more';` is genuine displayed prose (confirmed by the `UNTRANSLATED-JS` finding) that the plan's action text did not explicitly name.
- **Fix:** Added `venn.label.scrollMore` in all five languages and routed the assignment through `translate()`.
- **Files modified:** `Venn Diagram/venn-diagram.html`, `assets/i18n/venn-diagram.js`
- **Verification:** `--literals-js` passes; the string no longer appears as a bare literal
- **Committed in:** `f91980a`

---

**Total deviations:** 3 auto-fixed (1 Rule 3 scope-ordering note, 2 Rule 1 bugs — all either necessary for the plan's own verify gates to pass as written, or genuine gaps the plan's own inventory missed). **Impact on plan:** None on scope or architecture — every fix stayed inside this page's own files or its per-page gate-exemption config; no shared infrastructure (`nt-i18n.js`, `assets/i18n/site.js`, `i18n-check.js`, `i18n-browser.js`, `shadow-check.js`) was touched.

## Issues Encountered

- `switchPoints` could not literally be "a two-circle and a three-circle snapshot" as the plan's action text asked, because `i18n-browser.js`'s `doSwitch()` only reads `cfg.runs[0]` and the three-circle scenario lives in a later run — see key-decisions. Both chosen `switchPoints` are two-circle; `switch` still passes with 2 points × 4 languages.
- The plan's Task 2 `<human-check>` (drag-between-regions, double-click-overlap-chip, hover-with-thumbnails-on, switch-language-with-a-prime-armed, in Deutsch and Español) was not exercised by this executor, per `workflow.human_verify_mode=end-of-phase` — deferred to end-of-phase UAT alongside the other wave-3 plans' deferred human-checks and 06-02's glossary review.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- The Venn Diagram satisfies I18N-01/02/03/05/06 for its own page; all static and runtime gates pass.
- `i18n-config/venn-diagram.json` is a new, documented precedent for a page whose `--literals-js` findings are dominated by array-literal identifiers and code-shaped constants rather than JS-owned static placeholders.
- The `state.openPreview` + synthetic-`mouseenter` pattern is a new, reasoned (but not automated-gate-exercised) technique available to any later plan whose page rebuilds a hover-anchored element on every render.
- Outstanding for end-of-phase UAT: this plan's own Task 2 `<human-check>` (see Issues Encountered), on top of 06-01's and 06-02's already-outstanding human-checks.

---
*Phase: 06-multi-language-support*
*Completed: 2026-10-01*

## Self-Check: PASSED

- All 3 claimed files found on disk (`Venn Diagram/venn-diagram.html`, `assets/i18n/venn-diagram.js`, `.planning/phases/06-multi-language-support/i18n-config/venn-diagram.json`; this SUMMARY itself is the 4th).
- Both claimed commits found in `git log` (`540ffa4`, `f91980a`).
- Re-ran every acceptance-criteria/verification command fresh immediately before writing this SUMMARY:
  - `node i18n-check.js --coverage --header --includes --no-locale-number-format --literals-markup "Venn Diagram/venn-diagram.html"` — 5/5 PASS
  - `node i18n-check.js "Venn Diagram/venn-diagram.html"` (all 6 static modes) — 6/6 PASS
  - `node shadow-check.js "Venn Diagram/venn-diagram.html"` — PASS; `node shadow-check.js --all` — PASS on all 15 tool pages
  - `node i18n-browser.js "Venn Diagram/venn-diagram.html"` — en-parity `IDENTICAL snaps=30`, langs `PASS snaps=14 langs=4`, switch `PASS points=2 langs=4`, layout `PASS`, `ALL PASS`
  - `grep -c 'id="lang-switch-select"' "Venn Diagram/venn-diagram.html"` = 1; `grep -c 'data-i18n="site.nav.' "Venn Diagram/venn-diagram.html"` = 16; `grep -c '= NT.i18n;' "Venn Diagram/venn-diagram.html"` = 1 (present after Task 2, per the documented Task 1 deviation above)
  - `grep -v '^\s*//' "Venn Diagram/venn-diagram.html" | grep -c "REGION_CAPTIONS\b"` = 0 (both display-word tables fully retired)
