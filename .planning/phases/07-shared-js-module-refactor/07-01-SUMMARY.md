---
phase: 07-shared-js-module-refactor
plan: 01
subsystem: infra
tags: [shared-js-module, vanilla-js, classic-script, parity-testing, headless-chrome, static-analysis]

# Dependency graph
requires: []
provides:
  - "assets/nt-core.js — NT.core, a frozen 16-function/1-constant Number-domain shared module (clamp, gcd, mod, modInverse, isPrime, primeFactors, smallestPrimeFactor, isqrt, isPerfectSquare, fermatSplit, FERMAT_MAX_ITER, unitsMod, totient, euclidSteps, modPowSmall, randomInt)"
  - "The NT namespace, nt-*.js file naming, non-deferred include placement, and tool import-block convention every later phase-7 plan copies verbatim"
  - "The three verification engines every later phase-7 plan runs: harness.js (Node parity), shadow-check.js (static shadow/hygiene gate), browser-diff.js (headless-Chrome differential oracle with stability/mutant/assets-override modes)"
  - "Chinese Remainder Theorem and Euler's Totient migrated onto NT.core with zero browser-observable behavior change"
affects: [07-02, 07-03, 07-04, 07-05, 07-06, 07-07, 07-08, 07-09]

actuals:
  tokens: 20347
  tasks: 3
  commits: 5
  plan_head_before: bf658d9186c5dba273691d06314894355971c7d4
  plan_head_after: 22f77be2cc45fbc4ddb084709cf2c123784ea099

tech-stack:
  added: []
  patterns:
    - "Shared JS logic module: classic IIFE script attaching a frozen sub-namespace to window.NT, loaded as a plain non-deferred <script src> immediately before a tool's own inline script (not defer/async/type=module, since pages must run over file://)"
    - "Tool import block: a section-marker comment plus one `const { a, b } = NT.<ns>;` line per namespace, first statements of the tool's script scope, names sorted alphabetically"
    - "Dev-only Node parity harness: extracts pre-phase function bodies from BASE via `git show`, evaluates them in a fresh vm context, deep-compares against the new module over representative input domains — realm-normalizing values first, since util.isDeepStrictEqual treats structurally-identical values from different vm contexts as unequal (different Array/Object prototypes)"
    - "Dev-only static shadow-check: strips comments/strings with a hand-written tokenizer before identifier scans, to avoid false positives from string/comment text matching a watched name"
    - "Dev-only headless-Chrome differential oracle: seeded Math.random, scripted interaction steps (click/set/hover/clickEach/etc.), snapshots of body outerHTML + title + localStorage + cookie, with --stability/--mutant/--assets-override self-proving modes"

key-files:
  created:
    - assets/nt-core.js
    - .planning/phases/07-shared-js-module-refactor/harness.js
    - .planning/phases/07-shared-js-module-refactor/checks/core.check.js
    - .planning/phases/07-shared-js-module-refactor/shadow-check.js
    - .planning/phases/07-shared-js-module-refactor/browser-diff.js
    - .planning/phases/07-shared-js-module-refactor/browser-diff/chinese-remainder-theorem.json
    - .planning/phases/07-shared-js-module-refactor/browser-diff/eulers-totient.json
  modified:
    - Chinese Remainder Theorem/chinese-remainder-theorem.html
    - Eulers Totient/eulers-totient.html

key-decisions:
  - "gcd/clamp/mod/modInverse (Task 1) then the remaining 12 exports (Task 3) — the tracer proves the whole architecture (module shape, include order, import convention, all three verification engines) on one tool before any other tool's migration depends on it being right"
  - "NT.core.modInverse follows ECDH's extended-Euclid body with the early return on a===0 removed, so m=1 resolves through the general loop (returning 0, matching CRT's MIN_MODULUS=1 contract) instead of short-circuiting; non-coprime (a,m>1) still resolves to null via the general oldR!==1 check"
  - "NT.core.isPrime adopts ECDH's Number.isInteger guard project-wide; every other predecessor's callers only ever pass integers, so tightening the guard is a no-op for them (call-site proof recorded below)"
  - "primeFactors(n, limit) takes an optional limit parameter (default Infinity) so one function serves both Factor Tree's unconditional trial division and Venn's FACTOR_LIMIT-capped factorize(n)"
  - "harness.js's eq()/sameOutcome() normalize both sides through a realm-rebuilding helper before util.isDeepStrictEqual — a real bug found and fixed during Task 3: two structurally-identical empty arrays from different vm contexts (loadOld vs loadNew, each its own realm) compared as unequal because isDeepStrictEqual also checks [[Prototype]] identity"

requirements-completed: [SC-1, SC-2, SC-3, SC-4]

coverage:
  - id: D1
    description: "assets/nt-core.js ships a frozen NT.core with all 16 planned exports, parity-proven against every predecessor"
    requirement: "SC-3"
    verification:
      - kind: unit
        ref: "harness.js core (checks/core.check.js)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Chinese Remainder Theorem runs on NT.core via a plain non-deferred include, byte-identical to BASE in headless Chrome across every exercised interaction"
    requirement: "SC-1, SC-4"
    verification:
      - kind: e2e
        ref: "browser-diff.js Chinese Remainder Theorem/chinese-remainder-theorem.html (default + authored config, --stability, --mutant, --assets)"
        status: pass
      - kind: other
        ref: "shadow-check.js Chinese Remainder Theorem/chinese-remainder-theorem.html"
        status: pass
    human_judgment: false
  - id: D3
    description: "Euler's Totient runs its per-k Euclidean walk on NT.core.euclidSteps, byte-identical to BASE"
    requirement: "SC-1, SC-2, SC-4"
    verification:
      - kind: e2e
        ref: "browser-diff.js Eulers Totient/eulers-totient.html (authored config, --stability)"
        status: pass
      - kind: other
        ref: "shadow-check.js Eulers Totient/eulers-totient.html"
        status: pass
    human_judgment: false
  - id: D4
    description: "shadow-check.js and browser-diff.js are proven non-vacuous (they actually detect an injected defect, not just pass by construction)"
    requirement: "SC-2"
    verification:
      - kind: other
        ref: "shadow-check.js against a scratch CRT copy with a re-added local gcd() (SHADOW finding, exit 1); browser-diff.js --mutant (MUTANT-DETECTED); browser-diff.js --assets against a scratch copy with gcd forced to return 1 (DIFF)"
        status: pass
    human_judgment: false

duration: 95min
completed: 2026-09-30
status: complete
---

# Phase 7 Plan 1: Shared JS Module Refactor (tracer) Summary

**NT.core (16-export frozen shared module) proven end-to-end on Chinese Remainder Theorem and Euler's Totient, backed by three purpose-built dev-only verification engines: a Node parity harness, a static shadow-declaration gate, and a headless-Chrome differential oracle.**

## Performance

- **Duration:** ~95 min
- **Started:** 2026-09-30 (session start)
- **Completed:** 2026-09-30
- **Tasks:** 3 (Task 1 tracer, Task 2 verification-tooling expansion, Task 3 TDD completion + migration)
- **Files modified:** 9 (2 tool pages, 1 shared module, 6 dev-only tooling files)

## Accomplishments

- `assets/nt-core.js` ships as the repo's first shared **JS logic** module (site chrome — `theme.js`/`site.css`/`palette.css` — already existed; this is new territory), a frozen `window.NT.core` with 16 members, canonical bodies reconciled against every pre-phase predecessor's drifted variant (gcd abs/no-abs, clamp ordering, isPrime's integer guard, modInverse's null/m=1 contract, primeFactors' limit parameter, fermatSplit's maxIter parameter, euclidSteps' Bezout columns)
- Chinese Remainder Theorem and Euler's Totient migrated onto `NT.core`, both proven byte-identical to their pre-phase (BASE) selves in real headless Chrome across every exercised interaction, with zero console errors
- Three dev-only verification tools built and proven non-vacuous: `harness.js` (Node `vm`-based parity harness, 2,712,692 assertions in the final core check), `shadow-check.js` (static shadow/retired-name/import-hygiene/include-hygiene/namespace-mutation/stale-comment gate, plus `--all`'s cross-tool duplicate scan and `--docs`' doc-phrase audit), `browser-diff.js` (headless-Chrome OLD-vs-NEW differential snapshot oracle with `--stability`/`--mutant`/`--assets` modes)
- The phase's starting duplicate inventory recorded: `shadow-check.js --all --report` → 67 findings (21 SHADOW, 19 DUP, 17 RETIRED-NAME, 7 STALE-COMMENT, 2 RENAMED-DUP, 1 DUP-ALLOWED) across the 13 not-yet-migrated tools

## Task Commits

Each task was committed atomically (Task 3 carries TDD's test → feat → feat commits):

1. **Task 1: Tracer — CRT on NT.core, proven by parity harness + headless differential** - `1c98a07` (feat)
2. **Task 2: shadow-check.js + browser-diff stability/mutant/assets-override, proven on CRT** - `93be8f3` (feat)
3. **Task 3 (RED): failing parity checks for NT.core's 12 remaining exports** - `8d89db1` (test)
4. **Task 3 (GREEN): complete NT.core to 16 exports, parity proven** - `391f192` (feat)
5. **Task 3: migrate Euler's Totient onto NT.core.euclidSteps** - `22f77be` (feat)

_TDD gate compliance (Task 3, tdd="true"):_ RED commit `8d89db1` intentionally failed on the first assertion (`core key-set: expected [...16 names...] got ["clamp","gcd","mod","modInverse"]`, exit 1) before any implementation existed. GREEN commit `391f192` made it pass (2,712,692 assertions, exit 0). No REFACTOR commit was needed — the GREEN implementation required no cleanup pass.

## Files Created/Modified

- `assets/nt-core.js` — NT.core: clamp, euclidSteps, FERMAT_MAX_ITER, fermatSplit, gcd, isPerfectSquare, isPrime, isqrt, mod, modInverse, modPowSmall, primeFactors, randomInt, smallestPrimeFactor, totient, unitsMod
- `Chinese Remainder Theorem/chinese-remainder-theorem.html` — nt-core.js include + import block; local clamp/gcd/modInverse removed
- `Eulers Totient/eulers-totient.html` — nt-core.js include + import block; local euclidStepsFor removed, both call sites renamed to euclidSteps
- `.planning/phases/07-shared-js-module-refactor/harness.js` — dev-only Node parity harness toolkit + CLI (ROOT, baseCommit, gitShow, extractFunctions, loadOld, loadNew, DOM/storage/cookie/location stubs, seededRandom, eq, sameOutcome)
- `.planning/phases/07-shared-js-module-refactor/checks/core.check.js` — parity checks for all 16 NT.core exports against every BASE predecessor
- `.planning/phases/07-shared-js-module-refactor/shadow-check.js` — dev-only static gate (per-file + `--all` cross-tool + `--docs`)
- `.planning/phases/07-shared-js-module-refactor/browser-diff.js` — dev-only headless-Chrome differential oracle (diff/`--stability`/`--mutant`/`--assets` modes)
- `.planning/phases/07-shared-js-module-refactor/browser-diff/chinese-remainder-theorem.json`, `eulers-totient.json` — authored interaction configs

## Decisions Made

See `key-decisions` in the frontmatter. The one worth calling out in prose: **harness.js's cross-realm comparison bug.** During Task 3's GREEN run, `primeFactors(-5)` reported `HARNESS FAIL ... expected [] got []` — both sides were genuinely empty arrays, but `util.isDeepStrictEqual` also compares `[[Prototype]]`, and `loadOld`/`loadNew` each build their own `vm` context (their own JS realm, with their own `Array.prototype`). Fixed by rebuilding both sides through a realm-independent `normalizeRealm()` helper (using `Array.isArray`/`Object.keys`, which are realm-independent, plus manual push/assign rather than `.map`/spread, which would follow the *foreign* realm's species constructor) before every `eq()`/`sameOutcome()` comparison. This is now load-bearing for every later phase-7 plan's own `checks/*.check.js` files.

## Call-Site Proofs (recorded per the plan's acceptance criteria)

- **modInverse / CRT's coprimality gate:** `buildRun()` computes `coprimeOk = coprimeVerdict(moduli)` and returns immediately when `!coprimeOk`, *before* `solveCrt(read.list)` (which is the only call path into `modInverse`) ever runs. A non-coprime pair therefore never reaches `modInverse`, so CRT's old body returning an arbitrary (non-null) value for non-coprime input was never observable, and reconciling that with ECDH's null-on-non-coprime contract changes nothing for CRT.
- **isPrime's integer-only callers:** Factor Tree validates `Number.isInteger` before factorizing and only recurses on integer quotients; Venn Diagram only tests palette integers; Shor's Algorithm parses `N` strictly as an integer; Fermat's Method only tests the (necessarily integer) odd part of an integer. None of the four ever calls `isPrime`/`isPrimeSmall`/`isPrimeSimple` with a non-integer, so NT.core.isPrime's `Number.isInteger` guard (ECDH's contract) is a no-op for all four.
- **euclidSteps' consumer fields (Euler's Totient):** both call sites (`buildEvents`, `showKChain`) read only `result.gcd` and each step's `a`/`b`/`q`/`r` fields — no key iteration, no serialization of step objects, no reads of `s`/`t`. Gaining the Bezout `s`/`t` columns from the canonical `euclidSteps` is therefore a no-op for this tool's rendering.

## Deviations from Plan

None — plan executed exactly as written. The `normalizeRealm()` fix (see Decisions) is a Rule 1 (auto-fix bug) correction inside the harness's own comparison logic, discovered and fixed during Task 3's GREEN phase before any check was allowed to report a false PASS or false FAIL; it did not change scope, files touched, or the plan's task structure.

## Issues Encountered

None beyond the harness realm-comparison bug documented above (resolved within Task 3, same commit as the GREEN implementation).

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `assets/nt-core.js`, the NT namespace/include/import conventions, and all three verification engines (`harness.js`, `shadow-check.js`, `browser-diff.js`) are proven and ready for every later phase-7 plan to reuse without re-deriving them.
- `shadow-check.js --all --report`'s 67-finding inventory is the phase's starting baseline; later plans' migrations should shrink this count tool by tool.
- Ready for 07-02 (Fermat's Method, Shor's Algorithm, ECDH — the next wave-2 tools per 07-VALIDATION.md's Per-Task Verification Map).

## Self-Check: PASSED

- `assets/nt-core.js` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/harness.js` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/checks/core.check.js` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/shadow-check.js` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/browser-diff.js` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/browser-diff/chinese-remainder-theorem.json` exists: FOUND
- `.planning/phases/07-shared-js-module-refactor/browser-diff/eulers-totient.json` exists: FOUND
- Commit `1c98a07` in git log: FOUND
- Commit `93be8f3` in git log: FOUND
- Commit `8d89db1` in git log: FOUND
- Commit `391f192` in git log: FOUND
- Commit `22f77be` in git log: FOUND
- `node harness.js core`: HARNESS PASS core: 2712692 assertions, exit 0
- `shadow-check.js` on CRT and Euler's Totient: SHADOW-CHECK PASS, exit 0
- `browser-diff.js` on CRT and Euler's Totient (default/authored configs, `--stability`, `--mutant`, `--assets`): all IDENTICAL / MUTANT-DETECTED / DIFF as expected

---
*Phase: 07-shared-js-module-refactor*
*Completed: 2026-09-30*
