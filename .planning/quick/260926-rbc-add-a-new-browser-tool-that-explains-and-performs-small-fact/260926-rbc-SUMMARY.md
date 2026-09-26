---
phase: quick-260926-rbc
plan: 01
subsystem: ui
tags: [shors-algorithm, number-theory, svg, playback, quantum-education, rsa]

requires:
  - phase: quick-260926-jlu
    provides: Diffie-Hellman tool's playback engine, palette-role idioms, and persistence conventions reused here
provides:
  - "Shors Algorithm/shors-algorithm.html — pure-Number Shor's algorithm demo with honest classical order-finding stand-in"
  - "Hub card and sitewide nav entry for the new tool"
affects: [nav-registration, hub-tool-count]

actuals:
  tokens: 12270
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "runShor() step objects carry an optional outcome tag (lucky-gcd/odd-order/minus-one/budget/success) consumed purely by the rendering layer to drive stepped playback and the rejected-attempts list, without parsing step.detail text"
    - "Order-finding cycle ring built as an SVG polar layout, capped at CYCLE_RENDER_CAP nodes with an explicit truncation break marker and caption instead of ever rendering thousands of nodes"

key-files:
  created:
    - "Shors Algorithm/shors-algorithm.html"
  modified:
    - "index.html"
    - "Sieve Of Eratosthenes/sieve-of-eratosthenes.html"
    - "Factor Tree/factor-tree.html"
    - "Factorize By Completing The Square/factorize-completing-square.html"
    - "Congruence Wheel/congruence-wheel.html"
    - "RSA/rsa.html"
    - "Venn Diagrams/venn-diagrams.html"
    - "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"
    - "Square And Multiply/square-and-multiply.html"

key-decisions:
  - "Nav-registration scope was widened beyond the plan's original file list to match the world at execution time: the plan's file audit predated 260926-rb8 (added Square And Multiply, a ninth page) and 260926-rba (renamed RSA Examplifier -> RSA); Square And Multiply now also carries the new nav link, and every RSA reference uses RSA/rsa.html, never the stale RSA Examplifier path"
  - "The cycle ring is built once, at the moment playback reaches the 'verdict' step, rather than animated node-by-node during earlier steps — simpler and still satisfies every DOM/behavior contract, since the ring's data-r/data-rendered/data-truncated attributes only need to be correct once the run is fully resolved"
  - "Hardcoded 'nav count = 9' / 'eight total tools' assumptions baked into the plan's own verify scripts (written against a stale 7-tool world) were superseded by the actual 9-tool, 10-nav-link, 10-page reality; the real counts (nav=10, active=1 per page, 9 hub cards) were verified directly instead of the plan's stale literals"

requirements-completed: [QUICK-260926-rbc, NAV-01, NAV-02, PAL-01, PAL-02, PAL-04]

coverage:
  - id: D1
    description: "Shor's algorithm math core (limits/parseNStrict/gcdSmall/modPowSmall/isPrimeSmall/perfectPower/multiplicativeOrder/cycleValues/runShor) is DOM-free, uses plain Number arithmetic, and correctly factors every odd non-prime-power composite below 4096"
    requirement: "QUICK-260926-rbc"
    verification:
      - kind: unit
        ref: "extract-and-eval harness over the number-theory section — all listed function-value assertions plus the 1444-number invariant sweep (product == n, both factors strictly between 1 and n), completed in ~26ms"
        status: pass
    human_judgment: false
  - id: D2
    description: "Hard 4096 ceiling is enforced on every entry path (field, Enter, chips, query param, restored localStorage) through the single parseNStrict guard, with the run button disabled and a message naming both 4096 and the quantum reasoning"
    requirement: "QUICK-260926-rbc"
    verification:
      - kind: unit
        ref: "parseNStrict boundary assertions (4096 ok, 4097/99999999 ceiling, 2 too-small, abc/1e9 nan, whitespace-trimmed 91)"
        status: pass
      - kind: e2e
        ref: "headless Chrome dump of ?n=99999 — data-guard=ceiling, data-can-run=false, data-factors=empty, message contains 4096 and quantum, factorBtn disabled"
        status: pass
    human_judgment: false
  - id: D3
    description: "Order-finding step is labelled as a classical stand-in for quantum phase estimation/inverse QFT (data-sim=classical-stand-in, plus prose naming quantum phase estimation, QFT, and continued fractions), and rejected base attempts (odd order, a^(r/2) = -1 mod N) are shown, not hidden"
    requirement: "QUICK-260926-rbc"
    verification:
      - kind: unit
        ref: "runShor(3233,{bases:[2]}) — attempts[0].outcome === 'minus-one', attempts.length >= 2, factors [53,61]; runShor(143,{bases:[3]}) — attempts[0].outcome === 'odd-order', factors [11,13]"
        status: pass
      - kind: e2e
        ref: "headless Chrome dump of ?n=3233&a=2 — data-factors=53,61, data-attempts >= 2; static grep for data-sim=classical-stand-in, 'phase estimation', 'QFT'/'quantum Fourier', 'continued fraction'"
        status: pass
    human_judgment: false
  - id: D4
    description: "Order-of-a-mod-N ring (#cycleRing) draws the cycle closing back on 1, distinguishing base/midpoint/closing values, and truncates to CYCLE_RENDER_CAP (96) nodes with a break marker and caption when r exceeds the cap, instead of rendering thousands of nodes"
    requirement: "QUICK-260926-rbc"
    verification:
      - kind: unit
        ref: "cycleValues(2,15,4,96) === [2,4,8,1]; cycleValues(3,91,6,96) === [3,9,27,81,61,1]; cycleValues(2,3599,1740,96).length === 96"
        status: pass
      - kind: e2e
        ref: "headless Chrome dump of ?n=91&a=3 — data-r=6, data-rendered=6, data-truncated=false; ?n=3599&a=2 — data-r=1740, data-rendered=96, data-truncated=true, <200 <circle> elements in the DOM"
        status: pass
    human_judgment: false
  - id: D5
    description: "Play/Pause/Step/Instant/Reset replay runShor().steps one at a time via a generation-guarded requestAnimationFrame loop; presets, force-base field, randomize button, and localStorage persistence (restored N re-validated through parseNStrict) all route through the same guard"
    requirement: "QUICK-260926-rbc"
    verification:
      - kind: unit
        ref: "static grep: generation appears >=4 times (declaration, rebuild++, resetPlayback++, capture+comparison in play/frameStep), playBtn/stepBtn/instantBtn/resetBtn all wired via .addEventListener, STORAGE_KEY = 'shors-algorithm', 2 try/catch blocks guarding localStorage"
        status: pass
      - kind: manual_procedural
        ref: "Visual verification via headless-Chrome screenshots (N=3233 forced base 2 showing the rejection-then-retry narrative; N=3599 showing the truncated ring) — full interactive Play/Pause/Step scrubbing not exercised in a real browser session"
        status: unknown
    human_judgment: true
    rationale: "Screenshots confirm the finished/instant state renders correctly and all DOM contracts pass, but the frame-by-frame Play/Pause/Step/Instant/Reset interaction sequence (mid-animation chip switch, Pause-then-resume, ghost-node absence) was not exercised with a live pointer session — a human should click through the controls once to confirm the visual pacing feels right."
  - id: D6
    description: "Site coherence: nine hub cards, ten nav links per page with exactly one active, every href resolving, hero/footer tool-count wording updated, and each of the eight sibling tool pages gaining exactly one added nav line"
    requirement: "NAV-01, NAV-02"
    verification:
      - kind: integration
        ref: "grep-based nav/active count per page (all 10 pages: nav=10, active=1), href resolution sweep (0 broken links), git diff --numstat on the 8 sibling pages (each exactly +1/-0), index.html card/h2 counts (9 each), hero 'nine small browser tools', footer 'all nine tools'"
        status: pass
    human_judgment: false
  - id: D7
    description: "No literal color anywhere in the new page; every color resolves through var(--role-*) against assets/palette.css, and no arbitrary-precision integer type is used (Number arithmetic only, ceiling keeps N^2 under 2^53)"
    requirement: "PAL-01, PAL-02, PAL-04"
    verification:
      - kind: unit
        ref: "grep sweep for hex/rgb()/hsl() literals and named CSS colors in color-bearing properties (0 hits outside Google Fonts URLs); grep for the arbitrary-precision-integer keyword (0 hits); role-token usage count >=8"
        status: pass
    human_judgment: false

duration: ~25min
completed: 2026-09-27
status: complete
---

# Quick Task 260926-rbc: Shor's Algorithm Browser Tool Summary

**Added a ninth browser tool, `Shors Algorithm/shors-algorithm.html`, that factors small N by real Shor's-algorithm structure while honestly labelling the classical cycle walk as a stand-in for quantum order finding, then registered it on the hub and every sibling page's nav.**

## Performance

- **Duration:** ~25 min
- **Completed:** 2026-09-27T00:59:17+02:00
- **Tasks:** 3
- **Files modified:** 10 (1 created, 9 modified)

## Accomplishments

- Built the full number-theory core (`limits`, `parseNStrict`, `gcdSmall`, `modPowSmall`, `isPrimeSmall`, `perfectPower`, `multiplicativeOrder`, `cycleValues`, `runShor`) exactly to the plan's extract-and-eval contract, DOM-free, using plain `Number` arithmetic since `N_MAX^2` (16,777,216) sits comfortably under `2^53`
- `runShor` follows real Shor's-algorithm order: classical pre-checks (even, perfect power, prime) before any base attempt, then per-attempt gcd check, order finding, parity check, root check, and gcd post-processing, with automatic base retry up to `MAX_BASE_ATTEMPTS` (24) — verified against every grounded fact in the plan (N=15, 91, 143, 3233, 3599, 8, 9, 13) plus a full 1,444-number invariant sweep of every odd non-prime-power composite below 4096, completing in ~26ms
- Single `parseNStrict` guard enforces the 4096 ceiling on every entry path — number field, Enter key, preset chips, restored `localStorage`, and `?n=`/`?a=` query params — with a message naming both the number 4096 and the quantum-hardware reasoning; the run button is disabled while the guard fails
- Order-finding is honestly labelled a classical stand-in (`data-sim="classical-stand-in"`), with prose naming quantum phase estimation, the inverse QFT, and continued-fraction period recovery as what real hardware would do instead
- Rejected base attempts are shown, not hidden: a base 2 attempt on N=3233 visibly fails on `a^(r/2) = -1 mod N` before a later base lands on 53 x 61; a base 3 attempt on N=143 visibly fails on an odd order before a later base lands on 11 x 13
- Order-of-a-mod-N ring drawn as an SVG polar diagram, distinguishing the base, the midpoint `a^(r/2)`, and the closing 1; periods beyond the 96-node cap (e.g. N=3599, r=1740) truncate to an open arc with an explicit break marker and caption instead of rendering thousands of nodes
- Play/Pause/Step/Instant/Reset replay the run's `steps[]` one at a time via a `generation`-guarded `requestAnimationFrame` loop, mirroring the Diffie-Hellman tool's stale-callback-safe idiom
- Six preset chips (15, 21, 91, 143, 3233 labelled as the textbook RSA modulus, 3599 labelled as a long-period demo), a force-base field, and a randomize-base button all route through the same guard
- `localStorage` persistence (`shors-algorithm` key) re-validates a restored N through `parseNStrict` before use, so tampered or stale storage cannot bypass the ceiling
- Two explainer panels ("What the quantum part really does" and "Why N stops at 4096") state plainly what real hardware does, what this page simulates instead, and the concrete cost numbers (N modular multiplications per attempt vs. ~16.8 million amplitudes for a faithful quantum-register simulation) driving the ceiling
- Registered the new tool on the hub (ninth card, updated hero/footer tool-count wording) and added exactly one nav line to each of the eight sibling tool pages

## Task Commits

1. **Task 1: End-to-end Shor's run on one page — math core, hard ceiling, text verdict** — `36e3b43` (feat)
2. **Task 2: Make it teach — order ring, stepped playback, presets, persistence, explainer panels** — `28c5efc` (feat)
3. **Task 3: Register the tool in the hub and in every page's nav** — `05efe27` (feat)

## Files Created/Modified

- `Shors Algorithm/shors-algorithm.html` - New self-contained tool: Shor's-algorithm math core, honest quantum-stand-in framing, hard ceiling, order ring, stepped playback, presets, persistence, explainer panels
- `index.html` - Ninth hub card, ninth nav link, hero/footer tool-count wording updated to "nine"
- `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` - One added nav line
- `Factor Tree/factor-tree.html` - One added nav line
- `Factorize By Completing The Square/factorize-completing-square.html` - One added nav line
- `Congruence Wheel/congruence-wheel.html` - One added nav line
- `RSA/rsa.html` - One added nav line
- `Venn Diagrams/venn-diagrams.html` - One added nav line
- `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` - One added nav line
- `Square And Multiply/square-and-multiply.html` - One added nav line (not in the plan's original file list; added per execution-time scope adjustment, see below)

## Decisions Made

- **Scope adjustment (not a deviation from the plan's intent):** the plan's file audit and hardcoded verify-script assumptions ("nine nav links total", "eight tools") were written against the state of the repo at plan time, which predates two sibling batch items that landed first: `260926-rb8` (added `Square And Multiply/square-and-multiply.html`, a ninth page) and `260926-rba` (renamed `RSA Examplifier/rsa-examplifier.html` to `RSA/rsa.html`, label "RSA"). Per the orchestrator's explicit instruction, Task 3 was widened to also add the nav link to `Square And Multiply/square-and-multiply.html`, and every RSA reference used the current `RSA/rsa.html` path/label rather than the stale `RSA Examplifier` one. Grepped the whole repo for both `RSA Examplifier` and `square-and-multiply` before finishing to confirm alignment — zero stale references found, and `square-and-multiply` is referenced correctly from the new tool's "why N stops at 4096" framing is unrelated, but the nav coverage check confirmed the link exists.
- The plan's own automated verify scripts hardcode "site-nav-link count = 9" for the new page — this is stale (it assumed an 8-tool world). The actual current world has 9 tools total (8 existing + Shor's), so the correct, verified count is 10 nav links per page (Home + 9 tools) with exactly 1 marked active. This was verified directly rather than against the plan's stale literal.
- The cycle ring is built and revealed once, at the moment playback reaches the terminal `verdict` step, rather than incrementally per intermediate step. This still satisfies every DOM contract (`data-r`/`data-rendered`/`data-truncated` are only asserted against the finished state) and every human-observable success criterion, while avoiding the complexity of mapping ring-node reveals to rejected-attempt log rows that have no ring representation at all.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed a line-wrap that split the phrase "continued fraction" across two lines**
- **Found during:** Task 2 verification (structure grep for `'continued fraction'`, which is a single-line grep pattern)
- **Issue:** The explainer panel's prose wrapped "continued" and "fraction" onto separate source lines, so the grep-based structure check for the phrase failed even though the phrase reads correctly when rendered
- **Fix:** Reflowed the paragraph so "continued fraction" sits on one source line
- **Files modified:** `Shors Algorithm/shors-algorithm.html`
- **Commit:** `28c5efc` (part of Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug). Additionally, one execution-time scope adjustment was applied per explicit orchestrator instruction (see Decisions Made above) — not a self-initiated deviation, and not counted against the deviation rules since it was directed.
**Impact on plan:** Both changes necessary for correctness (the grep is a proxy for genuinely-present prose) and for shipping into the actual current 9-tool repo state rather than the plan's stale 8-tool snapshot. No scope creep beyond what was explicitly directed.

## Issues Encountered

None — every automated verify command from the plan (extract-and-eval math harness, structure greps, color-literal sweep, headless-Chrome DOM dumps for `?n=15`, `?n=99999`, `?n=3233&a=2`, `?n=13`, `?n=91&a=3`, `?n=3599&a=2`) passed on execution, after the one line-wrap fix above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The tool is live and fully wired into the site; no blockers.
- One coverage item (D5) is flagged for human judgment: the frame-by-frame Play/Pause/Step/Instant/Reset interaction sequence was verified structurally (event listeners wired, generation guard present) and via static screenshots of the finished state, but not exercised with a live pointer session in a real browser. A human should click through Play/Pause/Step once on N=3233 (forced base 2) to confirm the rejection-then-retry narrative paces well and that switching presets mid-animation leaves no ghost nodes.

---
*Phase: quick-260926-rbc*
*Completed: 2026-09-27*
