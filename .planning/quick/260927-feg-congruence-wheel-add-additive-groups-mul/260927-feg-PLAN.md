---
phase: quick-260927-feg
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - Congruence Wheel/congruence-wheel.html
autonomous: true
requirements: [PAL-02, PAL-04, NAV-02]

estimate:
  tokens: 78000
  raw_tokens: 78000
  tasks: 2
  confidence: low

must_haves:
  truths:
    - "The Congruence Wheel carries two tabs — `Additive Groups` and `Multiplicative Groups` — sharing one page shell: the same N slider, ring slider, export row, reference list and caption element (D-01, D-07)."
    - "With `Additive Groups` active the page is indistinguishable from today: same wedge count, same digits, same caption text, same footer formula, same reference rows, same wedge `aria-label`s, same export filename (D-01)."
    - "With `Multiplicative Groups` active the wheel draws ONLY the φ(N) equivalence classes coprime to N — one wedge each, wedge angle `360/φ(N)` — and no wedge, row or DOM node exists for a non-unit (D-02)."
    - "Multiplicative wedge geometry tracks φ(N), not N: N=10 draws 4 wedges labelled 1, 3, 7, 9; N=12 draws 4 wedges labelled 1, 5, 7, 11; N=16 draws 8 (D-02)."
    - "Selecting two classes in multiplicative mode marks the class `(A × B) mod N` as the result — 3 then 7 at N=10 marks [1] — and because (ℤ/Nℤ)* is closed the result is always a wedge already on screen, so no non-membership branch exists in the code (D-04)."
    - "The multiplicative mode's identity is named as [1] on a user-visible surface, and the additive mode names no identity (it names none today) (D-03)."
    - "One implementation serves both modes: a single `render()`, a single `select()`, a single `rolesFor()`, a single reference-list builder, each reading an element list, an operation and wording from a per-mode config object. No second wheel renderer and no second selection machine exists anywhere in the file (D-05)."
    - "Switching tabs keeps the current N and ring count and clears any in-progress selection — `state.a` returns to the new mode's identity and `state.b` / `state.sum` / `state.awaiting` reset, so no yellow/blue/green mark from the other element set survives (D-06)."
    - "Moving the N slider re-renders whichever mode is active and leaves the first operand a legal element of that mode; in additive mode the clamp behaves exactly as it does today (D-06)."
    - "Every user-facing surface still says `equivalence class` / `equivalence classes`; `residue` appears nowhere in the file (D-08)."
    - "`Congruence Wheel/congruence-wheel.html` still declares zero literal colour values — the tabs and both modes resolve every colour through `var()` against `assets/palette.css` tokens, reusing the existing `--slot-a` / `--slot-b` / `--slot-sum` aliases with no new colour alias added, and `assets/palette.css` is not edited (PAL-02, PAL-04, D-09)."
    - "The tool remains one self-contained `.html` file with inline `<style>` and inline `<script>`, gains no new file and no new external reference — still `assets/` plus Google Fonts (NAV-02, D-07)."
  artifacts:
    - "Congruence Wheel/congruence-wheel.html"
  key_links:
    - "`MODES[state.mode].elements(N)` -> `els` -> `M = els.length` -> `wedgeAngle = 360 / M` and the wedge loop's `els[p]`: the one seam that makes the multiplicative wheel a φ(N)-wedge wheel instead of an N-wedge wheel with dimmed slices. If any geometry expression keeps dividing by `N`, the wedges stop tiling the circle."
    - "wedge position `p` vs class value `els[p]`: `state.a` / `state.b` / `state.sum` and `rolesFor()` all speak *class values*, never positions. In additive mode position === value, so a position/value mix-up is invisible there and wrong in every multiplicative case."
    - "`state.b === null` / `state.sum === null` as the unset sentinel -> `rolesFor()`: `null === 0` is false, which is what lets class 0 hold a role in additive mode. Any truthiness test here silently drops class [0]."
    - "`setMode()` -> `state.a = mode.identity(N)` + pair clear -> `syncTabs()` -> `render()`: the reset that keeps an element from one mode's set from being highlighted against the other's. Skip it and a stale `state.a = 4` survives into a wheel that has no [4]."
    - "`clampToElements(v, els)` -> the `nRange` handler: in additive mode it must reduce to today's `min(v, N-1)` exactly, or the additive mode's observable behaviour changes on every modulus decrease."
    - "`buildExportSvg`'s wedge-hit pass -> the `is-a` / `is-b` / `is-sum` class names: unchanged by this plan, but it deletes the hit path of every wedge it does not recognise, so the mode work must not rename those three classes."
    - "CSS source order `is-a`, then `is-b`, then `is-sum`, all after `:hover` and `:focus-visible` (all specificity 0,3,0): equal-specificity ordering IS the fill-precedence mechanism inherited from 260927-eel. Do not reorder while editing nearby."
---

<objective>
Give the Congruence Wheel two tabs over one shared page shell: **Additive Groups**, which is exactly the tool as it ships today (ℤ/Nℤ under addition), and **Multiplicative Groups**, a new mode that draws the group (ℤ/Nℤ)* — only the φ(N) equivalence classes coprime to N — under multiplication mod N, with the same two-click select-and-see-the-result interaction.

No `CONTEXT.md` exists for this quick task, so the decisions below are derived from the user's verbatim request plus the follow-up spec elaborated with them, and this plan is their record of authority:

- **D-01** — two tabs; `Additive Groups` = today's behaviour unchanged, `Multiplicative Groups` = the same interaction for the multiplicative group.
- **D-02** — **LOCKED by an explicit user choice: the multiplicative wheel shows ONLY the φ(N) residues coprime to N as wedges.** Non-units (including 0) are absent from the wheel entirely, so the wedge count and wedge angle key off φ(N), not N. This is a geometry change, not a recolour. Do not re-litigate, do not offer an all-N-wedges-with-dimming alternative.
- **D-03** — the identity in multiplicative mode is 1, not 0; identity-bearing labels reflect the active mode.
- **D-04** — result is `(A × B) mod N`; (ℤ/Nℤ)* is closed under multiplication, so the result is always a wedge already on the wheel and no closure/non-membership handling is written.
- **D-05** — reuse the existing per-wedge click/keyboard machinery, the `state.a/b/sum/awaiting` object and the reference-list UI from 260927-eel; factor the mode-specific pieces (element list, operation, identity, wording) as a small per-mode config the shared code consumes. No parallel copy of the renderer.
- **D-06** — tab switching preserves N; changing N re-renders the active mode; switching tabs resets the in-progress selection.
- **D-07** — both tabs share the page shell and controls; single self-contained file, no new files, no shared JS module.
- **D-08** — `equivalence class(es)`, never `residue class(es)`.
- **D-09** — every colour resolves through `var()` against `assets/palette.css`; reuse `--slot-a` / `--slot-b` / `--slot-sum`. Because D-02 removes non-units from the DOM rather than dimming them, **no inert/excluded alias is needed and none is added** — this plan introduces zero new colour aliases.
- **D-10** — Claude's discretion, resolved in `<discretion_decisions>` so the executor does not re-litigate it.

Purpose: the page already teaches that ℕ partitions into equivalence classes and that those classes add. The multiplicative story is the one a learner needs next and the one every RSA/Diffie-Hellman page on this site silently assumes — and the single most instructive fact about it is exactly the one D-02 makes visible: the wheel *loses wedges*, because only the coprime classes are invertible. A dimmed-slice version would hide that.
Output: one edited `.html` file, still self-contained, still free of literal colours, with both modes proven by an automated real-browser harness.
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
@.planning/quick/260927-eel-congruence-wheel-rename-residue-class-es/260927-eel-SUMMARY.md
</context>

<grounded_facts>
Read from the working tree while planning; the browser and arithmetic rows were executed against the current file before this plan was written. Treat as current; re-confirm cheaply if an edit surprises you.

| Fact | Value |
|------|-------|
| `Congruence Wheel/congruence-wheel.html` length | 919 lines; inline `<script>` spans lines 385-917 |
| Line 385 is exactly `<script>` and line 917 exactly `</script>` | so `awk '/^<script>$/{f=1;next} /^<\/script>$/{f=0} f'` extracts the tool script and skips both the one-line pre-paint theme script (line 5) and the `<script defer src>` |
| `residue` occurrences in the file | **0** (retired by 260927-eel). `equivalence class` occurrences: **5** |
| `src=` occurrences | **1** (the `theme.js` defer tag) — the gate that pins "no new external JS" |
| Colour literals | **0 real ones.** A naive `grep -oiE '#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\('` returns **3 false positives**: `&#8469;` at lines 331 and 333 (the ℕ entity) and the JS string `'rgb('` at line 684 inside `splitAlpha`. Pre-filtering with `sed -e 's/&#[0-9]\{1,\};//g' -e "s/'rgb('/RGBSTR/g"` returns **0** — verified. Use the pre-filtered form; do not "fix" the entity or `splitAlpha` |
| Existing slot aliases (lines 15-27, tool-local `:root`) | `--slot-a: var(--role-active)` (yellow), `--slot-b: var(--role-input)` (blue), `--slot-sum: var(--role-result)` (green), plus three `*-soft` `color-mix()` variants. Already present — **reuse, do not redeclare** |
| Existing state | `var state = { N: 10, depth: 6, a: 0, b: null, sum: null, awaiting: 'a' };` (line 402) |
| Existing machinery | `ROLE_WORDS` / `ROLE_TAGS` (404-405), `rolesFor(idx)` (407-413), `render()` (450-612), `updateCaption()` (614-634), `select(idx)` (636-649), `persist()` (651-653) |
| `persist()` today | `localStorage.setItem('congruence-wheel', JSON.stringify({ N: state.N, depth: state.depth }))` — restore guard at 415-419 accepts `saved.N` in 1..60 and `saved.depth` in 2..10, in try/catch |
| Every `N`-as-a-count site in `render()` | line 452 `wedgeAngle = 360 / N`; 453 `wedgeAngleRad = 2*Math.PI / N`; 456 `maxVal = N*depth - 1`; 460 `arcLen = (N === 1) ? 999 : ...`; 487 `if (N > 1)`; 488 `for (var i0 = 0; i0 < N; i0++)`; 498 `for (var i = 0; i < N; i++)`; 566 `for (var r0 = 0; r0 < N; r0++)`. Every other `N` in `render()` is arithmetic (`i + k*N`, `'mod ' + N`) and must stay `N` |
| `maxVal` generalises exactly | `els[M-1] + (depth-1)*N` equals today's `N*depth - 1` whenever `els = [0..N-1]` — verified (additive output unchanged); for N=10 depth=6 multiplicative it gives 59 |
| `state.a` reference sites outside `render()` | 3 — the `nRange` clamp (900), `exportFileName` (770), `updateCaption` (617) |
| Today's additive clamp | `if (state.a >= state.N) state.a = state.N - 1;` — i.e. `min(a, N-1)`. `clampToElements(a, [0..N-1])` (largest element ≤ a, else `els[0]`) reproduces it exactly |
| `gcd(0, N) === N` | so 0 is a unit only when N=1. Computed unit sets (verified in node): N=1 → `[0]`; N=2 → `[1]`; N=4 → `[1,3]`; **N=10 → `[1,3,7,9]`**; **N=12 → `[1,5,7,11]`**; N=16 → 8 units; N=60 → 16 units. Max φ over the slider's 1..60 range is 16, so no perf concern |
| `(3 × 7) mod 10` | `1` — the canonical multiplicative assertion, and the identity, in one case |
| `annularSectorPath` full-circle branch | triggers at `endDeg - startDeg >= 359.999`, so `M === 1` (additive N=1, multiplicative N=1 or N=2) renders a ring, not a degenerate sector — no new edge case |
| Local alias precedent | `Factor Tree/factor-tree.html` opens its `<style>` with a `:root{}` of `var()`/`color-mix()`-only aliases; this file already follows it at lines 15-27 |
| Tooling present | `/usr/bin/google-chrome`, `/usr/bin/node`. No package manager, no test runner, no linter anywhere in the repo |

**Rendered baseline at defaults (N=10, depth=6, additive), captured from the current file with `google-chrome --headless --dump-dom`.** These are the exact strings Task 2's gate re-asserts to prove additive mode did not move:

| Surface | Exact rendered text |
|---------|---------------------|
| `.lede` | `Every natural number belongs to exactly one equivalence class modulo N. This diagram arranges ℕ as concentric rings — one ring per multiple of N, one wedge per class — so the classes stay visibly disjoint and complete.` |
| `#wheel-caption` | `Equivalence class [0] contains every natural number congruent to 0 (mod 10): 0, 10, 20, … — and nothing else. Click a wedge or reference row to choose the first addend.` |
| `#formula-line` | `ℕ/∼ = { [0], [1], …, [9] }   where   [r] = { n ∈ ℕ : n mod 10 = r }` (three spaces either side of `where`) |
| `#ref-count` | `N = 10` |
| `.ref-head h2` | `Equivalence classes` |
| `.center-label` | `mod 10` |
| first `.row-btn` | `[0]{ 0, 10, 20, 30, 40, 50, … }A` |
| first wedge `aria-label` | `Equivalence class 0 modulo 10, first addend` |
| counts | 10 `#wheel-dynamic g.wedge`, 60 `.cell-num`, 1 `g.wedge.is-a` |

Harness facts, proven in the target browser against the current file (so the gates below rest on facts, not guesses):

1. `new MouseEvent('click', {bubbles:true})` dispatched on a `g.wedge` or a `.row-btn` fires the tool's own listener — no hit testing needed. `new KeyboardEvent('keydown', {bubbles:true, key:'Enter'})` on a `g.wedge` fires the same path.
2. `render()` rebuilds `#wheel-dynamic` wholesale, so the harness **must re-query `#wheel-dynamic g.wedge` after every dispatch** — a node captured before a click is detached afterwards.
3. Setting `#n-range`'s `value` then dispatching `new Event('input', {bubbles:true})` drives the modulus handler.
4. Clicking `#export-svg` succeeds headless and writes the real filename into `#export-status`; wrapping `URL.createObjectURL` captures the Blob for content assertions. This is the only seam that makes `exportFileName` and the exported markup assertable from outside the IIFE.
5. The page links `../assets/palette.css`, so a harness copy must sit at `$SCRATCH/wheel/<name>.html` with the three shared assets mirrored at `$SCRATCH/assets/` for `../assets/` to resolve. A harness placed directly in `$SCRATCH` silently loads no palette, leaving every `var()` colour unresolved.
</grounded_facts>

<discretion_decisions>
D-10, the discretion the request leaves open, resolved here:

- **`state.a` / `state.b` / `state.sum` hold class *values*, never wedge positions.** In additive mode position === value, so today's code is already value-based and needs no change of meaning; in multiplicative mode the wedge loop reads `els[p]` and passes that value to `select()`. This is the single decision that lets `rolesFor()`, the caption, the reference list, the export filename and the `aria-label`s stay untouched in their logic.
- **`state.sum` keeps its name** even though it holds a product in multiplicative mode. It is an internal field, never rendered as the word "sum"; renaming it would churn `rolesFor`, the CSS class `is-sum`, `buildExportSvg`'s recognised-class list and `exportFileName` for no user-visible gain. The *displayed* role word is mode-driven (`sum` / `product`).
- **The mode IS persisted**, as a third field in the existing `congruence-wheel` payload: `{N, depth, mode}`. This follows the Venn Diagrams precedent (260926-dgk shipped per-mode persistence) and is backward- and forward-compatible — the restore guard accepts `saved.mode` only when it is one of the two known ids, so an old `{N, depth}` payload restores as additive, which is today's behaviour. Note this deliberately supersedes 260927-eel's "payload byte-for-byte unchanged" gate, which was that task's scope guard, not a project invariant.
- **On a tab switch `state.a` becomes the new mode's identity** (`0` additive, `1 % N` multiplicative) rather than being clamped across. The spec says a tab switch clears the selection, and the identity is both always a legal element and the most instructive starting class. For additive at load this is `0` — exactly today's default.
- **The tabs are a real ARIA tablist**: two `role="tab"` buttons with `aria-selected`, roving `tabindex`, ArrowLeft/ArrowRight to switch, wrapping a single `role="tabpanel"` that contains both the diagram and the reference list (both are mode-specific content). They are page controls, so they join `.controls` in the `@media print` hide list.
- **Non-units are absent from the DOM, not dimmed** (D-02, locked) — therefore **zero new CSS colour aliases**. The tab strip styles itself from `--accent` / `--text` / `--text-dim` / `--panel-border`, all already in use on this page.
- **The export filename gains a mode slug only in multiplicative mode** (`congruence-wheel-mult-N10-...`), so the additive filename stays character-for-character what it is today.
- **`index.html` is out of scope.** Its Congruence Wheel card reads "Every natural number belongs to exactly one equivalence class modulo N — arranged here as concentric rings and wedges, one wedge per class", which still describes the default additive view truthfully. Nothing in it becomes false, so nothing in it is touched.
- **Task 1 deliberately ships additive *wording* in both modes.** A multiplicative caption reading "first addend" after Task 1 is expected, not a bug — Task 2 owns every mode-specific string. Splitting it this way keeps Task 1's diff purely structural and reviewable.
</discretion_decisions>

<tasks>

<task type="tracer">
  <name>Task 1: Two tabs, one wheel engine — φ(N) units under multiplication, end to end</name>
  <files>Congruence Wheel/congruence-wheel.html</files>
  <action>
The thin end-to-end slice: a real tab strip, a real per-mode config, and the real unit-set geometry, wired through the existing single `render()` / `select()` / `rolesFor()` chain so that clicking `Multiplicative Groups` at N=10 draws four wedges (1, 3, 7, 9) and clicking [3] then [7] marks [1] green. Every layer this feature touches — markup, CSS, state, persistence, geometry, selection — is crossed once, on one path. Wording stays additive everywhere; Task 2 owns strings.

**1. Tab markup (D-01, D-07).** Insert a tab strip immediately after the closing `</header>` of `.page-header` and before the `<div class="controls">` block:

```html
<div class="mode-tabs" role="tablist" aria-label="Group operation">
  <button type="button" class="mode-tab is-active" role="tab" id="tab-additive" data-mode="additive" aria-selected="true" aria-controls="wheel-panel">Additive Groups</button>
  <button type="button" class="mode-tab" role="tab" id="tab-multiplicative" data-mode="multiplicative" aria-selected="false" aria-controls="wheel-panel" tabindex="-1">Multiplicative Groups</button>
</div>
```

Then wrap the existing `<div class="diagram-wrap">…</div>` **and** the existing `<div class="ref">…</div>` together in one element: `<div id="wheel-panel" role="tabpanel" aria-labelledby="tab-additive">`. Both are mode-specific content, so both belong to the panel. Add no padding, border, margin or `display` to the wrapper — a bare block wrapper leaves the adjacent-sibling margin collapse between `.diagram-wrap` (20px bottom) and `.ref` (44px top) and the 36px gap to `<footer>` exactly as they are today.

**2. Tab CSS (PAL-02, PAL-04, D-09).** Add after the `.controls` rules. Use only tokens already used on this page — no hex, `rgb()`, `hsl()` or named colour, and no new alias:

- `.mode-tabs{ display:flex; gap:6px; flex-wrap:wrap; margin-bottom:22px; border-bottom:1px solid var(--panel-border); }`
- `.mode-tab{ font:inherit; font-size:.92rem; font-weight:600; color:var(--text-dim); background:none; border:none; border-bottom:2px solid transparent; border-radius:8px 8px 0 0; padding:10px 16px; cursor:pointer; transition:color .15s, background .15s, border-color .15s; }`
- `.mode-tab:hover{ color:var(--text); background:color-mix(in srgb, var(--text) 6%, transparent); }` (the `color-mix` + `transparent` idiom already established at `.export-btn`)
- `.mode-tab:focus-visible{ outline:2px solid var(--accent); outline-offset:2px; }`
- `.mode-tab.is-active{ color:var(--accent); border-bottom-color:var(--accent); }`
- Add `.mode-tab{ transition:none; }` to the existing `@media (prefers-reduced-motion: reduce)` block, and add `.mode-tabs` to the existing `@media print` `display:none !important` selector list alongside `.site-header, .controls, .ref`.

**3. Math helpers.** Add next to `clamp()` in the IIFE:

- `function gcd(a, b){ while (b){ var t = a % b; a = b; b = t; } return a; }` — iterative Euclid, matching the Venn tool's precedent.
- `function unitsMod(N){ var out = []; for (var r = 0; r < N; r++) if (gcd(r, N) === 1) out.push(r); return out; }` — ascending. `gcd(0, N) === N`, so 0 lands in the list only when N=1, which is correct: (ℤ/1ℤ)* = {[0]}. Write no empty-list fallback; the list is provably never empty over the slider's 1..60 range.
- `function clampToElements(v, els){ var out = els[0]; for (var i = 0; i < els.length; i++){ if (els[i] <= v) out = els[i]; else break; } return out; }` — largest element ≤ v, else the first. For `els = [0..N-1]` this equals today's `min(v, N-1)`, which is why additive clamping does not change.

**4. Per-mode config (D-05).** Declare a single `MODES` object **before** the `state` declaration and the `localStorage` restore block (both reference it). This task gives each mode only the four structural fields; Task 2 adds the wording fields to this same object:

- `additive`: `{ elements: function(N){ var o = []; for (var r = 0; r < N; r++) o.push(r); return o; }, op: function(a, b, N){ return (a + b) % N; }, raw: function(a, b){ return a + b; }, identity: function(N){ return 0; } }`
- `multiplicative`: `{ elements: unitsMod, op: function(a, b, N){ return (a * b) % N; }, raw: function(a, b){ return a * b; }, identity: function(N){ return 1 % N; } }`

`1 % N` is `0` at N=1 and `1` otherwise, so the identity is always an element of `elements(N)`. Add a short comment recording D-02 and D-04: the multiplicative element list is the group (ℤ/Nℤ)* itself, and the group is closed under `op`, so `op`'s result is always in `elements(N)` — deliberately no membership check.

Add `function currentMode(){ return MODES[state.mode]; }` for the call sites.

**5. State and persistence (D-06, D-10).** Change the state literal to `{ N: 10, depth: 6, mode: 'additive', a: 0, b: null, sum: null, awaiting: 'a' }`. In the restore block add `if (saved && (saved.mode === 'additive' || saved.mode === 'multiplicative')) state.mode = saved.mode;` — an unknown or absent value leaves `'additive'`, so an old `{N, depth}` payload restores exactly as it does today. Immediately after the restore block add `state.a = currentMode().identity(state.N);` so a restored multiplicative mode never starts with a non-unit first operand. Change `persist()` to write `{ N: state.N, depth: state.depth, mode: state.mode }`.

**6. Generalise `render()` (D-02).** At the top of `render()`, after reading `N` and `depth`, add `var els = currentMode().elements(N);` and `var M = els.length;`. Then make exactly these substitutions and no others — every remaining `N` in the function is arithmetic and must stay `N`:

- `wedgeAngle = 360 / N` → `360 / M`; `wedgeAngleRad = 2 * Math.PI / N` → `2 * Math.PI / M`.
- `maxVal = N * depth - 1` → `els[M - 1] + (depth - 1) * N` (provably identical in additive mode — see `<grounded_facts>`).
- `arcLen = (N === 1) ? 999 : ...` → `(M === 1) ? 999 : ...`.
- The radial-boundary guard `if (N > 1)` → `if (M > 1)`, and its loop `for (var i0 = 0; i0 < N; i0++)` → `i0 < M`.
- The wedge loop `for (var i = 0; i < N; i++)` → `for (var p = 0; p < M; p++)`, with `var value = els[p];` as its first statement. Inside it: `startDeg = p * wedgeAngle`; `rolesFor(value)`; the `aria-label`'s class number is `value`; the ring digits are `value + k * N`; and the click/keydown closure captures `value`, calling `select(value)`. Rename the loop's uses of `i` to `p`/`value` consistently — a leftover `i` here is the position/value bug this plan's key-links call out.
- The reference-list loop `for (var r0 = 0; r0 < N; r0++)` → `for (var p2 = 0; p2 < M; p2++)` with `var r0 = els[p2];` as its first statement, leaving the rest of that loop body (members `r0 + k2*N`, `'[' + r0 + ']'`, `rolesFor(r0)`, `select(r0)`) untouched.

Leave untouched: `CX`/`CY`/`HOLE_R`/`OUTER_R`, `polar`, `annularSectorPath`, the zebra bands and ring-boundary loops (depth-driven only), the font-size fit expression, `.ellipsis`, the `'mod ' + N` centre label, and — in this task — `refCount`, `formulaLine`, `ROLE_WORDS`, `ROLE_TAGS` and every caption string.

**7. `select()` (D-04, D-05).** Keep the name and single-argument signature so both existing call sites keep working. Change only the completing branch's arithmetic: `state.sum = currentMode().op(state.a, idx, state.N);`. Do not add an `idx === state.a` special case — picking the same class twice is a legal doubling/squaring in both modes. Rename the parameter to `value` if you like, but change nothing else about the branch logic.

**8. Tab wiring (D-06).** After the existing `nRange`/`depthRange` wiring:

- `var tabs = Array.prototype.slice.call(document.querySelectorAll('.mode-tab'));` and `var wheelPanel = document.getElementById('wheel-panel');`
- `function syncTabs(){ ... }` — for each tab, `on = tab.getAttribute('data-mode') === state.mode`; toggle `is-active`; set `aria-selected` to `'true'`/`'false'`; set `tabIndex` to `0`/`-1`; and when `on`, `wheelPanel.setAttribute('aria-labelledby', tab.id)`.
- `function setMode(id){ if (id === state.mode) return; state.mode = id; state.a = currentMode().identity(state.N); state.b = null; state.sum = null; state.awaiting = 'a'; syncTabs(); persist(); render(); }` — the pair clear is mandatory: the element sets differ, so a carried-over `state.b` could name a class that no longer exists.
- Wire each tab's `click` to `setMode(tab.getAttribute('data-mode'))`, and a `keydown` where `ArrowRight`/`ArrowLeft` `preventDefault()`, compute the other tab, `setMode()` it and `focus()` it.
- Call `syncTabs()` once before the final `render()` so a restored multiplicative mode paints with the right tab active.

**9. Modulus handler (D-06).** Replace `if (state.a >= state.N) state.a = state.N - 1;` with `state.a = clampToElements(state.a, currentMode().elements(state.N));`. Keep the three existing pair-clear lines and the rest of the handler as they are. Leave the `depthRange` handler completely alone — ring count changes no element set.

**Do not touch** in this task: the `--slot-*` aliases (they already exist), the `.wedge.is-a` / `is-b` / `is-sum` / `is-multi` rules or their source order, `rolesFor()`, `updateCaption()`, `buildExportSvg`, `exportFileName`, `splitAlpha`, the print-theme flip, the PNG path, the `&#8469;` entities, or `index.html`.

**Verification fixture.** Write the harness below to this executor's scratchpad as `mode-tracer-harness.js`; it is **never** committed. Per grounded fact 5, the gate copies it and a `sed`-injected page copy to `$SCRATCH/wheel/` with `assets/palette.css`, `assets/site.css` and `assets/theme.js` mirrored at `$SCRATCH/assets/`. The harness registers a `window` `load` listener and inside `setTimeout(..., 0)` runs each expectation in order, **re-querying `#wheel-dynamic g.wedge` after every dispatch** (grounded fact 2), and appends `<div id="test-out">` with a pipe-joined log ending in `ALL_PASS` only when every expectation held. Read a wedge's class value as the text of its first `.cell-num`. Expectations:

1. Load: `#tab-additive` has `aria-selected="true"`, `#tab-multiplicative` `"false"`; 10 wedges; 60 `.cell-num`; one `g.wedge.is-a` and its first cell text is `0`; zero `.is-b`, `.is-sum`, `.is-multi`; `#ref-count` is `N = 10`; `#formula-line` is exactly the baseline additive formula string; `#wheel-caption` is exactly the baseline additive caption string; first `.row-btn` text is exactly `[0]{ 0, 10, 20, 30, 40, 50, … }A`.
2. Additive click the wedge whose cell text is `3`, then the one whose cell text is `7`: `is-a` on the `3` wedge, `is-b` on `7`, `is-sum` on `0`, each count exactly 1; caption contains `3 + 7 = 10`.
3. Click `#tab-multiplicative`: its `aria-selected` is `"true"` and additive's `"false"`; `#wheel-panel`'s `aria-labelledby` is `tab-multiplicative`; **4 wedges**, whose first-cell texts in DOM order are exactly `1`, `3`, `7`, `9`; 24 `.cell-num`; one `.is-a` and its cell text is `1` (the identity); zero `.is-b`, `.is-sum`, `.is-multi`.
4. Multiplicative click `3` then `7`: `is-a` on `3`, `is-b` on `7`, and `is-sum` on the wedge whose cell text is `1` — `(3 × 7) mod 10 = 1` — each count exactly 1.
5. Multiplicative squaring: click `3`, then `3` again — that wedge carries `is-a`, `is-b` and `is-multi`, and `is-sum` sits on the `9` wedge.
6. Multiplicative reference list: 4 `.row-btn`, their `.r-label` texts exactly `[1]`, `[3]`, `[7]`, `[9]`; clicking a `.row-btn` advances the same machine (a second operand and a result appear); every roled row has `aria-pressed="true"` and every unroled row `"false"`.
7. Keyboard parity in multiplicative mode: `keydown` with `key:'Enter'` on a wedge advances the same machine.
8. Modulus change inside multiplicative mode: set `#n-range` to `12`, dispatch `input` — 4 wedges with cell texts `1`, `5`, `7`, `11`; one `.is-a`; zero `.is-b`/`.is-sum`. Then set to `2` — 1 wedge, cell text `1`, `.cell-num` count equals the ring count (6), no thrown error. Then set to `1` — 1 wedge, cell text `0`, no thrown error.
9. Switch back to `#tab-additive` at N=1 then set `#n-range` to `12`: 12 wedges with cell texts `0`…`11`; one `.is-a`; zero `.is-b`/`.is-sum`.
10. Persistence: `JSON.parse(localStorage.getItem('congruence-wheel'))` has exactly the keys `N`, `depth`, `mode`, and `mode` is `additive` at this point.
  </action>
  <verify>
    <automated>HDIR="${SCRATCH:?set SCRATCH to this executor's scratchpad absolute path, where mode-tracer-harness.js was written}"; F="Congruence Wheel/congruence-wheel.html" && test "$(grep -oF 'role="tablist"' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'role="tab"' "$F" | wc -l)" -eq 2 && test "$(grep -oF 'role="tabpanel"' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'data-mode="additive"' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'data-mode="multiplicative"' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'id="wheel-panel"' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'function unitsMod(' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'function gcd(' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'function clampToElements(' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'function currentMode(' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'function setMode(' "$F" | wc -l)" -eq 1 && test "$(grep -oF '360 / M' "$F" | wc -l)" -eq 1 && test "$(grep -oF '360 / N' "$F" | wc -l)" -eq 0 && test "$(grep -oF 'Math.PI / M' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'Math.PI / N' "$F" | wc -l)" -eq 0 && test "$(grep -oF 'N * depth - 1' "$F" | wc -l)" -eq 0 && test "$(grep -oF 'state.a >= state.N' "$F" | wc -l)" -eq 0 && test "$(grep -oF 'currentMode().op(' "$F" | wc -l)" -eq 1 && test "$(grep -oF "mode: state.mode" "$F" | wc -l)" -eq 1 && test "$(grep -oF 'is-selected' "$F" | wc -l)" -eq 0 && test "$(grep -oiF 'residue' "$F" | wc -l)" -eq 0 && test "$(grep -oF 'src=' "$F" | wc -l)" -eq 1 && test "$(sed -e 's/&#[0-9]\{1,\};//g' -e "s/'rgb('/RGBSTR/g" "$F" | grep -oiE '#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(' | wc -l)" -eq 0 && GS_UNTOUCHED="$(git status --porcelain -- assets/palette.css assets/site.css assets/theme.js index.html)" && test -z "$GS_UNTOUCHED" && T=$(mktemp --suffix=.js) && awk '/^<script>$/{f=1;next} /^<\/script>$/{f=0} f' "$F" > "$T" && node --check "$T" && rm -f "$T" && mkdir -p "$HDIR/wheel" "$HDIR/assets" && cp assets/palette.css assets/site.css assets/theme.js "$HDIR/assets/" && cp "$HDIR/mode-tracer-harness.js" "$HDIR/wheel/" && sed 's#</body>#<script src="mode-tracer-harness.js"></script></body>#' "$F" > "$HDIR/wheel/tracer.html" && timeout 90 google-chrome --headless --disable-gpu --no-sandbox --window-size=1200,2400 --virtual-time-budget=9000 --dump-dom "file://$HDIR/wheel/tracer.html" 2>/dev/null | grep -o '<div id="test-out">[^<]*</div>' | tee /dev/stderr | grep -q 'ALL_PASS' && D=$(mktemp --suffix=.html) && timeout 60 google-chrome --headless --disable-gpu --no-sandbox --window-size=1200,2400 --virtual-time-budget=4000 --dump-dom "file://$PWD/Congruence%20Wheel/congruence-wheel.html" 2>/dev/null > "$D" && test "$(grep -o 'class="wedge-hit"' "$D" | wc -l)" -eq 10 && test "$(grep -o 'class="cell-num"' "$D" | wc -l)" -eq 60 && test "$(grep -o 'class="wedge is-a"' "$D" | wc -l)" -eq 1 && rm -f "$D" && GS_ALL="$(git status --porcelain)" && case "$GS_ALL" in *harness*|*tracer*) echo "harness artifact left in working tree" >&2; exit 1;; esac && echo TASK1_PASS</automated>
  </verify>
  <done>The harness prints `ALL_PASS`: the additive tab renders today's 10 wedges, 60 digits, baseline caption, baseline footer and baseline first reference row untouched, and still adds; the multiplicative tab renders exactly the φ(N) coprime classes as wedges — 4 at N=10 reading 1, 3, 7, 9 and 4 at N=12 reading 1, 5, 7, 11 — where clicking [3] then [7] marks [1] as the result, squaring [3] marks [9] with a dual-role dashed wedge, and the reference list, `aria-pressed`, keyboard entry and reference-row entry all drive the same one machine. N=1 and N=2 render without error in either mode; switching tabs clears the pair and resets the first operand to the mode's identity; the mode round-trips through `localStorage` as a third field. No geometry expression divides by `N` any more, `state.selected`/`is-selected` remain absent, the file declares zero colour literals and keeps exactly one external script reference, its script parses, `assets/` and `index.html` are unmodified, and no harness artifact is left in the working tree.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Say it in the right language — per-mode wording, identity and export name</name>
  <files>Congruence Wheel/congruence-wheel.html</files>
  <behavior>
Expectations to make true, in the order the harness asserts them. Defaults N=10, depth=6. Additive expectations are the *baseline* strings from `<grounded_facts>` and exist to prove additive mode still does not move (D-01).

- Additive on load: `.lede` textContent is exactly the baseline lede string; `.ref-head h2` is exactly `Equivalence classes`; `#ref-count` is exactly `N = 10`; `#formula-line` is exactly the baseline additive formula; `#wheel-caption` is exactly the baseline additive caption; the first wedge's `aria-label` is exactly `Equivalence class 0 modulo 10, first addend`; the first `.row-btn` text is exactly `[0]{ 0, 10, 20, 30, 40, 50, … }A`.
- Additive after clicking `3` then `7`: caption contains `3 + 7 = 10 ≡ 0 (mod 10)` and `Adding any member of` and `to any member of`; the row for `[0]` has a `.r-roles` text containing `A+B`.
- Additive export from that state: `#export-status` is exactly `Saved congruence-wheel-N10-depth6-a3-b7-sum0.svg`.
- Multiplicative on load (after clicking `#tab-multiplicative`): `.lede` contains `φ(N)` and `coprime` and `inverse`; `.ref-head h2` is exactly `Unit equivalence classes`; `#ref-count` is exactly `N = 10 · φ(10) = 4`; `#formula-line` contains `(ℤ/10ℤ)*`, `identity [1]` and `φ(10) = 4`; the caption's prompt contains `first factor`; the wedge for class 3 has `aria-label` exactly `Equivalence class 3 modulo 10`.
- Multiplicative with a first operand chosen (click `3`): the caption prompt contains `multiply with` and `product`; that wedge's `aria-label` is exactly `Equivalence class 3 modulo 10, first factor`.
- Multiplicative after clicking `7` as well: caption contains `3 × 7 = 21 ≡ 1 (mod 10)` and `Multiplying any member of` and `by any member of`; the row for `[1]` has a `.r-roles` text containing `A·B`; the `7` wedge's `aria-label` ends with `second factor`; the `1` wedge's ends with `product`.
- Multiplicative export from that state: `#export-status` is exactly `Saved congruence-wheel-mult-N10-depth6-a3-b7-sum1.svg`, and the captured Blob's text contains exactly 3 `class="wedge-hit"` occurrences (the three marked wedges: 3, 7, 1).
- Multiplicative squaring export: click `3` then `3`, export — `#export-status` is exactly `Saved congruence-wheel-mult-N10-depth6-a3-b3-sum9.svg`, and the captured Blob contains `stroke-dasharray="9 6"` (the dual-role hint still survives).
- Switching back to `#tab-additive`: `.lede`, `h2`, `#ref-count` and `#formula-line` all return to their exact baseline strings — no multiplicative wording leaks.
  </behavior>
  <action>
Give each mode its own words, without duplicating a single additive string and without changing one additive character. Every string below lives in the `MODES` config Task 1 created, so the shared render path stays single-implementation (D-05). Write the `—`, `≡`, `…`, `×`, `·`, `φ`, `ℤ`, `ℕ`, `∼`, `∈` characters literally, as the file already does.

**1. Un-hardcode the three surfaces that are currently additive-only strings.**

- In the markup, split the lede: `<p class="lede">Every natural number belongs to exactly one equivalence class modulo N. <span id="mode-note"></span></p>`. Delete the second sentence from the markup entirely — it moves into the additive mode's `note` string, so it exists exactly once. One space separates the period from the span, matching today's rendered spacing.
- Give the reference heading an id: `<h2 id="ref-heading">Equivalence classes</h2>` (text unchanged; JS overwrites it per mode).
- Cache `document.getElementById('mode-note')` and `document.getElementById('ref-heading')` next to the other element lookups at the top of the IIFE.

**2. Add the wording fields to each `MODES` entry.**

`additive` gets, verbatim (these are today's strings — copy them from the current file, do not retype from memory):
- `note`: `This diagram arranges ℕ as concentric rings — one ring per multiple of N, one wedge per class — so the classes stay visibly disjoint and complete.`
- `heading`: `Equivalence classes`
- `refCount: function(N, M){ return 'N = ' + N; }`
- `formula: function(N, els){ ... }` returning today's exact line: `ℕ/∼ = { [0], [1], …, [` + (N-1) + `] }   where   [r] = { n ∈ ℕ : n mod ` + N + ` = r }` — three spaces either side of `where`, as today.
- `words`: `{ a: 'first addend', b: 'second addend', sum: 'sum' }`
- `tags`: `{ a: 'A', b: 'B', sum: 'A+B' }`
- `sign`: `+`
- `verbing`: `Adding`
- `joiner`: `to`
- `promptA`: `Click a wedge or reference row to choose the first addend.`
- `promptB: function(aHtml){ return 'Click a second class — or this same one again — to add to ' + aHtml + ' and reveal the sum.'; }`
- `slug`: `` (empty string, so the additive export filename is byte-identical to today)

`multiplicative` gets:
- `note`: `Only the φ(N) classes coprime to N get a wedge here — those are exactly the classes with a multiplicative inverse, so they and they alone form a group under multiplication.` (D-02's geometry, explained; this is why wedges disappear as N gains factors)
- `heading`: `Unit equivalence classes`
- `refCount: function(N, M){ return 'N = ' + N + ' · φ(' + N + ') = ' + M; }`
- `formula: function(N, els)`: `(ℤ/` + N + `ℤ)* = { [` + els.join('], [') + `] }   ·   identity [` + this.identity(N) + `]   ·   |(ℤ/` + N + `ℤ)*| = φ(` + N + `) = ` + els.length — the one surface that names the identity as [1] (D-03). Call it as `mode.formula(N, els)` so `this` resolves; if you prefer a free function, pass the identity in explicitly rather than relying on `this`.
- `words`: `{ a: 'first factor', b: 'second factor', sum: 'product' }`
- `tags`: `{ a: 'A', b: 'B', sum: 'A·B' }`
- `sign`: `×`
- `verbing`: `Multiplying`
- `joiner`: `by`
- `promptA`: `Click a wedge or reference row to choose the first factor.`
- `promptB: function(aHtml){ return 'Click a second class — or this same one again — to multiply with ' + aHtml + ' and reveal the product.'; }`
- `slug`: `-mult`

Delete the now-dead module-level `ROLE_WORDS` and `ROLE_TAGS` constants and repoint their two readers — `render()`'s `aria-label` role words and the reference row's `.r-roles` tags — at `currentMode().words` and `currentMode().tags`. Keep the join strings exactly as they are: ` and ` for the `aria-label` words, ` · ` for the row tags.

**3. Drive the four surfaces from the config in `render()`**, at the point where `refCount` and `formulaLine` are already written near the end of the function:

- `modeNote.textContent = mode.note;`
- `refHeading.textContent = mode.heading;`
- `refCount.textContent = mode.refCount(N, M);`
- `formulaLine.textContent = mode.formula(N, els);`

Because the additive strings above are the current ones character-for-character, additive mode renders identically — the harness asserts that with exact equality, not `contains`.

**4. Rewrite `updateCaption()`'s wording, not its structure.** Keep both branches, the `aria-live` element, the `.slot-a` / `.slot-b` / `.slot-sum` spans, the `<b>` in the membership sentence, the `.mono` member list and the `Math.min(3, depth)` term count. Substitute:

- No-result branch: the membership sentence is unchanged (it is true in both modes — the class really is every natural congruent to `a` mod `N`, and in multiplicative mode every such number is itself coprime to N). Replace the two hardcoded prompts with `mode.promptA` when `state.awaiting === 'a'` and `mode.promptB('<span class="slot-a">[' + s + ']</span>')` otherwise.
- Result branch: replace the two literal `+` signs with `mode.sign` (one in the bracketed-class equation, one in the numeric line), replace `var raw = a + b;` with `var raw = mode.raw(a, b);`, and replace the fixed `Adding any member of … to any member of …` with `mode.verbing + ' any member of … ' + mode.joiner + ' any member of …'`. Everything else — the `≡ sum (mod N)` tail, `always lands in`, the trailing member list — stays as written.

Every value still interpolated into the caption's `innerHTML` remains an integer from `state` or a `MODES` string this plan authored; route no user-supplied or stored string through it.

**5. Export filename (D-10).** In `exportFileName`, insert the mode slug immediately after the stem: `'congruence-wheel' + currentMode().slug + '-N' + state.N + ...`. Leave the rest — the `-depth`, `-a`, the conditional `-b…-sum…`, the `ext` argument and the `.replace(/[^A-Za-z0-9._-]/g, '')` sanitiser — exactly as it is. Additive filenames do not change; multiplicative ones read `congruence-wheel-mult-…`.

**Do not touch** in this task: `buildExportSvg` (its `is-a`/`is-b`/`is-sum` recognition and `stroke-dasharray` handling already cover both modes — the harness proves it rather than editing it), `splitAlpha`, the PNG path, the print-theme flip, the `--slot-*` aliases, the role CSS or its source order, `rolesFor()`, `select()`, `unitsMod`/`gcd`/`clampToElements`, the wheel geometry, the `&#8469;` entities, `assets/*`, or `index.html`.

**Verification fixture.** Write the harness for `<behavior>` to this executor's scratchpad as `mode-wording-harness.js`; never committed. Same layout and conventions as Task 1 (`$SCRATCH/wheel/` page copy, `$SCRATCH/assets/` mirror, re-query after every dispatch, pipe-joined `#test-out` log). For the three export expectations, wrap `URL.createObjectURL` with a capture-and-delegate shim before each `#export-svg` click, then read `#export-status` and, for the two multiplicative cases, `await`/`.then()` the captured `blob.text()` before asserting its contents — append `#test-out` only inside the final `.then()`, so `ALL_PASS` cannot print before the async assertions have run. Assert additive strings with `===`, not `contains`.
  </action>
  <verify>
    <automated>HDIR="${SCRATCH:?set SCRATCH to this executor's scratchpad absolute path, where mode-wording-harness.js was written}"; F="Congruence Wheel/congruence-wheel.html" && test "$(grep -oF 'id="mode-note"' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'id="ref-heading"' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'ROLE_WORDS' "$F" | wc -l)" -eq 0 && test "$(grep -oF 'ROLE_TAGS' "$F" | wc -l)" -eq 0 && test "$(grep -oF 'first factor' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'first addend' "$F" | wc -l)" -eq 2 && test "$(grep -oF 'Unit equivalence classes' "$F" | wc -l)" -eq 1 && test "$(grep -oF "slug: '-mult'" "$F" | wc -l)" -eq 1 && test "$(grep -oF 'currentMode().slug' "$F" | wc -l)" -eq 1 && test "$(grep -oF 'disjoint and complete' "$F" | wc -l)" -eq 1 && test "$(grep -oiF 'residue' "$F" | wc -l)" -eq 0 && test "$(grep -oiF 'equivalence class' "$F" | wc -l)" -ge 5 && test "$(grep -oF 'src=' "$F" | wc -l)" -eq 1 && test "$(sed -e 's/&#[0-9]\{1,\};//g' -e "s/'rgb('/RGBSTR/g" "$F" | grep -oiE '#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(' | wc -l)" -eq 0 && GS_UNTOUCHED="$(git status --porcelain -- assets/palette.css assets/site.css assets/theme.js index.html)" && test -z "$GS_UNTOUCHED" && T=$(mktemp --suffix=.js) && awk '/^<script>$/{f=1;next} /^<\/script>$/{f=0} f' "$F" > "$T" && node --check "$T" && rm -f "$T" && mkdir -p "$HDIR/wheel" "$HDIR/assets" && cp assets/palette.css assets/site.css assets/theme.js "$HDIR/assets/" && cp "$HDIR/mode-wording-harness.js" "$HDIR/wheel/" && sed 's#</body>#<script src="mode-wording-harness.js"></script></body>#' "$F" > "$HDIR/wheel/wording.html" && timeout 90 google-chrome --headless --disable-gpu --no-sandbox --window-size=1200,2400 --virtual-time-budget=9000 --dump-dom "file://$HDIR/wheel/wording.html" 2>/dev/null | grep -o '<div id="test-out">[^<]*</div>' | tee /dev/stderr | grep -q 'ALL_PASS' && D=$(mktemp --suffix=.html) && timeout 60 google-chrome --headless --disable-gpu --no-sandbox --window-size=1200,2400 --virtual-time-budget=4000 --dump-dom "file://$PWD/Congruence%20Wheel/congruence-wheel.html" 2>/dev/null > "$D" && test "$(grep -oF 'Equivalence classes</h2>' "$D" | wc -l)" -eq 1 && test "$(grep -oF 'one wedge per class' "$D" | wc -l)" -eq 1 && test "$(grep -oF 'aria-label="Equivalence class 0 modulo 10, first addend"' "$D" | wc -l)" -eq 1 && test "$(grep -o 'class="cell-num"' "$D" | wc -l)" -eq 60 && rm -f "$D" && GS_ALL="$(git status --porcelain)" && case "$GS_ALL" in *harness*|*wording*) echo "harness artifact left in working tree" >&2; exit 1;; esac && echo TASK2_PASS</automated>
    <human-check>Open `Congruence Wheel/congruence-wheel.html` over `file://` in a real browser, in both day and night themes. On the `Additive Groups` tab, confirm the page looks and behaves exactly as you remember it — same wheel, same wording, same two-click addition. Switch to `Multiplicative Groups` and confirm the wheel visibly loses wedges: at N=10 four wedges reading 1, 3, 7, 9; at N=12 four reading 1, 5, 7, 11; at N=16 eight; at N=7 six, one per non-zero class. Confirm the wedges still tile the full circle with no gap or overlap and that the digits stay legible at φ(N)=16 (N=60). Click [3] then [7] at N=10 and confirm [1] turns green with `3 × 7 = 21 ≡ 1 (mod 10)` in the caption; click the same class twice and confirm the dashed dual-role wedge reads correctly. Confirm the lede explains why wedges are missing, that the footer names the identity as [1], and that the tab strip is reachable by Tab with ArrowLeft/ArrowRight switching tabs. Move the N slider on each tab and confirm nothing stale survives. Finally export PNG and SVG from a completed multiplicative pair and confirm all three highlight colours appear in the downloaded file, and that Print / Save as PDF still renders dark ink on light paper with the tab strip hidden.</human-check>
  </verify>
  <done>The harness prints `ALL_PASS`: every additive surface — lede, heading, reference count, footer formula, load caption, first wedge `aria-label`, first reference row and export filename — matches its pre-change baseline by exact string equality, while multiplicative mode speaks its own language throughout (unit heading, `N = 10 · φ(10) = 4`, a `(ℤ/10ℤ)*` footer naming `identity [1]`, first/second factor and product role words, an `A·B` row tag, `3 × 7 = 21 ≡ 1 (mod 10)`, and `Multiplying any member of [3] by any member of [7]`), the lede explains the missing wedges, and the export writes `congruence-wheel-mult-N10-depth6-a3-b7-sum1.svg` carrying all three marked hit paths plus the dashed dual-role hint. `ROLE_WORDS`/`ROLE_TAGS` are gone with no duplicated additive string left behind, `residue` still appears nowhere, the file declares zero colour literals and keeps one external script reference, its script parses, `assets/` and `index.html` are unmodified, and no harness artifact is left in the working tree.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| `localStorage` -> page state | The `congruence-wheel` key is read back on every load and rehydrated into `state`; it is user-writable via devtools and shared with anything else on the origin. This plan adds a third field (`mode`) crossing it |
| `state` integers + `MODES` strings -> caption `innerHTML` | The caption is assembled with `innerHTML`, so anything reaching it is parsed as markup |
| live DOM -> exported SVG / PNG blob | `buildExportSvg` serialises a clone of the live wheel into a file the user saves and may open or share |
| page -> network | None introduced. No fetch, no form, no third-party script; external references stay `assets/` and Google Fonts |

This is a static, client-side visualisation: no accounts, no auth, no server, no database, no user-supplied text, and no new data of any kind is handled — the security surface is genuinely trivial, as the planning brief notes. The register below is recorded honestly at that size rather than padded.

## STRIDE Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|-----------|----------|-----------|----------|-------------|-----------------|
| T-feg-01 | Tampering | `localStorage` key `congruence-wheel`, new `mode` field | low | mitigate | The restore guard accepts `saved.mode` only when it is exactly `'additive'` or `'multiplicative'`; anything else (absent, misspelled, an object, an array) leaves the default `'additive'`. So a hand-edited payload can never reach `MODES[state.mode]` as `undefined` and crash `render()` — the `currentMode()` indirection has no other input |
| T-feg-02 | Tampering | caption `innerHTML` in `updateCaption()` | low | mitigate | Every interpolated value stays either an integer already in `state` (a class value from an `els` array, or `state.N`/`state.depth` from `parseInt` of a `type="range"` input) or a literal string this plan authors in `MODES`. The action forbids routing any stored or user-supplied string through the caption, and the restore guard keeps rejecting an `N` outside 1..60 or a `depth` outside 2..10 |
| T-feg-03 | Denial of Service | `unitsMod(N)` on a user-driven modulus | low | mitigate | One `gcd` per residue over `0..N-1` with `N <= 60` enforced by the slider's `max` and the restore guard — at most 60 iterations of an iterative Euclid per render, no recursion and no allocation beyond a ≤16-element array (φ(60)=16 is the max). `clampToElements` is a single ascending pass with an early break |
| T-feg-04 | Tampering | `select()` operating on a stale class value after a mode or modulus change | low | mitigate | `setMode()` resets `state.a` to the new mode's identity and nulls `b`/`sum`; the `nRange` handler routes `state.a` through `clampToElements` against the *active* mode's element list and nulls `b`/`sum`. Together these make it impossible for `rolesFor()` to be asked about a class the current wheel does not draw |
| T-feg-05 | Information Disclosure | exported SVG / PNG blob | low | accept | The export contains exactly what is already on screen — the wheel, its digits and the marked wedges. This change alters which wedges exist, not what data is serialised; no state, no storage contents and no identifier is written, and the blob/download path is untouched |
| T-feg-06 | Elevation of Privilege | throwaway verification harnesses | low | mitigate | Each harness is a JS file plus a `sed`-injected page copy under the executor's scratchpad, used only at verify time. Both task gates fail if `git status` shows a harness or page-copy artifact in the working tree, and the `src=` count gate pins the tool page to its single pre-existing external script reference |
| T-feg-SC | Tampering | npm/pip/cargo installs | low | accept | This repository has no package manager and this plan adds zero install tasks, so the package-legitimacy gate has no applicable surface. No `<script src>` and no third-party `<link>` is added; the only external resource on the site remains Google Fonts, untouched |
</threat_model>

<multi_source_coverage_audit>
| Source | Item | Covered by | Status |
|--------|------|-----------|--------|
| CONTEXT | D-01 — an `Additive Groups` tab carrying today's behaviour unchanged | Task 1 (tab strip, `state.mode` default `additive`); Task 2 (every additive string asserted by exact equality against a pre-change browser baseline) | COVERED |
| CONTEXT | D-01 — a `Multiplicative Groups` tab with the same select-A / select-B / see-result interaction | Task 1 (same `select()`, same `rolesFor()`, same `is-a`/`is-b`/`is-sum` CSS, same reference list) | COVERED |
| CONTEXT | **D-02 (LOCKED) — the multiplicative wheel shows ONLY the φ(N) coprime residues as wedges; wedge count and angle key off φ(N), not N** | Task 1 (`unitsMod`, `els`, `M`, `360 / M`, `els[p]`; gate asserts 4 wedges reading 1,3,7,9 at N=10 and 1,5,7,11 at N=12, and that `360 / N` appears nowhere) | COVERED |
| CONTEXT | D-02 — non-units, including 0, are excluded from the wheel entirely (not dimmed) | Task 1 (they are never emitted; the gate's wedge-count and cell-text assertions would fail if they were) | COVERED |
| CONTEXT | D-03 — the identity is 1 in multiplicative mode, and identity-bearing labels reflect the active mode | Task 1 (`identity: function(N){ return 1 % N; }`, used as the post-switch `state.a`); Task 2 (`identity [1]` in the multiplicative footer; additive names no identity, as today) | COVERED |
| CONTEXT | D-04 — result is `(A × B) mod N`, restricted to the unit set, with no closure/non-membership handling | Task 1 (`op: (a*b) % N`, comment recording closure, deliberately no membership branch; gate asserts `is-sum` lands on [1] for 3×7 at N=10) | COVERED |
| CONTEXT | D-05 — reuse the existing click/keyboard machinery, `state.a/b/sum/awaiting` and the reference-list UI; adapt via per-mode config, do not build a parallel implementation | Task 1 (one `render()`, one `select()`, one `rolesFor()`, one reference-list loop, all reading `MODES[state.mode]`); Task 2 (wording also comes from the same config) | COVERED |
| CONTEXT | D-06 — switching tabs preserves N; changing N re-renders the active mode | Task 1 (`setMode` touches neither `state.N` nor `state.depth`; the `nRange` handler re-renders whichever mode is active) | COVERED |
| CONTEXT | D-06 — switching tabs resets `state.a/b/sum/awaiting` | Task 1 (`setMode` sets `a` to the identity and nulls `b`/`sum`, `awaiting` back to `'a'`; gate asserts zero `.is-b`/`.is-sum` right after a switch) | COVERED |
| CONTEXT | D-07 — both tabs share the page shell: N input, ring slider, reference list, export row, caption | Task 1 (tabs sit above the untouched `.controls`; the panel wraps the existing diagram and reference list; no control is duplicated) | COVERED |
| CONTEXT | D-07 — single self-contained file, no new files, no shared JS module | Both tasks (`files_modified` is one file; the `src=` count gate pins external references at 1; harnesses live in the scratchpad and are gated out of the working tree) | COVERED |
| CONTEXT | D-08 — `equivalence class(es)` only, never `residue class(es)` | Both tasks (`residue` count 0 gate; multiplicative heading is `Unit equivalence classes`; every wedge `aria-label` keeps `Equivalence class …`) | COVERED |
| CONTEXT | D-09 — all colours via `var()` against `assets/palette.css`, reusing `--slot-a`/`--slot-b`/`--slot-sum`; any new alias must follow the established local-alias patterns | Task 1 (tab CSS uses only `--accent`/`--text`/`--text-dim`/`--panel-border` plus the existing `color-mix` + `transparent` idiom; **zero new aliases**, since D-02 removes non-units rather than dimming them); pre-filtered zero-colour-literal gate in both tasks; `assets/` diff gate | COVERED |
| GOAL | Every concept gets a visualization a self-learner can interact with and immediately understand | The multiplicative tab makes (ℤ/Nℤ)* something a learner clicks, and makes its defining property visible as wedges appearing and disappearing with N | COVERED |
| REQ | PAL-02 — every colour resolves via `var()` to an `assets/palette.css` token | Both tasks (pre-filtered colour-literal gate at 0; `assets/palette.css` diff gate) | COVERED |
| REQ | PAL-04 — tool concepts map onto the shared semantic `--role-*` layer | Task 1 (the two new modes reuse the existing `--slot-a`→`--role-active` / `--slot-b`→`--role-input` / `--slot-sum`→`--role-result` mapping unchanged; the tab strip borrows `--accent`) | COVERED |
| REQ | NAV-02 — one self-contained `.html`, inline style/script, no external JS dependency | Both tasks (`src=` count pinned at 1; no new file; harnesses never committed) | COVERED |
| RESEARCH | n/a — no research phase for this quick task | — | N/A |

No unplanned items. No deferred items. `index.html` was considered and deliberately excluded (its card prose stays true — see `<discretion_decisions>`), which is a scope decision, not a gap.
</multi_source_coverage_audit>

<gate_notes>
- **API coverage decision checkpoint:** does not fire. No external API, SDK or service is involved — this is a self-contained HTML/CSS/JS visualisation change with no network call. Recorded as genuinely inapplicable rather than answered with a fabricated API surface.
- **Assumption-delta architecture checkpoint:** fires in a narrow, already-resolved form and is recorded rather than deferred. One real identity transition exists: **"a wedge index IS a class value" becomes false** in multiplicative mode, where position `p` and value `els[p]` diverge. D-10 resolves it explicitly — `state` and `rolesFor()` speak values only, positions live and die inside `render()`'s two loops — and this plan's `key_links` names it as the highest-risk seam, with the harness asserting class values by cell text rather than by DOM index so a regression cannot pass. No singular→plural, required→optional or derived→chosen transition beyond that.
- **Schema push gate:** inapplicable. The repository has no database and no schema. The only persistence is the pre-existing `localStorage` key, whose payload gains one guarded, backward-compatible field (see T-feg-01).
- **Security checkpoint:** trivial by inspection, as the planning brief states — client-side visualisation, no new data, no network, no persistence beyond the existing key. `<threat_model>` is recorded at that honest size.
- **MVP / user-story framing:** not applied. This is a quick task against a shipped tool, not a phase-1 walking skeleton, so no `SKELETON.md` and no ROADMAP goal line is involved.
- **Package legitimacy gate:** no applicable surface — no package manager anywhere in the repo, zero install tasks (T-feg-SC).
</gate_notes>

<verification>
- Headless-Chrome harness for Task 1 prints `ALL_PASS`: additive defaults unchanged (10 wedges, 60 digits, baseline caption/footer/reference row, addition still correct) and multiplicative mode drawing exactly the φ(N) coprime classes — 1/3/7/9 at N=10, 1/5/7/11 at N=12 — with `(3 × 7) mod 10 = 1` marked green, squaring marked dual-role, reference-row and keyboard parity, N=1/N=2 rendering without error, tab switching clearing the pair, and the mode round-tripping through `localStorage`.
- Headless-Chrome harness for Task 2 prints `ALL_PASS`: every additive surface equals its pre-change baseline string exactly, multiplicative surfaces carry factor/product wording, the `(ℤ/Nℤ)*` footer naming `identity [1]`, the `N = 10 · φ(10) = 4` count, the coprime-explaining lede, and the `-mult` export filename with all three marked hit paths and the dashed hint intact.
- No geometry expression divides by `N`; `state.selected` / `is-selected` remain absent; `ROLE_WORDS` / `ROLE_TAGS` are gone with no additive string duplicated.
- `residue` appears nowhere in the file; `equivalence class` appears at least 5 times.
- `Congruence Wheel/congruence-wheel.html` declares zero colour literals under the entity- and `'rgb('`-pre-filtered regex, keeps exactly one external script reference, and its inline script parses under `node --check`.
- `assets/palette.css`, `assets/site.css`, `assets/theme.js` and `index.html` are unmodified.
- No harness or page-copy artifact in the working tree after either task.
- Human eyes-on pass per Task 2's `<human-check>`: both themes, wedge tiling at several N, export, and print.
</verification>

<success_criteria>
The Congruence Wheel has two tabs over one page and one engine. `Additive Groups` is the tool as it shipped — proven string-for-string against a pre-change browser capture. `Multiplicative Groups` draws the actual group (ℤ/Nℤ)*: only the φ(N) classes coprime to N get a wedge, so the wheel visibly loses slices as N gains factors, and a learner can click [3] then [7] at N=10 and watch [1] — the identity — light up green with `3 × 7 = 21 ≡ 1 (mod 10)` spelled out. One `render()`, one `select()`, one reference list, one config object holding each mode's element set, operation, identity and words; still one self-contained file; still zero literal colours; and both modes proven by an automated real-browser run rather than asserted.
</success_criteria>

<output>
Create `.planning/quick/260927-feg-congruence-wheel-add-additive-groups-mul/260927-feg-SUMMARY.md` when done
</output>