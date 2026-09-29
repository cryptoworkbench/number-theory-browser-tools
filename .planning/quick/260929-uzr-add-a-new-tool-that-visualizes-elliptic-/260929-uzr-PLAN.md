---
phase: quick-260929-uzr
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html
  - index.html
  - Sieve Of Eratosthenes/sieve-of-eratosthenes.html
  - Factor Tree/factor-tree.html
  - Venn Diagram/venn-diagram.html
  - Euclidean Algorithm/euclidean-algorithm.html
  - Chinese Remainder Theorem/chinese-remainder-theorem.html
  - Equivalence Wheel/equivalence-wheel.html
  - Eulers Totient/eulers-totient.html
  - Cayley Table/cayley-table.html
  - Group Isomorphism/group-isomorphism.html
  - Square And Multiply/square-and-multiply.html
  - Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
  - RSA/rsa.html
  - Fermats Method/fermats-method.html
  - Shors Algorithm/shors-algorithm.html
autonomous: true
requirements: ["quick-260929-uzr"]

estimate:
  tokens: 108000
  raw_tokens: 67000
  tasks: 3
  confidence: low

must_haves:
  truths:
    - "Opening `Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html` directly from the filesystem shows the whole point set of a small elliptic curve over F_p plotted as a scatter on a p-by-p lattice, symmetric about the horizontal midline because y and p-y are both solutions."
    - "The point set is computed at runtime from y^2 = x^3 + ax + b mod p by the tool's own arithmetic — never a hand-typed table — and the default curve y^2 = x^3 + 4x + 20 mod 29 yields exactly 36 affine points plus the point at infinity, group order 37."
    - "A curve the user types that is singular (4a^3 + 27b^2 congruent to 0 mod p) or a p that is not a prime in the supported range is refused with a stated reason and the previous valid curve stays on screen — the page never plots a set that is not a group."
    - "The full ECDH exchange is shown for real: Alice's private scalar a gives A = aG, Bob's b gives B = bG, and both sides land on the same point S, because the page computes aB and bA independently and compares them rather than displaying one value twice."
    - "On the default curve with a = 8 and b = 15 the page shows G = (1,5), A = (8,10), B = (3,1) and the shared secret S = (14,23), and states that S is also 9G because 8 times 15 is 120, which is 9 mod 37."
    - "Scalar multiplication is visible as a walk, not a formula: stepping through kG for k = 1, 2, 3, … lights each successive multiple on the plot in order, and the walk visibly wanders the point set rather than moving smoothly — the reason the discrete logarithm is hard."
    - "The group law itself is visible: picking two plotted points draws the line through them as its own lattice of points mod p, marks the third curve point that line meets, and marks its mirror image below the midline as the sum — with the vertical-line and tangent cases handled as their own branches, not glossed over."
    - "Eve sees the curve, G, A and B and nothing else; her brute-force button walks multiples of G looking for A, reports how many point additions it took, and states plainly that this loop is what a real 256-bit curve makes impossible."
    - "The exchange plays back like the site's other animated tools — Play, Step, Instant and Reset with a speed control — and restarting mid-animation never leaves a stale frame writing into the new run."
    - "The page carries no literal color: every color resolves through var() against assets/palette.css including its --role-* semantic layer, and the page recolors with the site's day/night toggle like every other tool."
    - "The new tool is reachable from every page on the site: all sixteen pages carry a sixteen-entry nav that includes it, and the hub carries a card for it."
    - "The tool adds no external dependency — its only absolute URLs are the two Google Fonts links every other page already uses, and its only script with a src is the shared deferred theme script."
  artifacts:
    - "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html — new self-contained tool: inline style block, sixteen-entry nav, modular-inverse and quadratic-residue helpers, point enumeration, point addition/doubling/scalar multiplication, point order, the lattice point-field SVG, the ECDH exchange, playback controls, the group-law explorer, and Eve's ECDLP walk"
    - "index.html — nav entry, hub card with an inline curve-scatter icon, icon CSS classes, and the tool-count wording moved from fourteen to fifteen"
    - "the fourteen existing tool pages — one nav entry each, inserted after the Diffie-Hellman entry, nothing else changed"
  key_links:
    - "`pointAdd` <-> `pointDouble` <-> `scalarMul` — scalar multiplication must route through the same addition law the group-law explorer draws, or the picture and the arithmetic would be two different claims about the same curve"
    - "`aB` <-> `bA` <-> `(a*b mod n)G` — the three are computed by separate code paths and compared; if they were derived from one another the page would assert the ECDH identity instead of demonstrating it"
    - "`enumeratePoints(a, b, p)` <-> `isOnCurve(P)` — every plotted dot must satisfy the curve equation and every point the arithmetic produces must be in the plotted set, or a rendered result could sit off the curve unnoticed"
    - "the curve-validity check (p prime in range, non-singular discriminant) <-> everything downstream — a singular curve breaks the group law silently rather than loudly, so the check must gate the plot, not decorate it"
    - "the chord's lambda and intercept <-> the plotted line lattice <-> the marked third intersection — if the drawn line and the computed sum ever disagree, the page's central teaching claim breaks while still looking correct"
    - "`generation` counter <-> every pending frame and timer — the pattern the Diffie-Hellman tool established; without it a rebuild mid-playback lets an abandoned run paint into the new one"
    - "every `var(--token)` in the new file <-> the token set declared in assets/palette.css and assets/site.css — a token that resolves to nothing paints invisibly in one theme and is undetectable in review, the exact failure Phase 01 recorded three times"
    - "the sixteen-entry nav <-> all sixteen pages — a page missed during registration becomes a dead end where the new tool vanishes from the site"
---

<objective>
Add a fifteenth tool that makes elliptic-curve Diffie-Hellman visible: the whole point set of a small curve over a prime field plotted as a lattice scatter, scalar multiplication shown as a walk across that scatter, and Alice and Bob arriving at the same point from opposite directions while Eve watches everything that crosses the wire.

Purpose: the site already teaches Diffie-Hellman over the multiplicative group mod p, and it already teaches that different-looking groups can be the same group (Group Isomorphism). ECDH is the same protocol in a group the learner has never seen — one where the elements are points, the operation is a geometric construction, and the reason the discrete log is hard becomes visible as a walk that wanders instead of climbing. Nothing on the site currently shows an elliptic curve at all.

Output: one new self-contained page `Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html`, registered in the hub and in all sixteen nav bars.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

Read before writing any code — this tool is a sibling of the existing crypto tools, not a fresh invention:
@Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html
@Group Isomorphism/group-isomorphism.html
@assets/palette.css
@index.html
</context>

<grounded_facts>

Every fact below was observed or computed live in this checkout at planning time. Nothing here is recalled or assumed.

1. **`Elliptic Curve Diffie-Hellman/` does not exist yet.** `ls` at the checkout root lists fourteen tool directories plus `assets`; there is no elliptic-curve directory. `git status --porcelain --untracked-files=no` is empty — no uncommitted tracked-file edits to collide with.

2. **Sixteen pages will carry the nav.** Right now `grep -o 'site-nav-link' | wc -l` returns exactly **15** for `index.html` and for each of the fourteen `*/*.html` tool pages — fifteen files, fifteen links each (Home plus fourteen tools), with no exceptions. After this plan every one of the sixteen files reports **16**.

3. **The nav insertion anchor is the Diffie-Hellman entry**, present on all fifteen pages at a known line:

   | file | line | form |
   |---|---|---|
   | `index.html` | 174 | `href="Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"` (no `../`) |
   | `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html` | 183 | `href="diffie-hellman-key-exchange.html"` plus the active class |
   | the other thirteen tool pages | varies (Cayley 267, CRT 278, Equivalence Wheel 339, Euclidean 266, Totient 250, Factor Tree 343, Fermat 262, Group Isomorphism 320, RSA 191, Shor 163, Sieve 380, Square and Multiply 170, Venn 441) | `href="../Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"` |

   Nav order is Home, Sieve of Eratosthenes, Factor Tree, Venn Diagram, Euclidean Algorithm, Chinese Remainder Theorem, Equivalence Wheel, Euler's Totient, Cayley Table, Group Isomorphism, Square and Multiply, Diffie-Hellman, RSA, Fermat's Method, Shor's Algorithm. The new entry goes between Diffie-Hellman and RSA — the public-key cluster, immediately after the protocol it generalises. Hub card order was deliberately aligned to nav order by quick task `260928-fdz`, so the new card goes in the matching slot.

4. **Tool-count wording lives on exactly two lines of `index.html`**: line 191 (hero paragraph, capitalised `Fourteen`) and line 355 (footer, lowercase `fourteen`). `README.md` is a single heading line containing no tool count and no tool list. No other file in the repo states a count.

5. **The default curve, computed live.** `y^2 = x^3 + 4x + 20` over `F_29`. Discriminant `4a^3 + 27b^2 = 7 mod 29`, non-zero, so the curve is non-singular. The group has order **37** (prime): 36 affine points plus the point at infinity. The 36 affine points, in x-ascending then y-ascending order, are:

   ```
   (0,7) (0,22) (1,5) (1,24) (2,6) (2,23) (3,1) (3,28) (4,10) (4,19)
   (5,7) (5,22) (6,12) (6,17) (8,10) (8,19) (10,4) (10,25) (13,6) (13,23)
   (14,6) (14,23) (15,2) (15,27) (16,2) (16,27) (17,10) (17,19) (19,13) (19,16)
   (20,3) (20,26) (24,7) (24,22) (27,2) (27,27)
   ```

   With `G = (1,5)`, whose order is 37, the successive multiples `kG` for k = 1..37 are:

   ```
   1G=(1,5)    2G=(4,19)   3G=(20,3)   4G=(15,27)  5G=(6,12)   6G=(17,19)
   7G=(24,22)  8G=(8,10)   9G=(14,23) 10G=(13,23) 11G=(10,25) 12G=(19,13)
   13G=(16,27) 14G=(5,22)  15G=(3,1)  16G=(0,22)  17G=(27,2)  18G=(2,23)
   19G=(2,6)   20G=(27,27) 21G=(0,7)  22G=(3,28)  23G=(5,7)   24G=(16,2)
   25G=(19,16) 26G=(10,4)  27G=(13,6) 28G=(14,6)  29G=(8,19)  30G=(24,7)
   31G=(17,10) 32G=(6,17)  33G=(15,2) 34G=(20,26) 35G=(4,10)  36G=(1,24)
   37G=O
   ```

   With Alice's `a = 8` and Bob's `b = 15`: `A = 8G = (8,10)`, `B = 15G = (3,1)`, and `8B = 15A = (14,23)`, which is `9G` because 8 times 15 is 120 and 120 mod 37 is 9. These are the expected on-screen values on first load.

6. **Worked group-law examples on the default curve**, for the harness to assert rather than re-derive:
   - **Chord.** `P = (1,5)`, `Q = (4,19)`. `lambda = (19-5) * inverse(4-1) = 14 * 10 = 24 mod 29`. Intercept `c = 5 - 24*1 = 10 mod 29`. The line is `y = 24x + 10 mod 29`. Its third curve intersection is `(20,26)`, and its mirror image `(20,3)` is `P + Q = 3G`. All three of `(1,5)`, `(4,19)` and `(20,26)` lie on that line — verified against its full 29-point lattice.
   - **Tangent.** At `P = (1,5)`: `lambda = (3*1 + 4) * inverse(10) = 7 * 3 = 21 mod 29`, intercept `13`, giving `2P = (4,19)` — matching `2G` in fact 5.
   - **Vertical.** `(1,5)` and `(1,24)` share an x and their y values sum to 29, so their sum is the point at infinity. This is the branch a naive slope formula divides by zero on.

7. **Preset curves, all computed live and all non-singular.** Each row is p, a, b, the base point G this plan names, the order of that G, and the example private scalars:

   | p | a | b | group order | G | ord(G) | Alice | Bob | A | B | shared S |
   |---|---|---|---|---|---|---|---|---|---|---|
   | 29 | 4 | 20 | 37 (prime) | (1,5) | 37 | 8 | 15 | (8,10) | (3,1) | (14,23) = 9G |
   | 17 | 2 | 2 | 19 (prime) | (5,1) | 19 | 3 | 10 | (10,6) | (7,11) | (13,10) = 11G |
   | 43 | 1 | 3 | 47 (prime) | (2,20) | 47 | 7 | 13 | (36,30) | (29,13) | (41,37) = 44G |
   | 97 | 2 | 3 | 100 (composite) | (3,6) | **5** | 14 | 23 | (3,91) | (80,87) | (80,10) = 2G |

   The last row is deliberate and is a teaching case, not a bug: on that curve the point `(3,6)` generates a subgroup of only **5** points out of 100, so every exchange using it lands in a five-element set an attacker can search by hand. The same curve has points of order 50 — for example `(0,10)` — so the page can show the contrast on one curve. This is why the tool must compute and display the order of the chosen base point instead of assuming it.

8. **Point enumeration by quadratic-residue table is correct and is O(p).** Building a map from `y^2 mod p` to the list of y that produce it, then looking up `x^3 + ax + b mod p` once per x, was cross-checked against the naive O(p^2) double loop on p = 17, 29, 43, 97, 163, 191 and 199 — the two produce identical point sets in every case.

9. **All arithmetic fits plain `Number`; no `BigInt` is needed.** With p capped at 199 the largest intermediate in the group law is `3*x^2 + a` (under 120,000) and `lambda^2` (under 40,000), provided every multiply is reduced mod p before the next. The modular inverse is the extended Euclidean algorithm, whose intermediates stay below p. This matches the Equivalence Wheel, Cayley Table, Euler's Totient and Group Isomorphism; the `BigInt` of the RSA and Diffie-Hellman tools is not warranted here.

10. **Patterns to copy verbatim, read them in place rather than re-deriving.**
    - From `Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html`: the `SPEED_LABELS` / `SPEED_MS` tables (728-729), the `generation` counter and its guard comment (714), `cancelPackets` and the `pendingTimeouts` / `activePackets` teardown (817-830), `frameStep` / `play` / `pause` / `stepOnce` / `instantFinish` / `resetPlayback` (872-946), the `rebuild()` shape that ends in `instantFinish()` (974-999), the step-list-plus-`appendLogEntry` arithmetic log (400-411, 598-651), Eve's notebook and her brute-force result boxes (536-592), the `.panel` / `.substep` / `.formula` / `.notebook` / `.chips` / `.speed-wrap` CSS (42-149), the preset-chip wiring (1014-1023), and the `try/catch` localStorage persist/restore pair (950-972).
    - From `Group Isomorphism/group-isomorphism.html`: the head link order and pre-paint theme script (5, 8-13), the `site-header` block with brand SVG and theme switch (296-332), `svgEl` (475-479), the three semantic slot aliases and their soft companions (15-29), the two-slot selection idiom and `rolesFor` shape (645-681), and the `.ref-list` / `.row-btn` scrolling reference-list CSS (230-275).

11. **Verification tooling confirmed on PATH:** `node` v22.23.1 at `/usr/bin/node`, `google-chrome` at `/usr/bin/google-chrome` (`google-chrome-stable` also resolves). There is no build, lint or test runner in this repo, and no `node_modules`. The established verification pattern — quick tasks `260928-t3t`, `260929-c11`, `260929-er9`, `260929-twn` — is a dependency-free Node standard-library HTTP server serving the checkout root plus one in-memory driver route that loads the page under test in a same-origin iframe, drives it through its own visible DOM controls (the IIFE closure is not reachable from outside), and POSTs a verdict back. Reuse that recipe; do not invent a second harness.

12. **The static gates below were calibrated against all fifteen existing pages at planning time**, with the tightened comment-stripping and value-position rules described in Task 1. Measured result: **fourteen of fifteen pages pass**; the single exception is `Equivalence Wheel/equivalence-wheel.html`, whose SVG-export serializer builds a color-function string at runtime — a feature this tool does not have, so the new file must score zero. The `color-mix` shade-anchor allowance is load-bearing and not a loophole: `Factor Tree` relies on it 6 times, `RSA` 3 times, `Sieve Of Eratosthenes` 2 times. Two false positives were found and eliminated during calibration and must stay eliminated: a `//` line comment in the Equivalence Wheel naming a color word, and the identifier `snow` in the Factor Tree — so the stripper must also remove `//` comments (but not the `//` inside a URL, which is preceded by a colon), and a color word only counts when it sits in a CSS value position. `assets/palette.css` fails the calibrated gate with 31 hex literals and 10 color-function literals, which is the negative control.

</grounded_facts>

<design_decisions>

Choices this plan makes on the developer's behalf (no locked decision covers them; each is recorded so the summary can report it):

- **`MAX_P = 199`, and p must be a prime with `5 <= p <= 199`.** The short Weierstrass form and the group-law formulas require a field of characteristic other than 2 and 3, which is why 2 and 3 are excluded rather than clamped. 199 keeps the densest curve near 200 dots, which still reads as a scatter on a 520-unit viewBox, and keeps Eve's brute-force walk instant so the attack demo is a real demo rather than a spinner.
- **Default curve `y^2 = x^3 + 4x + 20` over `F_29`** (grounded fact 5). Prime group order 37 means every affine point generates the whole group, so the default can never accidentally demonstrate the small-subgroup failure; 36 points is dense enough to look like a scatter and sparse enough that individual points stay clickable.
- **The base point is user-choosable, and its order is always computed and displayed.** The p = 97 preset of fact 7 exists precisely to show a base point whose order is 5 out of 100. A tool that hid the order would teach that any point will do.
- **Only highlighted points carry coordinate labels.** Labelling all 36 (or all 183, at the cap) would be unreadable at any p. G, A, B, S, the two explorer picks and the marked sum are labelled; the rest are plain dots.
- **The line through two points is drawn as its own lattice of dots, not as a stroked segment.** Over `F_p` the line genuinely is a set of p scattered lattice points (fact 6 lists all 29 for the worked chord); stroking a segment would draw a straight line that does not exist and would need wrap-handling that could only ever be approximate. Dots are both simpler and true.
- **Persisted state is `{p, a, b, Gx, Gy, ka, kb, speed}` under a private key**, re-validated on load: a stored curve that is singular, out of range, or whose stored base point is not on it falls back to the default. Do not join the shared `group-params` store — this tool's parameter is a curve, a different shape than the `{mode, N}` the Equivalence Wheel and Cayley Table share, and joining it would let one tool write a value the other cannot represent.
- **Cross-link is one-way** (this tool to the Diffie-Hellman tool, framed as "the same protocol in a different group"). A return link would require editing the Diffie-Hellman tool's body, widening a one-line-per-file registration edit into a content edit on a tool this plan otherwise does not touch.
- **Slot colors reuse the three semantic aliases the Equivalence Wheel and Group Isomorphism already use** — first pick, second pick, result — so a learner who has used those tools reads these colors correctly. Alice, Bob and Eve reuse the Diffie-Hellman tool's participant roles unchanged, so the two protocol pages are colour-consistent.
- **Nav label is the short form, card title is the long form**, following the precedent where the nav says Diffie-Hellman and the card says Diffie-Hellman Key Exchange.

</design_decisions>

<tasks>

<task type="tracer">
  <name>Task 1: End-to-end "watch one ECDH exchange on a real curve" — one curve, computed and plotted, no playback yet</name>
  <files>Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html</files>
  <precondition>`node` and `google-chrome` both resolve on PATH (planning-time locations `/usr/bin/node` and `/usr/bin/google-chrome`); `test -f "Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html"` and `test -f "Group Isomorphism/group-isomorphism.html"` both succeed from the checkout root (these are the two analogs to copy patterns from — grounded fact 10; if either is absent, halt with what `ls -d */` reports rather than guessing a path); and `test ! -d "Elliptic Curve Diffie-Hellman"` succeeds (grounded fact 1 — if the directory already exists, halt and report its contents rather than overwriting). The harness and gate scripts built here are reused by Tasks 2 and 3. If a binary resolves only under another name, use that name and say so in the summary.</precondition>
  <action>
    Create the one new directory `Elliptic Curve Diffie-Hellman` and the one new file inside it, `elliptic-curve-diffie-hellman.html`, self-contained per repo convention: inline style block in the head, static markup, one inline IIFE script at the end of the body, no external JS. 2-space indentation, camelCase, semicolons, `/* ---------- Section ---------- */` section markers.

    HEAD AND CHROME. Copy from `Group Isomorphism/group-isomorphism.html` verbatim, per grounded fact 10: the pre-paint theme script, the head link order (favicon, palette.css, site.css, deferred theme.js, fonts preconnect, fonts stylesheet), and the whole `site-header` block with its brand SVG and theme switch. Title and h1: `Elliptic Curve Diffie-Hellman`. Write the nav with SIXTEEN entries — the existing fifteen in the order given in grounded fact 3, plus this tool's own entry pointing at `elliptic-curve-diffie-hellman.html` with the active class and the label `Elliptic Curve DH`, inserted between the Diffie-Hellman entry and the RSA entry. The other fifteen entries point up one level with a `../` prefix. Task 3 adds the mirror entry to the other fifteen pages; this file is written complete and correct from the start. <!-- planner-discipline-allow: site-nav-link -->

    STYLE BLOCK. No color literal of any kind — every color through `var()` against `assets/palette.css` including its `--role-*` layer. A locally-named custom property is allowed only when its value is built entirely from `var()` / `color-mix()` references (the pattern Group Isomorphism's `--slot-a` group uses) or when it is a non-color; declare the three explorer slot aliases that way, mapping first pick to `--role-active`, second pick to `--role-input`, result to `--role-result`, each with a soft `color-mix` companion. Map Alice, Bob and Eve onto the same roles the Diffie-Hellman tool uses so the two protocol pages agree. A CSS named color may appear ONLY as the final shade anchor inside a `color-mix(in srgb, var(--token) NN%, …)` expression — the form `Factor Tree/factor-tree.html`, `RSA/rsa.html` and `Sieve Of Eratosthenes/sieve-of-eratosthenes.html` already use (grounded fact 12); read one of those for the exact shape.

    Layout: reuse the Diffie-Hellman tool's `.app`, `.page-header`, `.panel`, `.step-head`, `.field-row`, `.field`, `.chips` / `.chip`, `.btn-row`, `button` variants, `.error-box`, `.banner`, `.substep`, `.formula`, `.notebook`, `.legend`, `footer` and `.pillbar` rules, and a `@media (prefers-reduced-motion: reduce)` block. Add the point-field container and the scrolling multiples-table rules (the `.ref-list` / `.row-btn` pattern from Group Isomorphism).

    MATH LAYER, top of the IIFE, written inline in this file and duplicated rather than imported — CLAUDE.md requires this and forbids introducing a shared JS module. Plain `Number` arithmetic throughout with every multiply reduced mod p before the next, no `BigInt` (grounded fact 9). Order these top to bottom as pure functions with no DOM access:
    - `mod(x, p)` — a true non-negative remainder, because JavaScript's `%` returns a negative result for a negative left operand and every subtraction in the group law can produce one.
    - `isPrimeSmall(n)` — trial division; p is capped at 199 so nothing cleverer is warranted.
    - `modInv(x, p)` — the extended Euclidean algorithm. Return `null` when the inverse does not exist rather than a wrong number, and have the callers treat `null` as the point-at-infinity branch.
    - `isNonSingular(a, b, p)` — `4a^3 + 27b^2` reduced mod p is non-zero. This is what makes the point set a group; it gates the plot rather than decorating it.
    - `isOnCurve(P, a, b, p)` — the point at infinity is on every curve; an affine point satisfies `y^2 = x^3 + ax + b` with both sides reduced.
    - `enumeratePoints(a, b, p)` — build a map from each `y^2 mod p` to the list of y producing it, then for each x look up `x^3 + ax + b mod p` once. O(p), cross-checked against a naive double loop in grounded fact 8. Return affine points only, in x-ascending then y-ascending order; the point at infinity is represented as `null` everywhere in this file and is not in the returned array.
    - `pointAdd(P, Q, a, p)` — the full law with all four branches present and distinguishable: either operand is the point at infinity; `P` and `Q` share an x with y values summing to 0 mod p (the vertical case, returning the point at infinity); `P` equals `Q` (the tangent, slope `(3x^2 + a) / 2y`); otherwise the chord, slope `(y2 - y1) / (x2 - x1)`. Do not write a separate `pointDouble` that duplicates the formula — expose doubling as the `P` equals `Q` branch so the plot and the arithmetic can never diverge.
    - `scalarMul(k, P, a, p)` — double-and-add, routed entirely through `pointAdd`. `k = 0` yields the point at infinity.
    - `pointOrder(P, a, p)` — the least positive k with `kP` at infinity, by repeated addition, with a ceiling of `p + 2*sqrt(p) + 2` (the Hasse bound) beyond which it returns `null` rather than looping.
    - `pointsEqual(P, Q)` and `formatPoint(P)` — one comparison and one display function used everywhere, so the point at infinity always reads the same way on screen.

    `MAX_P = 199` as a named module-level constant. After writing the math layer, confirm against grounded fact 5 before moving on: `enumeratePoints(4, 20, 29)` must reproduce those 36 points in that order, `pointOrder([1,5], 4, 29)` must be 37, and `scalarMul(k, [1,5], 4, 29)` for k = 1..37 must reproduce that multiples list ending at the point at infinity. Also confirm the three group-law cases of grounded fact 6. A mismatch here means a helper is wrong and everything downstream is built on it.

    VALIDATION AND STATE. `readInputs()` reads p, a, b, the base point and the two private scalars, and refuses with a specific stated reason — shown in the error box, previous valid curve left on screen — for each of: p not an integer; p outside 5 to `MAX_P`; p not prime; the curve singular; the chosen base point not on the curve; a private scalar outside 1 to `ord(G) - 1`. Each refusal names which condition failed. Persist `{p, a, b, Gx, Gy, ka, kb, speed}` through `localStorage` under the key `elliptic-curve-diffie-hellman` in a `try/catch`, mirroring the Diffie-Hellman tool's persist/restore pair. On load, run the restored values through the same `readInputs()` validation and fall back to the default curve of grounded fact 5 if anything fails. Do NOT read or write the shared `group-params` store.

    CONTROLS. Number inputs for p, a, b, Alice's scalar and Bob's scalar; a `<select>` for the base point listing every affine point of the current curve with its order, defaulting to the first point of maximal order; a `Build exchange` button; a `Randomize private scalars` button drawing both from 1 to `ord(G) - 1`; and preset chips for the four curves of grounded fact 7, each chip carrying p, a, b, the base point and both scalars. Label the p = 97 chip so it reads as the cautionary case.

    THE POINT FIELD. One SVG `#curveSvg`, `viewBox="0 0 560 560"`, `width:100%; height:auto`, holding: a faint lattice frame with axis ticks spaced so their count stays roughly between 6 and 12 whichever p is chosen; a dashed horizontal midline at `y = p/2` with a short caption naming the symmetry (a point and its mirror image are both solutions, which is why the scatter is symmetric); one `<circle>` per affine point, radius scaled from p so the densest supported curve still separates; and a distinct off-lattice marker for the point at infinity with its own label, because it is a group element with no coordinates and must not be silently missing. Screen y must increase upward — field y = 0 sits at the bottom — or the mirror symmetry will read upside down.

    THE EXCHANGE, computed and shown immediately in this task with no playback. Mark and label G, `A = ka*G`, `B = kb*G` and the shared secret on the field in the participant roles. Compute the shared secret twice by separate paths — `scalarMul(ka, B)` and `scalarMul(kb, A)` — compare them with `pointsEqual`, and render the agreement as a computed finding; if they ever disagreed, say so visibly in the warning role rather than rendering one of them as though it were the answer. Also compute `scalarMul((ka * kb) mod ord(G), G)` as an independent third check and state that identity in the readout. Below the field, an arithmetic log in the Diffie-Hellman tool's `.substep` / `.formula` shape giving the curve, its group order, `ord(G)`, each scalar multiplication, and the agreement line. Beside it, a scrolling multiples table listing `kG` for k = 1 to `ord(G)`, each row clickable to highlight that multiple on the field — this is what makes the walk legible before Task 2 animates it.

    Scope discipline: this task creates exactly one directory and one file. It edits no existing repo file. Playback, Eve and the group-law explorer are Task 2; the other fifteen pages are Task 3.

    THE GATE SCRIPTS, built once here and reused by Tasks 2 and 3. Write all three into `$SP`, this session's scratchpad directory (record its path in the summary); none is ever committed.

    `$SP/ecdh-gates.js` — dependency-free Node, standard library only, taking one or more file paths and exiting non-zero on the first failure, printing which gate failed and the offending text. For each file it first builds `stripped` = the file with `/* … */` comments, `<!-- … -->` comments, and `//`-to-end-of-line comments removed, where the `//` rule must not fire when the two slashes are preceded by a colon (grounded fact 12 — that exact false positive was found and eliminated during calibration). Then:
    - Gate A (no color literals): `stripped` must contain zero matches of `/(?<![&\w])#[0-9a-fA-F]{3,8}\b/` and zero matches of the CSS color-function pattern `/\b(?:rgba?|hsla?)\(/`. The lookbehind is required so HTML numeric entities do not read as hex. Calibrated: this passes on 14 of the 15 existing pages; the sole exception is `Equivalence Wheel/equivalence-wheel.html`, whose runtime SVG-export serializer builds a color-function string — a feature this tool does not have, so the new file must score zero. Run the gate against `Cayley Table/cayley-table.html` once as a passing control and against `assets/palette.css` once as a failing control (measured at planning time: 31 hex literals, 10 color-function literals), and record both results in the summary; a gate that cannot fail has proved nothing.
    - Gate B (named colors only as shade anchors): scan `stripped` for the CSS named-color word list the script embeds, counting a word ONLY when it sits in a CSS value position — immediately preceded by a colon, comma or open parenthesis and optional whitespace, and immediately followed by a semicolon, comma, closing brace or parenthesis, or whitespace. For every such match, look back up to 80 characters: the match passes only if a `color-mix(` opens in that window with no `;`, `{` or `}` between it and the match. Any other occurrence fails. Calibrated: with the value-position rule and the comment stripping above, all fifteen existing pages report zero failures, and three of them do use a named shade anchor (Factor Tree 6 times, RSA 3, Sieve 2), so the allowance is load-bearing.
    - Gate C (no stale token): collect every `var(--token)` the file uses. The allowed set is the union of the `--token:` declarations in `assets/palette.css`, those in `assets/site.css`, those in the file's own style block, and any token the file writes through `setProperty('--token'`. Assert zero tokens outside that union. Calibrated at planning time: all fifteen existing pages pass, and without the `setProperty` clause `Eulers Totient/eulers-totient.html` is the single false positive, because it writes a length token from JS — the case CLAUDE.md explicitly sanctions.
    - Gate D (no new dependency): the file's absolute URLs must be exactly the two `fonts.googleapis.com` links every other page carries, and its only `script` with a `src` must be the shared deferred theme script. Compare the absolute-URL set and the `src` set against `Group Isomorphism/group-isomorphism.html`'s and require equality.

    `$SP/ecdh-math-check.js` — dependency-free Node, an INDEPENDENT re-implementation of the curve arithmetic, written from the definitions rather than copied out of the HTML, so it is a genuine second opinion. It asserts, for every one of the four preset curves of grounded fact 7 and for the twenty additional (p, a, b) triples it generates itself with p prime in 5 to `MAX_P`: (1) every enumerated point satisfies the curve equation and the count matches an independent naive double-loop count; (2) point addition is commutative and associative on a random sample, the point at infinity is a two-sided identity, and every point plus its mirror image is the point at infinity; (3) `scalarMul(k, P)` equals P added to itself k times for every k up to `ord(P)`, and `ord(P)` divides the group order — Lagrange, which is the invariant that catches an arithmetic slip the eye would miss; (4) `scalarMul(ka, scalarMul(kb, G))` equals `scalarMul(kb, scalarMul(ka, G))` equals `scalarMul((ka*kb) mod ord(G), G)` — the ECDH identity itself, over every pair of scalars for the four presets; (5) the three group-law worked examples of grounded fact 6 reproduce exactly, including the lambda, the intercept, the third intersection and the vertical case.

    `$SP/ecdh-harness.js` — the behavioural harness, reusing the recipe of grounded fact 11 rather than inventing a new one. Dependency-free Node standard library, taking one scenario argument (`t1`, `t2`, `t3`). It serves the checkout root (`process.cwd()`) over a loopback HTTP server on an ephemeral port, serves one extra in-memory driver route, and accepts one POST route on which it records the verdict. The driver clears `localStorage` for the origin, optionally seeds it for the scenario, loads the page under test in a same-origin iframe, waits for that document's load handler to finish, then drives it ONLY through its visible DOM controls — inputs, buttons, chips, the base-point select, the multiples rows, the plotted points — dispatching real `click`, `input` and `keydown` events and reading rendered text and marked classes, because the IIFE closure is not reachable from outside. It POSTs a verdict with the check count and, on failure, the first mismatch. Spawn Chrome as `google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir="$(mktemp -d)" --virtual-time-budget=25000 "<loopback driver URL>"`, wait for the POST, kill Chrome, print the verdict, exit 0 only on a pass. That loopback URL belongs to the scratchpad harness and is never written into any HTML file, so Gate D and the harness cannot collide.

    Scenario `t1` asserts, end-to-end on a fresh load with no stored state: (1) the field plots exactly 36 point markers and the point-at-infinity marker is present and labelled; (2) the plotted coordinate set equals the 36 points of grounded fact 5; (3) the readout names group order 37 and `ord(G) = 37` for `G = (1,5)`; (4) the labelled points are `A = (8,10)`, `B = (3,1)` and a shared secret of `(14,23)`, and the readout states that this is `9G`; (5) the multiples table has 37 rows and its k = 1..37 entries match grounded fact 5 exactly, ending at the point at infinity; (6) selecting the p = 17 chip re-renders to 18 plotted points with `A = (10,6)`, `B = (7,11)` and shared secret `(13,10)`; (7) selecting the p = 97 chip reports `ord(G) = 5` while the group order is 100, and the shared secret is `(80,10)` — the small-subgroup case of grounded fact 7 is reported, not hidden; (8) typing a p of 30, then 4, then 200, then a singular curve, then a base point that is not on the curve each produces a distinct stated error and leaves the previously plotted curve on screen; (9) after selecting the p = 43 chip and reloading, that curve is still selected, and after seeding stored state with a singular curve the page loads the default curve of grounded fact 5 instead.
  </action>
  <verify>
    <automated>node "$SP/ecdh-math-check.js" && node "$SP/ecdh-gates.js" "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" && node "$SP/ecdh-gates.js" "Cayley Table/cayley-table.html" && ! node "$SP/ecdh-gates.js" assets/palette.css && node "$SP/ecdh-harness.js" t1 && test "$(grep -o 'site-nav-link' "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" | wc -l)" = 16 && test -z "$(git status --porcelain --untracked-files=no)"</automated>
  </verify>
  <done>The new page opens directly from the filesystem and plots all 36 points of the default curve plus the point at infinity, symmetric about the midline; it shows G, A, B and a shared secret computed by two independent paths that agree and match the third `(ka*kb mod n)G` check; the multiples table reproduces grounded fact 5 in full; every preset chip re-renders correctly including the small-subgroup case; each invalid input is refused with its own stated reason and leaves the last valid curve on screen; the independent math checker passes on the four presets and twenty generated curves including the Lagrange and associativity invariants; all four static gates pass on the new file and the gate script is proved able to fail; the file carries a complete sixteen-entry nav; and `git status` shows no existing tracked file was touched.</done>
  <reversibility rating="reversible">A new directory with one new file — deleting it restores the prior state exactly, and nothing else in the repo has been edited yet.</reversibility>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Animate the walk, play back the exchange, show the group law, and let Eve try</name>
  <files>Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html</files>
  <behavior>
    - Pressing Step from a reset state advances exactly one narrative step and the banner names it; pressing Step ten times reaches the agreement step and Step then disables.
    - Pressing Play advances steps on a timer, Pause freezes at the current step, and Play resumes from there rather than restarting.
    - Pressing Play on an already-finished run rewinds and plays again instead of doing nothing — the bug the Diffie-Hellman tool records fixing in `play()`.
    - Pressing Instant mid-animation lands on the final state with no stale frame left running, and the plotted highlights match what stepping all the way through produces.
    - Changing p mid-animation and rebuilding leaves no marker from the abandoned run on the new field: the `generation` counter invalidates every pending frame and timer.
    - Stepping through Alice's scalar multiplication lights `1G, 2G, …, kG` in order on the field; on the default curve with ka = 8 the eighth lit point is `(8,10)`, and the sequence visibly wanders rather than progressing around the plot.
    - Eve's notebook shows the curve, G, A and B and never the private scalars or the shared secret, at every step.
    - Eve's brute-force button on the default curve recovers ka = 8 and reports the number of point additions it performed; on the p = 43 preset it recovers ka = 7. The result states what the same loop would cost on a 256-bit curve.
    - In the group-law explorer, picking `(1,5)` then `(4,19)` draws the line `y = 24x + 10 mod 29` as 29 lattice dots, marks `(20,26)` as the third intersection, and marks `(20,3)` as the sum.
    - Picking `(1,5)` twice draws the tangent with slope 21 and marks `(4,19)` as the doubled point.
    - Picking `(1,5)` then `(1,24)` reports the sum as the point at infinity and draws the vertical line as its own column of lattice dots, with no division-by-zero and no stray marker.
    - Enter and Space on a focused plotted point do what a click does.
  </behavior>
  <action>
    Extend the file from Task 1. Do not restructure what is already there: `pointAdd` stays the single group law, `scalarMul` stays routed through it, and the renderer built in Task 1 stays the single renderer — the new overlays are layers on it, not a second drawing path.

    PLAYBACK. Add the Diffie-Hellman tool's playback engine (grounded fact 10) essentially unchanged: `SPEED_LABELS` / `SPEED_MS`, the speed range input, Play / Pause / Step / Instant / Reset buttons, `frameStep` driving `advanceOne`, the `generation` counter bumped on every rebuild and reset, and a teardown function that clears every pending timer and animation frame and removes every transient marker at once. Keep its `rebuild()` shape, which ends by revealing the full result immediately so the page is never blank on load and Play is always a replay of something already shown.

    The narrative step list, one entry per step with an id, an owner and a caption, in the Diffie-Hellman tool's shape: agree on the curve and the base point; Alice picks her scalar privately; Bob picks his privately; Alice computes A; Bob computes B; A crosses the wire; B crosses the wire; Alice computes the shared secret from B; Bob computes it from A; both sides agree. Each step appends to the arithmetic log built in Task 1 and updates the banner.

    THE WALK. On the two steps that compute a public point and the two that compute the shared secret, animate the scalar multiplication as a walk: light `1P, 2P, …, kP` in sequence on the field, each successive multiple taking a transient highlight and leaving a faint trail, ending with the final multiple taking its participant role permanently. Drive it from the same `generation`-guarded timer the step engine uses, so an abandoned run can never keep walking. Under `prefers-reduced-motion: reduce`, land on the final state directly rather than stepping — the branch the Diffie-Hellman tool's packet animation already takes. Cap the number of animated hops at `ord(G)` and reuse `scalarMul` for the value; the walk is a visualisation of the repeated-addition sequence, so compute each hop by adding P to the running point rather than by re-running double-and-add, and assert at the end that the hop-by-hop result equals `scalarMul(k, P)` — the two must agree.

    EVE. Add her notebook and her ECDLP section in the Diffie-Hellman tool's shape. The notebook records the curve, p, G, A and B as each becomes public, and states which values never crossed the wire. Her brute-force button walks multiples of G comparing each to A, counting point additions, and reports either the recovered scalar with the count and elapsed milliseconds or a give-up when the order exceeds a stated ceiling. The result box states what the same search costs on a curve of cryptographic size, so the demo's easiness reads as the point rather than as a reassurance.

    THE GROUP-LAW EXPLORER. Reuse the two-slot selection idiom from `Group Isomorphism/group-isomorphism.html` (grounded fact 10): first pick fills slot one, second pick fills slot two and computes the sum, a third pick starts over, and picking the same point twice is a legal case that means doubling. Make every plotted point focusable and activatable by click, Enter and Space, with an `aria-label` naming its coordinates. On a second pick:
    - Compute lambda and the intercept from the same branch `pointAdd` takes, then plot the line as its own lattice — for each x in 0 to p-1 a faint marker at `(x, (lambda*x + c) mod p)`, per the design decision above. For the vertical branch, plot the full column at that x instead and report the sum as the point at infinity.
    - Mark the third curve point the line meets in the result role's outline, and mark its mirror image below the midline as the sum, with a dashed connector between them so the reflection reads as the final move of the construction.
    - Write the construction out in words and symbols in a `.substep`: which branch was taken and why, the lambda, the intercept, the third intersection, and the reflection.
    Assert in code that the marked sum equals `pointAdd` of the two picks and that all three marked points satisfy `isOnCurve`; if either check failed, show the discrepancy in the warning role rather than drawing a construction the arithmetic does not support.

    Extend `$SP/ecdh-harness.js` with scenario `t2` covering every behaviour case above, driving only visible controls and reading rendered text and marked classes. Include the mid-animation rebuild case explicitly: start Play, change p, press Build, and assert no marker carrying a highlight class survives from the abandoned run. Extend `$SP/ecdh-math-check.js` with the chord, tangent and vertical worked examples of grounded fact 6 asserted against its own independent implementation — lambda, intercept, the full line lattice, the third intersection and the reflected sum — so the explorer's drawing claim is checked outside the browser too.
  </action>
  <verify>
    <automated>node "$SP/ecdh-math-check.js" && node "$SP/ecdh-harness.js" t2 && node "$SP/ecdh-harness.js" t1 && node "$SP/ecdh-gates.js" "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" && test -z "$(git status --porcelain --untracked-files=no)"</automated>
  </verify>
  <done>Play, Pause, Step, Instant and Reset all behave as specified including replay of a finished run and a clean mid-animation rebuild; the scalar-multiplication walk lights successive multiples in order and its hop-by-hop result agrees with double-and-add; Eve's notebook holds only what crossed the wire and her brute force recovers the scalar with a reported cost and an honest note about real curve sizes; the group-law explorer draws the line as a lattice, marks the third intersection and the reflected sum, and handles the tangent and vertical branches as their own cases with the worked values of grounded fact 6; Task 1's scenario still passes unchanged; the static gates still pass; and no existing tracked file has been touched.</done>
</task>

<task type="auto">
  <name>Task 3: Register the tool across the site — sixteen navs, one hub card, corrected tool count</name>
  <files>index.html, Sieve Of Eratosthenes/sieve-of-eratosthenes.html, Factor Tree/factor-tree.html, Venn Diagram/venn-diagram.html, Euclidean Algorithm/euclidean-algorithm.html, Chinese Remainder Theorem/chinese-remainder-theorem.html, Equivalence Wheel/equivalence-wheel.html, Eulers Totient/eulers-totient.html, Cayley Table/cayley-table.html, Group Isomorphism/group-isomorphism.html, Square And Multiply/square-and-multiply.html, Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html, RSA/rsa.html, Fermats Method/fermats-method.html, Shors Algorithm/shors-algorithm.html</files>
  <precondition>`grep -o 'site-nav-link' | wc -l` reports exactly 15 for `index.html` and for each of the fourteen existing tool pages, and 16 for `Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html` — fifteen files at 15, one at 16 (grounded fact 2, plus Task 1's output). If any existing page reports a count other than 15, the uniform-nav premise this task's gate depends on is void: HALT and report the per-file counts rather than editing toward a moving target. <!-- planner-discipline-allow: site-nav-link --></precondition>
  <action>
    NAV, fifteen existing files, one inserted line each. In each of the fourteen tool pages insert, immediately after that page's Diffie-Hellman nav entry (grounded fact 3), a single anchor line pointing at `../Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html` with the ordinary nav link class and the label `Elliptic Curve DH`. In `index.html` insert the same line at the same position without the `../` prefix. No page gets the active class for this entry — only the tool's own page does, and Task 1 already wrote it. Match each file's existing indentation exactly, which is six spaces on every one of the fifteen files. This is the entire change to the thirteen tool pages that are not `index.html` and not the Diffie-Hellman page: one insertion, zero deletions, each. <!-- planner-discipline-allow: site-nav-link -->

    HUB CARD, `index.html` only. Insert one `.card` anchor to the new tool immediately after the Diffie-Hellman Key Exchange card and before the RSA card, matching nav order (grounded fact 3). Follow the shape of the existing cards exactly: an `.icon` div, an `h2` reading `Elliptic Curve Diffie-Hellman`, a `p` of one or two sentences naming what the visual actually shows (a curve's points over a small prime field, and a walk across them that wanders), and the `.go` span with the same arrow text every other card uses. For the icon, follow the inline-SVG precedent of `.wheel-icon` / `.venn-icon` / `.euclid-icon` / `.iso-icon` rather than an emoji: a small scatter of dots arranged symmetrically about a horizontal midline with two of them marked as a pair, in a `viewBox="0 0 24 24"`, with its own class names added to `index.html`'s style block. Those classes obey the same no-literal rule as the tool page — every color a `var()` against a palette token, reusing the participant roles the Diffie-Hellman card's neighbours already establish.

    TOOL COUNT, `index.html` only, exactly two lines (grounded fact 4). On the hero paragraph line, move the count word one up and widen the topic list to name elliptic curves alongside public-key cryptography. On the footer line, move the lowercase count word one up. Change nothing else on either line, and change no other line's wording anywhere in the repo — `README.md` states no count (grounded fact 4) and needs no edit.

    Add scenario `t3` to `$SP/ecdh-harness.js`: for each of the sixteen pages, load it in the driver iframe and assert its nav contains an anchor resolving to the new tool's file, that the nav has sixteen entries, that exactly one nav entry carries the active class, and that following the new entry from `index.html` reaches a document whose title names the new tool. That last check is what proves the relative paths are right rather than merely present — a path with a wrong number of `../` segments is still a present anchor.
  </action>
  <verify>
    <automated>for f in index.html */*.html; do test "$(grep -o 'site-nav-link' "$f" | wc -l)" = 16 || { echo "NAV-COUNT MISMATCH $f"; exit 1; }; test "$(grep -o 'elliptic-curve-diffie-hellman.html' "$f" | wc -l)" -ge 1 || { echo "NOT REGISTERED $f"; exit 1; }; done && test "$(ls index.html */*.html | wc -l)" = 16 && test "$(grep -o 'elliptic-curve-diffie-hellman.html' index.html | wc -l)" = 2 && test "$(grep -o 'elliptic-curve-diffie-hellman.html' "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" | wc -l)" = 1 && NS14=$(git diff --numstat -- 'Sieve Of Eratosthenes/sieve-of-eratosthenes.html' 'Factor Tree/factor-tree.html' 'Venn Diagram/venn-diagram.html' 'Euclidean Algorithm/euclidean-algorithm.html' 'Chinese Remainder Theorem/chinese-remainder-theorem.html' 'Equivalence Wheel/equivalence-wheel.html' 'Eulers Totient/eulers-totient.html' 'Cayley Table/cayley-table.html' 'Group Isomorphism/group-isomorphism.html' 'Square And Multiply/square-and-multiply.html' 'Diffie-Hellman Key Exchange/diffie-hellman-key-exchange.html' RSA/rsa.html 'Fermats Method/fermats-method.html' 'Shors Algorithm/shors-algorithm.html') && test "$(printf '%s\n' "$NS14" | wc -l)" = 14 && test "$(printf '%s\n' "$NS14" | awk '$1!=1 || $2!=0' | wc -l)" = 0 && NSI=$(git diff --numstat -- index.html) && test "$(printf '%s\n' "$NSI" | awk 'NR==1 && $1+0<=32 && $2+0<=3 {print "ok"}')" = ok && node "$SP/ecdh-gates.js" index.html "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" && node "$SP/ecdh-harness.js" t3 && node "$SP/ecdh-harness.js" t1 && node "$SP/ecdh-harness.js" t2</automated>
  </verify>
  <done>All sixteen pages carry a sixteen-entry nav that includes the new tool, each with exactly one active entry; the hub carries a card with an inline var()-only curve-scatter icon in the slot matching nav order; the hub's two count lines name fifteen tools; the fourteen existing tool pages show exactly one inserted line and zero deletions each; `index.html` shows at most three deletions and thirty-two insertions; the new page and `index.html` both pass all four static gates; and Tasks 1 and 2 scenarios still pass.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| user → in-page curve controls | The only untrusted input is p, a, b, the base point and the two private scalars, typed into number fields or supplied by a preset chip. Every one is validated before use — p prime and in range, curve non-singular, base point on the curve, scalars inside the base point's order — and a failure leaves the previous valid curve rendered rather than driving the renderer with a set that is not a group. |
| page → `localStorage` | A single private key holding one curve and two scalars, read through `try/catch` and re-run through the same validation on every load. A tampered or corrupt value cannot escape the validated set; it falls back to the default curve. |
| page → network | None at runtime. The only network references are the two static Google Fonts `<link>` elements every existing page already carries. No fetch, no XHR, no dynamic script, no server, no backend, no account, no session, no secret, no PII. |

This is a static, client-side-only page that also runs correctly from a `file://` URL. At ASVS level 1 there is no authentication, authorization, session, transport, or server-side surface to assess. The one genuine security-adjacent risk is pedagogical rather than technical and is handled in T-uzr-06.

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-uzr-01 | Tampering | curve inputs p, a, b and the base point | medium | mitigate | `readInputs()` refuses a non-prime p, a p outside 5 to `MAX_P`, a singular curve and a base point not on the curve, each with its own stated reason, before anything is plotted. A singular curve has no group law, so plotting one would render arithmetic that is quietly wrong rather than visibly broken. Task 1's scenario `t1` asserts all five refusals. |
| T-uzr-02 | Tampering | `localStorage` key `elliptic-curve-diffie-hellman` | low | mitigate | Read in a `try/catch` and re-run through the full `readInputs()` validation on every load, so a hand-edited stored curve cannot make the page plot a non-group. Asserted by scenario `t1`. |
| T-uzr-03 | Denial of service | point enumeration and the walk animation | low | mitigate | `MAX_P = 199` caps enumeration at roughly 200 points via the O(p) quadratic-residue table (grounded fact 8), and the walk is capped at `ord(G)` hops. `pointOrder` carries a Hasse-bound ceiling so a malformed curve cannot loop forever. No unbounded input reaches a render or search loop — the class of problem STATE records for the GCD tiling view and the Cayley grid. |
| T-uzr-04 | Information disclosure | rendered page content | low | accept | Nothing sensitive exists on the page: every value derives from a curve and two scalars the user chose, and the page states outright that the scalars are drawn with `Math.random`. There is nothing to disclose. |
| T-uzr-05 | Spoofing | nav and hub links | low | mitigate | All sixteen links are relative paths inside the checkout; Task 3's `t3` scenario follows the hub link and asserts the resolved document's title, so a typo'd path or a wrong number of `../` segments fails the gate rather than shipping as a dead link. |
| T-uzr-06 | Repudiation | the page's own cryptographic claims | medium | mitigate | A teaching page that shows a working key exchange invites reuse. The page states in its intro and footer that the parameters are toy-sized, the private scalars come from `Math.random` and not a cryptographic source, the raw shared point is displayed rather than run through a key-derivation function, and none of it is safe for real use — mirroring the wording the Diffie-Hellman tool already carries. Eve's brute-force result box reinforces this by naming what the same search costs at cryptographic sizes, and the p = 97 preset demonstrates the small-subgroup failure explicitly rather than leaving the learner to assume any base point will do. |
| T-uzr-SC | Tampering | npm/pip/cargo installs | high | mitigate | No package-manager install exists in this plan. The repo has no package manager and no `node_modules`; Gate D pins the new page's absolute-URL set and `script src` set to match an existing page's, so no dependency can enter unnoticed; and the harness, the gate script and the arithmetic checker are dependency-free Node standard library driving the `google-chrome` binary already present at `/usr/bin/google-chrome`. Nothing is fetched, so the package-legitimacy gate has no input and no `[ASSUMED]`/`[SUS]` package exists to check. |
</threat_model>

<verification>
Run from the checkout root, with `$SP` the session scratchpad recorded in the summary:

1. `node "$SP/ecdh-math-check.js"` — the curve arithmetic, the group axioms, Lagrange, the ECDH identity and the three worked group-law examples, all checked by an independent implementation outside the browser.
2. `node "$SP/ecdh-gates.js" "Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html" index.html` — no color literal, named colors only as shade anchors, no stale palette token, no new dependency.
3. `! node "$SP/ecdh-gates.js" assets/palette.css` — the gate script can still fail, so its passes mean something.
4. `node "$SP/ecdh-harness.js" t1 && node "$SP/ecdh-harness.js" t2 && node "$SP/ecdh-harness.js" t3` — plotting, enumeration and validation; playback, the walk, Eve and the group-law explorer; site-wide registration.
5. `for f in index.html */*.html; do printf '%s %s\n' "$(grep -o 'site-nav-link' "$f" | wc -l)" "$f"; done` — sixteen lines, every one reporting 16.
6. `git diff --numstat` — the fourteen existing tool pages at `1 0` each, `index.html` within its stated bound, and no file outside `files_modified` touched at all.

Manual confirmation, since this repo's only real runtime is a browser: open `Elliptic Curve Diffie-Hellman/elliptic-curve-diffie-hellman.html` from a `file://` URL, toggle day and night, and confirm the point field, the highlighted points, the line lattice and the arithmetic log are all legible in both themes — the single check no headless gate here covers.
</verification>

<success_criteria>
- One new directory `Elliptic Curve Diffie-Hellman` holding one self-contained `elliptic-curve-diffie-hellman.html`, no external JS beyond the shared theme script and Google Fonts, no build step.
- The point set is enumerated at runtime from the curve equation and the default curve reproduces grounded fact 5 exactly; an invalid or singular curve is refused with a stated reason.
- The shared secret is computed by two independent paths and cross-checked against `(ka*kb mod n)G`, and the agreement is reported as a finding rather than asserted.
- Scalar multiplication is visible as a walk; the group law is visible as a line lattice with its third intersection and reflection, with the tangent and vertical branches shown as their own cases.
- Playback matches the site's other animated tools, including a clean rebuild mid-animation.
- Zero color literals, zero stale palette tokens, day/night correct.
- Sixteen pages, sixteen nav entries each, one hub card, tool count reading fifteen.
- Every gate in `<verification>` green, with the gate script's own failure control demonstrated.
</success_criteria>

<output>
Create `.planning/quick/260929-uzr-add-a-new-tool-that-visualizes-elliptic-/260929-uzr-SUMMARY.md` when done.

Record in it: the scratchpad path, the calibration results for the gate script's passing and failing controls, the confirmation that the math layer reproduced grounded facts 5 and 6, the number of generated curves the independent checker covered, and each of the `<design_decisions>` as a decision taken on the developer's behalf.
</output>
