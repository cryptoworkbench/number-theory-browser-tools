---
phase: 06-multi-language-support
plan: 01
subsystem: i18n
tags: [i18n, nt-i18n, localization, sieve-of-eratosthenes, site-chrome, persistence]

# Dependency graph
requires:
  - phase: 07-shared-js-module-refactor
    provides: "the assets/nt-*.js classic-script, frozen-namespace module pattern and harness.js's vm/stub testing conventions that nt-i18n.js and i18n-check.js follow"
provides:
  - "assets/nt-i18n.js: the frozen, locked NT.i18n module every later Phase 6 plan builds on — language resolution (URL > cookie > localStorage > detectDefaultLang), translate/translateInto/bindText/applyStaticDom, the nt-i18n:change event, link decoration, and durable persistence under the site-lang key"
  - "The canonical i18n header markup/contract (data-i18n*, #lang-switch-select) proven end-to-end on one real tool page"
  - "assets/i18n/site.js (site namespace) and assets/i18n/sieve-of-eratosthenes.js (sieve namespace) as the first two dictionary data files"
  - ".planning/phases/06-multi-language-support/i18n-check.js with --smoke, --api and --persistence dev-only validation modes, reusable by every later Phase 6 plan"
affects: ["06-02", "06-03", "all remaining Phase 6 tool-migration plans"]

# Actuals (#2632)
actuals:
  tokens: 23496
  tasks: 3
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Sixth shared JS module (assets/nt-i18n.js) added to the classic-script, frozen-namespace, locked-slot pattern established in Phase 7"
    - "Per-page i18n dictionary files under assets/i18n/ (one per namespace), each a plain NT.i18n.register(ns, dict) call"
    - "Durable site-wide preference persistence (localStorage-first, then cookie, matching assets/theme.js exactly) now has a second precedent (site-lang) beside site-theme"
    - "Dev-only Node/headless-Chrome validation script (i18n-check.js) combining a vm-loaded unit-test harness (reusing Phase 7's harness.js stubs) with a real-browser smoke/cross-session probe"

key-files:
  created:
    - assets/nt-i18n.js
    - assets/i18n/site.js
    - assets/i18n/sieve-of-eratosthenes.js
    - .planning/phases/06-multi-language-support/i18n-check.js
  modified:
    - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
    - assets/site.css

key-decisions:
  - "Task 2 (checkpoint:decision, auto_select=option-a, non-blocking gate): the persisted site-wide language key is `site-lang`, a raw two-letter code, owned entirely by assets/nt-i18n.js and mirroring assets/theme.js's site-theme key exactly (same cookie attributes, same URL > cookie > localStorage > default read order). The human explicitly selected option-a for this continuation; recorded here per the plan's own acceptance criteria for Task 2."
  - "TDD RED evidence for Task 3 was verified manually (git stash of the implementation, confirming both --api and --persistence genuinely fail on the planned behavior — not a crash — then restored and re-run GREEN) rather than through `gsd_run check tdd-red-evidence`, because that validator expects TAP-formatted test output and this project's established test convention (harness.js from Phase 7, reused unchanged by this plan's own Task 1) is a custom eq()-assertion script, not node:test/TAP. workflow.tdd_mode is also not enabled in this project's config.json."

patterns-established:
  - "NT.i18n contract (SUPPORTED_LANGS, LANG_STORAGE_KEY, applyStaticDom, bindText, detectDefaultLang, getLang, onLangChange, register, setLang, translate, translateInto) is now load-bearing for every remaining Phase 6 plan — see the plan's own 'NT.i18n contract' section for the full normative spec."
  - "applyLang(lang) factors the apply-and-notify path (html lang, static DOM, links, switcher value, one nt-i18n:change event) shared between setLang() (which persists first) and the storage-event listener (which never persists)."

requirements-completed: [I18N-01, I18N-02, I18N-04, I18N-06]

coverage:
  - id: D1
    description: "On the Sieve of Eratosthenes, a visitor switches among all five languages via the header select, and the brand, all 16 nav links, title, heading, lede and the dynamically-rendered banner follow without a reload, with grid/counter state preserved"
    requirement: "I18N-01"
    verification:
      - kind: e2e
        ref: "node .planning/phases/06-multi-language-support/i18n-check.js --smoke (headless Chrome, 123 assertions, mutant-detection proof)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The language choice is resolved URL > cookie > localStorage > browser default, persisted under site-lang on an explicit choice only, and a storage event in another tab re-applies it without re-persisting"
    requirement: "I18N-02"
    verification:
      - kind: unit
        ref: "node .planning/phases/06-multi-language-support/i18n-check.js --api (122 assertions)"
        status: pass
      - kind: unit
        ref: "node .planning/phases/06-multi-language-support/i18n-check.js --persistence (71 assertions)"
        status: pass
      - kind: e2e
        ref: "node .planning/phases/06-multi-language-support/i18n-check.js --smoke cross-session run (?lang=de then a plain URL, shared Chrome profile)"
        status: pass
    human_judgment: false
  - id: D3
    description: "?lang= links on the page carry the choice forward (other parameters/hash untouched); the switcher is legible in both themes, shares the header's first row at phone width, and genuinely syncs between two real browser tabs; Firefox's per-file file:// cookie channel persists the choice across a real close/reopen"
    requirement: "I18N-04"
    verification: []
    human_judgment: true
    rationale: "Link decoration's structural correctness is proven by --api/--smoke, but real two-tab live sync, visual legibility in both themes at narrow width, and Firefox's file:// cookie behavior require a human with two real browsers — exactly the plan's own Task 3 <human-check>, harvested at end-of-phase UAT per workflow.human_verify_mode=end-of-phase."

duration: 33min (this continuation; Task 1 was completed in a prior session)
completed: 2026-10-01
status: complete
---

# Phase 06 Plan 01: Multi-Language Support Tracer Summary

**NT.i18n ships as the site's sixth shared JS module, proven end-to-end on the Sieve of Eratosthenes, with durable `site-lang` persistence (localStorage + cookie, mirroring `site-theme`), cross-tab sync, and a themed header switcher.**

## Performance

- **Duration:** 33 min (this continuation session; Task 1 — the tracer — was completed in a prior session, commit `8cafd77`)
- **Started:** 2026-10-01T09:38:33Z (session marker) / this continuation resumed at Task 2
- **Completed:** 2026-10-01T10:11:48Z
- **Tasks:** 3 (all complete)
- **Files modified:** 6 (4 created, 2 modified)

## Accomplishments

- `assets/nt-i18n.js` ships as the repo's sixth shared JS module: frozen `window.NT.i18n` with a locked slot, exporting `SUPPORTED_LANGS`, `LANG_STORAGE_KEY`, `applyStaticDom`, `bindText`, `detectDefaultLang`, `getLang`, `onLangChange`, `register`, `setLang`, `translate`, `translateInto`.
- The Sieve of Eratosthenes page proves the whole pipeline end-to-end: canonical i18n header (brand, 16 nav links, language select), `data-i18n`-driven title/heading/lede, and a JS-rendered banner (ready/single/reset/done, including a plural `banner.done`) that re-renders on language change without disturbing the sieve's grid, counters or progress.
- Task 2 decision: the persisted site-wide language key is `site-lang` (raw two-letter code), owned entirely by `assets/nt-i18n.js`, mirroring `assets/theme.js`'s `site-theme` key exactly.
- Durable persistence implemented: an explicit load-time or user choice is written to `localStorage` first, then the cookie `site-lang=<code>;path=/;max-age=31536000;samesite=lax`; a detected browser default is never written. A `storage` event for `site-lang` re-applies the language in another open tab without re-persisting; events for any other key (including `site-theme`) are ignored. The `lang=` URL parameter is stripped from the address bar after load, leaving every other parameter and the hash intact.
- `.lang-switch` header styling added to `assets/site.css` (var()-only colors), sitting between the nav and the day/night toggle, sharing the existing 760px breakpoint.
- `.planning/phases/06-multi-language-support/i18n-check.js` now has three working modes: `--smoke` (headless-Chrome end-to-end probe, extended this plan with a cross-session run proving the localStorage channel survives a fresh navigation), `--api` (122 vm-loaded unit assertions against the full exported API surface), `--persistence` (71 vm-loaded unit assertions against the URL/cookie/localStorage precedence, write order/format, cross-tab sync and URL stripping).

## Task Commits

Each task was committed atomically:

1. **Task 1: Tracer — Sieve of Eratosthenes switches language end-to-end** — `8cafd77` (feat) — completed in a prior session
2. **Task 2: Decide the persisted site-wide language key** — checkpoint:decision, resolved `option-a` by explicit human selection; no production code commit (decision recorded in this SUMMARY per the task's own acceptance criteria)
3. **Task 3 (TDD): Language choice survives sessions/tabs; switcher styled; unit gates** — `b74b33c` (test, RED) then `99b3d36` (feat, GREEN)

**Plan metadata:** this commit (docs: complete plan)

_TDD note: Task 3 followed RED → GREEN. RED was verified manually (git stash of the uncommitted implementation, confirming both `--api` and `--persistence` fail on genuine assertion mismatches tied to the planned behavior — missing `LANG_STORAGE_KEY` export, cookie/localStorage channels not yet read — not crashes) rather than via `gsd_run check tdd-red-evidence`, since that validator expects TAP output and this project's test convention (Phase 7's `harness.js`, reused unchanged by Task 1) is a custom `eq()`-assertion format; `workflow.tdd_mode` is also not enabled in this project. No REFACTOR commit was needed — the implementation passed GREEN with only test-harness bug fixes (see Deviations)._

## Files Created/Modified

- `assets/nt-i18n.js` — NT.i18n engine: resolution, persistence, translate/translateInto/bindText/applyStaticDom, nt-i18n:change event, link decoration
- `assets/i18n/site.js` — `site` namespace dictionary (brand, nav × 16, lang.label, theme.toggle) in all five languages
- `assets/i18n/sieve-of-eratosthenes.js` — `sieve` namespace dictionary (title, heading, lede, banner.ready/single/reset/done)
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` — canonical header, `data-i18n` markup, three script includes, `bannerState`/`renderBanner()`
- `assets/site.css` — `.lang-switch` / `.lang-switch-icon` / `.lang-switch select` rules
- `.planning/phases/06-multi-language-support/i18n-check.js` — `--smoke`, `--api`, `--persistence` dev-only validation modes

## Decisions Made

- **Task 2 decision:** `option-a` — `site-lang`, raw two-letter code, owned by `assets/nt-i18n.js`, mirroring `assets/theme.js`'s `site-theme` pattern exactly (same cookie attributes, same URL → cookie → localStorage → default read order, no coupling to `theme.js` or `NT.store`). Selected via explicit human instruction in this continuation's dispatch (`auto_select="option-a"` also named it as the plan's own recommendation).
- **TDD RED verification approach:** manual git-stash verification instead of the formal `gsd_run check tdd-red-evidence` TAP validator (see Task Commits note above and Deviations).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed three bugs in the --api/--persistence test harness itself, found while turning the suites GREEN**
- **Found during:** Task 3, GREEN phase
- **Issue:** (a) `attachCookieJar` copied `harness.js`'s cookie-descriptor verbatim, which defaults to non-configurable — the order-tracking re-wrap in `loadI18n` then threw `TypeError: Cannot redefine property: cookie`. (b) A cookie-seed write performed through the already-wrapped `doc.cookie` setter polluted the write-order log, making a later "storage before cookie" assertion read the seed's cookie entry instead of the module's real write. (c) `"detected default is not written to storage"` counted every `_storage._log` entry (including `fromStorage()`'s own read during resolution), not just writes.
- **Fix:** (a) force `configurable: true` when copying the cookie descriptor; (b) moved cookie seeding to before the order-tracking wrap is installed; (c) filtered the log for `"set"` entries before counting.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-check.js`
- **Verification:** `--api` and `--persistence` both pass cleanly after the fixes (122 and 71 assertions)
- **Committed in:** `99b3d36` (feat commit — these are test-infrastructure fixes bundled with the implementation, not production code changes)

**2. [Rule 1 - Bug] Fixed one incorrect test assertion**
- **Found during:** Task 3, GREEN phase
- **Issue:** `"translate falls back to en when fr lacks the key"` used `t.count`, but the French dict for the synthetic test namespace already defines `count` (added later for the plural tests) — the assertion was checking a key that wasn't actually missing from French, so it measured the wrong thing.
- **Fix:** switched the assertion to `t.rich`, a key genuinely present only in the English dict.
- **Files modified:** `.planning/phases/06-multi-language-support/i18n-check.js`
- **Verification:** assertion now exercises a real en-fallback case and passes
- **Committed in:** `99b3d36`

---

**Total deviations:** 2 auto-fixed (both Rule 1, both confined to the dev-only test script — no production `nt-i18n.js`/`site.css` behavior was changed by either fix)
**Impact on plan:** None on scope; both fixes were necessary for the test suites to correctly prove what they claim to prove.

## Issues Encountered

- No `.planning`-side commit ledger (`gsd-plan-head-before-06-01`) existed from the prior session's Task 1 execution; created it retroactively pointing at `8cafd77^` (the commit immediately preceding Task 1's) so `commits:` in this SUMMARY's frontmatter is measured, not narrated, per the executor's standard protocol.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- The `NT.i18n` contract (resolution, persistence, rendering, DOM attributes, header markup) is now proven end-to-end on one real tool and is ready for Wave 2+ plans (06-02 completes the Sieve's remaining strings and the shared `common` namespace; later plans migrate the other 14 tool pages plus `index.html`).
- `i18n-check.js`'s `loadCatalog()`, `--api`/`--persistence` vm harness, and `--smoke` scratch-site pattern are reusable as-is by later plans needing their own page-specific smoke checks.
- Outstanding for end-of-phase UAT: Task 3's `<human-check>` (switcher legibility in both themes at phone width, real two-tab live sync, Firefox file:// cookie persistence across a close/reopen) — not exercised by this executor per `workflow.human_verify_mode=end-of-phase`; harvested at phase verification.

---
*Phase: 06-multi-language-support*
*Completed: 2026-10-01*

## Self-Check: PASSED

- All 7 claimed files found on disk (`assets/nt-i18n.js`, `assets/i18n/site.js`, `assets/i18n/sieve-of-eratosthenes.js`, `Sieve Of Eratosthenes/sieve-of-eratosthenes.html`, `assets/site.css`, `.planning/phases/06-multi-language-support/i18n-check.js`, this SUMMARY)
- All 3 claimed commits found in `git log` (`8cafd77`, `b74b33c`, `99b3d36`)
- Re-ran all acceptance-criteria/verification commands fresh: `node --check` on all four JS files (pass), `--api` (122 assertions, pass), `--persistence` (71 assertions, pass), `--smoke` (123 assertions + cross-session run, pass — run earlier in this session, see Task 3 verification log)
- `grep -c "LANG_STORAGE_KEY" assets/nt-i18n.js` = 7 (≥3 required); `grep -c "'site-lang'" assets/nt-i18n.js` = 1 (required); no literal colors in the new `.lang-switch` CSS rules
