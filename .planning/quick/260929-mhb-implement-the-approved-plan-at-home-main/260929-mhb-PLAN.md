---
phase: quick-260929-mhb
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Factor Tree/factor-tree.html
autonomous: true
requirements: ["quick-260929-mhb"]

estimate:
  tokens: 105000
  raw_tokens: 70000
  tasks: 3
  confidence: low

assumption_delta_decision:
  noun: "factorization strategy / tree mode"
  decision: no-change
  rationale: >-
    Advisory checkpoint fired on the singular->plural signal (a second factorization
    mode where there was one). No prior mode concept existed in this file to promote
    or demote — classic smallest-prime-factor behaviour was the only behaviour,
    implicit and unnamed. This introduces the first explicit mode selector cleanly
    (a module-level `mode` variable read inside `buildTree`), which is the
    add-a-selector case, not the generalise-a-forced-singular case. Decision already
    settled in the approved design; not re-opened here.

must_haves:
  truths:
    - "The Factor Tree page offers two modes via a segmented toggle above the number input: Classic (existing smallest-prime-factor splitting) and Balanced (Fermat's-method splitting). Classic is the mode on arrival."
    - "In Classic mode the page is behaviourally byte-identical to the pre-change tool: for every one of its six existing preset numbers the rendered tree structure is unchanged, down to node values and per-depth ordering."
    - "In Balanced mode an even number peels a single factor of 2 off at a time (D-01), and an odd composite splits into the closest factor pair Fermat's method finds — and both resulting children then recurse through the same balanced logic (D-03), so the whole tree is balanced, not just the root."
    - "Both modes share the `v === 1` and `isPrime(v)` branches of `buildTree` untouched, so `P = P x 1` prime-leaf splitting and the page's existing footnote stay true in both modes."
    - "Balanced mode caps input at 1,000,000 and says so in its own message when the input is over the cap; switching back to Classic accepts the same value up to the existing 1 trillion ceiling (D-02)."
    - "Each mode shows its own preset chip set, and switching mode with a number already in the input immediately re-renders that number in the new mode without a second click on Grow the Tree."
    - "No literal colour is introduced: the new toggle and caveat styling read entirely through existing palette tokens, so both day and night themes pick it up."
  artifacts:
    - "Factor Tree/factor-tree.html — the only file touched; still one self-contained page, inline `<style>`, inline IIFE `<script>`, no new external resource, no shared JS module."
  key_links:
    - "`mode` (module-level, next to `generation`) -> read inside `buildTree` -> so `renderTree`'s call signature and `assignX`/`flatten`/`renderTree` stay unchanged."
    - "mode-button click -> sets `mode`, swaps `.is-active`, swaps `numInput.max`, shows/hides `#balancedNote`, re-renders chips, calls `factorize(numInput.value)`."
    - "`factorize` ceiling check -> branches on `mode` for both the ceiling number and the message text."
    - "`.chips` container event delegation -> survives `renderChips` replacing its `innerHTML` on every mode switch."
---

<objective>
Add a second "Balanced (Fermat's Method)" tree mode to the Factor Tree tool, alongside
the existing Classic smallest-prime-factor mode.

Purpose: the classic factor tree always peels the *smallest* prime off first, which makes
a lopsided staircase (60 -> 2,30 -> 2,15 -> 3,5). Balanced mode splits each number as
evenly as possible instead, using Fermat's method, so the tree shows a learner the
"closest pair to sqrt(N)" structure of a number rather than its smallest-first structure.

Output: `Factor Tree/factor-tree.html`, modified in place. No other file changes.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@CLAUDE.md
@.claude/CLAUDE.md

The design for this change was produced through a full explore -> design -> review cycle
and approved by the user in plan mode. It is the source of truth for this work:
@/home/mainaccount/.claude/plans/let-s-discuss-i-want-jaunty-puppy.md

Read that plan before starting. Do not re-derive the design — every line number,
function body, CSS rule and copy string below is taken from it. Its ten-step change list
("Files to change") is referenced here as P-1 through P-10.

The file being modified:
@Factor Tree/factor-tree.html

The port source for `isqrt` / `isPerfectSquare` / the Fermat search loop (reference
pattern only — this repo intentionally duplicates math helpers per file rather than
sharing a module, per CLAUDE.md):
@Fermats Method/fermats-method.html
</context>

<user_decisions>
Three calls the user made explicitly during the approved design cycle. These are locked.

- **D-01 — Even numbers:** in Balanced mode, peel factors of 2 off one at a time before
  applying Fermat's method to the odd remainder. Do not feed an even number to
  `fermatSplit`.
- **D-02 — Slow / unbalanced case:** Fermat's method degrades toward O(N) work for some
  inputs. Mitigate this by **capping the maximum N that Balanced mode accepts**. Do NOT
  mitigate it with a mid-search iteration cap that falls back to another strategy, and do
  not surface any iteration count in UI copy. (A `FERMAT_MAX_ITER` constant still exists,
  but purely as an unreachable defensive hang guard.)
- **D-03 — Recursion:** once Fermat splits a node into `(p, q)`, recurse into *both*
  children with Fermat's method again. The whole tree uses balanced splitting, not just
  the root.
</user_decisions>

<verification_harness>
Shared by all three tasks. Build it once in Task 1 and extend it in Tasks 2 and 3.

This repo has no test runner; the established gate (plans 03-02, 05-02, 05-03, and quick
task 260929-kam) is a headless-Chrome behavioural harness against a scratchpad copy.
Build it exactly that way:

```
SP="$(mktemp -d)"; cp -r assets "$SP/assets"; mkdir -p "$SP/tool"
```

Then use `node` to inject a harness `<script>` immediately before `</body>` of a copy of
`Factor Tree/factor-tree.html`, writing the result to `$SP/tool/harness.html`. Injecting
after the page's own inline script means the harness's `load` listener runs after the
page's, so the on-load `factorize('60')` has already happened when the harness starts.

The harness installs `window.onerror`, registers its own `load` listener, drives the real
UI synchronously (every node the tree renders exists in the DOM the moment `factorize`
returns — only the `.show` reveal classes and the equation text are on timers, so no
waiting is needed for structural assertions), and writes `PASS <assertionCount>` or
`FAIL <first mismatch, expected vs got>` into a `document.body.dataset` key named per task.

Two helpers the harness uses to read the rendered tree:

```js
function fingerprint(){
  var svg = document.querySelector('#treeArea svg.tree-svg');
  if(!svg) return null;
  return [].map.call(svg.querySelectorAll('g.depth-group'), function(g){
    return [].map.call(g.querySelectorAll('text.node-text'), function(t){
      return t.textContent;
    }).join(',');
  });
}
function primeLeafProduct(){
  var p = 1;
  [].forEach.call(document.querySelectorAll('#treeArea text.node-text.prime-leaf'),
    function(t){ p *= Number(t.textContent); });
  return p;
}
```

`fingerprint()` returns one string per depth level, holding that level's node values in
depth-first visit order — a complete structural signature of the tree. `primeLeafProduct()`
is the independent oracle: whatever splitting strategy ran, the product of every
`prime-leaf` node must equal the input N.

Run with:

```
google-chrome --headless=new --disable-gpu --no-sandbox \
  --user-data-dir="$(mktemp -d)" --virtual-time-budget=30000 \
  --dump-dom "file://$SP/tool/harness.html" > "$SP/dom.html"
```

then assert the PASS marker is present, e.g.

```
grep -q 'data-tree-mode="PASS' "$SP/dom.html" \
  || { grep -o 'data-tree-mode="[^"]*"' "$SP/dom.html"; exit 1; }
```

Before trusting any green run, prove the harness is not vacuous: point one assertion at a
deliberately wrong expectation and confirm it reports `FAIL`.
</verification_harness>

<tasks>

<task type="tracer" tdd="true">
  <name>Task 1: End-to-end balanced mode — toggle, Fermat split, one re-render path</name>
  <files>Factor Tree/factor-tree.html</files>

  <behavior>
Structural expectations, expressed as `fingerprint()` output (one entry per depth level,
values in depth-first visit order). These encode D-01 and D-03.

- Balanced, N = 60 — identical to Classic, because 60's even peeling and 15's only factor
  pair both land on the same split:
  `["60","2,30","1,2,2,15","1,2,3,5","1,3,1,5"]`
- Balanced, N = 2310 — the discriminating case. Even peel gives `2, 1155` (D-01); 1155 is
  odd composite so Fermat splits it `33, 35`; both children recurse through Fermat again
  (D-03), giving `3,11` and `5,7`:
  `["2310","2,1155","1,2,33,35","3,11,5,7","1,3,1,11,1,5,1,7"]`
  Classic for the same input is one level deeper and differently shaped.
- Balanced, N = 945 — odd throughout, and exercises the perfect-square path: 945 splits
  `27, 35`; 27 splits `3, 9`; **9 splits `3, 3`**, which only happens if the perfect-square
  test is accepted at `b === 0`:
  `["945","27,35","3,9,5,7","1,3,3,3,1,5,1,7","1,3,1,3"]`
- Balanced, N = 9973 (prime) — the shared `isPrime` branch, untouched:
  `["9973","1,9973"]`
- Balanced, N = 1024 — pure even peeling, so identical to Classic: assert the two modes'
  fingerprints deep-equal each other and that both have exactly 11 depth levels.
- For every N tried in either mode, `primeLeafProduct() === N`.

Zero-regression expectation for Classic mode is captured, not hand-written: see `<verify>`.
  </behavior>

  <action>
Six edits to `Factor Tree/factor-tree.html`, in the approved plan's order. Apply them
exactly as that plan specifies; the notes here are contract, not re-design.

**(P-2) CSS** — insert immediately after the `.chip:hover` rule (line 155), before the
`.message` block. Use the plan's rule set verbatim. It styles `.mode-toggle` (a centred
pill-shaped flex row with `1px solid var(--panel-border)`, `border-radius:20px`,
`padding:3px`, `background:var(--panel)`, `margin:0 auto 6px`, `width:fit-content`),
`.mode-btn` (borderless, transparent background, `color:var(--text-dim)`, `padding:7px 18px`,
`border-radius:16px`, Poppins `.85rem` weight 600, pointer cursor, `.15s` transitions),
`.mode-btn.is-active` (`background:var(--accent)`, `color:var(--accent-ink)`),
`.mode-btn:hover:not(.is-active)` (`color:var(--accent)`), and `.mode-caveat`
(`max-width:480px`, `margin:0 auto 14px`, `font-size:.78rem`, `color:var(--text-dim)`).
Every value is a `var()` against a token `assets/palette.css` already declares — introduce
no literal colour value of any kind, per this repo's palette rule.

**(P-1) Markup** — insert between `</header>` (line 351) and `<div class="controls">`
(line 353), exactly the plan's block: a `<div class="mode-toggle" role="group"
aria-label="Tree mode">` holding two `<button type="button" class="mode-btn"
data-mode="...">` elements labelled `Classic` and `Balanced`, the Classic one also
carrying `is-active`; then `<p id="balancedNote" class="mode-caveat"
style="display:none"></p>`. `is-active` is the naming `assets/site.css` already
established for `.site-nav-link.is-active`.

**(P-5) State** — at line 421, next to `let generation = 0;`, add
`let mode = 'classic';`, `const MAX_BALANCED_N = 1000000;` and
`const FERMAT_MAX_ITER = 2000000;`. `mode` is module-level on purpose: it never changes
mid-recursion, only between top-level `factorize()` calls, exactly the way `generation`
is already used as an implicit context flag. This is what keeps `renderTree`'s and
`buildTree`'s call signatures untouched. `MAX_BALANCED_N` is declared here per the
approved plan but is not consumed until Task 2.

**(P-6) Math helpers** — insert after `isPrime(v)` (ends line 450), before the
`// ---------- Build the real recursive factor tree ----------` comment (line 452):
`isqrt(x)` and `isPerfectSquare(x)`, ported unchanged from `Fermats Method/fermats-method.html`
lines 412-424 (`isPerfectSquare` returns the root, or `-1` when x is not a perfect
square); and `fermatSplit(v)` exactly as the approved plan writes it — `aMax =
Math.floor((v + 1) / 2)`, `a = Math.ceil(Math.sqrt(v))`, loop computing `r = a*a - v` and
`b = isPerfectSquare(r)`, returning `{ p: a - b, q: a + b }` on the first `b >= 0`.

The `b >= 0` comparison is load-bearing and must not be written as `b > 0`: a perfect
square such as v = 9 hits on the very first iteration with `b === 0`, yielding the correct
`{p:3, q:3}`. With `b > 0` the loop would march past it to a = 5 and return `{p:1, q:9}`,
a trivial split that recurses forever. The N = 945 case in `<behavior>` exists to catch this.

Caller contract: `fermatSplit` is only ever reached for odd composite `v` — primes are
intercepted upstream by the shared `isPrime` branch and even numbers by the D-01 peel — and
under that contract the loop is guaranteed to find a non-trivial pair before `aMax`. Both
`return null` paths are unreachable defensive guards, not a user-facing fallback (D-02).

**(P-7) `buildTree`** — lines 458-481. Leave the `v === 1` branch (459-461) and the
`isPrime(v)` branch (462-472) completely unchanged and shared by both modes; that is what
keeps `P = P x 1` prime-leaf splitting, and the page's existing footnote, true in both
modes. Change only the composite-`v` tail, inserting a `if(mode === 'balanced'){ ... }`
block ahead of the existing `smallestPrimeFactor` code, per the approved plan's snippet:
inside it, `v % 2 === 0` returns the same node shape classic uses for an even split
(children `buildTree(2, depth+1)` and `buildTree(v/2, depth+1)`, D-01), otherwise
`fermatSplit(v)` supplies `p` and `q` and the children are `buildTree(split.p, depth+1)`
and `buildTree(split.q, depth+1)`. The classic tail below it is untouched. Because `v` is
odd going into `fermatSplit`, `p` and `q` are both odd and fall straight through the
even-check into `isPrime`/`fermatSplit` on the next level — D-03 needs no extra code.

Make no change to `assignX` (483-491), `flatten` (493-498) or `renderTree` (540-694): they
are already shape-agnostic, and balanced mode's worst-case depth and leaf count at the cap
are both smaller than what classic already renders correctly under its own ceiling.

**(P-9, partial) Toggle wiring** — near the existing listeners (lines 732-742), wire a
click handler on the `.mode-btn` elements that: sets `mode` from the button's `data-mode`;
moves `is-active` onto the clicked button and off the other; sets `#balancedNote`'s
`style.display` to `block` in balanced mode and `none` in classic; and, when
`numInput.value` is non-empty, calls `factorize(numInput.value)` so the number already on
screen re-renders in the new mode immediately. Re-rendering on toggle rather than waiting
for the next "Grow the Tree" click is deliberate: the whole point of the feature is
comparing how one number splits under each strategy. `factorize` already increments
`generation` on entry, so an in-flight reveal from the previous mode is invalidated for free.

Also set `#balancedNote`'s `textContent` once at init, to the approved copy: that Balanced
mode uses Fermat's method to find the most evenly-split factor pair at each step, that it
is capped at numbers under 1,000,000 to stay instant, and that some numbers — like a small
prime times a big one — still split unevenly, which is not a bug, just math. Leave the
existing footnote at line 374 unconditional; it is true in both modes.

Leave the chip markup, the `chips` query at line 413, the chip listeners at 736-742 and the
on-load block at 745-748 alone — Task 3 owns those. Balanced mode is reachable via the
toggle in this task; its input cap lands in Task 2.
  </action>

  <verify>
    <automated>
Step 0 — capture the Classic baseline from the pre-change file, so zero-regression is
proved against real recorded behaviour rather than hand-written expectations. Write
`git show HEAD:"Factor Tree/factor-tree.html"` to `$SP/tool/baseline.html`, inject a
harness that (for each N in 2, 97, 60, 1024, 9973, 2310, 945, 899, 9991, 29919) sets
`numInput.value`, calls the page's own flow by clicking `#goBtn`, and records
`fingerprint()` plus `primeLeafProduct()`; serialise the results into
`document.body.dataset.treeBaseline` as JSON. Run headless Chrome per
`<verification_harness>` and save that JSON to `$SP/baseline.json`.

Step 1 — build `$SP/tool/harness.html` from the modified file and assert, writing
`PASS <count>` / `FAIL <expected vs got>` into `document.body.dataset.treeMode`:
(1) on arrival `mode` is classic — the Classic `.mode-btn` carries `is-active`, the
Balanced one does not, and `#balancedNote` computes to `display:none`;
(2) with the toggle left alone, every N from `$SP/baseline.json` reproduces its recorded
fingerprint exactly, string for string — zero Classic regression;
(3) `primeLeafProduct() === N` for each of those, in both modes, for every N tried anywhere
in this harness;
(4) clicking the Balanced `.mode-btn` moves `is-active` onto it, off Classic, and makes
`#balancedNote` visible with non-empty text;
(5) in Balanced mode the fingerprints for 60, 2310, 945 and 9973 deep-equal the four
literal arrays in `<behavior>`;
(6) Balanced 2310's fingerprint is NOT equal to the baseline's Classic 2310 fingerprint,
and Balanced 945's is not equal to Classic 945's — the modes genuinely diverge;
(7) 1024's Balanced fingerprint deep-equals its Classic fingerprint and both report exactly
11 depth levels;
(8) toggling Balanced -> Classic -> Balanced with 2310 sitting in the input re-renders on
each toggle with no extra `#goBtn` click, landing the Classic then Balanced then Classic
fingerprint in turn;
(9) `window.onerror` recorded nothing across the whole run — in particular no
`RangeError: Maximum call stack size exceeded`, which is what a trivial `{p:1, q:v}` split
would produce.

Run per `<verification_harness>` and assert
`grep -q 'data-tree-mode="PASS' "$SP/dom.html" || { grep -o 'data-tree-mode="[^"]*"' "$SP/dom.html"; exit 1; }`,
then print the assertion count.

Vacuity check: temporarily change one entry of the Balanced 945 expectation and confirm the
harness reports `FAIL`, then restore it.

Static gates against `Factor Tree/factor-tree.html`:
- Literal-colour gate (the file legitimately names two colour keywords today, but only ever
  as `color-mix()` arguments, which CLAUDE.md sanctions — so filter those lines out and the
  result must be empty):
  `grep -nEi '#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|\b(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey|silver|gold|navy|teal|cyan|magenta|lime|maroon|olive|brown|beige|tan|coral|crimson|indigo|violet)\b' "Factor Tree/factor-tree.html" | grep -v 'color-mix(' `
  must print nothing.
- Token gate: every `var(--...)` name appearing in the new `.mode-toggle` / `.mode-btn` /
  `.mode-caveat` rules resolves against a custom property declared in `assets/palette.css`
  or `assets/site.css` — check each of `--panel`, `--panel-border`, `--text-dim`,
  `--accent`, `--accent-ink` with `grep -n` in those two files.
- External-resource gate: `grep -nE 'https?://' "Factor Tree/factor-tree.html"` still
  returns exactly the two Google Fonts lines plus the two SVG-namespace occurrences, and
  nothing else — no dependency added.
- Single-file gate: `git status --porcelain` lists only `Factor Tree/factor-tree.html` as
  modified.
- Shared-branch gate: `git diff -U0 -- "Factor Tree/factor-tree.html"` shows no removed line
  inside the `v === 1` or `isPrime(v)` branches of `buildTree` — both branches stay
  byte-identical.
    </automated>
    <human-check>
Open `Factor Tree/factor-tree.html` in a browser. The page should look exactly as it did,
plus a small two-button pill above the number input reading Classic | Balanced, with
Classic selected. Type 2310 and grow the tree — the familiar smallest-first staircase.
Click Balanced: the tree should immediately redraw, without touching Grow the Tree, into a
visibly wider, shallower shape, and a small caveat line should appear under the toggle.
Click Classic again and watch it snap back to the staircase. Flip the site's day/night
toggle and confirm the selected mode button and the caveat text both recolour with the rest
of the page rather than staying stuck.
    </human-check>
  </verify>

  <done>
A Balanced mode exists and is reachable: clicking it re-renders the number already in the
input using even-peeling plus Fermat splitting, recursing into both children; clicking
Classic returns the tree to exactly its pre-change structure for all six existing presets
plus 945, 899, 9991 and 29919. The `v === 1` and `isPrime` branches of `buildTree` are
untouched. No literal colour and no external resource added; only
`Factor Tree/factor-tree.html` is modified.

Known and intended transient at this commit: Balanced mode's caveat text already names the
1,000,000 cap, but the cap is not enforced until Task 2, and `MAX_BALANCED_N` is declared
but not yet read. Do not "fix" this here — Task 2 lands in the same session.
  </done>

  <reversibility rating="reversible">
Additive change to one self-contained file with no build artefact and no persisted state;
reverting is a single `git revert` and the page returns to Classic-only behaviour.
  </reversibility>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Enforce the Balanced-mode 1,000,000 input cap (D-02)</name>
  <files>Factor Tree/factor-tree.html</files>

  <behavior>
- In Balanced mode, entering 1000001 and growing the tree clears the stage and shows the
  Balanced-specific too-large message; no tree renders.
- In Balanced mode, 999999 renders normally.
- Switching that same 1000001 to Classic mode and growing succeeds — Classic's own
  1 trillion ceiling is unchanged, and 1000000001 still renders in Classic.
- In Classic mode, 1000000000001 still produces the original "under 1 trillion" message,
  word for word as before.
- `numInput.max` reads `1000000` while Balanced is selected and `1000000000000` while
  Classic is selected.
- The two messages are distinguishable: the Balanced one names Balanced mode and offers
  Classic as the way to go bigger; the Classic one is the pre-existing string, unedited.
  </behavior>

  <action>
Two edits, both from the approved plan.

**(P-8) `factorize` ceiling** — line 714's hardcoded `if(n > 1000000000000)` check. Branch
on `mode` for both the ceiling value and the message text: in balanced mode compare against
`MAX_BALANCED_N` (already declared in Task 1) and set the message to the approved
Balanced-specific copy — that the number is too large for Balanced mode, to try something
under 1,000,000, or to switch to Classic mode for bigger numbers. In classic mode keep the
existing `1000000000000` comparison and keep the existing message string exactly as it is
today; do not reword it. Leave the surrounding `Number.isFinite` / `Number.isInteger` /
`n < 1` check above it and the `n === 1` branch below it untouched.

**(P-9, partial) `numInput.max`** — extend the mode-button click handler written in Task 1
so that it also sets `numInput.max` to `MAX_BALANCED_N` when switching to balanced and back
to the classic ceiling when switching to classic. This is the browser-level hint; the
`factorize` branch above is the actual enforcement, since a user can paste a value past
`max` into a number input.

Per D-02 this cap is the entire mitigation for Fermat's slow cases. Do not add an
iteration-cap-with-fallback path, do not degrade to `smallestPrimeFactor` mid-search, and do
not mention iteration counts, timeouts or `FERMAT_MAX_ITER` in any user-visible string.
`FERMAT_MAX_ITER` stays exactly what Task 1 made it — an unreachable defensive guard.
  </action>

  <verify>
    <automated>
Extend the Task 1 harness (same scratchpad, same Chrome invocation) writing into
`document.body.dataset.treeCap`, and assert: (1) on arrival `numInput.max` is
`1000000000000`; (2) after clicking Balanced it is `1000000`, and after clicking Classic it
is `1000000000000` again; (3) in Balanced mode, setting `numInput.value` to `1000001` and
clicking `#goBtn` leaves `#treeArea` with no `svg.tree-svg`, leaves `#equation` empty, and
leaves `#message` non-empty with text that contains `Balanced`; (4) in Balanced mode
`999999` renders an `svg.tree-svg` and satisfies `primeLeafProduct() === 999999`;
(5) with `1000001` still in the input, clicking Classic renders an `svg.tree-svg`
(the toggle's own auto-re-render) and `primeLeafProduct() === 1000001`; (6) in Classic mode
`1000000000001` clears the stage and produces a `#message` string byte-identical to the one
the pre-change baseline file produces for the same input — capture that baseline string in
the Step 0 baseline run rather than typing it out; (7) `window.onerror` recorded nothing.

Assert `grep -q 'data-tree-cap="PASS' "$SP/dom.html" || { grep -o 'data-tree-cap="[^"]*"' "$SP/dom.html"; exit 1; }`.

Re-run every Task 1 assertion and every Task 1 static gate unchanged; all must still be green.

D-02 compliance gate, over `Factor Tree/factor-tree.html` with comment lines stripped so the
gate cannot be satisfied or broken by prose:
`grep -v '^\s*//' "Factor Tree/factor-tree.html" | grep -c 'FERMAT_MAX_ITER'` must be
exactly 2 — the single declaration and the single comparison inside `fermatSplit` — proving
no fallback path reads it. And
`grep -nEi 'iterations?|timed? ?out|timeout|gave up|fall ?back' "Factor Tree/factor-tree.html"`
must match nothing inside any string literal that reaches `setMessage` or
`#balancedNote`.

Vacuity check: temporarily assert `numInput.max` is `12345` after the Balanced click and
confirm the harness reports `FAIL`, then restore.
    </automated>
    <human-check>
In Balanced mode, type 1000001 and press Grow the Tree — you should get a message naming
Balanced mode and pointing you at Classic, and no tree. Without changing the number, click
Classic — the tree should appear. Then type 1000000000001 in Classic and confirm the old
"under 1 trillion" message is exactly what you remember.
    </human-check>
  </verify>

  <done>
Balanced mode refuses inputs above 1,000,000 with its own message and accepts everything at
or below it; Classic mode's ceiling, message and behaviour are untouched; `numInput.max`
tracks the selected mode. No iteration-cap fallback exists and no user-visible string
mentions iterations (D-02).
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Per-mode preset chips via event delegation</name>
  <files>Factor Tree/factor-tree.html</files>

  <behavior>
- Classic mode shows exactly six chips with `data-n` values `2, 97, 60, 1024, 9973, 2310`,
  labelled exactly as they are today (including the `(prime)` suffixes on 97 and 9973).
- Balanced mode shows exactly five chips with `data-n` values `899, 9991, 1024, 29919, 9973`.
- Clicking a chip in either mode fills the input and renders that number in the current
  mode, exactly as chips behave today.
- Chips keep working after any number of mode switches — the delegated listener survives
  `renderChips` replacing the container's contents.
- Balanced-mode chip fingerprints: `899` -> `["899","29,31","1,29,1,31"]`;
  `9991` -> `["9991","97,103","1,97,1,103"]`; `29919` -> `["29919","3,9973","1,3,1,9973"]`
  (the honest caveat example — one tiny branch, one large one, still under the cap);
  `9973` -> `["9973","1,9973"]`; `1024` identical to its Classic rendering.
  </behavior>

  <action>
Four edits, all from the approved plan.

**(P-3) Markup** — replace the six static `<button class="chip" data-n="...">` elements at
lines 358-365 with an empty `<div class="chips"></div>` container. Keep the `chips` class
and the element's position in the document unchanged so the existing `.chips` and `.chip`
CSS (lines 142-155) applies untouched.

**(P-4) Element query** — line 413: replace `const chips = document.querySelectorAll('.chip');`
with a query for the container itself, named `chipsContainer`.

**(P-9, remainder) Chip data and rendering** — add `CLASSIC_CHIPS` and `BALANCED_CHIPS`
arrays and a `renderChips(mode)` that rebuilds `chipsContainer`'s contents from the right
one. Chip sets are swapped per mode, not unioned, to avoid clutter.
`CLASSIC_CHIPS` is the existing six with their existing labels: 2; 97 labelled with the
prime suffix; 60; 1024; 9973 labelled with the prime suffix; 2310.
`BALANCED_CHIPS` is the approved five: 899 (29 x 31 — near-balanced, instant); 9991
(97 x 103 — the same idea one scale up); 1024 (shows even-peeling is identical to classic);
29919 (3 x 9973 — the honest caveat example, unbalanced but under the cap); and 9973
labelled with the prime suffix (shows primes behave identically in both modes).
Call `renderChips(mode)` once at wire-up time, synchronously in the IIFE — not inside the
`load` listener — so the chips are present before the on-load example runs.

**(P-9, remainder) Delegation** — replace the per-element `chips.forEach(...)` listeners at
lines 736-742 with a single `click` listener on `chipsContainer` that resolves the clicked
chip via `e.target.closest('.chip')`, bails when that is null, then sets `numInput.value`
from the chip's `data-n` and calls `factorize` with it — the same two lines the current
handler runs. Delegation is what lets `renderChips` freely replace the container's
`innerHTML` on every mode switch without rebinding anything.

Extend the mode-button handler from Task 1 to call `renderChips(mode)` on each switch.

**(P-10)** The on-load block at lines 745-748 needs no change: the default mode is classic,
so `factorize('60')` on load behaves exactly as before.
  </action>

  <verify>
    <automated>
Extend the harness writing into `document.body.dataset.treeChips`, and assert:
(1) on arrival `.chips` holds exactly 6 `.chip` whose `data-n` sequence is exactly
`2,97,60,1024,9973,2310` and whose label text is byte-identical to the six labels captured
from the pre-change baseline file in the Step 0 run — no relabelling;
(2) after clicking Balanced, `.chips` holds exactly 5 `.chip` with `data-n` sequence exactly
`899,9991,1024,29919,9973`;
(3) clicking each Balanced chip in turn lands `numInput.value` equal to that chip's `data-n`
and produces the fingerprint listed in `<behavior>` for 899, 9991, 29919 and 9973, with
`primeLeafProduct() === Number(data-n)` for all five including 1024;
(4) 1024's Balanced fingerprint deep-equals its Classic fingerprint;
(5) after switching Balanced -> Classic -> Balanced -> Classic, clicking the `2310` chip
still renders — proving the delegated listener survived four `innerHTML` replacements — and
its fingerprint equals the Step 0 Classic baseline for 2310;
(6) a click dispatched on the `.chips` container itself, not on any chip, changes neither
`numInput.value` nor the rendered fingerprint (the `closest` null-bail);
(7) `window.onerror` recorded nothing.

Assert `grep -q 'data-tree-chips="PASS' "$SP/dom.html" || { grep -o 'data-tree-chips="[^"]*"' "$SP/dom.html"; exit 1; }`.

Re-run every Task 1 and Task 2 assertion and every static gate from both; all must still be
green — in particular the Classic zero-regression comparison against `$SP/baseline.json`
and the single-file `git status --porcelain` gate.

Listener-count gate, over the file with comment lines stripped:
`grep -v '^\s*//' "Factor Tree/factor-tree.html" | grep -c "querySelectorAll('.chip')"`
must be 0 — the old NodeList query is gone, not merely unused.

Vacuity check: temporarily expect 4 Balanced chips instead of 5 and confirm the harness
reports `FAIL`, then restore.
    </automated>
    <human-check>
With Classic selected, the chip row should look exactly as it always has. Click Balanced:
the row should become five different chips. Click 899 and 9991 — each should snap to a wide,
shallow, near-symmetric tree. Click 29919 — it should still render, but visibly lopsided,
one tiny branch and one big one; that is the caveat the note under the toggle is warning
about. Click 1024 in both modes and confirm the two trees look the same. Flip back and forth
between modes a few times and confirm the chips never stop responding.
    </human-check>
  </verify>

  <done>
Each mode renders its own chip set from data, chips are wired by a single delegated listener
on `.chips` that survives mode switching, the Classic six are unchanged in value and label,
and the pre-change on-load behaviour is untouched. Every Task 1 and Task 2 gate is still
green and only `Factor Tree/factor-tree.html` is modified.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| *(none introduced)* | This change adds no boundary. The page makes no network request, reads no remote data, persists nothing, and has no auth, no backend and no third-party script. The only input is the same-page `#numInput` number field, already validated client-side by `factorize`'s existing `Number.isFinite` / `Number.isInteger` / `n < 1` checks, and now additionally bounded per-mode. |

## STRIDE Threat Register

security_asvs_level=1, security_block_on=high. Honest assessment: no new attack surface.
The one entry below is the only category with any real content, and it is a local
availability concern (the user's own tab), not a security boundary crossing.

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-mhb-01 | Denial of Service | `fermatSplit` in `Factor Tree/factor-tree.html` | low | mitigate | Fermat's search is O(N) in the worst case, so an unbounded input could freeze the user's own tab. Mitigated by Task 2's `MAX_BALANCED_N = 1000000` ceiling enforced in `factorize` before any tree is built (worst case at the cap benchmarked at ~165k iterations, single-digit milliseconds), with `FERMAT_MAX_ITER` as an unreachable secondary guard. Self-inflicted and local only — no other user, origin or resource is reachable from this page. |
| T-mhb-SC | Tampering | npm/pip/cargo installs | high | accept | Not applicable — this plan runs no package-manager install. The repo has no `package.json`, no lockfile and no build step; the change adds no dependency and no external resource. The Task 1 external-resource gate proves the file's only remote references remain the two pre-existing Google Fonts links. |

Categories with nothing to record, stated explicitly rather than padded: Spoofing,
Repudiation, Information Disclosure and Elevation of Privilege have no applicable surface —
there is no identity, no session, no log, no stored user data, no privilege level and no
server in this page. Input handling is arithmetic on a parsed `Number` rendered into SVG
`textContent` (never `innerHTML`), so no injection sink is introduced.
</threat_model>

<verification>
Phase-level checks, run once after Task 3:

1. The consolidated harness (all three dataset markers `data-tree-mode`, `data-tree-cap`,
   `data-tree-chips`) reports `PASS` in a single Chrome run, with the total assertion count
   printed.
2. Classic-mode zero regression: every fingerprint recorded from `git show HEAD:"Factor Tree/factor-tree.html"`
   in the Step 0 baseline run is reproduced byte-identically by the modified file.
3. `git status --porcelain` shows `Factor Tree/factor-tree.html` as the only modified file.
4. `grep -nE 'https?://' "Factor Tree/factor-tree.html"` returns only the pre-existing
   Google Fonts and SVG-namespace lines.
5. The filtered literal-colour gate prints nothing.
6. Every vacuity check (one per task) produced a `FAIL` when fed a deliberately wrong
   expectation, proving the harness is not green by accident.
</verification>

<success_criteria>
- Classic mode is behaviourally indistinguishable from the pre-change tool for all six
  existing presets plus 945, 899, 9991, 29919 and 1000000000001.
- Balanced mode peels 2s one at a time (D-01), splits odd composites by Fermat's method,
  and recurses balanced into both children (D-03) — proved by the 2310 and 945 fingerprints
  and by 9 splitting into 3, 3.
- Balanced mode caps input at 1,000,000 with its own message, and no iteration-cap fallback
  exists anywhere in the file (D-02).
- Each mode has its own chip set, delegated chip handling survives repeated mode switching,
  and toggling mode with a number in the input re-renders immediately.
- One file changed, no dependency added, no literal colour added, both themes correct.
</success_criteria>

<output>
Create `.planning/quick/260929-mhb-implement-the-approved-plan-at-home-main/260929-mhb-SUMMARY.md` when done.
</output>
