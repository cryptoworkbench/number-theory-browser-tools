---
phase: quick-261005-ing
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - "Factor Tree/factor-tree.html"
  - "assets/i18n/factor-tree.js"
  - ".planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js"
autonomous: true
requirements: [QUICK-FT-RANDOM-01]

estimate:
  tokens: 60000
  raw_tokens: 60000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "The Factor Tree input row shows a Randomize button directly to the right of Grow the Tree, with the same height, corner radius and font as the row's other controls, styled as a secondary action (per RD-1, RD-2)"
    - "The button's label is translated in all sixteen languages and matches the word the Equivalence Wheel and Cayley Table already use for Randomize in each language; ru and el are written in their own script (per RD-3)"
    - "Clicking Randomize writes a new number into the input and grows its tree exactly as Grow the Tree would: same message, same tree, same equation, same mirror lines once grown (per RD-5, RD-7)"
    - "Every randomized number is a composite between 12 and 9999 with at least three prime factors counted with multiplicity, and it is never the number whose tree is currently shown (per RD-4)"
    - "Randomize works in both Classic and Balanced mode and keeps the current mode (per RD-6)"
    - "A randomized tree starts with nothing mirrored, and its mirror lines arm after it finishes growing, like any other new tree (per RD-7)"
    - "assets/nt-*.js, assets/i18n/site.js, assets/i18n/hub.js and every other page are untouched; the existing mirror probe, i18n-check --all, shadow-check --all and the phase-07 harness still pass (per RD-8)"
  artifacts:
    - "Factor Tree/factor-tree.html"
    - "assets/i18n/factor-tree.js"
    - ".planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js"
  key_links:
    - "<button id=\"randomBtn\" type=\"button\" data-i18n=\"factorTree.randomize\"> sits in .controls immediately after #goBtn; applyStaticDom (NT.i18n) translates it on load and on every language switch, so no onLangChange code is needed"
    - "randomBtn click -> pickRandomN() (NT.core.randomInt + NT.core.primeFactors, excluding treeView.root.value) -> numInput.value = n -> factorize(numInput.value), which is the Go button's own call"
    - "factorize -> renderTree -> clearStage() sets treeView = null and generation++ drops the old tree's pending reveal, arm and mirror-settle timers, so the randomized tree arms its mirror lines fresh"
---

<objective>
Give the Factor Tree tool a Randomize button. Clicking it picks a random composite with at least three prime factors, writes it into the number input, and grows its tree through the same code path as Grow the Tree.

User request, verbatim: "give the tool 'Factor Tree' a 'Randomize' button"

How it works today (the planner checked this in the source; line numbers are from the current file):
- `Factor Tree/factor-tree.html` lines 297-300: `.controls` holds `#numInput` and `<button id="goBtn" data-i18n="factorTree.grow">Grow the Tree</button>`. CSS for `#numInput` is at lines 43-59 and for `#goBtn` at lines 60-73: 40px high, `var(--radius-ctl)`, `var(--font-sans)`, weight 600, .9375rem. `.controls` is `display:flex; gap:10px; flex-wrap:wrap`.
- The import block is at lines 323-326. `NT.core` is imported as `const { primeFactors } = NT.core;`. `NT.core.randomInt(min, max)` returns an integer from min to max inclusive, as `min + Math.floor(Math.random() * (max - min + 1))` (`assets/nt-core.js` line 215).
- Go is wired at line 701 as `factorize(numInput.value)`. A chip click (lines 705-711) sets `numInput.value` and calls `factorize`. `factorize` (lines 659-699) bumps `generation`, validates, sets the message and calls `renderTree`. The tool persists nothing: there is no localStorage, so there is nothing to persist for Randomize either.
- `renderTree` calls `clearStage()`, which sets `treeView = null`, then builds the SVG synchronously and sets `treeView = view`, where `view.root.value` is the number drawn. Mirror lines arm at `finalDelay + MIRROR_ARM_AFTER_MS` behind the `generation` guard (quick 261005-hz0).
- `onLangChange` (lines 737-742) re-renders message, Balanced note, chips and mirror labels. Static `data-i18n` text is re-bound automatically by `applyStaticDom`.
- `BALANCED_MAX_N` is 1,000,000 and the Classic cap is 10^12, so any number up to 9999 is valid in both modes.
- The existing translations of "Randomize" live in `assets/i18n/equivalence-wheel.js` and `assets/i18n/cayley-table.js` as `randomizeLabel`, worded the same in both files.

Design decisions (these are the planner's choices; the executor implements them as written):
- RD-1 (placement and markup): one new element right after `#goBtn` inside `.controls`: `<button id="randomBtn" type="button" data-i18n="factorTree.randomize">Randomize</button>`. The id follows the page's camelCase `goBtn`/`numInput` naming. The fallback text is the en value, so i18n-check's en-parity holds.
- RD-2 (style): a secondary button with the same metrics as `#goBtn`, so the row reads as one primary action (Grow) plus one secondary action (Randomize). `#randomBtn` gets height 40px, padding 0 18px, border-radius `var(--radius-ctl)`, border 1px solid `var(--panel-border-strong)`, background `var(--surface)`, color `var(--text)`, font-family `var(--font-sans)`, font-weight 600, font-size .9375rem, cursor pointer, and a transition on border-color and color using `var(--ease-ctl)`. `#randomBtn:hover` sets border-color and color to `var(--accent)`. The keyboard focus ring comes from site.css's shared `button:focus-visible` rule. No literal colour anywhere.
- RD-3 (wording): new key `factorTree.randomize`. In every language it takes exactly the value of `wheel.randomizeLabel` (which equals `cayley.randomizeLabel`): nl Willekeurig · en Randomize · de Zufällig · fr Aléatoire · es Aleatorio · it Casuale · pl Losowo · pt-BR Aleatório · pt-PT Aleatório · sv Slumpa · nb Tilfeldig · ro Aleatorizează · hu Véletlenszerű · lv Nejauši · ru Случайно · el Τυχαία. The longer "New random example" phrasing (`randomize` in those files) is not used, because this button sits beside a short verb button in a one-line input row. No value equals the English one, so the IDENTICAL-TO-EN gate needs no exemption.
- RD-4 (which number): `pickRandomN()` draws uniformly from 12 to 9999 with `randomInt(RANDOM_MIN, RANDOM_MAX)` and accepts the first draw n for which `primeFactors(n).length >= RANDOM_MIN_FACTORS` (3) and n differs from the shown number. The shown number is `treeView ? treeView.root.value : null`, the number whose tree is on the stage now. It allows at most `RANDOM_TRIES` (200) draws. About 61% of the range qualifies, so the fallback is unreachable in practice. The fallback scans upward from `RANDOM_MIN` and returns the first n that qualifies and differs from the shown number (12, or 16 when 12 is shown), so the function always terminates. The 9999 ceiling keeps the worst case (8192 = 2^13: 26 leaves, depth 13) inside the 600px canvas, where the existing renderTree sizing already copes, as the existing 1024 chip shows.
- RD-5 (same code path as Go): the click handler sets `numInput.value = n` and then calls `factorize(numInput.value)`, the Go button's exact call. Message, tree, equation, Balanced/Classic handling and mirror arming all come from the unchanged `factorize`/`renderTree`. No persistence is added, because the tool has none.
- RD-6 (mode): Randomize keeps the current mode and uses the same range in both, since 9999 is below `BALANCED_MAX_N`. A later mode switch re-grows the randomized number, as it does for any typed number.
- RD-7 (mirror coexistence): every Randomize click goes through `factorize`, so `generation` is bumped and `clearStage()` nulls `treeView`. An old tree's pending arm and settle timers are dropped, and the new tree starts with no axes, then arms fresh with every `aria-pressed` false. No mirror code changes.
- RD-8 (scope): no edits to `assets/nt-*.js`, `assets/i18n/site.js`, `assets/i18n/hub.js`, `assets/i18n/equivalence-wheel.js`, `assets/i18n/cayley-table.js`, `.planning/phases/06-multi-language-support/i18n-config/factor-tree.json`, any other page or any doc. Randomize adds no `?n=` deep-link change and no keyboard shortcut. CLAUDE.md is unchanged because no module, key contract or convention changes.

Output: the Randomize button in `Factor Tree/factor-tree.html`, the `randomize` key in `assets/i18n/factor-tree.js`, and a dev-only headless-Chrome probe at `.planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js`, modelled on the 261005-hz0 mirror probe.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md
@assets/i18n/factor-tree.js

The source page path has a space, so read it directly: `Factor Tree/factor-tree.html`. Line map: 60-73 `#goBtn` CSS; 297-300 `.controls` markup; 314-319 script includes (nt-core.js is already included); 323-326 import block; 329-336 element lookups; 338-342 module-scope state and mirror constants; 407-411 `clearStage`; 426-551 `renderTree`; 659-699 `factorize`; 701-711 Go/Enter/chip wiring; 737-742 `onLangChange`.

Probe template to copy the shape of: `.planning/quick/261005-hz0-factor-tree-drop-prime-from-header-title/mirror-probe.js`. Copy its `loadDicts` (vm-evaluates `assets/i18n/*.js` in a context whose `NT.i18n.register(ns, dict)` stores each dict), `nodeScenario`, `buildSite` (copies `assets/` plus the page into `harness.mkScratch`, then injects a probe `<script>` and a `<pre>` before `</body>`), `runChrome` (`google-chrome --headless=new ... --dump-dom` with `harness.chromeEnv()`), `unescapeHtml`, `runPage` and `main`, which counts PASS/FAIL lines against `EXPECTED`. The harness is `.planning/phases/07-shared-js-module-refactor/harness.js`. Do not require `i18n-check.js` from the probe; the hz0 plan recorded that its module.exports throws on require.

The Randomize translations to reuse are the `randomizeLabel` lines in `assets/i18n/equivalence-wheel.js` (lines 42, 90, 138, ... in each language block); RD-3 already lists them.
</context>

<tasks>

<task type="tracer">
  <name>Task 1: Tracer: a translated Randomize button in the input row grows a random composite (at least 3 prime factors) through the Go path, probe-verified end to end</name>
  <files>assets/i18n/factor-tree.js, Factor Tree/factor-tree.html, .planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js</files>
  <read_first>Factor Tree/factor-tree.html, assets/i18n/factor-tree.js, .planning/quick/261005-hz0-factor-tree-drop-prime-from-header-title/mirror-probe.js</read_first>
  <action>
A. Dictionary, per RD-3. In `assets/i18n/factor-tree.js`, add `randomize` to each of the sixteen language blocks, directly after `grow`, using the value from RD-3's list. That is exactly the block's own `wheel.randomizeLabel` text from `assets/i18n/equivalence-wheel.js`, copied byte for byte with the same quote style conventions the file already uses. Write ru Случайно and el Τυχαία entirely in their own script. In the file's header comment, add "the Randomize button (randomize)" to the list of what the namespace holds, next to the Grow button. Do not edit `assets/i18n/equivalence-wheel.js`, `assets/i18n/cayley-table.js` or `assets/i18n/site.js` (RD-8).

B. Markup and CSS in `Factor Tree/factor-tree.html`, per RD-1 and RD-2. Directly after the `#goBtn` element inside `.controls`, add `<button id="randomBtn" type="button" data-i18n="factorTree.randomize">Randomize</button>` on its own line, with the same indentation and attributes in exactly that order. In the `<style>` block, directly after the `#goBtn:hover` rule, add the `#randomBtn` and `#randomBtn:hover` rules described in RD-2. Every colour is a `var()` token: no hex, no rgb/rgba/hsl/hsla function and no named colour. Do not touch the `@media (max-width:480px)` rule; `.controls` already wraps.

C. Script, per RD-4, RD-5 and RD-6.
- Change the NT.core import line to `const { primeFactors, randomInt } = NT.core;`, with names sorted. Never declare a local `randomInt` or `primeFactors`, and never assign to an NT member.
- Under the `goBtn` lookup, add `const randomBtn = document.getElementById('randomBtn');`.
- Next to the `MIRROR_*` constants, add `const RANDOM_MIN = 12;`, `const RANDOM_MAX = 9999;`, `const RANDOM_MIN_FACTORS = 3;` and `const RANDOM_TRIES = 200;`.
- Add `pickRandomN()` just before the Go wiring, with a one-line section comment in the file's `// ---------- Name ----------` style. First it computes `shown = treeView ? treeView.root.value : null`. It loops up to `RANDOM_TRIES` times: draw `n = randomInt(RANDOM_MIN, RANDOM_MAX)`, and return n if `n !== shown && primeFactors(n).length >= RANDOM_MIN_FACTORS`. If no draw qualifies, it scans n upward from `RANDOM_MIN` to `RANDOM_MAX` and returns the first n meeting the same two conditions. Call `randomInt` exactly once per draw. The probe in Task 2 stubs `Math.random` and counts those calls.
- Wire `randomBtn.addEventListener('click', ...)` directly after the Go listener. The handler takes `n = pickRandomN()`, sets `numInput.value = n` and calls `factorize(numInput.value)`, which is the Go button's own call (RD-5).
- Do not change `factorize`, `renderTree`, `clearStage`, the mirror functions, the chips or `onLangChange`. The button label is static `data-i18n` text, so `applyStaticDom` re-binds it on every language switch. Add no `innerHTML`, no new translate call and no storage.

D. Probe at `.planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js`. Copy mirror-probe.js's structure (see context). Output goes to `<pre id="ing-out">`, the scratch prefixes are `ing-site-` and `ing-profile-`, the summary line is `ING-PROBE PASS (N scenarios)` / `ING-PROBE FAIL (...)`, and the scratch copy lives at `Factor Tree/factor-tree.html`. Open the page at its file URL plus `?lang=en` with `--virtual-time-budget=60000` and `--window-size=1280,900`, and do a single Chrome run (no reduced-motion run is needed). `loadDicts` vm-evaluates `site.js`, `factor-tree.js`, `equivalence-wheel.js` and `cayley-table.js`.

Node-side scenarios (print PASS/FAIL lines before Chrome runs):
- N1 randomize-catalog: for all sixteen languages, `factorTree.randomize` is a non-empty string equal to `wheel.randomizeLabel` and to `cayley.randomizeLabel` for that language. Every non-en value differs from en. The ru value matches only Cyrillic letters and spaces, and the el value only Greek letters and spaces.
- N2 static-markup: the page source matches the `#goBtn` element, followed only by whitespace, then exactly `<button id="randomBtn" type="button" data-i18n="factorTree.randomize">Randomize</button>`. Both sit inside the `<div class="controls">` element.
- N3 import-line: the page source contains exactly the line `const { primeFactors, randomInt } = NT.core;`, and contains no local function declaration or `const`/`let`/`var` binding named `randomInt` or `primeFactors` other than inside that import line.
- N4 no-literal-colour: every line of the `<style>` block that mentions `randomBtn` contains no hex colour, no rgb/rgba/hsl/hsla function and no named colour. Use the same regex as mirror-probe.js N4, and require at least one such line.

In-page probe: a sequential step runner like mirror-probe.js. Each step is wrapped so a throw becomes a FAIL line, and lines are appended to the `<pre>` as they go. Use `waitFor(cond, ms)`, polling every 100 ms. Helpers:
- `qualifies(n)`: n is an integer, 12 ≤ n ≤ 9999 and `NT.core.primeFactors(n).length >= 3`.
- `rootLabel()`: the text of the `text` element after `.node-circle.root`.
- `leafPrimes()`: the numeric labels of every `.node-circle.prime-leaf`, sorted ascending.
- `clickRandom()`: dispatches a bubbling click on `#randomBtn` and returns `Number(numInput.value)`.

Steps:
- R1 button-translated: `#randomBtn` exists, is a `BUTTON` with type `button`, its parent is `.controls`, and its `previousElementSibling` is `#goBtn`. Its text is Randomize. For every code in `NT.i18n.SUPPORTED_LANGS`, after `NT.i18n.setLang(code)` its textContent equals `NT.i18n.translate('factorTree.randomize')`, and for every non-en code it differs from Randomize. Finish on `setLang('en')`.
- R2 click-grows-composite: record the shown root label (60 from the load example). Then `v = clickRandom()`. Immediately check that `qualifies(v)`, that v ≠ 60, that `rootLabel()` is `String(v)`, that the message text equals `translate('factorTree.msgFactors', { n: v, count: primeFactors(v).length })` and has class `info`, and that the Classic mode button still has `is-active`. Then wait up to 8000 ms for a `.equation .fac`. The first `.fac` text equals v + ' = ' + primeFactors(v).join(' × '), and `leafPrimes()` equals `primeFactors(v)`.
- R3 repeated-clicks-distinct: call `clickRandom()` 30 times in a row, synchronously. Every value qualifies, every value differs from the one before it, and at least 3 distinct values appear. Afterwards `rootLabel()` equals the last value. Then wait up to 8000 ms for `.mirror-axis` to appear, which proves the last tree grew to completion.

`EXPECTED` = 7 (N1-N4, R1-R3). The probe exits 0 only when there are exactly that many PASS lines and no FAIL line.
  </action>
  <verify>
    <automated>node .planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js && node .planning/phases/06-multi-language-support/i18n-check.js --coverage --literals --header --switcher-present --includes --no-locale-number-format "Factor Tree/factor-tree.html"</automated>
  </verify>
  <done>The probe prints `ING-PROBE PASS (7 scenarios)`:
- the Randomize label matches the Wheel/Cayley wording in all sixteen languages, and the button sits right after Grow the Tree;
- clicking it grows a new composite from 12 to 9999 with at least 3 prime factors, with the Go path's message, tree and equation;
- 30 rapid clicks never repeat the previous number.

The per-page i18n-check run passes coverage (including `randomize` in sixteen languages), literals, header, switcher, includes and no-locale-number-format.</done>
</task>

<task type="auto">
  <name>Task 2: Edge cases (shown-number and prime/semiprime rejection, bounded fallback, Balanced mode, fresh mirror lines) and full regression</name>
  <files>.planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js, Factor Tree/factor-tree.html</files>
  <read_first>.planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js, Factor Tree/factor-tree.html</read_first>
  <action>
A. Extend the in-page probe with these steps after R3. Only touch `Factor Tree/factor-tree.html` if one of them exposes a defect in Task 1's implementation of RD-4 to RD-7; record any such fix as a deviation in the SUMMARY.

Define `r(k) = (k - 12 + 0.5) / 9988` so that `randomInt(12, 9999)` returns exactly k when `Math.random()` returns `r(k)`. Every stub step restores the original `Math.random` in a `finally`, even on failure.

- R4 mirror-fresh (RD-7):
  - Use the tree from R3, whose axes are already armed. The axis count equals the number of `.node-circle.root, .node-circle.internal` circles, and every `.mirrorable` has `aria-pressed` false.
  - Click `.node-circle.root` and wait 1500 ms. Root `aria-pressed` is now true.
  - Call `old = rootLabel()`, then `v = clickRandom()`. Immediately there are no `.mirror-axis` lines and no `.mirrorable` circles, and `rootLabel()` is `String(v)` and differs from old.
  - Wait up to 8000 ms for axes. The axis count again equals the root/internal count, and every `.mirrorable` has `aria-pressed` false.
- R5 balanced-mode (RD-6):
  - Click `.mode-btn[data-mode="balanced"]`, then `v = clickRandom()`.
  - `qualifies(v)` holds, the Balanced button has `is-active`, `numInput.max` is `String(NT.layout.BALANCED_MAX_N)`, `rootLabel()` is `String(v)`, and the message equals the msgFactors translation for v.
  - Wait up to 8000 ms for `.equation .fac`. `leafPrimes()` equals `primeFactors(v)`.
  - Click `.mode-btn[data-mode="classic"]` to restore Classic.
- R6 rejection-sampling (RD-4):
  - Set `numInput.value` to '60', click `#goBtn` and check that `rootLabel()` is '60'.
  - Replace `Math.random` with a counting stub that returns r(97), r(91), r(60) and r(2310) in that order: a prime, a semiprime, the shown number, then a qualifying composite. Any further call returns r(2310).
  - `clickRandom()` returns 2310, the stub was called exactly 4 times, and `rootLabel()` is '2310'.
- R7 bounded-fallback (RD-4):
  - 2310 is now shown. Stub `Math.random` to always return r(97), so every draw is a prime.
  - `clickRandom()` returns 12, and the stub was called exactly 200 times, which pins `RANDOM_TRIES` and the single draw per try.
  - With 12 now shown and the same stub, a second `clickRandom()` returns 16 (13 is prime and 14 and 15 are semiprimes). That shows the fallback also skips the shown number.

Set `EXPECTED` to 11 (N1-N4, R1-R7).

B. Regression. Run the new probe, the 261005-hz0 mirror probe (it must still print `HZ0-PROBE PASS (26 scenarios)`), `i18n-check.js --all`, `shadow-check.js --all` and the phase-07 `harness.js`. The harness takes about 2 minutes and covers the untouched NT module contracts. All must pass unchanged. Then confirm with `git diff --stat` that only the three files in files_modified changed.
  </action>
  <verify>
    <automated>node .planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js && node .planning/quick/261005-hz0-factor-tree-drop-prime-from-header-title/mirror-probe.js && node .planning/phases/06-multi-language-support/i18n-check.js --all && node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all && node .planning/phases/07-shared-js-module-refactor/harness.js</automated>
  </verify>
  <done>The probe prints `ING-PROBE PASS (11 scenarios)`:
- a randomized tree arms fresh, unmirrored mirror lines;
- Randomize works in Balanced mode and keeps it;
- primes, semiprimes and the shown number are rejected;
- the 200-draw cap falls back deterministically to 12, then 16.

The mirror probe prints `HZ0-PROBE PASS (26 scenarios)`. `i18n-check.js --all` exits 0 on all 16 pages, `shadow-check.js --all` exits 0, and `harness.js` prints `HARNESS PASS`. `git diff --stat` lists only `Factor Tree/factor-tree.html`, `assets/i18n/factor-tree.js` and the new probe.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user click → factorize | Randomize writes a generated number into the input and feeds it to the existing validated `factorize` path |
| dictionary → DOM | the translated button label lands through `applyStaticDom`'s `data-i18n` binding |

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-ing-01 | Denial of service | `pickRandomN` rejection loop | low | mitigate | The loop is bounded by `RANDOM_TRIES` (200) and backed by a finite upward scan over 12..9999; probe R7 proves termination with an all-prime `Math.random` stub and pins the 200-draw cap |
| T-ing-02 | Denial of service | rapid Randomize clicks during growth/mirror tweens | low | mitigate | Every click goes through `factorize`, which bumps `generation`; `clearStage` nulls `treeView`, so stale reveal, arm and settle timers exit early. Probe R3 (30 rapid clicks) and R4 (Randomize mid-mirror) assert this |
| T-ing-03 | Tampering | button label text | low | mitigate | The label is static `data-i18n` text bound by `applyStaticDom` through textContent. No new `innerHTML` or translate call is added; i18n-check `--literals` and `--coverage` gate it |
| T-ing-04 | Information disclosure | `Math.random` as the number source | low | accept | The picks are educational examples with no security meaning; `NT.core.randomInt` is the project's sanctioned non-cryptographic helper |
| T-ing-SC | Tampering | npm/pip/cargo installs | high | accept | No package-manager installs in this plan: vanilla JS plus the in-repo dev harness and the system google-chrome only |
</threat_model>

<verification>
- `node .planning/quick/261005-ing-factor-tree-add-a-randomize-button/randomize-probe.js` exits 0 with 11 PASS lines.
- `node .planning/quick/261005-hz0-factor-tree-drop-prime-from-header-title/mirror-probe.js` exits 0 with 26 PASS lines.
- `node .planning/phases/06-multi-language-support/i18n-check.js --all` exits 0.
- `node .planning/phases/07-shared-js-module-refactor/shadow-check.js --all` exits 0.
- `node .planning/phases/07-shared-js-module-refactor/harness.js` prints HARNESS PASS.
- `git diff --stat` touches only the three files in files_modified.
- Optional manual check: open `Factor Tree/factor-tree.html` in a browser. A Randomize button sits right of Grow the Tree. Each click grows a new tree with at least three prime leaves. Switch to Balanced and click again. Switch language and the button label changes.
</verification>

<success_criteria>
- A Randomize button sits next to Grow the Tree, styled as a matching secondary control with var() colours only (RD-1, RD-2).
- Its label is translated in all sixteen languages with the site's existing Randomize wording (RD-3).
- Each click grows, through the Go path, a composite from 12 to 9999 with at least three prime factors that differs from the shown tree. Selection always terminates (RD-4, RD-5).
- It works in both modes, keeps the current mode, and the new tree's mirror lines arm fresh (RD-6, RD-7).
- No shared module, other dictionary, other page or doc changes; every existing check still passes (RD-8).
</success_criteria>

<output>
Create `.planning/quick/261005-ing-factor-tree-add-a-randomize-button/261005-ing-SUMMARY.md` when done. Note in it:
- RD-3: the label reuses `randomizeLabel` from the Wheel and Cayley dictionaries, not their longer "New random example" text;
- RD-4: the 12..9999 range, the at-least-3-prime-factor rule, the shown-number exclusion and the 200-draw fallback;
- RD-5: no persistence was added, because the tool has none.
</output>
