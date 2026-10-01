---
phase: 06-multi-language-support
plan: 11
subsystem: i18n
tags: [i18n, nt-i18n, nt-bigint, localization, rsa, dom-construction, crt]

# Dependency graph
requires:
  - phase: 06-multi-language-support
    provides: "06-01's NT.i18n contract and canonical header; 06-02's shared `common` vocabulary, 06-GLOSSARY.md terminology/tone contract, the per-page translation procedure (P1-P10), i18n-check.js's static gate suite, i18n-browser.js's runtime gate suite, and shadow-check.js's NT.i18n-aware convention gate; 06-09/06-10's worked precedents for errorState/bannerState tracking and for 'retranslate in place, never rebuild a stateful section' on a language switch"
provides:
  - "RSA fully translated into all five languages — the by-far-largest body of prose on the site (~17,500 English characters): static narrative, Bob's and Alice's key-generation walkthroughs, the wire, Eve's factoring/discrete-log attacks, and the encrypted correspondence (encrypt/decrypt tables, CRT-assisted decryption)"
  - "assets/i18n/rsa.js ('rsa' namespace, ~150 keys) data file"
  - "A worked precedent for a page whose dynamic sections split into two kinds that need opposite switch-time treatment: purely-derived sections (renderExchange, safe to re-invoke wholesale since it only ever reads LastExchange/CrtFlag/State) vs. destructively-rebuilt sections (renderEve/renderMessages, which must never run again on a switch because they wipe EveFactorRes/DlpRes/typed-message state) — the latter's Node-param translateInto calls are tracked in a page-level EveStaticRefs closure list and replayed individually instead"
  - "A second resolution (after 06-09/06-10's order(g)/ord(G) fix) of the 'camelCase label word stays byte-identical across every language' collision class: qInv (not a real word, unlike order/ord) is resolved via an allowSame/allowRenderText exemption pair rather than a translated-word fix, since there is no natural-language equivalent to translate"
affects: ["06-12"]

# Actuals (#2632)
actuals:
  tokens: 35109
  tasks: 3
  commits: 3

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Two-tier switch-safety classification for a page's dynamic sections: a section whose render function is a PURE function of already-persisted state (renderExchange, reading only LastExchange/CrtFlag/State) is safe to re-invoke wholesale in onLangChange; a section whose render function has DESTRUCTIVE side effects on call (renderEve/renderMessages, which reset EveFactorRes/DlpRes/typed-message inputs as part of mirroring the pre-existing 'regenerating a keypair wipes this step' behavior) must never be re-invoked from onLangChange — its Node-param translateInto calls are tracked individually instead"
    - "EveStaticRefs: a page-level array of zero-arg closures, each one wrapping exactly one translateInto call (with the Node params it needs recreated and captured by the closure); renderEveStaticRefresh() replays all of them on a language switch without touching the sibling result containers or the result-tracking state objects those closures' DOM lives beside"
    - "Prefer bindText over translateInto whenever a translated node's params are all strings/numbers/BigInts (no Node/element params) — bindText's own data-i18n/data-i18n-params attributes make the node self-refresh automatically on every future language change via applyStaticDom, eliminating the need to track it for onLangChange at all; translateInto (and the resulting manual re-render bookkeeping) is reserved for the genuine case where a sentence must wrap an element (a <strong>, <sup>, <sub>, <em> child)"
    - "qInv-class collision resolution: a camelCase identifier (dP, dQ, qInv) that is not a real word in any language cannot be fixed by 06-09/06-10's 'translate the word' trick (order -> orderLabel, ord -> ordWord) because there is no linguistic equivalent to translate — the correct fix is a documented allowSame (dictionary) + allowRenderText (runtime) exemption pair, the same mechanism this project already uses for gcd/mod notation, just applied to a page-invented abbreviation instead of a mathematical one"
  key-files:
    created:
      - assets/i18n/rsa.js
      - .planning/phases/06-multi-language-support/i18n-config/rsa.json
    modified:
      - RSA/rsa.html

key-decisions:
  - "renderExchange(toId) is called directly (not specially tracked) from onLangChange whenever LastExchange[toId] exists — it is purely derived from LastExchange/CrtFlag/State, none of which a language switch touches, so re-running it produces the byte-identical numbers/structure in the new language and naturally preserves the CRT toggle's checked state exactly as it already does on every toggle change"
  - "renderEve()/renderMessages() are never re-invoked from onLangChange, because both reset their own result/error-tracking state at the top of the function (EveFactorRes/DlpRes to null; MsgErrorState to null) to mirror the pre-existing 'regenerating a keypair wipes this step' behavior — calling them again on a switch would silently wipe Eve's results and the typed message/CRT state the plan's must-haves require to survive it"
  - "qInv is resolved via allowSame + allowRenderText exemptions (treated like the project's existing gcd/mod notation) rather than a translated-word fix, since qInv is a page-invented camelCase label (unlike 'order'/'ord', which are real English words with real per-language translations) — there is no natural-language equivalent to translate"
  - "Eve's result boxes (factor-attempt win/giveup, DLP found-x) cache the raw computed result object (EveFactorRes/DlpRes) rather than recomputing on every language switch — recomputation would re-run bruteFactorEve()'s potentially-expensive trial-division loop and produce a different elapsed-ms reading on every switch; caching keeps the switch both instant and numerically exact"
  - "The one plain-text (non-span) match phrase inside 'Recovered message {0} the original ({1}).' is rendered via translate() + createTextNode rather than translateInto + a <span> wrapper, matching the original markup's bare-text concatenation exactly (unlike the two crt-check lines earlier in the same function, which DO have a <span class=\"crt-check\"> wrapper in the original and keep one)"

requirements-completed: [I18N-01, I18N-02, I18N-03, I18N-05, I18N-06]

coverage:
  - id: D1
    description: "The RSA page's narrative — intro, five step sections, field labels, buttons, lock notes, footer and pill bar, the public-key scratchpad — reads in the active language"
    requirement: "I18N-01"
    verification:
      - kind: unit
        ref: "node i18n-check.js --coverage --header --includes --no-locale-number-format --literals-markup RSA/rsa.html (5/5 PASS)"
        status: pass
      - kind: unit
        ref: "node shadow-check.js RSA/rsa.html (SHADOW-CHECK PASS)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Bob's and Alice's key-generation walkthroughs (modulus, totient, choosing e with its table, extended Euclid table, private exponent, key cards), the wire section and validation errors read in the active language; formulas, tables' numbers and key material are unchanged in every language"
    requirement: "I18N-02, I18N-03, I18N-06"
    verification:
      - kind: unit
        ref: "node i18n-check.js RSA/rsa.html (6/6 static modes PASS, incl. literals-js)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js RSA/rsa.html --mode en-parity (IDENTICAL snaps=14)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Eve's factoring attempts, the discrete-log aside, and the encrypted correspondence (encrypt/decrypt tables, CRT-assisted decryption toggles) read in the active language; switching language after any amount of interaction keeps generated keys, typed messages, sent messages, CRT toggle states, Eve's results and the scratchpad's reveal state; with English active the page renders exactly as before this phase"
    requirement: "I18N-02, I18N-03, I18N-05, I18N-06"
    verification:
      - kind: e2e
        ref: "node i18n-browser.js RSA/rsa.html (en-parity IDENTICAL snaps=14; langs PASS snaps=14 langs=4; switch PASS points=3 langs=4 [bob-sends, crt-alice-on, eve-bob]; layout PASS; ALL PASS)"
        status: pass
      - kind: e2e
        ref: "node i18n-browser.js RSA/rsa.html --mutant {untranslated,stale-switch,en-change,overflow} (4/4 MUTANT-DETECTED)"
        status: pass
      - kind: unit
        ref: "node i18n-check.js RSA/rsa.html (6/6 static modes PASS, zero UNTRANSLATED-JS/INNERHTML-PROSE findings)"
        status: pass
    human_judgment: true
    rationale: "The plan's own Task 3 human-check (generate both keypairs, send a message, toggle CRT, run Eve's factoring attempt, switch to Nederlands and scroll back up) depends on real scrolling and viewport geometry for the pinned public-key scratchpad's scroll-triggered reveal — not exercised by the headless snapshot steps. Harvested at end-of-phase UAT per workflow.human_verify_mode=end-of-phase, same as the outstanding human-checks already on record from 06-01/06-02/06-04."
  - id: D4
    description: "shadow-check and harness remain green across all 15 tool pages after this plan"
    requirement: "I18N-01 (convention gate)"
    verification:
      - kind: unit
        ref: "node shadow-check.js --all (SHADOW-CHECK PASS on all 15 tool pages)"
        status: pass
      - kind: unit
        ref: "node harness.js (HARNESS PASS total=2856003)"
        status: pass
    human_judgment: false

duration: single session (commit span e9ef563..a24985b)
completed: 2026-10-01
status: complete
plan_head_before: b149d06632e383fb26bee49049e64763273fc43c
plan_head_after: a24985b40fe8664c52c8d89b60ed1c71ad28d8be
---

# Phase 06 Plan 11: RSA Translation Summary

**The RSA tool — Bob's and Alice's key generation, the wire, Eve's factoring and discrete-log attacks, and the encrypted correspondence with CRT-assisted decryption — now reads completely in Dutch/English/German/French/Spanish, with every innerHTML narrative builder rebuilt as DOM construction and a language switch that re-renders results, hints and the in-progress exchange in place without ever recomputing a brute-force attempt or losing typed messages, CRT toggle state, or generated keys.**

## Performance

- **Duration:** single session (git commit span `e9ef563`..`a24985b`); reading the plan and seven context files (06-01/06-02 PLANs, 06-GLOSSARY.md, the Sieve reference page, and the Diffie-Hellman Key Exchange page's full source as the closest sibling's worked DOM-construction/onLangChange precedent), drafting the ~150-key `rsa` dictionary across five languages, converting roughly 580 lines of template-literal `innerHTML` builders to DOM construction across three tasks, and iterating through several rounds of static/runtime gate failures (detailed below) took considerably longer than the commit-to-commit span alone suggests.
- **Tasks:** 3 (all complete)
- **Files modified:** 3 (2 created, 1 modified — excluding this SUMMARY)

## Accomplishments

- **Static narrative and controls** (Task 1): canonical i18n header with the five-language switcher; new `assets/i18n/rsa.js` `rsa` namespace — title/heading/lede, the intro panel's two rich-form paragraphs (strong Bob/Alice/Eve children, an em "textbook RSA" child), all five step headings and their `.sub` notes (rich form where they hold an em), the Prime p/Prime q field labels, the per-person "Generate {name}'s Keypair" button, the three lock notes, the footer line and three pills, the scratchpad title. The script carries no IIFE (pre-existing), so the `NT.i18n` import sits directly under the existing `NT.bigint` import, starting with just `onLangChange` and a forward-declared scaffold callback that Tasks 2 and 3 extend.
- **Key generation and the wire** (Task 2): `generateKeys`'s validation errors and `chooseE`'s per-candidate notes now carry dictionary keys via an `ErrorState { key, params }` pattern (mirroring Diffie-Hellman Key Exchange's precedent). `renderKeyOutput` and `renderWire` are rebuilt as DOM construction — every pure-text node uses `bindText` (so it re-renders itself automatically on a language switch via the engine's own `applyStaticDom`, with zero `onLangChange` bookkeeping needed), and `translateInto` is reserved for the wire notebook's one Node-param sentence (the bold "not"), tracked via plain `wireNeverEl`/`wireNotStrongEl` refs and a dedicated `renderWireNever()` re-render function.
- **Eve's attacks and the encrypted correspondence** (Task 3): `renderEve`, `runFactorAttempt`, `runDlpDemo`, `renderMessages`, `renderModPowTable` (now `buildModPowTable`, returning a DOM fragment instead of an HTML string), `sendMessage` and `renderExchange` are all converted from template-literal `innerHTML` to DOM construction, preserving every id/class/input/button/listener and producing the byte-identical English DOM. `EveFactorRes`/`DlpRes` cache the raw computed result (never recomputed on switch — recomputation would re-run a potentially-expensive trial-division loop and produce a different elapsed-ms reading every time); `MsgErrorState`/`MsgHintEl` track the two message blocks' error text and rich hint sentence. `renderExchange` is simply re-invoked wholesale from `onLangChange` (it is a pure function of `LastExchange`/`CrtFlag`/`State`, none of which a switch touches), while `renderEve`/`renderMessages` are never re-invoked (they reset `EveFactorRes`/`DlpRes`/`MsgErrorState` to mirror the pre-existing "regenerating a keypair wipes this step" behavior) — their Node-param `translateInto` calls are instead tracked in a page-level `EveStaticRefs` closure list, replayed by `renderEveStaticRefresh()`.
- **A second resolution of the "camelCase label stays byte-identical across languages" collision class** (after 06-09's `order(g)`/06-10's `ord(G)`): `qInv` (the page's own invented abbreviation, paired with `dP`/`dQ`) cannot be fixed by translating a word — there is no linguistic equivalent, unlike "order"/"ord" — so it is resolved via a documented `allowSame` (dictionary) + `allowRenderText` (runtime) exemption pair, the same mechanism this project already uses for `gcd`/`mod` math notation.

## Task Commits

Each task was committed atomically:

1. **Task 1: The RSA narrative, controls and scratchpad read in all five languages** — `e9ef563` (feat)
2. **Task 2: Bob's and Alice's key generation and the wire read in all five languages without disturbing generated keys** — `4a4e9ab` (feat)
3. **Task 3: Eve's attacks and the encrypted correspondence read in all five languages; a switch keeps messages, toggles and results** — `a24985b` (feat)

**Plan metadata:** this commit (docs: complete plan)

## Files Created/Modified

- `assets/i18n/rsa.js` — new, `rsa` namespace (~150 keys across all three tasks: static narrative/controls; validation errors, chooseE notes, key-output/wire labels; Eve's attack results, DLP, message/wire/CRT-decryption narrative, a plural `resGiveupBody` entry) in nl/en/de/fr/es
- `.planning/phases/06-multi-language-support/i18n-config/rsa.json` — new, `allowSame`/`allowRenderText` for genuine cross-language cognates (`bit`, `expression`, `direct`) and for the `qInv` abbreviation; `allowLiteral` for DOM-id string-concatenation prefixes and one notation-only JS literal; `volatile` for the elapsed-ms pattern; `switchPoints: ["bob-sends", "crt-alice-on", "eve-bob"]`
- `RSA/rsa.html` — canonical header, data-i18n on all static markup, `nt-i18n.js`/`site.js`/`rsa.js` includes, `ErrorState`/`MsgErrorState`/`MsgHintEl`/`EveFactorRes`/`DlpRes`/`EveStaticRefs` tracking, every `innerHTML` narrative builder converted to DOM construction with `bindText`/`translateInto`, `renderWireNever`/`renderEveStaticRefresh`/`renderFactorResultBox`/`renderDlpResultBox`/`renderMsgHint`/`renderMsgError` re-render helpers, one `onLangChange` registration built incrementally across all three tasks

## Decisions Made

See `key-decisions` in the frontmatter above: `renderExchange` re-invoked directly from `onLangChange` (pure function of persisted state); `renderEve`/`renderMessages` never re-invoked (destructive resets); `qInv` resolved via exemption pair rather than a translated-word fix; Eve's results cached rather than recomputed; the one bare-text match phrase kept text-node-only (no `<span>` wrapper) to match the original markup exactly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `tableRows`'s string-returning helper had to be temporarily kept alongside the new DOM-based `buildTableBody` mid-Task-2, since Task 3's still-unconverted `runDlpDemo`/`renderModPowTable` called it**
- **Found during:** Task 2, first `en-parity` run (`NEW-ERRORS ReferenceError: tableRows is not defined`)
- **Issue:** Removing the legacy `tableRows(rows)` helper as part of converting `renderKeyOutput` broke `runDlpDemo`'s still-unconverted call site, since Task 2's own scope (per the plan) does not include Task 3's functions.
- **Fix:** Re-added `tableRows` temporarily (documented as "retained for the still-unconverted Task 3 table builders") alongside the new `buildTableBody`; removed it outright once Task 3 converted its last two callers.
- **Files modified:** `RSA/rsa.html`
- **Verification:** `en-parity IDENTICAL` on re-run; `tableRows` fully removed by the Task 3 commit (confirmed via `grep -n "tableRows(" RSA/rsa.html` returning zero matches)
- **Committed in:** `4a4e9ab` (Task 2), removed in `a24985b` (Task 3)

**2. [Rule 1 - Bug] `<tr>` rows built via DOM construction omitted the empty `class=""` attribute the original template literal always produced, breaking en-parity**
- **Found during:** Task 2, first `en-parity` run
- **Issue:** The original `tableRows` template always wrote `class="${r.cls||''}"` (producing `class=""` when `r.cls` is falsy); the DOM-construction rewrite only set `tr.className` when `r.cls` was truthy, omitting the attribute entirely in that case — an unplanned DOM-shape change.
- **Fix:** `tr.className = r.cls || '';` unconditionally, reproducing the original's always-present (possibly empty) attribute.
- **Files modified:** `RSA/rsa.html`
- **Verification:** `en-parity IDENTICAL` on re-run
- **Committed in:** `4a4e9ab`

**3. [Rule 1 - Bug] A typographic apostrophe in one freshly-drafted English dictionary value broke en-parity**
- **Found during:** Task 2, first `en-parity` run
- **Issue:** `rsa.introP1`'s English value used a typographic `'` (`you'll`, `she's`) instead of the straight ASCII apostrophe the pre-phase markup actually shipped, producing a one-character `DIFF`.
- **Fix:** Rewrote the English value with straight apostrophes throughout, matching the pre-phase source exactly (06-GLOSSARY.md's typographic-apostrophe preference applies to *new* non-English text, never to the English source-of-truth, which must stay byte-identical).
- **Files modified:** `assets/i18n/rsa.js`
- **Verification:** `en-parity IDENTICAL` on re-run
- **Committed in:** `4a4e9ab`

**4. [Rule 1 - Bug] `--coverage`'s IDENTICAL-TO-EN caught two drafting slips and two genuine cross-language collisions in Task 3's dictionary additions**
- **Found during:** Task 3, first `i18n-check.js --coverage` run
- **Issue:** (a) Dutch `rsa.thCoprime`/`rsa.crtDirectVsLine`/`rsa.thBitNum` were accidentally left as literal English copies during drafting; (b) `rsa.thBit` ("bit") is a genuine cognate identical in Dutch/French/Spanish, `rsa.thExpression` identical in French, and `rsa.lblQInv`/a since-removed `rsa.lblHFormula` key both centered on the invented `qInv` abbreviation, which has no translation in any language.
- **Fix:** Corrected the three drafting slips with genuinely distinct translations (`copriem?`, `rechtstreeks`, `bit nr.`); added `allowSame` exemptions for the two genuine cognates and for `qInv`.
- **Files modified:** `assets/i18n/rsa.js`, `.planning/phases/06-multi-language-support/i18n-config/rsa.json`
- **Verification:** `--coverage` passes cleanly
- **Committed in:** `a24985b`

**5. [Rule 1 - Bug] The never-called `rsa.lblHFormula` dictionary key existed only to satisfy an IDENTICAL-TO-EN finding that had no corresponding runtime call site**
- **Found during:** Task 3, while resolving deviation #4
- **Issue:** The "h = qInv·(m1 − m2) mod p =" formula label was actually rendered via a plain `textContent` assignment (matching Task 2's precedent for notation-only strings), never through `translate`/`translateInto` — so the dictionary key drafted for it was dead weight, flagged by the static scanner purely because it existed in the dictionary, not because it was displayed.
- **Fix:** Deleted the unused key from all five language blocks; the actual literal JS string ("h = qInv·(m1 − m2) mod p =", flagged by `--literals-js` for the same `qInv` reason) is exempted via `allowLiteral`/`allowRenderText` instead, consistent with how Task 2 treated other notation-only literals.
- **Files modified:** `assets/i18n/rsa.js`, `.planning/phases/06-multi-language-support/i18n-config/rsa.json`
- **Verification:** `--coverage`/`--literals-js` pass cleanly with zero UNUSED-KEY-adjacent noise
- **Committed in:** `a24985b`

**6. [Rule 1 - Bug] `<input>` elements built via `.value = …` lost their `value` HTML attribute, and a checkbox's `.checked = true` lost its `checked` attribute, both breaking en-parity**
- **Found during:** Task 3, `en-parity` runs on `alice-keys` and `crt-alice-on`
- **Issue:** Setting the `.value`/`.checked` IDL properties on a freshly created `<input>` does not reflect back into the serialized content attribute the way the original static-markup `value="42"`/`${useCrt ? 'checked' : ''}` did — an unplanned DOM-shape change invisible in the live DOM but visible in the snapshot's `outerHTML`.
- **Fix:** Used `input.setAttribute('value', defaultValue)` and `toggleInput.setAttribute('checked', '')` instead, reproducing the original's exact serialized attributes.
- **Files modified:** `RSA/rsa.html`
- **Verification:** `en-parity IDENTICAL` on re-run
- **Committed in:** `a24985b`

**7. [Rule 1 - Bug] Two formula lines accidentally gained a `<span>` wrapper the original markup never had, and one lost a literal em-dash separator**
- **Found during:** Task 3, `en-parity`/further runs on `bob-sends`/`crt-alice-on`
- **Issue:** The "Recovered message {0} the original (…)." line and the "matches original message (…):" line were both originally bare-text concatenation (no wrapper element) around the match/mismatch phrase, but the DOM-construction rewrite wrapped them in `<span>` elements for convenience; separately, the "— " em-dash separator before the first `crt-check` span was dropped entirely.
- **Fix:** Rewrote both lines to use `translate()` + `document.createTextNode()` (no wrapper) exactly matching the original's bare-text structure, and restored the literal `' — '` text node.
- **Files modified:** `RSA/rsa.html`
- **Verification:** `en-parity IDENTICAL` on re-run
- **Committed in:** `a24985b`

**8. [Rule 1 - Bug] The `switch` gate failed because `renderEve()`'s Node-param `translateInto` calls had no re-render path, and a second typographic-apostrophe slip surfaced in the same pass**
- **Found during:** Task 3, first `switch` mode run
- **Issue:** Unlike `renderExchange` (safely re-invocable wholesale), `renderEve()` must never run again on a switch (it resets `EveFactorRes`/`DlpRes`) — but its intro paragraph, both factor formulas, both factor buttons, and the DLP intro/formula all used `translateInto` with Node params, none of which auto-rerenders and none of which the initial `onLangChange` implementation redid, leaving them in English after a switch. A second drafting slip (`operand's` written with a typographic apostrophe in `rsa.crtWhyFasterBody`'s English value) was caught in the same run.
- **Fix:** Added `EveStaticRefs` — a page-level array of zero-arg closures, each wrapping exactly one of `renderEve()`'s `translateInto` calls (recreating the Node params each time) — populated by a `reRenderable()` helper during `renderEve()` and replayed by `renderEveStaticRefresh()` from `onLangChange`, without touching the sibling result containers. Also converted `rsa.msgArrowHeading`'s call site from `translateInto` to `bindText` (its params are plain strings, so it can self-refresh with zero bookkeeping) and fixed the apostrophe.
- **Files modified:** `RSA/rsa.html`, `assets/i18n/rsa.js`
- **Verification:** `switch PASS points=3 langs=4` on re-run; `ALL PASS`
- **Committed in:** `a24985b`

---

**Total deviations:** 8 auto-fixed, all Rule 1 (genuine bugs/DOM-shape mismatches surfaced by the plan's own static and runtime gates; no production-scope change). **Impact on plan:** None on scope or architecture — every fix either restores exact pre-phase byte-identity or resolves a genuine cross-language/switch-safety defect the plan's own gates exist to catch.

## Issues Encountered

None beyond the deviations above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- A second worked precedent for a page with both "purely-derived" and "destructively-rebuilt" dynamic sections now exists: re-invoke the former wholesale on a switch, track the latter's Node-param `translateInto` calls individually via a page-level closure list, and prefer `bindText` over `translateInto` whenever only string/number/BigInt params are needed, to avoid needing any switch-time bookkeeping at all.
- The `qInv`-class collision (a page-invented camelCase abbreviation with no natural-language translation, unlike `order`/`ord`) is now resolved with a documented exemption pair; any later page with a similar invented label should reach for `allowSame`/`allowRenderText` directly rather than hunting for a translatable word that doesn't exist.
- Outstanding for end-of-phase UAT: this plan's own Task 3 human-check (generate both keypairs, send a message, toggle CRT, run Eve's factoring attempt, switch language and scroll — verifying the pinned public-key scratchpad's scroll-triggered reveal survives a switch), harvested alongside the other outstanding human-checks already on record from 06-01/06-02/06-04/06-02's glossary review.
- This is the last per-page plan of wave 3 (06-03 through 06-11); 06-12's phase-wide sweep can now run against all sixteen pages.

---
*Phase: 06-multi-language-support*
*Completed: 2026-10-01*

## Self-Check: PASSED

- All 3 claimed files found on disk (2 created, 1 modified — see Files Created/Modified above; this SUMMARY itself is the 4th).
- All 3 claimed task commits found in `git log` (`e9ef563`, `4a4e9ab`, `a24985b`).
- Re-ran every acceptance-criteria/verification command fresh immediately before writing this SUMMARY:
  - `node i18n-check.js --coverage --header --includes --no-locale-number-format --literals-markup RSA/rsa.html` — 5/5 PASS
  - `node i18n-check.js RSA/rsa.html` (all 6 static modes) — 6/6 PASS
  - `node shadow-check.js RSA/rsa.html` — SHADOW-CHECK PASS
  - `node shadow-check.js --all` — SHADOW-CHECK PASS on all 15 tool pages
  - `node harness.js` — HARNESS PASS total=2856003, zero FAIL
  - `node i18n-browser.js RSA/rsa.html` — en-parity IDENTICAL snaps=14, langs PASS snaps=14 langs=4, switch PASS points=3 langs=4, layout PASS, ALL PASS
  - `node i18n-browser.js RSA/rsa.html --mutant {untranslated,stale-switch,en-change,overflow}` — 4/4 MUTANT-DETECTED
  - `node i18n-check.js --smoke` (123, mutant detected, cross-session OK), `--api` (122), `--persistence` (71) — all PASS
  - `grep -c 'id="lang-switch-select"'` = 1, `grep -c 'data-i18n="site.nav\.'` = 16, `grep -c '= NT.i18n;'` = 1
  - `grep -v '^\s*//' RSA/rsa.html | grep -c "SPEED_LABELS"` = 0 (RSA never had a speed table — confirms no stray reference was introduced)
  - `grep -n "tableRows(" RSA/rsa.html` = 0 matches (legacy helper fully removed by Task 3)
