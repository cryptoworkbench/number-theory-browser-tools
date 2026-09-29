---
phase: quick-260929-twn
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Group Isomorphism/group-isomorphism.html
  - index.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Factor Tree/factor-tree.html
  - Venn Diagram/venn-diagram.html
  - Euclidean Algorithm/euclidean-algorithm.html
  - Chinese Remainder Theorem/chinese-remainder-theorem.html
  - Equivalence Wheel/equivalence-wheel.html
  - Eulers Totient/eulers-totient.html
  - Cayley Table/cayley-table.html
  - Square And Multiply/square-and-multiply.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - RSA/rsa.html
  - Fermats Method/fermats-method.html
  - Shors Algorithm/shors-algorithm.html
autonomous: true
requirements: ["quick-260929-twn"]

estimate:
  tokens: 95000
  raw_tokens: 59000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Opening `Group Isomorphism/group-isomorphism.html` directly from the filesystem shows two wheels side by side: the left one is the additive group Z/nZ, the right one is the multiplicative group (Z/mZ)*, and both always carry the same number of sectors, because the pair is only ever offered when n = phi(m)."
    - "The tool's pair list enumerates every (n, m) with m in 2..100 for which a true isomorphism (Z/nZ, +) = (Z/mZ)* exists — exactly 49 pairs — derived at runtime from the rule `(Z/mZ)* is cyclic AND n = phi(m)`, never from a hand-typed table and never from the narrower `m prime` shortcut."
    - "The list therefore contains the prime-power and twice-prime-power cases as first-class entries, not just the primes: m = 4, 6, 9, 10, 14, 18, 25, 26, 27, 49, 50, 54, 81, 98 all appear with their own n."
    - "No m whose unit group is non-cyclic is ever offered: m = 8, 12, 15, 16, 20, 21, 24, 32 and 100 are all absent from the pair list, because each fails the cyclic test rather than being blacklisted by hand."
    - "The default pair on first load is n = 12 with m = 13, the example from the request, and the right wheel's sectors read 1, 2, 4, 8, 3, 6, 12, 11, 9, 5, 10, 7 — the successive powers of the primitive root g = 2 mod 13."
    - "Selecting element k on the left wheel highlights g^k mod m on the right wheel in the same slot color, and selecting a unit u on the right wheel highlights its discrete logarithm k on the left — the correspondence is navigable from either side."
    - "Selecting two left elements a then b marks (a + b) mod n on the left and g^a · g^b mod m on the right, and the readout states that this product equals g^((a+b) mod n) — the structure-preservation that makes the bijection an isomorphism, shown rather than asserted."
    - "In the powers-of-g layout, sector i of the right wheel is g^i, so it sits at the same angle as sector i of the left wheel and the isomorphism reads as 'same position, different label'; in the numeric layout the right wheel's units run in ascending order and the same map looks scrambled."
    - "The page carries no literal color: every color resolves through var() against assets/palette.css, including its --role-* semantic layer, and the page recolors with the site's day/night toggle like every other tool."
    - "The new tool is reachable from every page on the site: all fifteen pages carry a fifteen-entry nav that includes it, and the hub carries a card for it."
    - "The tool adds no external dependency — its only absolute URLs are the two Google Fonts links every other page already uses, and its only script is its own inline IIFE plus the shared deferred theme script."
  artifacts:
    - "Group Isomorphism/group-isomorphism.html — new self-contained tool: inline style block, fifteen-entry nav, pair enumerator, primitive-root and discrete-log helpers, two single-ring SVG wheels, layout tabs, correspondence readout"
    - "index.html — nav entry, hub card with an inline two-wheel icon, icon CSS classes, and the tool-count wording moved from thirteen to fourteen"
    - "the thirteen existing tool pages — one nav entry each, inserted after the Cayley Table entry, nothing else changed"
  key_links:
    - "`isoPairs(MAX_M)` <-> `primitiveRoot(m)` <-> `totient(m)` — the pair list, the sector count of BOTH wheels and the map itself all read from one enumeration, so a pair can never be offered whose two wheels disagree in size or whose generator does not exist"
    - "`state.m` <-> the derived `n`, `g` and unit list — m is the only persisted parameter and n = phi(m) is always recomputed from it, so no stored value can ever describe a pair that is not an isomorphism"
    - "`imageOf(k)` (k -> g^k mod m) <-> `discreteLog(u)` (u -> k) — the two selection directions must be exact inverses on the offered pairs, or clicking right then left would move the highlight"
    - "the powers-of-g layout's sector ordering <-> `imageOf(k)` — in that layout the highlight on the right must land at sector index k itself; if the ordering and the map ever disagree the central teaching claim of the page silently breaks"
    - "every `var(--token)` in the new file <-> the token set declared in assets/palette.css and assets/site.css — a token that resolves to nothing paints black-on-black in one theme and is invisible in review, the exact failure Phase 01 recorded three times"
    - "the fifteen-entry nav <-> all fifteen pages — a page missed during registration becomes a dead end where the new tool vanishes from the site"
---

<objective>
Add a fourteenth tool that makes a group isomorphism visible: two side-by-side wheels, the additive group Z/nZ on the left and the multiplicative group (Z/mZ)* on the right, for every (n, m) pair where such an isomorphism genuinely exists — with element-by-element correspondence navigable from either wheel.

Purpose: the site already shows additive and multiplicative groups separately (the Equivalence Wheel's two tabs) and shows one group's whole operation table (Cayley Table). Nothing yet shows that two groups built from completely different arithmetic can be *the same group*. That is the concept this tool teaches, and a wheel pair is the natural diagram for it: both wheels always have the same number of sectors, and in the powers-of-g layout the correspondence becomes literally positional.

Output: one new self-contained page `Group Isomorphism/group-isomorphism.html`, registered in the hub and in all fifteen nav bars.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

Read before writing any code — this tool is a sibling of the first, not a fresh invention:
@Equivalence Wheel/equivalence-wheel.html
@assets/palette.css
@index.html
</context>

<grounded_facts>

Every fact below was observed live in this checkout at planning time. Nothing here is recalled or assumed.

1. **The analog tool's real path is `Equivalence Wheel/equivalence-wheel.html`** (1177 lines). The repo root `CLAUDE.md` still names it `Congruence Wheel/congruence-wheel.html` — that path no longer exists; the rename landed in quick task `260926-mbl`. Use the observed path. `ls` at the checkout root confirms the directory is `Equivalence Wheel`.

2. **`Group Isomorphism/` does not exist yet**, and `git status --porcelain --untracked-files=no` is empty — no uncommitted tracked-file edits to collide with.

3. **Fifteen pages will carry the nav.** Right now `grep -c 'site-nav-link'` returns exactly **14** for `index.html` and for each of the thirteen `*/*.html` tool pages — fourteen files, fourteen links each (Home plus thirteen tools), with no exceptions. After this plan every one of the fifteen files reports **15**.

4. **The nav insertion anchor is the Cayley Table entry**, which is present on all fourteen pages at a known line:

   | file | line | form |
   |---|---|---|
   | `index.html` | 164 | `href="Cayley Table/cayley-table.html"` (no `../`) |
   | `Cayley Table/cayley-table.html` | 264 | `href="cayley-table.html" class="site-nav-link is-active"` |
   | the other twelve tool pages | varies | `href="../Cayley Table/cayley-table.html"` |

   Nav order is Home, Sieve of Eratosthenes, Factor Tree, Venn Diagram, Euclidean Algorithm, Chinese Remainder Theorem, Equivalence Wheel, Euler's Totient, Cayley Table, Square and Multiply, Diffie-Hellman, RSA, Fermat's Method, Shor's Algorithm. The new entry goes between Cayley Table and Square and Multiply — the group-theory cluster. Hub card order was deliberately aligned to nav order by quick task `260928-fdz`, so the new card goes in the matching slot.

5. **Tool-count wording lives on exactly two lines of `index.html`**: line 183 (hero paragraph, capitalised) and line 332 (footer, lowercase). `README.md` contains no tool count and no tool list — it is a single heading line. No other file states a count.

6. **The complete isomorphism enumeration, computed live.** For `m` in 2..100, `(Z/mZ)*` is cyclic for exactly **49** values of m. Each row is `n = phi(m)` and the smallest primitive root `g`:

   ```
   n=1  m=2  g=1     n=2  m=3  g=2     n=2  m=4  g=3     n=4  m=5  g=2
   n=2  m=6  g=5     n=6  m=7  g=3     n=6  m=9  g=2     n=4  m=10 g=3
   n=10 m=11 g=2     n=12 m=13 g=2     n=6  m=14 g=3     n=16 m=17 g=3
   n=6  m=18 g=5     n=18 m=19 g=2     n=10 m=22 g=7     n=22 m=23 g=5
   n=20 m=25 g=2     n=12 m=26 g=7     n=18 m=27 g=2     n=28 m=29 g=2
   n=30 m=31 g=3     n=16 m=34 g=3     n=36 m=37 g=2     n=18 m=38 g=3
   n=40 m=41 g=6     n=42 m=43 g=3     n=22 m=46 g=5     n=46 m=47 g=5
   n=42 m=49 g=3     n=20 m=50 g=3     n=52 m=53 g=2     n=18 m=54 g=5
   n=28 m=58 g=3     n=58 m=59 g=2     n=60 m=61 g=2     n=30 m=62 g=3
   n=66 m=67 g=2     n=70 m=71 g=7     n=72 m=73 g=5     n=36 m=74 g=5
   n=78 m=79 g=3     n=54 m=81 g=2     n=40 m=82 g=7     n=82 m=83 g=2
   n=42 m=86 g=3     n=88 m=89 g=3     n=46 m=94 g=5     n=96 m=97 g=5
   n=42 m=98 g=3
   ```

   Largest n in the list is 96 (m=97). The both-examples-from-the-request rows are present: `n=6 m=7 g=3` and `n=12 m=13 g=2`. `m = 8, 12, 15, 16, 20, 21, 24, 32, 100` were each tested and are non-cyclic, so they are absent. These 49 rows are the expected output of `isoPairs(100)` and the executor must confirm the function reproduces them, not retype them.

7. **The default pair's map, computed live.** With m = 13, g = 2, the images `k -> g^k mod 13` for k = 0..11 are:
   `0->1, 1->2, 2->4, 3->8, 4->3, 5->6, 6->12, 7->11, 8->9, 9->5, 10->10, 11->7`.
   These twelve values, in that order, are the right wheel's sector labels in the powers-of-g layout.

8. **All arithmetic fits plain `Number`.** With m capped at 100 the largest intermediate product is 99·99 = 9801. No `BigInt` is needed anywhere in this tool; plain `%` is correct and matches the Equivalence Wheel, Cayley Table and Euler's Totient.

9. **Patterns to copy verbatim from `Equivalence Wheel/equivalence-wheel.html`** (read them there, do not re-derive): the pre-paint theme script (line 5), the head link order — favicon, `palette.css`, `site.css`, deferred `theme.js`, fonts preconnect, fonts stylesheet (lines 8-13), the `site-header` block with its brand SVG and theme switch (lines 315-350), `svgEl` (554), `polar` (550), `annularSectorPath` including its full-circle branch (559-576), `clamp` (577), `gcd` (579), `unitsMod` (580), the label-autosize computation (594-598), the `.mode-tab` / `.mode-tabs` CSS and tab keyboard wiring (130-134, 1105-1144), the `.ref-list` / `.row-btn` scrolling reference-list CSS (223-283), and the `try/catch` localStorage persistence shape (540-543, 793-796).

10. **Do NOT wire the shared `group-params` store.** The Equivalence Wheel and Cayley Table share a `{mode, N}` setting through it. This tool's parameter is a *pair* `(n, m)` with a different meaning; joining that store would let one tool write a value the other cannot represent. Use a private key.

11. **Verification tooling confirmed on PATH:** `node` v22.23.1 at `/usr/bin/node`, `google-chrome` at `/usr/bin/google-chrome` (`google-chrome-stable` also resolves). There is no build, lint or test runner in this repo, and no `node_modules`. The established verification pattern — quick tasks `260928-t3t`, `260929-c11`, `260929-er9` — is a dependency-free Node standard-library HTTP server serving the checkout root plus one in-memory `/__driver.html` route that loads the page under test in a same-origin iframe, drives it through its own visible DOM controls (the IIFE closure is not reachable from outside), and POSTs a PASS/FAIL verdict back. Reuse that recipe; do not invent a second harness.

12. **The literal-color gates below were calibrated against all fourteen existing pages** before being written into this plan. Their measured behaviour is recorded inline with each gate so the executor can tell a real failure from a miscalibrated check.

</grounded_facts>

<design_decisions>

Choices this plan makes on the developer's behalf (no locked decision covers them; each is recorded so the summary can report it):

- **`MAX_M = 100`**, yielding the 49 pairs of fact 6. The request asks for all pairs, which is infinite without a bound; 100 keeps every classical case type present (prime, odd prime power, twice-prime-power, and the m=4 special case) and keeps the pair list one scrollable panel. The largest wheel is 96 sectors; the label autosize borrowed from the Equivalence Wheel (fact 9) clamps the font down for it, and the pair list states every pair textually regardless of wheel density.
- **`m` is the only persisted parameter.** `n`, `g` and the unit list are always recomputed from it. A stored `{n, m}` could drift into a non-isomorphic pair; a stored `m` cannot.
- **Default pair m = 13** — the headline example from the request.
- **Two right-wheel layouts**, powers-of-g (default) and numeric. Powers-of-g is the teaching layout: sector i is g^i, aligned with left sector i. Numeric is the honest one: the same map, drawn against ascending units, looks scrambled. Having both is what shows that the isomorphism is a fact about structure and not about how the diagram is drawn.
- **Cross-link is one-way** (this tool -> Equivalence Wheel). A return link would require editing the Equivalence Wheel's body, widening a 1-line-per-file registration edit into a content edit on a tool this plan otherwise does not touch.
- **Slot colors reuse the Equivalence Wheel's three semantic aliases** (`--role-active`, `--role-input`, `--role-result` for first element, second element, and result). A learner who has used that tool already reads these colors correctly, and the same color on both wheels is what marks a corresponding pair.

</design_decisions>

<tasks>

<task type="tracer">
  <name>Task 1: End-to-end "see the two wheels for a real isomorphic pair" — one pair, one layout</name>
  <files>Group Isomorphism/group-isomorphism.html</files>
  <precondition>`node` and `google-chrome` both resolve on PATH (planning-time locations `/usr/bin/node` and `/usr/bin/google-chrome`); `test -f "Equivalence Wheel/equivalence-wheel.html"` succeeds from the checkout root (this is the analog to copy patterns from — fact 1; if it is absent, halt with what `ls -d */ | grep -i wheel` reports rather than guessing a path); and `test ! -d "Group Isomorphism"` succeeds (fact 2 — if the directory already exists, halt and report its contents rather than overwriting). The harness and gate scripts built here are reused by Tasks 2 and 3. If a binary resolves only under another name, use that name and say so in the summary.</precondition>
  <action>
    Create the one new directory `Group Isomorphism` and the one new file inside it, `group-isomorphism.html`, self-contained per repo convention: inline style block in the head, static markup, one inline IIFE script at the end of the body, no external JS. 2-space indentation, camelCase, semicolons, `/* ---------- Section ---------- */` section markers.

    HEAD AND CHROME. Copy from `Equivalence Wheel/equivalence-wheel.html` verbatim, per grounded fact 9: the pre-paint theme script, the head link order (favicon, palette.css, site.css, deferred theme.js, fonts preconnect, fonts stylesheet), and the whole `site-header` block with its brand SVG and theme switch. Title and h1: `Group Isomorphisms`. Write the nav with FIFTEEN entries — the existing fourteen in the order given in fact 4, plus this tool's own entry `<a href="group-isomorphism.html" class="site-nav-link is-active">Group Isomorphism</a>` inserted between Cayley Table and Square and Multiply. The other fourteen entries point up one level with a `../` prefix. Task 3 adds the mirror entry to the other fourteen pages; this file is written complete and correct from the start.

    STYLE BLOCK. No color literal of any kind — every color through `var()` against `assets/palette.css` including its `--role-*` layer. A locally-named custom property is allowed only when its value is built entirely from `var()` / `color-mix()` references (the pattern the Equivalence Wheel's `--slot-a` group uses) or when it is a non-color; declare the three slot aliases that way, mapping first element to `--role-active`, second element to `--role-input`, result to `--role-result`, each with a soft `color-mix` companion for wedge fills. A CSS named color may appear ONLY as the final shade anchor inside a `color-mix(in srgb, var(--token) NN%, …)` expression — the form `Factor Tree/factor-tree.html`, `RSA/rsa.html` and `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` already use; read one of those for the exact shape. Any comment that names a color word must be a block comment, because the gate strips block comments before checking. <!-- planner-discipline-allow: white-space --> <!-- planner-discipline-allow: site-nav-link -->

    Layout: reuse the Equivalence Wheel's `.wrap`, `.page-header`, `.eyebrow`, `.lede`, `.xref`, `.controls`, `.field`, `.export-btn` (as the generic button), `.caption`, `.ref` / `.ref-list` / `.row-btn`, and `footer` rules. Add a two-column wheel-pair grid that collapses to one column below roughly 820px via `@media`, and a `@media (prefers-reduced-motion: reduce)` block matching the Equivalence Wheel's.

    MATH LAYER, top of the IIFE, written inline in this file and duplicated rather than imported — CLAUDE.md requires this and forbids introducing a shared JS module. Plain `Number` arithmetic throughout, no `BigInt` (grounded fact 8):
    - `gcd(a, b)`, `unitsMod(m)` — copy from the Equivalence Wheel.
    - `totient(m)` — the length of `unitsMod(m)`. One definition, no closed-form product formula; the site's Euler's Totient tool makes the same choice.
    - `multOrder(g, m)` — the least positive k with g^k congruent to 1 mod m, by repeated multiplication.
    - `primitiveRoot(m)` — the smallest unit whose `multOrder` equals `totient(m)`, or `null` when none exists. This function IS the cyclicity test: do not hardcode the `{1, 2, 4, p^k, 2p^k}` classification, and do not use the narrower "m is prime" shortcut. A returned `null` is exactly "(Z/mZ)* is not cyclic".
    - `isoPairs(maxM)` — for m from 2 to maxM, keep m when `primitiveRoot(m)` is non-null, emitting `{ m: m, n: totient(m), g: primitiveRoot(m) }`. Because n is defined as phi(m), the condition "n = phi(m) and the unit group is cyclic" holds by construction for every emitted row.
    - `imageOf(k, g, m)` — g^k mod m by repeated multiplication, with `imageOf(0, …)` returning `1 % m`.
    - `powerList(g, m, n)` — `imageOf(i)` for i = 0..n-1, i.e. the right wheel's powers-of-g ordering.
    - `discreteLog(u, g, m, n)` — the unique k in 0..n-1 with `imageOf(k) === u`, by scanning `powerList`; returns `null` if absent (unreachable for an offered pair, but do not silently return 0).

    `MAX_M = 100` as a named module-level constant. After writing `isoPairs`, confirm `isoPairs(100)` reproduces the 49 rows of grounded fact 6 exactly — same m values, same n, same g — before moving on; the harness re-checks this, but a mismatch here means a helper is wrong and everything downstream is built on it.

    STATE AND PERSISTENCE. `var state = { m: 13, layout: 'powers', a: null, b: null, awaiting: 'a' };` — in this task only `m` is read. Persist through `localStorage` key `group-isomorphism` as `{ m: …, layout: … }` in a `try/catch`, mirroring the Equivalence Wheel's persist shape. On load, accept a stored `m` only if `isoPairs(MAX_M)` contains it, and accept a `?m=` URL parameter the same way, via a defensive `try/catch` reader modelled on the Equivalence Wheel's `readModeNParams`. An `m` that is not in the pair list falls back to 13 rather than rendering a pair that is not an isomorphism. Do NOT read or write the shared `group-params` store (grounded fact 10).

    CONTROLS AND PAIR LIST. A labelled `<select id="pair-select">` with one option per row of `isoPairs(MAX_M)`, its `value` the m and its text naming both groups and the generator. A `New random example` button picking a random row. Below the wheels, a scrolling reference panel `#pair-list` (the `.ref-list` / `.row-btn` pattern) with one clickable row per pair — this panel is what satisfies "all these pairs should be shown", independently of wheel density — and a count line stating how many pairs exist up to `MAX_M`. Selecting a pair from either control sets `state.m`, persists, and re-renders.

    THE TWO WHEELS. Two SVGs, `#wheel-left` and `#wheel-right`, each `viewBox="0 0 520 520"`, `width:100%; height:auto`, each with its own dynamic `<g>`. Both are SINGLE-ring wheels — this tool draws group elements, not equivalence classes with members, so there is no depth control and no concentric rings. Render both from one function so their sector geometry cannot diverge: n sectors each, `wedgeAngle = 360 / n`, sector paths from `annularSectorPath`, per-sector `<g class="wedge" tabindex="0" role="button">` carrying a hit path and a centred rotated label, the rotate-past-vertical label correction and the `clamp`ed label autosize both copied from the Equivalence Wheel. Keep `annularSectorPath`'s full-circle branch: the pair m = 2 has n = 1 and its single sector is the whole annulus.

    Left wheel sector i is labelled `i` (the elements of Z/nZ, ascending). Right wheel sector i is labelled `powerList(g, m, n)[i]` — the powers-of-g layout, and the ONLY layout in this task; `state.layout` exists but Task 2 adds the numeric alternative and the tabs. In this layout also draw a small secondary label inside each right sector giving the exponent i, so the alignment with the left wheel is legible without clicking. Centre label on the left reading the additive group, on the right the multiplicative group. A caption under each wheel and a footer line stating the isomorphism and the generator that induces it.

    Every sector carries an `aria-label` naming its element and its group, in the shape the Equivalence Wheel uses. No selection behaviour in this task — sectors are focusable and labelled, and Task 2 wires what a click does.

    THE GATE SCRIPTS, built once here and reused by Tasks 2 and 3. Write both into `$SP`, this session's scratchpad directory (record its path in the summary); neither is ever committed.

    `$SP/iso-gates.js` — dependency-free Node, standard library only, taking one or more file paths and exiting non-zero on the first failure, printing which gate failed and the offending text. For each file it first builds `stripped` = the file with `/* … */` and `<!-- … -->` comments removed, then applies:
    - Gate A (no color literals): `stripped` must contain zero matches of `/(?<![&\w])#[0-9a-fA-F]{3,8}\b/` and zero matches of `/\b(?:rgba?|hsla?)\(/`. The lookbehind is required so HTML numeric entities do not read as hex. Calibrated: this passes on 13 of the 14 existing pages; the sole exception is `Equivalence Wheel/equivalence-wheel.html`, whose SVG-export serializer builds a color-function string at runtime — a feature this tool does not have, so the new file must score zero. Run the gate against `Cayley Table/cayley-table.html` once as a passing control and against `assets/palette.css` once as a failing control, and record both results in the summary; a gate that cannot fail has proved nothing.
    - Gate B (named colors only as shade anchors): scan `stripped` for the CSS named-color word list the script embeds. Skip a match that is immediately followed by `-space`, which is a CSS property name and not a color. For every surviving match, look back up to 80 characters: the match passes only if a `color-mix(` opens in that window with no `;`, `{` or `}` between it and the match. Any other occurrence fails. Calibrated: with those two allowances all fourteen existing pages report zero failures, and six of them do use a named shade anchor, so the allowance is load-bearing and not a loophole.
    - Gate C (no stale token): collect every `var(--token)` the file uses. The allowed set is the union of the `--token:` declarations in `assets/palette.css`, those in `assets/site.css`, those in the file's own style block, and any token the file writes through `setProperty('--token'`. Assert zero tokens outside that union. Calibrated: all fourteen existing pages pass; without the `setProperty` clause `Eulers Totient/eulers-totient.html` is the single false positive, because it writes a length token from JS — the case CLAUDE.md explicitly sanctions.
    - Gate D (no new dependency): the file's absolute URLs must be exactly the two `fonts.googleapis.com` links every other page carries, and its only `script` with a `src` must be the shared deferred theme script. Compare the absolute-URL set and the `src` set against `Equivalence Wheel/equivalence-wheel.html`'s and require equality.

    `$SP/iso-harness.js` — the behavioural harness, reusing the recipe of grounded fact 11 rather than inventing a new one. Dependency-free Node standard library, taking one scenario argument (`t1`, `t2`, `t3`). It serves the checkout root (`process.cwd()`) over HTTP on an ephemeral loopback port, serves one extra in-memory `/__driver.html`, and accepts one POST route on which it records the verdict. <!-- planner-discipline-allow: http: --> The driver clears `localStorage` for the origin, optionally seeds it for the scenario, loads `/Group%20Isomorphism/group-isomorphism.html` in a same-origin iframe, waits for that document's load handler to finish, then drives the page ONLY through its visible DOM controls — the pair select, the pair-list rows, the sector groups, the tabs — dispatching real `click` and `keydown` events and reading rendered text, because the IIFE closure is not reachable from outside. It POSTs `PASS` or `FAIL` with the check count and, on failure, the first mismatch. Spawn Chrome as `google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir="$(mktemp -d)" --virtual-time-budget=20000 "<loopback driver URL>"`, wait for the POST, kill Chrome, print the verdict, exit 0 only on `PASS`. That loopback URL belongs to the scratchpad harness and is never written into any HTML file, so Gate D and the harness cannot collide.

    Scenario `t1` asserts, end-to-end on a fresh load with no stored state: (1) `#wheel-left` has 12 sector groups, labelled 0 through 11 in angular order; (2) `#wheel-right` has 12 sector groups whose labels in angular order are exactly 1, 2, 4, 8, 3, 6, 12, 11, 9, 5, 10, 7 — grounded fact 7; (3) `#pair-list` has exactly 49 rows, and the set of m values they name equals the 49 m values of grounded fact 6; (4) none of 8, 12, 15, 16, 20, 21, 24, 32, 100 appears as an m anywhere in the pair list or the select; (5) each of 4, 6, 9, 10, 14, 18, 25, 26, 27, 49, 50, 54, 81, 98 does appear, each with the n given in fact 6 — the prime-power and twice-prime-power cases are present, not just the primes; (6) choosing the m = 7 row re-renders both wheels to 6 sectors each, with the right wheel reading the successive powers of g = 3 mod 7; (7) choosing the m = 2 row renders one sector on each wheel without error — the degenerate pair; (8) after choosing m = 7 and reloading, m = 7 is still selected, and after seeding the stored m with a value that is not in the pair list the page loads m = 13 instead.

    Scope discipline: this task creates exactly one directory and one file. It edits no existing repo file. Selection behaviour, the numeric layout and the tabs are Task 2; the other fourteen pages are Task 3.
  </action>
  <verify>
    <automated>node "$SP/iso-gates.js" "Group Isomorphism/group-isomorphism.html" && node "$SP/iso-gates.js" "Cayley Table/cayley-table.html" && ! node "$SP/iso-gates.js" assets/palette.css && node "$SP/iso-harness.js" t1 && test "$(grep -o 'site-nav-link' 'Group Isomorphism/group-isomorphism.html' | wc -l)" = 15 && test -z "$(git status --porcelain --untracked-files=no)"</automated>
  </verify>
  <done>The new page opens directly from the filesystem and shows both wheels for n = 12 / m = 13 with the right wheel reading the powers of 2 mod 13; the pair list holds all 49 pairs and no non-cyclic m; the pair select and pair rows both re-render the wheels; the stored m survives a reload and an invalid stored m falls back to 13; all four static gates pass on the new file and the gate script is proved able to fail; the file carries a complete fifteen-entry nav; and `git status` shows no existing tracked file was touched.</done>
  <reversibility rating="reversible">A new directory with one new file — deleting it restores the prior state exactly, and nothing else in the repo has been edited yet.</reversibility>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Make the correspondence navigable from either wheel, and show the structure it preserves</name>
  <files>Group Isomorphism/group-isomorphism.html</files>
  <behavior>
    - Click left sector k = 5 with m = 13: left sector 5 and right sector labelled 6 both take the first-element slot color, and the readout states 2^5 = 32 is congruent to 6 mod 13.
    - Click right sector labelled 7 with m = 13: left sector 11 takes the same slot color, because the discrete logarithm of 7 base 2 mod 13 is 11.
    - Click left 5 then left 9 with m = 13: left marks 5, 9 and 2 (5 + 9 = 14, congruent to 2 mod 12); right marks 6, 5 and 4 (6 · 5 = 30, congruent to 4 mod 13); and the readout states that 4 is g^2 — the sum's image equals the product of the images.
    - Round trip on every offered pair: for each of the 49 pairs and every k in 0..n-1, `discreteLog(imageOf(k))` returns k. The two directions are exact inverses, so clicking right then left never moves the highlight.
    - Powers-of-g layout: the right-wheel highlight for left element k lands at sector index k itself, at the same angle as the left highlight.
    - Numeric layout: the same selection highlights the same VALUE on the right wheel, now at the sector index where that unit sits in ascending order — the map is unchanged, only the drawing is.
    - Switching layout preserves the current selection and re-renders; switching pair clears it.
    - Enter and Space on a focused sector do what a click does; ArrowLeft and ArrowRight move between layout tabs.
  </behavior>
  <action>
    Extend the file from Task 1. Do not restructure what is already there: the render function stays the single renderer for both wheels, and the new ordering is a parameter of it, not a second code path.

    LAYOUT TABS. Add the `.mode-tabs` / `.mode-tab` markup and CSS from `Equivalence Wheel/equivalence-wheel.html` (grounded fact 9) with two tabs, powers-of-g and numeric, plus its `syncTabs` / arrow-key wiring. The active tab writes `state.layout`, persists, and re-renders. Add the numeric ordering: the right wheel's sector i is `unitsMod(m)[i]`. The powers ordering from Task 1 is unchanged. Both orderings are permutations of the same unit set, so the sector count never changes with layout — assert that in the harness.

    SELECTION. Follow the Equivalence Wheel's two-slot `select()` shape: first pick fills slot a, second pick fills slot b and computes the result, a third pick starts over. But here a pick is expressed as a left-wheel element k, whichever wheel was clicked: a click on a left sector uses its own label, a click on a right sector converts its unit through `discreteLog` first. Store only k; derive the right-wheel element as `imageOf(k)` at render time. One stored representation means the two wheels can never disagree about what is selected.

    When slot a is filled, both wheels mark the corresponding sector in the first-element slot color and the readout gives the map for that element, naming the generator, the power, the raw value and its reduction. When slot b is filled, both wheels additionally mark the second element in the second slot color and the result in the result slot color: left marks `(a + b) mod n`, right marks `imageOf(a) * imageOf(b) mod m`. The readout shows the addition on the left, the multiplication on the right, and then states that the product equals `imageOf((a + b) mod n)` — computing both sides and reporting the agreement rather than asserting it, so the page shows the homomorphism law instead of claiming it. If the two sides ever failed to match, say so visibly in the result slot's warning role rather than rendering a wrong equation; on the offered pairs it cannot happen, and the harness proves that across all 49.

    Reuse the Equivalence Wheel's role-class mechanics: a `rolesFor(element)` helper returning the slot names an element currently holds, class names appended per role, a multi-role marker when a sector holds more than one slot (a + a is a real case: a = b is allowed, as it is in the Equivalence Wheel), and `aria-pressed` reflecting whether a sector is marked. Wire click plus Enter and Space on every sector, both wheels. Selecting a new pair clears a, b and the awaiting flag; switching layout does not.

    Extend `$SP/iso-harness.js` with scenario `t2`, driving only visible controls: the eight behaviour cases above, with the first three read as rendered text and marked classes rather than through the closure. Add one exhaustive arithmetic check that does not need the browser — a `$SP/iso-math-check.js` dependency-free Node script re-implementing the same enumeration independently and asserting, for all 49 pairs and all k, that the round trip holds and that `imageOf(a) * imageOf(b) mod m === imageOf((a + b) mod n)` for every a, b in the group. Keep it independent of the page so it is a genuine second opinion, not a restatement.
  </action>
  <verify>
    <automated>node "$SP/iso-math-check.js" && node "$SP/iso-harness.js" t2 && node "$SP/iso-harness.js" t1 && node "$SP/iso-gates.js" "Group Isomorphism/group-isomorphism.html" && test -z "$(git status --porcelain --untracked-files=no)"</automated>
  </verify>
  <done>Clicking an element on either wheel highlights its counterpart on the other; the second pick marks the sum on the left, the product on the right, and states that they correspond; the round trip is exact for all 49 pairs and every element; both layouts render the same selection on the same value; the layout tabs work by mouse and by arrow key; Task 1's scenario still passes unchanged; the static gates still pass; and no existing tracked file has been touched.</done>
</task>

<task type="auto">
  <name>Task 3: Register the tool across the site — fifteen navs, one hub card, corrected tool count</name>
  <files>index.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factor Tree/factor-tree.html, Venn Diagram/venn-diagram.html, Euclidean Algorithm/euclidean-algorithm.html, Chinese Remainder Theorem/chinese-remainder-theorem.html, Equivalence Wheel/equivalence-wheel.html, Eulers Totient/eulers-totient.html, Cayley Table/cayley-table.html, Square And Multiply/square-and-multiply.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, RSA/rsa.html, Fermats Method/fermats-method.html, Shors Algorithm/shors-algorithm.html</files>
  <precondition>`grep -c 'site-nav-link' index.html */*.html` reports exactly 14 for `index.html` and for each of the thirteen tool pages, and 15 for `Group Isomorphism/group-isomorphism.html` — fourteen files at 14, one at 15 (grounded fact 3, plus Task 1's output). If any existing page reports a count other than 14, the uniform-nav premise this task's gate depends on is void: HALT and report the per-file counts rather than editing toward a moving target.</precondition>
  <action>
    NAV, fourteen existing files, one inserted line each. In each of the thirteen tool pages insert, immediately after that page's Cayley Table nav entry (grounded fact 4), a single line:
    `      <a href="../Group Isomorphism/group-isomorphism.html" class="site-nav-link">Group Isomorphism</a>`
    In `index.html` insert the same line at the same position without the `../` prefix. No page gets `is-active` for this entry — only the tool's own page does, and Task 1 already wrote it. Match each file's existing indentation exactly. This is the entire change to the twelve tool pages that are not `index.html` and not the Cayley Table page: one insertion, zero deletions, each. <!-- planner-discipline-allow: site-nav-link -->

    HUB CARD, `index.html` only. Insert one `.card` anchor to `Group Isomorphism/group-isomorphism.html` immediately after the Cayley Table card and before the Square and Multiply card, matching nav order (grounded fact 4). Follow the shape of the existing cards exactly: an `.icon` div, an `h2` naming the tool, a `p` of one or two sentences, and the `.go` span with the same arrow text every other card uses. For the icon, follow the inline-SVG precedent of `.wheel-icon` / `.venn-icon` / `.euclid-icon` rather than an emoji: two small wheels with a correspondence arrow between them, in a `viewBox="0 0 24 24"`, with its own class names added to `index.html`'s style block. Those classes obey the same no-literal rule as the tool page — every color a `var()` against a palette token, reusing the `--role-input` / `--role-result` pairing the Venn icon already uses so the two wheels read as two distinct-but-corresponding things.

    TOOL COUNT, `index.html` only, exactly two lines (grounded fact 5). On the hero paragraph line, move the count word one up and widen the topic list to name isomorphisms alongside group tables. On the footer line, move the lowercase count word one up. Change nothing else on either line, and change no other line's wording anywhere in the repo — `README.md` states no count (fact 5) and needs no edit.

    Add scenario `t3` to `$SP/iso-harness.js`: for each of the fifteen pages, load it in the driver iframe and assert its nav contains an anchor resolving to the new tool's file, that the nav has fifteen entries, that exactly one nav entry carries the active class, and that following the new entry from `index.html` reaches a document whose title names the new tool. That last check is what proves the relative paths are right rather than merely present.
  </action>
  <verify>
    <automated>for f in index.html */*.html; do test "$(grep -o 'site-nav-link' "$f" | wc -l)" = 15 || { echo "NAV-COUNT MISMATCH $f"; exit 1; }; test "$(grep -o 'group-isomorphism.html' "$f" | wc -l)" -ge 1 || { echo "NOT REGISTERED $f"; exit 1; }; done && test "$(ls index.html */*.html | wc -l)" = 15 && test "$(grep -o 'group-isomorphism.html' index.html | wc -l)" = 2 && test "$(grep -o 'group-isomorphism.html' 'Group Isomorphism/group-isomorphism.html' | wc -l)" = 1 && NS13=$(git diff --numstat -- 'Sieve Of Eratosthenes/sieve-of-eratosthenes.html' 'Factor Tree/factor-tree.html' 'Venn Diagram/venn-diagram.html' 'Euclidean Algorithm/euclidean-algorithm.html' 'Chinese Remainder Theorem/chinese-remainder-theorem.html' 'Equivalence Wheel/equivalence-wheel.html' 'Eulers Totient/eulers-totient.html' 'Cayley Table/cayley-table.html' 'Square And Multiply/square-and-multiply.html' 'Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html' RSA/rsa.html 'Fermats Method/fermats-method.html' 'Shors Algorithm/shors-algorithm.html') && test "$(printf '%s\n' "$NS13" | wc -l)" = 13 && test "$(printf '%s\n' "$NS13" | awk '$1!=1 || $2!=0' | wc -l)" = 0 && NSI=$(git diff --numstat -- index.html) && test "$(printf '%s\n' "$NSI" | awk 'NR==1 && $1+0<=30 && $2+0<=3 {print "ok"}')" = ok && node "$SP/iso-gates.js" index.html "Group Isomorphism/group-isomorphism.html" && node "$SP/iso-harness.js" t3 && node "$SP/iso-harness.js" t1 && node "$SP/iso-harness.js" t2</automated>
  </verify>
  <done>All fifteen pages carry a fifteen-entry nav that includes the new tool, each with exactly one active entry; the hub carries a card with an inline var()-only icon in the slot matching nav order; the hub's two count lines name fourteen tools; the thirteen tool pages show exactly one inserted line and zero deletions each; `index.html` shows at most three deletions and thirty insertions; the new page and `index.html` both pass all four static gates; and Tasks 1 and 2 scenarios still pass.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user → in-page number controls | The only untrusted input is the pair chosen from a `<select>` / row list and an optional `?m=` URL parameter. Both are validated against membership in `isoPairs(MAX_M)` before use, so an out-of-range or hostile value selects the default pair rather than driving the renderer. |
| page → `localStorage` | A single private key holding one integer and one layout string, read through `try/catch` and re-validated against the pair list on every load. A tampered or corrupt value cannot escape the validated set. |
| page → network | None at runtime. The only network references are the two static Google Fonts `<link>` elements every existing page already carries. No fetch, no XHR, no dynamic script, no server, no backend, no account, no session, no secret, no PII. |

This is a static, client-side-only page that also runs correctly from a `file://` URL. At ASVS level 1 there is no authentication, authorization, session, transport, data-storage-of-secrets, or server-side surface to assess. No high-severity finding is expected, and none of the gates in this plan is a security gate in disguise.

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-twn-01 | Tampering | `?m=` URL parameter reader | low | mitigate | Parsed in a `try/catch`, coerced with `parseInt`, then accepted only if present in `isoPairs(MAX_M)`; anything else falls back to m = 13. Task 1's harness scenario asserts the fallback. |
| T-twn-02 | Tampering | `localStorage` key `group-isomorphism` | low | mitigate | Read in a `try/catch`, and the stored m is re-validated against the pair list on every load, so a hand-edited value cannot make the page render a non-isomorphic pair. Asserted by scenario `t1`. |
| T-twn-03 | Information disclosure | rendered page content | low | accept | Nothing sensitive exists on the page: all values are derived from a modulus the user chose. There is nothing to disclose. |
| T-twn-04 | Denial of service | sector rendering loop | low | mitigate | `MAX_M = 100` caps the largest wheel at 96 sectors, and both wheels are drawn once per pair change, not per frame. No unbounded input reaches a render loop — the class of problem STATE records for the GCD tiling view and the Cayley grid. |
| T-twn-05 | Spoofing | nav and hub links | low | mitigate | All fifteen links are relative paths inside the checkout; Task 3's `t3` scenario follows the hub link and asserts the resolved document's title, so a typo'd path fails the gate rather than shipping as a dead link. |
| T-twn-SC | Tampering | npm/pip/cargo installs | high | mitigate | No package-manager install exists in this plan. The repo has no package manager and no `node_modules`; Gate D pins the new page's absolute-URL set and `script src` set to match an existing page's, so no dependency can enter unnoticed; and the harness, the gate script and the arithmetic checker are dependency-free Node standard library driving the `google-chrome` binary already present at `/usr/bin/google-chrome`. Nothing is fetched, so the package-legitimacy gate has no input and no `[ASSUMED]`/`[SUS]` package exists to check. |
</threat_model>

<verification>
Run from the checkout root, with `$SP` the session scratchpad recorded in the summary:

1. `node "$SP/iso-math-check.js"` — the enumeration and the homomorphism law, checked independently of the page for all 49 pairs and every element.
2. `node "$SP/iso-gates.js" "Group Isomorphism/group-isomorphism.html" index.html` — no color literal, named colors only as shade anchors, no stale palette token, no new dependency.
3. `! node "$SP/iso-gates.js" assets/palette.css` — the gate script can still fail, so its passes mean something.
4. `node "$SP/iso-harness.js" t1 && node "$SP/iso-harness.js" t2 && node "$SP/iso-harness.js" t3` — rendering and pair enumeration, correspondence in both directions plus structure preservation, and site-wide registration.
5. `grep -c 'site-nav-link' index.html */*.html` — fifteen lines, every one reporting 15.
6. `git diff --numstat` — the thirteen tool pages at `1 0` each, `index.html` within its stated bound, and no file outside `files_modified` touched at all.

Manual confirmation, since this repo's only real runtime is a browser: open `Group Isomorphism/group-isomorphism.html` from a `file://` URL, toggle day and night, and confirm both wheels, the pair list and the readout are legible in both themes — the single check no headless gate here covers.
</verification>

<success_criteria>
- One new directory `Group Isomorphism` holding one self-contained `group-isomorphism.html`, no external JS beyond the shared theme script and Google Fonts, no build step.
- The pair list is derived from `(Z/mZ)* is cyclic AND n = phi(m)` and contains exactly the 49 pairs of grounded fact 6 — prime, odd-prime-power, twice-prime-power and the m = 4 case all present; no non-cyclic m offered.
- Both wheels always carry n sectors; the correspondence is navigable from either wheel; the second selection shows the sum on the left and the product on the right and states their correspondence.
- Zero color literals, zero stale palette tokens, day/night correct.
- Fifteen pages, fifteen nav entries each, one hub card, tool count reading fourteen.
- Every gate in `<verification>` green, with the gate script's own failure control demonstrated.
</success_criteria>

<output>
Create `.planning/quick/260929-twn-create-a-new-browser-tool-illustrating-g/260929-twn-SUMMARY.md` when done.

Record in it: the scratchpad path, the calibration results for the gate script's passing and failing controls, the confirmation that `isoPairs(100)` reproduced grounded fact 6, and each of the `<design_decisions>` as a decision taken on the developer's behalf.
</output>
