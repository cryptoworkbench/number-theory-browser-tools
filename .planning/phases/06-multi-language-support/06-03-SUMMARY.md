---
phase: 06-multi-language-support
plan: 03
subsystem: i18n
tags: [i18n, nt-i18n, localization, hub, factor-tree, eulers-totient, static-gates, runtime-gates, shadow-check]

# Dependency graph
requires:
  - phase: 06-multi-language-support
    provides: "06-01's NT.i18n contract and canonical header; 06-02's shared `common` vocabulary, 06-GLOSSARY.md terminology/tone contract, the per-page translation procedure (P1-P10), i18n-check.js's static gate suite, i18n-browser.js's runtime gate suite, and shadow-check.js's NT.i18n-aware convention gate"
provides:
  - "index.html, Factor Tree and Euler's Totient fully translated into all five languages — three more proven reference pages for the remaining wave-3 plans (06-04 through 06-11)"
  - "assets/i18n/hub.js, assets/i18n/factor-tree.js, assets/i18n/eulers-totient.js data files"
  - "Several i18n-check.js/i18n-browser.js shared-infra fixes (DOM-API lookback regex, svgEl exemption, trailing-space class-name heuristic, data-i18n-params stripping, generic en-change mutant) that every later wave-3 plan now benefits from"
affects: ["06-04", "06-05", "06-06", "06-07", "06-08", "06-09", "06-10", "06-11", "06-12"]

# Actuals (#2632)
actuals:
  tokens: 27131
  tasks: 3
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Hub card title values preserve the hub's own pre-existing English wording (which differs from site.nav.* in several cases — e.g. 'Prime Factor Tree' vs. 'Factor Tree') rather than reusing nav.* verbatim, per P4's byte-for-byte English rule and this plan's own Task 1 action text"
    - "A JS-owned dynamic chip array switches from a `label` string field to an `isPrime` boolean, rendering text via translate('<ns>.chipPrime', {n}) or plain String(n) — avoids concatenating translated fragments"
    - "'gcd' is written identically across all five languages (never ggd/ggT/pgcd/mcd) per 06-GLOSSARY.md section (e)'s explicit math-notation list"
    - "An innerHTML template-string builder for pure-math content (Euler's Totient's division-chain lines) is rewritten to DOM construction (createElement + textContent) even though none of its content is prose, because the innerHTML-prose heuristic can't distinguish span-tag text from displayed text — matches 06-02-PLAN.md P6 and threat register row T-06-12"

key-files:
  created:
    - assets/i18n/hub.js
    - assets/i18n/factor-tree.js
    - assets/i18n/eulers-totient.js
    - .planning/phases/06-multi-language-support/i18n-config/eulers-totient.json
  modified:
    - index.html
    - Factor Tree/factor-tree.html
    - Eulers Totient/eulers-totient.html
    - .planning/phases/06-multi-language-support/i18n-check.js
    - .planning/phases/06-multi-language-support/i18n-browser.js

key-decisions:
  - "Hub card titles keep the hub's own pre-existing English wording (byte-for-byte, P4) rather than 06-GLOSSARY.md's general note that the hub reuses site.nav.* verbatim — this plan's own Task 1 action text explicitly lists the differing forms ('Prime Factor Tree', 'The Equivalence Wheel', 'Group Isomorphisms') as the required values, so the more specific plan instruction takes precedence over the glossary's general note"
  - "Euler's Totient's 'gcd' stays literal in every language's dictionary value (never translated to the per-language abbreviation) per 06-GLOSSARY.md section (e)'s explicit list of symbols/keywords (×, mod, gcd, lcm, →, …) that are written identically across all five languages"
  - "Factor Tree's appendDivLine-equivalent concern didn't arise (its equation line is plain text, not innerHTML), but Euler's Totient's appendDivLine() innerHTML builder was rewritten to DOM construction per the plan's own explicit instruction and threat register row T-06-12, even though its content (numerals + math operator glyphs) needs no translate() call — only the markup-building technique changes"

requirements-completed: [I18N-01, I18N-02, I18N-03, I18N-05, I18N-06]

coverage:
  - id: D1
    description: "The hub (index.html) shows the language switcher, and its hero, all fifteen tool cards and the footer read in the chosen language; clicking a card opens the tool in that language"
    requirement: "I18N-01, I18N-02, I18N-03, I18N-05"
    verification:
      - kind: unit
        ref: "node i18n-check.js index.html (coverage/header/includes/no-locale-number-format/literals-markup/literals-js, 6/6 PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js index.html (en-parity IDENTICAL snaps=1; langs PASS snaps=1 langs=4; switch PASS points=1 langs=4; layout PASS; ALL PASS)"
        status: pass
      - kind: unit
        ref: "node shadow-check.js index.html (SHADOW-CHECK PASS)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The Prime Factor Tree page — mode buttons, input placeholder, button, chips, messages, mode caveat, result line and footnote — reads entirely in the active language, and switching language keeps the grown tree and mode"
    requirement: "I18N-01, I18N-02, I18N-03, I18N-05"
    verification:
      - kind: unit
        ref: "node i18n-check.js \"Factor Tree/factor-tree.html\" (6/6 PASS)"
        status: pass
      - kind: unit
        ref: "node shadow-check.js \"Factor Tree/factor-tree.html\" (SHADOW-CHECK PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Factor Tree/factor-tree.html\" (en-parity IDENTICAL snaps=29; langs PASS snaps=25 langs=4; switch PASS points=1 langs=4; layout PASS; ALL PASS)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The Euler's Totient page — lede, chips, controls, banner, error box, progress/tally/answer lines, Euclid chains and verdicts, cross-link — reads entirely in the active language, and switching mid-scan keeps the scan position and play/pause state"
    requirement: "I18N-01, I18N-02, I18N-03, I18N-05"
    verification:
      - kind: unit
        ref: "node i18n-check.js \"Eulers Totient/eulers-totient.html\" (6/6 PASS)"
        status: pass
      - kind: unit
        ref: "node shadow-check.js \"Eulers Totient/eulers-totient.html\" (SHADOW-CHECK PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Eulers Totient/eulers-totient.html\" (en-parity IDENTICAL snaps=13; langs PASS snaps=13 langs=4; switch PASS points=2 langs=4; layout PASS; ALL PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js \"Eulers Totient/eulers-totient.html\" --mutant {untranslated,stale-switch,en-change,overflow} (4/4 MUTANT-DETECTED)"
        status: pass
    human_judgment: false
  - id: D4
    description: "With English active all three pages render exactly as before this phase; numbers are formatted exactly as before in every language (no toLocaleString/Intl number formatting)"
    requirement: "I18N-06"
    verification:
      - kind: unit
        ref: "node i18n-check.js --no-locale-number-format on all three pages (3/3 PASS); grep for toLocaleString in eulers-totient.html returns none (replaced by NT.bigint.fmt)"
        status: pass
      - kind: e2e
        ref: "en-parity IDENTICAL on all three pages (index snaps=1, factor-tree snaps=29, eulers-totient snaps=13)"
        status: pass
    human_judgment: false

duration: single session
completed: 2026-10-01
status: complete
plan_head_before: 934f71fa33f0d65c23a508e3e55521f2f67a0a9e
plan_head_after: 519d80206200311670676eedce7b60341064d7ac
---

# Phase 06 Plan 03: Hub, Factor Tree and Euler's Totient Translation Summary

**index.html (the hub), Factor Tree and Euler's Totient all read completely in Dutch/English/German/French/Spanish, each proven by the full static + runtime + convention gate suite, with Factor Tree preserving its grown tree and Euler's Totient preserving its mid-scan position and play/pause state across a language switch — plus five shared-infra fixes discovered while running the Phase 06-02 gate suite against pages other than the Sieve for the first time.**

## Performance

- **Duration:** single session
- **Tasks:** 3 (all complete)
- **Files modified:** 9 (4 created, 5 modified — excluding this SUMMARY)

## Accomplishments

- **The hub** (`index.html`): canonical i18n header with the five-language switcher; new `assets/i18n/hub.js` `hub` namespace — title, hero (eyebrow/title/lede), `card.<id>.title`/`card.<id>.desc` for all fifteen tool cards, one shared `openTool` key for all fifteen `.go` spans, and the footer. No inline script on the hub, so `nt-i18n.js`, `i18n/site.js` and `i18n/hub.js` are the last three lines before `</body>`.
- **Prime Factor Tree**: static markup (title, h1, subtitle, mode buttons, placeholder, Grow button, footnote) translated via `data-i18n`; every dynamic message (empty/invalid/too-large/one/prime/factors) routed through `translate()` with a tracked `lastMessageState` for re-render; the Balanced-mode caveat and the two "(prime)" chip labels likewise; one `onLangChange` callback re-renders the message, caveat and chips without regrowing or re-animating the tree.
- **Euler's Totient**: static markup (eyebrow, h1, lede, cross-link text, Run button, two prime-chip labels, caption) translated; every dynamic string (error messages, chain head, verdict lines, tally, progress, answer, banner — including a plural `bannerDone` entry) routed through `translate()` with tracked state; `MAX_N`'s clamp message now uses `NT.bigint.fmt` instead of `toLocaleString`; `appendDivLine()` rewritten from an innerHTML template string to DOM construction; one `onLangChange` callback re-renders every tracked piece of text and rebuilds the cross-link (now explicitly carrying `&lang=`) without replaying or resetting the scan.
- **Five shared-infra fixes** discovered while running Phase 06-02's gate suite against pages other than the Sieve for the first time (all proven not to regress the Sieve or the hub — see Deviations):
  1. `i18n-check.js`'s DOM-API lookback regex excluded a preceding `.`, so a direct `document.getElementById(...)` call (vs. the Sieve's `$` alias) was never recognized as code.
  2. `svgEl` was missing from that same exemption list despite being named in 06-02-PLAN.md's own P6 spec.
  3. The all-lowercase class-name heuristic didn't allow a trailing space, so concatenated CSS class literals (`'fairy-light '+lightClass`) were flagged as untranslated prose.
  4. `i18n-browser.js`'s `stripI18nArtifacts()` didn't strip `data-i18n-params`, so any static element using params (Euler's Totient's two prime chips) always failed en-parity.
  5. The `--mutant en-change` self-test was hardcoded to `[data-i18n="sieve.lede"]`, silently no-opping (`MUTANT-SURVIVED`) on every page but the Sieve — generalized to the first element carrying any `data-i18n` attribute.

## Task Commits

Each task was committed atomically:

1. **Task 1: The hub reads in all five languages and hands the choice to every tool** — `bd61892` (feat)
2. **Task 2: The Prime Factor Tree reads entirely in all five languages and keeps the grown tree across a switch** — `f9edf1d` (feat, includes the i18n-check.js DOM-API/svgEl/trailing-space fixes)
3. **Task 3: Euler's Totient reads entirely in all five languages and keeps the scan position across a switch** — `519d802` (feat, includes the i18n-browser.js data-i18n-params/en-change-mutant fixes and the updateXrefLink lang= fix)

**Plan metadata:** this commit (docs: complete plan)

## Files Created/Modified

- `assets/i18n/hub.js` — `hub` namespace (title, hero.*, card.<id>.title/desc × 15, openTool, footer) in all five languages
- `assets/i18n/factor-tree.js` — `factorTree` namespace (title, heading, subtitle, mode labels, placeholder, grow, footnote, balancedNote, 5 validation messages, chipPrime) in all five languages
- `assets/i18n/eulers-totient.js` — `totient` namespace (title, eyebrow, heading, lede, xref, chipPrime, run, 3 error messages, chainHead, 2 verdict messages, tally, progress, answer, bannerReady, plural bannerDone, caption) in all five languages
- `.planning/phases/06-multi-language-support/i18n-config/eulers-totient.json` — `switchPoints` (custom-60, step-2) and `allowLiteral` exemptions (JS-owned play/speed/banner placeholders, the xref href-building literals)
- `index.html` — canonical header, data-i18n on title/hero/15 cards/footer, three script includes before `</body>`
- `Factor Tree/factor-tree.html` — canonical header, data-i18n on static markup, message/chip/caveat state tracking + translate(), onLangChange wiring
- `Eulers Totient/eulers-totient.html` — canonical header, data-i18n on static markup (incl. two literal-Unicode chip fixes), extensive dynamic-text state tracking + translate(), DOM-construction `appendDivLine`, `updateXrefLink` lang= fix, onLangChange wiring
- `.planning/phases/06-multi-language-support/i18n-check.js` — DOM-API lookback regex fix, `svgEl` added to the exemption list, trailing-space class-name heuristic fix
- `.planning/phases/06-multi-language-support/i18n-browser.js` — `stripI18nArtifacts()` now strips `data-i18n-params`; `--mutant en-change` generalized off the Sieve-specific selector

## Decisions Made

- Hub card titles preserve the hub's own pre-existing English wording rather than reusing `site.nav.*` verbatim, per this plan's own Task 1 action text and P4's byte-for-byte English rule (see key-decisions in frontmatter).
- "gcd" stays literal across every language in Euler's Totient, per 06-GLOSSARY.md section (e)'s explicit math-notation list.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] i18n-check.js's DOM-API lookback regex excluded a preceding "." before the function name**
- **Found during:** Task 2, first `--literals-js` run against Factor Tree
- **Issue:** `document.getElementById('numInput')`-style direct calls (this page's own style, vs. the Sieve's `$ = (id) => document.getElementById(id)` alias) were never recognized as code, because the lookback character class `[^A-Za-z0-9_$.]` explicitly excluded "." as a "safe" preceding character, so `document.getElementById(` never matched.
- **Fix:** Removed "." from both `TRANSLATE_CALL_RE`'s and `DOM_API_CALL_RE`'s lookback exclusion classes (a preceding "." is a member-access dot, not part of a longer identifier, so it should not block the match).
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-check.js`
- **Verification:** `--literals-js` passes cleanly on Factor Tree; re-ran on index.html, the Sieve and `--api`/`--persistence` with no regressions
- **Committed in:** `f9edf1d` (Task 2 commit)

**2. [Rule 3 - Blocking] svgEl was missing from i18n-check.js's DOM-API exemption list**
- **Found during:** Task 2, same `--literals-js` run
- **Issue:** `svgEl('linearGradient', {...})`-style calls flagged their first string argument (`'linearGradient'`, `'defs'`, etc.) as untranslated prose, even though 06-02-PLAN.md's own P6 spec explicitly lists `svgEl` among the exempted first-argument functions (alongside `getElementById`, `createElement`, etc.) — the implementation simply never included it in the regex alternation.
- **Fix:** Added `svgEl` to `DOM_API_CALL_RE`'s alternation.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-check.js`
- **Verification:** `--literals-js` passes on Factor Tree with zero `svgEl`-argument findings
- **Committed in:** `f9edf1d`

**3. [Rule 1 - Bug] The all-lowercase class-name code heuristic didn't allow a trailing space**
- **Found during:** Task 2, same `--literals-js` run
- **Issue:** Factor Tree's SVG rendering concatenates a literal CSS class token with a trailing space directly onto a computed suffix (`'fairy-light '+lightClass`, `'node-circle '+node.kind`), but `looksLikeCode()`'s all-lowercase-hyphen-space pattern required the string to end immediately after the last letter, so the trailing space broke the match and these were flagged as untranslated prose.
- **Fix:** Added `\s*` before the pattern's end anchor.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-check.js`
- **Verification:** `--literals-js` passes on Factor Tree with zero class-concatenation findings
- **Committed in:** `f9edf1d`

**4. [Rule 1 - Bug] i18n-browser.js's stripI18nArtifacts() didn't strip data-i18n-params**
- **Found during:** Task 3, first `en-parity` run against Euler's Totient
- **Issue:** The regex stripping i18n-only markup artifacts for the en-parity comparison covered `data-i18n`, `data-i18n-title`, `data-i18n-aria-label` and `data-i18n-placeholder`, but not `data-i18n-params` — the first page in this phase to use `data-i18n-params` on static markup (the two "N · prime" chips) always failed en-parity because NEW carried an attribute OLD never had.
- **Fix:** Added `-params` to the attribute-name alternation.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-browser.js`
- **Verification:** `en-parity IDENTICAL snaps=13` on Euler's Totient; re-ran on index.html, the Sieve and Factor Tree with no regressions
- **Committed in:** `519d802` (Task 3 commit)

**5. [Rule 1 - Bug] The --mutant en-change self-test was hardcoded to the Sieve's own data-i18n key**
- **Found during:** Task 3, mutant self-test loop
- **Issue:** `MUTANT_SCRIPTS["en-change"]` targeted `document.querySelector('[data-i18n="sieve.lede"]')` — a selector that matches nothing on any page but the Sieve, so the mutation silently applied to zero elements and en-parity (correctly) reported no difference, printing `MUTANT-SURVIVED` on every other page.
- **Fix:** Generalized the selector to `[data-i18n]` (the first element on the page carrying any `data-i18n` attribute — every converted page has at least one).
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-browser.js`
- **Verification:** `MUTANT-DETECTED en-change` on Euler's Totient; re-ran on index.html, the Sieve and Factor Tree — all still detect correctly
- **Committed in:** `519d802`

**6. [Rule 1 - Bug] Euler's Totient's updateXrefLink() lost the lang= parameter on every buildRun() call**
- **Found during:** Task 3, first `switch` mode run
- **Issue:** `updateXrefLink(n)` set `xrefLink.href` directly from a template string, bypassing `nt-i18n.js`'s `decorateLinks()` (which only re-scans links already in the DOM at load/setLang time, not ones a page's own script sets afterward) — every call to `buildRun()` (on load, and on every Run/chip click) silently wiped the cross-link's `lang=` parameter, so a user's chosen language didn't survive a click.
- **Fix:** `updateXrefLink()` now appends `'&lang=' + getLang()` itself, mirroring `decorateLinks()`'s own contract; also re-invoked from the `onLangChange` callback so a language switch mid-session updates the link immediately.
- **Files modified:** `Eulers Totient/eulers-totient.html`
- **Verification:** `switch PASS points=2 langs=4` on Euler's Totient
- **Committed in:** `519d802`

**7. [Rule 3 - Blocking] Four Euler's Totient preset chips used named HTML entities (&sup2;/&middot;) i18n-check.js's markup scanner doesn't decode**
- **Found during:** Task 3, first `--literals-markup` run
- **Issue:** `i18n-check.js`'s tokenizer doesn't decode numeric/named entities beyond the handful of common ones, so `&sup2;`/`&middot;` left the letter runs "sup"/"middot" in the scanned text, which the prose heuristic correctly treats as words — flagging four pure-math chips ("12 · 2²·3", etc.) as untranslated markup even though they contain no actual prose.
- **Fix:** Replaced the named entities with their literal Unicode characters (² U+00B2, · U+00B7) directly in the markup — identical rendered output, no scanner change needed (the fifth chip, "16 · 2⁴", already used a literal character and was never flagged).
- **Files modified:** `Eulers Totient/eulers-totient.html`
- **Verification:** `--literals-markup` passes with zero findings on the four chips
- **Committed in:** `519d802`

---

**Total deviations:** 7 auto-fixed (6 Rule 1 bugs, 1 Rule 3 blocking-issue fix). Five of the seven are shared-infra fixes (`i18n-check.js` ×3, `i18n-browser.js` ×2) discovered only because this plan was the first to run the Phase 06-02 gate suite against pages with different code idioms than the Sieve (direct `document.getElementById`, `svgEl` calls, trailing-space class concatenation, `data-i18n-params` on static markup, a mutant self-test that only ever targeted the Sieve). **Impact on plan:** None on scope or architecture — every fix is either confined to the dev-only gate tooling or a genuine, narrowly-scoped production bug fix (the xref link's lost `lang=` parameter) that the plan's own `<threat_model>` and procedure already called for.

## Issues Encountered

None beyond the deviations above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Three more pages (index.html, Factor Tree, Euler's Totient) are fully proven reference implementations of the P1–P10 procedure, alongside the Sieve from 06-02.
- The five shared-infra fixes in `i18n-check.js` and `i18n-browser.js` are now available to every remaining wave-3 plan (06-04 through 06-11), several of which are likely to hit the same gaps (direct `getElementById` calls, `svgEl` usage, concatenated CSS class names, `data-i18n-params` on static markup) given this codebase's established per-tool coding idioms.
- `i18n-config/eulers-totient.json` is a second worked example (after the Sieve's) of `allowLiteral` + `switchPoints` usage.
- Outstanding for end-of-phase UAT: none newly introduced by this plan — the human-review items already on record from 06-01/06-02 (switcher legibility/two-tab sync/Firefox cookie persistence; 06-GLOSSARY.md terminology review) remain the only outstanding human checks for this phase, since none of this plan's three tasks carry their own `<human-check>`.

---
*Phase: 06-multi-language-support*
*Completed: 2026-10-01*

## Self-Check: PASSED

- All 10 claimed files found on disk (4 created, 5 modified, this SUMMARY itself).
- All 3 claimed commits found in `git log` (`bd61892`, `f9edf1d`, `519d802`).
- Re-ran all verification commands fresh immediately before writing this SUMMARY:
  - `node i18n-check.js index.html` / `"Factor Tree/factor-tree.html"` / `"Eulers Totient/eulers-totient.html"` — 6/6 PASS on each
  - `node shadow-check.js` on all three pages — SHADOW-CHECK PASS on each; `shadow-check.js --all` — PASS on all 15 tool pages
  - `node harness.js` — HARNESS PASS total=2856003, zero FAIL
  - `node i18n-browser.js` on all three pages — ALL PASS (index snaps=1, factor-tree snaps=29, eulers-totient snaps=13)
  - `node i18n-browser.js "Eulers Totient/eulers-totient.html" --mutant {untranslated,stale-switch,en-change,overflow}` — 4/4 MUTANT-DETECTED
  - `node i18n-check.js --api` (122) / `--persistence` (71) — both PASS, no regression
  - `grep -n toLocaleString "Eulers Totient/eulers-totient.html"` — no matches (replaced by NT.bigint.fmt)
