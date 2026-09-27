---
phase: quick-260927-eel
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Congruence Wheel/congruence-wheel.html
  - index.html
autonomous: true
requirements: [PAL-02, PAL-04, NAV-02]

estimate:
  tokens: 65000
  raw_tokens: 65000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "Every user-facing surface of the Congruence Wheel says `equivalence class` / `equivalence classes`; the word `residue` survives nowhere in `Congruence Wheel/congruence-wheel.html` nor in the `index.html` card that describes this tool — not in the lede, the reference-panel heading, the SVG `aria-label`, the per-wedge `aria-label`s, or the live caption (D-01)."
    - "Clicking one wedge marks it as the first addend in yellow; clicking a second wedge marks it as the second addend in blue and, in the same click, marks the class `(a + b) mod N` as the sum in green — no extra button, no confirm step (D-02)."
    - "Clicking the same wedge twice is a legal doubling: that wedge carries both addend roles at once and the sum `(2a) mod N` is marked green (D-02)."
    - "A click while a sum is on screen starts a fresh pair: the previous yellow, blue and green marks all clear and the clicked class becomes the new first addend (D-02)."
    - "Both existing entry points into selection — the wedge (click plus Enter/Space) and the reference-list row button — drive the one shared `select(idx)` state machine; neither grows a parallel implementation (D-03)."
    - "The pre-existing single-class inspection survives: one class is marked on load and its membership sentence still appears in the `aria-live` caption; that slot is now explicitly the first addend rather than a nameless `selected` (D-03)."
    - "The wheel, the reference list, the caption and each wedge's `aria-label` all report the same three role assignments, so a class holding two roles at once is still unambiguous to a sighted user and to a screen-reader user (D-03)."
    - "Moving the modulus slider clears the pair and clamps the first addend into range, so no equation that is false for the new modulus can stay on screen (D-03)."
    - "SVG, PNG and print export still work and now carry the marked wedges: the export keeps the hit path of every marked wedge (not just one), reproduces the dashed multi-role hint, and names the file after the pair (D-03)."
    - "The `localStorage` key `congruence-wheel` and its `{N, depth}` payload shape are byte-for-byte unchanged — the addend pair is deliberately ephemeral, so a returning user's saved modulus and ring count still restore (D-03)."
    - "`congruence-wheel.html` still declares zero literal colour values: yellow, blue and green each resolve through `var()` to a `--role-*` token already declared in `assets/palette.css`, and `assets/palette.css` itself is not edited (PAL-02, PAL-04)."
    - "The tool remains one self-contained `.html` file with inline `<style>` and inline `<script>` and gains no dependency — its only external references are still `assets/` and Google Fonts (NAV-02)."
  artifacts:
    - "Congruence Wheel/congruence-wheel.html"
    - "index.html"
  key_links:
    - "wedge `click` / Enter-Space -> `select(idx)` -> `state.a` / `state.b` / `state.sum` -> `render()` -> role classes on the wedge `g`: the one chain that turns a click into a highlight. A second selection path added anywhere here re-creates the bug the constraint forbids."
    - "`rolesFor(idx)` -> `is-a` / `is-b` / `is-sum` class string -> CSS source order (`is-a`, then `is-b`, then `is-sum`, all after the `:hover` and `:focus-visible` rules): equal-specificity ordering IS the fill-precedence mechanism. Reordering those rules silently changes which colour a two-role wedge shows."
    - "`state.sum !== null` -> the fresh-pair branch of `select`: the single test that separates 'start over' from 'complete the pair'. Break it and the tool either never resets or never completes."
    - "`buildExportSvg`'s wedge-hit pass -> the three role class names: the export deletes the hit path of every wedge it does not recognise as marked, so a missed class name silently drops a highlight from the exported file."
    - "`COPY_PROPS` -> `stroke-dasharray` -> the global `px` strip: the dashed multi-role hint only survives export through this path, and an un-stripped `9px 6px` is not a valid SVG attribute value."
    - "`nRange` input handler -> pair clear + first-addend clamp: without it a stale `[7] + [3] = [0] (mod 10)` can remain on screen under `mod 4`, where it is arithmetically false."
---

<objective>
Two changes to the Congruence Wheel, both inside the existing single self-contained file.

1. Retire the term `residue class` in favour of `equivalence class` on every surface a reader sees (D-01).
2. Make the group operation these classes carry — addition — interactive: click one class (yellow), click another (blue), and the tool marks the resulting class green, showing the modular arithmetic that got there (D-02).

No `CONTEXT.md` exists for this quick task, so the decisions below are derived directly from the user's verbatim request and are recorded here as the authority: **D-01** = terminology (request item 1), **D-02** = interactive addition, yellow first addend / blue second addend / green sum (request items 2A and 2B), **D-03** = Claude's discretion, resolved as documented in `<discretion_decisions>`.

Purpose: the tool currently draws the additive group ℤ/Nℤ but never lets a learner *operate* in it — the partition is visible and the group law is invisible. Adding the operation to the picture is the project's core value applied to this page. The rename aligns the page with the vocabulary a learner will meet in an abstract-algebra text, where the quotient's elements are equivalence classes of a congruence relation.
Output: two edited `.html` files, the tool still self-contained and still free of literal colours, with the whole interaction proven by an automated real-browser harness.
</objective>

<execution_context>
@~/.claude/gsd-core/workflows/execute-plan.md
@~/.claude/gsd-core/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@./CLAUDE.md
@./.claude/CLAUDE.md
@assets/palette.css
@Congruence Wheel/congruence-wheel.html
</context>

<grounded_facts>
Read live from the working tree while planning, and the browser facts were executed against the current file before this plan was written — treat as current, re-confirm cheaply if an edit surprises you.

| Fact | Value |
|------|-------|
| `Congruence Wheel/congruence-wheel.html` length | 820 lines; inline `<script>` spans lines 353-818 |
| Line 353 | exactly `<script>` on its own line, so `awk '/^<script>$/{f=1;next} /^<\/script>$/{f=0} f'` extracts the tool script and skips both the one-line pre-paint theme script (line 5) and the `<script defer src>` |
| `residue` occurrences, whole repo | **4** — `congruence-wheel.html` line 301 (lede), line 332 (svg `aria-label`), line 341 (`<h2>Residue classes</h2>`), and `index.html` line 200 (the Congruence Wheel card's body prose). No other tool page mentions it |
| Internal identifiers containing `residue` | **none** — nothing in the script needs renaming for D-01. The reference-list class names (`r-label`, `r-set`) and variables (`refList`, `refCount`) name a *row*, not a residue |
| Existing selection state | `var state = { N: 10, depth: 6, selected: 0 };` (line 370). `select(idx)` (559-563) sets `state.selected`, calls `persist()` then `render()` |
| `persist()` (565-567) | writes `{N, depth}` only under key `congruence-wheel` — `selected` is already not persisted |
| Restore guard (372-376) | accepts `saved.N` in 1..60 and `saved.depth` in 2..10; wrapped in try/catch |
| `state.selected` reference sites outside `render()` | 3 — the `nRange` input handler's clamp (804), `exportFileName` (675), and `updateCaption` (553) |
| `is-selected` reference sites | CSS lines 135, 146, 225, 233; JS lines 462, 522, 523; and **`buildExportSvg` line 642**, which deletes the `.wedge-hit` path of every wedge whose parent is not `.is-selected` |
| Wedge markup | one `<g class="wedge">` per class, `tabindex="0"`, `role="button"`, `aria-pressed`, `aria-label="Class i modulo N"`, containing one `.wedge-hit` path, `depth` `.cell-num` texts and one `.ellipsis` |
| CSS ordering today | `.wedge:hover .wedge-hit` (134), `.wedge.is-selected .wedge-hit` (135), `.wedge:focus-visible .wedge-hit` (137), `.wedge.is-selected .cell-num` (146). All four are specificity 0,3,0 — **source order decides** |
| Colour literals in the tool file | **0**. `color-mix(in srgb, var(--text) 6%, transparent)` at line 80 establishes `transparent` as an accepted non-colour keyword here |
| Local alias precedent | `Factor Tree/factor-tree.html` lines 15-22 open the tool's `<style>` with a `:root{}` block of aliases built entirely from `var()`/`color-mix()` — the pattern this plan reuses |
| Palette tokens for the three roles | `--role-active` (#ffcf5c night / #b8780a day) = yellow; `--role-input` (= `--accent`, #7c9bff / #3457c9) = blue; `--role-result` (= `--accent-2`, #33f5c0 / #0f9a80) = green. All three already exist; **`assets/palette.css` is not edited** |
| Rendered DOM at defaults (N=10, depth=6) | 10 `g.wedge`, 10 `.wedge-hit`, 60 `.cell-num`, 10 `.row-btn`, 1 `.is-selected` of each kind. `grep -o 'class="wedge'` counts **20** because `.wedge-hit` also matches — gate on `class="wedge-hit"` and `class="wedge( \|")` separately |

Proven in the actual target browser (`google-chrome --headless`, window 1200x2400) against the current file, so the harness design below rests on facts, not guesses:

1. `new MouseEvent('click', {bubbles:true})` dispatched directly on a `g.wedge` fires the tool's own click listener — no hit testing, no pointer events needed.
2. `new KeyboardEvent('keydown', {bubbles:true, key:'Enter'})` on a `g.wedge` fires the same path.
3. `render()` rebuilds `#wheel-dynamic` wholesale, so the harness **must re-query `#wheel-dynamic g.wedge` after every click** — a node captured before a click is detached afterwards.
4. Clicking `#export-svg` in headless succeeds and writes the real filename into `#export-status` (observed: `Saved congruence-wheel-N10-depth6-class5.svg`). This is the one seam that makes `exportFileName` and the exported markup assertable from a harness, since both live inside the IIFE.
</grounded_facts>

<discretion_decisions>
D-03, the discretion the request leaves open, resolved here so the executor does not re-litigate:

- **The existing selected slot becomes the first addend.** `state.selected` is renamed `state.a`; the tool keeps exactly one selection machine. This is the constraint's blessed option ("reuse it as operand A's slot") and it is why no mode switch is introduced.
- **A one-flag stage, not a mode.** `state.awaiting` is `'a'` on load and after a modulus change, `'b'` once the user has picked a first addend. The load state still marks class `[0]` exactly as today; the caption says outright what the next click does, so the flag is never invisible.
- **Fill precedence is sum > second addend > first addend**, implemented purely as CSS source order at equal specificity, plus a dashed stroke (`is-multi`) whenever a class holds more than one role. Colour can only show one role per wedge, so the reference list and the caption carry the role names in text as the second, lossless channel.
- **The pair is ephemeral.** `persist()` keeps writing `{N, depth}` only. Reloading restores the modulus and rings, not a half-finished sum — and the stored payload shape stays identical, so returning users are unaffected.
- **A modulus change clears the pair** and clamps the first addend, because `[7] + [3] = [0]` is true mod 10 and false mod 4.
- **`index.html`'s card prose is in scope for D-01.** It is the hub's one-sentence description *of this tool*, not another tool's file; leaving it would make the hub contradict the page it links to. Nothing else in `index.html` is touched.
- **No API-coverage, assumption-delta or schema-push work exists here** — see `<gate_notes>`.
</discretion_decisions>

<tasks>

<task type="tracer">
  <name>Task 1: Equivalence class, on every surface a reader sees</name>
  <files>Congruence Wheel/congruence-wheel.html, index.html</files>
  <action>
The thin end-to-end slice for D-01: it touches static markup, an accessibility attribute, script-generated strings and the hub page — the whole span Task 2 will work across — while changing no logic at all. Every edit is a display string.

In `Congruence Wheel/congruence-wheel.html`, replace the term at exactly these four sites:

1. The lede (line 301): `Every natural number belongs to exactly one residue class modulo N` becomes `... exactly one equivalence class modulo N`. Leave the rest of the sentence, including the later bare `one wedge per class`, untouched — bare `class` is already the right word.
2. The `svg#wheel` `aria-label` (line 332): `partitioned into N residue classes` becomes `partitioned into N equivalence classes`.
3. The reference-panel heading (line 341): `<h2>Residue classes</h2>` becomes `<h2>Equivalence classes</h2>`.
4. The per-wedge `aria-label` expression in `render()` (line 465): `'Class ' + i + ' modulo ' + N` becomes `'Equivalence class ' + i + ' modulo ' + N`.

Then in `updateCaption()` (line 556) the caption opens `'Class <b>[' + s + ']</b> contains every natural number ...'`; make that first word `Equivalence class`. Change nothing else about the sentence in this task — Task 2 rewrites the caption's structure, and doing both here would make the diff impossible to review.

In `index.html`, the Congruence Wheel card's body prose (line 200) says `Every natural number belongs to exactly one residue class modulo N`; make it `equivalence class`. This is the hub's description of this very tool (see `<discretion_decisions>`). Touch nothing else in `index.html`: no card heading, no nav anchor, no `href`, no hero text, and no other tool's card.

Do not touch: the page `<title>` or `<h1>` (neither mentions the term), the footer formula line (it uses `[r]` notation and the word `residue` does not appear in it), the `localStorage` key literal `congruence-wheel`, the reference-row class names `r-label` / `r-set`, the variables `refList` / `refCount` / `r0`, or any other tool's `.html` file. No identifier in the script contains `residue`, so there is nothing internal to rename here.
  </action>
  <verify>
    <automated>cd "/home/mainaccount/Claude/number-theory-browser-tools" && F="Congruence Wheel/congruence-wheel.html" && test "$(grep -oi 'residue' "$F" index.html | wc -l)" -eq 0 && test "$(grep -oi 'residue' */*.html | wc -l)" -eq 0 && test "$(grep -oF 'Equivalence classes</h2>' "$F" | wc -l)" -eq 1 && test "$(grep -oi 'equivalence class' "$F" | wc -l)" -eq 5 && test "$(grep -oi 'equivalence class' index.html | wc -l)" -eq 1 && test "$(grep -oF "localStorage.getItem('congruence-wheel')" "$F" | wc -l)" -eq 1 && test "$(grep -oiE '#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(' "$F" | wc -l)" -eq 0 && T=$(mktemp --suffix=.js) && awk '/^<script>$/{f=1;next} /^<\/script>$/{f=0} f' "$F" > "$T" && node --check "$T" && rm -f "$T" && D=$(mktemp --suffix=.html) && timeout 60 google-chrome --headless --disable-gpu --no-sandbox --window-size=1200,2400 --virtual-time-budget=4000 --dump-dom "file://$PWD/Congruence%20Wheel/congruence-wheel.html" 2>/dev/null > "$D" && test "$(grep -oi 'residue' "$D" | wc -l)" -eq 0 && test "$(grep -o 'aria-label="Equivalence class ' "$D" | wc -l)" -eq 10 && test "$(grep -oF '<h2>Equivalence classes</h2>' "$D" | wc -l)" -eq 1 && test "$(grep -oF 'Equivalence class <b>[0]</b>' "$D" | wc -l)" -eq 1 && test "$(grep -o 'class="wedge-hit"' "$D" | wc -l)" -eq 10 && test "$(grep -o 'class="cell-num"' "$D" | wc -l)" -eq 60 && rm -f "$D" && echo TASK1_PASS</automated>
  </verify>
  <done>The word `residue` appears in no `.html` file in the repo; the tool file carries exactly the 5 expected `equivalence class` strings and `index.html` exactly 1; the storage key literal is intact; the file still declares zero colour literals and its script still parses; and a real browser renders the new heading, the new caption opening and all 10 renamed wedge `aria-label`s with the wheel otherwise unchanged (10 hit paths, 60 digits).</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Add two equivalence classes on the wheel — yellow + blue = green</name>
  <files>Congruence Wheel/congruence-wheel.html</files>
  <behavior>
Expectations to make true, in the order the harness asserts them. Defaults are N=10, depth=6, and `#wheel-dynamic g.wedge` is re-queried after every click (grounded fact 3).

- On load: exactly one `g.wedge.is-a` and it is index 0; zero `.is-b`; zero `.is-sum`; zero `.is-multi`. The caption still describes class `[0]`'s membership and tells the reader a click chooses the first addend.
- Click wedge 3: `.is-a` count 1 and it is index 3; `.is-b` and `.is-sum` still 0. The caption names `[3]` as the first addend and asks for a second class.
- Click wedge 7: index 3 has `is-a`, index 7 has `is-b`, index 0 has `is-sum`; each of the three counts is exactly 1; `.is-multi` count 0. The caption contains `3 + 7 = 10` and `(mod 10)` and the three bracketed classes.
- Click wedge 5 (a click while a sum is displayed): `.is-a` count 1 at index 5; `.is-b` and `.is-sum` back to 0 — the previous three marks are all cleared.
- Click wedge 5 again (same class twice): index 5 carries `is-a` **and** `is-b` **and** `is-multi`; index 0 carries `is-sum`; the caption contains `5 + 5 = 10`.
- Reference list in that same state: the row for class 5 carries both `is-a` and `is-b` and its role text contains `A` and `B`; the row for class 0 carries `is-sum` and its role text contains `A+B`. Every `.row-btn` with a role has `aria-pressed="true"`, and rows with no role have `aria-pressed="false"`.
- Identity case — click wedge 3 (fresh first addend) then wedge 0: index 3 carries `is-a` and `is-sum` and `is-multi`; index 0 carries `is-b`; the caption contains `3 + 0 = 3`.
- Keyboard parity: `keydown` with `key:'Enter'` on a wedge advances the same machine (a second addend and a sum appear).
- Reference-row parity: a `click` on a `.row-btn` advances the same machine as a wedge click.
- Modulus change: with a first addend of 7 and no second, set `#n-range` to `4` and dispatch `input` — 4 wedges render, `.is-a` count is 1 and sits at index 3 (clamped), `.is-b` and `.is-sum` are 0, and the caption carries no `+`.
- Export, from the doubling state (a=5, b=5, sum=0): clicking `#export-svg` sets `#export-status` to exactly `Saved congruence-wheel-N10-depth6-a5-b5-sum0.svg`, and the captured export blob contains exactly 2 `wedge-hit` paths (wedge 5 carrying two roles is one path, wedge 0 the other) and the string `stroke-dasharray="9 6"`.
  </behavior>
  <action>
Add the group operation to the wheel, per D-02, entirely inside the existing inline `<style>` and inline `<script>` — no new file, no dependency, no new external reference (NAV-02). Reuse the one selection machine that already exists rather than adding a second one.

**Slot aliases (PAL-02, PAL-04).** Open the tool's `<style>` with a `:root{}` block, following `Factor Tree/factor-tree.html`'s precedent, declaring six aliases built only from `var()`/`color-mix()`: `--slot-a: var(--role-active)` (yellow first addend), `--slot-b: var(--role-input)` (blue second addend), `--slot-sum: var(--role-result)` (green sum), plus `--slot-a-soft` / `--slot-b-soft` / `--slot-sum-soft`, each `color-mix(in srgb, var(--slot-X) 22%, transparent)`. Comment the block with what each role means. Write no hex, `rgb()`, `hsl()` or named colour anywhere in this task, and do not edit `assets/palette.css` — all three tokens already exist there.

**Role CSS.** Delete the two `.wedge.is-selected` rules and the two `.row-btn.is-selected` rules, and add in their place, **positioned after both the `.wedge:hover .wedge-hit` and `.wedge:focus-visible .wedge-hit` rules and in exactly this order** — `is-a`, then `is-b`, then `is-sum`:

- `.wedge.is-a .wedge-hit` / `.is-b` / `.is-sum`: `opacity:1`, a `stroke-width` (1.6 for the addends, 2.2 for the sum so the answer reads as the loudest mark), `fill:var(--slot-X-soft)`, `stroke:var(--slot-X)`.
- `.wedge.is-multi .wedge-hit{ stroke-dasharray:9 6; }` — the non-colour channel for a class holding two roles.
- `.wedge.is-a .cell-num` / `.is-b` / `.is-sum`: `fill:var(--slot-X)`, `font-weight:600`.
- `.row-btn.is-a .swatch` / `.is-b` / `.is-sum`: `background:var(--slot-X)`; same three for `.r-label` with `color:`.
- `.row-btn .r-roles`: the role tag — JetBrains Mono, ~11px, `color:var(--text-dim)`, `margin-left:auto`, `flex:none`.
- `.caption .slot-a` / `.slot-b` / `.slot-sum`: `color:var(--slot-X)`, `font-weight:600`. Keep the existing `.caption b` rule for the single-class sentence.

All these selectors are specificity 0,3,0, identical to the `:hover` and `:focus-visible` rules they must beat, so **source order is the entire precedence mechanism** (sum beats second addend beats first addend beats hover/focus). A reordering here is a silent behaviour change, not a cosmetic one.

**State.** Change `state` to `{ N: 10, depth: 6, a: 0, b: null, sum: null, awaiting: 'a' }`. Rename every `state.selected` reference to `state.a` — there are three outside `render()` (the `nRange` clamp, `exportFileName`, `updateCaption`) plus the one in `render()`'s wedge loop and the one in the reference-list loop. Leave `persist()` exactly as it is: it writes `{N, depth}` only, so the stored payload shape and the key `congruence-wheel` are untouched and the pair stays ephemeral by design.

**The machine.** Rewrite `select(idx)` as the whole interaction, keeping its name and signature so both existing call sites (the wedge's click/keydown wiring and the reference row's click) keep working unchanged:

- If `state.sum !== null` **or** `state.awaiting === 'a'`: start a fresh pair — `state.a = idx`, `state.b = null`, `state.sum = null`, `state.awaiting = 'b'`.
- Otherwise: complete the pair — `state.b = idx`, `state.sum = (state.a + idx) % state.N`, `state.awaiting = 'a'`.
- Then `persist(); render();` as today.

Both operands are already in `0..N-1`, so `(a + b) % N` needs no normalisation and can never be negative. Do not special-case `idx === state.a`: picking the same class twice is a legal doubling and must fall through the completing branch (D-02).

**Roles.** Add `function rolesFor(idx)` returning an array of the role names that class `idx` holds: `'a'` when `idx === state.a`, `'b'` when `idx === state.b`, `'sum'` when `idx === state.sum`, in that order. `state.b`/`state.sum` are `null` when unset and `null === 0` is false, so an unset slot can never match class 0 — do not add a truthiness test, which *would* wrongly skip class 0.

In `render()`'s wedge loop, replace the `isSelected` logic with `rolesFor(i)`: the group's `class` becomes `'wedge'` plus `' is-' + role` for each role plus `' is-multi'` when the array has more than one entry; `aria-pressed` is `'true'` when the array is non-empty; and the `aria-label` keeps Task 1's `'Equivalence class ' + i + ' modulo ' + N` and appends the role in words — first addend, second addend, sum — joined with ` and ` for a multi-role class, so a screen-reader user gets what the colour conveys. Apply the same class list and `aria-pressed` rule to the reference-list `.row-btn`, and append a `<span class="r-roles">` whose text is the role tags `A`, `B`, `A+B` joined with ` · ` (omit the span entirely for a row with no role).

**Caption.** Rewrite `updateCaption()` with two branches, both still writing into the existing `aria-live="polite"` element:

- No sum yet: keep Task 1's membership sentence for `state.a` (`Equivalence class <b>[a]</b> contains every natural number congruent to a (mod N): terms, … — and nothing else.`) and append one prompt naming what the next click does — for `awaiting === 'a'`, that a click chooses the first addend; for `awaiting === 'b'`, that a click chooses a class to add to `[a]` and that picking the same class again is allowed. The two prompts are what keep `awaiting` from being invisible state.
- Sum shown: the equation, `[a]`, `[b]` and `[sum]` each wrapped in the matching `slot-*` span, then the arithmetic `a + b = (a+b) ≡ sum (mod N)`, then the sentence that adding any member of `[a]` to any member of `[b]` always lands in `[sum]`, followed by `[sum]`'s first `min(3, depth)` members in a `.mono` span. Write the `≡` and `…` as the literal characters already used elsewhere in this file.

Every value interpolated into the caption's `innerHTML` is an integer from `state` (from `parseInt` of a range input, or an array index) — keep it that way; do not route any string through it.

**Modulus change.** In the `nRange` input handler, after `state.N` is read, clamp `state.a` to `state.N - 1` as today, then clear the pair — `state.b = null`, `state.sum = null`, `state.awaiting = 'a'` — because an equation that held for the old modulus is false for the new one. Leave the `depthRange` handler alone: ring count does not change which classes exist, so a displayed pair survives it.

**Export.** Two edits, both required or a shipped feature regresses:

1. `buildExportSvg`'s wedge-hit pass currently keeps the hit path only when the parent group has `is-selected` and deletes the rest. Change the test to keep the path when the parent has **any** of `is-a`, `is-b`, `is-sum` (still forcing `opacity` to `1`), so all marked wedges survive into the exported file instead of just one.
2. Add `'stroke-dasharray'` to `COPY_PROPS` and change that loop's `val.replace(/px$/, '')` to strip **every** `px` occurrence (`/px/g`), because a computed dasharray reads `9px 6px` and `stroke-dasharray="9px 6"` is not a valid attribute value. No other copied property contains an inner `px`, so the global strip is equivalent for them. Do this in the paint loop, which reads the *live* element — `getComputedStyle` on the detached clone returns nothing.

Then update `exportFileName` to name the pair: `congruence-wheel-N{N}-depth{depth}-a{a}` with `-b{b}-sum{sum}` appended only when `state.b !== null`, keeping the existing `.replace(/[^A-Za-z0-9._-]/g, '')` sanitiser and the `ext` argument.

**Leave alone:** all wheel geometry (`CX`, `CY`, `HOLE_R`, `OUTER_R`, `polar`, `annularSectorPath`, the zebra bands, the ring and radial boundaries, the font-size fit), the `.ellipsis` and `.center-label` rendering, the footer formula line, the restore guard's ranges, the print-theme flip, the PNG canvas path, and the `depthRange` handler.

**Verification fixture.** Write the harness described in `<behavior>` to this executor's scratchpad as `wheel-add-harness.js` with the Write tool; it is **not** committed and must not land in the repo. It registers a `window` `load` listener (so it runs after the tool's own) and inside `setTimeout(..., 0)` runs each expectation, re-querying `#wheel-dynamic g.wedge` after every dispatch. Gestures are `new MouseEvent('click', {bubbles:true})` on the wedge group or `.row-btn`, `new KeyboardEvent('keydown', {bubbles:true, key:'Enter'})` for the keyboard case, and for the modulus case set `#n-range`'s `value` then dispatch `new Event('input', {bubbles:true})`. For the export expectation, stub `URL.createObjectURL` with a wrapper that captures the Blob and delegates to the real function, click `#export-svg`, then read the captured blob with `blob.text()` and assert inside the `.then()`. Append `<div id="test-out">` with the pipe-joined log as the final step of that `.then()`, ending in `ALL_PASS` only when every expectation held, so the sentinel cannot print before the async export assertion has run.
  </action>
  <verify>
    <automated>HDIR="${SCRATCH:?set SCRATCH to this executor's scratchpad absolute path, where wheel-add-harness.js was written}"; cd "/home/mainaccount/Claude/number-theory-browser-tools" && F="Congruence Wheel/congruence-wheel.html" && test "$(grep -oF 'state.selected' "$F" | wc -l)" -eq 0 && test "$(grep -oF 'is-selected' "$F" | wc -l)" -eq 0 && test "$(grep -oF 'function rolesFor(' "$F" | wc -l)" -eq 1 && test "$(grep -oF '--slot-a: var(--role-active)' "$F" | wc -l)" -eq 1 && test "$(grep -oF '--slot-b: var(--role-input)' "$F" | wc -l)" -eq 1 && test "$(grep -oF '--slot-sum: var(--role-result)' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'is-multi' "$F" | wc -l)" -ge 2 && test "$(grep -oF "'stroke-dasharray'" "$F" | wc -l)" -eq 1 && test "$(grep -oF 'replace(/px/g' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'replace(/px$/' "$F" | wc -l)" -eq 0 && test "$(grep -oi 'residue' "$F" | wc -l)" -eq 0 && test "$(grep -oi 'equivalence class' "$F" | wc -l)" -ge 5 && test "$(grep -oF "localStorage.setItem('congruence-wheel', JSON.stringify({ N: state.N, depth: state.depth }))" "$F" | wc -l)" -eq 1 && test "$(grep -oiE '#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(' "$F" | wc -l)" -eq 0 && test "$(grep -oF 'src=' "$F" | wc -l)" -eq 1 && PAL_ST="$(git status --porcelain -- assets/palette.css)" && test -z "$PAL_ST" && T=$(mktemp --suffix=.js) && awk '/^<script>$/{f=1;next} /^<\/script>$/{f=0} f' "$F" > "$T" && node --check "$T" && rm -f "$T" && sed 's#</body>#<script src="wheel-add-harness.js"></script></body>#' "$F" > "$HDIR/wheel-add-harness.html" && timeout 90 google-chrome --headless --disable-gpu --no-sandbox --window-size=1200,2400 --virtual-time-budget=8000 --dump-dom "file://$HDIR/wheel-add-harness.html" 2>/dev/null | grep -o '<div id="test-out">[^<]*</div>' | tee /dev/stderr | grep -q 'ALL_PASS' && D=$(mktemp --suffix=.html) && timeout 60 google-chrome --headless --disable-gpu --no-sandbox --window-size=1200,2400 --virtual-time-budget=4000 --dump-dom "file://$PWD/Congruence%20Wheel/congruence-wheel.html" 2>/dev/null > "$D" && test "$(grep -o 'class="wedge-hit"' "$D" | wc -l)" -eq 10 && test "$(grep -o 'class="cell-num"' "$D" | wc -l)" -eq 60 && test "$(grep -o 'class="wedge is-a"' "$D" | wc -l)" -eq 1 && rm -f "$D" && GS="$(git status --porcelain)" && case "$GS" in *harness*) echo "harness artifact left in working tree" >&2; exit 1;; esac && echo TASK2_PASS</automated>
    <human-check>Open `Congruence Wheel/congruence-wheel.html` over `file://` in a real browser, in both day and night themes. Click one wedge and confirm it turns yellow and the caption asks for a second class; click another and confirm it turns blue while the class holding the sum turns green, with the caption showing the arithmetic. Click the same wedge twice in a row and confirm the doubling reads correctly (dashed outline on the shared class, its role tag in the reference list showing both roles). Confirm the reference list and the wheel always agree, that clicking a reference row works the same as clicking a wedge, and that Tab + Enter drives the same interaction. Slide the modulus and confirm the pair clears rather than leaving a false equation. Then export PNG and SVG from a completed pair and confirm all three highlight colours and the dashed outline appear in the downloaded file, and that Print / Save as PDF still renders dark ink on light paper.</human-check>
  </verify>
  <done>The harness prints `ALL_PASS`: first click marks yellow, second marks blue and immediately marks `(a+b) mod N` green, a third click starts a fresh pair, the same-class doubling and the identity case both render their two-role class with `is-multi`, the reference list and `aria-pressed` agree with the wheel, keyboard and reference-row entry points drive the same machine, a modulus change clamps the first addend and clears the pair, and the export names the pair exactly while carrying both marked hit paths and the dashed hint. No `state.selected` or `is-selected` reference survives, the storage write is byte-identical, `assets/palette.css` is unmodified, the file declares zero colour literals and keeps its single external script reference, its script parses, and no harness artifact is left in the working tree.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| `localStorage` -> page state | The `congruence-wheel` key is read back on every load and rehydrated into `state`; the store is user-writable via devtools and shared with anything else on the origin |
| `state` integers -> caption `innerHTML` | The caption is assembled with `innerHTML`, so anything reaching it is parsed as markup |
| live DOM -> exported SVG / PNG blob | `buildExportSvg` serialises a clone of the live wheel into a file the user saves and may open or share |
| page -> network | None introduced. No fetch, no form, no third-party script; external references stay `assets/` and Google Fonts |

This is a static, client-side visualisation: no accounts, no auth, no user-supplied text, no server, no database, and no new data of any kind is handled. The register below is correspondingly small and is recorded honestly rather than padded.

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-eel-01 | Tampering | caption `innerHTML` in `updateCaption()` | low | mitigate | Every interpolated value stays an integer already in `state` — a class index, or `state.N`/`state.depth` from `parseInt` of a `type="range"` input. The action forbids routing any string through the caption, and the restore guard keeps rejecting an `N` outside 1..60 or a `depth` outside 2..10, so a hand-edited `localStorage` payload cannot reach the caption either |
| T-eel-02 | Tampering | `localStorage` key `congruence-wheel` | low | mitigate | The write is pinned byte-for-byte by a Task 2 gate, so the payload shape cannot drift and a returning user's saved modulus and ring count keep restoring. The addend pair is deliberately not persisted, so no new field crosses this boundary |
| T-eel-03 | Denial of Service | modular arithmetic on a user-driven modulus | low | mitigate | `(a + b) % N` runs on two integers already clamped to `0..N-1` with `N <= 60`; there is no loop, no allocation and no recursion in the new path. The `nRange` handler clamps the first addend and clears the pair, so `render()` can never be handed an out-of-range index |
| T-eel-04 | Information Disclosure | exported SVG / PNG blob | low | accept | The export contains exactly what is already on screen — the wheel, its digits and the marked wedges. This change adds marks to it, not data; no state, no storage contents and no identifier is serialised, and the pre-existing blob/download path is unchanged apart from which hit paths survive |
| T-eel-05 | Elevation of Privilege | throwaway verification harness | low | mitigate | The harness is a JS file plus a `sed`-injected HTML copy in the executor's scratchpad, used only at verify time. The Task 2 gate fails if `git status` shows a harness file in the working tree, and the `src=` count gate pins the tool page to its single pre-existing external script reference |
| T-eel-SC | Tampering | npm/pip/cargo installs | low | accept | This repository has no package manager and this plan adds zero install tasks, so the package-legitimacy gate has no applicable surface. No `<script src>` and no third-party `<link>` is added; the only external resource on the site remains Google Fonts, untouched |
</threat_model>

<multi_source_coverage_audit>
| Source | Item | Covered by | Status |
|--------|------|-----------|--------|
| CONTEXT | D-01 — use `equivalence class(es)` instead of `residue class(es)` | Task 1 (4 sites in the tool + the caption opening + the hub card) | COVERED |
| CONTEXT | D-01 — all user-facing text: labels, headings, status text, `aria-label`s | Task 1 (lede, `<h2>`, svg `aria-label`, per-wedge `aria-label`, live caption) | COVERED |
| CONTEXT | D-01 — internal JS identifiers are not required to change | Task 1 | COVERED — grep confirms **zero** identifiers contain `residue`; nothing internal to rename |
| CONTEXT | D-02A — select a class, highlighted yellow | Task 2 (`is-a` -> `--slot-a` -> `--role-active`) | COVERED |
| CONTEXT | D-02A — select another class, highlighted blue | Task 2 (`is-b` -> `--slot-b` -> `--role-input`) | COVERED |
| CONTEXT | D-02B — software adds them and marks the resulting class green | Task 2 (`(a+b) % N` -> `is-sum` -> `--slot-sum` -> `--role-result`) | COVERED |
| CONTEXT | D-02 — second click may be a different **or the same** sector | Task 2 (`<behavior>` doubling case; no `idx === state.a` special case allowed) | COVERED |
| CONTEXT | D-02 — a click after a result starts a fresh pair, clearing all three marks | Task 2 (`state.sum !== null` branch; `<behavior>` expectation 4) | COVERED |
| CONTEXT | D-02 — integrate with the existing sector click wiring and state object | Task 2 (`select(idx)` keeps its name and both call sites; `state.selected` becomes `state.a`) | COVERED |
| CONTEXT | D-02 — do not break existing single-class selection / inspection | Task 2 (load still marks one class and captions its membership; gate asserts `class="wedge is-a"` count 1 at load) | COVERED |
| GOAL | Every concept gets a visualization a self-learner can interact with and immediately understand | Task 2 turns the group law from prose into a two-click operation on the diagram | COVERED |
| REQ | PAL-02 — every colour resolves via `var()` to an `assets/palette.css` token | Task 2 (six `var()`/`color-mix()` aliases; zero-colour-literal gate in both tasks; palette.css diff gate) | COVERED |
| REQ | PAL-04 — tool concepts map onto the shared semantic `--role-*` layer | Task 2 (first addend -> `--role-active`, second -> `--role-input`, sum -> `--role-result`) | COVERED |
| REQ | NAV-02 — one self-contained `.html`, inline style/script, no external JS dependency | Task 2 (`src=` count pinned at 1; harness never committed) | COVERED |
| RESEARCH | n/a — no research phase for this quick task | — | N/A |

No unplanned items. No deferred items.
</multi_source_coverage_audit>

<gate_notes>
- **API coverage decision checkpoint:** does not fire. This task integrates no external API, SDK or service — it is a self-contained HTML/CSS/JS visualisation change with no network call. Recorded as genuinely inapplicable rather than answered with a fabricated API surface.
- **Assumption-delta architecture checkpoint:** does not fire. No singular->plural, required->optional or derived->chosen identity transition is introduced; the class index stays a single integer per slot.
- **Schema push gate:** inapplicable. The repository has no database and no schema; the only persistence is the pre-existing `localStorage` key, whose payload shape is pinned unchanged.
- **MVP / user-story framing:** not applied. This is a quick task against an existing shipped tool, not a phase-1 walking skeleton, so no `SKELETON.md` and no ROADMAP goal line is involved.
</gate_notes>

<verification>
- The word `residue` appears in no `.html` file in the repo; the tool carries its 5 expected `equivalence class` strings and `index.html` exactly 1.
- Headless Chrome harness prints `ALL_PASS`: yellow first addend, blue second addend, green `(a+b) mod N` sum, fresh pair on the next click, same-class doubling and identity case both marked `is-multi`, reference list and `aria-pressed` in agreement with the wheel, keyboard and reference-row parity, modulus change clamping and clearing, and the export naming and contents.
- No `state.selected` or `is-selected` reference survives; the `localStorage` write is byte-identical; `assets/palette.css` is unmodified.
- `congruence-wheel.html` declares zero colour literals, keeps its single external script reference, and its inline script parses under `node --check`.
- A real browser still renders 10 wedge hit paths and 60 digits at defaults, with exactly one first-addend mark on load.
- No harness artifact in the working tree.
</verification>

<success_criteria>
The Congruence Wheel speaks of equivalence classes everywhere a reader looks, and a learner can now operate in the group it draws: click one class, click another, and the tool shows yellow plus blue landing on green with the modular arithmetic spelled out — inside the same single self-contained file, with every colour still resolving through the shared palette, the export still correct, and the whole interaction proven by an automated real-browser run rather than asserted.
</success_criteria>

<output>
Create `.planning/quick/260927-eel-congruence-wheel-rename-residue-class-es/260927-eel-SUMMARY.md` when done
</output>
