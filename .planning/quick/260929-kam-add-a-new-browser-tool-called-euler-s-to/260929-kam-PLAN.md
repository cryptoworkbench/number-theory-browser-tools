---
phase: quick-260929-kam
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Eulers Totient/eulers-totient.html
  - index.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Factor Tree/factor-tree.html
  - Venn Diagram/venn-diagram.html
  - Euclidean Algorithm/euclidean-algorithm.html
  - Chinese Remainder Theorem/chinese-remainder-theorem.html
  - Equivalence Wheel/equivalence-wheel.html
  - Cayley Table/cayley-table.html
  - Square And Multiply/square-and-multiply.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - RSA/rsa.html
  - Fermats Method/fermats-method.html
  - Shors Algorithm/shors-algorithm.html
autonomous: true
requirements: ["quick-260929-kam"]

estimate:
  tokens: 158000
  raw_tokens: 105000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "A thirteenth tool exists at `Eulers Totient/eulers-totient.html` — one new top-level directory, one self-contained HTML file, inline `<style>` and inline IIFE-wrapped `<script>`, no shared JS module, no external resource beyond Google Fonts and the site's own `assets/palette.css` / `assets/site.css` / `assets/theme.js` / `assets/favicon.svg`."
    - "It computes φ(n) the long way. For a user-entered n it walks k = 1, 2, 3 … n−1 and for every single k runs the Euclidean algorithm to gcd(n, k), showing that k's division chain line by line. The closed-form product formula n·Π(1−1/p) appears nowhere on the page and is never used to produce a displayed number."
    - "Each k that comes out with gcd = 1 is tallied into a running coprime count that is visible and updates as the walk proceeds; each k with gcd > 1 is visually marked eliminated/inert. When the walk reaches k = n−1 the running tally is the answer, and the page states `φ(n) = <tally>`."
    - "For the default n = 12 the walk ends with exactly 4 coprime cells (k = 1, 5, 7, 11), exactly 7 eliminated cells, and `φ(12) = 4`. The k = 7 chain reads `12 = 1·7 + 5`, `7 = 1·5 + 2`, `5 = 2·2 + 1`, `2 = 2·1 + 0`; the k = 8 chain reads `12 = 1·8 + 4`, `8 = 2·4 + 0`."
    - "Play, Pause, Step, Instant and Reset behave the way the Sieve of Eratosthenes and Fermat's Method tools' controls already behave, including the `generation` counter that makes a stale animation callback from an abandoned run bail instead of writing into a cleared panel."
    - "Preset chips land illustrative moduli in one click, covering at least a prime, a prime power, a product of distinct primes, and two different n that share the same φ."
    - "Every colour on the page is a `var()` against an `assets/palette.css` token (directly or through a locally-named alias built only from `var()`/`color-mix()`), and the page carries no literal colour of any kind. It reads correctly in both day and night themes."
    - "The tool is registered site-wide: a card on `index.html`'s hub grid and a nav link on all fourteen pages, in the site's existing learning-path order, inserted immediately after Equivalence Wheel and before Cayley Table."
  artifacts:
    - "Eulers Totient/eulers-totient.html"
    - "index.html"
  key_links:
    - "ONE source of truth for the walk. `buildEvents(n)` produces the entire flattened event list (every division line of every k, plus every k's verdict) before any rendering happens, and `applyEvent()` is the only function that writes a k-cell class, a chain line, or the tally. Play, Step and Instant differ ONLY in how many events they hand to `applyEvent()` — they never compute anything themselves, so the animated answer and the instant answer cannot disagree."
    - "The tally is derived, not asserted. `applyEvent()` increments the coprime counter on a `verdict` event with `coprime === true` and on nothing else, and the final answer line prints that same counter. There is no second place that computes φ, which is precisely what makes the page an honest manual computation rather than a closed-form result with a decorative animation on top."
    - "`euclidStepsFor(a, b)` is DUPLICATED into this file from `Euclidean Algorithm/euclidean-algorithm.html`, not imported — the repo's deliberate per-file duplication rule for number-theory helpers. The `.eq-line` / `.eq-num` chain markup echoes that tool's step-walk so a learner arriving from it recognises the same visual grammar."
    - "`resetScan()` bumps `generation` BEFORE it clears the grid and chain, and every deferred callback captures `generation` on entry and compares before writing. This is what makes a mid-play Run, chip click or Reset safe."
    - "The nav link list is one fixed 14-entry sequence repeated verbatim across 14 files; Task 3's verifier parses the anchor sequence out of every file and compares it to that one list, so a single missed page fails the gate rather than shipping a lopsided menubar."
---

<objective>
Add a thirteenth browser tool, **Euler's Totient Function**, that computes φ(n) by hand: it walks k = 1 … n−1, runs a live Euclidean algorithm against n for every k, tallies the coprimes, and shows that the running tally *is* φ(n).

Purpose: φ(n) is usually introduced as a formula to memorise — `n·Π(1−1/p)` — which hides what the function actually counts. The site already has a Euclidean Algorithm tool that makes gcd concrete and an Equivalence Wheel whose multiplicative mode shows exactly the φ(n) units. This tool is the missing bridge: it makes the *definition* mechanical and watchable, so the formula later reads as a shortcut for something the learner has already seen happen one k at a time.

Output: one new directory `Eulers Totient/` holding one self-contained `eulers-totient.html`; one new card on `index.html`; one new nav link on all fourteen pages.

**Decision — the closed form is banned from the page.** The product formula is never computed and never shown, not even as a "check" line. The whole value proposition is that the number on screen was produced by counting. The closed form appears only inside the throwaway verification harness, as an independent oracle to prove the manual walk is correct.

**Decision — the unit of playback is one event, where an event is either one division line or one k's verdict.** That is the Sieve's flattened-event model, and it is what makes the Euclidean algorithm visible *live* rather than appearing whole. A per-k unit would hide the division chain, which is the thing the brief asks to echo from the Euclidean Algorithm tool.

**Decision — placement in the menubar: immediately after Equivalence Wheel, immediately before Cayley Table.** It sits downstream of Euclidean Algorithm (its engine) and of Equivalence Wheel (whose multiplicative mode shows the φ(n) wedges it counts), and upstream of Cayley Table / Square and Multiply / RSA, which all consume group order. That satisfies "near the Equivalence Wheel and Euclidean Algorithm tools" without disturbing any existing pair.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
</context>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: Create the tool end-to-end — n in, φ(n) landed, via the manual k-walk</name>
  <files>Eulers Totient/eulers-totient.html</files>
  <precondition>`google-chrome` is on PATH (verified at `/usr/bin/google-chrome` during planning) and `node` is on PATH (verified at `/usr/bin/node`); the behavioural gates in all three tasks need both — if either is absent, halt and report rather than skipping a gate. This precondition covers Tasks 2 and 3 as well.</precondition>
  <read_first>
    - `Euclidean Algorithm/euclidean-algorithm.html` — the template for this whole file. Read the head block (lines 1-13), the `:root` slot-alias comment and CSS through `.eq-line` (lines 14-140), the nav header and page markup (lines 240-363), `euclidSteps` (lines 374-390), `readInputs` (lines 488-526), `appendStepLine` (lines 583-607), `renderAnswer` (lines 615-629), and the playback + wiring block (lines 951-1192).
    - `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` — the grid and event model: `.cell` / `.cell.current` / `.cell.composite` CSS (lines 244-310), `cellMinPx` + `buildGrid` (lines 554-580), and `speedToEventsPerFrame` + `frameStep` (lines 658-681).
    - `assets/palette.css` — the full token list, especially the `--role-*` semantic layer and what each role means.
    - `CLAUDE.md` and `.claude/CLAUDE.md` — the repo's single-file / palette-token / duplication rules.
  </read_first>
  <behavior>
Ground-truth vectors, computed by hand while planning. Treat them as the oracle.

For n = 12, the walk covers k = 1 … 11:
- Coprime k (tallied): 1, 5, 7, 11 → exactly 4 coprime cells, and `φ(12) = 4`.
- Eliminated k: 2, 3, 4, 6, 8, 9, 10 → exactly 7 eliminated cells.
- The k = 7 division chain is exactly four lines: `12 = 1·7 + 5`, `7 = 1·5 + 2`, `5 = 2·2 + 1`, `2 = 2·1 + 0` — gcd 1, so coprime.
- The k = 8 division chain is exactly two lines: `12 = 1·8 + 4`, `8 = 2·4 + 0` — gcd 4, so eliminated.
- The k = 1 chain is one line, `12 = 12·1 + 0`, gcd 1 — the trivially-coprime case, which must not be special-cased away.
- The total event count for n = 12 is 31: 20 division events plus 11 verdict events.

Other landed answers: φ(13) = 12, φ(16) = 8, φ(30) = 8, φ(36) = 12, φ(97) = 96, φ(210) = 48, and the smallest legal case φ(2) = 1.

Boundary behaviour: n below 2 is rejected with a message in the error box (the k = 1 … n−1 walk is empty there and φ(1) = 1 is a convention, not something this page counts). n above the cap is clamped down to the cap with a message, mirroring how the Euclidean Algorithm tool clamps.
  </behavior>
  <action>
Create the directory `Eulers Totient/` and inside it the single self-contained file `eulers-totient.html`. Build it as ONE vertical slice that already works end to end: type an n, press Run, and the finished φ(n) is on screen with every k classified and the last k's division chain visible. Playback controls and preset chips are Task 2; this task ships Run plus Instant only, and both must be real, not stubs.

Structure the file exactly like `Euclidean Algorithm/euclidean-algorithm.html`:

HEAD — copy that tool's head block verbatim and change only the title. Keep the theme pre-paint script byte-identical, keep `../assets/favicon.svg`, `../assets/palette.css`, `../assets/site.css`, the deferred `../assets/theme.js`, and the same single Google Fonts link. Add no other external resource. Page title: `Euler's Totient Function`.

STYLE — inline `<style>` in the head. Open with a `:root` block of locally-named slot aliases, each one built only from `var()`/`color-mix()` and each carrying a short comment saying which shared role it maps onto and why, in the same voice as the Euclidean Algorithm tool's slot block:
  - a modulus slot mapped onto `--role-input` (n, the value being operated on)
  - a current-k slot mapped onto `--role-active` (the k under test right now)
  - a coprime slot mapped onto `--role-result` (a k that survives and is tallied — the answer being accumulated)
  - an eliminated slot mapped onto `--role-inert`, with its label text on `--role-inert-text`
  - a remainder slot mapped onto `--role-alt` (the remainder that becomes the next divisor)
  - a warning slot mapped onto `--role-warn`
  plus `color-mix` soft variants of whichever of those need a tinted background.
Then the page chrome: reuse the Euclidean Algorithm tool's `.app`, `.page-header`, `.eyebrow`, `.lede`, `.xref`, `.panel`, `.field-row`, `.field`, `.controls`, `.btn-row`, `button`/`.primary`/`.ghost`, `.chips`/`.chip`, `.error-box`, `.banner`, `.chain`, `.eq-line`, `.eq-num` rules, adapted as needed. Add the k-grid rules, modelled on the Sieve's `.cell` family: a `#kGrid` using `grid-template-columns: repeat(auto-fill, minmax(var(--cell-min), 1fr))`, and `.k-cell` with pending, `is-current`, `is-coprime` and `is-eliminated` states. `--cell-min` is a length written at runtime by JS and is the one locally-declared custom property that is not a colour — that is the sanctioned pattern, same as the Sieve's. Give `.is-eliminated` the struck-through treatment (an `::after` rule) the Sieve gives a composite, and give `.is-current` the raised/ringed treatment the Sieve gives its current cell. Use no literal colour anywhere: no hex triple, no functional colour notation, and no CSS named colour — including the named one the Sieve happens to use inside its prime-cell gradient, which must not be copied here. `transparent` inside `color-mix` is fine and is used throughout the repo already.

MARKUP — body opens with the shared site header copied from the Euclidean Algorithm tool, with the nav rewritten to the fourteen-entry order below, hrefs relative to this directory (`../Sieve Of Eratosthenes/sieve-of-eratosthenes.html` and so on), and this page's own entry as the bare filename `eulers-totient.html` carrying `is-active`:

  1 Home → `../index.html`
  2 Sieve of Eratosthenes
  3 Factor Tree
  4 Venn Diagram
  5 Euclidean Algorithm
  6 Chinese Remainder Theorem
  7 Equivalence Wheel
  8 Euler's Totient   ← this page
  9 Cayley Table
  10 Square and Multiply
  11 Diffie-Hellman
  12 RSA
  13 Fermat's Method
  14 Shor's Algorithm

Then `<div class="app">` containing:
  - A `.page-header` with eyebrow `number theory · euler's totient`, `<h1>` reading `Euler's Totient Function`, and a lede that states plainly what the page does: φ(n) counts how many of 1 … n−1 share no factor with n, and this page finds out the only honest way — by asking the Euclidean algorithm about every single one of them.
  - A `.xref` paragraph with `id="xrefLink"` pointing at `../Equivalence Wheel/equivalence-wheel.html` whose text says the same count shows up as the wedges of the multiplicative group mod n. Its href is rewritten on every run by a small `updateXrefLink(n)` that appends `?mode=multiplicative&n=<n>` — the two params that tool already reads from its own query string. Do not touch, read or write that tool's persisted store; this page persists nothing of its own at all.
  - A `.panel.controls` section holding: a `.field` with `<label for="nInput">n</label>` and `<input id="nInput" type="number" min="2" max="1000" value="12">`; an empty `<div class="chips" id="presetChips"></div>` placeholder that Task 2 fills; and a `.btn-row` with `<button id="runBtn" class="primary">Run</button>` and `<button id="instantBtn" class="ghost">⏩ Instant</button>`.
  - `<div class="error-box" id="errorBox"></div>` and `<div class="banner" id="banner">`.
  - A `.panel` holding the walk: `<div id="kGrid" class="k-grid"></div>`, a `#progressLine` reading how far through k = 1 … n−1 the walk is, a `#tallyLine` carrying the running coprime count in both its text and a `data-count` attribute, and a `#answerLine` that carries `data-n` and `data-phi` attributes alongside its `φ(n) = m` text.
  - A `.panel` holding the live Euclidean chain for the k currently under test: a `#chainHead` naming the pair, `<div id="chain" class="chain"></div>`, and a `#verdictLine` stating whether that k was tallied or eliminated and why.
  - A closing `.caption` noting that n prime gives φ(n) = n−1 because every smaller number misses it, which the chips make easy to check.
Choose element ids that are not three-to-eight-character hexadecimal words, so the literal-colour gate below cannot trip on a CSS id selector.

SCRIPT — a single inline IIFE at the end of body, `"use strict"`, with the repo's section-marker comment style and these parts in order:

  1. Math, duplicated not imported. `euclidStepsFor(a, b)` is the Euclidean Algorithm tool's `euclidSteps` with the Bézout coefficients dropped: loop while the second value is nonzero, push `{a, b, q, r}` per division, return `{steps, gcd}`. Nothing else computes a gcd anywhere in this file.
  2. DOM references via the same `var $ = function(id){ return document.getElementById(id); };` helper, plus `MIN_N = 2` and `MAX_N = 1000`.
  3. `readN()` — modelled on `readInputs()`: clear the error box, reject anything that is not a whole number, reject n below `MIN_N` with a message explaining that the walk k = 1 … n−1 needs at least one k, clamp n above `MAX_N` down with a message naming the cap, return the integer or null.
  4. `buildEvents(n)` — the single source of truth for the walk. For k from 1 to n−1: call `euclidStepsFor(n, k)`, push one `{type:'div', k, step, index}` event per division step, then push one `{type:'verdict', k, gcd, coprime}` event. Return the array. Compute nothing else here; in particular do not pre-count the coprimes.
  5. `buildGrid(n)` — write `--cell-min` onto `document.documentElement` from a small size ladder in the Sieve's shape (larger cells for small n, down to a readable minimum at the cap), then append one `.k-cell` per k with `data-k` and the number as text, through a document fragment.
  6. `applyEvent(ev)` — the ONLY function that mutates the grid, the chain, the tally or the answer. On a `div` event: if it is that k's first division, clear the chain, set `#chainHead`, move the `is-current` class onto that k's cell; then append one `.eq-line` whose inner spans mirror `appendStepLine` in the Euclidean Algorithm tool (`a`, ` = `, `q`, `·`, `b`, ` + `, `r`), coloured through the slot aliases. On a `verdict` event: add `is-coprime` or `is-eliminated` to that k's cell, write `#verdictLine`, and increment the coprime counter only when `coprime` is true, then rewrite `#tallyLine` and its `data-count`. Update `#progressLine` from the verdict's k.
  7. `landAnswer()` — write `#answerLine` text `φ(<n>) = <tally>` plus `data-n` and `data-phi` from that same counter, and write a closing `#banner` sentence. It reads the counter; it never recomputes.
  8. `resetScan()` — bump `generation`, zero the step index and the coprime counter, clear the grid's state classes, clear the chain, the verdict, the answer and the tally.
  9. `instantFinish()` — walk the remaining events through `applyEvent()` from the current step index to the end, then `landAnswer()`. Never re-apply an event that was already applied, the way `revealAll` in the Euclidean Algorithm tool walks only the remaining steps.
  10. `buildRun()` — `readN()`, then `updateXrefLink(n)`, `buildEvents(n)`, `buildGrid(n)`, `resetScan()`, `instantFinish()`; the same shape as `buildRun` in the Euclidean Algorithm tool, which also lands its answer immediately so the page is never blank on arrival.
  11. Wiring: Run click, Instant click, Enter in `#nInput`, and a `window.addEventListener('load', ...)` that calls `buildRun()` so n = 12 is already solved when the page opens.

Declare `generation`, `stepIndex`, `events`, `coprimeCount` and the cell array as module-scoped state in the IIFE now, even though only Task 2 exercises `generation` — Task 2 adds no new state, only the controls that use it.
  </action>
  <verify>
    <automated>Behavioural gate via headless Chrome against a scratchpad copy, built exactly the way plan 03-02's harness was built: `SP="$(mktemp -d)"; cp -r assets "$SP/assets"; mkdir -p "$SP/tool"`, then use `node` to inject the harness script before `</body>` and write the result to `$SP/tool/harness.html`. The harness installs `window.onerror`, registers its own `load` listener, drives the real UI, and writes `PASS <assertionCount>` or `FAIL <first mismatch, expected vs got>` into `document.body.dataset.totientBuild`. It carries its own independent oracle, used for comparison only and never copied into the page: `function phiClosed(n){ var r=n, m=n; for (var p=2; p*p<=m; p++){ if (m%p===0){ while (m%p===0) m/=p; r-=r/p; } } if (m>1) r-=r/m; return r; }`. Assert, in order: (1) on arrival `#nInput` reads `12`, `#answerLine` carries `data-n="12"` and `data-phi="4"`, `#kGrid` holds exactly 11 `.k-cell`, exactly 4 carry `is-coprime` with `data-k` set exactly `1,5,7,11`, exactly 7 carry `is-eliminated`, and `#tallyLine` carries `data-count="4"`; (2) for each n in 2, 13, 16, 30, 36, 97, 210 — set `#nInput` and click `#runBtn` — `#answerLine`'s `data-phi` equals `phiClosed(n)`, the `is-coprime` count equals that same number, and `is-coprime` plus `is-eliminated` together account for exactly n−1 cells with zero cells left unclassified; (3) back at n = 12, the chain left standing after the run is the final k = 11's and holds exactly 2 `.eq-line`, the last of which has a remainder span reading `0`; (4) install a MutationObserver on `#chain` BEFORE clicking `#runBtn` at n = 12 and record every appended `.eq-line`'s text in order — assert exactly 20 were appended in total, that the four appended while `#chainHead` named k = 7 read `12 = 1·7 + 5`, `7 = 1·5 + 2`, `5 = 2·2 + 1`, `2 = 2·1 + 0`, that the two appended for k = 8 read `12 = 1·8 + 4`, `8 = 2·4 + 0`, and that k = 1 contributed exactly one line; (5) `#nInput` set to `1` then Run leaves `#errorBox` non-empty and leaves the previous answer's `data-phi` unchanged; `#nInput` set to `5000` then Run leaves `#errorBox` non-empty and lands `data-n="1000"`; (6) `#xrefLink` href ends with `?mode=multiplicative&n=1000` after that clamped run; (7) `window.onerror` recorded nothing across the whole run. Run with `google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir="$(mktemp -d)" --virtual-time-budget=30000 --dump-dom "file://$SP/tool/harness.html" > "$SP/dom.html"`, then assert `grep -q 'data-totient-build="PASS' "$SP/dom.html" || { grep -o 'data-totient-build="[^"]*"' "$SP/dom.html"; exit 1; }` and print the assertion count. Before trusting a green run, prove the harness is not vacuous: temporarily point assertion (1) at a deliberately wrong expectation and confirm it reports `FAIL`.

Static gates, all run against `Eulers Totient/eulers-totient.html`:
- Literal-colour gate: `grep -nEi '#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\b(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey|silver|gold|navy|teal|cyan|magenta|lime|maroon|olive|brown|beige|tan|coral|crimson|indigo|violet)\b' "Eulers Totient/eulers-totient.html"` must print nothing.
- External-resource gate: every `href`/`src` in the file resolves to `../assets/`, to `fonts.googleapis.com`, to `fonts.gstatic.com`, or to another page in this repo — `grep -nE 'https?://' "Eulers Totient/eulers-totient.html"` returns only Google Fonts and the SVG namespace URI.
- Persistence gate: `grep -c 'localStorage' "Eulers Totient/eulers-totient.html"` returns exactly `1` — the copied theme pre-paint script line and nothing else.
- Closed-form gate: the closed form needs a factorization helper, so proving none was introduced proves it was not used. `grep -nE 'Math\.pow|primeFactors|isPrime|smallestPrimeFactor' "Eulers Totient/eulers-totient.html"` prints nothing, and `grep -c 'euclidStepsFor' "Eulers Totient/eulers-totient.html"` returns at least `2` (the definition plus its use in `buildEvents`).
- Nav gate: `grep -c 'site-nav-link' "Eulers Totient/eulers-totient.html"` returns exactly `14`, and `grep -c 'is-active' "Eulers Totient/eulers-totient.html"` returns exactly `1`.</automated>
    <fails_when>the dumped DOM does not carry `data-totient-build="PASS`, or any static gate above produces output it should not, or the vacuity check does not produce a `FAIL` when fed a deliberately wrong expectation</fails_when>
    <human-check>Open `Eulers Totient/eulers-totient.html` in a browser. It should already show n = 12 solved: eleven small numbered cells with 1, 5, 7, 11 lit as survivors and the rest struck through, a division chain in the lower panel, a running count of 4, and `φ(12) = 4`. Type 13 and press Enter — twelve cells, all survivors, `φ(13) = 12`. Flip the day/night toggle and confirm nothing washes out or goes invisible in either theme.</human-check>
  </verify>
  <acceptance_criteria>
    - `Eulers Totient/eulers-totient.html` exists as a single self-contained file with inline `<style>` and one inline IIFE `<script>`; no new JS or CSS file was created and no existing tool file was edited.
    - On load with no interaction the page shows a completed walk for n = 12 ending in `φ(12) = 4`, with 4 coprime cells and 7 eliminated cells.
    - `data-phi` matches an independently-computed φ for every n in the behaviour block, and coprime plus eliminated cells always account for exactly n−1.
    - `euclidStepsFor` is the only gcd computation in the file and was duplicated from the Euclidean Algorithm tool rather than imported.
    - `applyEvent` is the only function that writes a k-cell class, a chain line or the tally, and the answer line prints the same counter `applyEvent` incremented.
    - The literal-colour, external-resource, persistence, closed-form and nav gates all pass.
    - n below 2 is rejected with a message and no state change; n above the cap is clamped with a message.
  </acceptance_criteria>
  <done>A learner can open the new page and watch φ(12) = 4 fall out of eleven gcd computations, with no formula anywhere on the page.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Add the playback controls and preset chips</name>
  <files>Eulers Totient/eulers-totient.html</files>
  <read_first>
    - `Eulers Totient/eulers-totient.html` — what Task 1 actually shipped, especially `buildEvents`, `applyEvent`, `resetScan`, `instantFinish`, `buildRun` and the module-scoped state.
    - `Euclidean Algorithm/euclidean-algorithm.html` lines 951-1192 — `frameStep`/`play`/`pause`/`stepOnce`/`instantFinish`/`resetPlayback`, the chain click-to-inspect handlers, and the preset-chip wiring at lines 1149-1158.
    - `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` lines 658-681 — `speedToEventsPerFrame` and the burst `frameStep`.
  </read_first>
  <behavior>
Playback, with n = 12 and its 31 events (20 division events, 11 verdicts):
- From a freshly Reset state, pressing Step exactly 31 times lands the identical final DOM that pressing Instant once lands: same 4 coprime cells, same 7 eliminated cells, same `data-phi="4"`, same `data-count="4"`.
- Pressing Step a 32nd time changes nothing and leaves Step disabled.
- Pressing Instant twice in a row leaves `data-count="4"` both times — no k is ever tallied twice.
- Pressing Play then immediately Pause then Instant also lands `data-phi="4"`: a partially-played run finishes correctly rather than double-counting the events already applied.
- Pressing Run (or a chip) while Play is running abandons the old run cleanly: after a deferred tick there is at most one `is-current` cell, the grid holds exactly the new n−1 cells, and nothing was recorded by `window.onerror`.
- Reset returns the grid to all-pending, empties the chain, the verdict, the answer and the tally, and re-enables Step.

Speed: speeds 1 through 7 are dwell-gated so a single division line is readable; speeds 8 through 10 burst multiple events per frame so a large n still finishes. Use these two tables, in the shape the two source tools already use:
`SPEED_MS = {1:1400, 2:1000, 3:700, 4:450, 5:280, 6:160, 7:90, 8:0, 9:0, 10:0}` and `EVENTS_PER_FRAME = {1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1, 8:6, 9:40, 10:100000}`. A nonzero dwell means one event per dwell period; a zero dwell means `EVENTS_PER_FRAME[v]` events per animation frame. Reuse the repo's shared `SPEED_LABELS` map verbatim.

Chips, each landing its n in one click and running it: `12 · 2²·3` (φ = 4), `13 · prime` (φ = 12), `16 · 2⁴` (φ = 8), `30 · 2·3·5` (φ = 8), `36 · 2²·3²` (φ = 12), `97 · prime` (φ = 96), `210 · 2·3·5·7` (φ = 48). The 16/30 pair shows two different n with the same φ; the 13/36 pair shows the same φ from a prime and from a composite; 97 shows a prime's φ = n−1 at a size where the walk is worth watching.
  </behavior>
  <action>
Extend the file Task 1 created. Add no new module-scoped state beyond `playing`, `rafId` and `lastAdvance` — the event list, step index, coprime counter and `generation` already exist.

Markup: extend the `.btn-row` so it reads Run, Play, Step, Instant, Reset in that order, using the same ids, labels and glyphs the Euclidean Algorithm and Sieve tools already use (`playBtn` `▶ Play`, `stepBtn` `⏭ Step`, `instantBtn` `⏩ Instant`, `resetBtn` `↺ Reset`). Add the speed control as a `.field-row` holding a `.speed-wrap` with `<input id="speedInput" type="range" min="1" max="10" value="4">` and a `#speedLabel`, copied in shape from the Euclidean Algorithm tool. Fill the `#presetChips` placeholder with the seven chips from the behaviour block, each a `<button type="button" class="chip" data-n="…">`.

Script: add `SPEED_LABELS`, `SPEED_MS` and `EVENTS_PER_FRAME` next to the existing constants, then the playback block, modelled function-for-function on the Euclidean Algorithm tool's:
  - `advanceOne()` captures `generation` on entry, applies `events[stepIndex]` through `applyEvent`, increments `stepIndex`, returns early if `generation` moved, and calls `landAnswer()` when the index reaches the end.
  - `frameStep(ts)` bails if not playing; reads the speed; when `SPEED_MS[v]` is nonzero it gates a single `advanceOne()` on the dwell having elapsed since `lastAdvance`, and when it is zero it loops `advanceOne()` up to `EVENTS_PER_FRAME[v]` times or until the events run out; then pauses at the end or requests the next frame.
  - `play()` no-ops when already playing or when there are no events; rewinds through `resetScan()` first when the run is already finished, so Play always plays without a manual Reset; sets the Pause label and disables Step.
  - `pause()`, `stepOnce()`, `instantFinish()` (extend the one Task 1 wrote: pause first, then reveal the remainder) and `resetScan()` (extend it to restore the button labels and enable Step) follow the same tool's versions, including the button-state handling in `pause()` when it is called while not playing.
Make Step and Play mutually consistent: Step is disabled while playing and re-enabled on pause, and both routes go through `advanceOne()` so they cannot diverge.

Wire the chips exactly the way that tool wires its own: on click, write `data-n` into `#nInput` and call `buildRun()`.

Add click-to-inspect on the grid, echoing that tool's chain click handler: clicking a `.k-cell` after its verdict has landed pauses playback and re-renders that k's division chain and verdict into the chain panel from `euclidStepsFor(n, k)`, without touching any cell's classification and without changing the tally. Make the cells focusable and give Enter the same effect. A cell whose verdict has not landed yet is not clickable.

Finally, extend `resetScan()` so it also clears `lastAdvance` and cancels any in-flight frame, and confirm `buildRun()` still ends by landing the answer immediately — a page that opens mid-animation is not what the other tools do.
  </action>
  <verify>
    <automated>Behavioural gate via headless Chrome against a scratchpad copy, built the same way as Task 1's harness, writing `PASS <assertionCount>` or `FAIL <first mismatch, expected vs got>` into `document.body.dataset.totientPlay`. Assert, in order: (1) `#presetChips` holds exactly 7 `.chip`, and their `data-n` values are exactly `12,13,16,30,36,97,210`; (2) clicking each chip in turn lands `data-phi` equal to `4,12,8,8,12,96,48` respectively, with the `is-coprime` cell count equal to the same number each time; (3) at n = 12, clicking `#resetBtn` leaves zero `is-coprime`, zero `is-eliminated`, zero `.eq-line`, `#answerLine` with no `data-phi` value, and `#tallyLine` at `data-count="0"`; (4) from that reset state, clicking `#stepBtn` 31 times produces `data-phi="4"`, `data-count="4"`, `is-coprime` `data-k` set exactly `1,5,7,11`, and a 32nd click leaves all of those byte-identical with `#stepBtn` disabled; (5) capture the full `#kGrid.innerHTML` from that stepped run, then Reset and click `#instantBtn` once and capture it again — the two are identical; (6) Reset, click `#instantBtn` twice in a row, and assert `data-count="4"` and exactly 11 classified cells — no double tally; (7) Reset, click `#stepBtn` 5 times, then `#instantBtn` once, and assert `data-phi="4"` with exactly 20 `.eq-line` appended in total across the run as counted by a MutationObserver on `#chain` — no division line replayed; (8) click the 210 chip, click `#playBtn`, then immediately click the 12 chip, and after a deferred tick assert at most one `is-current` cell, exactly 11 `.k-cell`, `#playBtn` reading the Play label, and nothing recorded by `window.onerror`; (9) with `#speedInput` set to `10`, clicking Play on n = 97 reaches `data-phi="96"` within a 10-second virtual-time budget; (10) after a finished run at n = 12, clicking the cell with `data-k="7"` renders exactly 4 `.eq-line` whose remainder spans read `5,2,1,0` in order, leaves `#verdictLine` non-empty, and leaves `data-count="4"` and every cell's classification unchanged; clicking the cell with `data-k="8"` renders exactly 2 `.eq-line` with remainder spans `4,0`; (11) `window.onerror` recorded nothing. Run with `google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir="$(mktemp -d)" --virtual-time-budget=30000 --dump-dom "file://$SP/tool/harness.html" > "$SP/dom.html"`, then assert `grep -q 'data-totient-play="PASS' "$SP/dom.html" || { grep -o 'data-totient-play="[^"]*"' "$SP/dom.html"; exit 1; }` and print the assertion count. Before trusting a green run, prove the harness is not vacuous: temporarily point assertion (5) at a deliberately wrong expectation and confirm it reports `FAIL`.

Re-run all five static gates from Task 1 unchanged against `Eulers Totient/eulers-totient.html`; all must still pass.</automated>
    <fails_when>the dumped DOM does not carry `data-totient-play="PASS`, or any Task 1 static gate now produces output it should not, or the vacuity check does not produce a `FAIL` when fed a deliberately wrong expectation</fails_when>
    <human-check>Open the tool, press Reset then Play at the default speed. You should watch one division line appear at a time, each k's chain building and then its cell either lighting up as a survivor or being struck out, with the running count ticking up. Pause mid-walk, press Step a few times, then press Instant — the answer should land correctly, not doubled. Drag the speed to maximum, click the 210 chip and press Play; it should finish quickly and still read φ(210) = 48. Click a struck-out cell after the walk and confirm its own division chain comes back without disturbing the count.</human-check>
  </verify>
  <acceptance_criteria>
    - Play, Pause, Step, Instant and Reset all exist and behave the way the Sieve and Fermat's Method tools' equivalents behave, with Step disabled during playback.
    - 31 Steps and one Instant produce byte-identical grid markup at n = 12.
    - No event is ever applied twice: Instant after a partial run, and Instant pressed twice, both leave `data-count="4"`.
    - A Run or chip click during playback bumps `generation`, cancels the in-flight frame and leaves at most one `is-current` cell with no console error.
    - Seven chips exist with the exact `data-n` values listed, each landing its φ in one click.
    - Clicking a classified k-cell re-renders that k's chain without altering any classification or the tally.
    - All five Task 1 static gates still pass.
  </acceptance_criteria>
  <done>A learner can drive the walk at their own pace — one division at a time, or the whole thing at once — and every route lands the same φ(n).</done>
</task>

<task type="auto">
  <name>Task 3: Register the tool site-wide — hub card and all fourteen nav bars</name>
  <files>index.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factor Tree/factor-tree.html, Venn Diagram/venn-diagram.html, Euclidean Algorithm/euclidean-algorithm.html, Chinese Remainder Theorem/chinese-remainder-theorem.html, Equivalence Wheel/equivalence-wheel.html, Cayley Table/cayley-table.html, Square And Multiply/square-and-multiply.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, RSA/rsa.html, Fermats Method/fermats-method.html, Shors Algorithm/shors-algorithm.html</files>
  <read_first>
    - `index.html` — the `site-nav` block at lines 155-169, the card grid at lines 186-321, the hero paragraph at line 182 and the footer at line 324.
    - `Euclidean Algorithm/euclidean-algorithm.html` lines 254-268 — the canonical tool-page nav block, showing the `../` href form and the bare-filename `is-active` self-link.
    - `.planning/quick/260928-fdz-reorder-the-site-menubar-nav-and-homepage-card-grid-if-it-ha/260928-fdz-SUMMARY.md` — how the last site-wide nav change was executed and verified (mechanical per-file anchor reorder plus a parse-and-compare gate), and why it was done that way.
  </read_first>
  <behavior>
Every one of the fourteen pages ends this task carrying the same fourteen nav entries in the same order, with the new one eighth:

Home, Sieve of Eratosthenes, Factor Tree, Venn Diagram, Euclidean Algorithm, Chinese Remainder Theorem, Equivalence Wheel, Euler's Totient, Cayley Table, Square and Multiply, Diffie-Hellman, RSA, Fermat's Method, Shor's Algorithm.

On `index.html` every href is directory-relative with no leading `../`, and Home carries `is-active`. On each tool page every href is prefixed `../` except that page's own, which is the bare filename and carries `is-active`. Exactly one `is-active` per page.

`index.html`'s card grid gains a thirteenth card in the same relative position — after the Equivalence Wheel card, before the Cayley Table card. Its href is `Eulers Totient/eulers-totient.html`, its `.icon` is the Greek letter phi as text (no emoji, no new SVG, no new CSS rule), its `<h2>` reads `Euler's Totient Function`, and its blurb explains that the tool counts the numbers below n that share no factor with n by running the Euclidean algorithm against every one of them, rather than by applying a formula. The card's `.go` line matches its siblings.

The hero paragraph's count word and the footer's count word both move from twelve to thirteen.
  </behavior>
  <action>
Insert the new nav anchor into all thirteen existing pages and add the hub card, changing nothing else.

For the nav: in each of the thirteen files, insert exactly one new `<a>` line between the existing Equivalence Wheel anchor and the existing Cayley Table anchor. On `index.html` the href is `Eulers Totient/eulers-totient.html`; on every tool page it is `../Eulers Totient/eulers-totient.html`. The label is `Euler's Totient` and the class is `site-nav-link` with no `is-active` — none of these thirteen pages is the new page. <!-- planner-discipline-allow: site-nav-link --> Do not touch, reorder, reindent or reword any other anchor in any file, and add no HTML comment to any of them; the diff for a tool page is exactly one added line.

Because this is thirteen mechanical edits of the same shape, do it the way the last site-wide nav change was done: drive it with a small throwaway `node` or `python3` script that locates the Equivalence Wheel anchor line in each file and inserts the new line after it, preserving the file's existing indentation, rather than hand-editing thirteen files. Assert in the script that each file had exactly one Equivalence Wheel anchor before the insert and exactly fourteen `site-nav-link` occurrences after it, and have it refuse to write a file that does not match.

For the hub card: add one `<a class="card" href="Eulers Totient/eulers-totient.html">` block to `index.html` immediately after the Equivalence Wheel card's closing tag and before the Cayley Table card, following the structure of its plain-icon siblings — a `.icon` div, an `<h2>`, a `<p>` blurb, and the `.go` span with the same arrow text. The icon is the Greek phi character as the div's text content; add no new CSS rule and no inline style for it, so it inherits the existing `.card .icon` sizing.

Also update `index.html`'s hero paragraph and its footer line so both count words read thirteen rather than twelve. Leave every other word of both untouched.

Do not edit `Eulers Totient/eulers-totient.html` in this task — Task 1 already wrote its own fourteen-entry nav with its own `is-active` self-link, and this task's verifier covers it.
  </action>
  <verify>
    <automated>Static parse-and-compare gate over all fourteen pages, run as a single throwaway `node` script:
1. Build the expected label sequence once: `['Home','Sieve of Eratosthenes','Factor Tree','Venn Diagram','Euclidean Algorithm','Chinese Remainder Theorem','Equivalence Wheel',"Euler's Totient",'Cayley Table','Square and Multiply','Diffie-Hellman','RSA',"Fermat's Method","Shor's Algorithm"]`.
2. For each of the fourteen files, extract every `site-nav-link` anchor with a regex capturing href, class and text, and assert: exactly 14 anchors; their text sequence deep-equals the expected sequence; exactly one anchor carries `is-active`; for `index.html` that anchor is Home and no href starts with `../`; for each tool page that anchor's href is that page's own bare filename and every other href starts with `../`.
3. Assert the new anchor's href is `Eulers Totient/eulers-totient.html` on `index.html` and `../Eulers Totient/eulers-totient.html` on all thirteen tool pages.
4. Assert `index.html` holds exactly 13 `class="card"` occurrences, that the card hrefs appear in the same relative order as the nav hrefs minus Home, and that the Euler card's href sits immediately between the Equivalence Wheel card's and the Cayley Table card's.
5. Assert `index.html`'s hero paragraph and footer each contain the word `thirteen` (case-insensitively) and neither contains `twelve`.
Print `NAV-CARD-REGISTRATION-OK` and the per-file anchor count only when every assertion holds; otherwise print the first failing file and expectation and exit nonzero. Prove the gate is not vacuous by temporarily removing the new anchor from one tool page and confirming it names that file and exits nonzero.

Collateral gate: `git diff --stat` after the commit touches exactly the thirteen files listed in this task, and `git diff` shows exactly one added line per tool page — run `git diff --numstat` and assert every tool page row reads `1 0`.

Link gate: for every href in every one of the fourteen nav blocks, resolve it relative to its own file and assert the target exists on disk, via a `node` script over `fs.existsSync`. This catches a directory-name typo in `Eulers Totient` the moment it is introduced.</automated>
    <fails_when>the gate does not print `NAV-CARD-REGISTRATION-OK`, or any tool page's numstat row is not `1 0`, or any nav href fails to resolve to a file on disk, or the vacuity check does not name the sabotaged file</fails_when>
    <human-check>Open `index.html`. The menubar should read straight through the learning path with Euler's Totient sitting between Equivalence Wheel and Cayley Table, and a thirteenth card with a phi glyph should sit in the same place in the grid. Click it, confirm it opens the new tool with its own nav entry highlighted, then click back to Home and to two or three other tools and confirm the menubar never shifts position between pages.</human-check>
  </verify>
  <acceptance_criteria>
    - All fourteen pages carry the identical fourteen-label nav sequence with Euler's Totient eighth, exactly one `is-active` each, and correct relative href form for their location.
    - Each of the thirteen existing tool pages has a one-line diff; no existing anchor was reordered, reindented or reworded.
    - `index.html` has thirteen cards with the new one between Equivalence Wheel and Cayley Table, using a text phi icon and no new CSS rule.
    - The hero paragraph and footer both say thirteen.
    - Every nav href on every page resolves to a file that exists on disk.
  </acceptance_criteria>
  <done>The site presents thirteen tools consistently from every page, and a learner can find Euler's Totient exactly where the two tools it builds on would lead them to look.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user → `#nInput` / preset chips | The only untrusted input the new page accepts. Parsed by `readN()` into a bounded integer before it reaches any loop, grid build or event list. |
| URL query string → `#xrefLink` href | The page writes a modulus it computed itself into an outbound same-repo link. No inbound query parameter is read by this page. |
| *(no others)* | The page makes no network request, opens no storage of its own, loads no new external resource, and runs no third-party code. |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-kam-01 | Denial of Service | `buildEvents(n)` / `buildGrid(n)` | medium | mitigate | `readN()` clamps n to `MAX_N = 1000` before either is called, bounding the grid at 999 cells and the event list at roughly 3,500 entries — the same order as the Sieve's default grid. The chain panel holds only the current k's chain, so it does not grow with n. |
| T-kam-02 | Denial of Service | `frameStep` animation loop | low | mitigate | `EVENTS_PER_FRAME` is capped by the event list length, and `pause()` cancels the pending frame; `generation` guarantees an abandoned run's callback writes nothing, so a rapid chip-mashing sequence cannot accumulate concurrent loops. |
| T-kam-03 | Tampering | `applyEvent` chain/verdict text nodes | low | mitigate | Every value-derived string is written with `textContent`, and the one `innerHTML` assignment permitted is the constant empty string used to clear the chain. Values reaching the DOM are integers produced by `euclidStepsFor` from an already-parsed, clamped n. |
| T-kam-04 | Information Disclosure | `#xrefLink` query string | low | accept | The only value written into the link is the modulus the user just typed, going to a sibling page in the same repo, with `encodeURIComponent` applied. There is nothing sensitive on the page to disclose. |
| T-kam-05 | Tampering | thirteen mechanical nav edits | medium | mitigate | The insert is script-driven with a pre-write assertion per file, and the parse-and-compare gate plus the `1 0` numstat check prove no existing anchor was altered in any of the thirteen files. |
| T-kam-SC | Tampering | npm/pip/cargo installs | high | mitigate | Not applicable and enforced by absence: this plan installs no package and adds no dependency. The external-resource gate in Task 1 proves the new file loads nothing beyond Google Fonts and the repo's own assets. |
</threat_model>

<verification>
Run in order after all three tasks are committed:

1. Task 1's five static gates against `Eulers Totient/eulers-totient.html` — literal colour, external resource, persistence, closed form, nav count.
2. Task 2's playback harness — the full 11-assertion behavioural gate.
3. Task 3's registration gate — `NAV-CARD-REGISTRATION-OK` plus the on-disk href resolution check across all fourteen pages.
4. A final cross-check that the three tasks did not drift apart: with `n` set to each of 12, 13, 16, 30, 36, 97 and 210, the answer reached by Play at speed 10 equals the answer reached by Instant equals the answer reached by stepping to the end, and all three equal the harness's independent closed-form oracle.
5. `git status --porcelain` shows no unexpected untracked or modified file outside the fourteen in this plan plus this plan's own `.planning/` artifacts.
</verification>

<success_criteria>
- A thirteenth tool exists at `Eulers Totient/eulers-totient.html`, self-contained, palette-token-only, with no dependency beyond Google Fonts and the repo's own `assets/`.
- It computes φ(n) by walking k = 1 … n−1 with a live Euclidean algorithm per k and tallying the coprimes; the closed-form product formula appears nowhere in the file.
- φ matches an independent oracle for every n in the behaviour vectors, and Play, Step and Instant all land the same answer.
- Play, Pause, Step, Instant, Reset and the speed control behave as the Sieve and Fermat's Method tools' equivalents do, with the `generation` guard intact.
- Seven preset chips cover a prime, a prime power, products of distinct primes, and two collisions in φ.
- The tool is registered on `index.html`'s card grid and in all fourteen nav bars, eighth in the learning-path order, and every nav href on every page resolves.
</success_criteria>

<output>
Create `.planning/quick/260929-kam-add-a-new-browser-tool-called-euler-s-to/260929-kam-SUMMARY.md` when done
</output>
